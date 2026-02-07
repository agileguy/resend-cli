/**
 * List Emails Command
 *
 * List sent emails with pagination support
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, table } from '../../lib/output.ts';

export function createListCommand(): Command {
  return new Command('list')
    .description('List sent emails')
    .option('--limit <number>', 'Maximum number of emails to return', '20')
    .option('--cursor <value>', 'Pagination cursor for next page')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Parse limit
        const limit = parseInt(options.limit, 10);
        if (isNaN(limit) || limit < 1 || limit > 100) {
          console.error(formatError('Limit must be between 1 and 100'));
          process.exit(1);
        }

        // List emails
        const client = new ResendClient({ apiKey });
        const response = await client.listEmails({
          limit,
          cursor: options.cursor,
        });

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          const emails = response.data.data;

          if (emails.length === 0) {
            console.log('No emails found');
            return;
          }

          // Format data for table display
          const tableData = emails.map(email => ({
            ID: email.id.substring(0, 8) + '...',
            From: email.from,
            To: email.to.join(', '),
            Subject: email.subject.length > 40 ? email.subject.substring(0, 37) + '...' : email.subject,
            Status: email.status || 'N/A',
            Date: new Date(email.created_at).toLocaleString(),
          }));

          table(tableData);

          if (response.data.next_cursor) {
            console.log(`\nNext page: --cursor ${response.data.next_cursor}`);
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
