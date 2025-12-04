module.exports=[98104,e=>e.a(async(t,a)=>{try{let t=await e.y("firebase/app");e.n(t),a()}catch(e){a(e)}},!0),90640,e=>e.a(async(t,a)=>{try{let t=await e.y("firebase/auth");e.n(t),a()}catch(e){a(e)}},!0),39196,e=>e.a(async(t,a)=>{try{let t=await e.y("firebase/firestore");e.n(t),a()}catch(e){a(e)}},!0),79361,e=>e.a(async(t,a)=>{try{let t=await e.y("firebase/analytics");e.n(t),a()}catch(e){a(e)}},!0),96219,e=>e.a(async(t,a)=>{try{let t=await e.y("@google/generative-ai");e.n(t),a()}catch(e){a(e)}},!0),56392,e=>e.a(async(t,a)=>{try{var r=e.i(96219),n=t([r]);[r]=n.then?(await n)():n;let o=process.env.GEMINI_API_KEY||"";o||console.warn("GEMINI_API_KEY not found in environment variables");let c=new r.GoogleGenerativeAI(o),l={flash:"gemini-2.0-flash-exp",pro:"gemini-1.5-pro-latest"};async function i(e,t={}){let{modelType:a="flash",temperature:r=.7,maxTokens:n=8192,systemInstruction:s}=t;try{let t=(function(e="flash"){return c.getGenerativeModel({model:l[e]})})(a).startChat({generationConfig:{temperature:r,maxOutputTokens:n},history:s?[{role:"user",parts:[{text:s}]},{role:"model",parts:[{text:"Understood. I will follow these instructions."}]}]:[]}),i=await t.sendMessage(e);return(await i.response).text()}catch(t){throw console.error("Gemini API Error:",{message:t instanceof Error?t.message:"Unknown error",stack:t instanceof Error?t.stack:void 0,prompt:e.substring(0,100)+"...",timestamp:new Date().toISOString()}),Error(`AI generation failed: ${t instanceof Error?t.message:"Unknown error"}`)}}async function s(e,t,a={}){let r=`You are a JSON API. Always respond with valid JSON matching this schema: ${t}. Never include markdown formatting or explanations, only raw JSON.`,n=await i(e,{...a,systemInstruction:r,temperature:a.temperature??.3});try{let e=n.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(e)}catch(e){throw console.error("Failed to parse AI response as JSON:",n),Error("AI returned invalid JSON")}}e.s(["generateAIResponse",()=>i,"generateStructuredResponse",()=>s]),a()}catch(e){a(e)}},!1),94779,e=>{"use strict";async function t(e){try{let t=e.headers.authorization;if(!t||!t.startsWith("Bearer "))return!1;let a=t.split("Bearer ")[1],r=await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:a})}),n=await r.json();if(!n.users||0===n.users.length)return!1;return"fluency400533@gmail.com"===n.users[0].email}catch(e){return console.error("Error verifying admin:",e),!1}}e.s(["verifyAdmin",()=>t])},50037,e=>e.a(async(t,a)=>{try{var r=e.i(98104),n=e.i(90640),i=e.i(39196),s=e.i(79361),o=t([r,n,i,s]);[r,n,i,s]=o.then?(await o)():o;let c=(0,r.getApps)().length?(0,r.getApp)():(0,r.initializeApp)({apiKey:"AIzaSyDhz-q8MzRo3XJu4BcOxhOZRtwlJO8FJxU",authDomain:"fluency-2398a.firebaseapp.com",projectId:"fluency-2398a",storageBucket:"fluency-2398a.firebasestorage.app",messagingSenderId:"100189578936",appId:"1:100189578936:web:04e43cd1cc146087a7f64d",measurementId:"G-Q94TQN9HBS"});(0,n.getAuth)(c);let l=(0,i.getFirestore)(c);e.s(["db",()=>l]),a()}catch(e){a(e)}},!1),12037,e=>e.a(async(t,a)=>{try{var r=e.i(56392),n=e.i(50037),i=e.i(39196),s=t([r,n,i]);async function o(e){var t;let{creatorId:a}=e,n=await c(a);if(n&&n.expiresAt>new Date)return console.log("Returning cached audience analysis for:",a),n;let i=(t=e,`You are an expert audience analyst for influencer marketing. Analyze this creator's audience to extract demographics, interests, and brand fit.

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
- Acknowledge uncertainty where appropriate`),s=await (0,r.generateStructuredResponse)(i,`{
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
    }`,{temperature:.4}),o={creatorId:a,analyzedAt:new Date,demographics:{ageRanges:s.ageRanges,genderSplit:s.genderSplit,topLocations:s.topLocations,interests:s.interests},brandFitScores:s.brandFitScores,audienceQuality:{engagementLevel:s.engagementLevel,purchasingPower:s.purchasingPower,brandAffinity:s.brandAffinity},insights:s.insights,expiresAt:new Date(Date.now()+6048e5)};return await l(o),o}async function c(e){try{let t=(0,i.doc)(n.db,"ai_audience_analyses",e),a=await (0,i.getDoc)(t);if(a.exists()){let e=a.data();return{...e,analyzedAt:e.analyzedAt.toDate(),expiresAt:e.expiresAt.toDate()}}return null}catch(e){return console.error("Error fetching cached analysis:",e),null}}async function l(e){try{let t=(0,i.doc)(n.db,"ai_audience_analyses",e.creatorId);await (0,i.setDoc)(t,{...e,analyzedAt:i.Timestamp.fromDate(e.analyzedAt),expiresAt:i.Timestamp.fromDate(e.expiresAt)})}catch(e){console.error("Error caching analysis:",e)}}[r,n,i]=s.then?(await s)():s,e.s(["analyzeAudience",()=>o]),a()}catch(e){a(e)}},!1),11505,e=>e.a(async(t,a)=>{try{var r=e.i(94779),n=e.i(12037),i=t([n]);async function s(e,t){if("POST"!==e.method)return t.status(405).json({success:!1,error:"Method not allowed"});if(!await (0,r.verifyAdmin)(e))return t.status(403).json({success:!1,error:"Unauthorized: Admin access required"});try{let{audienceData:a}=e.body;if(!a||!a.creatorId||!a.platform)return t.status(400).json({success:!1,error:"Invalid audience data. Required: creatorId, platform"});let r=await (0,n.analyzeAudience)(a);return t.status(200).json({success:!0,data:{demographics:r.demographics,brandFitScores:r.brandFitScores,audienceQuality:r.audienceQuality,insights:r.insights}})}catch(e){return console.error("Audience analysis error:",e),t.status(500).json({success:!1,error:e instanceof Error?e.message:"Internal server error"})}}[n]=i.then?(await i)():i,e.s(["default",()=>s]),a()}catch(e){a(e)}},!1),87852,e=>e.a(async(t,a)=>{try{var r=e.i(26747),n=e.i(90406),i=e.i(44898),s=e.i(62950),o=e.i(11505),c=e.i(7031),l=e.i(81927),u=e.i(46432),d=t([o]);[o]=d.then?(await d)():d;let m=(0,s.hoist)(o,"default"),g=(0,s.hoist)(o,"config"),h=new i.PagesAPIRouteModule({definition:{kind:n.RouteKind.PAGES_API,page:"/api/ai/analyze-audience",pathname:"/api/ai/analyze-audience",bundlePath:"",filename:""},userland:o,distDir:".next",relativeProjectDir:""});async function p(e,t,a){h.isDev&&(0,u.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/ai/analyze-audience";n=n.replace(/\/index$/,"")||"/";let i=await h.prepare(e,t,{srcPage:n});if(!i){t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve());return}let{query:s,params:o,prerenderManifest:d,routerServerContext:p}=i;try{let a=e.method||"GET",r=(0,c.getTracer)(),i=r.getActiveScopeSpan(),u=h.instrumentationOnRequestError.bind(h),m=async i=>h.render(e,t,{query:{...s,...o},params:o,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:d.preview,propagateError:!1,dev:h.isDev,page:"/api/ai/analyze-audience",internalRevalidate:null==p?void 0:p.revalidate,onError:(...t)=>u(e,...t)}).finally(()=>{if(!i)return;i.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=r.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=e.get("next.route");if(s){let e=`${a} ${s}`;i.setAttributes({"next.route":s,"http.route":s,"next.span_name":e}),i.updateName(e)}else i.updateName(`${a} ${n}`)});i?await m(i):await r.withPropagatedContext(e.headers,()=>r.trace(l.BaseServerSpan.handleRequest,{spanName:`${a} ${n}`,kind:c.SpanKind.SERVER,attributes:{"http.method":a,"http.target":e.url}},m))}catch(e){if(h.isDev)throw e;(0,r.sendError)(t,500,"Internal Server Error")}finally{null==a.waitUntil||a.waitUntil.call(a,Promise.resolve())}}e.s(["config",0,g,"default",0,m,"handler",()=>p]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__f72c3fe4._.js.map