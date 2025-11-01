import { RequestHandler } from "express";
import { ZodError } from "zod";

import { ApiError, ApiErrorConflict, ApiErrorInternalServerError, ApiErrorUnprocessableEntity } from "@api/res/error";
import { CREATED_STATUS } from "@api/res/status";

import { SqlDuplicateError } from "@db/.";
import { generateAuthProviderProviderId, sqlFindUserByField } from "@app/auth/db/globals";

import { ApiAddAuthProvider, ApiAddUser } from "@app/auth/services";
import { signupEmailSchema } from "@app/auth/schema";
import { SignupEmailBody } from "@app/auth/types";

import { validateBodyType } from "@utils/validation/body";
import { verifyOtpEmail } from "@utils/redis";

import { logger } from "@logger";


// POST /auth/signup/email
export const SignupWithEmailController: RequestHandler<
    unknown,
    unknown,
    SignupEmailBody,
    unknown
> = async (req, res) => {
    try {

        const body = req.body;

        validateBodyType(body, "object");

        // Valdate request body
        const zodResult = signupEmailSchema.parse(body);
        const { username, email, code, password } = zodResult;

        const usernameExists = await sqlFindUserByField({
            field: "username",
            value: username
        });

        if (usernameExists) {
            throw new ApiErrorConflict({
                message: "Username already exists",
            });
        }

        const emailExist = await sqlFindUserByField({ field: "email", value: email });
        if (emailExist) {
            throw new ApiErrorConflict({
                message: "Email address already exists",
            });
        }

        const codeIsValid = await verifyOtpEmail({ email, code });

        if (!codeIsValid) {
            throw new ApiErrorConflict({
                message: "Invalid verification code"
            });
        }

        const providerId = await generateAuthProviderProviderId();
        const userId = await ApiAddUser({
            username,
            phoneNumber: null,
            password,
            email
        });

        await ApiAddAuthProvider({
            userId,
            provider: "local",
            providerId,
            fullName: null,
            accessToken: null,
            refreshToken: null
        });

        return res
            .status(CREATED_STATUS)
            .json({
                msg: "User signup successfully: Please check your email"
            });

    } catch (err) {

        if (err instanceof ApiError) {
            throw err;
        }

        if (err instanceof SqlDuplicateError) {
            const errorMsg = err.details?.message as string;
            throw new ApiErrorConflict({ message: errorMsg ? errorMsg : "User already exists", });
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

