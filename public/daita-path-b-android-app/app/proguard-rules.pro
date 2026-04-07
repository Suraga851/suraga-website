# ── JNI bridge ───────────────────────────────────────────────────────────────
# Keep the NativeDaita object and all its external (JNI) methods so R8 does
# not rename or strip them. Mangled JNI symbol names must match the Rust exports
# exactly (Java_com_example_daita_NativeDaita_<method>).
-keep class com.example.daita.NativeDaita {
    public static native <methods>;
}

# Keep the companion object of NativeDaita (holds @JvmStatic externals).
-keepclassmembers class com.example.daita.NativeDaita$Companion {
    *;
}

# ── VPN service & config ──────────────────────────────────────────────────────
# Keep service action constants and broadcast extras referenced via string literals
# from the AndroidManifest and from broadcast receivers in MainActivity.
-keepclassmembers class com.example.daita.DaitaVpnService {
    public static final java.lang.String ACTION_START;
    public static final java.lang.String ACTION_STOP;
    public static final java.lang.String STATUS_ACTION;
    public static final java.lang.String EXTRA_TUNNEL_UP;
}

# ── Suppress noisy R8 notes for Kotlin metadata ───────────────────────────────
-dontnote kotlin.reflect.**
-dontnote kotlin.internal.**
