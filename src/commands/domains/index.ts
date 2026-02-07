/**
 * Domains Command Group
 *
 * Manage sending domains
 */

import { Command } from 'commander';
import { createListCommand } from './list.ts';
import { createAddCommand } from './add.ts';
import { createGetCommand } from './get.ts';
import { createVerifyCommand } from './verify.ts';
import { createUpdateCommand } from './update.ts';
import { createDeleteCommand } from './delete.ts';

/**
 * Create the domains command with all subcommands
 */
export function createDomainsCommand(): Command {
  const cmd = new Command('domains')
    .description('Manage sending domains');

  // Add subcommands
  cmd.addCommand(createListCommand());
  cmd.addCommand(createAddCommand());
  cmd.addCommand(createGetCommand());
  cmd.addCommand(createVerifyCommand());
  cmd.addCommand(createUpdateCommand());
  cmd.addCommand(createDeleteCommand());

  return cmd;
}
