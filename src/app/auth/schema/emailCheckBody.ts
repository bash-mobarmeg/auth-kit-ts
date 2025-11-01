import { z } from "zod";
import { isValidEmail } from "@utils/validation";


export const emailCheckSchema = z.object({
    email: z
        .string("Email is required")
        .refine(isValidEmail, { message: "Please entery a valid email address" }),
});

