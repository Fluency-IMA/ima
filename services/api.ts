
/**
 * FLUENCY AIM PLATFORM - API SERVICE
 * 
 * Implements the 3-Stage Custom AI Logic:
 * 1. Verification (Hunter)
 * 2. Strategy (Strategist)
 * 3. Precision Matching (Matchmaker)
 * 4. Relationship Automation (AI-CARA)
 * 5. Wingman (Gemini/NotebookLM)
 */

import { Creator, RiskReport, Lead, CRMField } from '../types';

// --- MOCK DATABASE ---
const MOCK_CREATORS: Creator[] = [
    { id: '1', name: 'Sarah Jenkins', handle: '@sarahj_style', avatar: 'S', platform: 'instagram', followers: 1200000, engagementRate: 4.8, location: 'London, UK', niche: 'Fashion', riskScore: 12, aqs: 88, tier: 'Macro' },
    { id: '2', name: 'Tech Breakdown', handle: '@techbreak', avatar: 'T', platform: 'youtube', followers: 850000, engagementRate: 6.2, location: 'Austin, USA', niche: 'Technology', riskScore: 5, aqs: 92, tier: 'Macro' },
    { id: '3', name: 'Chef Mario', handle: '@mario_eats', avatar: 'M', platform: 'tiktok', followers: 2100000, engagementRate: 3.1, location: 'Rome, IT', niche: 'Food', riskScore: 8, aqs: 75, tier: 'Mega' },
    { id: '4', name: 'Yoga with Jen', handle: '@jen_flow', avatar: 'J', platform: 'instagram', followers: 45000, engagementRate: 8.5, location: 'Bali, ID', niche: 'Health', riskScore: 2, aqs: 96, tier: 'Micro' },
    { id: '5', name: 'GameZone', handle: '@gamezone_official', avatar: 'G', platform: 'twitch', followers: 3400000, engagementRate: 12.0, location: 'Seoul, KR', niche: 'Gaming', riskScore: 15, aqs: 82, tier: 'Mega' },
    { id: '6', name: 'Eco Living', handle: '@ecolife', avatar: 'E', platform: 'instagram', followers: 12000, engagementRate: 5.5, location: 'Berlin, DE', niche: 'Sustainability', riskScore: 1, aqs: 98, tier: 'Nano' },
    { id: '7', name: 'Tokyo Trends', handle: '@tokyo_daily', avatar: 'TY', platform: 'tiktok', followers: 2800000, engagementRate: 9.2, location: 'Tokyo, Japan', niche: 'Lifestyle', riskScore: 3, aqs: 91, tier: 'Mega' },
    { id: '8', name: 'Parisian Chic', handle: '@marie_fr', avatar: 'P', platform: 'instagram', followers: 670000, engagementRate: 4.1, location: 'Paris, France', niche: 'Fashion', riskScore: 10, aqs: 85, tier: 'Mid-Tier' }
];

// --- API FUNCTIONS ---

/**
 * CUSTOM AI 3: FRAUD & AUTHENTICITY VETTING
 * Calculates Audience Quality Score (AQS) and Bot %
 * 
 * UPDATE: Uses DETERMINISTIC LOGIC to simulate "Free API" checks.
 * It analyzes the string pattern instead of randomizing.
 */
export const scanCreatorProfile = async (handle: string): Promise<RiskReport> => {
    // Simulate AI Processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const cleanHandle = handle.toLowerCase().replace('@', '').trim();

    // 1. FREE LOGIC: Check for "Bot-like" patterns in username
    const hasManyNumbers = (cleanHandle.match(/\d/g) || []).length > 4; // e.g. user129384
    const isTooLong = cleanHandle.length > 18;
    const hasSuspiciousKeywords = cleanHandle.includes('bot') || cleanHandle.includes('promo') || cleanHandle.includes('free');

    // Calculate Risk based on patterns
    let riskScore = 5; // Start low
    if (hasManyNumbers) riskScore += 60;
    if (isTooLong) riskScore += 20;
    if (hasSuspiciousKeywords) riskScore += 50;

    // Cap score
    riskScore = Math.min(99, Math.max(1, riskScore));
    const aqs = 100 - riskScore;

    // Verdict Logic
    let verdict: 'VERIFIED' | 'FLAGGED' | 'WARNING' = 'VERIFIED';
    if (riskScore > 70) verdict = 'FLAGGED';
    else if (riskScore > 30) verdict = 'WARNING';

    return {
        handle,
        verdict,
        riskScore,
        aqs,
        botPercentage: parseFloat((riskScore * 0.4).toFixed(1)),
        audienceLocation: riskScore > 50 ? 'High Risk Regions (Unknown)' : 'Top Tier (USA/EU/UK)',
        realFollowers: riskScore > 50 ? 0 : Math.floor(Math.random() * 50000) + 1000,
        engagementAuthenticity: riskScore > 50 ? 'Low (Pattern Matches Bot Farm)' : 'High (Organic Patterns Detected)',
        lastScan: new Date().toISOString()
    };
};

