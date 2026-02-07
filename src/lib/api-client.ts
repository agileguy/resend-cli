/**
 * Resend API Client
 *
 * HTTP client for interacting with the Resend API
 */

import type {
  SendEmailRequest,
  SendEmailResponse,
  Email,
  ListEmailsOptions,
  ListEmailsResponse,
  RateLimitInfo,
  Domain,
  CreateDomainRequest,
  UpdateDomainRequest,
  ListDomainsResponse,
  BatchEmailRequest,
  BatchEmailResponse,
  UpdateEmailRequest,
  Audience,
  CreateAudienceRequest,
  ListAudiencesResponse,
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ListContactsResponse,
  Broadcast,
  CreateBroadcastRequest,
  UpdateBroadcastRequest,
  ListBroadcastsResponse,
  Webhook,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  ListWebhooksResponse,
} from '../types/api.ts';

/**
 * Custom error class for API errors
 */
export class ResendAPIError extends Error {
  public statusCode?: number;
  public details?: Record<string, unknown>;

  constructor(message: string, statusCode?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ResendAPIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Options for the Resend API client
 */
export interface ResendClientOptions {
  /** API key for authentication */
  apiKey: string;

  /** Base URL for the API (default: https://api.resend.com) */
  baseUrl?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Maximum retry attempts for 5xx errors (default: 3) */
  maxRetries?: number;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resend API Client
 */
export class ResendClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;

  constructor(options: ResendClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.resend.com';
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * Make an HTTP request to the Resend API with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; rateLimit?: RateLimitInfo }> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    // Retry loop for 5xx errors
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'resend-cli/1.0.0',
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse rate limit headers
        const rateLimit = this.parseRateLimitHeaders(response.headers);

        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
          const errorMessage =
            (typeof errorData.message === 'string' ? errorData.message : undefined) ||
            `API request failed with status ${response.status}`;

          // For 5xx errors, retry
          if (response.status >= 500 && attempt < this.maxRetries - 1) {
            lastError = new ResendAPIError(errorMessage, response.status, errorData);
            const delay = this.calculateBackoff(attempt);
            await sleep(delay);
            continue;
          }

          // For other errors, throw immediately
          throw new ResendAPIError(errorMessage, response.status, errorData);
        }

        // Parse successful response
        const data = await response.json();
        return { data: data as T, rateLimit };
      } catch (error) {
        // Handle timeout and network errors
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ResendAPIError(
            `Request timeout after ${this.timeout}ms`,
            0,
            { timeout: this.timeout }
          );
        }

        // If it's already a ResendAPIError, check if we should retry
        if (error instanceof ResendAPIError && error.statusCode && error.statusCode >= 500) {
          lastError = error;
          if (attempt < this.maxRetries - 1) {
            const delay = this.calculateBackoff(attempt);
            await sleep(delay);
            continue;
          }
        }

