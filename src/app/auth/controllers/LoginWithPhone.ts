import { RequestHandler } from "express";
import argon2 from "argon2";
import { ZodError } from "zod";
import { stringify } from "uuid";

import { OK_STATUS } from "@api/res/status";
import { ApiError, ApiErrorInternalServerError, ApiErrorUnauthorized, ApiErrorUnprocessableEntity } from "@api/res/error";

import { sqlFindAuthProviderByField, sqlFindTfaByField, sqlFindUserByField } from "@app/auth/db/globals";
import { loginPhoneSchema } from "@app/auth/schema";
import { LoginBody } from "@app/auth/types";

import { UserTable } from "@db/schema";

import { validateBodyType } from "@utils/validation/body";

import { logger } from "@logger";


// POST /auth/login/phone
export const LoginWithPhoneController: RequestHandler<
    unknown,
    unknown,
    LoginBody,
    unknown
> = async (req, res) => {
    try {

        const body = req.body;

        validateBodyType(body, "object");

        // Validate request body
        const zodResult = loginPhoneSchema.parse(body);
        const { phoneNumber, password } = zodResult;

        let user: UserTable | null;

        user = await sqlFindUserByField({
            field: "phone_number",
            value: phoneNumber
        });

        if (!user) {
            throw new ApiErrorUnauthorized({
                message: "Invalid phone number or password"
            });
        }

        const userProvider = await sqlFindAuthProviderByField({
            field: "user_id",
            value: user.id
        });

        if (!userProvider) {
            throw new ApiErrorInternalServerError({});
        }

        const validPassword = await argon2.verify(user.password as string, password);
        if (!validPassword) {
            throw new ApiErrorUnauthorized({
                message: "Invalid phone number or password"
            });
        }

        const tfaData = await sqlFindTfaByField({ field: "user_id", value: user.id });

        req.session = {
            user: {
                client_id: stringify(Buffer.from(user.id)),
                role: user.role,
                provider: {
                    id: stringify(Buffer.from(userProvider.id)),
                    provider: userProvider.provider,
                    completed: user.username ? true : false
                },
                tfa: {
                    enabled: tfaData?.enabled ? tfaData?.enabled : false,
                    authenticated: tfaData?.authenticated ? tfaData?.authenticated : false
                }
            }
        }

        return res
            .status(OK_STATUS)
            .json({
                msg: "Login successful",
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

