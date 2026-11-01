# Contributing

## Requirements

- Node.js 20 or newer
- npm

## Local checks

```powershell
npm test
npm start
```

## Guidelines

- Prefer Node.js built-ins unless a dependency has a clear, reviewed benefit.
- Validate all external input.
- Keep error responses predictable and avoid leaking stack traces.
- Add integration tests for each route and error path.
- Preserve loopback-only binding by default.

## Pull request checklist

- [ ] Tests pass.
- [ ] New behavior has tests.
- [ ] Input limits and error behavior are documented.
- [ ] No secrets or personal data are included.
