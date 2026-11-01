# Flagship API

A small, dependency-free Node.js API foundation demonstrating input validation, predictable JSON errors, basic response hardening, and automated tests.

## Features

- Node.js built-in HTTP server. No runtime dependencies.
- `GET /health` liveness endpoint.
- `GET /api/v1/status` service metadata.
- `POST /api/v1/validate` validates a small JSON payload.
- Consistent JSON error responses and HTTP status codes.
- Request body size limit.
- Basic security response headers.
- Automated integration tests using Node's built-in test runner.

## Requirements

- Node.js 20 or newer
- npm (included with Node.js)

## Run locally

```powershell
npm install
npm start
```

The API listens on `http://localhost:3000` by default. Set `PORT` to use another port.

## Try the endpoints

Health:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Status:

```powershell
Invoke-RestMethod http://localhost:3000/api/v1/status
```

Validation:

```powershell
$body = @{ name = "Vishwas"; role = "learner" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/validate -ContentType "application/json" -Body $body
```

The validation endpoint accepts a JSON object with a required `name` string (1 to 80 characters) and an optional `role` string (up to 80 characters).

## Test

```powershell
npm test
```

## Security boundaries

This is a learning API, not a production-ready internet service. It intentionally has no authentication, database, CORS policy, or external integrations. Keep it bound to a trusted development environment. Before production use, add authentication, rate limiting, deployment-specific TLS, monitoring, and a threat model.

Never commit secrets or real user data. See [SECURITY.md](SECURITY.md).

## Project status

Initial working API foundation. Future work should add features only with tests and clear security requirements.
