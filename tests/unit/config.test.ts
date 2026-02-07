/**
 * Unit tests for configuration management
 */

import { describe, test, expect } from 'bun:test';
import { maskApiKey } from '../../src/lib/config';

describe('Configuration Utils', () => {
  describe('maskApiKey', () => {
    test('should mask API keys correctly', () => {
      const apiKey = 're_abcdefghijklmnop';
      const masked = maskApiKey(apiKey);
      expect(masked).toBe('re_...mnop');
    });

    test('should handle short API keys', () => {
      const apiKey = 're_abc';
      const masked = maskApiKey(apiKey);
      expect(masked).toBe('re_abc');
    });

    test('should mask long API keys', () => {
      const apiKey = 're_1234567890abcdefghijklmnopqrstuvwxyz';
      const masked = maskApiKey(apiKey);
      expect(masked).toBe('re_...wxyz');
    });
  });
});
