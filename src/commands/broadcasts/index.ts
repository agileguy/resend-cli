/**
 * Broadcasts Commands
 *
 * Commands for managing broadcasts
 */

import { Command } from 'commander';
import { createListCommand } from './list.ts';
import { createCreateCommand } from './create.ts';
import { createGetCommand } from './get.ts';
import { createUpdateCommand } from './update.ts';
import { createSendCommand } from './send.ts';
import { createDeleteCommand } from './delete.ts';

export function createBroadcastsCommand(): Command {
  const broadcasts = new Command('broadcasts')
    .description('Manage broadcasts for sending emails to audiences');

  // Add subcommands
  broadcasts.addCommand(createListCommand());
  broadcasts.addCommand(createCreateCommand());
  broadcasts.addCommand(createGetCommand());
  broadcasts.addCommand(createUpdateCommand());
  broadcasts.addCommand(createSendCommand());
  broadcasts.addCommand(createDeleteCommand());

  return broadcasts;
}
