import { readJsonBody, sendJson, sendErrorResponse, ApiError } from "./_lib/verification.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
    }

    try {
        const body = await readJsonBody(req);
        const { name, email, message, inquiryType } = body;

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

        const toEmail = process.env.CONTACT_EMAIL || "suragaelzibaer@gmail.com";
        const subject = `[Contact Form] ${inquiryType || "General Inquiry"} from ${name.trim()}`;
        
        const htmlContent = `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name.trim()}</p>
            <p><strong>Email:</strong> <a href="mailto:${email.trim()}">${email.trim()}</a></p>
            <p><strong>Inquiry Type:</strong> ${inquiryType || "General Inquiry"}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message.trim()}</p>
        `;

        const textContent = `
New Contact Form Submission
Name: ${name.trim()}
Email: ${email.trim()}
Inquiry Type: ${inquiryType || "General Inquiry"}
Message:
${message.trim()}
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
