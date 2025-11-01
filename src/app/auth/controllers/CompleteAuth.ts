import { parse as uuidParse } from "uuid";

import { OK_STATUS } from "@common/index";
import { RequestHandler } from "express";

import { ApiError, ApiErrorConflict, ApiErrorInternalServerError, ApiErrorMethodNotAllowed, ApiErrorUnauthorized } from "@api/res/error";

import { CompleteBody } from "@app/auth/types";
import { completeSchema } from "@app/auth/schema";
import { sqlFindUserByField } from "@app/auth/db/globals";

import { SqlError, SqlPool } from "@db/.";

import { logger } from "@logger";
import { validateBodyType } from "@utils/validation/body";


// POST /auth/signup/complete
export const CompleteAuthController: RequestHandler<
    unknown,
    unknown,
    CompleteBody,
    unknown
> = async (req, res) => {
    try {
        const body = req.body;

        validateBodyType(body, "object");

        const userId = req.session!.user!.client_id;
        const provider = req.session!.user!.provider.provider;
        const authCompleted = req.session!.user!.provider.completed;

        if (provider === "local") {
            throw new ApiErrorMethodNotAllowed({});
        }

        if (authCompleted !== undefined && authCompleted === true) {
            throw new ApiErrorMethodNotAllowed({});
        }

        if (!userId) {
            throw new ApiErrorUnauthorized({});
        }

        const userIdBin = Buffer.from(uuidParse(userId));

        const zodResult = completeSchema.parse(body);
        const { username } = zodResult;

        const user = await sqlFindUserByField({ field: "id", value: userIdBin });

        if (user?.username) {
            throw new ApiErrorConflict({
                message: "Username already exists"
            });
        }

        await SqlPool.query(
            `UPDATE users
                SET username = ?
                WHERE id = ?`,
            [username, userIdBin]
        );

        return res
            .status(OK_STATUS)
            .json({
                message: "Username updated"
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

