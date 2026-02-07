/**
 * Create Contact Command
 *
 * Create a new contact in an audience
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { validateEmail } from '../../lib/validators.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import type { CreateContactRequest } from '../../types/api.ts';

export function createCreateCommand(): Command {
  return new Command('create')
    .description('Create a new contact')
    .argument('<audience-id>', 'Audience ID')
    .requiredOption('--email <email>', 'Contact email address')
    .option('--first-name <name>', 'Contact first name')
    .option('--last-name <name>', 'Contact last name')
    .action(async (audienceId, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Validate email
        if (!validateEmail(options.email)) {
          console.error(formatError(`Invalid email address: ${options.email}`));
          process.exit(1);
        }

        // Build request
        const request: CreateContactRequest = {
          audience_id: audienceId,
          email: options.email,
        };

        if (options.firstName) {
          request.first_name = options.firstName;
        }

        if (options.lastName) {
          request.last_name = options.lastName;
        }

        // Create contact
        const client = new ResendClient({ apiKey });
        const response = await client.createContact(request);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess(`Contact created successfully!`));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  Email: ${response.data.email}`);
          if (response.data.first_name || response.data.last_name) {
            console.log(`  Name: ${[response.data.first_name, response.data.last_name].filter(Boolean).join(' ')}`);
          }
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
