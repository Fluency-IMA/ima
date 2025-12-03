/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Security: Test suite for security measures
 */

import { validateEmail, validatePassword, validateUrl, sanitizeText, validateInput } from '../utils/validation';
import { AuthService, AuthRateLimiter } from '../services/auth';
import { SecurityMonitor, RateLimiter } from '../utils/security';

describe('Security Validation Tests', () => {
  
  // Email Validation Tests
  describe('Email Validation', () => {
    test('should accept valid email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example.',
        ''
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });

    test('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
    });
  });

  // Password Validation Tests
  describe('Password Validation', () => {
    test('should accept strong password', () => {
      const result = validatePassword('StrongP@ssw0rd');
      expect(result.isValid).toBe(true);
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'password',
        '123456',
        'abcdefgh',
        'PASSWORD123',
        'Short1!',
        ''
      ];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
      });
    });

    test('should require minimum length', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });
  });

  // URL Validation Tests
  describe('URL Validation', () => {
    test('should accept valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://www.example.com/path'
      ];

      validUrls.forEach(url => {
        const result = validateUrl(url);
        expect(result.isValid).toBe(true);
      });
    });

    test('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        ''
      ];

      invalidUrls.forEach(url => {
        const result = validateUrl(url);
        expect(result.isValid).toBe(false);
      });
    });
  });

  // Input Sanitization Tests
  describe('Input Sanitization', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeText(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    test('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeText(input);
      expect(result).not.toContain('javascript:');
    });

    test('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeText(input);
      expect(result).not.toContain('onclick');
    });
  });

  // Generic Input Validation Tests
  describe('Generic Input Validation', () => {
    test('should validate required fields', () => {
      const result = validateInput('', 'text', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('should enforce length limits', () => {
      const result = validateInput('a'.repeat(101), 'text', false, 0, 100);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Maximum length');
    });

    test('should enforce minimum length', () => {
      const result = validateInput('ab', 'text', true, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimum length');
    });
  });
});

describe('Authentication Security Tests', () => {
  
  // Rate Limiting Tests
  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear rate limiter state
      AuthRateLimiter.canAttempt('test@example.com');
    });

    test('should allow initial attempts', () => {
      const result = AuthRateLimiter.canAttempt('test@example.com');
      expect(result).toBe(true);
    });

    test('should block after too many attempts', () => {
      // Make 5 attempts
      for (let i = 0; i < 5; i++) {
        AuthRateLimiter.canAttempt('test@example.com');
      }
      
      // 6th attempt should be blocked
      const result = AuthRateLimiter.canAttempt('test@example.com');
      expect(result).toBe(false);
    });
  });

  // Token Security Tests
  describe('Token Security', () => {
    test('should detect expired tokens', () => {
      // Create expired token
      const expiredToken = btoa(JSON.stringify({
        sub: '1',
        exp: Date.now() / 1000 - 3600 // Expired 1 hour ago
      }));

      const isExpired = AuthService.isTokenExpired(expiredToken);
      expect(isExpired).toBe(true);
    });

    test('should accept valid tokens', () => {
      // Create valid token
      const validToken = btoa(JSON.stringify({
        sub: '1',
        exp: Date.now() / 1000 + 3600 // Expires in 1 hour
      }));

      const isExpired = AuthService.isTokenExpired(validToken);
      expect(isExpired).toBe(false);
    });
  });
});

describe('Security Monitoring Tests', () => {
  
  // Threat Detection Tests
  describe('Threat Detection', () => {
    test('should detect XSS attempts', () => {
      const xssPayload = '<script>alert("xss")</script>';
      const result = SecurityMonitor.detectSuspiciousActivity(xssPayload);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.threats.length).toBeGreaterThan(0);
    });

    test('should detect SQL injection attempts', () => {
      const sqlPayload = "'; DROP TABLE users; --";
      const result = SecurityMonitor.detectSuspiciousActivity(sqlPayload);
      
      expect(result.isSuspicious).toBe(true);
      expect(result.threats.length).toBeGreaterThan(0);
    });

    test('should allow safe input', () => {
      const safeInput = 'This is safe user input';
      const result = SecurityMonitor.detectSuspiciousActivity(safeInput);
      
      expect(result.isSuspicious).toBe(false);
      expect(result.threats.length).toBe(0);
    });
  });

  // Security Logging Tests
  describe('Security Logging', () => {
    test('should log security events', () => {
      const event = 'XSS_ATTEMPT';
      const details = { input: '<script>alert(1)</script>' };
      
      // Mock console.warn
      const consoleSpy = jest.spyOn(console, 'warn');
      
      SecurityMonitor.logSecurityEvent(event, details);
      
      expect(consoleSpy).toHaveBeenCalledWith('Security Event:', expect.objectContaining({
        event,
        details,
        severity: expect.any(String)
      }));
      
      consoleSpy.mockRestore();
    });
  });
});

describe('Rate Limiting Tests', () => {
  
  // API Rate Limiting Tests
  describe('API Rate Limiting', () => {
    test('should allow requests within limit', () => {
      const limiter = RateLimiter.createLimiter(5, 60000); // 5 requests per minute
      const request = new Request('https://example.com');
      
      const result1 = limiter(request);
      const result2 = limiter(request);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });

    test('should block requests exceeding limit', () => {
      const limiter = RateLimiter.createLimiter(2, 60000); // 2 requests per minute
      const request = new Request('https://example.com');
      
      // Make 3 requests
      const result1 = limiter(request);
      const result2 = limiter(request);
      const result3 = limiter(request);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(false);
    });
  });
});

// Integration Tests
describe('Security Integration Tests', () => {
  
  test('should prevent XSS through multiple layers', () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    // Layer 1: Input validation
    const validation = validateInput(xssPayload, 'text', false, 0, 100);
    expect(validation.isValid).toBe(true); // Text input is valid
    
    // Layer 2: Sanitization
    const sanitized = sanitizeText(xssPayload);
    expect(sanitized).not.toContain('<script>');
    
    // Layer 3: Threat detection
    const threatDetection = SecurityMonitor.detectSuspiciousActivity(xssPayload);
    expect(threatDetection.isSuspicious).toBe(true);
  });

  test('should handle authentication flow securely', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'ValidP@ssw0rd123'
    };
    
    // Test login
    const loginResult = await AuthService.login(credentials);
    
    if (loginResult.success) {
      // Verify token is generated
      expect(loginResult.user).toBeDefined();
      expect(loginResult.user.email).toBe(credentials.email);
      
      // Verify authentication state
      expect(AuthService.isAuthenticated()).toBe(true);
      
      // Test logout
      AuthService.logout();
      expect(AuthService.isAuthenticated()).toBe(false);
    }
  });
});

// Performance Tests
describe('Security Performance Tests', () => {
  
  test('validation should be performant', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      validateEmail(`test${i}@example.com`);
      validatePassword(`Password${i}!`);
      sanitizeText(`<script>alert(${i})</script>`);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete 1000 validations in under 100ms
    expect(duration).toBeLessThan(100);
  });
  
  test('threat detection should be performant', () => {
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      SecurityMonitor.detectSuspiciousActivity(`<script>alert(${i})</script>`);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete 100 threat detections in under 50ms
    expect(duration).toBeLessThan(50);
  });
});