import { ResultSetHeader } from "mysql2";
import { parse as uuidParse } from "uuid";
import { SqlPool, SqlUpdateError } from "@db/.";

export const ApiBlockUser = async ({
    userId
}: BlcokUserParams): Promise<boolean> => {
    try {

        const userIdBin = Buffer.from(uuidParse(userId));

        try {
            await SqlPool.query<ResultSetHeader>(
                `UPDATE users
                    SET blocked = TRUE
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

interface BlcokUserParams {
    userId: string
}

