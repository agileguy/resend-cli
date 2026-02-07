/**
 * Resend API Types
 *
 * Type definitions for Resend API requests and responses
 */

/**
 * Tag for email categorization and tracking
 */
export interface EmailTag {
  name: string;
  value: string;
}

/**
 * Request payload for sending an email
 */
export interface SendEmailRequest {
  /** Sender email address (must be from verified domain) */
  from: string;

  /** Recipient email address(es) */
  to: string | string[];

  /** Email subject line */
  subject: string;

  /** Plain text email body */
  text?: string;

  /** HTML email body */
  html?: string;

  /** CC recipients */
  cc?: string | string[];

  /** BCC recipients */
  bcc?: string | string[];

  /** Reply-to email address(es) */
  reply_to?: string | string[];

  /** Custom email headers */
  headers?: Record<string, string>;

  /** Email tags for categorization and tracking */
  tags?: EmailTag[];

  /** Attachments (for future implementation) */
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    content_type?: string;
  }>;

  /** Scheduled send time (ISO 8601 format) */
  scheduled_at?: string;
}

/**
 * Response from sending an email
 */
export interface SendEmailResponse {
  /** Unique identifier for the sent email */
  id: string;
}

/**
 * Email delivery status
 */
export type EmailStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'delivery_delayed'
  | 'bounced'
  | 'complained';

/**
 * Email object returned from the API
 */
export interface Email {
  /** Unique email identifier */
  id: string;

  /** Sender email address */
  from: string;

  /** Recipient email addresses */
  to: string[];

  /** Email subject */
  subject: string;

  /** Email creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  last_event?: string;

  /** Current delivery status */
  status?: EmailStatus;

  /** HTML body (if available) */
  html?: string;

  /** Plain text body (if available) */
  text?: string;

  /** CC recipients */
  cc?: string[];

  /** BCC recipients */
  bcc?: string[];

  /** Reply-to addresses */
  reply_to?: string[];

  /** Email tags */
  tags?: EmailTag[];
}

/**
 * Options for listing emails
 */
export interface ListEmailsOptions {
  /** Maximum number of emails to return (default: 50) */
  limit?: number;

  /** Cursor for pagination */
  cursor?: string;
}

/**
 * Response from listing emails
 */
export interface ListEmailsResponse {
  /** Array of emails */
  data: Email[];

  /** Cursor for next page (if available) */
  next_cursor?: string;
}

/**
 * API error response structure
 */
export interface APIError {
  /** Error message */
  message: string;

  /** Error type/code */
  name?: string;

  /** HTTP status code */
  statusCode?: number;

  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Rate limit information from API headers
 */
export interface RateLimitInfo {
  /** Total requests allowed in the current window */
  limit: number;

  /** Remaining requests in the current window */
  remaining: number;

  /** Timestamp when the rate limit resets */
  reset: number;
}

/**
 * DNS record for domain verification
 */
export interface DnsRecord {
  /** Record identifier */
  record: string;

  /** DNS record name */
  name: string;

  /** DNS record type */
  type: 'MX' | 'TXT' | 'CNAME';

  /** Time to live in seconds */
  ttl: string;

  /** Verification status */
  status: 'pending' | 'verified' | 'failed';

  /** DNS record value */
  value: string;

  /** Priority (for MX records) */
  priority?: number;
}

/**
 * Domain object
 */
export interface Domain {
  /** Unique domain identifier */
  id: string;

  /** Domain name */
  name: string;

  /** Domain verification status */
  status: 'pending' | 'verified' | 'failed' | 'temporary_failure';

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** AWS region where domain is hosted */
  region: 'us-east-1' | 'eu-west-1' | 'sa-east-1';

  /** DNS records for verification */
  records: DnsRecord[];
}

/**
 * Request to create a new domain
 */
export interface CreateDomainRequest {
  /** Domain name to add */
  name: string;

  /** AWS region (default: us-east-1) */
  region?: 'us-east-1' | 'eu-west-1' | 'sa-east-1';
}

/**
 * Request to update domain settings
 */
export interface UpdateDomainRequest {
  /** Enable/disable open tracking */
  open_tracking?: boolean;

  /** Enable/disable click tracking */
  click_tracking?: boolean;
}

/**
 * Response from listing domains
 */
export interface ListDomainsResponse {
  /** Array of domains */
  data: Domain[];
}

/**
 * Batch email request for sending multiple emails at once
 */
export interface BatchEmailRequest {
  /** Array of email requests to send */
  emails: SendEmailRequest[];
}

/**
 * Response from batch email sending
 */
export interface BatchEmailResponse {
  /** Array of send responses with email IDs */
  data: SendEmailResponse[];
}

/**
 * Update email request (for scheduled emails)
 */
export interface UpdateEmailRequest {
  /** Reschedule email to this time (ISO 8601 format) */
  scheduled_at?: string;
}

/**
 * Audience for managing contact lists
 */
export interface Audience {
  /** Unique audience identifier */
  id: string;

