module.exports=[96219,e=>e.a(async(t,r)=>{try{let t=await e.y("@google/generative-ai");e.n(t),r()}catch(e){r(e)}},!0),56392,e=>e.a(async(t,r)=>{try{var a=e.i(96219),n=t([a]);[a]=n.then?(await n)():n;let o=process.env.GEMINI_API_KEY||"";o||console.warn("GEMINI_API_KEY not found in environment variables");let l=new a.GoogleGenerativeAI(o),u={flash:"gemini-2.0-flash-exp",pro:"gemini-1.5-pro-latest"};async function s(e,t={}){let{modelType:r="flash",temperature:a=.7,maxTokens:n=8192,systemInstruction:i}=t;try{let t=(function(e="flash"){return l.getGenerativeModel({model:u[e]})})(r).startChat({generationConfig:{temperature:a,maxOutputTokens:n},history:i?[{role:"user",parts:[{text:i}]},{role:"model",parts:[{text:"Understood. I will follow these instructions."}]}]:[]}),s=await t.sendMessage(e);return(await s.response).text()}catch(t){throw console.error("Gemini API Error:",{message:t instanceof Error?t.message:"Unknown error",stack:t instanceof Error?t.stack:void 0,prompt:e.substring(0,100)+"...",timestamp:new Date().toISOString()}),Error(`AI generation failed: ${t instanceof Error?t.message:"Unknown error"}`)}}async function i(e,t,r={}){let a=`You are a JSON API. Always respond with valid JSON matching this schema: ${t}. Never include markdown formatting or explanations, only raw JSON.`,n=await s(e,{...r,systemInstruction:a,temperature:r.temperature??.3});try{let e=n.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();return JSON.parse(e)}catch(e){throw console.error("Failed to parse AI response as JSON:",n),Error("AI returned invalid JSON")}}e.s(["generateAIResponse",()=>s,"generateStructuredResponse",()=>i]),r()}catch(e){r(e)}},!1),53632,e=>e.a(async(t,r)=>{try{var a=e.i(56392),n=t([a]);async function s(e,t){if("POST"!==e.method)return t.status(405).json({error:"Method not allowed"});let{action:r}=e.body;try{if("analyze"===r){let{criteria:r}=e.body,n=`
                Analyze the following business to identify the best influencer marketing strategy:
                Business Name: ${r.businessName}
                Product/Service: ${r.productDescription}
                Goals: ${r.goals}

                Provide a structured analysis including:
                1. The specific niche (e.g., "Sustainable Fashion", "Tech Gadgets").
                2. 5-7 relevant hashtags/keywords.
                3. Description of the target audience.
                4. A persona of the ideal influencer (e.g., "Eco-conscious lifestyle vlogger, 25-35, focuses on minimalism").
            `,s=`{
                "niche": "string",
                "keywords": ["string"],
                "targetAudience": "string",
                "idealInfluencerPersona": "string"
            }`,i=await (0,a.generateStructuredResponse)(n,s,{modelType:"flash",temperature:.4});return t.status(200).json(i)}if("generate_candidates"===r){let{analysis:r}=e.body,n=`
                Based on this influencer persona, list 20-30 REAL Instagram usernames of influencers who fit this description.
                
                Niche: ${r.niche}
                Persona: ${r.idealInfluencerPersona}
                Keywords: ${r.keywords.join(", ")}

                Rules:
                - Provide ONLY the usernames (no @ symbol).
                - Focus on a mix of Micro (10k-100k) and Macro (100k-1m) influencers.
                - Ensure they are likely to be real, active accounts.
                - Do not make up fake names. Use your knowledge of real public figures/creators.
            `,s=`{
                "usernames": ["string"]
            }`,i=await (0,a.generateStructuredResponse)(n,s,{modelType:"pro",temperature:.7});if(!i?.usernames||!Array.isArray(i.usernames))throw Error("Invalid response format from AI");let o=i.usernames.map(e=>e.replace("@","").trim()).filter(e=>e.length>0);return t.status(200).json(o)}return t.status(400).json({error:"Invalid action"})}catch(e){return console.error("AI Discovery API Error:",e),t.status(500).json({error:"Internal server error"})}}[a]=n.then?(await n)():n,e.s(["default",()=>s]),r()}catch(e){r(e)}},!1),25054,e=>e.a(async(t,r)=>{try{var a=e.i(26747),n=e.i(90406),s=e.i(44898),i=e.i(62950),o=e.i(53632),l=e.i(7031),u=e.i(81927),c=e.i(46432),d=t([o]);[o]=d.then?(await d)():d;let h=(0,i.hoist)(o,"default"),g=(0,i.hoist)(o,"config"),m=new s.PagesAPIRouteModule({definition:{kind:n.RouteKind.PAGES_API,page:"/api/ai-discovery",pathname:"/api/ai-discovery",bundlePath:"",filename:""},userland:o,distDir:".next",relativeProjectDir:""});async function p(e,t,r){m.isDev&&(0,c.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let n="/api/ai-discovery";n=n.replace(/\/index$/,"")||"/";let s=await m.prepare(e,t,{srcPage:n});if(!s){t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve());return}let{query:i,params:o,prerenderManifest:d,routerServerContext:p}=s;try{let r=e.method||"GET",a=(0,l.getTracer)(),s=a.getActiveScopeSpan(),c=m.instrumentationOnRequestError.bind(m),h=async s=>m.render(e,t,{query:{...i,...o},params:o,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:d.preview,propagateError:!1,dev:m.isDev,page:"/api/ai-discovery",internalRevalidate:null==p?void 0:p.revalidate,onError:(...t)=>c(e,...t)}).finally(()=>{if(!s)return;s.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=a.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=e.get("next.route");if(i){let e=`${r} ${i}`;s.setAttributes({"next.route":i,"http.route":i,"next.span_name":e}),s.updateName(e)}else s.updateName(`${r} ${n}`)});s?await h(s):await a.withPropagatedContext(e.headers,()=>a.trace(u.BaseServerSpan.handleRequest,{spanName:`${r} ${n}`,kind:l.SpanKind.SERVER,attributes:{"http.method":r,"http.target":e.url}},h))}catch(e){if(m.isDev)throw e;(0,a.sendError)(t,500,"Internal Server Error")}finally{null==r.waitUntil||r.waitUntil.call(r,Promise.resolve())}}e.s(["config",0,g,"default",0,h,"handler",()=>p]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__d7fd4daa._.js.map