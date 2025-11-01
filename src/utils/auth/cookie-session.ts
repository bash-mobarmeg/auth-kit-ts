// ------------------------------
// Imports
// ------------------------------
import { RequestHandler } from "express";                // Express middleware type
import { AesHmacCryptor } from ".";                      // Custom AES-HMAC encryption utility
import { ApiErrorInternalServerError } from "@api/res/error"; // Standardized API error class

// ------------------------------
// Cryptor Instance (Singleton)
// ------------------------------
// Reuse a single AesHmacCryptor instance across requests for efficiency.
const cryptor = new AesHmacCryptor();

// ------------------------------
// Cookie Session Options Interface
// ------------------------------
// Defines optional parameters for cookie configuration.
export interface CookieSessionOptions {
    name?: string;                        // Cookie name (default: _session)
    domain?: string;                      // Domain scope (default: localhost)
    path?: string;                        // Cookie path scope (default: "/")
    httpOnly?: boolean;                   // Prevent client-side JS access
    secure?: boolean;                     // Send only over HTTPS (enabled in production)
    sameSite?: "lax" | "strict" | "none"; // CSRF mitigation
    maxAge?: number;                      // Max cookie lifespan in ms
    expires?: Date;                       // Expiration time for cookies in date
}

// ------------------------------
// CookieSession Middleware Factory
// ------------------------------
// This middleware implements secure, encrypted session handling using cookies.
// - Decrypts session data from cookies at request start.
// - Re-encrypts and writes updated session data before the response ends.
// - Uses AES-256-GCM encryption + HMAC integrity verification.
export function CookieSession(options: CookieSessionOptions = {}): RequestHandler {
    // Merge provided options with defaults
    const {
        name = process.env.SESSION_NAME || "_session",
        domain = "localhost",
        path = "/",
        httpOnly = true,
        secure = process.env.NODE_ENV === "production",
        sameSite = "lax",
        maxAge = 1000 * 60 * 60 * 24 * 7, // Default: 7 days
        expires = new Date(Date.now())
    } = options;

    // Return configured middleware
    return (req, res, next) => {
        // --------------------------
        // DECRYPT (Read Cookie)
        // --------------------------
        try {
            const encrypted = req.cookies[name];

            if (encrypted) {
                try {
                    // Attempt to decrypt and parse JSON session data
                    const decrypted = cryptor.decrypt(encrypted);
                    req.session = JSON.parse(decrypted);
                } catch {
                    // Handle tampered or invalid session cookie
                    req.session = undefined;
                    console.warn("Invalid session cookie detected — clearing...");
                    res.clearCookie(name, { path, domain });
                }
            } else {
                req.session = undefined;
            }
        } catch (err) {
            // Critical error during session decryption
            console.error("Session decrypt error:", err);
            throw new ApiErrorInternalServerError({ message: "Invalid token" });
        }

        // --------------------------
        // ENCRYPT (Write Cookie)
        // --------------------------
        // Hook into Express’s `res.end()` to ensure session data is written
        // before the response is finalized.
        const originalEnd = res.end;
        res.end = function(...args: any[]) {
            try {
                if (req.session) {
                    // Serialize and encrypt session data
                    const encrypted = cryptor.encrypt(JSON.stringify(req.session));

                    // Write encrypted session cookie to response
                    res.cookie(name, encrypted, {
                        httpOnly,
                        secure,
                        sameSite,
                        path,
                        domain,
                        maxAge: req.session.maxAge || maxAge,
                        expires: req.session.expires || expires
                    });
                } else {
                    // No active session — clear any existing cookie
                    res.clearCookie(name, { path, domain });
                }
            } catch (err) {
                console.error("Session encrypt error:", err);
            }

            // Restore original response end behavior
            return originalEnd.apply(this, args as any);
        };

        // Continue middleware chain
        next();
    };
}

