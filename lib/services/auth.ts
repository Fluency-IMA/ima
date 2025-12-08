
/**
 * Auth Service
 */

export class AuthService {
    static async validateToken(token: string): Promise<boolean> {
        // Mock implementation
        return !!token;
    }

    static async getUser(userId: string): Promise<any> {
        // Mock implementation
        return { id: userId, name: 'Test User' };
    }
}
