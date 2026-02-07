/**
 * Input Validation Utilities
 *
 * Functions for validating user inputs
 */

/**
 * RFC 5322 compliant email validation regex
 * This is a simplified version that covers most common cases
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate a single email address
 *
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 *
 * @example
 * ```ts
 * validateEmail('user@example.com') // true
 * validateEmail('invalid.email') // false
 * validateEmail('user+tag@example.co.uk') // true
 * ```
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmed = email.trim();

  // Check length constraints
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }

  // Check for @ symbol
  if (!trimmed.includes('@')) {
    return false;
  }

  // Split into local and domain parts
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [local, domain] = parts;

  // Validate local part length
  if (!local || local.length === 0 || local.length > 64) {
    return false;
  }

  // Validate domain part
  if (!domain || domain.length === 0 || domain.length > 253) {
    return false;
  }

  // Apply regex validation
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Validation result for multiple email addresses
 */
export interface EmailValidationResult {
  /** Valid email addresses */
  valid: string[];

  /** Invalid email addresses */
  invalid: string[];

  /** All emails are valid */
  isValid: boolean;
}

/**
 * Validate multiple email addresses
 *
 * @param emails - Array of email addresses to validate
 * @returns Object containing valid and invalid email arrays
 *
 * @example
 * ```ts
 * validateEmails(['user@example.com', 'invalid', 'another@test.com'])
 * // {
 * //   valid: ['user@example.com', 'another@test.com'],
 * //   invalid: ['invalid'],
 * //   isValid: false
 * // }
 * ```
 */
export function validateEmails(emails: string[]): EmailValidationResult {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const email of emails) {
    if (validateEmail(email)) {
      valid.push(email.trim());
    } else {
      invalid.push(email);
    }
  }

  return {
    valid,
    invalid,
    isValid: invalid.length === 0,
  };
}

/**
 * Validate that at least one email body is provided (text or html)
 *
 * @param text - Plain text body
 * @param html - HTML body
 * @returns true if at least one body is provided
 */
export function validateEmailBody(text?: string, html?: string): boolean {
  return !!(text?.trim() || html?.trim());
}

/**
 * Validate required email fields
 *
 * @param from - Sender email
 * @param to - Recipient email(s)
 * @param subject - Email subject
 * @returns Validation errors array (empty if valid)
 */
export function validateRequiredFields(
  from: string,
  to: string | string[],
  subject: string
): string[] {
  const errors: string[] = [];

  if (!from?.trim()) {
    errors.push('Sender email (--from) is required');
  } else if (!validateEmail(from)) {
    errors.push(`Invalid sender email: ${from}`);
  }

  if (!to || (Array.isArray(to) && to.length === 0)) {
    errors.push('At least one recipient email (--to) is required');
  } else {
    const recipients = Array.isArray(to) ? to : [to];
    const validation = validateEmails(recipients);
    if (!validation.isValid) {
      errors.push(`Invalid recipient email(s): ${validation.invalid.join(', ')}`);
    }
  }

  if (!subject?.trim()) {
    errors.push('Subject (--subject) is required');
  }

  return errors;
}

/**
 * Validate optional email fields (cc, bcc, reply_to)
 *
 * @param cc - CC recipients
 * @param bcc - BCC recipients
 * @param replyTo - Reply-to addresses
 * @returns Validation errors array (empty if valid)
 */
export function validateOptionalFields(
  cc?: string | string[],
  bcc?: string | string[],
  replyTo?: string | string[]
): string[] {
  const errors: string[] = [];

  if (cc) {
    const ccEmails = Array.isArray(cc) ? cc : [cc];
    const validation = validateEmails(ccEmails);
    if (!validation.isValid) {
      errors.push(`Invalid CC email(s): ${validation.invalid.join(', ')}`);
    }
  }

  if (bcc) {
    const bccEmails = Array.isArray(bcc) ? bcc : [bcc];
    const validation = validateEmails(bccEmails);
    if (!validation.isValid) {
      errors.push(`Invalid BCC email(s): ${validation.invalid.join(', ')}`);
    }
  }

  if (replyTo) {
    const replyToEmails = Array.isArray(replyTo) ? replyTo : [replyTo];
    const validation = validateEmails(replyToEmails);
    if (!validation.isValid) {
      errors.push(`Invalid reply-to email(s): ${validation.invalid.join(', ')}`);
    }
  }

  return errors;
}
