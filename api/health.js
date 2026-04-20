import {
    ensureDatabaseReady,
    sendErrorResponse,
    sendMethodNotAllowed,
    sendText
} from "./_lib/verification.js";

export default async function handler(req, res) {
    if (!["GET", "HEAD"].includes(req.method)) {
        sendMethodNotAllowed(res, ["GET", "HEAD"]);
        return;
    }

    try {
        await ensureDatabaseReady();

        if (req.method === "HEAD") {
            res.statusCode = 200;
            res.setHeader("Cache-Control", "no-store");
            res.end();
            return;
        }

        sendText(res, 200, "ok");
    } catch (error) {
        sendErrorResponse(res, error);
    }
}
