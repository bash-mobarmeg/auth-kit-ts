import { RequestHandler } from "express";
import { parse as uuidParse } from "uuid";

import { ApiError, ApiErrorInternalServerError } from "@api/res/error";
import { OK_STATUS } from "@api/res/status";

import { TFASecret } from "@common/types";

import { SqlError } from "@db/.";
import { sqlFindTfaByField } from "@app/auth/db/globals";
import { ApiAddTfaSecret, ApiUpdateTfaSecret } from "@app/auth/services";

import { JwtToken } from "@utils/auth";
import { GenerateTFASecretKey } from "@utils/auth/tfa";

import { logger } from "@logger";


// POST /auth/2fa/register
export const TFARegisterController: RequestHandler = async (req, res) => {
    try {

        const user = req.session!.user!;

        // Create temporary secret until it it verified
        const tfaTmpSecret = GenerateTFASecretKey();

        const tfaObject: TFASecret = {
            hex: tfaTmpSecret.hex,
            ascii: tfaTmpSecret.ascii,
            base64: tfaTmpSecret.base32,
            otpauth_url: tfaTmpSecret.otpauth_url,
        };

        const userIdBin = Buffer.from(uuidParse(user.client_id));
        const tfaData = await sqlFindTfaByField({
            field: "user_id",
            value: userIdBin
        });

        if (tfaData) {
            await ApiUpdateTfaSecret({ userId: user.client_id, newSecret: tfaObject });
        } else {
            await ApiAddTfaSecret({ userId: user.client_id, secret: tfaObject });
        }

        const newToken = await new JwtToken().generateEncrypted({
            client_id: user.client_id,
            role: user.role,
            provider: user.provider,
            tfa: {
                enabled: true,
                authenticated: user.tfa.authenticated
            }
        });

        return res
            .status(OK_STATUS)
            .json({
                msg: "Two factor authenticate secret key",
                newToken,
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

