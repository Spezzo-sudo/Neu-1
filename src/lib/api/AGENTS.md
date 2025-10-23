# API Client Conventions
- Keep functions pure and avoid direct network calls in unit tests; prefer dependency injection for fetch.
- Document every exported helper with JSDoc including environment expectations.
- Centralize base URL resolution utilities here so other modules reuse the same logic.
