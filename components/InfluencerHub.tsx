import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Upload, Plus, Search, MapPin, Mail, DollarSign,
    MoreHorizontal, Share2, Link, CheckCircle, X, FileText,
    Briefcase
} from 'lucide-react';
import { Influencer, Campaign } from '../types';

interface InfluencerHubProps {
    influencers: Influencer[];
    setInfluencers: React.Dispatch<React.SetStateAction<Influencer[]>>;
    campaigns: Campaign[];
    setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
    onOpenClientPortal: (id: number) => void;
}

export const InfluencerHub: React.FC<InfluencerHubProps> = ({
    influencers,
    setInfluencers,
    campaigns,
    setCampaigns,
    onOpenClientPortal
}) => {
    const [activeTab, setActiveTab] = useState<'database' | 'campaigns' | 'calculator'>('database');

    // CSV Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Campaign Creation State
    const [showCreateCampaign, setShowCreateCampaign] = useState(false);
    const [newCampaignTitle, setNewCampaignTitle] = useState('');
    const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);

    // Add Influencer State
    const [showAddInfluencer, setShowAddInfluencer] = useState(false);
    const [newInfluencer, setNewInfluencer] = useState<Partial<Influencer>>({
        name: '', channelLink: '', niche: '', tier: 'Micro', pricePerDeliverable: '', contactInfo: '', shippingAddress: ''
    });

    // Calculator State
    const [viewCountsInput, setViewCountsInput] = useState('');
    const [selectedCpm, setSelectedCpm] = useState<number | 'custom'>(25);
    const [customCpm, setCustomCpm] = useState('');
    const [calculationResult, setCalculationResult] = useState<{ avgViews: number, estimatedPrice: number } | null>(null);

    // Handlers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Simple CSV Parser (Assumes: Name,Link,Niche,Tier,Price,Contact,Address)
            const lines = text.split('\n');
            const newInfluencers: Influencer[] = [];

            lines.slice(1).forEach((line, idx) => {
                const cols = line.split(',');
                if (cols.length >= 7) {
                    newInfluencers.push({
                        id: `csv-${Date.now()}-${idx}`,
                        name: cols[0].trim(),
                        channelLink: cols[1].trim(),
                        niche: cols[2].trim(),
                        tier: cols[3].trim() as any,
                        pricePerDeliverable: cols[4].trim(),
                        contactInfo: cols[5].trim(),
                        shippingAddress: cols[6].trim(),
                        avatar: cols[0].trim().charAt(0).toUpperCase()
                    });
                }
            });

            setInfluencers(prev => [...prev, ...newInfluencers]);
            alert(`Successfully imported ${newInfluencers.length} influencers.`);
        };
        reader.readAsText(file);
    };

    const handleCreateCampaign = () => {
        if (!newCampaignTitle) return;

        const newCampaign: Campaign = {
            id: Date.now(),
            title: newCampaignTitle,
            brand: 'Internal Brand', // Default for now
            status: 'Draft',
            influencers: selectedInfluencers.length,
            budget: 'Negotiable',
            progress: 0,
            assignedInfluencers: selectedInfluencers.map(id => ({
                influencerId: id,
                status: 'Pending'
            }))
        };

        setCampaigns(prev => [newCampaign, ...prev]);
        setShowCreateCampaign(false);
        setNewCampaignTitle('');
        setSelectedInfluencers([]);
    };

    const handleAddInfluencer = () => {
        if (!newInfluencer.name || !newInfluencer.channelLink) return;

        const influencer: Influencer = {
            id: Date.now().toString(),
            name: newInfluencer.name || 'Unknown',
            channelLink: newInfluencer.channelLink || '',
            niche: newInfluencer.niche || 'General',
            tier: newInfluencer.tier as any || 'Micro',
            pricePerDeliverable: newInfluencer.pricePerDeliverable || 'Negotiable',
            contactInfo: newInfluencer.contactInfo || '',
            shippingAddress: newInfluencer.shippingAddress || '',
            avatar: newInfluencer.name?.charAt(0).toUpperCase() || '?'
        };

        setInfluencers(prev => [influencer, ...prev]);
        setShowAddInfluencer(false);
        setNewInfluencer({ name: '', channelLink: '', niche: '', tier: 'Micro', pricePerDeliverable: '', contactInfo: '', shippingAddress: '' });
    };

    const generateShareLink = (campaignId: number) => {
        // In a real app, this would copy a URL. For this demo, we'll open the portal.
        const link = `https://fluency.ai/share/campaign/${campaignId}?token=${Math.random().toString(36).substring(7)}`;
        navigator.clipboard.writeText(link);
        alert('Shareable Client Link copied to clipboard! Opening Client View Simulation...');
        onOpenClientPortal(campaignId);
    };

    const handleCalculatePrice = () => {
        // Parse input
        const views = viewCountsInput.split(/[\n,]+/).map(v => parseInt(v.trim())).filter(n => !isNaN(n));

        if (views.length === 0) return;

        let finalViews = views;
        // Remove outliers if we have enough data (more than 2)
        if (views.length > 2) {
            views.sort((a, b) => a - b);
            finalViews = views.slice(1, -1); // Remove lowest and highest
        }

        const sum = finalViews.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / finalViews.length);

        const cpm = selectedCpm === 'custom' ? parseFloat(customCpm) : selectedCpm;
        if (isNaN(cpm)) return;

        const price = (avg / 1000) * cpm;

        setCalculationResult({
            avgViews: avg,
            estimatedPrice: price
        });
    };

    return (
        <div className="animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-sans font-bold text-white mb-2">Influencer Hub</h2>
                    <p className="text-stone-400 text-sm md:text-base font-body">Master Database & Campaign Management</p>
                </div>
                <div className="flex bg-stone-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'database' ? 'bg-fluency-neon text-black' : 'text-stone-400 hover:text-white'}`}
                    >
                        Master Database
                    </button>
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'campaigns' ? 'bg-fluency-neon text-black' : 'text-stone-400 hover:text-white'}`}
                    >
                        Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('calculator')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'calculator' ? 'bg-fluency-neon text-black' : 'text-stone-400 hover:text-white'}`}
                    >
                        Calculator
                    </button>
                </div>
            </div>

            {/* DATABASE TAB */}
            {activeTab === 'database' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-2.5 text-stone-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search influencers..."
                                className="w-full bg-[#1C1C1C] border border-stone-800 rounded-lg pl-10 pr-4 py-2 text-white focus:border-fluency-neon outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept=".csv"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-stone-800 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-stone-700 transition-colors"
                            >
                                <Upload size={16} /> Import CSV
                            </button>
                            <button
                                onClick={() => setShowAddInfluencer(true)}
                                className="px-4 py-2 bg-white text-black font-bold rounded-lg flex items-center gap-2 hover:bg-fluency-neon transition-colors"
                            >
                                <Plus size={16} /> Add Manually
                            </button>
                        </div>
                    </div>

                    {/* Add Influencer Modal */}
                    {showAddInfluencer && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1C1C1C] border border-stone-800 p-6 rounded-xl mb-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-white">Add New Influencer</h4>
                                <button onClick={() => setShowAddInfluencer(false)}><X className="text-stone-500 hover:text-white" /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Name"
                                    value={newInfluencer.name}
                                    onChange={e => setNewInfluencer({ ...newInfluencer, name: e.target.value })}
                                    className="bg-black border border-stone-800 rounded px-3 py-2 text-white"
                                />
                                <input
                                    placeholder="Channel Link"
                                    value={newInfluencer.channelLink}
                                    onChange={e => setNewInfluencer({ ...newInfluencer, channelLink: e.target.value })}
                                    className="bg-black border border-stone-800 rounded px-3 py-2 text-white"
                                />
                                <input
                                    placeholder="Niche"
                                    value={newInfluencer.niche}
                                    onChange={e => setNewInfluencer({ ...newInfluencer, niche: e.target.value })}
                                    className="bg-black border border-stone-800 rounded px-3 py-2 text-white"
                                />
                                <select
                                    value={newInfluencer.tier}
                                    onChange={e => setNewInfluencer({ ...newInfluencer, tier: e.target.value as any })}
                                    className="bg-black border border-stone-800 rounded px-3 py-2 text-white"
                                >
                                    <option value="Nano">Nano</option>
                                    <option value="Micro">Micro</option>
                                    <option value="Mid-Tier">Mid-Tier</option>
                                    <option value="Macro">Macro</option>
                                    <option value="Mega">Mega</option>
                                </select>
                                <input
                                    placeholder="Price / Post"
                                    value={newInfluencer.pricePerDeliverable}
                                    onChange={e => setNewInfluencer({ ...newInfluencer, pricePerDeliverable: e.target.value })}
                                    className="bg-black border border-stone-800 rounded px-3 py-2 text-white"
                                />
                                <input
                                    placeholder="Contact Info"
                                    value={newInfluencer.contactInfo}
                                    onChange={e => setNewInfluencer({ ...newInfluencer, contactInfo: e.target.value })}
                                    className="bg-black border border-stone-800 rounded px-3 py-2 text-white"
                                />
                                <input
                                    placeholder="Shipping Address"
                                    value={newInfluencer.shippingAddress}
                                    onChange={e => setNewInfluencer({ ...newInfluencer, shippingAddress: e.target.value })}
                                    className="bg-black border border-stone-800 rounded px-3 py-2 text-white md:col-span-2"
                                />
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleAddInfluencer}
                                    className="px-6 py-2 bg-fluency-neon text-black font-bold rounded hover:opacity-90"
                                >
                                    Save Record
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <div className="bg-[#1C1C1C] border border-stone-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-900 text-stone-500 text-xs uppercase tracking-wider font-mono border-b border-stone-800">
                                    <th className="p-4">Influencer</th>
                                    <th className="p-4">Niche</th>
                                    <th className="p-4">Tier</th>
                                    <th className="p-4">Price / Post</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-stone-300 font-body">
                                {influencers.map((inf) => (
                                    <tr key={inf.id} className="border-b border-stone-800 hover:bg-stone-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center font-bold text-white">
                                                    {inf.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{inf.name}</div>
                                                    <a href={inf.channelLink} target="_blank" rel="noreferrer" className="text-xs text-fluency-neon hover:underline truncate max-w-[150px] block">
                                                        {inf.channelLink}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">{inf.niche}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-stone-800 rounded border border-stone-700 text-xs font-mono">
                                                {inf.tier}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-white">{inf.pricePerDeliverable}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="flex items-center gap-1"><Mail size={10} /> {inf.contactInfo}</span>
                                                <span className="flex items-center gap-1 text-stone-500"><MapPin size={10} /> {inf.shippingAddress}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button className="p-2 hover:bg-stone-700 rounded transition-colors text-stone-400 hover:text-white">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Active Campaigns</h3>
                        <button
                            onClick={() => setShowCreateCampaign(true)}
                            className="px-4 py-2 bg-fluency-neon text-black font-bold rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Plus size={16} /> Create Campaign
                        </button>
                    </div>

                    {/* Create Campaign Modal (Inline for simplicity) */}
                    {showCreateCampaign && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1C1C1C] border border-stone-800 p-6 rounded-xl mb-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-white">New Campaign Setup</h4>
                                <button onClick={() => setShowCreateCampaign(false)}><X className="text-stone-500 hover:text-white" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Campaign Title</label>
                                    <input
                                        type="text"
                                        value={newCampaignTitle}
                                        onChange={(e) => setNewCampaignTitle(e.target.value)}
                                        className="w-full bg-black border border-stone-800 rounded-lg px-4 py-3 text-white focus:border-fluency-neon outline-none"
                                        placeholder="e.g. Winter Product Launch"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Assign Influencers</label>
                                    <div className="max-h-40 overflow-y-auto bg-black border border-stone-800 rounded-lg p-2 space-y-1">
                                        {influencers.map(inf => (
                                            <div
                                                key={inf.id}
                                                onClick={() => {
                                                    if (selectedInfluencers.includes(inf.id)) {
                                                        setSelectedInfluencers(prev => prev.filter(id => id !== inf.id));
                                                    } else {
                                                        setSelectedInfluencers(prev => [...prev, inf.id]);
                                                    }
                                                }}
                                                className={`p-2 rounded cursor-pointer flex items-center justify-between text-sm ${selectedInfluencers.includes(inf.id) ? 'bg-fluency-neon/20 text-fluency-neon border border-fluency-neon/50' : 'text-stone-400 hover:bg-stone-900'}`}
                                            >
                                                <span>{inf.name}</span>
                                                {selectedInfluencers.includes(inf.id) && <CheckCircle size={14} />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleCreateCampaign}
                                        disabled={!newCampaignTitle}
                                        className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-fluency-neon disabled:opacity-50 transition-colors"
                                    >
                                        Launch Campaign
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map(campaign => (
                            <motion.div
                                key={campaign.id}
                                layout
                                className="bg-[#1C1C1C] border border-stone-800 rounded-xl p-6 hover:border-fluency-neon transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-stone-800 rounded-lg text-fluency-neon">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="px-2 py-1 bg-stone-800 rounded text-xs text-stone-400 font-mono uppercase">
                                        {campaign.status}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{campaign.title}</h3>
                                <p className="text-stone-500 text-sm mb-6">{campaign.brand}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Influencers</span>
                                        <span className="text-white font-mono">{campaign.assignedInfluencers?.length || campaign.influencers}</span>
                                    </div>

                                    {/* Status Breakdown */}
                                    <div className="flex gap-1 h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                                        {(() => {
                                            const total = campaign.assignedInfluencers?.length || 0;
                                            if (total === 0) return <div className="w-full bg-stone-800" />;
                                            const approved = campaign.assignedInfluencers?.filter(i => i.status === 'Approved').length || 0;
                                            const rejected = campaign.assignedInfluencers?.filter(i => i.status === 'Rejected').length || 0;
                                            const pending = total - approved - rejected;

                                            return (
                                                <>
                                                    <div style={{ width: `${(approved / total) * 100}%` }} className="bg-green-500" />
                                                    <div style={{ width: `${(rejected / total) * 100}%` }} className="bg-red-500" />
                                                    <div style={{ width: `${(pending / total) * 100}%` }} className="bg-stone-600" />
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-stone-500 font-mono uppercase">
                                        <span>Status</span>
                                        <div className="flex gap-2">
                                            <span className="text-green-500">{campaign.assignedInfluencers?.filter(i => i.status === 'Approved').length} App</span>
                                            <span className="text-red-500">{campaign.assignedInfluencers?.filter(i => i.status === 'Rejected').length} Rej</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Budget</span>
                                        <span className="text-white font-mono">{campaign.budget}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-stone-800 flex gap-2">
                                    <button className="flex-1 py-2 bg-stone-800 text-white text-sm font-bold rounded hover:bg-stone-700 transition-colors">
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => generateShareLink(campaign.id)}
                                        className="p-2 bg-white text-black rounded hover:bg-fluency-neon transition-colors"
                                        title="Copy Shareable Link"
                                    >
                                        <Link size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* CALCULATOR TAB */}
            {activeTab === 'calculator' && (
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="bg-[#1C1C1C] border border-stone-800 rounded-xl p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <DollarSign className="text-fluency-neon" /> Pricing Calculator
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">
                                    Past Video View Counts
                                </label>
                                <p className="text-xs text-stone-400 mb-2">
                                    Enter list separated by commas or new lines. Highest and lowest values will be automatically removed.
                                </p>
                                <textarea
                                    value={viewCountsInput}
                                    onChange={(e) => setViewCountsInput(e.target.value)}
                                    placeholder="e.g.&#10;15000&#10;23000&#10;12000&#10;50000"
                                    className="w-full h-32 bg-black border border-stone-800 rounded-lg p-4 text-white font-mono focus:border-fluency-neon outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">
                                        Target CPM ($)
                                    </label>
                                    <select
                                        value={selectedCpm}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedCpm(val === 'custom' ? 'custom' : parseFloat(val));
                                        }}
                                        className="w-full bg-black border border-stone-800 rounded-lg px-4 py-3 text-white focus:border-fluency-neon outline-none"
                                    >
                                        <option value={10}>$10 CPM (Standard)</option>
                                        <option value={25}>$25 CPM (Premium)</option>
                                        <option value={50}>$50 CPM (Elite)</option>
                                        <option value={100}>$100 CPM (Celebrity)</option>
                                        <option value="custom">Custom CPM</option>
                                    </select>
                                </div>
                                {selectedCpm === 'custom' && (
                                    <div>
                                        <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">
                                            Custom CPM Value
                                        </label>
                                        <input
                                            type="number"
                                            value={customCpm}
                                            onChange={(e) => setCustomCpm(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-black border border-stone-800 rounded-lg px-4 py-3 text-white focus:border-fluency-neon outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCalculatePrice}
                                className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-fluency-neon transition-colors"
                            >
                                Calculate Price
                            </button>
                        </div>
                    </div>

                    {calculationResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center"
                        >
                            <div className="grid grid-cols-2 gap-8 mb-6">
                                <div>
                                    <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Avg Views (Adj)</div>
                                    <div className="text-2xl font-mono text-white">{calculationResult.avgViews.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Applied CPM</div>
                                    <div className="text-2xl font-mono text-white">
                                        ${selectedCpm === 'custom' ? customCpm : selectedCpm}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-stone-800">
                                <div className="text-sm text-stone-400 uppercase tracking-widest mb-2">Estimated Price Per Post</div>
                                <div className="text-5xl font-bold text-fluency-neon font-sans">
                                    ${calculationResult.estimatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