/**
 * CUSTOM AI 3: PRECISION MATCHING
 * Filters by AQS, Engagement, and Geo-Location
 */
export const searchInfluencers = async (
    query: string,
    country: string,
    minFollowers: number,
    minEngagement: number
): Promise<Creator[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let results = MOCK_CREATORS.filter(c =>
        c.followers >= minFollowers &&
        c.engagementRate >= minEngagement
    );

    if (country && country !== 'All') {
        results = results.filter(c => c.location.includes(country));
    }

    if (query) {
        const q = query.toLowerCase();
        results = results.filter(c =>
            c.niche.toLowerCase().includes(q) ||
            c.handle.toLowerCase().includes(q)
        );
    }

    return results.map(c => ({
        ...c,
        matchScore: Math.floor(Math.random() * (99 - 75) + 75)
    }));
};

export const getAllCreators = async (): Promise<Creator[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_CREATORS;
};

/**
 * CUSTOM AI 1 & 2: VERIFICATION & STRATEGY GENERATION
 */
export const generateMockLead = (): Lead => {
    const companies = ['Apex Dynamics', 'Blue Ocean', 'Solaris AI', 'Velvet & Co', 'Zenith Gear', 'Nova Soft'];
    const needs = ['Growth Hacking', 'UGC', 'Influencer Seeding', 'Brand Launch'];

    // Custom AI 2: Strategy Generation Logic
    const strategies = [
        "Increase brand mentions by 25% among female millennials.",
        "Drive 500+ direct conversions via Story Links.",
        "Generate 50 pieces of UGC for paid ads.",
        "Establish authority in the EU tech market."
    ];

    const rand = Math.random();
    let urgency: 'High' | 'Medium' | 'Low' = 'Low';
    let websiteGrade: 'A+' | 'B' | 'C' | 'D' = 'C';
    let legitimacy = 50;

    if (rand > 0.7) {
        urgency = 'High';
        websiteGrade = 'A+';
        legitimacy = 98;
    } else if (rand > 0.4) {
        urgency = 'Medium';
        websiteGrade = 'B';
        legitimacy = 85;
    }

    return {
        id: Date.now(),
        company: companies[Math.floor(Math.random() * companies.length)],
        website: 'www.business.com',
        budget: 'Negotiable',
        need: needs[Math.floor(Math.random() * needs.length)],
        urgency: urgency,
        status: 'New',
        timestamp: Date.now(),
        isNew: true,
        // AI Generated Fields
        websiteGrade: websiteGrade,
        legitimacyScore: legitimacy,
        smartGoal: strategies[Math.floor(Math.random() * strategies.length)],
        recommendedTier: rand > 0.5 ? 'Micro' : 'Macro'
    };
};

/**
 * AI-CARA: CLIENT ACQUISITION AND RELATIONSHIP AUTOMATION
 */

export const getInitialCRMData = (): CRMField[] => [
    { key: 'company', label: 'Company Name', value: null, status: 'pending' },
    { key: 'domain', label: 'Domain Legitimacy', value: null, status: 'pending' },
    { key: 'goal', label: 'Primary Goal (SMART)', value: null, status: 'pending' },
    { key: 'audience', label: 'Target Audience', value: null, status: 'pending' },
    { key: 'budget', label: 'Estimated Budget', value: null, status: 'pending' },
    { key: 'timeline', label: 'Campaign Timeline', value: null, status: 'pending' },
];

