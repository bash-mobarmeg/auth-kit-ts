import { z } from "zod";

export const completeSchema = z.object({
    username: z
        .string("Username is required")
        .min(3, { error: "Username must be at least 3 characters long" })
        .max(255, { error: "Username must not exceed 255 characters" }),
});
