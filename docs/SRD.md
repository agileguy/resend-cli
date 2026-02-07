# Resend CLI - Software Requirements Document

**Version:** 1.0.0
**Date:** February 7, 2026
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Project Overview

The Resend CLI is a command-line interface tool designed to provide developers with a fast, intuitive, and powerful way to interact with the Resend Email API directly from their terminal. Resend is a modern email API service built for developers, offering high deliverability, easy integration, and comprehensive email management capabilities.

This CLI tool will enable developers to:
- Send transactional and marketing emails without leaving the terminal
- Manage domains, verify DNS records, and configure email infrastructure
- Create and manage API keys for different access levels
- Build and maintain contact lists (audiences) programmatically
- Send bulk emails (broadcasts) to audiences with dynamic personalization
- Test and debug email workflows during development
- Automate email operations through shell scripts and CI/CD pipelines

### 1.2 Target Users

**Primary Users:**
- **Backend Developers** - Integrating email capabilities into applications
- **DevOps Engineers** - Automating email infrastructure and deployment workflows
- **QA Engineers** - Testing email functionality in development environments
- **System Administrators** - Managing email domains and monitoring delivery

**Secondary Users:**
- **Technical Writers** - Sending documentation updates via email
- **Data Engineers** - Triggering email notifications from data pipelines
- **Support Engineers** - Investigating email delivery issues

### 1.3 Success Metrics

**Technical Success Criteria:**
- CLI responds to commands in under 500ms for simple operations
- Support all documented Resend API endpoints with feature parity
- 100% test coverage for critical email sending functionality
- Zero-config installation for common development environments

**User Experience Success Criteria:**
- Unix-style command structure (verb-noun pattern)
- Comprehensive help documentation accessible via `--help`
- Meaningful error messages with actionable suggestions
- Support for both interactive and non-interactive (scripting) modes

### 1.4 Technical Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Runtime** | Bun (v1.0+) | Fastest JavaScript runtime, built-in TypeScript support, single binary distribution |
| **Language** | TypeScript | Type safety, excellent IDE support, maintainability |
| **CLI Framework** | Commander.js | Industry standard, excellent documentation, flexible command structure |
| **HTTP Client** | Built-in `fetch` | Native to Bun, no dependencies, standards-compliant |
| **Configuration** | JSON + Environment Variables | Simple, widely understood, easy to automate |
| **Testing** | Bun Test | Built-in, fast, TypeScript-native |
| **Distribution** | npm package + standalone binary | Maximum accessibility for all users |

### 1.5 Timeline Estimate

**Phase 1 (Core Foundation):** 2-3 days
**Phase 2 (Full Email Features):** 2-3 days
**Phase 3 (Domain Management):** 1-2 days
**Phase 4 (Contacts & Audiences):** 2-3 days
**Phase 5 (Broadcasts & Bulk):** 2-3 days
**Phase 6 (Polish & Documentation):** 1-2 days

**Total Development Time:** 10-16 days (single developer)

### 1.6 Resource Requirements

**Team Composition:**
- 1x Senior TypeScript Developer (CLI development, API integration)
- 1x QA Engineer (testing, validation, edge cases) - optional but recommended
- 1x Technical Writer (documentation, examples) - can be same as developer

**Infrastructure:**
- Resend account with API access (free tier sufficient for development)
- GitHub repository for version control and CI/CD
- npm account for package distribution

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Resend CLI Tool                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Command    │  │  API Client  │  │    Config    │ │
│  │   Parser     │──│   (fetch)    │──│   Manager    │ │
│  │ (Commander)  │  │              │  │   (JSON)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │        │
│         │                  │                  │        │
│  ┌──────▼──────────────────▼──────────────────▼─────┐ │
│  │           Output Formatter & Error Handler        │ │
│  │        (JSON, Table, Pretty Print, Errors)        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS (Bearer Token)
                         ▼
              ┌──────────────────────┐
              │   Resend API Server   │
              │   (api.resend.com)   │
              └──────────────────────┘
```

### 2.2 Project Structure

```
resend-cli/
├── src/
│   ├── index.ts                 # Entry point, CLI setup
│   ├── commands/                # Command implementations
│   │   ├── emails/              # Email commands
│   │   │   ├── send.ts          # Send single email
│   │   │   ├── send-batch.ts    # Send batch emails
│   │   │   ├── get.ts           # Get email status
│   │   │   ├── list.ts          # List sent emails
│   │   │   ├── update.ts        # Update scheduled email
│   │   │   └── cancel.ts        # Cancel scheduled email
│   │   ├── domains/             # Domain management
│   │   │   ├── list.ts
│   │   │   ├── add.ts
│   │   │   ├── verify.ts
│   │   │   ├── get.ts
│   │   │   ├── update.ts
│   │   │   └── delete.ts
│   │   ├── api-keys/            # API key management
│   │   │   ├── list.ts
│   │   │   ├── create.ts
│   │   │   └── delete.ts
│   │   ├── audiences/           # Audience management
│   │   │   ├── list.ts
│   │   │   ├── create.ts
│   │   │   ├── get.ts
│   │   │   ├── update.ts
│   │   │   └── delete.ts
│   │   ├── contacts/            # Contact management
│   │   │   ├── list.ts
│   │   │   ├── create.ts
│   │   │   ├── get.ts
│   │   │   ├── update.ts
│   │   │   ├── delete.ts
│   │   │   └── import.ts        # Bulk import from CSV
│   │   ├── broadcasts/          # Broadcast management
│   │   │   ├── list.ts
│   │   │   ├── create.ts
│   │   │   ├── get.ts
│   │   │   ├── update.ts
│   │   │   ├── send.ts
│   │   │   └── delete.ts
│   │   └── webhooks/            # Webhook management
│   │       ├── list.ts
│   │       ├── create.ts
│   │       ├── get.ts
│   │       ├── update.ts
│   │       └── delete.ts
│   ├── lib/                     # Shared utilities
│   │   ├── api-client.ts        # Resend API wrapper
│   │   ├── config.ts            # Config file management
│   │   ├── formatters.ts        # Output formatting
│   │   ├── validators.ts        # Input validation
│   │   ├── errors.ts            # Error handling
│   │   └── templates.ts         # Email template helpers
│   ├── types/                   # TypeScript type definitions
│   │   ├── api.ts               # API request/response types
│   │   ├── config.ts            # Configuration types
│   │   └── commands.ts          # Command option types
│   └── constants/               # Constants and enums
│       ├── api.ts               # API endpoints, defaults
│       └── messages.ts          # User-facing messages
├── tests/                       # Test files
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── fixtures/                # Test data
├── docs/                        # Documentation
│   ├── SRD.md                   # This document
│   ├── API.md                   # API reference
│   ├── EXAMPLES.md              # Usage examples
│   └── CONTRIBUTING.md          # Contribution guide
├── package.json
├── tsconfig.json
├── bun.lockb
├── .env.example                 # Example environment variables
└── README.md
```

### 2.3 Data Flow Diagrams

#### Email Sending Flow

```
User Command                API Client              Resend API
    │                           │                       │
    │ resend send --from        │                       │
    │   "from@example.com"      │                       │
    │   --to "to@example.com"   │                       │
    │   --subject "Test"        │                       │
    │   --text "Hello"          │                       │
    ├──────────────────────────>│                       │
    │                           │                       │
    │                           │ 1. Validate inputs    │
    │                           │ 2. Load API key       │
    │                           │ 3. Build request      │
    │                           │                       │
    │                           │ POST /emails          │
    │                           ├──────────────────────>│
    │                           │ Authorization: Bearer │
    │                           │ Content-Type: json    │
    │                           │                       │
    │                           │                       │ 4. Queue email
    │                           │                       │ 5. Return email ID
    │                           │                       │
    │                           │ 200 OK                │
    │                           │ {"id": "abc123"}      │
    │                           │<──────────────────────┤
    │                           │                       │
    │                           │ 6. Format output      │
    │ Email sent: abc123        │                       │
    │<──────────────────────────┤                       │
    │                           │                       │
```

#### Configuration Management Flow

```
┌─────────────────────────────────────────────────────────┐
│              Configuration Priority Order                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Command-line flags (highest priority)                │
│     └─> --api-key re_xxx                                │
│                                                          │
│  2. Environment variables                                │
│     └─> RESEND_API_KEY=re_xxx                          │
│                                                          │
│  3. Config file (~/.resend/config.json)                 │
│     └─> { "apiKey": "re_xxx" }                          │
│                                                          │
│  4. Interactive prompt (if no config found)              │
│     └─> "Enter your Resend API key:"                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Technology Decisions

#### Why Bun?

**Performance:**
- 3x faster startup time compared to Node.js
- Built-in TypeScript compilation (no separate build step)
- Fast package installation and test execution

**Developer Experience:**
- Single binary distribution (easy installation)
- Built-in test runner (no Jest/Mocha dependency)
- Native TypeScript support (no ts-node required)
- Built-in bundler for creating standalone executables

**Production Ready:**
- Stable 1.0+ release
- Growing ecosystem and community
- Compatible with most npm packages
- Excellent Node.js compatibility layer

#### Why Commander.js?

**Industry Standard:**
- Used by 10M+ npm downloads per week
- Battle-tested in thousands of CLI tools
- Excellent documentation and examples

**Feature Rich:**
- Git-style subcommands
- Automatic help generation
- Option parsing with validation
- TypeScript type definitions included

**Developer Friendly:**
- Intuitive API design
- Chainable command definitions
- Built-in error handling
- Flexible argument parsing

### 2.5 Security Architecture

#### API Key Management

```
┌──────────────────────────────────────────────────────┐
│              API Key Security Model                   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Storage Location: ~/.resend/config.json             │
│  Permissions: 600 (owner read/write only)            │
│                                                       │
│  Config File Format:                                  │
│  {                                                    │
│    "apiKey": "re_xxxxxxxxxxxx",                      │
│    "defaultFrom": "noreply@example.com"              │
│  }                                                    │
│                                                       │
│  Never Log:                                           │
│  - Full API key values (mask to re_xxx...xxx)        │
│  - Sensitive email content in debug mode             │
│                                                       │
│  Validate:                                            │
│  - API key format (re_ prefix)                       │
│  - HTTPS connections only                            │
│  - Certificate verification enabled                  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### Error Handling Security

- Never expose full API keys in error messages
- Sanitize user input before logging
- Mask email addresses in public logs (optional)
- Rate limit suggestions on 429 errors
- Clear guidance on authentication failures

### 2.6 Integration Points

#### Resend API

- **Base URL:** `https://api.resend.com`
- **Authentication:** Bearer token in Authorization header
- **Content-Type:** `application/json`
- **Rate Limits:**
  - Free tier: 100 emails/day, 10 requests/second
  - Paid tiers: Higher limits based on plan

#### External Dependencies

| Dependency | Purpose | License |
|------------|---------|---------|
| commander | CLI framework | MIT |
| chalk (optional) | Terminal colors | MIT |
| cli-table3 (optional) | Table formatting | MIT |
| ora (optional) | Spinners for async ops | MIT |

**Design Decision:** Minimize dependencies where possible. Use Bun's built-in capabilities for:
- File I/O
- HTTP requests (fetch)
- JSON parsing
- Path manipulation
- Environment variables

---

## 3. Feature Breakdown

### 3.1 Email Management

#### 3.1.1 Send Single Email

**User Story:**
As a developer, I want to send a single email from the command line so that I can quickly test email delivery without writing code.

**Command Syntax:**
```bash
resend send [options]
resend email send [options]  # Alternative
```

**Options:**
```
Required:
  --from <email>           Sender email address (e.g., "Name <email@domain.com>")
  --to <email...>          Recipient email(s) (space-separated, max 50)
  --subject <text>         Email subject line

Content (at least one required):
  --text <text>            Plain text body
  --html <html>            HTML body
  --html-file <path>       Path to HTML file
  --template <id>          Template ID or alias
  --template-vars <json>   Template variables as JSON string

Optional:
  --cc <email...>          CC recipients
  --bcc <email...>         BCC recipients
  --reply-to <email>       Reply-to address
  --attach <path...>       File attachments (max 40MB total)
  --headers <json>         Custom headers as JSON string
  --tags <json>            Tags as JSON string {"key": "value"}
  --scheduled-at <time>    Schedule delivery (ISO 8601 or natural language)
  --topic-id <id>          Topic ID for subscription management
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Simple text email
resend send \
  --from "app@example.com" \
  --to "user@example.com" \
  --subject "Welcome!" \
  --text "Welcome to our service!"

# HTML email with friendly name
resend send \
  --from "My App <app@example.com>" \
  --to "user@example.com" \
  --subject "Weekly Newsletter" \
  --html-file newsletter.html

# Email with CC, BCC, and attachments
resend send \
  --from "sender@example.com" \
  --to "user1@example.com" "user2@example.com" \
  --cc "manager@example.com" \
  --bcc "archive@example.com" \
  --subject "Monthly Report" \
  --html-file report.html \
  --attach report.pdf chart.png

# Using a template
resend send \
  --from "app@example.com" \
  --to "user@example.com" \
  --subject "Password Reset" \
  --template "password-reset" \
  --template-vars '{"reset_url": "https://app.com/reset/abc123", "user_name": "John"}'

# Scheduled email
resend send \
  --from "app@example.com" \
  --to "user@example.com" \
  --subject "Reminder" \
  --text "This is your reminder!" \
  --scheduled-at "2026-02-10T09:00:00Z"

# JSON output for scripting
resend send \
  --from "app@example.com" \
  --to "user@example.com" \
  --subject "Test" \
  --text "Test message" \
  --output json
```

