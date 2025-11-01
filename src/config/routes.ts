// ------------------------------
// Imports
// ------------------------------
import { Express } from "express";          // Type import for Express app instance

// ------------------------------
// Routers
// ------------------------------
// Import the authentication router which handles all auth-related endpoints (login, register, etc.)
import AuthRouter from "@app/auth/routers/router";

// ------------------------------
// Route Configuration
// ------------------------------
// Attaches all API routes to the Express application.
// In this setup, all authentication routes are prefixed with `/api/v1`.
export const configureRoutes = ({ app }: { app: Express }) => {
    // Mount the authentication routes under versioned API path
    app.use("/api/v1", AuthRouter);
};

