import { ResultSetHeader } from "mysql2";
import { SqlPool, SqlRowNotFound, SqlUpdateError } from "@db/.";
import { parse as uuidParse } from "uuid";
import { sqlFindUserByField } from "@app/auth/db/globals";

export const ApiToggleBlockUser = async ({
    userId
}: BlcokUserParams): Promise<boolean> => {
    try {

        const userIdBin = Buffer.from(uuidParse(userId));
        const user = await sqlFindUserByField({ field: "id", value: userIdBin });

        if (!user) {
            throw new SqlRowNotFound("users", { userId });
        }

        try {
            await SqlPool.query<ResultSetHeader>(
                `UPDATE users
                    SET blocked = ?
                    WHERE id = ?`,
                [!user.blocked, userIdBin]
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

