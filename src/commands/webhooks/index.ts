/**
 * Webhooks Commands
 *
 * Commands for managing webhooks
 */

import { Command } from 'commander';
import { createListCommand } from './list.ts';
import { createCreateCommand } from './create.ts';
import { createGetCommand } from './get.ts';
import { createUpdateCommand } from './update.ts';
import { createDeleteCommand } from './delete.ts';

export function createWebhooksCommand(): Command {
  const webhooks = new Command('webhooks')
    .description('Manage webhooks for email event notifications');

  // Add subcommands
  webhooks.addCommand(createListCommand());
  webhooks.addCommand(createCreateCommand());
  webhooks.addCommand(createGetCommand());
  webhooks.addCommand(createUpdateCommand());
  webhooks.addCommand(createDeleteCommand());

  return webhooks;
}
