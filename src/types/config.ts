/**
 * Configuration Types
 *
 * Type definitions for CLI configuration and environment
 */

/**
 * Output format options for command responses
 */
export type OutputFormat = 'json' | 'pretty' | 'table';

/**
 * Log level for CLI output
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

/**
 * CLI configuration file structure
 */
export interface Config {
  /** Resend API key */
  apiKey?: string;

  /** Default sender email address */
  defaultFrom?: string;

  /** Preferred output format */
  outputFormat?: OutputFormat;

  /** Log level */
  logLevel?: LogLevel;

  /** API base URL (for testing/overrides) */
  apiBaseUrl?: string;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Number of retry attempts for failed requests */
  retries?: number;

  /** Default tags to apply to all emails */
  defaultTags?: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * Configuration file location options
 */
export interface ConfigLocation {
  /** Path to config file */
  path: string;

  /** Whether the file exists */
  exists: boolean;
}

/**
 * Environment variables for configuration
 */
export interface EnvironmentConfig {
  /** Resend API key from environment */
  RESEND_API_KEY?: string;

  /** Default sender from environment */
  RESEND_DEFAULT_FROM?: string;

  /** Output format from environment */
  RESEND_OUTPUT_FORMAT?: OutputFormat;

  /** Log level from environment */
  RESEND_LOG_LEVEL?: LogLevel;

  /** API base URL from environment */
  RESEND_API_BASE_URL?: string;
}

/**
 * Merged configuration from all sources
 * (environment variables override config file)
 */
export interface ResolvedConfig {
  /** Resend API key (required) */
  apiKey: string;

  /** Default sender email address */
  defaultFrom?: string;

  /** Output format (default: 'pretty') */
  outputFormat: OutputFormat;

  /** Log level (default: 'info') */
  logLevel: LogLevel;

  /** API base URL (default: 'https://api.resend.com') */
  apiBaseUrl: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout: number;

  /** Number of retry attempts (default: 3) */
  retries: number;

  /** Default tags */
  defaultTags: Array<{
    name: string;
    value: string;
  }>;
}

/**
 * Configuration defaults
 */
export const DEFAULT_CONFIG: Partial<ResolvedConfig> = {
  outputFormat: 'pretty',
  logLevel: 'info',
  apiBaseUrl: 'https://api.resend.com',
  timeout: 30000,
  retries: 3,
  defaultTags: [],
};

/**
 * Configuration file paths by priority
 */
export const CONFIG_FILE_PATHS = [
  '.resend.json',           // Project-specific config (highest priority)
  '~/.resend.json',         // User home directory config
  '~/.config/resend.json',  // XDG config directory
] as const;
