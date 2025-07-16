# Simple WebAuthn NestJS Server

A minimal WebAuthn authentication server built with [NestJS](https://nestjs.com/) and [@simplewebauthn/server](https://github.com/MasterKale/SimpleWebAuthn).  
Supports passwordless registration and login using passkeys (FIDO2/WebAuthn authenticators).

## Features

- User registration and login with passkeys (WebAuthn)
- MongoDB user/passkey storage (via Mongoose)
- Session support (for challenge management)
- Ready for local network testing

## Endpoints

| Method | Endpoint               | Description                        |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/auth`                | Health check                       |
| POST   | `/auth/register/start` | Start registration (get challenge) |
| POST   | `/auth/register`       | Complete registration              |
| POST   | `/auth/login/start`    | Start login (get challenge)        |
| POST   | `/auth/login`          | Complete login                     |

## Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or remote)

### Installation

```bash
git clone https://github.com/your-username/simple-webauthn-n-server.git
cd simple-webauthn-n-server
npm install
```

### Configuration

Edit your MongoDB connection string in `src/app.module.ts` or your environment file if used.

### Run the Server

```bash
npm run start
```

By default, the server listens on **port 3000** and all network interfaces (`0.0.0.0`).  
You can access it from other devices on your LAN using `http://<your-local-ip>:3000`.

### Example Usage

#### Registration

1. `POST /auth/register/start`

   ```json
   { "username": "john", "email": "john@example.com" }
   ```

   - Returns WebAuthn registration options.

2. `POST /auth/register`
   ```json
   { "email": "john@example.com", "registrationResponse": { ... } }
   ```
   - Completes registration.

#### Login

1. `POST /auth/login/start`

   ```json
   { "email": "john@example.com" }
   ```

   - Returns WebAuthn login options.

2. `POST /auth/login`
   ```json
   { "email": "john@example.com", "loginResponse": { ... } }
   ```
   - Completes login.

## Notes

- This project is for educational/demo purposes.
- For production, add HTTPS, CORS, rate limiting, and secure session management.

##
