import { RequestHandler } from "express";

import { OK_STATUS } from "@common/constants";
import { ApiErrorInternalServerError } from "@api/res/error";

import { googleOAuthClient } from "@app/auth/google";

import { logger } from "@logger";


// GET /auth/google
export const GoogleRegisterController: RequestHandler = async (_, res) => {
    try {
        const url = googleOAuthClient.generateAuthUrl({
            access_type: "offline",
            scope: ["profile", "email"]
        });

        return res
            .status(OK_STATUS)
            .json({
                msg: "OAuth success",
                url: url
            });

    } catch (err) {
        logger.error(err);
        throw new ApiErrorInternalServerError({});
    }
}
