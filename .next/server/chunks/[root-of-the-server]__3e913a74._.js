module.exports=[98104,e=>e.a(async(t,r)=>{try{let t=await e.y("firebase/app");e.n(t),r()}catch(e){r(e)}},!0),90640,e=>e.a(async(t,r)=>{try{let t=await e.y("firebase/auth");e.n(t),r()}catch(e){r(e)}},!0),39196,e=>e.a(async(t,r)=>{try{let t=await e.y("firebase/firestore");e.n(t),r()}catch(e){r(e)}},!0),79361,e=>e.a(async(t,r)=>{try{let t=await e.y("firebase/analytics");e.n(t),r()}catch(e){r(e)}},!0),96219,e=>e.a(async(t,r)=>{try{let t=await e.y("@google/generative-ai");e.n(t),r()}catch(e){r(e)}},!0),56392,e=>e.a(async(t,r)=>{try{var a=e.i(96219),n=t([a]);[a]=n.then?(await n)():n;let s=process.env.GEMINI_API_KEY||"";s||console.warn("GEMINI_API_KEY not found in environment variables");let l=new a.GoogleGenerativeAI(s),c={flash:"gemini-2.0-flash-exp",pro:"gemini-1.5-pro-latest"};async function i(e,t={}){let{modelType:r="flash",temperature:a=.7,maxTokens:n=8192,systemInstruction:o}=t;try{let t=(function(e="flash"){return l.getGenerativeModel({model:c[e]})})(r).startChat({generationConfig:{temperature:a,maxOutputTokens:n},history:o?[{role:"user",parts:[{text:o}]},{role:"model",parts:[{text:"Understood. I will follow these instructions."}]}]:[]}),i=await t.sendMessage(e);return(await i.response).text()}catch(t){throw console.error("Gemini API Error:",{message:t instanceof Error?t.message:"Unknown error",stack:t instanceof Error?t.stack:void 0,prompt:e.substring(0,100)+"...",timestamp:new Date().toISOString()}),Error(`AI generation failed: ${t instanceof Error?t.message:"Unknown error"}`)}}async function o(e,t,r={}){let a=`You are a JSON API. Always respond with valid JSON matching this schema: ${t}. Never include markdown formatting or explanations, only raw JSON.`,n=await i(e,{...r,systemInstruction:a,temperature:r.temperature??.3});try{let e=n.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(e)}catch(e){throw console.error("Failed to parse AI response as JSON:",n),Error("AI returned invalid JSON")}}e.s(["generateAIResponse",()=>i,"generateStructuredResponse",()=>o]),r()}catch(e){r(e)}},!1),94779,e=>{"use strict";async function t(e){try{let t=e.headers.authorization;if(!t||!t.startsWith("Bearer "))return!1;let r=t.split("Bearer ")[1],a=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:r})}),n=await a.json();if(!n.users||0===n.users.length)return!1;return"fluency400533@gmail.com"===n.users[0].email}catch(e){return console.error("Error verifying admin:",e),!1}}e.s(["verifyAdmin",()=>t])},50037,e=>e.a(async(t,r)=>{try{var a=e.i(98104),n=e.i(90640),i=e.i(39196),o=e.i(79361),s=t([a,n,i,o]);[a,n,i,o]=s.then?(await s)():s;let l=(0,a.getApps)().length?(0,a.getApp)():(0,a.initializeApp)({apiKey:"AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",authDomain:"fluency-2398a.firebaseapp.com",projectId:"fluency-2398a",storageBucket:"fluency-2398a.firebasestorage.app",messagingSenderId:"100189578936",appId:"1:100189578936:web:04e43cd1cc146087a7f64d",measurementId:"G-Q94TQN9HBS"});(0,n.getAuth)(l);let c=(0,i.getFirestore)(l);e.s(["db",()=>c]),r()}catch(e){r(e)}},!1),93689,e=>e.a(async(t,r)=>{try{var a=e.i(56392),n=e.i(50037),i=e.i(39196),o=t([a,n,i]);async function s(e){var t,r,n,i;let o=`${e.platform}_${e.username}`,s=await l(o);if(s&&s.expiresAt>new Date)return console.log("Returning cached verification for:",o),s;let u=(t=e,0===t.followers?0:(t.averageLikes+t.averageComments)/t.followers*100),d=e.followers/Math.max(e.following,1),f=(r=e,n=u,i=d,`You are an expert influencer marketing analyst. Analyze this creator profile for authenticity and detect fake followers or engagement.

CREATOR PROFILE:
- Platform: ${r.platform}
- Username: @${r.username}
- Followers: ${r.followers.toLocaleString()}
- Following: ${r.following.toLocaleString()}
- Total Posts: ${r.totalPosts}
- Average Likes: ${r.averageLikes.toLocaleString()}
- Average Comments: ${r.averageComments.toLocaleString()}
- Engagement Rate: ${n.toFixed(2)}%
- Follower/Following Ratio: ${i.toFixed(2)}
- Account Age: ${r.accountAge||"Unknown"} months
- Verified Badge: ${r.verifiedBadge?"Yes":"No"}
${r.bio?`- Bio: ${r.bio}`:""}

${r.recentPosts?`RECENT POSTS ENGAGEMENT:
${r.recentPosts.map((e,t)=>`Post ${t+1}: ${e.likes} likes, ${e.comments} comments (${e.engagement.toFixed(2)}% engagement)`).join("\n")}`:""}

ANALYSIS CRITERIA:
1. Follower Quality (0-100): Assess likelihood of real vs. fake followers based on follower/following ratio, engagement rate, and account age
2. Engagement Authenticity (0-100): Analyze if engagement (likes, comments) is genuine or artificially inflated
3. Content Consistency (0-100): Evaluate posting frequency and engagement consistency
4. Audience Relevance (0-100): Assess if the audience appears real and engaged

RED FLAGS TO DETECT:
- Sudden follower spikes
- Very low engagement rate (<1% is suspicious for ${r.platform})
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

Provide a comprehensive analysis with specific red flags if found.`),g=await (0,a.generateStructuredResponse)(f,`{
      "authenticityScore": number (0-100),
      "followerQuality": number (0-100),
      "engagementAuthenticity": number (0-100),
      "contentConsistency": number (0-100),
      "audienceRelevance": number (0-100),
      "redFlags": string[],
      "detailedAnalysis": string,
      "recommendation": "approved" | "review" | "rejected"
    }`,{temperature:.3}),m={creatorId:o,authenticityScore:g.authenticityScore,verifiedAt:new Date,redFlags:g.redFlags,analysis:{followerQuality:g.followerQuality,engagementAuthenticity:g.engagementAuthenticity,contentConsistency:g.contentConsistency,audienceRelevance:g.audienceRelevance},report:g.detailedAnalysis,recommendation:g.recommendation,expiresAt:new Date(Date.now()+6048e5)};return await c(m),m}async function l(e){try{let t=(0,i.doc)(n.db,"ai_creator_verifications",e),r=await (0,i.getDoc)(t);if(r.exists()){let e=r.data();return{...e,verifiedAt:e.verifiedAt.toDate(),expiresAt:e.expiresAt.toDate()}}return null}catch(e){return console.error("Error fetching cached verification:",e),null}}async function c(e){try{let t=(0,i.doc)(n.db,"ai_creator_verifications",e.creatorId);await (0,i.setDoc)(t,{...e,verifiedAt:i.Timestamp.fromDate(e.verifiedAt),expiresAt:i.Timestamp.fromDate(e.expiresAt)})}catch(e){console.error("Error caching verification:",e)}}[a,n,i]=o.then?(await o)():o,e.s(["verifyCreator",()=>s]),r()}catch(e){r(e)}},!1),36807,e=>e.a(async(t,r)=>{try{var a=e.i(94779),n=e.i(93689),i=t([n]);async function o(e,t){if("POST"!==e.method)return t.status(405).json({success:!1,error:"Method not allowed"});if(!await (0,a.verifyAdmin)(e))return t.status(403).json({success:!1,error:"Unauthorized: Admin access required"});try{let{creator:r}=e.body;if(!r||!r.username||!r.platform||!r.followers)return t.status(400).json({success:!1,error:"Invalid creator data. Required: username, platform, followers"});let a=await (0,n.verifyCreator)(r);return t.status(200).json({success:!0,data:{authenticityScore:a.authenticityScore,recommendation:a.recommendation,redFlags:a.redFlags,analysis:a.analysis,report:a.report}})}catch(e){return console.error("Creator verification error:",e),t.status(500).json({success:!1,error:e instanceof Error?e.message:"Internal server error"})}}[n]=i.then?(await i)():i,e.s(["default",()=>o]),r()}catch(e){r(e)}},!1),39751,e=>e.a(async(t,r)=>{try{var a=e.i(26747),n=e.i(90406),i=e.i(44898),o=e.i(62950),s=e.i(36807),l=e.i(7031),c=e.i(81927),u=e.i(46432),d=t([s]);[s]=d.then?(await d)():d;let g=(0,o.hoist)(s,"default"),m=(0,o.hoist)(s,"config"),p=new i.PagesAPIRouteModule({definition:{kind:n.RouteKind.PAGES_API,page:"/api/ai/verify-creator",pathname:"/api/ai/verify-creator",bundlePath:"",filename:""},userland:s,distDir:".next",relativeProjectDir:""});async function f(e,t,r){p.isDev&&(0,u.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/ai/verify-creator";n=n.replace(/\/index$/,"")||"/";let i=await p.prepare(e,t,{srcPage:n});if(!i){t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve());return}let{query:o,params:s,prerenderManifest:d,routerServerContext:f}=i;try{let r=e.method||"GET",a=(0,l.getTracer)(),i=a.getActiveScopeSpan(),u=p.instrumentationOnRequestError.bind(p),g=async i=>p.render(e,t,{query:{...o,...s},params:s,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:d.preview,propagateError:!1,dev:p.isDev,page:"/api/ai/verify-creator",internalRevalidate:null==f?void 0:f.revalidate,onError:(...t)=>u(e,...t)}).finally(()=>{if(!i)return;i.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=a.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=e.get("next.route");if(o){let e=`${r} ${o}`;i.setAttributes({"next.route":o,"http.route":o,"next.span_name":e}),i.updateName(e)}else i.updateName(`${r} ${n}`)});i?await g(i):await a.withPropagatedContext(e.headers,()=>a.trace(c.BaseServerSpan.handleRequest,{spanName:`${r} ${n}`,kind:l.SpanKind.SERVER,attributes:{"http.method":r,"http.target":e.url}},g))}catch(e){if(p.isDev)throw e;(0,a.sendError)(t,500,"Internal Server Error")}finally{null==r.waitUntil||r.waitUntil.call(r,Promise.resolve())}}e.s(["config",0,m,"default",0,g,"handler",()=>f]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__3e913a74._.js.map