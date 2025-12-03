import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { InfluencerService, Influencer } from '../../services/influencer-service';
import Papa from 'papaparse';
import { Upload, Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react';

export default function InfluencerHub() {
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Influencer>>({
        name: '',
        channelLink: '',
        niche: '',
        followerTier: 'Micro',
        pricePerDeliverable: 0,
        contactInfo: '',
        shippingAddress: ''
    });

    useEffect(() => {
        loadInfluencers();
    }, []);

    const loadInfluencers = async () => {
        try {
            const data = await InfluencerService.getInfluencers();
            setInfluencers(data);
        } catch (error) {
            console.error('Failed to load influencers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                const parsedData = results.data.map((row: any) => ({
                    name: row.Name || row.name,
                    channelLink: row['Channel Link'] || row.channelLink,
                    niche: row.Niche || row.niche,
                    followerTier: row['Follower Tier'] || row.followerTier || 'Micro',
                    pricePerDeliverable: Number(row['Price'] || row.pricePerDeliverable || 0),
                    contactInfo: row['Contact Info'] || row.contactInfo,
                    shippingAddress: row['Shipping Address'] || row.shippingAddress
                })).filter((inf: any) => inf.name); // Filter empty rows

                if (confirm(`Ready to import ${parsedData.length} influencers?`)) {
                    setLoading(true);
                    try {
                        await InfluencerService.bulkAddInfluencers(parsedData as any);
                        await loadInfluencers();
                        alert('Import successful!');
                    } catch (error) {
                        alert('Error importing data');
                    } finally {
                        setLoading(false);
                    }
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await InfluencerService.updateInfluencer(editingId, formData);
            } else {
                await InfluencerService.addInfluencer(formData as any);
            }
            await loadInfluencers();
            setShowAddModal(false);
            setEditingId(null);
            resetForm();
        } catch (error) {
            console.error(error);
            alert('Error saving influencer');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this influencer?')) {
            try {
                await InfluencerService.deleteInfluencer(id);
                setInfluencers(prev => prev.filter(inf => inf.id !== id));
            } catch (error) {
                alert('Error deleting influencer');
            }
        }
    };

    const startEdit = (inf: Influencer) => {
        setFormData(inf);
        setEditingId(inf.id!);
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            channelLink: '',
            niche: '',
            followerTier: 'Micro',
            pricePerDeliverable: 0,
            contactInfo: '',
            shippingAddress: ''
        });
    };

    const filteredInfluencers = influencers.filter(inf =>
        inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.niche.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Influencer Hub</h1>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg cursor-pointer hover:bg-stone-700 transition-colors">
                        <Upload size={18} />
                        <span>Import CSV</span>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <button
                        onClick={() => { resetForm(); setEditingId(null); setShowAddModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <Plus size={18} />
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500" size={20} />
                <input
                    type="text"
                    placeholder="Search influencers by name or niche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#0A0A0A] border border-stone-800 rounded-xl text-white focus:border-fluency-neon outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-[#0A0A0A] border border-stone-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-stone-900 text-stone-400">
                            <tr>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Niche</th>
                                <th className="p-4 font-medium">Tier</th>
                                <th className="p-4 font-medium">Price</th>
                                <th className="p-4 font-medium">Contact</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-stone-500">Loading...</td></tr>
                            ) : filteredInfluencers.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-stone-500">No influencers found</td></tr>
                            ) : (
                                filteredInfluencers.map((inf) => (
                                    <tr key={inf.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{inf.name}</div>
                                            <a href={inf.channelLink} target="_blank" rel="noreferrer" className="text-xs text-fluency-neon hover:underline">View Channel</a>
                                        </td>
                                        <td className="p-4 text-stone-300">{inf.niche}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-stone-800 rounded text-xs text-stone-300">{inf.followerTier}</span>
                                        </td>
                                        <td className="p-4 text-white">${inf.pricePerDeliverable.toLocaleString()}</td>
                                        <td className="p-4 text-stone-400 text-sm">{inf.contactInfo}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => startEdit(inf)} className="p-2 hover:bg-stone-800 rounded text-stone-400 hover:text-white">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(inf.id!)} className="p-2 hover:bg-red-900/20 rounded text-stone-400 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-stone-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Influencer' : 'Add New Influencer'}</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1">Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-white focus:border-fluency-neon outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1">Niche</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.niche}
                                        onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                        className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-white focus:border-fluency-neon outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Channel Link</label>
                                <input
                                    required
                                    type="url"
                                    value={formData.channelLink}
                                    onChange={e => setFormData({ ...formData, channelLink: e.target.value })}
                                    className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-white focus:border-fluency-neon outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1">Follower Tier</label>
                                    <select
                                        value={formData.followerTier}
                                        onChange={e => setFormData({ ...formData, followerTier: e.target.value as any })}
                                        className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-white focus:border-fluency-neon outline-none"
                                    >
                                        <option value="Nano">Nano</option>
                                        <option value="Micro">Micro</option>
                                        <option value="Mid-Tier">Mid-Tier</option>
                                        <option value="Macro">Macro</option>
                                        <option value="Mega">Mega</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-1">Price per Deliverable ($)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.pricePerDeliverable}
                                        onChange={e => setFormData({ ...formData, pricePerDeliverable: Number(e.target.value) })}
                                        className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-white focus:border-fluency-neon outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Contact Info</label>
                                <input
                                    type="text"
                                    value={formData.contactInfo}
                                    onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                                    className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-white focus:border-fluency-neon outline-none"
                                    placeholder="Email, Phone, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Shipping Address</label>
                                <textarea
                                    value={formData.shippingAddress}
                                    onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                                    className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg text-white focus:border-fluency-neon outline-none h-24"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    <span>{loading ? 'Saving...' : 'Save Influencer'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
