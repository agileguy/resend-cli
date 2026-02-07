/**
 * Cancel Email Command
 *
 * Cancel a scheduled email
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import * as readline from 'readline';

/**
 * Prompt user for confirmation
 */
function promptConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

export function createCancelCommand(): Command {
  return new Command('cancel')
    .description('Cancel a scheduled email')
    .argument('<email-id>', 'Email ID to cancel')
    .option('--force', 'Skip confirmation prompt')
    .action(async (emailId: string, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Require confirmation unless --force is used
        if (!options.force) {
          const confirmed = await promptConfirmation(
            `Are you sure you want to cancel email ${emailId}?`
          );

          if (!confirmed) {
            console.log('Cancellation aborted');
            return;
          }
        }

        // Cancel email
        const client = new ResendClient({ apiKey });
        const response = await client.cancelEmail(emailId);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          if (response.data.canceled) {
            console.log(formatSuccess('Scheduled email canceled successfully!'));
            console.log(`  ID: ${emailId}`);
          } else {
            console.error(formatError('Failed to cancel email'));
          }
        }
      } catch (error) {
        if (error instanceof ResendAPIError) {
          console.error(formatError(`API Error: ${error.message}`));
          if (error.statusCode === 404) {
            console.error('  Email not found or not scheduled');
          } else if (error.statusCode === 400) {
            console.error('  Cannot cancel email (may already be sent or not scheduled)');
          } else if (error.statusCode) {
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
