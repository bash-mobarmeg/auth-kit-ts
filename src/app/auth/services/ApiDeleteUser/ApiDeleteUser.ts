import { ResultSetHeader } from "mysql2";
import { parse as uuidParse } from "uuid";
import { SqlPool, SqlUpdateError } from "@db/.";

export const ApiDeleteUser = async ({
    userId
}: DeleteUserParams): Promise<boolean> => {
    try {

        const userIdBin = Buffer.from(uuidParse(userId));

        try {
            await SqlPool.query<ResultSetHeader>(
                `UPDATE users
                    SET deleted = TRUE
                    WHERE id = ?`,
                [userIdBin]
            );

            return true;
        } catch (err) {
            throw new SqlUpdateError("users", { userId });
        }

    } catch (err) {
        throw err;
    }
}

interface DeleteUserParams {
    userId: string
}

