use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

// ── Database row (maps directly from Postgres TEXT column) ──

#[derive(Debug, sqlx::FromRow)]
pub struct PhoneNumberRow {
    pub id: i64,
    pub phone: String,
    pub country: String,
    pub status: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<PhoneNumberRow> for PhoneNumber {
    fn from(row: PhoneNumberRow) -> Self {
        Self {
            id: row.id,
            phone: row.phone,
            country: row.country,
            status: row.status.into(),
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

// ── API models ──

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum NumberStatus {
    Pending,
    Verified,
    Expired,
}

impl Default for NumberStatus {
    fn default() -> Self {
        Self::Pending
    }
}

impl std::fmt::Display for NumberStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pending => write!(f, "pending"),
            Self::Verified => write!(f, "verified"),
            Self::Expired => write!(f, "expired"),
        }
    }
}

impl From<String> for NumberStatus {
    fn from(s: String) -> Self {
        match s.as_str() {
            "verified" => Self::Verified,
            "expired" => Self::Expired,
            _ => Self::Pending,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhoneNumber {
    pub id: i64,
    pub phone: String,
    pub country: String,
    pub status: NumberStatus,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub phone: String,
    pub country: String,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterResponse {
    pub id: i64,
    pub phone: String,
    pub status: NumberStatus,
    pub message: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TextNowGuide {
    pub title: String,
    pub description: String,
    pub steps: Vec<GuideStep>,
    pub download_links: Vec<DownloadLink>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GuideStep {
    pub step_number: u32,
    pub title: String,
    pub description: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadLink {
    pub platform: String,
    pub url: String,
}
