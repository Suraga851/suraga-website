use crate::verification::models::{NumberStatus, PhoneNumber};
use chrono::{DateTime, Utc};
use postgres::{Client, NoTls, Row};
use rusqlite::{params, Connection};
use std::error::Error;
use std::sync::Mutex;

type DbResult<T> = Result<T, Box<dyn Error + Send + Sync>>;

enum Backend {
    Sqlite(Mutex<Connection>),
    Postgres(Mutex<Client>),
}

pub struct Database {
    backend: Backend,
}

impl Database {
    /// Create a new database connection.
    pub fn new(path_or_url: &str) -> DbResult<Self> {
        if is_postgres_url(path_or_url) {
            let mut client = Client::connect(path_or_url, NoTls)?;
            init_postgres_schema(&mut client)?;
            return Ok(Self {
                backend: Backend::Postgres(Mutex::new(client)),
            });
        }

        let conn = Connection::open(path_or_url)?;
        init_sqlite_schema(&conn)?;
        Ok(Self {
            backend: Backend::Sqlite(Mutex::new(conn)),
        })
    }

    pub fn backend_label(&self) -> &'static str {
        match self.backend {
            Backend::Sqlite(_) => "sqlite",
            Backend::Postgres(_) => "postgres",
        }
    }

    /// Register a new phone number.
    pub fn register_number(
        &self,
        phone: String,
        country: String,
        notes: Option<String>,
    ) -> DbResult<PhoneNumber> {
        match &self.backend {
            Backend::Sqlite(conn) => {
                let conn = conn.lock().unwrap();
                let now = Utc::now().to_rfc3339();

                conn.execute(
                    "INSERT INTO phone_numbers (phone, country, status, notes, created_at, updated_at)
                     VALUES (?1, ?2, 'pending', ?3, ?4, ?5)",
                    params![phone, country, notes, now, now],
                )?;

                let id = conn.last_insert_rowid();

                Ok(PhoneNumber {
                    id,
                    phone,
                    country,
                    status: NumberStatus::Pending,
                    notes,
                    created_at: parse_timestamp(&now),
                    updated_at: parse_timestamp(&now),
                })
            }
            Backend::Postgres(client) => {
                let mut client = client.lock().unwrap();
                let row = client.query_one(
                    "INSERT INTO phone_numbers (phone, country, status, notes, created_at, updated_at)
                     VALUES ($1, $2, 'pending', $3, NOW(), NOW())
                     RETURNING id, phone, country, status, notes, created_at, updated_at",
                    &[&phone, &country, &notes],
                )?;

                Ok(map_postgres_phone_number(&row))
            }
        }
    }

    /// Get all phone numbers.
    pub fn get_all_numbers(&self) -> DbResult<Vec<PhoneNumber>> {
        match &self.backend {
            Backend::Sqlite(conn) => {
                let conn = conn.lock().unwrap();
                let mut stmt = conn.prepare(
                    "SELECT id, phone, country, status, notes, created_at, updated_at
                     FROM phone_numbers
                     ORDER BY created_at DESC",
                )?;

                let numbers = stmt
                    .query_map([], map_sqlite_phone_number)?
                    .collect::<Result<Vec<_>, _>>()?;

                Ok(numbers)
            }
            Backend::Postgres(client) => {
                let mut client = client.lock().unwrap();
                let rows = client.query(
                    "SELECT id, phone, country, status, notes, created_at, updated_at
                     FROM phone_numbers
                     ORDER BY created_at DESC",
                    &[],
                )?;

                Ok(rows.iter().map(map_postgres_phone_number).collect())
            }
        }
    }

    /// Get a single phone number by ID.
    pub fn get_number(&self, id: i64) -> DbResult<Option<PhoneNumber>> {
        match &self.backend {
            Backend::Sqlite(conn) => {
                let conn = conn.lock().unwrap();
                let mut stmt = conn.prepare(
                    "SELECT id, phone, country, status, notes, created_at, updated_at
                     FROM phone_numbers
                     WHERE id = ?1",
                )?;

                let mut rows = stmt.query(params![id])?;

                if let Some(row) = rows.next()? {
                    Ok(Some(map_sqlite_phone_number(row)?))
                } else {
                    Ok(None)
                }
            }
            Backend::Postgres(client) => {
                let mut client = client.lock().unwrap();
                let row = client.query_opt(
                    "SELECT id, phone, country, status, notes, created_at, updated_at
                     FROM phone_numbers
                     WHERE id = $1",
                    &[&id],
                )?;

                Ok(row.as_ref().map(map_postgres_phone_number))
            }
        }
    }

    /// Update number status to verified.
    pub fn mark_verified(&self, id: i64) -> DbResult<Option<PhoneNumber>> {
        match &self.backend {
            Backend::Sqlite(conn) => {
                let conn = conn.lock().unwrap();
                let now = Utc::now().to_rfc3339();

                let rows_affected = conn.execute(
                    "UPDATE phone_numbers SET status = 'verified', updated_at = ?1 WHERE id = ?2",
                    params![now, id],
                )?;

                drop(conn);

                if rows_affected > 0 {
                    self.get_number(id)
                } else {
                    Ok(None)
                }
            }
            Backend::Postgres(client) => {
                let mut client = client.lock().unwrap();
                let row = client.query_opt(
                    "UPDATE phone_numbers
                     SET status = 'verified', updated_at = NOW()
                     WHERE id = $1
                     RETURNING id, phone, country, status, notes, created_at, updated_at",
                    &[&id],
                )?;

                Ok(row.as_ref().map(map_postgres_phone_number))
            }
        }
    }

    /// Delete a phone number.
    pub fn delete_number(&self, id: i64) -> DbResult<bool> {
        match &self.backend {
            Backend::Sqlite(conn) => {
                let conn = conn.lock().unwrap();
                let rows_affected =
                    conn.execute("DELETE FROM phone_numbers WHERE id = ?1", params![id])?;
                Ok(rows_affected > 0)
            }
            Backend::Postgres(client) => {
                let mut client = client.lock().unwrap();
                let rows_affected =
                    client.execute("DELETE FROM phone_numbers WHERE id = $1", &[&id])?;
                Ok(rows_affected > 0)
            }
        }
    }

    /// Get number by phone.
    pub fn get_by_phone(&self, phone: &str) -> DbResult<Option<PhoneNumber>> {
        match &self.backend {
            Backend::Sqlite(conn) => {
                let conn = conn.lock().unwrap();
                let mut stmt = conn.prepare(
                    "SELECT id, phone, country, status, notes, created_at, updated_at
                     FROM phone_numbers
                     WHERE phone = ?1",
                )?;

                let mut rows = stmt.query(params![phone])?;

                if let Some(row) = rows.next()? {
                    Ok(Some(map_sqlite_phone_number(row)?))
                } else {
                    Ok(None)
                }
            }
            Backend::Postgres(client) => {
                let mut client = client.lock().unwrap();
                let row = client.query_opt(
                    "SELECT id, phone, country, status, notes, created_at, updated_at
                     FROM phone_numbers
                     WHERE phone = $1",
                    &[&phone],
                )?;

                Ok(row.as_ref().map(map_postgres_phone_number))
            }
        }
    }
}

