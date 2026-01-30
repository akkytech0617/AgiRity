# AgiRity Task Runner
#
# Installation:
#   macOS: brew install just
#   Windows: winget install just
#   Linux: pacman -S just / apt install just (see docs)

set shell := ["bash", "-c"]

# List all available tasks
default:
    @just --list

# --- Development ---

# Start the development server (Electron + React + Hot Reload)
dev:
    npm run dev

# Run checks, test, scan and build as local CI
ci: check test e2e security-all build


# Run all checks (type-check, format, lint)
check: type-check format-check lint

# Run TypeScript type checking
type-check:
    npm run --silent type-check --no-color

# Run ESLint
lint:
    npm run --silent lint --no-color

# Fix ESLint issues automatically
fix:
    npm run lint:fix

# Check code formatting with Prettier
format-check:
    npm run format:check

# Format code with Prettier
format:
    npm run format

# --- Testing ---

# Run all unit tests
test:
    npm run test --no-color

# Run unit tests in watch mode
test-watch:
    npm run test:watch --no-color

# Run unit tests with coverage report
coverage:
    npm run test:coverage --no-color

# Run End-to-End tests with Playwright
e2e:
    npm run test:e2e:dev --no-color

# --- Build & Release ---

# Clean build artifacts
clean:
    rm -rf dist dist-electron release

# Build the application for production
build: clean
    npm run build --no-color

# Build for CI (without electron-builder packaging)
build-ci: clean
    npx tsc && npx vite build

# Package the application (create installers)
package: build
    npm run package --no-color

# Create a new release (tag and push)
release: build
    npm run release

# --- Security ---

# Run Snyk security scan (SCA - dependencies)
security:
    npx snyk test --no-color

# Run Snyk SAST scan (source code)
security-code:
    npx snyk code test --no-color

# Run all security scans
security-all: security security-code

# Run SonarCloud scan
sonar:
    sonar-scanner \
        -Dsonar.organization=${SONAR_ORG} \
        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
        -Dsonar.sources=src \
        -Dsonar.host.url=https://sonarcloud.io \
        -Dsonar.token=${SONARCLOUD_TOKEN}


# --- Utility ---

# Install dependencies
install:
    npm install
