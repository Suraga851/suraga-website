import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool = null;
let schemaReadyPromise = null;

if (DATABASE_URL) {
    pool = new Pool({
        connectionString: DATABASE_URL,
        max: 5
    });
    attachDatabasePool(pool);
}

const TEXTNOW_GUIDE = {
    title: "Get a Free Phone Number",
    description: "Follow these steps to get a free US/Canada phone number from TextNow for WhatsApp verification.",
    steps: [
        {
            stepNumber: 1,
            title: "Download TextNow App",
            description: "Download the TextNow app from the App Store (iOS) or Google Play Store (Android), or visit textnow.com on your computer."
        },
        {
            stepNumber: 2,
            title: "Create an Account",
            description: "Sign up for a free TextNow account using your email address."
        },
        {
            stepNumber: 3,
            title: "Choose Your Number",
            description: "TextNow will automatically assign you a free phone number. You can also search for available numbers in your preferred area code."
        },
        {
            stepNumber: 4,
            title: "Verify Your Number",
            description: "TextNow may ask you to verify your account via email. Complete the verification process."
        },
        {
            stepNumber: 5,
            title: "Enter Number Below",
            description: "Once you have your TextNow number, enter it in the form below to track it for WhatsApp verification."
        },
        {
            stepNumber: 6,
            title: "Verify on WhatsApp",
            description: "Open WhatsApp, go to Settings > Account > Change Number, and enter your TextNow number. WhatsApp will send a verification code to your TextNow number."
        },
        {
            stepNumber: 7,
            title: "Complete Verification",
            description: "Check your TextNow messages for the verification code and enter it in WhatsApp. Your number will be successfully verified!"
        }
    ],
    downloadLinks: [
        {
            platform: "iOS",
            url: "https://apps.apple.com/us/app/textnow-text-calls-voicemail/id314905291"
        },
        {
            platform: "Android",
            url: "https://play.google.com/store/apps/details?id=com.textnow.android"
        },
        {
            platform: "Web",
            url: "https://www.textnow.com/"
        }
    ]
};

export class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
    }
}

export function getTextNowGuide() {
    return TEXTNOW_GUIDE;
}

export function getRequestPathname(req) {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const proto = req.headers["x-forwarded-proto"] || "http";
    return new URL(req.url, `${proto}://${host}`).pathname;
}

export async function readJsonBody(req) {
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
        return req.body;
    }

    if (typeof req.body === "string") {
        return parseJson(req.body);
    }

    if (Buffer.isBuffer(req.body)) {
        return parseJson(req.body.toString("utf8"));
    }

    const chunks = [];

    await new Promise((resolve, reject) => {
        req.on("data", (chunk) => {
            chunks.push(Buffer.from(chunk));
        });
        req.on("end", resolve);
        req.on("error", reject);
    });

    if (chunks.length === 0) {
        return {};
    }

    return parseJson(Buffer.concat(chunks).toString("utf8"));
}

function parseJson(rawBody) {
    if (!rawBody.trim()) {
        return {};
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        throw new ApiError(400, "Invalid JSON body");
    }
}

export function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(payload));
}

export function sendText(res, statusCode, body) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(body);
}

export function sendNoContent(res) {
    res.statusCode = 204;
    res.setHeader("Cache-Control", "no-store");
    res.end();
}

export function sendMethodNotAllowed(res, allowedMethods) {
    res.setHeader("Allow", allowedMethods.join(", "));
    sendJson(res, 405, { error: "Method not allowed" });
}

export function sendErrorResponse(res, error) {
    if (error instanceof ApiError) {
        sendJson(res, error.statusCode, { error: error.message });
        return;
    }

    if (isDatabaseUnavailableError(error)) {
        console.error(error);
        sendJson(res, 503, { error: "Verification database is unavailable. Check DATABASE_URL." });
        return;
    }

    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
}

export async function ensureDatabaseReady() {
    if (!pool) {
        throw new ApiError(503, "Verification database is not configured. Set DATABASE_URL in Vercel.");
    }

    if (!schemaReadyPromise) {
        schemaReadyPromise = initializeSchema().catch((error) => {
            schemaReadyPromise = null;
            throw error;
        });
    }

    await schemaReadyPromise;
    return pool;
}

