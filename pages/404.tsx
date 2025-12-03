import React from 'react';
import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';

export default function Custom404() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 text-center">
            <div className="max-w-md">
                <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl font-bold text-fluency-neon">404</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
                <p className="text-stone-400 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-fluency-neon text-black font-bold rounded-full hover:opacity-90 transition-opacity"
                >
                    <Home size={20} />
                    <span>Back to Home</span>
                </Link>
            </div>
        </div>
    );
}
