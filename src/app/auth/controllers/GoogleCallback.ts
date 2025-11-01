import { RequestHandler } from "express";
import { google } from "googleapis";

import { OK_STATUS } from "@common/index";

import { ApiError, ApiErrorConflict, ApiErrorInternalServerError, ApiErrorUnprocessableEntity } from "@api/res/error";

import { googleOAuthClient } from "@app/auth/google";
import { sqlFindAuthProviderByField } from "@app/auth/db/globals";
import { ApiAddAuthProvider, ApiAddUser } from "@app/auth/services";

import { SqlDuplicateError } from "@db/errors";

import { logger } from "@logger";


// GET /auth/google/callback
export const GoogleCallbackController: RequestHandler<
    unknown,
    unknown,
    unknown,
    GoogleCallbackQuery
> = async (req, res) => {
    try {
        const code = req.query.code;

        if (!code) {
            throw new ApiErrorUnprocessableEntity({ message: "Missing code" });
        }

        // Exchange code for tokens
        const { tokens } = await googleOAuthClient.getToken(code);
        googleOAuthClient.setCredentials(tokens);

        // Get user info from Google
        const oauth2 = google.oauth2({ version: "v2", auth: googleOAuthClient });
        const { data } = await oauth2.userinfo.get();

        const google_id = data.id;
        const email = data.email;
        const google_full_name = data.name || null;
        // const google_email_verified = data.verified_email || false;

        if (!(email && google_id)) {
            throw new ApiErrorInternalServerError({});
        }

        let provider = await sqlFindAuthProviderByField({
            field: "provider_id",
            value: google_id
        });

        if (!provider) {
            const userId = await ApiAddUser({
                username: null,
                email,
                phoneNumber: null,
                password: null,
            });

            await ApiAddAuthProvider({
                userId,
                provider: "google",
                providerId: google_id,
                fullName: google_full_name,
                accessToken: null,
                refreshToken: null,
            });
        }

        req.session = {
            user: {
                client_id: google_id,
                role: "user",
                provider: {
                    id: google_id,
                    provider: "google",
                    completed: false,
                },
                tfa: {
                    enabled: false,
                    authenticated: false
                }
            }
        };

        return res
            .status(OK_STATUS)
            .json({
                msg: "User signed up successfully",
            });

    } catch (err) {

        if (err instanceof ApiError) {
            throw err;
        }

        if (err instanceof SqlDuplicateError) {
            throw new ApiErrorConflict({ message: err.message });
        }

        logger.error(err);
        throw new ApiErrorInternalServerError({});
    }
}

interface GoogleCallbackQuery {
    code?: string
}
