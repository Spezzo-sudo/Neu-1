# Galaxy Components Guidelines
- Keep rendering memoized where possible; prefer `React.memo` for pure presentational components.
- Expose props with explicit types imported from `@/types` and document the component purpose with JSDoc.
- Use helpers from `@/lib/hex` for coordinate math instead of duplicating logic.
