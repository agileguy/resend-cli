/**
 * Get Broadcast Command
 *
 * Get details of a specific broadcast by ID
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError } from '../../lib/output.ts';

export function createGetCommand(): Command {
  return new Command('get')
    .description('Get broadcast details by ID')
    .argument('<broadcast-id>', 'Broadcast ID')
    .action(async (broadcastId: string, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Fetch broadcast
        const client = new ResendClient({ apiKey });
        const response = await client.getBroadcast(broadcastId);

        // Output result
        console.log(formatOutput(response.data, { format: globalOpts.output }));
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
