
/**
 * Security utilities
 */

export class SecurityMonitor {
    static logSecurityEvent(eventType: string, data: any) {
        console.log(`[SECURITY][${eventType}]`, JSON.stringify(data));
    }

    static detectSuspiciousActivity(input: string): { isSuspicious: boolean; threats: string[] } {
        // Basic SQL injection and XSS detection patterns
        const threats: string[] = [];
        const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)|(';)|(--)/i;
        const xssPattern = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;

        if (sqlInjectionPattern.test(input)) {
            threats.push('Potential SQL Injection');
        }

        if (xssPattern.test(input)) {
            threats.push('Potential XSS');
        }

        return {
            isSuspicious: threats.length > 0,
            threats
        };
    }
}

export class RateLimiter {
    // Placeholder for rate limiter logic if needed separate from express-rate-limit
    static check(key: string, limit: number, window: number): boolean {
        return true;
    }
}
