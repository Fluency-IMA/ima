
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Login } from './components/Login';
import { HeroScene } from './components/QuantumScene';
import { NetworkMapDiagram, AIWorkflowDiagram, ROIMetricDiagram } from './components/Diagrams';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientDashboard } from './components/ClientDashboard';
import { ClientCampaignView } from './components/ClientCampaignView';
import { Influencer, Campaign } from './types';
import {
  ArrowRight, Menu, X, Lock, ShieldCheck, Cpu,
  Scan, Fingerprint, Network, Zap, Sun, Moon,
  ChevronRight, Mail, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ANIMATED LOGO COMPONENT ---
const FluencyLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative w-10 h-10 flex items-center justify-center">
      {/* Outer Square - Clockwise */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-[1.5px] border-fluency-neon rounded-xl shadow-[0_0_10px_#CCFF00,0_0_25px_rgba(204,255,0,0.6)]"
      />
      {/* Inner Square - Anti-Clockwise */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 m-auto w-6 h-6 border-[1.5px] border-fluency-neon rounded-lg opacity-90 shadow-[0_0_8px_#CCFF00,0_0_15px_rgba(204,255,0,0.4)]"
      />

      {/* Core F */}
      <div className="absolute inset-0 flex items-center justify-center font-sans font-bold text-xl text-black dark:text-white z-10 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
        F
      </div>
    </div>
    <span className="font-sans font-bold text-xl tracking-tight text-black dark:text-white">
      FLUENCY
    </span>
  </div>
);

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');


  // View State
  const [view, setView] = useState<'landing' | 'admin' | 'client' | 'client-portal' | 'login'>('landing');
  const [activeCampaignId, setActiveCampaignId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // --- LIFTED STATE (Influencer Hub) ---
  const [influencers, setInfluencers] = useState<Influencer[]>([
    {
      id: '1',
      name: 'Sarah Jenkins',
      channelLink: 'https://instagram.com/sarahj_style',
      niche: 'Fashion',
      tier: 'Macro',
      pricePerDeliverable: 'Negotiable',
      contactInfo: 'sarah@agency.com',
      shippingAddress: '123 Fashion St, London, UK',
      avatar: 'S'
    },
    {
      id: '2',
      name: 'Tech Breakdown',
      channelLink: 'https://youtube.com/techbreak',
      niche: 'Technology',
      tier: 'Macro',
      pricePerDeliverable: '$2,500',
      contactInfo: 'contact@techbreak.com',
      shippingAddress: '456 Tech Blvd, Austin, TX',
      avatar: 'T'
    }
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: 'Summer Collection Launch',
      brand: 'Urban Wear',
      status: 'Active',
      influencers: 12,
      budget: 'Negotiable',
      progress: 65,
      assignedInfluencers: []
    }
  ]);

  // Client Portal Handler
  const handleClientUpdateStatus = (campaignId: number, influencerId: string, status: 'Approved' | 'Rejected', notes?: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== campaignId) return c;
      return {
        ...c,
        assignedInfluencers: c.assignedInfluencers?.map(inf => {
          if (inf.influencerId !== influencerId) return inf;
          return { ...inf, status, clientNotes: notes };
        })
      };
    }));
  };

  // Simulate opening a client link (for demo purposes)
  const openClientPortal = (campaignId: number) => {
    setActiveCampaignId(campaignId);
    setView('client-portal');
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user is the admin email
        const isAdmin = currentUser.email === 'fluency400533@gmail.com';

        // Default to admin view for admin email, client view for others
        if (view === 'login') {
          setView(isAdmin ? 'admin' : 'client');
        }
      }
    });
    return () => unsubscribe();
  }, [view]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Initialize Theme
    document.documentElement.classList.add('dark');

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('landing');
  };


  if (view === 'admin') {
    return (
      <AdminDashboard
        onLogout={handleLogout}
        influencers={influencers}
        setInfluencers={setInfluencers}
        campaigns={campaigns}
        setCampaigns={setCampaigns}
        onOpenClientPortal={openClientPortal}
      />
    );
  }

  if (view === 'client-portal' && activeCampaignId) {
    const campaign = campaigns.find(c => c.id === activeCampaignId);
    if (campaign) {
      return (
        <ClientCampaignView
          campaign={campaign}
          influencers={influencers}
          onUpdateStatus={handleClientUpdateStatus}
        />
      );
    }
  }

  if (view === 'client') {
    return <ClientDashboard onLogout={handleLogout} userType="brand" />;
  }

  if (view === 'login') {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-fluency-black text-stone-900 dark:text-fluency-white selection:bg-fluency-neon selection:text-black relative font-body transition-colors duration-300">


      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-fluency-black/90 backdrop-blur-md py-4 border-b border-stone-200 dark:border-white/5' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <FluencyLogo />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600 dark:text-stone-400">
            <a href="#workflow" className="hover:text-black dark:hover:text-white transition-colors">The AIM Engine</a>
            <a href="#network" className="hover:text-black dark:hover:text-white transition-colors">Network</a>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {user ? (
              <button
                onClick={handleLogout}
                className="hover:text-fluency-neon transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setView('login')}
                className="hover:text-fluency-neon transition-colors"
              >
                Login
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('login')}
              className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-fluency-neon dark:hover:bg-fluency-neon hover:text-black transition-all"
            >
              Partner With Us
            </motion.button>
          </div>

          <button className="md:hidden text-black dark:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-fluency-black flex flex-col items-center justify-center gap-8 animate-fade-in">
          <FluencyLogo className="scale-150 mb-8" />
          <a onClick={() => setMenuOpen(false)} href="#workflow" className="text-xl font-bold text-black dark:text-white">Workflow</a>
          <button onClick={toggleTheme} className="text-xl font-bold text-stone-500">
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
          <button
            onClick={() => { setMenuOpen(false); setView('login'); }}
            className="text-xl font-bold text-stone-400"
          >
            {user ? 'Logout' : 'Login'}
          </button>
          <button
            onClick={() => { setMenuOpen(false); setView('login'); }}
            className="px-8 py-4 bg-fluency-neon text-black font-bold rounded-full text-xl"
          >
            Partner With Us
          </button>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <HeroScene />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_60%,rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(5,5,5,0)_0%,rgba(5,5,5,0.8)_60%,rgba(5,5,5,1)_100%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Problem Statement Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-red-50/80 dark:bg-red-900/20 backdrop-blur border border-red-200 dark:border-red-800/50 rounded-full"
          >
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-red-600 dark:text-red-400">⚠️ 70% of budgets wasted on fake engagement</span>
          </motion.div>

          {/* Problem-First Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-sans font-bold text-5xl md:text-7xl mb-6 text-black dark:text-white tracking-tight leading-tight"
          >
            Tired of Paying for<br />Fake Followers?
          </motion.h1>

          {/* Solution Statement */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans font-medium text-xl md:text-2xl leading-relaxed mb-6 text-stone-600 dark:text-stone-300 max-w-3xl mx-auto"
          >
            Get guaranteed authentic influencer partnerships that drive <span className="text-fluency-neon font-bold">real sales</span>, not vanity metrics
          </motion.h2>

          {/* Value Proposition */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto text-lg text-stone-500 dark:text-stone-400 font-light leading-relaxed mb-8 font-body"
          >
            Our AI-vetted creators deliver <span className="font-bold text-fluency-neon">340% average ROI</span> with zero fake followers guaranteed.
          </motion.p>

          {/* Trust Signals Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-stone-600 dark:text-stone-400"
          >
            <div className="flex items-center gap-2">
              <Check className="text-fluency-neon" size={16} />
              <span>100% Authentic Reach</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-fluency-neon" size={16} />
              <span>95.5% Fraud Detection</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-fluency-neon" size={16} />
              <span>Money-Back Guarantee</span>
            </div>
          </motion.div>

          {/* Enhanced CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('login')}
              className="group px-8 py-4 bg-fluency-neon text-black font-bold text-lg rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all"
            >
              <div className="flex flex-col items-center">
                <span>See Your Authentic Reach Potential</span>
                <span className="text-xs font-normal opacity-80">Free analysis in 30 seconds</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white dark:bg-white/10 text-black dark:text-white font-bold text-lg rounded-full border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/20 transition-colors"
            >
              <div className="flex flex-col items-center">
                <span>Book a Strategy Call</span>
                <span className="text-xs font-normal opacity-70">15-min consultation with experts</span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </header>

      <main>
        {/* The 4 Agents Section */}
        <section id="workflow" className="py-24 bg-stone-50 dark:bg-fluency-charcoal relative transition-colors duration-300">
          <div className="container mx-auto px-6">
            <div className="mb-16">
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-fluency-neon uppercase flex items-center gap-2">
                <Cpu size={14} /> AIM Platform Architecture
              </div>
              <h2 className="font-sans text-4xl md:text-5xl font-bold mb-6 leading-tight text-black dark:text-white">The Strategist Engine</h2>
              <p className="text-stone-600 dark:text-stone-400 max-w-2xl text-lg font-body">
                Our custom AI pipeline replaces guesswork with a 3-stage precision workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Agent Cards */}
              {[
                { title: "Identity Assurance", icon: Scan, desc: "Scans business legitimacy, news sentiment, and financial health to act as your Risk Engine." },
                { title: "Audience Intelligence", icon: ShieldCheck, desc: "Performs psychographic audience mapping and competitive gap analysis to define the mission." },
                { title: "Predictive Matching", icon: Fingerprint, desc: "Uses Audience Quality Score (AQS) to filter for authentic engagement and eliminate bots." },
                { title: "Automated Scale", icon: Network, desc: "End-to-end campaign management, content approval, and automated ROI tracking." }
              ].map((agent, idx) => (
                <motion.div
                  whileHover={{ y: -10 }}
                  key={idx}
                  className="p-8 rounded-2xl bg-white dark:bg-[#0F0F0F] border border-stone-200 dark:border-stone-800 hover:border-fluency-neon transition-all duration-300 shadow-sm dark:shadow-none cursor-default"
                >
                  <div className="w-14 h-14 bg-stone-100 dark:bg-stone-900 rounded-xl flex items-center justify-center text-black dark:text-white mb-6 group-hover:bg-fluency-neon group-hover:text-black transition-colors">
                    <agent.icon size={28} />
                  </div>
                  <h3 className="font-sans font-bold text-2xl text-black dark:text-white mb-2">{agent.title}</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed font-body">
                    {agent.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="py-24 bg-white dark:bg-black text-stone-100 overflow-hidden relative transition-colors duration-300">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <AIWorkflowDiagram />
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 dark:bg-stone-900 text-fluency-neon text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-200 dark:border-stone-800">
                  <Zap size={14} /> LIVE SIMULATION
                </div>
                <h2 className="font-sans font-bold text-4xl md:text-5xl mb-6 text-black dark:text-white">Trust is no longer a luxury. It's an algorithm.</h2>
                <p className="text-lg text-stone-600 dark:text-stone-400 mb-6 leading-relaxed font-body">
                  The detective agent performs an "AI Website Teardown" on every potential partner, assigning a Trust Score and flagging high-risk indicators to protect your brand reputation and budget.
                </p>
                <ul className="space-y-4">
                  {[
                    "95.5% Fraud Detection Accuracy",
                    "Audience Quality Score (AQS) Calculation",
                    "Cross-Referencing Bot Farms"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-stone-800 dark:text-stone-300 font-medium font-body">
                      <div className="w-6 h-6 rounded-full bg-fluency-neon/20 flex items-center justify-center text-fluency-neon">
                        <Check size={14} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Network & Matchmaking */}
        <section id="network" className="py-24 bg-stone-50 dark:bg-[#050505] border-t border-stone-200 dark:border-stone-900 transition-colors duration-300">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-sans font-bold text-4xl md:text-5xl mb-6 text-black dark:text-white">Global Reach.<br />Hyper-Local Precision.</h2>
                <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 leading-relaxed font-body">
                  Our Geo-Spatial Targeting engine filters 200M+ profiles to find creators who actually influence your specific target market, not just people with big numbers.
                </p>
                <motion.button
                  whileHover={{ x: 10 }}
                  onClick={() => setView('login')}
                  className="text-fluency-neon font-bold flex items-center gap-2"
                >
                  Access Global Database <ArrowRight size={18} />
                </motion.button>
              </div>
              <div>
                <NetworkMapDiagram />
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-24 bg-white dark:bg-fluency-charcoal transition-colors duration-300">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="font-sans font-bold text-4xl md:text-5xl mb-6 text-black dark:text-white">See the Future of Your Campaign.</h2>
              <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed font-body">
                Using historical data, our predictive models forecast Earned Media Value (EMV) and Sales Volume before you spend a dollar.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <ROIMetricDiagram />
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="py-24 bg-stone-50 dark:bg-black border-t border-stone-200 dark:border-stone-900 transition-colors duration-300">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-fluency-neon/10 text-fluency-neon text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-fluency-neon/20">
                <ShieldCheck size={14} /> VERIFIED RESULTS
              </div>
              <h2 className="font-sans font-bold text-4xl md:text-5xl mb-6 text-black dark:text-white">Real Brands. Real Results.</h2>
              <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed font-body">
                See how companies eliminated fake followers and started driving actual revenue
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Testimonial 1 */}
              <motion.div
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white dark:bg-fluency-charcoal border border-stone-200 dark:border-stone-800 hover:border-fluency-neon/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-fluency-neon/20 flex items-center justify-center text-fluency-neon font-bold text-xl">
                    S
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-black dark:text-white">Sarah Chen</h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400">CMO, Urban Wear Fashion</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    <span className="font-bold">Pain Point:</span> Previously wasted $50K on fake engagement
                  </p>
                </div>

                <p className="text-stone-700 dark:text-stone-300 leading-relaxed mb-6 font-body italic">
                  "We were skeptical about influencer marketing after wasting $50K on fake followers. Fluency's verification process changed everything. Our first campaign generated $106K in actual sales - not just likes."
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-stone-200 dark:border-stone-800">
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Investment</p>
                    <p className="text-lg font-bold text-black dark:text-white">$25K</p>
                  </div>
                  <ArrowRight className="text-fluency-neon" size={24} />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Revenue Generated</p>
                    <p className="text-lg font-bold text-fluency-neon">$106K</p>
                  </div>
                  <div className="px-4 py-2 bg-fluency-neon/10 rounded-lg border border-fluency-neon/20">
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">ROI</p>
                    <p className="text-2xl font-bold text-fluency-neon">425%</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white dark:bg-fluency-charcoal border border-stone-200 dark:border-stone-800 hover:border-fluency-neon/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-fluency-neon/20 flex items-center justify-center text-fluency-neon font-bold text-xl">
                    M
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-black dark:text-white">Marcus Johnson</h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Marketing Director, TechStart SaaS</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    <span className="font-bold">Pain Point:</span> Couldn't track real customer acquisition
                  </p>
                </div>

                <p className="text-stone-700 dark:text-stone-300 leading-relaxed mb-6 font-body italic">
                  "The difference is night and day. With other platforms, we couldn't tell if we were reaching real customers. Fluency's AI verification gives us confidence that every dollar drives actual leads."
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-stone-200 dark:border-stone-800">
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Investment</p>
                    <p className="text-lg font-bold text-black dark:text-white">$15K</p>
                  </div>
                  <ArrowRight className="text-fluency-neon" size={24} />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Revenue Generated</p>
                    <p className="text-lg font-bold text-fluency-neon">$57K</p>
                  </div>
                  <div className="px-4 py-2 bg-fluency-neon/10 rounded-lg border border-fluency-neon/20">
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">ROI</p>
                    <p className="text-2xl font-bold text-fluency-neon">380%</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-fluency-neon mb-2">200+</p>
                <p className="text-stone-600 dark:text-stone-400">Brands Trust Fluency</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-fluency-neon mb-2">842+</p>
                <p className="text-stone-600 dark:text-stone-400">Verified Creators</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-fluency-neon mb-2">$2.4M+</p>
                <p className="text-stone-600 dark:text-stone-400">Revenue Generated</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-black text-stone-500 py-16 border-t border-stone-200 dark:border-stone-900 transition-colors duration-300">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <FluencyLogo className="mb-6" />
                <p className="max-w-xs text-sm leading-relaxed mb-6 font-body">
                  Fluency is the world's first AI-Native influencer marketing operating system. We exist to eliminate fraud and automate trust.
                </p>
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <Mail size={16} className="text-fluency-neon" />
                  <a href="mailto:fluency400533@gmail.com" className="hover:text-fluency-neon transition-colors font-mono text-sm">fluency400533@gmail.com</a>
                </div>
              </div>

              <div>
                <h4 className="text-black dark:text-white font-bold mb-4 uppercase text-sm tracking-wider font-sans">Platform</h4>
                <ul className="space-y-2 text-sm font-body">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">The Strategist Engine</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">AQS Scoring</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Case Studies</a></li>
                  <li><a onClick={() => setView('login')} className="hover:text-black dark:hover:text-white transition-colors cursor-pointer">Partner Login</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-black dark:text-white font-bold mb-4 uppercase text-sm tracking-wider font-sans">Legal</h4>
                <ul className="space-y-2 text-sm font-body">
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</a></li>
                  <li><button onClick={() => setView('login')} className="flex items-center gap-2 hover:text-fluency-neon transition-colors"><Lock size={12} /> Admin Access</button></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-stone-200 dark:border-stone-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
              <p className="text-xs text-stone-500 font-mono">© 2024 Fluency AI Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default App;
