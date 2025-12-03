import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
    const { user, loginWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            if (user.email === 'fluency400533@gmail.com') {
                router.push('/admin/dashboard');
            } else {
                alert('Access Denied: You are not an administrator.');
            }
        }
    }, [user, router]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="bg-[#0A0A0A] border border-stone-800 rounded-2xl p-8 w-full max-w-md text-center">
                <div className="w-16 h-16 bg-fluency-neon rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} className="text-black" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
                <p className="text-stone-400 mb-8">
                    Restricted area. Please log in to continue.
                </p>

                <button
                    onClick={() => loginWithGoogle()}
                    className="w-full py-3 px-4 bg-white text-black font-bold rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
