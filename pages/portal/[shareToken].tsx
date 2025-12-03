import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CampaignService, Campaign, CampaignInfluencer } from '../../services/campaign-service';
import { CheckCircle, XCircle, MessageSquare, ExternalLink, FileText, X, Download } from 'lucide-react';

export default function ClientPortal() {
    const router = useRouter();
    const { shareToken } = router.query;
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);

    const [notes, setNotes] = useState<{ [key: string]: string }>({});

    // Contract Generation State
    const [showContractModal, setShowContractModal] = useState(false);
    const [selectedInfluencerForContract, setSelectedInfluencerForContract] = useState<CampaignInfluencer | null>(null);
    const [generatingContract, setGeneratingContract] = useState(false);
    const [contractDetails, setContractDetails] = useState({
        clientName: '',
        startDate: '',
        paymentTerms: '50% upfront, 50% upon completion',
        campaignScope: '',
        usageTerm: '6 months',
        terminationClause: '7 days written notice'
    });

    useEffect(() => {
        if (shareToken) {
            loadCampaign();
        }
    }, [shareToken]);

    const loadCampaign = async () => {
        try {
            const data = await CampaignService.getCampaignByToken(shareToken as string);
            setCampaign(data);
            // Initialize notes
            if (data) {
                const initialNotes: { [key: string]: string } = {};
                data.influencers.forEach(inf => {
                    if (inf.clientNotes) initialNotes[inf.influencerId] = inf.clientNotes;
                });
                setNotes(initialNotes);
            }
        } catch (error) {
            console.error('Failed to load campaign', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (influencerId: string, status: 'Approved' | 'Rejected') => {
        if (!campaign) return;

        try {
            await CampaignService.updateInfluencerStatus(
                campaign.id!,
                influencerId,
                status,
                notes[influencerId] || ''
            );

            // Optimistic update
            setCampaign(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    influencers: prev.influencers.map(inf =>
                        inf.influencerId === influencerId
                            ? { ...inf, status, clientNotes: notes[influencerId] || '' }
                            : inf
                    )
                };
            });
        } catch (error) {
            alert('Error updating status. Please try again.');
        }
    };

    const handleOpenContractModal = (influencer: CampaignInfluencer) => {
        setSelectedInfluencerForContract(influencer);
        setContractDetails(prev => ({
            ...prev,
            clientName: campaign?.name || '',
            campaignScope: `Deliverables for ${influencer.niche} campaign on ${influencer.channelLink}`
        }));
        setShowContractModal(true);
    };

    const handleGenerateContract = async () => {
        if (!selectedInfluencerForContract || !campaign) return;

        setGeneratingContract(true);
        try {
            const response = await fetch('/api/ai/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...contractDetails,
                    influencerName: selectedInfluencerForContract.name,
                    feeAmount: `$${selectedInfluencerForContract.price.toLocaleString()}`
                })
            });

            const data = await response.json();

            if (data.success && data.contract) {
                await CampaignService.updateInfluencerStatus(
                    campaign.id!,
                    selectedInfluencerForContract.influencerId,
                    'Approved',
                    notes[selectedInfluencerForContract.influencerId] || ''
                );

                // Save the contract
                await CampaignService.updateInfluencerContract(
                    campaign.id!,
                    selectedInfluencerForContract.influencerId,
                    data.contract
                );

                // Update local state
                setCampaign(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        influencers: prev.influencers.map(inf =>
                            inf.influencerId === selectedInfluencerForContract.influencerId
                                ? { ...inf, contract: data.contract, contractCreatedAt: new Date().toISOString() }
                                : inf
                        )
                    };
                });

                setShowContractModal(false);
                alert('Contract generated successfully!');
            } else {
                alert('Failed to generate contract: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error generating contract:', error);
            alert('An error occurred while generating the contract.');
        } finally {
            setGeneratingContract(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                Loading campaign...
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                Campaign not found or link expired.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="bg-[#0A0A0A] border-b border-stone-800 py-6">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Campaign Review: {campaign.name}</h1>
                            <p className="text-stone-400 text-sm">Please review the selected influencers below.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-fluency-neon font-bold text-xl">FLUENCY</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 gap-6">
                    {campaign.influencers.map((inf) => (
                        <div key={inf.influencerId} className="bg-[#0A0A0A] border border-stone-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                            {/* Influencer Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold">{inf.name}</h3>
                                    <span className="text-xl font-bold text-fluency-neon">${inf.price.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-stone-400 mb-4">
                                    <span className="bg-stone-800 px-2 py-1 rounded">{inf.niche}</span>
                                    <a
                                        href={inf.channelLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 text-blue-400 hover:underline"
                                    >
                                        View Channel <ExternalLink size={12} />
                                    </a>
                                </div>

                                {/* Status Badge (if already decided) */}
                                {inf.status !== 'Pending' && (
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold mb-4 ${inf.status === 'Approved' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                                        }`}>
                                        {inf.status === 'Approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        {inf.status}
                                    </div>
                                )}
                            </div>

                            {/* Action Area */}
                            <div className="w-full md:w-80 bg-stone-900/50 rounded-lg p-4 border border-stone-800">
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
                                    Feedback / Notes
                                </label>
                                <textarea
                                    value={notes[inf.influencerId] || ''}
                                    onChange={(e) => setNotes({ ...notes, [inf.influencerId]: e.target.value })}
                                    placeholder="Add a note (optional)..."
                                    className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-sm text-white mb-4 h-20 focus:border-fluency-neon outline-none resize-none"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleAction(inf.influencerId, 'Rejected')}
                                        className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${inf.status === 'Rejected'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-stone-800 text-stone-400 hover:bg-red-900/30 hover:text-red-400'
                                            }`}
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(inf.influencerId, 'Approved')}
                                        className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${inf.status === 'Approved'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-stone-800 text-stone-400 hover:bg-green-900/30 hover:text-green-400'
                                            }`}
                                    >
                                        <CheckCircle size={18} />
                                        Approve
                                    </button>
                                </div>

                                {inf.status === 'Approved' && (
                                    <div className="mt-4 pt-4 border-t border-stone-800">
                                        {inf.contract ? (
                                            <div className="flex items-center justify-between bg-stone-800/50 p-3 rounded-lg border border-stone-700">
                                                <div className="flex items-center gap-2 text-green-400">
                                                    <FileText size={16} />
                                                    <span className="text-sm font-medium">Contract Ready</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const blob = new Blob([inf.contract!], { type: 'text/markdown' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `${inf.name.replace(/\s+/g, '_')}_Contract.md`;
                                                        a.click();
                                                    }}
                                                    className="text-stone-400 hover:text-white"
                                                    title="Download Contract"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenContractModal(inf)}
                                                className="w-full flex items-center justify-center gap-2 py-2 bg-fluency-neon/10 text-fluency-neon border border-fluency-neon/20 rounded-lg hover:bg-fluency-neon/20 transition-all font-bold text-sm"
                                            >
                                                <FileText size={16} />
                                                Generate Contract
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Contract Generation Modal */}
            {showContractModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] border border-stone-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-[#0A0A0A] z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="text-fluency-neon" />
                                Generate Contract
                            </h2>
                            <button
                                onClick={() => setShowContractModal(false)}
                                className="text-stone-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-stone-900/50 p-4 rounded-lg border border-stone-800 mb-4">
                                <div className="text-sm text-stone-400">Influencer</div>
                                <div className="font-bold text-lg">{selectedInfluencerForContract?.name}</div>
                                <div className="text-sm text-stone-400 mt-2">Fee Amount</div>
                                <div className="font-bold text-fluency-neon">${selectedInfluencerForContract?.price.toLocaleString()}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Client Name</label>
                                    <input
                                        type="text"
                                        value={contractDetails.clientName}
                                        onChange={e => setContractDetails({ ...contractDetails, clientName: e.target.value })}
                                        className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-sm focus:border-fluency-neon outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={contractDetails.startDate}
                                        onChange={e => setContractDetails({ ...contractDetails, startDate: e.target.value })}
                                        className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-sm focus:border-fluency-neon outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Payment Terms</label>
                                <input
                                    type="text"
                                    value={contractDetails.paymentTerms}
                                    onChange={e => setContractDetails({ ...contractDetails, paymentTerms: e.target.value })}
                                    className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-sm focus:border-fluency-neon outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Campaign Scope</label>
                                <textarea
                                    value={contractDetails.campaignScope}
                                    onChange={e => setContractDetails({ ...contractDetails, campaignScope: e.target.value })}
                                    className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-sm focus:border-fluency-neon outline-none h-24 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Usage Term</label>
                                    <input
                                        type="text"
                                        value={contractDetails.usageTerm}
                                        onChange={e => setContractDetails({ ...contractDetails, usageTerm: e.target.value })}
                                        className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-sm focus:border-fluency-neon outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Termination</label>
                                    <input
                                        type="text"
                                        value={contractDetails.terminationClause}
                                        onChange={e => setContractDetails({ ...contractDetails, terminationClause: e.target.value })}
                                        className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-sm focus:border-fluency-neon outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-stone-800 bg-stone-900/30 sticky bottom-0">
                            <button
                                onClick={handleGenerateContract}
                                disabled={generatingContract}
                                className="w-full py-3 bg-fluency-neon text-black font-bold rounded-lg hover:bg-fluency-neon/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {generatingContract ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <FileText size={18} />
                                        Generate Contract Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
