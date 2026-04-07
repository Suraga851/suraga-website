package com.example.daita

/**
 * Central configuration object for all tuneable DAITA constants.
 * Change values here rather than scattering magic numbers across the codebase.
 */
internal object DaitaConfig {
    /** Base-64 encoded Maybenot machine definition (fallback / default). */
    const val DEFAULT_MACHINE_B64: String = "02eNpjYEAHjOgCAAA0AAI="

    /** Bundled fallback WireGuard profile template asset name. */
    const val TEMPLATE_ASSET_FILE: String = "wg_profile.template.conf"

    /** Poll interval for WireGuard runtime stats. */
    const val STATS_POLL_INTERVAL_MS: Long = 700L

    /** Default free self-hosted control-plane endpoint. */
    const val DEFAULT_CONTROL_ENDPOINT: String = "http://10.0.2.2:8787/v1/schedule"

    /** Minimum and maximum remote schedule TTL accepted by the client. */
    const val MIN_CONTROL_TTL_MS: Long = 5_000L
    const val MAX_CONTROL_TTL_MS: Long = 60_000L
    const val CONTROL_RETRY_MS: Long = 5_000L

    /** Max pending padding sends buffered for DAITA runtime. */
    const val PADDING_CHANNEL_CAPACITY: Int = 64

    /** Additional random delay jitter applied to scheduled padding sends. */
    const val MAX_DELAY_JITTER_MS: Long = 55L

    /** UDP port used for cover-traffic fallback target (DNS). */
    const val DEFAULT_COVER_TARGET_PORT: Int = 53

    /** Cover-traffic fallback host when config parsing does not yield a target. */
    const val DEFAULT_COVER_TARGET_HOST: String = "1.1.1.1"

    /** Intensity LOW profile. */
    const val LOW_MIN_PADDING_BYTES: Int = 72
    const val LOW_MAX_PADDING_BYTES: Int = 220
    const val LOW_MAX_EVENTS_PER_TICK: Int = 2
    const val LOW_MAX_BYTES_PER_MIN: Long = 64L * 1024L

    /** Intensity BALANCED profile. */
    const val BALANCED_MIN_PADDING_BYTES: Int = 100
    const val BALANCED_MAX_PADDING_BYTES: Int = 360
    const val BALANCED_MAX_EVENTS_PER_TICK: Int = 4
    const val BALANCED_MAX_BYTES_PER_MIN: Long = 160L * 1024L

    /** Intensity AGGRESSIVE profile. */
    const val AGGRESSIVE_MIN_PADDING_BYTES: Int = 140
    const val AGGRESSIVE_MAX_PADDING_BYTES: Int = 620
    const val AGGRESSIVE_MAX_EVENTS_PER_TICK: Int = 6
    const val AGGRESSIVE_MAX_BYTES_PER_MIN: Long = 320L * 1024L
}
