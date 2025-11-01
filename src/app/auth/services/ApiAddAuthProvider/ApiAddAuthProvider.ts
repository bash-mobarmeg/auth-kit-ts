import { ResultSetHeader } from "mysql2";
import { generateAuthProviderId } from "@app/auth/db/globals";
import { SqlInsertError, SqlPool } from "@db/.";
import { parse as uuidParse } from "uuid";

export const ApiAddAuthProvider = async ({
    userId,
    provider,
    providerId,
    fullName,
    accessToken,
    refreshToken,
}: AddAuthProviderParams): Promise<boolean> => {
    try {

        // Convert to a 16-byte Buffer
        const uuidBin = await generateAuthProviderId();
        const userIdBin = Buffer.from(uuidParse(userId));

        try {
            await SqlPool.query<ResultSetHeader>(
                `INSERT INTO auth_providers
                    (id, user_id, provider, provider_id, full_name, access_token, refresh_token)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [uuidBin, userIdBin, provider, providerId, fullName, accessToken, refreshToken]
            );

            return true;
        } catch (err) {
            console.error(err)
            throw new SqlInsertError("auth_providers", { userId });
        }

    } catch (err) {
        throw err;
    }
}

interface AddAuthProviderParams {
    userId: string,
    provider: "google" | "github" | "local",
    providerId: string,
    fullName: string | null,

    accessToken: string | null,
    refreshToken: string | null,
}


