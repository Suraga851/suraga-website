package com.example.daita

import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.After
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Instrumented JNI bridge tests.
 *
 * These tests require the Rust `.so` to be built and bundled in the APK.
 * Run after: `.\scripts\build-rust.ps1 -ProjectRoot <path>`
 *
 * All tests are skipped automatically if the native library failed to load,
 * so the test run doesn't fail on CI machines without the NDK.
 */
@RunWith(AndroidJUnit4::class)
class DaitaJniBridgeTest {

    private var handle: Long = 0L

    @Before
    fun setup() {
        // Skip every test in this class if the .so is unavailable.
        assumeTrue("Native library not loaded – run build-rust.ps1 first", NativeDaita.isLoaded())
    }

    @After
    fun teardown() {
        if (handle != 0L) {
            NativeDaita.nativeDestroy(handle)
            handle = 0L
        }
    }

    // ── nativeVersion ─────────────────────────────────────────────────────────

    @Test
    fun nativeVersion_returnsNonEmptyString() {
        val version = NativeDaita.nativeVersion()
        assertNotNull("version must not be null", version)
        assertTrue("version must not be empty", version.isNotEmpty())
        assertTrue(
            "version should start with 'daita_rust/'",
            version.startsWith("daita_rust/"),
        )
    }

    // ── nativeCreate / nativeDestroy ──────────────────────────────────────────

    @Test
    fun nativeCreate_withEmptyString_returnsValidHandle() {
        handle = NativeDaita.nativeCreate("")
        assertNotEquals("handle must be non-zero for valid machine", 0L, handle)
    }

    @Test
    fun nativeCreate_withDefaultMachine_returnsValidHandle() {
        handle = NativeDaita.nativeCreate(DaitaConfig.DEFAULT_MACHINE_B64)
        assertNotEquals(0L, handle)
    }

    @Test
    fun nativeDestroy_withZeroHandle_doesNotCrash() {
        // Destroying a null handle must be a no-op.
        NativeDaita.nativeDestroy(0L)
    }

    // ── nativeOnNormalSent ────────────────────────────────────────────────────

    @Test
    fun nativeOnNormalSent_returnsIntegerWithoutCrash() {
        handle = NativeDaita.nativeCreate("")
        assumeTrue(handle != 0L)
        val result = NativeDaita.nativeOnNormalSent(handle)
        // Result must be -1 (no padding) or a valid non-negative delay in ms.
        assertTrue("Result should be >= -1", result >= -1)
    }

    @Test
    fun nativeOnNormalSent_withZeroHandle_returnsNegativeOne() {
        val result = NativeDaita.nativeOnNormalSent(0L)
        assertTrue("Zero handle should return -1", result == -1)
    }
}
