/**
 * Delete Audience Command
 *
 * Delete an audience by ID
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatError, formatSuccess } from '../../lib/output.ts';
import * as readline from 'readline';

export function createDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete an audience')
    .argument('<audience-id>', 'Audience ID')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (audienceId, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Confirm deletion unless --force is used
        if (!options.force) {
          const confirmed = await confirmDeletion(audienceId);
          if (!confirmed) {
            console.log('Deletion cancelled.');
            process.exit(0);
          }
        }

        // Delete audience
        const client = new ResendClient({ apiKey });
        await client.deleteAudience(audienceId);

        console.log(formatSuccess(`Audience ${audienceId} deleted successfully!`));
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

/**
 * Prompt user to confirm deletion
 */
async function confirmDeletion(audienceId: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `Are you sure you want to delete audience ${audienceId}? This action cannot be undone. (y/N) `,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      }
    );
  });
}
