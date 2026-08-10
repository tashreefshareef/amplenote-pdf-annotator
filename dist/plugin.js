(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Se=Object.defineProperty;var nn=Object.getOwnPropertyDescriptor;var on=Object.getOwnPropertyNames;var rn=Object.prototype.hasOwnProperty;var an=(t,l)=>{for(var r in l)Se(t,r,{get:l[r],enumerable:!0})},ln=(t,l,r,s)=>{if(l&&typeof l=="object"||typeof l=="function")for(let i of on(l))!rn.call(t,i)&&i!==r&&Se(t,i,{get:()=>l[i],enumerable:!(s=nn(l,i))||s.enumerable});return t};var sn=t=>ln(Se({},"__esModule",{value:!0}),t);var Tn={};an(Tn,{default:()=>Sn});var se=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ce="yellow",G="PDF Annotator data",Ye="attachment://",Qe=1,Ke=16,oe={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},cn="https://plugins.amplenote.com/cors-proxy";function Ze(t){let l=new URL(cn);return l.searchParams.set("apiurl",t),l.toString()}var dn="application/pdf";function hn(t){return Array.isArray(t)?t.filter(l=>l&&l.type===dn&&l.uuid):[]}async function de(t,l){let r=await t.getNoteAttachments({uuid:l}),s=hn(r);if(s.length===0)return null;if(s.length===1)return s[0];let i=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:s.map(o=>({label:o.name,value:o.uuid})),value:s[0].uuid}]});if(i==null)return null;let d=Array.isArray(i)?i[0]:i;return s.find(o=>o.uuid===d)||null}async function et(t,l){if(!l)throw new Error("fetchableAttachmentURL: attachmentUUID required");let r=await t.getAttachmentURL(l);if(!r)throw new Error(`No URL returned for attachment ${l}`);return Ze(r)}function tt(t){return t?Ke:Qe}function re(t){let l={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return l;let r;try{r=new URLSearchParams(t.replace(/^\?/,""))}catch{return l}let s=d=>{let o=r.get(d);if(o===null||o.trim()==="")return null;let p=Number(o);return Number.isFinite(p)?p:null},i=s("page");return{attachmentUUID:r.get("att")||null,page:i!==null&&i>=1?Math.floor(i):null,x:s("x"),y:s("y"),highlightId:r.get("hl")||null,noteUUID:r.get("note")||null,collapsed:r.get("c")==="1",attachmentName:r.get("n")||""}}function nt({attachmentUUID:t,page:l,x:r,y:s,highlightId:i,collapsed:d,attachmentName:o}={}){let p=new URLSearchParams;return t&&p.set("att",t),d&&p.set("c","1"),o&&p.set("n",o),Number.isFinite(l)&&l>=1&&p.set("page",String(Math.floor(l))),Number.isFinite(r)&&p.set("x",String(r)),Number.isFinite(s)&&p.set("y",String(s)),i&&p.set("hl",i),p.toString()}function he(t,l={},r=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");r===null&&(r=tt(l.collapsed));let s=nt(l);return`<object data="${s?`plugin://${t}?${s}`:`plugin://${t}`}" data-aspect-ratio="${r}" />`}function ot(t,l,r){if(!t||!l||!r)return null;let s=t.split(`
`),i=s.findIndex(o=>o.includes(`${Ye}${l}`));if(i===-1)return null;let d=s.slice();return s[i+1]===""?d.splice(i+2,0,r.trim(),""):d.splice(i+1,0,"",r.trim(),""),d.join(`
`)}function pe(t,l,r=null){return!t||!l||!t.includes(`plugin://${l}`)?!1:r?t.includes(`att=${r}`):!0}function ue(t,l,r){if(!t||!l||!r)return null;let s=t.split(`
`),i=`plugin://${l}`,d=s.findIndex(p=>p.includes(i)&&p.includes(`att=${r}`));if(d===-1)return null;let o=s.slice();return o.splice(d,1),o[d]===""&&o[d-1]===""&&o.splice(d,1),o.join(`
`)}function ae(t,l,r,s={}){if(!t||!l||!r)return null;let i=t.split(`
`),d=`plugin://${l}`,o=i.findIndex(T=>T.includes(d)&&T.includes(`att=${r}`));if(o===-1)return null;let p=i[o],k=p.match(/data="(plugin:\/\/[^"]*)"/);if(!k)return null;let S=k[1],y=S.indexOf("?"),N=y===-1?"":S.slice(y+1),v={...re(N),attachmentUUID:r,...s},u=nt(v),f=u?`plugin://${l}?${u}`:`plugin://${l}`,b=i.slice(),x=p.replace(k[0],`data="${f}"`),C=tt(v.collapsed),E=x.match(/data-aspect-ratio="[^"]*"/);return x=E?x.replace(E[0],`data-aspect-ratio="${C}"`):x.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),b[o]=x,b.join(`
`)}function rt(t,l,r,s){return ae(t,l,r,{collapsed:!!s})}async function at(t,l,r){let s=await de(t,l);if(!s){let p=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(p)&&p.length>0)||!p.some(S=>S&&S.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let i=await t.getNoteContent({uuid:l});if(pe(i,r,s.uuid))return await t.alert(`"${s.name}" is already open in this note - scroll to the viewer.`),s.uuid;let d=he(r,{attachmentUUID:s.uuid,attachmentName:s.name}),o=ot(i,s.uuid,d);return o!==null?(await t.replaceNoteContent({uuid:l},o),s.uuid):(await t.insertNoteContent({uuid:l},`
${d}
`,{atEnd:!0}),s.uuid)}var pn="Raw markdown";function un(t){let l=(String(t||"").match(/`+/g)||[]).reduce((r,s)=>Math.max(r,s.length),0);return"`".repeat(Math.max(3,l+1))}async function it(t,l){let r=await t.getNoteContent({uuid:l});if(typeof r!="string"||r==="")return await t.alert("That note came back empty - nothing to dump."),null;let s=await t.getNoteAttachments({uuid:l}),i=(Array.isArray(s)?s:[]).map(p=>`- ${p&&p.name} | ${p&&p.type} | ${p&&p.uuid}`).join(`
`),d=un(r),o=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:o},`# Attachments

${i||"- (none)"}

# ${pn}

${d}
${r}
${d}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),o}async function lt(t,l,r){if(!l)return"";let s=await de(t,l);if(!s){let d=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(d)&&d.length>0)||!d.some(p=>p&&p.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let i=await t.getNoteContent({uuid:l});return pe(i,r,s.uuid)?(await t.alert(`"${s.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${he(r,{attachmentUUID:s.uuid,attachmentName:s.name})}
`}async function fn(t,l,r,s){let i={uuid:l},d=ue(r,t.context.pluginUUID,s);if(d!==null)try{await t.replaceNoteContent(i,d)}catch{}try{await t.replaceNoteContent(i,r)}catch{await t.replaceNoteContent(i,r)}}async function st(t,l){let{noteUUID:r,attachmentUUID:s,page:i,highlightId:d}=re(l);if(!r){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let o=await t.getNoteContent({uuid:r}),p=ae(o,t.context.pluginUUID,s,{page:i,highlightId:d,collapsed:!1});p!==null&&(t.context&&t.context.noteUUID===r?await fn(t,r,p,s):await t.replaceNoteContent({uuid:r},p))}catch{}await t.navigate(`https://www.amplenote.com/notes/${r}`)}function fe(t){if(!t)return null;let l=String(t).trim().toLowerCase();return se.find(r=>r.id===l||r.hex.toLowerCase()===l)||null}function ct(){return fe(ce)}function gn(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function ge({page:t,color:l,rects:r,quoteText:s,note:i=null,id:d=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(r)||r.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let p of r)if(![p.x,p.y,p.width,p.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(p)}`);let o=fe(l)||ct();return{id:d||gn(),page:t,color:o.id,rects:r.map(p=>({x:p.x,y:p.y,width:p.width,height:p.height})),quoteText:String(s||""),note:i?String(i):null}}function dt(t,l){let r=l==null?null:String(l).trim();return{...t,note:r||null}}function ht(t,l){let r=fe(l);if(!r)throw new Error(`withColor: unknown color "${l}"`);return{...t,color:r.id}}function pt(t,l){return(t||[]).filter(r=>r.id!==l)}function Te(t,l,r){let s=!1,i=(t||[]).map(d=>d.id!==l?d:(s=!0,r(d)));return s?i:t}var mn="json",ut="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function ft(t){let l=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${ut}
\`\`\`${mn}
${l}
\`\`\``}function ke(t){if(!t)return null;let l=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),r=!l&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),s=(l?l[1]:r?r[1]:t).trim();if(!s)return null;try{return JSON.parse(s)}catch{return null}}function vn(t){if(!Array.isArray(t))return[];let l=[];for(let r of t)try{l.push(ge(r))}catch{}return l}async function me(t,l,r){let s=await t.getNoteContent({uuid:l}),i=Ie(s,G),d=ke(i);return!d||typeof d!="object"?[]:vn(d[r])}async function gt(t,l,r,s){let i={uuid:l},d=await t.getNoteContent(i),o=Ie(d,G),k={...ke(o)||{},[r]:s},S=ft(k);o===null&&await t.insertNoteContent(i,`

# ${G}

`,{atEnd:!0});let y=bn(d,S);if(y!==null){await t.replaceNoteContent(i,y);return}await t.replaceNoteContent(i,S,{section:{heading:{text:G,level:1}}})}async function mt(t,l,r){let s={uuid:l},i=await t.getNoteContent(s),d=Ie(i,G);if(d===null)return;let o=ke(d)||{};if(!(r in o))return;let p={...o};delete p[r],await t.replaceNoteContent(s,ft(p),{section:{heading:{text:G,level:1}}})}function Ae(t,l){let r=/^#\s+(.*)$/,s=t.findIndex(d=>{let o=d.match(r);return o&&o[1].trim()===l});if(s===-1)return null;let i=t.length;for(let d=s+1;d<t.length;d++)if(/^#\s+/.test(t[d])){i=d;break}return{start:s,end:i}}function Ie(t,l){if(!t)return null;let r=t.split(`
`),s=Ae(r,l);return s?r.slice(s.start+1,s.end).join(`
`).trim():null}function wn(t){if(!t)return"";let l=t,r=l.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return r&&(l=l.replace(r[0],"")),l=l.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),l=l.replace(ut,""),l.trim()}function vt(t,l){return String(t||"").includes("](plugin://")?l:`---

${l}`}function wt(t,l){let r=(t||"").split(`
`),s=Ae(r,G);if(!s)return null;let i=r.slice(0,s.start).join(`
`).replace(/\s+$/,""),d=r.slice(s.start).join(`
`);return`${i?i+`

`:""}${l}

${d}`}function bn(t,l){let r=(t||"").split(`
`),s=Ae(r,G);if(!s)return null;let i=wn(r.slice(s.start+1,s.end).join(`
`).trim());if(!i)return null;let d=r.slice(0,s.start).join(`
`).replace(/\s+$/,""),o=r.slice(s.end).join(`
`).replace(/^\s+/,"");return`${d?d+`

`:""}${i}

${r[s.start]}

${l}${o?`

`+o:""}`}function q(t,l){return l.noteUUID||t.context.noteUUID}async function bt(t,l,r){try{let s=await t.getNoteAttachments({uuid:l}),i=Array.isArray(s)&&s.find(d=>d&&d.uuid===r);return i?i.name:""}catch{return""}}async function ve(t,l,r,s){let i=await me(t,l,r),d=s(i);return d!==i&&await gt(t,l,r,d),{highlights:d}}function xt(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let l=t.trim();if(!l.startsWith("{"))return{action:l};try{return JSON.parse(l)}catch{return{action:l}}}async function yt(t,l){return JSON.stringify(await xn(t,xt(l)))}async function xn(t,l){let r=xt(l);switch(r.action){case"getPdfUrl":{let s=r.attachmentUUID;if(!s)return{error:"No attachment specified for this viewer."};try{return{url:await et(t,s),name:await bt(t,q(t,r),s)}}catch(i){return{error:`Could not load the PDF: ${i.message}`}}}case"loadHighlights":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await me(t,q(t,r),r.attachmentUUID)}}catch(s){return{error:`Could not load highlights: ${s.message}`}}}case"addHighlight":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=ge(r.highlight||{});return await ve(t,q(t,r),r.attachmentUUID,i=>i.concat([s]))}catch(s){return{error:`Could not save the highlight: ${s.message}`}}}case"recolorHighlight":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ve(t,q(t,r),r.attachmentUUID,s=>Te(s,r.id,i=>ht(i,r.color)))}catch(s){return{error:`Could not change the highlight color: ${s.message}`}}}case"setHighlightNote":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ve(t,q(t,r),r.attachmentUUID,s=>Te(s,r.id,i=>dt(i,r.note)))}catch(s){return{error:`Could not save the note: ${s.message}`}}}case"removeHighlight":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ve(t,q(t,r),r.attachmentUUID,s=>pt(s,r.id))}catch(s){return{error:`Could not remove the highlight: ${s.message}`}}}case"sendToNote":{if(!r.content)return{error:"Nothing to send."};try{let s={uuid:q(t,r)},i=await t.getNoteContent(s),d=vt(i,r.content),o=wt(i,d);return o===null?await t.insertNoteContent(s,`
`+d+`
`,{atEnd:!0}):await t.replaceNoteContent(s,o),{ok:!0}}catch(s){return{error:`Could not add this to the note: ${s.message}`}}}case"removeViewer":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!r.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=q(t,r),i=await t.getNoteContent({uuid:s}),d=ue(i,r.pluginUUID,r.attachmentUUID);return d===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:s},d),await mt(t,s,r.attachmentUUID),{ok:!0})}catch(s){return{error:`Could not remove this viewer: ${s.message}`}}}case"getViewerSummary":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};let s=q(t,r),i=await bt(t,s,r.attachmentUUID);try{let d=await me(t,s,r.attachmentUUID);return{name:i,count:d.length}}catch{return{name:i,count:0}}}case"setCollapsed":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!r.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=q(t,r),i=await t.getNoteContent({uuid:s}),d=rt(i,r.pluginUUID,r.attachmentUUID,r.collapsed);return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:s},d),{ok:!0})}catch(s){return{error:`Could not resize this viewer: ${s.message}`}}}case"clearDeepLink":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!r.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=q(t,r),i=await t.getNoteContent({uuid:s}),d=ae(i,r.pluginUUID,r.attachmentUUID,{page:null,highlightId:null});return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:s},d),{ok:!0})}catch(s){return{error:`Could not clear this viewer's deep link: ${s.message}`}}}case"exportAll":{if(!r.noteName)return{error:"Missing destination note name."};try{let s=await t.findNote({name:r.noteName}),i=s?s.uuid:await t.createNote(r.noteName);return await t.replaceNoteContent({uuid:i},r.content||""),{ok:!0,noteUUID:i}}catch(s){return{error:`Could not export highlights: ${s.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(r.action)}`}}}function De(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function l(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function r(u,f){var b=Math.pow(10,f===void 0?2:f),x=function(C){return Math.round(C*b)/b};return{x:x(u.x),y:x(u.y),width:x(u.width),height:x(u.height)}}function s(u){return u.width>.01&&u.height>.01}function i(u,f,b){for(var x=String(u??""),C=Math.max(0,f===void 0?0:f),E=Math.min(x.length,b===void 0?x.length:b),T=function(O){return O===""||/\s/.test(O)},A=[],I=C;I<E;){for(;I<E&&T(x.charAt(I));)I++;if(I>=E)break;for(var $=I;I<E&&!T(x.charAt(I));)I++;A.push({start:$,end:I})}return A}function d(u){for(var f=1/0,b=1/0,x=-1/0,C=-1/0,E=0;E<(u?u.length:0);E++){var T=u[E];s(T)&&(f=Math.min(f,T.left),b=Math.min(b,T.top),x=Math.max(x,T.left+T.width),C=Math.max(C,T.top+T.height))}return isFinite(f)?{left:f,top:b,width:x-f,height:C-b}:null}function o(u,f,b){for(var x=[],C=0;C<u.length;C++){var E=t(u[C],f);if(s(E)){var T=b(E.x,E.y),A=b(E.x+E.width,E.y+E.height),I=r(l(T,A));s(I)&&x.push(I)}}return x}function p(u,f){var b=f(u.x,u.y),x=f(u.x+u.width,u.y+u.height);return l(b,x)}function k(u,f,b){var x=f.right-f.left,C=f.bottom-f.top;if(x<=0||C<=0)return null;var E=u.x2-u.x1,T=u.y2-u.y1,A=u.x1+(b.left-f.left)/x*E,I=u.x2-(f.right-b.right)/x*E,$=u.y1+(b.bottom-f.bottom)/C*T,O=u.y2-(f.top-b.top)/C*T;return{x:A,y:$,width:I-A,height:O-$}}function S(u,f){var b=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return b>.5*Math.min(u.height,f.height)}function y(u,f){var b=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var x=u.slice().sort(function(j,J){return J.y-j.y||j.x-J.x}),C=[],E=0;E<x.length;E++){for(var T=!1,A=0;A<C.length;A++)if(S(C[A][0],x[E])){C[A].push(x[E]),T=!0;break}T||C.push([x[E]])}for(var I=[],$=0;$<C.length;$++){for(var O=C[$].slice().sort(function(j,J){return j.x-J.x}),R=null,W=0;W<O.length;W++){var F=O[W];if(R===null){R={x:F.x,y:F.y,width:F.width,height:F.height};continue}var ie=F.x-(R.x+R.width);if(ie<=b*Math.max(R.height,F.height)){var ee=Math.max(R.x+R.width,F.x+F.width),be=Math.max(R.y+R.height,F.y+F.height);R.x=Math.min(R.x,F.x),R.y=Math.min(R.y,F.y),R.width=ee-R.x,R.height=be-R.y}else I.push(R),R={x:F.x,y:F.y,width:F.width,height:F.height}}R!==null&&I.push(R)}return I.map(function(j){return r(j)})}function N(u,f,b,x){var C=x===void 0?0:x;return f>=u.x-C&&f<=u.x+u.width+C&&b>=u.y-C&&b<=u.y+u.height+C}function w(u,f,b,x,C){for(var E=u||[],T=E.length-1;T>=0;T--){var A=E[T];if(!(!A||A.page!==f||!A.rects)){for(var I=0;I<A.rects.length;I++)if(N(A.rects[I],b,x,C===void 0?1:C))return A}}return null}function v(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:l,roundRect:r,isVisibleRect:s,textTokenRanges:i,unionClientRects:d,clientRectsToPdfRects:o,pdfRectToViewportRect:p,itemRelativeRect:k,mergeLineRects:y,rectContainsPoint:N,hitTestHighlights:w,normalizeQuoteText:v}}var B=De(),eo=B.clientRectToLocal,to=B.rectFromCorners,no=B.roundRect,oo=B.isVisibleRect,ro=B.textTokenRanges,ao=B.unionClientRects,io=B.clientRectsToPdfRects,lo=B.pdfRectToViewportRect,so=B.itemRelativeRect,co=B.mergeLineRects,ho=B.rectContainsPoint,po=B.hitTestHighlights,uo=B.normalizeQuoteText;function Ue(){var t=[.957,.871,.424];function l(d,o,p,k,S){var y=o.context.register(o.context.obj({Type:d.PDFName.of("ExtGState"),BM:d.PDFName.of("Multiply"),ca:d.PDFNumber.of(.4)})),N=[d.pushGraphicsState(),d.setGraphicsState("GS0")];N.push(d.setFillingColor(d.rgb(k[0],k[1],k[2])));for(var w=0;w<p.length;w++){var v=p[w];N.push(d.moveTo(v.x,v.y)),N.push(d.lineTo(v.x,v.y+v.height)),N.push(d.lineTo(v.x+v.width,v.y+v.height)),N.push(d.lineTo(v.x+v.width,v.y)),N.push(d.closePath())}N.push(d.fill()),N.push(d.popGraphicsState());var u=o.context.formXObject(N,{BBox:S,Resources:{ExtGState:{GS0:y}}});return o.context.register(u)}function r(d,o,p,k){for(var S=p.rects,y=[],N=S[0].x,w=S[0].y,v=S[0].x+S[0].width,u=S[0].y+S[0].height,f=0;f<S.length;f++){var b=S[f],x=b.x,C=b.x+b.width,E=b.y,T=b.y+b.height;y.push(x,T,C,T,x,E,C,E),N=Math.min(N,x),w=Math.min(w,E),v=Math.max(v,C),u=Math.max(u,T)}var A=o.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Highlight"),Rect:o.context.obj([N,w,v,u]),QuadPoints:o.context.obj(y),C:o.context.obj(k),F:d.PDFNumber.of(4),T:d.PDFString.of("PDF Annotator"),M:d.PDFString.of(new Date().toISOString()),CA:d.PDFNumber.of(.4)});p.note&&A.set(d.PDFName.of("Contents"),d.PDFString.of(p.note));var I=l(d,o,S,k,[N,w,v,u]);A.set(d.PDFName.of("AP"),o.context.obj({N:I}));var $=o.context.register(A),O=[$];if(p.note){var R=o.context.register(o.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Popup"),Rect:o.context.obj([v+8,w-60,v+208,w+12]),Parent:$,Open:!1}));A.set(d.PDFName.of("Popup"),R),O.push(R)}return O}function s(d,o,p){var k=o.node.get(d.PDFName.of("Annots"));if(k instanceof d.PDFArray)for(var S=0;S<p.length;S++)k.push(p[S]);else o.node.set(d.PDFName.of("Annots"),o.doc.context.obj(p))}async function i(d,o,p,k){for(var S=await d.PDFDocument.load(o),y=S.getPages(),N=p||[],w=0;w<N.length;w++){var v=N[w];if(!(!v||!v.rects||!v.rects.length)){var u=y[v.page-1];if(u){var f=k&&k[v.color]||t,b=r(d,S,v,f);s(d,u,b)}}}return S.save()}return{writeHighlightsIntoPdf:i,buildHighlightAnnotation:r,appendAnnotationRefs:s}}var Pe=Ue(),go=Pe.writeHighlightsIntoPdf,mo=Pe.buildHighlightAnnotation,vo=Pe.appendAnnotationRefs;function He(){function t(y){return String(y??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function l(y,N,w,v,u){var f=new URLSearchParams;N&&f.set("att",N),Number.isFinite(w)&&w>=1&&f.set("page",String(Math.floor(w))),v&&f.set("hl",v),u&&f.set("note",u);var b=f.toString();return"plugin://"+y+(b?"?"+b:"")}function r(y,N){return String(y??"").split(/\r?\n/).map(function(w){return(N+" "+w).replace(/[ \t]+$/,"")})}function s(y,N,w){return N==null?y:"<mark"+(w?' style="background-color:'+w+';"':"")+">"+y+'<!-- {"backgroundCycleColor":"'+N+'"} --></mark>'}function i(y,N,w,v,u,f,b){var x=l(N,w,v.page,v.id,b),C=s(t(y||"PDF"),u,f),E="["+C+"]("+x+")",T=[E].concat(r(v.quoteText,"> >"));return v.note&&(T.push(">"),T=T.concat(r(v.note,">"))),T.join(`
`)}function d(y){return String(y??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(y){return"<p>"+d(y).replace(/\r?\n/g,"<br>")+"</p>"}function p(y,N,w,v,u,f,b){var x=l(N,w,v.page,v.id,b),C=d(y||"PDF"),E=f?'<mark style="background-color: '+d(f)+';">'+C+"</mark>":C,T='<p><a href="'+d(x)+'">'+E+"</a></p>",A="<blockquote><blockquote>"+o(v.quoteText)+"</blockquote></blockquote>",I=v.note?"<blockquote>"+o(v.note)+"</blockquote>":"";return T+A+I}function k(y){return y.slice().sort(function(N,w){if(N.page!==w.page)return N.page-w.page;var v=N.rects&&N.rects[0]?N.rects[0].y:0,u=w.rects&&w.rects[0]?w.rects[0].y:0;return u-v})}function S(y,N,w,v,u,f,b){var x=f&&f.length?f:null,C=(v||[]).filter(function(A){return A&&(!x||x.indexOf(A.color)!==-1)}),E=k(C),T=E.map(function(A){var I=u&&u[A.color]||{};return i(y,N,w,A,I.cycleIndex,I.hex,b)});return T.join(`

`)}return{buildDeepLink:l,buildHighlightBlock:i,buildHighlightHtml:p,buildExportAllContent:S}}var we=He(),bo=we.buildDeepLink,xo=we.buildHighlightBlock,yo=we.buildHighlightHtml,Co=we.buildExportAllContent;function Ct(){var t=window.__PDFA_CONFIG||{},l=window.__PDFA_GEOM||{},r=window.__PDFA_ANNOTATIONS||{},s=window.__PDFA_EXPORT||{},i={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function d(e){e&&(o.attachmentName=e,i.name&&(i.name.textContent=e),i.collapsedName&&(i.collapsedName.textContent=e))}var o={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function p(e,n){i.status.textContent=e||"",i.status.style.display=e?"block":"none",i.status.className=n?"pdfa-status pdfa-error":"pdfa-status"}function k(e){var n=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(a,c){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");a(window.callAmplenotePlugin(JSON.stringify(n)))}catch(h){c(h)}}).then(function(a){if(a&&typeof a=="object")return a;if(typeof a!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(a)}catch{throw new Error("Unreadable reply from the plugin: "+String(a).slice(0,120))}})}function S(){return t.colors||[]}function y(e){for(var n=S(),a=0;a<n.length;a++)if(n[a].id===e)return n[a].hex;return n.length?n[0].hex:"#F4DE6C"}function N(e){for(var n=0;n<o.highlights.length;n++)if(o.highlights[n].id===e)return o.highlights[n];return null}function w(e,n,a){var c=document.createElement("button");return c.className="pdfa-btn"+(n?" "+n:""),c.textContent=e,c.onclick=function(h){h.stopPropagation(),a()},c}function v(e,n,a,c){var h=document.createElement("button");return h.className="pdfa-color",h.dataset.color=e.id,h.style.background=e.hex,h.title=c+" "+e.label,h.setAttribute("aria-label",c+" "+e.label),h.setAttribute("aria-pressed",String(!!n)),h.onclick=function(m){m.stopPropagation(),a(e.id)},h}function u(){for(var e=S(),n=0;n<e.length;n++)i.colors.appendChild(v(e[n],e[n].id===o.activeColorId,function(a){o.activeColorId=a,f(),o.pendingSelection&&Le(o.pendingSelection,a)},"Highlight"))}function f(){for(var e=i.colors.querySelectorAll(".pdfa-color"),n=0;n<e.length;n++)e[n].setAttribute("aria-pressed",String(e[n].dataset.color===o.activeColorId))}function b(){for(var e=[],n=1;n<=o.pageCount;n++)(function(a){e.push(o.doc.getPage(a).then(function(c){o.viewports[a]=c.getViewport({scale:o.scale})}))})(n);return Promise.all(e)}function x(e){var n=o.viewports[e],a=document.createElement("div");return a.className="pdfa-page",a.dataset.page=String(e),a.style.width=n.width+"px",a.style.height=n.height+"px",a}function C(e,n){if(o.rendered[n]||o.renderingPage[n])return Promise.resolve();o.renderingPage[n]=!0;var a=o.viewports[n],c=document.createElement("canvas"),h=window.devicePixelRatio||1;c.width=Math.floor(a.width*h),c.height=Math.floor(a.height*h),c.style.width=a.width+"px",c.style.height=a.height+"px",e.appendChild(c);var m=document.createElement("div");m.className="pdfa-highlights",e.appendChild(m);var g=document.createElement("div");g.className="textLayer",g.style.width=a.width+"px",g.style.height=a.height+"px",g.style.setProperty("--scale-factor",String(o.scale)),e.appendChild(g);var D=c.getContext("2d");D.scale(h,h);var P=null;return o.doc.getPage(n).then(function(H){return P=H,H.render({canvasContext:D,viewport:a}).promise}).then(function(){return P.getTextContent()}).then(function(H){var U=[];return window.pdfjsLib.renderTextLayer({textContent:H,container:g,viewport:a,textDivs:U}).promise.then(function(){o.textSpans+=U.length;for(var L=0;L<U.length;L++)U[L].__pdfaItem=H.items[L];o.rendered[n]=!0,o.renderingPage[n]=!1,$(n),T()})}).catch(function(H){o.renderingPage[n]=!1,p("Failed to render page "+n+": "+(H.message||H),!0)})}function E(){var e=Y();if(!e||!o.doc)return Promise.resolve();for(var n=e.getBoundingClientRect(),a=e.clientHeight,c=i.pages.querySelectorAll(".pdfa-page"),h=[],m=0;m<c.length;m++){var g=c[m],D=Number(g.dataset.page);if(!(o.rendered[D]||o.renderingPage[D])){var P=g.getBoundingClientRect(),H=P.top-n.top,U=P.bottom-n.top;U<-a||H>e.clientHeight+a||h.push(C(g,D))}}return Promise.all(h)}function T(){var e=0;for(var n in o.rendered)o.rendered[n]&&e++;if(e){var a=o.textSpans===0;p(a?"No selectable text found - this PDF may be a scan.":"",a)}}function A(){if(o.rendering)return Promise.resolve();o.rendering=!0,M(!0),p("Rendering...");var e=Y(),n=e?e.scrollHeight-e.clientHeight:0,a=n>0?e.scrollTop/n:0;return i.pages.innerHTML="",o.viewports={},o.rendered={},o.renderingPage={},o.textSpans=0,b().then(function(){for(var c=1;c<=o.pageCount;c++)i.pages.appendChild(x(c));if(e){var h=e.scrollHeight-e.clientHeight;e.scrollTop=a*(h>0?h:0)}o.rendering=!1,te(),ne(),E()}).catch(function(c){o.rendering=!1,p("Failed to render: "+(c.message||c),!0)})}function I(e){return function(n,a){return e.convertToViewportPoint(n,a)}}function $(e){for(var n=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",a=i.pages.querySelectorAll(n),c=0;c<a.length;c++){var h=a[c],m=Number(h.dataset.page),g=h.querySelector(".pdfa-highlights"),D=o.viewports[m];if(!(!g||!D)){g.innerHTML="";for(var P=I(D),H=0;H<o.highlights.length;H++){var U=o.highlights[H];if(!(!U||U.page!==m||!U.rects||!U.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=U.id||"";for(var V=0;V<U.rects.length;V++){var K=l.pdfRectToViewportRect(U.rects[V],P),_=document.createElement("div");_.className="pdfa-hl",_.style.left=K.x+"px",_.style.top=K.y+"px",_.style.width=K.width+"px",_.style.height=K.height+"px",_.style.background=y(U.color),L.appendChild(_)}g.appendChild(L)}}}}}function O(){$(),W(),i.count.textContent=String(o.highlights.length)}function R(){return o.highlights.slice().sort(function(e,n){return e.page!==n.page?e.page-n.page:(n.rects[0]?n.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function W(){i.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var n=document.createElement("span");n.textContent="Highlights",e.appendChild(n),e.appendChild(w("Close","",function(){ie(!1)})),i.panel.appendChild(e);var a=R();if(!a.length){var c=document.createElement("div");c.className="pdfa-panel-empty",c.textContent="No highlights yet. Select some text in the PDF and pick a color.",i.panel.appendChild(c);return}for(var h=0;h<a.length;h++)i.panel.appendChild(F(a[h]))}function F(e){var n=document.createElement("div");n.className="pdfa-hl-row",n.dataset.id=e.id||"",n.title="Jump to this highlight";var a=document.createElement("span");a.className="pdfa-chip",a.style.background=y(e.color),n.appendChild(a);var c=document.createElement("div"),h=document.createElement("div");h.className="pdfa-hl-page",h.textContent="Page "+e.page,c.appendChild(h);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,c.appendChild(m),e.note){var g=document.createElement("div");g.className="pdfa-hl-note",g.textContent=e.note,c.appendChild(g)}return n.appendChild(c),n.onclick=function(){$e(e)},n}function ie(e){var n=e===void 0?!i.panel.classList.contains("pdfa-open"):e;i.panel.classList.toggle("pdfa-open",n),i.listToggle.setAttribute("aria-pressed",String(n)),n&&W(),ne()}function ee(e){for(var n=e&&e.nodeType===1?e:e&&e.parentElement;n;){if(n.classList&&n.classList.contains("textLayer"))return n;n=n.parentElement}return null}function be(e,n){for(var a=[],c=[],h=null,m=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),g;g=m.nextNode();)if(e.intersectsNode(g)){var D=g.nodeValue||"",P=g===e.startContainer?e.startOffset:0,H=g===e.endContainer?e.endOffset:D.length,U=g.parentElement,L=U&&U.__pdfaItem;if(L)for(var V={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},K=U.getBoundingClientRect(),_=l.textTokenRanges(D,P,H),Z=0;Z<_.length;Z++){var Ne=document.createRange();Ne.setStart(g,_[Z].start),Ne.setEnd(g,_[Z].end);var z=l.unionClientRects(Ne.getClientRects());if(z){var Je={left:z.left,top:z.top,width:z.width,height:z.height,right:z.left+z.width,bottom:z.top+z.height},Xe=l.itemRelativeRect(V,K,Je);Xe&&(a.push(Xe),c.push(D.slice(_[Z].start,_[Z].end)),h=Je)}}}return{rects:a,text:c.join(" "),lastCssRect:h}}function j(e){if(o.pendingSelection=e,o.lastCapturedText=e&&e.rawText||"",!e){i.hint.textContent="",i.hint.style.display="none";return}i.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",i.hint.style.display="inline"}function J(e){if(!o.noteEditing){var n=window.getSelection();if(!n||n.isCollapsed||n.rangeCount===0){j(null),M();return}var a=n.getRangeAt(0),c=ee(a.startContainer);if(!c)return j(null);var h=c.parentElement;if(!h||!h.dataset||!h.dataset.page)return j(null);var m=Number(h.dataset.page);if(!o.rendered[m])return j(null);var g=ee(a.endContainer)!==c,D=be(a,c),P=l.mergeLineRects(D.rects);if(!P.length)return j(null);var H=D.lastCssRect||h.getBoundingClientRect(),U=e&&e.clientX?e.clientX:H.left+H.width/2,L=e&&e.clientY?e.clientY:H.top+H.height,V={page:m,rects:P,quoteText:l.normalizeQuoteText(D.text),spilled:g,anchorX:U,anchorY:L,rawText:String(n)};j(V),It(V)}}var St=300,X=null;function Tt(){o.noteEditing||(X&&clearTimeout(X),X=setTimeout(Re,St))}function Re(){if(X=null,!o.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||ee(e.getRangeAt(0).startContainer)&&String(e)!==o.lastCapturedText&&J(null)}}function le(e,n){var a=o.highlights;return o.highlights=e,O(),k(n).then(function(c){if(!c||c.error)throw new Error(c&&c.error||"The plugin did not confirm the change.");return o.highlights=c.highlights||e,O(),p(""),!0}).catch(function(c){return o.highlights=a,O(),p(c.message||String(c),!0),!1})}function Le(e,n){var a={id:null,page:e.page,color:n,rects:e.rects,quoteText:e.quoteText,note:null},c=e.anchorX,h=e.anchorY;j(null),M(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),le(o.highlights.concat([a]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:a}).then(function(g){if(g){var D=o.highlights[o.highlights.length-1];D&&D.id&&ye(D,c,h,!0)}})}function kt(e,n){M(!0),le(o.highlights.map(function(a){return a.id===e?Object.assign({},a,{color:n}):a}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:n})}function At(e){M(!0),le(o.highlights.filter(function(n){return n.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function xe(e,n){var a=String(n??"").trim();o.noteEditing=null,M(!0),le(o.highlights.map(function(c){return c.id===e?Object.assign({},c,{note:a||null}):c}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:a})}function Q(e,n,a,c){i.popover.innerHTML="",i.popover.classList.toggle("pdfa-editing",c==="editing"),i.popover.classList.toggle("pdfa-exporting",c==="exporting"),i.popover.classList.toggle("pdfa-menu",c==="menu");for(var h=0;h<e.length;h++)i.popover.appendChild(e[h]);i.popover.classList.add("pdfa-open");var m=i.popover.offsetWidth,g=i.popover.offsetHeight,D=Math.max(4,Math.min(n-m/2,window.innerWidth-m-4)),P=a+12;P+g>window.innerHeight-4&&(P=Math.max(4,a-g-12)),P=Math.max(4,Math.min(P,window.innerHeight-g-4)),i.popover.style.left=D+"px",i.popover.style.top=P+"px"}function M(e){o.noteEditing&&!e||(o.noteEditing=null,i.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),i.popover.innerHTML="")}function It(e){for(var n=S(),a=[],c=0;c<n.length;c++)a.push(v(n[c],n[c].id===o.activeColorId,function(h){o.activeColorId=h,f(),Le(e,h)},"Highlight"));Q(a,e.anchorX,e.anchorY)}function ye(e,n,a,c){for(var h=S(),m=[],g=0;g<h.length;g++)m.push(v(h[g],h[g].id===e.color,function(P){kt(e.id,P)},"Change to"));var D=!!e.note;m.push(w(D?"Edit note":"Add note",c&&!D?"pdfa-btn-primary":"",function(){Ut(e,n,a)})),m.push(w("Copy","",function(){zt(e)})),m.push(w("Send to note","",function(){Gt(e)})),m.push(w("Remove","pdfa-remove",function(){At(e.id)})),Q(m,n,a)}function Dt(e,n){for(var a=S(),c={},h=0;h<a.length;h++)c[a[h].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var g=document.createElement("div");g.className="pdfa-export-colors";for(var D=0;D<a.length;D++)(function(H){var U=v(H,!0,function(L){c[L]=!c[L],U.setAttribute("aria-pressed",String(c[L]))},"Toggle");g.appendChild(U)})(a[D]);var P=document.createElement("div");P.className="pdfa-note-actions",P.appendChild(w("Create / update note","pdfa-btn-primary",function(){for(var H=[],U=0;U<a.length;U++)c[a[U].id]&&H.push(a[U].id);Vt(H.length===a.length?null:H)})),Q([m,g,P],e,n,"exporting")}function Ut(e,n,a){o.noteEditing=e.id;var c=document.createElement("textarea");c.className="pdfa-note-input",c.rows=3,c.value=e.note||"",c.placeholder="Note for this highlight";var h=document.createElement("div");h.className="pdfa-note-actions",e.note&&h.appendChild(w("Delete note","",function(){xe(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",h.appendChild(m),h.appendChild(w("Cancel","",function(){Me(e,n,a)})),h.appendChild(w("Save","pdfa-btn-primary",function(){xe(e.id,c.value)})),c.onkeydown=function(g){g.key==="Enter"&&(g.ctrlKey||g.metaKey)?(g.preventDefault(),g.stopPropagation(),xe(e.id,c.value)):g.key==="Escape"&&(g.preventDefault(),g.stopPropagation(),Me(e,n,a))},Q([c,h],n,a,"editing"),c.focus(),c.setSelectionRange(c.value.length,c.value.length)}function Me(e,n,a){o.noteEditing=null;var c=N(e.id)||e;ye(c,n,a)}function Pt(e){if(!o.noteEditing){var n=window.getSelection();if(!(n&&!n.isCollapsed)){for(var a=e.target,c=null;a&&a!==i.pages;){if(a.classList&&a.classList.contains("pdfa-page")){c=a;break}a=a.parentElement}if(!c)return M();var h=Number(c.dataset.page),m=o.viewports[h];if(!m)return M();var g=c.getBoundingClientRect(),D=m.convertToPdfPoint(e.clientX-g.left,e.clientY-g.top),P=l.hitTestHighlights(o.highlights,h,D[0],D[1],1);P&&P.id?ye(P,e.clientX,e.clientY):M()}}}function te(){i.pageLabel.textContent=o.current+" / "+o.pageCount,i.zoomLabel.textContent=Math.round(o.scale*100)+"%"}function Y(){return i.root.querySelector(".pdfa-scroll")}function Fe(){return i.panel&&i.panel.classList.contains("pdfa-open")?i.panel:Y()}function Oe(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e+'"]');n&&C(n,e)}function Ce(e){var n=Math.min(Math.max(1,e),o.pageCount),a=i.pages.querySelector('.pdfa-page[data-page="'+n+'"]');Oe(n);var c=Y();a&&c&&(c.scrollTop+=a.getBoundingClientRect().top-c.getBoundingClientRect().top),E(),o.current=n,te()}function $e(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),a=o.viewports[e.page];if(!(!n||!a||!e.rects||!e.rects.length)){var c=l.pdfRectToViewportRect(e.rects[0],I(a)),h=Y(),m=n.getBoundingClientRect().top+c.y;h.scrollTop+=m-h.getBoundingClientRect().top-h.clientHeight/3,Oe(e.page),E(),o.current=e.page,te()}}function Ht(){try{i.root.setAttribute("tabindex","-1"),i.root.focus(),i.root.scrollIntoView&&i.root.scrollIntoView({block:"nearest"})}catch{}}function Rt(e){if(!(!e||!e.id)){var n=i.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');n&&(n.classList.add("pdfa-hl-flash"),setTimeout(function(){n.classList.remove("pdfa-hl-flash")},2600))}}function je(e){return o.scale=Math.min(Math.max(.4,e),4),A()}function Lt(){return o.doc?o.doc.getPage(1).then(function(e){var n=Y();if(n){var a=window.getComputedStyle(n),c=n.clientWidth-(parseFloat(a.paddingLeft)||0)-(parseFloat(a.paddingRight)||0),h=e.getViewport({scale:1}).width;if(!(!(c>0)||!(h>0))){var m=Math.max(.4,c/h);m<o.scale&&(o.scale=m,te())}}}).catch(function(){}):Promise.resolve()}function _e(e){var n=Fe();n&&(n.scrollTop+=e*Math.max(80,n.clientHeight*.85),ne(),E())}function Be(e,n){var a=null,c=null,h=!1,m=function(){a&&clearTimeout(a),c&&clearInterval(c),a=c=null};e.addEventListener("pointerdown",function(){m(),h=!1,a=setTimeout(function(){h=!0,c=setInterval(function(){if(e.disabled)return m();_e(n*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(g){e.addEventListener(g,m)}),e.onclick=function(){if(h){h=!1;return}_e(n)}}function ne(){var e=Fe();if(!(!e||!i.scrollUp)){var n=e.scrollHeight-e.clientHeight;i.scrollUp.disabled=e.scrollTop<=1,i.scrollDown.disabled=e.scrollTop>=n-1}}function Mt(){ne(),E(),M();for(var e=i.pages.querySelectorAll(".pdfa-page"),n=o.current,a=1/0,c=0;c<e.length;c++){var h=Math.abs(e[c].getBoundingClientRect().top-60);h<a&&(a=h,n=Number(e[c].dataset.page))}n!==o.current&&(o.current=n,te())}function Ft(){return new Promise(function(e,n){if(window.pdfjsLib)return e(window.pdfjsLib);var a=document.createElement("script");a.src=t.pdfJsSrc,a.onload=function(){window.pdfjsLib?e(window.pdfjsLib):n(new Error("PDF.js loaded but did not register itself."))},a.onerror=function(){n(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(a)})}function Ot(){return new Promise(function(e,n){if(window.PDFLib)return e(window.PDFLib);var a=document.createElement("script");a.src=t.pdfLibSrc,a.onload=function(){window.PDFLib?e(window.PDFLib):n(new Error("pdf-lib loaded but did not register itself."))},a.onerror=function(){n(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(a)})}function $t(){for(var e={},n=S(),a=0;a<n.length;a++)n[a].rgb&&(e[n[a].id]=n[a].rgb);return e}function jt(){var e=(o.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Ee(){for(var e={},n=S(),a=0;a<n.length;a++)e[n[a].id]={cycleIndex:n[a].cycleIndex,hex:n[a].hex};return e}function qe(){var e=(o.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function ze(e){var n=Ee()[e.color]||{};return s.buildHighlightBlock(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,n.cycleIndex,n.hex,t.noteUUID)}function _t(e){if(!s.buildHighlightHtml)return null;var n=Ee()[e.color]||{};return s.buildHighlightHtml(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,n.cycleIndex,n.hex,t.noteUUID)}function Bt(e,n){var a=function(m){var g=m.clipboardData||window.clipboardData;g&&(g.setData("text/plain",e),n&&g.setData("text/html",n),m.preventDefault())},c=document.createElement("textarea");c.value=e,c.style.position="fixed",c.style.left="-9999px",document.body.appendChild(c),c.focus(),c.select(),document.addEventListener("copy",a,!0);var h=!1;try{h=document.execCommand("copy")}catch{h=!1}return document.removeEventListener("copy",a,!0),document.body.removeChild(c),h}function qt(e,n){var a=function(){return!navigator.clipboard||!navigator.clipboard.writeText?c():navigator.clipboard.writeText(e).then(function(){return"plain"},c)},c=function(){return Bt(e,n)?Promise.resolve(n?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(n&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var h=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([n],{type:"text/html"})});return navigator.clipboard.write([h]).then(function(){return"rich"},a)}catch{return a()}return a()}function zt(e){M(!0);var n,a;try{n=ze(e),a=_t(e)}catch(c){p("Could not build the copy: "+(c.message||c),!0);return}qt(n,a).then(function(c){p(c==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(c){p("Could not copy: "+(c.message||c),!0)})}function Gt(e){M(!0),k({action:"sendToNote",content:ze(e)}).then(function(n){if(!n||n.error)throw new Error(n&&n.error||"Could not send this to the note.");p("Added to this note, below the text.")}).catch(function(n){p(n.message||String(n),!0)})}function Vt(e){M(!0);var n=s.buildExportAllContent(o.attachmentName,t.pluginUUID,t.attachmentUUID,o.highlights,Ee(),e,t.noteUUID);if(!n){p(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}k({action:"exportAll",noteName:qe(),content:n}).then(function(a){if(!a||a.error)throw new Error(a&&a.error||"Could not export highlights.");p('Exported to "'+qe()+'".')}).catch(function(a){p(a.message||String(a),!0)})}function Wt(e,n){var a=document.createElement("div");a.className="pdfa-menu-name",a.textContent=o.attachmentName||"PDF Annotator",a.title=a.textContent;var c=[a];c.push(w("Collapse","",function(){M(!0),Zt()}),w("Download","",function(){M(!0),Yt()}),w("Export...","",function(){Dt(e,n)}),w("Remove viewer...","pdfa-remove",function(){Jt(e,n)})),Q(c,e,n,"menu")}function Jt(e,n){var a=document.createElement("div");a.className="pdfa-export-hint",a.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var c=document.createElement("div");c.className="pdfa-note-actions",c.appendChild(w("Cancel","",function(){M(!0)}));var h=document.createElement("span");h.className="pdfa-spacer",c.appendChild(h),c.appendChild(w("Remove","pdfa-remove",Xt)),Q([a,c],e,n,"exporting")}function Xt(){M(!0),p("Removing this viewer..."),k({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){p(e.message||String(e),!0)})}function Yt(){o.pdfBytes&&(p("Preparing the download..."),Ot().then(function(e){return r.writeHighlightsIntoPdf(e,o.pdfBytes,o.highlights,$t())}).then(function(e){return Qt(e,jt())}).catch(function(e){p("Could not prepare the download: "+(e.message||e),!0)}))}function Qt(e,n){var a=new Blob([e],{type:"application/pdf"}),c=null;try{c=new File([a],n,{type:"application/pdf"})}catch{}return c&&navigator.share&&navigator.canShare&&navigator.canShare({files:[c]})?navigator.share({files:[c],title:n}).then(function(){p("")}).catch(function(h){return h&&h.name==="AbortError"?p(""):Ge(a,n)}):Ge(a,n)}function Ge(e,n){var a=URL.createObjectURL(e),c=document.createElement("a");c.href=a,c.download=n,document.body.appendChild(c),c.click(),c.remove(),setTimeout(function(){URL.revokeObjectURL(a)},4e3);var h=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return p(h?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function Kt(){return k({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");o.highlights=e.highlights||[]}).catch(function(e){o.highlights=[],p("Could not load saved highlights: "+(e.message||e),!0)})}function Zt(){var e=o.highlights.length;i.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",i.root.classList.add("pdfa-collapsed-mode"),Ve(!0)}function Ve(e){k({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function en(){k({action:"clearDeepLink",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function tn(){i.root.classList.remove("pdfa-collapsed-mode"),o.doc||We(),Ve(!1)}function We(){p("Loading PDF..."),(t.highlightId||t.page)&&(Ht(),en()),Ft().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,k({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return d(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return o.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return o.doc=e,o.pageCount=e.numPages,Kt()}).then(function(){return Lt()}).then(function(){return A()}).then(function(){O();var e=t.highlightId?N(t.highlightId):null;e?($e(e),Rt(e)):t.page&&Ce(t.page)}).catch(function(e){p(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){Ce(o.current-1)},document.getElementById("pdfa-next").onclick=function(){Ce(o.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){je(o.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){je(o.scale-.25)},Be(i.scrollUp,-1),Be(i.scrollDown,1),i.listToggle.onclick=function(){ie()},i.more.onclick=function(e){Wt(e.clientX,e.clientY)},Y().addEventListener("scroll",Mt),i.panel.addEventListener("scroll",ne),i.pages.addEventListener("mouseup",J),i.pages.addEventListener("click",Pt),document.addEventListener("selectionchange",Tt),i.pages.addEventListener("touchend",function(){X&&clearTimeout(X),X=null,Re()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!o.noteEditing&&M()}),document.addEventListener("mousedown",function(e){i.popover.classList.contains("pdfa-open")&&(i.popover.contains(e.target)||M())}),u(),W(),i.root.querySelector(".pdfa-collapsed").onclick=tn,t.collapsed?k({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){d(e.name);var n=e.count||0;i.collapsedCount.textContent=n?n+(n===1?" highlight":" highlights"):""}}).catch(function(){}):We()}catch(e){p("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function yn(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Cn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var En=`
  * { box-sizing: border-box; }
  body { margin: 0; font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  #pdfa-root { display: flex; flex-direction: column; height: 100vh; background: var(--pdfa-bg); color: var(--pdfa-fg); }
  /* A MANUAL toggle, applied by viewer.js's collapseViewer/openViewer, and re-applied on
     initial render when the tag says the user left this viewer collapsed - but never a
     default (see buildEmbedHtml's own comment on why a default-collapsed embed, tried
     first, was explicitly rejected: it added a forced extra click before every
     annotation). height:auto here (not the 100vh above) so the collapsed bar takes only
     its own natural height. That alone is NOT enough to close the gap: the iframe's own
     height comes from the tag's data-aspect-ratio, which only the plugin side can change
     - see constants.js. */
  #pdfa-root.pdfa-collapsed-mode { height: auto; }
  #pdfa-root.pdfa-collapsed-mode .pdfa-toolbar,
  #pdfa-root.pdfa-collapsed-mode .pdfa-status,
  #pdfa-root.pdfa-collapsed-mode .pdfa-body { display: none; }
  .pdfa-collapsed { display: none; align-items: center; gap: 8px; padding: 10px 12px;
    background: var(--pdfa-toolbar); border-bottom: 1px solid var(--pdfa-border); }
  #pdfa-root.pdfa-collapsed-mode .pdfa-collapsed { display: flex; }
  .pdfa-collapsed-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    opacity: .85; }
  .pdfa-collapsed-count { opacity: .6; font-size: 12px; white-space: nowrap; }
  /* Holds the page scroller and the highlights panel. Positioned so the panel can
     overlay the pages without the toolbar, and without reflowing the PDF - the embed is
     often barely wider than a page, so a panel that stole width would squeeze it. */
  .pdfa-body { position: relative; flex: 1 1 auto; display: flex; min-height: 0; }
  /* Modelled on Amplenote's own editor toolbar: a plain bar, borderless controls, and a
     rounded tint on hover rather than a box around every button at rest. min-height keeps
     the row a constant height whether or not a swatch is showing its selected ring, which
     is what made the bar appear to grow and shrink as colors were picked. */
  .pdfa-toolbar { display: flex; align-items: center; gap: 4px; padding: 5px 8px; min-height: 38px;
    background: var(--pdfa-toolbar); border-bottom: 1px solid var(--pdfa-border);
    flex: 0 0 auto; flex-wrap: wrap; }
  /* Transparent BORDER rather than none: the button keeps the same box either way, so
     nothing shifts by a pixel when a state adds one back. */
  .pdfa-toolbar button { font: inherit; padding: 5px 9px; border: 1px solid transparent;
    background: transparent; color: inherit; border-radius: 6px; cursor: pointer; line-height: 1.2; }
  .pdfa-toolbar button:hover { background: var(--pdfa-btn-hover); }
  .pdfa-toolbar button:disabled { opacity: .4; cursor: default; background: transparent; }
  .pdfa-label { min-width: 62px; text-align: center; opacity: .85; font-variant-numeric: tabular-nums; }
  /* The overflow menu's own trigger - a plain toolbar button. Its contents (Download,
     Export, Remove) render as ordinary popover buttons below, so a destructive one among
     them reuses the popover's own ".pdfa-remove" styling, not a toolbar-specific class. */
  #pdfa-more { font-size: 16px; line-height: 1; padding: 3px 10px; }
  .pdfa-sep { width: 1px; align-self: stretch; background: var(--pdfa-border); margin: 0 4px; }
  .pdfa-brand { font-weight: 600; font-size: 12px; letter-spacing: .01em; color: var(--pdfa-accent);
    white-space: nowrap; padding-right: 2px; }
  .pdfa-spacer { flex: 1 1 auto; }
  /* The filename's heading inside the overflow menu, where it moved when its own row
     was removed - see the markup for why that row was pure duplication. */
  .pdfa-popover.pdfa-menu .pdfa-menu-name { font-size: 11px; opacity: .55; padding: 5px 10px 7px;
    margin-bottom: 4px; border-bottom: 1px solid var(--pdfa-border);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* No align-items: center here on purpose - see the .pdfa-page comment below.

     overscroll-behavior is for touch: the embed is an iframe inside a note that
     scrolls, and on Android a drag over the page area moved the NOTE rather than the
     pages, so the PDF could not be scrolled by dragging it at all (reported live -
     the only gesture that moved it was a long-press drag). "contain" stops a pan
     that reaches this element's end from chaining out to the host note. It cannot
     stop the host from claiming the gesture in the first place, so this is a
     necessary-not-sufficient fix - see docs/api-notes.md. */
  .pdfa-scroll { flex: 1 1 auto; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px;
    overscroll-behavior: contain; }
  /* Centered via its own auto margins rather than the scroller's align-items: center.
     align-items: center is "unsafe" alignment by spec default - once a page is wider
     than the scroller (past ~100% zoom on a narrow embed), it centers the overflow
     symmetrically, pushing half of it into negative scroll territory that no scrollbar
     can ever reach. Auto margins clamp at zero instead of going negative, so an
     oversized page just left-aligns and stays fully reachable by scrolling, while
     still centering normally whenever it fits. */
  .pdfa-page { position: relative; box-shadow: 0 1px 6px rgba(0,0,0,.28); background: #fff; flex: 0 0 auto; margin: 0 auto; }
  .pdfa-page canvas { display: block; }
  .pdfa-status { padding: 10px 12px; text-align: center; opacity: .8; }
  .pdfa-error { color: var(--pdfa-error); opacity: 1; white-space: pre-wrap; }

  /* TEXT LAYER
     Styling comes from PDF.js's own pdf_viewer.css, linked above. Do not reimplement
     those rules - the layer's geometry is coupled to what renderTextLayer emits, and
     two positioning bugs have already come from hand-rolled substitutes.

     What follows is only (a) a safety net if that stylesheet fails to load, and (b) the
     selection colour, which is ours to choose.

     The safety net matters: without "color: transparent" a failed stylesheet paints
     every glyph a second time on top of the canvas, which looks like a corrupted PDF
     rather than a missing CSS file. (No backticks in this comment - STYLES is itself a
     template literal, and one would terminate it.) */
  .textLayer { position: absolute; inset: 0; overflow: hidden; line-height: 1;
    opacity: 0.3; forced-color-adjust: none; }
  .textLayer > span { color: transparent; position: absolute; white-space: pre;
    cursor: text; transform-origin: 0% 0%; }
  /* Opaque on purpose: the container's opacity fades the layer as a single group, so
     overlapping spans can't compound their alpha into dark seams between lines. */
  .textLayer ::selection { background: #1a73e8; }
  .textLayer > span::selection { background: #1a73e8; }
  /* Above the highlight overlay, so text stays selectable over an existing highlight. */
  .textLayer { z-index: 2; }

  /* HIGHLIGHT OVERLAY
     Sits between the canvas and the text layer, and takes no pointer events at all -
     clicks on a highlight are found by hit-testing the click point against the stored
     PDF-space rects instead. Giving the rects their own pointer events would block text
     selection over anything already highlighted.

     Blend mode + isolation live on THIS layer, not on each rect and not per highlight -
     see the comment below for why the scope had to widen twice. DOM order (canvas, then
     this, then the text layer) already gives the right paint order; isolation does not
     change that, it only decides what a descendant's blend mode composites against. */
  .pdfa-highlights { position: absolute; inset: 0; overflow: hidden; pointer-events: none;
    mix-blend-mode: multiply; isolation: isolate; }
  /* Every rect on the page - across EVERY highlight, not just within one - has to
     flatten together before the single multiply pass against the canvas, or two
     overlapping rects double-color wherever they touch.
     Two live reports, same underlying bug, different scope each time:
       1. One highlight's OWN line rects can overlap by a pixel or two - tightly-set
          text can have one line's descender ink dip into the next line's ascender
          space. Fixed first by isolating per HIGHLIGHT (one group per highlight).
       2. That fix left the SAME seam between two DIFFERENT highlights whose rects
          happen to touch at a line boundary (recolor a highlight beside an existing
          one, or two separate highlights on adjacent lines) - each highlight was its
          own isolated group, so two groups touching still each multiplied the page
          independently, compounding right back.
     Isolating the whole layer instead of each highlight fixes both at once: every rect
     on the page composites flat against every other rect first (same or different
     highlight, doesn't matter - two opaque rects overlapping just show whichever
     painted last, no color math), and the FLATTENED result blends against the canvas
     exactly once. The .pdfa-hl-group class below is now purely organizational (keeps a
     highlight's own rects together, carries its id) - it has no blend mode of its own,
     or it would re-isolate its own subtree and undo the point of the wider scope.
     (No backticks anywhere in this comment - STYLES is itself a template literal.) */
  .pdfa-hl-group { position: absolute; inset: 0; }
  .pdfa-hl { position: absolute; border-radius: 2px; }
  /* The cue for "this is the highlight your link pointed at". Scrolling to it does not
     say WHICH one on a page that holds several, possibly adjacent and the same color.
     An outline, not a color or opacity change: those are what a highlight already uses
     to mean something, so borrowing them would read as "this highlight is different"
     rather than "look here". outline also does not affect layout or feed into the
     multiply blend the rects composite through. */
  @keyframes pdfa-flash {
    0%, 100% { outline-color: transparent; }
    15%, 60% { outline-color: var(--pdfa-accent); }
  }
  .pdfa-hl-flash .pdfa-hl { outline: 2px solid transparent; outline-offset: 1px;
    animation: pdfa-flash 1.3s ease-in-out 2; }
  /* Focused only to make the host note scroll this embed into view (see
     revealSelfInHostNote) - the outline the browser would draw would be a full-viewer
     ring that means nothing to the reader. */
  #pdfa-root:focus { outline: none; }

  /* The four colors are top-level toolbar buttons, single click, no submenu - an
     explicit spec requirement, not a layout preference. The bare .pdfa-color selector is
     for the popover copies; the descendant one exists only to outrank
     ".pdfa-toolbar button" above, which would otherwise impose its padding. */
  .pdfa-color, .pdfa-toolbar .pdfa-color { width: 20px; height: 20px; padding: 0; border-radius: 50%;
    border: 1px solid rgba(0,0,0,.28); cursor: pointer; font: inherit; }
  .pdfa-color:hover, .pdfa-toolbar .pdfa-color:hover { background-clip: padding-box; }
  /* The selected ring is drawn INSIDE the swatch - a 2px accent border with an inset ring
     of the bar's own color holding it off the fill. It used to be two stacked outer
     box-shadows, which added 4px on every side of a 20px circle and pushed the ring past
     the toolbar's edges: the bar looked like the selection was spilling out of it.
     Anything drawn outward from a control sitting in a tight bar has to be paid for by
     the bar's padding, and here the padding is set by the other controls' text. */
  .pdfa-color[aria-pressed="true"], .pdfa-toolbar .pdfa-color[aria-pressed="true"] {
    border: 2px solid var(--pdfa-accent); box-shadow: inset 0 0 0 2px var(--pdfa-toolbar); }
  .pdfa-hint { display: none; opacity: .75; font-size: 12px; white-space: nowrap; }

  /* Remove / recolor actions for an existing highlight. Positioned "fixed" because the
     embed is its own iframe, so a click's client coordinates are already relative to
     this element's containing block - no scroll-offset arithmetic to get wrong. */
  /* max-height + scroll is what keeps a popover INSIDE the embed. It is fixed-positioned
     in an iframe, so "off the bottom" is not merely ugly - the parent page cannot show
     the overflow and the rest of the menu is simply unreachable. A short embed with a
     six-item menu hit this: showPopover flips above the cursor when it would overflow
     below, but when the menu is taller than the whole viewport there is nowhere to flip
     to, and it clipped. Scrolling is the only answer that always fits.

     Shadow is softer than it was, to sit with Amplenote's own menus rather than shout
     over them; the border is what carries the edge in dark mode, where a shadow reads as
     nothing at all. */
  .pdfa-popover { position: fixed; display: none; gap: 5px; align-items: center; padding: 6px 8px;
    z-index: 20; background: var(--pdfa-toolbar); color: var(--pdfa-fg); max-width: 320px; flex-wrap: wrap;
    max-height: calc(100vh - 8px); overflow-y: auto;
    border: 1px solid var(--pdfa-border); border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.10); }
  .pdfa-popover.pdfa-open { display: flex; }
  /* The note editor turns the popover into a small column form. */
  .pdfa-popover.pdfa-editing { flex-direction: column; align-items: stretch; width: 274px; }
  /* Export all's color filter: independently-toggled swatches, not the single-select
     behaviour the same .pdfa-color class has everywhere else - the filter is "any
     combination of colors", not "one active color". */
  .pdfa-popover.pdfa-exporting { flex-direction: column; align-items: stretch; width: 220px; }
  /* The toolbar overflow menu (Download / Export / Remove), shaped after Amplenote's own
     note menu: a tight card of full-width rows, left-aligned, no borders at rest, and a
     rounded tint under the row on hover. The gap goes to 0 and the spacing moves into the
     rows themselves, so the hover tint is a continuous band rather than a button with
     visible gutters above and below it. */
  .pdfa-popover.pdfa-menu { flex-direction: column; align-items: stretch; width: 216px; gap: 0; padding: 5px; }
  .pdfa-popover.pdfa-menu .pdfa-btn { text-align: left; border-color: transparent; background: transparent;
    padding: 8px 10px; border-radius: 6px; font-size: 13px; }
  /* Rows keep their height when the menu hits its max-height, so the overflow SCROLLS
     rather than compressing every row toward illegibility. Without this the column's
     flex children shrink to fit and the cap silently squashes the menu instead of
     letting it scroll - which measures as "fits" while looking broken. */
  .pdfa-popover.pdfa-menu > * { flex: 0 0 auto; }
  .pdfa-popover.pdfa-menu .pdfa-btn:hover { background: var(--pdfa-btn-hover); }
  .pdfa-export-colors { display: flex; gap: 6px; padding: 2px 0 8px; }
  .pdfa-export-hint { font-size: 12px; opacity: .75; padding-bottom: 6px; }
  .pdfa-note-input { font: inherit; font-size: 12px; width: 100%; resize: vertical; padding: 6px;
    border: 1px solid var(--pdfa-border); border-radius: 5px;
    background: var(--pdfa-bg); color: inherit; }
  .pdfa-note-actions { display: flex; gap: 5px; margin-top: 6px; align-items: center; }
  .pdfa-note-actions .pdfa-spacer { flex: 1 1 auto; }

  .pdfa-btn { font: inherit; font-size: 12px; padding: 3px 9px; line-height: 1.25;
    border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); color: inherit;
    border-radius: 5px; cursor: pointer; white-space: nowrap; }
  .pdfa-btn:hover { background: var(--pdfa-btn-hover); }
  /* Marks the "add a note" offer that the spec requires to appear as soon as a
     highlight is created, so it reads as the suggested next step. */
  .pdfa-btn-primary { border-color: var(--pdfa-accent); color: var(--pdfa-accent); }

  /* HIGHLIGHTS PANEL - the list of every highlight and its note. Groundwork for the
     Phase 5 color filter, which needs somewhere to filter. */
  .pdfa-panel { position: absolute; top: 0; right: 0; bottom: 0; width: 292px; max-width: 85%;
    background: var(--pdfa-toolbar); border-left: 1px solid var(--pdfa-border);
    overflow: auto; padding: 8px; display: none; z-index: 15; }
  .pdfa-panel.pdfa-open { display: block; }
  .pdfa-panel-title { display: flex; justify-content: space-between; align-items: center;
    font-weight: 600; padding: 2px 4px 8px; }
  .pdfa-panel-empty { opacity: .7; padding: 6px 4px; font-size: 12px; line-height: 1.4; }
  .pdfa-hl-row { display: flex; gap: 8px; padding: 7px 6px; border-radius: 6px;
    cursor: pointer; align-items: flex-start; }
  .pdfa-hl-row:hover { background: var(--pdfa-btn-hover); }
  .pdfa-chip { width: 11px; height: 11px; border-radius: 3px; flex: 0 0 auto; margin-top: 3px; }
  .pdfa-hl-page { font-size: 11px; opacity: .6; margin-bottom: 2px; }
  .pdfa-hl-quote { font-size: 12px; line-height: 1.35; }
  /* Italic and indented so a note is never mistaken for the quoted text - the spec is
     explicit that the two must be clearly distinguishable. */
  .pdfa-hl-note { font-size: 12px; line-height: 1.35; opacity: .85; font-style: italic;
    margin-top: 4px; padding-left: 7px; border-left: 2px solid var(--pdfa-border); }

  /* ON-SCREEN SCROLL CONTROLS
     Reported on Android: a drag over the page area scrolls the NOTE, not the pages,
     so the PDF could not be scrolled vertically at all. Horizontal dragging works
     fine, and that asymmetry is the diagnosis - vertical is the host note's own
     scroll axis, so the app claims that gesture (otherwise a full-width embed would
     trap the scroll and you could never get past it), while nothing competes for
     horizontal. That decision is made outside this iframe and no CSS in here can
     take it back: overscroll-behavior on .pdfa-scroll only governs what happens once
     THIS element hits its end, not who owns the gesture to begin with.

     So the answer is a control that does not depend on a gesture at all. Programmatic
     scrolling is untouched by any of the above, which is why the page buttons in the
     toolbar have kept working throughout. Buttons rather than a slider: a slider needs
     precise dragging on a track barely wider than a finger, and has to sit on top of
     the text it is scrolling. */
  /* Above the highlights panel's own z-index, because these scroll the PANEL while it is
     open - it is unreachable by dragging for exactly the same reason the pages are. */
  .pdfa-scrollnav { display: none; position: absolute; right: 6px; top: 50%;
    transform: translateY(-50%); flex-direction: column; gap: 8px; z-index: 16; }
  .pdfa-scrollnav button { width: 40px; height: 40px; border-radius: 50%; font: inherit;
    font-size: 13px; line-height: 1; cursor: pointer; color: inherit; padding: 0;
    border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); opacity: .85;
    box-shadow: 0 1px 4px rgba(0,0,0,.25); }
  .pdfa-scrollnav button:disabled { opacity: .35; }

  /* ---- NARROW EMBEDS -------------------------------------------------------
     Confirmed on a real Android phone running the Amplenote app: embeds DO render
     there, but at a phone note width (~358px) the toolbar wrapped to THREE rows -
     with the overflow button stranded alone on the third, the exact outcome the
     comment on #pdfa-more says it was grouped left to avoid - and the chrome above
     the pages ended up taller than the strip of page left below it.

     The query is on the EMBED's own width, not the device's. The iframe viewport IS
     the box Amplenote gives us, so "narrow here" already means "this viewer is
     narrow" - and it catches a cramped desktop sidebar too, which a device check
     would miss. */
  @media (max-width: 520px) {
    /* Dividers cost ~9px each and stop earning it once the rows wrap: the wrap
       itself is now what groups the controls. */
    .pdfa-sep { display: none; }
    /* The brand is what answers "which viewer is this" - Amplenote renders its OWN
       preview for the same attachment and the two look broadly alike. It is dropped
       only here, at a width where a full row costs more than the ambiguity does, and
       where the four color swatches beside a "Notes (n)" button are already a
       signature Amplenote's own preview has nothing like. It is still on the
       collapsed bar and heads the overflow menu. */
    .pdfa-toolbar .pdfa-brand { display: none; }
    .pdfa-toolbar { gap: 4px; padding: 5px 6px; justify-content: center; }
    .pdfa-label { min-width: 44px; }
    /* Zoom was moved into the overflow menu here for one release, to buy back a 40px
       toolbar row. Reverted after use on a real phone: a stepper reached through a menu
       is worse than a second toolbar row, and the row costs proportionally less now that
       the box is taller (a phone gets ~358px rather than ~298px). Kept as a note rather
       than deleted silently, so the idea is not re-proposed as if untried. */
    /* Full width, since the row it shares is no longer competing with a page. */
    .pdfa-panel { width: 100%; max-width: 100%; }
  }

  /* ---- TOUCH POINTERS ------------------------------------------------------
     Hit areas only - nothing here changes what anything looks like on a mouse.
     The 44px figure is the WCAG 2.5.5 / platform HIG minimum; the toolbar's own
     buttons were 24-26px tall and the color swatches 20px across, with the four
     swatches sitting shoulder to shoulder. */
  @media (pointer: coarse) {
    /* The only place these appear. A mouse has a wheel and a trackpad has two-finger
       scrolling, neither of which the host note competes for. */
    .pdfa-scrollnav { display: flex; }
    /* Room for those buttons down the panel's right edge, so a highlight's text never
       runs underneath them. Only on touch, and only while the panel is open - a mouse
       never sees the buttons at all, so it must not pay for the gutter. */
    .pdfa-panel.pdfa-open { padding-right: 54px; }
    /* :not(.pdfa-color) is load-bearing. The swatches ARE buttons in this toolbar, so
       without it they inherit min-height and render as 40x20 ellipses - caught by
       measuring, not by reading. They get their bigger hit area from ::after below,
       which leaves the circle alone. */
    .pdfa-toolbar button:not(.pdfa-color) { min-height: 40px; padding: 8px 12px; }
    #pdfa-more { padding: 8px 14px; }
    .pdfa-btn { min-height: 38px; }
    .pdfa-hl-row { padding: 11px 8px; }
    /* A bigger target without a bigger circle: an invisible overlay centred on the
       swatch, reaching past its 20px visual to 42px. Four 44px circles would
       dominate a toolbar that is already the tallest thing in the box on a phone,
       and the swatch's size is what makes it read as a color chip rather than a
       button. */
    .pdfa-color, .pdfa-toolbar .pdfa-color { position: relative; }
    .pdfa-color::after { content: ""; position: absolute; inset: -10px -5px; }
    /* The four swatches sit shoulder to shoulder, so the hit areas above would run
       into each other and a near-miss would apply the wrong color - the one mis-tap
       in this toolbar that silently changes the document. Spreading them gives each
       one room to be 30px wide without touching its neighbour. */
    #pdfa-colors { display: inline-flex; gap: 10px; vertical-align: middle; }
    /* The whole collapsed bar becomes the tap target, not just its Expand button.
       The bar's box is sized by data-aspect-ratio as a fraction of the note width
       (see constants.js), so on a phone it is ~22px tall - too short to ever hold a
       44px button. Full-bleed width is what makes it comfortably tappable instead. */
    .pdfa-collapsed { cursor: pointer; }
  }

  /* The collapsed bar, when its box is shorter than the bar's natural height.
     Measured: the bar wants 44px, but width/16 at a 358px phone note width gives
     the iframe only 22px, so it was being cut in half. The box cannot adapt per
     device - data-aspect-ratio is written into the shared note markup, so one value
     has to serve every screen - which leaves compressing the CONTENT as the only
     lever. A height query works here because the iframe viewport is the box. */
  @media (max-height: 34px) {
    .pdfa-collapsed { padding: 0 8px; gap: 6px; font-size: 12px; height: 100%; }
    .pdfa-collapsed .pdfa-btn { padding: 0 8px; min-height: 0; font-size: 11px; }
    .pdfa-collapsed-count { display: none; }
  }
`,Et={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function Nt({attachmentUUID:t,attachmentName:l="",page:r=null,highlightId:s=null,lightDarkMode:i="light",pluginUUID:d=null,noteUUID:o=null,collapsed:p=!1}={}){let k=Et[i]||Et.light,S={attachmentUUID:t,page:r,highlightId:s,pluginUUID:d,noteUUID:o,pdfJsSrc:oe.pdfJs,workerSrc:oe.pdfJsWorker,pdfLibSrc:oe.pdfLib,colors:se.map(y=>({id:y.id,label:y.label,hex:y.hex,rgb:y.rgb,cycleIndex:y.cycleIndex})),defaultColorId:ce,collapsed:p,attachmentName:l};return`<link rel="stylesheet" href="${oe.pdfViewerCss}">
<style>:root{${k}}${En}</style>
<div id="pdfa-root"${p?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${yn(l)}</span>
    <span class="pdfa-spacer"></span>
    <span class="pdfa-collapsed-count" id="pdfa-collapsed-count"></span>
    <button id="pdfa-open" class="pdfa-btn pdfa-btn-primary">Expand</button>
  </div>
  <div class="pdfa-toolbar">
    <!-- Identifies this viewer at a glance. Amplenote renders its OWN PDF preview for
         an attachment, and both can sit in the same note looking broadly similar; a
         reader had no reliable way to tell which one they were interacting with. -->
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-sep"></span>
    <button id="pdfa-prev" title="Previous page">&#8249;</button>
    <span class="pdfa-label" id="pdfa-page-label">- / -</span>
    <button id="pdfa-next" title="Next page">&#8250;</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" title="Zoom out">&#8722;</button>
    <span class="pdfa-label" id="pdfa-zoom-label">125%</span>
    <button id="pdfa-zoom-in" title="Zoom in">+</button>
    <span class="pdfa-sep"></span>
    <!-- The four single-click highlight color buttons, mounted by the viewer from
         config.colors. Top-level toolbar buttons with no submenu is an explicit spec
         requirement (section 4), which is why the slot is here and not in a panel. -->
    <span id="pdfa-colors"></span>
    <span class="pdfa-hint" id="pdfa-hint"></span>
    <span class="pdfa-sep"></span>
    <button id="pdfa-list-toggle" title="Show highlights and notes">Notes (<span id="pdfa-count">0</span>)</button>
    <span class="pdfa-sep"></span>
    <!-- Download, Export and Remove are all occasional, one-off actions - unlike the
         colors (top-level is an explicit spec requirement) or page/zoom/Notes (used
         constantly while reading) - so they live behind one overflow menu instead of
         three permanent buttons competing for space in an embed that's often barely
         wider than a page. Nothing here is spec-mandated to be top-level; this is our
         own toolbar design, not an Amplenote requirement. Grouped with the other
         controls on the left, not off by the filename, so it reads as part of the
         toolbar rather than a stray button wrapped onto its own line. -->
    <button id="pdfa-more" title="More actions">&#8942;</button>
  </div>
  <!-- The filename used to have a whole row to itself here. It was removed: Amplenote's
       own attachment chip sits immediately above this embed carrying the SAME filename
       (that is where insertViewer places the viewer, directly beneath its chip), so the
       row was showing the name a second time within about 30px of the first - visible on
       both desktop and phone. It cost a full row of the box on every screen to do it.
       The name is still on the collapsed bar, and now heads the overflow menu, so it is
       never more than one tap away for a viewer that has been moved away from its chip.
       Kept as a hidden element rather than deleted so setAttachmentName has one code
       path and the export/download names cannot silently diverge from what is shown. -->
  <span class="pdfa-name" hidden></span>
  <div class="pdfa-status" id="pdfa-status">Loading...</div>
  <div class="pdfa-body">
    <div class="pdfa-scroll"><div id="pdfa-pages"></div></div>
    <div class="pdfa-panel" id="pdfa-panel"></div>
    <!-- Touch-only scroll controls. Deliberately AFTER the panel so the sibling
         selector that hides them behind it works - see the CSS. -->
    <div class="pdfa-scrollnav">
      <button id="pdfa-scroll-up" title="Scroll up" aria-label="Scroll up">&#9650;</button>
      <button id="pdfa-scroll-down" title="Scroll down" aria-label="Scroll down">&#9660;</button>
    </div>
  </div>
  <!-- Colors on a fresh selection; recolor / note / remove on an existing highlight;
       the note editor itself. One element, filled in per context by the viewer. -->
  <div class="pdfa-popover" id="pdfa-popover"></div>
</div>
<script>window.__PDFA_CONFIG = ${Cn(S)};
window.__PDFA_GEOM = (${De.toString()})();
window.__PDFA_ANNOTATIONS = (${Ue.toString()})();
window.__PDFA_EXPORT = (${He.toString()})();<\/script>
<script>(${Ct.toString()})();<\/script>`}var Nn={noteOption:{"Annotate PDF":async function(t,l){return at(t,l,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,l){return it(t,l)}},insertText:async function(t){return lt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...l){return st(t,l[0])},renderEmbed:function(t,...l){let{attachmentUUID:r,page:s,highlightId:i,collapsed:d,attachmentName:o}=re(l[0]);return r?Nt({attachmentUUID:r,page:s,highlightId:i,collapsed:d,attachmentName:o,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...l){return yt(t,l[0])}},Sn=Nn;return sn(Tn);})();

  var plugin = __pluginModule.default;
})();
