import { OtpCodeExistsError } from "@common/errors";
import { logger } from "@logger";            // Custom logging utility for consistent error reporting
import { redisClient } from "@utils/redis";  // Redis client instance used for caching OTP codes

/**
 * Represents parameters required to handle email-based OTP operations.
 */
interface OtpEmailParams {
    email: string; // User’s email address (unique identifier)
    code: string;  // One-time password (OTP) code
}

/**
 * Represents parameters required to handle phone-based OTP operations.
 */
interface OtpPhoneParams {
    phoneNumber: string; // User’s phone number (unique identifier)
    code: string;        // One-time password (OTP) code
}

/**
 * Stores a phone-based OTP in Redis.
 *
 * - Uses the key pattern: `{phoneNumber}:otp:phone`
 * - Prevents duplicate active OTPs for the same number
 * - Automatically expires after 10 minutes
 *
 * @param phoneNumber - The recipient’s phone number
 * @param code - The OTP code to store
 * @returns {Promise<boolean>} `true` if stored successfully, `false` if an error occurs
 * @throws {OtpCodeExistsError} If an active OTP already exists for this phone number
 */
export const addOtpPhone = async ({ phoneNumber, code }: OtpPhoneParams): Promise<boolean> => {
    try {
        // Check if an OTP already exists for this phone number
        const codeExists = await redisClient.get(`${phoneNumber}:otp:phone`);
        if (codeExists) {
            throw new OtpCodeExistsError("Code already exists", { phoneNumber });
        }

        // Store the OTP with a 10-minute expiration time
        await redisClient.set(`${phoneNumber}:otp:phone`, code, 'EX', 60 * 10);
        return true;
    } catch (err) {
        // Log the error for debugging and monitoring purposes
        logger.error(err);
        return false;
    }
}

/**
 * Stores an email-based OTP in Redis.
 *
 * - Uses the key pattern: `{email}:otp:email`
 * - Prevents duplicate active OTPs for the same email
 * - Automatically expires after 10 minutes
 *
 * @param email - The recipient’s email address
 * @param code - The OTP code to store
 * @returns {Promise<boolean>} `true` if stored successfully, `false` if an error occurs
 * @throws {OtpCodeExistsError} If an active OTP already exists for this email
 */
export const addOtpEmail = async ({ email, code }: OtpEmailParams): Promise<boolean> => {
    try {
        // Check if an OTP already exists for this email
        const codeExists = await redisClient.get(`${email}:otp:email`);
        if (codeExists) {
            throw new OtpCodeExistsError("Code already exists", { email });
        }

        // Store the OTP with a 10-minute expiration time
        await redisClient.set(`${email}:otp:email`, code, 'EX', 60 * 10);
        return true;
    } catch (err) {
        // Log the error for debugging and monitoring purposes
        logger.error(err);
        return false;
    }
}

/**
 * Verifies whether the provided OTP matches the stored email OTP.
 *
 * @param email - The email address to verify
 * @param code - The OTP code to check
 * @returns {Promise<boolean>} `true` if the OTP matches, otherwise `false`
 */
export const verifyOtpEmail = async ({ email, code }: OtpEmailParams): Promise<boolean> => {
    try {
        // Retrieve the stored OTP for this email
        const result = await redisClient.get(`${email}:otp:email`);
        return result === code;
    } catch (err) {
        logger.error(err);
        return false;
    }
}

/**
 * Verifies whether the provided OTP matches the stored phone OTP.
 *
 * @param phoneNumber - The phone number to verify
 * @param code - The OTP code to check
 * @returns {Promise<boolean>} `true` if the OTP matches, otherwise `false`
 */
export const verifyOtpPhone = async ({ phoneNumber, code }: OtpPhoneParams): Promise<boolean> => {
    try {
        // Retrieve the stored OTP for this phone number
        const result = await redisClient.get(`${phoneNumber}:otp:phone`);
        return result === code;
    } catch (err) {
        logger.error(err);
        return false;
    }
}

