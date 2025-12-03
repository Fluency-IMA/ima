import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false); // Toggle for dev convenience

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                // Create user account
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Determine role based on email
                const isAdmin = email === 'fluency400533@gmail.com';

                // Save user to Firestore
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: email,
                    role: isAdmin ? 'admin' : 'client',
                    createdAt: serverTimestamp(),
                    uid: userCredential.user.uid
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Failed to sign in. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#1C1C1C] border border-stone-800 rounded-2xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-fluency-neon/20 text-fluency-neon mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Fluency Agency</h1>
                    <p className="text-stone-400">Sign in to access the dashboard</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-500 text-sm"
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-stone-500" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-stone-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-fluency-neon outline-none transition-colors"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-stone-500" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-stone-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-fluency-neon outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-fluency-neon transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => { setError(''); setIsSignUp(!isSignUp); }}
                        className="text-xs text-stone-500 hover:text-white transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create one'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
