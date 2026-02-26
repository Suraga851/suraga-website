use crate::verification::models::{NumberStatus, PhoneNumber};
use chrono::Utc;
use rusqlite::{params, Connection, Result};
use std::path::Path;
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    /// Create a new database connection
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.init_schema()?;
        Ok(db)
    }

    /// Initialize database schema
    fn init_schema(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
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

        // Create index for faster lookups
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_phone_numbers_phone ON phone_numbers(phone)",
            [],
        )?;

        Ok(())
    }

    /// Register a new phone number
    pub fn register_number(
        &self,
        phone: String,
        country: String,
        notes: Option<String>,
    ) -> Result<PhoneNumber> {
        let conn = self.conn.lock().unwrap();
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
            created_at: Utc::now(),
            updated_at: Utc::now(),
        })
    }

    /// Get all phone numbers
    pub fn get_all_numbers(&self) -> Result<Vec<PhoneNumber>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, phone, country, status, notes, created_at, updated_at 
             FROM phone_numbers 
             ORDER BY created_at DESC",
        )?;

        let numbers = stmt
            .query_map([], |row| {
                Ok(PhoneNumber {
                    id: row.get(0)?,
                    phone: row.get(1)?,
                    country: row.get(2)?,
                    status: NumberStatus::from(row.get::<_, String>(3)?),
                    notes: row.get(4)?,
                    created_at: row
                        .get::<_, String>(5)?
                        .parse()
                        .unwrap_or_else(|_| Utc::now()),
                    updated_at: row
                        .get::<_, String>(6)?
                        .parse()
                        .unwrap_or_else(|_| Utc::now()),
                })
            })?
            .collect::<Result<Vec<_>>>()?;

        Ok(numbers)
    }

    /// Get a single phone number by ID
    pub fn get_number(&self, id: i64) -> Result<Option<PhoneNumber>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, phone, country, status, notes, created_at, updated_at 
             FROM phone_numbers 
             WHERE id = ?1",
        )?;

        let mut rows = stmt.query(params![id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(PhoneNumber {
                id: row.get(0)?,
                phone: row.get(1)?,
                country: row.get(2)?,
                status: NumberStatus::from(row.get::<_, String>(3)?),
                notes: row.get(4)?,
                created_at: row
                    .get::<_, String>(5)?
                    .parse()
                    .unwrap_or_else(|_| Utc::now()),
                updated_at: row
                    .get::<_, String>(6)?
                    .parse()
                    .unwrap_or_else(|_| Utc::now()),
            }))
        } else {
            Ok(None)
        }
    }

    /// Update number status to verified
    pub fn mark_verified(&self, id: i64) -> Result<Option<PhoneNumber>> {
        let conn = self.conn.lock().unwrap();
        let now = Utc::now().to_rfc3339();

        let rows_affected = conn.execute(
            "UPDATE phone_numbers SET status = 'verified', updated_at = ?1 WHERE id = ?2",
            params![now, id],
        )?;

        if rows_affected > 0 {
            drop(conn);
            self.get_number(id)
        } else {
            Ok(None)
        }
    }

    /// Delete a phone number
    pub fn delete_number(&self, id: i64) -> Result<bool> {
        let conn = self.conn.lock().unwrap();
        let rows_affected = conn.execute("DELETE FROM phone_numbers WHERE id = ?1", params![id])?;
        Ok(rows_affected > 0)
    }

    /// Get number by phone
    pub fn get_by_phone(&self, phone: &str) -> Result<Option<PhoneNumber>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, phone, country, status, notes, created_at, updated_at 
             FROM phone_numbers 
             WHERE phone = ?1",
        )?;

        let mut rows = stmt.query(params![phone])?;

        if let Some(row) = rows.next()? {
            Ok(Some(PhoneNumber {
                id: row.get(0)?,
                phone: row.get(1)?,
                country: row.get(2)?,
                status: NumberStatus::from(row.get::<_, String>(3)?),
                notes: row.get(4)?,
                created_at: row
                    .get::<_, String>(5)?
                    .parse()
                    .unwrap_or_else(|_| Utc::now()),
                updated_at: row
                    .get::<_, String>(6)?
                    .parse()
                    .unwrap_or_else(|_| Utc::now()),
            }))
        } else {
            Ok(None)
        }
    }
}