**Response Format (Pretty):**
```
✓ Email sent successfully!

ID: 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794
From: app@example.com
To: user@example.com
Subject: Test
Status: queued
```

**Response Format (JSON):**
```json
{
  "success": true,
  "data": {
    "id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"
  }
}
```

**Functional Requirements:**
- FR-EMAIL-001: Support sending to up to 50 recipients in a single command
- FR-EMAIL-002: Accept both inline content and file paths for HTML/text
- FR-EMAIL-003: Validate email addresses before sending
- FR-EMAIL-004: Support attachments up to 40MB total size
- FR-EMAIL-005: Base64 encode attachments automatically
- FR-EMAIL-006: Parse and validate template variables as valid JSON
- FR-EMAIL-007: Support natural language scheduling ("tomorrow at 9am", "in 2 hours")
- FR-EMAIL-008: Provide idempotency key support to prevent duplicate sends

**Non-Functional Requirements:**
- NFR-EMAIL-001: Command should complete in under 2 seconds for simple emails
- NFR-EMAIL-002: Clear error messages for all validation failures
- NFR-EMAIL-003: Progress indicator for large attachments
- NFR-EMAIL-004: Warn if attachment size approaches limits

---

#### 3.1.2 Send Batch Emails

**User Story:**
As a developer, I want to send multiple emails in a single API call so that I can efficiently send many emails with different content.

**Command Syntax:**
```bash
resend send-batch <file>
resend batch send <file>  # Alternative
```

**Options:**
```
Required:
  <file>                   Path to JSON file with email definitions

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
  --max-concurrent <n>     Max concurrent sends (default: 100)
```

**Input File Format (JSON):**
```json
[
  {
    "from": "app@example.com",
    "to": "user1@example.com",
    "subject": "Welcome!",
    "text": "Welcome to our service!"
  },
  {
    "from": "app@example.com",
    "to": "user2@example.com",
    "subject": "Welcome!",
    "text": "Welcome to our service!"
  }
]
```

**Examples:**
```bash
# Send batch from JSON file
resend send-batch emails.json

# Send batch with custom concurrency
resend send-batch emails.json --max-concurrent 50

# JSON output for scripting
resend send-batch emails.json --output json
```

**Response Format (Pretty):**
```
✓ Batch sent successfully!

Total: 2 emails
Succeeded: 2
Failed: 0

Email IDs:
  1. 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794
  2. 7b2c888d-1df2-5fb7-bc79-bedb7ed3f905
```

**Functional Requirements:**
- FR-BATCH-001: Support up to 100 emails per batch
- FR-BATCH-002: Validate JSON file format before sending
- FR-BATCH-003: Provide detailed error messages for each failed email
- FR-BATCH-004: Support all single email options in batch format
- FR-BATCH-005: Allow mixing of different email types (templates, HTML, text)

**Non-Functional Requirements:**
- NFR-BATCH-001: Process batch files up to 10MB
- NFR-BATCH-002: Show progress indicator for large batches
- NFR-BATCH-003: Fail fast on invalid JSON format

---

#### 3.1.3 Get Email Status

**User Story:**
As a developer, I want to check the status of a sent email so that I can verify delivery and debug issues.

**Command Syntax:**
```bash
resend get <email-id>
resend email get <email-id>  # Alternative
```

**Options:**
```
Required:
  <email-id>               Email ID returned from send command

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table (default: pretty)
```

**Examples:**
```bash
# Get email status
resend get 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794

# JSON output
resend get 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794 --output json

# Table format
resend get 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794 --output table
```

**Response Format (Pretty):**
```
Email: 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794

From: app@example.com
To: user@example.com
Subject: Welcome!
Status: delivered
Created: 2026-02-07T10:30:45Z
Last Event: 2026-02-07T10:31:12Z
```

**Functional Requirements:**
- FR-GET-001: Retrieve email metadata from Resend API
- FR-GET-002: Display email status (queued, sent, delivered, bounced, etc.)
- FR-GET-003: Show timestamp of last status update
- FR-GET-004: Handle not found errors gracefully

---

#### 3.1.4 List Sent Emails

**User Story:**
As a developer, I want to list recently sent emails so that I can audit email activity and find specific email IDs.

**Command Syntax:**
```bash
resend list [options]
resend email list [options]  # Alternative
```

**Options:**
```
Optional:
  --limit <n>              Number of emails to retrieve (default: 20, max: 100)
  --offset <n>             Pagination offset (default: 0)
  --from <email>           Filter by sender email
  --to <email>             Filter by recipient email
  --subject <text>         Filter by subject (partial match)
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table (default: table)
```

**Examples:**
```bash
# List recent emails
resend list

# List with custom limit
resend list --limit 50

# Filter by sender
resend list --from "app@example.com"

# Filter by recipient
resend list --to "user@example.com"

# JSON output for scripting
resend list --output json
```

**Response Format (Table):**
```
┌──────────────────────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┬───────────┐
│ ID                                   │ From                │ To                  │ Subject             │ Status    │
├──────────────────────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┼───────────┤
│ 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794 │ app@example.com     │ user@example.com    │ Welcome!            │ delivered │
│ 7b2c888d-1df2-5fb7-bc79-bedb7ed3f905 │ app@example.com     │ user2@example.com   │ Newsletter          │ sent      │
└──────────────────────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┴───────────┘

Total: 2 emails
```

**Functional Requirements:**
- FR-LIST-001: Support pagination for large email lists
- FR-LIST-002: Filter by common email attributes
- FR-LIST-003: Sort by date (newest first by default)
- FR-LIST-004: Display truncated content for readability

---

#### 3.1.5 Update Scheduled Email

**User Story:**
As a developer, I want to update a scheduled email before it sends so that I can correct mistakes or change content.

**Command Syntax:**
```bash
resend update <email-id> [options]
resend email update <email-id> [options]  # Alternative
```

**Options:**
```
Required:
  <email-id>               Scheduled email ID

Optional (at least one required):
  --scheduled-at <time>    New scheduled time
  --subject <text>         New subject
  --text <text>            New plain text body
  --html <html>            New HTML body
  --html-file <path>       Path to new HTML file
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Update scheduled time
resend update 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794 \
  --scheduled-at "2026-02-10T12:00:00Z"

# Update subject and content
resend update 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794 \
  --subject "Updated Subject" \
  --text "Updated content"
```

**Functional Requirements:**
- FR-UPDATE-001: Only allow updates to scheduled (not sent) emails
- FR-UPDATE-002: Validate new scheduled time is in the future
- FR-UPDATE-003: Support partial updates (only changed fields)
- FR-UPDATE-004: Return clear error if email already sent

---

#### 3.1.6 Cancel Scheduled Email

**User Story:**
As a developer, I want to cancel a scheduled email so that I can prevent it from being sent.

**Command Syntax:**
```bash
resend cancel <email-id>
resend email cancel <email-id>  # Alternative
```

**Options:**
```
Required:
  <email-id>               Scheduled email ID

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
  --force                  Skip confirmation prompt
```

**Examples:**
```bash
# Cancel with confirmation
resend cancel 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794

# Cancel without confirmation
resend cancel 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794 --force
```

**Response Format (Pretty):**
```
✓ Email cancelled successfully!

ID: 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794
Status: cancelled
```

**Functional Requirements:**
- FR-CANCEL-001: Prevent cancellation of already sent emails
- FR-CANCEL-002: Show confirmation prompt unless --force used
- FR-CANCEL-003: Provide clear error if cancellation fails

---

### 3.2 Domain Management

#### 3.2.1 List Domains

**User Story:**
As a developer, I want to list all domains in my Resend account so that I can see which domains are configured for sending.

**Command Syntax:**
```bash
resend domains list [options]
resend domain ls [options]  # Alternative
```

**Options:**
```
Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table (default: table)
```

**Examples:**
```bash
# List all domains
resend domains list

# JSON output
resend domains list --output json
```

**Response Format (Table):**
```
┌──────────────────────────────────────┬─────────────────────┬──────────┬───────────┬────────────────────────┐
│ ID                                   │ Name                │ Status   │ Region    │ Created                │
├──────────────────────────────────────┼─────────────────────┼──────────┼───────────┼────────────────────────┤
│ d91cd9bd-1176-453e-8fc1-35364d380206 │ example.com         │ verified │ us-east-1 │ 2026-01-15T10:30:00Z   │
│ 3b7e9f1c-2e4d-4a8f-9c6b-1d2e3f4a5b6c │ mail.example.com    │ pending  │ us-east-1 │ 2026-02-01T14:20:00Z   │
└──────────────────────────────────────┴─────────────────────┴──────────┴───────────┴────────────────────────┘

Total: 2 domains
```

**Functional Requirements:**
- FR-DOMAIN-LIST-001: Display all domains with key attributes
- FR-DOMAIN-LIST-002: Show verification status for each domain
- FR-DOMAIN-LIST-003: Include DNS record status indicators

---

#### 3.2.2 Add Domain

**User Story:**
As a developer, I want to add a new domain to my Resend account so that I can send emails from that domain.

**Command Syntax:**
```bash
resend domains add <domain> [options]
resend domain add <domain> [options]  # Alternative
```

**Options:**
```
Required:
  <domain>                 Domain name (e.g., example.com)

Optional:
  --region <region>        Region (default: us-east-1)
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Add domain
resend domains add example.com

# Add domain with custom region
resend domains add example.com --region eu-west-1

# JSON output
resend domains add example.com --output json
```

**Response Format (Pretty):**
```
✓ Domain added successfully!

ID: d91cd9bd-1176-453e-8fc1-35364d380206
Domain: example.com
Status: pending
Region: us-east-1

Next steps:
1. Add the following DNS records to verify your domain:

   TXT Record:
   Name: _resend
   Value: re=abc123xyz

   DKIM Record:
   Name: resend._domainkey
   Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqG...

   MX Record:
   Name: @
   Value: 10 mx.resend.com

2. Run 'resend domains verify d91cd9bd-1176-453e-8fc1-35364d380206' to verify
```

**Functional Requirements:**
- FR-DOMAIN-ADD-001: Validate domain format before adding
- FR-DOMAIN-ADD-002: Return DNS records needed for verification
- FR-DOMAIN-ADD-003: Support custom regions
- FR-DOMAIN-ADD-004: Provide clear next steps after adding

---

#### 3.2.3 Verify Domain

**User Story:**
As a developer, I want to verify my domain's DNS records so that I can start sending emails from that domain.

**Command Syntax:**
```bash
resend domains verify <domain-id>
resend domain verify <domain-id>  # Alternative
```

**Options:**
```
Required:
  <domain-id>              Domain ID or domain name

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Verify by domain ID
resend domains verify d91cd9bd-1176-453e-8fc1-35364d380206

# Verify by domain name
resend domains verify example.com
```

**Response Format (Pretty - Success):**
```
✓ Domain verified successfully!

Domain: example.com
Status: verified

DNS Records:
  ✓ TXT Record: _resend
  ✓ DKIM Record: resend._domainkey
  ✓ MX Record: @

You can now send emails from example.com
```

**Response Format (Pretty - Failure):**
```
✗ Domain verification failed

Domain: example.com
Status: pending

DNS Records:
  ✓ TXT Record: _resend
  ✗ DKIM Record: resend._domainkey (not found)
  ✗ MX Record: @ (incorrect value)

Please check your DNS records and try again in a few minutes.
DNS propagation can take up to 48 hours.
```

**Functional Requirements:**
- FR-DOMAIN-VERIFY-001: Check all required DNS records
- FR-DOMAIN-VERIFY-002: Provide detailed status for each record
- FR-DOMAIN-VERIFY-003: Allow lookup by domain ID or name
- FR-DOMAIN-VERIFY-004: Suggest waiting for DNS propagation if records not found

---

