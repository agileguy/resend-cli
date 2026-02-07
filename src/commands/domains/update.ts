/**
 * Update Domain Command
 *
 * Update domain settings
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import type { UpdateDomainRequest } from '../../types/api.ts';

export function createUpdateCommand(): Command {
  return new Command('update')
    .description('Update domain settings')
    .argument('<domain-id>', 'Domain ID to update')
    .option('--open-tracking <enabled>', 'Enable/disable open tracking (true/false)')
    .option('--click-tracking <enabled>', 'Enable/disable click tracking (true/false)')
    .action(async (domainId, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Build update request
        const updateRequest: UpdateDomainRequest = {};

        if (options.openTracking !== undefined) {
          const value = options.openTracking.toLowerCase();
          if (value !== 'true' && value !== 'false') {
            console.error(formatError('--open-tracking must be "true" or "false"'));
            process.exit(1);
          }
          updateRequest.open_tracking = value === 'true';
        }

        if (options.clickTracking !== undefined) {
          const value = options.clickTracking.toLowerCase();
          if (value !== 'true' && value !== 'false') {
            console.error(formatError('--click-tracking must be "true" or "false"'));
            process.exit(1);
          }
          updateRequest.click_tracking = value === 'true';
        }

        // Check if any options were provided
        if (Object.keys(updateRequest).length === 0) {
          console.error(formatError('No update options provided. Use --open-tracking or --click-tracking'));
          process.exit(1);
        }

        // Update domain
        const client = new ResendClient({ apiKey });
        const response = await client.updateDomain(domainId, updateRequest);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess('Domain updated successfully!'));
          console.log(`  Domain: ${response.data.name}`);

          if (updateRequest.open_tracking !== undefined) {
            console.log(`  Open Tracking: ${updateRequest.open_tracking ? 'enabled' : 'disabled'}`);
          }

          if (updateRequest.click_tracking !== undefined) {
            console.log(`  Click Tracking: ${updateRequest.click_tracking ? 'enabled' : 'disabled'}`);
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
