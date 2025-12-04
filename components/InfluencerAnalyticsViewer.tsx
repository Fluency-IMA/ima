import React, { useState } from 'react';
import {
    calculateInfluencerAnalytics,
    InfluencerAnalytics,
    determineInfluencerTier,
    calculateAQS
} from '../services/instagram-api';

interface InfluencerAnalyticsViewerProps {
    accessToken?: string;
    accountId?: string;
}

/**
 * Component to display Instagram influencer analytics
 * Shows average views, engagement rate, and other key metrics
 */
export default function InfluencerAnalyticsViewer({
    accessToken: propAccessToken,
    accountId: propAccountId
}: InfluencerAnalyticsViewerProps) {
    const [analytics, setAnalytics] = useState<InfluencerAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState(propAccessToken || '');
    const [accountId, setAccountId] = useState(propAccountId || '');

    const handleAnalyze = async () => {
        if (!accessToken) {
            setError('Please provide an Instagram access token');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await calculateInfluencerAnalytics(
                accessToken,
                accountId || undefined,
                25 // Analyze last 25 posts
            );
            setAnalytics(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
            console.error('Analytics error:', err);
        } finally {
            setLoading(false);
        }
    };

    const tier = analytics ? determineInfluencerTier(analytics.followers) : null;
    const aqs = analytics ? calculateAQS(analytics.engagementRate, analytics.followers) : null;

    return (
        <div className="influencer-analytics-viewer">
            <div className="analytics-header">
                <h2>📊 Instagram Influencer Analytics</h2>
                <p>Calculate average views and engagement metrics using real Instagram data</p>
            </div>

            {/* Input Form */}
            {!analytics && (
                <div className="analytics-form">
                    <div className="form-group">
                        <label htmlFor="accessToken">Instagram Access Token *</label>
                        <input
                            id="accessToken"
                            type="text"
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder="Enter Instagram Graph API access token"
                            className="form-input"
                        />
                        <small>Get your token from <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer">Facebook Graph API Explorer</a></small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="accountId">Instagram Business Account ID (Optional)</label>
                        <input
                            id="accountId"
                            type="text"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            placeholder="Leave empty to auto-detect"
                            className="form-input"
                        />
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !accessToken}
                        className="analyze-button"
                    >
                        {loading ? '🔄 Analyzing...' : '🚀 Analyze Influencer'}
                    </button>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="error-message">
                    <strong>⚠️ Error:</strong> {error}
                </div>
            )}

            {/* Analytics Results */}
            {analytics && (
                <div className="analytics-results">
                    <div className="results-header">
                        <div className="profile-info">
                            <h3>{analytics.name}</h3>
                            <p className="handle">{analytics.handle}</p>
                        </div>
                        <button
                            onClick={() => setAnalytics(null)}
                            className="reset-button"
                        >
                            🔄 Analyze Another
                        </button>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="metrics-grid">
                        <div className="metric-card highlight">
                            <div className="metric-icon">👁️</div>
                            <div className="metric-value">{analytics.averageViews.toLocaleString()}</div>
                            <div className="metric-label">Average Views</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">❤️</div>
                            <div className="metric-value">{analytics.averageLikes.toLocaleString()}</div>
                            <div className="metric-label">Average Likes</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">💬</div>
                            <div className="metric-value">{analytics.averageComments.toLocaleString()}</div>
                            <div className="metric-label">Average Comments</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">📈</div>
                            <div className="metric-value">{analytics.engagementRate}%</div>
                            <div className="metric-label">Engagement Rate</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">👥</div>
                            <div className="metric-value">{analytics.followers.toLocaleString()}</div>
                            <div className="metric-label">Followers</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">🎯</div>
                            <div className="metric-value">{tier}</div>
                            <div className="metric-label">Influencer Tier</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">✨</div>
                            <div className="metric-value">{aqs}/100</div>
                            <div className="metric-label">Audience Quality Score</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">📝</div>
                            <div className="metric-value">{analytics.totalPosts}</div>
                            <div className="metric-label">Posts Analyzed</div>
                        </div>
                    </div>

                    {/* Top Performing Post */}
                    {analytics.topPerformingPost && (
                        <div className="top-post-section">
                            <h4>🏆 Top Performing Post</h4>
                            <div className="top-post-card">
                                <div className="top-post-stats">
                                    <div className="stat">
                                        <span className="stat-value">{analytics.topPerformingPost.views.toLocaleString()}</span>
                                        <span className="stat-label">Views</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{analytics.topPerformingPost.likes.toLocaleString()}</span>
                                        <span className="stat-label">Likes</span>
                                    </div>
                                </div>
                                <a
                                    href={analytics.topPerformingPost.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-post-link"
                                >
                                    View Post →
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Recent Posts Preview */}
                    <div className="recent-posts-section">
                        <h4>📸 Recent Posts ({analytics.recentPosts.length})</h4>
                        <div className="posts-grid">
                            {analytics.recentPosts.slice(0, 6).map((post) => (
                                <a
                                    key={post.id}
                                    href={post.permalink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="post-thumbnail"
                                >
                                    <img src={post.media_url} alt={post.caption?.slice(0, 50) || 'Instagram post'} />
                                    <div className="post-overlay">
                                        <span>{post.media_type}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="analytics-footer">
                        <small>
                            📅 Calculated at: {new Date(analytics.calculatedAt).toLocaleString()}
                        </small>
                    </div>
                </div>
            )}

            <style jsx>{`
                .influencer-analytics-viewer {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .analytics-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .analytics-header h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: #1a1a1a;
                }

                .analytics-header p {
                    color: #666;
                    font-size: 1rem;
                }

                .analytics-form {
                    background: #f8f9fa;
                    padding: 2rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #4f46e5;
                }

                .form-group small {
                    display: block;
                    margin-top: 0.5rem;
                    color: #666;
                    font-size: 0.875rem;
                }

                .form-group small a {
                    color: #4f46e5;
                    text-decoration: none;
                }

                .analyze-button {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .analyze-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }

                .analyze-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .error-message {
                    background: #fee;
                    border: 2px solid #fcc;
                    color: #c33;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .analytics-results {
                    animation: fadeIn 0.5s;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #e0e0e0;
                }

                .profile-info h3 {
                    font-size: 1.75rem;
                    margin: 0;
                    color: #1a1a1a;
                }

                .handle {
                    color: #666;
                    font-size: 1.1rem;
                    margin: 0.25rem 0 0 0;
                }

                .reset-button {
                    padding: 0.5rem 1rem;
                    background: #f0f0f0;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                }

                .reset-button:hover {
                    background: #e0e0e0;
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .metric-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    text-align: center;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .metric-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                }

                .metric-card.highlight {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .metric-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .metric-value {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .metric-label {
                    font-size: 0.875rem;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .top-post-section, .recent-posts-section {
                    margin-bottom: 2rem;
                }

                .top-post-section h4, .recent-posts-section h4 {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                    color: #1a1a1a;
                }

                .top-post-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .top-post-stats {
                    display: flex;
                    gap: 2rem;
                }

                .stat {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1a1a1a;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: #666;
                }

                .view-post-link {
                    color: #4f46e5;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .view-post-link:hover {
                    color: #764ba2;
                }

                .posts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 1rem;
                }

                .post-thumbnail {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    display: block;
                }

                .post-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }

                .post-thumbnail:hover img {
                    transform: scale(1.1);
                }

                .post-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 0.5rem;
                    font-size: 0.75rem;
                    text-align: center;
                }

                .analytics-footer {
                    text-align: center;
                    padding-top: 1rem;
                    border-top: 1px solid #e0e0e0;
                    color: #666;
                }
            `}</style>
        </div>
    );
}
