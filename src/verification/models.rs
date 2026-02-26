use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Status of a phone number
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum NumberStatus {
    Pending,
    Verified,
    Expired,
}

impl Default for NumberStatus {
    fn default() -> Self {
        NumberStatus::Pending
    }
}

impl std::fmt::Display for NumberStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            NumberStatus::Pending => write!(f, "pending"),
            NumberStatus::Verified => write!(f, "verified"),
            NumberStatus::Expired => write!(f, "expired"),
        }
    }
}

impl From<String> for NumberStatus {
    fn from(s: String) -> Self {
        match s.as_str() {
            "verified" => NumberStatus::Verified,
            "expired" => NumberStatus::Expired,
            _ => NumberStatus::Pending,
        }
    }
}

/// A registered phone number for WhatsApp verification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhoneNumber {
    pub id: i64,
    pub phone: String,
    pub country: String,
    pub status: NumberStatus,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Request to register a new number
#[derive(Debug, Deserialize)]
pub struct RegisterNumberRequest {
    pub phone: String,
    pub country: String,
    pub notes: Option<String>,
}

/// Response for number registration
#[derive(Debug, Serialize)]
pub struct RegisterNumberResponse {
    pub id: i64,
    pub phone: String,
    pub status: NumberStatus,
    pub message: String,
}

/// TextNow guide information
#[derive(Debug, Serialize)]
pub struct TextNowGuide {
    pub title: String,
    pub description: String,
    pub steps: Vec<GuideStep>,
    pub download_links: Vec<DownloadLink>,
}

#[derive(Debug, Serialize)]
pub struct GuideStep {
    pub step_number: u32,
    pub title: String,
    pub description: String,
}

#[derive(Debug, Serialize)]
pub struct DownloadLink {
    pub platform: String,
    pub url: String,
}
