// ------------------------------
// Imports
// ------------------------------
import path from "path";
import crypto from "crypto";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { RESOURCES_PATH } from "@common/index";

// ------------------------------
// AES + HMAC Hybrid Cryptor
// ------------------------------
// This class provides symmetric encryption (AES-256-GCM) combined with
// message authentication (HMAC-SHA256) for integrity verification.
//
// - AES-256-GCM provides confidentiality and integrity for ciphertexts.
// - HMAC adds a second layer of tamper detection.
// - Keys are stored persistently as binary files in the resources directory.
// - Implements a singleton pattern to ensure key reuse across the app.
export class AesHmacCryptor {
    // --------------------------
    // Singleton Instance
    // --------------------------
    static instance: AesHmacCryptor;

    // --------------------------
    // Key Storage Paths
    // --------------------------
    aesKeyPath: string = path.join(RESOURCES_PATH, "session-keys/aes-key.bin");   // 32-byte AES key (AES-256)
    hmacKeyPath: string = path.join(RESOURCES_PATH, "session-keys/hmac-key.bin"); // 64-byte HMAC key

    // --------------------------
    // Loaded or Generated Keys
    // --------------------------
    aesKey: Buffer = this.loadOrCreateKey(this.aesKeyPath, 32); // AES-256 key
    hmacKey: Buffer = this.loadOrCreateKey(this.hmacKeyPath, 64); // HMAC-SHA256 key

    constructor() {
        // Enforce singleton pattern — only one instance of AesHmacCryptor should exist.
        if (AesHmacCryptor.instance) return AesHmacCryptor.instance;
        AesHmacCryptor.instance = this;
    }

    // --------------------------
    // Load or Create Key
    // --------------------------
    // Loads a key from the filesystem if it exists; otherwise, generates
    // a new random key and persists it to disk.
    loadOrCreateKey(path: string, length: number): Buffer {
        if (existsSync(path)) return readFileSync(path);

        const key = crypto.randomBytes(length);
        writeFileSync(path, key);
        return key;
    }

    // --------------------------
    // Encrypt + Sign
    // --------------------------
    // Encrypts a UTF-8 string using AES-256-GCM and then signs the resulting ciphertext
    // using HMAC-SHA256 for tamper detection.
    //
    // Returns a single string composed of:
    //   base64(ciphertext_with_iv_authTag) + "." + base64(hmac_signature)
    encrypt(plaintext: string): string {
        // Generate a random 12-byte IV (recommended length for GCM)
        const iv = crypto.randomBytes(12);

        // Initialize AES-GCM cipher
        const cipher = crypto.createCipheriv("aes-256-gcm", this.aesKey, iv);

        // Encrypt plaintext
        let encrypted = cipher.update(plaintext, "utf8");
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // Retrieve authentication tag
        const authTag = cipher.getAuthTag();

        // Combine IV + authTag + ciphertext for transport
        const ciphertext = Buffer.concat([iv, authTag, encrypted]).toString("base64");

        // Compute HMAC signature over ciphertext
        const hmac = crypto.createHmac("sha256", this.hmacKey);
        hmac.update(ciphertext);
        const signature = hmac.digest("base64");

        // Return as single string (safe for cookies or tokens)
        return `${ciphertext}.${signature}`;
    }

    // --------------------------
    // Verify + Decrypt
    // --------------------------
    // Verifies HMAC signature and decrypts ciphertext if valid.
    // Throws an error if tampering is detected.
    decrypt(encryptedPayload: string): string {
        const parts = encryptedPayload.split(".");

        if (parts.length !== 2) {
            throw new Error("Invalid payload format — signature missing or malformed.");
        }

        const [ciphertext, signature] = parts;

        // Step 1: Verify HMAC signature to ensure integrity
        const hmac = crypto.createHmac("sha256", this.hmacKey);
        hmac.update(ciphertext);
        const expectedSignature = hmac.digest("base64");

        // Use timing-safe comparison to avoid timing attacks
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            throw new Error("Invalid signature — data has been tampered with.");
        }

        // Step 2: Decode and decrypt the ciphertext
        const data = Buffer.from(ciphertext, "base64");
        const iv = data.subarray(0, 12);         // First 12 bytes: IV
        const authTag = data.subarray(12, 28);   // Next 16 bytes: Auth tag
        const encrypted = data.subarray(28);     // Remaining bytes: Ciphertext

        const decipher = crypto.createDecipheriv("aes-256-gcm", this.aesKey, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, undefined, "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }
}

