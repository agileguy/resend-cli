/**
 * List Contacts Command
 *
 * List all contacts in an audience
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, table } from '../../lib/output.ts';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all contacts in an audience')
    .argument('<audience-id>', 'Audience ID')
    .action(async (audienceId, _options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Fetch contacts
        const client = new ResendClient({ apiKey });
        const response = await client.listContacts(audienceId);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          if (response.data.data.length === 0) {
            console.log('No contacts found in this audience.');
          } else {
            const tableData = response.data.data.map((contact) => ({
              ID: contact.id,
              Email: contact.email,
              Name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || '-',
              Subscribed: contact.unsubscribed ? 'No' : 'Yes',
              Created: new Date(contact.created_at).toLocaleString(),
            }));
            table(tableData);
          }
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
