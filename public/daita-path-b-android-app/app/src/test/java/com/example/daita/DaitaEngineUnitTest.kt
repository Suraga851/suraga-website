package com.example.daita

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

/**
 * JVM unit tests for [DaitaEngine].
 *
 * The native library is NOT available in a plain JVM test environment, so
 * we exercise the Kotlin-layer logic (handle == 0 guards, idempotent close).
 * Full JNI round-trips are covered in [DaitaJniBridgeTest] (instrumented).
 */
class DaitaEngineUnitTest {

    /**
     * When the native library is absent the engine should report invalid and
     * return -1 without throwing.
     */
    @Test
    fun nullHandleSafety_returnsNegativeOneWithoutCrash() {
        // NativeDaita.isLoaded() returns false in pure JVM tests (no .so on the path).
        val engine = DaitaEngine()
        assertFalse("Engine should be invalid when library is absent", engine.isValid())
        assertEquals(-1, engine.onNormalPacketSent())
    }

    /**
     * Closing an engine twice (or closing an invalid engine) must not throw.
     */
    @Test
    fun doubleClose_isIdempotent() {
        val engine = DaitaEngine()
        engine.close() // first close
        engine.close() // second close – must not throw / crash
    }

    /**
     * [DaitaEngine.onNormalPacketSent] returns -1 when the engine is invalid,
     * even after a [DaitaEngine.close] call.
     */
    @Test
    fun onNormalPacketSent_afterClose_returnsNegativeOne() {
        val engine = DaitaEngine()
        engine.close()
        assertEquals(-1, engine.onNormalPacketSent())
    }
}
