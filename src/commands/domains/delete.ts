/**
 * Delete Domain Command
 *
 * Delete a domain from your Resend account
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
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
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

export function createDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a domain')
    .argument('<domain-id>', 'Domain ID to delete')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (domainId, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Get domain details first to show what will be deleted
        const client = new ResendClient({ apiKey });
        const domainResponse = await client.getDomain(domainId);
        const domainName = domainResponse.data.name;

        // Confirm deletion unless --force is used
        if (!options.force) {
          const confirmed = await confirm(
            `Are you sure you want to delete domain "${domainName}"? This action cannot be undone.`
          );

          if (!confirmed) {
            console.log('Deletion cancelled.');
            process.exit(0);
          }
        }

        // Delete domain
        const response = await client.deleteDomain(domainId);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess(`Domain "${domainName}" deleted successfully!`));
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
