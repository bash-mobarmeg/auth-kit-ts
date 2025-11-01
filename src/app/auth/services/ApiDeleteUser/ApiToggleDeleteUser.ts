import { ResultSetHeader } from "mysql2";
import { parse as uuidParse } from "uuid";
import { SqlPool, SqlRowNotFound, SqlUpdateError } from "@db/.";
import { sqlFindUserByField } from "@app/auth/db/globals";

export const ApiToggleDeleteUser = async ({
    userId
}: ToggleDeleteUserParams): Promise<boolean> => {
    try {

        const userIdBin = Buffer.from(uuidParse(userId));
        const user = await sqlFindUserByField({ field: "id", value: userIdBin });

        if (!user) {
            throw new SqlRowNotFound("users", { userId });
        }

        try {
            await SqlPool.query<ResultSetHeader>(
                `UPDATE users
                    SET deleted = ?
                    WHERE id = ?`,
                [!user.deleted, userIdBin]
            );

            return true;
        } catch (err) {
            throw new SqlUpdateError("users", { userId });
        }

    } catch (err) {
        throw err;
    }
}

interface ToggleDeleteUserParams {
    userId: string
}