#### 3.2.4 Get Domain Details

**User Story:**
As a developer, I want to view detailed information about a domain so that I can check its configuration and status.

**Command Syntax:**
```bash
resend domains get <domain-id>
resend domain get <domain-id>  # Alternative
```

**Options:**
```
Required:
  <domain-id>              Domain ID or domain name

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Get domain details
resend domains get example.com

# JSON output
resend domains get example.com --output json
```

**Response Format (Pretty):**
```
Domain: example.com

ID: d91cd9bd-1176-453e-8fc1-35364d380206
Status: verified
Region: us-east-1
Created: 2026-01-15T10:30:00Z

DNS Records:
  TXT: _resend.example.com → re=abc123xyz ✓
  DKIM: resend._domainkey.example.com → v=DKIM1... ✓
  MX: example.com → 10 mx.resend.com ✓

Statistics (Last 30 days):
  Sent: 1,234
  Delivered: 1,200
  Bounced: 12
  Opened: 890
```

**Functional Requirements:**
- FR-DOMAIN-GET-001: Display complete domain configuration
- FR-DOMAIN-GET-002: Show DNS record verification status
- FR-DOMAIN-GET-003: Include sending statistics if available
- FR-DOMAIN-GET-004: Support lookup by ID or domain name

---

#### 3.2.5 Update Domain

**User Story:**
As a developer, I want to update domain settings so that I can change configuration options.

**Command Syntax:**
```bash
resend domains update <domain-id> [options]
resend domain update <domain-id> [options]  # Alternative
```

**Options:**
```
Required:
  <domain-id>              Domain ID or domain name

Optional (at least one required):
  --region <region>        New region
  --tracking-open          Enable open tracking (true/false)
  --tracking-click         Enable click tracking (true/false)
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Update region
resend domains update example.com --region eu-west-1

# Enable tracking
resend domains update example.com --tracking-open true --tracking-click true
```

**Functional Requirements:**
- FR-DOMAIN-UPDATE-001: Support updating configurable domain settings
- FR-DOMAIN-UPDATE-002: Validate region values
- FR-DOMAIN-UPDATE-003: Allow partial updates

---

#### 3.2.6 Delete Domain

**User Story:**
As a developer, I want to delete a domain from my account so that I can remove domains I no longer use.

**Command Syntax:**
```bash
resend domains delete <domain-id>
resend domain rm <domain-id>  # Alternative
```

**Options:**
```
Required:
  <domain-id>              Domain ID or domain name

Optional:
  --force                  Skip confirmation prompt
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Delete with confirmation
resend domains delete example.com

# Delete without confirmation
resend domains delete example.com --force
```

**Response Format (Pretty):**
```
⚠ Are you sure you want to delete example.com?
  This action cannot be undone.
  Type 'yes' to confirm: yes

✓ Domain deleted successfully!

Domain: example.com
ID: d91cd9bd-1176-453e-8fc1-35364d380206
```

**Functional Requirements:**
- FR-DOMAIN-DELETE-001: Require confirmation unless --force used
- FR-DOMAIN-DELETE-002: Prevent deletion of domains with pending emails
- FR-DOMAIN-DELETE-003: Provide clear warning about consequences

---

### 3.3 API Key Management

#### 3.3.1 List API Keys

**User Story:**
As a developer, I want to list all API keys in my account so that I can audit access and manage credentials.

**Command Syntax:**
```bash
resend api-keys list [options]
resend keys list [options]  # Alternative
```

**Options:**
```
Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table (default: table)
```

**Examples:**
```bash
# List all API keys
resend api-keys list

# JSON output
resend api-keys list --output json
```

**Response Format (Table):**
```
┌──────────────────────────────────────┬───────────────────┬───────────────┬────────────────────────┐
│ ID                                   │ Name              │ Permission    │ Created                │
├──────────────────────────────────────┼───────────────────┼───────────────┼────────────────────────┤
│ re_abc123...                         │ Production        │ full_access   │ 2026-01-15T10:30:00Z   │
│ re_xyz789...                         │ CI/CD             │ sending_only  │ 2026-02-01T14:20:00Z   │
└──────────────────────────────────────┴───────────────────┴───────────────┴────────────────────────┘

Total: 2 API keys
```

**Functional Requirements:**
- FR-KEY-LIST-001: Display all API keys with masked values
- FR-KEY-LIST-002: Show permission level for each key
- FR-KEY-LIST-003: Include creation date
- FR-KEY-LIST-004: Never display full API key values

---

#### 3.3.2 Create API Key

**User Story:**
As a developer, I want to create new API keys so that I can grant different access levels to different applications.

**Command Syntax:**
```bash
resend api-keys create <name> [options]
resend keys create <name> [options]  # Alternative
```

**Options:**
```
Required:
  <name>                   Name for the API key

Optional:
  --permission <level>     Permission level: full_access, sending_access (default: sending_access)
  --domain-id <id>         Restrict to specific domain
  --api-key <key>          Override default API key (must have full_access)
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Create sending-only key
resend api-keys create "CI/CD Pipeline"

# Create full access key
resend api-keys create "Production" --permission full_access

# Create domain-restricted key
resend api-keys create "Marketing" --domain-id d91cd9bd-1176-453e-8fc1-35364d380206
```

**Response Format (Pretty):**
```
✓ API key created successfully!

Name: CI/CD Pipeline
Key: re_abc123xyz789...
Permission: sending_access
Created: 2026-02-07T10:30:00Z

⚠ IMPORTANT: Save this key now. You won't be able to see it again.

To use this key:
  export RESEND_API_KEY="re_abc123xyz789..."

Or save to config:
  resend config set --api-key "re_abc123xyz789..."
```

**Functional Requirements:**
- FR-KEY-CREATE-001: Support both full_access and sending_access permissions
- FR-KEY-CREATE-002: Display full API key only once at creation
- FR-KEY-CREATE-003: Warn user to save the key immediately
- FR-KEY-CREATE-004: Support domain-specific restrictions
- FR-KEY-CREATE-005: Validate name is non-empty

**Non-Functional Requirements:**
- NFR-KEY-CREATE-001: Emphasize security warning prominently
- NFR-KEY-CREATE-002: Provide usage examples after creation

---

#### 3.3.3 Delete API Key

**User Story:**
As a developer, I want to delete API keys so that I can revoke access when keys are compromised or no longer needed.

**Command Syntax:**
```bash
resend api-keys delete <key-id>
resend keys rm <key-id>  # Alternative
```

**Options:**
```
Required:
  <key-id>                 API key ID (not the full key value)

Optional:
  --force                  Skip confirmation prompt
  --api-key <key>          Override default API key (must have full_access)
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Delete with confirmation
resend api-keys delete re_abc123

# Delete without confirmation
resend api-keys delete re_abc123 --force
```

**Response Format (Pretty):**
```
⚠ Are you sure you want to delete this API key?
  Name: CI/CD Pipeline
  ID: re_abc123...
  This action cannot be undone.
  Type 'yes' to confirm: yes

✓ API key deleted successfully!

Key: re_abc123...
Name: CI/CD Pipeline
```

**Functional Requirements:**
- FR-KEY-DELETE-001: Require confirmation unless --force used
- FR-KEY-DELETE-002: Prevent self-deletion (cannot delete the key being used)
- FR-KEY-DELETE-003: Show key name in confirmation prompt
- FR-KEY-DELETE-004: Require full_access permission

---

### 3.4 Audience Management

#### 3.4.1 List Audiences

**User Story:**
As a developer, I want to list all audiences so that I can see which contact lists are available for broadcasts.

**Command Syntax:**
```bash
resend audiences list [options]
resend audience ls [options]  # Alternative
```

**Options:**
```
Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table (default: table)
```

**Examples:**
```bash
# List all audiences
resend audiences list

# JSON output
resend audiences list --output json
```

**Response Format (Table):**
```
┌──────────────────────────────────────┬────────────────────┬─────────────┬────────────────────────┐
│ ID                                   │ Name               │ Contacts    │ Created                │
├──────────────────────────────────────┼────────────────────┼─────────────┼────────────────────────┤
│ aud_abc123                           │ Newsletter         │ 1,234       │ 2026-01-15T10:30:00Z   │
│ aud_xyz789                           │ Product Updates    │ 567         │ 2026-02-01T14:20:00Z   │
└──────────────────────────────────────┴────────────────────┴─────────────┴────────────────────────┘

Total: 2 audiences
```

**Functional Requirements:**
- FR-AUD-LIST-001: Display all audiences with contact counts
- FR-AUD-LIST-002: Sort by creation date (newest first)
- FR-AUD-LIST-003: Show total contact count

---

#### 3.4.2 Create Audience

**User Story:**
As a developer, I want to create a new audience so that I can organize contacts into different lists.

**Command Syntax:**
```bash
resend audiences create <name> [options]
resend audience create <name> [options]  # Alternative
```

**Options:**
```
Required:
  <name>                   Audience name

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Create audience
resend audiences create "Newsletter Subscribers"

# JSON output
resend audiences create "Product Updates" --output json
```

**Response Format (Pretty):**
```
✓ Audience created successfully!

ID: aud_abc123
Name: Newsletter Subscribers
Contacts: 0
Created: 2026-02-07T10:30:00Z

Next steps:
  Add contacts: resend contacts create aud_abc123 --email user@example.com
  Import CSV: resend contacts import aud_abc123 contacts.csv
```

**Functional Requirements:**
- FR-AUD-CREATE-001: Validate name is non-empty and unique
- FR-AUD-CREATE-002: Return audience ID for adding contacts
- FR-AUD-CREATE-003: Provide next steps guidance

---

#### 3.4.3 Get Audience Details

**User Story:**
As a developer, I want to view details about an audience so that I can check its configuration and contact count.

**Command Syntax:**
```bash
resend audiences get <audience-id>
resend audience get <audience-id>  # Alternative
```

**Options:**
```
Required:
  <audience-id>            Audience ID

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Get audience details
resend audiences get aud_abc123

# JSON output
resend audiences get aud_abc123 --output json
```

**Response Format (Pretty):**
```
Audience: Newsletter Subscribers

ID: aud_abc123
Contacts: 1,234
Created: 2026-01-15T10:30:00Z

Recent Activity:
  Last contact added: 2026-02-07T09:15:00Z
  Last broadcast sent: 2026-02-06T14:30:00Z
```

**Functional Requirements:**
- FR-AUD-GET-001: Display complete audience information
- FR-AUD-GET-002: Show contact count
- FR-AUD-GET-003: Include recent activity if available

---

#### 3.4.4 Update Audience

**User Story:**
As a developer, I want to update audience properties so that I can rename or modify settings.

**Command Syntax:**
```bash
resend audiences update <audience-id> [options]
resend audience update <audience-id> [options]  # Alternative
```

**Options:**
```
Required:
  <audience-id>            Audience ID

Optional (at least one required):
  --name <name>            New audience name
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Rename audience
resend audiences update aud_abc123 --name "Weekly Newsletter"
```

**Functional Requirements:**
- FR-AUD-UPDATE-001: Support renaming audiences
- FR-AUD-UPDATE-002: Validate new name is non-empty

---

#### 3.4.5 Delete Audience

**User Story:**
As a developer, I want to delete an audience so that I can remove lists I no longer need.

**Command Syntax:**
```bash
resend audiences delete <audience-id>
resend audience rm <audience-id>  # Alternative
```

**Options:**
```
Required:
  <audience-id>            Audience ID

Optional:
  --force                  Skip confirmation prompt
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Delete with confirmation
resend audiences delete aud_abc123

# Delete without confirmation
resend audiences delete aud_abc123 --force
```

**Response Format (Pretty):**
```
⚠ Are you sure you want to delete this audience?
  Name: Newsletter Subscribers
  Contacts: 1,234
  This action cannot be undone. Contacts will NOT be deleted.
  Type 'yes' to confirm: yes

✓ Audience deleted successfully!

ID: aud_abc123
Name: Newsletter Subscribers
```

