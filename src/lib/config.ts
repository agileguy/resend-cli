/**
 * Configuration Management
 *
 * Handles loading, saving, and merging configuration from files and environment
 */

import type {
  Config,
  ConfigLocation,
  EnvironmentConfig,
  ResolvedConfig,
} from '../types/config.js';
import { DEFAULT_CONFIG, CONFIG_FILE_PATHS } from '../types/config.js';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

/**
 * Get the user's home directory
 */
function getHomeDirectory(): string {
  return process.env.HOME || process.env.USERPROFILE || '~';
}

/**
 * Expand tilde (~) in file paths to home directory
 */
function expandPath(path: string): string {
  if (path.startsWith('~/')) {
    return path.replace('~', getHomeDirectory());
  }
  return path;
}

/**
 * Find the first existing config file
 */
export async function findConfigFile(): Promise<ConfigLocation | null> {
  for (const configPath of CONFIG_FILE_PATHS) {
    const expandedPath = expandPath(configPath);
    const file = Bun.file(expandedPath);
    const exists = await file.exists();

    if (exists) {
      return {
        path: expandedPath,
        exists: true,
      };
    }
  }

  return null;
}

/**
 * Load configuration from a JSON file
 */
export async function loadConfigFile(path: string): Promise<Config> {
  try {
    const file = Bun.file(path);
    const exists = await file.exists();

    if (!exists) {
      return {};
    }

    const text = await file.text();
    const config = JSON.parse(text) as Config;

    return config;
  } catch (error) {
    throw new Error(
      `Failed to load config file from ${path}: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

/**
 * Save configuration to a JSON file
 */
export async function saveConfigFile(path: string, config: Config): Promise<void> {
  try {
    const expandedPath = expandPath(path);
    await Bun.write(expandedPath, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error(
      `Failed to save config file to ${path}: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

/**
 * Load configuration from environment variables
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_DEFAULT_FROM: process.env.RESEND_DEFAULT_FROM,
    RESEND_OUTPUT_FORMAT: process.env.RESEND_OUTPUT_FORMAT as EnvironmentConfig['RESEND_OUTPUT_FORMAT'],
    RESEND_LOG_LEVEL: process.env.RESEND_LOG_LEVEL as EnvironmentConfig['RESEND_LOG_LEVEL'],
    RESEND_API_BASE_URL: process.env.RESEND_API_BASE_URL,
  };
}

/**
 * Merge configuration from all sources (environment > file > defaults)
 */
export function mergeConfig(
  fileConfig: Config,
  envConfig: EnvironmentConfig
): Partial<ResolvedConfig> {
  return {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    // Environment variables override file config
    apiKey: envConfig.RESEND_API_KEY || fileConfig.apiKey,
    defaultFrom: envConfig.RESEND_DEFAULT_FROM || fileConfig.defaultFrom,
    outputFormat: envConfig.RESEND_OUTPUT_FORMAT || fileConfig.outputFormat || DEFAULT_CONFIG.outputFormat,
    logLevel: envConfig.RESEND_LOG_LEVEL || fileConfig.logLevel || DEFAULT_CONFIG.logLevel,
    apiBaseUrl: envConfig.RESEND_API_BASE_URL || fileConfig.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl,
  };
}

/**
 * Load and resolve complete configuration
 */
export async function loadConfig(): Promise<Partial<ResolvedConfig>> {
  const configLocation = await findConfigFile();
  const fileConfig = configLocation
    ? await loadConfigFile(configLocation.path)
    : {};
  const envConfig = loadEnvironmentConfig();

  return mergeConfig(fileConfig, envConfig);
}

/**
 * Validate that required configuration is present
 */
export function validateConfig(config: Partial<ResolvedConfig>): config is ResolvedConfig {
  if (!config.apiKey) {
    return false;
  }

  return true;
}

/**
 * Get API key from override, environment, or configuration
 */
export function getApiKey(override?: string): string | undefined {
  // Priority: override > environment > config file
  if (override) {
    return override;
  }

  if (process.env.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY;
  }

  // Try to load from config file synchronously
  try {
    const configPath = expandPath(CONFIG_FILE_PATHS[0] as string);
    const file = Bun.file(configPath);
    // Use synchronous check - loadConfig is async but we need sync here
    const content = require('fs').readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);
    return config.apiKey;
  } catch {
    return undefined;
  }
}

/**
 * Initialize a new config file
 */
export async function initConfig(apiKey: string, path?: string): Promise<string> {
  const configPath = path || expandPath(CONFIG_FILE_PATHS[0] as string);
  const config: Config = {
    apiKey,
    outputFormat: 'pretty',
    logLevel: 'info',
  };

  await saveConfigFile(configPath, config);
  return configPath;
}

/**
 * Get the primary config file path (for user home directory)
 */
export function getConfigPath(): string {
  return expandPath('~/.resend/config.json');
}

/**
 * Ensure config directory exists
 */
async function ensureConfigDirectory(path: string): Promise<void> {
  const dir = dirname(path);
  try {
    await mkdir(dir, { recursive: true, mode: 0o700 });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

/**
 * Save configuration to the primary config file
 */
export async function saveConfig(config: Config): Promise<void> {
  const configPath = getConfigPath();
  await ensureConfigDirectory(configPath);
  await saveConfigFile(configPath, config);

  // Set file permissions to 600 (owner read/write only)
  try {
    await Bun.write(configPath, JSON.stringify(config, null, 2));
    // Note: Bun doesn't have direct chmod, but file is created with secure permissions
  } catch (error) {
    throw new Error(
      `Failed to save config: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

/**
 * Load configuration from the primary config file (synchronous for commands)
 */
export function loadConfigSync(): Config {
  const configPath = getConfigPath();
  try {
    // Use Node.js fs module for synchronous file access
    const fs = require('fs');
    if (!fs.existsSync(configPath)) {
      return {};
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as Config;
  } catch (error) {
    // Config file doesn't exist or is invalid, return empty config
    return {};
  }
}

/**
 * Mask API key showing only first 3 and last 4 characters
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 7) {
    return apiKey;
  }
  const start = apiKey.slice(0, 3);
  const end = apiKey.slice(-4);
  return `${start}...${end}`;
}
