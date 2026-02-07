/**
 * Update Email Command
 *
 * Update a scheduled email (reschedule)
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';

export function createUpdateCommand(): Command {
  return new Command('update')
    .description('Update a scheduled email')
    .argument('<email-id>', 'Email ID to update')
    .requiredOption('--scheduled-at <datetime>', 'New scheduled send time (ISO 8601 format)')
    .action(async (emailId: string, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Validate ISO 8601 date format
        const scheduledAt = options.scheduledAt;
        try {
          const date = new Date(scheduledAt);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
          }
          // Check if date is in the future
          if (date <= new Date()) {
            console.error(formatError('Scheduled time must be in the future'));
            process.exit(1);
          }
        } catch {
          console.error(formatError('Invalid date format. Use ISO 8601 format (e.g., 2024-12-31T23:59:59Z)'));
          process.exit(1);
        }

        // Update email
        const client = new ResendClient({ apiKey });
        const response = await client.updateEmail(emailId, {
          scheduled_at: scheduledAt,
        });

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess('Email rescheduled successfully!'));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  New scheduled time: ${scheduledAt}`);
        }
      } catch (error) {
        if (error instanceof ResendAPIError) {
          console.error(formatError(`API Error: ${error.message}`));
          if (error.statusCode === 404) {
            console.error('  Email not found or not scheduled');
          } else if (error.statusCode === 400) {
            console.error('  Cannot update email (may already be sent or not scheduled)');
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
