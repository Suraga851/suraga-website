mod db;
mod error;
mod handlers;
mod models;

use axum::{
    extract::{ConnectInfo, State},
    http::{HeaderValue, Method, Request, StatusCode},
    middleware,
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Router,
};
use handlers::AppState;
use std::{
    net::SocketAddr,
    sync::Arc,
    time::{Duration, Instant},
};
use dashmap::DashMap;
use tower_http::{
    compression::CompressionLayer,
    cors::CorsLayer,
    trace::TraceLayer,
};

/// Simple in-memory rate limiter (10 req/min per IP).
#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<DashMap<String, Vec<Instant>>>,
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    fn new(max_requests: usize, window: Duration) -> Self {
        Self {
            requests: Arc::new(DashMap::new()),
            max_requests,
            window,
        }
    }

    fn check(&self, key: &str) -> bool {
        let now = Instant::now();
        let cutoff = now - self.window;

        if let Some(mut times) = self.requests.get_mut(key) {
            times.retain(|&t| t > cutoff);
            if times.len() >= self.max_requests {
                return false;
            }
            times.push(now);
            true
        } else {
            self.requests.insert(key.to_string(), vec![now]);
            true
        }
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // ── Logging ──
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "suraga_website=info,tower_http=debug".into()),
        )
        .init();

    // ── Config ──
    let frontend_origin =
        std::env::var("FRONTEND_ORIGIN").unwrap_or_else(|_| "https://suraga-website.vercel.app".into());

    let database_url =
        std::env::var("DATABASE_URL").expect("DATABASE_URL environment variable must be set");

    let api_key = std::env::var("API_KEY")
        .expect("API_KEY environment variable must be set");

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(8080);

    // ── Database ──
    let db = db::Database::new(&database_url).await?;

    // ── Rate Limiter ──
    let rate_limiter = RateLimiter::new(60, Duration::from_secs(60));

    // ── CORS ──
    let cors = CorsLayer::new()
        .allow_origin(frontend_origin.parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::OPTIONS])
        .allow_headers([axum::http::header::CONTENT_TYPE, axum::http::header::AUTHORIZATION])
        .max_age(std::time::Duration::from_secs(3600));

    // ── Router ──
    let state = AppState {
        db,
        frontend_origin: frontend_origin.clone(),
        api_key: api_key.clone(),
        rate_limiter,
    };

    let public_api = Router::new()
        .route("/numbers", get(handlers::list_numbers))
        .route("/numbers/{id}", get(handlers::get_number))
        .route("/textnow-guide", get(handlers::get_textnow_guide));

    let protected_api = Router::new()
        .route("/numbers", post(handlers::register_number))
        .route("/numbers/{id}/verify", post(handlers::mark_verified))
        .route("/numbers/{id}", delete(handlers::delete_number))
        .layer(middleware::from_fn_with_state(state.clone(), require_api_key))
        .layer(middleware::from_fn_with_state(state.clone(), rate_limit));

    let api = public_api.merge(protected_api);

    let app = Router::new()
        .route("/health", get(handlers::health))
        .nest("/api/verification", api)
        .fallback(handlers::redirect_to_frontend)
        .with_state(state)
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .layer(middleware::from_fn(security_headers));

    tracing::info!("Listening on 0.0.0.0:{port}");
    tracing::info!("Frontend: {frontend_origin}");

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

/// Require a valid API key in the x-api-key header.
async fn require_api_key(
    State(state): State<AppState>,
    req: Request<axum::body::Body>,
    next: middleware::Next,
) -> Response {
    let provided = req
        .headers()
        .get("x-api-key")
        .and_then(|v| v.to_str().ok());

    match provided {
        Some(key) if key == state.api_key => next.run(req).await,
        _ => (StatusCode::UNAUTHORIZED, axum::Json(serde_json::json!({
            "error": "Invalid or missing API key"
        }))).into_response(),
    }
}

/// Rate limiter by client IP (10 req/min).
async fn rate_limit(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    req: Request<axum::body::Body>,
    next: middleware::Next,
) -> Response {
    let key = addr.ip().to_string();
    if !state.rate_limiter.check(&key) {
        return (StatusCode::TOO_MANY_REQUESTS, axum::Json(serde_json::json!({
            "error": "Rate limit exceeded. Try again later."
        }))).into_response();
    }
    next.run(req).await
}

/// Add security headers to every response.
async fn security_headers(
    req: Request<axum::body::Body>,
    next: middleware::Next,
) -> Response {
    let mut response = next.run(req).await;

    let headers = response.headers_mut();
    headers.insert("x-content-type-options", "nosniff".parse().unwrap());
    headers.insert("referrer-policy", "strict-origin-when-cross-origin".parse().unwrap());
    headers.insert(
        "strict-transport-security",
        "max-age=31536000; includeSubDomains; preload".parse().unwrap(),
    );
    headers.insert("permissions-policy", "camera=(), microphone=(), geolocation=()".parse().unwrap());
    headers.insert("x-frame-options", "DENY".parse().unwrap());

    response
}
