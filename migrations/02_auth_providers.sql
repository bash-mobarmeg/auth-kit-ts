-- providers

CREATE TABLE auth_providers (
    id       BINARY(16) NOT NULL,
    user_id  BINARY(16) NOT NULL,

    provider     ENUM('google','github','local') NOT NULL,
    provider_id  VARCHAR(255) NOT NULL, -- google_id, github_id, etc.
    full_name    VARCHAR(255) DEFAULT NULL,

    access_token  TEXT DEFAULT NULL,
    refresh_token TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_provider (provider, provider_id),
    UNIQUE KEY uq_user_provider (user_id, provider),
    CONSTRAINT fk_auth_provider_user FOREIGN KEY (user_id) REFERENCES users(id)
);

