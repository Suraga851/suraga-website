package com.example.daita

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.button.MaterialButtonToggleGroup
import com.google.android.material.materialswitch.MaterialSwitch
import com.google.android.material.textfield.TextInputEditText
import com.wireguard.android.backend.BackendException
import com.wireguard.android.backend.GoBackend
import com.wireguard.android.backend.Tunnel
import com.wireguard.config.Config
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.ByteArrayInputStream
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.Locale
import java.util.UUID
import java.net.URI
import kotlin.math.ln
import kotlin.math.pow

class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView
    private lateinit var runtimeBadgeText: TextView
    private lateinit var txValueText: TextView
    private lateinit var rxValueText: TextView
    private lateinit var paddingValueText: TextView
    private lateinit var configInput: TextInputEditText
    private lateinit var daitaSwitch: MaterialSwitch
    private lateinit var remoteControlSwitch: MaterialSwitch
    private lateinit var controlEndpointInput: TextInputEditText
    private lateinit var controlTokenInput: TextInputEditText
    private lateinit var intensityGroup: MaterialButtonToggleGroup
    private lateinit var startButton: MaterialButton
    private lateinit var stopButton: MaterialButton

    private val backend by lazy { GoBackend(applicationContext) }
    private val secureStore by lazy { SecureStore(applicationContext) }
    private val tunnel = AppTunnel("suraga-main") { newState ->
        runOnUiThread { onTunnelStateChange(newState) }
    }

    private var activeConfig: Config? = null
    private var daitaController: DaitaRuntimeController? = null
    private var pendingConfigForConsent: String? = null
    private var operationInFlight = false
    private var tunnelUp = false
    private var daitaDegradedReason: String? = null

    private val vpnPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult(),
    ) { result ->
        val consentGranted = result.resultCode == Activity.RESULT_OK || VpnService.prepare(this) == null
        if (!consentGranted) {
            setStatus(getString(R.string.status_open_vpn_settings), tunnelUp = false)
            openSystemVpnSettings()
            return@registerForActivityResult
        }

        val rawConfig = pendingConfigForConsent ?: configInput.text?.toString().orEmpty()
        pendingConfigForConsent = null
        bringTunnelUp(rawConfig)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        runtimeBadgeText = findViewById(R.id.runtimeBadgeText)
        txValueText = findViewById(R.id.txValueText)
        rxValueText = findViewById(R.id.rxValueText)
        paddingValueText = findViewById(R.id.paddingValueText)
        configInput = findViewById(R.id.wgConfigInput)
        daitaSwitch = findViewById(R.id.daitaSwitch)
        remoteControlSwitch = findViewById(R.id.remoteControlSwitch)
        controlEndpointInput = findViewById(R.id.controlEndpointInput)
        controlTokenInput = findViewById(R.id.controlTokenInput)
        intensityGroup = findViewById(R.id.intensityGroup)
        startButton = findViewById(R.id.startVpnButton)
        stopButton = findViewById(R.id.stopVpnButton)

        configInput.setText(loadSavedConfig())
        loadSavedControlSettings()
        intensityGroup.check(R.id.intensityBalancedButton)
        updateRuntimeBadge(isEnabled = daitaSwitch.isChecked, intensity = currentIntensity())
        renderStats(DaitaRuntimeStats.EMPTY)
        setStatus(getString(R.string.status_idle), tunnelUp = false)
        setControlsEnabledForState()

        startButton.setOnClickListener { requestVpnPermissionAndStart() }
        stopButton.setOnClickListener { bringTunnelDown() }

        daitaSwitch.setOnCheckedChangeListener { _, _ ->
            saveControlSettings()
            updateRuntimeBadge(isEnabled = daitaSwitch.isChecked, intensity = currentIntensity())
            applyDaitaSettingsIfConnected()
        }

        intensityGroup.addOnButtonCheckedListener { _, _, isChecked ->
            if (isChecked) {
                saveControlSettings()
                updateRuntimeBadge(isEnabled = daitaSwitch.isChecked, intensity = currentIntensity())
                applyDaitaSettingsIfConnected()
            }
        }

        remoteControlSwitch.setOnCheckedChangeListener { _, _ ->
            saveControlSettings()
            applyDaitaSettingsIfConnected()
            setControlsEnabledForState()
        }
    }

    override fun onDestroy() {
        daitaController?.close()
        daitaController = null
        super.onDestroy()
    }

    private fun requestVpnPermissionAndStart() {
        if (operationInFlight) return

        val rawConfig = configInput.text?.toString()?.trim().orEmpty()
        if (rawConfig.isEmpty()) {
            setStatus(getString(R.string.status_missing_config), tunnelUp = false)
            return
        }
        if (rawConfig.contains("REPLACE_WITH_")) {
            setStatus(getString(R.string.status_fill_template_values), tunnelUp = false)
            return
        }

        validateWireGuardSecurity(rawConfig)?.let { error ->
            setStatus(error, tunnelUp = false)
            return
        }

        validateControlPlaneSecurity()?.let { error ->
            setStatus(error, tunnelUp = false)
            return
        }

        saveConfig(rawConfig)
        saveControlSettings()

        val intent = VpnService.prepare(this)
        if (intent == null) {
            bringTunnelUp(rawConfig)
            return
        }
        if (intent.resolveActivity(packageManager) == null) {
            setStatus(getString(R.string.status_open_vpn_settings), tunnelUp = false)
            openSystemVpnSettings()
            return
        }

        pendingConfigForConsent = rawConfig
        vpnPermissionLauncher.launch(intent)
    }

    private fun bringTunnelUp(rawConfig: String) {
        val config = parseConfig(rawConfig) ?: run {
            setStatus(getString(R.string.status_bad_config), tunnelUp = false)
            return
        }

        operationInFlight = true
        setStatus(getString(R.string.status_connecting), tunnelUp = false)
        setControlsEnabledForState()

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                backend.setState(tunnel, Tunnel.State.UP, config)
                activeConfig = config
                val daitaWarning = runCatching {
                    startOrReconfigureDaita(config)
                    null
                }.getOrElse { err ->
                    daitaController?.close()
                    daitaController = null
                    Log.w(TAG, "DAITA runtime failed; tunnel will remain up.", err)
                    err.javaClass.simpleName
                }
                runOnUiThread {
                    operationInFlight = false
                    tunnelUp = true
                    daitaDegradedReason = daitaWarning
                    renderStats(DaitaRuntimeStats.EMPTY)
                    if (daitaWarning != null) {
                        setStatus(
                            getString(R.string.status_tunnel_running_daita_degraded, daitaWarning),
                            tunnelUp = true,
                        )
                    } else {
                        setStatus(getString(R.string.status_tunnel_running), tunnelUp = true)
                    }
                    setControlsEnabledForState()
                }
            } catch (e: BackendException) {
                runOnUiThread {
                    operationInFlight = false
                    tunnelUp = false
                    daitaDegradedReason = null
                    setStatus(getString(R.string.status_connect_failed, e.reason.name), tunnelUp = false)
                    setControlsEnabledForState()
                }
            } catch (e: Exception) {
                runOnUiThread {
                    operationInFlight = false
                    tunnelUp = false
                    daitaDegradedReason = null
                    setStatus(getString(R.string.status_connect_failed, e.javaClass.simpleName), tunnelUp = false)
                    setControlsEnabledForState()
                }
            }
        }
    }

    private fun bringTunnelDown() {
        if (operationInFlight) return

        operationInFlight = true
        setStatus(getString(R.string.status_disconnecting), tunnelUp = false)
        setControlsEnabledForState()

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                backend.setState(tunnel, Tunnel.State.DOWN, null)
            } catch (_: Exception) {
                // Keep UI consistent even if already down.
            } finally {
                daitaController?.close()
                daitaController = null
                activeConfig = null
                runOnUiThread {
                    operationInFlight = false
                    tunnelUp = false
                    daitaDegradedReason = null
                    renderStats(DaitaRuntimeStats.EMPTY)
                    setStatus(getString(R.string.status_tunnel_stopped), tunnelUp = false)
                    setControlsEnabledForState()
                }
            }
        }
    }

    private fun startOrReconfigureDaita(config: Config) {
        val controller = daitaController ?: DaitaRuntimeController(
            backend = backend,
            tunnel = tunnel,
            onStats = { stats ->
                runOnUiThread { renderStats(stats) }
            },
        ).also { daitaController = it }

        controller.startOrReconfigure(config, currentShieldSettings())
    }

    private fun applyDaitaSettingsIfConnected() {
        val config = activeConfig ?: return
        if (!tunnelUp) return
        runCatching {
            startOrReconfigureDaita(config)
            daitaDegradedReason = null
            setStatus(getString(R.string.status_tunnel_running), tunnelUp = true)
        }.onFailure { err ->
            daitaController?.close()
            daitaController = null
            daitaDegradedReason = err.javaClass.simpleName
            renderStats(DaitaRuntimeStats.EMPTY)
            setStatus(
                getString(R.string.status_tunnel_running_daita_degraded, err.javaClass.simpleName),
                tunnelUp = true,
            )
            Log.w(TAG, "Failed to reconfigure DAITA while tunnel is running.", err)
        }
    }

    private fun onTunnelStateChange(state: Tunnel.State) {
        when (state) {
            Tunnel.State.UP -> {
                tunnelUp = true
                val reason = daitaDegradedReason
                if (reason != null) {
                    setStatus(getString(R.string.status_tunnel_running_daita_degraded, reason), tunnelUp = true)
                } else {
                    setStatus(getString(R.string.status_tunnel_running), tunnelUp = true)
                }
            }
            Tunnel.State.DOWN -> {
                tunnelUp = false
                daitaDegradedReason = null
                setStatus(getString(R.string.status_tunnel_stopped), tunnelUp = false)
            }
            Tunnel.State.TOGGLE -> {
                setStatus(getString(R.string.status_connecting), tunnelUp = false)
            }
        }
        setControlsEnabledForState()
    }

    private fun parseConfig(rawConfig: String): Config? {
        return runCatching {
            Config.parse(ByteArrayInputStream(rawConfig.toByteArray(Charsets.UTF_8)))
        }.getOrNull()
    }

    private fun validateWireGuardSecurity(rawConfig: String): String? {
        val lines = rawConfig.lineSequence()
            .map { it.trim() }
            .filter { it.isNotEmpty() && !it.startsWith("#") && !it.startsWith(";") }
            .toList()

        var hasDns = false
        var hasFullTunnelV4 = false
        var hasFullTunnelV6 = false

        for (line in lines) {
            if (line.startsWith("DNS", ignoreCase = true) && line.contains("=")) {
                hasDns = true
            }
            if (line.startsWith("AllowedIPs", ignoreCase = true) && line.contains("=")) {
                val ips = line.substringAfter("=", "")
                    .split(",")
                    .map { it.trim().lowercase(Locale.US) }
                    .filter { it.isNotEmpty() }
                if (ips.contains("0.0.0.0/0")) hasFullTunnelV4 = true
                if (ips.contains("::/0")) hasFullTunnelV6 = true
            }
        }

        if (!hasDns) return getString(R.string.status_dns_required)
        if (!hasFullTunnelV4 || !hasFullTunnelV6) {
            return getString(R.string.status_full_tunnel_required)
        }
        return null
    }

    private fun validateControlPlaneSecurity(): String? {
        if (!remoteControlSwitch.isChecked) return null

        val endpoint = controlEndpointInput.text?.toString()?.trim().orEmpty()
        if (endpoint.isEmpty()) return getString(R.string.status_control_endpoint_required)

        val uri = runCatching { URI(endpoint) }.getOrNull()
            ?: return getString(R.string.status_insecure_control_endpoint)
        val host = uri.host?.trim().orEmpty()
        val scheme = uri.scheme?.lowercase(Locale.US).orEmpty()
        if (host.isEmpty() || (scheme != "https" && scheme != "http")) {
            return getString(R.string.status_insecure_control_endpoint)
        }

        val isLocal = isLocalDevelopmentHost(host)
        if (!isProbablyEmulator() && isEmulatorLoopbackHost(host)) {
            return getString(R.string.status_emulator_endpoint_on_real_device)
        }
        if (scheme != "https" && !isLocal) {
            return getString(R.string.status_insecure_control_endpoint)
        }

        val token = controlTokenInput.text?.toString()?.trim().orEmpty()
        if (!isLocal && token.isBlank()) {
            return getString(R.string.status_control_token_required)
        }

        return null
    }

    private fun isLocalDevelopmentHost(host: String): Boolean {
        val h = host.lowercase(Locale.US)
        if (h == "localhost" || h == "127.0.0.1" || h == "::1" || h == "10.0.2.2") {
            return true
        }

        val parts = h.split('.')
        if (parts.size != 4) return false
        val o1 = parts[0].toIntOrNull() ?: return false
        val o2 = parts[1].toIntOrNull() ?: return false

        if (o1 == 10) return true
        if (o1 == 192 && o2 == 168) return true
        if (o1 == 172 && o2 in 16..31) return true
        return false
    }

    private fun isEmulatorLoopbackHost(host: String): Boolean {
        val h = host.lowercase(Locale.US)
        return h == "10.0.2.2" || h == "localhost" || h == "127.0.0.1" || h == "::1"
    }

    private fun isProbablyEmulator(): Boolean {
        val fingerprint = Build.FINGERPRINT.lowercase(Locale.US)
        val model = Build.MODEL.lowercase(Locale.US)
        val product = Build.PRODUCT.lowercase(Locale.US)
        return fingerprint.contains("generic") ||
            fingerprint.contains("emulator") ||
            model.contains("emulator") ||
            model.contains("sdk_gphone") ||
            product.contains("sdk_gphone") ||
            product.contains("emulator")
    }

    private fun currentShieldSettings(): DaitaShieldSettings {
        return DaitaShieldSettings(
            enabled = daitaSwitch.isChecked,
            intensity = currentIntensity(),
            controlPlane = currentControlPlaneSettings(),
        )
    }

    private fun currentControlPlaneSettings(): DaitaControlPlaneSettings {
        return DaitaControlPlaneSettings(
            enabled = remoteControlSwitch.isChecked,
            endpointUrl = controlEndpointInput.text?.toString()?.trim().orEmpty(),
            authToken = controlTokenInput.text?.toString()?.trim().orEmpty(),
            clientId = getOrCreateClientId(),
        )
    }

    private fun currentIntensity(): DaitaIntensity {
        return when (intensityGroup.checkedButtonId) {
            R.id.intensityLowButton -> DaitaIntensity.LOW
            R.id.intensityAggressiveButton -> DaitaIntensity.AGGRESSIVE
            else -> DaitaIntensity.BALANCED
        }
    }

    private fun renderStats(stats: DaitaRuntimeStats) {
        txValueText.text = formatByteSize(stats.txBytes)
        rxValueText.text = formatByteSize(stats.rxBytes)
        val paddingCombined = "${formatByteSize(stats.paddingBytes)} (${stats.paddingPackets})"
        paddingValueText.text = paddingCombined
    }

    private fun updateRuntimeBadge(isEnabled: Boolean, intensity: DaitaIntensity) {
        val mode = when (intensity) {
            DaitaIntensity.LOW -> getString(R.string.intensity_low)
            DaitaIntensity.BALANCED -> getString(R.string.intensity_balanced)
            DaitaIntensity.AGGRESSIVE -> getString(R.string.intensity_aggressive)
        }
        runtimeBadgeText.text = if (isEnabled) {
            getString(R.string.runtime_badge_enabled, mode)
        } else {
            getString(R.string.runtime_badge_disabled)
        }
    }

    private fun setStatus(text: String, tunnelUp: Boolean) {
        statusText.text = text
        val color = if (tunnelUp) R.color.status_online else R.color.status_offline
        statusText.setTextColor(ContextCompat.getColor(this, color))
    }

    private fun setControlsEnabledForState() {
        val busy = operationInFlight
        startButton.isEnabled = !busy && !tunnelUp
        stopButton.isEnabled = !busy && tunnelUp
        configInput.isEnabled = !busy && !tunnelUp
        daitaSwitch.isEnabled = !busy
        remoteControlSwitch.isEnabled = !busy
        controlEndpointInput.isEnabled = !busy && remoteControlSwitch.isChecked && !tunnelUp
        controlTokenInput.isEnabled = !busy && remoteControlSwitch.isChecked && !tunnelUp
        intensityGroup.isEnabled = !busy
        for (i in 0 until intensityGroup.childCount) {
            intensityGroup.getChildAt(i).isEnabled = !busy
        }
    }

    private fun openSystemVpnSettings() {
        runCatching {
            startActivity(Intent(Settings.ACTION_VPN_SETTINGS))
        }.onFailure {
            setStatus(getString(R.string.status_vpn_permission_denied), tunnelUp = false)
        }
    }

    private fun saveConfig(rawConfig: String) {
        secureStore.putString(PREF_WG_CONFIG, rawConfig)
    }

    private fun loadSavedConfig(): String {
        val saved = secureStore.getString(PREF_WG_CONFIG, "")
        if (saved.isNotBlank()) return saved
        return loadBundledTemplateConfig()
    }

    private fun loadBundledTemplateConfig(): String {
        return runCatching {
            assets.open(DaitaConfig.TEMPLATE_ASSET_FILE).use { input ->
                BufferedReader(InputStreamReader(input)).readText()
            }
        }.getOrElse { "" }
    }

    private fun loadSavedControlSettings() {
        remoteControlSwitch.isChecked = secureStore.getBoolean(PREF_CONTROL_ENABLED, false)
        controlEndpointInput.setText(
            secureStore.getString(PREF_CONTROL_ENDPOINT, DaitaConfig.DEFAULT_CONTROL_ENDPOINT),
        )
        controlTokenInput.setText(secureStore.getString(PREF_CONTROL_TOKEN, ""))
        getOrCreateClientId()
    }

    private fun saveControlSettings() {
        secureStore.putBoolean(PREF_CONTROL_ENABLED, remoteControlSwitch.isChecked)
        secureStore.putString(PREF_CONTROL_ENDPOINT, controlEndpointInput.text?.toString()?.trim().orEmpty())
        secureStore.putString(PREF_CONTROL_TOKEN, controlTokenInput.text?.toString()?.trim().orEmpty())
    }

    private fun getOrCreateClientId(): String {
        val existing = secureStore.getString(PREF_CONTROL_CLIENT_ID, "")
        if (!existing.isNullOrBlank()) return existing
        val created = UUID.randomUUID().toString()
        secureStore.putString(PREF_CONTROL_CLIENT_ID, created)
        return created
    }

    private fun formatByteSize(bytes: Long): String {
        if (bytes <= 0L) return "0 B"
        val units = arrayOf("B", "KB", "MB", "GB")
        val digitGroups = (ln(bytes.toDouble()) / ln(1024.0)).toInt().coerceIn(0, units.lastIndex)
        val value = bytes / 1024.0.pow(digitGroups.toDouble())
        return String.format(Locale.US, "%.1f %s", value, units[digitGroups])
    }

    private class AppTunnel(
        private val name: String,
        private val onStateChangeCallback: (Tunnel.State) -> Unit,
    ) : Tunnel {
        override fun getName(): String = name

        override fun onStateChange(newState: Tunnel.State) {
            onStateChangeCallback(newState)
        }
    }

    companion object {
        private const val TAG = "MainActivity"
        private const val PREF_WG_CONFIG = "wg_config"
        private const val PREF_CONTROL_ENABLED = "control_enabled"
        private const val PREF_CONTROL_ENDPOINT = "control_endpoint"
        private const val PREF_CONTROL_TOKEN = "control_token"
        private const val PREF_CONTROL_CLIENT_ID = "control_client_id"
    }
}
