import React from 'react';
import { Check, X } from 'lucide-react';

export const ComparisonTable = () => {
    return (
        <section className="py-24 bg-[#0A0A0A] border-y border-stone-800">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Why Brands Switch to <span className="text-fluency-neon">Fluency</span>
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto bg-[#050505] border border-stone-800 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-3 p-6 border-b border-stone-800 bg-white/5">
                        <div className="font-bold text-stone-400">Feature</div>
                        <div className="font-bold text-stone-400 text-center">Traditional Agencies</div>
                        <div className="font-bold text-fluency-neon text-center">Fluency Platform</div>
                    </div>

                    {[
                        { feature: "Creator Vetting", old: "Manual (Hours)", new: "AI-Powered (Seconds)" },
                        { feature: "Audience Authenticity", old: "Unknown / Estimated", new: "100% Verified" },
                        { feature: "Pricing Model", old: "Retainers + Markup", new: "Transparent Performance" },
                        { feature: "Reporting", old: "Monthly PDF", new: "Real-Time Dashboard" },
                        { feature: "Contracting", old: "Back-and-forth Emails", new: "Instant Legal AI" },
                        { feature: "Time to Launch", old: "4-6 Weeks", new: "48 Hours" },
                    ].map((row, index) => (
                        <div key={index} className="grid grid-cols-3 p-6 border-b border-stone-800 hover:bg-white/5 transition-colors">
                            <div className="font-medium text-white flex items-center">{row.feature}</div>
                            <div className="text-stone-500 text-center flex items-center justify-center gap-2">
                                <X size={16} className="text-red-500" />
                                {row.old}
                            </div>
                            <div className="text-white text-center flex items-center justify-center gap-2 font-bold">
                                <Check size={16} className="text-fluency-neon" />
                                {row.new}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
