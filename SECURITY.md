# Security Policy

## Scope

Flagship API is a small educational Node.js service. It has no authentication, persistence, external network integrations, or production deployment configuration.

## Reporting

Please report suspected vulnerabilities privately to the repository owner where GitHub private vulnerability reporting is available. Avoid publishing sensitive details before a fix is available.

## Safe operation

- The server binds to loopback (127.0.0.1) by default.
- Do not expose it to the public internet without a security review.
- Do not add secrets or personal data to the repository.
- Keep dependencies minimal and review changes to request parsing, routing, and deployment configuration.
- Add tests for security-relevant behavior.
