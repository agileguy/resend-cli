#!/usr/bin/env bun

/**
 * Resend CLI - Official command-line interface for Resend
 * The Email API for Developers
 */

import { Command } from 'commander';
import { createConfigCommand } from './commands/config/index.js';
import { setNoColor } from './lib/output.js';
import type { GlobalOptions } from './types/index.js';

// Package metadata
const VERSION = '0.1.0';
const DESCRIPTION = 'Official CLI for Resend - The Email API for Developers';

/**
 * Main CLI program
 */
function createProgram(): Command {
  const program = new Command();

  program
    .name('resend')
    .description(DESCRIPTION)
    .version(VERSION, '-v, --version', 'Output the current version')
    .helpOption('-h, --help', 'Display help for command');

  // Global options
  program
    .option('--api-key <key>', 'Resend API key (overrides config and env)')
    .option('--output <format>', 'Output format: json or table', 'json')
    .option('--verbose', 'Enable verbose logging')
    .option('--no-color', 'Disable colored output');

  // Hook to process global options before command execution
  program.hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts<GlobalOptions>();

    // Set color preference globally
    if (opts.noColor) {
      setNoColor(true);
    }
  });

  return program;
}

/**
 * Register all commands
 */
function registerCommands(program: Command): void {
  // Configuration commands
  program.addCommand(createConfigCommand());

  // TODO: Add more commands in future phases
  // - send (Phase 1)
  // - domains (Phase 2)
  // - api-keys (Phase 2)
  // - contacts (Phase 3)
  // - audiences (Phase 3)
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const program = createProgram();
  registerCommands(program);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the CLI
main();
