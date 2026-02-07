/**
 * Send Email Command
 *
 * Send a single email via the Resend API
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { loadConfig, getApiKey } from '../../lib/config.ts';
import { validateEmail, validateEmails } from '../../lib/validators.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import type { SendEmailRequest } from '../../types/api.ts';
import * as fs from 'fs';
import * as path from 'path';

export function createSendCommand(): Command {
  return new Command('send')
    .description('Send an email')
    .requiredOption('--from <email>', 'Sender email address')
    .requiredOption('--to <email...>', 'Recipient email address(es)')
    .requiredOption('--subject <text>', 'Email subject')
    .option('--text <content>', 'Plain text body')
    .option('--html <content>', 'HTML body')
    .option('--html-file <path>', 'Read HTML body from file')
    .option('--cc <email...>', 'CC recipient(s)')
    .option('--bcc <email...>', 'BCC recipient(s)')
    .option('--reply-to <email>', 'Reply-to address')
    .option('--tag <name:value...>', 'Tags in name:value format')
    .option('--attachment <path...>', 'File attachment(s) (can be used multiple times)')
    .option('--scheduled-at <datetime>', 'Schedule email for later (ISO 8601 format)')
    .action(async (options, command) => {
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

        // Validate to emails
        const toEmails = Array.isArray(options.to) ? options.to : [options.to];
        const toValidation = validateEmails(toEmails);
        if (toValidation.invalid.length > 0) {
          console.error(formatError(`Invalid recipient email(s): ${toValidation.invalid.join(', ')}`));
          process.exit(1);
        }

        // Validate CC emails if provided
        if (options.cc) {
          const ccEmails = Array.isArray(options.cc) ? options.cc : [options.cc];
          const ccValidation = validateEmails(ccEmails);
          if (ccValidation.invalid.length > 0) {
            console.error(formatError(`Invalid CC email(s): ${ccValidation.invalid.join(', ')}`));
            process.exit(1);
          }
        }

        // Validate BCC emails if provided
        if (options.bcc) {
          const bccEmails = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
          const bccValidation = validateEmails(bccEmails);
          if (bccValidation.invalid.length > 0) {
            console.error(formatError(`Invalid BCC email(s): ${bccValidation.invalid.join(', ')}`));
            process.exit(1);
          }
        }

        // Validate reply-to if provided
        if (options.replyTo && !validateEmail(options.replyTo)) {
          console.error(formatError(`Invalid reply-to email: ${options.replyTo}`));
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

        // Require at least text or html content
        if (!options.text && !htmlContent) {
          console.error(formatError('Either --text or --html/--html-file is required'));
          process.exit(1);
        }

        // Parse tags
        let tags: Array<{ name: string; value: string }> | undefined;
        if (options.tag) {
          const tagArray = Array.isArray(options.tag) ? options.tag : [options.tag];
          tags = tagArray.map((t: string) => {
            const [name, ...valueParts] = t.split(':');
            return { name, value: valueParts.join(':') };
          });
        }

        // Process attachments
        let attachments: Array<{ filename: string; content: string; content_type?: string }> | undefined;
        if (options.attachment) {
          const attachmentPaths = Array.isArray(options.attachment) ? options.attachment : [options.attachment];
          attachments = [];

          for (const attachmentPath of attachmentPaths) {
            const resolvedPath = path.resolve(attachmentPath);
            if (!fs.existsSync(resolvedPath)) {
              console.error(formatError(`Attachment file not found: ${resolvedPath}`));
              process.exit(1);
            }

            // Read file and convert to base64
            const fileContent = fs.readFileSync(resolvedPath);
            const base64Content = fileContent.toString('base64');
            const filename = path.basename(resolvedPath);

            attachments.push({
              filename,
              content: base64Content,
            });
          }
        }

        // Validate scheduled time if provided
        if (options.scheduledAt) {
          try {
            const date = new Date(options.scheduledAt);
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
        }

        // Build request
        const request: SendEmailRequest = {
          from: options.from,
          to: toEmails,
          subject: options.subject,
        };

        if (options.text) {
          request.text = options.text;
        }

        if (htmlContent) {
          request.html = htmlContent;
        }

        if (options.cc) {
          request.cc = Array.isArray(options.cc) ? options.cc : [options.cc];
        }

        if (options.bcc) {
          request.bcc = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
        }

        if (options.replyTo) {
          request.reply_to = options.replyTo;
        }

        if (tags) {
          request.tags = tags;
        }

        if (attachments) {
          request.attachments = attachments;
        }

        if (options.scheduledAt) {
          request.scheduled_at = options.scheduledAt;
        }

        // Send email
        const client = new ResendClient({ apiKey });
        const response = await client.sendEmail(request);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, 'json'));
        } else {
          console.log(formatSuccess(`Email sent successfully!`));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  To: ${toEmails.join(', ')}`);
          console.log(`  Subject: ${options.subject}`);
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