export const simulateAICaraChat = async (input: string, currentData: CRMField[]): Promise<{ response: string, updates: Partial<CRMField>[] }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerInput = input.toLowerCase();
    const updates: Partial<CRMField>[] = [];
    let response = "I've noted that. Could you tell me more about your requirements?";

    if (lowerInput.includes('company') || lowerInput.includes('brand')) {
        updates.push({ key: 'company', value: 'Extracted from Chat', status: 'verified' });
        updates.push({ key: 'domain', value: 'Verified (DNS/SSL)', status: 'verified' });
    }

    if (lowerInput.includes('awareness') || lowerInput.includes('sales') || lowerInput.includes('conversion')) {
        updates.push({ key: 'goal', value: input, status: 'verified' });
        response = "Understood. I've updated the CRM with your strategic goal. What is your approximate budget for this campaign?";
    } else if (lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('how much')) {
        response = "All engagements are custom-scoped based on your goals. We will discuss the budget during the strategy phase.";
    } else if (lowerInput.includes('$') || lowerInput.includes('budget') || lowerInput.includes('k')) {
        updates.push({ key: 'budget', value: input, status: 'verified' });
        response = "Budget recorded. Finally, what is your target timeline for launch?";
    } else if (lowerInput.includes('week') || lowerInput.includes('month') || lowerInput.includes('asap')) {
        updates.push({ key: 'timeline', value: input, status: 'verified' });
        response = "Thank you. I have fully populated your CRM profile. A strategist will review this data and approve your dedicated workspace shortly.";
    }

    return { response, updates };
};

/**
 * CLIENT APPLICATION REVIEW (AI Grading)
 * UPDATE: Uses Deterministic Logic to check URLs for free.
 */
export const reviewApplication = async (userType: 'brand' | 'creator', url: string): Promise<{ trustScore: number, strategicGrade: string, notes: string[] }> => {
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 1. FREE LOGIC: Analyze URL structure
    const cleanUrl = url.toLowerCase().trim();
    const hasProtocol = cleanUrl.startsWith('http');
    const isSecure = cleanUrl.startsWith('https');
    const isStandardDomain = cleanUrl.includes('.com') || cleanUrl.includes('.io') || cleanUrl.includes('.co');
    const isSuspicious = cleanUrl.includes('test') || cleanUrl.includes('temp') || cleanUrl.length < 5;

    let trustScore = 50; // Base

    if (hasProtocol) trustScore += 10;
    if (isSecure) trustScore += 20;
    if (isStandardDomain) trustScore += 15;
    if (isSuspicious) trustScore -= 40;

    // Cap score
    trustScore = Math.min(99, Math.max(1, trustScore));

    const strategicGrade = trustScore > 85 ? 'A' : (trustScore > 70 ? 'B' : 'C');

    let notes = [];
    if (userType === 'brand') {
        if (isSecure) notes.push('SSL Certificate Detected (Secure)');
        else notes.push('No SSL Certificate Detected (Insecure)');

        if (isStandardDomain) notes.push('Valid Top-Level Domain');
        else notes.push('Uncommon Domain Extension');

        if (trustScore > 80) notes.push('Corporate Registry Match Likely');
        notes.push('Social Sentiment Analysis: Neutral/Positive');
    } else {
        // Creator Logic
        if (url.includes('instagram') || url.includes('tiktok') || url.includes('youtube')) {
            notes.push('Valid Platform URL Detected');
            notes.push('Audience Authenticity > 85% (Estimated)');
        } else {
            notes.push('Unknown Platform URL');
            notes.push('Unable to verify audience data');
        }
        notes.push('Content Safety Check Passed');
    }

    return {
        trustScore,
        strategicGrade,
        notes
    };
};

/**
 * WINGMAN AI: GEMINI & NOTEBOOKLM SIMULATION
 * 
 * 1. Rewrite: Simulates Gemini Pro cleaning up text.
 * 2. Analyze: Simulates NotebookLM generating audio overview/summary from docs.
 */

export const wingmanRewrite = async (text: string, mode: 'grammar' | 'corporate'): Promise<string> => {
    // Simulate AI Latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simple deterministic rewriting for the demo
    if (mode === 'corporate') {
        return `Dear Team,\n\nI am writing to respectfully request an update regarding the matter of: "${text}".\n\nYour prompt attention to this would be greatly appreciated.\n\nBest regards,\n[Your Name]`;
    }

    // Grammar Mode (Simple capitalization logic for demo)
    return text.charAt(0).toUpperCase() + text.slice(1) + (text.endsWith('.') ? '' : '.');
};

export const wingmanAnalyze = async (fileName: string): Promise<{ summary: string, audioOverview: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
        summary: `Analysis of ${fileName}:\n\n• Key Trend: Increased Q3 Engagement (+15%)\n• Risk Factor: Minor sentiment dip in EU market.\n• Recommendation: Increase budget for video-first content.\n\nSources verified against internal database.`,
        audioOverview: true
    };
};

export const wingmanQnA = async (question: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `Based on the uploaded documents, the answer is: The primary KPI for Q3 was 'Brand Awareness', which we exceeded by 12%.`;
}