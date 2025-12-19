use actix_files::Files;
use actix_web::{middleware, App, HttpServer};
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
            // Enable logger middleware
            .wrap(middleware::Logger::default())
            // Enable compression for speed
            .wrap(middleware::Compress::default())
            // Serve static files from the "public" directory
            .service(
                Files::new("/", "./public")
                    .index_file("index.html")
                    .prefer_utf8(true)
            )
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
