// ------------------------------
// Imports
// ------------------------------
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";                   // For standard HMAC-signed JWTs
import { EncryptJWT, importPKCS8, importSPKI, jwtDecrypt } from "jose";       // For RSA-based encrypted JWEs
import { RESOURCES_PATH } from "@common/constants";                            // Resource directory
import { generateKeyPairSync } from "crypto";                                  // Generate RSA key pair
import path from "path";
import fs from "fs";
import { ProviderType } from "@db/schema";                                     // Custom enum for provider types

// Environment secret for HMAC-based tokens
const secret = process.env.JWT_SECRET!;

// ------------------------------
// Keypair Generation Utility
// ------------------------------
// Generates a new 4096-bit RSA keypair for JWE (asymmetric) encryption.
// Keys are stored persistently in /resources/jwt-keys.
const GenerateNewJwtKeys = () => {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
        modulusLength: 4096, // 4096-bit RSA key for high security
        publicKeyEncoding: {
            type: "spki",    // Standard public key format
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs8",   // Standard private key format
            format: "pem",
        },
    });

    // Persist keys to disk for reuse
    fs.writeFileSync(path.join(RESOURCES_PATH, "jwt-keys/private.pem"), privateKey);
    fs.writeFileSync(path.join(RESOURCES_PATH, "jwt-keys/public.pem"), publicKey);
};

// ------------------------------
// JWT / JWE Token Management Class
// ------------------------------
// Supports both symmetric (HMAC) and asymmetric (RSA) token operations.
// - HMAC: fast, local verification, uses shared secret.
// - RSA/JWE: encrypted payload, higher security, private/public separation.
export class JwtToken {
    private publicKey: string | null = null;   // RSA public key for encryption
    private privateKey: string | null = null;  // RSA private key for decryption

    constructor() {
        this.initKeys = this.initKeys.bind(this);
    }

    // --------------------------
    // Load RSA keys into memory
    // --------------------------
    // Reads key files from disk and caches them for encryption/decryption.
    async initKeys() {
        const privateKey = fs.readFileSync(path.join(RESOURCES_PATH, "jwt-keys/private.pem"), "utf8");
        const publicKey = fs.readFileSync(path.join(RESOURCES_PATH, "jwt-keys/public.pem"), "utf8");
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    // --------------------------
    // Generate Encrypted JWE Token (RSA)
    // --------------------------
    // Uses the JOSE library to create a compact JWE with AES-GCM content encryption
    // and RSA-OAEP key wrapping for confidentiality.
    async generateEncrypted(payload: CustomJwtPayload): Promise<string> {
        await this.initKeys();

        if (!this.publicKey) {
            throw new JwtSecretError();
        }

        // Build an encrypted JWT (JWE)
        const encryptedToken = await new EncryptJWT(payload)
            .setProtectedHeader({ alg: "RSA-OAEP", enc: "A256GCM" })  // Strong asymmetric + symmetric encryption
            .setIssuedAt()
            .setIssuer("app-auth")
            .setSubject("auth")
            .setAudience("my-client")
            .setExpirationTime("1d")
            .setJti("unique-jti-123")                                // Unique token ID for replay protection
            .encrypt(await importSPKI(this.publicKey, "RSA-OAEP"));

        return encryptedToken;
    }

    // --------------------------
    // Verify & Decrypt JWE Token
    // --------------------------
    // Decrypts a JWE using the RSA private key and validates the claims.
    async verifyEncrypted(token: string): Promise<CustomJwtPayload | null> {
        await this.initKeys();

        if (!this.privateKey) {
            throw new JwtSecretError();
        }

        try {
            const { payload } = await jwtDecrypt(
                token,
                await importPKCS8(this.privateKey, "RSA-OAEP"),
                {
                    clockTolerance: 5, // Allow small clock skew
                    issuer: "app-auth",
                    audience: "my-client",
                }
            );

            return payload as CustomJwtPayload;
        } catch {
            // Return null for any decryption/validation error
            return null;
        }
    }

    // --------------------------
    // Generate Standard HMAC JWT
    // --------------------------
    // Uses shared secret (HS256) for faster, lightweight token signing.
    async generate(payload: CustomJwtPayload): Promise<string> {
        if (!secret) {
            throw new JwtSecretError();
        }

        const options: SignOptions = {
            algorithm: "HS256",
            expiresIn: "1d",
            issuer: "app-auth",
            subject: "auth",
            audience: "my-client",
            jwtid: "unique-jti-123"
        };

        return jwt.sign(payload, secret, options);
    }

    // --------------------------
    // Verify Standard JWT (HMAC)
    // --------------------------
    // Verifies token integrity and signature using the shared secret.
    verify(token: string): boolean {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new JwtSecretError();

        try {
            jwt.verify(token, secret);
            return true;
        } catch {
            return false;
        }
    }

    // --------------------------
    // Decode Standard JWT
    // --------------------------
    // Decodes token and returns payload if valid; throws if invalid or expired.
    decode(token: string): CustomJwtPayload {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new JwtSecretError();

        return jwt.verify(token, secret) as CustomJwtPayload;
    }
}

// ------------------------------
// Custom Error for Missing Secrets
// ------------------------------
export class JwtSecretError extends Error {
    constructor() {
        super("JwtSecretError");
        this.name = "JwtSecretError";
    }
}

// ------------------------------
// Custom JWT Payload Definition
// ------------------------------
// Extends the standard JWT payload with authentication and provider metadata.
interface CustomJwtPayload extends JwtPayload {
    client_id: string; // Unique client identifier
    role: string;      // User role (e.g., admin, user)
    provider: {
        provider: ProviderType; // e.g., "local", "google", "github"
        id: string;             // Provider-specific ID
        completed: boolean;     // Whether provider registration is complete
    };
    tfa: {
        enabled: boolean;       // Whether two-factor authentication is enabled
        authenticated: boolean; // Whether the current session is 2FA-authenticated
    };
}

