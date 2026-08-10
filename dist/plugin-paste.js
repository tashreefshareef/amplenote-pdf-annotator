(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Ne=Object.defineProperty;var en=Object.getOwnPropertyDescriptor;var tn=Object.getOwnPropertyNames;var nn=Object.prototype.hasOwnProperty;var on=(t,l)=>{for(var a in l)Ne(t,a,{get:l[a],enumerable:!0})},rn=(t,l,a,s)=>{if(l&&typeof l=="object"||typeof l=="function")for(let i of tn(l))!nn.call(t,i)&&i!==a&&Ne(t,i,{get:()=>l[i],enumerable:!(s=en(l,i))||s.enumerable});return t};var an=t=>rn(Ne({},"__esModule",{value:!0}),t);var Nn={};on(Nn,{default:()=>En});var le=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],se="yellow",G="PDF Annotator data",Ye="attachment://",Qe=1,Ke=16,oe={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},ln="https://plugins.amplenote.com/cors-proxy";function Ze(t){let l=new URL(ln);return l.searchParams.set("apiurl",t),l.toString()}var sn="application/pdf";function cn(t){return Array.isArray(t)?t.filter(l=>l&&l.type===sn&&l.uuid):[]}async function ce(t,l){let a=await t.getNoteAttachments({uuid:l}),s=cn(a);if(s.length===0)return null;if(s.length===1)return s[0];let i=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:s.map(o=>({label:o.name,value:o.uuid})),value:s[0].uuid}]});if(i==null)return null;let d=Array.isArray(i)?i[0]:i;return s.find(o=>o.uuid===d)||null}async function et(t,l){if(!l)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(l);if(!a)throw new Error(`No URL returned for attachment ${l}`);return Ze(a)}function tt(t){return t?Ke:Qe}function re(t){let l={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return l;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return l}let s=d=>{let o=a.get(d);if(o===null||o.trim()==="")return null;let p=Number(o);return Number.isFinite(p)?p:null},i=s("page");return{attachmentUUID:a.get("att")||null,page:i!==null&&i>=1?Math.floor(i):null,x:s("x"),y:s("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function nt({attachmentUUID:t,page:l,x:a,y:s,highlightId:i,collapsed:d,attachmentName:o}={}){let p=new URLSearchParams;return t&&p.set("att",t),d&&p.set("c","1"),o&&p.set("n",o),Number.isFinite(l)&&l>=1&&p.set("page",String(Math.floor(l))),Number.isFinite(a)&&p.set("x",String(a)),Number.isFinite(s)&&p.set("y",String(s)),i&&p.set("hl",i),p.toString()}function de(t,l={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=tt(l.collapsed));let s=nt(l);return`<object data="${s?`plugin://${t}?${s}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function ot(t,l,a){if(!t||!l||!a)return null;let s=t.split(`
`),i=s.findIndex(o=>o.includes(`${Ye}${l}`));if(i===-1)return null;let d=s.slice();return s[i+1]===""?d.splice(i+2,0,a.trim(),""):d.splice(i+1,0,"",a.trim(),""),d.join(`
`)}function he(t,l,a=null){return!t||!l||!t.includes(`plugin://${l}`)?!1:a?t.includes(`att=${a}`):!0}function pe(t,l,a){if(!t||!l||!a)return null;let s=t.split(`
`),i=`plugin://${l}`,d=s.findIndex(p=>p.includes(i)&&p.includes(`att=${a}`));if(d===-1)return null;let o=s.slice();return o.splice(d,1),o[d]===""&&o[d-1]===""&&o.splice(d,1),o.join(`
`)}function Se(t,l,a,s={}){if(!t||!l||!a)return null;let i=t.split(`
`),d=`plugin://${l}`,o=i.findIndex(T=>T.includes(d)&&T.includes(`att=${a}`));if(o===-1)return null;let p=i[o],k=p.match(/data="(plugin:\/\/[^"]*)"/);if(!k)return null;let S=k[1],y=S.indexOf("?"),N=y===-1?"":S.slice(y+1),v={...re(N),attachmentUUID:a,...s},u=nt(v),f=u?`plugin://${l}?${u}`:`plugin://${l}`,x=i.slice(),b=p.replace(k[0],`data="${f}"`),C=tt(v.collapsed),E=b.match(/data-aspect-ratio="[^"]*"/);return b=E?b.replace(E[0],`data-aspect-ratio="${C}"`):b.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),x[o]=b,x.join(`
`)}function rt(t,l,a,s){return Se(t,l,a,{collapsed:!!s})}async function at(t,l,a){let s=await ce(t,l);if(!s){let p=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(p)&&p.length>0)||!p.some(S=>S&&S.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let i=await t.getNoteContent({uuid:l});if(he(i,a,s.uuid))return await t.alert(`"${s.name}" is already open in this note - scroll to the viewer.`),s.uuid;let d=de(a,{attachmentUUID:s.uuid,attachmentName:s.name}),o=ot(i,s.uuid,d);return o!==null?(await t.replaceNoteContent({uuid:l},o),s.uuid):(await t.insertNoteContent({uuid:l},`
${d}
`,{atEnd:!0}),s.uuid)}var dn="Raw markdown";function hn(t){let l=(String(t||"").match(/`+/g)||[]).reduce((a,s)=>Math.max(a,s.length),0);return"`".repeat(Math.max(3,l+1))}async function it(t,l){let a=await t.getNoteContent({uuid:l});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let s=await t.getNoteAttachments({uuid:l}),i=(Array.isArray(s)?s:[]).map(p=>`- ${p&&p.name} | ${p&&p.type} | ${p&&p.uuid}`).join(`
`),d=hn(a),o=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:o},`# Attachments

${i||"- (none)"}

# ${dn}

${d}
${a}
${d}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),o}async function lt(t,l,a){if(!l)return"";let s=await ce(t,l);if(!s){let d=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(d)&&d.length>0)||!d.some(p=>p&&p.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let i=await t.getNoteContent({uuid:l});return he(i,a,s.uuid)?(await t.alert(`"${s.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${de(a,{attachmentUUID:s.uuid,attachmentName:s.name})}
`}async function pn(t,l,a,s){let i={uuid:l},d=pe(a,t.context.pluginUUID,s);if(d!==null)try{await t.replaceNoteContent(i,d)}catch{}try{await t.replaceNoteContent(i,a)}catch{await t.replaceNoteContent(i,a)}}async function st(t,l){let{noteUUID:a,attachmentUUID:s,page:i,highlightId:d}=re(l);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let o=await t.getNoteContent({uuid:a}),p=Se(o,t.context.pluginUUID,s,{page:i,highlightId:d,collapsed:!1});p!==null&&(t.context&&t.context.noteUUID===a?await pn(t,a,p,s):await t.replaceNoteContent({uuid:a},p))}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function ue(t){if(!t)return null;let l=String(t).trim().toLowerCase();return le.find(a=>a.id===l||a.hex.toLowerCase()===l)||null}function ct(){return ue(se)}function un(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function fe({page:t,color:l,rects:a,quoteText:s,note:i=null,id:d=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let p of a)if(![p.x,p.y,p.width,p.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(p)}`);let o=ue(l)||ct();return{id:d||un(),page:t,color:o.id,rects:a.map(p=>({x:p.x,y:p.y,width:p.width,height:p.height})),quoteText:String(s||""),note:i?String(i):null}}function dt(t,l){let a=l==null?null:String(l).trim();return{...t,note:a||null}}function ht(t,l){let a=ue(l);if(!a)throw new Error(`withColor: unknown color "${l}"`);return{...t,color:a.id}}function pt(t,l){return(t||[]).filter(a=>a.id!==l)}function Te(t,l,a){let s=!1,i=(t||[]).map(d=>d.id!==l?d:(s=!0,a(d)));return s?i:t}var fn="json",ut="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function ft(t){let l=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${ut}
\`\`\`${fn}
${l}
\`\`\``}function Ae(t){if(!t)return null;let l=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!l&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),s=(l?l[1]:a?a[1]:t).trim();if(!s)return null;try{return JSON.parse(s)}catch{return null}}function gn(t){if(!Array.isArray(t))return[];let l=[];for(let a of t)try{l.push(fe(a))}catch{}return l}async function ge(t,l,a){let s=await t.getNoteContent({uuid:l}),i=Ie(s,G),d=Ae(i);return!d||typeof d!="object"?[]:gn(d[a])}async function gt(t,l,a,s){let i={uuid:l},d=await t.getNoteContent(i),o=Ie(d,G),k={...Ae(o)||{},[a]:s},S=ft(k);o===null&&await t.insertNoteContent(i,`

# ${G}

`,{atEnd:!0});let y=vn(d,S);if(y!==null){await t.replaceNoteContent(i,y);return}await t.replaceNoteContent(i,S,{section:{heading:{text:G,level:1}}})}async function mt(t,l,a){let s={uuid:l},i=await t.getNoteContent(s),d=Ie(i,G);if(d===null)return;let o=Ae(d)||{};if(!(a in o))return;let p={...o};delete p[a],await t.replaceNoteContent(s,ft(p),{section:{heading:{text:G,level:1}}})}function ke(t,l){let a=/^#\s+(.*)$/,s=t.findIndex(d=>{let o=d.match(a);return o&&o[1].trim()===l});if(s===-1)return null;let i=t.length;for(let d=s+1;d<t.length;d++)if(/^#\s+/.test(t[d])){i=d;break}return{start:s,end:i}}function Ie(t,l){if(!t)return null;let a=t.split(`
`),s=ke(a,l);return s?a.slice(s.start+1,s.end).join(`
`).trim():null}function mn(t){if(!t)return"";let l=t,a=l.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return a&&(l=l.replace(a[0],"")),l=l.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),l=l.replace(ut,""),l.trim()}function vt(t,l){let a=(t||"").split(`
`),s=ke(a,G);if(!s)return null;let i=a.slice(0,s.start).join(`
`).replace(/\s+$/,""),d=a.slice(s.start).join(`
`);return`${i?i+`

`:""}${l}

${d}`}function vn(t,l){let a=(t||"").split(`
`),s=ke(a,G);if(!s)return null;let i=mn(a.slice(s.start+1,s.end).join(`
`).trim());if(!i)return null;let d=a.slice(0,s.start).join(`
`).replace(/\s+$/,""),o=a.slice(s.end).join(`
`).replace(/^\s+/,"");return`${d?d+`

`:""}${i}

${a[s.start]}

${l}${o?`

`+o:""}`}function q(t,l){return l.noteUUID||t.context.noteUUID}async function wt(t,l,a){try{let s=await t.getNoteAttachments({uuid:l}),i=Array.isArray(s)&&s.find(d=>d&&d.uuid===a);return i?i.name:""}catch{return""}}async function me(t,l,a,s){let i=await ge(t,l,a),d=s(i);return d!==i&&await gt(t,l,a,d),{highlights:d}}function xt(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let l=t.trim();if(!l.startsWith("{"))return{action:l};try{return JSON.parse(l)}catch{return{action:l}}}async function bt(t,l){return JSON.stringify(await wn(t,xt(l)))}async function wn(t,l){let a=xt(l);switch(a.action){case"getPdfUrl":{let s=a.attachmentUUID;if(!s)return{error:"No attachment specified for this viewer."};try{return{url:await et(t,s),name:await wt(t,q(t,a),s)}}catch(i){return{error:`Could not load the PDF: ${i.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await ge(t,q(t,a),a.attachmentUUID)}}catch(s){return{error:`Could not load highlights: ${s.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=fe(a.highlight||{});return await me(t,q(t,a),a.attachmentUUID,i=>i.concat([s]))}catch(s){return{error:`Could not save the highlight: ${s.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await me(t,q(t,a),a.attachmentUUID,s=>Te(s,a.id,i=>ht(i,a.color)))}catch(s){return{error:`Could not change the highlight color: ${s.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await me(t,q(t,a),a.attachmentUUID,s=>Te(s,a.id,i=>dt(i,a.note)))}catch(s){return{error:`Could not save the note: ${s.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await me(t,q(t,a),a.attachmentUUID,s=>pt(s,a.id))}catch(s){return{error:`Could not remove the highlight: ${s.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{let s={uuid:q(t,a)},i=await t.getNoteContent(s),d=vt(i,a.content);return d===null?await t.insertNoteContent(s,`
`+a.content+`
`,{atEnd:!0}):await t.replaceNoteContent(s,d),{ok:!0}}catch(s){return{error:`Could not add this to the note: ${s.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=q(t,a),i=await t.getNoteContent({uuid:s}),d=pe(i,a.pluginUUID,a.attachmentUUID);return d===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:s},d),await mt(t,s,a.attachmentUUID),{ok:!0})}catch(s){return{error:`Could not remove this viewer: ${s.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let s=q(t,a),i=await wt(t,s,a.attachmentUUID);try{let d=await ge(t,s,a.attachmentUUID);return{name:i,count:d.length}}catch{return{name:i,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=q(t,a),i=await t.getNoteContent({uuid:s}),d=rt(i,a.pluginUUID,a.attachmentUUID,a.collapsed);return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:s},d),{ok:!0})}catch(s){return{error:`Could not resize this viewer: ${s.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let s=await t.findNote({name:a.noteName}),i=s?s.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:i},a.content||""),{ok:!0,noteUUID:i}}catch(s){return{error:`Could not export highlights: ${s.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function Pe(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function l(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function a(u,f){var x=Math.pow(10,f===void 0?2:f),b=function(C){return Math.round(C*x)/x};return{x:b(u.x),y:b(u.y),width:b(u.width),height:b(u.height)}}function s(u){return u.width>.01&&u.height>.01}function i(u,f,x){for(var b=String(u??""),C=Math.max(0,f===void 0?0:f),E=Math.min(b.length,x===void 0?b.length:x),T=function(O){return O===""||/\s/.test(O)},A=[],I=C;I<E;){for(;I<E&&T(b.charAt(I));)I++;if(I>=E)break;for(var $=I;I<E&&!T(b.charAt(I));)I++;A.push({start:$,end:I})}return A}function d(u){for(var f=1/0,x=1/0,b=-1/0,C=-1/0,E=0;E<(u?u.length:0);E++){var T=u[E];s(T)&&(f=Math.min(f,T.left),x=Math.min(x,T.top),b=Math.max(b,T.left+T.width),C=Math.max(C,T.top+T.height))}return isFinite(f)?{left:f,top:x,width:b-f,height:C-x}:null}function o(u,f,x){for(var b=[],C=0;C<u.length;C++){var E=t(u[C],f);if(s(E)){var T=x(E.x,E.y),A=x(E.x+E.width,E.y+E.height),I=a(l(T,A));s(I)&&b.push(I)}}return b}function p(u,f){var x=f(u.x,u.y),b=f(u.x+u.width,u.y+u.height);return l(x,b)}function k(u,f,x){var b=f.right-f.left,C=f.bottom-f.top;if(b<=0||C<=0)return null;var E=u.x2-u.x1,T=u.y2-u.y1,A=u.x1+(x.left-f.left)/b*E,I=u.x2-(f.right-x.right)/b*E,$=u.y1+(x.bottom-f.bottom)/C*T,O=u.y2-(f.top-x.top)/C*T;return{x:A,y:$,width:I-A,height:O-$}}function S(u,f){var x=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return x>.5*Math.min(u.height,f.height)}function y(u,f){var x=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var b=u.slice().sort(function(j,J){return J.y-j.y||j.x-J.x}),C=[],E=0;E<b.length;E++){for(var T=!1,A=0;A<C.length;A++)if(S(C[A][0],b[E])){C[A].push(b[E]),T=!0;break}T||C.push([b[E]])}for(var I=[],$=0;$<C.length;$++){for(var O=C[$].slice().sort(function(j,J){return j.x-J.x}),U=null,W=0;W<O.length;W++){var F=O[W];if(U===null){U={x:F.x,y:F.y,width:F.width,height:F.height};continue}var ae=F.x-(U.x+U.width);if(ae<=x*Math.max(U.height,F.height)){var ee=Math.max(U.x+U.width,F.x+F.width),we=Math.max(U.y+U.height,F.y+F.height);U.x=Math.min(U.x,F.x),U.y=Math.min(U.y,F.y),U.width=ee-U.x,U.height=we-U.y}else I.push(U),U={x:F.x,y:F.y,width:F.width,height:F.height}}U!==null&&I.push(U)}return I.map(function(j){return a(j)})}function N(u,f,x,b){var C=b===void 0?0:b;return f>=u.x-C&&f<=u.x+u.width+C&&x>=u.y-C&&x<=u.y+u.height+C}function w(u,f,x,b,C){for(var E=u||[],T=E.length-1;T>=0;T--){var A=E[T];if(!(!A||A.page!==f||!A.rects)){for(var I=0;I<A.rects.length;I++)if(N(A.rects[I],x,b,C===void 0?1:C))return A}}return null}function v(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:l,roundRect:a,isVisibleRect:s,textTokenRanges:i,unionClientRects:d,clientRectsToPdfRects:o,pdfRectToViewportRect:p,itemRelativeRect:k,mergeLineRects:y,rectContainsPoint:N,hitTestHighlights:w,normalizeQuoteText:v}}var B=Pe(),Kn=B.clientRectToLocal,Zn=B.rectFromCorners,eo=B.roundRect,to=B.isVisibleRect,no=B.textTokenRanges,oo=B.unionClientRects,ro=B.clientRectsToPdfRects,ao=B.pdfRectToViewportRect,io=B.itemRelativeRect,lo=B.mergeLineRects,so=B.rectContainsPoint,co=B.hitTestHighlights,ho=B.normalizeQuoteText;function De(){var t=[.957,.871,.424];function l(d,o,p,k,S){var y=o.context.register(o.context.obj({Type:d.PDFName.of("ExtGState"),BM:d.PDFName.of("Multiply"),ca:d.PDFNumber.of(.4)})),N=[d.pushGraphicsState(),d.setGraphicsState("GS0")];N.push(d.setFillingColor(d.rgb(k[0],k[1],k[2])));for(var w=0;w<p.length;w++){var v=p[w];N.push(d.moveTo(v.x,v.y)),N.push(d.lineTo(v.x,v.y+v.height)),N.push(d.lineTo(v.x+v.width,v.y+v.height)),N.push(d.lineTo(v.x+v.width,v.y)),N.push(d.closePath())}N.push(d.fill()),N.push(d.popGraphicsState());var u=o.context.formXObject(N,{BBox:S,Resources:{ExtGState:{GS0:y}}});return o.context.register(u)}function a(d,o,p,k){for(var S=p.rects,y=[],N=S[0].x,w=S[0].y,v=S[0].x+S[0].width,u=S[0].y+S[0].height,f=0;f<S.length;f++){var x=S[f],b=x.x,C=x.x+x.width,E=x.y,T=x.y+x.height;y.push(b,T,C,T,b,E,C,E),N=Math.min(N,b),w=Math.min(w,E),v=Math.max(v,C),u=Math.max(u,T)}var A=o.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Highlight"),Rect:o.context.obj([N,w,v,u]),QuadPoints:o.context.obj(y),C:o.context.obj(k),F:d.PDFNumber.of(4),T:d.PDFString.of("PDF Annotator"),M:d.PDFString.of(new Date().toISOString()),CA:d.PDFNumber.of(.4)});p.note&&A.set(d.PDFName.of("Contents"),d.PDFString.of(p.note));var I=l(d,o,S,k,[N,w,v,u]);A.set(d.PDFName.of("AP"),o.context.obj({N:I}));var $=o.context.register(A),O=[$];if(p.note){var U=o.context.register(o.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Popup"),Rect:o.context.obj([v+8,w-60,v+208,w+12]),Parent:$,Open:!1}));A.set(d.PDFName.of("Popup"),U),O.push(U)}return O}function s(d,o,p){var k=o.node.get(d.PDFName.of("Annots"));if(k instanceof d.PDFArray)for(var S=0;S<p.length;S++)k.push(p[S]);else o.node.set(d.PDFName.of("Annots"),o.doc.context.obj(p))}async function i(d,o,p,k){for(var S=await d.PDFDocument.load(o),y=S.getPages(),N=p||[],w=0;w<N.length;w++){var v=N[w];if(!(!v||!v.rects||!v.rects.length)){var u=y[v.page-1];if(u){var f=k&&k[v.color]||t,x=a(d,S,v,f);s(d,u,x)}}}return S.save()}return{writeHighlightsIntoPdf:i,buildHighlightAnnotation:a,appendAnnotationRefs:s}}var He=De(),uo=He.writeHighlightsIntoPdf,fo=He.buildHighlightAnnotation,go=He.appendAnnotationRefs;function Ue(){function t(y){return String(y??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function l(y,N,w,v,u){var f=new URLSearchParams;N&&f.set("att",N),Number.isFinite(w)&&w>=1&&f.set("page",String(Math.floor(w))),v&&f.set("hl",v),u&&f.set("note",u);var x=f.toString();return"plugin://"+y+(x?"?"+x:"")}function a(y,N){return String(y??"").split(/\r?\n/).map(function(w){return(N+" "+w).replace(/[ \t]+$/,"")})}function s(y,N,w){return N==null?y:"<mark"+(w?' style="background-color:'+w+';"':"")+">"+y+'<!-- {"backgroundCycleColor":"'+N+'"} --></mark>'}function i(y,N,w,v,u,f,x){var b=l(N,w,v.page,v.id,x),C=s(t(y||"PDF"),u,f),E="["+C+"]("+b+")",T=[E].concat(a(v.quoteText,"> >"));return v.note&&(T.push(">"),T=T.concat(a(v.note,">"))),T.join(`
`)}function d(y){return String(y??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(y){return"<p>"+d(y).replace(/\r?\n/g,"<br>")+"</p>"}function p(y,N,w,v,u,f,x){var b=l(N,w,v.page,v.id,x),C=d(y||"PDF"),E=f?'<mark style="background-color: '+d(f)+';">'+C+"</mark>":C,T='<p><a href="'+d(b)+'">'+E+"</a></p>",A="<blockquote><blockquote>"+o(v.quoteText)+"</blockquote></blockquote>",I=v.note?"<blockquote>"+o(v.note)+"</blockquote>":"";return T+A+I}function k(y){return y.slice().sort(function(N,w){if(N.page!==w.page)return N.page-w.page;var v=N.rects&&N.rects[0]?N.rects[0].y:0,u=w.rects&&w.rects[0]?w.rects[0].y:0;return u-v})}function S(y,N,w,v,u,f,x){var b=f&&f.length?f:null,C=(v||[]).filter(function(A){return A&&(!b||b.indexOf(A.color)!==-1)}),E=k(C),T=E.map(function(A){var I=u&&u[A.color]||{};return i(y,N,w,A,I.cycleIndex,I.hex,x)});return T.join(`

`)}return{buildDeepLink:l,buildHighlightBlock:i,buildHighlightHtml:p,buildExportAllContent:S}}var ve=Ue(),vo=ve.buildDeepLink,wo=ve.buildHighlightBlock,xo=ve.buildHighlightHtml,bo=ve.buildExportAllContent;function yt(){var t=window.__PDFA_CONFIG||{},l=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},s=window.__PDFA_EXPORT||{},i={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function d(e){e&&(o.attachmentName=e,i.name&&(i.name.textContent=e),i.collapsedName&&(i.collapsedName.textContent=e))}var o={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function p(e,n){i.status.textContent=e||"",i.status.style.display=e?"block":"none",i.status.className=n?"pdfa-status pdfa-error":"pdfa-status"}function k(e){var n=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(r,c){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(n)))}catch(h){c(h)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function S(){return t.colors||[]}function y(e){for(var n=S(),r=0;r<n.length;r++)if(n[r].id===e)return n[r].hex;return n.length?n[0].hex:"#F4DE6C"}function N(e){for(var n=0;n<o.highlights.length;n++)if(o.highlights[n].id===e)return o.highlights[n];return null}function w(e,n,r){var c=document.createElement("button");return c.className="pdfa-btn"+(n?" "+n:""),c.textContent=e,c.onclick=function(h){h.stopPropagation(),r()},c}function v(e,n,r,c){var h=document.createElement("button");return h.className="pdfa-color",h.dataset.color=e.id,h.style.background=e.hex,h.title=c+" "+e.label,h.setAttribute("aria-label",c+" "+e.label),h.setAttribute("aria-pressed",String(!!n)),h.onclick=function(m){m.stopPropagation(),r(e.id)},h}function u(){for(var e=S(),n=0;n<e.length;n++)i.colors.appendChild(v(e[n],e[n].id===o.activeColorId,function(r){o.activeColorId=r,f(),o.pendingSelection&&Le(o.pendingSelection,r)},"Highlight"))}function f(){for(var e=i.colors.querySelectorAll(".pdfa-color"),n=0;n<e.length;n++)e[n].setAttribute("aria-pressed",String(e[n].dataset.color===o.activeColorId))}function x(){for(var e=[],n=1;n<=o.pageCount;n++)(function(r){e.push(o.doc.getPage(r).then(function(c){o.viewports[r]=c.getViewport({scale:o.scale})}))})(n);return Promise.all(e)}function b(e){var n=o.viewports[e],r=document.createElement("div");return r.className="pdfa-page",r.dataset.page=String(e),r.style.width=n.width+"px",r.style.height=n.height+"px",r}function C(e,n){if(o.rendered[n]||o.renderingPage[n])return Promise.resolve();o.renderingPage[n]=!0;var r=o.viewports[n],c=document.createElement("canvas"),h=window.devicePixelRatio||1;c.width=Math.floor(r.width*h),c.height=Math.floor(r.height*h),c.style.width=r.width+"px",c.style.height=r.height+"px",e.appendChild(c);var m=document.createElement("div");m.className="pdfa-highlights",e.appendChild(m);var g=document.createElement("div");g.className="textLayer",g.style.width=r.width+"px",g.style.height=r.height+"px",g.style.setProperty("--scale-factor",String(o.scale)),e.appendChild(g);var P=c.getContext("2d");P.scale(h,h);var R=null;return o.doc.getPage(n).then(function(H){return R=H,H.render({canvasContext:P,viewport:r}).promise}).then(function(){return R.getTextContent()}).then(function(H){var D=[];return window.pdfjsLib.renderTextLayer({textContent:H,container:g,viewport:r,textDivs:D}).promise.then(function(){o.textSpans+=D.length;for(var L=0;L<D.length;L++)D[L].__pdfaItem=H.items[L];o.rendered[n]=!0,o.renderingPage[n]=!1,$(n),T()})}).catch(function(H){o.renderingPage[n]=!1,p("Failed to render page "+n+": "+(H.message||H),!0)})}function E(){var e=Y();if(!e||!o.doc)return Promise.resolve();for(var n=e.getBoundingClientRect(),r=e.clientHeight,c=i.pages.querySelectorAll(".pdfa-page"),h=[],m=0;m<c.length;m++){var g=c[m],P=Number(g.dataset.page);if(!(o.rendered[P]||o.renderingPage[P])){var R=g.getBoundingClientRect(),H=R.top-n.top,D=R.bottom-n.top;D<-r||H>e.clientHeight+r||h.push(C(g,P))}}return Promise.all(h)}function T(){var e=0;for(var n in o.rendered)o.rendered[n]&&e++;if(e){var r=o.textSpans===0;p(r?"No selectable text found - this PDF may be a scan.":"",r)}}function A(){if(o.rendering)return Promise.resolve();o.rendering=!0,M(!0),p("Rendering...");var e=Y(),n=e?e.scrollHeight-e.clientHeight:0,r=n>0?e.scrollTop/n:0;return i.pages.innerHTML="",o.viewports={},o.rendered={},o.renderingPage={},o.textSpans=0,x().then(function(){for(var c=1;c<=o.pageCount;c++)i.pages.appendChild(b(c));if(e){var h=e.scrollHeight-e.clientHeight;e.scrollTop=r*(h>0?h:0)}o.rendering=!1,te(),ne(),E()}).catch(function(c){o.rendering=!1,p("Failed to render: "+(c.message||c),!0)})}function I(e){return function(n,r){return e.convertToViewportPoint(n,r)}}function $(e){for(var n=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",r=i.pages.querySelectorAll(n),c=0;c<r.length;c++){var h=r[c],m=Number(h.dataset.page),g=h.querySelector(".pdfa-highlights"),P=o.viewports[m];if(!(!g||!P)){g.innerHTML="";for(var R=I(P),H=0;H<o.highlights.length;H++){var D=o.highlights[H];if(!(!D||D.page!==m||!D.rects||!D.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=D.id||"";for(var V=0;V<D.rects.length;V++){var K=l.pdfRectToViewportRect(D.rects[V],R),_=document.createElement("div");_.className="pdfa-hl",_.style.left=K.x+"px",_.style.top=K.y+"px",_.style.width=K.width+"px",_.style.height=K.height+"px",_.style.background=y(D.color),L.appendChild(_)}g.appendChild(L)}}}}}function O(){$(),W(),i.count.textContent=String(o.highlights.length)}function U(){return o.highlights.slice().sort(function(e,n){return e.page!==n.page?e.page-n.page:(n.rects[0]?n.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function W(){i.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var n=document.createElement("span");n.textContent="Highlights",e.appendChild(n),e.appendChild(w("Close","",function(){ae(!1)})),i.panel.appendChild(e);var r=U();if(!r.length){var c=document.createElement("div");c.className="pdfa-panel-empty",c.textContent="No highlights yet. Select some text in the PDF and pick a color.",i.panel.appendChild(c);return}for(var h=0;h<r.length;h++)i.panel.appendChild(F(r[h]))}function F(e){var n=document.createElement("div");n.className="pdfa-hl-row",n.dataset.id=e.id||"",n.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=y(e.color),n.appendChild(r);var c=document.createElement("div"),h=document.createElement("div");h.className="pdfa-hl-page",h.textContent="Page "+e.page,c.appendChild(h);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,c.appendChild(m),e.note){var g=document.createElement("div");g.className="pdfa-hl-note",g.textContent=e.note,c.appendChild(g)}return n.appendChild(c),n.onclick=function(){$e(e)},n}function ae(e){var n=e===void 0?!i.panel.classList.contains("pdfa-open"):e;i.panel.classList.toggle("pdfa-open",n),i.listToggle.setAttribute("aria-pressed",String(n)),n&&W(),ne()}function ee(e){for(var n=e&&e.nodeType===1?e:e&&e.parentElement;n;){if(n.classList&&n.classList.contains("textLayer"))return n;n=n.parentElement}return null}function we(e,n){for(var r=[],c=[],h=null,m=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),g;g=m.nextNode();)if(e.intersectsNode(g)){var P=g.nodeValue||"",R=g===e.startContainer?e.startOffset:0,H=g===e.endContainer?e.endOffset:P.length,D=g.parentElement,L=D&&D.__pdfaItem;if(L)for(var V={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},K=D.getBoundingClientRect(),_=l.textTokenRanges(P,R,H),Z=0;Z<_.length;Z++){var Ee=document.createRange();Ee.setStart(g,_[Z].start),Ee.setEnd(g,_[Z].end);var z=l.unionClientRects(Ee.getClientRects());if(z){var Je={left:z.left,top:z.top,width:z.width,height:z.height,right:z.left+z.width,bottom:z.top+z.height},Xe=l.itemRelativeRect(V,K,Je);Xe&&(r.push(Xe),c.push(P.slice(_[Z].start,_[Z].end)),h=Je)}}}return{rects:r,text:c.join(" "),lastCssRect:h}}function j(e){if(o.pendingSelection=e,o.lastCapturedText=e&&e.rawText||"",!e){i.hint.textContent="",i.hint.style.display="none";return}i.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",i.hint.style.display="inline"}function J(e){if(!o.noteEditing){var n=window.getSelection();if(!n||n.isCollapsed||n.rangeCount===0){j(null),M();return}var r=n.getRangeAt(0),c=ee(r.startContainer);if(!c)return j(null);var h=c.parentElement;if(!h||!h.dataset||!h.dataset.page)return j(null);var m=Number(h.dataset.page);if(!o.rendered[m])return j(null);var g=ee(r.endContainer)!==c,P=we(r,c),R=l.mergeLineRects(P.rects);if(!R.length)return j(null);var H=P.lastCssRect||h.getBoundingClientRect(),D=e&&e.clientX?e.clientX:H.left+H.width/2,L=e&&e.clientY?e.clientY:H.top+H.height,V={page:m,rects:R,quoteText:l.normalizeQuoteText(P.text),spilled:g,anchorX:D,anchorY:L,rawText:String(n)};j(V),kt(V)}}var Nt=300,X=null;function St(){o.noteEditing||(X&&clearTimeout(X),X=setTimeout(Re,Nt))}function Re(){if(X=null,!o.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||ee(e.getRangeAt(0).startContainer)&&String(e)!==o.lastCapturedText&&J(null)}}function ie(e,n){var r=o.highlights;return o.highlights=e,O(),k(n).then(function(c){if(!c||c.error)throw new Error(c&&c.error||"The plugin did not confirm the change.");return o.highlights=c.highlights||e,O(),p(""),!0}).catch(function(c){return o.highlights=r,O(),p(c.message||String(c),!0),!1})}function Le(e,n){var r={id:null,page:e.page,color:n,rects:e.rects,quoteText:e.quoteText,note:null},c=e.anchorX,h=e.anchorY;j(null),M(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),ie(o.highlights.concat([r]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:r}).then(function(g){if(g){var P=o.highlights[o.highlights.length-1];P&&P.id&&be(P,c,h,!0)}})}function Tt(e,n){M(!0),ie(o.highlights.map(function(r){return r.id===e?Object.assign({},r,{color:n}):r}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:n})}function At(e){M(!0),ie(o.highlights.filter(function(n){return n.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function xe(e,n){var r=String(n??"").trim();o.noteEditing=null,M(!0),ie(o.highlights.map(function(c){return c.id===e?Object.assign({},c,{note:r||null}):c}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:r})}function Q(e,n,r,c){i.popover.innerHTML="",i.popover.classList.toggle("pdfa-editing",c==="editing"),i.popover.classList.toggle("pdfa-exporting",c==="exporting"),i.popover.classList.toggle("pdfa-menu",c==="menu");for(var h=0;h<e.length;h++)i.popover.appendChild(e[h]);i.popover.classList.add("pdfa-open");var m=i.popover.offsetWidth,g=i.popover.offsetHeight,P=Math.max(4,Math.min(n-m/2,window.innerWidth-m-4)),R=r+12;R+g>window.innerHeight-4&&(R=Math.max(4,r-g-12)),i.popover.style.left=P+"px",i.popover.style.top=R+"px"}function M(e){o.noteEditing&&!e||(o.noteEditing=null,i.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),i.popover.innerHTML="")}function kt(e){for(var n=S(),r=[],c=0;c<n.length;c++)r.push(v(n[c],n[c].id===o.activeColorId,function(h){o.activeColorId=h,f(),Le(e,h)},"Highlight"));Q(r,e.anchorX,e.anchorY)}function be(e,n,r,c){for(var h=S(),m=[],g=0;g<h.length;g++)m.push(v(h[g],h[g].id===e.color,function(R){Tt(e.id,R)},"Change to"));var P=!!e.note;m.push(w(P?"Edit note":"Add note",c&&!P?"pdfa-btn-primary":"",function(){Pt(e,n,r)})),m.push(w("Copy","",function(){qt(e)})),m.push(w("Send to note","",function(){zt(e)})),m.push(w("Remove","pdfa-remove",function(){At(e.id)})),Q(m,n,r)}function It(e,n){for(var r=S(),c={},h=0;h<r.length;h++)c[r[h].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var g=document.createElement("div");g.className="pdfa-export-colors";for(var P=0;P<r.length;P++)(function(H){var D=v(H,!0,function(L){c[L]=!c[L],D.setAttribute("aria-pressed",String(c[L]))},"Toggle");g.appendChild(D)})(r[P]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(w("Create / update note","pdfa-btn-primary",function(){for(var H=[],D=0;D<r.length;D++)c[r[D].id]&&H.push(r[D].id);Gt(H.length===r.length?null:H)})),Q([m,g,R],e,n,"exporting")}function Pt(e,n,r){o.noteEditing=e.id;var c=document.createElement("textarea");c.className="pdfa-note-input",c.rows=3,c.value=e.note||"",c.placeholder="Note for this highlight";var h=document.createElement("div");h.className="pdfa-note-actions",e.note&&h.appendChild(w("Delete note","",function(){xe(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",h.appendChild(m),h.appendChild(w("Cancel","",function(){Me(e,n,r)})),h.appendChild(w("Save","pdfa-btn-primary",function(){xe(e.id,c.value)})),c.onkeydown=function(g){g.key==="Enter"&&(g.ctrlKey||g.metaKey)?(g.preventDefault(),g.stopPropagation(),xe(e.id,c.value)):g.key==="Escape"&&(g.preventDefault(),g.stopPropagation(),Me(e,n,r))},Q([c,h],n,r,"editing"),c.focus(),c.setSelectionRange(c.value.length,c.value.length)}function Me(e,n,r){o.noteEditing=null;var c=N(e.id)||e;be(c,n,r)}function Dt(e){if(!o.noteEditing){var n=window.getSelection();if(!(n&&!n.isCollapsed)){for(var r=e.target,c=null;r&&r!==i.pages;){if(r.classList&&r.classList.contains("pdfa-page")){c=r;break}r=r.parentElement}if(!c)return M();var h=Number(c.dataset.page),m=o.viewports[h];if(!m)return M();var g=c.getBoundingClientRect(),P=m.convertToPdfPoint(e.clientX-g.left,e.clientY-g.top),R=l.hitTestHighlights(o.highlights,h,P[0],P[1],1);R&&R.id?be(R,e.clientX,e.clientY):M()}}}function te(){i.pageLabel.textContent=o.current+" / "+o.pageCount,i.zoomLabel.textContent=Math.round(o.scale*100)+"%"}function Y(){return i.root.querySelector(".pdfa-scroll")}function Fe(){return i.panel&&i.panel.classList.contains("pdfa-open")?i.panel:Y()}function Oe(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e+'"]');n&&C(n,e)}function ye(e){var n=Math.min(Math.max(1,e),o.pageCount),r=i.pages.querySelector('.pdfa-page[data-page="'+n+'"]');Oe(n);var c=Y();r&&c&&(c.scrollTop+=r.getBoundingClientRect().top-c.getBoundingClientRect().top),E(),o.current=n,te()}function $e(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),r=o.viewports[e.page];if(!(!n||!r||!e.rects||!e.rects.length)){var c=l.pdfRectToViewportRect(e.rects[0],I(r)),h=Y(),m=n.getBoundingClientRect().top+c.y;h.scrollTop+=m-h.getBoundingClientRect().top-h.clientHeight/3,Oe(e.page),E(),o.current=e.page,te()}}function Ht(){try{i.root.setAttribute("tabindex","-1"),i.root.focus(),i.root.scrollIntoView&&i.root.scrollIntoView({block:"nearest"})}catch{}}function Ut(e){if(!(!e||!e.id)){var n=i.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');n&&(n.classList.add("pdfa-hl-flash"),setTimeout(function(){n.classList.remove("pdfa-hl-flash")},2600))}}function je(e){return o.scale=Math.min(Math.max(.4,e),4),A()}function Rt(){return o.doc?o.doc.getPage(1).then(function(e){var n=Y();if(n){var r=window.getComputedStyle(n),c=n.clientWidth-(parseFloat(r.paddingLeft)||0)-(parseFloat(r.paddingRight)||0),h=e.getViewport({scale:1}).width;if(!(!(c>0)||!(h>0))){var m=Math.max(.4,c/h);m<o.scale&&(o.scale=m,te())}}}).catch(function(){}):Promise.resolve()}function _e(e){var n=Fe();n&&(n.scrollTop+=e*Math.max(80,n.clientHeight*.85),ne(),E())}function Be(e,n){var r=null,c=null,h=!1,m=function(){r&&clearTimeout(r),c&&clearInterval(c),r=c=null};e.addEventListener("pointerdown",function(){m(),h=!1,r=setTimeout(function(){h=!0,c=setInterval(function(){if(e.disabled)return m();_e(n*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(g){e.addEventListener(g,m)}),e.onclick=function(){if(h){h=!1;return}_e(n)}}function ne(){var e=Fe();if(!(!e||!i.scrollUp)){var n=e.scrollHeight-e.clientHeight;i.scrollUp.disabled=e.scrollTop<=1,i.scrollDown.disabled=e.scrollTop>=n-1}}function Lt(){ne(),E(),M();for(var e=i.pages.querySelectorAll(".pdfa-page"),n=o.current,r=1/0,c=0;c<e.length;c++){var h=Math.abs(e[c].getBoundingClientRect().top-60);h<r&&(r=h,n=Number(e[c].dataset.page))}n!==o.current&&(o.current=n,te())}function Mt(){return new Promise(function(e,n){if(window.pdfjsLib)return e(window.pdfjsLib);var r=document.createElement("script");r.src=t.pdfJsSrc,r.onload=function(){window.pdfjsLib?e(window.pdfjsLib):n(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){n(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function Ft(){return new Promise(function(e,n){if(window.PDFLib)return e(window.PDFLib);var r=document.createElement("script");r.src=t.pdfLibSrc,r.onload=function(){window.PDFLib?e(window.PDFLib):n(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){n(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function Ot(){for(var e={},n=S(),r=0;r<n.length;r++)n[r].rgb&&(e[n[r].id]=n[r].rgb);return e}function $t(){var e=(o.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Ce(){for(var e={},n=S(),r=0;r<n.length;r++)e[n[r].id]={cycleIndex:n[r].cycleIndex,hex:n[r].hex};return e}function qe(){var e=(o.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function ze(e){var n=Ce()[e.color]||{};return s.buildHighlightBlock(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,n.cycleIndex,n.hex,t.noteUUID)}function jt(e){if(!s.buildHighlightHtml)return null;var n=Ce()[e.color]||{};return s.buildHighlightHtml(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,n.cycleIndex,n.hex,t.noteUUID)}function _t(e,n){var r=function(m){var g=m.clipboardData||window.clipboardData;g&&(g.setData("text/plain",e),n&&g.setData("text/html",n),m.preventDefault())},c=document.createElement("textarea");c.value=e,c.style.position="fixed",c.style.left="-9999px",document.body.appendChild(c),c.focus(),c.select(),document.addEventListener("copy",r,!0);var h=!1;try{h=document.execCommand("copy")}catch{h=!1}return document.removeEventListener("copy",r,!0),document.body.removeChild(c),h}function Bt(e,n){var r=function(){return!navigator.clipboard||!navigator.clipboard.writeText?c():navigator.clipboard.writeText(e).then(function(){return"plain"},c)},c=function(){return _t(e,n)?Promise.resolve(n?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(n&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var h=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([n],{type:"text/html"})});return navigator.clipboard.write([h]).then(function(){return"rich"},r)}catch{return r()}return r()}function qt(e){M(!0);var n,r;try{n=ze(e),r=jt(e)}catch(c){p("Could not build the copy: "+(c.message||c),!0);return}Bt(n,r).then(function(c){p(c==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(c){p("Could not copy: "+(c.message||c),!0)})}function zt(e){M(!0),k({action:"sendToNote",content:ze(e)}).then(function(n){if(!n||n.error)throw new Error(n&&n.error||"Could not send this to the note.");p("Added to this note, below the text.")}).catch(function(n){p(n.message||String(n),!0)})}function Gt(e){M(!0);var n=s.buildExportAllContent(o.attachmentName,t.pluginUUID,t.attachmentUUID,o.highlights,Ce(),e,t.noteUUID);if(!n){p(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}k({action:"exportAll",noteName:qe(),content:n}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");p('Exported to "'+qe()+'".')}).catch(function(r){p(r.message||String(r),!0)})}function Vt(e,n){var r=document.createElement("div");r.className="pdfa-menu-name",r.textContent=o.attachmentName||"PDF Annotator",r.title=r.textContent;var c=[r];c.push(w("Collapse","",function(){M(!0),Kt()}),w("Download","",function(){M(!0),Xt()}),w("Export...","",function(){It(e,n)}),w("Remove viewer...","pdfa-remove",function(){Wt(e,n)})),Q(c,e,n,"menu")}function Wt(e,n){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var c=document.createElement("div");c.className="pdfa-note-actions",c.appendChild(w("Cancel","",function(){M(!0)}));var h=document.createElement("span");h.className="pdfa-spacer",c.appendChild(h),c.appendChild(w("Remove","pdfa-remove",Jt)),Q([r,c],e,n,"exporting")}function Jt(){M(!0),p("Removing this viewer..."),k({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){p(e.message||String(e),!0)})}function Xt(){o.pdfBytes&&(p("Preparing the download..."),Ft().then(function(e){return a.writeHighlightsIntoPdf(e,o.pdfBytes,o.highlights,Ot())}).then(function(e){return Yt(e,$t())}).catch(function(e){p("Could not prepare the download: "+(e.message||e),!0)}))}function Yt(e,n){var r=new Blob([e],{type:"application/pdf"}),c=null;try{c=new File([r],n,{type:"application/pdf"})}catch{}return c&&navigator.share&&navigator.canShare&&navigator.canShare({files:[c]})?navigator.share({files:[c],title:n}).then(function(){p("")}).catch(function(h){return h&&h.name==="AbortError"?p(""):Ge(r,n)}):Ge(r,n)}function Ge(e,n){var r=URL.createObjectURL(e),c=document.createElement("a");c.href=r,c.download=n,document.body.appendChild(c),c.click(),c.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3);var h=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return p(h?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function Qt(){return k({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");o.highlights=e.highlights||[]}).catch(function(e){o.highlights=[],p("Could not load saved highlights: "+(e.message||e),!0)})}function Kt(){var e=o.highlights.length;i.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",i.root.classList.add("pdfa-collapsed-mode"),Ve(!0)}function Ve(e){k({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Zt(){i.root.classList.remove("pdfa-collapsed-mode"),o.doc||We(),Ve(!1)}function We(){p("Loading PDF..."),(t.highlightId||t.page)&&Ht(),Mt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,k({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return d(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return o.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return o.doc=e,o.pageCount=e.numPages,Qt()}).then(function(){return Rt()}).then(function(){return A()}).then(function(){O();var e=t.highlightId?N(t.highlightId):null;e?($e(e),Ut(e)):t.page&&ye(t.page)}).catch(function(e){p(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ye(o.current-1)},document.getElementById("pdfa-next").onclick=function(){ye(o.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){je(o.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){je(o.scale-.25)},Be(i.scrollUp,-1),Be(i.scrollDown,1),i.listToggle.onclick=function(){ae()},i.more.onclick=function(e){Vt(e.clientX,e.clientY)},Y().addEventListener("scroll",Lt),i.panel.addEventListener("scroll",ne),i.pages.addEventListener("mouseup",J),i.pages.addEventListener("click",Dt),document.addEventListener("selectionchange",St),i.pages.addEventListener("touchend",function(){X&&clearTimeout(X),X=null,Re()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!o.noteEditing&&M()}),document.addEventListener("mousedown",function(e){i.popover.classList.contains("pdfa-open")&&(i.popover.contains(e.target)||M())}),u(),W(),i.root.querySelector(".pdfa-collapsed").onclick=Zt,t.collapsed?k({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){d(e.name);var n=e.count||0;i.collapsedCount.textContent=n?n+(n===1?" highlight":" highlights"):""}}).catch(function(){}):We()}catch(e){p("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function xn(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function bn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var yn=`
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
  .pdfa-toolbar { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: var(--pdfa-toolbar); flex: 0 0 auto; flex-wrap: wrap; }
  .pdfa-toolbar button { font: inherit; padding: 4px 9px; border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); color: inherit; border-radius: 5px; cursor: pointer; line-height: 1.2; }
  .pdfa-toolbar button:hover { background: var(--pdfa-btn-hover); }
  .pdfa-toolbar button:disabled { opacity: .5; cursor: default; }
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
  .pdfa-popover.pdfa-menu .pdfa-menu-name { font-size: 11px; opacity: .6; padding: 2px 8px 5px;
    margin-bottom: 2px; border-bottom: 1px solid var(--pdfa-border);
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
  .pdfa-color[aria-pressed="true"], .pdfa-toolbar .pdfa-color[aria-pressed="true"] {
    box-shadow: 0 0 0 2px var(--pdfa-toolbar), 0 0 0 4px var(--pdfa-accent); }
  .pdfa-hint { display: none; opacity: .75; font-size: 12px; white-space: nowrap; }

  /* Remove / recolor actions for an existing highlight. Positioned "fixed" because the
     embed is its own iframe, so a click's client coordinates are already relative to
     this element's containing block - no scroll-offset arithmetic to get wrong. */
  .pdfa-popover { position: fixed; display: none; gap: 5px; align-items: center; padding: 6px 8px;
    z-index: 20; background: var(--pdfa-toolbar); color: var(--pdfa-fg); max-width: 320px; flex-wrap: wrap;
    border: 1px solid var(--pdfa-border); border-radius: 8px; box-shadow: 0 3px 12px rgba(0,0,0,.3); }
  .pdfa-popover.pdfa-open { display: flex; }
  /* The note editor turns the popover into a small column form. */
  .pdfa-popover.pdfa-editing { flex-direction: column; align-items: stretch; width: 274px; }
  /* Export all's color filter: independently-toggled swatches, not the single-select
     behaviour the same .pdfa-color class has everywhere else - the filter is "any
     combination of colors", not "one active color". */
  .pdfa-popover.pdfa-exporting { flex-direction: column; align-items: stretch; width: 220px; }
  /* The toolbar overflow menu (Download / Export / Remove) - a plain vertical stack of
     full-width buttons, left-aligned text rather than the centered .pdfa-btn default, so
     it reads as a menu rather than a row of action buttons. */
  .pdfa-popover.pdfa-menu { flex-direction: column; align-items: stretch; width: 200px; gap: 2px; }
  .pdfa-popover.pdfa-menu .pdfa-btn { text-align: left; border-color: transparent; background: transparent; }
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
`,Ct={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function Et({attachmentUUID:t,attachmentName:l="",page:a=null,highlightId:s=null,lightDarkMode:i="light",pluginUUID:d=null,noteUUID:o=null,collapsed:p=!1}={}){let k=Ct[i]||Ct.light,S={attachmentUUID:t,page:a,highlightId:s,pluginUUID:d,noteUUID:o,pdfJsSrc:oe.pdfJs,workerSrc:oe.pdfJsWorker,pdfLibSrc:oe.pdfLib,colors:le.map(y=>({id:y.id,label:y.label,hex:y.hex,rgb:y.rgb,cycleIndex:y.cycleIndex})),defaultColorId:se,collapsed:p,attachmentName:l};return`<link rel="stylesheet" href="${oe.pdfViewerCss}">
<style>:root{${k}}${yn}</style>
<div id="pdfa-root"${p?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${xn(l)}</span>
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
<script>window.__PDFA_CONFIG = ${bn(S)};
window.__PDFA_GEOM = (${Pe.toString()})();
window.__PDFA_ANNOTATIONS = (${De.toString()})();
window.__PDFA_EXPORT = (${Ue.toString()})();<\/script>
<script>(${yt.toString()})();<\/script>`}var Cn={noteOption:{"Annotate PDF":async function(t,l){return at(t,l,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,l){return it(t,l)}},insertText:async function(t){return lt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...l){return st(t,l[0])},renderEmbed:function(t,...l){let{attachmentUUID:a,page:s,highlightId:i,collapsed:d,attachmentName:o}=re(l[0]);return a?Et({attachmentUUID:a,page:s,highlightId:i,collapsed:d,attachmentName:o,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...l){return bt(t,l[0])}},En=Cn;return an(Nn);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
