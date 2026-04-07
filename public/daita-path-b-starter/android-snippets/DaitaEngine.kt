package com.example.daita

import java.io.Closeable

class DaitaEngine(
    machineB64: String = "02eNpjYEAHjOgCAAA0AAI="
) : Closeable {
    private var nativeHandle: Long = NativeDaita.nativeCreate(machineB64)

    fun onNormalPacketSent(): Int {
        val handle = nativeHandle
        if (handle == 0L) {
            return -1
        }
        return NativeDaita.nativeOnNormalSent(handle)
    }

    override fun close() {
        val handle = nativeHandle
        if (handle != 0L) {
            NativeDaita.nativeDestroy(handle)
            nativeHandle = 0L
        }
    }
}
