// ------------------------------
// Imports
// ------------------------------
import { Express } from "express";                    // Type import for Express app instance
import { rateLimit } from "express-rate-limit";       // Middleware for controlling repeated requests
import { ApiErrorTooManyRequests } from "@api/res/error"; // Custom error class for 429 Too Many Requests

// ------------------------------
// Rate Limiter Configuration
// ------------------------------
// This module defines global and route-specific request limiters to prevent
// brute-force attacks, abuse, or accidental request flooding.

// ------------------------------
// Main Configuration Function
// ------------------------------
// Attaches rate limiters to the Express application.
// - ApiLimiter applies globally to all endpoints.
// - AuthLimiter applies more strict limits to authentication routes.
export const configureLimiter = ({ app }: { app: Express }) => {
    // Apply global rate limiting to all API routes
    app.use(ApiLimiter);

    // Apply stricter limits to authentication-related routes
    app.use(/^\/api\/v1\/auth/, AuthLimiter);
};

// ------------------------------
// Global API Limiter
// ------------------------------
// Applies to all incoming requests.
// Allows up to 300 requests per 15-minute window per IP.
export const ApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // Time window: 15 minutes
    limit: 300,                // Max requests per IP within the window
    standardHeaders: "draft-8", // Use standardized rate-limit headers
    legacyHeaders: false,      // Disable old X-RateLimit-* headers
    ipv6Subnet: 56,            // Define IPv6 subnet mask for grouping requests
    handler: () => {
        // Throw a standardized 429 error when limit is exceeded
        throw new ApiErrorTooManyRequests({});
    }
    // Optionally: configure a Redis store to track and block abusive IPs
});

// ------------------------------
// Strict Auth Limiter
// ------------------------------
// Applies only to authentication endpoints (login, register, etc.).
// This prevents brute-force attempts on login routes.
export const AuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // Time window: 15 minutes
    limit: 20,                 // Stricter limit: only 20 requests per IP
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: () => {
        // Return a Too Many Requests error when limit exceeded
        throw new ApiErrorTooManyRequests({});
    }
});

