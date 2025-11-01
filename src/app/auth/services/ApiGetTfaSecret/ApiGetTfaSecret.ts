import { parse as uuidParse } from "uuid";
import { SqlPool, SqlSelectError, TfaTable } from "@db/.";

export const ApiGetTfaSecret = async ({
    userId
}: GetTfaParams): Promise<TfaTable | null> => {
    try {

        const userIdBin = Buffer.from(uuidParse(userId));

        try {
            const [rows] = await SqlPool.query<TfaTable[]>(
                `SELECT * FROM tfas
                    WHERE user_id = ?`,
                [userIdBin]
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            throw new SqlSelectError("tfas", { userId: userIdBin });
        }

    } catch (err) {
        throw err;
    }
}

interface GetTfaParams {
    userId: string,
}

