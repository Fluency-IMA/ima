import React from 'react';
import Link from 'next/link';
import { Home, ServerCrash } from 'lucide-react';

export default function Custom500() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 text-center">
            <div className="max-w-md">
                <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ServerCrash size={32} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Server Error</h1>
                <p className="text-stone-400 mb-8">
                    Oops! Something went wrong on our end. We're working to fix it. Please try again later.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-stone-200 transition-colors"
                >
                    <Home size={20} />
                    <span>Back to Home</span>
                </Link>
            </div>
        </div>
    );
}
