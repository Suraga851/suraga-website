package com.example.daita

import java.io.Closeable
import java.util.concurrent.atomic.AtomicLong

/**
 * Kotlin wrapper around the native Maybenot DAITA engine.
 *
 * Thread-safety: [nativeHandle] is stored as an [AtomicLong] so concurrent calls
 * to [onNormalPacketSent] and [close] from different threads cannot produce a
 * use-after-free or double-free in the native layer. [close] performs a CAS
 * from the live handle to 0 before issuing the native destroy, so it is safe to
 * call from any thread and is idempotent.
 */
class DaitaEngine(
    machineB64: String = DaitaConfig.DEFAULT_MACHINE_B64,
) : Closeable {

    private val nativeHandle: AtomicLong = AtomicLong(NativeDaita.safeCreate(machineB64))

    /** Returns true if the native engine was successfully created. */
    fun isValid(): Boolean = nativeHandle.get() != 0L

    /**
     * Notifies the engine that a normal (non-padding) packet was sent.
     *
     * @return Requested padding delay in ms (≥ 0), or -1 if no padding needed /
     *         engine is not available.
     */
    fun onNormalPacketSent(): Int {
        val handle = nativeHandle.get()
        if (handle == 0L) return -1
        return NativeDaita.safeOnNormalSent(handle)
    }

    /**
     * Releases native resources. Safe to call multiple times and from any thread.
     */
    override fun close() {
        // Atomically swap the handle to 0; only the thread that wins the CAS
        // will issue the native destroy, preventing a double-free.
        val handle = nativeHandle.getAndSet(0L)
        if (handle != 0L) {
            NativeDaita.safeDestroy(handle)
        }
    }
}
