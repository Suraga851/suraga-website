import {
    ApiError,
    deleteNumber,
    getNumber,
    getRequestPathname,
    getTextNowGuide,
    listNumbers,
    markNumberVerified,
    readJsonBody,
    registerNumber,
    sendErrorResponse,
    sendJson,
    sendMethodNotAllowed,
    sendNoContent
} from "../_lib/verification.js";

const API_PREFIX = "/api/verification";

export default async function handler(req, res) {
    if (req.method === "OPTIONS") {
        res.setHeader("Allow", "GET, POST, DELETE, OPTIONS");
        res.statusCode = 204;
        res.end();
        return;
    }

    const pathname = getRequestPathname(req);
    const relativePath = pathname.startsWith(API_PREFIX) ? pathname.slice(API_PREFIX.length) : pathname;
    const segments = relativePath.split("/").filter(Boolean);

    try {
        if (segments.length === 0) {
            if (req.method !== "GET") {
                sendMethodNotAllowed(res, ["GET", "OPTIONS"]);
                return;
            }

            sendJson(res, 200, {
                service: "suraga-verification-api",
                endpoints: [
                    "GET /api/verification/textnow-guide",
                    "GET /api/verification/numbers",
                    "POST /api/verification/numbers",
                    "GET /api/verification/numbers/:id",
                    "POST /api/verification/numbers/:id/verify",
                    "DELETE /api/verification/numbers/:id"
                ]
            });
            return;
        }

        if (segments.length === 1 && segments[0] === "textnow-guide") {
            if (req.method !== "GET") {
                sendMethodNotAllowed(res, ["GET", "OPTIONS"]);
                return;
            }

            sendJson(res, 200, getTextNowGuide());
            return;
        }

        if (segments.length === 1 && segments[0] === "numbers") {
            if (req.method === "GET") {
                sendJson(res, 200, await listNumbers());
                return;
            }

            if (req.method === "POST") {
                const payload = await readJsonBody(req);
                sendJson(res, 201, await registerNumber(payload));
                return;
            }

            sendMethodNotAllowed(res, ["GET", "POST", "OPTIONS"]);
            return;
        }

        if (segments.length === 2 && segments[0] === "numbers") {
            if (req.method === "GET") {
                sendJson(res, 200, await getNumber(segments[1]));
                return;
            }

            if (req.method === "DELETE") {
                await deleteNumber(segments[1]);
                sendNoContent(res);
                return;
            }

            sendMethodNotAllowed(res, ["GET", "DELETE", "OPTIONS"]);
            return;
        }

        if (segments.length === 3 && segments[0] === "numbers" && segments[2] === "verify") {
            if (req.method !== "POST") {
                sendMethodNotAllowed(res, ["POST", "OPTIONS"]);
                return;
            }

            sendJson(res, 200, await markNumberVerified(segments[1]));
            return;
        }

        throw new ApiError(404, "Endpoint not found");
    } catch (error) {
        sendErrorResponse(res, error);
    }
}
