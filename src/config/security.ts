// ------------------------------
// Imports
// ------------------------------
import { Express } from "express";          // Type import for Express app instance
import { HelmetMiddleware } from "@config"; // Helmet middleware for security headers

// ------------------------------
// Security Configuration
// ------------------------------
// This function applies core security middleware (Helmet) to the Express app.
// Helmet helps secure the app by setting various HTTP headers,
// protecting against common vulnerabilities like XSS, clickjacking, and MIME-type sniffing.
export const configureSecurity = ({ app }: { app: Express }) => {
    // Attach Helmet middleware globally
    app.use(HelmetMiddleware);
};

