import { RequestHandler } from "express";
import argon2 from "argon2";
import { parse as uuidParse } from "uuid";

import { OK_STATUS } from "@api/res/status";
import { ApiError, ApiErrorBadRequest, ApiErrorInternalServerError, ApiErrorUnauthorized } from "@api/res/error";

import { updatePasswordSchema } from "@app/auth/schema";
import { sqlFindUserByField } from "@app/auth/db/globals";
import { ApiUpdatePassword } from "@app/auth/services";

import { SqlError } from "@db/.";
import { logger } from "@logger";
import { validateBodyType } from "@utils/validation/body";


// POST /auth/update/password
export const UpdatePasswordController: RequestHandler<
    unknown,
    unknown,
    UpdatePasswordBody,
    unknown
> = async (req, res) => {
    try {

        const body = req.body;

        // Validate request body
        validateBodyType(body, "object");

        const zodResult = updatePasswordSchema.parse(body);
        const { oldPassword, newPassword } = zodResult;

        const session = req.session!;

        const isAnotherAuthProviderClient = session.user!.provider.provider !== "local";
        const userId = session.user!.client_id;

        if (!userId) {
            throw new ApiErrorUnauthorized({ message: "Please login first" });
        }

        if (isAnotherAuthProviderClient) {
            throw new ApiErrorBadRequest({});
        }

        // Get user data
        const userIdBin = Buffer.from(uuidParse(userId));
        const user = await sqlFindUserByField({ field: "id", value: userIdBin });

        if (!user) {
            throw new ApiErrorUnauthorized({ message: "Please login first" });
        }

        // Password exists because already signin with `local` provider
        const validPassword = await argon2.verify(user.password as string, oldPassword);
        if (!validPassword) {
            throw new ApiErrorUnauthorized({ message: "Password is incorrect" });
        }

        await ApiUpdatePassword({ userId, newPassword });

        return res.status(OK_STATUS).json({
            msg: "Password changed successfully"
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

interface UpdatePasswordBody {
    oldPassword: string,
    newPassword: string,
}

