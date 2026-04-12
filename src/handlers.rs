use axum::{
    extract::{Path, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Redirect, Response},
    Json,
};

use crate::error::{AppError, AppResult};
use crate::models::*;

// ── Shared application state ──

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub frontend_origin: String,
}

use crate::db::Database;

// ── Health check ──

pub async fn health() -> &'static str {
    "ok"
}

// ── Verification handlers ──

pub async fn list_numbers(
    State(state): State<AppState>,
) -> AppResult<Json<Vec<PhoneNumber>>> {
    let numbers = state.db.get_all_numbers().await?;
    Ok(Json(numbers))
}

pub async fn get_number(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> AppResult<Json<PhoneNumber>> {
    let number = state
        .db
        .get_number(id)
        .await?
        .ok_or_else(|| AppError::NotFound("Number not found".into()))?;
    Ok(Json(number))
}

pub async fn register_number(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> AppResult<(StatusCode, Json<RegisterResponse>)> {
    let phone = req.phone.trim();
    if phone.len() < 7 {
        return Err(AppError::Validation(
            "Phone number must be at least 7 characters".into(),
        ));
    }

    if state.db.get_by_phone(phone).await?.is_some() {
        return Err(AppError::Conflict(
            "Phone number already registered".into(),
        ));
    }

    let number = state
        .db
        .register_number(phone, &req.country, req.notes.as_deref())
        .await?;

    Ok((
        StatusCode::CREATED,
        Json(RegisterResponse {
            id: number.id,
            phone: number.phone,
            status: number.status,
            message: "Number registered successfully".into(),
        }),
    ))
}

pub async fn mark_verified(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> AppResult<Json<PhoneNumber>> {
    let number = state
        .db
        .mark_verified(id)
        .await?
        .ok_or_else(|| AppError::NotFound("Number not found".into()))?;
    Ok(Json(number))
}

pub async fn delete_number(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> AppResult<StatusCode> {
    let deleted = state.db.delete_number(id).await?;
    if deleted {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(AppError::NotFound("Number not found".into()))
    }
}

// ── Static guide ──

pub async fn get_textnow_guide() -> Json<TextNowGuide> {
    Json(TextNowGuide {
        title: "Get a Free Phone Number".into(),
        description: "Follow these steps to get a free US/Canada phone number from TextNow for WhatsApp verification.".into(),
        steps: vec![
            GuideStep {
                step_number: 1,
                title: "Download TextNow App".into(),
                description: "Download the TextNow app from the App Store (iOS) or Google Play Store (Android), or visit textnow.com on your computer.".into(),
            },
            GuideStep {
                step_number: 2,
                title: "Create an Account".into(),
                description: "Sign up for a free TextNow account using your email address.".into(),
            },
            GuideStep {
                step_number: 3,
                title: "Choose Your Number".into(),
                description: "TextNow will automatically assign you a free phone number. You can also search for available numbers in your preferred area code.".into(),
            },
            GuideStep {
                step_number: 4,
                title: "Verify Your Number".into(),
                description: "TextNow may ask you to verify your account via email. Complete the verification process.".into(),
            },
            GuideStep {
                step_number: 5,
                title: "Enter Number Below".into(),
                description: "Once you have your TextNow number, enter it in the form below to track it for WhatsApp verification.".into(),
            },
            GuideStep {
                step_number: 6,
                title: "Verify on WhatsApp".into(),
                description: "Open WhatsApp, go to Settings > Account > Change Number, and enter your TextNow number. WhatsApp will send a verification code to your TextNow number.".into(),
            },
            GuideStep {
                step_number: 7,
                title: "Complete Verification".into(),
                description: "Check your TextNow messages for the verification code and enter it in WhatsApp. Your number will be successfully verified!".into(),
            },
        ],
        download_links: vec![
            DownloadLink {
                platform: "iOS".into(),
                url: "https://apps.apple.com/us/app/textnow-text-calls-voicemail/id314905291".into(),
            },
            DownloadLink {
                platform: "Android".into(),
                url: "https://play.google.com/store/apps/details?id=com.textnow.android".into(),
            },
            DownloadLink {
                platform: "Web".into(),
                url: "https://www.textnow.com/".into(),
            },
        ],
    })
}

// ── Fallback: redirect non-API routes to Vercel frontend ──

pub async fn redirect_to_frontend(
    headers: HeaderMap,
    uri: axum::http::Uri,
    State(state): State<AppState>,
) -> Response {
    let host = headers
        .get(header::HOST)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if is_localhost(host) {
        return (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
            "Suraga verification API is running locally.",
        )
            .into_response();
    }

    let mut location = format!(
        "{}{}",
        state.frontend_origin.trim_end_matches('/'),
        uri.path()
    );
    if let Some(q) = uri.query() {
        location.push('?');
        location.push_str(q);
    }

    Redirect::permanent(&location).into_response()
}

fn is_localhost(host: &str) -> bool {
    let host = host.to_ascii_lowercase();
    let host = host.split(':').next().unwrap_or("");
    host == "127.0.0.1" || host == "localhost" || host == "[::1]"
}
