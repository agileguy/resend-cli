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
}
