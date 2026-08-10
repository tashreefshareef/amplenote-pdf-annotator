(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Ne=Object.defineProperty;var cn=Object.getOwnPropertyDescriptor;var dn=Object.getOwnPropertyNames;var hn=Object.prototype.hasOwnProperty;var pn=(t,s)=>{for(var n in s)Ne(t,n,{get:s[n],enumerable:!0})},un=(t,s,n,i)=>{if(s&&typeof s=="object"||typeof s=="function")for(let a of dn(s))!hn.call(t,a)&&a!==n&&Ne(t,a,{get:()=>s[a],enumerable:!(i=cn(s,a))||i.enumerable});return t};var fn=t=>un(Ne({},"__esModule",{value:!0}),t);var Ln={};pn(Ln,{default:()=>Rn});var le=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ce="yellow",V="PDF Annotator data",et="attachment://",tt=1,nt=16,oe={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},gn="https://plugins.amplenote.com/cors-proxy";function ot(t){let s=new URL(gn);return s.searchParams.set("apiurl",t),s.toString()}var mn="application/pdf";function vn(t){return Array.isArray(t)?t.filter(s=>s&&s.type===mn&&s.uuid):[]}async function de(t,s){let n=await t.getNoteAttachments({uuid:s}),i=vn(n);if(i.length===0)return null;if(i.length===1)return i[0];let a=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:i.map(r=>({label:r.name,value:r.uuid})),value:i[0].uuid}]});if(a==null)return null;let c=Array.isArray(a)?a[0]:a;return i.find(r=>r.uuid===c)||null}async function rt(t,s){if(!s)throw new Error("fetchableAttachmentURL: attachmentUUID required");let n=await t.getAttachmentURL(s);if(!n)throw new Error(`No URL returned for attachment ${s}`);return ot(n)}function at(t){return t?nt:tt}function re(t){let s={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return s;let n;try{n=new URLSearchParams(t.replace(/^\?/,""))}catch{return s}let i=c=>{let r=n.get(c);if(r===null||r.trim()==="")return null;let h=Number(r);return Number.isFinite(h)?h:null},a=i("page");return{attachmentUUID:n.get("att")||null,page:a!==null&&a>=1?Math.floor(a):null,x:i("x"),y:i("y"),highlightId:n.get("hl")||null,noteUUID:n.get("note")||null,collapsed:n.get("c")==="1",attachmentName:n.get("n")||""}}function it({attachmentUUID:t,page:s,x:n,y:i,highlightId:a,collapsed:c,attachmentName:r}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),r&&h.set("n",r),Number.isFinite(s)&&s>=1&&h.set("page",String(Math.floor(s))),Number.isFinite(n)&&h.set("x",String(n)),Number.isFinite(i)&&h.set("y",String(i)),a&&h.set("hl",a),h.toString()}function he(t,s={},n=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");n===null&&(n=at(s.collapsed));let i=it(s);return`<object data="${i?`plugin://${t}?${i}`:`plugin://${t}`}" data-aspect-ratio="${n}" />`}function st(t,s,n){if(!t||!s||!n)return null;let i=t.split(`
`),a=i.findIndex(r=>r.includes(`${et}${s}`));if(a===-1)return null;let c=i.slice();return i[a+1]===""?c.splice(a+2,0,n.trim(),""):c.splice(a+1,0,"",n.trim(),""),c.join(`
`)}function pe(t,s,n=null){return!t||!s||!t.includes(`plugin://${s}`)?!1:n?t.includes(`att=${n}`):!0}function ue(t,s,n){if(!t||!s||!n)return null;let i=t.split(`
`),a=`plugin://${s}`,c=i.findIndex(h=>h.includes(a)&&h.includes(`att=${n}`));if(c===-1)return null;let r=i.slice();return r.splice(c,1),r[c]===""&&r[c-1]===""&&r.splice(c,1),r.join(`
`)}function ae(t,s,n,i={}){if(!t||!s||!n)return null;let a=t.split(`
`),c=`plugin://${s}`,r=a.findIndex(U=>U.includes(c)&&U.includes(`att=${n}`));if(r===-1)return null;let h=a[r],S=h.match(/data="(plugin:\/\/[^"]*)"/);if(!S)return null;let k=S[1],y=k.indexOf("?"),I=y===-1?"":k.slice(y+1),v={...re(I),attachmentUUID:n,...i},u=it(v),f=u?`plugin://${s}?${u}`:`plugin://${s}`,b=a.slice(),x=h.replace(S[0],`data="${f}"`),C=at(v.collapsed),E=x.match(/data-aspect-ratio="[^"]*"/);return x=E?x.replace(E[0],`data-aspect-ratio="${C}"`):x.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),b[r]=x,b.join(`
`)}function lt(t,s,n,i){return ae(t,s,n,{collapsed:!!i})}async function ct(t,s,n){let i=await de(t,s);if(!i){let h=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(h)&&h.length>0)||!h.some(k=>k&&k.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let a=await t.getNoteContent({uuid:s});if(pe(a,n,i.uuid))return await t.alert(`"${i.name}" is already open in this note - scroll to the viewer.`),i.uuid;let c=he(n,{attachmentUUID:i.uuid,attachmentName:i.name}),r=st(a,i.uuid,c);return r!==null?(await t.replaceNoteContent({uuid:s},r),i.uuid):(await t.insertNoteContent({uuid:s},`
${c}
`,{atEnd:!0}),i.uuid)}var wn="Raw markdown";function bn(t){let s=(String(t||"").match(/`+/g)||[]).reduce((n,i)=>Math.max(n,i.length),0);return"`".repeat(Math.max(3,s+1))}async function dt(t,s){let n=await t.getNoteContent({uuid:s});if(typeof n!="string"||n==="")return await t.alert("That note came back empty - nothing to dump."),null;let i=await t.getNoteAttachments({uuid:s}),a=(Array.isArray(i)?i:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=bn(n),r=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:r},`# Attachments

${a||"- (none)"}

# ${wn}

${c}
${n}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),r}async function ht(t,s,n){if(!s)return"";let i=await de(t,s);if(!i){let c=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let a=await t.getNoteContent({uuid:s});return pe(a,n,i.uuid)?(await t.alert(`"${i.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${he(n,{attachmentUUID:i.uuid,attachmentName:i.name})}
`}async function xn(t,s,n,i){let a={uuid:s},c=ue(n,t.context.pluginUUID,i);if(c!==null)try{await t.replaceNoteContent(a,c)}catch{}try{await t.replaceNoteContent(a,n)}catch{await t.replaceNoteContent(a,n)}}async function pt(t,s){let{noteUUID:n,attachmentUUID:i,page:a,highlightId:c}=re(s);if(!n){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let r=await t.getNoteContent({uuid:n}),h=ae(r,t.context.pluginUUID,i,{page:a,highlightId:c,collapsed:!1});h!==null&&(t.context&&t.context.noteUUID===n?await xn(t,n,h,i):await t.replaceNoteContent({uuid:n},h))}catch{}await t.navigate(`https://www.amplenote.com/notes/${n}`)}function fe(t){if(!t)return null;let s=String(t).trim().toLowerCase();return le.find(n=>n.id===s||n.hex.toLowerCase()===s)||null}function ut(){return fe(ce)}function yn(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function ge({page:t,color:s,rects:n,quoteText:i,note:a=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(n)||n.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of n)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let r=fe(s)||ut();return{id:c||yn(),page:t,color:r.id,rects:n.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(i||""),note:a?String(a):null}}function ft(t,s){let n=s==null?null:String(s).trim();return{...t,note:n||null}}function gt(t,s){let n=fe(s);if(!n)throw new Error(`withColor: unknown color "${s}"`);return{...t,color:n.id}}function mt(t,s){return(t||[]).filter(n=>n.id!==s)}function Se(t,s,n){let i=!1,a=(t||[]).map(c=>c.id!==s?c:(i=!0,n(c)));return i?a:t}var Cn="json",vt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function wt(t){let s=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${vt}
\`\`\`${Cn}
${s}
\`\`\``}function Ue(t){if(!t)return null;let s=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),n=!s&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),i=(s?s[1]:n?n[1]:t).trim();if(!i)return null;try{return JSON.parse(i)}catch{return null}}function En(t){if(!Array.isArray(t))return[];let s=[];for(let n of t)try{s.push(ge(n))}catch{}return s}async function me(t,s,n){let i=await t.getNoteContent({uuid:s}),a=Ae(i,V),c=Ue(a);return!c||typeof c!="object"?[]:En(c[n])}async function bt(t,s,n,i){let a={uuid:s},c=await t.getNoteContent(a),r=Ae(c,V),S={...Ue(r)||{},[n]:i},k=wt(S);r===null&&await t.insertNoteContent(a,`

# ${V}

`,{atEnd:!0});let y=kn(c,k);if(y!==null){await t.replaceNoteContent(a,y);return}await t.replaceNoteContent(a,k,{section:{heading:{text:V,level:1}}})}async function xt(t,s,n){let i={uuid:s},a=await t.getNoteContent(i),c=Ae(a,V);if(c===null)return;let r=Ue(c)||{};if(!(n in r))return;let h={...r};delete h[n],await t.replaceNoteContent(i,wt(h),{section:{heading:{text:V,level:1}}})}function Te(t,s){let n=/^#\s+(.*)$/,i=t.findIndex(c=>{let r=c.match(n);return r&&r[1].trim()===s});if(i===-1)return null;let a=t.length;for(let c=i+1;c<t.length;c++)if(/^#\s+/.test(t[c])){a=c;break}return{start:i,end:a}}function Ae(t,s){if(!t)return null;let n=t.split(`
`),i=Te(n,s);return i?n.slice(i.start+1,i.end).join(`
`).trim():null}function In(t){if(!t)return"";let s=t,n=s.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return n&&(s=s.replace(n[0],"")),s=s.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),s=s.replace(vt,""),s.trim()}function yt(t,s){return String(t||"").includes("](plugin://")?s:`---

${s}`}function Ct(t,s){let n=(t||"").split(`
`),i=Te(n,V);if(!i)return null;let a=n.slice(0,i.start).join(`
`).replace(/\s+$/,""),c=n.slice(i.start).join(`
`);return`${a?a+`

`:""}${s}

${c}`}function kn(t,s){let n=(t||"").split(`
`),i=Te(n,V);if(!i)return null;let a=In(n.slice(i.start+1,i.end).join(`
`).trim());if(!a)return null;let c=n.slice(0,i.start).join(`
`).replace(/\s+$/,""),r=n.slice(i.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${a}

${n[i.start]}

${s}${r?`

`+r:""}`}function Nn(t){return/^\s*>/.test(t)}function Et(t,s,n,i){if(!t||!s||!i)return null;for(let a=0;a<t.length;a++){let c=t[a];if(!c.includes(`](plugin://${s}`)||n&&!c.includes(`att=${n}`)||!new RegExp(`hl=${Sn(i)}(?![\\w-])`).test(c))continue;let r=a+1;for(;r<t.length&&Nn(t[r]);)r++;return{start:a,end:r}}return null}function Sn(t){return String(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function De(t,s,n){if(!t||!s)return[];let i=[],a=String(t).split(`
`);for(let c of a){if(!c.includes(`](plugin://${s}`)||n&&!c.includes(`att=${n}`))continue;let r=c.match(/[?&]hl=([^&)\s]+)/);r&&i.indexOf(r[1])===-1&&i.push(r[1])}return i}function Pe(t,s,n,i){let a=String(t||"").split(`
`),c=Et(a,s,n,i);if(!c)return null;let{start:r,end:h}=c;h<a.length&&a[h].trim()===""&&h++;let S=a.slice(0,r).concat(a.slice(h));return De(S.join(`
`),s,n).length?S.join(`
`):Un(S).join(`
`)}function Un(t){for(let s=t.length-1;s>=0;s--){let n=t[s].trim();if(n!==""){if(n==="---"){let i=t.slice(0,s).concat(t.slice(s+1));for(;i.length&&i[i.length-1].trim()==="";)i.pop();return i}return t}}return t}function He(t,s,n,i,a){let c=String(t||"").split(`
`),r=Et(c,s,n,i);return r?c.slice(0,r.start).concat(String(a).split(`
`),c.slice(r.end)).join(`
`):null}function q(t,s){return s.noteUUID||t.context.noteUUID}async function It(t,s,n){try{let i=await t.getNoteAttachments({uuid:s}),a=Array.isArray(i)&&i.find(c=>c&&c.uuid===n);return a?a.name:""}catch{return""}}async function ve(t,s,n,i){let a=await me(t,s,n),c=i(a);return c!==a&&await bt(t,s,n,c),{highlights:c}}async function kt(t,s,n,i){if(n.pluginUUID)try{let a=await t.getNoteContent({uuid:s}),c=i(a);c!==null&&c!==a&&await t.replaceNoteContent({uuid:s},c)}catch{}}function Nt(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let s=t.trim();if(!s.startsWith("{"))return{action:s};try{return JSON.parse(s)}catch{return{action:s}}}async function St(t,s){return JSON.stringify(await Tn(t,Nt(s)))}async function Tn(t,s){let n=Nt(s);switch(n.action){case"getPdfUrl":{let i=n.attachmentUUID;if(!i)return{error:"No attachment specified for this viewer."};try{return{url:await rt(t,i),name:await It(t,q(t,n),i)}}catch(a){return{error:`Could not load the PDF: ${a.message}`}}}case"loadHighlights":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=q(t,n),a=await me(t,i,n.attachmentUUID),c=[];if(n.pluginUUID){let r=await t.getNoteContent({uuid:i});c=De(r,n.pluginUUID,n.attachmentUUID)}return{highlights:a,sentIds:c}}catch(i){return{error:`Could not load highlights: ${i.message}`}}}case"addHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=ge(n.highlight||{});return await ve(t,q(t,n),n.attachmentUUID,a=>a.concat([i]))}catch(i){return{error:`Could not save the highlight: ${i.message}`}}}case"recolorHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=q(t,n),a=await ve(t,i,n.attachmentUUID,c=>Se(c,n.id,r=>gt(r,n.color)));return n.exportBlock&&await kt(t,i,n,c=>He(c,n.pluginUUID,n.attachmentUUID,n.id,n.exportBlock)),a}catch(i){return{error:`Could not change the highlight color: ${i.message}`}}}case"setHighlightNote":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ve(t,q(t,n),n.attachmentUUID,i=>Se(i,n.id,a=>ft(a,n.note)))}catch(i){return{error:`Could not save the note: ${i.message}`}}}case"removeHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=q(t,n),a=await ve(t,i,n.attachmentUUID,c=>mt(c,n.id));return await kt(t,i,n,c=>Pe(c,n.pluginUUID,n.attachmentUUID,n.id)),a}catch(i){return{error:`Could not remove the highlight: ${i.message}`}}}case"removeFromNote":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate the block."};if(!n.id)return{error:"No highlight specified."};try{let i=q(t,n),a=await t.getNoteContent({uuid:i}),c=Pe(a,n.pluginUUID,n.attachmentUUID,n.id);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},c),{ok:!0})}catch(i){return{error:`Could not remove it from the note: ${i.message}`}}}case"sendToNote":{if(!n.content)return{error:"Nothing to send."};try{let i={uuid:q(t,n)},a=await t.getNoteContent(i);if(n.highlightId){let h=He(a,n.pluginUUID,n.attachmentUUID,n.highlightId,n.content);if(h!==null)return await t.replaceNoteContent(i,h),{ok:!0,replaced:!0}}let c=yt(a,n.content),r=Ct(a,c);return r===null?await t.insertNoteContent(i,`
`+c+`
`,{atEnd:!0}):await t.replaceNoteContent(i,r),{ok:!0}}catch(i){return{error:`Could not add this to the note: ${i.message}`}}}case"removeViewer":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=q(t,n),a=await t.getNoteContent({uuid:i}),c=ue(a,n.pluginUUID,n.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:i},c),await xt(t,i,n.attachmentUUID),{ok:!0})}catch(i){return{error:`Could not remove this viewer: ${i.message}`}}}case"getViewerSummary":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};let i=q(t,n),a=await It(t,i,n.attachmentUUID);try{let c=await me(t,i,n.attachmentUUID);return{name:a,count:c.length}}catch{return{name:a,count:0}}}case"setCollapsed":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=q(t,n),a=await t.getNoteContent({uuid:i}),c=lt(a,n.pluginUUID,n.attachmentUUID,n.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},c),{ok:!0})}catch(i){return{error:`Could not resize this viewer: ${i.message}`}}}case"clearDeepLink":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=q(t,n),a=await t.getNoteContent({uuid:i}),c=ae(a,n.pluginUUID,n.attachmentUUID,{page:null,highlightId:null});return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},c),{ok:!0})}catch(i){return{error:`Could not clear this viewer's deep link: ${i.message}`}}}case"exportAll":{if(!n.noteName)return{error:"Missing destination note name."};try{let i=await t.findNote({name:n.noteName}),a=i?i.uuid:await t.createNote(n.noteName);return await t.replaceNoteContent({uuid:a},n.content||""),{ok:!0,noteUUID:a}}catch(i){return{error:`Could not export highlights: ${i.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(n.action)}`}}}function Re(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function s(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function n(u,f){var b=Math.pow(10,f===void 0?2:f),x=function(C){return Math.round(C*b)/b};return{x:x(u.x),y:x(u.y),width:x(u.width),height:x(u.height)}}function i(u){return u.width>.01&&u.height>.01}function a(u,f,b){for(var x=String(u??""),C=Math.max(0,f===void 0?0:f),E=Math.min(x.length,b===void 0?x.length:b),U=function(O){return O===""||/\s/.test(O)},T=[],A=C;A<E;){for(;A<E&&U(x.charAt(A));)A++;if(A>=E)break;for(var $=A;A<E&&!U(x.charAt(A));)A++;T.push({start:$,end:A})}return T}function c(u){for(var f=1/0,b=1/0,x=-1/0,C=-1/0,E=0;E<(u?u.length:0);E++){var U=u[E];i(U)&&(f=Math.min(f,U.left),b=Math.min(b,U.top),x=Math.max(x,U.left+U.width),C=Math.max(C,U.top+U.height))}return isFinite(f)?{left:f,top:b,width:x-f,height:C-b}:null}function r(u,f,b){for(var x=[],C=0;C<u.length;C++){var E=t(u[C],f);if(i(E)){var U=b(E.x,E.y),T=b(E.x+E.width,E.y+E.height),A=n(s(U,T));i(A)&&x.push(A)}}return x}function h(u,f){var b=f(u.x,u.y),x=f(u.x+u.width,u.y+u.height);return s(b,x)}function S(u,f,b){var x=f.right-f.left,C=f.bottom-f.top;if(x<=0||C<=0)return null;var E=u.x2-u.x1,U=u.y2-u.y1,T=u.x1+(b.left-f.left)/x*E,A=u.x2-(f.right-b.right)/x*E,$=u.y1+(b.bottom-f.bottom)/C*U,O=u.y2-(f.top-b.top)/C*U;return{x:T,y:$,width:A-T,height:O-$}}function k(u,f){var b=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return b>.5*Math.min(u.height,f.height)}function y(u,f){var b=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var x=u.slice().sort(function(W,_){return _.y-W.y||W.x-_.x}),C=[],E=0;E<x.length;E++){for(var U=!1,T=0;T<C.length;T++)if(k(C[T][0],x[E])){C[T].push(x[E]),U=!0;break}U||C.push([x[E]])}for(var A=[],$=0;$<C.length;$++){for(var O=C[$].slice().sort(function(W,_){return W.x-_.x}),R=null,z=0;z<O.length;z++){var F=O[z];if(R===null){R={x:F.x,y:F.y,width:F.width,height:F.height};continue}var be=F.x-(R.x+R.width);if(be<=b*Math.max(R.height,F.height)){var ie=Math.max(R.x+R.width,F.x+F.width),ee=Math.max(R.y+R.height,F.y+F.height);R.x=Math.min(R.x,F.x),R.y=Math.min(R.y,F.y),R.width=ie-R.x,R.height=ee-R.y}else A.push(R),R={x:F.x,y:F.y,width:F.width,height:F.height}}R!==null&&A.push(R)}return A.map(function(W){return n(W)})}function I(u,f,b,x){var C=x===void 0?0:x;return f>=u.x-C&&f<=u.x+u.width+C&&b>=u.y-C&&b<=u.y+u.height+C}function w(u,f,b,x,C){for(var E=u||[],U=E.length-1;U>=0;U--){var T=E[U];if(!(!T||T.page!==f||!T.rects)){for(var A=0;A<T.rects.length;A++)if(I(T.rects[A],b,x,C===void 0?1:C))return T}}return null}function v(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:s,roundRect:n,isVisibleRect:i,textTokenRanges:a,unionClientRects:c,clientRectsToPdfRects:r,pdfRectToViewportRect:h,itemRelativeRect:S,mergeLineRects:y,rectContainsPoint:I,hitTestHighlights:w,normalizeQuoteText:v}}var j=Re(),po=j.clientRectToLocal,uo=j.rectFromCorners,fo=j.roundRect,go=j.isVisibleRect,mo=j.textTokenRanges,vo=j.unionClientRects,wo=j.clientRectsToPdfRects,bo=j.pdfRectToViewportRect,xo=j.itemRelativeRect,yo=j.mergeLineRects,Co=j.rectContainsPoint,Eo=j.hitTestHighlights,Io=j.normalizeQuoteText;function Le(){var t=[.957,.871,.424];function s(c,r,h,S,k){var y=r.context.register(r.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),I=[c.pushGraphicsState(),c.setGraphicsState("GS0")];I.push(c.setFillingColor(c.rgb(S[0],S[1],S[2])));for(var w=0;w<h.length;w++){var v=h[w];I.push(c.moveTo(v.x,v.y)),I.push(c.lineTo(v.x,v.y+v.height)),I.push(c.lineTo(v.x+v.width,v.y+v.height)),I.push(c.lineTo(v.x+v.width,v.y)),I.push(c.closePath())}I.push(c.fill()),I.push(c.popGraphicsState());var u=r.context.formXObject(I,{BBox:k,Resources:{ExtGState:{GS0:y}}});return r.context.register(u)}function n(c,r,h,S){for(var k=h.rects,y=[],I=k[0].x,w=k[0].y,v=k[0].x+k[0].width,u=k[0].y+k[0].height,f=0;f<k.length;f++){var b=k[f],x=b.x,C=b.x+b.width,E=b.y,U=b.y+b.height;y.push(x,U,C,U,x,E,C,E),I=Math.min(I,x),w=Math.min(w,E),v=Math.max(v,C),u=Math.max(u,U)}var T=r.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:r.context.obj([I,w,v,u]),QuadPoints:r.context.obj(y),C:r.context.obj(S),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&T.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var A=s(c,r,k,S,[I,w,v,u]);T.set(c.PDFName.of("AP"),r.context.obj({N:A}));var $=r.context.register(T),O=[$];if(h.note){var R=r.context.register(r.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:r.context.obj([v+8,w-60,v+208,w+12]),Parent:$,Open:!1}));T.set(c.PDFName.of("Popup"),R),O.push(R)}return O}function i(c,r,h){var S=r.node.get(c.PDFName.of("Annots"));if(S instanceof c.PDFArray)for(var k=0;k<h.length;k++)S.push(h[k]);else r.node.set(c.PDFName.of("Annots"),r.doc.context.obj(h))}async function a(c,r,h,S){for(var k=await c.PDFDocument.load(r),y=k.getPages(),I=h||[],w=0;w<I.length;w++){var v=I[w];if(!(!v||!v.rects||!v.rects.length)){var u=y[v.page-1];if(u){var f=S&&S[v.color]||t,b=n(c,k,v,f);i(c,u,b)}}}return k.save()}return{writeHighlightsIntoPdf:a,buildHighlightAnnotation:n,appendAnnotationRefs:i}}var Me=Le(),No=Me.writeHighlightsIntoPdf,So=Me.buildHighlightAnnotation,Uo=Me.appendAnnotationRefs;function Fe(){function t(y){return String(y??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function s(y,I,w,v,u){var f=new URLSearchParams;I&&f.set("att",I),Number.isFinite(w)&&w>=1&&f.set("page",String(Math.floor(w))),v&&f.set("hl",v),u&&f.set("note",u);var b=f.toString();return"plugin://"+y+(b?"?"+b:"")}function n(y,I){return String(y??"").split(/\r?\n/).map(function(w){return(I+" "+w).replace(/[ \t]+$/,"")})}function i(y,I,w){return I==null?y:"<mark"+(w?' style="background-color:'+w+';"':"")+">"+y+'<!-- {"backgroundCycleColor":"'+I+'"} --></mark>'}function a(y,I,w,v,u,f,b){var x=s(I,w,v.page,v.id,b),C=i(t(y||"PDF"),u,f),E="["+C+"]("+x+")",U=[E].concat(n(v.quoteText,"> >"));return v.note&&(U.push(">"),U=U.concat(n(v.note,">"))),U.join(`
`)}function c(y){return String(y??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function r(y){return"<p>"+c(y).replace(/\r?\n/g,"<br>")+"</p>"}function h(y,I,w,v,u,f,b){var x=s(I,w,v.page,v.id,b),C=c(y||"PDF"),E=f?'<mark style="background-color: '+c(f)+';">'+C+"</mark>":C,U='<p><a href="'+c(x)+'">'+E+"</a></p>",T="<blockquote><blockquote>"+r(v.quoteText)+"</blockquote></blockquote>",A=v.note?"<blockquote>"+r(v.note)+"</blockquote>":"";return U+T+A}function S(y){return y.slice().sort(function(I,w){if(I.page!==w.page)return I.page-w.page;var v=I.rects&&I.rects[0]?I.rects[0].y:0,u=w.rects&&w.rects[0]?w.rects[0].y:0;return u-v})}function k(y,I,w,v,u,f,b){var x=f&&f.length?f:null,C=(v||[]).filter(function(T){return T&&(!x||x.indexOf(T.color)!==-1)}),E=S(C),U=E.map(function(T){var A=u&&u[T.color]||{};return a(y,I,w,T,A.cycleIndex,A.hex,b)});return U.join(`

`)}return{buildDeepLink:s,buildHighlightBlock:a,buildHighlightHtml:h,buildExportAllContent:k}}var we=Fe(),Ao=we.buildDeepLink,Do=we.buildHighlightBlock,Po=we.buildHighlightHtml,Ho=we.buildExportAllContent;function Ut(){var t=window.__PDFA_CONFIG||{},s=window.__PDFA_GEOM||{},n=window.__PDFA_ANNOTATIONS||{},i=window.__PDFA_EXPORT||{},a={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(r.attachmentName=e,a.name&&(a.name.textContent=e),a.collapsedName&&(a.collapsedName.textContent=e))}var r={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],sentIds:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,o){a.status.textContent=e||"",a.status.style.display=e?"block":"none",a.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function S(e){var o=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(l,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");l(window.callAmplenotePlugin(JSON.stringify(o)))}catch(p){d(p)}}).then(function(l){if(l&&typeof l=="object")return l;if(typeof l!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(l)}catch{throw new Error("Unreadable reply from the plugin: "+String(l).slice(0,120))}})}function k(){return t.colors||[]}function y(e){for(var o=k(),l=0;l<o.length;l++)if(o[l].id===e)return o[l].hex;return o.length?o[0].hex:"#F4DE6C"}function I(e){for(var o=0;o<r.highlights.length;o++)if(r.highlights[o].id===e)return r.highlights[o];return null}function w(e,o,l){var d=document.createElement("button");return d.className="pdfa-btn"+(o?" "+o:""),d.textContent=e,d.onclick=function(p){p.stopPropagation(),l()},d}function v(e,o,l,d){var p=document.createElement("button");return p.className="pdfa-color",p.dataset.color=e.id,p.style.background=e.hex,p.title=d+" "+e.label,p.setAttribute("aria-label",d+" "+e.label),p.setAttribute("aria-pressed",String(!!o)),p.onclick=function(g){g.stopPropagation(),l(e.id)},p}function u(){for(var e=k(),o=0;o<e.length;o++)a.colors.appendChild(v(e[o],e[o].id===r.activeColorId,function(l){r.activeColorId=l,f(),r.pendingSelection&&Be(r.pendingSelection,l)},"Highlight"))}function f(){for(var e=a.colors.querySelectorAll(".pdfa-color"),o=0;o<e.length;o++)e[o].setAttribute("aria-pressed",String(e[o].dataset.color===r.activeColorId))}function b(){for(var e=[],o=1;o<=r.pageCount;o++)(function(l){e.push(r.doc.getPage(l).then(function(d){r.viewports[l]=d.getViewport({scale:r.scale})}))})(o);return Promise.all(e)}function x(e){var o=r.viewports[e],l=document.createElement("div");return l.className="pdfa-page",l.dataset.page=String(e),l.style.width=o.width+"px",l.style.height=o.height+"px",l}function C(e,o){if(r.rendered[o]||r.renderingPage[o])return Promise.resolve();r.renderingPage[o]=!0;var l=r.viewports[o],d=document.createElement("canvas"),p=window.devicePixelRatio||1;d.width=Math.floor(l.width*p),d.height=Math.floor(l.height*p),d.style.width=l.width+"px",d.style.height=l.height+"px",e.appendChild(d);var g=document.createElement("div");g.className="pdfa-highlights",e.appendChild(g);var m=document.createElement("div");m.className="textLayer",m.style.width=l.width+"px",m.style.height=l.height+"px",m.style.setProperty("--scale-factor",String(r.scale)),e.appendChild(m);var N=d.getContext("2d");N.scale(p,p);var D=null;return r.doc.getPage(o).then(function(H){return D=H,H.render({canvasContext:N,viewport:l}).promise}).then(function(){return D.getTextContent()}).then(function(H){var P=[];return window.pdfjsLib.renderTextLayer({textContent:H,container:m,viewport:l,textDivs:P}).promise.then(function(){r.textSpans+=P.length;for(var L=0;L<P.length;L++)P[L].__pdfaItem=H.items[L];r.rendered[o]=!0,r.renderingPage[o]=!1,$(o),U()})}).catch(function(H){r.renderingPage[o]=!1,h("Failed to render page "+o+": "+(H.message||H),!0)})}function E(){var e=Y();if(!e||!r.doc)return Promise.resolve();for(var o=e.getBoundingClientRect(),l=e.clientHeight,d=a.pages.querySelectorAll(".pdfa-page"),p=[],g=0;g<d.length;g++){var m=d[g],N=Number(m.dataset.page);if(!(r.rendered[N]||r.renderingPage[N])){var D=m.getBoundingClientRect(),H=D.top-o.top,P=D.bottom-o.top;P<-l||H>e.clientHeight+l||p.push(C(m,N))}}return Promise.all(p)}function U(){var e=0;for(var o in r.rendered)r.rendered[o]&&e++;if(e){var l=r.textSpans===0;h(l?"No selectable text found - this PDF may be a scan.":"",l)}}function T(){if(r.rendering)return Promise.resolve();r.rendering=!0,M(!0),h("Rendering...");var e=Y(),o=e?e.scrollHeight-e.clientHeight:0,l=o>0?e.scrollTop/o:0;return a.pages.innerHTML="",r.viewports={},r.rendered={},r.renderingPage={},r.textSpans=0,b().then(function(){for(var d=1;d<=r.pageCount;d++)a.pages.appendChild(x(d));if(e){var p=e.scrollHeight-e.clientHeight;e.scrollTop=l*(p>0?p:0)}r.rendering=!1,te(),ne(),E()}).catch(function(d){r.rendering=!1,h("Failed to render: "+(d.message||d),!0)})}function A(e){return function(o,l){return e.convertToViewportPoint(o,l)}}function $(e){for(var o=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",l=a.pages.querySelectorAll(o),d=0;d<l.length;d++){var p=l[d],g=Number(p.dataset.page),m=p.querySelector(".pdfa-highlights"),N=r.viewports[g];if(!(!m||!N)){m.innerHTML="";for(var D=A(N),H=0;H<r.highlights.length;H++){var P=r.highlights[H];if(!(!P||P.page!==g||!P.rects||!P.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=P.id||"";for(var J=0;J<P.rects.length;J++){var K=s.pdfRectToViewportRect(P.rects[J],D),B=document.createElement("div");B.className="pdfa-hl",B.style.left=K.x+"px",B.style.top=K.y+"px",B.style.width=K.width+"px",B.style.height=K.height+"px",B.style.background=y(P.color),L.appendChild(B)}m.appendChild(L)}}}}}function O(){$(),z(),a.count.textContent=String(r.highlights.length)}function R(){return r.highlights.slice().sort(function(e,o){return e.page!==o.page?e.page-o.page:(o.rects[0]?o.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function z(){a.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",e.appendChild(o),e.appendChild(w("Close","",function(){ie(!1)})),a.panel.appendChild(e);var l=R();if(!l.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",a.panel.appendChild(d);return}for(var p=0;p<l.length;p++)a.panel.appendChild(F(l[p]))}function F(e){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=e.id||"",o.title="Jump to this highlight";var l=document.createElement("span");l.className="pdfa-chip",l.style.background=y(e.color),o.appendChild(l);var d=document.createElement("div"),p=document.createElement("div");p.className="pdfa-hl-page",p.textContent="Page "+e.page,d.appendChild(p);var g=document.createElement("div");if(g.className="pdfa-hl-quote",g.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(g),e.note){var m=document.createElement("div");m.className="pdfa-hl-note",m.textContent=e.note,d.appendChild(m)}if(o.appendChild(d),r.sentIds.indexOf(e.id)!==-1){var N=document.createElement("button");N.className="pdfa-hl-unsend",N.type="button",N.title="Remove this from the note (keeps the highlight)",N.setAttribute("aria-label","Remove this highlight from the note"),N.textContent="\u{1F5D1}",N.onclick=function(D){D.stopPropagation(),be(e)},o.appendChild(N)}return o.onclick=function(){ze(e)},o}function be(e){S({action:"removeFromNote",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e.id}).then(function(o){if(o&&o.error)throw new Error(o.error);var l=r.sentIds.indexOf(e.id);l!==-1&&r.sentIds.splice(l,1),z(),h("Removed from the note. The highlight is still here.")}).catch(function(o){h(o.message||String(o),!0)})}function ie(e){var o=e===void 0?!a.panel.classList.contains("pdfa-open"):e;a.panel.classList.toggle("pdfa-open",o),a.listToggle.setAttribute("aria-pressed",String(o)),o&&z(),ne()}function ee(e){for(var o=e&&e.nodeType===1?e:e&&e.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function W(e,o){for(var l=[],d=[],p=null,g=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),m;m=g.nextNode();)if(e.intersectsNode(m)){var N=m.nodeValue||"",D=m===e.startContainer?e.startOffset:0,H=m===e.endContainer?e.endOffset:N.length,P=m.parentElement,L=P&&P.__pdfaItem;if(L)for(var J={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},K=P.getBoundingClientRect(),B=s.textTokenRanges(N,D,H),Z=0;Z<B.length;Z++){var ke=document.createRange();ke.setStart(m,B[Z].start),ke.setEnd(m,B[Z].end);var G=s.unionClientRects(ke.getClientRects());if(G){var Ke={left:G.left,top:G.top,width:G.width,height:G.height,right:G.left+G.width,bottom:G.top+G.height},Ze=s.itemRelativeRect(J,K,Ke);Ze&&(l.push(Ze),d.push(N.slice(B[Z].start,B[Z].end)),p=Ke)}}}return{rects:l,text:d.join(" "),lastCssRect:p}}function _(e){if(r.pendingSelection=e,r.lastCapturedText=e&&e.rawText||"",!e){a.hint.textContent="",a.hint.style.display="none";return}a.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",a.hint.style.display="inline"}function Oe(e){if(!r.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){_(null),M();return}var l=o.getRangeAt(0),d=ee(l.startContainer);if(!d)return _(null);var p=d.parentElement;if(!p||!p.dataset||!p.dataset.page)return _(null);var g=Number(p.dataset.page);if(!r.rendered[g])return _(null);var m=ee(l.endContainer)!==d,N=W(l,d),D=s.mergeLineRects(N.rects);if(!D.length)return _(null);var H=N.lastCssRect||p.getBoundingClientRect(),P=e&&e.clientX?e.clientX:H.left+H.width/2,L=e&&e.clientY?e.clientY:H.top+H.height,J={page:g,rects:D,quoteText:s.normalizeQuoteText(N.text),spilled:m,anchorX:P,anchorY:L,rawText:String(o)};_(J),Lt(J)}}var Dt=300,X=null;function Pt(){r.noteEditing||(X&&clearTimeout(X),X=setTimeout($e,Dt))}function $e(){if(X=null,!r.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||ee(e.getRangeAt(0).startContainer)&&String(e)!==r.lastCapturedText&&Oe(null)}}function se(e,o){var l=r.highlights;return r.highlights=e,O(),S(o).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return r.highlights=d.highlights||e,O(),h(""),!0}).catch(function(d){return r.highlights=l,O(),h(d.message||String(d),!0),!1})}function Be(e,o){var l={id:null,page:e.page,color:o,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,p=e.anchorY;_(null),M(!0);var g=window.getSelection();g&&g.removeAllRanges&&g.removeAllRanges(),se(r.highlights.concat([l]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:l}).then(function(m){if(m){var N=r.highlights[r.highlights.length-1];N&&N.id&&ye(N,d,p,!0)}})}function Ht(e,o){M(!0);for(var l=r.highlights.map(function(g){return g.id===e?Object.assign({},g,{color:o}):g}),d=null,p=0;p<l.length;p++)l[p].id===e&&(d=l[p]);se(l,{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e,color:o,exportBlock:d?Ie(d):null})}function Rt(e){M(!0),se(r.highlights.filter(function(o){return o.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e})}function xe(e,o){var l=String(o??"").trim();r.noteEditing=null,M(!0),se(r.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:l||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:l})}function Q(e,o,l,d){a.popover.innerHTML="",a.popover.classList.toggle("pdfa-editing",d==="editing"),a.popover.classList.toggle("pdfa-exporting",d==="exporting"),a.popover.classList.toggle("pdfa-menu",d==="menu");for(var p=0;p<e.length;p++)a.popover.appendChild(e[p]);a.popover.classList.add("pdfa-open");var g=a.popover.offsetWidth,m=a.popover.offsetHeight,N=Math.max(4,Math.min(o-g/2,window.innerWidth-g-4)),D=l+12;D+m>window.innerHeight-4&&(D=Math.max(4,l-m-12)),D=Math.max(4,Math.min(D,window.innerHeight-m-4)),a.popover.style.left=N+"px",a.popover.style.top=D+"px"}function M(e){r.noteEditing&&!e||(r.noteEditing=null,a.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),a.popover.innerHTML="")}function Lt(e){for(var o=k(),l=[],d=0;d<o.length;d++)l.push(v(o[d],o[d].id===r.activeColorId,function(p){r.activeColorId=p,f(),Be(e,p)},"Highlight"));Q(l,e.anchorX,e.anchorY)}function ye(e,o,l,d){for(var p=k(),g=[],m=0;m<p.length;m++)g.push(v(p[m],p[m].id===e.color,function(D){Ht(e.id,D)},"Change to"));var N=!!e.note;g.push(w(N?"Edit note":"Add note",d&&!N?"pdfa-btn-primary":"",function(){Ft(e,o,l)})),g.push(w("Copy","",function(){Yt(e)})),g.push(w("Send to note","",function(){Qt(e)})),g.push(w("Remove","pdfa-remove",function(){Rt(e.id)})),Q(g,o,l)}function Mt(e,o){for(var l=k(),d={},p=0;p<l.length;p++)d[l[p].id]=!0;var g=document.createElement("div");g.className="pdfa-export-hint",g.textContent="Export highlights to a note";var m=document.createElement("div");m.className="pdfa-export-colors";for(var N=0;N<l.length;N++)(function(H){var P=v(H,!0,function(L){d[L]=!d[L],P.setAttribute("aria-pressed",String(d[L]))},"Toggle");m.appendChild(P)})(l[N]);var D=document.createElement("div");D.className="pdfa-note-actions",D.appendChild(w("Create / update note","pdfa-btn-primary",function(){for(var H=[],P=0;P<l.length;P++)d[l[P].id]&&H.push(l[P].id);Kt(H.length===l.length?null:H)})),Q([g,m,D],e,o,"exporting")}function Ft(e,o,l){r.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var p=document.createElement("div");p.className="pdfa-note-actions",e.note&&p.appendChild(w("Delete note","",function(){xe(e.id,"")}));var g=document.createElement("span");g.className="pdfa-spacer",p.appendChild(g),p.appendChild(w("Cancel","",function(){je(e,o,l)})),p.appendChild(w("Save","pdfa-btn-primary",function(){xe(e.id,d.value)})),d.onkeydown=function(m){m.key==="Enter"&&(m.ctrlKey||m.metaKey)?(m.preventDefault(),m.stopPropagation(),xe(e.id,d.value)):m.key==="Escape"&&(m.preventDefault(),m.stopPropagation(),je(e,o,l))},Q([d,p],o,l,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function je(e,o,l){r.noteEditing=null;var d=I(e.id)||e;ye(d,o,l)}function Ot(e){if(!r.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var l=e.target,d=null;l&&l!==a.pages;){if(l.classList&&l.classList.contains("pdfa-page")){d=l;break}l=l.parentElement}if(!d)return M();var p=Number(d.dataset.page),g=r.viewports[p];if(!g)return M();var m=d.getBoundingClientRect(),N=g.convertToPdfPoint(e.clientX-m.left,e.clientY-m.top),D=s.hitTestHighlights(r.highlights,p,N[0],N[1],1);D&&D.id?ye(D,e.clientX,e.clientY):M()}}}function te(){a.pageLabel.textContent=r.current+" / "+r.pageCount,a.zoomLabel.textContent=Math.round(r.scale*100)+"%"}function Y(){return a.root.querySelector(".pdfa-scroll")}function _e(){return a.panel&&a.panel.classList.contains("pdfa-open")?a.panel:Y()}function qe(e){var o=a.pages.querySelector('.pdfa-page[data-page="'+e+'"]');o&&C(o,e)}function Ce(e){var o=Math.min(Math.max(1,e),r.pageCount),l=a.pages.querySelector('.pdfa-page[data-page="'+o+'"]');qe(o);var d=Y();l&&d&&(d.scrollTop+=l.getBoundingClientRect().top-d.getBoundingClientRect().top),E(),r.current=o,te()}function ze(e){var o=a.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),l=r.viewports[e.page];if(!(!o||!l||!e.rects||!e.rects.length)){var d=s.pdfRectToViewportRect(e.rects[0],A(l)),p=Y(),g=o.getBoundingClientRect().top+d.y;p.scrollTop+=g-p.getBoundingClientRect().top-p.clientHeight/3,qe(e.page),E(),r.current=e.page,te()}}function $t(){try{a.root.setAttribute("tabindex","-1"),a.root.focus(),a.root.scrollIntoView&&a.root.scrollIntoView({block:"nearest"})}catch{}}function Bt(e){if(!(!e||!e.id)){var o=a.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');o&&(o.classList.add("pdfa-hl-flash"),setTimeout(function(){o.classList.remove("pdfa-hl-flash")},2600))}}function Ge(e){return r.scale=Math.min(Math.max(.4,e),4),T()}function jt(){return r.doc?r.doc.getPage(1).then(function(e){var o=Y();if(o){var l=window.getComputedStyle(o),d=o.clientWidth-(parseFloat(l.paddingLeft)||0)-(parseFloat(l.paddingRight)||0),p=e.getViewport({scale:1}).width;if(!(!(d>0)||!(p>0))){var g=Math.max(.4,d/p);g<r.scale&&(r.scale=g,te())}}}).catch(function(){}):Promise.resolve()}function Ve(e){var o=_e();o&&(o.scrollTop+=e*Math.max(80,o.clientHeight*.85),ne(),E())}function We(e,o){var l=null,d=null,p=!1,g=function(){l&&clearTimeout(l),d&&clearInterval(d),l=d=null};e.addEventListener("pointerdown",function(){g(),p=!1,l=setTimeout(function(){p=!0,d=setInterval(function(){if(e.disabled)return g();Ve(o*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(m){e.addEventListener(m,g)}),e.onclick=function(){if(p){p=!1;return}Ve(o)}}function ne(){var e=_e();if(!(!e||!a.scrollUp)){var o=e.scrollHeight-e.clientHeight;a.scrollUp.disabled=e.scrollTop<=1,a.scrollDown.disabled=e.scrollTop>=o-1}}function _t(){ne(),E(),M();for(var e=a.pages.querySelectorAll(".pdfa-page"),o=r.current,l=1/0,d=0;d<e.length;d++){var p=Math.abs(e[d].getBoundingClientRect().top-60);p<l&&(l=p,o=Number(e[d].dataset.page))}o!==r.current&&(r.current=o,te())}function qt(){return new Promise(function(e,o){if(window.pdfjsLib)return e(window.pdfjsLib);var l=document.createElement("script");l.src=t.pdfJsSrc,l.onload=function(){window.pdfjsLib?e(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},l.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(l)})}function zt(){return new Promise(function(e,o){if(window.PDFLib)return e(window.PDFLib);var l=document.createElement("script");l.src=t.pdfLibSrc,l.onload=function(){window.PDFLib?e(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},l.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(l)})}function Gt(){for(var e={},o=k(),l=0;l<o.length;l++)o[l].rgb&&(e[o[l].id]=o[l].rgb);return e}function Vt(){var e=(r.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Ee(){for(var e={},o=k(),l=0;l<o.length;l++)e[o[l].id]={cycleIndex:o[l].cycleIndex,hex:o[l].hex};return e}function Je(){var e=(r.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Ie(e){var o=Ee()[e.color]||{};return i.buildHighlightBlock(r.attachmentName,t.pluginUUID,t.attachmentUUID,e,o.cycleIndex,o.hex,t.noteUUID)}function Wt(e){if(!i.buildHighlightHtml)return null;var o=Ee()[e.color]||{};return i.buildHighlightHtml(r.attachmentName,t.pluginUUID,t.attachmentUUID,e,o.cycleIndex,o.hex,t.noteUUID)}function Jt(e,o){var l=function(g){var m=g.clipboardData||window.clipboardData;m&&(m.setData("text/plain",e),o&&m.setData("text/html",o),g.preventDefault())},d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select(),document.addEventListener("copy",l,!0);var p=!1;try{p=document.execCommand("copy")}catch{p=!1}return document.removeEventListener("copy",l,!0),document.body.removeChild(d),p}function Xt(e,o){var l=function(){return!navigator.clipboard||!navigator.clipboard.writeText?d():navigator.clipboard.writeText(e).then(function(){return"plain"},d)},d=function(){return Jt(e,o)?Promise.resolve(o?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(o&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var p=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([o],{type:"text/html"})});return navigator.clipboard.write([p]).then(function(){return"rich"},l)}catch{return l()}return l()}function Yt(e){M(!0);var o,l;try{o=Ie(e),l=Wt(e)}catch(d){h("Could not build the copy: "+(d.message||d),!0);return}Xt(o,l).then(function(d){h(d==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(d){h("Could not copy: "+(d.message||d),!0)})}function Qt(e){M(!0),S({action:"sendToNote",content:Ie(e),highlightId:e.id,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");r.sentIds.indexOf(e.id)===-1&&r.sentIds.push(e.id),z(),h(o.replaced?"Updated this highlight where it already sits in the note.":"Added to this note, below the text.")}).catch(function(o){h(o.message||String(o),!0)})}function Kt(e){M(!0);var o=i.buildExportAllContent(r.attachmentName,t.pluginUUID,t.attachmentUUID,r.highlights,Ee(),e,t.noteUUID);if(!o){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}S({action:"exportAll",noteName:Je(),content:o}).then(function(l){if(!l||l.error)throw new Error(l&&l.error||"Could not export highlights.");h('Exported to "'+Je()+'".')}).catch(function(l){h(l.message||String(l),!0)})}function Zt(e,o){var l=[];l.push(w("Collapse","",function(){M(!0),an()}),w("Download","",function(){M(!0),nn()}),w("Export...","",function(){Mt(e,o)}),w("Remove viewer...","pdfa-remove",function(){en(e,o)})),Q(l,e,o,"menu")}function en(e,o){var l=document.createElement("div");l.className="pdfa-export-hint",l.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(w("Cancel","",function(){M(!0)}));var p=document.createElement("span");p.className="pdfa-spacer",d.appendChild(p),d.appendChild(w("Remove","pdfa-remove",tn)),Q([l,d],e,o,"exporting")}function tn(){M(!0),h("Removing this viewer..."),S({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function nn(){r.pdfBytes&&(h("Preparing the download..."),zt().then(function(e){return n.writeHighlightsIntoPdf(e,r.pdfBytes,r.highlights,Gt())}).then(function(e){return on(e,Vt())}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function on(e,o){var l=new Blob([e],{type:"application/pdf"}),d=null;try{d=new File([l],o,{type:"application/pdf"})}catch{}return d&&navigator.share&&navigator.canShare&&navigator.canShare({files:[d]})?navigator.share({files:[d],title:o}).then(function(){h("")}).catch(function(p){return p&&p.name==="AbortError"?h(""):Xe(l,o)}):Xe(l,o)}function Xe(e,o){var l=URL.createObjectURL(e),d=document.createElement("a");d.href=l,d.download=o,document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(l)},4e3);var p=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return h(p?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function rn(){return S({action:"loadHighlights",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");r.highlights=e.highlights||[],r.sentIds=e.sentIds||[]}).catch(function(e){r.highlights=[],r.sentIds=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function an(){var e=r.highlights.length;a.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",a.root.classList.add("pdfa-collapsed-mode"),Ye(!0)}function Ye(e){S({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function sn(){S({action:"clearDeepLink",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function ln(){a.root.classList.remove("pdfa-collapsed-mode"),r.doc||Qe(),Ye(!1)}function Qe(){h("Loading PDF..."),(t.highlightId||t.page)&&($t(),sn()),qt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,S({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return r.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return r.doc=e,r.pageCount=e.numPages,rn()}).then(function(){return jt()}).then(function(){return T()}).then(function(){O();var e=t.highlightId?I(t.highlightId):null;e?(ze(e),Bt(e)):t.page&&Ce(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){Ce(r.current-1)},document.getElementById("pdfa-next").onclick=function(){Ce(r.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){Ge(r.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){Ge(r.scale-.25)},We(a.scrollUp,-1),We(a.scrollDown,1),a.listToggle.onclick=function(){ie()},a.more.onclick=function(e){Zt(e.clientX,e.clientY)},Y().addEventListener("scroll",_t),a.panel.addEventListener("scroll",ne),a.pages.addEventListener("mouseup",Oe),a.pages.addEventListener("click",Ot),document.addEventListener("selectionchange",Pt),a.pages.addEventListener("touchend",function(){X&&clearTimeout(X),X=null,$e()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!r.noteEditing&&M()}),document.addEventListener("mousedown",function(e){a.popover.classList.contains("pdfa-open")&&(a.popover.contains(e.target)||M())}),u(),z(),a.root.querySelector(".pdfa-collapsed").onclick=ln,t.collapsed?S({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var o=e.count||0;a.collapsedCount.textContent=o?o+(o===1?" highlight":" highlights"):""}}).catch(function(){}):Qe()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function An(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Dn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var Pn=`
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
  /* "Remove from note", revealed on hover over its row. The row is the body text, so the
     button takes no width from it at rest - opacity rather than display, or the quote
     would reflow every time the pointer crossed a row.

     :focus-within on the row keeps it reachable by keyboard, where there is no hover to
     reveal it with. Always visible on touch, for the same reason - see the coarse block. */
  .pdfa-hl-unsend { flex: 0 0 auto; margin-left: auto; align-self: center;
    font: inherit; font-size: 13px; line-height: 1; padding: 4px 5px; cursor: pointer;
    background: transparent; border: 1px solid transparent; border-radius: 6px;
    color: inherit; opacity: 0; transition: opacity .12s ease; }
  .pdfa-hl-row:hover .pdfa-hl-unsend,
  .pdfa-hl-row:focus-within .pdfa-hl-unsend { opacity: .75; }
  .pdfa-hl-unsend:hover { opacity: 1; background: var(--pdfa-btn-hover); }

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
    /* No hover to reveal it with, so it is simply there - and big enough to hit. */
    .pdfa-hl-unsend { opacity: .75; min-width: 38px; min-height: 38px; }
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
`,Tt={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function At({attachmentUUID:t,attachmentName:s="",page:n=null,highlightId:i=null,lightDarkMode:a="light",pluginUUID:c=null,noteUUID:r=null,collapsed:h=!1}={}){let S=Tt[a]||Tt.light,k={attachmentUUID:t,page:n,highlightId:i,pluginUUID:c,noteUUID:r,pdfJsSrc:oe.pdfJs,workerSrc:oe.pdfJsWorker,pdfLibSrc:oe.pdfLib,colors:le.map(y=>({id:y.id,label:y.label,hex:y.hex,rgb:y.rgb,cycleIndex:y.cycleIndex})),defaultColorId:ce,collapsed:h,attachmentName:s};return`<link rel="stylesheet" href="${oe.pdfViewerCss}">
<style>:root{${S}}${Pn}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${An(s)}</span>
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
<script>window.__PDFA_CONFIG = ${Dn(k)};
window.__PDFA_GEOM = (${Re.toString()})();
window.__PDFA_ANNOTATIONS = (${Le.toString()})();
window.__PDFA_EXPORT = (${Fe.toString()})();<\/script>
<script>(${Ut.toString()})();<\/script>`}var Hn={noteOption:{"Annotate PDF":async function(t,s){return ct(t,s,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,s){return dt(t,s)}},insertText:async function(t){return ht(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...s){return pt(t,s[0])},renderEmbed:function(t,...s){let{attachmentUUID:n,page:i,highlightId:a,collapsed:c,attachmentName:r}=re(s[0]);return n?At({attachmentUUID:n,page:i,highlightId:a,collapsed:c,attachmentName:r,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...s){return St(t,s[0])}},Rn=Hn;return fn(Ln);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
