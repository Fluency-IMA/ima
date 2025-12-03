import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, DollarSign, Users, Globe, Briefcase } from 'lucide-react';
import { Campaign, Influencer, CampaignInfluencer } from '../types';

interface ClientCampaignViewProps {
    campaign: Campaign;
    influencers: Influencer[];
    onUpdateStatus: (campaignId: number, influencerId: string, status: 'Approved' | 'Rejected', notes?: string) => void;
}

export const ClientCampaignView: React.FC<ClientCampaignViewProps> = ({ campaign, influencers, onUpdateStatus }) => {
    const [notes, setNotes] = useState<{ [key: string]: string }>({});

    // Helper to get full influencer details
    const getInfluencerDetails = (id: string) => influencers.find(inf => inf.id === id);

    const handleNoteChange = (id: string, value: string) => {
        setNotes(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0F0F0F] text-stone-900 dark:text-white font-body p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-block px-3 py-1 bg-fluency-neon/10 text-fluency-neon border border-fluency-neon/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                        Client Portal
                    </div>
                    <h1 className="text-3xl md:text-5xl font-sans font-bold mb-4">{campaign.title}</h1>
                    <p className="text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
                        Review the selected influencers for your campaign. Approve or reject candidates and provide feedback for our team.
                    </p>
                </div>

                {/* Influencer List */}
                <div className="grid grid-cols-1 gap-6">
                    {campaign.assignedInfluencers?.map((assignment) => {
                        const inf = getInfluencerDetails(assignment.influencerId);
                        if (!inf) return null;

                        return (
                            <motion.div
                                key={inf.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white dark:bg-[#1C1C1C] border rounded-xl p-6 md:p-8 transition-all ${assignment.status === 'Approved' ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' :
                                        assignment.status === 'Rejected' ? 'border-red-500/50 opacity-75' :
                                            'border-stone-200 dark:border-stone-800'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Profile Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center justify-center text-2xl font-bold">
                                                {inf.avatar || inf.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold font-sans">{inf.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-stone-500">
                                                    <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 font-mono uppercase text-xs">
                                                        {inf.tier}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{inf.niche}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="p-3 bg-stone-50 dark:bg-black rounded-lg border border-stone-100 dark:border-stone-800">
                                                <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Channel</div>
                                                <a href={inf.channelLink} target="_blank" rel="noreferrer" className="text-fluency-neon hover:underline truncate block font-mono text-sm">
                                                    {inf.channelLink}
                                                </a>
                                            </div>
                                            <div className="p-3 bg-stone-50 dark:bg-black rounded-lg border border-stone-100 dark:border-stone-800">
                                                <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Est. Price</div>
                                                <div className="font-mono text-sm">{inf.pricePerDeliverable}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="w-full md:w-80 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-stone-200 dark:border-stone-800 pt-6 md:pt-0 md:pl-8">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => onUpdateStatus(campaign.id, inf.id, 'Approved', notes[inf.id])}
                                                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${assignment.status === 'Approved'
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-stone-100 dark:bg-stone-800 hover:bg-green-500/20 hover:text-green-500'
                                                    }`}
                                            >
                                                <CheckCircle size={18} /> Approve
                                            </button>
                                            <button
                                                onClick={() => onUpdateStatus(campaign.id, inf.id, 'Rejected', notes[inf.id])}
                                                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${assignment.status === 'Rejected'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-stone-100 dark:bg-stone-800 hover:bg-red-500/20 hover:text-red-500'
                                                    }`}
                                            >
                                                <XCircle size={18} /> Reject
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Feedback / Notes</label>
                                            <textarea
                                                value={notes[inf.id] || assignment.clientNotes || ''}
                                                onChange={(e) => handleNoteChange(inf.id, e.target.value)}
                                                placeholder="Add notes for the agency..."
                                                className="w-full h-24 bg-stone-50 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-lg p-3 text-sm focus:border-fluency-neon outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