**Functional Requirements:**
- FR-AUD-DELETE-001: Require confirmation unless --force used
- FR-AUD-DELETE-002: Show contact count in confirmation
- FR-AUD-DELETE-003: Clarify that contacts are not deleted (they're global)
- FR-AUD-DELETE-004: Prevent deletion if pending broadcasts exist

---

### 3.5 Contact Management

#### 3.5.1 List Contacts

**User Story:**
As a developer, I want to list contacts in an audience so that I can see who is subscribed.

**Command Syntax:**
```bash
resend contacts list <audience-id> [options]
resend contact ls <audience-id> [options]  # Alternative
```

**Options:**
```
Required:
  <audience-id>            Audience ID

Optional:
  --limit <n>              Number of contacts to retrieve (default: 20, max: 100)
  --offset <n>             Pagination offset (default: 0)
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table, csv (default: table)
```

**Examples:**
```bash
# List contacts in audience
resend contacts list aud_abc123

# Export to CSV
resend contacts list aud_abc123 --output csv > contacts.csv

# Paginate through results
resend contacts list aud_abc123 --limit 50 --offset 50
```

**Response Format (Table):**
```
┌──────────────────────────────────────┬───────────────────────┬──────────────┬──────────────┬────────────────────────┐
│ ID                                   │ Email                 │ First Name   │ Last Name    │ Created                │
├──────────────────────────────────────┼───────────────────────┼──────────────┼──────────────┼────────────────────────┤
│ con_abc123                           │ user1@example.com     │ John         │ Doe          │ 2026-01-15T10:30:00Z   │
│ con_xyz789                           │ user2@example.com     │ Jane         │ Smith        │ 2026-02-01T14:20:00Z   │
└──────────────────────────────────────┴───────────────────────┴──────────────┴──────────────┴────────────────────────┘

Total: 2 contacts
```

**Functional Requirements:**
- FR-CONTACT-LIST-001: Support pagination for large audiences
- FR-CONTACT-LIST-002: Export to CSV format
- FR-CONTACT-LIST-003: Display custom fields if present
- FR-CONTACT-LIST-004: Show subscription status

---

#### 3.5.2 Create Contact

**User Story:**
As a developer, I want to add a contact to an audience so that they receive broadcasts sent to that list.

**Command Syntax:**
```bash
resend contacts create <audience-id> --email <email> [options]
resend contact add <audience-id> --email <email> [options]  # Alternative
```

**Options:**
```
Required:
  <audience-id>            Audience ID
  --email <email>          Contact email address

Optional:
  --first-name <name>      First name
  --last-name <name>       Last name
  --unsubscribed           Add as unsubscribed (default: false)
  --custom <json>          Custom fields as JSON string
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Add contact
resend contacts create aud_abc123 --email "user@example.com"

# Add with names
resend contacts create aud_abc123 \
  --email "user@example.com" \
  --first-name "John" \
  --last-name "Doe"

# Add with custom fields
resend contacts create aud_abc123 \
  --email "user@example.com" \
  --custom '{"company": "Acme Inc", "role": "Developer"}'
```

**Response Format (Pretty):**
```
✓ Contact created successfully!

ID: con_abc123
Email: user@example.com
First Name: John
Last Name: Doe
Audience: Newsletter Subscribers
Status: subscribed
Created: 2026-02-07T10:30:00Z
```

**Functional Requirements:**
- FR-CONTACT-CREATE-001: Validate email address format
- FR-CONTACT-CREATE-002: Support custom fields (up to 10 per contact)
- FR-CONTACT-CREATE-003: Prevent duplicate emails in same audience
- FR-CONTACT-CREATE-004: Auto-create contact if email doesn't exist globally
- FR-CONTACT-CREATE-005: Link existing global contact to audience if email exists

---

#### 3.5.3 Get Contact Details

**User Story:**
As a developer, I want to view details about a contact so that I can check their information and subscription status.

**Command Syntax:**
```bash
resend contacts get <contact-id>
resend contact get <contact-id>  # Alternative
```

**Options:**
```
Required:
  <contact-id>             Contact ID or email address

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Get by contact ID
resend contacts get con_abc123

# Get by email
resend contacts get user@example.com
```

**Response Format (Pretty):**
```
Contact: user@example.com

ID: con_abc123
Email: user@example.com
First Name: John
Last Name: Doe
Status: subscribed
Created: 2026-01-15T10:30:00Z

Audiences:
  - Newsletter Subscribers (aud_abc123)
  - Product Updates (aud_xyz789)

Custom Fields:
  company: Acme Inc
  role: Developer
```

**Functional Requirements:**
- FR-CONTACT-GET-001: Display complete contact information
- FR-CONTACT-GET-002: Show all audiences contact belongs to
- FR-CONTACT-GET-003: Display custom fields
- FR-CONTACT-GET-004: Support lookup by ID or email

---

#### 3.5.4 Update Contact

**User Story:**
As a developer, I want to update contact information so that I can correct mistakes or add new data.

**Command Syntax:**
```bash
resend contacts update <contact-id> [options]
resend contact update <contact-id> [options]  # Alternative
```

**Options:**
```
Required:
  <contact-id>             Contact ID or email address

Optional (at least one required):
  --first-name <name>      New first name
  --last-name <name>       New last name
  --unsubscribed <bool>    Subscription status (true/false)
  --custom <json>          Update custom fields (merges with existing)
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Update names
resend contacts update con_abc123 \
  --first-name "John" \
  --last-name "Doe"

# Unsubscribe contact
resend contacts update user@example.com --unsubscribed true

# Update custom fields
resend contacts update con_abc123 \
  --custom '{"company": "New Company Inc"}'
```

**Functional Requirements:**
- FR-CONTACT-UPDATE-001: Support partial updates
- FR-CONTACT-UPDATE-002: Merge custom fields (don't replace all)
- FR-CONTACT-UPDATE-003: Validate unsubscribed is boolean
- FR-CONTACT-UPDATE-004: Support lookup by ID or email

---

#### 3.5.5 Delete Contact

**User Story:**
As a developer, I want to delete a contact so that I can comply with data removal requests.

**Command Syntax:**
```bash
resend contacts delete <contact-id>
resend contact rm <contact-id>  # Alternative
```

**Options:**
```
Required:
  <contact-id>             Contact ID or email address

Optional:
  --audience-id <id>       Remove from specific audience only (not global delete)
  --force                  Skip confirmation prompt
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Delete globally (all audiences)
resend contacts delete user@example.com

# Remove from specific audience
resend contacts delete user@example.com --audience-id aud_abc123

# Delete without confirmation
resend contacts delete con_abc123 --force
```

**Response Format (Pretty):**
```
⚠ Are you sure you want to delete this contact?
  Email: user@example.com
  Name: John Doe
  Audiences: 2
  This action cannot be undone.
  Type 'yes' to confirm: yes

✓ Contact deleted successfully!

Email: user@example.com
Deleted from: All audiences (global delete)
```

**Functional Requirements:**
- FR-CONTACT-DELETE-001: Require confirmation unless --force used
- FR-CONTACT-DELETE-002: Support global delete (all audiences)
- FR-CONTACT-DELETE-003: Support audience-specific removal
- FR-CONTACT-DELETE-004: Show which audiences will be affected
- FR-CONTACT-DELETE-005: Support lookup by ID or email

---

#### 3.5.6 Import Contacts

**User Story:**
As a developer, I want to bulk import contacts from a CSV file so that I can quickly add many contacts to an audience.

**Command Syntax:**
```bash
resend contacts import <audience-id> <file> [options]
resend contact import <audience-id> <file> [options]  # Alternative
```

**Options:**
```
Required:
  <audience-id>            Audience ID
  <file>                   Path to CSV file

Optional:
  --skip-header            Skip first row (default: true)
  --mapping <json>         Column mapping as JSON
  --on-duplicate <action>  Action: skip, update, error (default: skip)
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**CSV Format (Default):**
```csv
email,first_name,last_name
user1@example.com,John,Doe
user2@example.com,Jane,Smith
```

**Examples:**
```bash
# Import with default column mapping
resend contacts import aud_abc123 contacts.csv

# Custom column mapping
resend contacts import aud_abc123 contacts.csv \
  --mapping '{"0": "email", "1": "first_name", "2": "last_name"}'

# Update existing contacts
resend contacts import aud_abc123 contacts.csv --on-duplicate update
```

**Response Format (Pretty):**
```
Importing contacts from contacts.csv...

Progress: ████████████████████████████████ 100% (1000/1000)

✓ Import completed!

Total: 1000
Added: 950
Updated: 30
Skipped: 20
Errors: 0

Skipped contacts (duplicates):
  - user1@example.com
  - user2@example.com
  ...
```

**Functional Requirements:**
- FR-CONTACT-IMPORT-001: Support CSV files up to 100MB
- FR-CONTACT-IMPORT-002: Validate all email addresses before importing
- FR-CONTACT-IMPORT-003: Show progress indicator for large imports
- FR-CONTACT-IMPORT-004: Handle duplicate detection and resolution
- FR-CONTACT-IMPORT-005: Support custom column mapping
- FR-CONTACT-IMPORT-006: Batch API calls for efficiency (up to 1000 per batch)
- FR-CONTACT-IMPORT-007: Provide detailed summary report
- FR-CONTACT-IMPORT-008: Continue on individual errors, report at end

---

### 3.6 Broadcast Management

#### 3.6.1 List Broadcasts

**User Story:**
As a developer, I want to list all broadcasts so that I can see which campaigns have been sent or scheduled.

**Command Syntax:**
```bash
resend broadcasts list [options]
resend broadcast ls [options]  # Alternative
```

**Options:**
```
Optional:
  --status <status>        Filter by status: draft, scheduled, sending, sent
  --limit <n>              Number of broadcasts to retrieve (default: 20)
  --offset <n>             Pagination offset (default: 0)
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table (default: table)
```

**Examples:**
```bash
# List all broadcasts
resend broadcasts list

# List only sent broadcasts
resend broadcasts list --status sent

# Paginate results
resend broadcasts list --limit 50 --offset 50
```

**Response Format (Table):**
```
┌──────────────────────────────────────┬──────────────────────┬─────────────────┬──────────┬────────────────────────┐
│ ID                                   │ Name                 │ Audience        │ Status   │ Scheduled              │
├──────────────────────────────────────┼──────────────────────┼─────────────────┼──────────┼────────────────────────┤
│ brd_abc123                           │ Weekly Newsletter    │ Newsletter      │ sent     │ 2026-02-01T09:00:00Z   │
│ brd_xyz789                           │ Product Launch       │ All Users       │ draft    │ -                      │
└──────────────────────────────────────┴──────────────────────┴─────────────────┴──────────┴────────────────────────┘

Total: 2 broadcasts
```

**Functional Requirements:**
- FR-BROADCAST-LIST-001: Display all broadcasts with key attributes
- FR-BROADCAST-LIST-002: Filter by status
- FR-BROADCAST-LIST-003: Support pagination
- FR-BROADCAST-LIST-004: Show scheduled time for scheduled broadcasts

---

#### 3.6.2 Create Broadcast

**User Story:**
As a developer, I want to create a broadcast so that I can send emails to an entire audience.

**Command Syntax:**
```bash
resend broadcasts create <audience-id> [options]
resend broadcast create <audience-id> [options]  # Alternative
```

**Options:**
```
Required:
  <audience-id>            Audience ID
  --from <email>           Sender email address
  --subject <text>         Email subject line

Content (at least one required):
  --text <text>            Plain text body
  --html <html>            HTML body
  --html-file <path>       Path to HTML file

Optional:
  --name <name>            Broadcast name (internal)
  --reply-to <email>       Reply-to address
  --scheduled-at <time>    Schedule delivery (ISO 8601 or natural language)
  --attach <path...>       File attachments
  --tags <json>            Tags as JSON string
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Create draft broadcast
resend broadcasts create aud_abc123 \
  --name "Weekly Newsletter" \
  --from "newsletter@example.com" \
  --subject "This Week's Updates" \
  --html-file newsletter.html

# Create and schedule broadcast
resend broadcasts create aud_abc123 \
  --from "newsletter@example.com" \
  --subject "Product Launch" \
  --html-file launch.html \
  --scheduled-at "2026-02-10T09:00:00Z"

# With personalization variables
resend broadcasts create aud_abc123 \
  --from "app@example.com" \
  --subject "Hello {{{FIRST_NAME}}}" \
  --html "<p>Hi {{{FIRST_NAME|there}}},</p><p>This is your update!</p>"
```

**Response Format (Pretty):**
```
✓ Broadcast created successfully!

ID: brd_abc123
Name: Weekly Newsletter
Audience: Newsletter Subscribers (1,234 contacts)
Status: draft
From: newsletter@example.com
Subject: This Week's Updates

Personalization Variables Available:
  {{{FIRST_NAME}}} - Contact's first name
  {{{LAST_NAME}}} - Contact's last name
  {{{EMAIL}}} - Contact's email
  {{{RESEND_UNSUBSCRIBE_URL}}} - Unsubscribe link (recommended)

Next steps:
  Review: resend broadcasts get brd_abc123
  Send: resend broadcasts send brd_abc123
  Schedule: resend broadcasts update brd_abc123 --scheduled-at "..."
```

**Functional Requirements:**
- FR-BROADCAST-CREATE-001: Create broadcast in draft status by default
- FR-BROADCAST-CREATE-002: Support personalization variables in subject and body
- FR-BROADCAST-CREATE-003: Validate audience exists and has contacts
- FR-BROADCAST-CREATE-004: Warn if unsubscribe URL not included
- FR-BROADCAST-CREATE-005: Support scheduling at creation time
- FR-BROADCAST-CREATE-006: Estimate reach (active contacts in audience)

---

#### 3.6.3 Get Broadcast Details

**User Story:**
As a developer, I want to view details about a broadcast so that I can review its configuration and status.

**Command Syntax:**
```bash
resend broadcasts get <broadcast-id>
resend broadcast get <broadcast-id>  # Alternative
```

**Options:**
```
Required:
  <broadcast-id>           Broadcast ID

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Get broadcast details
resend broadcasts get brd_abc123

# JSON output
resend broadcasts get brd_abc123 --output json
```

**Response Format (Pretty):**
```
Broadcast: Weekly Newsletter

ID: brd_abc123
Status: sent
Audience: Newsletter Subscribers (1,234 contacts)
From: newsletter@example.com
Reply-To: support@example.com
Subject: This Week's Updates
Scheduled: 2026-02-01T09:00:00Z
Sent: 2026-02-01T09:02:34Z

Statistics:
  Sent: 1,234
  Delivered: 1,200
  Bounced: 12
  Opened: 890 (74%)
  Clicked: 345 (29%)
  Unsubscribed: 5

Preview:
  Subject: This Week's Updates
  From: newsletter@example.com
  [First 500 chars of HTML content...]
```

**Functional Requirements:**
- FR-BROADCAST-GET-001: Display complete broadcast information
- FR-BROADCAST-GET-002: Show sending statistics if sent
- FR-BROADCAST-GET-003: Preview content (truncated)
- FR-BROADCAST-GET-004: Include personalization variable info

---

#### 3.6.4 Update Broadcast

**User Story:**
As a developer, I want to update a draft or scheduled broadcast so that I can make changes before sending.

**Command Syntax:**
```bash
resend broadcasts update <broadcast-id> [options]
resend broadcast update <broadcast-id> [options]  # Alternative
```

**Options:**
```
Required:
  <broadcast-id>           Broadcast ID

Optional (at least one required):
  --name <name>            New broadcast name
  --from <email>           New sender email
  --subject <text>         New subject line
  --text <text>            New plain text body
  --html <html>            New HTML body
  --html-file <path>       Path to new HTML file
  --reply-to <email>       New reply-to address
  --scheduled-at <time>    New scheduled time
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Update subject
resend broadcasts update brd_abc123 --subject "Updated Subject"

# Reschedule
resend broadcasts update brd_abc123 --scheduled-at "2026-02-10T12:00:00Z"

# Update content
resend broadcasts update brd_abc123 --html-file updated-newsletter.html
```

**Functional Requirements:**
- FR-BROADCAST-UPDATE-001: Only allow updates to draft or scheduled broadcasts
- FR-BROADCAST-UPDATE-002: Prevent updates to sending or sent broadcasts
- FR-BROADCAST-UPDATE-003: Support partial updates
- FR-BROADCAST-UPDATE-004: Validate new scheduled time is in future

---

#### 3.6.5 Send Broadcast

**User Story:**
As a developer, I want to send a broadcast immediately so that I can deliver emails to the entire audience.

**Command Syntax:**
```bash
resend broadcasts send <broadcast-id>
resend broadcast send <broadcast-id>  # Alternative
```

**Options:**
```
Required:
  <broadcast-id>           Broadcast ID

Optional:
  --scheduled-at <time>    Schedule instead of sending immediately
  --force                  Skip confirmation prompt
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Send immediately with confirmation
resend broadcasts send brd_abc123

# Send without confirmation
resend broadcasts send brd_abc123 --force

# Schedule for later
resend broadcasts send brd_abc123 --scheduled-at "tomorrow at 9am"
```

**Response Format (Pretty):**
```
⚠ Are you sure you want to send this broadcast?
  Name: Weekly Newsletter
  Audience: Newsletter Subscribers
  Recipients: 1,234 contacts
  From: newsletter@example.com
  Subject: This Week's Updates
  Type 'yes' to confirm: yes

✓ Broadcast sent successfully!

ID: brd_abc123
Status: sending
Recipients: 1,234

The broadcast is now being delivered. This may take several minutes.
Check status: resend broadcasts get brd_abc123
```

**Functional Requirements:**
- FR-BROADCAST-SEND-001: Require confirmation unless --force used
- FR-BROADCAST-SEND-002: Show recipient count in confirmation
- FR-BROADCAST-SEND-003: Only allow sending draft broadcasts
- FR-BROADCAST-SEND-004: Support scheduling instead of immediate send
- FR-BROADCAST-SEND-005: Validate unsubscribe URL is included (warn if not)

---

#### 3.6.6 Delete Broadcast

**User Story:**
As a developer, I want to delete a broadcast so that I can remove drafts I no longer need.

**Command Syntax:**
```bash
resend broadcasts delete <broadcast-id>
resend broadcast rm <broadcast-id>  # Alternative
```

**Options:**
```
Required:
  <broadcast-id>           Broadcast ID

Optional:
  --force                  Skip confirmation prompt
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Delete with confirmation
resend broadcasts delete brd_abc123

# Delete without confirmation
resend broadcasts delete brd_abc123 --force
```

**Functional Requirements:**
- FR-BROADCAST-DELETE-001: Only allow deleting draft broadcasts
- FR-BROADCAST-DELETE-002: Prevent deletion of sent or sending broadcasts
- FR-BROADCAST-DELETE-003: Require confirmation unless --force used

---

### 3.7 Webhook Management

#### 3.7.1 List Webhooks

**User Story:**
As a developer, I want to list all webhooks so that I can see which endpoints are configured for event notifications.

**Command Syntax:**
```bash
resend webhooks list [options]
resend webhook ls [options]  # Alternative
```

**Options:**
```
Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table (default: table)
```

**Examples:**
```bash
# List all webhooks
resend webhooks list

# JSON output
resend webhooks list --output json
```

**Response Format (Table):**
```
┌──────────────────────────────────────┬──────────────────────────────┬────────────┬────────────────────────┐
│ ID                                   │ Endpoint                     │ Status     │ Events                 │
├──────────────────────────────────────┼──────────────────────────────┼────────────┼────────────────────────┤
│ wh_abc123                            │ https://api.example.com/hook │ active     │ email.sent, email.d... │
└──────────────────────────────────────┴──────────────────────────────┴────────────┴────────────────────────┘

Total: 1 webhook
```

**Functional Requirements:**
- FR-WEBHOOK-LIST-001: Display all webhooks with key attributes
- FR-WEBHOOK-LIST-002: Show truncated event list (full list in details)
- FR-WEBHOOK-LIST-003: Indicate active/inactive status

---

#### 3.7.2 Create Webhook

**User Story:**
As a developer, I want to create a webhook so that I can receive real-time email event notifications.

**Command Syntax:**
```bash
resend webhooks create <url> [options]
resend webhook create <url> [options]  # Alternative
```

**Options:**
```
Required:
  <url>                    HTTPS endpoint URL

Optional:
  --events <events...>     Event types (space-separated)
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Available Events:**
- `email.sent` - Email accepted by Resend
- `email.delivered` - Email delivered to recipient's mail server
- `email.delivery_delayed` - Delivery delayed (e.g., full inbox)
- `email.bounced` - Email permanently rejected
- `email.failed` - Email failed to send
- `email.opened` - Email opened by recipient (tracking enabled)
- `email.clicked` - Link clicked in email (tracking enabled)
- `email.complained` - Email marked as spam
- `email.suppressed` - Email suppressed (unsubscribed)

**Examples:**
```bash
# Create webhook for all events
resend webhooks create https://api.example.com/webhooks/resend

# Create webhook for specific events
resend webhooks create https://api.example.com/webhooks/resend \
  --events email.delivered email.bounced email.complained

# JSON output
resend webhooks create https://api.example.com/webhooks/resend --output json
```

**Response Format (Pretty):**
```
✓ Webhook created successfully!

ID: wh_abc123
Endpoint: https://api.example.com/webhooks/resend
Status: active
Events:
  - email.sent
  - email.delivered
  - email.bounced
  - email.opened
  - email.clicked
  - email.complained

Webhook Secret: whsec_abc123xyz789...

⚠ IMPORTANT: Save this secret now. You'll need it to verify webhook signatures.

Example verification (Node.js):
  const crypto = require('crypto');
  const signature = request.headers['resend-signature'];
  const payload = JSON.stringify(request.body);
  const hash = crypto
    .createHmac('sha256', 'whsec_abc123xyz789...')
    .update(payload)
    .digest('hex');
  if (signature === hash) {
    // Valid webhook
  }
```

**Functional Requirements:**
- FR-WEBHOOK-CREATE-001: Validate URL is HTTPS
- FR-WEBHOOK-CREATE-002: Support selecting specific event types
- FR-WEBHOOK-CREATE-003: Default to all events if none specified
- FR-WEBHOOK-CREATE-004: Return webhook secret for signature verification
- FR-WEBHOOK-CREATE-005: Provide code example for verification

---

#### 3.7.3 Get Webhook Details

**User Story:**
As a developer, I want to view webhook details so that I can check its configuration and delivery status.

**Command Syntax:**
```bash
resend webhooks get <webhook-id>
resend webhook get <webhook-id>  # Alternative
```

**Options:**
```
Required:
  <webhook-id>             Webhook ID

Optional:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Get webhook details
resend webhooks get wh_abc123

# JSON output
resend webhooks get wh_abc123 --output json
```

**Response Format (Pretty):**
```
Webhook: wh_abc123

ID: wh_abc123
Endpoint: https://api.example.com/webhooks/resend
Status: active
Created: 2026-01-15T10:30:00Z

Events:
  - email.sent
  - email.delivered
  - email.bounced
  - email.opened
  - email.clicked

Recent Deliveries (Last 10):
  ✓ 2026-02-07T10:30:00Z - email.delivered (200 OK)
  ✓ 2026-02-07T10:25:00Z - email.sent (200 OK)
  ✗ 2026-02-07T10:20:00Z - email.delivered (500 Internal Server Error)
```

**Functional Requirements:**
- FR-WEBHOOK-GET-001: Display complete webhook configuration
- FR-WEBHOOK-GET-002: Show recent delivery attempts with status codes
- FR-WEBHOOK-GET-003: Indicate delivery success/failure
- FR-WEBHOOK-GET-004: Include retry information for failures

---

#### 3.7.4 Update Webhook

**User Story:**
As a developer, I want to update a webhook so that I can change its configuration or event subscriptions.

**Command Syntax:**
```bash
resend webhooks update <webhook-id> [options]
resend webhook update <webhook-id> [options]  # Alternative
```

**Options:**
```
Required:
  <webhook-id>             Webhook ID

Optional (at least one required):
  --url <url>              New endpoint URL
  --events <events...>     New event types
  --status <status>        New status: active, inactive
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Update endpoint URL
resend webhooks update wh_abc123 --url https://api.example.com/new-webhook

# Change event subscriptions
resend webhooks update wh_abc123 --events email.delivered email.bounced

# Disable webhook
resend webhooks update wh_abc123 --status inactive
```

**Functional Requirements:**
- FR-WEBHOOK-UPDATE-001: Support partial updates
- FR-WEBHOOK-UPDATE-002: Validate URL is HTTPS if changed
- FR-WEBHOOK-UPDATE-003: Allow enabling/disabling webhooks
- FR-WEBHOOK-UPDATE-004: Validate event types if changed

---

#### 3.7.5 Delete Webhook

**User Story:**
As a developer, I want to delete a webhook so that I can stop receiving event notifications.

**Command Syntax:**
```bash
resend webhooks delete <webhook-id>
resend webhook rm <webhook-id>  # Alternative
```

**Options:**
```
Required:
  <webhook-id>             Webhook ID

Optional:
  --force                  Skip confirmation prompt
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Delete with confirmation
resend webhooks delete wh_abc123

# Delete without confirmation
resend webhooks delete wh_abc123 --force
```

**Functional Requirements:**
- FR-WEBHOOK-DELETE-001: Require confirmation unless --force used
- FR-WEBHOOK-DELETE-002: Show endpoint URL in confirmation prompt

---

### 3.8 Configuration Management

#### 3.8.1 Initialize Configuration

**User Story:**
As a developer, I want to initialize my Resend CLI configuration so that I can store my API key securely.

**Command Syntax:**
```bash
resend config init [options]
resend init [options]  # Alternative
```

**Options:**
```
Optional:
  --api-key <key>          API key to save
  --default-from <email>   Default sender email
  --force                  Overwrite existing config
```

**Examples:**
```bash
# Interactive setup
resend config init

# Non-interactive setup
resend config init --api-key "re_abc123..." --default-from "app@example.com"

# Overwrite existing config
resend config init --force
```

**Interactive Flow:**
```
Welcome to Resend CLI!

Let's set up your configuration.

? Enter your Resend API key: re_abc123...
? Enter default sender email (optional): app@example.com

✓ Configuration saved!

Config location: ~/.resend/config.json
Permissions: 600 (owner read/write only)

Test your setup:
  resend send --to "test@example.com" --subject "Test" --text "Hello!"
```

**Functional Requirements:**
- FR-CONFIG-INIT-001: Create config directory if not exists
- FR-CONFIG-INIT-002: Set restrictive permissions (600)
- FR-CONFIG-INIT-003: Validate API key format
- FR-CONFIG-INIT-004: Support both interactive and non-interactive modes
- FR-CONFIG-INIT-005: Prevent overwriting without --force

---

#### 3.8.2 View Configuration

**User Story:**
As a developer, I want to view my current configuration so that I can verify my settings.

**Command Syntax:**
```bash
resend config get [key]
```

**Options:**
```
Optional:
  [key]                    Specific config key to retrieve
  --show-api-key           Show full API key (masked by default)
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# View all config
resend config get

# View specific key
resend config get defaultFrom

# Show full API key
resend config get apiKey --show-api-key
```

**Response Format (Pretty):**
```
Resend CLI Configuration

Location: ~/.resend/config.json
Permissions: 600

Settings:
  apiKey: re_abc...xyz (masked)
  defaultFrom: app@example.com

To view full API key:
  resend config get apiKey --show-api-key
```

**Functional Requirements:**
- FR-CONFIG-GET-001: Mask API key by default (show only first 6 and last 3 chars)
- FR-CONFIG-GET-002: Support retrieving specific config keys
- FR-CONFIG-GET-003: Show config file location and permissions

---

#### 3.8.3 Update Configuration

**User Story:**
As a developer, I want to update my configuration so that I can change settings without re-initializing.

**Command Syntax:**
```bash
resend config set [options]
```

**Options:**
```
Optional (at least one required):
  --api-key <key>          New API key
  --default-from <email>   New default sender email
  --output <format>        Output format: json, pretty (default: pretty)
```

**Examples:**
```bash
# Update API key
resend config set --api-key "re_newkey..."

# Update default sender
resend config set --default-from "noreply@example.com"

# Update multiple settings
resend config set --api-key "re_newkey..." --default-from "app@example.com"
```

**Functional Requirements:**
- FR-CONFIG-SET-001: Validate API key format if provided
- FR-CONFIG-SET-002: Validate email format for defaultFrom
- FR-CONFIG-SET-003: Preserve existing settings not being updated
- FR-CONFIG-SET-004: Create config if not exists

---

#### 3.8.4 Delete Configuration

**User Story:**
As a developer, I want to delete my configuration so that I can remove stored credentials.

**Command Syntax:**
```bash
resend config delete [options]
```

**Options:**
```
Optional:
  --force                  Skip confirmation prompt
```

**Examples:**
```bash
# Delete with confirmation
resend config delete

# Delete without confirmation
resend config delete --force
```

**Response Format (Pretty):**
```
⚠ Are you sure you want to delete your Resend CLI configuration?
  This will remove your stored API key and settings.
  Type 'yes' to confirm: yes

✓ Configuration deleted!

File removed: ~/.resend/config.json

To set up again:
  resend config init
```

**Functional Requirements:**
- FR-CONFIG-DELETE-001: Require confirmation unless --force used
- FR-CONFIG-DELETE-002: Delete entire config directory
- FR-CONFIG-DELETE-003: Provide re-initialization instructions

---

### 3.9 Global Options & Help

#### 3.9.1 Global Options

All commands support these global options:

```
Global Options:
  --api-key <key>          Override default API key
  --output <format>        Output format: json, pretty, table, csv
  --no-color               Disable colored output
  --verbose                Enable verbose logging
  --help                   Display help for command
  --version                Display version number
```

#### 3.9.2 Help System

**Command Syntax:**
```bash
resend --help
resend <command> --help
resend <command> <subcommand> --help
```

**Examples:**
```bash
# General help
resend --help

# Command-specific help
resend send --help
resend domains --help
resend domains add --help
```

**Help Format:**
```
resend send - Send a single email

USAGE
  resend send [options]

OPTIONS
  Required:
    --from <email>         Sender email address
    --to <email...>        Recipient email(s)
    --subject <text>       Email subject line

  Content (at least one required):
    --text <text>          Plain text body
    --html <html>          HTML body
    --html-file <path>     Path to HTML file

  Optional:
    --cc <email...>        CC recipients
    --bcc <email...>       BCC recipients
    [more options...]

EXAMPLES
  # Send simple text email
  resend send --from "app@example.com" --to "user@example.com" \
    --subject "Test" --text "Hello!"

  # Send HTML email from file
  resend send --from "app@example.com" --to "user@example.com" \
    --subject "Newsletter" --html-file newsletter.html

For more information, visit https://resend.com/docs
```

**Functional Requirements:**
- FR-HELP-001: Provide comprehensive help for all commands
- FR-HELP-002: Include usage syntax and option descriptions
- FR-HELP-003: Show practical examples for each command
- FR-HELP-004: Link to online documentation

---

## 4. Implementation Checklist

### Phase 1: Core Foundation
**Goal:** Basic CLI structure, configuration, and simple email sending

- [ ] **Project Setup**
  - [ ] Initialize Bun project with TypeScript
  - [ ] Configure tsconfig.json for strict mode
  - [ ] Set up project structure (src/, tests/, docs/)
  - [ ] Install dependencies (Commander.js)
  - [ ] Create package.json with scripts and metadata

- [ ] **CLI Framework**
  - [ ] Set up Commander.js main program
  - [ ] Implement version and help commands
  - [ ] Create command registration system
  - [ ] Set up global options (--api-key, --output, --verbose)
  - [ ] Implement colored output support (optional: chalk)

- [ ] **Configuration System**
  - [ ] Create config file structure (~/.resend/config.json)
  - [ ] Implement config init command (interactive & non-interactive)
  - [ ] Implement config get command (with API key masking)
  - [ ] Implement config set command
  - [ ] Implement config delete command
  - [ ] Set up configuration priority (flags > env > file)
  - [ ] Create file permissions (600) enforcement

- [ ] **API Client Foundation**
  - [ ] Create base API client class with fetch
  - [ ] Implement authentication (Bearer token)
  - [ ] Implement request/response handling
  - [ ] Create error handling and parsing
  - [ ] Add retry logic for transient failures
  - [ ] Implement rate limiting awareness

- [ ] **Basic Email Sending**
  - [ ] Implement `resend send` command
  - [ ] Support required fields (from, to, subject)
  - [ ] Support text and HTML content
  - [ ] Support HTML file reading (--html-file)
  - [ ] Validate email addresses
  - [ ] Format pretty output
  - [ ] Format JSON output
  - [ ] Create basic error messages

- [ ] **Testing Foundation**
  - [ ] Set up Bun test framework
  - [ ] Create test fixtures and mocks
  - [ ] Write unit tests for config management
  - [ ] Write unit tests for API client
  - [ ] Write integration test for send command

- [ ] **Documentation**
  - [ ] Create README.md with installation instructions
  - [ ] Document configuration setup
  - [ ] Add basic usage examples
  - [ ] Create .env.example file

### Phase 2: Full Email Features
**Goal:** Complete email sending capabilities with all options

- [ ] **Enhanced Email Sending**
  - [ ] Support CC and BCC recipients
  - [ ] Implement attachment support (base64 encoding)
  - [ ] Support multiple recipients (up to 50)
  - [ ] Implement reply-to option
  - [ ] Add custom headers support
  - [ ] Add tags support
  - [ ] Implement idempotency key support
  - [ ] Add progress indicator for large attachments

- [ ] **Template Support**
  - [ ] Implement template-based sending
  - [ ] Support template variables (--template-vars)
  - [ ] Validate template variable format
  - [ ] Add template examples to documentation

- [ ] **Scheduling**
  - [ ] Implement scheduled sending (--scheduled-at)
  - [ ] Support ISO 8601 date parsing
  - [ ] Support natural language dates (optional)
  - [ ] Validate scheduled time is in future

- [ ] **Batch Email Sending**
  - [ ] Implement `resend send-batch` command
  - [ ] Parse JSON file input
  - [ ] Validate batch email structure
  - [ ] Support up to 100 emails per batch
  - [ ] Show progress indicator
  - [ ] Report success/failure for each email
  - [ ] Handle partial failures gracefully

- [ ] **Email Status & Listing**
  - [ ] Implement `resend get <email-id>` command
  - [ ] Implement `resend list` command
  - [ ] Support pagination (--limit, --offset)
  - [ ] Support filtering (--from, --to, --subject)
  - [ ] Format table output
  - [ ] Show email status (queued, sent, delivered, etc.)

- [ ] **Email Management**
  - [ ] Implement `resend update <email-id>` command
  - [ ] Implement `resend cancel <email-id>` command
  - [ ] Add confirmation prompts (--force to skip)
  - [ ] Validate operation permissions

- [ ] **Testing**
  - [ ] Unit tests for attachment encoding
  - [ ] Unit tests for batch processing
  - [ ] Unit tests for date parsing
  - [ ] Integration tests for all email commands
  - [ ] Test error handling for invalid inputs

- [ ] **Documentation**
  - [ ] Document all email command options
  - [ ] Add advanced email examples
  - [ ] Document attachment size limits
  - [ ] Add troubleshooting guide

### Phase 3: Domain Management
**Goal:** Complete domain configuration and verification

- [ ] **Domain Commands**
  - [ ] Implement `resend domains list` command
  - [ ] Implement `resend domains add <domain>` command
  - [ ] Implement `resend domains verify <domain-id>` command
  - [ ] Implement `resend domains get <domain-id>` command
  - [ ] Implement `resend domains update <domain-id>` command
  - [ ] Implement `resend domains delete <domain-id>` command

- [ ] **Domain Verification**
  - [ ] Display DNS records after adding domain
  - [ ] Check DNS record status during verification
  - [ ] Provide clear error messages for missing records
  - [ ] Show verification progress with status indicators
  - [ ] Suggest DNS propagation wait time

- [ ] **Domain Lookup**
  - [ ] Support lookup by domain ID
  - [ ] Support lookup by domain name
  - [ ] Create domain name to ID resolver

- [ ] **Output Formatting**
  - [ ] Format domain table output
  - [ ] Format DNS records clearly
  - [ ] Show verification status with visual indicators
  - [ ] Include domain statistics if available

- [ ] **Testing**
  - [ ] Unit tests for domain validation
  - [ ] Integration tests for domain CRUD operations
  - [ ] Test DNS record display formatting
  - [ ] Test error handling for invalid domains

- [ ] **Documentation**
  - [ ] Document domain setup process
  - [ ] Add DNS configuration guide
  - [ ] Include domain verification examples
  - [ ] Document common verification issues

### Phase 4: Contacts & Audiences
**Goal:** Complete contact and audience management

- [ ] **Audience Commands**
  - [ ] Implement `resend audiences list` command
  - [ ] Implement `resend audiences create <name>` command
  - [ ] Implement `resend audiences get <id>` command
  - [ ] Implement `resend audiences update <id>` command
  - [ ] Implement `resend audiences delete <id>` command

- [ ] **Contact Commands**
  - [ ] Implement `resend contacts list <audience-id>` command
  - [ ] Implement `resend contacts create <audience-id>` command
  - [ ] Implement `resend contacts get <contact-id>` command
  - [ ] Implement `resend contacts update <contact-id>` command
  - [ ] Implement `resend contacts delete <contact-id>` command

- [ ] **Contact Import**
  - [ ] Implement `resend contacts import <audience-id> <file>` command
  - [ ] Parse CSV files
  - [ ] Support custom column mapping
  - [ ] Implement duplicate detection (skip, update, error)
  - [ ] Show progress indicator for large imports
  - [ ] Batch API calls efficiently (1000 per batch)
  - [ ] Generate detailed import report
  - [ ] Handle individual contact errors gracefully

- [ ] **Contact Lookup**
  - [ ] Support lookup by contact ID
  - [ ] Support lookup by email address
  - [ ] Show all audiences for a contact
  - [ ] Display custom fields

- [ ] **Advanced Features**
  - [ ] Support custom fields (up to 10 per contact)
  - [ ] Implement audience-specific contact removal
  - [ ] Implement global contact deletion
  - [ ] Export contacts to CSV

- [ ] **Testing**
  - [ ] Unit tests for CSV parsing
  - [ ] Unit tests for duplicate detection
  - [ ] Integration tests for contact CRUD
  - [ ] Integration tests for audience CRUD
  - [ ] Test large import performance
  - [ ] Test error recovery in imports

- [ ] **Documentation**
  - [ ] Document audience management workflow
  - [ ] Document contact management workflow
  - [ ] Add CSV import examples and format
  - [ ] Document custom fields usage
  - [ ] Add bulk operations guide

### Phase 5: Broadcasts & Bulk Operations
**Goal:** Complete broadcast and bulk email capabilities

- [ ] **Broadcast Commands**
  - [ ] Implement `resend broadcasts list` command
  - [ ] Implement `resend broadcasts create <audience-id>` command
  - [ ] Implement `resend broadcasts get <id>` command
  - [ ] Implement `resend broadcasts update <id>` command
  - [ ] Implement `resend broadcasts send <id>` command
  - [ ] Implement `resend broadcasts delete <id>` command

- [ ] **Broadcast Features**
  - [ ] Support personalization variables in subject/body
  - [ ] Validate unsubscribe URL presence
  - [ ] Show recipient count estimate
  - [ ] Support broadcast scheduling
  - [ ] Implement draft status by default
  - [ ] Add confirmation prompt for sending
  - [ ] Show sending progress

- [ ] **Broadcast Statistics**
  - [ ] Display sending statistics (sent, delivered, opened, etc.)
  - [ ] Show delivery rates and percentages
  - [ ] Include engagement metrics (opens, clicks)
  - [ ] Show unsubscribe count

- [ ] **Webhook Management**
  - [ ] Implement `resend webhooks list` command
  - [ ] Implement `resend webhooks create <url>` command
  - [ ] Implement `resend webhooks get <id>` command
  - [ ] Implement `resend webhooks update <id>` command
  - [ ] Implement `resend webhooks delete <id>` command

- [ ] **Webhook Features**
  - [ ] Validate HTTPS URLs
  - [ ] Support event type selection
  - [ ] Display webhook secret (one-time)
  - [ ] Show recent delivery attempts
  - [ ] Indicate delivery success/failure
  - [ ] Support webhook enable/disable

- [ ] **Testing**
  - [ ] Unit tests for personalization variable parsing
  - [ ] Integration tests for broadcast CRUD
  - [ ] Integration tests for webhook CRUD
  - [ ] Test broadcast sending workflow
  - [ ] Test statistics display

- [ ] **Documentation**
  - [ ] Document broadcast workflow
  - [ ] Add personalization variable guide
  - [ ] Document webhook setup and verification
  - [ ] Add event types reference
  - [ ] Include broadcast best practices

### Phase 6: Polish & Documentation
**Goal:** Production-ready CLI with excellent documentation

- [ ] **CLI Polish**
  - [ ] Review all error messages for clarity
  - [ ] Add helpful suggestions to errors
  - [ ] Implement consistent output formatting
  - [ ] Add spinner/progress indicators where appropriate
  - [ ] Improve confirmation prompts
  - [ ] Add color coding for success/warning/error
  - [ ] Implement --verbose flag properly
  - [ ] Add --no-color flag support

- [ ] **Performance Optimization**
  - [ ] Optimize API client request batching
  - [ ] Implement response caching where appropriate
  - [ ] Reduce CLI startup time
  - [ ] Optimize large file handling
  - [ ] Profile and optimize hot paths

- [ ] **Error Handling**
  - [ ] Audit all error cases
  - [ ] Implement consistent error format
  - [ ] Add error codes for programmatic use
  - [ ] Provide actionable error messages
  - [ ] Handle network errors gracefully
  - [ ] Handle API rate limiting with retries
  - [ ] Add timeout handling

- [ ] **Comprehensive Testing**
  - [ ] Achieve 90%+ code coverage
  - [ ] Add edge case tests
  - [ ] Add integration tests for all workflows
  - [ ] Test error scenarios
  - [ ] Test with various API responses
  - [ ] Performance testing for large operations
  - [ ] Test cross-platform compatibility (macOS, Linux, Windows)

- [ ] **Documentation**
  - [ ] Complete API.md reference documentation
  - [ ] Create comprehensive EXAMPLES.md
  - [ ] Write CONTRIBUTING.md guide
  - [ ] Add architecture documentation
  - [ ] Document all command options
  - [ ] Add troubleshooting section
  - [ ] Create quick start guide
  - [ ] Add video tutorials or GIFs (optional)

- [ ] **Distribution**
  - [ ] Configure npm package publishing
  - [ ] Create standalone binary builds (Bun's bundler)
  - [ ] Set up GitHub releases automation
  - [ ] Create installation instructions for all platforms
  - [ ] Add shell completion scripts (bash, zsh, fish)
  - [ ] Publish to npm registry
  - [ ] Create Homebrew formula (optional)

- [ ] **CI/CD**
  - [ ] Set up GitHub Actions for testing
  - [ ] Implement automated testing on PR
  - [ ] Add linting and type checking
  - [ ] Set up automated releases
  - [ ] Configure test coverage reporting
  - [ ] Add security scanning

- [ ] **Final Review**
  - [ ] Code review and refactoring
  - [ ] Security audit
  - [ ] Performance benchmarking
  - [ ] User acceptance testing
  - [ ] Documentation review
  - [ ] License and legal review

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| CLI Startup | < 100ms | Time from invocation to first output |
| Simple Commands | < 500ms | Time to complete (e.g., config get) |
| API Calls | < 2s | Time for single API request |
| Batch Operations | < 5s per 100 | Time to process batch emails |
| Large File Handling | < 10s for 10MB | Time to read and encode attachments |

### 5.2 Reliability

- **Error Recovery:** Graceful handling of all error cases
- **Network Resilience:** Automatic retry with exponential backoff
- **Data Validation:** Comprehensive input validation before API calls
- **Idempotency:** Support for idempotency keys to prevent duplicates
- **Crash Protection:** Never corrupt config files on crashes

### 5.3 Usability

- **Intuitive Commands:** Follow Unix conventions (ls, rm, etc.)
- **Clear Help:** Comprehensive --help for all commands
- **Helpful Errors:** Actionable error messages with suggestions
- **Progress Feedback:** Spinners and progress bars for long operations
- **Confirmation Prompts:** Protect against destructive actions

### 5.4 Security

- **Credential Protection:** Store API keys with 600 permissions
- **Key Masking:** Never display full API keys in logs or output
- **HTTPS Only:** Enforce HTTPS for all API communication
- **Input Sanitization:** Prevent injection attacks
- **Secure Defaults:** Safe defaults for all operations

### 5.5 Maintainability

- **Type Safety:** Strict TypeScript configuration
- **Code Organization:** Clear module boundaries
- **Test Coverage:** > 90% code coverage
- **Documentation:** Inline comments for complex logic
- **Dependency Management:** Minimal dependencies, all audited

### 5.6 Compatibility

- **Operating Systems:** macOS, Linux, Windows (WSL)
- **Node.js Alternative:** Works with Bun (primary) and Node.js 18+
- **Terminal Support:** Works in all modern terminals
- **CI/CD Integration:** Supports non-interactive mode

---

## 6. API Reference Summary

### 6.1 Resend API Endpoints

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **Emails** | `/emails` | POST | Send single email |
| | `/emails/batch` | POST | Send batch emails |
| | `/emails/:id` | GET | Get email status |
| | `/emails` | GET | List sent emails |
| | `/emails/:id` | PATCH | Update scheduled email |
| | `/emails/:id/cancel` | POST | Cancel scheduled email |
| **Domains** | `/domains` | GET | List domains |
| | `/domains` | POST | Add domain |
| | `/domains/:id/verify` | POST | Verify domain |
| | `/domains/:id` | GET | Get domain details |
| | `/domains/:id` | PATCH | Update domain |
| | `/domains/:id` | DELETE | Delete domain |
| **API Keys** | `/api-keys` | GET | List API keys |
| | `/api-keys` | POST | Create API key |
| | `/api-keys/:id` | DELETE | Delete API key |
| **Audiences** | `/audiences` | GET | List audiences |
| | `/audiences` | POST | Create audience |
| | `/audiences/:id` | GET | Get audience details |
| | `/audiences/:id` | PATCH | Update audience |
| | `/audiences/:id` | DELETE | Delete audience |
| **Contacts** | `/audiences/:id/contacts` | GET | List contacts |
| | `/audiences/:id/contacts` | POST | Create contact |
| | `/contacts/:id` | GET | Get contact details |
| | `/contacts/:id` | PATCH | Update contact |
| | `/contacts/:id` | DELETE | Delete contact |
| **Broadcasts** | `/broadcasts` | GET | List broadcasts |
| | `/broadcasts` | POST | Create broadcast |
| | `/broadcasts/:id` | GET | Get broadcast details |
| | `/broadcasts/:id` | PATCH | Update broadcast |
| | `/broadcasts/:id/send` | POST | Send broadcast |
| | `/broadcasts/:id` | DELETE | Delete broadcast |
| **Webhooks** | `/webhooks` | GET | List webhooks |
| | `/webhooks` | POST | Create webhook |
| | `/webhooks/:id` | GET | Get webhook details |
| | `/webhooks/:id` | PATCH | Update webhook |
| | `/webhooks/:id` | DELETE | Delete webhook |

### 6.2 Authentication

**Method:** Bearer Token
**Header:** `Authorization: Bearer re_xxxxxxxxx`
**Format:** API keys start with `re_` prefix

### 6.3 Rate Limits

| Plan | Emails/Day | Requests/Second |
|------|-----------|----------------|
| Free | 100 | 10 |
| Paid | Varies | Varies |

**Rate Limit Headers:**
- `X-RateLimit-Limit` - Total requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Time when limit resets

### 6.4 Common Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check input validation |
| 401 | Unauthorized | Check API key |
| 403 | Forbidden | Check API key permissions |
| 404 | Not Found | Check resource ID |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Retry with backoff |

---

## 7. Examples & Use Cases

### 7.1 Quick Start Example

```bash
# 1. Install CLI
npm install -g resend-cli

# 2. Initialize configuration
resend config init
? Enter your Resend API key: re_abc123...
? Enter default sender email: app@example.com
✓ Configuration saved!

# 3. Send your first email
resend send \
  --to "user@example.com" \
  --subject "Hello from Resend CLI!" \
  --text "This is a test email."

✓ Email sent successfully!
ID: 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794
```

### 7.2 Common Workflows

#### Workflow 1: Welcome Email Campaign

```bash
# 1. Create an audience
resend audiences create "New Users"
# → ID: aud_abc123

# 2. Import contacts from CSV
resend contacts import aud_abc123 new-users.csv
# → Imported 500 contacts

# 3. Create welcome broadcast
resend broadcasts create aud_abc123 \
  --name "Welcome Campaign" \
  --from "welcome@example.com" \
  --subject "Welcome, {{{FIRST_NAME}}}!" \
  --html-file welcome-email.html
# → ID: brd_xyz789

# 4. Review and send
resend broadcasts get brd_xyz789
resend broadcasts send brd_xyz789
# → Sending to 500 contacts
```

#### Workflow 2: Transactional Email Integration

```bash
# 1. Create sending-only API key for production
resend api-keys create "Production App" --permission sending_access
# → Key: re_prod123... (save this!)

# 2. Test email delivery
resend send \
  --api-key "re_prod123..." \
  --from "orders@example.com" \
  --to "customer@example.com" \
  --subject "Order Confirmation #12345" \
  --template "order-confirmation" \
  --template-vars '{"order_id": "12345", "total": "$99.99"}'

# 3. Check delivery status
resend get 49a3999c-0ce1-4ea6-ab68-afcd6dc2e794
# → Status: delivered
```

#### Workflow 3: Domain Setup and Verification

```bash
# 1. Add your domain
resend domains add example.com
# → Shows DNS records to add

# 2. Add DNS records to your domain provider
# (Copy TXT, DKIM, MX records shown)

# 3. Verify domain (after DNS propagation)
resend domains verify example.com
# → ✓ Domain verified!

# 4. Send email from your domain
resend send \
  --from "hello@example.com" \
  --to "user@example.com" \
  --subject "Test from verified domain" \
  --text "This email is sent from my verified domain!"
```

#### Workflow 4: Event Tracking with Webhooks

```bash
# 1. Set up webhook endpoint (your server)
resend webhooks create https://api.example.com/webhooks/resend \
  --events email.delivered email.opened email.clicked email.bounced
# → Secret: whsec_abc123... (save for verification)

# 2. Send email
resend send --from "app@example.com" --to "user@example.com" \
  --subject "Track this!" --html "<p>Hello!</p>"

# 3. Monitor webhook deliveries
resend webhooks get wh_abc123
# → Shows recent deliveries and status codes

# Your webhook endpoint will receive:
# {
#   "type": "email.delivered",
#   "created_at": "2026-02-07T10:30:00Z",
#   "data": {
#     "email_id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794",
#     "from": "app@example.com",
#     "to": "user@example.com",
#     "subject": "Track this!"
#   }
# }
```

### 7.3 Scripting Examples

#### Bash Script: Send Daily Report

```bash
#!/bin/bash
# daily-report.sh - Send daily report email

# Generate report
./generate-report.sh > /tmp/daily-report.html

# Send via Resend CLI
resend send \
  --from "reports@example.com" \
  --to "team@example.com" \
  --subject "Daily Report - $(date +%Y-%m-%d)" \
  --html-file /tmp/daily-report.html \
  --attach /tmp/report.pdf

# Clean up
rm /tmp/daily-report.html /tmp/report.pdf
```

#### Node.js Script: Bulk Welcome Emails

```typescript
// welcome-users.ts - Send personalized welcome emails
import { execSync } from 'child_process';

interface User {
  email: string;
  name: string;
}

const newUsers: User[] = [
  { email: 'user1@example.com', name: 'John' },
  { email: 'user2@example.com', name: 'Jane' },
];

// Create batch email file
const emails = newUsers.map(user => ({
  from: 'welcome@example.com',
  to: user.email,
  subject: `Welcome, ${user.name}!`,
  html: `<p>Hello ${user.name},</p><p>Welcome to our service!</p>`
}));

// Save to temp file
const fs = require('fs');
fs.writeFileSync('/tmp/welcome-batch.json', JSON.stringify(emails, null, 2));

// Send via CLI
execSync('resend send-batch /tmp/welcome-batch.json', { stdio: 'inherit' });

// Clean up
fs.unlinkSync('/tmp/welcome-batch.json');
```

#### CI/CD Integration: Deployment Notifications

```yaml
# .github/workflows/deploy.yml
name: Deploy and Notify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy application
        run: ./deploy.sh

      - name: Install Resend CLI
        run: npm install -g resend-cli

      - name: Send deployment notification
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
        run: |
          resend send \
            --from "ci@example.com" \
            --to "team@example.com" \
            --subject "Deployment Complete - ${{ github.sha }}" \
            --text "Deployment to production completed successfully!"
```

---

## 8. Error Handling Guide

### 8.1 Common Errors and Solutions

| Error Code | Message | Cause | Solution |
|-----------|---------|-------|----------|
| `CONFIG_NOT_FOUND` | No configuration found | Config not initialized | Run `resend config init` |
| `INVALID_API_KEY` | API key is invalid | Wrong format or revoked | Check API key format (re_xxx) |
| `UNAUTHORIZED` | Authentication failed | Invalid or expired key | Generate new API key |
| `INVALID_EMAIL` | Email address is invalid | Malformed email | Check email format |
| `DOMAIN_NOT_VERIFIED` | Domain not verified | DNS records not set | Verify domain with `resend domains verify` |
| `RATE_LIMIT` | Rate limit exceeded | Too many requests | Wait and retry, check limits |
| `FILE_NOT_FOUND` | File not found | Wrong path | Check file path exists |
| `FILE_TOO_LARGE` | File exceeds size limit | Attachment > 40MB | Reduce file size or split |
| `NETWORK_ERROR` | Network request failed | Connection issue | Check internet connection |
| `API_ERROR` | API request failed | Server error | Retry or check Resend status |

### 8.2 Error Message Examples

**Good Error Message:**
```
✗ Error: API key is invalid

Your API key format is incorrect. API keys should start with 're_'.

To fix this:
  1. Get your API key from https://resend.com/api-keys
  2. Run: resend config set --api-key "re_your_key_here"

Need help? Visit https://resend.com/docs
```

**Bad Error Message:**
```
Error: 401
```

### 8.3 Debugging

**Enable verbose logging:**
```bash
resend send --verbose \
  --from "app@example.com" \
  --to "user@example.com" \
  --subject "Test" \
  --text "Hello"
```

**Output:**
```
[DEBUG] Loading config from: ~/.resend/config.json
[DEBUG] Using API key: re_abc...xyz
[DEBUG] Validating email addresses...
[DEBUG] Building API request...
[DEBUG] POST https://api.resend.com/emails
[DEBUG] Request headers: {"Authorization": "Bearer re_abc...", ...}
[DEBUG] Response status: 200
[DEBUG] Response body: {"id": "49a3999c..."}
✓ Email sent successfully!
```

---

## 9. Security Considerations

### 9.1 API Key Security

**Storage:**
- Store in `~/.resend/config.json` with 600 permissions
- Never commit to version control
- Use environment variables in CI/CD

**Usage:**
- Mask in all output (re_abc...xyz)
- Never log full key value
- Support key rotation

**Best Practices:**
```bash
# ✓ Good: Use environment variable in CI/CD
export RESEND_API_KEY="re_abc123..."
resend send --to "user@example.com" --subject "Test" --text "Hello"

# ✗ Bad: Hardcode in scripts
resend send --api-key "re_abc123..." --to "user@example.com" ...
```

### 9.2 Input Validation

**Email Addresses:**
- Validate format before API calls
- Prevent injection attacks
- Sanitize display output

**File Paths:**
- Validate files exist before reading
- Check file sizes before processing
- Sanitize file paths

**JSON Input:**
- Validate JSON structure
- Prevent code injection
- Limit JSON size

### 9.3 Webhook Security

**Signature Verification:**
```typescript
// Verify webhook signatures
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === hash;
}
```

### 9.4 Sensitive Data

**Never Log:**
- Full API keys
- Email content in production
- Personal information (PII)
- Webhook secrets

**Redaction:**
```typescript
// Redact sensitive data in logs
function redactApiKey(key: string): string {
  if (key.length < 10) return '***';
  return `${key.slice(0, 6)}...${key.slice(-3)}`;
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Coverage Areas:**
- Configuration management
- API client
- Input validation
- Output formatting
- Error handling

**Example Test:**
```typescript
import { describe, test, expect } from 'bun:test';
import { validateEmail } from './validators';

describe('Email Validation', () => {
  test('accepts valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  test('rejects invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });

  test('rejects empty email', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

### 10.2 Integration Tests

**Test Scenarios:**
- Send email end-to-end
- Domain verification workflow
- Contact import process
- Broadcast creation and sending
- Webhook setup

**Mock API Responses:**
```typescript
// Mock Resend API for testing
class MockResendAPI {
  async sendEmail(data: EmailData): Promise<EmailResponse> {
    return { id: 'mock-email-id-123' };
  }
}
```

### 10.3 Manual Testing

**Test Cases:**
- [ ] Install from npm
- [ ] Initialize configuration interactively
- [ ] Send simple email
- [ ] Send email with attachment
- [ ] Import contacts from CSV
- [ ] Create and send broadcast
- [ ] Set up webhook
- [ ] Test all --help commands
- [ ] Test error scenarios

---

## 11. Deployment & Distribution

### 11.1 npm Package

**Package Name:** `resend-cli`

**package.json Configuration:**
```json
{
  "name": "resend-cli",
  "version": "1.0.0",
  "description": "Official CLI for Resend Email API",
  "bin": {
    "resend": "./dist/index.js"
  },
  "keywords": ["resend", "email", "cli", "api"],
  "repository": "github:resend/resend-cli",
  "license": "MIT"
}
```

### 11.2 Binary Distribution

**Bun Bundler:**
```bash
# Create standalone executable
bun build ./src/index.ts --compile --outfile resend

# Result: Single binary (no dependencies)
# macOS: resend-macos
# Linux: resend-linux
# Windows: resend-windows.exe
```

### 11.3 Installation Methods

**npm (Recommended):**
```bash
npm install -g resend-cli
```

**Homebrew (Future):**
```bash
brew install resend-cli
```

**Direct Binary:**
```bash
# Download from GitHub releases
curl -L https://github.com/resend/resend-cli/releases/download/v1.0.0/resend-macos -o resend
chmod +x resend
mv resend /usr/local/bin/
```

### 11.4 Versioning

**Semantic Versioning:**
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

**Version Command:**
```bash
resend --version
# → resend-cli v1.0.0
```

---

## 12. Future Enhancements

### 12.1 Potential Features (Post-MVP)

**Advanced Email Features:**
- [ ] Email templates management (CRUD)
- [ ] Scheduled email management dashboard
- [ ] Email preview command (render HTML)
- [ ] A/B testing support

**Analytics & Reporting:**
- [ ] Detailed analytics dashboard
- [ ] Export reports to CSV/PDF
- [ ] Engagement heatmaps
- [ ] Deliverability insights

**Developer Tools:**
- [ ] Email template testing and validation
- [ ] Webhook event simulator
- [ ] Local development mode with mock API
- [ ] Email preview server

**Automation:**
- [ ] Workflow automation (triggers)
- [ ] Rule-based email routing
- [ ] Auto-retry failed emails
- [ ] Scheduled reports

**Integration:**
- [ ] GitHub Actions integration
- [ ] GitLab CI integration
- [ ] Docker image
- [ ] API client generation

### 12.2 Community Requests

Track and prioritize feature requests from users:
- User voting system for features
- Public roadmap
- Beta testing program
- Plugin/extension system

---

## Appendix A: Command Quick Reference

```bash
# Configuration
resend config init                    # Initialize configuration
resend config get                     # View configuration
resend config set --api-key KEY       # Update API key

# Email
resend send --from X --to Y --subject Z --text "..."   # Send email
resend send-batch emails.json         # Send batch
resend get EMAIL_ID                   # Get email status
resend list                           # List sent emails

# Domains
resend domains list                   # List domains
resend domains add example.com        # Add domain
resend domains verify DOMAIN_ID       # Verify domain
resend domains get DOMAIN_ID          # Get domain details

# API Keys
resend api-keys list                  # List API keys
resend api-keys create NAME           # Create API key
resend api-keys delete KEY_ID         # Delete API key

# Audiences
resend audiences list                 # List audiences
resend audiences create NAME          # Create audience
resend audiences get AUD_ID           # Get audience details

# Contacts
resend contacts list AUD_ID           # List contacts
resend contacts create AUD_ID --email X    # Add contact
resend contacts import AUD_ID file.csv     # Import from CSV

# Broadcasts
resend broadcasts list                # List broadcasts
resend broadcasts create AUD_ID --from X --subject Y    # Create broadcast
resend broadcasts send BRD_ID         # Send broadcast

# Webhooks
resend webhooks list                  # List webhooks
resend webhooks create URL            # Create webhook
resend webhooks get WH_ID             # Get webhook details
```

---

## Appendix B: Environment Variables

```bash
# Configuration
RESEND_API_KEY          # API key (overrides config file)
RESEND_DEFAULT_FROM     # Default sender email

# Advanced
RESEND_API_URL          # Custom API URL (default: https://api.resend.com)
RESEND_TIMEOUT          # Request timeout in ms (default: 30000)
RESEND_RETRY_ATTEMPTS   # Number of retry attempts (default: 3)
```

---

## Appendix C: Configuration File Format

**Location:** `~/.resend/config.json`
**Permissions:** 600 (owner read/write only)

**Format:**
```json
{
  "apiKey": "re_abc123xyz...",
  "defaultFrom": "app@example.com",
  "output": "pretty",
  "verbose": false
}
```

---

## Appendix D: Resources

**Official Documentation:**
- Resend Website: https://resend.com
- API Documentation: https://resend.com/docs/api-reference
- Dashboard: https://resend.com/dashboard

**Community:**
- GitHub Repository: https://github.com/resend/resend-cli
- Issue Tracker: https://github.com/resend/resend-cli/issues
- Discussions: https://github.com/resend/resend-cli/discussions

**Support:**
- Email: support@resend.com
- Status Page: https://status.resend.com

---

**Document Version:** 1.0.0
**Last Updated:** February 7, 2026
**Status:** Ready for Implementation

---

## Sources

- [Send Email - Resend Email API](https://resend.com/docs/api-reference/emails/send-email)
- [Resend API Reference](https://apidog.com/blog/resend-api/)
- [Manage subscribers with Resend Audiences](https://resend.com/blog/manage-subscribers-using-resend-audiences)
- [Broadcast API · Resend](https://resend.com/blog/broadcast-api)
- [Managing Webhooks - Resend](https://resend.com/docs/webhooks/introduction)
- [Create API key - Resend](https://resend.com/docs/api-reference/api-keys/create-api-key)
- [Send Batch Emails - Resend](https://resend.com/docs/api-reference/emails/send-batch-emails)
