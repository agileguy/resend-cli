/**
 * Update Webhook Command
 *
 * Update an existing webhook
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import type { UpdateWebhookRequest, WebhookEvent } from '../../types/api.ts';

const VALID_EVENTS: WebhookEvent[] = [
  'email.sent',
  'email.delivered',
  'email.delivery_delayed',
  'email.complained',
  'email.bounced',
  'email.opened',
  'email.clicked',
];

export function createUpdateCommand(): Command {
  return new Command('update')
    .description('Update a webhook')
    .argument('<webhook-id>', 'Webhook ID')
    .requiredOption(
      '--events <event...>',
      `Events to subscribe to (can be used multiple times). Valid events: ${VALID_EVENTS.join(', ')}`
    )
    .action(async (webhookId: string, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Validate events
        const events = Array.isArray(options.events) ? options.events : [options.events];
        for (const event of events) {
          if (!VALID_EVENTS.includes(event as WebhookEvent)) {
            console.error(formatError(`Invalid event: ${event}`));
            console.error(`Valid events: ${VALID_EVENTS.join(', ')}`);
            process.exit(1);
          }
        }

        // Build request
        const request: UpdateWebhookRequest = {
          events: events as WebhookEvent[],
        };

        // Update webhook
        const client = new ResendClient({ apiKey });
        const response = await client.updateWebhook(webhookId, request);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess('Webhook updated successfully!'));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  Events: ${response.data.events.join(', ')}`);
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
