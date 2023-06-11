import { StatusCodes } from "http-status-codes";

export class HttpError extends Error {
    constructor(code, message, ...args) {
        super(message, ...args);
        this.code = code;
    }
}

export function errorHandler(err, _req, res, _next) {
    if (typeof err == "number") {
        res.status(err);
        switch (err) {
            case StatusCodes.UNAUTHORIZED:
                return res.json({ error: "Authentication failed" });
            case StatusCodes.NOT_FOUND:
                return res.json({ error: "404 page not found" });
        }
    } else if (err instanceof HttpError) {
        return res.status(err.code).json({ error: err.message });
    }
    console.debug(err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
}