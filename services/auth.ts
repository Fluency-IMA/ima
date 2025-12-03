/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Security: Secure authentication service
 */

// Types for authentication
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'brand' | 'creator';
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'brand' | 'creator';
  companyName?: string;
}

/**
 * Security: JWT token management
 */
class TokenManager {
  private static readonly TOKEN_KEY = 'fluency_auth_token';
  private static readonly USER_KEY = 'fluency_user_data';

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  static clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true; // If we can't decode, assume expired
    }
  }
}

/**
 * Security: Password hashing (client-side for demo, should be server-side)
 */
class PasswordManager {
  static async hashPassword(password: string): Promise<string> {
    // In production, this should be done server-side with bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'fluency_salt'); // Add salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

/**
 * Security: Authentication API service
 */
export class AuthService {
  private static readonly API_BASE = process.env.NODE_ENV === 'production' 
    ? 'https://api.fluency.com' 
    : 'http://localhost:3001';

  /**
   * Login with credentials
   */
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // In production, this would be a real API call
      // const response = await fetch(`${this.API_BASE}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });

      // Demo implementation with mock validation
      if (credentials.email && credentials.password) {
        // Mock user data - in production, get from API
        const mockUser: User = {
          id: '1',
          email: credentials.email,
          role: credentials.email.includes('admin') ? 'admin' : 'brand',
          permissions: credentials.email.includes('admin') 
            ? ['read', 'write', 'delete', 'admin'] 
            : ['read', 'write']
        };

        // Mock JWT token - in production, get from API
        const mockToken = btoa(JSON.stringify({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          exp: Date.now() / 1000 + (60 * 60) // 1 hour
        }));

        TokenManager.setToken(mockToken);
        TokenManager.setUser(mockUser);

        return { success: true, user: mockUser };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  /**
   * Register new user
   */
  static async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      // In production, this would be a real API call
      // const response = await fetch(`${this.API_BASE}/auth/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      // Mock implementation
      const mockUser: User = {
        id: Date.now().toString(),
        email: data.email,
        role: data.userType,
        permissions: ['read', 'write']
      };

      const mockToken = btoa(JSON.stringify({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        exp: Date.now() / 1000 + (60 * 60)
      }));

      TokenManager.setToken(mockToken);
      TokenManager.setUser(mockUser);

      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    TokenManager.clearAuth();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    const user = TokenManager.getUser();
    
    if (!token || !user) {
      return false;
    }

    return !TokenManager.isTokenExpired(token);
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    if (this.isAuthenticated()) {
      return TokenManager.getUser();
    }
    return null;
  }

  /**
   * Check user permissions
   */
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.permissions.includes(permission) || user.permissions.includes('admin');
  }

  /**
   * Refresh token
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const token = TokenManager.getToken();
      if (!token) return false;

      // In production, call refresh endpoint
      // const response = await fetch(`${this.API_BASE}/auth/refresh`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      // Mock implementation
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
}

/**
 * Security: Rate limiting for auth attempts
 */
export class AuthRateLimiter {
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  static canAttempt(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset after 15 minutes
    if (now - record.lastAttempt > 15 * 60 * 1000) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Allow max 5 attempts per 15 minutes
    if (record.count >= 5) {
      return false;
    }

    record.count++;
    record.lastAttempt = now;
    return true;
  }

  static getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || record.count < 5) return 0;
    
    const timePassed = Date.now() - record.lastAttempt;
    const remainingTime = 15 * 60 * 1000 - timePassed;
    return Math.max(0, remainingTime);
  }
}