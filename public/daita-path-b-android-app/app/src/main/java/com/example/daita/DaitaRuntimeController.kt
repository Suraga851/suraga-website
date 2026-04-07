package com.example.daita

import android.util.Log
import com.wireguard.android.backend.Backend
import com.wireguard.android.backend.Tunnel
import com.wireguard.config.Config
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.Closeable
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.URL
import java.util.concurrent.atomic.AtomicLong
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

enum class DaitaIntensity {
    LOW,
    BALANCED,
    AGGRESSIVE,
}

data class DaitaControlPlaneSettings(
    val enabled: Boolean,
    val endpointUrl: String,
    val authToken: String,
    val clientId: String,
)

data class DaitaShieldSettings(
    val enabled: Boolean,
    val intensity: DaitaIntensity,
    val controlPlane: DaitaControlPlaneSettings,
)

data class DaitaRuntimeStats(
    val txBytes: Long,
    val rxBytes: Long,
    val paddingBytes: Long,
    val paddingPackets: Long,
) {
    companion object {
        val EMPTY = DaitaRuntimeStats(0, 0, 0, 0)
    }
}

/**
 * DAITA runtime layer for WireGuard backend sessions.
 *
 * This is a DAITA-like approximation that:
 * - samples WireGuard tunnel statistics,
 * - feeds send events to Maybenot,
 * - schedules bounded cover-traffic UDP sends,
 * - optionally pulls remote schedules from a self-hosted control-plane.
 */
