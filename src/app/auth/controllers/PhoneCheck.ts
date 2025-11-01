import { RequestHandler } from "express";
import { ZodError } from "zod";

import { OK_STATUS } from "@api/res/status";
import { ApiError, ApiErrorConflict, ApiErrorInternalServerError, ApiErrorUnprocessableEntity } from "@api/res/error";

import { sqlFindUserByField } from "@app/auth/db/globals";
import { phoneNumberCheckSchema } from "@app/auth/schema";
import { validateBodyType } from "@utils/validation/body";
import { PhoneNumberCheckBody } from "@app/auth/types";

import { logger } from "@logger";


// POST /auth/check/phone
export const PhoneCheckController: RequestHandler<
    unknown,
    unknown,
    PhoneNumberCheckBody,
    unknown
> = async (req, res) => {
    try {

        const body = req.body;

        validateBodyType(body, "object");

        // Validate request body
        const zodResult = phoneNumberCheckSchema.parse(body);
        const { phoneNumber } = zodResult;

        const user = await sqlFindUserByField({
            field: "phone_number",
            value: phoneNumber
        });

        if (user) {
            throw new ApiErrorConflict({
                message: "Phone number already exists"
            });
        }

        return res
            .status(OK_STATUS)
            .json({
                msg: "Valid phone number",
            });

    } catch (err) {

        if (err instanceof ApiError) {
            throw err;
        }

        if (err instanceof ZodError) {
            throw new ApiErrorUnprocessableEntity({
                message: err.issues[0].message
            });
        }

        logger.error(err);
        throw new ApiErrorInternalServerError({});
    }
}

