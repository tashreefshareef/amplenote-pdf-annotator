(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Te=Object.defineProperty;var un=Object.getOwnPropertyDescriptor;var fn=Object.getOwnPropertyNames;var gn=Object.prototype.hasOwnProperty;var mn=(t,l)=>{for(var n in l)Te(t,n,{get:l[n],enumerable:!0})},wn=(t,l,n,i)=>{if(l&&typeof l=="object"||typeof l=="function")for(let r of fn(l))!gn.call(t,r)&&r!==n&&Te(t,r,{get:()=>l[r],enumerable:!(i=un(l,r))||i.enumerable});return t};var vn=t=>wn(Te({},"__esModule",{value:!0}),t);var On={};mn(On,{default:()=>Fn});var le=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ce="yellow",q="PDF Annotator data",ot="attachment://",rt=1,at=16,oe={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},bn="https://plugins.amplenote.com/cors-proxy";function it(t){let l=new URL(bn);return l.searchParams.set("apiurl",t),l.toString()}var xn="application/pdf";function yn(t){return Array.isArray(t)?t.filter(l=>l&&l.type===xn&&l.uuid):[]}async function de(t,l){let n=await t.getNoteAttachments({uuid:l}),i=yn(n);if(i.length===0)return null;if(i.length===1)return i[0];let r=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:i.map(a=>({label:a.name,value:a.uuid})),value:i[0].uuid}]});if(r==null)return null;let c=Array.isArray(r)?r[0]:r;return i.find(a=>a.uuid===c)||null}async function st(t,l){if(!l)throw new Error("fetchableAttachmentURL: attachmentUUID required");let n=await t.getAttachmentURL(l);if(!n)throw new Error(`No URL returned for attachment ${l}`);return it(n)}function lt(t){return t?at:rt}function re(t){let l={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return l;let n;try{n=new URLSearchParams(t.replace(/^\?/,""))}catch{return l}let i=c=>{let a=n.get(c);if(a===null||a.trim()==="")return null;let h=Number(a);return Number.isFinite(h)?h:null},r=i("page");return{attachmentUUID:n.get("att")||null,page:r!==null&&r>=1?Math.floor(r):null,x:i("x"),y:i("y"),highlightId:n.get("hl")||null,noteUUID:n.get("note")||null,collapsed:n.get("c")==="1",attachmentName:n.get("n")||""}}function ct({attachmentUUID:t,page:l,x:n,y:i,highlightId:r,collapsed:c,attachmentName:a}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),a&&h.set("n",a),Number.isFinite(l)&&l>=1&&h.set("page",String(Math.floor(l))),Number.isFinite(n)&&h.set("x",String(n)),Number.isFinite(i)&&h.set("y",String(i)),r&&h.set("hl",r),h.toString()}function he(t,l={},n=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");n===null&&(n=lt(l.collapsed));let i=ct(l);return`<object data="${i?`plugin://${t}?${i}`:`plugin://${t}`}" data-aspect-ratio="${n}" />`}function dt(t,l,n){if(!t||!l||!n)return null;let i=t.split(`
`),r=i.findIndex(a=>a.includes(`${ot}${l}`));if(r===-1)return null;let c=i.slice();return i[r+1]===""?c.splice(r+2,0,n.trim(),""):c.splice(r+1,0,"",n.trim(),""),c.join(`
`)}function pe(t,l,n=null){return!t||!l||!t.includes(`plugin://${l}`)?!1:n?t.includes(`att=${n}`):!0}function ue(t,l,n){if(!t||!l||!n)return null;let i=t.split(`
`),r=`plugin://${l}`,c=i.findIndex(h=>h.includes(r)&&h.includes(`att=${n}`));if(c===-1)return null;let a=i.slice();return a.splice(c,1),a[c]===""&&a[c-1]===""&&a.splice(c,1),a.join(`
`)}function ae(t,l,n,i={}){if(!t||!l||!n)return null;let r=t.split(`
`),c=`plugin://${l}`,a=r.findIndex(U=>U.includes(c)&&U.includes(`att=${n}`));if(a===-1)return null;let h=r[a],S=h.match(/data="(plugin:\/\/[^"]*)"/);if(!S)return null;let I=S[1],y=I.indexOf("?"),k=y===-1?"":I.slice(y+1),w={...re(k),attachmentUUID:n,...i},u=ct(w),f=u?`plugin://${l}?${u}`:`plugin://${l}`,b=r.slice(),x=h.replace(S[0],`data="${f}"`),E=lt(w.collapsed),C=x.match(/data-aspect-ratio="[^"]*"/);return x=C?x.replace(C[0],`data-aspect-ratio="${E}"`):x.replace(/\s*\/>\s*$/,` data-aspect-ratio="${E}" />`),b[a]=x,b.join(`
`)}function ht(t,l,n,i){return ae(t,l,n,{collapsed:!!i})}async function pt(t,l,n){let i=await de(t,l);if(!i){let h=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(h)&&h.length>0)||!h.some(I=>I&&I.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let r=await t.getNoteContent({uuid:l});if(pe(r,n,i.uuid))return await t.alert(`"${i.name}" is already open in this note - scroll to the viewer.`),i.uuid;let c=he(n,{attachmentUUID:i.uuid,attachmentName:i.name}),a=dt(r,i.uuid,c);return a!==null?(await t.replaceNoteContent({uuid:l},a),i.uuid):(await t.insertNoteContent({uuid:l},`
${c}
`,{atEnd:!0}),i.uuid)}var En="Raw markdown";function Cn(t){let l=(String(t||"").match(/`+/g)||[]).reduce((n,i)=>Math.max(n,i.length),0);return"`".repeat(Math.max(3,l+1))}async function ut(t,l){let n=await t.getNoteContent({uuid:l});if(typeof n!="string"||n==="")return await t.alert("That note came back empty - nothing to dump."),null;let i=await t.getNoteAttachments({uuid:l}),r=(Array.isArray(i)?i:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=Cn(n),a=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:a},`# Attachments

${r||"- (none)"}

# ${En}

${c}
${n}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),a}async function ft(t,l,n){if(!l)return"";let i=await de(t,l);if(!i){let c=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let r=await t.getNoteContent({uuid:l});return pe(r,n,i.uuid)?(await t.alert(`"${i.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${he(n,{attachmentUUID:i.uuid,attachmentName:i.name})}
`}async function kn(t,l,n,i){let r={uuid:l},c=ue(n,t.context.pluginUUID,i);if(c!==null)try{await t.replaceNoteContent(r,c)}catch{}try{await t.replaceNoteContent(r,n)}catch{await t.replaceNoteContent(r,n)}}async function gt(t,l){let{noteUUID:n,attachmentUUID:i,page:r,highlightId:c}=re(l);if(!n){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let a=await t.getNoteContent({uuid:n}),h=ae(a,t.context.pluginUUID,i,{page:r,highlightId:c,collapsed:!1});h!==null&&(t.context&&t.context.noteUUID===n?await kn(t,n,h,i):await t.replaceNoteContent({uuid:n},h))}catch{}await t.navigate(`https://www.amplenote.com/notes/${n}`)}function fe(t){if(!t)return null;let l=String(t).trim().toLowerCase();return le.find(n=>n.id===l||n.hex.toLowerCase()===l)||null}function mt(){return fe(ce)}function In(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function ge({page:t,color:l,rects:n,quoteText:i,note:r=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(n)||n.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of n)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let a=fe(l)||mt();return{id:c||In(),page:t,color:a.id,rects:n.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(i||""),note:r?String(r):null}}function wt(t,l){let n=l==null?null:String(l).trim();return{...t,note:n||null}}function vt(t,l){let n=fe(l);if(!n)throw new Error(`withColor: unknown color "${l}"`);return{...t,color:n.id}}function bt(t,l){return(t||[]).filter(n=>n.id!==l)}function Ae(t,l,n){let i=!1,r=(t||[]).map(c=>c.id!==l?c:(i=!0,n(c)));return i?r:t}var Nn="json",xt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function yt(t){let l=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${xt}
\`\`\`${Nn}
${l}
\`\`\``}function De(t){if(!t)return null;let l=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),n=!l&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),i=(l?l[1]:n?n[1]:t).trim();if(!i)return null;try{return JSON.parse(i)}catch{return null}}function Sn(t){if(!Array.isArray(t))return[];let l=[];for(let n of t)try{l.push(ge(n))}catch{}return l}async function me(t,l,n){let i=await t.getNoteContent({uuid:l}),r=He(i,q),c=De(r);return!c||typeof c!="object"?[]:Sn(c[n])}async function Et(t,l,n,i){let r={uuid:l},c=await t.getNoteContent(r),a=He(c,q),S={...De(a)||{},[n]:i},I=yt(S);a===null&&await t.insertNoteContent(r,`

# ${q}

`,{atEnd:!0});let y=Tn(c,I);if(y!==null){await t.replaceNoteContent(r,y);return}await t.replaceNoteContent(r,I,{section:{heading:{text:q,level:1}}})}async function Ct(t,l,n){let i={uuid:l},r=await t.getNoteContent(i),c=He(r,q);if(c===null)return;let a=De(c)||{};if(!(n in a))return;let h={...a};delete h[n],await t.replaceNoteContent(i,yt(h),{section:{heading:{text:q,level:1}}})}function Pe(t,l){let n=/^#\s+(.*)$/,i=t.findIndex(c=>{let a=c.match(n);return a&&a[1].trim()===l});if(i===-1)return null;let r=t.length;for(let c=i+1;c<t.length;c++)if(/^#\s+/.test(t[c])){r=c;break}return{start:i,end:r}}function He(t,l){if(!t)return null;let n=t.split(`
`),i=Pe(n,l);return i?n.slice(i.start+1,i.end).join(`
`).trim():null}function Un(t){if(!t)return"";let l=t,n=l.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return n&&(l=l.replace(n[0],"")),l=l.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),l=l.replace(xt,""),l.trim()}function kt(t,l){return String(t||"").includes("](plugin://")?l:`---

${l}`}function It(t,l){let n=(t||"").split(`
`),i=Pe(n,q);if(!i)return null;let r=n.slice(0,i.start).join(`
`).replace(/\s+$/,""),c=n.slice(i.start).join(`
`);return`${r?r+`

`:""}${l}

${c}`}function Tn(t,l){let n=(t||"").split(`
`),i=Pe(n,q);if(!i)return null;let r=Un(n.slice(i.start+1,i.end).join(`
`).trim());if(!r)return null;let c=n.slice(0,i.start).join(`
`).replace(/\s+$/,""),a=n.slice(i.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${r}

${n[i.start]}

${l}${a?`

`+a:""}`}function Nt(t){return/^\s*>/.test(t)}function St(t,l,n,i){if(!t||!l||!i)return null;for(let r=0;r<t.length;r++){let c=t[r];if(!c.includes(`](plugin://${l}`)||n&&!c.includes(`att=${n}`)||!new RegExp(`hl=${An(i)}(?![\\w-])`).test(c))continue;let a=r+1;for(a<t.length&&t[a].trim()===""&&a+1<t.length&&Nt(t[a+1])&&a++;a<t.length&&Nt(t[a]);)a++;return{start:r,end:a}}return null}function An(t){return String(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Re(t,l,n){if(!t||!l)return[];let i=[],r=String(t).split(`
`);for(let c of r){if(!c.includes(`](plugin://${l}`)||n&&!c.includes(`att=${n}`))continue;let a=c.match(/[?&]hl=([^&)\s]+)/);a&&i.indexOf(a[1])===-1&&i.push(a[1])}return i}function Le(t,l,n,i){let r=String(t||"").split(`
`),c=St(r,l,n,i);if(!c)return null;let{start:a,end:h}=c;h<r.length&&r[h].trim()===""&&h++;let S=r.slice(0,a).concat(r.slice(h));return Re(S.join(`
`),l,n).length?S.join(`
`):Dn(S).join(`
`)}function Dn(t){let l=t.findIndex(n=>n.trim()===`# ${q}`);l===-1&&(l=t.length);for(let n=l-1;n>=0;n--){let i=t[n].trim();if(i==="")continue;if(i!=="---")return t;let r=t.slice(0,n).concat(t.slice(n+1)),c=n;for(;c<r.length&&r[c].trim()===""&&(c===0||r[c-1].trim()==="");)r.splice(c,1);return r}return t}function Me(t,l,n,i,r){let c=String(t||"").split(`
`),a=St(c,l,n,i);return a?c.slice(0,a.start).concat(String(r).split(`
`),c.slice(a.end)).join(`
`):null}function _(t,l){return l.noteUUID||t.context.noteUUID}async function Ut(t,l,n){try{let i=await t.getNoteAttachments({uuid:l}),r=Array.isArray(i)&&i.find(c=>c&&c.uuid===n);return r?r.name:""}catch{return""}}async function we(t,l,n,i){let r=await me(t,l,n),c=i(r);return c!==r&&await Et(t,l,n,c),{highlights:c}}async function Tt(t,l,n,i){if(n.pluginUUID)try{let r=await t.getNoteContent({uuid:l}),c=i(r);c!==null&&c!==r&&await t.replaceNoteContent({uuid:l},c)}catch{}}function At(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let l=t.trim();if(!l.startsWith("{"))return{action:l};try{return JSON.parse(l)}catch{return{action:l}}}async function Dt(t,l){return JSON.stringify(await Pn(t,At(l)))}async function Pn(t,l){let n=At(l);switch(n.action){case"getPdfUrl":{let i=n.attachmentUUID;if(!i)return{error:"No attachment specified for this viewer."};try{return{url:await st(t,i),name:await Ut(t,_(t,n),i)}}catch(r){return{error:`Could not load the PDF: ${r.message}`}}}case"loadHighlights":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=_(t,n),r=await me(t,i,n.attachmentUUID),c=[];if(n.pluginUUID){let a=await t.getNoteContent({uuid:i});c=Re(a,n.pluginUUID,n.attachmentUUID)}return{highlights:r,sentIds:c}}catch(i){return{error:`Could not load highlights: ${i.message}`}}}case"addHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=ge(n.highlight||{});return await we(t,_(t,n),n.attachmentUUID,r=>r.concat([i]))}catch(i){return{error:`Could not save the highlight: ${i.message}`}}}case"recolorHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=_(t,n),r=await we(t,i,n.attachmentUUID,c=>Ae(c,n.id,a=>vt(a,n.color)));return n.exportBlock&&await Tt(t,i,n,c=>Me(c,n.pluginUUID,n.attachmentUUID,n.id,n.exportBlock)),r}catch(i){return{error:`Could not change the highlight color: ${i.message}`}}}case"setHighlightNote":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await we(t,_(t,n),n.attachmentUUID,i=>Ae(i,n.id,r=>wt(r,n.note)))}catch(i){return{error:`Could not save the note: ${i.message}`}}}case"removeHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=_(t,n),r=await we(t,i,n.attachmentUUID,c=>bt(c,n.id));return await Tt(t,i,n,c=>Le(c,n.pluginUUID,n.attachmentUUID,n.id)),r}catch(i){return{error:`Could not remove the highlight: ${i.message}`}}}case"removeFromNote":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate the block."};if(!n.id)return{error:"No highlight specified."};try{let i=_(t,n),r=await t.getNoteContent({uuid:i}),c=Le(r,n.pluginUUID,n.attachmentUUID,n.id);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},c),{ok:!0})}catch(i){return{error:`Could not remove it from the note: ${i.message}`}}}case"sendToNote":{if(!n.content)return{error:"Nothing to send."};try{let i={uuid:_(t,n)},r=await t.getNoteContent(i);if(n.highlightId){let h=Me(r,n.pluginUUID,n.attachmentUUID,n.highlightId,n.content);if(h!==null)return await t.replaceNoteContent(i,h),{ok:!0,replaced:!0}}let c=kt(r,n.content),a=It(r,c);return a===null?await t.insertNoteContent(i,`
`+c+`
`,{atEnd:!0}):await t.replaceNoteContent(i,a),{ok:!0}}catch(i){return{error:`Could not add this to the note: ${i.message}`}}}case"removeViewer":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=_(t,n),r=await t.getNoteContent({uuid:i}),c=ue(r,n.pluginUUID,n.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:i},c),await Ct(t,i,n.attachmentUUID),{ok:!0})}catch(i){return{error:`Could not remove this viewer: ${i.message}`}}}case"getViewerSummary":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};let i=_(t,n),r=await Ut(t,i,n.attachmentUUID);try{let c=await me(t,i,n.attachmentUUID);return{name:r,count:c.length}}catch{return{name:r,count:0}}}case"setCollapsed":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=_(t,n),r=await t.getNoteContent({uuid:i}),c=ht(r,n.pluginUUID,n.attachmentUUID,n.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},c),{ok:!0})}catch(i){return{error:`Could not resize this viewer: ${i.message}`}}}case"clearDeepLink":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=_(t,n),r=await t.getNoteContent({uuid:i}),c=ae(r,n.pluginUUID,n.attachmentUUID,{page:null,highlightId:null});return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},c),{ok:!0})}catch(i){return{error:`Could not clear this viewer's deep link: ${i.message}`}}}case"exportAll":{if(!n.noteName)return{error:"Missing destination note name."};try{let i=await t.findNote({name:n.noteName}),r=i?i.uuid:await t.createNote(n.noteName);return await t.replaceNoteContent({uuid:r},n.content||""),{ok:!0,noteUUID:r}}catch(i){return{error:`Could not export highlights: ${i.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(n.action)}`}}}function Fe(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function l(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function n(u,f){var b=Math.pow(10,f===void 0?2:f),x=function(E){return Math.round(E*b)/b};return{x:x(u.x),y:x(u.y),width:x(u.width),height:x(u.height)}}function i(u){return u.width>.01&&u.height>.01}function r(u,f,b){for(var x=String(u??""),E=Math.max(0,f===void 0?0:f),C=Math.min(x.length,b===void 0?x.length:b),U=function(O){return O===""||/\s/.test(O)},T=[],A=E;A<C;){for(;A<C&&U(x.charAt(A));)A++;if(A>=C)break;for(var $=A;A<C&&!U(x.charAt(A));)A++;T.push({start:$,end:A})}return T}function c(u){for(var f=1/0,b=1/0,x=-1/0,E=-1/0,C=0;C<(u?u.length:0);C++){var U=u[C];i(U)&&(f=Math.min(f,U.left),b=Math.min(b,U.top),x=Math.max(x,U.left+U.width),E=Math.max(E,U.top+U.height))}return isFinite(f)?{left:f,top:b,width:x-f,height:E-b}:null}function a(u,f,b){for(var x=[],E=0;E<u.length;E++){var C=t(u[E],f);if(i(C)){var U=b(C.x,C.y),T=b(C.x+C.width,C.y+C.height),A=n(l(U,T));i(A)&&x.push(A)}}return x}function h(u,f){var b=f(u.x,u.y),x=f(u.x+u.width,u.y+u.height);return l(b,x)}function S(u,f,b){var x=f.right-f.left,E=f.bottom-f.top;if(x<=0||E<=0)return null;var C=u.x2-u.x1,U=u.y2-u.y1,T=u.x1+(b.left-f.left)/x*C,A=u.x2-(f.right-b.right)/x*C,$=u.y1+(b.bottom-f.bottom)/E*U,O=u.y2-(f.top-b.top)/E*U;return{x:T,y:$,width:A-T,height:O-$}}function I(u,f){var b=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return b>.5*Math.min(u.height,f.height)}function y(u,f){var b=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var x=u.slice().sort(function(W,j){return j.y-W.y||W.x-j.x}),E=[],C=0;C<x.length;C++){for(var U=!1,T=0;T<E.length;T++)if(I(E[T][0],x[C])){E[T].push(x[C]),U=!0;break}U||E.push([x[C]])}for(var A=[],$=0;$<E.length;$++){for(var O=E[$].slice().sort(function(W,j){return W.x-j.x}),R=null,G=0;G<O.length;G++){var F=O[G];if(R===null){R={x:F.x,y:F.y,width:F.width,height:F.height};continue}var be=F.x-(R.x+R.width);if(be<=b*Math.max(R.height,F.height)){var ie=Math.max(R.x+R.width,F.x+F.width),ee=Math.max(R.y+R.height,F.y+F.height);R.x=Math.min(R.x,F.x),R.y=Math.min(R.y,F.y),R.width=ie-R.x,R.height=ee-R.y}else A.push(R),R={x:F.x,y:F.y,width:F.width,height:F.height}}R!==null&&A.push(R)}return A.map(function(W){return n(W)})}function k(u,f,b,x){var E=x===void 0?0:x;return f>=u.x-E&&f<=u.x+u.width+E&&b>=u.y-E&&b<=u.y+u.height+E}function v(u,f,b,x,E){for(var C=u||[],U=C.length-1;U>=0;U--){var T=C[U];if(!(!T||T.page!==f||!T.rects)){for(var A=0;A<T.rects.length;A++)if(k(T.rects[A],b,x,E===void 0?1:E))return T}}return null}function w(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:l,roundRect:n,isVisibleRect:i,textTokenRanges:r,unionClientRects:c,clientRectsToPdfRects:a,pdfRectToViewportRect:h,itemRelativeRect:S,mergeLineRects:y,rectContainsPoint:k,hitTestHighlights:v,normalizeQuoteText:w}}var B=Fe(),mo=B.clientRectToLocal,wo=B.rectFromCorners,vo=B.roundRect,bo=B.isVisibleRect,xo=B.textTokenRanges,yo=B.unionClientRects,Eo=B.clientRectsToPdfRects,Co=B.pdfRectToViewportRect,ko=B.itemRelativeRect,Io=B.mergeLineRects,No=B.rectContainsPoint,So=B.hitTestHighlights,Uo=B.normalizeQuoteText;function Oe(){var t=[.957,.871,.424];function l(c,a,h,S,I){var y=a.context.register(a.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),k=[c.pushGraphicsState(),c.setGraphicsState("GS0")];k.push(c.setFillingColor(c.rgb(S[0],S[1],S[2])));for(var v=0;v<h.length;v++){var w=h[v];k.push(c.moveTo(w.x,w.y)),k.push(c.lineTo(w.x,w.y+w.height)),k.push(c.lineTo(w.x+w.width,w.y+w.height)),k.push(c.lineTo(w.x+w.width,w.y)),k.push(c.closePath())}k.push(c.fill()),k.push(c.popGraphicsState());var u=a.context.formXObject(k,{BBox:I,Resources:{ExtGState:{GS0:y}}});return a.context.register(u)}function n(c,a,h,S){for(var I=h.rects,y=[],k=I[0].x,v=I[0].y,w=I[0].x+I[0].width,u=I[0].y+I[0].height,f=0;f<I.length;f++){var b=I[f],x=b.x,E=b.x+b.width,C=b.y,U=b.y+b.height;y.push(x,U,E,U,x,C,E,C),k=Math.min(k,x),v=Math.min(v,C),w=Math.max(w,E),u=Math.max(u,U)}var T=a.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:a.context.obj([k,v,w,u]),QuadPoints:a.context.obj(y),C:a.context.obj(S),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&T.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var A=l(c,a,I,S,[k,v,w,u]);T.set(c.PDFName.of("AP"),a.context.obj({N:A}));var $=a.context.register(T),O=[$];if(h.note){var R=a.context.register(a.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:a.context.obj([w+8,v-60,w+208,v+12]),Parent:$,Open:!1}));T.set(c.PDFName.of("Popup"),R),O.push(R)}return O}function i(c,a,h){var S=a.node.get(c.PDFName.of("Annots"));if(S instanceof c.PDFArray)for(var I=0;I<h.length;I++)S.push(h[I]);else a.node.set(c.PDFName.of("Annots"),a.doc.context.obj(h))}async function r(c,a,h,S){for(var I=await c.PDFDocument.load(a),y=I.getPages(),k=h||[],v=0;v<k.length;v++){var w=k[v];if(!(!w||!w.rects||!w.rects.length)){var u=y[w.page-1];if(u){var f=S&&S[w.color]||t,b=n(c,I,w,f);i(c,u,b)}}}return I.save()}return{writeHighlightsIntoPdf:r,buildHighlightAnnotation:n,appendAnnotationRefs:i}}var $e=Oe(),Ao=$e.writeHighlightsIntoPdf,Do=$e.buildHighlightAnnotation,Po=$e.appendAnnotationRefs;function ze(){function t(y){return String(y??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function l(y,k,v,w,u){var f=new URLSearchParams;k&&f.set("att",k),Number.isFinite(v)&&v>=1&&f.set("page",String(Math.floor(v))),w&&f.set("hl",w),u&&f.set("note",u);var b=f.toString();return"plugin://"+y+(b?"?"+b:"")}function n(y,k){return String(y??"").split(/\r?\n/).map(function(v){return(k+" "+v).replace(/[ \t]+$/,"")})}function i(y,k,v){return k==null?y:"<mark"+(v?' style="background-color:'+v+';"':"")+">"+y+'<!-- {"backgroundCycleColor":"'+k+'"} --></mark>'}function r(y,k,v,w,u,f,b){var x=l(k,v,w.page,w.id,b),E=i(t(y||"PDF"),u,f),C="["+E+"]("+x+")",U=[C].concat(n(w.quoteText,"> >"));return w.note&&(U.push(">"),U=U.concat(n(w.note,">"))),U.join(`
`)}function c(y){return String(y??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function a(y){return"<p>"+c(y).replace(/\r?\n/g,"<br>")+"</p>"}function h(y,k,v,w,u,f,b){var x=l(k,v,w.page,w.id,b),E=c(y||"PDF"),C=f?'<mark style="background-color: '+c(f)+';">'+E+"</mark>":E,U='<p><a href="'+c(x)+'">'+C+"</a></p>",T="<blockquote><blockquote>"+a(w.quoteText)+"</blockquote></blockquote>",A=w.note?"<blockquote>"+a(w.note)+"</blockquote>":"";return U+T+A}function S(y){return y.slice().sort(function(k,v){if(k.page!==v.page)return k.page-v.page;var w=k.rects&&k.rects[0]?k.rects[0].y:0,u=v.rects&&v.rects[0]?v.rects[0].y:0;return u-w})}function I(y,k,v,w,u,f,b){var x=f&&f.length?f:null,E=(w||[]).filter(function(T){return T&&(!x||x.indexOf(T.color)!==-1)}),C=S(E),U=C.map(function(T){var A=u&&u[T.color]||{};return r(y,k,v,T,A.cycleIndex,A.hex,b)});return U.join(`

`)}return{buildDeepLink:l,buildHighlightBlock:r,buildHighlightHtml:h,buildExportAllContent:I}}var ve=ze(),Ro=ve.buildDeepLink,Lo=ve.buildHighlightBlock,Mo=ve.buildHighlightHtml,Fo=ve.buildExportAllContent;function Pt(){var t=window.__PDFA_CONFIG||{},l=window.__PDFA_GEOM||{},n=window.__PDFA_ANNOTATIONS||{},i=window.__PDFA_EXPORT||{},r={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(a.attachmentName=e,r.name&&(r.name.textContent=e),r.collapsedName&&(r.collapsedName.textContent=e))}var a={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],sentIds:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,o){r.status.textContent=e||"",r.status.style.display=e?"block":"none",r.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function S(e){var o=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(s,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");s(window.callAmplenotePlugin(JSON.stringify(o)))}catch(p){d(p)}}).then(function(s){if(s&&typeof s=="object")return s;if(typeof s!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(s)}catch{throw new Error("Unreadable reply from the plugin: "+String(s).slice(0,120))}})}function I(){return t.colors||[]}function y(e){for(var o=I(),s=0;s<o.length;s++)if(o[s].id===e)return o[s].hex;return o.length?o[0].hex:"#F4DE6C"}function k(e){for(var o=0;o<a.highlights.length;o++)if(a.highlights[o].id===e)return a.highlights[o];return null}function v(e,o,s){var d=document.createElement("button");return d.className="pdfa-btn"+(o?" "+o:""),d.textContent=e,d.onclick=function(p){p.stopPropagation(),s()},d}function w(e,o,s,d){var p=document.createElement("button");return p.className="pdfa-color",p.dataset.color=e.id,p.style.background=e.hex,p.title=d+" "+e.label,p.setAttribute("aria-label",d+" "+e.label),p.setAttribute("aria-pressed",String(!!o)),p.onclick=function(g){g.stopPropagation(),s(e.id)},p}function u(){for(var e=I(),o=0;o<e.length;o++)r.colors.appendChild(w(e[o],e[o].id===a.activeColorId,function(s){a.activeColorId=s,f(),a.pendingSelection&&_e(a.pendingSelection,s)},"Highlight"))}function f(){for(var e=r.colors.querySelectorAll(".pdfa-color"),o=0;o<e.length;o++)e[o].setAttribute("aria-pressed",String(e[o].dataset.color===a.activeColorId))}function b(){for(var e=[],o=1;o<=a.pageCount;o++)(function(s){e.push(a.doc.getPage(s).then(function(d){a.viewports[s]=d.getViewport({scale:a.scale})}))})(o);return Promise.all(e)}function x(e){var o=a.viewports[e],s=document.createElement("div");return s.className="pdfa-page",s.dataset.page=String(e),s.style.width=o.width+"px",s.style.height=o.height+"px",s}function E(e,o){if(a.rendered[o]||a.renderingPage[o])return Promise.resolve();a.renderingPage[o]=!0;var s=a.viewports[o],d=document.createElement("canvas"),p=window.devicePixelRatio||1;d.width=Math.floor(s.width*p),d.height=Math.floor(s.height*p),d.style.width=s.width+"px",d.style.height=s.height+"px",e.appendChild(d);var g=document.createElement("div");g.className="pdfa-highlights",e.appendChild(g);var m=document.createElement("div");m.className="textLayer",m.style.width=s.width+"px",m.style.height=s.height+"px",m.style.setProperty("--scale-factor",String(a.scale)),e.appendChild(m);var N=d.getContext("2d");N.scale(p,p);var D=null;return a.doc.getPage(o).then(function(H){return D=H,H.render({canvasContext:N,viewport:s}).promise}).then(function(){return D.getTextContent()}).then(function(H){var P=[];return window.pdfjsLib.renderTextLayer({textContent:H,container:m,viewport:s,textDivs:P}).promise.then(function(){a.textSpans+=P.length;for(var L=0;L<P.length;L++)P[L].__pdfaItem=H.items[L];a.rendered[o]=!0,a.renderingPage[o]=!1,$(o),U()})}).catch(function(H){a.renderingPage[o]=!1,h("Failed to render page "+o+": "+(H.message||H),!0)})}function C(){var e=Y();if(!e||!a.doc)return Promise.resolve();for(var o=e.getBoundingClientRect(),s=e.clientHeight,d=r.pages.querySelectorAll(".pdfa-page"),p=[],g=0;g<d.length;g++){var m=d[g],N=Number(m.dataset.page);if(!(a.rendered[N]||a.renderingPage[N])){var D=m.getBoundingClientRect(),H=D.top-o.top,P=D.bottom-o.top;P<-s||H>e.clientHeight+s||p.push(E(m,N))}}return Promise.all(p)}function U(){var e=0;for(var o in a.rendered)a.rendered[o]&&e++;if(e){var s=a.textSpans===0;h(s?"No selectable text found - this PDF may be a scan.":"",s)}}function T(){if(a.rendering)return Promise.resolve();a.rendering=!0,M(!0),h("Rendering...");var e=Y(),o=e?e.scrollHeight-e.clientHeight:0,s=o>0?e.scrollTop/o:0;return r.pages.innerHTML="",a.viewports={},a.rendered={},a.renderingPage={},a.textSpans=0,b().then(function(){for(var d=1;d<=a.pageCount;d++)r.pages.appendChild(x(d));if(e){var p=e.scrollHeight-e.clientHeight;e.scrollTop=s*(p>0?p:0)}a.rendering=!1,te(),ne(),C()}).catch(function(d){a.rendering=!1,h("Failed to render: "+(d.message||d),!0)})}function A(e){return function(o,s){return e.convertToViewportPoint(o,s)}}function $(e){for(var o=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",s=r.pages.querySelectorAll(o),d=0;d<s.length;d++){var p=s[d],g=Number(p.dataset.page),m=p.querySelector(".pdfa-highlights"),N=a.viewports[g];if(!(!m||!N)){m.innerHTML="";for(var D=A(N),H=0;H<a.highlights.length;H++){var P=a.highlights[H];if(!(!P||P.page!==g||!P.rects||!P.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=P.id||"";for(var J=0;J<P.rects.length;J++){var Z=l.pdfRectToViewportRect(P.rects[J],D),z=document.createElement("div");z.className="pdfa-hl",z.style.left=Z.x+"px",z.style.top=Z.y+"px",z.style.width=Z.width+"px",z.style.height=Z.height+"px",z.style.background=y(P.color),L.appendChild(z)}m.appendChild(L)}}}}}function O(){$(),G(),r.count.textContent=String(a.highlights.length)}function R(){return a.highlights.slice().sort(function(e,o){return e.page!==o.page?e.page-o.page:(o.rects[0]?o.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function G(){r.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",e.appendChild(o),e.appendChild(v("Close","",function(){ie(!1)})),r.panel.appendChild(e);var s=R();if(!s.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",r.panel.appendChild(d);return}for(var p=0;p<s.length;p++)r.panel.appendChild(F(s[p]))}function F(e){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=e.id||"",o.title="Jump to this highlight";var s=document.createElement("span");s.className="pdfa-chip",s.style.background=y(e.color),o.appendChild(s);var d=document.createElement("div"),p=document.createElement("div");p.className="pdfa-hl-page",p.textContent="Page "+e.page,d.appendChild(p);var g=document.createElement("div");if(g.className="pdfa-hl-quote",g.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(g),e.note){var m=document.createElement("div");m.className="pdfa-hl-note",m.textContent=e.note,d.appendChild(m)}if(o.appendChild(d),a.sentIds.indexOf(e.id)!==-1){var N=document.createElement("button");N.className="pdfa-hl-unsend",N.type="button",N.title="Remove this from the note (keeps the highlight)",N.setAttribute("aria-label","Remove this highlight from the note"),N.textContent="\u{1F5D1}",N.onclick=function(D){D.stopPropagation(),be(e)},o.appendChild(N)}return o.onclick=function(){We(e)},o}function be(e){S({action:"removeFromNote",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e.id}).then(function(o){if(o&&o.error)throw new Error(o.error);var s=a.sentIds.indexOf(e.id);s!==-1&&a.sentIds.splice(s,1),G(),h("Removed from the note. The highlight is still here.")}).catch(function(o){h(o.message||String(o),!0)})}function ie(e){var o=e===void 0?!r.panel.classList.contains("pdfa-open"):e;r.panel.classList.toggle("pdfa-open",o),r.listToggle.setAttribute("aria-pressed",String(o)),o&&G(),ne()}function ee(e){for(var o=e&&e.nodeType===1?e:e&&e.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function W(e,o){for(var s=[],d=[],p=null,g=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),m;m=g.nextNode();)if(e.intersectsNode(m)){var N=m.nodeValue||"",D=m===e.startContainer?e.startOffset:0,H=m===e.endContainer?e.endOffset:N.length,P=m.parentElement,L=P&&P.__pdfaItem;if(L)for(var J={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},Z=P.getBoundingClientRect(),z=l.textTokenRanges(N,D,H),K=0;K<z.length;K++){var Ue=document.createRange();Ue.setStart(m,z[K].start),Ue.setEnd(m,z[K].end);var V=l.unionClientRects(Ue.getClientRects());if(V){var tt={left:V.left,top:V.top,width:V.width,height:V.height,right:V.left+V.width,bottom:V.top+V.height},nt=l.itemRelativeRect(J,Z,tt);nt&&(s.push(nt),d.push(N.slice(z[K].start,z[K].end)),p=tt)}}}return{rects:s,text:d.join(" "),lastCssRect:p}}function j(e){if(a.pendingSelection=e,a.lastCapturedText=e&&e.rawText||"",!e){r.hint.textContent="",r.hint.style.display="none";return}r.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",r.hint.style.display="inline"}function Be(e){if(!a.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){j(null),M();return}var s=o.getRangeAt(0),d=ee(s.startContainer);if(!d)return j(null);var p=d.parentElement;if(!p||!p.dataset||!p.dataset.page)return j(null);var g=Number(p.dataset.page);if(!a.rendered[g])return j(null);var m=ee(s.endContainer)!==d,N=W(s,d),D=l.mergeLineRects(N.rects);if(!D.length)return j(null);var H=N.lastCssRect||p.getBoundingClientRect(),P=e&&e.clientX?e.clientX:H.left+H.width/2,L=e&&e.clientY?e.clientY:H.top+H.height,J={page:g,rects:D,quoteText:l.normalizeQuoteText(N.text),spilled:m,anchorX:P,anchorY:L,rawText:String(o)};j(J),$t(J)}}var Lt=300,X=null;function Mt(){a.noteEditing||(X&&clearTimeout(X),X=setTimeout(je,Lt))}function je(){if(X=null,!a.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||ee(e.getRangeAt(0).startContainer)&&String(e)!==a.lastCapturedText&&Be(null)}}function se(e,o){var s=a.highlights;return a.highlights=e,O(),S(o).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return a.highlights=d.highlights||e,O(),h(""),!0}).catch(function(d){return a.highlights=s,O(),h(d.message||String(d),!0),!1})}function _e(e,o){var s={id:null,page:e.page,color:o,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,p=e.anchorY;j(null),M(!0);var g=window.getSelection();g&&g.removeAllRanges&&g.removeAllRanges(),se(a.highlights.concat([s]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:s}).then(function(m){if(m){var N=a.highlights[a.highlights.length-1];N&&N.id&&ye(N,d,p,!0)}})}function Ft(e,o){M(!0);for(var s=a.highlights.map(function(g){return g.id===e?Object.assign({},g,{color:o}):g}),d=null,p=0;p<s.length;p++)s[p].id===e&&(d=s[p]);se(s,{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e,color:o,exportBlock:d?Se(d):null})}function Ot(e){M(!0),se(a.highlights.filter(function(o){return o.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e})}function xe(e,o){var s=String(o??"").trim();a.noteEditing=null,M(!0),se(a.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:s||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:s})}function Q(e,o,s,d){r.popover.innerHTML="",r.popover.classList.toggle("pdfa-editing",d==="editing"),r.popover.classList.toggle("pdfa-exporting",d==="exporting"),r.popover.classList.toggle("pdfa-menu",d==="menu");for(var p=0;p<e.length;p++)r.popover.appendChild(e[p]);r.popover.classList.add("pdfa-open");var g=r.popover.offsetWidth,m=r.popover.offsetHeight,N=Math.max(4,Math.min(o-g/2,window.innerWidth-g-4)),D=s+12;D+m>window.innerHeight-4&&(D=Math.max(4,s-m-12)),D=Math.max(4,Math.min(D,window.innerHeight-m-4)),r.popover.style.left=N+"px",r.popover.style.top=D+"px"}function M(e){a.noteEditing&&!e||(a.noteEditing=null,r.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),r.popover.innerHTML="")}function $t(e){for(var o=I(),s=[],d=0;d<o.length;d++)s.push(w(o[d],o[d].id===a.activeColorId,function(p){a.activeColorId=p,f(),_e(e,p)},"Highlight"));Q(s,e.anchorX,e.anchorY)}function ye(e,o,s,d){for(var p=I(),g=[],m=0;m<p.length;m++)g.push(w(p[m],p[m].id===e.color,function(D){Ft(e.id,D)},"Change to"));var N=!!e.note;g.push(v(N?"Edit note":"Add note",d&&!N?"pdfa-btn-primary":"",function(){Bt(e,o,s)})),g.push(v("Copy","",function(){en(e)})),g.push(v("Send to note","",function(){tn(e)})),g.push(v("Remove","pdfa-remove",function(){Ot(e.id)})),Q(g,o,s)}function zt(e,o){for(var s=I(),d={},p=0;p<s.length;p++)d[s[p].id]=!0;var g=document.createElement("div");g.className="pdfa-export-hint",g.textContent="Export highlights to a note";var m=document.createElement("div");m.className="pdfa-export-colors";for(var N=0;N<s.length;N++)(function(H){var P=w(H,!0,function(L){d[L]=!d[L],P.setAttribute("aria-pressed",String(d[L]))},"Toggle");m.appendChild(P)})(s[N]);var D=document.createElement("div");D.className="pdfa-note-actions",D.appendChild(v("Create / update note","pdfa-btn-primary",function(){for(var H=[],P=0;P<s.length;P++)d[s[P].id]&&H.push(s[P].id);nn(H.length===s.length?null:H)})),Q([g,m,D],e,o,"exporting")}function Bt(e,o,s){a.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var p=document.createElement("div");p.className="pdfa-note-actions",e.note&&p.appendChild(v("Delete note","",function(){xe(e.id,"")}));var g=document.createElement("span");g.className="pdfa-spacer",p.appendChild(g),p.appendChild(v("Cancel","",function(){qe(e,o,s)})),p.appendChild(v("Save","pdfa-btn-primary",function(){xe(e.id,d.value)})),d.onkeydown=function(m){m.key==="Enter"&&(m.ctrlKey||m.metaKey)?(m.preventDefault(),m.stopPropagation(),xe(e.id,d.value)):m.key==="Escape"&&(m.preventDefault(),m.stopPropagation(),qe(e,o,s))},Q([d,p],o,s,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function qe(e,o,s){a.noteEditing=null;var d=k(e.id)||e;ye(d,o,s)}function jt(e){if(!a.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var s=e.target,d=null;s&&s!==r.pages;){if(s.classList&&s.classList.contains("pdfa-page")){d=s;break}s=s.parentElement}if(!d)return M();var p=Number(d.dataset.page),g=a.viewports[p];if(!g)return M();var m=d.getBoundingClientRect(),N=g.convertToPdfPoint(e.clientX-m.left,e.clientY-m.top),D=l.hitTestHighlights(a.highlights,p,N[0],N[1],1);D&&D.id?ye(D,e.clientX,e.clientY):M()}}}function Ee(){return Math.round(a.scale*100)+"%"}function te(){r.pageLabel.textContent=a.current+" / "+a.pageCount,document.activeElement!==r.zoomLabel&&(r.zoomLabel.value=Ee())}function Y(){return r.root.querySelector(".pdfa-scroll")}function Ge(){return r.panel&&r.panel.classList.contains("pdfa-open")?r.panel:Y()}function Ve(e){var o=r.pages.querySelector('.pdfa-page[data-page="'+e+'"]');o&&E(o,e)}function Ce(e){var o=Math.min(Math.max(1,e),a.pageCount),s=r.pages.querySelector('.pdfa-page[data-page="'+o+'"]');Ve(o);var d=Y();s&&d&&(d.scrollTop+=s.getBoundingClientRect().top-d.getBoundingClientRect().top),C(),a.current=o,te()}function We(e){var o=r.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),s=a.viewports[e.page];if(!(!o||!s||!e.rects||!e.rects.length)){var d=l.pdfRectToViewportRect(e.rects[0],A(s)),p=Y(),g=o.getBoundingClientRect().top+d.y;p.scrollTop+=g-p.getBoundingClientRect().top-p.clientHeight/3,Ve(e.page),C(),a.current=e.page,te()}}function _t(){try{r.root.setAttribute("tabindex","-1"),r.root.focus(),r.root.scrollIntoView&&r.root.scrollIntoView({block:"nearest"})}catch{}}function qt(e){if(!(!e||!e.id)){var o=r.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');o&&(o.classList.add("pdfa-hl-flash"),setTimeout(function(){o.classList.remove("pdfa-hl-flash")},2600))}}function ke(e){return Math.min(Math.max(.4,e),4)}function Ie(e){return a.scale=ke(e),T()}function Je(){var e=String(r.zoomLabel.value).replace(/[\s%]/g,""),o=/^\d*\.?\d+$/.test(e)?parseFloat(e):NaN;if(o>0){var s=ke(o/100);s!==a.scale&&Ie(s)}r.zoomLabel.value=Ee()}function Gt(){return a.doc?a.doc.getPage(1).then(function(e){var o=Y();if(o){var s=window.getComputedStyle(o),d=o.clientWidth-(parseFloat(s.paddingLeft)||0)-(parseFloat(s.paddingRight)||0),p=e.getViewport({scale:1}).width;if(!(!(d>0)||!(p>0))){var g=ke(d/p);g<a.scale&&(a.scale=g,te())}}}).catch(function(){}):Promise.resolve()}function Xe(e){var o=Ge();o&&(o.scrollTop+=e*Math.max(80,o.clientHeight*.85),ne(),C())}function Ye(e,o){var s=null,d=null,p=!1,g=function(){s&&clearTimeout(s),d&&clearInterval(d),s=d=null};e.addEventListener("pointerdown",function(){g(),p=!1,s=setTimeout(function(){p=!0,d=setInterval(function(){if(e.disabled)return g();Xe(o*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(m){e.addEventListener(m,g)}),e.onclick=function(){if(p){p=!1;return}Xe(o)}}function ne(){var e=Ge();if(!(!e||!r.scrollUp)){var o=e.scrollHeight-e.clientHeight;r.scrollUp.disabled=e.scrollTop<=1,r.scrollDown.disabled=e.scrollTop>=o-1}}function Vt(){ne(),C(),M();for(var e=r.pages.querySelectorAll(".pdfa-page"),o=a.current,s=1/0,d=0;d<e.length;d++){var p=Math.abs(e[d].getBoundingClientRect().top-60);p<s&&(s=p,o=Number(e[d].dataset.page))}o!==a.current&&(a.current=o,te())}function Wt(){return new Promise(function(e,o){if(window.pdfjsLib)return e(window.pdfjsLib);var s=document.createElement("script");s.src=t.pdfJsSrc,s.onload=function(){window.pdfjsLib?e(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},s.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(s)})}function Jt(){return new Promise(function(e,o){if(window.PDFLib)return e(window.PDFLib);var s=document.createElement("script");s.src=t.pdfLibSrc,s.onload=function(){window.PDFLib?e(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},s.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(s)})}function Xt(){for(var e={},o=I(),s=0;s<o.length;s++)o[s].rgb&&(e[o[s].id]=o[s].rgb);return e}function Yt(){var e=(a.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Ne(){for(var e={},o=I(),s=0;s<o.length;s++)e[o[s].id]={cycleIndex:o[s].cycleIndex,hex:o[s].hex};return e}function Qe(){var e=(a.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Se(e){var o=Ne()[e.color]||{};return i.buildHighlightBlock(a.attachmentName,t.pluginUUID,t.attachmentUUID,e,o.cycleIndex,o.hex,t.noteUUID)}function Qt(e){if(!i.buildHighlightHtml)return null;var o=Ne()[e.color]||{};return i.buildHighlightHtml(a.attachmentName,t.pluginUUID,t.attachmentUUID,e,o.cycleIndex,o.hex,t.noteUUID)}function Zt(e,o){var s=function(g){var m=g.clipboardData||window.clipboardData;m&&(m.setData("text/plain",e),o&&m.setData("text/html",o),g.preventDefault())},d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select(),document.addEventListener("copy",s,!0);var p=!1;try{p=document.execCommand("copy")}catch{p=!1}return document.removeEventListener("copy",s,!0),document.body.removeChild(d),p}function Kt(e,o){var s=function(){return!navigator.clipboard||!navigator.clipboard.writeText?d():navigator.clipboard.writeText(e).then(function(){return"plain"},d)},d=function(){return Zt(e,o)?Promise.resolve(o?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(o&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var p=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([o],{type:"text/html"})});return navigator.clipboard.write([p]).then(function(){return"rich"},s)}catch{return s()}return s()}function en(e){M(!0);var o,s;try{o=Se(e),s=Qt(e)}catch(d){h("Could not build the copy: "+(d.message||d),!0);return}Kt(o,s).then(function(d){h(d==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(d){h("Could not copy: "+(d.message||d),!0)})}function tn(e){M(!0),S({action:"sendToNote",content:Se(e),highlightId:e.id,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");a.sentIds.indexOf(e.id)===-1&&a.sentIds.push(e.id),G(),h(o.replaced?"Updated this highlight where it already sits in the note.":"Added to this note, below the text.")}).catch(function(o){h(o.message||String(o),!0)})}function nn(e){M(!0);var o=i.buildExportAllContent(a.attachmentName,t.pluginUUID,t.attachmentUUID,a.highlights,Ne(),e,t.noteUUID);if(!o){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}S({action:"exportAll",noteName:Qe(),content:o}).then(function(s){if(!s||s.error)throw new Error(s&&s.error||"Could not export highlights.");h('Exported to "'+Qe()+'".')}).catch(function(s){h(s.message||String(s),!0)})}function on(e,o){var s=[];s.push(v("Collapse","",function(){M(!0),dn()}),v("Download","",function(){M(!0),sn()}),v("Export...","",function(){zt(e,o)}),v("Remove viewer...","pdfa-remove",function(){rn(e,o)})),Q(s,e,o,"menu")}function rn(e,o){var s=document.createElement("div");s.className="pdfa-export-hint",s.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(v("Cancel","",function(){M(!0)}));var p=document.createElement("span");p.className="pdfa-spacer",d.appendChild(p),d.appendChild(v("Remove","pdfa-remove",an)),Q([s,d],e,o,"exporting")}function an(){M(!0),h("Removing this viewer..."),S({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function sn(){a.pdfBytes&&(h("Preparing the download..."),Jt().then(function(e){return n.writeHighlightsIntoPdf(e,a.pdfBytes,a.highlights,Xt())}).then(function(e){return ln(e,Yt())}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function ln(e,o){var s=new Blob([e],{type:"application/pdf"}),d=null;try{d=new File([s],o,{type:"application/pdf"})}catch{}return d&&navigator.share&&navigator.canShare&&navigator.canShare({files:[d]})?navigator.share({files:[d],title:o}).then(function(){h("")}).catch(function(p){return p&&p.name==="AbortError"?h(""):Ze(s,o)}):Ze(s,o)}function Ze(e,o){var s=URL.createObjectURL(e),d=document.createElement("a");d.href=s,d.download=o,document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(s)},4e3);var p=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return h(p?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function cn(){return S({action:"loadHighlights",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");a.highlights=e.highlights||[],a.sentIds=e.sentIds||[]}).catch(function(e){a.highlights=[],a.sentIds=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function dn(){var e=a.highlights.length;r.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",r.root.classList.add("pdfa-collapsed-mode"),Ke(!0)}function Ke(e){S({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function hn(){S({action:"clearDeepLink",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function pn(){r.root.classList.remove("pdfa-collapsed-mode"),a.doc||et(),Ke(!1)}function et(){h("Loading PDF..."),(t.highlightId||t.page)&&(_t(),hn()),Wt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,S({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return a.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return a.doc=e,a.pageCount=e.numPages,cn()}).then(function(){return Gt()}).then(function(){return T()}).then(function(){O();var e=t.highlightId?k(t.highlightId):null;e?(We(e),qt(e)):t.page&&Ce(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){Ce(a.current-1)},document.getElementById("pdfa-next").onclick=function(){Ce(a.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){Ie(a.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){Ie(a.scale-.25)},r.zoomLabel.addEventListener("focus",function(){r.zoomLabel.value=String(Math.round(a.scale*100)),setTimeout(function(){document.activeElement===r.zoomLabel&&r.zoomLabel.select()},0)}),r.zoomLabel.addEventListener("blur",Je),r.zoomLabel.addEventListener("keydown",function(e){e.key==="Enter"?(e.preventDefault(),Je(),r.zoomLabel.blur()):e.key==="Escape"&&(e.preventDefault(),r.zoomLabel.value=Ee(),r.zoomLabel.blur())}),Ye(r.scrollUp,-1),Ye(r.scrollDown,1),r.listToggle.onclick=function(){ie()},r.more.onclick=function(e){on(e.clientX,e.clientY)},Y().addEventListener("scroll",Vt),r.panel.addEventListener("scroll",ne),r.pages.addEventListener("mouseup",Be),r.pages.addEventListener("click",jt),document.addEventListener("selectionchange",Mt),r.pages.addEventListener("touchend",function(){X&&clearTimeout(X),X=null,je()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!a.noteEditing&&M()}),document.addEventListener("mousedown",function(e){r.popover.classList.contains("pdfa-open")&&(r.popover.contains(e.target)||M())}),u(),G(),r.root.querySelector(".pdfa-collapsed").onclick=pn,t.collapsed?S({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var o=e.count||0;r.collapsedCount.textContent=o?o+(o===1?" highlight":" highlights"):""}}).catch(function(){}):et()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function Hn(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Rn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var Ln=`
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
  /* The zoom "label" is really an INPUT (see the markup for why), so it has to be talked
     back down into looking like the span it replaced: a browser hands an input its own
     font, border, background and width, none of which belong in this bar. width rather
     than the min-width above, because an input does not size itself to its content -
     .pdfa-label's min-width would leave it at the browser's ~170px default. */
  .pdfa-zoom-field { font: inherit; width: 62px; padding: 5px 4px; border: 1px solid transparent;
    border-radius: 6px; background: transparent; color: inherit; cursor: text; }
  /* The one cue that it is typable at all, and deliberately the SAME hover the - and +
     either side of it use: "these controls respond" stays one idea rather than two. */
  .pdfa-zoom-field:hover { background: var(--pdfa-btn-hover); }
  /* A border, not the browser's outline ring: the ring is drawn OUTWARD from the control
     and this bar's height is set by its contents, so it was clipped by the toolbar edge -
     the same problem the color swatches' selected state already solves this way. */
  .pdfa-zoom-field:focus { outline: none; opacity: 1;
    background: var(--pdfa-toolbar); border-color: var(--pdfa-accent); }
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
    /* Shrinks with the label it sits among - see .pdfa-zoom-field for why the zoom one
       needs a width of its own rather than inheriting the min-width above. Still wide
       enough for the longest value it can hold, "400%". */
    .pdfa-zoom-field { width: 46px; padding: 5px 2px; }
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
    /* Not a button, so the rule above skips it - and a 26px-tall text field wedged
       between two 40px buttons is both the odd one out and the hardest thing in the
       toolbar to tap accurately. */
    .pdfa-zoom-field { min-height: 40px; }
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
`,Ht={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function Rt({attachmentUUID:t,attachmentName:l="",page:n=null,highlightId:i=null,lightDarkMode:r="light",pluginUUID:c=null,noteUUID:a=null,collapsed:h=!1}={}){let S=Ht[r]||Ht.light,I={attachmentUUID:t,page:n,highlightId:i,pluginUUID:c,noteUUID:a,pdfJsSrc:oe.pdfJs,workerSrc:oe.pdfJsWorker,pdfLibSrc:oe.pdfLib,colors:le.map(y=>({id:y.id,label:y.label,hex:y.hex,rgb:y.rgb,cycleIndex:y.cycleIndex})),defaultColorId:ce,collapsed:h,attachmentName:l};return`<link rel="stylesheet" href="${oe.pdfViewerCss}">
<style>:root{${S}}${Ln}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${Hn(l)}</span>
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
    <!-- An input, not the label it looks like. The stepper moves in fixed 25% jumps from
         wherever the initial fit-to-width landed, so an exact zoom - "100%" - was often
         not reachable at all, only bracketed: from a fitted 83% the steps run 58/108/133.
         It still READS as a label (transparent, centred, no spinner) until it is focused,
         so nothing about the toolbar's shape changes for someone who only ever clicks the
         buttons. type=text, not number: number brings spinner arrows this bar has no room
         for and rejects the "%" people naturally type; inputmode gets the numeric keypad
         on a phone anyway. -->
    <input id="pdfa-zoom-label" class="pdfa-label pdfa-zoom-field" type="text"
           inputmode="numeric" autocomplete="off" spellcheck="false"
           aria-label="Zoom level in percent"
           title="Zoom level - type a percentage and press Enter" value="125%">
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
<script>window.__PDFA_CONFIG = ${Rn(I)};
window.__PDFA_GEOM = (${Fe.toString()})();
window.__PDFA_ANNOTATIONS = (${Oe.toString()})();
window.__PDFA_EXPORT = (${ze.toString()})();<\/script>
<script>(${Pt.toString()})();<\/script>`}var Mn={noteOption:{"Annotate PDF":async function(t,l){return pt(t,l,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,l){return ut(t,l)}},insertText:async function(t){return ft(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...l){return gt(t,l[0])},renderEmbed:function(t,...l){let{attachmentUUID:n,page:i,highlightId:r,collapsed:c,attachmentName:a}=re(l[0]);return n?Rt({attachmentUUID:n,page:i,highlightId:r,collapsed:c,attachmentName:a,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...l){return Dt(t,l[0])}},Fn=Mn;return vn(On);})();

  var plugin = __pluginModule.default;
})();
