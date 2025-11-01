import { RequestHandler } from "express";

import { OK_STATUS } from "@api/res/status";
import { OtpCodeExistsError, PhoneSendError } from "@common/errors";
import { ApiError, ApiErrorConflict, ApiErrorInternalServerError, ApiErrorUnprocessableEntity } from "@api/res/error";

import { ApiSendPhoneOtpCode } from "@app/auth/services";
import { isValidPhoneNumber } from "@utils/validation";
import { generateRandomNumber } from "@utils/random";

import { logger } from "@logger";


// GET /auth/otp/phone?phone=+20
export const GetPhoneCodeController: RequestHandler = async (req, res) => {
    try {
        const phoneNumber = req.query.phone;

        if (!(
            phoneNumber
            && typeof phoneNumber === "string"
            && isValidPhoneNumber(phoneNumber
            ))) {
            throw new ApiErrorUnprocessableEntity({
                message: "Invalid phone number"
            })
        }

        const code = generateRandomNumber(6);
        await ApiSendPhoneOtpCode({ phoneNumber, otpCode: code });

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

        if (err instanceof PhoneSendError) {
            throw new ApiErrorInternalServerError({});
        }

        logger.error(err);
        throw new ApiErrorInternalServerError({});
    }
}

