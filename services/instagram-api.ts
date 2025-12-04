/**
 * INSTAGRAM GRAPH API SERVICE
 * 
 * Calculates influencer average views and engagement metrics using Instagram Graph API
 * Requires Instagram Business or Creator account with access token
 */

export interface InstagramMedia {
    id: string;
    caption?: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url: string;
    permalink: string;
    timestamp: string;
    like_count?: number;
    comments_count?: number;
    // Video-specific metrics
    video_views?: number;
    // Reel-specific metrics (available for reels)
    plays?: number;
    reach?: number;
    saved?: number;
}

export interface InstagramProfile {
    id: string;
    username: string;
    name?: string;
    biography?: string;
    followers_count?: number;
    follows_count?: number;
    media_count?: number;
    profile_picture_url?: string;
}

export interface InstagramInsights {
    impressions?: number;
    reach?: number;
    profile_views?: number;
    website_clicks?: number;
}

export interface InfluencerAnalytics {
    handle: string;
    name: string;
    followers: number;
    totalPosts: number;
    averageViews: number;
    averageLikes: number;
    averageComments: number;
    engagementRate: number;
    topPerformingPost: {
        url: string;
        views: number;
        likes: number;
    } | null;
    recentPosts: InstagramMedia[];
    calculatedAt: string;
    profile_picture_url?: string;
}

const INSTAGRAM_GRAPH_API_BASE = 'https://graph.instagram.com';
const INSTAGRAM_API_VERSION = 'v21.0';

/**
 * Get Instagram Business Account ID from access token
 */
