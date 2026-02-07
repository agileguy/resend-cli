/**
 * Validator Tests
 */

import { describe, expect, test } from 'bun:test';
import { validateEmail, validateEmails } from '../../src/lib/validators.ts';

describe('validateEmail', () => {
  test('accepts valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.org')).toBe(true);
    expect(validateEmail('user+tag@example.co.uk')).toBe(true);
    expect(validateEmail('a@b.co')).toBe(true);
  });

  test('rejects invalid email addresses', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('no@.com')).toBe(false);
    expect(validateEmail('spaces in@email.com')).toBe(false);
  });

  test('handles edge cases', () => {
    // Simplified RFC validation accepts these
    expect(validateEmail('no@domain')).toBe(true);
    expect(validateEmail('a@b.c')).toBe(true);
    expect(validateEmail('test@sub.domain.example.com')).toBe(true);
  });
});

describe('validateEmails', () => {
  test('validates array of emails', () => {
    const result = validateEmails(['test@example.com', 'user@domain.org']);
    expect(result.valid).toEqual(['test@example.com', 'user@domain.org']);
    expect(result.invalid).toEqual([]);
  });

  test('separates valid and invalid emails', () => {
    const result = validateEmails(['valid@example.com', 'invalid', 'another@test.org']);
    expect(result.valid).toEqual(['valid@example.com', 'another@test.org']);
    expect(result.invalid).toEqual(['invalid']);
  });

  test('handles empty array', () => {
    const result = validateEmails([]);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([]);
  });

  test('handles all invalid emails', () => {
    const result = validateEmails(['invalid', 'also-invalid', '@bad']);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual(['invalid', 'also-invalid', '@bad']);
  });
});
