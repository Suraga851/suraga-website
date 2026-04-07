use actix_cors::Cors;
use actix_web::dev::Service;
use actix_web::http::header::{self, HeaderValue, CACHE_CONTROL};
use actix_web::{middleware, web, App, HttpResponse, HttpServer, Responder};
use std::env;
use std::sync::Mutex;
use suraga_website::verification;
use suraga_website::verification::db::Database;

fn env_flag(name: &str, default: bool) -> bool {
    match env::var(name) {
        Ok(value) => match value.trim().to_ascii_lowercase().as_str() {
            "1" | "true" | "yes" | "on" => true,
            "0" | "false" | "no" | "off" => false,
            _ => default,
        },
        Err(_) => default,
    }
}

fn allowed_origins() -> Vec<String> {
    let configured = env::var("ALLOWED_ORIGINS")
        .unwrap_or_else(|_| {
            [
                "https://suraga-website.vercel.app",
                "http://127.0.0.1:8080",
                "http://localhost:8080",
            ]
            .join(",")
        })
        .split(',')
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
        .collect::<Vec<_>>();

    if configured.is_empty() {
        vec!["https://suraga-website.vercel.app".to_string()]
    } else {
        configured
    }
}

fn build_cors() -> Cors {
    let mut cors = Cors::default()
        .allowed_methods(vec!["GET", "POST", "DELETE", "OPTIONS"])
        .allowed_headers(vec![header::ACCEPT, header::CONTENT_TYPE])
        .max_age(3600);

    for origin in allowed_origins() {
        cors = cors.allowed_origin(&origin);
    }

    if env_flag("CORS_SUPPORTS_CREDENTIALS", false) {
        cors.supports_credentials()
    } else {
        cors
    }
}

fn cache_control_for_path(path: &str) -> &'static str {
    if path == "/" || path == "/health" || path.starts_with("/api/verification/numbers") {
        return "no-store";
    }

    if path == "/api/verification/textnow-guide" {
        return "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";
    }

    "public, max-age=0, must-revalidate"
}

async fn health() -> impl Responder {
    HttpResponse::Ok().body("ok")
}

async fn root() -> impl Responder {
    HttpResponse::Ok()
        .content_type("text/plain; charset=utf-8")
        .body("Suraga verification API is running.")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if env::var_os("RUST_LOG").is_none() {
        env::set_var("RUST_LOG", "actix_web=info");
    }
    env_logger::init();

    let port = env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(8080);
    let worker_count = env::var("WEB_CONCURRENCY")
        .ok()
        .and_then(|value| value.parse::<usize>().ok())
        .or_else(|| std::thread::available_parallelism().ok().map(usize::from))
        .unwrap_or(2);

    let db_path = env::var("DATABASE_URL").unwrap_or_else(|_| "./verification.db".to_string());
    let verification_db = match Database::new(&db_path) {
        Ok(db) => {
            println!("Verification database initialized at {db_path}");
            web::Data::new(Mutex::new(db))
        }
        Err(error) => {
            println!("Warning: failed to initialize verification database: {error}");
            println!("Falling back to an in-memory database.");
            web::Data::new(Mutex::new(Database::new(":memory:").unwrap()))
        }
    };

    let cors_supports_credentials = env_flag("CORS_SUPPORTS_CREDENTIALS", false);
    println!("Verification API starting at http://0.0.0.0:{port}");
    println!("Worker processes: {worker_count}");
    println!("Allowed origins: {}", allowed_origins().join(", "));
    println!("CORS credentials enabled: {cors_supports_credentials}");

    HttpServer::new(move || {
        let app_verification_db = verification_db.clone();

        App::new()
            .app_data(app_verification_db)
            .wrap(middleware::Logger::default())
            .wrap(middleware::Compress::default())
            .wrap(build_cors())
            .wrap_fn(|req, srv| {
                let path = req.path().to_owned();
                let fut = srv.call(req);

                async move {
                    let mut response = fut.await?;
                    response.headers_mut().insert(
                        CACHE_CONTROL,
                        HeaderValue::from_static(cache_control_for_path(&path)),
                    );
                    Ok(response)
                }
            })
            .wrap(
                middleware::DefaultHeaders::new()
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("Referrer-Policy", "strict-origin-when-cross-origin"))
                    .add(("Permissions-Policy", "camera=(), microphone=(), geolocation=()"))
                    .add(("X-Frame-Options", "DENY")),
            )
            .route("/", web::get().to(root))
            .route("/health", web::get().to(health))
            .configure(verification::configure)
    })
    .workers(worker_count)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
