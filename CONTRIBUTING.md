# Contributing

Keep changes small, tested, and documented.

## Local Checks

```bash
npm test
```

For UI work, run:

```bash
npm run app:dev
```

## Platform Sources

Prefer sources with public APIs, no required user account for basic use, and graceful failure behavior. If a platform has no dependable public metric API, support it through custom metrics instead of scraping.
