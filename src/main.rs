mod db;
mod error;
mod handlers;
mod models;

use axum::{middleware, routing::{delete, get, post}, Router};
use handlers::AppState;
use tower_http::{compression::CompressionLayer, cors::CorsLayer, trace::TraceLayer};

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

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(8080);

    // ── Database ──
    let db = db::Database::new(&database_url).await?;

    // ── Router ──
    let state = AppState {
        db,
        frontend_origin: frontend_origin.clone(),
    };

    let api = Router::new()
        .route("/numbers", get(handlers::list_numbers))
        .route("/numbers", post(handlers::register_number))
        .route("/numbers/{id}", get(handlers::get_number))
        .route("/numbers/{id}/verify", post(handlers::mark_verified))
        .route("/numbers/{id}", delete(handlers::delete_number))
        .route("/textnow-guide", get(handlers::get_textnow_guide));

    let app = Router::new()
        .route("/health", get(handlers::health))
        .nest("/api/verification", api)
        .fallback(handlers::redirect_to_frontend)
        .with_state(state)
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::permissive())
        .layer(middleware::from_fn(security_headers));

    tracing::info!("Listening on 0.0.0.0:{port}");
    tracing::info!("Frontend: {frontend_origin}");

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

/// Add security headers to every response.
async fn security_headers(
    req: axum::http::Request<axum::body::Body>,
    next: middleware::Next,
) -> axum::response::Response {
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
