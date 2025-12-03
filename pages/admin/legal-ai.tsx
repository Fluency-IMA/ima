import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { FileText, Wand2, Copy, Download, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LegalAI() {
    const [loading, setLoading] = useState(false);
    const [contract, setContract] = useState('');
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        clientName: '',
        influencerName: '',
        feeAmount: '',
        paymentTerms: '',
        campaignScope: '',
        startDate: new Date().toISOString().split('T')[0],
        usageTerm: '',
        terminationClause: 'Standard 30-day written notice required.',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateContract = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/ai/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                setContract(data.contract);
            } else {
                alert('Error generating contract: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate contract.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(contract);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-100px)]">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <FileText className="text-fluency-neon" />
                            Legal AI Assistant
                        </h1>
                        <p className="text-stone-400">Generate influencer contracts instantly using AI.</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                    {/* Input Form */}
                    <div className="bg-[#0A0A0A] border border-stone-800 rounded-2xl p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Wand2 size={20} className="text-fluency-purple" />
                            Contract Details
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1">Client Name</label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#050505] border border-stone-800 rounded-lg px-4 py-2 text-white focus:border-fluency-neon outline-none"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1">Influencer Name</label>
                                    <input
                                        type="text"
                                        name="influencerName"
                                        value={formData.influencerName}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#050505] border border-stone-800 rounded-lg px-4 py-2 text-white focus:border-fluency-neon outline-none"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1">Fee Amount</label>
                                    <input
                                        type="text"
                                        name="feeAmount"
                                        value={formData.feeAmount}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#050505] border border-stone-800 rounded-lg px-4 py-2 text-white focus:border-fluency-neon outline-none"
                                        placeholder="e.g. $5,000 USD"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#050505] border border-stone-800 rounded-lg px-4 py-2 text-white focus:border-fluency-neon outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Payment Terms</label>
                                <input
                                    type="text"
                                    name="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#050505] border border-stone-800 rounded-lg px-4 py-2 text-white focus:border-fluency-neon outline-none"
                                    placeholder="e.g. 50% upfront, 50% on completion"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Campaign Scope</label>
                                <textarea
                                    name="campaignScope"
                                    value={formData.campaignScope}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full bg-[#050505] border border-stone-800 rounded-lg px-4 py-2 text-white focus:border-fluency-neon outline-none resize-none"
                                    placeholder="e.g. 1 Instagram Reel, 3 Stories, usage rights..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Usage Term</label>
                                <input
                                    type="text"
                                    name="usageTerm"
                                    value={formData.usageTerm}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#050505] border border-stone-800 rounded-lg px-4 py-2 text-white focus:border-fluency-neon outline-none"
                                    placeholder="e.g. 12 months digital rights"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Termination Clause</label>
                                <input
                                    type="text"
                                    name="terminationClause"
                                    value={formData.terminationClause}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#050505] border border-stone-800 rounded-lg px-4 py-2 text-white focus:border-fluency-neon outline-none"
                                />
                            </div>

                            <button
                                onClick={generateContract}
                                disabled={loading}
                                className="w-full py-4 bg-fluency-neon text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Wand2 size={20} />
                                        Generate Contract
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-[#0A0A0A] border border-stone-800 rounded-2xl p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Contract Preview</h2>
                            {contract && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-stone-400 hover:text-white"
                                        title="Copy to Clipboard"
                                    >
                                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 bg-white text-black rounded-lg p-8 overflow-y-auto font-serif shadow-inner">
                            {contract ? (
                                <div className="prose max-w-none">
                                    <ReactMarkdown>{contract}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-50">
                                    <FileText size={48} className="mb-4" />
                                    <p>Fill out the details and click generate to see the contract here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
