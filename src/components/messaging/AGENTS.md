# Messaging Components Guidelines
- Do not hold local message state; rely entirely on the message store hooks.
- Keep the sidebar keyboard navigable: every tab and action must be reachable with Tab and announce via ARIA.
- Memoize expensive message list renders with `React.useMemo` or `React.memo` as appropriate.
