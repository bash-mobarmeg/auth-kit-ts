// ------------------------------
// Imports
// ------------------------------
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ApiError } from "@api/res/error"; // Custom API error class for consistent error formatting

// ------------------------------
// Global Error Handler Middleware
// ------------------------------
// This middleware centralizes error handling for the entire app.
// It must be registered *after* all other routes and middleware.
// Express automatically passes any thrown or forwarded errors to this function.
export const ErrorHandler = (
    err: ErrorRequestHandler, // Incoming error object (could be custom or generic)
    _req: Request,            // Incoming HTTP request (unused in this handler)
    res: Response,            // HTTP response used to send error details
    _next: NextFunction       // Next middleware (unused here, as this ends the chain)
) => {
    // Handle known, structured API errors
    if (err instanceof ApiError) {
        // Return the formatted error JSON with its corresponding status code
        res.status(err.code).json(err.toJSON());
    } else {
        // Handle unexpected or unclassified errors
        res.status(500).json({
            error: {
                message: "Internal Server Error",
                code: 500,
                errorType: "InternalError"
            }
        });
    }
};

