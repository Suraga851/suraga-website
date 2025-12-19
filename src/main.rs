use actix_files::{Files, NamedFile};
use actix_web::{middleware, App, HttpServer};
use actix_web::dev::{fn_service, ServiceRequest};
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();

    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .expect("PORT must be a number");
    println!("🚀 Server starting at http://0.0.0.0:{}", port);
    println!("📂 Serving static files from ./public");

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .wrap(middleware::Compress::default())
            .wrap(
                middleware::DefaultHeaders::new()
                    .add(("X-XSS-Protection", "1; mode=block"))
                    .add(("X-Frame-Options", "DENY"))
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("Referrer-Policy", "strict-origin-when-cross-origin"))
                    .add(("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self';"))
            )
            .service(
                Files::new("/", "./public")
                    .index_file("index.html")
                    .prefer_utf8(true)
                    .default_handler(fn_service(|req: ServiceRequest| async {
                        let (req, _) = req.into_parts();
                        let file = NamedFile::open_async("./public/index.html").await?;
                        let res = file.into_response(&req);
                        Ok(res)
                    }))
            )
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
