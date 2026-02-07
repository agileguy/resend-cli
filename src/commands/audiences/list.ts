/**
 * List Audiences Command
 *
 * List all audiences
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, table } from '../../lib/output.ts';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all audiences')
    .action(async (_options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Fetch audiences
        const client = new ResendClient({ apiKey });
        const response = await client.listAudiences();

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          if (response.data.data.length === 0) {
            console.log('No audiences found.');
          } else {
            const tableData = response.data.data.map((audience) => ({
              ID: audience.id,
              Name: audience.name,
              Created: new Date(audience.created_at).toLocaleString(),
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
