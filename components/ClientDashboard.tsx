
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Send, 
  ShieldAlert, 
  CheckCircle, 
  Bot, 
  Lock, 
  Loader, 
  Scan,
  Database,
  ArrowRight,
  UserCheck,
  Globe,
  Instagram,
  Activity,
  Award
} from 'lucide-react';
import { CRMField, AICaraMessage } from '../types';
import { getInitialCRMData, simulateAICaraChat, reviewApplication } from '../services/api';

interface ClientDashboardProps {
  onLogout: () => void;
  userType: 'brand' | 'creator';
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onLogout, userType }) => {
  // States: 'intro' -> 'url_input' -> 'verify' -> 'intake' -> 'analysis' -> 'complete'
  const [viewState, setViewState] = useState<'intro' | 'url_input' | 'verify' | 'intake' | 'analysis' | 'complete'>('intro');
  
  // URL Input
  const [targetUrl, setTargetUrl] = useState('');

  // Verification State
  const [verificationProgress, setVerificationProgress] = useState(0);

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<{ trustScore: number, strategicGrade: string, notes: string[] } | null>(null);

  // Chat/Intake State
  const [messages, setMessages] = useState<AICaraMessage[]>([]);
  const [crmData, setCrmData] = useState<CRMField[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Data
  useEffect(() => {
    setCrmData(getInitialCRMData());
    
    // Initial Greeting based on User Type
    const initialGreeting = userType === 'brand' 
        ? "Welcome. I am the AI-CARA Assistant. To approve your agency workspace, I need to collect some strategic data about your brand goals."
        : "Hello. I am the AI-CARA Assistant. Fluency is an invite-only network. I need to verify your audience metrics and niche before granting access.";
    
    setMessages([{ id: 1, sender: 'AI-CARA', text: initialGreeting }]);
  }, [userType]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handlers
  const startUrlInput = () => {
      setViewState('url_input');
  }

  const startVerification = () => {
    if (!targetUrl) return; // Prevent empty submission
    setViewState('verify');
    let p = 0;
    const interval = setInterval(() => {
        p += Math.floor(Math.random() * 8) + 2;
        if (p >= 100) {
            p = 100;
            clearInterval(interval);
            setTimeout(() => setViewState('intake'), 1000);
        }
        setVerificationProgress(p);
    }, 200);
  };

  const startAnalysis = async () => {
      setViewState('analysis');
      try {
          const result = await reviewApplication(userType, targetUrl);
          setAnalysisResult(result);
          // Auto advance after 5 seconds of showing the result
          setTimeout(() => setViewState('complete'), 5000);
      } catch (e) {
          console.error(e);
      }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: AICaraMessage = { id: Date.now(), sender: 'Client', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
        const { response, updates } = await simulateAICaraChat(userMsg.text, crmData);
        
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'AI-CARA', text: response }]);

        if (updates.length > 0) {
            setCrmData(prev => prev.map(field => {
                const update = updates.find(u => u.key === field.key);
                return update ? { ...field, ...update } : field;
            }));
        }

        // Check completion - simulate moving to analysis
        const allFilled = crmData.every(f => f.status === 'verified') || (updates.length > 0 && updates[updates.length-1].key === 'timeline');
        if (allFilled && response.includes('fully populated')) {
            setTimeout(() => startAnalysis(), 2500);
        }

    } catch (error) {
        setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 font-sans flex flex-col">
      
      {/* Navigation */}
      <nav className="border-b border-stone-800 bg-[#0F0F0F] px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold shrink-0">F</div>
             <span className="font-bold text-white tracking-tight hidden md:inline">FLUENCY <span className="text-stone-500 font-normal">Onboarding Protocol</span></span>
         </div>
         <button onClick={onLogout} className="text-stone-500 hover:text-white flex items-center gap-2 text-sm transition-colors">
            <LogOut size={16}/> <span className="hidden md:inline">Abort Session</span>
         </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* VIEW 1: INTRO */}
        {viewState === 'intro' && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-[#1C1C1C] border border-stone-800 rounded-2xl p-8 text-center"
            >
                <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} className="text-stone-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Zero-Trust Verification</h1>
                <p className="text-stone-400 mb-8 leading-relaxed">
                    Fluency uses an AI Risk Engine to vet every partner. To proceed, we must verify your {userType === 'brand' ? 'business entity' : 'creator profile'}.
                </p>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={startUrlInput}
                    className="w-full py-4 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    Initialize Protocol <ArrowRight size={18}/>
                </motion.button>
            </motion.div>
        )}

        {/* VIEW 2: URL INPUT */}
        {viewState === 'url_input' && (
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-md w-full bg-[#1C1C1C] border border-stone-800 rounded-2xl p-8"
             >
                <h2 className="text-xl font-bold text-white mb-4">
                    {userType === 'brand' ? 'Entity Verification' : 'Profile Authentication'}
                </h2>
                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                        {userType === 'brand' ? 'Official Business Website' : 'Main Social Handle URL'}
                    </label>
                    <div className="relative">
                        {userType === 'brand' ? <Globe className="absolute left-3 top-3.5 text-stone-500" size={18}/> : <Instagram className="absolute left-3 top-3.5 text-stone-500" size={18}/>}
                        <input 
                            type="text" 
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-stone-800 rounded-lg focus:border-fluency-neon outline-none text-white font-mono"
                            placeholder={userType === 'brand' ? 'https://company.com' : 'https://instagram.com/handle'}
                        />
                    </div>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={startVerification}
                    disabled={!targetUrl.length}
                    className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-fluency-neon transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Scan size={18}/> Scan & Verify
                </motion.button>
             </motion.div>
        )}

        {/* VIEW 3: VERIFICATION SCANNER */}
        {viewState === 'verify' && (
            <div className="text-center">
                 <div className="w-32 h-32 relative flex items-center justify-center mx-auto mb-8">
                     <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                         <circle cx="64" cy="64" r="60" stroke="#333" strokeWidth="4" fill="none"/>
                         <motion.circle 
                            cx="64" cy="64" r="60" 
                            stroke="#CCFF00" 
                            strokeWidth="4" 
                            fill="none" 
                            strokeDasharray="377" 
                            strokeDashoffset={377 - (377 * verificationProgress) / 100} 
                            strokeLinecap="round"
                         />
                     </svg>
                     <div className="text-2xl font-mono font-bold text-fluency-neon">{verificationProgress}%</div>
                 </div>
                 <h2 className="text-xl font-bold text-white mb-2">Analyzing {targetUrl ? new URL(targetUrl).hostname : 'Entity'}...</h2>
                 <p className="text-stone-500 font-mono text-sm">
                    {verificationProgress < 30 && (userType === 'brand' ? "Scanning Global Corporate Registry..." : "Detecting Bot Clusters...")}
                    {verificationProgress >= 30 && verificationProgress < 60 && "Checking Fraud Databases..."}
                    {verificationProgress >= 60 && verificationProgress < 90 && "Analyzing Sentiment & Reputation..."}
                    {verificationProgress >= 90 && "Preliminary Scan Complete."}
                 </p>
            </div>
        )}

        {/* VIEW 4: AI INTAKE (CHAT + CRM) */}
        {viewState === 'intake' && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-6xl h-[80vh] flex flex-col lg:flex-row gap-6"
            >
                {/* Left: Chat */}
                <div className="flex-1 bg-[#1C1C1C] rounded-xl border border-stone-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-stone-800 bg-[#161616] flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-white">AI-CARA Live Interview</span>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'Client' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'AI-CARA' && (
                                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center mr-2 mt-1">
                                        <Bot size={16} className="text-fluency-neon"/>
                                    </div>
                                )}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.sender === 'Client' 
                                    ? 'bg-fluency-neon text-black rounded-tr-none font-medium' 
                                    : 'bg-stone-800 text-stone-200 rounded-tl-none border border-stone-700'
                                }`}>
                                    {msg.text}
                                </motion.div>
                            </div>
                        ))}
                        {isTyping && (
                             <div className="flex justify-start ml-10">
                                 <div className="bg-stone-800 px-4 py-3 rounded-xl rounded-tl-none border border-stone-700 flex gap-1">
                                     <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-stone-500 rounded-full"></motion.span>
                                     <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-stone-500 rounded-full"></motion.span>
                                     <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-stone-500 rounded-full"></motion.span>
                                 </div>
                             </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-[#161616] border-t border-stone-800">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder="Type your answer..." 
                                autoFocus
                                className="flex-1 bg-[#0A0A0A] border border-stone-800 rounded-lg px-4 py-3 text-white focus:border-fluency-neon outline-none font-sans"
                            />
                            <motion.button whileTap={{scale: 0.9}} type="submit" className="px-4 bg-white text-black rounded-lg hover:bg-fluency-neon transition-colors">
                                <Send size={20} />
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* Right: Live Data */}
                <div className="w-full lg:w-80 bg-[#1C1C1C] rounded-xl border border-stone-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-stone-800 bg-[#161616]">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Database size={16} className="text-fluency-neon" /> 
                            Live Data Extraction
                        </h3>
                    </div>
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto bg-[#111]">
                        {crmData.map((field) => (
                            <motion.div 
                                key={field.key} 
                                layout
                                className={`p-3 rounded-lg border transition-colors ${
                                    field.status === 'verified' 
                                    ? 'bg-green-900/10 border-green-500/30' 
                                    : 'bg-[#1C1C1C] border-stone-800'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] uppercase tracking-wider text-stone-500 font-mono">{field.label}</span>
                                    {field.status === 'verified' && <CheckCircle size={12} className="text-green-500" />}
                                </div>
                                <div className={`text-sm ${field.value ? 'text-white' : 'text-stone-600 italic'}`}>
                                    {field.value || 'Pending input...'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}

        {/* VIEW 5: ANALYSIS RESULT */}
        {viewState === 'analysis' && (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl w-full bg-[#1C1C1C] border border-stone-800 rounded-2xl p-8"
             >
                 {!analysisResult ? (
                     <div className="flex flex-col items-center justify-center py-12">
                         <Loader className="text-fluency-neon animate-spin mb-4" size={48} />
                         <h2 className="text-xl font-bold text-white mb-2">Finalizing Risk Assessment...</h2>
                         <p className="text-stone-500">Cross-referencing chat data with initial scan results.</p>
                     </div>
                 ) : (
                     <div className="animate-fade-in">
                         <div className="flex items-center justify-between mb-8 border-b border-stone-800 pb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Application Scorecard</h2>
                                <p className="text-stone-400 text-sm">Target: {targetUrl}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">Status</div>
                                <div className="text-fluency-neon font-bold">DECISION PENDING</div>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-8 mb-8">
                             <div className="bg-black/40 p-6 rounded-xl border border-stone-800 text-center">
                                 <div className="text-sm text-stone-500 uppercase tracking-widest font-mono mb-2">Trust Score</div>
                                 <div className="text-4xl font-bold text-white">{analysisResult.trustScore}/100</div>
                                 <div className="w-full bg-stone-800 h-1.5 mt-4 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analysisResult.trustScore}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-green-500" 
                                     />
                                 </div>
                             </div>
                             <div className="bg-black/40 p-6 rounded-xl border border-stone-800 text-center">
                                 <div className="text-sm text-stone-500 uppercase tracking-widest font-mono mb-2">Strategic Grade</div>
                                 <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring" }}
                                    className="text-4xl font-bold text-fluency-neon"
                                 >
                                    {analysisResult.strategicGrade}
                                 </motion.div>
                                 <div className="text-xs text-stone-500 mt-2">Based on Niche & Goals</div>
                             </div>
                         </div>

                         <div className="space-y-3 mb-8">
                             {analysisResult.notes.map((note, i) => (
                                 <motion.div 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.2 }}
                                    key={i} 
                                    className="flex items-center gap-3 text-stone-300 text-sm bg-stone-800/30 p-3 rounded-lg border border-stone-800/50"
                                 >
                                     <CheckCircle size={16} className="text-fluency-neon shrink-0"/> {note}
                                 </motion.div>
                             ))}
                         </div>
                     </div>
                 )}
             </motion.div>
        )}

        {/* VIEW 6: COMPLETE */}
        {viewState === 'complete' && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-[#1C1C1C] border border-stone-800 rounded-2xl p-8 text-center"
             >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <UserCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Application Submitted</h2>
                <p className="text-stone-400 mb-8 leading-relaxed">
                    Your profile has been graded and sent to our Strategy Team. You will be notified once your workspace is approved.
                </p>
                <div className="bg-stone-900/50 p-4 rounded-lg text-left mb-6 border border-stone-800">
                    <div className="text-xs text-stone-500 uppercase tracking-widest font-mono mb-2">Next Steps</div>
                    <ul className="text-sm text-stone-300 space-y-2">
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div> Manual Review by Admin</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-stone-600 rounded-full mt-1.5"></div> Strategy Proposal Generation</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 bg-stone-600 rounded-full mt-1.5"></div> Workspace Activation</li>
                    </ul>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout} 
                    className="w-full py-3 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-700 transition-colors"
                >
                    Return to Homepage
                </motion.button>
             </motion.div>
        )}

      </main>
    </div>
  );
};
