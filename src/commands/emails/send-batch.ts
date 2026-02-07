/**
 * Send Batch Emails Command
 *
 * Send multiple emails in a single batch request
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { validateEmail, validateEmails } from '../../lib/validators.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import type { SendEmailRequest } from '../../types/api.ts';
import * as fs from 'fs';
import * as path from 'path';

export function createSendBatchCommand(): Command {
  return new Command('send-batch')
    .description('Send multiple emails in a batch')
    .argument('<json-file>', 'JSON file containing array of email objects')
    .action(async (jsonFile: string, _options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Read and parse JSON file
        const filePath = path.resolve(jsonFile);
        if (!fs.existsSync(filePath)) {
          console.error(formatError(`JSON file not found: ${filePath}`));
          process.exit(1);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        let emails: SendEmailRequest[];

        try {
          const parsed = JSON.parse(fileContent);
          if (!Array.isArray(parsed)) {
            console.error(formatError('JSON file must contain an array of email objects'));
            process.exit(1);
          }
          emails = parsed;
        } catch (parseError) {
          console.error(formatError('Invalid JSON format'));
          if (parseError instanceof Error) {
            console.error(`  ${parseError.message}`);
          }
          process.exit(1);
        }

        if (emails.length === 0) {
          console.error(formatError('No emails found in JSON file'));
          process.exit(1);
        }

        // Validate each email
        const validationErrors: string[] = [];

        emails.forEach((email, index) => {
          if (!email.from || !validateEmail(email.from)) {
            validationErrors.push(`Email ${index + 1}: Invalid sender email: ${email.from}`);
          }

          if (!email.to) {
            validationErrors.push(`Email ${index + 1}: Missing recipient`);
          } else {
            const toEmails = Array.isArray(email.to) ? email.to : [email.to];
            const toValidation = validateEmails(toEmails);
            if (toValidation.invalid.length > 0) {
              validationErrors.push(`Email ${index + 1}: Invalid recipient(s): ${toValidation.invalid.join(', ')}`);
            }
          }

          if (!email.subject) {
            validationErrors.push(`Email ${index + 1}: Missing subject`);
          }

          if (!email.text && !email.html) {
            validationErrors.push(`Email ${index + 1}: Must have either text or html content`);
          }

          // Validate optional fields
          if (email.cc) {
            const ccEmails = Array.isArray(email.cc) ? email.cc : [email.cc];
            const ccValidation = validateEmails(ccEmails);
            if (ccValidation.invalid.length > 0) {
              validationErrors.push(`Email ${index + 1}: Invalid CC email(s): ${ccValidation.invalid.join(', ')}`);
            }
          }

          if (email.bcc) {
            const bccEmails = Array.isArray(email.bcc) ? email.bcc : [email.bcc];
            const bccValidation = validateEmails(bccEmails);
            if (bccValidation.invalid.length > 0) {
              validationErrors.push(`Email ${index + 1}: Invalid BCC email(s): ${bccValidation.invalid.join(', ')}`);
            }
          }

          if (email.reply_to) {
            const replyToEmails = Array.isArray(email.reply_to) ? email.reply_to : [email.reply_to];
            const replyToValidation = validateEmails(replyToEmails);
            if (replyToValidation.invalid.length > 0) {
              validationErrors.push(`Email ${index + 1}: Invalid reply-to email(s): ${replyToValidation.invalid.join(', ')}`);
            }
          }
        });

        if (validationErrors.length > 0) {
          console.error(formatError('Validation errors:'));
          validationErrors.forEach(err => console.error(`  ${err}`));
          process.exit(1);
        }

        // Send batch
        const client = new ResendClient({ apiKey });
        const response = await client.sendBatchEmails({ emails });

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess(`Batch of ${response.data.data.length} emails sent successfully!`));
          response.data.data.forEach((result, index) => {
            console.log(`  Email ${index + 1}: ${result.id}`);
          });
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