export async function getInstagramBusinessAccountId(accessToken: string): Promise<string> {
    try {
        const response = await fetch(
            `${INSTAGRAM_GRAPH_API_BASE}/me?fields=id,username&access_token=${accessToken}`
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Instagram API Error: ${error.error?.message || 'Failed to fetch account ID'}`);
        }

        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Error fetching Instagram Business Account ID:', error);
        throw error;
    }
}

/**
 * Fetch Instagram profile information
 */
export async function fetchInstagramProfile(
    accountId: string,
    accessToken: string
): Promise<InstagramProfile> {
    try {
        const fields = 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url';
        const response = await fetch(
            `${INSTAGRAM_GRAPH_API_BASE}/${accountId}?fields=${fields}&access_token=${accessToken}`
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Instagram API Error: ${error.error?.message || 'Failed to fetch profile'}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching Instagram profile:', error);
        throw error;
    }
}

/**
 * Fetch recent media posts from Instagram account
 */
export async function fetchInstagramMedia(
    accountId: string,
    accessToken: string,
    limit: number = 25
): Promise<InstagramMedia[]> {
    try {
        const fields = 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count';
        const response = await fetch(
            `${INSTAGRAM_GRAPH_API_BASE}/${accountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Instagram API Error: ${error.error?.message || 'Failed to fetch media'}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching Instagram media:', error);
        throw error;
    }
}

/**
 * Fetch insights for a specific media post
 * Note: Insights are only available for media published by Business/Creator accounts
 */
export async function fetchMediaInsights(
    mediaId: string,
    accessToken: string,
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
): Promise<{ impressions?: number; reach?: number; engagement?: number; saved?: number; video_views?: number }> {
    try {
        // Different metrics available for different media types
        let metrics = 'impressions,reach,engagement,saved';

        if (mediaType === 'VIDEO') {
            metrics += ',video_views';
        }

        const response = await fetch(
            `${INSTAGRAM_GRAPH_API_BASE}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
        );

        if (!response.ok) {
            // Insights might not be available for all posts (e.g., too old)
            console.warn(`Could not fetch insights for media ${mediaId}`);
            return {};
        }

        const data = await response.json();
        const insights: any = {};

        // Parse insights data
        if (data.data) {
            data.data.forEach((metric: any) => {
                insights[metric.name] = metric.values[0]?.value || 0;
            });
        }

        return insights;
    } catch (error) {
        console.warn('Error fetching media insights:', error);
        return {};
    }
}

/**
 * Calculate average views and engagement metrics for an influencer
 * This is the main function for the AI analytics feature
 */
export async function calculateInfluencerAnalytics(
    accessToken: string,
    accountId?: string,
    postsToAnalyze: number = 25
): Promise<InfluencerAnalytics> {
    try {
        // Step 1: Get account ID if not provided
        const igAccountId = accountId || await getInstagramBusinessAccountId(accessToken);

        // Step 2: Fetch profile information
        const profile = await fetchInstagramProfile(igAccountId, accessToken);

        // Step 3: Fetch recent media posts
        const mediaPosts = await fetchInstagramMedia(igAccountId, accessToken, postsToAnalyze);

        if (mediaPosts.length === 0) {
            throw new Error('No media posts found for this account');
        }

        // Step 4: Fetch insights for each post and calculate metrics
        let totalViews = 0;
        let totalLikes = 0;
        let totalComments = 0;
        let totalEngagement = 0;
        let postsWithViews = 0;
        let topPost: InstagramMedia | null = null;
        let maxViews = 0;

        // Fetch insights for each post
        const postsWithInsights = await Promise.all(
            mediaPosts.map(async (post) => {
                const insights = await fetchMediaInsights(post.id, accessToken, post.media_type);

                // For videos, use video_views; for images/carousels, use reach as proxy for views
                const views = insights.video_views || insights.reach || 0;
                const likes = post.like_count || 0;
                const comments = post.comments_count || 0;

                totalLikes += likes;
                totalComments += comments;

                if (views > 0) {
                    totalViews += views;
                    postsWithViews++;
                }

                // Track top performing post
                if (views > maxViews) {
                    maxViews = views;
                    topPost = post;
                }

                return {
                    ...post,
                    views,
                    insights
                };
            })
        );

        // Step 5: Calculate averages
        const averageViews = mediaPosts.length > 0 ? Math.round(totalViews / mediaPosts.length) : 0;
        const averageLikes = mediaPosts.length > 0 ? Math.round(totalLikes / mediaPosts.length) : 0;
        const averageComments = mediaPosts.length > 0 ? Math.round(totalComments / mediaPosts.length) : 0;
        // Calculate engagement rate: (likes + comments) / followers * 100
        const totalEngagementActions = totalLikes + totalComments;
        const engagementRate = profile.followers_count
            ? parseFloat(((totalEngagementActions / mediaPosts.length) / profile.followers_count * 100).toFixed(2))
            : 0;

        return {
            handle: `@${profile.username}`,
            name: profile.name || profile.username,
            followers: profile.followers_count || 0,
            totalPosts: mediaPosts.length,
            averageViews,
            averageLikes,
            averageComments,
            engagementRate,
            topPerformingPost: topPost ? {
                url: topPost.permalink,
                views: maxViews,
                likes: topPost.like_count || 0
            } : null,
            recentPosts: mediaPosts.slice(0, 10), // Return top 10 recent posts
            calculatedAt: new Date().toISOString(),
            profile_picture_url: profile.profile_picture_url
        };
    } catch (error) {
        console.error('Error calculating influencer analytics:', error);
        throw error;
    }
}

/**
 * Analyze multiple influencers (batch processing)
 */
export async function analyzeMultipleInfluencers(
    influencers: Array<{ accountId?: string; accessToken: string }>,
    postsToAnalyze: number = 25
): Promise<InfluencerAnalytics[]> {
    const results = await Promise.allSettled(
        influencers.map(inf =>
            calculateInfluencerAnalytics(inf.accessToken, inf.accountId, postsToAnalyze)
        )
    );

    return results
        .filter((result): result is PromiseFulfilledResult<InfluencerAnalytics> =>
            result.status === 'fulfilled'
        )
        .map(result => result.value);
}

/**
 * Helper: Determine influencer tier based on follower count
 */
export function determineInfluencerTier(followers: number): 'Nano' | 'Micro' | 'Mid-Tier' | 'Macro' | 'Mega' {
    if (followers < 10000) return 'Nano';
    if (followers < 100000) return 'Micro';
    if (followers < 500000) return 'Mid-Tier';
    if (followers < 1000000) return 'Macro';
    return 'Mega';
}

/**
 * Helper: Calculate Audience Quality Score (AQS) based on engagement
 */
export function calculateAQS(engagementRate: number, followers: number): number {
    // Base score from engagement rate
    let aqs = Math.min(engagementRate * 10, 70); // Max 70 from engagement

    // Bonus for authentic follower count patterns
    if (followers > 1000 && followers < 1000000) {
        aqs += 15; // Mid-range followers often have better engagement
    }

    // Engagement rate quality tiers
    if (engagementRate > 5) aqs += 15; // Excellent engagement
    else if (engagementRate > 3) aqs += 10; // Good engagement
    else if (engagementRate > 1) aqs += 5; // Average engagement

    return Math.min(Math.round(aqs), 100);
}

/**
 * Fetch influencer data by username using Business Discovery API
 * This allows getting data for any business/creator account without their direct token
 */
export async function getInfluencerDataByUsername(
    targetUsername: string,
    myAccessToken: string,
    myAccountId?: string
): Promise<InfluencerAnalytics> {
    try {
        // Step 1: Get my account ID if not provided
        const accountId = myAccountId || await getInstagramBusinessAccountId(myAccessToken);

        // Step 2: Use Business Discovery to get data about the target user
        // We ask for the target user's info and their recent media in one go
        const fields = `business_discovery.username(${targetUsername}){id,username,name,biography,followers_count,media_count,profile_picture_url,media.limit(10){id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count}}`;

        const response = await fetch(
            `${INSTAGRAM_GRAPH_API_BASE}/${accountId}?fields=${fields}&access_token=${myAccessToken}`
        );

        if (!response.ok) {
            const error = await response.json();
            // Handle specific error for non-business accounts or not found
            if (error.error?.message?.includes('IG User does not exist') || error.error?.code === 100) {
                throw new Error(`User @${targetUsername} not found or not a Business/Creator account`);
            }
            throw new Error(`Instagram API Error: ${error.error?.message || 'Failed to fetch influencer data'}`);
        }

        const data = await response.json();
        const businessDiscovery = data.business_discovery;

        if (!businessDiscovery) {
            throw new Error(`Could not retrieve data for @${targetUsername}`);
        }

        // Step 3: Process the data into our InfluencerAnalytics format
        const mediaPosts: InstagramMedia[] = businessDiscovery.media?.data || [];

        let totalLikes = 0;
        let totalComments = 0;
        let topPost: InstagramMedia | null = null;
        let maxEngagement = 0;

        mediaPosts.forEach(post => {
            const likes = post.like_count || 0;
            const comments = post.comments_count || 0;
            const engagement = likes + comments;

            totalLikes += likes;
            totalComments += comments;

            if (engagement > maxEngagement) {
                maxEngagement = engagement;
                topPost = post;
            }
        });

        // Note: Business Discovery doesn't give us "views" or "reach" for other people's posts
        // So we can only calculate engagement based on likes and comments
        const averageLikes = mediaPosts.length > 0 ? Math.round(totalLikes / mediaPosts.length) : 0;
        const averageComments = mediaPosts.length > 0 ? Math.round(totalComments / mediaPosts.length) : 0;

        // Engagement rate: (Average Likes + Average Comments) / Followers * 100
        const engagementRate = businessDiscovery.followers_count
            ? parseFloat((((totalLikes + totalComments) / (mediaPosts.length || 1)) / businessDiscovery.followers_count * 100).toFixed(2))
            : 0;

        return {
            handle: `@${businessDiscovery.username}`,
            name: businessDiscovery.name || businessDiscovery.username,
            followers: businessDiscovery.followers_count || 0,
            totalPosts: businessDiscovery.media_count || 0,
            averageViews: 0, // Not available via Business Discovery
            averageLikes,
            averageComments,
            engagementRate,
            topPerformingPost: topPost ? {
                url: topPost.permalink,
                views: 0, // Not available
                likes: topPost.like_count || 0
            } : null,
            recentPosts: mediaPosts,
            calculatedAt: new Date().toISOString(),
            profile_picture_url: businessDiscovery.profile_picture_url
        };

    } catch (error) {
        console.error(`Error fetching data for @${targetUsername}:`, error);
        throw error;
    }
}
