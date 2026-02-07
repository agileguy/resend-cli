/**
 * Configuration commands for Resend CLI
 * Commands: init, get, set, delete
 */

import { Command } from 'commander';
import * as readline from 'readline';
import { loadConfigSync, saveConfig, getConfigPath, maskApiKey } from '../../lib/config.js';
import { success, error, info, formatOutput } from '../../lib/output.js';

/**
 * Create the config command with all subcommands
 */
export function createConfigCommand(): Command {
  const config = new Command('config')
    .description('Manage CLI configuration');

  // config init - Interactive setup
  config
    .command('init')
    .description('Initialize configuration with interactive prompts')
    .action(async () => {
      await initConfig();
    });

  // config get [key] - Display configuration
  config
    .command('get')
    .description('Display current configuration')
    .argument('[key]', 'Specific config key to display (optional)')
    .action((key?: string) => {
      getConfig(key);
    });

  // config set <key> <value> - Set configuration value
  config
    .command('set')
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key')
    .argument('<value>', 'Configuration value')
    .action(async (key: string, value: string) => {
      await setConfig(key, value);
    });

  // config delete <key> - Delete configuration value
  config
    .command('delete')
    .description('Remove a configuration value')
    .argument('<key>', 'Configuration key to remove')
    .action(async (key: string) => {
      await deleteConfig(key);
    });

  return config;
}

/**
 * Interactive configuration initialization
 */
async function initConfig(): Promise<void> {
  info('Initializing Resend CLI configuration...');
  console.log();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  };

  try {
    // Prompt for API key
    const apiKey = await question('Enter your Resend API key: ');

    if (!apiKey) {
      error('API key is required');
      rl.close();
      process.exit(1);
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith('re_')) {
      error('Invalid API key format. Resend API keys start with "re_"');
      rl.close();
      process.exit(1);
    }

    // Optional: default from email
    const defaultFrom = await question('Default FROM email address (optional): ');

    // Save configuration
    const config = {
      apiKey,
      ...(defaultFrom && { defaultFrom })
    };

    await saveConfig(config);
    rl.close();

    console.log();
    success('Configuration saved successfully!');
    info(`Config file: ${getConfigPath()}`);
    console.log();
    info('You can now use the Resend CLI without passing --api-key flag');
  } catch (err) {
    rl.close();
    error(`Failed to initialize config: ${err}`);
    process.exit(1);
  }
}

/**
 * Display current configuration
 */
function getConfig(key?: string): void {
  try {
    const config = loadConfigSync();

    if (Object.keys(config).length === 0) {
      info('No configuration found. Run "resend config init" to get started.');
      return;
    }

    // Create a display version with masked API key
    const displayConfig = { ...config };
    if (displayConfig.apiKey) {
      displayConfig.apiKey = maskApiKey(displayConfig.apiKey);
    }

    if (key) {
      // Display specific key
      const value = config[key as keyof typeof config];
      if (value === undefined) {
        error(`Configuration key "${key}" not found`);
        process.exit(1);
      }

      const displayValue = key === 'apiKey' && typeof value === 'string'
        ? maskApiKey(value)
        : value;

      console.log(formatOutput({ [key]: displayValue }));
    } else {
      // Display all configuration
      console.log(formatOutput(displayConfig));
    }
  } catch (err) {
    error(`Failed to load config: ${err}`);
    process.exit(1);
  }
}

/**
 * Set a configuration value
 */
async function setConfig(key: string, value: string): Promise<void> {
  try {
    const config = loadConfigSync();

    // Validate API key format if setting apiKey
    if (key === 'apiKey' && !value.startsWith('re_')) {
      error('Invalid API key format. Resend API keys start with "re_"');
      process.exit(1);
    }

    // Update config
    (config as Record<string, string>)[key] = value;
    await saveConfig(config);

    success(`Configuration "${key}" has been set`);
  } catch (err) {
    error(`Failed to set config: ${err}`);
    process.exit(1);
  }
}

/**
 * Delete a configuration value
 */
async function deleteConfig(key: string): Promise<void> {
  try {
    const config = loadConfigSync();

    if (!(key in config)) {
      error(`Configuration key "${key}" not found`);
      process.exit(1);
    }

    // Remove key
    delete (config as Record<string, unknown>)[key];
    await saveConfig(config);

    success(`Configuration "${key}" has been removed`);
  } catch (err) {
    error(`Failed to delete config: ${err}`);
    process.exit(1);
  }
}
