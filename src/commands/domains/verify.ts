/**
 * Verify Domain Command
 *
 * Trigger DNS verification for a domain
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { formatOutput, formatError, formatSuccess } from '../../lib/output.ts';
import chalk from 'chalk';

export function createVerifyCommand(): Command {
  return new Command('verify')
    .description('Verify domain DNS configuration')
    .argument('<domain-id>', 'Domain ID to verify')
    .action(async (domainId, _options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Verify domain
        const client = new ResendClient({ apiKey });
        const response = await client.verifyDomain(domainId);

        // Output result
        if (globalOpts.output === 'json') {
          console.log(formatOutput(response.data, { format: 'json' }));
        } else {
          const domain = response.data;

          if (domain.status === 'verified') {
            console.log(formatSuccess('Domain verified successfully!'));
          } else {
            console.log(chalk.yellow('⚠') + ` Domain verification in progress: ${domain.status}`);
          }

          console.log(`  Domain: ${domain.name}`);
          console.log(`  Status: ${domain.status}`);
          console.log();
          console.log(chalk.bold('DNS Records Status:'));

          // Display DNS records verification status
          domain.records.forEach((record, index) => {
            const statusIcon = record.status === 'verified' ? chalk.green('✓') :
                              record.status === 'failed' ? chalk.red('✗') :
                              chalk.yellow('○');
            console.log(`  ${statusIcon} ${record.type} - ${record.status}`);

            if (record.status !== 'verified') {
              console.log(chalk.dim(`    Name: ${record.name}`));
              console.log(chalk.dim(`    Value: ${record.value}`));
            }
          });

          if (domain.status !== 'verified') {
            console.log();
            console.log(chalk.dim('DNS records may take up to 48 hours to propagate.'));
            console.log(chalk.dim('Run this command again to check verification status.'));
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
