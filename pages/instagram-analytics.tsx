import React from 'react';
import Head from 'next/head';
import InfluencerAnalyticsViewer from '../components/InfluencerAnalyticsViewer';

/**
 * Instagram Analytics Demo Page
 * 
 * This page demonstrates the Instagram Analytics integration
 * for calculating influencer average views and engagement metrics
 */
export default function InstagramAnalytics() {
    return (
        <>
            <Head>
                <title>Instagram Analytics - Fluency AIM</title>
                <meta name="description" content="Calculate influencer average views and engagement metrics using Instagram Graph API" />
            </Head>

            <div className="analytics-page">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Instagram Influencer Analytics</h1>
                        <p className="subtitle">
                            Calculate average views, engagement rates, and audience quality scores
                            using real Instagram data
                        </p>
                    </div>
                </div>

                <div className="page-content">
                    <InfluencerAnalyticsViewer
                        accessToken={process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN}
                        accountId={process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ACCOUNT_ID}
                    />
                </div>

                <div className="info-section">
                    <div className="info-card">
                        <h3>🎯 What We Calculate</h3>
                        <ul>
                            <li><strong>Average Views:</strong> Mean views across recent posts</li>
                            <li><strong>Engagement Rate:</strong> (Likes + Comments) / Followers × 100</li>
                            <li><strong>AQS:</strong> Audience Quality Score based on engagement patterns</li>
                            <li><strong>Tier Classification:</strong> Nano to Mega influencer categorization</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h3>📊 Data Sources</h3>
                        <ul>
                            <li>Instagram Graph API v21.0</li>
                            <li>Real-time profile and media data</li>
                            <li>Post insights and engagement metrics</li>
                            <li>Audience demographics (when available)</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h3>🔒 Privacy & Security</h3>
                        <ul>
                            <li>All data fetched via official Instagram API</li>
                            <li>No data stored permanently</li>
                            <li>Requires Business/Creator account access</li>
                            <li>Compliant with Instagram's terms of service</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .analytics-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .page-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 3rem 2rem;
                    text-align: center;
                }

                .header-content {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    margin: 0 0 1rem 0;
                    font-weight: 700;
                }

                .subtitle {
                    font-size: 1.2rem;
                    opacity: 0.95;
                    margin: 0;
                    line-height: 1.6;
                }

                .page-content {
                    max-width: 1200px;
                    margin: -2rem auto 2rem;
                    padding: 0 1rem;
                }

                .info-section {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem 1rem 4rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .info-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .info-card h3 {
                    font-size: 1.5rem;
                    margin: 0 0 1rem 0;
                    color: #1a1a1a;
                }

                .info-card ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .info-card li {
                    padding: 0.5rem 0;
                    color: #555;
                    line-height: 1.6;
                }

                .info-card li strong {
                    color: #333;
                }

                @media (max-width: 768px) {
                    .page-header h1 {
                        font-size: 2rem;
                    }

                    .subtitle {
                        font-size: 1rem;
                    }

                    .info-section {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}
