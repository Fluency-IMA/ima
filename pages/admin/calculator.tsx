import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Calculator, DollarSign, BarChart2, Trash2, RefreshCw } from 'lucide-react';

export default function PricingCalculator() {
    const [viewCountsInput, setViewCountsInput] = useState('');
    const [cpm, setCpm] = useState<number>(25);
    const [customCpm, setCustomCpm] = useState<string>('');
    const [results, setResults] = useState<{
        originalCount: number;
        processedCount: number;
        averageViews: number;
        estimatedPrice: number;
        removedOutliers: number[];
    } | null>(null);

    const calculatePrice = () => {
        // 1. Parse Input
        const views = viewCountsInput
            .split(/[\n,]+/) // Split by newline or comma
            .map(v => parseInt(v.replace(/[^0-9]/g, ''), 10)) // Remove non-digits
            .filter(v => !isNaN(v)); // Filter valid numbers

        if (views.length === 0) {
            setResults(null);
            return;
        }

        // 2. Sort Views
        const sortedViews = [...views].sort((a, b) => a - b);
        let processedViews = [...sortedViews];
        let removed: number[] = [];

        // 3. Remove Outliers (Highest and Lowest) if we have enough data
        if (sortedViews.length > 2) {
            const lowest = processedViews.shift(); // Remove first (lowest)
            const highest = processedViews.pop(); // Remove last (highest)
            if (lowest !== undefined) removed.push(lowest);
            if (highest !== undefined) removed.push(highest);
        }

        // 4. Calculate Average
        const totalViews = processedViews.reduce((sum, v) => sum + v, 0);
        const averageViews = processedViews.length > 0 ? totalViews / processedViews.length : 0;

        // 5. Calculate Price
        const activeCpm = customCpm ? parseFloat(customCpm) : cpm;
        const estimatedPrice = (averageViews / 1000) * activeCpm;

        setResults({
            originalCount: views.length,
            processedCount: processedViews.length,
            averageViews,
            estimatedPrice,
            removedOutliers: removed
        });
    };

    useEffect(() => {
        calculatePrice();
    }, [viewCountsInput, cpm, customCpm]);

    const handleCpmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'custom') {
            setCpm(0);
        } else {
            setCpm(Number(value));
            setCustomCpm('');
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold text-white mb-8">Pricing Calculator</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-[#0A0A0A] border border-stone-800 rounded-xl p-6">
                    <div className="mb-6">
                        <label className="block text-stone-400 font-medium mb-2 flex items-center gap-2">
                            <BarChart2 size={18} />
                            <span>Past Video Views</span>
                        </label>
                        <p className="text-xs text-stone-500 mb-2">
                            Paste a list of view counts (comma or newline separated). The highest and lowest values will be automatically removed.
                        </p>
                        <textarea
                            value={viewCountsInput}
                            onChange={(e) => setViewCountsInput(e.target.value)}
                            placeholder="Example:&#10;15000&#10;22000&#10;18500&#10;100000 (viral outlier)&#10;500 (flop outlier)"
                            className="w-full h-64 bg-stone-900 border border-stone-800 rounded-lg p-4 text-white font-mono focus:border-fluency-neon outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-stone-400 font-medium mb-2 flex items-center gap-2">
                            <DollarSign size={18} />
                            <span>Estimated CPM ($)</span>
                        </label>
                        <div className="flex gap-4">
                            <select
                                value={customCpm ? 'custom' : cpm}
                                onChange={handleCpmChange}
                                className="flex-1 bg-stone-900 border border-stone-800 rounded-lg p-3 text-white focus:border-fluency-neon outline-none"
                            >
                                <option value={10}>$10 CPM (Standard)</option>
                                <option value={25}>$25 CPM (Premium)</option>
                                <option value={50}>$50 CPM (Elite)</option>
                                <option value={100}>$100 CPM (Super)</option>
                                <option value="custom">Custom Value</option>
                            </select>
                            {(cpm === 0 || customCpm) && (
                                <input
                                    type="number"
                                    value={customCpm}
                                    onChange={(e) => setCustomCpm(e.target.value)}
                                    placeholder="Custom CPM"
                                    className="w-32 bg-stone-900 border border-stone-800 rounded-lg p-3 text-white focus:border-fluency-neon outline-none"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="bg-[#0A0A0A] border border-stone-800 rounded-xl p-6 flex flex-col justify-center">
                    {!results || results.originalCount === 0 ? (
                        <div className="text-center text-stone-500">
                            <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Enter view counts to see the estimated price.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="text-center">
                                <p className="text-stone-400 mb-2 uppercase text-xs font-bold tracking-wider">Estimated Price</p>
                                <div className="text-5xl font-bold text-fluency-neon">
                                    ${results.estimatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="text-stone-500 text-sm mt-2">
                                    Based on {results.averageViews.toLocaleString(undefined, { maximumFractionDigits: 0 })} avg views @ ${customCpm || cpm} CPM
                                </p>
                            </div>

                            <div className="bg-stone-900/50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-400">Total Videos Analyzed</span>
                                    <span className="text-white font-bold">{results.originalCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-400">Videos Used (Outliers Removed)</span>
                                    <span className="text-white font-bold">{results.processedCount}</span>
                                </div>
                                {results.removedOutliers.length > 0 && (
                                    <div className="pt-3 border-t border-stone-800">
                                        <span className="text-xs text-stone-500 block mb-1">Removed Outliers:</span>
                                        <div className="flex gap-2 flex-wrap">
                                            {results.removedOutliers.map((val, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-red-900/20 text-red-400 text-xs rounded flex items-center gap-1">
                                                    <Trash2 size={10} />
                                                    {val.toLocaleString()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => { setViewCountsInput(''); setResults(null); }}
                                className="w-full py-3 bg-stone-800 text-stone-400 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw size={16} />
                                Reset Calculator
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
