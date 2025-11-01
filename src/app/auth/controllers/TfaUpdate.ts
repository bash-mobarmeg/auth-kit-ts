import { RequestHandler } from "express";
import { parse as uuidParse } from "uuid";

import { ApiError, ApiErrorConflict, ApiErrorInternalServerError } from "@api/res/error";
import { OK_STATUS } from "@api/res/status";

import { TFASecret } from "@common/types";

import { SqlError } from "@db/errors";
import { sqlFindTfaByField } from "@app/auth/db/globals";
import { ApiUpdateTfaSecret } from "@app/auth/services";

import { GenerateTFASecretKey } from "@utils/auth/tfa";

import { logger } from "@logger";


// POST /auth/2fa/update
export const TFAUpdateController: RequestHandler = async (req, res) => {
    try {

        const user = req.session!.user!;

        if (!user.tfa.enabled) {
            throw new ApiErrorConflict({
                message: "User doesn't have 2FA verification"
            });
        }

        const userIdBin = Buffer.from(uuidParse(user.client_id));
        const oldTfaSecret = await sqlFindTfaByField({
            field: "user_id",
            value: userIdBin
        });

        if (!oldTfaSecret) {
            throw new ApiErrorConflict({
                message: "User doesn't have 2FA key yet"
            });
        }

        // Create temporary secret until it it verified
        const tfaTmpSecret = GenerateTFASecretKey();

        const tfaObject: TFASecret = {
            hex: tfaTmpSecret.hex,
            ascii: tfaTmpSecret.ascii,
            base64: tfaTmpSecret.base32,
            otpauth_url: tfaTmpSecret.otpauth_url,
        };

        await ApiUpdateTfaSecret({ userId: user.client_id, newSecret: tfaObject });

        return res
            .status(OK_STATUS)
            .json({
                msg: "2FA key updated",
                tfa_secret: {
                    base64: tfaObject.base64,
                    otpauth_url: tfaObject.otpauth_url
                }
            });

    } catch (err) {

        if (err instanceof ApiError) {
            throw err;
        }

        if (err instanceof SqlError) {
            throw new ApiErrorInternalServerError({});
        }

        logger.error(err);
        throw new ApiErrorInternalServerError({});
    }
}

