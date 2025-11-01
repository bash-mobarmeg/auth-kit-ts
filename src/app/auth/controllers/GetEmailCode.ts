import { RequestHandler } from "express";

import { OK_STATUS } from "@api/res/status";
import { EmailSendError, OtpCodeExistsError } from "@common/errors";
import { ApiError, ApiErrorConflict, ApiErrorInternalServerError, ApiErrorUnprocessableEntity } from "@api/res/error";

import { ApiSendEmailOtpCode } from "@app/auth/services";
import { isValidEmail } from "@utils/validation";
import { generateRandomNumber } from "@utils/random";

import { logger } from "@logger";


// GET /auth/otp/email?email=user@gmail.com
export const GetEmailCodeController: RequestHandler = async (req, res) => {
    try {
        const email = req.query.email;

        if (!(
            email
            && typeof email === "string"
            && isValidEmail(email)
        )) {
            throw new ApiErrorUnprocessableEntity({
                message: "Invalid email address"
            })
        }

        const otpCode = generateRandomNumber(6);
        await ApiSendEmailOtpCode({ email, otpCode });

        return res
            .status(OK_STATUS)
            .json({
                msg: "Code sent",
            });

    } catch (err) {

        if (err instanceof ApiError) {
            throw err;
        }

        if (err instanceof OtpCodeExistsError) {
            throw new ApiErrorConflict({
                message: "Wait 10 minites"
            });
        }

        if (err instanceof EmailSendError) {
            throw new ApiErrorInternalServerError({});
        }

        logger.error(err);
        throw new ApiErrorInternalServerError({});
    }
}

