/**
 * Delete Broadcast Command
 *
 * Delete a broadcast
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatError, formatSuccess } from '../../lib/output.ts';
import * as readline from 'readline';

/**
 * Prompt user for confirmation
 */
async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} [y/N]: `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

export function createDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a broadcast')
    .argument('<broadcast-id>', 'Broadcast ID')
    .option('--force', 'Skip confirmation prompt')
    .action(async (broadcastId: string, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Request confirmation
        if (!options.force) {
          const confirmed = await confirm(`Are you sure you want to delete broadcast ${broadcastId}?`);
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        // Delete broadcast
        const client = new ResendClient({ apiKey });
        await client.deleteBroadcast(broadcastId);

        console.log(formatSuccess('Broadcast deleted successfully!'));
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
