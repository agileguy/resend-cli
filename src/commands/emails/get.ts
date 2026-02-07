/**
 * Get Email Command
 *
 * Fetch email details by ID from the Resend API
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError } from '../../lib/output.ts';

export function createGetCommand(): Command {
  return new Command('get')
    .description('Get email details by ID')
    .argument('<email-id>', 'Email ID to fetch')
    .action(async (emailId: string, _options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Fetch email
        const client = new ResendClient({ apiKey });
        const response = await client.getEmail(emailId);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          const email = response.data;
          console.log(`Email ID: ${email.id}`);
          console.log(`From: ${email.from}`);
          console.log(`To: ${email.to.join(', ')}`);
          console.log(`Subject: ${email.subject}`);
          console.log(`Status: ${email.status || 'N/A'}`);
          console.log(`Created: ${email.created_at}`);

          if (email.last_event) {
            console.log(`Last Event: ${email.last_event}`);
          }

          if (email.cc && email.cc.length > 0) {
            console.log(`CC: ${email.cc.join(', ')}`);
          }

          if (email.bcc && email.bcc.length > 0) {
            console.log(`BCC: ${email.bcc.join(', ')}`);
          }

          if (email.reply_to && email.reply_to.length > 0) {
            console.log(`Reply-To: ${email.reply_to.join(', ')}`);
          }

          if (email.tags && email.tags.length > 0) {
            console.log(`Tags: ${email.tags.map(t => `${t.name}:${t.value}`).join(', ')}`);
          }
        }
      } catch (error) {
        if (error instanceof ResendAPIError) {
          console.error(formatError(`API Error: ${error.message}`));
          if (error.statusCode === 404) {
            console.error('  Email not found');
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
