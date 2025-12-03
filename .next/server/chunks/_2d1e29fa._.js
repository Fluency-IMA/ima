module.exports=[80786,e=>e.a(async(t,a)=>{try{var r=e.i(56392),n=t([r]);[r]=n.then?(await n)():n;let o=`
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
`;return(0,r.generateAIResponse)(t,{modelType:"pro",temperature:.1})}e.s(["generateContract",()=>i]),a()}catch(e){a(e)}},!1),29547,e=>e.a(async(t,a)=>{try{var r=e.i(80786),n=t([r]);async function i(e,t){if("POST"!==e.method)return t.status(405).json({success:!1,error:"Method not allowed"});try{let a=e.body;if(!a.clientName||!a.influencerName)return t.status(400).json({success:!1,error:"Missing required fields: clientName and influencerName are mandatory."});let n=await (0,r.generateContract)(a);return t.status(200).json({success:!0,contract:n})}catch(e){return console.error("Contract generation error:",e),t.status(500).json({success:!1,error:e instanceof Error?e.message:"Internal server error"})}}[r]=n.then?(await n)():n,e.s(["default",()=>i]),a()}catch(e){a(e)}},!1),49832,e=>e.a(async(t,a)=>{try{var r=e.i(26747),n=e.i(90406),i=e.i(44898),o=e.i(62950),s=e.i(29547),l=e.i(7031),c=e.i(81927),d=e.i(46432),u=t([s]);[s]=u.then?(await u)():u;let h=(0,o.hoist)(s,"default"),f=(0,o.hoist)(s,"config"),g=new i.PagesAPIRouteModule({definition:{kind:n.RouteKind.PAGES_API,page:"/api/ai/generate-contract",pathname:"/api/ai/generate-contract",bundlePath:"",filename:""},userland:s,distDir:".next",relativeProjectDir:""});async function p(e,t,a){g.isDev&&(0,d.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/ai/generate-contract";n=n.replace(/\/index$/,"")||"/";let i=await g.prepare(e,t,{srcPage:n});if(!i){t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve());return}let{query:o,params:s,prerenderManifest:u,routerServerContext:p}=i;try{let a=e.method||"GET",r=(0,l.getTracer)(),i=r.getActiveScopeSpan(),d=g.instrumentationOnRequestError.bind(g),h=async i=>g.render(e,t,{query:{...o,...s},params:s,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:u.preview,propagateError:!1,dev:g.isDev,page:"/api/ai/generate-contract",internalRevalidate:null==p?void 0:p.revalidate,onError:(...t)=>d(e,...t)}).finally(()=>{if(!i)return;i.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=r.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=e.get("next.route");if(o){let e=`${a} ${o}`;i.setAttributes({"next.route":o,"http.route":o,"next.span_name":e}),i.updateName(e)}else i.updateName(`${a} ${n}`)});i?await h(i):await r.withPropagatedContext(e.headers,()=>r.trace(c.BaseServerSpan.handleRequest,{spanName:`${a} ${n}`,kind:l.SpanKind.SERVER,attributes:{"http.method":a,"http.target":e.url}},h))}catch(e){if(g.isDev)throw e;(0,r.sendError)(t,500,"Internal Server Error")}finally{null==a.waitUntil||a.waitUntil.call(a,Promise.resolve())}}e.s(["config",0,f,"default",0,h,"handler",()=>p]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=_2d1e29fa._.js.map