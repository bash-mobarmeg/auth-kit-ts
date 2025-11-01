import { z } from "zod";
import { isValidEmail, isValidPhoneNumber } from "@utils/validation";


export const signupEmailSchema = z.object({
    username: z
        .string("Username is required")
        .min(3, { error: "Username must be at least 3 characters long" })
        .max(255, { error: "Username must not exceed 255 characters" }),

    email: z
        .string("Email is required")
        .refine(isValidEmail, { message: "Please entery a valid email address" }),

    code: z
        .string("Verfication code is required")
        .min(6, "Invalid verfication code"),

    password: z
        .string("Password is required")
        .min(6, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export const signupPhoneSchema = z.object({
    username: z
        .string("Username is required")
        .min(3, { error: "Username must be at least 3 characters long" })
        .max(255, { error: "Username must not exceed 255 characters" }),

    phoneNumber: z
        .string("Phone number is required")
        .refine(isValidPhoneNumber, { message: "Please enter a valid phone number" }),

    code: z
        .string("Verfication code is required")
        .min(6, "Invalid verfication code"),

    password: z
        .string("Password is required")
        .min(6, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});
