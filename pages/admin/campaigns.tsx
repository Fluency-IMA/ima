import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CampaignService, Campaign, CampaignInfluencer } from '../../services/campaign-service';
import { InfluencerService, Influencer } from '../../services/influencer-service';
import { Plus, Link as LinkIcon, Trash2, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function CampaignManagement() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [allInfluencers, setAllInfluencers] = useState<Influencer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddInfluencerModal, setShowAddInfluencerModal] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [campaignsData, influencersData] = await Promise.all([
                CampaignService.getCampaigns(),
                InfluencerService.getInfluencers()
            ]);
            setCampaigns(campaignsData);
            setAllInfluencers(influencersData);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaignName.trim()) return;

        try {
            await CampaignService.createCampaign(newCampaignName);
            await loadData();
            setShowCreateModal(false);
            setNewCampaignName('');
        } catch (error) {
            alert('Error creating campaign');
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        if (confirm('Are you sure you want to delete this campaign?')) {
            try {
                await CampaignService.deleteCampaign(id);
                setCampaigns(prev => prev.filter(c => c.id !== id));
            } catch (error) {
                alert('Error deleting campaign');
            }
        }
    };

    const openAddInfluencerModal = (campaignId: string) => {
        setSelectedCampaignId(campaignId);
        setSelectedInfluencers([]);
        setShowAddInfluencerModal(true);
    };

    const handleAddInfluencers = async () => {
        if (!selectedCampaignId || selectedInfluencers.length === 0) return;

        const influencersToAdd: CampaignInfluencer[] = selectedInfluencers.map(id => {
            const inf = allInfluencers.find(i => i.id === id)!;
            return {
                influencerId: inf.id!,
                name: inf.name,
                channelLink: inf.channelLink,
                niche: inf.niche,
                price: inf.pricePerDeliverable,
                status: 'Pending'
            };
        });

        try {
            await CampaignService.addInfluencersToCampaign(selectedCampaignId, influencersToAdd);
            await loadData();
            setShowAddInfluencerModal(false);
        } catch (error) {
            alert('Error adding influencers');
        }
    };

    const copyShareLink = (token: string) => {
        const link = `${window.location.origin}/portal/${token}`;
        navigator.clipboard.writeText(link);
        alert('Client link copied to clipboard!');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle size={16} className="text-green-500" />;
            case 'Rejected': return <XCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-yellow-500" />;
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Campaigns</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={18} />
                    <span>New Campaign</span>
                </button>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="text-center text-stone-500">Loading...</div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center text-stone-500">No campaigns found</div>
                ) : (
                    campaigns.map(campaign => (
                        <div key={campaign.id} className="bg-[#0A0A0A] border border-stone-800 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{campaign.name}</h2>
                                    <div className="flex items-center gap-4 text-sm text-stone-400">
                                        <span>{campaign.influencers.length} Influencers</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${campaign.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-stone-800 text-stone-400'
                                            }`}>{campaign.status}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyShareLink(campaign.shareToken)}
                                        className="flex items-center gap-2 px-3 py-2 bg-stone-800 text-white rounded hover:bg-stone-700 transition-colors text-sm"
                                    >
                                        <LinkIcon size={16} />
                                        <span>Copy Client Link</span>
                                    </button>
                                    <button
                                        onClick={() => openAddInfluencerModal(campaign.id!)}
                                        className="flex items-center gap-2 px-3 py-2 bg-stone-800 text-white rounded hover:bg-stone-700 transition-colors text-sm"
                                    >
                                        <Users size={16} />
                                        <span>Add Influencers</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCampaign(campaign.id!)}
                                        className="p-2 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Influencer List */}
                            <div className="p-6">
                                {campaign.influencers.length === 0 ? (
                                    <p className="text-stone-500 text-sm">No influencers added yet.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="text-stone-500 border-b border-stone-800">
                                                <tr>
                                                    <th className="pb-3 font-medium">Influencer</th>
                                                    <th className="pb-3 font-medium">Status</th>
                                                    <th className="pb-3 font-medium">Client Notes</th>
                                                    <th className="pb-3 font-medium text-right">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-800">
                                                {campaign.influencers.map((inf, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-3 text-white">
                                                            <div>{inf.name}</div>
                                                            <div className="text-xs text-stone-500">{inf.niche}</div>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(inf.status)}
                                                                <span className={`
                                  ${inf.status === 'Approved' ? 'text-green-500' : ''}
                                  ${inf.status === 'Rejected' ? 'text-red-500' : ''}
                                  ${inf.status === 'Pending' ? 'text-yellow-500' : ''}
                                `}>{inf.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-stone-400 italic">
                                                            {inf.clientNotes || '-'}
                                                        </td>
                                                        <td className="py-3 text-right text-white">
                                                            ${inf.price.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] border border-stone-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Create New Campaign</h2>
                        <form onSubmit={handleCreateCampaign}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Campaign Name (e.g., Summer Launch 2025)"
                                value={newCampaignName}
                                onChange={e => setNewCampaignName(e.target.value)}
                                className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-white mb-4 focus:border-fluency-neon outline-none"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-stone-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Influencer Modal */}
            {showAddInfluencerModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] border border-stone-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <h2 className="text-xl font-bold text-white mb-4">Add Influencers to Campaign</h2>

                        <div className="flex-1 overflow-y-auto mb-4 border border-stone-800 rounded-lg">
                            {allInfluencers.map(inf => (
                                <label key={inf.id} className="flex items-center gap-3 p-3 hover:bg-stone-900 cursor-pointer border-b border-stone-800 last:border-0">
                                    <input
                                        type="checkbox"
                                        checked={selectedInfluencers.includes(inf.id!)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setSelectedInfluencers([...selectedInfluencers, inf.id!]);
                                            } else {
                                                setSelectedInfluencers(selectedInfluencers.filter(id => id !== inf.id));
                                            }
                                        }}
                                        className="w-4 h-4 accent-fluency-neon"
                                    />
                                    <div className="flex-1">
                                        <div className="text-white font-medium">{inf.name}</div>
                                        <div className="text-xs text-stone-500">{inf.niche} • {inf.followerTier}</div>
                                    </div>
                                    <div className="text-white font-bold">${inf.pricePerDeliverable.toLocaleString()}</div>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-stone-400 text-sm">
                                {selectedInfluencers.length} selected
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddInfluencerModal(false)}
                                    className="px-4 py-2 text-stone-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddInfluencers}
                                    disabled={selectedInfluencers.length === 0}
                                    className="px-4 py-2 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                                >
                                    Add Selected
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
