import { ResultSetHeader } from "mysql2";
import argon2 from "argon2";
import { generateUserId } from "@app/auth/db/globals";
import { SqlInsertError, SqlPool } from "@db/.";
import { stringify } from "uuid";

export const ApiAddUser = async ({
    username,
    email,
    password,
    phoneNumber,
}: AddUserParams): Promise<string> => {
    try {

        const passwordHash = password ? await argon2.hash(password) : null;

        // Convert to a 16-byte Buffer
        const uuidBin = await generateUserId();

        try {
            await SqlPool.query<ResultSetHeader>(
                `INSERT INTO users(id, username, password, phone_number, email)
                VALUES (?, ?, ?, ?, ?)`,
                [uuidBin, username, passwordHash, phoneNumber, email]
            );

            return stringify(uuidBin);
        } catch (err) {
            throw new SqlInsertError("users", { userId: uuidBin });
        }

    } catch (err) {
        throw err;
    }
}

interface AddUserParams {
    username: string | null,
    email: string | null,
    password: string | null,
    phoneNumber: string | null,
}

