import React from 'react';
import { HowItWorks } from '../components/HowItWorks';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <a href="/" className="text-2xl font-bold text-white">FLUENCY</a>
                <a href="/" className="text-stone-400 hover:text-white transition-colors">Back to Home</a>
            </nav>

            <HowItWorks />
        </div>
    );
}
