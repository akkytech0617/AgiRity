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

# Run type checking and linting
check: type-check lint

# Run TypeScript type checking
type-check:
    npm run type-check

# Run ESLint
lint:
    npm run lint

# Fix ESLint issues automatically
fix:
    npm run lint:fix

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

# --- Utility ---

# Install dependencies
install:
    npm install