class DaitaRuntimeController(
    private val backend: Backend,
    private val tunnel: Tunnel,
    private val onStats: (DaitaRuntimeStats) -> Unit,
) : Closeable {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val daita = DaitaEngine()

    private var monitorJob: Job? = null
    private var senderJob: Job? = null
    private var paddingChannel = Channel<PaddingRequest>(DaitaConfig.PADDING_CHANNEL_CAPACITY)

    @Volatile
    private var currentSettings = DaitaShieldSettings(
        enabled = true,
        intensity = DaitaIntensity.BALANCED,
        controlPlane = DaitaControlPlaneSettings(
            enabled = false,
            endpointUrl = "",
            authToken = "",
            clientId = "",
        ),
    )

    @Volatile
    private var currentTarget = PaddingTarget(
        host = DaitaConfig.DEFAULT_COVER_TARGET_HOST,
        port = DaitaConfig.DEFAULT_COVER_TARGET_PORT,
        address = null,
    )

    @Volatile
    private var remoteSchedule: RemoteSchedule? = null

    private var nextRemoteRefreshMs: Long = 0L

    private val paddingBytesSent = AtomicLong(0L)
    private val paddingPacketsSent = AtomicLong(0L)
    private var handshakeObserved = false

    private var budgetTokensBytes: Double = DaitaConfig.BALANCED_MAX_BYTES_PER_MIN.toDouble()
    private var budgetLastRefillMs: Long = 0L
    private var lastPaddingScheduleMs: Long = 0L
    private var lastBudgetDropLogMs: Long = 0L

    /**
     * Starts (or reconfigures) DAITA runtime for the active tunnel session.
     */
    fun startOrReconfigure(config: Config, settings: DaitaShieldSettings) {
        currentSettings = settings
        currentTarget = resolvePaddingTarget(config)
        if (!settings.controlPlane.enabled) {
            remoteSchedule = null
        }
        nextRemoteRefreshMs = 0L
        handshakeObserved = false
        lastPaddingScheduleMs = 0L
        budgetTokensBytes = profileFor(settings.intensity).maxBytesPerMin.toDouble()
        budgetLastRefillMs = System.currentTimeMillis()
        lastBudgetDropLogMs = 0L

        if (monitorJob == null || senderJob == null) {
            startWorkers()
        }
    }

    /**
     * Stops DAITA runtime jobs while keeping this controller reusable.
     */
    fun stop() {
        monitorJob?.cancel()
        senderJob?.cancel()
        monitorJob = null
        senderJob = null

        paddingChannel.close()
        paddingChannel = Channel(DaitaConfig.PADDING_CHANNEL_CAPACITY)
        remoteSchedule = null
    }

    override fun close() {
        stop()
        scope.cancel()
        daita.close()
    }

    private fun startWorkers() {
        senderJob = scope.launch {
            var socket: DatagramSocket? = null
            while (isActive) {
                val req = paddingChannel.receiveCatching().getOrNull() ?: break
                if (req.delayMs > 0L) delay(req.delayMs)

                if (!allowBudget(req.sizeBytes, req.profile.maxBytesPerMin)) continue

                if (socket == null || socket.isClosed) {
                    socket = runCatching { DatagramSocket() }.getOrNull()
                }
                val s = socket ?: continue

                val address = currentTarget.address ?: resolveAddress(currentTarget.host) ?: continue
                currentTarget = currentTarget.copy(address = address)
                sendCoverPacket(s, address, currentTarget.port, req.sizeBytes)
            }
            socket?.close()
        }

        monitorJob = scope.launch {
            var firstSample = true
            var lastTx = 0L
            var lastPaddingBytes = 0L

            while (isActive) {
                val stats = runCatching { backend.getStatistics(tunnel) }.getOrNull()
                if (stats != null) {
                    val tx = stats.totalTx()
                    val rx = stats.totalRx()
                    val paddingBytes = paddingBytesSent.get()
                    val paddingPackets = paddingPacketsSent.get()
                    val txDelta = max(0L, tx - lastTx)
                    // Prevent DAITA-generated packets from recursively triggering
                    // additional scheduling.
                    val paddingDelta = max(0L, paddingBytes - lastPaddingBytes)
                    val organicTxDelta = max(0L, txDelta - paddingDelta)
                    if (rx > 0L) handshakeObserved = true

                    refreshRemoteScheduleIfNeeded(tx, rx)

                    if (!firstSample && currentSettings.enabled && handshakeObserved) {
                        val nowMs = System.currentTimeMillis()
                        if (organicTxDelta > 0L) {
                            if (schedulePaddingFromTxDelta(organicTxDelta) > 0) {
                                lastPaddingScheduleMs = nowMs
                            }
                        } else if (shouldScheduleIdlePadding(nowMs)) {
                            val idleTxHint = syntheticIdleTxHint(currentSettings.intensity)
                            if (schedulePaddingFromTxDelta(idleTxHint) > 0) {
                                lastPaddingScheduleMs = nowMs
                            }
                        }
                    }

                    lastTx = tx
                    lastPaddingBytes = paddingBytes
                    firstSample = false

                    onStats(
                        DaitaRuntimeStats(
                            txBytes = tx,
                            rxBytes = rx,
                            paddingBytes = paddingBytes,
                            paddingPackets = paddingPackets,
                        ),
                    )
                }
                delay(DaitaConfig.STATS_POLL_INTERVAL_MS)
            }
        }
    }

    private fun refreshRemoteScheduleIfNeeded(txBytes: Long, rxBytes: Long) {
        val control = currentSettings.controlPlane
        if (!control.enabled) {
            remoteSchedule = null
            return
        }

        val now = System.currentTimeMillis()
        if (now < nextRemoteRefreshMs) return

        val fetched = fetchRemoteSchedule(control, txBytes, rxBytes, paddingBytesSent.get())
        if (fetched != null) {
            remoteSchedule = fetched
            currentTarget = currentTarget.copy(host = fetched.targetHost, port = fetched.targetPort, address = null)
            nextRemoteRefreshMs = now + fetched.ttlMs
        } else {
            nextRemoteRefreshMs = now + DaitaConfig.CONTROL_RETRY_MS
        }
    }

    private fun schedulePaddingFromTxDelta(txDelta: Long): Int {
        val schedule = remoteSchedule?.takeIf { !it.isExpired(System.currentTimeMillis()) }
        val profile = schedule?.toProfile() ?: profileFor(currentSettings.intensity)
        val estimatedEvents = ((txDelta / 850L).toInt() + 1).coerceAtMost(profile.maxEventsPerTick)
        val eventCount = schedule?.burstCount?.coerceAtLeast(1)?.coerceAtMost(estimatedEvents) ?: estimatedEvents
        val jitterCap = schedule?.maxJitterMs ?: DaitaConfig.MAX_DELAY_JITTER_MS
        val baseDelay = schedule?.baseDelayMs ?: 0L

        var queued = 0
        repeat(eventCount) {
            val requestedDelayMs = daita.onNormalPacketSent()
            val delayFromEngineOrFallback = if (requestedDelayMs >= 0) {
                requestedDelayMs.toLong()
            } else {
                fallbackDelayForIntensity(currentSettings.intensity) ?: return@repeat
            }

            val size = Random.nextInt(profile.minBytes, profile.maxBytes + 1)
            val jitter = Random.nextLong(0L, jitterCap + 1L)
            val req = PaddingRequest(
                delayMs = delayFromEngineOrFallback + baseDelay + jitter,
                sizeBytes = size,
                profile = profile,
            )
            if (paddingChannel.trySend(req).isSuccess) {
                queued += 1
            }
        }
        return queued
    }

    /**
     * Fallback scheduler when the native engine yields no event.
     * This keeps DAITA behavior active under strong profiles.
     */
    private fun fallbackDelayForIntensity(intensity: DaitaIntensity): Long? {
        val (chance, minDelayMs, maxDelayMs) = when (intensity) {
            DaitaIntensity.LOW -> Triple(0.30, 120L, 520L)
            DaitaIntensity.BALANCED -> Triple(0.55, 70L, 360L)
            DaitaIntensity.AGGRESSIVE -> Triple(0.92, 25L, 220L)
        }
        if (Random.nextDouble() > chance) return null
        return Random.nextLong(minDelayMs, maxDelayMs + 1L)
    }

    private fun shouldScheduleIdlePadding(nowMs: Long): Boolean {
        val intervalMs = when (currentSettings.intensity) {
            DaitaIntensity.LOW -> 4_000L
            DaitaIntensity.BALANCED -> 2_200L
            DaitaIntensity.AGGRESSIVE -> 1_100L
        }
        if (lastPaddingScheduleMs == 0L) return true
        return (nowMs - lastPaddingScheduleMs) >= intervalMs
    }

    private fun syntheticIdleTxHint(intensity: DaitaIntensity): Long {
        return when (intensity) {
            DaitaIntensity.LOW -> 420L
            DaitaIntensity.BALANCED -> 820L
            DaitaIntensity.AGGRESSIVE -> 1_350L
        }
    }

    private fun allowBudget(packetSize: Int, maxBytesPerMin: Long): Boolean {
        val now = System.currentTimeMillis()
        if (budgetLastRefillMs == 0L) {
            budgetLastRefillMs = now
            budgetTokensBytes = maxBytesPerMin.toDouble()
        }

        val elapsedMs = max(0L, now - budgetLastRefillMs)
        val refillPerMs = maxBytesPerMin.toDouble() / 60_000.0
        budgetTokensBytes = min(
            maxBytesPerMin.toDouble(),
            budgetTokensBytes + (elapsedMs * refillPerMs),
        )
        budgetLastRefillMs = now

        if (packetSize.toDouble() > budgetTokensBytes) {
            if (now - lastBudgetDropLogMs >= 2_000L) {
                Log.d(
                    TAG,
                    "Budget throttle: packet=$packetSizeB tokens=${budgetTokensBytes.toInt()}B cap=${maxBytesPerMin}B/min",
                )
                lastBudgetDropLogMs = now
            }
            return false
        }

        budgetTokensBytes -= packetSize.toDouble()
        return true
    }

    private fun sendCoverPacket(socket: DatagramSocket, address: InetAddress, port: Int, size: Int) {
        val payload = ByteArray(size)
        Random.nextBytes(payload)
        val packet = DatagramPacket(payload, payload.size, address, port)
        runCatching {
            socket.send(packet)
            paddingBytesSent.addAndGet(size.toLong())
            paddingPacketsSent.incrementAndGet()
        }.onFailure { err ->
            Log.w(TAG, "Cover packet send failed: ${err.javaClass.simpleName}")
        }
    }

    private fun fetchRemoteSchedule(
        control: DaitaControlPlaneSettings,
        txBytes: Long,
        rxBytes: Long,
        paddingBytes: Long,
    ): RemoteSchedule? {
        val endpoint = control.endpointUrl.trim()
        if (endpoint.isEmpty()) return null

        return runCatching {
            val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 3_000
                readTimeout = 3_000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                if (control.authToken.isNotBlank()) {
                    setRequestProperty("Authorization", "Bearer ${control.authToken}")
                }
            }

            val requestJson = JSONObject().apply {
                put("client_id", control.clientId)
                put("enabled", currentSettings.enabled)
                put("intensity", currentSettings.intensity.name)
                put("tx_bytes", txBytes)
                put("rx_bytes", rxBytes)
                put("padding_bytes", paddingBytes)
            }

            conn.outputStream.use { out ->
                out.write(requestJson.toString().toByteArray(Charsets.UTF_8))
            }

            if (conn.responseCode !in 200..299) {
                conn.disconnect()
                return null
            }

            val body = conn.inputStream.bufferedReader().use { it.readText() }
            conn.disconnect()
            parseRemoteSchedule(body)
        }.getOrElse { err ->
            Log.w(TAG, "Remote schedule fetch failed: ${err.javaClass.simpleName}")
            null
        }
    }

    private fun parseRemoteSchedule(body: String): RemoteSchedule? {
        val json = runCatching { JSONObject(body) }.getOrNull() ?: return null

        val ttlMs = json.optLong("ttl_ms", 15_000L)
            .coerceIn(DaitaConfig.MIN_CONTROL_TTL_MS, DaitaConfig.MAX_CONTROL_TTL_MS)
        val now = System.currentTimeMillis()
        val targetHost = json.optString("target_host", currentTarget.host).ifBlank { currentTarget.host }
        val targetPort = json.optInt("target_port", currentTarget.port)
            .coerceIn(1, 65_535)

        val minBytes = json.optInt("min_padding_bytes", DaitaConfig.BALANCED_MIN_PADDING_BYTES)
            .coerceAtLeast(32)
        val maxBytes = json.optInt("max_padding_bytes", DaitaConfig.BALANCED_MAX_PADDING_BYTES)
            .coerceAtLeast(minBytes)
        val maxEventsPerTick = json.optInt("max_events_per_tick", DaitaConfig.BALANCED_MAX_EVENTS_PER_TICK)
            .coerceIn(1, 12)
        val maxBytesPerMin = json.optLong("max_bytes_per_min", DaitaConfig.BALANCED_MAX_BYTES_PER_MIN)
            .coerceAtLeast(8_192L)
        val burstCount = json.optInt("burst_count", maxEventsPerTick)
            .coerceIn(1, maxEventsPerTick)
        val baseDelayMs = json.optLong("base_delay_ms", 0L).coerceAtLeast(0L)
        val maxJitterMs = json.optLong("max_jitter_ms", DaitaConfig.MAX_DELAY_JITTER_MS).coerceAtLeast(0L)

        return RemoteSchedule(
            expiresAtMs = now + ttlMs,
            ttlMs = ttlMs,
            targetHost = targetHost,
            targetPort = targetPort,
            profile = IntensityProfile(
                minBytes = minBytes,
                maxBytes = maxBytes,
                maxEventsPerTick = maxEventsPerTick,
                maxBytesPerMin = maxBytesPerMin,
            ),
            burstCount = burstCount,
            baseDelayMs = baseDelayMs,
            maxJitterMs = maxJitterMs,
        )
    }

    private fun resolvePaddingTarget(config: Config): PaddingTarget {
        val dnsEntry = config.getInterface().getDnsServers()
            .firstOrNull()
            ?.toString()
            ?.trim()
            .orEmpty()
        val dnsHost = dnsEntry
            .substringAfter("/", dnsEntry)
            .trim()
            .takeIf { it.isNotBlank() }

        val endpointText = config.getPeers().firstOrNull()?.getEndpoint()?.toString()
        val endpointHost = endpointText
            ?.substringBeforeLast(':', "")
            ?.removePrefix("[")
            ?.removeSuffix("]")
            ?.takeIf { it.isNotBlank() }
        val endpointPort = endpointText
            ?.substringAfterLast(':', "")
            ?.toIntOrNull()
            ?: DaitaConfig.DEFAULT_COVER_TARGET_PORT

        val host = dnsHost ?: endpointHost ?: DaitaConfig.DEFAULT_COVER_TARGET_HOST
        val port = if (dnsHost != null) DaitaConfig.DEFAULT_COVER_TARGET_PORT else endpointPort
        val address = resolveAddress(host)

        return PaddingTarget(host = host, port = port, address = address)
    }

    private fun resolveAddress(host: String): InetAddress? {
        return runCatching { InetAddress.getByName(host) }.getOrNull()
    }

    private fun profileFor(intensity: DaitaIntensity): IntensityProfile {
        return when (intensity) {
            DaitaIntensity.LOW -> IntensityProfile(
                minBytes = DaitaConfig.LOW_MIN_PADDING_BYTES,
                maxBytes = DaitaConfig.LOW_MAX_PADDING_BYTES,
                maxEventsPerTick = DaitaConfig.LOW_MAX_EVENTS_PER_TICK,
                maxBytesPerMin = DaitaConfig.LOW_MAX_BYTES_PER_MIN,
            )
            DaitaIntensity.BALANCED -> IntensityProfile(
                minBytes = DaitaConfig.BALANCED_MIN_PADDING_BYTES,
                maxBytes = DaitaConfig.BALANCED_MAX_PADDING_BYTES,
                maxEventsPerTick = DaitaConfig.BALANCED_MAX_EVENTS_PER_TICK,
                maxBytesPerMin = DaitaConfig.BALANCED_MAX_BYTES_PER_MIN,
            )
            DaitaIntensity.AGGRESSIVE -> IntensityProfile(
                minBytes = DaitaConfig.AGGRESSIVE_MIN_PADDING_BYTES,
                maxBytes = DaitaConfig.AGGRESSIVE_MAX_PADDING_BYTES,
                maxEventsPerTick = DaitaConfig.AGGRESSIVE_MAX_EVENTS_PER_TICK,
                maxBytesPerMin = DaitaConfig.AGGRESSIVE_MAX_BYTES_PER_MIN,
            )
        }
    }

    private data class PaddingTarget(
        val host: String,
        val port: Int,
        val address: InetAddress?,
    )

    private data class PaddingRequest(
        val delayMs: Long,
        val sizeBytes: Int,
        val profile: IntensityProfile,
    )

    private data class IntensityProfile(
        val minBytes: Int,
        val maxBytes: Int,
        val maxEventsPerTick: Int,
        val maxBytesPerMin: Long,
    )

    private data class RemoteSchedule(
        val expiresAtMs: Long,
        val ttlMs: Long,
        val targetHost: String,
        val targetPort: Int,
        val profile: IntensityProfile,
        val burstCount: Int,
        val baseDelayMs: Long,
        val maxJitterMs: Long,
    ) {
        fun isExpired(nowMs: Long): Boolean = nowMs >= expiresAtMs
        fun toProfile(): IntensityProfile = profile
    }

    private companion object {
        private const val TAG = "DaitaRuntimeCtrl"
    }
}
