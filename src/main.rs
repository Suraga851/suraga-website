use actix_files::{Files, NamedFile};
use actix_web::dev::{fn_service, Service, ServiceRequest};
use actix_web::http::header::{HeaderValue, CACHE_CONTROL};
use actix_web::{middleware, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use std::env;

#[derive(Clone)]
struct AppConfig {
    contact_endpoint: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeConfig {
    contact_endpoint: String,
}

async fn health() -> impl Responder {
    HttpResponse::Ok().body("ok")
}

async fn runtime_config(config: web::Data<AppConfig>) -> impl Responder {
    HttpResponse::Ok().json(RuntimeConfig {
        contact_endpoint: config.contact_endpoint.clone(),
    })
}

fn is_html_route(path: &str) -> bool {
    if path == "/" || path.ends_with(".html") {
        return true;
    }

    // Requests without a file extension are served by the SPA fallback.
    let last_segment = path.rsplit('/').next().unwrap_or_default();
    !last_segment.contains('.')
}

fn cache_control_for_path(path: &str) -> &'static str {
    if path == "/health" {
        return "no-store";
    }

    if is_html_route(path) {
        return "public, max-age=0, must-revalidate";
    }

    if path.starts_with("/css/") || path.starts_with("/js/") || path.starts_with("/assets/images/")
    {
        return "public, max-age=31536000, immutable";
    }

    if path.starts_with("/assets/docs/") || path.ends_with(".pdf") {
        return "public, max-age=604800, stale-while-revalidate=86400";
    }

    if path == "/sitemap.xml" || path == "/robots.txt" || path == "/config.json" {
        return "public, max-age=3600, stale-while-revalidate=86400";
    }

    "public, max-age=86400"
}

fn csp_policy() -> String {
    "default-src 'self'; \
     script-src 'self' 'unsafe-inline'; \
     style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; \
     font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; \
     img-src 'self' data:; \
     connect-src 'self' https://formsubmit.co; \
     frame-src 'self'; \
     object-src 'none'; \
     base-uri 'self'; \
     form-action 'self' https://formsubmit.co;"
        .to_string()
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
        contact_endpoint: env::var("CONTACT_FORM_ENDPOINT")
            .unwrap_or_else(|_| "https://formsubmit.co/ajax/suragaelzibaer@gmail.com".to_string()),
    };
    let csp = csp_policy();

    println!("Server starting at http://0.0.0.0:{port}");
    println!("Worker processes: {worker_count}");
    println!("Serving static files from ./public");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(app_config.clone()))
            .wrap(middleware::Logger::default())
            .wrap(middleware::Compress::default())
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
                    .add(("X-Frame-Options", "DENY"))
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("Referrer-Policy", "strict-origin-when-cross-origin"))
                    .add((
                        "Strict-Transport-Security",
                        "max-age=31536000; includeSubDomains; preload",
                    ))
                    .add((
                        "Permissions-Policy",
                        "camera=(), microphone=(), geolocation=()",
                    ))
                    .add(("Content-Security-Policy", csp.clone())),
            )
            .route("/health", web::get().to(health))
            .route("/config.json", web::get().to(runtime_config))
            .service(
                Files::new("/", "./public")
                    .index_file("index.html")
                    .prefer_utf8(true)
                    .default_handler(fn_service(|req: ServiceRequest| async {
                        let file = NamedFile::open_async("./public/index.html").await?;
                        let response = file.into_response(req.request());
                        Ok(req.into_response(response))
                    })),
            )
    })
    .workers(worker_count)
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
