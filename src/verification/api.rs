use crate::verification::models::{
    DownloadLink, GuideStep, RegisterNumberRequest, RegisterNumberResponse, TextNowGuide,
};
use crate::verification::DbPool;
use actix_web::{web, HttpResponse, Result};

/// Get all registered phone numbers
pub async fn list_numbers(db: web::Data<DbPool>) -> Result<HttpResponse> {
    let db = db.lock().unwrap();
    match db.get_all_numbers() {
        Ok(numbers) => Ok(HttpResponse::Ok().json(numbers)),
        Err(e) => {
            log::error!("Failed to get numbers: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}

/// Get a single phone number by ID
pub async fn get_number(db: web::Data<DbPool>, id: web::Path<i64>) -> Result<HttpResponse> {
    let db = db.lock().unwrap();
    match db.get_number(id.into_inner()) {
        Ok(Some(number)) => Ok(HttpResponse::Ok().json(number)),
        Ok(None) => Ok(HttpResponse::NotFound().json("Number not found")),
        Err(e) => {
            log::error!("Failed to get number: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}

/// Register a new phone number
pub async fn register_number(
    db: web::Data<DbPool>,
    req: web::Json<RegisterNumberRequest>,
) -> Result<HttpResponse> {
    let db = db.lock().unwrap();

    // Validate phone number format (basic validation)
    let phone = req.phone.trim();
    if phone.len() < 7 {
        return Ok(HttpResponse::BadRequest().json("Invalid phone number"));
    }

    // Check if number already exists
    match db.get_by_phone(phone) {
        Ok(Some(_)) => {
            return Ok(HttpResponse::Conflict().json("Phone number already registered"));
        }
        Ok(None) => {
            // Proceed with registration
        }
        Err(e) => {
            log::error!("Failed to check existing number: {}", e);
            return Ok(HttpResponse::InternalServerError().json("Database error"));
        }
    }

    match db.register_number(
        phone.to_string(),
        req.country.clone(),
        req.notes.clone(),
    ) {
        Ok(number) => Ok(HttpResponse::Created().json(RegisterNumberResponse {
            id: number.id,
            phone: number.phone,
            status: number.status,
            message: "Number registered successfully".to_string(),
        })),
        Err(e) => {
            log::error!("Failed to register number: {}", e);
            Ok(HttpResponse::InternalServerError().json("Failed to register number"))
        }
    }
}

/// Mark a number as verified
pub async fn mark_verified(
    db: web::Data<DbPool>,
    id: web::Path<i64>,
) -> Result<HttpResponse> {
    let db = db.lock().unwrap();
    let number_id = id.into_inner();

    match db.mark_verified(number_id) {
        Ok(Some(number)) => Ok(HttpResponse::Ok().json(number)),
        Ok(None) => Ok(HttpResponse::NotFound().json("Number not found")),
        Err(e) => {
            log::error!("Failed to mark number as verified: {}", e);
            Ok(HttpResponse::InternalServerError().json("Failed to update status"))
        }
    }
}

/// Delete a phone number
pub async fn delete_number(
    db: web::Data<DbPool>,
    id: web::Path<i64>,
) -> Result<HttpResponse> {
    let db = db.lock().unwrap();
    let number_id = id.into_inner();

    match db.delete_number(number_id) {
        Ok(true) => Ok(HttpResponse::Ok().json("Number deleted successfully")),
        Ok(false) => Ok(HttpResponse::NotFound().json("Number not found")),
        Err(e) => {
            log::error!("Failed to delete number: {}", e);
            Ok(HttpResponse::InternalServerError().json("Failed to delete number"))
        }
    }
}

/// Get TextNow guide information
pub async fn get_textnow_guide() -> Result<HttpResponse> {
    let guide = TextNowGuide {
        title: "Get a Free Phone Number".to_string(),
        description: "Follow these steps to get a free US/Canada phone number from TextNow for WhatsApp verification.".to_string(),
        steps: vec![
            GuideStep {
                step_number: 1,
                title: "Download TextNow App".to_string(),
                description: "Download the TextNow app from the App Store (iOS) or Google Play Store (Android), or visit textnow.com on your computer.".to_string(),
            },
            GuideStep {
                step_number: 2,
                title: "Create an Account".to_string(),
                description: "Sign up for a free TextNow account using your email address.".to_string(),
            },
            GuideStep {
                step_number: 3,
                title: "Choose Your Number".to_string(),
                description: "TextNow will automatically assign you a free phone number. You can also search for available numbers in your preferred area code.".to_string(),
            },
            GuideStep {
                step_number: 4,
                title: "Verify Your Number".to_string(),
                description: "TextNow may ask you to verify your account via email. Complete the verification process.".to_string(),
            },
            GuideStep {
                step_number: 5,
                title: "Enter Number Below".to_string(),
                description: "Once you have your TextNow number, enter it in the form below to track it for WhatsApp verification.".to_string(),
            },
            GuideStep {
                step_number: 6,
                title: "Verify on WhatsApp".to_string(),
                description: "Open WhatsApp, go to Settings > Account > Change Number, and enter your TextNow number. WhatsApp will send a verification code to your TextNow number.".to_string(),
            },
            GuideStep {
                step_number: 7,
                title: "Complete Verification".to_string(),
                description: "Check your TextNow messages for the verification code and enter it in WhatsApp. Your number will be successfully verified!".to_string(),
            },
        ],
        download_links: vec![
            DownloadLink {
                platform: "iOS".to_string(),
                url: "https://apps.apple.com/us/app/textnow-text-calls-voicemail/id314905291".to_string(),
            },
            DownloadLink {
                platform: "Android".to_string(),
                url: "https://play.google.com/store/apps/details?id=com.textnow.android".to_string(),
            },
            DownloadLink {
                platform: "Web".to_string(),
                url: "https://www.textnow.com/".to_string(),
            },
        ],
    };

    Ok(HttpResponse::Ok().json(guide))
}
