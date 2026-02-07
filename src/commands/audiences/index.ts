/**
 * Audiences Command Group
 *
 * Commands for managing audiences
 */

import { Command } from 'commander';
import { createListCommand } from './list.ts';
import { createCreateCommand } from './create.ts';
import { createGetCommand } from './get.ts';
import { createDeleteCommand } from './delete.ts';

export function createAudiencesCommand(): Command {
  const audiencesCommand = new Command('audiences')
    .description('Manage audiences');

  // Add subcommands
  audiencesCommand.addCommand(createListCommand());
  audiencesCommand.addCommand(createCreateCommand());
  audiencesCommand.addCommand(createGetCommand());
  audiencesCommand.addCommand(createDeleteCommand());

  return audiencesCommand;
}
