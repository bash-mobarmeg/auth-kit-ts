import { RequestHandler } from "express";
import { ZodError } from "zod";

import { ApiError, ApiErrorConflict, ApiErrorInternalServerError, ApiErrorUnauthorized, ApiErrorUnprocessableEntity } from "@api/res/error";
import { OK_STATUS } from "@api/res/status";

import { SqlError } from "@db/.";
import { sqlFindTfaByField } from "@app/auth/db/globals";
import { tfaCodeSchema } from "@app/auth/schema";
import { LoginBody } from "@app/auth/types";

import { verifyTFACode } from "@utils/auth/tfa";
import { validateBodyType } from "@utils/validation/body";

import { logger } from "@logger";


// POST /auth/2fa/validate
export const TFAValidateController: RequestHandler<
    unknown,
    unknown,
    LoginBody,
    unknown
> = async (req, res) => {
    try {

        const body = req.body;

        validateBodyType(body, "object");

        // Validate request body
        const zodResult = tfaCodeSchema.parse(body);
        const { token } = zodResult;

        const user = req.session!.user!;

        if (!user.tfa.enabled) {
            throw new ApiErrorConflict({
                message: "User doesn't have 2FA verification"
            });
        }

        const userTfa = await sqlFindTfaByField({
            field: "user_id",
            value: user.client_id
        });

        if (!userTfa) {
            throw new ApiErrorUnauthorized({});
        }

        const validTfaCode = verifyTFACode(userTfa.secret, token);

        if (!validTfaCode) {
            throw new ApiErrorUnauthorized({});
        }

        return res
            .status(OK_STATUS)
            .json({
                msg: "2FA validation",
                tfaValid: validTfaCode
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

        if (err instanceof SqlError) {
            throw new ApiErrorInternalServerError({});
        }

        logger.error(err);
        throw new ApiErrorInternalServerError({});
    }
}

