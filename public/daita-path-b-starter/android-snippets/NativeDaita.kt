package com.example.daita

object NativeDaita {
    init {
        System.loadLibrary("daita_rust")
    }

    @JvmStatic
    external fun nativeVersion(): String
    @JvmStatic
    external fun nativeCreate(machine: String): Long
    @JvmStatic
    external fun nativeDestroy(handle: Long)
    @JvmStatic
    external fun nativeOnNormalSent(handle: Long): Int
}
