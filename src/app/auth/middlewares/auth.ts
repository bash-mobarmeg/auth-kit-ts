import { RequestHandler } from "express";

import { ApiError, ApiErrorInternalServerError, ApiErrorUnauthorized } from "@api/res/error";

import { logger } from "@logger";


export class AuthMiddleware {
    private allowedRoles: string[];

    constructor() {
        this.R = this.R.bind(this);
        this.CheckRole = this.CheckRole.bind(this);

        this.allowedRoles = [];
    }

    R = (allowedRoles: string[]): this => {
        this.allowedRoles = allowedRoles;
        return this;
    }

    AuthenticatedUserOnly: RequestHandler = async (req, _, next) => {
        try {
            const session = req.session;
            if (!session) {
                throw new ApiErrorUnauthorized({ message: "Authentication error" });
            }

            const user = session.user;
            if (!user) {
                throw new ApiErrorUnauthorized({ message: "Authentication error" });
            }

            const tfaRequired = user.tfa.enabled && !user.tfa.authenticated;
            if (tfaRequired) {
                throw new ApiErrorUnauthorized({ message: "2FA id Required" });
            }

            next();

        } catch (err) {

            if (err instanceof ApiError) {
                throw err;
            }

            logger.error(err);
            throw new ApiErrorInternalServerError({});
        }
    }

    CheckRole: RequestHandler = async (req, _, next) => {
        try {
            const session = req.session;
            if (!session) {
                throw new ApiErrorUnauthorized({ message: "Authentication error" });
            }

            const user = session.user;
            if (!user) {
                throw new ApiErrorUnauthorized({ message: "Authentication error" });
            }

            const allowedRole = this.allowedRoles.includes(user.role);
            if (!allowedRole) {
                throw new ApiErrorUnauthorized({
                    message: "You are not allowed to this route"
                });
            }

            next();

        } catch (err) {

            if (err instanceof ApiError) {
                throw err;
            }

            logger.error(err);
            throw new ApiErrorInternalServerError({});
        }
    }

    CheckUsername: RequestHandler = async (req, _, next) => {
        try {
            const session = req.session;

            const user = session?.user;

            if (!user) {
                return next();
            }

            let providerCompleted = user.provider.completed;
            if (!providerCompleted) {
                throw new ApiErrorUnauthorized({ message: "Please complete your auth" });
            }

            next();

        } catch (err) {

            if (err instanceof ApiError) {
                throw err;
            }

            logger.error(err);
            throw new ApiErrorInternalServerError({});
        }
    }
}

