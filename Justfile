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
    npm run --silent lint:fix --no-color

# Check code formatting with Prettier
format-check:
    npx prettier --check --no-color . 2>&1 | grep -v "^Checking formatting" | grep -v "^\[" || test $? = 1

# Format code with Prettier
format:
    npm run --silent format --no-color

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

# Package the application (create installers)
package: build
    npm run package --no-color

# Create a new release (tag and push)
release: build
    npm run release

# --- Security ---

# Run Snyk security scan (SCA - dependencies)
security:
    snyk test --no-color

# Run Snyk SAST scan (source code)
security-code:
    snyk code test --no-color

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
