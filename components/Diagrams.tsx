/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, BarChart2, CheckCircle, Users, Send, Target, Shield, Globe, Search } from 'lucide-react';

// --- NETWORK MAP DIAGRAM ---
export const NetworkMapDiagram: React.FC = () => {
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  
  const toggleInfluencer = (id: number) => {
    setActiveNodes(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  // Coordinates for the diagram
  const center = { x: 50, y: 50 };
  const regions = [
      {id: 0, x: 50, y: 20, label: 'EU', triggers: [0, 2]},
      {id: 1, x: 20, y: 50, label: 'USA', triggers: [0, 1, 2]},
      {id: 2, x: 80, y: 50, label: 'ASIA', triggers: [3, 4]},
      {id: 3, x: 50, y: 80, label: 'SA', triggers: [1, 3]}
  ];

  const influencers = [
      {id: 0, x: 35, y: 35}, 
      {id: 1, x: 35, y: 65},
      {id: 2, x: 50, y: 50}, // Center Hub
      {id: 3, x: 65, y: 65}, 
      {id: 4, x: 65, y: 35},
  ];

  const activeRegions = regions.filter(region => {
      return region.triggers.some(t => activeNodes.includes(t));
  });

  return (
    <div className="flex flex-col items-center p-8 bg-[#0A0A0A] rounded-xl shadow-lg border border-stone-800 my-8 w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center w-full mb-6">
        <h3 className="font-sans font-bold text-xl text-white">Global Reach Engine</h3>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-green-500 uppercase">Live Network</span>
        </div>
      </div>
      
      <div className="relative w-full aspect-square max-w-[350px] bg-[#121212] rounded-full border border-stone-800 p-4 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
         {/* Map Background Hint */}
         <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <Globe className="w-[80%] h-[80%] text-stone-400 animate-spin-slow" strokeWidth={0.5} />
         </div>

         <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Draw lines from Center (Influencer 2) to Regions if activated */}
            {activeNodes.includes(2) && regions.map((r, i) => (
                <React.Fragment key={`line-${i}`}>
                    {/* The Line */}
                    <motion.line 
                        x1={`${center.x}%`} y1={`${center.y}%`} 
                        x2={`${r.x}%`} y2={`${r.y}%`} 
                        stroke="#333" 
                        strokeWidth="2" 
                    />
                    <motion.line 
                        x1={`${center.x}%`} y1={`${center.y}%`} 
                        x2={`${r.x}%`} y2={`${r.y}%`} 
                        stroke="#CCFF00" 
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                    {/* The Data Packet */}
                    <circle r="3" fill="white">
                        <animateMotion 
                            dur={`${1 + i * 0.2}s`} 
                            repeatCount="indefinite" 
                            path={`M${center.x*3.5},${center.y*3.5} L${r.x*3.5},${r.y*3.5}`} 
                            // Note: SVG path coordinates in animateMotion are relative to viewport, 
                            // simplified here for concept or need complex calculation. 
                            // Using a simpler Framer motion approach below for particles
                        /> 
                    </circle>
                    {/* Moving Particle using Framer Motion logic isn't straightforward inside SVG tag for percentages. 
                        Using CSS animation on a div instead for the particles overlay */}
                </React.Fragment>
            ))}
         </svg>

         {/* Particle Overlay Layer */}
         {activeNodes.includes(2) && activeRegions.map((r) => (
            <motion.div
                key={`particle-${r.id}`}
                className="absolute w-1.5 h-1.5 bg-white rounded-full z-10 shadow-[0_0_10px_white]"
                initial={{ left: '50%', top: '50%', opacity: 1 }}
                animate={{ 
                    left: [`50%`, `${r.x}%`],
                    top: [`50%`, `${r.y}%`],
                    opacity: [0, 1, 0]
                }}
                transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: Math.random() * 0.5
                }}
            />
         ))}

         {/* Region Nodes (Squares) */}
         {regions.map(node => {
             const isActive = activeRegions.find(r => r.id === node.id);
             return (
                <motion.div
                    key={`region-${node.id}`}
                    className={`absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center text-black text-[10px] uppercase font-bold rounded-md shadow-sm z-20 cursor-default border ${isActive ? 'bg-[#CCFF00] border-white scale-110 shadow-[0_0_20px_#CCFF00]' : 'bg-stone-900 border-stone-800 text-stone-500 opacity-50'}`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
                >
                    {node.label}
                </motion.div>
             )
         })}

         {/* Influencer Nodes (Circles) */}
         {influencers.map(q => (
             <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                key={`inf-${q.id}`}
                onClick={() => toggleInfluencer(q.id)}
                className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 flex items-center justify-center z-30 transition-colors duration-200 ${activeNodes.includes(q.id) ? 'bg-white border-white text-black shadow-[0_0_15px_white]' : 'bg-[#0A0A0A] border-stone-600 text-stone-500 hover:border-fluency-neon hover:text-fluency-neon'}`}
                style={{ left: `${q.x}%`, top: `${q.y}%` }}
             >
                {activeNodes.includes(q.id) ? <Zap size={16} fill="black" /> : <Users size={16}/>}
             </motion.button>
         ))}
      </div>
      
      <motion.div 
        key={activeRegions.length}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-sm text-center"
      >
        {activeNodes.length === 0 ? (
            <span className="text-stone-500 animate-pulse">Select the center node to initiate broadcast...</span>
        ) : (
            <span className="text-fluency-neon font-mono">
                Active in <span className="font-bold text-white">{activeRegions.length}</span> Regions. Routing Traffic...
            </span>
        )}
      </motion.div>
    </div>
  );
};

// --- AI WORKFLOW DIAGRAM ---
export const AIWorkflowDiagram: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setStep(s => (s + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-[#0A0A0A] rounded-xl border border-stone-800 my-8 shadow-2xl relative overflow-hidden">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <h3 className="font-sans font-bold text-xl mb-4 text-white relative z-10">The Verification Protocol</h3>
      <p className="text-sm text-stone-400 mb-8 text-center max-w-md relative z-10">
        Our proprietary 4-step filtration process ensures 99.9% fraud-free campaigns.
      </p>

      <div className="w-full flex justify-between items-center relative max-w-lg mb-8 z-10">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-800 -z-0 rounded-full"></div>
          <motion.div 
            className="absolute top-1/2 left-0 h-1 bg-[#CCFF00] -z-0 shadow-[0_0_10px_#CCFF00] rounded-full"
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />

          {/* Steps */}
          {[
              { icon: Search, label: 'Scan' },
              { icon: Shield, label: 'Verify' },
              { icon: Target, label: 'Match' },
              { icon: CheckCircle, label: 'Approve' }
          ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2 z-10 bg-[#0A0A0A] px-2 rounded-xl">
                  <motion.div 
                    animate={i === step ? { scale: [1, 1.2, 1], borderColor: '#CCFF00' } : { scale: 1, borderColor: i < step ? '#CCFF00' : '#292524' }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${i <= step ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_#CCFF00]' : 'bg-stone-900 text-stone-600'}`}
                  >
                      <s.icon size={20} />
                  </motion.div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${i <= step ? 'text-white' : 'text-stone-700'}`}>{s.label}</span>
              </div>
          ))}
      </div>

      <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 w-full max-w-sm relative z-10">
          <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono text-green-400">LIVE LOG</span>
          </div>
          <div className="font-mono text-xs text-stone-400 space-y-1 h-20 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                >
                    {step === 0 && (
                        <>
                            <p className="text-fluency-neon">{">"} Scanning public profiles...</p>
                            <p>{">"} Ingesting 50k datapoints...</p>
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <p className="text-fluency-neon">{">"} Analyzing engagement ratios...</p>
                            <p>{">"} Detecting pod activity...</p>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <p className="text-fluency-neon">{">"} Mapping audience affinity...</p>
                            <p>{">"} Checking brand taxonomy...</p>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <p className="text-green-400 font-bold">{">"} CANDIDATE VERIFIED.</p>
                            <p>{">"} Added to Client Dashboard.</p>
                        </>
                    )}
                </motion.div>
              </AnimatePresence>
          </div>
      </div>
    </div>
  );
};

// --- ROI CHART ---
export const ROIMetricDiagram: React.FC = () => {
    const metrics = ['Engagement', 'Conversion'] as const;
    const [metric, setMetric] = useState<typeof metrics[number]>('Engagement');
    
    // Comparison Data
    const data = {
        'Engagement': { industry: 1.5, fluency: 4.8, unit: '%' },
        'Conversion': { industry: 2.2, fluency: 6.5, unit: '%' }
    };

    const current = data[metric];
    
    return (
        <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-[#0A0A0A] text-white rounded-xl my-8 border border-stone-800 shadow-sm">
            <div className="flex-1 min-w-[240px]">
                <h3 className="font-sans font-bold text-xl mb-2 text-white">Performance Benchmarks</h3>
                <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                    By eliminating fraudulent traffic and utilizing AI matchmaking, Fluency campaigns deliver up to 3x higher performance than standard influencer marketing.
                </p>
                <div className="flex gap-2 mt-6">
                    {metrics.map((m) => (
                         <motion.button 
                            key={m}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMetric(m)} 
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${metric === m ? 'bg-white text-black shadow-[0_0_10px_white]' : 'bg-stone-900 text-stone-500 hover:text-white'}`}
                        >
                            {m}
                        </motion.button>
                    ))}
                </div>
            </div>
            
            <div className="flex items-end gap-8 h-64 p-4 border-b border-stone-800 w-full md:w-auto">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-stone-500">{current.industry}{current.unit}</span>
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${current.industry * 20}px` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-16 bg-stone-800 rounded-t-lg"
                    />
                    <span className="text-xs uppercase font-bold text-stone-500">Avg Agency</span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-bold text-[#CCFF00] font-sans drop-shadow-[0_0_10px_rgba(204,255,0,0.5)]">{current.fluency}{current.unit}</span>
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${current.fluency * 20}px` }}
                        transition={{ duration: 1, ease: "backOut" }}
                        className="w-16 bg-[#CCFF00] rounded-t-lg shadow-[0_0_20px_rgba(204,255,0,0.3)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                    <span className="text-xs uppercase font-bold text-white">Fluency AI</span>
                </div>
            </div>
        </div>
    )
}