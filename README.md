# AgiRity

[![CI](https://github.com/akkytech0617/AgiRity/actions/workflows/ci.yml/badge.svg)](https://github.com/akkytech0617/AgiRity/actions/workflows/ci.yml)
[![Release](https://github.com/akkytech0617/AgiRity/actions/workflows/release.yml/badge.svg)](https://github.com/akkytech0617/AgiRity/actions/workflows/release.yml)

> Start working in 3 seconds, not 3 minutes

[日本語](README_ja.md)

## Overview

Tired of the daily "ritual" of "open VS Code, then Slack, then GitHub in Chrome..."?

AgiRity is a workspace management tool that lets you define workspaces for each project or task, organize required apps in one place, and launch them with a single click.

## Features

- **Workspace Management** - Create, edit, and delete workspaces
- **App Management** - Centrally manage apps per workspace
- **Batch App Launching** - Launch multiple apps with specified order and delays
- **Multiple URL Opening** - Open multiple URLs in your browser simultaneously
- **Folder-specific Launch** - Open VS Code and other apps with a specific project folder

## Quick Start

### Installation

> Currently in early development. No release builds available yet.

To try the development version:

```bash
git clone https://github.com/akkytech0617/AgiRity.git
cd AgiRity
npm install
npm run dev
```

### Basic Usage

1. Create a new workspace
2. Add apps and URLs you want to launch
3. Click "Launch"

## Development

### Setup

```bash
npm install
npm run dev
```

For detailed development guides, see [docs/development/](docs/development/).

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1 (MVP)** | 🚧 In Development | Workspace management, batch app launching |
| **Phase 2** | 📋 Planned | Tool registry, config export/import |
| **Phase 3** | 💭 Concept | CLI, MCP integration, cloud sync |

For details, see [Requirements Document](docs/product/01_requirment.md).

## Documentation

- [Requirements](docs/product/01_requirment.md)
- [Architecture](docs/design/architecture.md)
- [Testing Strategy](docs/implementation/testing_strategy.md)
- [Development Guide](docs/development/)

## Contributing

TBD

## License

MIT
