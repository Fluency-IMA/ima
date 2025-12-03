import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, BarChart2 } from 'lucide-react';

const features = [
    {
        title: "AI-Powered Vetting",
        description: "Stop guessing. Our AI analyzes 50+ data points to detect fake followers, engagement pods, and bot activity instantly.",
        icon: ShieldCheck,
        stat: "99.9%",
        statLabel: "Fraud Detection Accuracy",
        gradient: "from-green-400 to-emerald-600"
    },
    {
        title: "Precision Matching",
        description: "Find creators whose audience actually matches your buyer persona. Filter by age, location, interests, and spending power.",
        icon: Target,
        stat: "200M+",
        statLabel: "Creator Profiles Indexed",
        gradient: "from-blue-400 to-indigo-600"
    },
    {
        title: "Real-Time ROI",
        description: "Track every click, conversion, and dollar earned. Our dashboard integrates directly with Shopify and WooCommerce.",
        icon: BarChart2,
        stat: "3.4x",
        statLabel: "Average ROAS",
        gradient: "from-purple-400 to-pink-600"
    }
];

export const FeatureBlocks = () => {
    return (
        <section className="py-24 bg-[#050505] relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        The New Standard for <span className="text-fluency-neon">Influencer Marketing</span>
                    </h2>
                    <p className="text-xl text-stone-400 max-w-2xl mx-auto">
                        Replace manual spreadsheets and gut feelings with enterprise-grade data infrastructure.
                    </p>
                </div>

                <div className="space-y-24">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.7 }}
                            className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 md:gap-24 items-center`}
                        >
                            {/* Text Side */}
                            <div className="flex-1">
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-6`}>
                                    <feature.icon size={32} className="text-white" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-lg text-stone-400 leading-relaxed mb-8">
                                    {feature.description}
                                </p>

                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 w-fit">
                                    <div className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${feature.gradient}`}>
                                        {feature.stat}
                                    </div>
                                    <div className="text-sm text-stone-500 font-mono uppercase tracking-wider">
                                        {feature.statLabel}
                                    </div>
                                </div>
                            </div>

                            {/* Visual Side (Abstract UI) */}
                            <div className="flex-1 w-full">
                                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-2xl group">
                                    {/* Abstract UI Elements */}
                                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

                                    {/* Mock UI Content based on feature */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {index === 0 && (
                                            <div className="w-3/4 h-1/2 bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4 flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-stone-800" />
                                                    <div className="h-2 w-24 bg-stone-800 rounded" />
                                                    <div className="ml-auto px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Verified</div>
                                                </div>
                                                <div className="h-2 w-full bg-stone-800 rounded mt-2" />
                                                <div className="h-2 w-2/3 bg-stone-800 rounded" />
                                            </div>
                                        )}
                                        {index === 1 && (
                                            <div className="flex gap-4">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-24 h-32 bg-black/50 backdrop-blur border border-white/10 rounded-lg p-2 flex flex-col items-center gap-2">
                                                        <div className="w-12 h-12 rounded-full bg-stone-800" />
                                                        <div className="h-2 w-16 bg-stone-800 rounded" />
                                                        <div className="h-1 w-12 bg-fluency-neon/50 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {index === 2 && (
                                            <div className="w-3/4 h-3/4 flex items-end justify-between gap-2 px-8 pb-8">
                                                {[40, 60, 45, 70, 85, 65, 90].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${h}%` }}
                                                        transition={{ delay: i * 0.1, duration: 1 }}
                                                        className={`w-full rounded-t bg-gradient-to-t ${feature.gradient} opacity-80`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
