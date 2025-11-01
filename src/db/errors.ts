
// Base SQL Error
export class SqlError extends Error {
    public code: string;
    public table: string;
    public details?: Record<string, unknown>;

    constructor(message: string, code: string, table: string, details?: Record<string, unknown>) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.table = table;
        this.details = details;

        // Restore prototype chain (important for instanceof checks in TS/Node)
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

// Specific Errors
export class SqlRowNotFound extends SqlError {
    constructor(table: string, details?: Record<string, unknown>) {
        super(`Row data not found, table: ${table}`, "ROW_NOT_FOUND", table, details);
    }
}

export class SqlInsertError extends SqlError {
    constructor(table: string, details?: Record<string, unknown>) {
        super(`Failed to insert row into table: ${table}`, "INSERT_ERROR", table, details);
    }
}

export class SqlDeleteError extends SqlError {
    constructor(table: string, details?: Record<string, unknown>) {
        super(`Failed to delete row from table: ${table}`, "DELETE_ERROR", table, details);
    }
}

export class SqlSelectError extends SqlError {
    constructor(table: string, details?: Record<string, unknown>) {
        super(`Failed to select row from table: ${table}`, "SELECT_ERROR", table, details);
    }
}

export class SqlDuplicateError extends SqlError {
    constructor(table: string, details?: Record<string, unknown>) {
        super(`Duplicate entry violation, table: ${table}`, "DUPLICATE_ENTRY", table, details);
    }
}

export class SqlUpdateError extends SqlError {
    constructor(table: string, details?: Record<string, unknown>) {
        super(`Failed to update row in table: ${table}`, "UPDATE_ERROR", table, details);
    }
}

