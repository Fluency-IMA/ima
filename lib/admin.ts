import { NextApiRequest } from 'next';

const ADMIN_EMAIL = 'fluency400533@gmail.com';
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function verifyAdmin(req: NextApiRequest): Promise<boolean> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify ID token using Firebase Auth REST API
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken: idToken,
            }),
        });

        const data = await response.json();

        if (!data.users || data.users.length === 0) {
            return false;
        }

        const userEmail = data.users[0].email;
        return userEmail === ADMIN_EMAIL;

    } catch (error) {
        console.error('Error verifying admin:', error);
        return false;
    }
}

export const isAdminEmail = (email: string | null | undefined) => {
    return email === ADMIN_EMAIL;
};
