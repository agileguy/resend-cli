/**
 * Type definitions for Resend CLI
 */

/**
 * CLI Configuration stored in ~/.resend/config.json
 */
export interface Config {
  apiKey?: string;
  defaultFrom?: string;
  output?: OutputFormat;
}

/**
 * Output format options
 */
export type OutputFormat = 'json' | 'table';

/**
 * Global CLI options
 */
export interface GlobalOptions {
  apiKey?: string;
  output?: OutputFormat;
  verbose?: boolean;
  noColor?: boolean;
}

/**
 * Configuration command options
 */
export interface ConfigCommandOptions {
  key?: string;
  value?: string;
}
