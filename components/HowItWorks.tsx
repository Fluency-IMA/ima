import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ShieldCheck, Rocket, BarChart2 } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        title: "1. Connect Your Account",
        description: "Link your social media profiles or brand account securely via Auth0. We never post without your permission."
    },
    {
        icon: ShieldCheck,
        title: "2. AI Verification",
        description: "Our proprietary AI scans 50+ data points to verify audience authenticity, engagement quality, and brand safety."
    },
    {
        icon: Rocket,
        title: "3. Launch Campaign",
        description: "Brands match with verified creators. Creators receive clear briefs. Contracts are handled automatically."
    },
    {
        icon: BarChart2,
        title: "4. Track Real ROI",
        description: "Watch your dashboard for real-time sales tracking, not just vanity metrics like likes or views."
    }
];

export const HowItWorks = () => {
    return (
        <section className="py-24 bg-[#050505] min-h-screen">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-stone-400 bg-clip-text text-transparent">
                        How Fluency Works
                    </h1>
                    <p className="text-xl text-stone-400 max-w-2xl mx-auto">
                        Our AI-driven platform removes the guesswork from influencer marketing.
                    </p>
                </motion.div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-fluency-neon/20 via-fluency-neon to-fluency-neon/20 transform -translate-x-1/2" />

                    <div className="space-y-24">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                    }`}
                            >
                                {/* Content */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className={`bg-[#1C1C1C] p-8 rounded-2xl border border-stone-800 hover:border-fluency-neon/50 transition-all duration-300 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                                        }`}>
                                        <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                                        <p className="text-stone-400 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>

                                {/* Icon Marker */}
                                <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-[#050505] border-4 border-fluency-neon rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                                    <step.icon size={24} className="text-fluency-neon" />
                                </div>

                                {/* Spacer for layout balance */}
                                <div className="flex-1" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-24"
                >
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-fluency-neon text-black px-12 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                    >
                        Start Your Journey
                    </button>
                </motion.div>
            </div>
        </section>
    );
};
