import { z } from "zod";

export const updatePasswordSchema = z.object({
    oldPassword: z
        .string("Old password is required")
        .min(6, "Invalid password")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),

    newPassword: z
        .string("New password is required")
        .min(6, "Invalid password")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
}).superRefine((data, ctx) => {
    if (data.oldPassword === data.newPassword) {
        ctx.addIssue({
            path: ["newPassword"],
            code: z.ZodIssueCode.custom,
            message: "Two passwords are same",
        });
    }
});

