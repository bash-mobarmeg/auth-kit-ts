--  users

CREATE TABLE IF NOT EXISTS users (
    id         BINARY(16) NOT NULL,

    username      VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    email         VARCHAR(255) DEFAULT NULL,
    phone_number  VARCHAR(20)  DEFAULT NULL,
    password      VARCHAR(255) DEFAULT NULL, -- null for external providers google, github, etc.
    role          ENUM("user", "admin", "dev") NOT NULL DEFAULT("user"),

    deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    blocked  BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_username (username),
    UNIQUE KEY uq_email (email),
    UNIQUE KEY uq_phone (phone_number)
);
