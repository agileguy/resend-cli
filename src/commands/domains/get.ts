/**
 * Get Domain Command
 *
 * Get details for a specific domain
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError } from '../../lib/output.ts';
import chalk from 'chalk';

export function createGetCommand(): Command {
  return new Command('get')
    .description('Get domain details')
    .argument('<domain-id>', 'Domain ID')
    .action(async (domainId, _options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Get domain
        const client = new ResendClient({ apiKey });
        const response = await client.getDomain(domainId);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          const domain = response.data;

          console.log(chalk.bold('Domain Details'));
          console.log(chalk.dim('=============='));
          console.log();
          console.log(`${chalk.cyan('ID')}: ${domain.id}`);
          console.log(`${chalk.cyan('Name')}: ${domain.name}`);
          console.log(`${chalk.cyan('Status')}: ${domain.status}`);
          console.log(`${chalk.cyan('Region')}: ${domain.region}`);
          console.log(`${chalk.cyan('Created')}: ${new Date(domain.created_at).toLocaleString()}`);
          console.log();
          console.log(chalk.bold('DNS Records'));
          console.log(chalk.dim('-----------'));

          // Display DNS records
          domain.records.forEach((record, index) => {
            console.log();
            console.log(chalk.dim(`Record ${index + 1}:`));
            console.log(`  Type: ${chalk.cyan(record.type)}`);
            console.log(`  Name: ${record.name}`);
            console.log(`  Value: ${record.value}`);
            if (record.priority) {
              console.log(`  Priority: ${record.priority}`);
            }
            console.log(`  TTL: ${record.ttl}`);

            const statusIcon = record.status === 'verified' ? '✓' :
                              record.status === 'failed' ? '✗' : '○';
            const statusColor = record.status === 'verified' ? chalk.green :
                               record.status === 'failed' ? chalk.red : chalk.yellow;
            console.log(`  Status: ${statusColor(statusIcon + ' ' + record.status)}`);
          });

          if (domain.status !== 'verified') {
            console.log();
            console.log(chalk.dim(`Run "resend domains verify ${domain.id}" to check DNS configuration`));
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
