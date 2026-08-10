(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Ne=Object.defineProperty;var en=Object.getOwnPropertyDescriptor;var tn=Object.getOwnPropertyNames;var nn=Object.prototype.hasOwnProperty;var on=(t,s)=>{for(var r in s)Ne(t,r,{get:s[r],enumerable:!0})},an=(t,s,r,c)=>{if(s&&typeof s=="object"||typeof s=="function")for(let i of tn(s))!nn.call(t,i)&&i!==r&&Ne(t,i,{get:()=>s[i],enumerable:!(c=en(s,i))||c.enumerable});return t};var rn=t=>an(Ne({},"__esModule",{value:!0}),t);var Nn={};on(Nn,{default:()=>En});var le=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],se="yellow",G="PDF Annotator data",Ye="attachment://",Qe=1,Ke=16,oe={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},ln="https://plugins.amplenote.com/cors-proxy";function Ze(t){let s=new URL(ln);return s.searchParams.set("apiurl",t),s.toString()}var sn="application/pdf";function cn(t){return Array.isArray(t)?t.filter(s=>s&&s.type===sn&&s.uuid):[]}async function ce(t,s){let r=await t.getNoteAttachments({uuid:s}),c=cn(r);if(c.length===0)return null;if(c.length===1)return c[0];let i=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:c.map(a=>({label:a.name,value:a.uuid})),value:c[0].uuid}]});if(i==null)return null;let d=Array.isArray(i)?i[0]:i;return c.find(a=>a.uuid===d)||null}async function et(t,s){if(!s)throw new Error("fetchableAttachmentURL: attachmentUUID required");let r=await t.getAttachmentURL(s);if(!r)throw new Error(`No URL returned for attachment ${s}`);return Ze(r)}function tt(t){return t?Ke:Qe}function ae(t){let s={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return s;let r;try{r=new URLSearchParams(t.replace(/^\?/,""))}catch{return s}let c=d=>{let a=r.get(d);if(a===null||a.trim()==="")return null;let p=Number(a);return Number.isFinite(p)?p:null},i=c("page");return{attachmentUUID:r.get("att")||null,page:i!==null&&i>=1?Math.floor(i):null,x:c("x"),y:c("y"),highlightId:r.get("hl")||null,noteUUID:r.get("note")||null,collapsed:r.get("c")==="1",attachmentName:r.get("n")||""}}function nt({attachmentUUID:t,page:s,x:r,y:c,highlightId:i,collapsed:d,attachmentName:a}={}){let p=new URLSearchParams;return t&&p.set("att",t),d&&p.set("c","1"),a&&p.set("n",a),Number.isFinite(s)&&s>=1&&p.set("page",String(Math.floor(s))),Number.isFinite(r)&&p.set("x",String(r)),Number.isFinite(c)&&p.set("y",String(c)),i&&p.set("hl",i),p.toString()}function de(t,s={},r=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");r===null&&(r=tt(s.collapsed));let c=nt(s);return`<object data="${c?`plugin://${t}?${c}`:`plugin://${t}`}" data-aspect-ratio="${r}" />`}function ot(t,s,r){if(!t||!s||!r)return null;let c=t.split(`
`),i=c.findIndex(a=>a.includes(`${Ye}${s}`));if(i===-1)return null;let d=c.slice();return c[i+1]===""?d.splice(i+2,0,r.trim(),""):d.splice(i+1,0,"",r.trim(),""),d.join(`
`)}function he(t,s,r=null){return!t||!s||!t.includes(`plugin://${s}`)?!1:r?t.includes(`att=${r}`):!0}function pe(t,s,r){if(!t||!s||!r)return null;let c=t.split(`
`),i=`plugin://${s}`,d=c.findIndex(p=>p.includes(i)&&p.includes(`att=${r}`));if(d===-1)return null;let a=c.slice();return a.splice(d,1),a[d]===""&&a[d-1]===""&&a.splice(d,1),a.join(`
`)}function Se(t,s,r,c={}){if(!t||!s||!r)return null;let i=t.split(`
`),d=`plugin://${s}`,a=i.findIndex(T=>T.includes(d)&&T.includes(`att=${r}`));if(a===-1)return null;let p=i[a],A=p.match(/data="(plugin:\/\/[^"]*)"/);if(!A)return null;let g=A[1],S=g.indexOf("?"),N=S===-1?"":g.slice(S+1),b={...ae(N),attachmentUUID:r,...c},u=nt(b),f=u?`plugin://${s}?${u}`:`plugin://${s}`,y=i.slice(),x=p.replace(A[0],`data="${f}"`),E=tt(b.collapsed),C=x.match(/data-aspect-ratio="[^"]*"/);return x=C?x.replace(C[0],`data-aspect-ratio="${E}"`):x.replace(/\s*\/>\s*$/,` data-aspect-ratio="${E}" />`),y[a]=x,y.join(`
`)}function at(t,s,r,c){return Se(t,s,r,{collapsed:!!c})}async function rt(t,s,r){let c=await ce(t,s);if(!c){let p=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(p)&&p.length>0)||!p.some(g=>g&&g.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let i=await t.getNoteContent({uuid:s});if(he(i,r,c.uuid))return await t.alert(`"${c.name}" is already open in this note - scroll to the viewer.`),c.uuid;let d=de(r,{attachmentUUID:c.uuid,attachmentName:c.name}),a=ot(i,c.uuid,d);return a!==null?(await t.replaceNoteContent({uuid:s},a),c.uuid):(await t.insertNoteContent({uuid:s},`
${d}
`,{atEnd:!0}),c.uuid)}var dn="Raw markdown";function hn(t){let s=(String(t||"").match(/`+/g)||[]).reduce((r,c)=>Math.max(r,c.length),0);return"`".repeat(Math.max(3,s+1))}async function it(t,s){let r=await t.getNoteContent({uuid:s});if(typeof r!="string"||r==="")return await t.alert("That note came back empty - nothing to dump."),null;let c=await t.getNoteAttachments({uuid:s}),i=(Array.isArray(c)?c:[]).map(p=>`- ${p&&p.name} | ${p&&p.type} | ${p&&p.uuid}`).join(`
`),d=hn(r),a=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:a},`# Attachments

${i||"- (none)"}

# ${dn}

${d}
${r}
${d}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),a}async function lt(t,s,r){if(!s)return"";let c=await ce(t,s);if(!c){let d=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(d)&&d.length>0)||!d.some(p=>p&&p.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let i=await t.getNoteContent({uuid:s});return he(i,r,c.uuid)?(await t.alert(`"${c.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${de(r,{attachmentUUID:c.uuid,attachmentName:c.name})}
`}async function pn(t,s,r,c){let i={uuid:s},d=pe(r,t.context.pluginUUID,c);if(d!==null)try{await t.replaceNoteContent(i,d)}catch{}try{await t.replaceNoteContent(i,r)}catch{await t.replaceNoteContent(i,r)}}async function st(t,s){let{noteUUID:r,attachmentUUID:c,page:i,highlightId:d}=ae(s);if(!r){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let a=await t.getNoteContent({uuid:r}),p=Se(a,t.context.pluginUUID,c,{page:i,highlightId:d,collapsed:!1});p!==null&&(t.context&&t.context.noteUUID===r?await pn(t,r,p,c):await t.replaceNoteContent({uuid:r},p))}catch{}await t.navigate(`https://www.amplenote.com/notes/${r}`)}function ue(t){if(!t)return null;let s=String(t).trim().toLowerCase();return le.find(r=>r.id===s||r.hex.toLowerCase()===s)||null}function ct(){return ue(se)}function un(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function fe({page:t,color:s,rects:r,quoteText:c,note:i=null,id:d=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(r)||r.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let p of r)if(![p.x,p.y,p.width,p.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(p)}`);let a=ue(s)||ct();return{id:d||un(),page:t,color:a.id,rects:r.map(p=>({x:p.x,y:p.y,width:p.width,height:p.height})),quoteText:String(c||""),note:i?String(i):null}}function dt(t,s){let r=s==null?null:String(s).trim();return{...t,note:r||null}}function ht(t,s){let r=ue(s);if(!r)throw new Error(`withColor: unknown color "${s}"`);return{...t,color:r.id}}function pt(t,s){return(t||[]).filter(r=>r.id!==s)}function Te(t,s,r){let c=!1,i=(t||[]).map(d=>d.id!==s?d:(c=!0,r(d)));return c?i:t}var fn="json",ut="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function ft(t){let s=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${ut}
\`\`\`${fn}
${s}
\`\`\``}function Ae(t){if(!t)return null;let s=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),r=!s&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),c=(s?s[1]:r?r[1]:t).trim();if(!c)return null;try{return JSON.parse(c)}catch{return null}}function gn(t){if(!Array.isArray(t))return[];let s=[];for(let r of t)try{s.push(fe(r))}catch{}return s}async function ge(t,s,r){let c=await t.getNoteContent({uuid:s}),i=Ie(c,G),d=Ae(i);return!d||typeof d!="object"?[]:gn(d[r])}async function gt(t,s,r,c){let i={uuid:s},d=await t.getNoteContent(i),a=Ie(d,G),A={...Ae(a)||{},[r]:c},g=ft(A);a===null&&await t.insertNoteContent(i,`

# ${G}

`,{atEnd:!0});let S=vn(d,g);if(S!==null){await t.replaceNoteContent(i,S);return}await t.replaceNoteContent(i,g,{section:{heading:{text:G,level:1}}})}async function mt(t,s,r){let c={uuid:s},i=await t.getNoteContent(c),d=Ie(i,G);if(d===null)return;let a=Ae(d)||{};if(!(r in a))return;let p={...a};delete p[r],await t.replaceNoteContent(c,ft(p),{section:{heading:{text:G,level:1}}})}function ke(t,s){let r=/^#\s+(.*)$/,c=t.findIndex(d=>{let a=d.match(r);return a&&a[1].trim()===s});if(c===-1)return null;let i=t.length;for(let d=c+1;d<t.length;d++)if(/^#\s+/.test(t[d])){i=d;break}return{start:c,end:i}}function Ie(t,s){if(!t)return null;let r=t.split(`
`),c=ke(r,s);return c?r.slice(c.start+1,c.end).join(`
`).trim():null}function mn(t){if(!t)return"";let s=t,r=s.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return r&&(s=s.replace(r[0],"")),s=s.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),s=s.replace(ut,""),s.trim()}function vt(t,s){let r=(t||"").split(`
`),c=ke(r,G);if(!c)return null;let i=r.slice(0,c.start).join(`
`).replace(/\s+$/,""),d=r.slice(c.start).join(`
`);return`${i?i+`

`:""}${s}

${d}`}function vn(t,s){let r=(t||"").split(`
`),c=ke(r,G);if(!c)return null;let i=mn(r.slice(c.start+1,c.end).join(`
`).trim());if(!i)return null;let d=r.slice(0,c.start).join(`
`).replace(/\s+$/,""),a=r.slice(c.end).join(`
`).replace(/^\s+/,"");return`${d?d+`

`:""}${i}

${r[c.start]}

${s}${a?`

`+a:""}`}function q(t,s){return s.noteUUID||t.context.noteUUID}async function wt(t,s,r){try{let c=await t.getNoteAttachments({uuid:s}),i=Array.isArray(c)&&c.find(d=>d&&d.uuid===r);return i?i.name:""}catch{return""}}async function me(t,s,r,c){let i=await ge(t,s,r),d=c(i);return d!==i&&await gt(t,s,r,d),{highlights:d}}function xt(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let s=t.trim();if(!s.startsWith("{"))return{action:s};try{return JSON.parse(s)}catch{return{action:s}}}async function bt(t,s){return JSON.stringify(await wn(t,xt(s)))}async function wn(t,s){let r=xt(s);switch(r.action){case"getPdfUrl":{let c=r.attachmentUUID;if(!c)return{error:"No attachment specified for this viewer."};try{return{url:await et(t,c),name:await wt(t,q(t,r),c)}}catch(i){return{error:`Could not load the PDF: ${i.message}`}}}case"loadHighlights":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await ge(t,q(t,r),r.attachmentUUID)}}catch(c){return{error:`Could not load highlights: ${c.message}`}}}case"addHighlight":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let c=fe(r.highlight||{});return await me(t,q(t,r),r.attachmentUUID,i=>i.concat([c]))}catch(c){return{error:`Could not save the highlight: ${c.message}`}}}case"recolorHighlight":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await me(t,q(t,r),r.attachmentUUID,c=>Te(c,r.id,i=>ht(i,r.color)))}catch(c){return{error:`Could not change the highlight color: ${c.message}`}}}case"setHighlightNote":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await me(t,q(t,r),r.attachmentUUID,c=>Te(c,r.id,i=>dt(i,r.note)))}catch(c){return{error:`Could not save the note: ${c.message}`}}}case"removeHighlight":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await me(t,q(t,r),r.attachmentUUID,c=>pt(c,r.id))}catch(c){return{error:`Could not remove the highlight: ${c.message}`}}}case"sendToNote":{if(!r.content)return{error:"Nothing to send."};try{let c={uuid:q(t,r)},i=await t.getNoteContent(c),d=vt(i,r.content);return d===null?await t.insertNoteContent(c,`
`+r.content+`
`,{atEnd:!0}):await t.replaceNoteContent(c,d),{ok:!0}}catch(c){return{error:`Could not add this to the note: ${c.message}`}}}case"removeViewer":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!r.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let c=q(t,r),i=await t.getNoteContent({uuid:c}),d=pe(i,r.pluginUUID,r.attachmentUUID);return d===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:c},d),await mt(t,c,r.attachmentUUID),{ok:!0})}catch(c){return{error:`Could not remove this viewer: ${c.message}`}}}case"getViewerSummary":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};let c=q(t,r),i=await wt(t,c,r.attachmentUUID);try{let d=await ge(t,c,r.attachmentUUID);return{name:i,count:d.length}}catch{return{name:i,count:0}}}case"setCollapsed":{if(!r.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!r.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let c=q(t,r),i=await t.getNoteContent({uuid:c}),d=at(i,r.pluginUUID,r.attachmentUUID,r.collapsed);return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:c},d),{ok:!0})}catch(c){return{error:`Could not resize this viewer: ${c.message}`}}}case"exportAll":{if(!r.noteName)return{error:"Missing destination note name."};try{let c=await t.findNote({name:r.noteName}),i=c?c.uuid:await t.createNote(r.noteName);return await t.replaceNoteContent({uuid:i},r.content||""),{ok:!0,noteUUID:i}}catch(c){return{error:`Could not export highlights: ${c.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(r.action)}`}}}function Pe(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function s(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function r(u,f){var y=Math.pow(10,f===void 0?2:f),x=function(E){return Math.round(E*y)/y};return{x:x(u.x),y:x(u.y),width:x(u.width),height:x(u.height)}}function c(u){return u.width>.01&&u.height>.01}function i(u,f,y){for(var x=String(u??""),E=Math.max(0,f===void 0?0:f),C=Math.min(x.length,y===void 0?x.length:y),T=function(O){return O===""||/\s/.test(O)},I=[],D=E;D<C;){for(;D<C&&T(x.charAt(D));)D++;if(D>=C)break;for(var $=D;D<C&&!T(x.charAt(D));)D++;I.push({start:$,end:D})}return I}function d(u){for(var f=1/0,y=1/0,x=-1/0,E=-1/0,C=0;C<(u?u.length:0);C++){var T=u[C];c(T)&&(f=Math.min(f,T.left),y=Math.min(y,T.top),x=Math.max(x,T.left+T.width),E=Math.max(E,T.top+T.height))}return isFinite(f)?{left:f,top:y,width:x-f,height:E-y}:null}function a(u,f,y){for(var x=[],E=0;E<u.length;E++){var C=t(u[E],f);if(c(C)){var T=y(C.x,C.y),I=y(C.x+C.width,C.y+C.height),D=r(s(T,I));c(D)&&x.push(D)}}return x}function p(u,f){var y=f(u.x,u.y),x=f(u.x+u.width,u.y+u.height);return s(y,x)}function A(u,f,y){var x=f.right-f.left,E=f.bottom-f.top;if(x<=0||E<=0)return null;var C=u.x2-u.x1,T=u.y2-u.y1,I=u.x1+(y.left-f.left)/x*C,D=u.x2-(f.right-y.right)/x*C,$=u.y1+(y.bottom-f.bottom)/E*T,O=u.y2-(f.top-y.top)/E*T;return{x:I,y:$,width:D-I,height:O-$}}function g(u,f){var y=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return y>.5*Math.min(u.height,f.height)}function S(u,f){var y=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var x=u.slice().sort(function(j,J){return J.y-j.y||j.x-J.x}),E=[],C=0;C<x.length;C++){for(var T=!1,I=0;I<E.length;I++)if(g(E[I][0],x[C])){E[I].push(x[C]),T=!0;break}T||E.push([x[C]])}for(var D=[],$=0;$<E.length;$++){for(var O=E[$].slice().sort(function(j,J){return j.x-J.x}),U=null,W=0;W<O.length;W++){var F=O[W];if(U===null){U={x:F.x,y:F.y,width:F.width,height:F.height};continue}var re=F.x-(U.x+U.width);if(re<=y*Math.max(U.height,F.height)){var ee=Math.max(U.x+U.width,F.x+F.width),we=Math.max(U.y+U.height,F.y+F.height);U.x=Math.min(U.x,F.x),U.y=Math.min(U.y,F.y),U.width=ee-U.x,U.height=we-U.y}else D.push(U),U={x:F.x,y:F.y,width:F.width,height:F.height}}U!==null&&D.push(U)}return D.map(function(j){return r(j)})}function N(u,f,y,x){var E=x===void 0?0:x;return f>=u.x-E&&f<=u.x+u.width+E&&y>=u.y-E&&y<=u.y+u.height+E}function w(u,f,y,x,E){for(var C=u||[],T=C.length-1;T>=0;T--){var I=C[T];if(!(!I||I.page!==f||!I.rects)){for(var D=0;D<I.rects.length;D++)if(N(I.rects[D],y,x,E===void 0?1:E))return I}}return null}function b(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:s,roundRect:r,isVisibleRect:c,textTokenRanges:i,unionClientRects:d,clientRectsToPdfRects:a,pdfRectToViewportRect:p,itemRelativeRect:A,mergeLineRects:S,rectContainsPoint:N,hitTestHighlights:w,normalizeQuoteText:b}}var B=Pe(),Kn=B.clientRectToLocal,Zn=B.rectFromCorners,eo=B.roundRect,to=B.isVisibleRect,no=B.textTokenRanges,oo=B.unionClientRects,ao=B.clientRectsToPdfRects,ro=B.pdfRectToViewportRect,io=B.itemRelativeRect,lo=B.mergeLineRects,so=B.rectContainsPoint,co=B.hitTestHighlights,ho=B.normalizeQuoteText;function De(){var t=[.957,.871,.424];function s(d,a,p,A,g){var S=a.context.register(a.context.obj({Type:d.PDFName.of("ExtGState"),BM:d.PDFName.of("Multiply"),ca:d.PDFNumber.of(.4)})),N=[d.pushGraphicsState(),d.setGraphicsState("GS0")];N.push(d.setFillingColor(d.rgb(A[0],A[1],A[2])));for(var w=0;w<p.length;w++){var b=p[w];N.push(d.moveTo(b.x,b.y)),N.push(d.lineTo(b.x,b.y+b.height)),N.push(d.lineTo(b.x+b.width,b.y+b.height)),N.push(d.lineTo(b.x+b.width,b.y)),N.push(d.closePath())}N.push(d.fill()),N.push(d.popGraphicsState());var u=a.context.formXObject(N,{BBox:g,Resources:{ExtGState:{GS0:S}}});return a.context.register(u)}function r(d,a,p,A){for(var g=p.rects,S=[],N=g[0].x,w=g[0].y,b=g[0].x+g[0].width,u=g[0].y+g[0].height,f=0;f<g.length;f++){var y=g[f],x=y.x,E=y.x+y.width,C=y.y,T=y.y+y.height;S.push(x,T,E,T,x,C,E,C),N=Math.min(N,x),w=Math.min(w,C),b=Math.max(b,E),u=Math.max(u,T)}var I=a.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Highlight"),Rect:a.context.obj([N,w,b,u]),QuadPoints:a.context.obj(S),C:a.context.obj(A),F:d.PDFNumber.of(4),T:d.PDFString.of("PDF Annotator"),M:d.PDFString.of(new Date().toISOString()),CA:d.PDFNumber.of(.4)});p.note&&I.set(d.PDFName.of("Contents"),d.PDFString.of(p.note));var D=s(d,a,g,A,[N,w,b,u]);I.set(d.PDFName.of("AP"),a.context.obj({N:D}));var $=a.context.register(I),O=[$];if(p.note){var U=a.context.register(a.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Popup"),Rect:a.context.obj([b+8,w-60,b+208,w+12]),Parent:$,Open:!1}));I.set(d.PDFName.of("Popup"),U),O.push(U)}return O}function c(d,a,p){var A=a.node.get(d.PDFName.of("Annots"));if(A instanceof d.PDFArray)for(var g=0;g<p.length;g++)A.push(p[g]);else a.node.set(d.PDFName.of("Annots"),a.doc.context.obj(p))}async function i(d,a,p,A){for(var g=await d.PDFDocument.load(a),S=g.getPages(),N=p||[],w=0;w<N.length;w++){var b=N[w];if(!(!b||!b.rects||!b.rects.length)){var u=S[b.page-1];if(u){var f=A&&A[b.color]||t,y=r(d,g,b,f);c(d,u,y)}}}return g.save()}return{writeHighlightsIntoPdf:i,buildHighlightAnnotation:r,appendAnnotationRefs:c}}var He=De(),uo=He.writeHighlightsIntoPdf,fo=He.buildHighlightAnnotation,go=He.appendAnnotationRefs;function Ue(){function t(g){return String(g??"").replace(/\]/g,"\\]")}function s(g,S,N,w,b){var u=new URLSearchParams;S&&u.set("att",S),Number.isFinite(N)&&N>=1&&u.set("page",String(Math.floor(N))),w&&u.set("hl",w),b&&u.set("note",b);var f=u.toString();return"plugin://"+g+(f?"?"+f:"")}function r(g,S){return String(g??"").split(/\r?\n/).map(function(N){return(S+" "+N).replace(/[ \t]+$/,"")})}function c(g,S,N,w,b,u){var f=s(S,N,w.page,w.id,u),y=t(g||"PDF"),x='==\u25CF<!-- {"cycleColor":"'+b+'"} -->==',E=x+" ["+y+"]("+f+")",C=[E].concat(r(w.quoteText,"> >"));return w.note&&(C.push(">"),C=C.concat(r(w.note,">"))),C.join(`
`)}function i(g){return String(g??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function d(g){return"<p>"+i(g).replace(/\r?\n/g,"<br>")+"</p>"}function a(g,S,N,w,b,u,f){var y=s(S,N,w.page,w.id,f),x="&#9679;";u&&(x="<mark"+(b==null?"":' data-text-color="'+i(b)+'"')+' style="color: '+i(u)+';">&#9679;</mark>');var E="<p>"+x+' <a href="'+i(y)+'">'+i(g||"PDF")+"</a></p>",C="<blockquote><blockquote>"+d(w.quoteText)+"</blockquote></blockquote>",T=w.note?"<blockquote>"+d(w.note)+"</blockquote>":"";return E+C+T}function p(g){return g.slice().sort(function(S,N){if(S.page!==N.page)return S.page-N.page;var w=S.rects&&S.rects[0]?S.rects[0].y:0,b=N.rects&&N.rects[0]?N.rects[0].y:0;return b-w})}function A(g,S,N,w,b,u,f){var y=u&&u.length?u:null,x=(w||[]).filter(function(T){return T&&(!y||y.indexOf(T.color)!==-1)}),E=p(x),C=E.map(function(T){var I=b?b[T.color]:void 0;return c(g,S,N,T,I,f)});return C.join(`

`)}return{buildDeepLink:s,buildHighlightBlock:c,buildHighlightHtml:a,buildExportAllContent:A}}var ve=Ue(),vo=ve.buildDeepLink,wo=ve.buildHighlightBlock,xo=ve.buildHighlightHtml,bo=ve.buildExportAllContent;function yt(){var t=window.__PDFA_CONFIG||{},s=window.__PDFA_GEOM||{},r=window.__PDFA_ANNOTATIONS||{},c=window.__PDFA_EXPORT||{},i={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function d(e){e&&(a.attachmentName=e,i.name&&(i.name.textContent=e),i.collapsedName&&(i.collapsedName.textContent=e))}var a={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function p(e,n){i.status.textContent=e||"",i.status.style.display=e?"block":"none",i.status.className=n?"pdfa-status pdfa-error":"pdfa-status"}function A(e){var n=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(o,l){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");o(window.callAmplenotePlugin(JSON.stringify(n)))}catch(h){l(h)}}).then(function(o){if(o&&typeof o=="object")return o;if(typeof o!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(o)}catch{throw new Error("Unreadable reply from the plugin: "+String(o).slice(0,120))}})}function g(){return t.colors||[]}function S(e){for(var n=g(),o=0;o<n.length;o++)if(n[o].id===e)return n[o].hex;return n.length?n[0].hex:"#F4DE6C"}function N(e){for(var n=0;n<a.highlights.length;n++)if(a.highlights[n].id===e)return a.highlights[n];return null}function w(e,n,o){var l=document.createElement("button");return l.className="pdfa-btn"+(n?" "+n:""),l.textContent=e,l.onclick=function(h){h.stopPropagation(),o()},l}function b(e,n,o,l){var h=document.createElement("button");return h.className="pdfa-color",h.dataset.color=e.id,h.style.background=e.hex,h.title=l+" "+e.label,h.setAttribute("aria-label",l+" "+e.label),h.setAttribute("aria-pressed",String(!!n)),h.onclick=function(v){v.stopPropagation(),o(e.id)},h}function u(){for(var e=g(),n=0;n<e.length;n++)i.colors.appendChild(b(e[n],e[n].id===a.activeColorId,function(o){a.activeColorId=o,f(),a.pendingSelection&&Le(a.pendingSelection,o)},"Highlight"))}function f(){for(var e=i.colors.querySelectorAll(".pdfa-color"),n=0;n<e.length;n++)e[n].setAttribute("aria-pressed",String(e[n].dataset.color===a.activeColorId))}function y(){for(var e=[],n=1;n<=a.pageCount;n++)(function(o){e.push(a.doc.getPage(o).then(function(l){a.viewports[o]=l.getViewport({scale:a.scale})}))})(n);return Promise.all(e)}function x(e){var n=a.viewports[e],o=document.createElement("div");return o.className="pdfa-page",o.dataset.page=String(e),o.style.width=n.width+"px",o.style.height=n.height+"px",o}function E(e,n){if(a.rendered[n]||a.renderingPage[n])return Promise.resolve();a.renderingPage[n]=!0;var o=a.viewports[n],l=document.createElement("canvas"),h=window.devicePixelRatio||1;l.width=Math.floor(o.width*h),l.height=Math.floor(o.height*h),l.style.width=o.width+"px",l.style.height=o.height+"px",e.appendChild(l);var v=document.createElement("div");v.className="pdfa-highlights",e.appendChild(v);var m=document.createElement("div");m.className="textLayer",m.style.width=o.width+"px",m.style.height=o.height+"px",m.style.setProperty("--scale-factor",String(a.scale)),e.appendChild(m);var k=l.getContext("2d");k.scale(h,h);var R=null;return a.doc.getPage(n).then(function(H){return R=H,H.render({canvasContext:k,viewport:o}).promise}).then(function(){return R.getTextContent()}).then(function(H){var P=[];return window.pdfjsLib.renderTextLayer({textContent:H,container:m,viewport:o,textDivs:P}).promise.then(function(){a.textSpans+=P.length;for(var L=0;L<P.length;L++)P[L].__pdfaItem=H.items[L];a.rendered[n]=!0,a.renderingPage[n]=!1,$(n),T()})}).catch(function(H){a.renderingPage[n]=!1,p("Failed to render page "+n+": "+(H.message||H),!0)})}function C(){var e=Y();if(!e||!a.doc)return Promise.resolve();for(var n=e.getBoundingClientRect(),o=e.clientHeight,l=i.pages.querySelectorAll(".pdfa-page"),h=[],v=0;v<l.length;v++){var m=l[v],k=Number(m.dataset.page);if(!(a.rendered[k]||a.renderingPage[k])){var R=m.getBoundingClientRect(),H=R.top-n.top,P=R.bottom-n.top;P<-o||H>e.clientHeight+o||h.push(E(m,k))}}return Promise.all(h)}function T(){var e=0;for(var n in a.rendered)a.rendered[n]&&e++;if(e){var o=a.textSpans===0;p(o?"No selectable text found - this PDF may be a scan.":"",o)}}function I(){if(a.rendering)return Promise.resolve();a.rendering=!0,M(!0),p("Rendering...");var e=Y(),n=e?e.scrollHeight-e.clientHeight:0,o=n>0?e.scrollTop/n:0;return i.pages.innerHTML="",a.viewports={},a.rendered={},a.renderingPage={},a.textSpans=0,y().then(function(){for(var l=1;l<=a.pageCount;l++)i.pages.appendChild(x(l));if(e){var h=e.scrollHeight-e.clientHeight;e.scrollTop=o*(h>0?h:0)}a.rendering=!1,te(),ne(),C()}).catch(function(l){a.rendering=!1,p("Failed to render: "+(l.message||l),!0)})}function D(e){return function(n,o){return e.convertToViewportPoint(n,o)}}function $(e){for(var n=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",o=i.pages.querySelectorAll(n),l=0;l<o.length;l++){var h=o[l],v=Number(h.dataset.page),m=h.querySelector(".pdfa-highlights"),k=a.viewports[v];if(!(!m||!k)){m.innerHTML="";for(var R=D(k),H=0;H<a.highlights.length;H++){var P=a.highlights[H];if(!(!P||P.page!==v||!P.rects||!P.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=P.id||"";for(var V=0;V<P.rects.length;V++){var K=s.pdfRectToViewportRect(P.rects[V],R),_=document.createElement("div");_.className="pdfa-hl",_.style.left=K.x+"px",_.style.top=K.y+"px",_.style.width=K.width+"px",_.style.height=K.height+"px",_.style.background=S(P.color),L.appendChild(_)}m.appendChild(L)}}}}}function O(){$(),W(),i.count.textContent=String(a.highlights.length)}function U(){return a.highlights.slice().sort(function(e,n){return e.page!==n.page?e.page-n.page:(n.rects[0]?n.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function W(){i.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var n=document.createElement("span");n.textContent="Highlights",e.appendChild(n),e.appendChild(w("Close","",function(){re(!1)})),i.panel.appendChild(e);var o=U();if(!o.length){var l=document.createElement("div");l.className="pdfa-panel-empty",l.textContent="No highlights yet. Select some text in the PDF and pick a color.",i.panel.appendChild(l);return}for(var h=0;h<o.length;h++)i.panel.appendChild(F(o[h]))}function F(e){var n=document.createElement("div");n.className="pdfa-hl-row",n.dataset.id=e.id||"",n.title="Jump to this highlight";var o=document.createElement("span");o.className="pdfa-chip",o.style.background=S(e.color),n.appendChild(o);var l=document.createElement("div"),h=document.createElement("div");h.className="pdfa-hl-page",h.textContent="Page "+e.page,l.appendChild(h);var v=document.createElement("div");if(v.className="pdfa-hl-quote",v.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,l.appendChild(v),e.note){var m=document.createElement("div");m.className="pdfa-hl-note",m.textContent=e.note,l.appendChild(m)}return n.appendChild(l),n.onclick=function(){$e(e)},n}function re(e){var n=e===void 0?!i.panel.classList.contains("pdfa-open"):e;i.panel.classList.toggle("pdfa-open",n),i.listToggle.setAttribute("aria-pressed",String(n)),n&&W(),ne()}function ee(e){for(var n=e&&e.nodeType===1?e:e&&e.parentElement;n;){if(n.classList&&n.classList.contains("textLayer"))return n;n=n.parentElement}return null}function we(e,n){for(var o=[],l=[],h=null,v=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),m;m=v.nextNode();)if(e.intersectsNode(m)){var k=m.nodeValue||"",R=m===e.startContainer?e.startOffset:0,H=m===e.endContainer?e.endOffset:k.length,P=m.parentElement,L=P&&P.__pdfaItem;if(L)for(var V={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},K=P.getBoundingClientRect(),_=s.textTokenRanges(k,R,H),Z=0;Z<_.length;Z++){var Ee=document.createRange();Ee.setStart(m,_[Z].start),Ee.setEnd(m,_[Z].end);var z=s.unionClientRects(Ee.getClientRects());if(z){var Je={left:z.left,top:z.top,width:z.width,height:z.height,right:z.left+z.width,bottom:z.top+z.height},Xe=s.itemRelativeRect(V,K,Je);Xe&&(o.push(Xe),l.push(k.slice(_[Z].start,_[Z].end)),h=Je)}}}return{rects:o,text:l.join(" "),lastCssRect:h}}function j(e){if(a.pendingSelection=e,a.lastCapturedText=e&&e.rawText||"",!e){i.hint.textContent="",i.hint.style.display="none";return}i.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",i.hint.style.display="inline"}function J(e){if(!a.noteEditing){var n=window.getSelection();if(!n||n.isCollapsed||n.rangeCount===0){j(null),M();return}var o=n.getRangeAt(0),l=ee(o.startContainer);if(!l)return j(null);var h=l.parentElement;if(!h||!h.dataset||!h.dataset.page)return j(null);var v=Number(h.dataset.page);if(!a.rendered[v])return j(null);var m=ee(o.endContainer)!==l,k=we(o,l),R=s.mergeLineRects(k.rects);if(!R.length)return j(null);var H=k.lastCssRect||h.getBoundingClientRect(),P=e&&e.clientX?e.clientX:H.left+H.width/2,L=e&&e.clientY?e.clientY:H.top+H.height,V={page:v,rects:R,quoteText:s.normalizeQuoteText(k.text),spilled:m,anchorX:P,anchorY:L,rawText:String(n)};j(V),kt(V)}}var Nt=300,X=null;function St(){a.noteEditing||(X&&clearTimeout(X),X=setTimeout(Re,Nt))}function Re(){if(X=null,!a.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||ee(e.getRangeAt(0).startContainer)&&String(e)!==a.lastCapturedText&&J(null)}}function ie(e,n){var o=a.highlights;return a.highlights=e,O(),A(n).then(function(l){if(!l||l.error)throw new Error(l&&l.error||"The plugin did not confirm the change.");return a.highlights=l.highlights||e,O(),p(""),!0}).catch(function(l){return a.highlights=o,O(),p(l.message||String(l),!0),!1})}function Le(e,n){var o={id:null,page:e.page,color:n,rects:e.rects,quoteText:e.quoteText,note:null},l=e.anchorX,h=e.anchorY;j(null),M(!0);var v=window.getSelection();v&&v.removeAllRanges&&v.removeAllRanges(),ie(a.highlights.concat([o]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:o}).then(function(m){if(m){var k=a.highlights[a.highlights.length-1];k&&k.id&&be(k,l,h,!0)}})}function Tt(e,n){M(!0),ie(a.highlights.map(function(o){return o.id===e?Object.assign({},o,{color:n}):o}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:n})}function At(e){M(!0),ie(a.highlights.filter(function(n){return n.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function xe(e,n){var o=String(n??"").trim();a.noteEditing=null,M(!0),ie(a.highlights.map(function(l){return l.id===e?Object.assign({},l,{note:o||null}):l}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:o})}function Q(e,n,o,l){i.popover.innerHTML="",i.popover.classList.toggle("pdfa-editing",l==="editing"),i.popover.classList.toggle("pdfa-exporting",l==="exporting"),i.popover.classList.toggle("pdfa-menu",l==="menu");for(var h=0;h<e.length;h++)i.popover.appendChild(e[h]);i.popover.classList.add("pdfa-open");var v=i.popover.offsetWidth,m=i.popover.offsetHeight,k=Math.max(4,Math.min(n-v/2,window.innerWidth-v-4)),R=o+12;R+m>window.innerHeight-4&&(R=Math.max(4,o-m-12)),i.popover.style.left=k+"px",i.popover.style.top=R+"px"}function M(e){a.noteEditing&&!e||(a.noteEditing=null,i.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),i.popover.innerHTML="")}function kt(e){for(var n=g(),o=[],l=0;l<n.length;l++)o.push(b(n[l],n[l].id===a.activeColorId,function(h){a.activeColorId=h,f(),Le(e,h)},"Highlight"));Q(o,e.anchorX,e.anchorY)}function be(e,n,o,l){for(var h=g(),v=[],m=0;m<h.length;m++)v.push(b(h[m],h[m].id===e.color,function(R){Tt(e.id,R)},"Change to"));var k=!!e.note;v.push(w(k?"Edit note":"Add note",l&&!k?"pdfa-btn-primary":"",function(){Pt(e,n,o)})),v.push(w("Copy","",function(){qt(e)})),v.push(w("Send to note","",function(){zt(e)})),v.push(w("Remove","pdfa-remove",function(){At(e.id)})),Q(v,n,o)}function It(e,n){for(var o=g(),l={},h=0;h<o.length;h++)l[o[h].id]=!0;var v=document.createElement("div");v.className="pdfa-export-hint",v.textContent="Export highlights to a note";var m=document.createElement("div");m.className="pdfa-export-colors";for(var k=0;k<o.length;k++)(function(H){var P=b(H,!0,function(L){l[L]=!l[L],P.setAttribute("aria-pressed",String(l[L]))},"Toggle");m.appendChild(P)})(o[k]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(w("Create / update note","pdfa-btn-primary",function(){for(var H=[],P=0;P<o.length;P++)l[o[P].id]&&H.push(o[P].id);Gt(H.length===o.length?null:H)})),Q([v,m,R],e,n,"exporting")}function Pt(e,n,o){a.noteEditing=e.id;var l=document.createElement("textarea");l.className="pdfa-note-input",l.rows=3,l.value=e.note||"",l.placeholder="Note for this highlight";var h=document.createElement("div");h.className="pdfa-note-actions",e.note&&h.appendChild(w("Delete note","",function(){xe(e.id,"")}));var v=document.createElement("span");v.className="pdfa-spacer",h.appendChild(v),h.appendChild(w("Cancel","",function(){Me(e,n,o)})),h.appendChild(w("Save","pdfa-btn-primary",function(){xe(e.id,l.value)})),l.onkeydown=function(m){m.key==="Enter"&&(m.ctrlKey||m.metaKey)?(m.preventDefault(),m.stopPropagation(),xe(e.id,l.value)):m.key==="Escape"&&(m.preventDefault(),m.stopPropagation(),Me(e,n,o))},Q([l,h],n,o,"editing"),l.focus(),l.setSelectionRange(l.value.length,l.value.length)}function Me(e,n,o){a.noteEditing=null;var l=N(e.id)||e;be(l,n,o)}function Dt(e){if(!a.noteEditing){var n=window.getSelection();if(!(n&&!n.isCollapsed)){for(var o=e.target,l=null;o&&o!==i.pages;){if(o.classList&&o.classList.contains("pdfa-page")){l=o;break}o=o.parentElement}if(!l)return M();var h=Number(l.dataset.page),v=a.viewports[h];if(!v)return M();var m=l.getBoundingClientRect(),k=v.convertToPdfPoint(e.clientX-m.left,e.clientY-m.top),R=s.hitTestHighlights(a.highlights,h,k[0],k[1],1);R&&R.id?be(R,e.clientX,e.clientY):M()}}}function te(){i.pageLabel.textContent=a.current+" / "+a.pageCount,i.zoomLabel.textContent=Math.round(a.scale*100)+"%"}function Y(){return i.root.querySelector(".pdfa-scroll")}function Fe(){return i.panel&&i.panel.classList.contains("pdfa-open")?i.panel:Y()}function Oe(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e+'"]');n&&E(n,e)}function ye(e){var n=Math.min(Math.max(1,e),a.pageCount),o=i.pages.querySelector('.pdfa-page[data-page="'+n+'"]');Oe(n);var l=Y();o&&l&&(l.scrollTop+=o.getBoundingClientRect().top-l.getBoundingClientRect().top),C(),a.current=n,te()}function $e(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),o=a.viewports[e.page];if(!(!n||!o||!e.rects||!e.rects.length)){var l=s.pdfRectToViewportRect(e.rects[0],D(o)),h=Y(),v=n.getBoundingClientRect().top+l.y;h.scrollTop+=v-h.getBoundingClientRect().top-h.clientHeight/3,Oe(e.page),C(),a.current=e.page,te()}}function Ht(){try{i.root.setAttribute("tabindex","-1"),i.root.focus(),i.root.scrollIntoView&&i.root.scrollIntoView({block:"nearest"})}catch{}}function Ut(e){if(!(!e||!e.id)){var n=i.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');n&&(n.classList.add("pdfa-hl-flash"),setTimeout(function(){n.classList.remove("pdfa-hl-flash")},2600))}}function je(e){return a.scale=Math.min(Math.max(.4,e),4),I()}function Rt(){return a.doc?a.doc.getPage(1).then(function(e){var n=Y();if(n){var o=window.getComputedStyle(n),l=n.clientWidth-(parseFloat(o.paddingLeft)||0)-(parseFloat(o.paddingRight)||0),h=e.getViewport({scale:1}).width;if(!(!(l>0)||!(h>0))){var v=Math.max(.4,l/h);v<a.scale&&(a.scale=v,te())}}}).catch(function(){}):Promise.resolve()}function _e(e){var n=Fe();n&&(n.scrollTop+=e*Math.max(80,n.clientHeight*.85),ne(),C())}function Be(e,n){var o=null,l=null,h=!1,v=function(){o&&clearTimeout(o),l&&clearInterval(l),o=l=null};e.addEventListener("pointerdown",function(){v(),h=!1,o=setTimeout(function(){h=!0,l=setInterval(function(){if(e.disabled)return v();_e(n*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(m){e.addEventListener(m,v)}),e.onclick=function(){if(h){h=!1;return}_e(n)}}function ne(){var e=Fe();if(!(!e||!i.scrollUp)){var n=e.scrollHeight-e.clientHeight;i.scrollUp.disabled=e.scrollTop<=1,i.scrollDown.disabled=e.scrollTop>=n-1}}function Lt(){ne(),C(),M();for(var e=i.pages.querySelectorAll(".pdfa-page"),n=a.current,o=1/0,l=0;l<e.length;l++){var h=Math.abs(e[l].getBoundingClientRect().top-60);h<o&&(o=h,n=Number(e[l].dataset.page))}n!==a.current&&(a.current=n,te())}function Mt(){return new Promise(function(e,n){if(window.pdfjsLib)return e(window.pdfjsLib);var o=document.createElement("script");o.src=t.pdfJsSrc,o.onload=function(){window.pdfjsLib?e(window.pdfjsLib):n(new Error("PDF.js loaded but did not register itself."))},o.onerror=function(){n(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(o)})}function Ft(){return new Promise(function(e,n){if(window.PDFLib)return e(window.PDFLib);var o=document.createElement("script");o.src=t.pdfLibSrc,o.onload=function(){window.PDFLib?e(window.PDFLib):n(new Error("pdf-lib loaded but did not register itself."))},o.onerror=function(){n(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(o)})}function Ot(){for(var e={},n=g(),o=0;o<n.length;o++)n[o].rgb&&(e[n[o].id]=n[o].rgb);return e}function $t(){var e=(a.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Ce(){for(var e={},n=g(),o=0;o<n.length;o++)n[o].cycleIndex!==void 0&&(e[n[o].id]=n[o].cycleIndex);return e}function qe(){var e=(a.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function ze(e){return c.buildHighlightBlock(a.attachmentName,t.pluginUUID,t.attachmentUUID,e,Ce()[e.color],t.noteUUID)}function jt(e){if(!c.buildHighlightHtml)return null;for(var n=g(),o=null,l=0;l<n.length;l++)n[l].id===e.color&&(o=n[l].hex);return c.buildHighlightHtml(a.attachmentName,t.pluginUUID,t.attachmentUUID,e,Ce()[e.color],o,t.noteUUID)}function _t(e,n){var o=function(v){var m=v.clipboardData||window.clipboardData;m&&(m.setData("text/plain",e),n&&m.setData("text/html",n),v.preventDefault())},l=document.createElement("textarea");l.value=e,l.style.position="fixed",l.style.left="-9999px",document.body.appendChild(l),l.focus(),l.select(),document.addEventListener("copy",o,!0);var h=!1;try{h=document.execCommand("copy")}catch{h=!1}return document.removeEventListener("copy",o,!0),document.body.removeChild(l),h}function Bt(e,n){var o=function(){return!navigator.clipboard||!navigator.clipboard.writeText?l():navigator.clipboard.writeText(e).then(function(){return"plain"},l)},l=function(){return _t(e,n)?Promise.resolve(n?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(n&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var h=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([n],{type:"text/html"})});return navigator.clipboard.write([h]).then(function(){return"rich"},o)}catch{return o()}return o()}function qt(e){M(!0);var n,o;try{n=ze(e),o=jt(e)}catch(l){p("Could not build the copy: "+(l.message||l),!0);return}Bt(n,o).then(function(l){p(l==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(l){p("Could not copy: "+(l.message||l),!0)})}function zt(e){M(!0),A({action:"sendToNote",content:ze(e)}).then(function(n){if(!n||n.error)throw new Error(n&&n.error||"Could not send this to the note.");p("Added to this note, below the text.")}).catch(function(n){p(n.message||String(n),!0)})}function Gt(e){M(!0);var n=c.buildExportAllContent(a.attachmentName,t.pluginUUID,t.attachmentUUID,a.highlights,Ce(),e,t.noteUUID);if(!n){p(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}A({action:"exportAll",noteName:qe(),content:n}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not export highlights.");p('Exported to "'+qe()+'".')}).catch(function(o){p(o.message||String(o),!0)})}function Vt(e,n){var o=document.createElement("div");o.className="pdfa-menu-name",o.textContent=a.attachmentName||"PDF Annotator",o.title=o.textContent;var l=[o];l.push(w("Collapse","",function(){M(!0),Kt()}),w("Download","",function(){M(!0),Xt()}),w("Export...","",function(){It(e,n)}),w("Remove viewer...","pdfa-remove",function(){Wt(e,n)})),Q(l,e,n,"menu")}function Wt(e,n){var o=document.createElement("div");o.className="pdfa-export-hint",o.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var l=document.createElement("div");l.className="pdfa-note-actions",l.appendChild(w("Cancel","",function(){M(!0)}));var h=document.createElement("span");h.className="pdfa-spacer",l.appendChild(h),l.appendChild(w("Remove","pdfa-remove",Jt)),Q([o,l],e,n,"exporting")}function Jt(){M(!0),p("Removing this viewer..."),A({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){p(e.message||String(e),!0)})}function Xt(){a.pdfBytes&&(p("Preparing the download..."),Ft().then(function(e){return r.writeHighlightsIntoPdf(e,a.pdfBytes,a.highlights,Ot())}).then(function(e){return Yt(e,$t())}).catch(function(e){p("Could not prepare the download: "+(e.message||e),!0)}))}function Yt(e,n){var o=new Blob([e],{type:"application/pdf"}),l=null;try{l=new File([o],n,{type:"application/pdf"})}catch{}return l&&navigator.share&&navigator.canShare&&navigator.canShare({files:[l]})?navigator.share({files:[l],title:n}).then(function(){p("")}).catch(function(h){return h&&h.name==="AbortError"?p(""):Ge(o,n)}):Ge(o,n)}function Ge(e,n){var o=URL.createObjectURL(e),l=document.createElement("a");l.href=o,l.download=n,document.body.appendChild(l),l.click(),l.remove(),setTimeout(function(){URL.revokeObjectURL(o)},4e3);var h=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return p(h?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function Qt(){return A({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");a.highlights=e.highlights||[]}).catch(function(e){a.highlights=[],p("Could not load saved highlights: "+(e.message||e),!0)})}function Kt(){var e=a.highlights.length;i.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",i.root.classList.add("pdfa-collapsed-mode"),Ve(!0)}function Ve(e){A({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Zt(){i.root.classList.remove("pdfa-collapsed-mode"),a.doc||We(),Ve(!1)}function We(){p("Loading PDF..."),(t.highlightId||t.page)&&Ht(),Mt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,A({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return d(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return a.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return a.doc=e,a.pageCount=e.numPages,Qt()}).then(function(){return Rt()}).then(function(){return I()}).then(function(){O();var e=t.highlightId?N(t.highlightId):null;e?($e(e),Ut(e)):t.page&&ye(t.page)}).catch(function(e){p(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ye(a.current-1)},document.getElementById("pdfa-next").onclick=function(){ye(a.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){je(a.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){je(a.scale-.25)},Be(i.scrollUp,-1),Be(i.scrollDown,1),i.listToggle.onclick=function(){re()},i.more.onclick=function(e){Vt(e.clientX,e.clientY)},Y().addEventListener("scroll",Lt),i.panel.addEventListener("scroll",ne),i.pages.addEventListener("mouseup",J),i.pages.addEventListener("click",Dt),document.addEventListener("selectionchange",St),i.pages.addEventListener("touchend",function(){X&&clearTimeout(X),X=null,Re()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!a.noteEditing&&M()}),document.addEventListener("mousedown",function(e){i.popover.classList.contains("pdfa-open")&&(i.popover.contains(e.target)||M())}),u(),W(),i.root.querySelector(".pdfa-collapsed").onclick=Zt,t.collapsed?A({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){d(e.name);var n=e.count||0;i.collapsedCount.textContent=n?n+(n===1?" highlight":" highlights"):""}}).catch(function(){}):We()}catch(e){p("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function xn(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function bn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var yn=`
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
`,Ct={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function Et({attachmentUUID:t,attachmentName:s="",page:r=null,highlightId:c=null,lightDarkMode:i="light",pluginUUID:d=null,noteUUID:a=null,collapsed:p=!1}={}){let A=Ct[i]||Ct.light,g={attachmentUUID:t,page:r,highlightId:c,pluginUUID:d,noteUUID:a,pdfJsSrc:oe.pdfJs,workerSrc:oe.pdfJsWorker,pdfLibSrc:oe.pdfLib,colors:le.map(S=>({id:S.id,label:S.label,hex:S.hex,rgb:S.rgb,cycleIndex:S.cycleIndex})),defaultColorId:se,collapsed:p,attachmentName:s};return`<link rel="stylesheet" href="${oe.pdfViewerCss}">
<style>:root{${A}}${yn}</style>
<div id="pdfa-root"${p?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${xn(s)}</span>
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
<script>window.__PDFA_CONFIG = ${bn(g)};
window.__PDFA_GEOM = (${Pe.toString()})();
window.__PDFA_ANNOTATIONS = (${De.toString()})();
window.__PDFA_EXPORT = (${Ue.toString()})();<\/script>
<script>(${yt.toString()})();<\/script>`}var Cn={noteOption:{"Annotate PDF":async function(t,s){return rt(t,s,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,s){return it(t,s)}},insertText:async function(t){return lt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...s){return st(t,s[0])},renderEmbed:function(t,...s){let{attachmentUUID:r,page:c,highlightId:i,collapsed:d,attachmentName:a}=ae(s[0]);return r?Et({attachmentUUID:r,page:c,highlightId:i,collapsed:d,attachmentName:a,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...s){return bt(t,s[0])}},En=Cn;return rn(Nn);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
