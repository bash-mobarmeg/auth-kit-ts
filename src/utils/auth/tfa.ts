// ------------------------------
// Imports
// ------------------------------
import speakeasy from "speakeasy"; // TOTP (Time-based One-Time Password) utility

// ------------------------------
// Generate TFA Secret Key
// ------------------------------
// Creates a new unique 2FA secret for a user.
// The key is encoded in Base32 and should be stored securely in the database.
//
// Returns an object containing multiple encodings:
// - ascii: plain text form
// - hex: hexadecimal form
// - base32: Base32-encoded (recommended for QR and storage)
// - otpauth_url: URL for QR code generation (Google Authenticator compatible)
export const GenerateTFASecretKey = () => {
    const secretKey = speakeasy.generateSecret({ length: 20 }); // 20 bytes ≈ 160 bits
    return secretKey;
};

// ------------------------------
// Verify TFA Code
// ------------------------------
// Validates a time-based one-time password (TOTP) entered by the user.
// Uses the shared Base32 secret to verify the code within the current time step.
//
// Arguments:
// - user_key: Base32-encoded secret assigned to the user.
// - tfaCode: 6-digit numeric token from the user's authenticator app.
//
// Returns:
// - true if the code is valid within the time window.
// - false otherwise.
export const verifyTFACode = (user_key: string, tfaCode: string) => {
    const verified = speakeasy.totp.verify({
        secret: user_key,
        encoding: "base32",
        token: tfaCode,
    });

    return verified;
};

