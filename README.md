# Resend CLI

[![npm version](https://img.shields.io/npm/v/resend-cli.svg)](https://www.npmjs.com/package/resend-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful command-line interface for the [Resend](https://resend.com) email API. Send emails, manage domains, contacts, and broadcasts directly from your terminal.

## Installation

```bash
npm install -g resend-cli
```

## Quick Start

```bash
# Configure your API key
resend config init

# Send an email
resend send --from "you@example.com" --to "recipient@example.com" --subject "Hello" --text "Hello from Resend CLI!"

# List sent emails
resend list
```

## Documentation

See [docs/SRD.md](docs/SRD.md) for the complete Software Requirements Document.

## License

MIT
