/**
 * Contacts Command Group
 *
 * Commands for managing contacts
 */

import { Command } from 'commander';
import { createListCommand } from './list.ts';
import { createCreateCommand } from './create.ts';
import { createGetCommand } from './get.ts';
import { createUpdateCommand } from './update.ts';
import { createDeleteCommand } from './delete.ts';
import { createImportCommand } from './import.ts';

export function createContactsCommand(): Command {
  const contactsCommand = new Command('contacts')
    .description('Manage contacts in audiences');

  // Add subcommands
  contactsCommand.addCommand(createListCommand());
  contactsCommand.addCommand(createCreateCommand());
  contactsCommand.addCommand(createGetCommand());
  contactsCommand.addCommand(createUpdateCommand());
  contactsCommand.addCommand(createDeleteCommand());
  contactsCommand.addCommand(createImportCommand());

  return contactsCommand;
}
