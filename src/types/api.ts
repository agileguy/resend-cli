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
