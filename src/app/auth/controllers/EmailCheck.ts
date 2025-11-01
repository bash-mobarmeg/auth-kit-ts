import { RequestHandler } from "express";
import { ZodError } from "zod";

import { OK_STATUS } from "@api/res/status";
import { ApiError, ApiErrorConflict, ApiErrorInternalServerError, ApiErrorUnprocessableEntity } from "@api/res/error";

import { sqlFindUserByField } from "@app/auth/db/globals";
import { emailCheckSchema } from "@app/auth/schema";
import { validateBodyType } from "@utils/validation/body";
import { EmailCheckBody } from "@app/auth/types";

import { logger } from "@logger";


// POST /auth/check/email
export const EmailCheckController: RequestHandler<
    unknown,
    unknown,
    EmailCheckBody,
    unknown
> = async (req, res) => {
    try {

        const body = req.body;

        validateBodyType(body, "object");

        // Validate request body
        const zodResult = emailCheckSchema.parse(body);
        const { email } = zodResult;

        const user = await sqlFindUserByField({
            field: "email",
            value: email
        });

        if (user) {
            throw new ApiErrorConflict({
                message: "Email address already exists"
            });
        }

        return res
            .status(OK_STATUS)
            .json({
                msg: "Valid email address",
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

