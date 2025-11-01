import { parse as uuidParse, v4 as uuidv4 } from "uuid";

import { FindByFieldParams } from "@common/types";

import { AuthProviderTable, SqlPool, SqlSelectError, TfaTable, UserTable } from "@db/.";

import { logger } from "@logger";


export const sqlFindUserByField = async ({
    field = "id",
    value
}: FindByFieldParams): Promise<UserTable | null> => {
    try {
        const [rows] = await SqlPool.query<UserTable[]>(
            `SELECT * FROM users
                WHERE ${field} = ?`,
            [value]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        logger.error(err);
        throw new SqlSelectError("users", { field, value });
    }
}


export const sqlFindUsersByField = async ({
    field = "id",
    value
}: FindByFieldParams): Promise<UserTable[] | null> => {
    try {
        const [rows] = await SqlPool.query<UserTable[]>(
            `SELECT * FROM users
                WHERE ${field} = ?`,
            [value]
        );
        return rows.length > 0 ? rows : null;
    } catch (err) {
        logger.error(err);
        throw new SqlSelectError("users", { field, value });
    }
}


export const sqlFindAuthProviderByField = async ({
    field = "id",
    value
}: FindByFieldParams): Promise<AuthProviderTable | null> => {
    try {
        const [rows] = await SqlPool.query<AuthProviderTable[]>(
            `SELECT * FROM auth_providers
                WHERE ${field} = ?`,
            [value]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        logger.error(err);
        throw new SqlSelectError("auth_providers", { field, value });
    }
}


export const sqlFindAuthProviderssByField = async ({
    field = "id",
    value
}: FindByFieldParams): Promise<AuthProviderTable[] | null> => {
    try {
        const [rows] = await SqlPool.query<AuthProviderTable[]>(
            `SELECT * FROM auth_providers
                WHERE ${field} = ?`,
            [value]
        );
        return rows.length > 0 ? rows : null;
    } catch (err) {
        logger.error(err);
        throw new SqlSelectError("auth_providers", { field, value });
    }
}


export const sqlFindTfaByField = async ({
    field = "id", value
}: FindByFieldParams): Promise<TfaTable | null> => {
    try {
        const [rows] = await SqlPool.query<TfaTable[]>(
            `SELECT * FROM tfas
                WHERE ${field} = ?`,
            [value]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        logger.error(err);
        throw new SqlSelectError("tfas", { field, value });
    }
}


export const generateUserId = async (): Promise<Buffer<ArrayBuffer>> => {
    let uuidStr = uuidv4();
    let uuidBin = Buffer.from(uuidParse(uuidStr));

    let userIdExists = await sqlFindUserByField({
        field: "id",
        value: uuidBin
    });

    while (userIdExists) {
        uuidStr = uuidv4();
    }

    return uuidBin;
}


export const generateTfaId = async (): Promise<Buffer<ArrayBuffer>> => {
    let uuidStr = uuidv4();
    let uuidBin = Buffer.from(uuidParse(uuidStr));

    let tfaIdExists = await sqlFindTfaByField({
        field: "id",
        value: uuidBin
    });

    while (tfaIdExists) {
        uuidStr = uuidv4();
    }

    return uuidBin;
}


export const generateAuthProviderId = async (): Promise<Buffer<ArrayBuffer>> => {
    let uuidStr = uuidv4();
    let uuidBin = Buffer.from(uuidParse(uuidStr));

    let authProviderIdExists = await sqlFindAuthProviderByField({
        field: "id",
        value: uuidBin
    });

    while (authProviderIdExists) {
        uuidStr = uuidv4();
    }

    return uuidBin;
}


export const generateAuthProviderProviderId = async (): Promise<string> => {
    let uuidStr = uuidv4();

    let authProviderIdExists = await sqlFindAuthProviderByField({
        field: "provider_id",
        value: uuidStr
    });

    while (authProviderIdExists) {
        uuidStr = uuidv4();
    }

    return uuidStr;
}

