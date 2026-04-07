package com.example.daita

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

/**
 * SharedPreferences wrapper that prefers encrypted storage, with safe fallback
 * to regular preferences if device keystore/encryption setup fails.
 */
class SecureStore(context: Context) {

    private val prefs: SharedPreferences = createPreferences(context.applicationContext)

    fun getString(key: String, defaultValue: String = ""): String {
        return prefs.getString(key, defaultValue) ?: defaultValue
    }

    fun putString(key: String, value: String) {
        prefs.edit().putString(key, value).apply()
    }

    fun getBoolean(key: String, defaultValue: Boolean = false): Boolean {
        return prefs.getBoolean(key, defaultValue)
    }

    fun putBoolean(key: String, value: Boolean) {
        prefs.edit().putBoolean(key, value).apply()
    }

    private fun createPreferences(context: Context): SharedPreferences {
        return runCatching {
            val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)

            EncryptedSharedPreferences.create(
                ENCRYPTED_PREFS_NAME,
                masterKeyAlias,
                context,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
            )
        }.getOrElse { error ->
            Log.w(TAG, "Encrypted prefs unavailable, using fallback store: ${error.javaClass.simpleName}")
            context.getSharedPreferences(FALLBACK_PREFS_NAME, Context.MODE_PRIVATE)
        }
    }

    private companion object {
        private const val TAG = "SecureStore"
        private const val ENCRYPTED_PREFS_NAME = "suraga_secure_prefs"
        private const val FALLBACK_PREFS_NAME = "suraga_fallback_prefs"
    }
}
