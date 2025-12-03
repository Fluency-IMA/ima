/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Search, ShieldAlert, Users, Globe, LogOut, TrendingUp,
    AlertTriangle, CheckCircle, Loader, MapPin, Briefcase, MessageSquare,
    Plus, Star, Bell, Scan, SortAsc, Cpu, Menu, X, MoreHorizontal, ChevronRight,
    Filter, Check, XCircle, FileText, Target, Bot, Database, Lock, Unlock, Send,
    Sparkles, Mic, Play, Paperclip, FileText as FileIcon
} from 'lucide-react';
import {
    scanCreatorProfile, searchInfluencers, getAllCreators, generateMockLead,
    getInitialCRMData, simulateAICaraChat, wingmanRewrite, wingmanAnalyze, wingmanQnA
} from '../services/api';
import { InfluencerHub } from './InfluencerHub';

import { Creator, RiskReport, Lead, Campaign, Message, CRMField, AICaraMessage, Influencer } from '../types';

// --- TYPES ---
type Tool = 'dashboard' | 'detector' | 'matchmaker' | 'leads' | 'campaigns' | 'database' | 'inbox' | 'aicara' | 'wingman' | 'hub';

// --- MOCK DATA ---
const mockCampaigns: Campaign[] = [
    { id: 1, title: 'Summer Collection Launch', brand: 'Urban Wear', status: 'Active', influencers: 12, budget: 'Negotiable', progress: 65, emv: '$124,000' },
    { id: 2, title: 'Tech Review Series', brand: 'Sony', status: 'Negotiation', influencers: 4, budget: 'Negotiable', progress: 30, emv: '$0' },
    { id: 3, title: 'Organic Food Promo', brand: 'Whole Earth', status: 'Completed', influencers: 8, budget: 'Negotiable', progress: 100, emv: '$52,000' },
];

const initialMessages: Message[] = [
    { id: 1, sender: 'Urban Wear', preview: 'Approved the latest content draft.', time: '10:42 AM', unread: true },
    { id: 2, sender: '@sarahj_style', preview: 'When is the product shipping?', time: 'Yesterday', unread: false },
    { id: 3, sender: 'Nexus Tech', preview: 'Can we schedule a call for Q3?', time: '2 days ago', unread: false },
];

// --- SUB-COMPONENTS ---

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    icon: any;
}

