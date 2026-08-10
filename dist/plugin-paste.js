(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Se=Object.defineProperty;var nn=Object.getOwnPropertyDescriptor;var on=Object.getOwnPropertyNames;var an=Object.prototype.hasOwnProperty;var rn=(t,s)=>{for(var a in s)Se(t,a,{get:s[a],enumerable:!0})},sn=(t,s,a,l)=>{if(s&&typeof s=="object"||typeof s=="function")for(let i of on(s))!an.call(t,i)&&i!==a&&Se(t,i,{get:()=>s[i],enumerable:!(l=nn(s,i))||l.enumerable});return t};var ln=t=>sn(Se({},"__esModule",{value:!0}),t);var kn={};rn(kn,{default:()=>Sn});var le=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ce="yellow",G="PDF Annotator data",Ye="attachment://",Qe=1,Ke=16,oe={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},cn="https://plugins.amplenote.com/cors-proxy";function Ze(t){let s=new URL(cn);return s.searchParams.set("apiurl",t),s.toString()}var dn="application/pdf";function hn(t){return Array.isArray(t)?t.filter(s=>s&&s.type===dn&&s.uuid):[]}async function de(t,s){let a=await t.getNoteAttachments({uuid:s}),l=hn(a);if(l.length===0)return null;if(l.length===1)return l[0];let i=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:l.map(o=>({label:o.name,value:o.uuid})),value:l[0].uuid}]});if(i==null)return null;let d=Array.isArray(i)?i[0]:i;return l.find(o=>o.uuid===d)||null}async function et(t,s){if(!s)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(s);if(!a)throw new Error(`No URL returned for attachment ${s}`);return Ze(a)}function tt(t){return t?Ke:Qe}function ae(t){let s={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return s;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return s}let l=d=>{let o=a.get(d);if(o===null||o.trim()==="")return null;let p=Number(o);return Number.isFinite(p)?p:null},i=l("page");return{attachmentUUID:a.get("att")||null,page:i!==null&&i>=1?Math.floor(i):null,x:l("x"),y:l("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function nt({attachmentUUID:t,page:s,x:a,y:l,highlightId:i,collapsed:d,attachmentName:o}={}){let p=new URLSearchParams;return t&&p.set("att",t),d&&p.set("c","1"),o&&p.set("n",o),Number.isFinite(s)&&s>=1&&p.set("page",String(Math.floor(s))),Number.isFinite(a)&&p.set("x",String(a)),Number.isFinite(l)&&p.set("y",String(l)),i&&p.set("hl",i),p.toString()}function he(t,s={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=tt(s.collapsed));let l=nt(s);return`<object data="${l?`plugin://${t}?${l}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function ot(t,s,a){if(!t||!s||!a)return null;let l=t.split(`
`),i=l.findIndex(o=>o.includes(`${Ye}${s}`));if(i===-1)return null;let d=l.slice();return l[i+1]===""?d.splice(i+2,0,a.trim(),""):d.splice(i+1,0,"",a.trim(),""),d.join(`
`)}function pe(t,s,a=null){return!t||!s||!t.includes(`plugin://${s}`)?!1:a?t.includes(`att=${a}`):!0}function ue(t,s,a){if(!t||!s||!a)return null;let l=t.split(`
`),i=`plugin://${s}`,d=l.findIndex(p=>p.includes(i)&&p.includes(`att=${a}`));if(d===-1)return null;let o=l.slice();return o.splice(d,1),o[d]===""&&o[d-1]===""&&o.splice(d,1),o.join(`
`)}function re(t,s,a,l={}){if(!t||!s||!a)return null;let i=t.split(`
`),d=`plugin://${s}`,o=i.findIndex(k=>k.includes(d)&&k.includes(`att=${a}`));if(o===-1)return null;let p=i[o],T=p.match(/data="(plugin:\/\/[^"]*)"/);if(!T)return null;let S=T[1],y=S.indexOf("?"),N=y===-1?"":S.slice(y+1),v={...ae(N),attachmentUUID:a,...l},u=nt(v),f=u?`plugin://${s}?${u}`:`plugin://${s}`,b=i.slice(),x=p.replace(T[0],`data="${f}"`),C=tt(v.collapsed),E=x.match(/data-aspect-ratio="[^"]*"/);return x=E?x.replace(E[0],`data-aspect-ratio="${C}"`):x.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),b[o]=x,b.join(`
`)}function at(t,s,a,l){return re(t,s,a,{collapsed:!!l})}async function rt(t,s,a){let l=await de(t,s);if(!l){let p=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(p)&&p.length>0)||!p.some(S=>S&&S.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let i=await t.getNoteContent({uuid:s});if(pe(i,a,l.uuid))return await t.alert(`"${l.name}" is already open in this note - scroll to the viewer.`),l.uuid;let d=he(a,{attachmentUUID:l.uuid,attachmentName:l.name}),o=ot(i,l.uuid,d);return o!==null?(await t.replaceNoteContent({uuid:s},o),l.uuid):(await t.insertNoteContent({uuid:s},`
${d}
`,{atEnd:!0}),l.uuid)}var pn="Raw markdown";function un(t){let s=(String(t||"").match(/`+/g)||[]).reduce((a,l)=>Math.max(a,l.length),0);return"`".repeat(Math.max(3,s+1))}async function it(t,s){let a=await t.getNoteContent({uuid:s});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let l=await t.getNoteAttachments({uuid:s}),i=(Array.isArray(l)?l:[]).map(p=>`- ${p&&p.name} | ${p&&p.type} | ${p&&p.uuid}`).join(`
`),d=un(a),o=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:o},`# Attachments

${i||"- (none)"}

# ${pn}

${d}
${a}
${d}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),o}async function st(t,s,a){if(!s)return"";let l=await de(t,s);if(!l){let d=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(d)&&d.length>0)||!d.some(p=>p&&p.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let i=await t.getNoteContent({uuid:s});return pe(i,a,l.uuid)?(await t.alert(`"${l.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${he(a,{attachmentUUID:l.uuid,attachmentName:l.name})}
`}async function fn(t,s,a,l){let i={uuid:s},d=ue(a,t.context.pluginUUID,l);if(d!==null)try{await t.replaceNoteContent(i,d)}catch{}try{await t.replaceNoteContent(i,a)}catch{await t.replaceNoteContent(i,a)}}async function lt(t,s){let{noteUUID:a,attachmentUUID:l,page:i,highlightId:d}=ae(s);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let o=await t.getNoteContent({uuid:a}),p=re(o,t.context.pluginUUID,l,{page:i,highlightId:d,collapsed:!1});p!==null&&(t.context&&t.context.noteUUID===a?await fn(t,a,p,l):await t.replaceNoteContent({uuid:a},p))}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function fe(t){if(!t)return null;let s=String(t).trim().toLowerCase();return le.find(a=>a.id===s||a.hex.toLowerCase()===s)||null}function ct(){return fe(ce)}function gn(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function ge({page:t,color:s,rects:a,quoteText:l,note:i=null,id:d=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let p of a)if(![p.x,p.y,p.width,p.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(p)}`);let o=fe(s)||ct();return{id:d||gn(),page:t,color:o.id,rects:a.map(p=>({x:p.x,y:p.y,width:p.width,height:p.height})),quoteText:String(l||""),note:i?String(i):null}}function dt(t,s){let a=s==null?null:String(s).trim();return{...t,note:a||null}}function ht(t,s){let a=fe(s);if(!a)throw new Error(`withColor: unknown color "${s}"`);return{...t,color:a.id}}function pt(t,s){return(t||[]).filter(a=>a.id!==s)}function ke(t,s,a){let l=!1,i=(t||[]).map(d=>d.id!==s?d:(l=!0,a(d)));return l?i:t}var mn="json",ut="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function ft(t){let s=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${ut}
\`\`\`${mn}
${s}
\`\`\``}function Te(t){if(!t)return null;let s=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!s&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),l=(s?s[1]:a?a[1]:t).trim();if(!l)return null;try{return JSON.parse(l)}catch{return null}}function vn(t){if(!Array.isArray(t))return[];let s=[];for(let a of t)try{s.push(ge(a))}catch{}return s}async function me(t,s,a){let l=await t.getNoteContent({uuid:s}),i=Ie(l,G),d=Te(i);return!d||typeof d!="object"?[]:vn(d[a])}async function gt(t,s,a,l){let i={uuid:s},d=await t.getNoteContent(i),o=Ie(d,G),T={...Te(o)||{},[a]:l},S=ft(T);o===null&&await t.insertNoteContent(i,`

# ${G}

`,{atEnd:!0});let y=bn(d,S);if(y!==null){await t.replaceNoteContent(i,y);return}await t.replaceNoteContent(i,S,{section:{heading:{text:G,level:1}}})}async function mt(t,s,a){let l={uuid:s},i=await t.getNoteContent(l),d=Ie(i,G);if(d===null)return;let o=Te(d)||{};if(!(a in o))return;let p={...o};delete p[a],await t.replaceNoteContent(l,ft(p),{section:{heading:{text:G,level:1}}})}function Ae(t,s){let a=/^#\s+(.*)$/,l=t.findIndex(d=>{let o=d.match(a);return o&&o[1].trim()===s});if(l===-1)return null;let i=t.length;for(let d=l+1;d<t.length;d++)if(/^#\s+/.test(t[d])){i=d;break}return{start:l,end:i}}function Ie(t,s){if(!t)return null;let a=t.split(`
`),l=Ae(a,s);return l?a.slice(l.start+1,l.end).join(`
`).trim():null}function wn(t){if(!t)return"";let s=t,a=s.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return a&&(s=s.replace(a[0],"")),s=s.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),s=s.replace(ut,""),s.trim()}function vt(t,s){return String(t||"").includes("](plugin://")?s:`---

${s}`}function wt(t,s){let a=(t||"").split(`
`),l=Ae(a,G);if(!l)return null;let i=a.slice(0,l.start).join(`
`).replace(/\s+$/,""),d=a.slice(l.start).join(`
`);return`${i?i+`

`:""}${s}

${d}`}function bn(t,s){let a=(t||"").split(`
`),l=Ae(a,G);if(!l)return null;let i=wn(a.slice(l.start+1,l.end).join(`
`).trim());if(!i)return null;let d=a.slice(0,l.start).join(`
`).replace(/\s+$/,""),o=a.slice(l.end).join(`
`).replace(/^\s+/,"");return`${d?d+`

`:""}${i}

${a[l.start]}

${s}${o?`

`+o:""}`}function q(t,s){return s.noteUUID||t.context.noteUUID}async function bt(t,s,a){try{let l=await t.getNoteAttachments({uuid:s}),i=Array.isArray(l)&&l.find(d=>d&&d.uuid===a);return i?i.name:""}catch{return""}}async function ve(t,s,a,l){let i=await me(t,s,a),d=l(i);return d!==i&&await gt(t,s,a,d),{highlights:d}}function xt(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let s=t.trim();if(!s.startsWith("{"))return{action:s};try{return JSON.parse(s)}catch{return{action:s}}}async function yt(t,s){return JSON.stringify(await xn(t,xt(s)))}async function xn(t,s){let a=xt(s);switch(a.action){case"getPdfUrl":{let l=a.attachmentUUID;if(!l)return{error:"No attachment specified for this viewer."};try{return{url:await et(t,l),name:await bt(t,q(t,a),l)}}catch(i){return{error:`Could not load the PDF: ${i.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await me(t,q(t,a),a.attachmentUUID)}}catch(l){return{error:`Could not load highlights: ${l.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let l=ge(a.highlight||{});return await ve(t,q(t,a),a.attachmentUUID,i=>i.concat([l]))}catch(l){return{error:`Could not save the highlight: ${l.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ve(t,q(t,a),a.attachmentUUID,l=>ke(l,a.id,i=>ht(i,a.color)))}catch(l){return{error:`Could not change the highlight color: ${l.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ve(t,q(t,a),a.attachmentUUID,l=>ke(l,a.id,i=>dt(i,a.note)))}catch(l){return{error:`Could not save the note: ${l.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ve(t,q(t,a),a.attachmentUUID,l=>pt(l,a.id))}catch(l){return{error:`Could not remove the highlight: ${l.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{let l={uuid:q(t,a)},i=await t.getNoteContent(l),d=vt(i,a.content),o=wt(i,d);return o===null?await t.insertNoteContent(l,`
`+d+`
`,{atEnd:!0}):await t.replaceNoteContent(l,o),{ok:!0}}catch(l){return{error:`Could not add this to the note: ${l.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=q(t,a),i=await t.getNoteContent({uuid:l}),d=ue(i,a.pluginUUID,a.attachmentUUID);return d===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:l},d),await mt(t,l,a.attachmentUUID),{ok:!0})}catch(l){return{error:`Could not remove this viewer: ${l.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let l=q(t,a),i=await bt(t,l,a.attachmentUUID);try{let d=await me(t,l,a.attachmentUUID);return{name:i,count:d.length}}catch{return{name:i,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=q(t,a),i=await t.getNoteContent({uuid:l}),d=at(i,a.pluginUUID,a.attachmentUUID,a.collapsed);return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:l},d),{ok:!0})}catch(l){return{error:`Could not resize this viewer: ${l.message}`}}}case"clearDeepLink":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=q(t,a),i=await t.getNoteContent({uuid:l}),d=re(i,a.pluginUUID,a.attachmentUUID,{page:null,highlightId:null});return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:l},d),{ok:!0})}catch(l){return{error:`Could not clear this viewer's deep link: ${l.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let l=await t.findNote({name:a.noteName}),i=l?l.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:i},a.content||""),{ok:!0,noteUUID:i}}catch(l){return{error:`Could not export highlights: ${l.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function De(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function s(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function a(u,f){var b=Math.pow(10,f===void 0?2:f),x=function(C){return Math.round(C*b)/b};return{x:x(u.x),y:x(u.y),width:x(u.width),height:x(u.height)}}function l(u){return u.width>.01&&u.height>.01}function i(u,f,b){for(var x=String(u??""),C=Math.max(0,f===void 0?0:f),E=Math.min(x.length,b===void 0?x.length:b),k=function(O){return O===""||/\s/.test(O)},A=[],I=C;I<E;){for(;I<E&&k(x.charAt(I));)I++;if(I>=E)break;for(var $=I;I<E&&!k(x.charAt(I));)I++;A.push({start:$,end:I})}return A}function d(u){for(var f=1/0,b=1/0,x=-1/0,C=-1/0,E=0;E<(u?u.length:0);E++){var k=u[E];l(k)&&(f=Math.min(f,k.left),b=Math.min(b,k.top),x=Math.max(x,k.left+k.width),C=Math.max(C,k.top+k.height))}return isFinite(f)?{left:f,top:b,width:x-f,height:C-b}:null}function o(u,f,b){for(var x=[],C=0;C<u.length;C++){var E=t(u[C],f);if(l(E)){var k=b(E.x,E.y),A=b(E.x+E.width,E.y+E.height),I=a(s(k,A));l(I)&&x.push(I)}}return x}function p(u,f){var b=f(u.x,u.y),x=f(u.x+u.width,u.y+u.height);return s(b,x)}function T(u,f,b){var x=f.right-f.left,C=f.bottom-f.top;if(x<=0||C<=0)return null;var E=u.x2-u.x1,k=u.y2-u.y1,A=u.x1+(b.left-f.left)/x*E,I=u.x2-(f.right-b.right)/x*E,$=u.y1+(b.bottom-f.bottom)/C*k,O=u.y2-(f.top-b.top)/C*k;return{x:A,y:$,width:I-A,height:O-$}}function S(u,f){var b=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return b>.5*Math.min(u.height,f.height)}function y(u,f){var b=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var x=u.slice().sort(function(j,J){return J.y-j.y||j.x-J.x}),C=[],E=0;E<x.length;E++){for(var k=!1,A=0;A<C.length;A++)if(S(C[A][0],x[E])){C[A].push(x[E]),k=!0;break}k||C.push([x[E]])}for(var I=[],$=0;$<C.length;$++){for(var O=C[$].slice().sort(function(j,J){return j.x-J.x}),R=null,W=0;W<O.length;W++){var F=O[W];if(R===null){R={x:F.x,y:F.y,width:F.width,height:F.height};continue}var ie=F.x-(R.x+R.width);if(ie<=b*Math.max(R.height,F.height)){var ee=Math.max(R.x+R.width,F.x+F.width),be=Math.max(R.y+R.height,F.y+F.height);R.x=Math.min(R.x,F.x),R.y=Math.min(R.y,F.y),R.width=ee-R.x,R.height=be-R.y}else I.push(R),R={x:F.x,y:F.y,width:F.width,height:F.height}}R!==null&&I.push(R)}return I.map(function(j){return a(j)})}function N(u,f,b,x){var C=x===void 0?0:x;return f>=u.x-C&&f<=u.x+u.width+C&&b>=u.y-C&&b<=u.y+u.height+C}function w(u,f,b,x,C){for(var E=u||[],k=E.length-1;k>=0;k--){var A=E[k];if(!(!A||A.page!==f||!A.rects)){for(var I=0;I<A.rects.length;I++)if(N(A.rects[I],b,x,C===void 0?1:C))return A}}return null}function v(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:s,roundRect:a,isVisibleRect:l,textTokenRanges:i,unionClientRects:d,clientRectsToPdfRects:o,pdfRectToViewportRect:p,itemRelativeRect:T,mergeLineRects:y,rectContainsPoint:N,hitTestHighlights:w,normalizeQuoteText:v}}var _=De(),eo=_.clientRectToLocal,to=_.rectFromCorners,no=_.roundRect,oo=_.isVisibleRect,ao=_.textTokenRanges,ro=_.unionClientRects,io=_.clientRectsToPdfRects,so=_.pdfRectToViewportRect,lo=_.itemRelativeRect,co=_.mergeLineRects,ho=_.rectContainsPoint,po=_.hitTestHighlights,uo=_.normalizeQuoteText;function Ue(){var t=[.957,.871,.424];function s(d,o,p,T,S){var y=o.context.register(o.context.obj({Type:d.PDFName.of("ExtGState"),BM:d.PDFName.of("Multiply"),ca:d.PDFNumber.of(.4)})),N=[d.pushGraphicsState(),d.setGraphicsState("GS0")];N.push(d.setFillingColor(d.rgb(T[0],T[1],T[2])));for(var w=0;w<p.length;w++){var v=p[w];N.push(d.moveTo(v.x,v.y)),N.push(d.lineTo(v.x,v.y+v.height)),N.push(d.lineTo(v.x+v.width,v.y+v.height)),N.push(d.lineTo(v.x+v.width,v.y)),N.push(d.closePath())}N.push(d.fill()),N.push(d.popGraphicsState());var u=o.context.formXObject(N,{BBox:S,Resources:{ExtGState:{GS0:y}}});return o.context.register(u)}function a(d,o,p,T){for(var S=p.rects,y=[],N=S[0].x,w=S[0].y,v=S[0].x+S[0].width,u=S[0].y+S[0].height,f=0;f<S.length;f++){var b=S[f],x=b.x,C=b.x+b.width,E=b.y,k=b.y+b.height;y.push(x,k,C,k,x,E,C,E),N=Math.min(N,x),w=Math.min(w,E),v=Math.max(v,C),u=Math.max(u,k)}var A=o.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Highlight"),Rect:o.context.obj([N,w,v,u]),QuadPoints:o.context.obj(y),C:o.context.obj(T),F:d.PDFNumber.of(4),T:d.PDFString.of("PDF Annotator"),M:d.PDFString.of(new Date().toISOString()),CA:d.PDFNumber.of(.4)});p.note&&A.set(d.PDFName.of("Contents"),d.PDFString.of(p.note));var I=s(d,o,S,T,[N,w,v,u]);A.set(d.PDFName.of("AP"),o.context.obj({N:I}));var $=o.context.register(A),O=[$];if(p.note){var R=o.context.register(o.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Popup"),Rect:o.context.obj([v+8,w-60,v+208,w+12]),Parent:$,Open:!1}));A.set(d.PDFName.of("Popup"),R),O.push(R)}return O}function l(d,o,p){var T=o.node.get(d.PDFName.of("Annots"));if(T instanceof d.PDFArray)for(var S=0;S<p.length;S++)T.push(p[S]);else o.node.set(d.PDFName.of("Annots"),o.doc.context.obj(p))}async function i(d,o,p,T){for(var S=await d.PDFDocument.load(o),y=S.getPages(),N=p||[],w=0;w<N.length;w++){var v=N[w];if(!(!v||!v.rects||!v.rects.length)){var u=y[v.page-1];if(u){var f=T&&T[v.color]||t,b=a(d,S,v,f);l(d,u,b)}}}return S.save()}return{writeHighlightsIntoPdf:i,buildHighlightAnnotation:a,appendAnnotationRefs:l}}var Pe=Ue(),go=Pe.writeHighlightsIntoPdf,mo=Pe.buildHighlightAnnotation,vo=Pe.appendAnnotationRefs;function He(){function t(y){return String(y??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function s(y,N,w,v,u){var f=new URLSearchParams;N&&f.set("att",N),Number.isFinite(w)&&w>=1&&f.set("page",String(Math.floor(w))),v&&f.set("hl",v),u&&f.set("note",u);var b=f.toString();return"plugin://"+y+(b?"?"+b:"")}function a(y,N){return String(y??"").split(/\r?\n/).map(function(w){return(N+" "+w).replace(/[ \t]+$/,"")})}function l(y,N,w){return N==null?y:"<mark"+(w?' style="background-color:'+w+';"':"")+">"+y+'<!-- {"backgroundCycleColor":"'+N+'"} --></mark>'}function i(y,N,w,v,u,f,b){var x=s(N,w,v.page,v.id,b),C=l(t(y||"PDF"),u,f),E="["+C+"]("+x+")",k=[E].concat(a(v.quoteText,"> >"));return v.note&&(k.push(">"),k=k.concat(a(v.note,">"))),k.join(`
`)}function d(y){return String(y??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(y){return"<p>"+d(y).replace(/\r?\n/g,"<br>")+"</p>"}function p(y,N,w,v,u,f,b){var x=s(N,w,v.page,v.id,b),C=d(y||"PDF"),E=f?'<mark style="background-color: '+d(f)+';">'+C+"</mark>":C,k='<p><a href="'+d(x)+'">'+E+"</a></p>",A="<blockquote><blockquote>"+o(v.quoteText)+"</blockquote></blockquote>",I=v.note?"<blockquote>"+o(v.note)+"</blockquote>":"";return k+A+I}function T(y){return y.slice().sort(function(N,w){if(N.page!==w.page)return N.page-w.page;var v=N.rects&&N.rects[0]?N.rects[0].y:0,u=w.rects&&w.rects[0]?w.rects[0].y:0;return u-v})}function S(y,N,w,v,u,f,b){var x=f&&f.length?f:null,C=(v||[]).filter(function(A){return A&&(!x||x.indexOf(A.color)!==-1)}),E=T(C),k=E.map(function(A){var I=u&&u[A.color]||{};return i(y,N,w,A,I.cycleIndex,I.hex,b)});return k.join(`

`)}return{buildDeepLink:s,buildHighlightBlock:i,buildHighlightHtml:p,buildExportAllContent:S}}var we=He(),bo=we.buildDeepLink,xo=we.buildHighlightBlock,yo=we.buildHighlightHtml,Co=we.buildExportAllContent;function Ct(){var t=window.__PDFA_CONFIG||{},s=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},l=window.__PDFA_EXPORT||{},i={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function d(e){e&&(o.attachmentName=e,i.name&&(i.name.textContent=e),i.collapsedName&&(i.collapsedName.textContent=e))}var o={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function p(e,n){i.status.textContent=e||"",i.status.style.display=e?"block":"none",i.status.className=n?"pdfa-status pdfa-error":"pdfa-status"}function T(e){var n=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(r,c){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(n)))}catch(h){c(h)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function S(){return t.colors||[]}function y(e){for(var n=S(),r=0;r<n.length;r++)if(n[r].id===e)return n[r].hex;return n.length?n[0].hex:"#F4DE6C"}function N(e){for(var n=0;n<o.highlights.length;n++)if(o.highlights[n].id===e)return o.highlights[n];return null}function w(e,n,r){var c=document.createElement("button");return c.className="pdfa-btn"+(n?" "+n:""),c.textContent=e,c.onclick=function(h){h.stopPropagation(),r()},c}function v(e,n,r,c){var h=document.createElement("button");return h.className="pdfa-color",h.dataset.color=e.id,h.style.background=e.hex,h.title=c+" "+e.label,h.setAttribute("aria-label",c+" "+e.label),h.setAttribute("aria-pressed",String(!!n)),h.onclick=function(m){m.stopPropagation(),r(e.id)},h}function u(){for(var e=S(),n=0;n<e.length;n++)i.colors.appendChild(v(e[n],e[n].id===o.activeColorId,function(r){o.activeColorId=r,f(),o.pendingSelection&&Le(o.pendingSelection,r)},"Highlight"))}function f(){for(var e=i.colors.querySelectorAll(".pdfa-color"),n=0;n<e.length;n++)e[n].setAttribute("aria-pressed",String(e[n].dataset.color===o.activeColorId))}function b(){for(var e=[],n=1;n<=o.pageCount;n++)(function(r){e.push(o.doc.getPage(r).then(function(c){o.viewports[r]=c.getViewport({scale:o.scale})}))})(n);return Promise.all(e)}function x(e){var n=o.viewports[e],r=document.createElement("div");return r.className="pdfa-page",r.dataset.page=String(e),r.style.width=n.width+"px",r.style.height=n.height+"px",r}function C(e,n){if(o.rendered[n]||o.renderingPage[n])return Promise.resolve();o.renderingPage[n]=!0;var r=o.viewports[n],c=document.createElement("canvas"),h=window.devicePixelRatio||1;c.width=Math.floor(r.width*h),c.height=Math.floor(r.height*h),c.style.width=r.width+"px",c.style.height=r.height+"px",e.appendChild(c);var m=document.createElement("div");m.className="pdfa-highlights",e.appendChild(m);var g=document.createElement("div");g.className="textLayer",g.style.width=r.width+"px",g.style.height=r.height+"px",g.style.setProperty("--scale-factor",String(o.scale)),e.appendChild(g);var D=c.getContext("2d");D.scale(h,h);var P=null;return o.doc.getPage(n).then(function(H){return P=H,H.render({canvasContext:D,viewport:r}).promise}).then(function(){return P.getTextContent()}).then(function(H){var U=[];return window.pdfjsLib.renderTextLayer({textContent:H,container:g,viewport:r,textDivs:U}).promise.then(function(){o.textSpans+=U.length;for(var L=0;L<U.length;L++)U[L].__pdfaItem=H.items[L];o.rendered[n]=!0,o.renderingPage[n]=!1,$(n),k()})}).catch(function(H){o.renderingPage[n]=!1,p("Failed to render page "+n+": "+(H.message||H),!0)})}function E(){var e=Y();if(!e||!o.doc)return Promise.resolve();for(var n=e.getBoundingClientRect(),r=e.clientHeight,c=i.pages.querySelectorAll(".pdfa-page"),h=[],m=0;m<c.length;m++){var g=c[m],D=Number(g.dataset.page);if(!(o.rendered[D]||o.renderingPage[D])){var P=g.getBoundingClientRect(),H=P.top-n.top,U=P.bottom-n.top;U<-r||H>e.clientHeight+r||h.push(C(g,D))}}return Promise.all(h)}function k(){var e=0;for(var n in o.rendered)o.rendered[n]&&e++;if(e){var r=o.textSpans===0;p(r?"No selectable text found - this PDF may be a scan.":"",r)}}function A(){if(o.rendering)return Promise.resolve();o.rendering=!0,M(!0),p("Rendering...");var e=Y(),n=e?e.scrollHeight-e.clientHeight:0,r=n>0?e.scrollTop/n:0;return i.pages.innerHTML="",o.viewports={},o.rendered={},o.renderingPage={},o.textSpans=0,b().then(function(){for(var c=1;c<=o.pageCount;c++)i.pages.appendChild(x(c));if(e){var h=e.scrollHeight-e.clientHeight;e.scrollTop=r*(h>0?h:0)}o.rendering=!1,te(),ne(),E()}).catch(function(c){o.rendering=!1,p("Failed to render: "+(c.message||c),!0)})}function I(e){return function(n,r){return e.convertToViewportPoint(n,r)}}function $(e){for(var n=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",r=i.pages.querySelectorAll(n),c=0;c<r.length;c++){var h=r[c],m=Number(h.dataset.page),g=h.querySelector(".pdfa-highlights"),D=o.viewports[m];if(!(!g||!D)){g.innerHTML="";for(var P=I(D),H=0;H<o.highlights.length;H++){var U=o.highlights[H];if(!(!U||U.page!==m||!U.rects||!U.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=U.id||"";for(var V=0;V<U.rects.length;V++){var K=s.pdfRectToViewportRect(U.rects[V],P),B=document.createElement("div");B.className="pdfa-hl",B.style.left=K.x+"px",B.style.top=K.y+"px",B.style.width=K.width+"px",B.style.height=K.height+"px",B.style.background=y(U.color),L.appendChild(B)}g.appendChild(L)}}}}}function O(){$(),W(),i.count.textContent=String(o.highlights.length)}function R(){return o.highlights.slice().sort(function(e,n){return e.page!==n.page?e.page-n.page:(n.rects[0]?n.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function W(){i.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var n=document.createElement("span");n.textContent="Highlights",e.appendChild(n),e.appendChild(w("Close","",function(){ie(!1)})),i.panel.appendChild(e);var r=R();if(!r.length){var c=document.createElement("div");c.className="pdfa-panel-empty",c.textContent="No highlights yet. Select some text in the PDF and pick a color.",i.panel.appendChild(c);return}for(var h=0;h<r.length;h++)i.panel.appendChild(F(r[h]))}function F(e){var n=document.createElement("div");n.className="pdfa-hl-row",n.dataset.id=e.id||"",n.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=y(e.color),n.appendChild(r);var c=document.createElement("div"),h=document.createElement("div");h.className="pdfa-hl-page",h.textContent="Page "+e.page,c.appendChild(h);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,c.appendChild(m),e.note){var g=document.createElement("div");g.className="pdfa-hl-note",g.textContent=e.note,c.appendChild(g)}return n.appendChild(c),n.onclick=function(){$e(e)},n}function ie(e){var n=e===void 0?!i.panel.classList.contains("pdfa-open"):e;i.panel.classList.toggle("pdfa-open",n),i.listToggle.setAttribute("aria-pressed",String(n)),n&&W(),ne()}function ee(e){for(var n=e&&e.nodeType===1?e:e&&e.parentElement;n;){if(n.classList&&n.classList.contains("textLayer"))return n;n=n.parentElement}return null}function be(e,n){for(var r=[],c=[],h=null,m=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),g;g=m.nextNode();)if(e.intersectsNode(g)){var D=g.nodeValue||"",P=g===e.startContainer?e.startOffset:0,H=g===e.endContainer?e.endOffset:D.length,U=g.parentElement,L=U&&U.__pdfaItem;if(L)for(var V={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},K=U.getBoundingClientRect(),B=s.textTokenRanges(D,P,H),Z=0;Z<B.length;Z++){var Ne=document.createRange();Ne.setStart(g,B[Z].start),Ne.setEnd(g,B[Z].end);var z=s.unionClientRects(Ne.getClientRects());if(z){var Je={left:z.left,top:z.top,width:z.width,height:z.height,right:z.left+z.width,bottom:z.top+z.height},Xe=s.itemRelativeRect(V,K,Je);Xe&&(r.push(Xe),c.push(D.slice(B[Z].start,B[Z].end)),h=Je)}}}return{rects:r,text:c.join(" "),lastCssRect:h}}function j(e){if(o.pendingSelection=e,o.lastCapturedText=e&&e.rawText||"",!e){i.hint.textContent="",i.hint.style.display="none";return}i.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",i.hint.style.display="inline"}function J(e){if(!o.noteEditing){var n=window.getSelection();if(!n||n.isCollapsed||n.rangeCount===0){j(null),M();return}var r=n.getRangeAt(0),c=ee(r.startContainer);if(!c)return j(null);var h=c.parentElement;if(!h||!h.dataset||!h.dataset.page)return j(null);var m=Number(h.dataset.page);if(!o.rendered[m])return j(null);var g=ee(r.endContainer)!==c,D=be(r,c),P=s.mergeLineRects(D.rects);if(!P.length)return j(null);var H=D.lastCssRect||h.getBoundingClientRect(),U=e&&e.clientX?e.clientX:H.left+H.width/2,L=e&&e.clientY?e.clientY:H.top+H.height,V={page:m,rects:P,quoteText:s.normalizeQuoteText(D.text),spilled:g,anchorX:U,anchorY:L,rawText:String(n)};j(V),It(V)}}var St=300,X=null;function kt(){o.noteEditing||(X&&clearTimeout(X),X=setTimeout(Re,St))}function Re(){if(X=null,!o.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||ee(e.getRangeAt(0).startContainer)&&String(e)!==o.lastCapturedText&&J(null)}}function se(e,n){var r=o.highlights;return o.highlights=e,O(),T(n).then(function(c){if(!c||c.error)throw new Error(c&&c.error||"The plugin did not confirm the change.");return o.highlights=c.highlights||e,O(),p(""),!0}).catch(function(c){return o.highlights=r,O(),p(c.message||String(c),!0),!1})}function Le(e,n){var r={id:null,page:e.page,color:n,rects:e.rects,quoteText:e.quoteText,note:null},c=e.anchorX,h=e.anchorY;j(null),M(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),se(o.highlights.concat([r]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:r}).then(function(g){if(g){var D=o.highlights[o.highlights.length-1];D&&D.id&&ye(D,c,h,!0)}})}function Tt(e,n){M(!0),se(o.highlights.map(function(r){return r.id===e?Object.assign({},r,{color:n}):r}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:n})}function At(e){M(!0),se(o.highlights.filter(function(n){return n.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function xe(e,n){var r=String(n??"").trim();o.noteEditing=null,M(!0),se(o.highlights.map(function(c){return c.id===e?Object.assign({},c,{note:r||null}):c}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:r})}function Q(e,n,r,c){i.popover.innerHTML="",i.popover.classList.toggle("pdfa-editing",c==="editing"),i.popover.classList.toggle("pdfa-exporting",c==="exporting"),i.popover.classList.toggle("pdfa-menu",c==="menu");for(var h=0;h<e.length;h++)i.popover.appendChild(e[h]);i.popover.classList.add("pdfa-open");var m=i.popover.offsetWidth,g=i.popover.offsetHeight,D=Math.max(4,Math.min(n-m/2,window.innerWidth-m-4)),P=r+12;P+g>window.innerHeight-4&&(P=Math.max(4,r-g-12)),P=Math.max(4,Math.min(P,window.innerHeight-g-4)),i.popover.style.left=D+"px",i.popover.style.top=P+"px"}function M(e){o.noteEditing&&!e||(o.noteEditing=null,i.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),i.popover.innerHTML="")}function It(e){for(var n=S(),r=[],c=0;c<n.length;c++)r.push(v(n[c],n[c].id===o.activeColorId,function(h){o.activeColorId=h,f(),Le(e,h)},"Highlight"));Q(r,e.anchorX,e.anchorY)}function ye(e,n,r,c){for(var h=S(),m=[],g=0;g<h.length;g++)m.push(v(h[g],h[g].id===e.color,function(P){Tt(e.id,P)},"Change to"));var D=!!e.note;m.push(w(D?"Edit note":"Add note",c&&!D?"pdfa-btn-primary":"",function(){Ut(e,n,r)})),m.push(w("Copy","",function(){zt(e)})),m.push(w("Send to note","",function(){Gt(e)})),m.push(w("Remove","pdfa-remove",function(){At(e.id)})),Q(m,n,r)}function Dt(e,n){for(var r=S(),c={},h=0;h<r.length;h++)c[r[h].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var g=document.createElement("div");g.className="pdfa-export-colors";for(var D=0;D<r.length;D++)(function(H){var U=v(H,!0,function(L){c[L]=!c[L],U.setAttribute("aria-pressed",String(c[L]))},"Toggle");g.appendChild(U)})(r[D]);var P=document.createElement("div");P.className="pdfa-note-actions",P.appendChild(w("Create / update note","pdfa-btn-primary",function(){for(var H=[],U=0;U<r.length;U++)c[r[U].id]&&H.push(r[U].id);Vt(H.length===r.length?null:H)})),Q([m,g,P],e,n,"exporting")}function Ut(e,n,r){o.noteEditing=e.id;var c=document.createElement("textarea");c.className="pdfa-note-input",c.rows=3,c.value=e.note||"",c.placeholder="Note for this highlight";var h=document.createElement("div");h.className="pdfa-note-actions",e.note&&h.appendChild(w("Delete note","",function(){xe(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",h.appendChild(m),h.appendChild(w("Cancel","",function(){Me(e,n,r)})),h.appendChild(w("Save","pdfa-btn-primary",function(){xe(e.id,c.value)})),c.onkeydown=function(g){g.key==="Enter"&&(g.ctrlKey||g.metaKey)?(g.preventDefault(),g.stopPropagation(),xe(e.id,c.value)):g.key==="Escape"&&(g.preventDefault(),g.stopPropagation(),Me(e,n,r))},Q([c,h],n,r,"editing"),c.focus(),c.setSelectionRange(c.value.length,c.value.length)}function Me(e,n,r){o.noteEditing=null;var c=N(e.id)||e;ye(c,n,r)}function Pt(e){if(!o.noteEditing){var n=window.getSelection();if(!(n&&!n.isCollapsed)){for(var r=e.target,c=null;r&&r!==i.pages;){if(r.classList&&r.classList.contains("pdfa-page")){c=r;break}r=r.parentElement}if(!c)return M();var h=Number(c.dataset.page),m=o.viewports[h];if(!m)return M();var g=c.getBoundingClientRect(),D=m.convertToPdfPoint(e.clientX-g.left,e.clientY-g.top),P=s.hitTestHighlights(o.highlights,h,D[0],D[1],1);P&&P.id?ye(P,e.clientX,e.clientY):M()}}}function te(){i.pageLabel.textContent=o.current+" / "+o.pageCount,i.zoomLabel.textContent=Math.round(o.scale*100)+"%"}function Y(){return i.root.querySelector(".pdfa-scroll")}function Fe(){return i.panel&&i.panel.classList.contains("pdfa-open")?i.panel:Y()}function Oe(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e+'"]');n&&C(n,e)}function Ce(e){var n=Math.min(Math.max(1,e),o.pageCount),r=i.pages.querySelector('.pdfa-page[data-page="'+n+'"]');Oe(n);var c=Y();r&&c&&(c.scrollTop+=r.getBoundingClientRect().top-c.getBoundingClientRect().top),E(),o.current=n,te()}function $e(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),r=o.viewports[e.page];if(!(!n||!r||!e.rects||!e.rects.length)){var c=s.pdfRectToViewportRect(e.rects[0],I(r)),h=Y(),m=n.getBoundingClientRect().top+c.y;h.scrollTop+=m-h.getBoundingClientRect().top-h.clientHeight/3,Oe(e.page),E(),o.current=e.page,te()}}function Ht(){try{i.root.setAttribute("tabindex","-1"),i.root.focus(),i.root.scrollIntoView&&i.root.scrollIntoView({block:"nearest"})}catch{}}function Rt(e){if(!(!e||!e.id)){var n=i.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');n&&(n.classList.add("pdfa-hl-flash"),setTimeout(function(){n.classList.remove("pdfa-hl-flash")},2600))}}function je(e){return o.scale=Math.min(Math.max(.4,e),4),A()}function Lt(){return o.doc?o.doc.getPage(1).then(function(e){var n=Y();if(n){var r=window.getComputedStyle(n),c=n.clientWidth-(parseFloat(r.paddingLeft)||0)-(parseFloat(r.paddingRight)||0),h=e.getViewport({scale:1}).width;if(!(!(c>0)||!(h>0))){var m=Math.max(.4,c/h);m<o.scale&&(o.scale=m,te())}}}).catch(function(){}):Promise.resolve()}function Be(e){var n=Fe();n&&(n.scrollTop+=e*Math.max(80,n.clientHeight*.85),ne(),E())}function _e(e,n){var r=null,c=null,h=!1,m=function(){r&&clearTimeout(r),c&&clearInterval(c),r=c=null};e.addEventListener("pointerdown",function(){m(),h=!1,r=setTimeout(function(){h=!0,c=setInterval(function(){if(e.disabled)return m();Be(n*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(g){e.addEventListener(g,m)}),e.onclick=function(){if(h){h=!1;return}Be(n)}}function ne(){var e=Fe();if(!(!e||!i.scrollUp)){var n=e.scrollHeight-e.clientHeight;i.scrollUp.disabled=e.scrollTop<=1,i.scrollDown.disabled=e.scrollTop>=n-1}}function Mt(){ne(),E(),M();for(var e=i.pages.querySelectorAll(".pdfa-page"),n=o.current,r=1/0,c=0;c<e.length;c++){var h=Math.abs(e[c].getBoundingClientRect().top-60);h<r&&(r=h,n=Number(e[c].dataset.page))}n!==o.current&&(o.current=n,te())}function Ft(){return new Promise(function(e,n){if(window.pdfjsLib)return e(window.pdfjsLib);var r=document.createElement("script");r.src=t.pdfJsSrc,r.onload=function(){window.pdfjsLib?e(window.pdfjsLib):n(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){n(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function Ot(){return new Promise(function(e,n){if(window.PDFLib)return e(window.PDFLib);var r=document.createElement("script");r.src=t.pdfLibSrc,r.onload=function(){window.PDFLib?e(window.PDFLib):n(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){n(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function $t(){for(var e={},n=S(),r=0;r<n.length;r++)n[r].rgb&&(e[n[r].id]=n[r].rgb);return e}function jt(){var e=(o.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Ee(){for(var e={},n=S(),r=0;r<n.length;r++)e[n[r].id]={cycleIndex:n[r].cycleIndex,hex:n[r].hex};return e}function qe(){var e=(o.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function ze(e){var n=Ee()[e.color]||{};return l.buildHighlightBlock(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,n.cycleIndex,n.hex,t.noteUUID)}function Bt(e){if(!l.buildHighlightHtml)return null;var n=Ee()[e.color]||{};return l.buildHighlightHtml(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,n.cycleIndex,n.hex,t.noteUUID)}function _t(e,n){var r=function(m){var g=m.clipboardData||window.clipboardData;g&&(g.setData("text/plain",e),n&&g.setData("text/html",n),m.preventDefault())},c=document.createElement("textarea");c.value=e,c.style.position="fixed",c.style.left="-9999px",document.body.appendChild(c),c.focus(),c.select(),document.addEventListener("copy",r,!0);var h=!1;try{h=document.execCommand("copy")}catch{h=!1}return document.removeEventListener("copy",r,!0),document.body.removeChild(c),h}function qt(e,n){var r=function(){return!navigator.clipboard||!navigator.clipboard.writeText?c():navigator.clipboard.writeText(e).then(function(){return"plain"},c)},c=function(){return _t(e,n)?Promise.resolve(n?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(n&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var h=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([n],{type:"text/html"})});return navigator.clipboard.write([h]).then(function(){return"rich"},r)}catch{return r()}return r()}function zt(e){M(!0);var n,r;try{n=ze(e),r=Bt(e)}catch(c){p("Could not build the copy: "+(c.message||c),!0);return}qt(n,r).then(function(c){p(c==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(c){p("Could not copy: "+(c.message||c),!0)})}function Gt(e){M(!0),T({action:"sendToNote",content:ze(e)}).then(function(n){if(!n||n.error)throw new Error(n&&n.error||"Could not send this to the note.");p("Added to this note, below the text.")}).catch(function(n){p(n.message||String(n),!0)})}function Vt(e){M(!0);var n=l.buildExportAllContent(o.attachmentName,t.pluginUUID,t.attachmentUUID,o.highlights,Ee(),e,t.noteUUID);if(!n){p(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}T({action:"exportAll",noteName:qe(),content:n}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");p('Exported to "'+qe()+'".')}).catch(function(r){p(r.message||String(r),!0)})}function Wt(e,n){var r=[];r.push(w("Collapse","",function(){M(!0),Zt()}),w("Download","",function(){M(!0),Yt()}),w("Export...","",function(){Dt(e,n)}),w("Remove viewer...","pdfa-remove",function(){Jt(e,n)})),Q(r,e,n,"menu")}function Jt(e,n){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var c=document.createElement("div");c.className="pdfa-note-actions",c.appendChild(w("Cancel","",function(){M(!0)}));var h=document.createElement("span");h.className="pdfa-spacer",c.appendChild(h),c.appendChild(w("Remove","pdfa-remove",Xt)),Q([r,c],e,n,"exporting")}function Xt(){M(!0),p("Removing this viewer..."),T({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){p(e.message||String(e),!0)})}function Yt(){o.pdfBytes&&(p("Preparing the download..."),Ot().then(function(e){return a.writeHighlightsIntoPdf(e,o.pdfBytes,o.highlights,$t())}).then(function(e){return Qt(e,jt())}).catch(function(e){p("Could not prepare the download: "+(e.message||e),!0)}))}function Qt(e,n){var r=new Blob([e],{type:"application/pdf"}),c=null;try{c=new File([r],n,{type:"application/pdf"})}catch{}return c&&navigator.share&&navigator.canShare&&navigator.canShare({files:[c]})?navigator.share({files:[c],title:n}).then(function(){p("")}).catch(function(h){return h&&h.name==="AbortError"?p(""):Ge(r,n)}):Ge(r,n)}function Ge(e,n){var r=URL.createObjectURL(e),c=document.createElement("a");c.href=r,c.download=n,document.body.appendChild(c),c.click(),c.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3);var h=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return p(h?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function Kt(){return T({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");o.highlights=e.highlights||[]}).catch(function(e){o.highlights=[],p("Could not load saved highlights: "+(e.message||e),!0)})}function Zt(){var e=o.highlights.length;i.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",i.root.classList.add("pdfa-collapsed-mode"),Ve(!0)}function Ve(e){T({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function en(){T({action:"clearDeepLink",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function tn(){i.root.classList.remove("pdfa-collapsed-mode"),o.doc||We(),Ve(!1)}function We(){p("Loading PDF..."),(t.highlightId||t.page)&&(Ht(),en()),Ft().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,T({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return d(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return o.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return o.doc=e,o.pageCount=e.numPages,Kt()}).then(function(){return Lt()}).then(function(){return A()}).then(function(){O();var e=t.highlightId?N(t.highlightId):null;e?($e(e),Rt(e)):t.page&&Ce(t.page)}).catch(function(e){p(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){Ce(o.current-1)},document.getElementById("pdfa-next").onclick=function(){Ce(o.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){je(o.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){je(o.scale-.25)},_e(i.scrollUp,-1),_e(i.scrollDown,1),i.listToggle.onclick=function(){ie()},i.more.onclick=function(e){Wt(e.clientX,e.clientY)},Y().addEventListener("scroll",Mt),i.panel.addEventListener("scroll",ne),i.pages.addEventListener("mouseup",J),i.pages.addEventListener("click",Pt),document.addEventListener("selectionchange",kt),i.pages.addEventListener("touchend",function(){X&&clearTimeout(X),X=null,Re()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!o.noteEditing&&M()}),document.addEventListener("mousedown",function(e){i.popover.classList.contains("pdfa-open")&&(i.popover.contains(e.target)||M())}),u(),W(),i.root.querySelector(".pdfa-collapsed").onclick=tn,t.collapsed?T({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){d(e.name);var n=e.count||0;i.collapsedCount.textContent=n?n+(n===1?" highlight":" highlights"):""}}).catch(function(){}):We()}catch(e){p("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function yn(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Cn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var En=`
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
  /* No filename heading in the overflow menu. It was moved there when its own toolbar row
     was removed for duplicating Amplenote's attachment chip - but the chip is right above
     the embed, so the menu copy duplicated it just as much, only truncated to uselessness
     in a 216px card. The collapsed bar still carries the name, which is the one state
     where no chip is in view. */
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
     nothing at all.

     BOTH axes are named. Setting only overflow-y does not leave the other axis alone:
     CSS computes an "overflow: visible" on one axis to "auto" when the other is not
     visible, so a y-only rule quietly buys an x scrollbar too, and any sub-pixel width
     overflow then draws a horizontal bar across the bottom of the menu. Reported live as
     "the slider is unnecessary" - it was, and nothing was actually scrollable sideways. */
  .pdfa-popover { position: fixed; display: none; gap: 5px; align-items: center; padding: 6px 8px;
    z-index: 20; background: var(--pdfa-toolbar); color: var(--pdfa-fg); max-width: 320px; flex-wrap: wrap;
    max-height: calc(100vh - 8px); overflow-x: hidden; overflow-y: auto;
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
  /* A floating card, inset from the body's edges rather than filling them. Flush against
     the right and bottom with only a left border, it read as bleeding out of the viewer -
     nothing marked where the panel stopped and the embed ended, so it looked like
     overflow even though its box was exactly inside the body. The inset plus a full
     border, rounded corners and a shadow is what makes it read as sitting ABOVE the page,
     which is what it actually does.

     max-width leaves the same 8px on the other side, so the card stays inset rather than
     growing flush again on a narrow embed. */
  .pdfa-panel { position: absolute; top: 8px; right: 8px; bottom: 8px; width: 292px;
    max-width: calc(100% - 16px);
    background: var(--pdfa-toolbar); border: 1px solid var(--pdfa-border); border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.10);
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
    /* Spans the body, since the row it shares is no longer competing with a page - but
       via "left" rather than a 100% width, so it keeps the same 8px inset on every side
       and stays a card. Going full-bleed here is what made it look like overflow. */
    .pdfa-panel { left: 8px; width: auto; max-width: none; }
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
`,Et={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function Nt({attachmentUUID:t,attachmentName:s="",page:a=null,highlightId:l=null,lightDarkMode:i="light",pluginUUID:d=null,noteUUID:o=null,collapsed:p=!1}={}){let T=Et[i]||Et.light,S={attachmentUUID:t,page:a,highlightId:l,pluginUUID:d,noteUUID:o,pdfJsSrc:oe.pdfJs,workerSrc:oe.pdfJsWorker,pdfLibSrc:oe.pdfLib,colors:le.map(y=>({id:y.id,label:y.label,hex:y.hex,rgb:y.rgb,cycleIndex:y.cycleIndex})),defaultColorId:ce,collapsed:p,attachmentName:s};return`<link rel="stylesheet" href="${oe.pdfViewerCss}">
<style>:root{${T}}${En}</style>
<div id="pdfa-root"${p?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${yn(s)}</span>
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
<script>(${Ct.toString()})();<\/script>`}var Nn={noteOption:{"Annotate PDF":async function(t,s){return rt(t,s,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,s){return it(t,s)}},insertText:async function(t){return st(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...s){return lt(t,s[0])},renderEmbed:function(t,...s){let{attachmentUUID:a,page:l,highlightId:i,collapsed:d,attachmentName:o}=ae(s[0]);return a?Nt({attachmentUUID:a,page:l,highlightId:i,collapsed:d,attachmentName:o,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...s){return yt(t,s[0])}},Sn=Nn;return ln(kn);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
