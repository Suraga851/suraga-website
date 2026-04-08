pub mod api;
pub mod db;
pub mod models;

use actix_web::web;

pub type DbPool = db::Database;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/verification")
            .route("/numbers", web::get().to(api::list_numbers))
            .route("/numbers", web::post().to(api::register_number))
            .route("/numbers/{id}", web::get().to(api::get_number))
            .route("/numbers/{id}/verify", web::post().to(api::mark_verified))
            .route("/numbers/{id}", web::delete().to(api::delete_number))
            .route("/textnow-guide", web::get().to(api::get_textnow_guide)),
    );
}
