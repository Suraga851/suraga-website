use sqlx::{postgres::PgPoolOptions, PgPool};

use crate::error::AppError;
use crate::models::{PhoneNumber, PhoneNumberRow};

#[derive(Clone)]
pub struct Database {
    pool: PgPool,
}

impl Database {
    /// Connect to Postgres and ensure the schema exists.
    pub async fn new(database_url: &str) -> Result<Self, AppError> {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS phone_numbers (
                id          BIGSERIAL   PRIMARY KEY,
                phone       TEXT        NOT NULL UNIQUE,
                country     TEXT        NOT NULL,
                status      TEXT        NOT NULL DEFAULT 'pending',
                notes       TEXT,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_phone_numbers_phone
                ON phone_numbers (phone);
            "#,
        )
        .execute(&pool)
        .await?;

        tracing::info!("Database connected and schema verified");
        Ok(Self { pool })
    }

    pub async fn register_number(
        &self,
        phone: &str,
        country: &str,
        notes: Option<&str>,
    ) -> Result<PhoneNumber, AppError> {
        let row: PhoneNumberRow = sqlx::query_as(
            r#"
            INSERT INTO phone_numbers (phone, country, status, notes, created_at, updated_at)
            VALUES ($1, $2, 'pending', $3, NOW(), NOW())
            RETURNING id, phone, country, status, notes, created_at, updated_at
            "#,
        )
        .bind(phone)
        .bind(country)
        .bind(notes)
        .fetch_one(&self.pool)
        .await?;

        Ok(row.into())
    }

    pub async fn get_all_numbers(&self) -> Result<Vec<PhoneNumber>, AppError> {
        let rows: Vec<PhoneNumberRow> = sqlx::query_as(
            r#"
            SELECT id, phone, country, status, notes, created_at, updated_at
            FROM phone_numbers
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    pub async fn get_number(&self, id: i64) -> Result<Option<PhoneNumber>, AppError> {
        let row: Option<PhoneNumberRow> = sqlx::query_as(
            r#"
            SELECT id, phone, country, status, notes, created_at, updated_at
            FROM phone_numbers
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(Into::into))
    }

    pub async fn get_by_phone(&self, phone: &str) -> Result<Option<PhoneNumber>, AppError> {
        let row: Option<PhoneNumberRow> = sqlx::query_as(
            r#"
            SELECT id, phone, country, status, notes, created_at, updated_at
            FROM phone_numbers
            WHERE phone = $1
            "#,
        )
        .bind(phone)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(Into::into))
    }

    pub async fn mark_verified(&self, id: i64) -> Result<Option<PhoneNumber>, AppError> {
        let row: Option<PhoneNumberRow> = sqlx::query_as(
            r#"
            UPDATE phone_numbers
            SET status = 'verified', updated_at = NOW()
            WHERE id = $1
            RETURNING id, phone, country, status, notes, created_at, updated_at
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(Into::into))
    }

    pub async fn delete_number(&self, id: i64) -> Result<bool, AppError> {
        let result = sqlx::query("DELETE FROM phone_numbers WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }
}