const StatCard = ({ title, value, trend, icon: Icon }: StatCardProps) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-[#1C1C1C] p-6 rounded-xl border border-stone-800 hover:border-fluency-neon/30 transition-colors group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-stone-800 rounded-lg text-fluency-neon group-hover:scale-110 transition-transform">
                <Icon size={20} />
            </div>
            <span className={`text-xs font-mono px-2 py-1 rounded ${trend.startsWith('+') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {trend}
            </span>
        </div>
        <h3 className="text-stone-400 text-sm font-medium mb-1 font-body">{title}</h3>
        <p className="text-2xl font-sans font-bold text-white">{value}</p>
    </motion.div>
);

// --- TOOLS ---

const WingmanPage = () => {
    const [mode, setMode] = useState<'refine' | 'analyze'>('refine');

    // Refine State
    const [inputText, setInputText] = useState('');
    const [refinedText, setRefinedText] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    // Analyze State
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<{ summary: string, audioOverview: boolean } | null>(null);
    const [qnaInput, setQnaInput] = useState('');
    const [qnaHistory, setQnaHistory] = useState<{ sender: string, text: string }[]>([]);

    const handleRefine = async (type: 'grammar' | 'corporate') => {
        if (!inputText) return;
        setIsRefining(true);
        const res = await wingmanRewrite(inputText, type);
        setRefinedText(res);
        setIsRefining(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0].name);
            setAnalyzing(true);
            setAnalysisResult(null);

            // Auto trigger analysis
            wingmanAnalyze(e.target.files[0].name).then(res => {
                setAnalysisResult(res);
                setAnalyzing(false);
            });
        }
    };

    const handleQna = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!qnaInput) return;
        const q = qnaInput;
        setQnaInput('');
        setQnaHistory(prev => [...prev, { sender: 'You', text: q }]);

        const ans = await wingmanQnA(q);
        setQnaHistory(prev => [...prev, { sender: 'You', text: q }, { sender: 'Wingman', text: ans }]);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-sans font-bold text-white mb-2 flex items-center gap-2">
                        <Sparkles className="text-fluency-neon" /> Wingman AI
                    </h2>
                    <p className="text-stone-400 text-sm md:text-base font-body">Powered by Gemini & NotebookLM Technology.</p>
                </div>
                <div className="flex bg-stone-800 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('refine')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'refine' ? 'bg-fluency-neon text-black' : 'text-stone-400 hover:text-white'}`}
                    >
                        Refine Text
                    </button>
                    <button
                        onClick={() => setMode('analyze')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${mode === 'analyze' ? 'bg-fluency-neon text-black' : 'text-stone-400 hover:text-white'}`}
                    >
                        Deep Analysis
                    </button>
                </div>
            </div>

            {mode === 'refine' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1C1C1C] p-6 rounded-xl border border-stone-800">
                        <label className="text-xs text-stone-500 uppercase font-mono mb-2 block">Input (Rough Draft)</label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full h-64 bg-[#0A0A0A] border border-stone-800 rounded-lg p-4 text-white font-body focus:border-fluency-neon outline-none resize-none"
                            placeholder="Paste your rough email, caption, or strategy notes here..."
                        />
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => handleRefine('grammar')}
                                disabled={isRefining || !inputText}
                                className="flex-1 py-3 bg-stone-800 text-white rounded-lg font-bold text-sm hover:bg-stone-700 transition-colors disabled:opacity-50"
                            >
                                {isRefining ? <Loader size={16} className="animate-spin mx-auto" /> : 'Fix Grammar'}
                            </button>
                            <button
                                onClick={() => handleRefine('corporate')}
                                disabled={isRefining || !inputText}
                                className="flex-1 py-3 bg-white text-black rounded-lg font-bold text-sm hover:bg-fluency-neon transition-colors disabled:opacity-50"
                            >
                                {isRefining ? <Loader size={16} className="animate-spin mx-auto" /> : 'Make Professional'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#1C1C1C] p-6 rounded-xl border border-stone-800 relative overflow-hidden">
                        <label className="text-xs text-stone-500 uppercase font-mono mb-2 block">Wingman Output</label>
                        <div className="w-full h-64 bg-[#0A0A0A] border border-stone-800 rounded-lg p-4 text-stone-300 font-body overflow-y-auto">
                            {refinedText || <span className="text-stone-600 italic">AI Output will appear here...</span>}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => navigator.clipboard.writeText(refinedText)} className="text-xs text-stone-500 hover:text-white flex items-center gap-1">
                                <FileIcon size={12} /> Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Upload Area */}
                    <div className="bg-[#1C1C1C] p-8 rounded-xl border border-stone-800 border-dashed text-center">
                        <input type="file" id="fileUpload" className="hidden" onChange={handleFileUpload} />
                        <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center text-fluency-neon">
                                <Paperclip size={32} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Upload Campaign Documents</h3>
                                <p className="text-stone-500 text-sm">PDF, DOCX, TXT supported (Max 10MB)</p>
                            </div>
                            <span className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-fluency-neon transition-colors">
                                Select File
                            </span>
                        </label>
                    </div>

                    {/* Analysis Result */}
                    {uploadedFile && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <div className="bg-[#1C1C1C] p-6 rounded-xl border border-stone-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-white flex items-center gap-2"><FileText size={18} /> {uploadedFile}</h3>
                                    {analyzing && <span className="text-xs text-fluency-neon animate-pulse">ANALYZING...</span>}
                                </div>

                                {analysisResult ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-stone-900 rounded-lg text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                                            {analysisResult.summary}
                                        </div>
                                        <div className="p-4 bg-gradient-to-r from-stone-800 to-stone-900 rounded-lg border border-stone-700 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-fluency-neon rounded-full flex items-center justify-center text-black">
                                                    <Play size={20} fill="black" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm">Audio Overview</div>
                                                    <div className="text-xs text-stone-500">Generated by NotebookLM</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-stone-400">00:00 / 02:14</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-40 flex items-center justify-center">
                                        <Loader className="animate-spin text-stone-500" />
                                    </div>
                                )}
                            </div>

                            <div className="bg-[#1C1C1C] p-6 rounded-xl border border-stone-800 flex flex-col h-[400px]">
                                <h3 className="font-bold text-white mb-4">Deep Q&A</h3>
                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                    {qnaHistory.map((msg, i) => (
                                        <div key={i} className={`p-3 rounded-lg text-sm ${msg.sender === 'You' ? 'bg-stone-800 ml-8' : 'bg-stone-900 border border-stone-800 mr-8'}`}>
                                            <span className="text-xs text-stone-500 block mb-1">{msg.sender}</span>
                                            <p className="text-stone-200">{msg.text}</p>
                                        </div>
                                    ))}
                                    {qnaHistory.length === 0 && <p className="text-stone-600 text-sm text-center italic mt-20">Ask questions about your document...</p>}
                                </div>
                                <form onSubmit={handleQna} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={qnaInput}
                                        onChange={(e) => setQnaInput(e.target.value)}
                                        placeholder="Ask a question..."
                                        className="flex-1 bg-[#0A0A0A] border border-stone-800 rounded-lg px-3 py-2 text-white text-sm focus:border-fluency-neon outline-none"
                                        disabled={analyzing}
                                    />
                                    <button type="submit" disabled={analyzing} className="p-2 bg-fluency-neon text-black rounded-lg">
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const DetectorTool = () => {
    const [handle, setHandle] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<RiskReport | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setAnalyzing(true);
        setResult(null);
        try {
            const report = await scanCreatorProfile(handle);
            setResult(report);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-sans font-bold text-white mb-2">The Detective</h2>
                    <p className="text-stone-400 text-sm md:text-base font-body">Deep scan for AQS (Audience Quality Score) and Fraud Detection.</p>
                </div>
                <div className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded-full text-xs font-mono uppercase flex items-center gap-2">
                    <ShieldAlert size={12} /> Fraud Engine Active
                </div>
            </div>

            <div className="bg-[#1C1C1C] p-4 md:p-8 rounded-xl border border-stone-800 mb-8 shadow-lg">
                <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-3.5 text-stone-500 font-mono">@</span>
                        <input
                            type="text"
                            placeholder="username"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="w-full bg-black border border-stone-700 text-white pl-8 pr-4 py-3 rounded-lg focus:border-fluency-neon outline-none font-mono transition-all"
                            required
                        />
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={analyzing}
                        className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-fluency-neon transition-colors flex items-center justify-center gap-2 w-full md:w-auto font-sans"
                    >
                        {analyzing ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
                        {analyzing ? 'SCANNING' : 'ANALYZE'}
                    </motion.button>
                </form>
            </div>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className="bg-[#1C1C1C] p-6 md:p-8 rounded-xl border border-stone-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-sans font-bold text-lg md:text-xl">Risk Assessment</h3>
                            <span className={`px-3 py-1 rounded text-xs font-bold font-mono ${result.verdict === 'VERIFIED' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                {result.verdict}
                            </span>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-stone-400 font-body">
                                    <span>Audience Quality Score (AQS)</span>
                                    <span className="font-mono text-white">{result.aqs}/100</span>
                                </div>
                                <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${result.aqs}%` }}
                                        transition={{ duration: 1 }}
                                        className={`h-full rounded-full ${result.aqs > 70 ? 'bg-fluency-neon' : 'bg-red-500'}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2 text-stone-400 font-body">
                                    <span>Real Audience</span>
                                    <span className="font-mono text-white">{(100 - result.botPercentage).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${100 - result.botPercentage}%` }}
                                        transition={{ duration: 1 }}
                                        className={`h-full rounded-full ${result.botPercentage < 20 ? 'bg-green-500' : 'bg-red-500'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1C1C1C] p-6 md:p-8 rounded-xl border border-stone-800 flex flex-col justify-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-stone-800 rounded-full text-fluency-neon"><MapPin size={20} /></div>
                            <div>
                                <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">Audience Location</div>
                                <div className="text-white font-medium font-body">{result.audienceLocation}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-stone-800 rounded-full text-fluency-neon"><TrendingUp size={20} /></div>
                            <div>
                                <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">Engagement Authenticity</div>
                                <div className="text-white font-medium font-body">{result.engagementAuthenticity}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-stone-800 rounded-full text-fluency-neon"><AlertTriangle size={20} /></div>
                            <div>
                                <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">Bot Activity Detected</div>
                                <div className="text-white font-medium font-body">{result.botPercentage}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const MatchmakerTool = () => {
    const [query, setQuery] = useState({ product: '', country: 'All' });
    const [filters, setFilters] = useState({ minFollowers: 100000, minEngagement: 2.0, minAQS: 70 });
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Creator[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchInfluencers(query.product, query.country, filters.minFollowers, filters.minEngagement);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-white mb-2">The Matchmaker</h2>
            <p className="text-stone-400 mb-8 text-sm md:text-base font-body">Precision filtering using AQS, Tier, and Geo-Data.</p>

            <div className="bg-[#1C1C1C] p-6 md:p-8 rounded-xl border border-stone-800 mb-8">
                <form onSubmit={handleSearch} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wider font-mono">Target Country</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-3.5 text-stone-500" />
                                <select
                                    value={query.country}
                                    onChange={e => setQuery({ ...query, country: e.target.value })}
                                    className="w-full bg-black border border-stone-700 text-white pl-10 pr-4 py-3 rounded-lg outline-none focus:border-fluency-neon appearance-none font-body"
                                >
                                    <option value="All">Global (All)</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                    <option value="Japan">Japan</option>
                                    <option value="France">France</option>
                                    <option value="Brazil">Brazil</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wider font-mono">Product / Niche</label>
                            <input
                                type="text"
                                placeholder="e.g. Organic Skincare"
                                value={query.product}
                                onChange={e => setQuery({ ...query, product: e.target.value })}
                                className="w-full bg-black border border-stone-700 text-white px-4 py-3 rounded-lg outline-none focus:border-fluency-neon font-body"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wider flex justify-between font-mono">
                                <span>Min Followers</span>
                                <span className="text-white">{filters.minFollowers.toLocaleString()}</span>
                            </label>
                            <input
                                type="range"
                                min="10000"
                                max="2000000"
                                step="10000"
                                value={filters.minFollowers}
                                onChange={(e) => setFilters({ ...filters, minFollowers: parseInt(e.target.value) })}
                                className="w-full accent-fluency-neon"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wider flex justify-between font-mono">
                                <span>Min AQS (Quality)</span>
                                <span className="text-white">{filters.minAQS}</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                step="1"
                                value={filters.minAQS}
                                onChange={(e) => setFilters({ ...filters, minAQS: parseInt(e.target.value) })}
                                className="w-full accent-fluency-neon"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-fluency-neon transition-colors h-[50px] flex items-center justify-center min-w-[120px] w-full md:w-auto font-sans"
                        >
                            {loading ? <Loader className="animate-spin" /> : 'FIND MATCH'}
                        </motion.button>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                {results.length === 0 && !loading && (
                    <div className="text-center text-stone-600 italic py-8 font-body">No active pairings found based on current criteria.</div>
                )}
                {results.map((influencer, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="bg-[#1C1C1C] border border-stone-800 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between hover:border-fluency-neon transition-colors cursor-pointer group gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-stone-700 to-stone-800 rounded-full flex items-center justify-center text-white font-sans font-bold shadow-inner">
                                {influencer.avatar}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-white font-medium group-hover:text-fluency-neon transition-colors font-sans">{influencer.name}</h4>
                                    <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700 font-mono uppercase">{influencer.tier}</span>
                                </div>
                                <p className="text-sm text-stone-500 font-body">{influencer.niche} • {influencer.location}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end border-t border-stone-800 pt-4 md:pt-0 md:border-t-0">
                            <div className="text-left md:text-right">
                                <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">AQS</div>
                                <div className={`font-mono font-bold ${influencer.aqs > 80 ? 'text-fluency-neon' : 'text-white'}`}>{influencer.aqs}</div>
                            </div>
                            <div className="text-left md:text-right">
                                <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">Eng. Rate</div>
                                <div className="text-white font-mono">{influencer.engagementRate}%</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">Match</div>
                                <div className="text-xl font-bold text-green-400 font-sans">{influencer.matchScore}%</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const LeadsTool = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isListening, setIsListening] = useState(true);

    useEffect(() => {
        // Initial load
        setLeads([generateMockLead(), generateMockLead()]);
    }, []);

    // Simulate Real-time Websocket
    useEffect(() => {
        if (!isListening) return;

        const interval = setInterval(() => {
            const newLead = generateMockLead();
            setLeads(prev => [newLead, ...prev.slice(0, 9)]); // Keep last 10
        }, 8000);

        return () => clearInterval(interval);
    }, [isListening]);

    const handleVerify = (id: number) => {
        setLeads(prev => prev.map(l =>
            l.id === id ? { ...l, status: 'Verified' } : l
        ));
    };

    const getUrgencyColor = (urgency: 'High' | 'Medium' | 'Low') => {
        switch (urgency) {
            case 'High': return 'bg-red-900/20 text-red-400 border-red-900/50';
            case 'Medium': return 'bg-yellow-900/20 text-yellow-400 border-yellow-900/50';
            case 'Low': return 'bg-blue-900/20 text-blue-400 border-blue-900/50';
            default: return 'bg-stone-800 text-stone-400';
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-sans font-bold text-white mb-2">The Hunter</h2>
                    <p className="text-stone-400 text-sm md:text-base font-body">Verification and Strategy Generation Engine.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 text-green-400 rounded-full border border-green-900/50">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-mono uppercase">Live Feed</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                <AnimatePresence>
                    {leads.map((lead) => (
                        <motion.div
                            key={lead.id}
                            initial={lead.isNew ? { opacity: 0, x: -20, backgroundColor: 'rgba(204, 255, 0, 0.1)' } : {}}
                            animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(28, 28, 28, 1)' }}
                            transition={{ duration: 0.5 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-[#1C1C1C] border border-stone-800 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between hover:border-stone-600 transition-colors relative overflow-hidden gap-4"
                        >
                            {lead.isNew && lead.status === 'New' && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-fluency-neon text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg font-mono">NEW</div>
                                </div>
                            )}
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-stone-800 rounded-lg shrink-0">
                                    <Briefcase size={24} className="text-stone-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-lg text-white font-sans font-bold">{lead.company}</h4>
                                        {lead.websiteGrade && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${lead.websiteGrade === 'A+' ? 'text-green-400 border-green-900' : 'text-stone-400 border-stone-800'}`}>
                                                Grade: {lead.websiteGrade}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-stone-500 mb-2 font-mono">{lead.website}</div>

                                    {/* AI Strategy Preview */}
                                    <div className="bg-stone-900/50 p-2 rounded border border-stone-800 mb-2">
                                        <div className="flex items-center gap-1 text-[10px] text-fluency-neon mb-1 font-bold uppercase">
                                            <Cpu size={10} /> AI Strategy Generated
                                        </div>
                                        <p className="text-xs text-stone-300 italic font-body">"{lead.smartGoal}"</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className={`px-2 py-1 rounded border font-mono ${getUrgencyColor(lead.urgency)}`}>
                                            {lead.urgency}
                                        </span>
                                        <span className="bg-stone-800 text-stone-300 px-2 py-1 rounded border border-stone-700 font-mono">Rec: {lead.recommendedTier} Influencers</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full md:w-auto">
                                <div className="text-left md:text-right w-full md:w-auto flex justify-between md:block">
                                    <div className="text-xs text-stone-500 uppercase tracking-widest md:mb-1 font-mono">Budget</div>
                                    <div className="text-white font-mono">Negotiable</div>
                                </div>

                                {lead.status === 'New' ? (
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleVerify(lead.id)}
                                        className="w-full md:w-auto bg-white text-black text-sm font-bold px-4 py-3 rounded-lg hover:bg-fluency-neon transition-colors whitespace-nowrap flex items-center justify-center gap-2 font-sans"
                                    >
                                        <Scan size={14} /> Verify & Accept
                                    </motion.button>
                                ) : (
                                    <div className="w-full md:w-auto px-4 py-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-bold flex items-center justify-center gap-2 font-sans">
                                        <CheckCircle size={14} /> Client Verified
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

const AICaraPage = () => {
    const [step, setStep] = useState<'verification' | 'active'>('verification');
    const [verificationProgress, setVerificationProgress] = useState(0);
    const [messages, setMessages] = useState<AICaraMessage[]>([
        { id: 1, sender: 'AI-CARA', text: 'Welcome. I am the AI-CARA Assistant. I will guide you through the onboarding process to build your campaign profile.' }
    ]);
    const [crmData, setCrmData] = useState<CRMField[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // Initial CRM Data Load
        setCrmData(getInitialCRMData());
    }, []);

    const startVerification = () => {
        let p = 0;
        const interval = setInterval(() => {
            p += Math.floor(Math.random() * 15);
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setTimeout(() => setStep('active'), 500);
            }
            setVerificationProgress(p);
        }, 300);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMsg: AICaraMessage = { id: Date.now(), sender: 'Client', text: inputValue };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        // API Call
        const { response, updates } = await simulateAICaraChat(newUserMsg.text, crmData);

        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'AI-CARA', text: response }]);

        // Update CRM Fields with animation
        if (updates.length > 0) {
            setCrmData(prev => prev.map(field => {
                const update = updates.find(u => u.key === field.key);
                return update ? { ...field, ...update } : field;
            }));
        }
    };

    if (step === 'verification') {
        return (
            <div className="max-w-xl mx-auto py-20 animate-fade-in flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mb-6 relative">
                    <ShieldAlert size={40} className={verificationProgress === 100 ? "text-green-500" : "text-stone-400"} />
                    {verificationProgress > 0 && verificationProgress < 100 && (
                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                            <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="2" fill="none" className="text-stone-700" />
                            <motion.circle
                                initial={{ strokeDashoffset: 238 }}
                                animate={{ strokeDashoffset: 238 - (238 * verificationProgress) / 100 }}
                                cx="40" cy="40" r="38"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                className="text-fluency-neon"
                                strokeDasharray="238"
                            />
                        </svg>
                    )}
                </div>
                <h2 className="text-2xl font-sans font-bold text-white mb-2">AI-CARA Verification Gate</h2>
                <p className="text-stone-400 mb-8 max-w-sm font-body">
                    Before a client channel is opened, our AI performs a deep risk scan on the prospect's domain and digital footprint.
                </p>
                {verificationProgress === 0 ? (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={startVerification}
                        className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-fluency-neon transition-colors flex items-center gap-2 font-sans"
                    >
                        <Scan size={18} /> Initiate Client Scan
                    </motion.button>
                ) : (
                    <div className="font-mono text-fluency-neon text-lg">
                        {verificationProgress < 100 ? `SCANNING... ${verificationProgress}%` : 'VERIFICATION COMPLETE'}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] animate-fade-in flex flex-col lg:flex-row gap-6">
            {/* Left: Chat Interface */}
            <div className="flex-1 bg-[#1C1C1C] rounded-xl border border-stone-800 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-stone-800 bg-[#161616] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-fluency-neon flex items-center justify-center text-black">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold font-sans">AI-CARA Assistant</h3>
                            <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active Interview
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'Client' ? 'justify-end' : 'justify-start'}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`max-w-[80%] px-4 py-3 rounded-xl text-sm font-body leading-relaxed ${msg.sender === 'Client'
                                    ? 'bg-white text-black rounded-tr-none'
                                    : 'bg-stone-800 text-stone-200 rounded-tl-none border border-stone-700'
                                    }`}>
                                {msg.text}
                            </motion.div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-stone-800 px-4 py-3 rounded-xl rounded-tl-none border border-stone-700 flex gap-1">
                                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-stone-500 rounded-full"></motion.span>
                                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-stone-500 rounded-full"></motion.span>
                                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-stone-500 rounded-full"></motion.span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-[#161616] border-t border-stone-800">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder="Type a response as Client..."
                            className="flex-1 bg-[#0A0A0A] border border-stone-800 rounded-lg px-4 py-3 text-white focus:border-fluency-neon outline-none font-body"
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="submit"
                            className="px-4 bg-fluency-neon text-black rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Send size={20} />
                        </motion.button>
                    </form>
                </div>
            </div>

            {/* Right: Real-time CRM Sheet */}
            <div className="w-full lg:w-96 bg-[#1C1C1C] rounded-xl border border-stone-800 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-stone-800 bg-[#161616]">
                    <h3 className="text-white font-bold font-sans flex items-center gap-2">
                        <Database size={18} className="text-stone-400" /> Live Data Extraction
                    </h3>
                </div>
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {crmData.map((field) => (
                        <div key={field.key} className="relative">
                            <label className="text-xs text-stone-500 uppercase tracking-widest font-mono mb-1 block">
                                {field.label}
                            </label>
                            <motion.div
                                layout
                                className={`p-3 rounded border flex items-center justify-between transition-all duration-500 ${field.status === 'verified'
                                    ? 'bg-green-900/10 border-green-500/30 text-white'
                                    : 'bg-[#0A0A0A] border-stone-800 text-stone-500 italic'
                                    }`}>
                                <span className="text-sm font-body truncate">{field.value || 'Waiting for input...'}</span>
                                {field.status === 'verified' ? <CheckCircle size={14} className="text-green-500" /> : <Loader size={14} className="animate-spin opacity-0" />}
                            </motion.div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-[#161616] border-t border-stone-800">
                    <button className="w-full py-3 bg-stone-800 text-stone-400 rounded-lg font-bold text-sm flex items-center justify-center gap-2 font-sans cursor-not-allowed">
                        <Lock size={14} /> Approve Workspace
                    </button>
                    <p className="text-[10px] text-stone-500 text-center mt-2 font-mono">
                        Requires 100% field completion
                    </p>
                </div>
            </div>
        </div>
    );
};

const DatabasePage = () => {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [sortOption, setSortOption] = useState<'followers' | 'engagement' | 'name'>('followers');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCreators = async () => {
            const data = await getAllCreators();
            setCreators(data);
            setLoading(false);
        };
        fetchCreators();
    }, []);

    const sortedCreators = [...creators].sort((a, b) => {
        if (sortOption === 'followers') return b.followers - a.followers;
        if (sortOption === 'engagement') return b.engagementRate - a.engagementRate;
        if (sortOption === 'name') return a.name.localeCompare(b.name);
        return 0;
    });

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
        return num;
    };

    if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-fluency-neon" /></div>;

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-sans font-bold text-white mb-2">Creator Database</h2>
                    <p className="text-stone-400 text-sm md:text-base font-body">Manage and discover talent across your global network.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative">
                        <SortAsc size={16} className="absolute left-3 top-2.5 text-stone-400" />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as any)}
                            className="w-full md:w-auto pl-9 pr-4 py-2 bg-stone-800 text-white rounded-lg text-sm hover:bg-stone-700 transition-colors appearance-none outline-none focus:ring-1 focus:ring-fluency-neon font-body"
                        >
                            <option value="followers">Sort by Followers</option>
                            <option value="engagement">Sort by Engagement</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-white text-black font-bold rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-fluency-neon transition-colors font-sans"
                    >
                        <Plus size={16} /> Add Creator
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCreators.map((creator) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={creator.id}
                        className="bg-[#1C1C1C] border border-stone-800 rounded-xl p-6 hover:border-stone-600 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fluency-neon to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-stone-800 rounded-full flex items-center justify-center text-xl font-sans font-bold text-white border border-stone-700">
                                    {creator.avatar}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-lg font-sans">{creator.name}</h3>
                                    <p className="text-stone-500 text-sm font-body">{creator.handle}</p>
                                </div>
                            </div>
                            <button className="text-stone-600 hover:text-white"><MoreHorizontal size={20} /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-black/50 rounded-lg border border-stone-800">
                                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1 font-mono">Followers</div>
                                <div className="text-white font-mono">{formatNumber(creator.followers)}</div>
                            </div>
                            <div className="p-3 bg-black/50 rounded-lg border border-stone-800">
                                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1 font-mono">AQS</div>
                                <div className={`font-mono font-bold ${creator.aqs > 80 ? 'text-fluency-neon' : 'text-white'}`}>{creator.aqs}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <span className="px-2 py-1 bg-stone-800 text-stone-300 text-xs rounded border border-stone-700 font-mono">{creator.niche}</span>
                            <span className="px-2 py-1 bg-stone-800 text-stone-300 text-xs rounded border border-stone-700 flex items-center gap-1 font-mono"><MapPin size={10} /> {creator.location}</span>
                        </div>

                        <div className="flex gap-2">
                            <motion.button whileTap={{ scale: 0.95 }} className="flex-1 py-2 bg-stone-100 text-black text-sm font-bold rounded hover:bg-fluency-neon transition-colors font-sans">View Profile</motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} className="p-2 bg-stone-800 text-stone-400 rounded hover:text-white transition-colors"><MessageSquare size={18} /></motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const CampaignsPage = () => {
    return (
        <div className="animate-fade-in h-full flex flex-col pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-sans font-bold text-white mb-2">Active Campaigns</h2>
                    <p className="text-stone-400 text-sm md:text-base font-body">Track campaign progress and ROI in real-time.</p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full md:w-auto px-4 py-2 bg-white text-black font-bold rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-fluency-neon transition-colors font-sans"
                >
                    <Plus size={16} /> New Campaign
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Active */}
                <div className="bg-[#1C1C1C]/50 rounded-xl p-4 border border-stone-800 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-sm font-bold text-stone-400 uppercase tracking-widest font-mono">Active</span>
                        <span className="bg-green-900/30 text-green-400 text-xs px-2 py-0.5 rounded-full font-mono">2</span>
                    </div>
                    {mockCampaigns.filter(c => c.status === 'Active').map(c => (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            key={c.id}
                            className="bg-[#1C1C1C] p-4 rounded-lg border border-stone-700 hover:border-fluency-neon cursor-pointer transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="text-white font-medium font-sans">{c.title}</h4>
                                <MoreHorizontal size={16} className="text-stone-600 group-hover:text-stone-400" />
                            </div>
                            <div className="text-sm text-stone-500 mb-4 flex items-center gap-2 font-body">
                                <Briefcase size={14} /> {c.brand}
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-stone-400 mb-1 font-mono">
                                    <span>Progress</span>
                                    <span>{c.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-stone-800 rounded-full">
                                    <div className="h-full bg-fluency-neon rounded-full" style={{ width: `${c.progress}%` }}></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-stone-800">
                                <div className="text-xs text-stone-500 font-mono">Est EMV: {c.emv}</div>
                                <span className="text-xs font-mono text-stone-400">{c.budget}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Column 2: Negotiation */}
                <div className="bg-[#1C1C1C]/50 rounded-xl p-4 border border-stone-800 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-sm font-bold text-stone-400 uppercase tracking-widest font-mono">Negotiation</span>
                        <span className="bg-yellow-900/30 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-mono">1</span>
                    </div>
                    {mockCampaigns.filter(c => c.status === 'Negotiation').map(c => (
                        <motion.div whileHover={{ scale: 1.02 }} key={c.id} className="bg-[#1C1C1C] p-4 rounded-lg border border-stone-700 hover:border-fluency-neon cursor-pointer transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="text-white font-medium font-sans">{c.title}</h4>
                                <MoreHorizontal size={16} className="text-stone-600 group-hover:text-stone-400" />
                            </div>
                            <div className="text-sm text-stone-500 mb-4 flex items-center gap-2 font-body">
                                <Briefcase size={14} /> {c.brand}
                            </div>
                            <div className="flex gap-2 mb-4">
                                <span className="text-xs bg-stone-800 text-stone-400 px-2 py-1 rounded border border-stone-700 font-mono">Contract Pending</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-stone-800">
                                <div className="text-xs text-stone-500 font-body">Starts in 3 days</div>
                                <span className="text-xs font-mono text-stone-400">{c.budget}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Column 3: Completed */}
                <div className="bg-[#1C1C1C]/50 rounded-xl p-4 border border-stone-800 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                        <span className="text-sm font-bold text-stone-400 uppercase tracking-widest font-mono">Completed</span>
                        <span className="bg-stone-800 text-stone-400 text-xs px-2 py-0.5 rounded-full font-mono">5</span>
                    </div>
                    <div className="bg-[#1C1C1C] p-4 rounded-lg border border-stone-800 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-medium line-through decoration-stone-500 font-sans">Winter Sale</h4>
                            <CheckCircle size={16} className="text-green-500" />
                        </div>
                        <div className="text-sm text-stone-500 mb-2 font-body">Nike Sportswear</div>
                        <div className="text-xs font-mono text-stone-400 pt-2 border-t border-stone-800">ROI: 340%</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const InboxPage = () => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [rewriting, setRewriting] = useState(false);

    // Simulate Notification
    useEffect(() => {
        const timer = setTimeout(() => {
            const newMsg: Message = { id: Date.now(), sender: 'EcoLife Co.', preview: 'We are ready to sign!', time: 'Now', unread: true };
            setMessages(prev => [newMsg, ...prev]);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleWingmanRewrite = async () => {
        if (!input) return;
        setRewriting(true);
        const polished = await wingmanRewrite(input, 'corporate');
        setInput(polished);
        setRewriting(false);
    }

    return (
        <div className="animate-fade-in flex flex-col md:flex-row h-full md:h-[calc(100vh-140px)] bg-[#1C1C1C] rounded-xl border border-stone-800 overflow-hidden relative">

            <AnimatePresence>
                {messages[0].time === 'Now' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 left-1/2 z-50 bg-fluency-neon text-black px-4 py-2 rounded-lg shadow-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap font-sans"
                    >
                        <Bell size={14} className="animate-bounce" /> New Message
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar List */}
            <div className="w-full md:w-80 h-1/3 md:h-full border-b md:border-b-0 md:border-r border-stone-800 bg-[#161616] flex flex-col">
                <div className="p-4 border-b border-stone-800">
                    <h3 className="text-white font-sans font-bold mb-4">Messages</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-stone-500" size={14} />
                        <input type="text" placeholder="Search..." className="w-full bg-[#0A0A0A] border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-300 focus:outline-none focus:border-fluency-neon font-body" />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1">
                    {messages.map(msg => (
                        <div key={msg.id} className={`p-4 border-b border-stone-800 cursor-pointer hover:bg-stone-800/50 transition-colors ${msg.unread ? 'bg-stone-800/20 border-l-2 border-l-fluency-neon' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-medium text-sm font-sans ${msg.unread ? 'text-white' : 'text-stone-400'}`}>{msg.sender}</span>
                                <span className={`text-[10px] font-mono ${msg.time === 'Now' ? 'text-fluency-neon font-bold' : 'text-stone-600'}`}>{msg.time}</span>
                            </div>
                            <p className={`text-xs truncate font-body ${msg.unread ? 'text-stone-300' : 'text-stone-500'}`}>{msg.preview}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat View */}
            <div className="flex-1 flex flex-col bg-[#1C1C1C] h-2/3 md:h-full">
                <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-[#161616]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fluency-neon to-white flex items-center justify-center text-black font-bold text-xs font-sans">UW</div>
                        <div>
                            <h4 className="text-white text-sm font-bold font-sans">Urban Wear</h4>
                            <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Online</div>
                        </div>
                    </div>
                    <MoreHorizontal className="text-stone-500 cursor-pointer" />
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    <div className="flex justify-center mb-4"><span className="text-[10px] text-stone-600 bg-stone-900 px-2 py-1 rounded-full font-mono">Today, 10:23 AM</span></div>
                    <div className="flex justify-end">
                        <div className="bg-fluency-neon text-black px-4 py-2 rounded-l-xl rounded-tr-xl max-w-[85%] md:max-w-sm text-sm font-medium font-body">
                            Hi team, just confirming the budget for the Q3 campaign is negotiable?
                        </div>
                    </div>
                    <div className="flex justify-start">
                        <div className="bg-stone-800 text-stone-200 px-4 py-2 rounded-r-xl rounded-tl-xl max-w-[85%] md:max-w-sm text-sm border border-stone-700 font-body">
                            Yes, budget is negotiable. We've also approved the latest content draft.
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[#161616] border-t border-stone-800">
                    <div className="flex gap-2">
                        <button className="p-2 text-stone-500 hover:text-white hidden md:block"><Plus size={20} /></button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-[#0A0A0A] border border-stone-800 rounded-lg pl-4 pr-10 py-2 text-stone-300 focus:outline-none focus:border-fluency-neon text-sm md:text-base font-body"
                            />
                            {/* WINGMAN BUTTON */}
                            <button
                                onClick={handleWingmanRewrite}
                                disabled={rewriting || !input}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-fluency-neon hover:text-white transition-colors disabled:opacity-50"
                                title="Wingman Polish"
                            >
                                {rewriting ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            </button>
                        </div>
                        <button className="p-2 bg-white text-black rounded-lg hover:bg-fluency-neon transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- MAIN LAYOUT ---

interface AdminDashboardProps {
    onLogout: () => void;
    influencers: Influencer[];
    setInfluencers: React.Dispatch<React.SetStateAction<Influencer[]>>;
    campaigns: Campaign[];
    setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
    onOpenClientPortal: (id: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    onLogout,
    influencers,
    setInfluencers,
    campaigns,
    setCampaigns,
    onOpenClientPortal
}) => {
    const [activeTool, setActiveTool] = useState<Tool>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const NavItem = ({ tool, label, icon: Icon, extra }: { tool: Tool, label: string, icon: any, extra?: React.ReactNode }) => (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setActiveTool(tool); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors font-sans ${activeTool === tool ? 'bg-white text-black' : 'text-stone-400 hover:bg-stone-900 hover:text-white'}`}
        >
            <Icon size={18} /> {label} {extra}
        </motion.button>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-stone-200 flex flex-col md:flex-row font-body selection:bg-fluency-neon selection:text-black">

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-stone-800 bg-[#050505] sticky top-0 z-30">
                <div className="flex items-center gap-2 text-white font-sans font-bold">
                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-black shadow-sm text-xs">F</div>
                    AIM PLATFORM
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-[#050505] border-r border-stone-800 flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:static md:h-screen sticky top-0
      `}>
                <div className="p-8 border-b border-stone-800 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 text-white font-sans font-bold text-xl">
                            <div className="w-8 h-8 relative flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-[1.5px] border-fluency-neon rounded-lg shadow-[0_0_10px_#CCFF00,0_0_20px_rgba(204,255,0,0.8)]"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 m-auto w-5 h-5 border-[1.5px] border-fluency-neon rounded opacity-90 shadow-[0_0_10px_#CCFF00,0_0_20px_rgba(204,255,0,0.5)]"
                                />
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-white z-10">F</div>
                            </div>
                            FLUENCY
                        </div>
                        <div className="mt-2 text-[10px] text-stone-500 uppercase tracking-widest font-mono pl-11">AIM Admin Access</div>
                    </div>
                    <button className="md:hidden text-stone-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem tool="dashboard" label="Overview" icon={LayoutDashboard} />
                    <NavItem tool="campaigns" label="Campaigns" icon={Briefcase} />
                    <NavItem tool="database" label="Creator Database" icon={Users} />
                    <NavItem tool="dashboard" label="Overview" icon={LayoutDashboard} />
                    <NavItem tool="hub" label="Influencer Hub" icon={Users} extra={<span className="text-[9px] bg-fluency-neon text-black px-1.5 rounded ml-auto font-mono font-bold">NEW</span>} />
                    <NavItem tool="campaigns" label="Legacy Campaigns" icon={Briefcase} />
                    <NavItem tool="database" label="Legacy Database" icon={Users} />
                    <NavItem tool="inbox" label="Messages" icon={MessageSquare} />

                    <div className="pt-6 pb-2 px-4 text-xs font-bold text-stone-600 uppercase tracking-widest flex items-center gap-2 font-mono">
                        <Cpu size={12} /> The Strategist
                    </div>

                    <NavItem tool="leads" label="Verification & Strategy" icon={Scan} extra={<span className="text-[9px] bg-stone-800 px-1.5 rounded ml-auto text-stone-400 font-mono">Hunter</span>} />
                    <NavItem tool="detector" label="Authenticity Scanner" icon={ShieldAlert} extra={<span className="text-[9px] bg-stone-800 px-1.5 rounded ml-auto text-stone-400 font-mono">Detective</span>} />
                    <NavItem tool="matchmaker" label="Precision Matching" icon={Globe} />
                    <NavItem tool="aicara" label="Client Automation" icon={Bot} extra={<span className="text-[9px] bg-fluency-neon text-black px-1.5 rounded ml-auto font-mono font-bold">CARA</span>} />

                    <div className="pt-6 pb-2 px-4 text-xs font-bold text-stone-600 uppercase tracking-widest flex items-center gap-2 font-mono">
                        <Sparkles size={12} /> AI Tools
                    </div>
                    <NavItem tool="wingman" label="Wingman" icon={Sparkles} extra={<span className="text-[9px] bg-purple-900/50 text-purple-300 px-1.5 rounded ml-auto font-mono">Gemini</span>} />
                </nav>

                <div className="p-4 border-t border-stone-800">
                    <button onClick={onLogout} className="w-full flex items-center gap-2 text-stone-500 hover:text-red-400 text-sm px-4 py-2 transition-colors font-sans">
                        <LogOut size={16} /> Logout Securely
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-12 bg-[#050505] min-h-screen overflow-x-hidden w-full">

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTool}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTool === 'dashboard' && (
                            <div className="space-y-8 animate-fade-in pb-12">
                                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-sans font-bold text-white mb-2">Command Center</h1>
                                        <p className="text-stone-400 font-body">Agent Status: <span className="text-green-400 font-mono">4/4 ACTIVE</span></p>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto bg-[#111] p-4 md:p-0 rounded-xl md:bg-transparent">
                                        <div className="text-left md:text-right flex-1 md:flex-auto">
                                            <div className="text-2xl md:text-3xl font-mono text-fluency-neon">$124.5k</div>
                                            <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">MoM Revenue</div>
                                        </div>
                                        <div className="text-left md:text-right pl-4 border-l border-stone-800 flex-1 md:flex-auto">
                                            <div className="text-2xl md:text-3xl font-mono text-white">8.4M</div>
                                            <div className="text-xs text-stone-500 uppercase tracking-widest font-mono">Total Reach</div>
                                        </div>
                                    </div>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    <StatCard title="Verified Influencers" value="842" trend="+12%" icon={Users} />
                                    <StatCard title="Fraud Prevented" value="48" trend="-5%" icon={ShieldAlert} />
                                    <StatCard title="Active Campaigns" value="12" trend="+2" icon={Briefcase} />
                                    <StatCard title="Pending Leads" value="6" trend="+4" icon={Star} />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Activity Feed */}
                                    <div className="p-6 bg-[#1C1C1C] rounded-xl border border-stone-800">
                                        <h3 className="text-white font-sans font-bold mb-6">Agent Logs</h3>
                                        <div className="space-y-6">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="flex gap-4 items-start">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-fluency-neon shadow-[0_0_5px_rgba(204,255,0,0.5)]"></div>
                                                    <div>
                                                        <p className="text-sm text-stone-300 font-body">
                                                            <span className="font-bold text-white">The Matchmaker</span> paired <span className="text-fluency-neon">@sarahj_style</span> with <span className="text-white">Urban Wear</span> based on 98% AQS match.
                                                        </p>
                                                        <span className="text-xs text-stone-600 font-mono">timestamp: 16:2{i} PM</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Revenue Chart Placeholder */}
                                    <div className="p-6 bg-[#1C1C1C] rounded-xl border border-stone-800 flex flex-col items-center justify-center text-center min-h-[200px]">
                                        <div className="p-4 bg-stone-900 rounded-full mb-4">
                                            <TrendingUp size={24} className="text-stone-500" />
                                        </div>
                                        <h3 className="text-stone-300 font-medium font-sans">Predictive ROI Engine</h3>
                                        <p className="text-stone-600 text-sm mt-2 max-w-xs font-body">AI Agents are analyzing global spend to forecast Q4 results.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTool === 'campaigns' && <CampaignsPage />}
                        {activeTool === 'database' && <DatabasePage />}
                        {activeTool === 'inbox' && <InboxPage />}
                        {activeTool === 'detector' && <DetectorTool />}
                        {activeTool === 'matchmaker' && <MatchmakerTool />}
                        {activeTool === 'leads' && <LeadsTool />}
                        {activeTool === 'aicara' && <AICaraPage />}
                        {activeTool === 'wingman' && <WingmanPage />}
                        {activeTool === 'hub' && (
                            <InfluencerHub
                                influencers={influencers}
                                setInfluencers={setInfluencers}
                                campaigns={campaigns}
                                setCampaigns={setCampaigns}
                                onOpenClientPortal={onOpenClientPortal}
                            />
                        )}

                    </motion.div>
                </AnimatePresence>

            </main>
        </div>
    );
};