/**
 * Update Broadcast Command
 *
 * Update an existing broadcast
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { validateEmail } from '../../lib/validators.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import type { UpdateBroadcastRequest } from '../../types/api.ts';
import * as fs from 'fs';
import * as path from 'path';

export function createUpdateCommand(): Command {
  return new Command('update')
    .description('Update a broadcast')
    .argument('<broadcast-id>', 'Broadcast ID')
    .option('--from <email>', 'Update sender email address')
    .option('--subject <text>', 'Update email subject')
    .option('--text <content>', 'Update plain text body')
    .option('--html <content>', 'Update HTML body')
    .option('--html-file <path>', 'Read HTML body from file')
    .option('--scheduled-at <datetime>', 'Schedule send time (ISO 8601 format)')
    .action(async (broadcastId: string, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Validate from email if provided
        if (options.from && !validateEmail(options.from)) {
          console.error(formatError(`Invalid sender email: ${options.from}`));
          process.exit(1);
        }

        // Get HTML content from file if specified
        let htmlContent = options.html;
        if (options.htmlFile) {
          const filePath = path.resolve(options.htmlFile);
          if (!fs.existsSync(filePath)) {
            console.error(formatError(`HTML file not found: ${filePath}`));
            process.exit(1);
          }
          htmlContent = fs.readFileSync(filePath, 'utf-8');
        }

        // Build request
        const request: UpdateBroadcastRequest = {};

        if (options.from) {
          request.from = options.from;
        }

        if (options.subject) {
          request.subject = options.subject;
        }

        if (options.text) {
          request.text = options.text;
        }

        if (htmlContent) {
          request.html = htmlContent;
        }

        if (options.scheduledAt) {
          request.scheduled_at = options.scheduledAt;
        }

        // Check if any updates were provided
        if (Object.keys(request).length === 0) {
          console.error(formatError('No updates specified. Use --from, --subject, --text, --html, or --scheduled-at'));
          process.exit(1);
        }

        // Update broadcast
        const client = new ResendClient({ apiKey });
        const response = await client.updateBroadcast(broadcastId, request);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess('Broadcast updated successfully!'));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  Status: ${response.data.status}`);
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
