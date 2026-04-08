use actix_web::dev::Service;
use actix_web::http::header::{HeaderName, HeaderValue, CACHE_CONTROL, LOCATION, X_FRAME_OPTIONS};
use actix_web::{middleware, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use std::env;

mod verification;
use verification::db::Database;

#[derive(Clone)]
struct AppConfig {
    frontend_origin: String,
    database_backend: &'static str,
}

async fn health(config: web::Data<AppConfig>) -> impl Responder {
    HttpResponse::Ok().body(format!("ok:{}", config.database_backend))
}

fn is_local_host(host: &str) -> bool {
    let host = host.to_ascii_lowercase();
    host.starts_with("127.0.0.1")
        || host.starts_with("localhost")
        || host.starts_with("[::1]")
}

fn cache_control_for_path(path: &str) -> &'static str {
    if path == "/health" || path.starts_with("/api/verification/numbers") {
        return "no-store";
    }

    if path.starts_with("/api/verification/textnow-guide") {
        return "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";
    }

    "no-store"
}

fn redirect_location(req: &HttpRequest, frontend_origin: &str) -> String {
    let mut location = format!("{}{}", frontend_origin.trim_end_matches('/'), req.path());
    let query = req.query_string();

    if !query.is_empty() {
        location.push('?');
        location.push_str(query);
    }

    location
}

async fn redirect_or_info(req: HttpRequest, config: web::Data<AppConfig>) -> impl Responder {
    let host = req.connection_info().host().to_string();

    if is_local_host(&host) {
        return HttpResponse::Ok()
            .content_type("text/plain; charset=utf-8")
            .body("Suraga verification API is running locally.");
    }

    HttpResponse::MovedPermanently()
        .insert_header((LOCATION, redirect_location(&req, &config.frontend_origin)))
        .finish()
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
    let app_config = AppConfig {
        frontend_origin: env::var("FRONTEND_ORIGIN")
            .unwrap_or_else(|_| "https://suraga-website.vercel.app".to_string()),
        database_backend: "sqlite",
    };

    // Initialize verification database
    let db_path = env::var("DATABASE_URL").unwrap_or_else(|_| "./verification.db".to_string());
    let (verification_db, app_config) = match Database::new(&db_path) {
        Ok(db) => {
            let backend_label = db.backend_label();
            println!(
                "Verification database initialized using {} backend",
                backend_label
            );
            (
                web::Data::new(db),
                AppConfig {
                    database_backend: backend_label,
                    ..app_config
                },
            )
        }
        Err(e) => {
            println!("Warning: Failed to initialize verification database: {}", e);
            println!("Verification API will not be available");
            let fallback = Database::new(":memory:").unwrap();
            let backend_label = fallback.backend_label();
            (
                web::Data::new(fallback),
                AppConfig {
                    database_backend: backend_label,
                    ..app_config
                },
            )
        }
    };

    println!("Server starting at http://0.0.0.0:{port}");
    println!("Worker processes: {worker_count}");
    println!("Frontend redirect target: {}", app_config.frontend_origin);

    HttpServer::new(move || {
        let app_verification_db = verification_db.clone();
        let app_config_data = web::Data::new(app_config.clone());
        let database_backend = app_config.database_backend;
        App::new()
            .app_data(app_config_data)
            .wrap(middleware::Logger::default())
            .wrap(middleware::Compress::default())
            .wrap_fn(move |req, srv| {
                let path = req.path().to_owned();
                let fut = srv.call(req);

                async move {
                    let mut response = fut.await?;
                    response.headers_mut().insert(
                        CACHE_CONTROL,
                        HeaderValue::from_static(cache_control_for_path(&path)),
                    );
                    response.headers_mut().insert(
                        HeaderName::from_static("x-database-backend"),
                        HeaderValue::from_static(database_backend),
                    );
                    response
                        .headers_mut()
                        .insert(X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));
                    Ok(response)
                }
            })
            .wrap(
                middleware::DefaultHeaders::new()
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("Referrer-Policy", "strict-origin-when-cross-origin"))
                    .add((
                        "Strict-Transport-Security",
                        "max-age=31536000; includeSubDomains; preload",
                    ))
                    .add(("Permissions-Policy", "camera=(), microphone=(), geolocation=()")),
            )
            .route("/health", web::get().to(health))
            .app_data(app_verification_db)
            .configure(verification::configure)
            .default_service(web::route().to(redirect_or_info))
    })
    .workers(worker_count)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
