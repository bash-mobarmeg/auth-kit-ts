--  two factor authentication

CREATE TABLE IF NOT EXISTS tfas (
    user_id       BINARY(16) NOT NULL,
    secret        VARCHAR(64) NOT NULL,
    otpauth_url   TEXT NOT NULL,
    enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    authenticated BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
