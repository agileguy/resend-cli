# Resend CLI

<p align="center">
  <img src="https://raw.githubusercontent.com/agileguy/resend-cli/main/docs/logo.png" alt="Resend CLI Logo" width="200">
</p>

[![npm version](https://img.shields.io/npm/v/resend-email-cli.svg)](https://www.npmjs.com/package/resend-email-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful command-line interface for the [Resend](https://resend.com) email API. Send emails, manage domains, contacts, audiences, broadcasts, and webhooks directly from your terminal.

## Features

- **Email Management** - Send single emails, batch emails, schedule delivery, and track status
- **Domain Management** - Add, verify, and configure sending domains
- **Audience Management** - Create and manage contact lists
- **Contact Management** - Add, update, import contacts from CSV
- **Broadcast Campaigns** - Send bulk emails to audiences
- **Webhook Integration** - Set up event notifications for email delivery events
- **Multiple Output Formats** - JSON or human-readable table output
- **Scriptable** - Perfect for CI/CD pipelines and automation

## Installation

```bash
# Using npm
npm install -g resend-email-cli

# Using bun
bun install -g resend-email-cli
```

## Quick Start

### 1. Configure your API key

```bash
# Interactive setup
resend config init

# Or set directly
resend config set api_key re_xxxxxxxxxxxxx

# Or use environment variable
export RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 2. Send your first email

```bash
resend emails send \
  --from "you@yourdomain.com" \
  --to "recipient@example.com" \
  --subject "Hello from Resend CLI" \
  --text "This email was sent from the command line!"
```

## Commands

### Configuration

```bash
resend config init              # Interactive configuration setup
resend config get               # Show current configuration
resend config set <key> <value> # Set a configuration value
resend config delete <key>      # Remove a configuration value
```

### Emails

```bash
# Send a single email
resend emails send --from "sender@example.com" --to "recipient@example.com" --subject "Hello" --text "Body"

# Send with HTML content
resend emails send --from "sender@example.com" --to "recipient@example.com" --subject "Hello" --html "<h1>Hello</h1>"

# Send with HTML file
resend emails send --from "sender@example.com" --to "recipient@example.com" --subject "Hello" --html-file ./email.html

# Send with attachments
resend emails send --from "sender@example.com" --to "recipient@example.com" --subject "Report" --text "See attached" --attachment ./report.pdf

# Schedule email for later
resend emails send --from "sender@example.com" --to "recipient@example.com" --subject "Reminder" --text "Don't forget!" --scheduled-at "2024-12-25T09:00:00Z"

# Send batch emails from JSON file
resend emails send-batch ./emails.json

# Get email details
resend emails get <email-id>

# List sent emails
resend emails list --limit 20

# Update scheduled email
resend emails update <email-id> --scheduled-at "2024-12-26T09:00:00Z"

# Cancel scheduled email
resend emails cancel <email-id>
```

### Domains

```bash
# List all domains
resend domains list

# Add a new domain
resend domains add example.com --region us-east-1

# Get domain details and DNS records
resend domains get <domain-id>

# Verify domain DNS records
resend domains verify <domain-id>

# Update domain settings
resend domains update <domain-id> --open-tracking --click-tracking

# Delete a domain
resend domains delete <domain-id>
```

### Audiences

```bash
# List all audiences
resend audiences list

# Create a new audience
resend audiences create "Newsletter Subscribers"

# Get audience details
resend audiences get <audience-id>

# Delete an audience
resend audiences delete <audience-id>
```

### Contacts

```bash
# List contacts in an audience
resend contacts list <audience-id>

# Add a contact
resend contacts create <audience-id> --email "user@example.com" --first-name "John" --last-name "Doe"

# Get contact details
resend contacts get <audience-id> <contact-id>

# Update a contact
resend contacts update <audience-id> <contact-id> --first-name "Jane"

# Unsubscribe a contact
resend contacts update <audience-id> <contact-id> --unsubscribe

# Delete a contact
resend contacts delete <audience-id> <contact-id>

# Import contacts from CSV
resend contacts import <audience-id> ./contacts.csv
```

### Broadcasts

```bash
# List all broadcasts
resend broadcasts list

# Create a broadcast
resend broadcasts create <audience-id> --from "news@example.com" --subject "Newsletter" --html-file ./newsletter.html

# Get broadcast details
resend broadcasts get <broadcast-id>

# Update a broadcast
resend broadcasts update <broadcast-id> --subject "Updated Subject"

# Send a broadcast
resend broadcasts send <broadcast-id>

# Delete a broadcast
resend broadcasts delete <broadcast-id>
```

### Webhooks

```bash
# List all webhooks
resend webhooks list

# Create a webhook
resend webhooks create https://example.com/webhook --events email.sent --events email.delivered

# Get webhook details
resend webhooks get <webhook-id>

# Update webhook events
resend webhooks update <webhook-id> --events email.bounced --events email.complained

# Delete a webhook
resend webhooks delete <webhook-id>
```

## Global Options

All commands support these global options:

| Option | Description |
|--------|-------------|
| `--api-key <key>` | Use a specific API key (overrides config) |
| `--output <format>` | Output format: `json` or `table` (default: `json`) |
| `--verbose` | Enable verbose logging |
| `--no-color` | Disable colored output |
| `-h, --help` | Display help for command |

## Configuration

The CLI stores configuration in `~/.resend/config.json`. Configuration priority:

1. Command-line flags (`--api-key`)
2. Environment variables (`RESEND_API_KEY`)
3. Configuration file

### Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key |

## File Formats

### Batch Email JSON

```json
[
  {
    "from": "sender@example.com",
    "to": "recipient1@example.com",
    "subject": "Hello 1",
    "text": "Message 1"
  },
  {
    "from": "sender@example.com",
    "to": "recipient2@example.com",
    "subject": "Hello 2",
    "html": "<h1>Message 2</h1>"
  }
]
```

### Contact Import CSV

```csv
email,first_name,last_name
john@example.com,John,Doe
jane@example.com,Jane,Smith
```

## Examples

### Send email with CC and BCC

```bash
resend emails send \
  --from "sender@example.com" \
  --to "recipient@example.com" \
  --cc "copy@example.com" \
  --bcc "hidden@example.com" \
  --subject "Important Update" \
  --text "Please review the attached document."
```

### Send email with tags for tracking

```bash
resend emails send \
  --from "sender@example.com" \
  --to "recipient@example.com" \
  --subject "Welcome!" \
  --text "Welcome to our service" \
  --tag "campaign:welcome" \
  --tag "source:signup"
```

### Pipe HTML content

```bash
cat email.html | resend emails send \
  --from "sender@example.com" \
  --to "recipient@example.com" \
  --subject "Newsletter"
```

### Use in CI/CD pipeline

```bash
# Send deployment notification
resend emails send \
  --api-key $RESEND_API_KEY \
  --from "ci@example.com" \
  --to "team@example.com" \
  --subject "Deployment Complete" \
  --text "Version $VERSION deployed to production" \
  --output json
```

### JSON output for scripting

```bash
# Get email ID from send response
EMAIL_ID=$(resend emails send \
  --from "sender@example.com" \
  --to "recipient@example.com" \
  --subject "Test" \
  --text "Test" \
  --output json | jq -r '.id')

# Check email status
resend emails get $EMAIL_ID --output json | jq '.status'
```

## Webhook Events

Available webhook event types:

- `email.sent` - Email accepted by Resend
- `email.delivered` - Email delivered to recipient
- `email.delivery_delayed` - Delivery temporarily delayed
- `email.bounced` - Email bounced
- `email.complained` - Recipient marked as spam
- `email.opened` - Email opened (if tracking enabled)
- `email.clicked` - Link clicked (if tracking enabled)

## API Documentation

For detailed API documentation, visit [Resend API Docs](https://resend.com/docs/api-reference/introduction).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [Resend Website](https://resend.com)
- [Resend API Documentation](https://resend.com/docs)
- [GitHub Repository](https://github.com/agileguy/resend-cli)
- [npm Package](https://www.npmjs.com/package/resend-email-cli)
