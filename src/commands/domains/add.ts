/**
 * Add Domain Command
 *
 * Add a new domain to your Resend account
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import chalk from 'chalk';

export function createAddCommand(): Command {
  return new Command('add')
    .description('Add a new domain')
    .argument('<domain-name>', 'Domain name to add (e.g., example.com)')
    .option('--region <region>', 'AWS region (us-east-1, eu-west-1, sa-east-1)', 'us-east-1')
    .action(async (domainName, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Validate region
        const validRegions = ['us-east-1', 'eu-west-1', 'sa-east-1'];
        if (!validRegions.includes(options.region)) {
          console.error(formatError(`Invalid region: ${options.region}. Must be one of: ${validRegions.join(', ')}`));
          process.exit(1);
        }

        // Create domain
        const client = new ResendClient({ apiKey });
        const response = await client.createDomain({
          name: domainName,
          region: options.region,
        });

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          console.log(formatSuccess(`Domain added successfully!`));
          console.log(`  ID: ${response.data.id}`);
          console.log(`  Name: ${response.data.name}`);
          console.log(`  Region: ${response.data.region}`);
          console.log(`  Status: ${response.data.status}`);
          console.log();
          console.log(chalk.bold('DNS Records to Configure:'));
          console.log(chalk.dim('------------------------'));

          // Display DNS records
          response.data.records.forEach(record => {
            console.log();
            console.log(`Type: ${chalk.cyan(record.type)}`);
            console.log(`Name: ${record.name}`);
            console.log(`Value: ${record.value}`);
            if (record.priority) {
              console.log(`Priority: ${record.priority}`);
            }
            console.log(`TTL: ${record.ttl}`);
            const statusIcon = record.status === 'verified' ? '✓' : '○';
            const statusColor = record.status === 'verified' ? chalk.green : chalk.yellow;
            console.log(`Status: ${statusColor(statusIcon + ' ' + record.status)}`);
          });

          console.log();
          console.log(chalk.dim(`After configuring DNS records, verify with: resend domains verify ${response.data.id}`));
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