        // Re-throw non-retryable errors
        throw error;
      }
    }

    // If we've exhausted all retries, throw the last error
    throw lastError || new ResendAPIError('Request failed after maximum retries');
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attempt), 4000);
  }

  /**
   * Parse rate limit headers from response
   */
  private parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');

    if (limit && remaining && reset) {
      return {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }

    return undefined;
  }

  /**
   * Send an email
   *
   * @param request - Email request payload
   * @returns Email ID and rate limit info
   *
   * @example
   * ```ts
   * const response = await client.sendEmail({
   *   from: 'sender@example.com',
   *   to: 'recipient@example.com',
   *   subject: 'Hello',
   *   text: 'Welcome!',
   * });
   * console.log('Email sent:', response.data.id);
   * ```
   */
  async sendEmail(
    request: SendEmailRequest
  ): Promise<{ data: SendEmailResponse; rateLimit?: RateLimitInfo }> {
    return this.request<SendEmailResponse>('/emails', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get email details by ID
   *
   * @param id - Email ID
   * @returns Email details and rate limit info
   *
   * @example
   * ```ts
   * const email = await client.getEmail('550e8400-e29b-41d4-a716-446655440000');
   * console.log('Email status:', email.data.status);
   * ```
   */
  async getEmail(id: string): Promise<{ data: Email; rateLimit?: RateLimitInfo }> {
    return this.request<Email>(`/emails/${id}`);
  }

  /**
   * List sent emails
   *
   * @param options - Pagination and filtering options
   * @returns List of emails and rate limit info
   *
   * @example
   * ```ts
   * const emails = await client.listEmails({ limit: 10 });
   * console.log('Found', emails.data.data.length, 'emails');
   * ```
   */
  async listEmails(
    options: ListEmailsOptions = {}
  ): Promise<{ data: ListEmailsResponse; rateLimit?: RateLimitInfo }> {
    const params = new URLSearchParams();

    if (options.limit) {
      params.set('limit', options.limit.toString());
    }

    if (options.cursor) {
      params.set('cursor', options.cursor);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/emails?${queryString}` : '/emails';

    return this.request<ListEmailsResponse>(endpoint);
  }

  /**
   * Send multiple emails in a batch
   *
   * @param request - Batch email request with array of emails
   * @returns Array of email IDs and rate limit info
   *
   * @example
   * ```ts
   * const response = await client.sendBatchEmails({
   *   emails: [
   *     { from: 'sender@example.com', to: 'user1@example.com', subject: 'Hello', text: 'Welcome!' },
   *     { from: 'sender@example.com', to: 'user2@example.com', subject: 'Hello', text: 'Welcome!' },
   *   ]
   * });
   * console.log('Sent', response.data.data.length, 'emails');
   * ```
   */
  async sendBatchEmails(
    request: BatchEmailRequest
  ): Promise<{ data: BatchEmailResponse; rateLimit?: RateLimitInfo }> {
    return this.request<BatchEmailResponse>('/emails/batch', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Update a scheduled email
   *
   * @param id - Email ID
   * @param request - Update request with new scheduled time
   * @returns Updated email and rate limit info
   *
   * @example
   * ```ts
   * const email = await client.updateEmail('550e8400-e29b-41d4-a716-446655440000', {
   *   scheduled_at: '2024-12-31T23:59:59Z',
   * });
   * console.log('Email rescheduled');
   * ```
   */
  async updateEmail(
    id: string,
    request: UpdateEmailRequest
  ): Promise<{ data: Email; rateLimit?: RateLimitInfo }> {
    return this.request<Email>(`/emails/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  /**
   * Cancel a scheduled email
   *
   * @param id - Email ID
   * @returns Cancellation confirmation and rate limit info
   *
   * @example
   * ```ts
   * await client.cancelEmail('550e8400-e29b-41d4-a716-446655440000');
   * console.log('Scheduled email canceled');
   * ```
   */
  async cancelEmail(id: string): Promise<{ data: { canceled: boolean }; rateLimit?: RateLimitInfo }> {
    return this.request<{ canceled: boolean }>(`/emails/${id}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Test API key validity
   *
   * @returns true if API key is valid
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.listEmails({ limit: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * List all domains
   *
   * @returns List of domains and rate limit info
   *
   * @example
   * ```ts
   * const domains = await client.listDomains();
   * console.log('Found', domains.data.data.length, 'domains');
   * ```
   */
  async listDomains(): Promise<{ data: ListDomainsResponse; rateLimit?: RateLimitInfo }> {
    return this.request<ListDomainsResponse>('/domains');
  }

  /**
   * Create a new domain
   *
   * @param request - Domain creation request
   * @returns Created domain and rate limit info
   *
   * @example
   * ```ts
   * const domain = await client.createDomain({
   *   name: 'example.com',
   *   region: 'us-east-1',
   * });
   * console.log('Domain created:', domain.data.id);
   * ```
   */
  async createDomain(
    request: CreateDomainRequest
  ): Promise<{ data: Domain; rateLimit?: RateLimitInfo }> {
    return this.request<Domain>('/domains', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get domain details by ID
   *
   * @param id - Domain ID
   * @returns Domain details and rate limit info
   *
   * @example
   * ```ts
   * const domain = await client.getDomain('d91cd9bd-1176-453e-8fc1-35364d380206');
   * console.log('Domain status:', domain.data.status);
   * ```
   */
  async getDomain(id: string): Promise<{ data: Domain; rateLimit?: RateLimitInfo }> {
    return this.request<Domain>(`/domains/${id}`);
  }

  /**
   * Verify domain DNS configuration
   *
   * @param id - Domain ID
   * @returns Updated domain with verification results
   *
   * @example
   * ```ts
   * const domain = await client.verifyDomain('d91cd9bd-1176-453e-8fc1-35364d380206');
   * console.log('Verification status:', domain.data.status);
   * ```
   */
  async verifyDomain(id: string): Promise<{ data: Domain; rateLimit?: RateLimitInfo }> {
    return this.request<Domain>(`/domains/${id}/verify`, {
      method: 'POST',
    });
  }

  /**
   * Update domain settings
   *
   * @param id - Domain ID
   * @param request - Domain update request
   * @returns Updated domain and rate limit info
   *
   * @example
   * ```ts
   * const domain = await client.updateDomain('d91cd9bd-1176-453e-8fc1-35364d380206', {
   *   open_tracking: true,
   *   click_tracking: true,
   * });
   * console.log('Domain updated');
   * ```
   */
  async updateDomain(
    id: string,
    request: UpdateDomainRequest
  ): Promise<{ data: Domain; rateLimit?: RateLimitInfo }> {
    return this.request<Domain>(`/domains/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete a domain
   *
   * @param id - Domain ID
   * @returns Deletion confirmation and rate limit info
   *
   * @example
   * ```ts
   * await client.deleteDomain('d91cd9bd-1176-453e-8fc1-35364d380206');
   * console.log('Domain deleted');
   * ```
   */
  async deleteDomain(id: string): Promise<{ data: { deleted: boolean }; rateLimit?: RateLimitInfo }> {
    return this.request<{ deleted: boolean }>(`/domains/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * List all broadcasts
   *
   * @returns List of broadcasts and rate limit info
   *
   * @example
   * ```ts
   * const broadcasts = await client.listBroadcasts();
   * console.log('Found', broadcasts.data.data.length, 'broadcasts');
   * ```
   */
  async listBroadcasts(): Promise<{ data: ListBroadcastsResponse; rateLimit?: RateLimitInfo }> {
    return this.request<ListBroadcastsResponse>('/broadcasts');
  }

  /**
   * Create a new broadcast
   *
   * @param request - Broadcast creation request
   * @returns Created broadcast and rate limit info
   *
   * @example
   * ```ts
   * const broadcast = await client.createBroadcast({
   *   audience_id: 'aud_123',
   *   from: 'sender@example.com',
   *   subject: 'Newsletter',
   *   text: 'Content',
   * });
   * console.log('Broadcast created:', broadcast.data.id);
   * ```
   */
  async createBroadcast(
    request: CreateBroadcastRequest
  ): Promise<{ data: Broadcast; rateLimit?: RateLimitInfo }> {
    return this.request<Broadcast>('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get broadcast details by ID
   *
   * @param id - Broadcast ID
   * @returns Broadcast details and rate limit info
   *
   * @example
   * ```ts
   * const broadcast = await client.getBroadcast('brd_123');
   * console.log('Broadcast status:', broadcast.data.status);
   * ```
   */
  async getBroadcast(id: string): Promise<{ data: Broadcast; rateLimit?: RateLimitInfo }> {
    return this.request<Broadcast>(`/broadcasts/${id}`);
  }

  /**
   * Update a broadcast
   *
   * @param id - Broadcast ID
   * @param request - Broadcast update request
   * @returns Updated broadcast and rate limit info
   *
   * @example
   * ```ts
   * const broadcast = await client.updateBroadcast('brd_123', {
   *   subject: 'Updated Newsletter',
   * });
   * console.log('Broadcast updated');
   * ```
   */
  async updateBroadcast(
    id: string,
    request: UpdateBroadcastRequest
  ): Promise<{ data: Broadcast; rateLimit?: RateLimitInfo }> {
    return this.request<Broadcast>(`/broadcasts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  /**
   * Send a broadcast
   *
   * @param id - Broadcast ID
   * @returns Sent broadcast and rate limit info
   *
   * @example
   * ```ts
   * const broadcast = await client.sendBroadcast('brd_123');
   * console.log('Broadcast sent');
   * ```
   */
  async sendBroadcast(id: string): Promise<{ data: Broadcast; rateLimit?: RateLimitInfo }> {
    return this.request<Broadcast>(`/broadcasts/${id}/send`, {
      method: 'POST',
    });
  }

  /**
   * Delete a broadcast
   *
   * @param id - Broadcast ID
   * @returns Deletion confirmation and rate limit info
   *
   * @example
   * ```ts
   * await client.deleteBroadcast('brd_123');
   * console.log('Broadcast deleted');
   * ```
   */
  async deleteBroadcast(id: string): Promise<{ data: { deleted: boolean }; rateLimit?: RateLimitInfo }> {
    return this.request<{ deleted: boolean }>(`/broadcasts/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * List all webhooks
   *
   * @returns List of webhooks and rate limit info
   *
   * @example
   * ```ts
   * const webhooks = await client.listWebhooks();
   * console.log('Found', webhooks.data.data.length, 'webhooks');
   * ```
   */
  async listWebhooks(): Promise<{ data: ListWebhooksResponse; rateLimit?: RateLimitInfo }> {
    return this.request<ListWebhooksResponse>('/webhooks');
  }

  /**
   * Create a new webhook
   *
   * @param request - Webhook creation request
   * @returns Created webhook and rate limit info
   *
   * @example
   * ```ts
   * const webhook = await client.createWebhook({
   *   endpoint_url: 'https://example.com/webhook',
   *   events: ['email.sent', 'email.delivered'],
   * });
   * console.log('Webhook created:', webhook.data.id);
   * ```
   */
  async createWebhook(
    request: CreateWebhookRequest
  ): Promise<{ data: Webhook; rateLimit?: RateLimitInfo }> {
    return this.request<Webhook>('/webhooks', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get webhook details by ID
   *
   * @param id - Webhook ID
   * @returns Webhook details and rate limit info
   *
   * @example
   * ```ts
   * const webhook = await client.getWebhook('wh_123');
   * console.log('Webhook endpoint:', webhook.data.endpoint_url);
   * ```
   */
  async getWebhook(id: string): Promise<{ data: Webhook; rateLimit?: RateLimitInfo }> {
    return this.request<Webhook>(`/webhooks/${id}`);
  }

  /**
   * Update a webhook
   *
   * @param id - Webhook ID
   * @param request - Webhook update request
   * @returns Updated webhook and rate limit info
   *
   * @example
   * ```ts
   * const webhook = await client.updateWebhook('wh_123', {
   *   events: ['email.sent', 'email.bounced'],
   * });
   * console.log('Webhook updated');
   * ```
   */
  async updateWebhook(
    id: string,
    request: UpdateWebhookRequest
  ): Promise<{ data: Webhook; rateLimit?: RateLimitInfo }> {
    return this.request<Webhook>(`/webhooks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete a webhook
   *
   * @param id - Webhook ID
   * @returns Deletion confirmation and rate limit info
   *
   * @example
   * ```ts
   * await client.deleteWebhook('wh_123');
   * console.log('Webhook deleted');
   * ```
   */
  async deleteWebhook(id: string): Promise<{ data: { deleted: boolean }; rateLimit?: RateLimitInfo }> {
    return this.request<{ deleted: boolean }>(`/webhooks/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * List all audiences
   *
   * @returns List of audiences and rate limit info
   *
   * @example
   * ```ts
   * const audiences = await client.listAudiences();
   * console.log('Found', audiences.data.data.length, 'audiences');
   * ```
   */
  async listAudiences(): Promise<{ data: ListAudiencesResponse; rateLimit?: RateLimitInfo }> {
    return this.request<ListAudiencesResponse>('/audiences');
  }

  /**
   * Create a new audience
   *
   * @param request - Audience creation request
   * @returns Created audience and rate limit info
   *
   * @example
   * ```ts
   * const audience = await client.createAudience({
   *   name: 'Newsletter Subscribers',
   * });
   * console.log('Audience created:', audience.data.id);
   * ```
   */
  async createAudience(
    request: CreateAudienceRequest
  ): Promise<{ data: Audience; rateLimit?: RateLimitInfo }> {
    return this.request<Audience>('/audiences', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get audience details by ID
   *
   * @param id - Audience ID
   * @returns Audience details and rate limit info
   *
   * @example
   * ```ts
   * const audience = await client.getAudience('78261eea-8f8b-4381-83c6-79fa7120f1cf');
   * console.log('Audience name:', audience.data.name);
   * ```
   */
  async getAudience(id: string): Promise<{ data: Audience; rateLimit?: RateLimitInfo }> {
    return this.request<Audience>(`/audiences/${id}`);
  }

  /**
   * Delete an audience
   *
   * @param id - Audience ID
   * @returns Deletion confirmation and rate limit info
   *
   * @example
   * ```ts
   * await client.deleteAudience('78261eea-8f8b-4381-83c6-79fa7120f1cf');
   * console.log('Audience deleted');
   * ```
   */
  async deleteAudience(id: string): Promise<{ data: { deleted: boolean }; rateLimit?: RateLimitInfo }> {
    return this.request<{ deleted: boolean }>(`/audiences/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * List contacts in an audience
   *
   * @param audienceId - Audience ID
   * @returns List of contacts and rate limit info
   *
   * @example
   * ```ts
   * const contacts = await client.listContacts('78261eea-8f8b-4381-83c6-79fa7120f1cf');
   * console.log('Found', contacts.data.data.length, 'contacts');
   * ```
   */
  async listContacts(audienceId: string): Promise<{ data: ListContactsResponse; rateLimit?: RateLimitInfo }> {
    return this.request<ListContactsResponse>(`/audiences/${audienceId}/contacts`);
  }

  /**
   * Create a new contact in an audience
   *
   * @param request - Contact creation request with audience ID
   * @returns Created contact and rate limit info
   *
   * @example
   * ```ts
   * const contact = await client.createContact({
   *   audience_id: '78261eea-8f8b-4381-83c6-79fa7120f1cf',
   *   email: 'user@example.com',
   *   first_name: 'John',
   *   last_name: 'Doe',
   * });
   * console.log('Contact created:', contact.data.id);
   * ```
   */
  async createContact(
    request: CreateContactRequest
  ): Promise<{ data: Contact; rateLimit?: RateLimitInfo }> {
    const { audience_id, ...contactData } = request;
    return this.request<Contact>(`/audiences/${audience_id}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  /**
   * Get contact details by ID
   *
   * @param audienceId - Audience ID
   * @param contactId - Contact ID
   * @returns Contact details and rate limit info
   *
   * @example
   * ```ts
   * const contact = await client.getContact(
   *   '78261eea-8f8b-4381-83c6-79fa7120f1cf',
   *   'e169aa45-1ecf-4183-9955-b1499d5701d3'
   * );
   * console.log('Contact email:', contact.data.email);
   * ```
   */
  async getContact(
    audienceId: string,
    contactId: string
  ): Promise<{ data: Contact; rateLimit?: RateLimitInfo }> {
    return this.request<Contact>(`/audiences/${audienceId}/contacts/${contactId}`);
  }

  /**
   * Update a contact
   *
   * @param audienceId - Audience ID
   * @param contactId - Contact ID
   * @param request - Contact update request
   * @returns Updated contact and rate limit info
   *
   * @example
   * ```ts
   * const contact = await client.updateContact(
   *   '78261eea-8f8b-4381-83c6-79fa7120f1cf',
   *   'e169aa45-1ecf-4183-9955-b1499d5701d3',
   *   { first_name: 'Jane', unsubscribed: false }
   * );
   * console.log('Contact updated');
   * ```
   */
  async updateContact(
    audienceId: string,
    contactId: string,
    request: UpdateContactRequest
  ): Promise<{ data: Contact; rateLimit?: RateLimitInfo }> {
    return this.request<Contact>(`/audiences/${audienceId}/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete a contact
   *
   * @param audienceId - Audience ID
   * @param contactId - Contact ID
   * @returns Deletion confirmation and rate limit info
   *
   * @example
   * ```ts
   * await client.deleteContact(
   *   '78261eea-8f8b-4381-83c6-79fa7120f1cf',
   *   'e169aa45-1ecf-4183-9955-b1499d5701d3'
   * );
   * console.log('Contact deleted');
   * ```
   */
  async deleteContact(
    audienceId: string,
    contactId: string
  ): Promise<{ data: { deleted: boolean }; rateLimit?: RateLimitInfo }> {
    return this.request<{ deleted: boolean }>(`/audiences/${audienceId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }
}
