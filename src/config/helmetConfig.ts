// ------------------------------
// Imports
// ------------------------------
import Helmet from "helmet"; // Security middleware that sets various HTTP headers

// ------------------------------
// Helmet Middleware Configuration
// ------------------------------
// This function returns a configured instance of Helmet with enhanced security policies.
// Helmet helps protect the app from well-known web vulnerabilities by setting safe defaults
// and applying headers such as CSP, HSTS, and X-Frame-Options.
export const HelmetMiddleware = () => {
    return Helmet({
        // --------------------------
        // General Security Settings
        // --------------------------
        // Keeps standard Helmet protections active (e.g., X-Content-Type-Options, X-DNS-Prefetch-Control)
        xDownloadOptions: true,

        // --------------------------
        // Content Security Policy (CSP)
        // --------------------------
        // Restricts sources of content to prevent XSS, data injection, and clickjacking.
        contentSecurityPolicy: {
            useDefaults: true, // Start with Helmet's secure defaults
            directives: {
                "default-src": ["'self'"],            // Allow all content only from this origin
                "script-src": ["'self'"],             // Allow scripts only from same origin
                "style-src": ["'self'"],              // Allow styles only from same origin
                "img-src": ["'self'", "data:"],       // Permit images from self and inline data URIs
                "font-src": ["'self'"],               // Restrict font loading to same origin
                "object-src": ["'none'"],             // Disallow Flash, Silverlight, etc.
                "base-uri": ["'self'"],               // Prevent attackers from changing <base> URLs
                "frame-ancestors": ["'none'"],        // Prevent this app from being iframed
                "form-action": ["'self'"],            // Restrict where forms can POST data
                "upgrade-insecure-requests": [],       // Force browsers to use HTTPS for all requests
            },
        },

        // --------------------------
        // Additional Security Headers
        // --------------------------
        referrerPolicy: { policy: "no-referrer" },              // Hide referrer information entirely
        crossOriginEmbedderPolicy: true,                        // Isolate resources for better cross-origin protection
        crossOriginOpenerPolicy: true,                          // Prevent shared browsing contexts
        crossOriginResourcePolicy: { policy: "same-origin" },   // Restrict cross-origin resource access
        hsts: {                                                  // HTTP Strict Transport Security (forces HTTPS)
            maxAge: 63072000, // 2 years in seconds
            includeSubDomains: true,
            preload: true
        },
    });
};

