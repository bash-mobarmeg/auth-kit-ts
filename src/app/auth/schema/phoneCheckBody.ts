import { z } from "zod";
import { isValidPhoneNumber } from "@utils/validation";


export const phoneNumberCheckSchema = z.object({
    phoneNumber: z
        .string("Phone number is required")
        .refine(isValidPhoneNumber, { message: "Please enter a valid phone number" })
});

