/**
 * Update Contact Command
 *
 * Update an existing contact
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import type { UpdateContactRequest } from '../../types/api.ts';

export function createUpdateCommand(): Command {
  return new Command('update')
    .description('Update a contact')
    .argument('<audience-id>', 'Audience ID')
    .argument('<contact-id>', 'Contact ID')
    .option('--first-name <name>', 'Update contact first name')
    .option('--last-name <name>', 'Update contact last name')
    .option('--unsubscribe', 'Mark contact as unsubscribed')
    .action(async (audienceId, contactId, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Build request
        const request: UpdateContactRequest = {};

        if (options.firstName !== undefined) {
          request.first_name = options.firstName;
        }

        if (options.lastName !== undefined) {
          request.last_name = options.lastName;
        }

        if (options.unsubscribe) {
          request.unsubscribed = true;
        }

        // Check if at least one field is being updated
        if (Object.keys(request).length === 0) {
          console.error(formatError('No fields specified for update. Use --first-name, --last-name, or --unsubscribe'));
          process.exit(1);
        }

        // Update contact
        const client = new ResendClient({ apiKey });
        const response = await client.updateContact(audienceId, contactId, request);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess(`Contact updated successfully!`));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  Email: ${response.data.email}`);
          if (response.data.first_name || response.data.last_name) {
            console.log(`  Name: ${[response.data.first_name, response.data.last_name].filter(Boolean).join(' ')}`);
          }
          console.log(`  Subscribed: ${response.data.unsubscribed ? 'No' : 'Yes'}`);
        }
      } catch (error) {
        if (error instanceof ResendAPIError) {
          console.error(formatError(`API Error: ${error.message}`));
          if (error.statusCode) {
            console.error(`  Status: ${error.statusCode}`);
          }
        } else if (error instanceof Error) {
          console.error(formatError(error.message));
        } else {
          console.error(formatError('An unexpected error occurred'));
        }
        process.exit(1);
      }
    });
}
