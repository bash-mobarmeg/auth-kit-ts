import "express";

declare global {
    namespace Express {
        interface Tfa {
            enabled: boolean,
            authenticated: boolean
        }

        interface Provider {
            id: string,
            provider: ProviderType,
            completed: boolean
        }

        interface User {
            client_id: string;
            role: string;
            tfa: Tfa,
            provider: Provider
        }

        interface Request {
            session?: {
                user?: User;
                expires?: Date,
                maxAge?: number,
                [key: string]: any;
            };
        }

    }
}

export { }; // 👈 prevents "Cannot redeclare block-scoped variable" issues
