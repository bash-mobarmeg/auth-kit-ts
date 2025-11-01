# auth-kit-ts

A **secure Node.js authentication and session management service** built with **TypeScript**, offering JWT, 2FA, encrypted cookie sessions, rate-limiting, and more.

This project is designed as a backend module for web applications requiring robust user authentication, session handling, and security best practices.

---

## Features

- **Authentication**
  - Local username/password authentication
  - Third-party OAuth (Google)
  - Two-Factor Authentication (2FA) via TOTP
- **JWT Management**
  - HMAC-signed JWT tokens
  - RSA-encrypted JWE tokens
- **Session Management**
  - Secure cookie sessions (AES-256-GCM + HMAC)
  - Automatic encryption and decryption
- **Security**
  - HTTP headers via `helmet`
  - Rate limiting on sensitive routes
  - CSRF-safe cookie configuration
- **Logging**
  - Winston logger with console and daily-rotated files
- **Database**
  - MySQL connection pooling
  - Migration runner for SQL scripts
- **External Integrations**
  - Twilio SMS notifications
  - SMTP email support
  - Redis support for caching or session storage

---

## Table of Contents

- [Installation](#installation)

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/bash-mobarmeg/auth-kit-ts.git
cd auth-kit-ts

