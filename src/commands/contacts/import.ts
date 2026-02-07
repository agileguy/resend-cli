/**
 * Import Contacts Command
 *
 * Import contacts from a CSV file
 */

import { Command } from 'commander';
import { ResendClient, ResendAPIError } from '../../lib/api-client.ts';
import { getApiKey } from '../../lib/config.ts';
import { validateEmail } from '../../lib/validators.ts';
import { formatError, formatSuccess } from '../../lib/output.ts';
import * as fs from 'fs';
import * as path from 'path';

interface ContactRow {
  email: string;
  first_name?: string;
  last_name?: string;
}

export function createImportCommand(): Command {
  return new Command('import')
    .description('Import contacts from a CSV file')
    .argument('<audience-id>', 'Audience ID')
    .argument('<csv-file>', 'Path to CSV file')
    .action(async (audienceId, csvFile, _options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Get API key
        const apiKey = getApiKey(globalOpts.apiKey);
        if (!apiKey) {
          console.error(formatError('No API key configured. Run "resend config init" or use --api-key'));
          process.exit(1);
        }

        // Check if file exists
        const filePath = path.resolve(csvFile);
        if (!fs.existsSync(filePath)) {
          console.error(formatError(`CSV file not found: ${filePath}`));
          process.exit(1);
        }

        // Read and parse CSV
        const content = fs.readFileSync(filePath, 'utf-8');
        const contacts = parseCSV(content);

        if (contacts.length === 0) {
          console.error(formatError('No valid contacts found in CSV file'));
          process.exit(1);
        }

        console.log(`Found ${contacts.length} contact(s) in CSV file`);

        // Import contacts
        const client = new ResendClient({ apiKey });
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          process.stdout.write(`Importing contact ${i + 1}/${contacts.length}: ${contact.email}...`);

          try {
            await client.createContact({
              audience_id: audienceId,
              email: contact.email,
              first_name: contact.first_name,
              last_name: contact.last_name,
            });
            process.stdout.write(' ✓\n');
            successCount++;
          } catch (error) {
            process.stdout.write(' ✗\n');
            errorCount++;
            if (error instanceof ResendAPIError) {
              errors.push(`  ${contact.email}: ${error.message}`);
            } else if (error instanceof Error) {
              errors.push(`  ${contact.email}: ${error.message}`);
            }
          }
        }

        // Print summary
        console.log('');
        console.log(formatSuccess(`Import complete!`));
        console.log(`  Successfully imported: ${successCount}`);
        if (errorCount > 0) {
          console.log(`  Failed: ${errorCount}`);
          console.log('');
          console.log('Errors:');
          errors.forEach((error) => console.log(error));
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

/**
 * Parse CSV content into contact objects
 */
function parseCSV(content: string): ContactRow[] {
  const lines = content.trim().split('\n');

  if (lines.length === 0) {
    return [];
  }

  // Parse headers
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  // Find column indices
  const emailIndex = headers.findIndex((h) => h === 'email');
  const firstNameIndex = headers.findIndex((h) => h === 'first_name' || h === 'firstname');
  const lastNameIndex = headers.findIndex((h) => h === 'last_name' || h === 'lastname');

  if (emailIndex === -1) {
    throw new Error('CSV file must have an "email" column');
  }

  // Parse data rows
  const contacts: ContactRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim());
    const email = values[emailIndex];

    // Validate email
    if (!email || !validateEmail(email)) {
      continue;
    }

    const contact: ContactRow = { email };

    if (firstNameIndex !== -1 && values[firstNameIndex]) {
      contact.first_name = values[firstNameIndex];
    }

    if (lastNameIndex !== -1 && values[lastNameIndex]) {
      contact.last_name = values[lastNameIndex];
    }

    contacts.push(contact);
  }

  return contacts;
}
