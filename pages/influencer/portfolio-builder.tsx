import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Image as ImageIcon, Save, RefreshCw, Loader2, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PortfolioItem {
    id: string;
    imageUrl: string;
    originalPrompt: string;
    createdAt: string;
}

export default function PortfolioBuilder() {
    const { user, loading, loginWithGoogle } = useAuth();
    const router = useRouter();

    const [prompt, setPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [loadingPortfolio, setLoadingPortfolio] = useState(true);

    useEffect(() => {
        if (user) {
            loadPortfolio();
        } else if (!loading) {
            setLoadingPortfolio(false);
        }
    }, [user, loading]);

    const loadPortfolio = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/influencer/portfolio/list?influencerId=${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.portfolioItems) {
                setPortfolioItems(data.portfolioItems);
            }
        } catch (error) {
            console.error('Failed to load portfolio:', error);
        } finally {
            setLoadingPortfolio(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedImages([]);
        setSelectedImage(null);

        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/influencer/portfolio/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (data.images) {
                setGeneratedImages(data.images);
            } else {
                alert('Failed to generate images');
            }
        } catch (error) {
            console.error('Generation error:', error);
            alert('Error generating images');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!selectedImage || !user) return;

        setIsSaving(true);
        try {
            // Get ID token for authentication
            const token = await user.getIdToken();

            const res = await fetch('/api/influencer/portfolio/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    imageUrl: selectedImage,
                    prompt,
                    influencerId: user.uid // Use real user ID
                }),
            });

            if (res.ok) {
                alert('Image saved to portfolio!');
                setGeneratedImages([]);
                setSelectedImage(null);
                setPrompt('');
                loadPortfolio(); // Refresh the list
            } else {
                alert('Failed to save image');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving image');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="bg-fluency-neon/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                        <Sparkles className="text-fluency-neon" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold">Portfolio Builder</h1>
                    <p className="text-stone-400">Sign in to start generating AI images for your portfolio.</p>
                    <button
                        onClick={loginWithGoogle}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogIn size={20} />
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            <Head>
                <title>Portfolio Builder | Fluency</title>
            </Head>

            {/* Header */}
            <header className="bg-[#0A0A0A] border-b border-stone-800 py-6 sticky top-0 z-10">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-fluency-neon/10 p-2 rounded-lg">
                            <Sparkles className="text-fluency-neon" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold">Portfolio Builder</h1>
                    </div>
                    <div className="text-stone-400 text-sm">
                        Influencer Dashboard
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Generator */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Input Section */}
                        <section className="bg-[#0A0A0A] border border-stone-800 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <ImageIcon className="text-fluency-neon" size={20} />
                                Generate New Image
                            </h2>
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        Describe your vision
                                    </label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="E.g., A moody street style shot in Milan, wearing a beige trench coat, golden hour lighting..."
                                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 text-white placeholder-stone-600 focus:border-fluency-neon focus:ring-1 focus:ring-fluency-neon outline-none transition-all h-32 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isGenerating || !prompt.trim()}
                                    className="w-full py-4 bg-fluency-neon text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Generating Magic...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Generate Images
                                        </>
                                    )}
                                </button>
                            </form>
                        </section>

                        {/* Results Section */}
                        {(generatedImages.length > 0 || isGenerating) && (
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold text-stone-300">Generated Results</h3>
                                {isGenerating ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="aspect-[3/4] bg-stone-900 rounded-xl border border-stone-800"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {generatedImages.map((url, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedImage(url)}
                                                className={`group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === url
                                                    ? 'border-fluency-neon shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                                                    : 'border-transparent hover:border-stone-700'
                                                    }`}
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Generated ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${selectedImage === url ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                    }`}>
                                                    {selectedImage === url ? (
                                                        <div className="bg-fluency-neon text-black px-3 py-1 rounded-full text-sm font-bold">Selected</div>
                                                    ) : (
                                                        <span className="text-white font-medium">Select</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Save Action */}
                                {selectedImage && (
                                    <div className="flex justify-end pt-4 animate-in fade-in slide-in-from-bottom-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="animate-spin" size={18} />
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            Save to Portfolio
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Right Column: Recent Portfolio */}
                    <div className="lg:col-span-1">
                        <section className="bg-[#0A0A0A] border border-stone-800 rounded-2xl p-6 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Recent Portfolio</h2>
                                <button
                                    onClick={loadPortfolio}
                                    className="p-2 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>

                            {loadingPortfolio ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="aspect-square bg-stone-900 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : portfolioItems.length === 0 ? (
                                <div className="text-center py-12 text-stone-500 bg-stone-900/30 rounded-xl border border-stone-800 border-dashed">
                                    <ImageIcon className="mx-auto mb-3 opacity-50" size={32} />
                                    <p>No images yet.</p>
                                    <p className="text-xs mt-1">Start generating!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {portfolioItems.map((item) => (
                                        <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
                                            <img
                                                src={item.imageUrl}
                                                alt="Portfolio item"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                                <p className="text-xs text-white line-clamp-2">{item.originalPrompt}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
