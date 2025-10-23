# Contribution Guidelines
- Use TypeScript and React best practices; keep functions pure and side-effect free unless they intentionally mutate store state via Zustand.
- Document every exported function or constant with a short JSDoc block describing its purpose.
- Keep formatting consistent with the existing 2-space indentation and single quotes.
- Whenever you touch gameplay logic (economy, build queues, tick handling), prefer extracting helpers into `lib/` modules.
- Run `npm run build` before committing changes.

## Workflow Conventions
- Keep the repository free of leftover archives or temporary extraction folders after importing assets.
- When adding a new top-level feature directory, include an `AGENTS.md` inside it describing any local conventions so future work stays consistent.
- Prefer recording project progress in the repository's README under clearly labeled sections to simplify status tracking.
