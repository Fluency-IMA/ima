import React, { useState } from 'react';
import { AIInfluencerDiscoveryService, BusinessAnalysis, DiscoveryCriteria } from '../services/ai-influencer-discovery';
import { InfluencerAnalytics } from '../services/instagram-api';
import { Sparkles, Search, Users, TrendingUp, Target, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface AIInfluencerSearchProps {
    accessToken: string;
    accountId?: string;
}

export function AIInfluencerSearch({ accessToken, accountId }: AIInfluencerSearchProps) {
    const [criteria, setCriteria] = useState<DiscoveryCriteria>({
        businessName: '',
        productDescription: '',
        goals: ''
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [step, setStep] = useState<'input' | 'analyzing' | 'searching' | 'results'>('input');
    const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
    const [results, setResults] = useState<InfluencerAnalytics[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!criteria.businessName || !criteria.productDescription) {
            setError('Please fill in the business name and product description.');
            return;
        }

        setError(null);
        setIsAnalyzing(true);
        setStep('analyzing');

        try {
            const service = new AIInfluencerDiscoveryService(accessToken, accountId);

            // Step 1: Analyze
            const analysisResult = await service.analyzeBusiness(criteria);
            setAnalysis(analysisResult);
            setStep('searching');

            // Step 2: Generate & Search (This part happens automatically after analysis in the service, 
            // but we split it in UI to show progress if we wanted to, 
            // for now let's just use the main function or call them sequentially)

            // Actually, let's use the individual steps to update UI progress
            const candidates = await service.generateCandidateList(analysisResult);

            // Step 3: Verify
            const foundInfluencers = await service.searchAndFilterInfluencers(candidates);
            setResults(foundInfluencers);
            setStep('results');

        } catch (err) {
            console.error(err);
            setError('An error occurred during the discovery process. Please try again.');
            setStep('input');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    AI Influencer Discovery
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Let our AI analyze your business and find the perfect Micro and Macro influencers for your campaign.
                </p>
            </div>

            {/* INPUT SECTION */}
            {step === 'input' && (
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-purple-100">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="e.g. EcoGlow Skincare"
                                value={criteria.businessName}
                                onChange={(e) => setCriteria({ ...criteria, businessName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product / Service Description</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
                                placeholder="Describe what you sell and your unique selling points..."
                                value={criteria.productDescription}
                                onChange={(e) => setCriteria({ ...criteria, productDescription: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goals (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="e.g. Brand awareness, Sales conversion"
                                value={criteria.goals}
                                onChange={(e) => setCriteria({ ...criteria, goals: e.target.value })}
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSearch}
                            disabled={isAnalyzing}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Find Influencers
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* LOADING / PROGRESS STATE */}
            {(step === 'analyzing' || step === 'searching') && (
                <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                        <div className="h-32 flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {step === 'analyzing' ? 'Analyzing your brand identity...' : 'Scouting for top talent...'}
                        </h3>
                        <p className="text-gray-500">
                            {step === 'analyzing'
                                ? 'Our AI is identifying your niche and ideal influencer persona.'
                                : 'Verifying real-time engagement metrics and audience quality.'}
                        </p>
                    </div>

                    {analysis && (
                        <div className="bg-purple-50 p-6 rounded-lg text-left max-w-lg mx-auto animate-fade-in">
                            <h4 className="font-semibold text-purple-900 mb-2">Analysis Complete:</h4>
                            <ul className="space-y-2 text-sm text-purple-800">
                                <li className="flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Niche: {analysis.niche}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Target: {analysis.targetAudience}
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* RESULTS SECTION */}
            {step === 'results' && analysis && (
                <div className="space-y-8">
                    {/* Analysis Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Campaign Strategy</h3>
                                <p className="text-gray-500 text-sm">Based on your business profile</p>
                            </div>
                            <button
                                onClick={() => setStep('input')}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                                New Search
                            </button>
                        </div>
                        <div className="mt-4 grid md:grid-cols-3 gap-6">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="text-blue-600 font-medium mb-1 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Niche
                                </div>
                                <div className="text-gray-900 font-semibold">{analysis.niche}</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="text-purple-600 font-medium mb-1 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Persona
                                </div>
                                <div className="text-gray-900 text-sm">{analysis.idealInfluencerPersona}</div>
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-lg">
                                <div className="text-indigo-600 font-medium mb-1 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" /> Keywords
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.keywords.map(k => (
                                        <span key={k} className="bg-white px-2 py-1 rounded text-xs text-indigo-700 border border-indigo-100">
                                            #{k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">
                            Discovered Influencers <span className="text-gray-400 font-normal">({results.length})</span>
                        </h3>

                        {results.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No influencers found matching your criteria. Try adjusting your description.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((influencer) => (
                                    <div key={influencer.handle} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                                                    {/* Placeholder for profile pic if not available directly from this endpoint without extra fields */}
                                                    {/* Note: Business Discovery returns profile_picture_url */}
                                                    <img
                                                        src={influencer.profile_picture_url || `https://ui-avatars.com/api/?name=${influencer.name}&background=random`}
                                                        alt={influencer.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{influencer.name}</h4>
                                                    <a
                                                        href={`https://instagram.com/${influencer.handle.replace('@', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-purple-600 text-sm hover:underline"
                                                    >
                                                        {influencer.handle}
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {(influencer.followers / 1000).toFixed(1)}k
                                                    </div>
                                                    <div className="text-xs text-gray-500">Followers</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {influencer.engagementRate}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">Eng. Rate</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {influencer.averageLikes.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Avg. Likes</div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Tier</span>
                                                    <span className="font-medium text-gray-900">
                                                        {influencer.followers < 100000 ? 'Micro' : 'Macro'}
                                                    </span>
                                                </div>

                                                <button
                                                    className="w-full py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled
                                                    title="Coming soon"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Add to Campaign
                                                </button>                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
