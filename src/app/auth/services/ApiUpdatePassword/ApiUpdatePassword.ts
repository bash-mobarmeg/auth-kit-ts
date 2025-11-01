import { ResultSetHeader } from "mysql2";
import { parse as uuidParse } from "uuid";
import argon2 from "argon2";
import { SqlPool, SqlUpdateError } from "@db/.";

export const ApiUpdatePassword = async ({
    userId,
    newPassword,
}: AddUserParams): Promise<boolean> => {
    try {

        const userIdBin = Buffer.from(uuidParse(userId));
        const newPasswordHash = await argon2.hash(newPassword);

        try {
            await SqlPool.query<ResultSetHeader>(
                `UPDATE users
                    SET password = ?
                    WHERE id = ?`,
                [newPasswordHash, userIdBin]
            );

            return true;
        } catch (err) {
            throw new SqlUpdateError("users", { userId });
        }

    } catch (err) {
        throw err;
    }
}

interface AddUserParams {
    userId: string,
    newPassword: string,
}

