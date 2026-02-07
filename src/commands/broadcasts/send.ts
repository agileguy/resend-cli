/**
 * Send Broadcast Command
 *
 * Send a broadcast to its audience
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
    rl.question(`${message} [y/N]: `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

export function createSendCommand(): Command {
  return new Command('send')
    .description('Send a broadcast to its audience')
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

        const client = new ResendClient({ apiKey });

        // Get broadcast details first
        const broadcastResponse = await client.getBroadcast(broadcastId);
        const broadcast = broadcastResponse.data;

        // Get audience to show recipient count
        const audienceResponse = await client.getAudience(broadcast.audience_id);
        const contactsResponse = await client.listContacts(broadcast.audience_id);
        const recipientCount = contactsResponse.data.data.length;

        // Show broadcast details and request confirmation
        if (!options.force) {
          console.log('\nBroadcast Details:');
          console.log(`  Subject: ${broadcast.subject}`);
          console.log(`  From: ${broadcast.from}`);
          console.log(`  Audience: ${audienceResponse.data.name}`);
          console.log(`  Recipients: ${recipientCount}`);
          console.log(`  Status: ${broadcast.status}\n`);

          const confirmed = await confirm(
            `Are you sure you want to send this broadcast to ${recipientCount} recipient(s)?`
          );
          if (!confirmed) {
            console.log('Cancelled.');
            return;
          }
        }

        // Send broadcast
        const response = await client.sendBroadcast(broadcastId);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess('Broadcast sent successfully!'));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  Status: ${response.data.status}`);
          console.log(`  Recipients: ${recipientCount}`);
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
