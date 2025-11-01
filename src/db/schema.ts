// ------------------------------
// Imports
// ------------------------------
import { RowDataPacket } from "mysql2"; // Used for typing MySQL query results

// ------------------------------
// Global / Shared Types
// ------------------------------

// Represents a timestamp that can be either a Date object or a string (depending on query result parsing)
export type TimeStamp = Date | string;

// Supported authentication providers (local, OAuth, etc.)
export type ProviderType = "local" | "github" | "google";

// User roles within the system, used for access control
export type RoleType = "user" | "admin" | "dev";

// ------------------------------
// UserTable Interface
// ------------------------------
// Represents a row from the `users` table in the database.
// Extends `RowDataPacket` to ensure compatibility with MySQL2 query results.
export interface UserTable extends RowDataPacket {
    id: Buffer<ArrayBuffer>;              // Binary UUID (primary key)

    username: string | null;              // Optional username (may be null before setup)
    phone_number: string | null;          // Optional phone number
    password: string | null;              // Hashed password for local authentication
    email: string;                        // User’s email (unique)
    role: RoleType;                       // Access level (user/admin/dev)

    deleted: boolean;                     // Soft delete flag
    blocked: boolean;                     // Account suspension flag

    created_at: TimeStamp;                // Creation timestamp
    updated_at: TimeStamp;                // Last update timestamp
}

// ------------------------------
// AuthProviderTable Interface
// ------------------------------
// Represents OAuth or federated identity provider data linked to a user.
export interface AuthProviderTable extends RowDataPacket {
    id: Buffer<ArrayBuffer>;              // Primary key
    user_id: Buffer<ArrayBuffer>;         // Foreign key referencing `UserTable`

    provider: ProviderType;               // Provider type (e.g., google, github, local)
    provider_id: string;                  // Provider-specific user ID
    full_name: string | null;             // Full name (optional, provided by OAuth provider)

    access_token: string | null;          // Access token for provider API calls
    refresh_token: string | null;         // Refresh token for provider re-authentication

    created_at: TimeStamp;                // Creation timestamp
    updated_at: TimeStamp;                // Last update timestamp
}

// ------------------------------
// TfaTable Interface
// ------------------------------
// Represents two-factor authentication (2FA) configuration for a user.
export interface TfaTable extends RowDataPacket {
    user_id: Buffer<ArrayBuffer>;         // Foreign key referencing `UserTable`
    secret: string;                       // TOTP secret for generating 2FA codes
    otpauth_url: string;                  // URL for authenticator apps (e.g., Google Authenticator)

    enabled: boolean;                     // Indicates if 2FA is turned on
    authenticated: boolean;               // Tracks if the latest authentication passed 2FA

    created_at: TimeStamp;                // Creation timestamp
    updated_at: TimeStamp;                // Last update timestamp
}

