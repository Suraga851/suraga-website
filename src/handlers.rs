use axum::{
    extract::{Path, Query, State},
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
    pub api_key: String,
    pub rate_limiter: crate::RateLimiter,
}

use crate::db::Database;

// ── Health check ──

pub async fn health() -> &'static str {
    "ok"
}

// ── Verification handlers ──

#[derive(serde::Deserialize)]
pub struct ListNumbersQuery {
    #[serde(default = "default_limit")]
    pub limit: i64,
    #[serde(default)]
    pub offset: i64,
}

fn default_limit() -> i64 {
    20
}

#[derive(serde::Serialize)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub limit: i64,
    pub offset: i64,
}

pub async fn list_numbers(
    State(state): State<AppState>,
    Query(query): Query<ListNumbersQuery>,
) -> AppResult<Json<PaginatedResponse<PhoneNumber>>> {
    let limit = query.limit.clamp(1, 100);
    let offset = query.offset.max(0);

    let (numbers, total) = state.db.get_numbers_paginated(limit, offset).await?;
    Ok(Json(PaginatedResponse {
        items: numbers,
        total,
        limit,
        offset,
    }))
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

    // Basic phone format validation (digits, +, spaces, dashes, parentheses)
    if !phone.chars().all(|c| c.is_ascii_digit() || c == '+' || c == ' ' || c == '-' || c == '(' || c == ')') {
        return Err(AppError::Validation(
            "Phone number contains invalid characters".into(),
        ));
    }

    // Validate country code (ISO 3166-1 alpha-2)
    let country = req.country.trim().to_uppercase();
    if country.len() != 2 || !country.chars().all(|c| c.is_ascii_uppercase()) {
        return Err(AppError::Validation(
            "Country must be a valid 2-letter ISO code".into(),
        ));
    }

    // Limit notes length
    let notes = req.notes.as_deref().map(|n| n.trim()).filter(|n| !n.is_empty());
    if let Some(n) = notes {
        if n.len() > 500 {
            return Err(AppError::Validation(
                "Notes must be 500 characters or less".into(),
            ));
        }
    }

    if state.db.get_by_phone(&phone).await?.is_some() {
        return Err(AppError::Conflict(
            "Phone number already registered".into(),
        ));
    }

    let number = state
        .db
        .register_number(&phone, &country, notes)
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
