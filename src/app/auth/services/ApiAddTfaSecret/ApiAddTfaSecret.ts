import { ResultSetHeader } from "mysql2";
import { parse as uuidParse } from "uuid";
import { SqlInsertError, SqlPool } from "@db/.";
import { TFASecret } from "@common/types";

export const ApiAddTfaSecret = async ({
    userId,
    secret,
}: AddTfaParams): Promise<boolean> => {
    try {

        const userIdBin = Buffer.from(uuidParse(userId));

        try {
            await SqlPool.query<ResultSetHeader>(
                `INSERT INTO tfas(user_id, secret, otpauth_url)
                VALUES (?, ?, ?)`,
                [userIdBin, secret.base64, secret.otpauth_url]
            );

            return true
        } catch (err) {
            throw new SqlInsertError("tfas", { userId });
        }

    } catch (err) {
        throw err;
    }
}

interface AddTfaParams {
    userId: string,
    secret: TFASecret,
}

