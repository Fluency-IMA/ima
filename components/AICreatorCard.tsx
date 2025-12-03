/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Creator Card Component
 * Displays creator profiles with AI verification badges and insights
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Users, MapPin, Star, AlertTriangle, CheckCircle } from 'lucide-react';

interface AICreatorCardProps {
    creator: {
        username: string;
        platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
        followers: number;
        engagementRate: number;
        profileImage?: string;
        bio?: string;
        location?: string;
    };
    verification?: {
        authenticityScore: number;
        recommendation: 'approved' | 'review' | 'rejected';
        redFlags: string[];
    };
    audienceInsights?: {
        topInterests: string[];
        primaryAge: string;
        primaryGender: string;
    };
    matchScore?: number;
    onSelect?: () => void;
}

export const AICreatorCard: React.FC<AICreatorCardProps> = ({
    creator,
    verification,
    audienceInsights,
    matchScore,
    onSelect
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
        if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
        return 'bg-red-100 dark:bg-red-900/30';
    };

    const getRecommendationBadge = (recommendation: string) => {
        switch (recommendation) {
            case 'approved':
                return (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full">
                        <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                        <span className="text-xs font-bold text-green-700 dark:text-green-400">AI Verified</span>
                    </div>
                );
            case 'review':
                return (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-full">
                        <AlertTriangle size={12} className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">Needs Review</span>
                    </div>
                );
            default:
                return (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-full">
                        <AlertTriangle size={12} className="text-red-600 dark:text-red-400" />
                        <span className="text-xs font-bold text-red-700 dark:text-red-400">Not Verified</span>
                    </div>
                );
        }
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-[#0F0F0F] border-2 border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden hover:border-fluency-neon transition-all duration-300 shadow-lg"
        >
            {/* Header */}
            <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                    {/* Profile Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-fluency-neon to-purple-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                        {creator.profileImage ? (
                            <img src={creator.profileImage} alt={creator.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            creator.username.charAt(0).toUpperCase()
                        )}
                    </div>

                    {/* Creator Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-black dark:text-white">@{creator.username}</h3>
                            {verification && verification.authenticityScore >= 70 && (
                                <ShieldCheck size={18} className="text-fluency-neon" />
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                            <span className="capitalize">{creator.platform}</span>
                            {creator.location && (
                                <>
                                    <span>•</span>
                                    <MapPin size={12} />
                                    <span>{creator.location}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Match Score */}
                    {matchScore !== undefined && (
                        <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(matchScore)}`}>
                                {matchScore}%
                            </div>
                            <div className="text-xs text-stone-500">Match</div>
                        </div>
                    )}
                </div>

                {/* Bio */}
                {creator.bio && (
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2">
                        {creator.bio}
                    </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-stone-50 dark:bg-black rounded-lg p-3">
                        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 mb-1">
                            <Users size={14} />
                            <span className="text-xs font-medium">Followers</span>
                        </div>
                        <div className="text-lg font-bold text-black dark:text-white">
                            {creator.followers >= 1000000
                                ? `${(creator.followers / 1000000).toFixed(1)}M`
                                : creator.followers >= 1000
                                    ? `${(creator.followers / 1000).toFixed(1)}K`
                                    : creator.followers}
                        </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-black rounded-lg p-3">
                        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 mb-1">
                            <TrendingUp size={14} />
                            <span className="text-xs font-medium">Engagement</span>
                        </div>
                        <div className="text-lg font-bold text-black dark:text-white">
                            {creator.engagementRate.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* AI Verification */}
                {verification && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-black dark:text-white">AI Authenticity Score</span>
                            {getRecommendationBadge(verification.recommendation)}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${verification.authenticityScore}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className={`h-full ${getScoreBgColor(verification.authenticityScore)}`}
                                />
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(verification.authenticityScore)}`}>
                                {verification.authenticityScore}/100
                            </span>
                        </div>

                        {/* Red Flags */}
                        {verification.redFlags.length > 0 && (
                            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                ⚠️ {verification.redFlags.length} concern{verification.redFlags.length > 1 ? 's' : ''} detected
                            </div>
                        )}
                    </div>
                )}

                {/* Audience Insights */}
                {audienceInsights && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-2">
                            <Star size={14} />
                            <span className="text-xs font-bold">Audience Insights</span>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-purple-600 dark:text-purple-300">
                                <span className="font-medium">Primary Age:</span> {audienceInsights.primaryAge}
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-300">
                                <span className="font-medium">Primary Gender:</span> {audienceInsights.primaryGender}
                            </div>
                            {audienceInsights.topInterests.length > 0 && (
                                <div className="text-xs text-purple-600 dark:text-purple-300">
                                    <span className="font-medium">Interests:</span> {audienceInsights.topInterests.slice(0, 3).join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                {onSelect && (
                    <button
                        onClick={onSelect}
                        className="w-full px-4 py-3 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Select Creator
                    </button>
                )}
            </div>

            {/* Expandable Details */}
            {verification && verification.redFlags.length > 0 && (
                <div className="border-t border-stone-200 dark:border-stone-800">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full px-6 py-3 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
                    >
                        {showDetails ? 'Hide' : 'Show'} Verification Details
                    </button>

                    {showDetails && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-6 pb-4"
                        >
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <div className="text-xs font-bold text-red-700 dark:text-red-400 mb-2">Concerns:</div>
                                <ul className="space-y-1">
                                    {verification.redFlags.map((flag, i) => (
                                        <li key={i} className="text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                                            <span className="text-red-500 mt-0.5">•</span>
                                            <span>{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default AICreatorCard;
