import { z } from "zod";
import { isValidEmail, isValidPhoneNumber } from "@utils/validation";


export const loginEmailSchema = z.object({
    email: z
        .string("Email is required")
        .refine(isValidEmail, { message: "Please entery a valid email address" }),

    password: z
        .string("Password is required")
        .min(6, "Invalid password")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),

});

export const loginPhoneSchema = z.object({
    phoneNumber: z
        .string("Phone number is required")
        .refine(isValidPhoneNumber, { message: "Please enter a valid phone number" }),

    password: z
        .string("Password is required")
        .min(6, "Invalid password")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),

});
