import { OAuth2Client } from "google-auth-library";

export const googleOAuthClient = new OAuth2Client({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    redirectUri: `${process.env.BASE_URL}/api/v1/auth/google/callback`
});

