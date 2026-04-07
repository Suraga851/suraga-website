package com.example.daita

import android.util.Log

/**
 * JNI bridge to the native Rust `daita_rust` library.
 *
 * All `external` functions are only safe to call after [isLoaded] returns true.
 * The `safe*` wrappers enforce this so callers never need to check themselves.
 */
object NativeDaita {
    private const val TAG = "NativeDaita"

    /**
     * Whether the native library was successfully loaded.
     * Initialised once in the class initialiser block.
     */
    private var loaded: Boolean = false

    init {
        loaded = try {
            System.loadLibrary("daita_rust")
            true
        } catch (e: UnsatisfiedLinkError) {
            safeLogError("Native library not loaded. Build rust-lib first.", e)
            false
        }
    }

    /** Returns true if the native library is available. */
    fun isLoaded(): Boolean = loaded

    // ── Safe wrappers (always callable – return sentinel values if not loaded) ──

    /**
     * Returns a version string like `"daita_rust/0.1.0"`, or an empty string
     * if the native library was not loaded.
     */
    fun safeVersion(): String {
        if (!loaded) return ""
        return runCatching { nativeVersion() }
            .getOrElse { e -> safeLogError("nativeVersion failed", e); "" }
    }

    /**
     * Creates a native engine instance.
     *
     * @param machine Base-64 encoded Maybenot machine, or empty to use the default.
     * @return Opaque native handle (non-zero on success, 0 on failure / not loaded).
     */
    fun safeCreate(machine: String): Long {
        if (!loaded) return 0L
        return runCatching { nativeCreate(machine) }
            .getOrElse { e -> safeLogError("nativeCreate failed", e); 0L }
    }

    /**
     * Destroys a previously created engine handle.
     * No-op if handle is 0 or the library is not loaded.
     */
    fun safeDestroy(handle: Long) {
        if (!loaded || handle == 0L) return
        runCatching { nativeDestroy(handle) }
            .onFailure { e -> safeLogError("nativeDestroy failed", e) }
    }

    /**
     * Triggers a normal-sent event in the engine.
     *
     * @return Requested delay in ms, or -1 if no padding / not loaded.
     */
    fun safeOnNormalSent(handle: Long): Int {
        if (!loaded || handle == 0L) return -1
        return runCatching { nativeOnNormalSent(handle) }
            .getOrElse { e -> safeLogError("nativeOnNormalSent failed", e); -1 }
    }

    // ── Raw external declarations (use safe* wrappers instead) ────────────────

    @JvmStatic
    external fun nativeVersion(): String

    @JvmStatic
    external fun nativeCreate(machine: String): Long

    @JvmStatic
    external fun nativeDestroy(handle: Long)

    @JvmStatic
    external fun nativeOnNormalSent(handle: Long): Int

    private fun safeLogError(message: String, error: Throwable) {
        runCatching { Log.e(TAG, message, error) }
    }
}
