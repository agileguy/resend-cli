/**
 * List Broadcasts Command
 *
 * List all broadcasts in the account
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, table } from '../../lib/output.ts';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all broadcasts')
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

        // Fetch broadcasts
        const client = new ResendClient({ apiKey });
        const response = await client.listBroadcasts();

        // Output result
        if (options.json || globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          if (response.data.data.length === 0) {
            console.log('No broadcasts found.');
            return;
          }

          // Format as table
          const tableData = response.data.data.map((broadcast) => ({
            ID: broadcast.id,
            Subject: broadcast.subject.slice(0, 40) + (broadcast.subject.length > 40 ? '...' : ''),
            Status: broadcast.status,
            'Audience ID': broadcast.audience_id,
            Scheduled: broadcast.scheduled_at
              ? new Date(broadcast.scheduled_at).toLocaleString()
              : '-',
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
