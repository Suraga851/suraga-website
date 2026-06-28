import { readJsonBody, sendJson, sendErrorResponse, sendMethodNotAllowed, ApiError, isAllowed } from "./_lib/verification.js";

// HTML-escape user input before interpolating into the email body to prevent
// content injection (e.g. a malicious <script> in the message field).
const escapeHtml = (value) =>
    String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

// Strip CR/LF from header-bound fields to prevent SMTP header injection.
const stripNewlines = (value) => String(value).replace(/[\r\n]/g, " ").trim();

const MAX_FIELD_LENGTHS = { name: 120, email: 254, message: 5000, inquiryType: 100 };

const truncateField = (value, max) =>
    typeof value === "string" && value.length > max ? value.slice(0, max) : value;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        sendMethodNotAllowed(res, ["POST"]);
        return;
    }

    try {
        // Rate limit by client IP. Falls back gracefully to in-memory when Redis is unset.
        const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
            || req.headers["x-real-ip"]
            || "unknown";
        if (!(await isAllowed(`contact:${ip}`))) {
            throw new ApiError(429, "Too many submissions. Please try again later.");
        }

        const body = await readJsonBody(req);
        const { name, email, message, inquiryType } = body;

        // Honeypot: bots fill hidden fields. Real users never send "website".
        // Accept the request silently (200) so bots don't learn to drop the field.
        if (body.website && String(body.website).trim()) {
            sendJson(res, 200, { success: true, message: "Email sent successfully" });
            return;
        }

        // Validation
        if (!name || typeof name !== "string" || !name.trim()) {
            throw new ApiError(400, "Name is required");
        }
        if (!email || typeof email !== "string" || !email.trim()) {
            throw new ApiError(400, "Email is required");
        }
        if (!message || typeof message !== "string" || !message.trim()) {
            throw new ApiError(400, "Message is required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            throw new ApiError(400, "Invalid email address");
        }

        // Sanitize: cap lengths, strip newlines from header-bound values, then
        // HTML-escape everything that goes into the email body.
        const cleanName = truncateField(stripNewlines(name), MAX_FIELD_LENGTHS.name);
        const cleanEmail = truncateField(stripNewlines(email), MAX_FIELD_LENGTHS.email);
        const cleanInquiry = truncateField(
            typeof inquiryType === "string" ? stripNewlines(inquiryType) : "",
            MAX_FIELD_LENGTHS.inquiryType
        );
        const cleanMessage = truncateField(message.trim(), MAX_FIELD_LENGTHS.message);

        const toEmail = process.env.CONTACT_EMAIL || "suragaelzibaer@gmail.com";
        const subject = `[Contact Form] ${cleanInquiry || "General Inquiry"} from ${cleanName}`;

        const htmlContent = `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a></p>
            <p><strong>Inquiry Type:</strong> ${escapeHtml(cleanInquiry || "General Inquiry")}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${escapeHtml(cleanMessage)}</p>
        `;

        const textContent = `
New Contact Form Submission
Name: ${cleanName}
Email: ${cleanEmail}
Inquiry Type: ${cleanInquiry || "General Inquiry"}
Message:
${cleanMessage}
        `.trim();

        // Email dispatch
        if (process.env.RESEND_API_KEY) {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: "Suraga Website <onboarding@resend.dev>",
                    to: toEmail,
                    reply_to: email.trim(),
                    subject: subject,
                    html: htmlContent,
                    text: textContent
                })
            });

            if (!response.ok) {
                const errBody = await response.text();
                console.error("Resend API error:", errBody);
                throw new Error(`Resend API failed: ${response.status}`);
            }
        } else if (process.env.SENDGRID_API_KEY) {
            const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`
                },
                body: JSON.stringify({
                    personalizations: [{
                        to: [{ email: toEmail }]
                    }],
                    from: { email: "no-reply@suraga-website.vercel.app" },
                    reply_to: { email: email.trim() },
                    subject: subject,
                    content: [
                        {
                            type: "text/plain",
                            value: textContent
                        },
                        {
                            type: "text/html",
                            value: htmlContent
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errBody = await response.text();
                console.error("SendGrid API error:", errBody);
                throw new Error(`SendGrid API failed: ${response.status}`);
            }
        } else {
            console.warn("Contact form submitted, but no email provider is configured (RESEND_API_KEY or SENDGRID_API_KEY).");
            console.log("Form payload:", body);
            
            if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") {
                throw new ApiError(500, "Server email configuration is missing. Please set RESEND_API_KEY in Vercel.");
            }
        }

        sendJson(res, 200, { success: true, message: "Email sent successfully" });
    } catch (error) {
        sendErrorResponse(res, error);
    }
}
