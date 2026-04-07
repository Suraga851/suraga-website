use jni::objects::{JClass, JString};
use jni::sys::{jint, jlong, jstring};
use jni::JNIEnv;
use maybenot::{Framework, Machine, TriggerAction, TriggerEvent};
use rand::rngs::ThreadRng;
use std::str::FromStr;
use std::time::Instant;

const DEFAULT_MACHINE_B64: &str = "02eNpjYEAHjOgCAAA0AAI=";

struct DaitaEngine {
    framework: Framework<ThreadRng>,
}

fn build_engine(machine_b64: &str) -> Result<DaitaEngine, String> {
    let machine = Machine::from_str(machine_b64)
        .map_err(|err| format!("Invalid Maybenot machine: {err}"))?;
    let machines = vec![machine];

    let framework = Framework::new(&machines, 0.0, 0.0, Instant::now(), rand::rng())
        .map_err(|err| format!("Framework init failed: {err}"))?;

    Ok(DaitaEngine { framework })
}

fn to_java_string(mut env: JNIEnv, value: &str) -> jstring {
    match env.new_string(value) {
        Ok(s) => s.into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

unsafe fn handle_as_engine_mut(handle: jlong) -> Option<&'static mut DaitaEngine> {
    if handle == 0 {
        None
    } else {
        Some(&mut *(handle as *mut DaitaEngine))
    }
}

#[no_mangle]
pub extern "system" fn Java_com_example_daita_NativeDaita_nativeVersion(
    env: JNIEnv,
    _class: JClass,
) -> jstring {
    to_java_string(env, "daita_rust/0.1.0")
}

#[no_mangle]
pub extern "system" fn Java_com_example_daita_NativeDaita_nativeCreate(
    mut env: JNIEnv,
    _class: JClass,
    machine: JString,
) -> jlong {
    let machine_input = match env.get_string(&machine) {
        Ok(s) => s.into(),
        Err(_) => DEFAULT_MACHINE_B64.to_string(),
    };

    let machine_b64 = if machine_input.trim().is_empty() {
        DEFAULT_MACHINE_B64
    } else {
        machine_input.trim()
    };

    match build_engine(machine_b64) {
        Ok(engine) => Box::into_raw(Box::new(engine)) as jlong,
        Err(_) => 0,
    }
}

#[no_mangle]
pub extern "system" fn Java_com_example_daita_NativeDaita_nativeDestroy(
    _env: JNIEnv,
    _class: JClass,
    handle: jlong,
) {
    if handle == 0 {
        return;
    }

    unsafe {
        drop(Box::from_raw(handle as *mut DaitaEngine));
    }
}

#[no_mangle]
pub extern "system" fn Java_com_example_daita_NativeDaita_nativeOnNormalSent(
    _env: JNIEnv,
    _class: JClass,
    handle: jlong,
) -> jint {
    if handle == 0 {
        return -1;
    }

    let engine = unsafe { handle_as_engine_mut(handle) };
    let Some(engine) = engine else {
        return -1;
    };

    let events = [TriggerEvent::NormalSent];
    let actions = engine.framework.trigger_events(&events, Instant::now());

    // If Maybenot asks for padding, return a small scheduling delay in ms.
    for action in actions {
        if let TriggerAction::SendPadding { .. } = action {
            return 25;
        }
    }

    -1
}
