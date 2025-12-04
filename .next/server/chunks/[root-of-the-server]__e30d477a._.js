module.exports=[98104,e=>e.a(async(t,a)=>{try{let t=await e.y("firebase/app");e.n(t),a()}catch(e){a(e)}},!0),90640,e=>e.a(async(t,a)=>{try{let t=await e.y("firebase/auth");e.n(t),a()}catch(e){a(e)}},!0),39196,e=>e.a(async(t,a)=>{try{let t=await e.y("firebase/firestore");e.n(t),a()}catch(e){a(e)}},!0),79361,e=>e.a(async(t,a)=>{try{let t=await e.y("firebase/analytics");e.n(t),a()}catch(e){a(e)}},!0),12037,e=>e.a(async(t,a)=>{try{var r=e.i(56392),n=e.i(50037),i=e.i(39196),o=t([r,n,i]);async function s(e){var t;let{creatorId:a}=e,n=await c(a);if(n&&n.expiresAt>new Date)return console.log("Returning cached audience analysis for:",a),n;let i=(t=e,`You are an expert audience analyst for influencer marketing. Analyze this creator's audience to extract demographics, interests, and brand fit.

CREATOR DATA:
- Creator ID: ${t.creatorId}
- Platform: ${t.platform}
- Total Followers: ${t.followers.toLocaleString()}
${t.contentTopics?`- Content Topics: ${t.contentTopics.join(", ")}`:""}
${t.engagementPatterns?.activeRegions?`- Active Regions: ${t.engagementPatterns.activeRegions.join(", ")}`:""}

${t.sampleComments?`SAMPLE AUDIENCE COMMENTS (for sentiment/demographic analysis):
${t.sampleComments.slice(0,20).map((e,t)=>`${t+1}. ${e}`).join("\n")}`:""}

ANALYSIS REQUIREMENTS:

1. DEMOGRAPHICS:
   - Estimate age distribution (percentages must sum to 100)
   - Estimate gender split (percentages must sum to 100)
   - Identify top 5 countries/regions with percentages
   - Extract key interests from content and engagement

2. BRAND FIT SCORES (0-100 for each industry):
   - ecommerce: How well does this audience fit e-commerce brands?
   - saas: Software/tech products
   - cpg: Consumer packaged goods
   - fashion: Fashion and beauty brands
   - tech: Technology products
   - healthcare: Health and wellness
   - finance: Financial services
   - travel: Travel and hospitality

3. AUDIENCE QUALITY:
   - engagementLevel: "high" (very active), "medium" (moderately active), "low" (passive)
   - purchasingPower: "high" (affluent), "medium" (middle class), "low" (budget-conscious)
   - brandAffinity: 0-100 score for how receptive audience is to brand partnerships

4. INSIGHTS:
   Provide 2-3 sentences of actionable insights about this audience for brands.

ESTIMATION GUIDELINES:
- Use platform norms for ${t.platform}
- Consider content topics and engagement patterns
- Be realistic and data-driven
- Acknowledge uncertainty where appropriate`),o=await (0,r.generateStructuredResponse)(i,`{
      "ageRanges": {
        "13-17": number,
        "18-24": number,
        "25-34": number,
        "35-44": number,
        "45-54": number,
        "55+": number
      },
      "genderSplit": {
        "male": number,
        "female": number,
        "other": number
      },
      "topLocations": [
        {
          "country": string,
          "percentage": number
        }
      ],
      "interests": string[],
      "brandFitScores": {
        "ecommerce": number,
        "saas": number,
        "cpg": number,
        "fashion": number,
        "tech": number,
        "healthcare": number,
        "finance": number,
        "travel": number
      },
      "engagementLevel": "high" | "medium" | "low",
      "purchasingPower": "high" | "medium" | "low",
      "brandAffinity": number,
      "insights": string
    }`,{temperature:.4}),s={creatorId:a,analyzedAt:new Date,demographics:{ageRanges:o.ageRanges,genderSplit:o.genderSplit,topLocations:o.topLocations,interests:o.interests},brandFitScores:o.brandFitScores,audienceQuality:{engagementLevel:o.engagementLevel,purchasingPower:o.purchasingPower,brandAffinity:o.brandAffinity},insights:o.insights,expiresAt:new Date(Date.now()+6048e5)};return await l(s),s}async function c(e){try{let t=(0,i.doc)(n.db,"ai_audience_analyses",e),a=await (0,i.getDoc)(t);if(a.exists()){let e=a.data();return{...e,analyzedAt:e.analyzedAt.toDate(),expiresAt:e.expiresAt.toDate()}}return null}catch(e){return console.error("Error fetching cached analysis:",e),null}}async function l(e){try{let t=(0,i.doc)(n.db,"ai_audience_analyses",e.creatorId);await (0,i.setDoc)(t,{...e,analyzedAt:i.Timestamp.fromDate(e.analyzedAt),expiresAt:i.Timestamp.fromDate(e.expiresAt)})}catch(e){console.error("Error caching analysis:",e)}}[r,n,i]=o.then?(await o)():o,e.s(["analyzeAudience",()=>s]),a()}catch(e){a(e)}},!1),96219,e=>e.a(async(t,a)=>{try{let t=await e.y("@google/generative-ai");e.n(t),a()}catch(e){a(e)}},!0),56392,e=>e.a(async(t,a)=>{try{var r=e.i(96219),n=t([r]);[r]=n.then?(await n)():n;let s=process.env.GEMINI_API_KEY||"";s||console.warn("GEMINI_API_KEY not found in environment variables");let c=new r.GoogleGenerativeAI(s),l={flash:"gemini-2.0-flash-exp",pro:"gemini-1.5-pro-latest"};async function i(e,t={}){let{modelType:a="flash",temperature:r=.7,maxTokens:n=8192,systemInstruction:o}=t;try{let t=(function(e="flash"){return c.getGenerativeModel({model:l[e]})})(a).startChat({generationConfig:{temperature:r,maxOutputTokens:n},history:o?[{role:"user",parts:[{text:o}]},{role:"model",parts:[{text:"Understood. I will follow these instructions."}]}]:[]}),i=await t.sendMessage(e);return(await i.response).text()}catch(t){throw console.error("Gemini API Error:",{message:t instanceof Error?t.message:"Unknown error",stack:t instanceof Error?t.stack:void 0,prompt:e.substring(0,100)+"...",timestamp:new Date().toISOString()}),Error(`AI generation failed: ${t instanceof Error?t.message:"Unknown error"}`)}}async function o(e,t,a={}){let r=`You are a JSON API. Always respond with valid JSON matching this schema: ${t}. Never include markdown formatting or explanations, only raw JSON.`,n=await i(e,{...a,systemInstruction:r,temperature:a.temperature??.3});try{let e=n.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(e)}catch(e){throw console.error("Failed to parse AI response as JSON:",n),Error("AI returned invalid JSON")}}e.s(["generateAIResponse",()=>i,"generateStructuredResponse",()=>o]),a()}catch(e){a(e)}},!1),94779,e=>{"use strict";async function t(e){try{let t=e.headers.authorization;if(!t||!t.startsWith("Bearer "))return!1;let a=t.split("Bearer ")[1],r=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:a})}),n=await r.json();if(!n.users||0===n.users.length)return!1;return"fluency400533@gmail.com"===n.users[0].email}catch(e){return console.error("Error verifying admin:",e),!1}}e.s(["verifyAdmin",()=>t])},50037,e=>e.a(async(t,a)=>{try{var r=e.i(98104),n=e.i(90640),i=e.i(39196),o=e.i(79361),s=t([r,n,i,o]);[r,n,i,o]=s.then?(await s)():s;let c=(0,r.getApps)().length?(0,r.getApp)():(0,r.initializeApp)({apiKey:"AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",authDomain:"fluency-2398a.firebaseapp.com",projectId:"fluency-2398a",storageBucket:"fluency-2398a.firebasestorage.app",messagingSenderId:"100189578936",appId:"1:100189578936:web:04e43cd1cc146087a7f64d",measurementId:"G-Q94TQN9HBS"});(0,n.getAuth)(c);let l=(0,i.getFirestore)(c);e.s(["db",()=>l]),a()}catch(e){a(e)}},!1),93689,e=>e.a(async(t,a)=>{try{var r=e.i(56392),n=e.i(50037),i=e.i(39196),o=t([r,n,i]);async function s(e){var t,a,n,i;let o=`${e.platform}_${e.username}`,s=await c(o);if(s&&s.expiresAt>new Date)return console.log("Returning cached verification for:",o),s;let m=(t=e,0===t.followers?0:(t.averageLikes+t.averageComments)/t.followers*100),u=e.followers/Math.max(e.following,1),d=(a=e,n=m,i=u,`You are an expert influencer marketing analyst. Analyze this creator profile for authenticity and detect fake followers or engagement.

CREATOR PROFILE:
- Platform: ${a.platform}
- Username: @${a.username}
- Followers: ${a.followers.toLocaleString()}
- Following: ${a.following.toLocaleString()}
- Total Posts: ${a.totalPosts}
- Average Likes: ${a.averageLikes.toLocaleString()}
- Average Comments: ${a.averageComments.toLocaleString()}
- Engagement Rate: ${n.toFixed(2)}%
- Follower/Following Ratio: ${i.toFixed(2)}
- Account Age: ${a.accountAge||"Unknown"} months
- Verified Badge: ${a.verifiedBadge?"Yes":"No"}
${a.bio?`- Bio: ${a.bio}`:""}

${a.recentPosts?`RECENT POSTS ENGAGEMENT:
${a.recentPosts.map((e,t)=>`Post ${t+1}: ${e.likes} likes, ${e.comments} comments (${e.engagement.toFixed(2)}% engagement)`).join("\n")}`:""}

ANALYSIS CRITERIA:
1. Follower Quality (0-100): Assess likelihood of real vs. fake followers based on follower/following ratio, engagement rate, and account age
2. Engagement Authenticity (0-100): Analyze if engagement (likes, comments) is genuine or artificially inflated
3. Content Consistency (0-100): Evaluate posting frequency and engagement consistency
4. Audience Relevance (0-100): Assess if the audience appears real and engaged

RED FLAGS TO DETECT:
- Sudden follower spikes
- Very low engagement rate (<1% is suspicious for ${a.platform})
- High follower count but low engagement
- Follower/following ratio issues
- Inconsistent engagement patterns
- Bot-like comment patterns

SCORING GUIDELINES:
- 80-100: Highly authentic, verified quality creator
- 60-79: Mostly authentic, some minor concerns
- 40-59: Moderate concerns, needs review
- 0-39: High risk of fake followers/engagement

RECOMMENDATION:
- "approved": Score 70+, minimal red flags
- "review": Score 40-69, some concerns
- "rejected": Score <40, major red flags

Provide a comprehensive analysis with specific red flags if found.`),g=await (0,r.generateStructuredResponse)(d,`{
      "authenticityScore": number (0-100),
      "followerQuality": number (0-100),
      "engagementAuthenticity": number (0-100),
      "contentConsistency": number (0-100),
      "audienceRelevance": number (0-100),
      "redFlags": string[],
      "detailedAnalysis": string,
      "recommendation": "approved" | "review" | "rejected"
    }`,{temperature:.3}),p={creatorId:o,authenticityScore:g.authenticityScore,verifiedAt:new Date,redFlags:g.redFlags,analysis:{followerQuality:g.followerQuality,engagementAuthenticity:g.engagementAuthenticity,contentConsistency:g.contentConsistency,audienceRelevance:g.audienceRelevance},report:g.detailedAnalysis,recommendation:g.recommendation,expiresAt:new Date(Date.now()+6048e5)};return await l(p),p}async function c(e){try{let t=(0,i.doc)(n.db,"ai_creator_verifications",e),a=await (0,i.getDoc)(t);if(a.exists()){let e=a.data();return{...e,verifiedAt:e.verifiedAt.toDate(),expiresAt:e.expiresAt.toDate()}}return null}catch(e){return console.error("Error fetching cached verification:",e),null}}async function l(e){try{let t=(0,i.doc)(n.db,"ai_creator_verifications",e.creatorId);await (0,i.setDoc)(t,{...e,verifiedAt:i.Timestamp.fromDate(e.verifiedAt),expiresAt:i.Timestamp.fromDate(e.expiresAt)})}catch(e){console.error("Error caching verification:",e)}}[r,n,i]=o.then?(await o)():o,e.s(["verifyCreator",()=>s]),a()}catch(e){a(e)}},!1),89259,e=>e.a(async(t,a)=>{try{var r=e.i(56392),n=e.i(93689),i=e.i(12037),o=t([r,n,i]);async function s(e,t){let a=[],r=t.filter(t=>(!e.minimumFollowers||!(t.followers<e.minimumFollowers))&&(!e.maximumFollowers||!(t.followers>e.maximumFollowers))&&(!e.platforms||!!e.platforms.includes(t.platform)));for(let t of r)try{let r=await c(e,t);r.compatibilityScore>=50&&a.push(r)}catch(e){console.error(`Error analyzing creator ${t.username}:`,e)}return a.sort((e,t)=>t.compatibilityScore-e.compatibilityScore),{matches:a.slice(0,20),totalAnalyzed:r.length,matchingCriteria:e,generatedAt:new Date}}async function c(e,t){var a,o,s,c;let l,m=`${t.platform}_${t.username}`,u=await (0,n.verifyCreator)(t),d=null;t.audienceData&&(d=await (0,i.analyzeAudience)(t.audienceData));let g=(a=e,o=t,s=u.authenticityScore,c=d,l=(o.averageLikes+o.averageComments)/o.followers*100,`You are an expert influencer marketing matchmaker. Analyze how well this creator matches the brand's requirements.

BRAND REQUIREMENTS:
- Industry: ${a.industry}
- Budget: $${a.budget.toLocaleString()}
- Campaign Goals: ${a.campaignGoals.join(", ")}
- Target Audience Age: ${a.targetAudience.ageRange||"Any"}
- Target Audience Gender: ${a.targetAudience.gender||"Any"}
- Target Locations: ${a.targetAudience.locations?.join(", ")||"Any"}
- Target Interests: ${a.targetAudience.interests?.join(", ")||"Any"}
${a.brandVoice?`- Brand Voice: ${a.brandVoice}`:""}
${a.contentStyle?`- Preferred Content Style: ${a.contentStyle}`:""}

CREATOR PROFILE:
- Username: @${o.username}
- Platform: ${o.platform}
- Followers: ${o.followers.toLocaleString()}
- Engagement Rate: ${l.toFixed(2)}%
- Authenticity Score: ${s}/100
${o.bio?`- Bio: ${o.bio}`:""}

${c?`AUDIENCE ANALYSIS:
- Age Distribution: ${Object.entries(c.demographics.ageRanges).map(([e,t])=>`${e}: ${t}%`).join(", ")}
- Gender Split: ${Object.entries(c.demographics.genderSplit).map(([e,t])=>`${e}: ${t}%`).join(", ")}
- Top Locations: ${c.demographics.topLocations.map(e=>`${e.country} (${e.percentage}%)`).join(", ")}
- Interests: ${c.demographics.interests.join(", ")}
- Brand Fit Score for ${a.industry}: ${c.brandFitScores[a.industry]||"N/A"}/100
- Engagement Level: ${c.audienceQuality.engagementLevel}
- Purchasing Power: ${c.audienceQuality.purchasingPower}`:""}

ANALYSIS REQUIREMENTS:

1. COMPATIBILITY SCORE (0-100):
   Consider:
   - Audience alignment with brand's target
   - Creator authenticity (${s}/100)
   - Budget fit (typical ${o.platform} pricing)
   - Content style match
   - Campaign goals alignment

2. MATCH REASONS (3-5 bullet points):
   Specific reasons why this creator is a good match

3. ESTIMATED METRICS:
   - estimatedReach: How many people will see the content
   - estimatedEngagement: Expected likes + comments + shares
   - estimatedROI: Expected return on investment as percentage (e.g., 250 = 250% ROI)

4. PRICING ESTIMATE:
   - pricingMin: Minimum expected cost for this creator ($)
   - pricingMax: Maximum expected cost for this creator ($)
   
   Pricing guidelines by platform and followers:
   - Instagram: $100-$500 per 10k followers
   - TikTok: $50-$300 per 10k followers
   - YouTube: $200-$1000 per 10k subscribers
   - Twitter: $50-$200 per 10k followers

5. STRENGTHS (2-4 items):
   Key advantages of working with this creator

6. CONSIDERATIONS (1-3 items):
   Potential concerns or things to consider

Be realistic and data-driven. If compatibility is low, reflect that in the score.`),p=await (0,r.generateStructuredResponse)(g,`{
      "compatibilityScore": number (0-100),
      "matchReasons": string[],
      "estimatedReach": number,
      "estimatedEngagement": number,
      "estimatedROI": number,
      "pricingMin": number,
      "pricingMax": number,
      "strengths": string[],
      "considerations": string[]
    }`,{temperature:.4});return{creatorId:m,username:t.username,platform:t.platform,compatibilityScore:p.compatibilityScore,matchReasons:p.matchReasons,estimatedReach:p.estimatedReach,estimatedEngagement:p.estimatedEngagement,estimatedROI:p.estimatedROI,pricingEstimate:{min:p.pricingMin,max:p.pricingMax},strengths:p.strengths,considerations:p.considerations}}[r,n,i]=o.then?(await o)():o,e.s(["findCreatorMatches",()=>s]),a()}catch(e){a(e)}},!1),55025,e=>e.a(async(t,a)=>{try{var r=e.i(94779),n=e.i(89259),i=t([n]);async function o(e,t){if("POST"!==e.method)return t.status(405).json({success:!1,error:"Method not allowed"});if(!await (0,r.verifyAdmin)(e))return t.status(403).json({success:!1,error:"Unauthorized: Admin access required"});try{let{brandRequirements:a,availableCreators:r}=e.body;if(!a||!a.industry||!a.budget)return t.status(400).json({success:!1,error:"Invalid brand requirements. Required: industry, budget"});if(!r||!Array.isArray(r)||0===r.length)return t.status(400).json({success:!1,error:"No creators provided for matching"});let i=await (0,n.findCreatorMatches)(a,r);return t.status(200).json({success:!0,data:{matches:i.matches,totalAnalyzed:i.totalAnalyzed}})}catch(e){return console.error("Creator matching error:",e),t.status(500).json({success:!1,error:e instanceof Error?e.message:"Internal server error"})}}[n]=i.then?(await i)():i,e.s(["default",()=>o]),a()}catch(e){a(e)}},!1),92373,e=>e.a(async(t,a)=>{try{var r=e.i(26747),n=e.i(90406),i=e.i(44898),o=e.i(62950),s=e.i(55025),c=e.i(7031),l=e.i(81927),m=e.i(46432),u=t([s]);[s]=u.then?(await u)():u;let g=(0,o.hoist)(s,"default"),p=(0,o.hoist)(s,"config"),h=new i.PagesAPIRouteModule({definition:{kind:n.RouteKind.PAGES_API,page:"/api/ai/match-creators",pathname:"/api/ai/match-creators",bundlePath:"",filename:""},userland:s,distDir:".next",relativeProjectDir:""});async function d(e,t,a){h.isDev&&(0,m.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/ai/match-creators";n=n.replace(/\/index$/,"")||"/";let i=await h.prepare(e,t,{srcPage:n});if(!i){t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve());return}let{query:o,params:s,prerenderManifest:u,routerServerContext:d}=i;try{let a=e.method||"GET",r=(0,c.getTracer)(),i=r.getActiveScopeSpan(),m=h.instrumentationOnRequestError.bind(h),g=async i=>h.render(e,t,{query:{...o,...s},params:s,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:u.preview,propagateError:!1,dev:h.isDev,page:"/api/ai/match-creators",internalRevalidate:null==d?void 0:d.revalidate,onError:(...t)=>m(e,...t)}).finally(()=>{if(!i)return;i.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=r.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=e.get("next.route");if(o){let e=`${a} ${o}`;i.setAttributes({"next.route":o,"http.route":o,"next.span_name":e}),i.updateName(e)}else i.updateName(`${a} ${n}`)});i?await g(i):await r.withPropagatedContext(e.headers,()=>r.trace(l.BaseServerSpan.handleRequest,{spanName:`${a} ${n}`,kind:c.SpanKind.SERVER,attributes:{"http.method":a,"http.target":e.url}},g))}catch(e){if(h.isDev)throw e;(0,r.sendError)(t,500,"Internal Server Error")}finally{null==a.waitUntil||a.waitUntil.call(a,Promise.resolve())}}e.s(["config",0,p,"default",0,g,"handler",()=>d]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__e30d477a._.js.map