module.exports=[96219,e=>e.a(async(t,r)=>{try{let t=await e.y("@google/generative-ai");e.n(t),r()}catch(e){r(e)}},!0),56392,e=>e.a(async(t,r)=>{try{var a=e.i(96219),n=t([a]);[a]=n.then?(await n)():n;let s=process.env.GEMINI_API_KEY||"";s||console.warn("GEMINI_API_KEY not found in environment variables");let l=new a.GoogleGenerativeAI(s),c={flash:"gemini-2.0-flash-exp",pro:"gemini-1.5-pro-latest"};async function i(e,t={}){let{modelType:r="flash",temperature:a=.7,maxTokens:n=8192,systemInstruction:o}=t;try{let t=(function(e="flash"){return l.getGenerativeModel({model:c[e]})})(r).startChat({generationConfig:{temperature:a,maxOutputTokens:n},history:o?[{role:"user",parts:[{text:o}]},{role:"model",parts:[{text:"Understood. I will follow these instructions."}]}]:[]}),i=await t.sendMessage(e);return(await i.response).text()}catch(t){throw console.error("Gemini API Error:",{message:t instanceof Error?t.message:"Unknown error",stack:t instanceof Error?t.stack:void 0,prompt:e.substring(0,100)+"...",timestamp:new Date().toISOString()}),Error(`AI generation failed: ${t instanceof Error?t.message:"Unknown error"}`)}}async function o(e,t,r={}){let a=`You are a JSON API. Always respond with valid JSON matching this schema: ${t}. Never include markdown formatting or explanations, only raw JSON.`,n=await i(e,{...r,systemInstruction:a,temperature:r.temperature??.3});try{let e=n.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(e)}catch(e){throw console.error("Failed to parse AI response as JSON:",n),Error("AI returned invalid JSON")}}e.s(["generateAIResponse",()=>i,"generateStructuredResponse",()=>o]),r()}catch(e){r(e)}},!1),80786,e=>e.a(async(t,r)=>{try{var a=e.i(56392),n=t([a]);[a]=n.then?(await n)():n;let o=`
**INFLUENCER MARKETING AGREEMENT (Brand-Influencer Direct)**

This Influencer Marketing Agreement (“Agreement”) is entered into on **[START_DATE]**, by and between:

**[CLIENT_NAME]** (the “Brand”), having its principal place of business at [Brand Address],

**and**

**[INFLUENCER_NAME]** (the “Influencer”), having its principal place of business at [Influencer Address].

***

### **1. Scope of Work**

The Influencer agrees to provide the following Marketing Services to the Brand:
* Content creation and promotion primarily focused on the [Niche/Category] vertical.
* Delivering content placements on [Platforms].
* **The exact deliverables:** [CAMPAIGN_SCOPE]

### **2. Payment Terms**

* **Total compensation for services:** [FEE_AMOUNT]
* **Payment Schedule:** [PAYMENT_TERMS]
* All payments shall be made via [Bank Transfer/PayPal/Wise].

### **3. Approval Process**

* The Influencer will share drafts/content for Brand approval before posting.
* The Brand must provide feedback/approval within 48 hours of draft submission.

### **4. Content Usage Rights**

* The Brand is granted a non-exclusive license to use content organically on its own social media channels for **[USAGE_TERM]**.
* For paid advertising rights (whitelisting, boosting), a separate fee will apply and must be agreed separately.
* The Brand is not allowed to edit or modify content without prior written consent.

### **5. Exclusivity**

* During the campaign, the Influencer will not promote direct competitors in the same product/service category.

### **6. Termination**

* This Agreement may be terminated with written notice in accordance with **[TERMINATION_CLAUSE]**.

### **7. Governing Law**

* This Agreement shall be governed by and construed in accordance with the laws of [Governing Jurisdiction].
`;async function i(e){let t=`
You are a professional, meticulous legal drafting assistant specializing in influencer and client agreements. Your task is to process the provided contract template and accurately replace all placeholders with the specific data provided in the DETAILS section.

**INSTRUCTIONS:**
1.  **Strictly adhere** to the legal tone, structure, and language of the provided **CONTRACT TEMPLATE**.
2.  Do **NOT** add any commentary, introductory text, or extraneous information. Output **only** the final, completed contract text.
3.  Format the final output cleanly using **Markdown** for professional presentation (use bolding for section headings, lists, etc.).
4.  If a placeholder like [Brand Address] or [Influencer Address] is not provided in the details, leave it as a placeholder for the user to fill later, or use "TBD" if appropriate.

---
### 📄 CONTRACT TEMPLATE
${o}
---

### 📥 DETAILS TO INSERT
* **CLIENT_NAME:** ${e.clientName}
* **INFLUENCER_NAME:** ${e.influencerName}
* **FEE_AMOUNT:** ${e.feeAmount}
* **PAYMENT_TERMS:** ${e.paymentTerms}
* **CAMPAIGN_SCOPE:** ${e.campaignScope}
* **START_DATE:** ${e.startDate}
* **USAGE_TERM:** ${e.usageTerm}
* **TERMINATION_CLAUSE:** ${e.terminationClause}

---
**GO:** Process the template now using the details provided above, and output the finalized contract.
`;return(0,a.generateAIResponse)(t,{modelType:"pro",temperature:.1})}e.s(["generateContract",()=>i]),r()}catch(e){r(e)}},!1),29547,e=>e.a(async(t,r)=>{try{var a=e.i(80786),n=t([a]);async function i(e,t){if("POST"!==e.method)return t.status(405).json({success:!1,error:"Method not allowed"});try{let r=e.body;if(!r.clientName||!r.influencerName)return t.status(400).json({success:!1,error:"Missing required fields: clientName and influencerName are mandatory."});let n=await (0,a.generateContract)(r);return t.status(200).json({success:!0,contract:n})}catch(e){return console.error("Contract generation error:",e),t.status(500).json({success:!1,error:e instanceof Error?e.message:"Internal server error"})}}[a]=n.then?(await n)():n,e.s(["default",()=>i]),r()}catch(e){r(e)}},!1),49832,e=>e.a(async(t,r)=>{try{var a=e.i(26747),n=e.i(90406),i=e.i(44898),o=e.i(62950),s=e.i(29547),l=e.i(7031),c=e.i(81927),d=e.i(46432),u=t([s]);[s]=u.then?(await u)():u;let h=(0,o.hoist)(s,"default"),g=(0,o.hoist)(s,"config"),m=new i.PagesAPIRouteModule({definition:{kind:n.RouteKind.PAGES_API,page:"/api/ai/generate-contract",pathname:"/api/ai/generate-contract",bundlePath:"",filename:""},userland:s,distDir:".next",relativeProjectDir:""});async function p(e,t,r){m.isDev&&(0,d.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/ai/generate-contract";n=n.replace(/\/index$/,"")||"/";let i=await m.prepare(e,t,{srcPage:n});if(!i){t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve());return}let{query:o,params:s,prerenderManifest:u,routerServerContext:p}=i;try{let r=e.method||"GET",a=(0,l.getTracer)(),i=a.getActiveScopeSpan(),d=m.instrumentationOnRequestError.bind(m),h=async i=>m.render(e,t,{query:{...o,...s},params:s,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:u.preview,propagateError:!1,dev:m.isDev,page:"/api/ai/generate-contract",internalRevalidate:null==p?void 0:p.revalidate,onError:(...t)=>d(e,...t)}).finally(()=>{if(!i)return;i.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=a.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=e.get("next.route");if(o){let e=`${r} ${o}`;i.setAttributes({"next.route":o,"http.route":o,"next.span_name":e}),i.updateName(e)}else i.updateName(`${r} ${n}`)});i?await h(i):await a.withPropagatedContext(e.headers,()=>a.trace(c.BaseServerSpan.handleRequest,{spanName:`${r} ${n}`,kind:l.SpanKind.SERVER,attributes:{"http.method":r,"http.target":e.url}},h))}catch(e){if(m.isDev)throw e;(0,a.sendError)(t,500,"Internal Server Error")}finally{null==r.waitUntil||r.waitUntil.call(r,Promise.resolve())}}e.s(["config",0,g,"default",0,h,"handler",()=>p]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__c8354eff._.js.map