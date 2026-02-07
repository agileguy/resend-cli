/**
 * List Webhooks Command
 *
 * List all webhooks in the account
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, table } from '../../lib/output.ts';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all webhooks')
    .option('--json', 'Output in JSON format')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Fetch webhooks
        const client = new ResendClient({ apiKey });
        const response = await client.listWebhooks();

        // Output result
        if (options.json || globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          if (response.data.data.length === 0) {
            console.log('No webhooks found.');
            return;
          }

          // Format as table
          const tableData = response.data.data.map((webhook) => ({
            ID: webhook.id,
            URL: webhook.endpoint_url.slice(0, 50) + (webhook.endpoint_url.length > 50 ? '...' : ''),
            Events: webhook.events.join(', '),
            Created: new Date(webhook.created_at).toLocaleString(),
          }));

          table(tableData);
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
