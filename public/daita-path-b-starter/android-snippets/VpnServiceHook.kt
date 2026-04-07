package com.example.daita

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

class VpnServiceHook(
    private val sendPaddingPacket: suspend (Int) -> Unit
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val daita = DaitaEngine()

    fun onEncryptedPacketSent(realPacketSize: Int) {
        val delayMs = daita.onNormalPacketSent()
        if (delayMs <= 0) return

        scope.launch {
            // Add jitter so actions are not emitted on a fixed schedule.
            delay(delayMs.toLong() + Random.nextLong(3, 20))

            // Keep sizes near normal MTU envelope.
            val targetPaddingSize = (realPacketSize + Random.nextInt(-96, 160))
                .coerceIn(64, 1400)

            sendPaddingPacket(targetPaddingSize)
        }
    }

    fun shutdown() {
        daita.close()
    }
}
