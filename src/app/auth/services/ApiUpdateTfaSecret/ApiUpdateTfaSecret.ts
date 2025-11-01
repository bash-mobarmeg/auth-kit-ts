import { ResultSetHeader } from "mysql2";
import { parse as uuidParse } from "uuid";
import { SqlPool, SqlUpdateError } from "@db/.";
import { TFASecret } from "@common/types";

export const ApiUpdateTfaSecret = async ({
    userId,
    newSecret,
}: UpdateTfaParams): Promise<boolean> => {
    try {

        const userIdBin = Buffer.from(uuidParse(userId));

        try {
            await SqlPool.query<ResultSetHeader>(
                `UPDATE tfas
                    SET secret = ?, otpauth_url = ?
                    WHERE user_id = ?`,
                [newSecret.base64, newSecret.otpauth_url, userIdBin]
            );

            return true;
        } catch (err) {
            console.error(err);
            throw new SqlUpdateError("tfas", { userId });
        }

    } catch (err) {
        throw err;
    }
}

interface UpdateTfaParams {
    userId: string,
    newSecret: TFASecret,
}

