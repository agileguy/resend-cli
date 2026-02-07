/**
 * Email Commands
 *
 * Commands for sending and managing emails
 */

import { Command } from 'commander';
import { createSendCommand } from './send.ts';
import { createGetCommand } from './get.ts';
import { createListCommand } from './list.ts';
import { createSendBatchCommand } from './send-batch.ts';
import { createUpdateCommand } from './update.ts';
import { createCancelCommand } from './cancel.ts';

/**
 * Create the emails command group
 */
export function createEmailsCommand(): Command {
  const cmd = new Command('emails')
    .description('Manage emails');

  cmd.addCommand(createSendCommand());
  cmd.addCommand(createGetCommand());
  cmd.addCommand(createListCommand());
  cmd.addCommand(createSendBatchCommand());
  cmd.addCommand(createUpdateCommand());
  cmd.addCommand(createCancelCommand());

  return cmd;
}

// For backward compatibility, also export individual commands
export { createSendCommand };
