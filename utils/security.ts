/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Security: Security middleware and utilities
 */

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export class RateLimiter {
  static createLimiter(maxRequests: number, windowMs: number) {
    return (req: Request): { allowed: boolean; remaining?: number; resetTime?: number } => {
      const clientId = this.getClientId(req);
      const now = Date.now();
      const windowStart = now - windowMs;
      
      let record = rateLimitStore.get(clientId);
      
      if (!record || record.resetTime < now) {
        record = { count: 0, resetTime: now + windowMs };
        rateLimitStore.set(clientId, record);
      }
      
      record.count++;
      
      const allowed = record.count <= maxRequests;
      const remaining = Math.max(0, maxRequests - record.count);
      
      return {
        allowed,
        remaining: allowed ? remaining : 0,
        resetTime: record.resetTime
      };
    };
  }
  
  private static getClientId(req: Request): string {
    // In production, use IP address or user ID
    return req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           'anonymous';
  }
}

/**
 * Security headers utility
 */
export class SecurityHeaders {
  static getHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Required for React development
        "style-src 'self' 'unsafe-inline'", // Required for Tailwind
        "font-src 'self'",
        "img-src 'self' data: https:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),
      
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-XSS-Protection': '1; mode=block',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    };
  }
}

/**
 * Input sanitization middleware
 */
export class InputSanitizer {
  static sanitizeRequestBody(body: any): any {
    if (typeof body !== 'object' || body === null) {
      return body;
    }
    
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeRequestBody(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  private static sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }
}

/**
 * CORS configuration
 */
export class CorsConfig {
  static getCorsHeaders(origin?: string): Record<string, string> {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://fluency.com' // Production domain
    ];
    
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    
    return {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400' // 24 hours
    };
  }
}

/**
 * Security monitoring
 */
export class SecurityMonitor {
  private static suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*<\/script>)/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /expression\s*\(/gi,
    /@import/i,
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi
  ];
  
  static detectSuspiciousActivity(input: string): { isSuspicious: boolean; threats: string[] } {
    const threats: string[] = [];
    
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(input)) {
        threats.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }
    
    return {
      isSuspicious: threats.length > 0,
      threats
    };
  }
  
  static logSecurityEvent(event: string, details: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: this.getEventSeverity(event)
    };
    
    // In production, send to logging service
    console.warn('Security Event:', logEntry);
    
    // Store in local storage for demo
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
  }
  
  private static getEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const highSeverityEvents = [
      'XSS_ATTEMPT',
      'SQL_INJECTION_ATTEMPT',
      'AUTHENTICATION_BYPASS',
      'PRIVILEGE_ESCALATION'
    ];
    
    const mediumSeverityEvents = [
      'RATE_LIMIT_EXCEEDED',
      'SUSPICIOUS_INPUT',
      'INVALID_TOKEN'
    ];
    
    if (highSeverityEvents.includes(event)) return 'critical';
    if (mediumSeverityEvents.includes(event)) return 'medium';
    return 'low';
  }
}

/**
 * Session management
 */
export class SessionManager {
  private static readonly SESSION_KEY = 'fluency_session';
  private static readonly ACTIVITY_KEY = 'fluency_activity';
  
  static createSession(userId: string, userRole: string): void {
    const session = {
      id: this.generateSessionId(),
      userId,
      userRole,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.updateActivity();
  }
  
  static getSession(): any {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      this.destroySession();
      return null;
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    
    return session;
  }
  
  static destroySession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.ACTIVITY_KEY);
  }
  
  static isSessionValid(): boolean {
    const session = this.getSession();
    return session !== null;
  }
  
  private static generateSessionId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  private static updateActivity(): void {
    const activity = {
      lastSeen: Date.now(),
      page: window.location.pathname
    };
    localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(activity));
  }
}