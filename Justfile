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

# Run all checks (type-check, format, lint)
check: type-check format-check lint

# Run TypeScript type checking
type-check:
    npm run type-check

# Run ESLint
lint:
    npm run lint

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
    npm run test

# Run unit tests in watch mode
test-watch:
    npm run test:watch

# Run unit tests with coverage report
coverage:
    npm run test:coverage

# Run End-to-End tests with Playwright
e2e:
    npm run test:e2e

# --- Build & Release ---

# Clean build artifacts
clean:
    rm -rf dist dist-electron release

# Build the application for production
build: clean
    npm run build

# Package the application (create installers)
package: build
    npm run package

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

# --- Utility ---

# Install dependencies
install:
    npm install
