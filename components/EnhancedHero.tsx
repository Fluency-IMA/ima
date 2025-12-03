/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enhanced Hero Section Component with Problem-First Approach
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Target, BarChart2, Play, CheckCircle } from 'lucide-react';

interface EnhancedHeroProps {
  onROIClick: () => void;
  onAuthClick: () => void;
}

import { useAuth } from '../context/AuthContext';

export const EnhancedHero: React.FC<EnhancedHeroProps> = ({ onROIClick, onAuthClick }) => {
  const { loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'brands' | 'creators'>('brands');

  const painPoints = {
    brands: [
      "70% of influencer budgets wasted on fake followers",
      "Can't track real ROI from campaigns",
      "Time-consuming creator vetting process",
      "Unpredictable campaign results"
    ],
    creators: [
      "Hard to prove authentic engagement",
      "Unfair competition from fake accounts",
      "Difficulty finding legitimate brand partnerships",
      "Lack of transparent payment systems"
    ]
  };

  const solutions = [
    {
      icon: ShieldCheck,
      title: "100% Authentic Reach",
      description: "Every creator is AI-vetted and manually verified",
      guarantee: "Zero fake followers or your money back"
    },
    {
      icon: Target,
      title: "Perfect Audience Matching",
      description: "AI analyzes 200M+ creators for your exact customers",
      guarantee: "95.5% accuracy in audience targeting"
    },
    {
      icon: BarChart2,
      title: "Guaranteed ROI Tracking",
      description: "Real-time dashboards show exact revenue generated",
      guarantee: "See every dollar's impact on sales"
    }
  ];

  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Scene */}
      <div className="absolute inset-0 z-0">
        {/* Your existing HeroScene component */}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_60%,rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(5,5,5,0)_0%,rgba(5,5,5,0.8)_60%,rgba(5,5,5,1)_100%)]" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Navigation */}
        <nav className="flex justify-between items-center py-6 mb-8">
          <div className="text-2xl font-bold text-black dark:text-white">FLUENCY</div>
          <div className="hidden md:flex gap-8">
            <a href="/how-it-works" className="text-stone-600 dark:text-stone-300 hover:text-fluency-neon transition-colors font-medium">How it Works</a>
            <button onClick={() => loginWithGoogle()} className="text-stone-600 dark:text-stone-300 hover:text-fluency-neon transition-colors font-medium">Login</button>
          </div>
        </nav>

        {/* User Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-white/10 dark:bg-black/20 backdrop-blur border border-white/20 dark:border-white/10 rounded-full p-1">
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'brands'
                ? 'bg-fluency-neon text-black'
                : 'text-black dark:text-white hover:bg-white/10'
                }`}
            >
              I'm a Brand
            </button>
            <button
              onClick={() => setActiveTab('creators')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'creators'
                ? 'bg-fluency-neon text-black'
                : 'text-black dark:text-white hover:bg-white/10'
                }`}
            >
              I'm a Creator
            </button>
          </div>
        </motion.div>

        {/* Problem Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-fluency-neon/10 border border-fluency-neon/20 rounded-full">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fluency-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fluency-neon"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-fluency-neon">
              {activeTab === 'brands' ? 'Enterprise-Grade Verification' : 'Verified Creator Network'}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-6 text-black dark:text-white tracking-tighter leading-tight"
          >
            {activeTab === 'brands' ? (
              <>Influence with<br />Integrity.</>
            ) : (
              <>Monetize Your<br />Influence.</>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto text-xl sm:text-2xl md:text-3xl text-stone-600 dark:text-stone-400 font-medium mb-8 leading-relaxed"
          >
            {activeTab === 'brands' ? (
              <>Fluency connects brands with AI-verified creators for campaigns that drive real, measurable business results.</>
            ) : (
              <>Join the exclusive network of verified creators. Get paid fairly for your authentic reach and engagement.</>
            )}
          </motion.p>
        </motion.div>

        {/* Enhanced CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto mb-20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onROIClick}
            className="w-full sm:w-auto px-8 py-4 bg-fluency-neon text-black font-bold text-lg rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all flex items-center justify-center gap-3 min-h-[64px]"
          >
            <Target size={20} />
            <div className="text-left">
              <div className="font-bold">Start Your Authentic Campaign</div>
              <div className="text-xs opacity-75">Free analysis in 30 seconds</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAuthClick}
            className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-fluency-neon text-fluency-neon font-bold text-lg rounded-full hover:bg-fluency-neon hover:text-black transition-all flex items-center justify-center gap-3 min-h-[64px]"
          >
            <Play size={20} />
            <div className="text-left">
              <div className="font-bold">Watch How It Works</div>
              <div className="text-xs opacity-75">2-minute demo</div>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </header>
  );
};