async function initializeSchema() {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS phone_numbers (
                id BIGSERIAL PRIMARY KEY,
                phone TEXT NOT NULL UNIQUE,
                country TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_phone_numbers_phone
            ON phone_numbers (phone);
        `);
    } finally {
        client.release();
    }
}

export async function listNumbers() {
    const db = await ensureDatabaseReady();
    const result = await db.query(`
        SELECT
            id,
            phone,
            country,
            status,
            notes,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM phone_numbers
        ORDER BY created_at DESC
    `);

    return result.rows.map(serializePhoneNumber);
}

export async function getNumber(id) {
    const normalizedId = parseId(id);
    const db = await ensureDatabaseReady();
    const result = await db.query(
        `
            SELECT
                id,
                phone,
                country,
                status,
                notes,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            FROM phone_numbers
            WHERE id = $1
        `,
        [normalizedId]
    );

    if (result.rowCount === 0) {
        throw new ApiError(404, "Number not found");
    }

    return serializePhoneNumber(result.rows[0]);
}

export async function registerNumber(payload) {
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
    const country = typeof payload.country === "string" ? payload.country.trim().toUpperCase() : "";
    const notes = typeof payload.notes === "string" ? payload.notes.trim() : "";

    if (phone.length < 7) {
        throw new ApiError(400, "Phone number must be at least 7 characters");
    }

    if (!country) {
        throw new ApiError(400, "Country is required");
    }

    const db = await ensureDatabaseReady();

    try {
        const result = await db.query(
            `
                INSERT INTO phone_numbers (phone, country, status, notes, created_at, updated_at)
                VALUES ($1, $2, 'pending', $3, NOW(), NOW())
                RETURNING id, phone, status
            `,
            [phone, country, notes || null]
        );

        return {
            id: Number(result.rows[0].id),
            phone: result.rows[0].phone,
            status: result.rows[0].status,
            message: "Number registered successfully"
        };
    } catch (error) {
        if (error?.code === "23505") {
            throw new ApiError(409, "Phone number already registered");
        }

        throw error;
    }
}

export async function markNumberVerified(id) {
    const normalizedId = parseId(id);
    const db = await ensureDatabaseReady();
    const result = await db.query(
        `
            UPDATE phone_numbers
            SET status = 'verified', updated_at = NOW()
            WHERE id = $1
            RETURNING
                id,
                phone,
                country,
                status,
                notes,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `,
        [normalizedId]
    );

    if (result.rowCount === 0) {
        throw new ApiError(404, "Number not found");
    }

    return serializePhoneNumber(result.rows[0]);
}

export async function deleteNumber(id) {
    const normalizedId = parseId(id);
    const db = await ensureDatabaseReady();
    const result = await db.query("DELETE FROM phone_numbers WHERE id = $1", [normalizedId]);

    if (result.rowCount === 0) {
        throw new ApiError(404, "Number not found");
    }
}

function parseId(value) {
    const id = Number.parseInt(String(value), 10);

    if (!Number.isInteger(id) || id < 1) {
        throw new ApiError(400, "Number id must be a positive integer");
    }

    return id;
}

function serializePhoneNumber(row) {
    return {
        id: Number(row.id),
        phone: row.phone,
        country: row.country,
        status: row.status,
        notes: row.notes,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt)
    };
}

function toIsoString(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }

    return new Date(value).toISOString();
}

function isDatabaseUnavailableError(error) {
    if (!error || typeof error !== "object") {
        return false;
    }

    const transientCodes = new Set([
        "ENOTFOUND",
        "ECONNREFUSED",
        "ETIMEDOUT",
        "EHOSTUNREACH",
        "57P01",
        "57P02",
        "57P03"
    ]);

    if (transientCodes.has(error.code)) {
        return true;
    }

    const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
    return (
        message.includes("connection terminated unexpectedly") ||
        message.includes("the database system is starting up") ||
        message.includes("failed to connect")
    );
}
