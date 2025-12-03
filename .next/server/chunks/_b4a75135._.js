module.exports=[94779,e=>{"use strict";async function r(e){try{let r=e.headers.authorization;if(!r||!r.startsWith("Bearer "))return!1;let t=r.split("Bearer ")[1],n=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:t})}),i=await n.json();if(!i.users||0===i.users.length)return!1;return"fluency400533@gmail.com"===i.users[0].email}catch(e){return console.error("Error verifying admin:",e),!1}}e.s(["verifyAdmin",()=>r])},3981,e=>e.a(async(r,t)=>{try{var n=e.i(56392),i=r([n]);async function o(e){var r;let t,i=(t=(r=e).budget/r.totalCreators,`You are an expert influencer marketing analyst specializing in ROI prediction. Analyze this campaign and provide realistic projections.

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

Make predictions data-driven and realistic.`),o=await (0,n.generateStructuredResponse)(i,`{
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
    }`,{temperature:.3});return{predictedROI:o.predictedROI,confidenceLevel:o.confidenceLevel,confidenceScore:o.confidenceScore,projectedMetrics:{reach:o.projectedReach,impressions:o.projectedImpressions,engagement:o.projectedEngagement,clicks:o.projectedClicks,conversions:o.projectedConversions,revenue:o.projectedRevenue},breakdown:{costPerImpression:o.costPerImpression,costPerClick:o.costPerClick,costPerConversion:o.costPerConversion,conversionRate:o.conversionRate},optimizations:o.optimizations,risks:o.risks,recommendations:o.recommendations,timelineProjection:{week1:{reach:o.week1Reach,conversions:o.week1Conversions},week2:{reach:o.week2Reach,conversions:o.week2Conversions},week3:{reach:o.week3Reach,conversions:o.week3Conversions},week4:{reach:o.week4Reach,conversions:o.week4Conversions}},generatedAt:new Date}}[n]=i.then?(await i)():i,e.s(["predictROI",()=>o]),t()}catch(e){t(e)}},!1),12822,e=>e.a(async(r,t)=>{try{var n=e.i(94779),i=e.i(3981),o=r([i]);async function a(e,r){if("POST"!==e.method)return r.status(405).json({success:!1,error:"Method not allowed"});if(!await (0,n.verifyAdmin)(e))return r.status(403).json({success:!1,error:"Unauthorized: Admin access required"});try{let{campaignParameters:t}=e.body;if(!t||!t.industry||!t.budget)return r.status(400).json({success:!1,error:"Invalid campaign parameters. Required: industry, budget"});let n=await (0,i.predictROI)(t);return r.status(200).json({success:!0,data:{predictedROI:n.predictedROI,confidenceLevel:n.confidenceLevel,confidenceScore:n.confidenceScore,projectedMetrics:n.projectedMetrics,breakdown:n.breakdown,optimizations:n.optimizations,risks:n.risks,recommendations:n.recommendations,timelineProjection:n.timelineProjection}})}catch(e){return console.error("ROI prediction error:",e),r.status(500).json({success:!1,error:e instanceof Error?e.message:"Internal server error"})}}[i]=o.then?(await o)():o,e.s(["default",()=>a]),t()}catch(e){t(e)}},!1),39729,e=>e.a(async(r,t)=>{try{var n=e.i(26747),i=e.i(90406),o=e.i(44898),a=e.i(62950),s=e.i(12822),c=e.i(7031),d=e.i(81927),u=e.i(46432),p=r([s]);[s]=p.then?(await p)():p;let m=(0,a.hoist)(s,"default"),g=(0,a.hoist)(s,"config"),v=new o.PagesAPIRouteModule({definition:{kind:i.RouteKind.PAGES_API,page:"/api/ai/predict-roi",pathname:"/api/ai/predict-roi",bundlePath:"",filename:""},userland:s,distDir:".next",relativeProjectDir:""});async function l(e,r,t){v.isDev&&(0,u.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let i="/api/ai/predict-roi";i=i.replace(/\/index$/,"")||"/";let o=await v.prepare(e,r,{srcPage:i});if(!o){r.statusCode=400,r.end("Bad Request"),null==t.waitUntil||t.waitUntil.call(t,Promise.resolve());return}let{query:a,params:s,prerenderManifest:p,routerServerContext:l}=o;try{let t=e.method||"GET",n=(0,c.getTracer)(),o=n.getActiveScopeSpan(),u=v.instrumentationOnRequestError.bind(v),m=async o=>v.render(e,r,{query:{...a,...s},params:s,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:p.preview,propagateError:!1,dev:v.isDev,page:"/api/ai/predict-roi",internalRevalidate:null==l?void 0:l.revalidate,onError:(...r)=>u(e,...r)}).finally(()=>{if(!o)return;o.setAttributes({"http.status_code":r.statusCode,"next.rsc":!1});let e=n.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=e.get("next.route");if(a){let e=`${t} ${a}`;o.setAttributes({"next.route":a,"http.route":a,"next.span_name":e}),o.updateName(e)}else o.updateName(`${t} ${i}`)});o?await m(o):await n.withPropagatedContext(e.headers,()=>n.trace(d.BaseServerSpan.handleRequest,{spanName:`${t} ${i}`,kind:c.SpanKind.SERVER,attributes:{"http.method":t,"http.target":e.url}},m))}catch(e){if(v.isDev)throw e;(0,n.sendError)(r,500,"Internal Server Error")}finally{null==t.waitUntil||t.waitUntil.call(t,Promise.resolve())}}e.s(["config",0,g,"default",0,m,"handler",()=>l]),t()}catch(e){t(e)}},!1)];

//# sourceMappingURL=_b4a75135._.js.map