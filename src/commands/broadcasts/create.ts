/**
 * Create Broadcast Command
 *
 * Create a new broadcast for an audience
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { validateEmail } from '../../lib/validators.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import type { CreateBroadcastRequest } from '../../types/api.ts';
import * as fs from 'fs';
import * as path from 'path';

export function createCreateCommand(): Command {
  return new Command('create')
    .description('Create a new broadcast')
    .argument('<audience-id>', 'Audience ID to send broadcast to')
    .requiredOption('--from <email>', 'Sender email address')
    .requiredOption('--subject <text>', 'Email subject')
    .option('--text <content>', 'Plain text body')
    .option('--html <content>', 'HTML body')
    .option('--html-file <path>', 'Read HTML body from file')
    .option('--reply-to <email...>', 'Reply-to address(es)')
    .option('--preview-text <text>', 'Preview text shown before email is opened')
    .action(async (audienceId: string, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Validate from email
        if (!validateEmail(options.from)) {
          console.error(formatError(`Invalid sender email: ${options.from}`));
          process.exit(1);
        }

        // Validate reply-to emails if provided
        if (options.replyTo) {
          const replyToEmails = Array.isArray(options.replyTo) ? options.replyTo : [options.replyTo];
          for (const email of replyToEmails) {
            if (!validateEmail(email)) {
              console.error(formatError(`Invalid reply-to email: ${email}`));
              process.exit(1);
            }
          }
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

        // Require at least text or html content
        if (!options.text && !htmlContent) {
          console.error(formatError('Either --text or --html/--html-file is required'));
          process.exit(1);
        }

        // Build request
        const request: CreateBroadcastRequest = {
          audience_id: audienceId,
          from: options.from,
          subject: options.subject,
        };

        if (options.text) {
          request.text = options.text;
        }

        if (htmlContent) {
          request.html = htmlContent;
        }

        if (options.replyTo) {
          request.reply_to = Array.isArray(options.replyTo) ? options.replyTo : [options.replyTo];
        }

        if (options.previewText) {
          request.preview_text = options.previewText;
        }

        // Create broadcast
        const client = new ResendClient({ apiKey });
        const response = await client.createBroadcast(request);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess('Broadcast created successfully!'));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  Audience: ${response.data.audience_id}`);
          console.log(`  Subject: ${response.data.subject}`);
          console.log(`  Status: ${response.data.status}`);
          console.log(`\nUse "resend broadcasts send ${response.data.id}" to send it.`);
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
