module.exports=[96219,e=>e.a(async(r,t)=>{try{let r=await e.y("@google/generative-ai");e.n(r),t()}catch(e){t(e)}},!0),56392,e=>e.a(async(r,t)=>{try{var n=e.i(96219),o=r([n]);[n]=o.then?(await o)():o;let s=process.env.GEMINI_API_KEY||"";s||console.warn("GEMINI_API_KEY not found in environment variables");let c=new n.GoogleGenerativeAI(s),d={flash:"gemini-2.0-flash-exp",pro:"gemini-1.5-pro-latest"};async function a(e,r={}){let{modelType:t="flash",temperature:n=.7,maxTokens:o=8192,systemInstruction:i}=r;try{let r=(function(e="flash"){return c.getGenerativeModel({model:d[e]})})(t).startChat({generationConfig:{temperature:n,maxOutputTokens:o},history:i?[{role:"user",parts:[{text:i}]},{role:"model",parts:[{text:"Understood. I will follow these instructions."}]}]:[]}),a=await r.sendMessage(e);return(await a.response).text()}catch(r){throw console.error("Gemini API Error:",{message:r instanceof Error?r.message:"Unknown error",stack:r instanceof Error?r.stack:void 0,prompt:e.substring(0,100)+"...",timestamp:new Date().toISOString()}),Error(`AI generation failed: ${r instanceof Error?r.message:"Unknown error"}`)}}async function i(e,r,t={}){let n=`You are a JSON API. Always respond with valid JSON matching this schema: ${r}. Never include markdown formatting or explanations, only raw JSON.`,o=await a(e,{...t,systemInstruction:n,temperature:t.temperature??.3});try{let e=o.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(e)}catch(e){throw console.error("Failed to parse AI response as JSON:",o),Error("AI returned invalid JSON")}}e.s(["generateAIResponse",()=>a,"generateStructuredResponse",()=>i]),t()}catch(e){t(e)}},!1),94779,e=>{"use strict";async function r(e){try{let r=e.headers.authorization;if(!r||!r.startsWith("Bearer "))return!1;let t=r.split("Bearer ")[1],n=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:t})}),o=await n.json();if(!o.users||0===o.users.length)return!1;return"fluency400533@gmail.com"===o.users[0].email}catch(e){return console.error("Error verifying admin:",e),!1}}e.s(["verifyAdmin",()=>r])},3981,e=>e.a(async(r,t)=>{try{var n=e.i(56392),o=r([n]);async function a(e){var r;let t,o=(t=(r=e).budget/r.totalCreators,`You are an expert influencer marketing analyst specializing in ROI prediction. Analyze this campaign and provide realistic projections.

CAMPAIGN PARAMETERS:
- Industry: ${r.industry}
- Total Budget: $${r.budget.toLocaleString()}
- Campaign Type: ${r.campaignType}
- Duration: ${r.duration} days
- Creator Tier: ${r.creatorTier}
- Number of Creators: ${r.totalCreators}
- Budget per Creator: $${t.toLocaleString()}
- Average Followers per Creator: ${r.averageFollowers.toLocaleString()}
- Average Engagement Rate: ${r.averageEngagementRate}%
- Platform: ${r.platform}
- Target Audience Size: ${r.targetAudience.size.toLocaleString()}
- Target Demographics: ${r.targetAudience.demographics}
${r.historicalData?`- Previous Campaigns: ${r.historicalData.previousCampaigns}
- Historical Average ROI: ${r.historicalData.averageROI}%`:""}

INDUSTRY BENCHMARKS TO CONSIDER:
- ${r.industry} typical conversion rates
- ${r.platform} engagement patterns
- ${r.creatorTier} creator performance
- ${r.campaignType} expected outcomes

PREDICTION REQUIREMENTS:

1. ROI PREDICTION:
   - predictedROI: Expected ROI as percentage (e.g., 340 for 340% ROI)
   - confidenceLevel: "high" (80%+ confidence), "medium" (50-79%), "low" (<50%)
   - confidenceScore: Numerical confidence (0-100)

2. PROJECTED METRICS:
   - projectedReach: Unique people reached
   - projectedImpressions: Total views
   - projectedEngagement: Likes + comments + shares
   - projectedClicks: Click-throughs to brand
   - projectedConversions: Actual purchases/signups
   - projectedRevenue: Total revenue generated ($)

3. COST BREAKDOWN:
   - costPerImpression: CPM
   - costPerClick: CPC
   - costPerConversion: Cost per acquisition
   - conversionRate: Percentage of clicks that convert

4. OPTIMIZATIONS (3-5 suggestions):
   Specific ways to improve campaign performance

5. RISKS (2-4 items):
   Potential challenges or concerns

6. RECOMMENDATIONS (3-5 items):
   Actionable advice for maximizing ROI

7. TIMELINE PROJECTION (4 weeks):
   For each week, estimate:
   - Cumulative reach
   - Cumulative conversions

CALCULATION GUIDELINES:
- Use realistic industry benchmarks
- Account for creator tier and engagement rates
- Consider platform-specific performance
- Factor in campaign type objectives
- Be conservative but optimistic
- Ensure revenue > budget for positive ROI

Example ROI calculation:
ROI = ((Revenue - Budget) / Budget) \xd7 100

Make predictions data-driven and realistic.`),a=await (0,n.generateStructuredResponse)(o,`{
      "predictedROI": number,
      "confidenceLevel": "high" | "medium" | "low",
      "confidenceScore": number (0-100),
      "projectedReach": number,
      "projectedImpressions": number,
      "projectedEngagement": number,
      "projectedClicks": number,
      "projectedConversions": number,
      "projectedRevenue": number,
      "costPerImpression": number,
      "costPerClick": number,
      "costPerConversion": number,
      "conversionRate": number,
      "optimizations": string[],
      "risks": string[],
      "recommendations": string[],
      "week1Reach": number,
      "week1Conversions": number,
      "week2Reach": number,
      "week2Conversions": number,
      "week3Reach": number,
      "week3Conversions": number,
      "week4Reach": number,
      "week4Conversions": number
    }`,{temperature:.3});return{predictedROI:a.predictedROI,confidenceLevel:a.confidenceLevel,confidenceScore:a.confidenceScore,projectedMetrics:{reach:a.projectedReach,impressions:a.projectedImpressions,engagement:a.projectedEngagement,clicks:a.projectedClicks,conversions:a.projectedConversions,revenue:a.projectedRevenue},breakdown:{costPerImpression:a.costPerImpression,costPerClick:a.costPerClick,costPerConversion:a.costPerConversion,conversionRate:a.conversionRate},optimizations:a.optimizations,risks:a.risks,recommendations:a.recommendations,timelineProjection:{week1:{reach:a.week1Reach,conversions:a.week1Conversions},week2:{reach:a.week2Reach,conversions:a.week2Conversions},week3:{reach:a.week3Reach,conversions:a.week3Conversions},week4:{reach:a.week4Reach,conversions:a.week4Conversions}},generatedAt:new Date}}[n]=o.then?(await o)():o,e.s(["predictROI",()=>a]),t()}catch(e){t(e)}},!1),12822,e=>e.a(async(r,t)=>{try{var n=e.i(94779),o=e.i(3981),a=r([o]);async function i(e,r){if("POST"!==e.method)return r.status(405).json({success:!1,error:"Method not allowed"});if(!await (0,n.verifyAdmin)(e))return r.status(403).json({success:!1,error:"Unauthorized: Admin access required"});try{let{campaignParameters:t}=e.body;if(!t||!t.industry||!t.budget)return r.status(400).json({success:!1,error:"Invalid campaign parameters. Required: industry, budget"});let n=await (0,o.predictROI)(t);return r.status(200).json({success:!0,data:{predictedROI:n.predictedROI,confidenceLevel:n.confidenceLevel,confidenceScore:n.confidenceScore,projectedMetrics:n.projectedMetrics,breakdown:n.breakdown,optimizations:n.optimizations,risks:n.risks,recommendations:n.recommendations,timelineProjection:n.timelineProjection}})}catch(e){return console.error("ROI prediction error:",e),r.status(500).json({success:!1,error:e instanceof Error?e.message:"Internal server error"})}}[o]=a.then?(await a)():a,e.s(["default",()=>i]),t()}catch(e){t(e)}},!1),39729,e=>e.a(async(r,t)=>{try{var n=e.i(26747),o=e.i(90406),a=e.i(44898),i=e.i(62950),s=e.i(12822),c=e.i(7031),d=e.i(81927),l=e.i(46432),u=r([s]);[s]=u.then?(await u)():u;let m=(0,i.hoist)(s,"default"),g=(0,i.hoist)(s,"config"),v=new a.PagesAPIRouteModule({definition:{kind:o.RouteKind.PAGES_API,page:"/api/ai/predict-roi",pathname:"/api/ai/predict-roi",bundlePath:"",filename:""},userland:s,distDir:".next",relativeProjectDir:""});async function p(e,r,t){v.isDev&&(0,l.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let o="/api/ai/predict-roi";o=o.replace(/\/index$/,"")||"/";let a=await v.prepare(e,r,{srcPage:o});if(!a){r.statusCode=400,r.end("Bad Request"),null==t.waitUntil||t.waitUntil.call(t,Promise.resolve());return}let{query:i,params:s,prerenderManifest:u,routerServerContext:p}=a;try{let t=e.method||"GET",n=(0,c.getTracer)(),a=n.getActiveScopeSpan(),l=v.instrumentationOnRequestError.bind(v),m=async a=>v.render(e,r,{query:{...i,...s},params:s,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:u.preview,propagateError:!1,dev:v.isDev,page:"/api/ai/predict-roi",internalRevalidate:null==p?void 0:p.revalidate,onError:(...r)=>l(e,...r)}).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=n.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=e.get("next.route");if(i){let e=`${t} ${i}`;a.setAttributes({"next.route":i,"http.route":i,"next.span_name":e}),a.updateName(e)}else a.updateName(`${t} ${o}`)});a?await m(a):await n.withPropagatedContext(e.headers,()=>n.trace(d.BaseServerSpan.handleRequest,{spanName:`${t} ${o}`,kind:c.SpanKind.SERVER,attributes:{"http.method":t,"http.target":e.url}},m))}catch(e){if(v.isDev)throw e;(0,n.sendError)(r,500,"Internal Server Error")}finally{null==t.waitUntil||t.waitUntil.call(t,Promise.resolve())}}e.s(["config",0,g,"default",0,m,"handler",()=>p]),t()}catch(e){t(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__a3ed18b7._.js.map