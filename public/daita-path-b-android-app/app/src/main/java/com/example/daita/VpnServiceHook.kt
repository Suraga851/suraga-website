package com.example.daita

import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

private const val TAG = "VpnServiceHook"

/**
 * Bridges between the real VPN packet-send loop and the DAITA Maybenot engine.
 *
 * ### Thread-safety
 * [onEncryptedPacketSent] may be called from any thread. Internally it posts to
 * a bounded [Channel] that is drained by a single worker coroutine; this
 * prevents unbounded coroutine spawning under high packet rates.
 *
 * ### Lifecycle
 * Always call [shutdown] when the VPN session ends. This cancels the coroutine
 * scope and closes the native engine.
 */
class VpnServiceHook(
    private val sendPaddingPacket: suspend (Int) -> Unit,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val daita = DaitaEngine()

    /** Bounded channel used to backpressure padding-send requests. */
    private val paddingChannel = Channel<PaddingRequest>(DaitaConfig.PADDING_CHANNEL_CAPACITY)

    init {
        if (!daita.isValid()) {
            Log.w(TAG, "DaitaEngine is not available; padding will be suppressed.")
        }
        // Single consumer drains the channel – avoids N concurrent coroutines.
        scope.launch {
            for (req in paddingChannel) {
                if (!isActive) break
                delay(req.delayMs)
                sendPaddingPacket(req.paddingSize)
            }
        }
    }

    /**
     * Must be called every time a real encrypted packet is sent.
     *
     * @param realPacketSize Size of the encrypted packet in bytes.
     */
    fun onEncryptedPacketSent(realPacketSize: Int) {
        val delayMs = daita.onNormalPacketSent()
        if (delayMs < 0) return // engine says no padding needed

        // Keep padding in a practical MTU envelope with a small bounded jitter.
        val paddingSize = (realPacketSize + PADDING_JITTER)
            .coerceIn(MIN_PADDING, MAX_PADDING)

        val request = PaddingRequest(
            delayMs = delayMs.toLong() + BASE_JITTER_MS,
            paddingSize = paddingSize,
        )

        // Non-blocking offer; drop if channel is at capacity to avoid memory growth.
        if (!paddingChannel.trySend(request).isSuccess) {
            Log.w(TAG, "Padding channel full – dropping padding request.")
        }
    }

    /**
     * Shuts down the hook. Cancels all pending padding coroutines and releases
     * the native engine. Safe to call multiple times.
     */
    fun shutdown() {
        paddingChannel.close()
        scope.cancel()
        daita.close()
    }

    // ── Internal types ────────────────────────────────────────────────────────

    private data class PaddingRequest(val delayMs: Long, val paddingSize: Int)

    companion object {
        private const val MIN_PADDING = 64
        private const val MAX_PADDING = 1400
        private const val PADDING_JITTER = 32       // bytes – applied to packet size
        private const val BASE_JITTER_MS = 5L       // ms – added to engine delay
    }
}