fn is_postgres_url(value: &str) -> bool {
    let value = value.trim().to_ascii_lowercase();
    value.starts_with("postgres://") || value.starts_with("postgresql://")
}

fn init_sqlite_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS phone_numbers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL UNIQUE,
            country TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone ON phone_numbers(phone)",
        [],
    )?;

    Ok(())
}

fn init_postgres_schema(client: &mut Client) -> Result<(), postgres::Error> {
    client.batch_execute(
        "
        CREATE TABLE IF NOT EXISTS phone_numbers (
            id BIGSERIAL PRIMARY KEY,
            phone TEXT NOT NULL UNIQUE,
            country TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone ON phone_numbers(phone);
        ",
    )
}

fn parse_timestamp(value: &str) -> DateTime<Utc> {
    value.parse().unwrap_or_else(|_| Utc::now())
}

fn map_sqlite_phone_number(row: &rusqlite::Row<'_>) -> rusqlite::Result<PhoneNumber> {
    let created_at: String = row.get(5)?;
    let updated_at: String = row.get(6)?;

    Ok(PhoneNumber {
        id: row.get(0)?,
        phone: row.get(1)?,
        country: row.get(2)?,
        status: NumberStatus::from(row.get::<_, String>(3)?),
        notes: row.get(4)?,
        created_at: parse_timestamp(&created_at),
        updated_at: parse_timestamp(&updated_at),
    })
}

fn map_postgres_phone_number(row: &Row) -> PhoneNumber {
    PhoneNumber {
        id: row.get(0),
        phone: row.get(1),
        country: row.get(2),
        status: NumberStatus::from(row.get::<_, String>(3)),
        notes: row.get(4),
        created_at: row.get(5),
        updated_at: row.get(6),
    }
}
