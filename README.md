# AgiRity

[![CI](https://github.com/akkytech0617/AgiRity/actions/workflows/ci.yml/badge.svg)](https://github.com/akkytech0617/AgiRity/actions/workflows/ci.yml)
[![Release](https://github.com/akkytech0617/AgiRity/actions/workflows/release.yml/badge.svg)](https://github.com/akkytech0617/AgiRity/actions/workflows/release.yml)

Start working in 3 seconds, not 3 minutes

## Testing

### E2E Testing

E2E tests are set up using Playwright for Electron:

```bash
# Run smoke tests
npm run test:smoke

# Run all E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

E2E tests help detect:

- Runtime errors (process.env access in renderer)
- Infinite recursion / stack overflow issues
- Application launch failures
- UI rendering problems
