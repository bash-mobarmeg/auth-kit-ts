// ------------------------------
// Core Dependencies
// ------------------------------
import Express from "express";          // Main Express framework
import BodyParser from "body-parser";   // Parses incoming request bodies (JSON, URL-encoded)
import CookieParser from "cookie-parser"; // Parses cookies attached to client requests
import Morgan from "morgan";            // HTTP request logger middleware
import dotenv from "dotenv";            // Loads environment variables from .env file

// ------------------------------
// Application Middlewares & Config
// ------------------------------
import { AuthMiddleware } from "@app/auth/middlewares";
import {
    configureSecurity,       // Sets up security headers (Helmet, CSP, etc.)
    configureRoutes,         // Loads and attaches app routes
    invalidUrlHandler,       // Handles 404 / unmatched routes
    FavIconController,       // Handles /favicon.ico requests
    ErrorHandler,            // Global error handling middleware
    configureLimiter          // Rate limiter (protects against brute-force or DoS)
} from "@config";

import { CookieSession } from "@utils/auth/cookie-session"; // Custom encrypted cookie session handler

// ------------------------------
// Environment Configuration
// ------------------------------
dotenv.config({ quiet: true, debug: false });

// ------------------------------
// Initialize Express App
// ------------------------------
const app = Express();

// ------------------------------
// Security Configuration
// ------------------------------
// Adds essential HTTP security headers (Helmet, CSP, etc.)
configureSecurity({ app });

// ------------------------------
// Rate Limiter
// ------------------------------
// Prevents abuse by limiting number of requests per IP
configureLimiter({ app });

// ------------------------------
// Request Logging
// ------------------------------
// Logs request method, URL, status, and response time to console
app.use(Morgan("dev"));

// ------------------------------
// Cookie Parser
// ------------------------------
// Parses cookies attached to incoming requests and
// makes them available under `req.cookies`
app.use(CookieParser());

// ------------------------------
// Body Parser
// ------------------------------
// Parses JSON and URL-encoded request bodies.
// Limits are set to prevent large payload attacks.
app.use(BodyParser.json({ limit: "2mb" }));
app.use(BodyParser.urlencoded({ extended: false, limit: "1mb" }));

// ------------------------------
// Cookie-based Session Handling
// ------------------------------
// Decrypts and validates cookies before passing them to session middleware.
// Provides persistent sessions with configurable lifespan.
app.use(CookieSession({
    name: "_session",
    domain: "localhost",
    path: "/",
    httpOnly: true,                          // Prevents client-side JS from accessing cookie
    secure: process.env.NODE_ENV === "production", // Use secure cookies only in production
    sameSite: "lax",                         // Helps mitigate CSRF attacks
    maxAge: 1000 * 60 * 60 * 24 * 7          // Session duration: 7 days
}));

// ------------------------------
// Authentication Middleware
// ------------------------------
// Decodes authentication tokens (if any) and attaches user data to res.locals
// Used to check if user has completed setup (e.g., set a username)
const auth = new AuthMiddleware();
app.use(auth.CheckUsername);

// ------------------------------
// Favicon Route
// ------------------------------
// Handles browser requests for the favicon explicitly
app.get("/favicon.ico", FavIconController);

// ------------------------------
// Route Configuration
// ------------------------------
// Dynamically loads and attaches all API and web routes
configureRoutes({ app });

// ------------------------------
// Global Error Handler
// ------------------------------
// Must be the last middleware: catches and formats all unhandled errors
app.use(ErrorHandler);

// ------------------------------
// Invalid URL Handler
// ------------------------------
// Handles requests to non-existent routes (returns 404)
app.use(invalidUrlHandler);

// ------------------------------
// Export Express App
// ------------------------------
export default app;

