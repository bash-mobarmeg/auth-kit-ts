import { z } from "zod";

export const tfaCodeSchema = z.object({
    token: z
        .string("2FA code is required")
        .min(6, "Invalid 2FA code")
        .regex(/[0-9]/, "Invalid 2FA code pattern"),
});

