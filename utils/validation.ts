/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Security: Input validation and sanitization utilities
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Social media handle validation
const HANDLE_REGEX = /^@[a-zA-Z0-9_.]{1,30}$/;

/**
 * Validates email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  return { isValid: true };
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }
  
  if (!URL_REGEX.test(url)) {
    return { isValid: false, error: 'Invalid URL format' };
  }
  
  if (url.length > 2048) {
    return { isValid: false, error: 'URL is too long' };
  }
  
  return { isValid: true };
};

/**
 * Validates social media handle
 */
export const validateHandle = (handle: string): { isValid: boolean; error?: string } => {
  if (!handle || handle.trim().length === 0) {
    return { isValid: false, error: 'Handle is required' };
  }
  
  if (!HANDLE_REGEX.test(handle)) {
    return { isValid: false, error: 'Invalid handle format (use @username)' };
  }
  
  return { isValid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
};

/**
 * Sanitizes text input to prevent XSS
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitizes and validates search input
 */
export const sanitizeSearchInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/['"]/g, '') // Remove quotes
    .trim()
    .substring(0, 100); // Limit length
};

/**
 * Validates company name
 */
export const validateCompanyName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Company name is required' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Company name is too long' };
  }
  
  if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(name)) {
    return { isValid: false, error: 'Company name contains invalid characters' };
  }
  
  return { isValid: true };
};

/**
 * Generic input validator
 */
export const validateInput = (
  value: string, 
  type: 'email' | 'url' | 'handle' | 'password' | 'text' | 'company',
  required: boolean = true,
  minLength: number = 0,
  maxLength: number = 1000
): { isValid: boolean; error?: string } => {
  
  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: 'This field is required' };
  }
  
  if (value && value.length < minLength) {
    return { isValid: false, error: `Minimum length is ${minLength} characters` };
  }
  
  if (value && value.length > maxLength) {
    return { isValid: false, error: `Maximum length is ${maxLength} characters` };
  }
  
  switch (type) {
    case 'email':
      return validateEmail(value || '');
    case 'url':
      return validateUrl(value || '');
    case 'handle':
      return validateHandle(value || '');
    case 'password':
      return validatePassword(value || '');
    case 'company':
      return validateCompanyName(value || '');
    default:
      return { isValid: true };
  }
};