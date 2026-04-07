use jni::objects::{JClass, JString};
use jni::sys::{jint, jlong, jstring};
use jni::JNIEnv;
use maybenot::{Framework, Machine, TriggerAction, TriggerEvent};
use rand::rngs::ThreadRng;
use std::str::FromStr;
use std::time::Instant;

const DEFAULT_MACHINE_B64: &str = "02eNpjYEAHjOgCAAA0AAI=";

// ── Engine type ───────────────────────────────────────────────────────────────

struct DaitaEngine {
    framework: Framework<Vec<Machine>, ThreadRng>,
}

fn build_engine(machine_b64: &str) -> Result<DaitaEngine, String> {
    let machine = Machine::from_str(machine_b64)
        .map_err(|err| format!("Invalid Maybenot machine: {err}"))?;
    let machines = vec![machine];

    let framework = Framework::new(machines, 0.0, 0.0, Instant::now(), rand::rng())
        .map_err(|err| format!("Framework init failed: {err}"))?;

    Ok(DaitaEngine { framework })
}

// ── JNI helpers ───────────────────────────────────────────────────────────────

fn to_java_string(env: JNIEnv, value: &str) -> jstring {
    match env.new_string(value) {
        Ok(s) => s.into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

/// Converts a raw `jlong` handle back to a mutable engine reference.
///
/// # Safety
/// The caller must guarantee:
/// 1. `handle` was produced by `Box::into_raw(Box::new(engine))` in `nativeCreate`.
/// 2. `nativeDestroy` has NOT yet been called for this handle.
/// 3. No other concurrent mutable access to the same handle exists.
unsafe fn handle_as_engine_mut(handle: jlong) -> Option<&'static mut DaitaEngine> {
    if handle == 0 {
        None
    } else {
        Some(&mut *(handle as *mut DaitaEngine))
    }
}

// ── Exported JNI functions ────────────────────────────────────────────────────

/// Returns a version string, e.g. `"daita_rust/0.1.0"`.
#[no_mangle]
pub extern "system" fn Java_com_example_daita_NativeDaita_nativeVersion(
    env: JNIEnv,
    _class: JClass,
) -> jstring {
    let version = concat!("daita_rust/", env!("CARGO_PKG_VERSION"));
    to_java_string(env, version)
}

/// Creates a new engine.
///
/// Returns a non-zero opaque handle on success, or 0 and throws an
/// `IllegalArgumentException` on failure so the Kotlin side can distinguish
/// "library not loaded" (handle == 0) from "bad machine" (exception thrown).
#[no_mangle]
pub extern "system" fn Java_com_example_daita_NativeDaita_nativeCreate(
    mut env: JNIEnv,
    _class: JClass,
    machine: JString,
) -> jlong {
    // Resolve the machine string: use the JNI input, or fall back to the default.
    let machine_input: String = match env.get_string(&machine) {
        Ok(s) => s.into(),
        Err(_) => DEFAULT_MACHINE_B64.to_owned(),
    };

    // Fix: bind the owned trimmed string before branching on it.
    let trimmed = machine_input.trim().to_owned();
    let machine_b64: &str = if trimmed.is_empty() {
        DEFAULT_MACHINE_B64
    } else {
        &trimmed
    };

    match build_engine(machine_b64) {
        Ok(engine) => Box::into_raw(Box::new(engine)) as jlong,
        Err(msg) => {
            // Surface the error to Kotlin as an exception instead of silently
            // returning 0. The caller should catch IllegalArgumentException.
            let _ = env.throw_new("java/lang/IllegalArgumentException", &msg);
            0
        }
    }
}

/// Destroys an engine handle previously returned by `nativeCreate`.
///
/// Passing a 0 handle is a no-op (safe).
#[no_mangle]
pub extern "system" fn Java_com_example_daita_NativeDaita_nativeDestroy(
    _env: JNIEnv,
    _class: JClass,
    handle: jlong,
) {
    if handle == 0 {
        return;
    }
    // SAFETY: handle was created by nativeCreate and has not been destroyed.
    unsafe {
        drop(Box::from_raw(handle as *mut DaitaEngine));
    }
}

/// Triggers a NormalSent event and returns the requested padding delay in ms.
///
/// Returns -1 if no padding is scheduled or the handle is invalid.
#[no_mangle]
pub extern "system" fn Java_com_example_daita_NativeDaita_nativeOnNormalSent(
    _env: JNIEnv,
    _class: JClass,
    handle: jlong,
) -> jint {
    if handle == 0 {
        return -1;
    }

    // SAFETY: handle is non-zero and contract above holds.
    let engine = unsafe { handle_as_engine_mut(handle) };
    let Some(engine) = engine else {
        return -1;
    };

    let events = [TriggerEvent::NormalSent];
    let actions = engine.framework.trigger_events(&events, Instant::now());

    for action in actions {
        if let TriggerAction::SendPadding { timeout, .. } = action {
            // Return the timeout as milliseconds (rounded to nearest ms).
            let timeout: std::time::Duration = *timeout;
            let ms = timeout.as_millis().min(i32::MAX as u128) as i32;
            return ms.max(0);
        }
    }

    -1
}
