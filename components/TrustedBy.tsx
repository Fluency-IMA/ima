import React from 'react';
import { motion } from 'framer-motion';

const brands = [
    { name: "TechFlow", opacity: 0.6 },
    { name: "UrbanWear", opacity: 0.5 },
    { name: "Nexus", opacity: 0.7 },
    { name: "Vitality", opacity: 0.6 },
    { name: "Lumina", opacity: 0.5 },
    { name: "Apex", opacity: 0.6 }
];

export const TrustedBy = () => {
    return (
        <div className="w-full border-y border-white/5 bg-white/5 backdrop-blur-sm py-8 overflow-hidden">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
                <span className="text-sm font-mono text-stone-500 uppercase tracking-widest whitespace-nowrap">
                    Trusted by market leaders
                </span>

                <div className="flex-1 flex justify-between items-center gap-8 overflow-x-auto no-scrollbar mask-linear-fade">
                    {brands.map((brand, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: brand.opacity }}
                            transition={{ delay: index * 0.1 }}
                            className="text-xl md:text-2xl font-bold font-sans text-white whitespace-nowrap"
                        >
                            {brand.name}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
