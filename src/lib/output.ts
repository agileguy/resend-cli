/**
 * Output formatting utilities for Resend CLI
 * Supports JSON and pretty/table output with color support
 */

import chalk from 'chalk';
import type { OutputFormat } from '../types/index.js';

interface OutputOptions {
  format?: OutputFormat;
  noColor?: boolean;
}

let globalNoColor = false;

/**
 * Set global color preference
 */
export function setNoColor(value: boolean): void {
  globalNoColor = value;
}

/**
 * Get chalk instance respecting color preferences
 */
function getChalk() {
  if (globalNoColor) {
    // Return a no-op chalk instance for no-color mode
    const noopChalk = (text: string) => text;
    const noopProxy = new Proxy(noopChalk, {
      get() {
        return noopProxy;
      },
      apply(_target, _thisArg, args) {
        return String(args[0] || '');
      }
    });
    return noopProxy as unknown as typeof chalk;
  }
  return chalk;
}

/**
 * Format output based on specified format
 */
export function formatOutput(data: unknown, options: OutputOptions = {}): string {
  const format = options.format || 'json';

  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  // For table format, we'll use pretty printing
  return formatPretty(data);
}

/**
 * Format data in a human-readable pretty format
 */
function formatPretty(data: unknown): string {
  const c = getChalk();

  if (Array.isArray(data)) {
    return data.map((item, index) => {
      return `${c.dim(`[${index}]`)} ${formatPrettyObject(item)}`;
    }).join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    return formatPrettyObject(data);
  }

  return String(data);
}

/**
 * Format an object in a key-value format
 */
function formatPrettyObject(obj: object): string {
  const c = getChalk();
  const entries = Object.entries(obj);

  if (entries.length === 0) {
    return '{}';
  }

  const maxKeyLength = Math.max(...entries.map(([key]) => key.length));

  return entries.map(([key, value]) => {
    const paddedKey = key.padEnd(maxKeyLength);
    const formattedValue = formatValue(value);
    return `${c.cyan(paddedKey)}: ${formattedValue}`;
  }).join('\n');
}

/**
 * Format a value with appropriate styling
 */
function formatValue(value: unknown): string {
  const c = getChalk();

  if (value === null) {
    return c.dim('null');
  }

  if (value === undefined) {
    return c.dim('undefined');
  }

  if (typeof value === 'boolean') {
    return value ? c.green('true') : c.red('false');
  }

  if (typeof value === 'number') {
    return c.yellow(String(value));
  }

  if (typeof value === 'string') {
    return c.white(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(v => formatValue(v)).join(', ')}]`;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

/**
 * Format a success message string
 */
export function formatSuccess(message: string): string {
  const c = getChalk();
  return `${c.green('✓')} ${message}`;
}

/**
 * Format an error message string
 */
export function formatError(message: string): string {
  const c = getChalk();
  return `${c.red('✗')} ${message}`;
}

/**
 * Print success message
 */
export function success(message: string): void {
  console.log(formatSuccess(message));
}

/**
 * Print error message
 */
export function error(message: string): void {
  const c = getChalk();
  console.error(c.red('✗'), message);
}

/**
 * Print warning message
 */
export function warning(message: string): void {
  const c = getChalk();
  console.warn(c.yellow('⚠'), message);
}

/**
 * Print info message
 */
export function info(message: string): void {
  const c = getChalk();
  console.log(c.blue('ℹ'), message);
}

/**
 * Print verbose/debug message
 */
export function verbose(message: string, isVerbose = false): void {
  if (!isVerbose) return;
  const c = getChalk();
  console.log(c.dim('→'), c.dim(message));
}

/**
 * Print table from array of objects
 */
export function table(data: Array<Record<string, unknown>>): void {
  if (data.length === 0) {
    info('No data to display');
    return;
  }

  const c = getChalk();
  const keys = Object.keys(data[0] || {});
  const columnWidths = keys.map(key => {
    const maxDataWidth = Math.max(...data.map(row => String(row[key] || '').length));
    return Math.max(key.length, maxDataWidth);
  });

  // Print header
  const header = keys.map((key, i) => c.bold(key.padEnd(columnWidths[i] || 0))).join(' | ');
  console.log(header);
  console.log(keys.map((_, i) => '-'.repeat(columnWidths[i] || 0)).join('-+-'));

  // Print rows
  data.forEach(row => {
    const rowStr = keys.map((key, i) => {
      const value = String(row[key] || '').padEnd(columnWidths[i] || 0);
      return formatValue(value);
    }).join(' | ');
    console.log(rowStr);
  });
}