  /** Audience name */
  name: string;

  /** Creation timestamp (ISO 8601) */
  created_at: string;
}

/**
 * Request payload for creating an audience
 */
export interface CreateAudienceRequest {
  /** Audience name */
  name: string;
}

/**
 * Response from listing audiences
 */
export interface ListAudiencesResponse {
  /** Array of audiences */
  data: Audience[];
}

/**
 * Contact within an audience
 */
export interface Contact {
  /** Unique contact identifier */
  id: string;

  /** Contact email address */
  email: string;

  /** Contact first name */
  first_name?: string;

  /** Contact last name */
  last_name?: string;

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Whether the contact has unsubscribed */
  unsubscribed: boolean;
}

/**
 * Request payload for creating a contact
 */
export interface CreateContactRequest {
  /** Contact email address */
  email: string;

  /** Contact first name */
  first_name?: string;

  /** Contact last name */
  last_name?: string;

  /** Unsubscribed status */
  unsubscribed?: boolean;

  /** Audience ID to add contact to */
  audience_id: string;
}

/**
 * Request payload for updating a contact
 */
export interface UpdateContactRequest {
  /** Contact first name */
  first_name?: string;

  /** Contact last name */
  last_name?: string;

  /** Unsubscribed status */
  unsubscribed?: boolean;
}

/**
 * Response from listing contacts
 */
export interface ListContactsResponse {
  /** Array of contacts */
  data: Contact[];
}

/**
 * Broadcast types
 */

/**
 * Broadcast object
 */
export interface Broadcast {
  /** Unique broadcast identifier */
  id: string;

  /** Audience ID that will receive the broadcast */
  audience_id: string;

  /** Sender email address */
  from: string;

  /** Email subject line */
  subject: string;

  /** Reply-to email address(es) */
  reply_to?: string[];

  /** Preview text shown before email is opened */
  preview_text?: string;

  /** Broadcast status */
  status: 'draft' | 'queued' | 'sending' | 'sent';

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Scheduled send time (ISO 8601) */
  scheduled_at?: string;

  /** Actual sent time (ISO 8601) */
  sent_at?: string;
}

/**
 * Request to create a new broadcast
 */
export interface CreateBroadcastRequest {
  /** Audience ID that will receive the broadcast */
  audience_id: string;

  /** Sender email address */
  from: string;

  /** Email subject line */
  subject: string;

  /** Reply-to email address(es) */
  reply_to?: string[];

  /** Plain text email body */
  text?: string;

  /** HTML email body */
  html?: string;

  /** Preview text shown before email is opened */
  preview_text?: string;
}

/**
 * Request to update an existing broadcast
 */
export interface UpdateBroadcastRequest {
  /** Update sender email address */
  from?: string;

  /** Update email subject line */
  subject?: string;

  /** Update reply-to email address(es) */
  reply_to?: string[];

  /** Update plain text email body */
  text?: string;

  /** Update HTML email body */
  html?: string;

  /** Update preview text */
  preview_text?: string;

  /** Schedule or reschedule send time (ISO 8601) */
  scheduled_at?: string;
}

/**
 * Response from listing broadcasts
 */
export interface ListBroadcastsResponse {
  /** Array of broadcasts */
  data: Broadcast[];
}

/**
 * Webhook types
 */

/**
 * Webhook event types
 */
export type WebhookEvent =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked';

/**
 * Webhook object
 */
export interface Webhook {
  /** Unique webhook identifier */
  id: string;

  /** Webhook endpoint URL */
  endpoint_url: string;

  /** Events that trigger this webhook */
  events: WebhookEvent[];

  /** Creation timestamp (ISO 8601) */
  created_at: string;
}

/**
 * Request to create a new webhook
 */
export interface CreateWebhookRequest {
  /** Webhook endpoint URL */
  endpoint_url: string;

  /** Events that should trigger this webhook */
  events: WebhookEvent[];
}

/**
 * Request to update an existing webhook
 */
export interface UpdateWebhookRequest {
  /** Update events that should trigger this webhook */
  events?: WebhookEvent[];
}

/**
 * Response from listing webhooks
 */
export interface ListWebhooksResponse {
  /** Array of webhooks */
  data: Webhook[];
}
