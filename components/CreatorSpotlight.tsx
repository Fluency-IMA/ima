import React from 'react';
import { motion } from 'framer-motion';

const creators = [
    {
        name: "Alex Rivera",
        niche: "Tech & Gaming",
        followers: "1.2M",
        engagement: "4.8%",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
        name: "Sarah Jenkins",
        niche: "Sustainable Fashion",
        followers: "450K",
        engagement: "6.2%",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
        name: "Marcus Chen",
        niche: "Fitness & Health",
        followers: "890K",
        engagement: "5.1%",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
        name: "Elena Rodriguez",
        niche: "Travel & Lifestyle",
        followers: "2.1M",
        engagement: "3.9%",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    }
];

export const CreatorSpotlight = () => {
    return (
        <section className="py-24 bg-[#050505] overflow-hidden">
            <div className="container mx-auto px-6 mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Meet Our <span className="text-fluency-neon">Verified Creators</span>
                </h2>
                <p className="text-xl text-stone-400">
                    Real people. Real influence. Ready to work with your brand.
                </p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 px-6 no-scrollbar snap-x">
                {creators.map((creator, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="min-w-[300px] md:min-w-[350px] bg-[#0A0A0A] border border-stone-800 rounded-2xl overflow-hidden snap-center group hover:border-fluency-neon/50 transition-all"
                    >
                        <div className="aspect-[4/5] relative">
                            <img
                                src={creator.image}
                                alt={creator.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <h3 className="text-2xl font-bold text-white mb-1">{creator.name}</h3>
                                <p className="text-fluency-neon font-medium mb-4">{creator.niche}</p>

                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <div>
                                        <div className="text-xs text-stone-400 uppercase tracking-wider">Followers</div>
                                        <div className="text-lg font-bold text-white">{creator.followers}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-stone-400 uppercase tracking-wider">Engagement</div>
                                        <div className="text-lg font-bold text-white">{creator.engagement}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
