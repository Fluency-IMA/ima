
/**
 * Validation utilities
 */

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
};

export const sanitizeText = (text: string): string => {
    if (!text) return '';
    // Basic sanitization: remove HTML tags and trim
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[&<>"']/g, function (m) { // Escape special chars
            switch (m) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#039;';
                default: return m;
            }
        })
        .trim();
};

export const validateInput = (input: any): boolean => {
    // Generic input validation
    return input !== null && input !== undefined;
};
