(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Ce=Object.defineProperty;var qt=Object.getOwnPropertyDescriptor;var Gt=Object.getOwnPropertyNames;var Vt=Object.prototype.hasOwnProperty;var Wt=(t,s)=>{for(var n in s)Ce(t,n,{get:s[n],enumerable:!0})},Jt=(t,s,n,l)=>{if(s&&typeof s=="object"||typeof s=="function")for(let r of Gt(s))!Vt.call(t,r)&&r!==n&&Ce(t,r,{get:()=>s[r],enumerable:!(l=qt(s,r))||l.enumerable});return t};var Xt=t=>Jt(Ce({},"__esModule",{value:!0}),t);var fn={};Wt(fn,{default:()=>un});var re=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ie="yellow",G="PDF Annotator data",Ge="attachment://",Ve=1,We=16,te={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},Yt="https://plugins.amplenote.com/cors-proxy";function Je(t){let s=new URL(Yt);return s.searchParams.set("apiurl",t),s.toString()}var Zt="application/pdf";function Qt(t){return Array.isArray(t)?t.filter(s=>s&&s.type===Zt&&s.uuid):[]}async function se(t,s){let n=await t.getNoteAttachments({uuid:s}),l=Qt(n);if(l.length===0)return null;if(l.length===1)return l[0];let r=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:l.map(o=>({label:o.name,value:o.uuid})),value:l[0].uuid}]});if(r==null)return null;let c=Array.isArray(r)?r[0]:r;return l.find(o=>o.uuid===c)||null}async function Xe(t,s){if(!s)throw new Error("fetchableAttachmentURL: attachmentUUID required");let n=await t.getAttachmentURL(s);if(!n)throw new Error(`No URL returned for attachment ${s}`);return Je(n)}function Ye(t){return t?We:Ve}function ne(t){let s={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return s;let n;try{n=new URLSearchParams(t.replace(/^\?/,""))}catch{return s}let l=c=>{let o=n.get(c);if(o===null||o.trim()==="")return null;let h=Number(o);return Number.isFinite(h)?h:null},r=l("page");return{attachmentUUID:n.get("att")||null,page:r!==null&&r>=1?Math.floor(r):null,x:l("x"),y:l("y"),highlightId:n.get("hl")||null,noteUUID:n.get("note")||null,collapsed:n.get("c")==="1",attachmentName:n.get("n")||""}}function Ze({attachmentUUID:t,page:s,x:n,y:l,highlightId:r,collapsed:c,attachmentName:o}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),o&&h.set("n",o),Number.isFinite(s)&&s>=1&&h.set("page",String(Math.floor(s))),Number.isFinite(n)&&h.set("x",String(n)),Number.isFinite(l)&&h.set("y",String(l)),r&&h.set("hl",r),h.toString()}function le(t,s={},n=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");n===null&&(n=Ye(s.collapsed));let l=Ze(s);return`<object data="${l?`plugin://${t}?${l}`:`plugin://${t}`}" data-aspect-ratio="${n}" />`}function Qe(t,s,n){if(!t||!s||!n)return null;let l=t.split(`
`),r=l.findIndex(o=>o.includes(`${Ge}${s}`));if(r===-1)return null;let c=l.slice();return l[r+1]===""?c.splice(r+2,0,n.trim(),""):c.splice(r+1,0,"",n.trim(),""),c.join(`
`)}function de(t,s,n=null){return!t||!s||!t.includes(`plugin://${s}`)?!1:n?t.includes(`att=${n}`):!0}function ce(t,s,n){if(!t||!s||!n)return null;let l=t.split(`
`),r=`plugin://${s}`,c=l.findIndex(h=>h.includes(r)&&h.includes(`att=${n}`));if(c===-1)return null;let o=l.slice();return o.splice(c,1),o[c]===""&&o[c-1]===""&&o.splice(c,1),o.join(`
`)}function Ee(t,s,n,l={}){if(!t||!s||!n)return null;let r=t.split(`
`),c=`plugin://${s}`,o=r.findIndex(A=>A.includes(c)&&A.includes(`att=${n}`));if(o===-1)return null;let h=r[o],b=h.match(/data="(plugin:\/\/[^"]*)"/);if(!b)return null;let g=b[1],k=g.indexOf("?"),S=k===-1?"":g.slice(k+1),E={...ne(S),attachmentUUID:n,...l},u=Ze(E),f=u?`plugin://${s}?${u}`:`plugin://${s}`,x=r.slice(),w=h.replace(b[0],`data="${f}"`),C=Ye(E.collapsed),N=w.match(/data-aspect-ratio="[^"]*"/);return w=N?w.replace(N[0],`data-aspect-ratio="${C}"`):w.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),x[o]=w,x.join(`
`)}function Ke(t,s,n,l){return Ee(t,s,n,{collapsed:!!l})}async function et(t,s,n){let l=await se(t,s);if(!l){let h=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(h)&&h.length>0)||!h.some(g=>g&&g.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let r=await t.getNoteContent({uuid:s});if(de(r,n,l.uuid))return await t.alert(`"${l.name}" is already open in this note - scroll to the viewer.`),l.uuid;let c=le(n,{attachmentUUID:l.uuid,attachmentName:l.name}),o=Qe(r,l.uuid,c);return o!==null?(await t.replaceNoteContent({uuid:s},o),l.uuid):(await t.insertNoteContent({uuid:s},`
${c}
`,{atEnd:!0}),l.uuid)}var Kt="Raw markdown";function en(t){let s=(String(t||"").match(/`+/g)||[]).reduce((n,l)=>Math.max(n,l.length),0);return"`".repeat(Math.max(3,s+1))}async function tt(t,s){let n=await t.getNoteContent({uuid:s});if(typeof n!="string"||n==="")return await t.alert("That note came back empty - nothing to dump."),null;let l=await t.getNoteAttachments({uuid:s}),r=(Array.isArray(l)?l:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=en(n),o=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:o},`# Attachments

${r||"- (none)"}

# ${Kt}

${c}
${n}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),o}async function nt(t,s,n){if(!s)return"";let l=await se(t,s);if(!l){let c=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let r=await t.getNoteContent({uuid:s});return de(r,n,l.uuid)?(await t.alert(`"${l.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${le(n,{attachmentUUID:l.uuid,attachmentName:l.name})}
`}async function tn(t,s,n,l){let r={uuid:s},c=ce(n,t.context.pluginUUID,l);if(c!==null)try{await t.replaceNoteContent(r,c)}catch{}try{await t.replaceNoteContent(r,n)}catch{await t.replaceNoteContent(r,n)}}async function ot(t,s){let{noteUUID:n,attachmentUUID:l,page:r,highlightId:c}=ne(s);if(!n){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let o=await t.getNoteContent({uuid:n}),h=Ee(o,t.context.pluginUUID,l,{page:r,highlightId:c,collapsed:!1});h!==null&&(t.context&&t.context.noteUUID===n?await tn(t,n,h,l):await t.replaceNoteContent({uuid:n},h))}catch{}await t.navigate(`https://www.amplenote.com/notes/${n}`)}function he(t){if(!t)return null;let s=String(t).trim().toLowerCase();return re.find(n=>n.id===s||n.hex.toLowerCase()===s)||null}function at(){return he(ie)}function nn(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function pe({page:t,color:s,rects:n,quoteText:l,note:r=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(n)||n.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of n)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let o=he(s)||at();return{id:c||nn(),page:t,color:o.id,rects:n.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(l||""),note:r?String(r):null}}function rt(t,s){let n=s==null?null:String(s).trim();return{...t,note:n||null}}function it(t,s){let n=he(s);if(!n)throw new Error(`withColor: unknown color "${s}"`);return{...t,color:n.id}}function st(t,s){return(t||[]).filter(n=>n.id!==s)}function Ne(t,s,n){let l=!1,r=(t||[]).map(c=>c.id!==s?c:(l=!0,n(c)));return l?r:t}var on="json",lt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function dt(t){let s=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${lt}
\`\`\`${on}
${s}
\`\`\``}function Se(t){if(!t)return null;let s=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),n=!s&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),l=(s?s[1]:n?n[1]:t).trim();if(!l)return null;try{return JSON.parse(l)}catch{return null}}function an(t){if(!Array.isArray(t))return[];let s=[];for(let n of t)try{s.push(pe(n))}catch{}return s}async function ue(t,s,n){let l=await t.getNoteContent({uuid:s}),r=Ae(l,G),c=Se(r);return!c||typeof c!="object"?[]:an(c[n])}async function ct(t,s,n,l){let r={uuid:s},c=await t.getNoteContent(r),o=Ae(c,G),b={...Se(o)||{},[n]:l},g=dt(b);o===null&&await t.insertNoteContent(r,`

# ${G}

`,{atEnd:!0});let k=sn(c,g);if(k!==null){await t.replaceNoteContent(r,k);return}await t.replaceNoteContent(r,g,{section:{heading:{text:G,level:1}}})}async function ht(t,s,n){let l={uuid:s},r=await t.getNoteContent(l),c=Ae(r,G);if(c===null)return;let o=Se(c)||{};if(!(n in o))return;let h={...o};delete h[n],await t.replaceNoteContent(l,dt(h),{section:{heading:{text:G,level:1}}})}function Te(t,s){let n=/^#\s+(.*)$/,l=t.findIndex(c=>{let o=c.match(n);return o&&o[1].trim()===s});if(l===-1)return null;let r=t.length;for(let c=l+1;c<t.length;c++)if(/^#\s+/.test(t[c])){r=c;break}return{start:l,end:r}}function Ae(t,s){if(!t)return null;let n=t.split(`
`),l=Te(n,s);return l?n.slice(l.start+1,l.end).join(`
`).trim():null}function rn(t){if(!t)return"";let s=t,n=s.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return n&&(s=s.replace(n[0],"")),s=s.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),s=s.replace(lt,""),s.trim()}function pt(t,s){let n=(t||"").split(`
`),l=Te(n,G);if(!l)return null;let r=n.slice(0,l.start).join(`
`).replace(/\s+$/,""),c=n.slice(l.start).join(`
`);return`${r?r+`

`:""}${s}

${c}`}function sn(t,s){let n=(t||"").split(`
`),l=Te(n,G);if(!l)return null;let r=rn(n.slice(l.start+1,l.end).join(`
`).trim());if(!r)return null;let c=n.slice(0,l.start).join(`
`).replace(/\s+$/,""),o=n.slice(l.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${r}

${n[l.start]}

${s}${o?`

`+o:""}`}function z(t,s){return s.noteUUID||t.context.noteUUID}async function ut(t,s,n){try{let l=await t.getNoteAttachments({uuid:s}),r=Array.isArray(l)&&l.find(c=>c&&c.uuid===n);return r?r.name:""}catch{return""}}async function fe(t,s,n,l){let r=await ue(t,s,n),c=l(r);return c!==r&&await ct(t,s,n,c),{highlights:c}}function ft(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let s=t.trim();if(!s.startsWith("{"))return{action:s};try{return JSON.parse(s)}catch{return{action:s}}}async function gt(t,s){return JSON.stringify(await ln(t,ft(s)))}async function ln(t,s){let n=ft(s);switch(n.action){case"getPdfUrl":{let l=n.attachmentUUID;if(!l)return{error:"No attachment specified for this viewer."};try{return{url:await Xe(t,l),name:await ut(t,z(t,n),l)}}catch(r){return{error:`Could not load the PDF: ${r.message}`}}}case"loadHighlights":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await ue(t,z(t,n),n.attachmentUUID)}}catch(l){return{error:`Could not load highlights: ${l.message}`}}}case"addHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let l=pe(n.highlight||{});return await fe(t,z(t,n),n.attachmentUUID,r=>r.concat([l]))}catch(l){return{error:`Could not save the highlight: ${l.message}`}}}case"recolorHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await fe(t,z(t,n),n.attachmentUUID,l=>Ne(l,n.id,r=>it(r,n.color)))}catch(l){return{error:`Could not change the highlight color: ${l.message}`}}}case"setHighlightNote":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await fe(t,z(t,n),n.attachmentUUID,l=>Ne(l,n.id,r=>rt(r,n.note)))}catch(l){return{error:`Could not save the note: ${l.message}`}}}case"removeHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await fe(t,z(t,n),n.attachmentUUID,l=>st(l,n.id))}catch(l){return{error:`Could not remove the highlight: ${l.message}`}}}case"sendToNote":{if(!n.content)return{error:"Nothing to send."};try{let l={uuid:z(t,n)},r=await t.getNoteContent(l),c=pt(r,n.content);return c===null?await t.insertNoteContent(l,`
`+n.content+`
`,{atEnd:!0}):await t.replaceNoteContent(l,c),{ok:!0}}catch(l){return{error:`Could not add this to the note: ${l.message}`}}}case"removeViewer":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=z(t,n),r=await t.getNoteContent({uuid:l}),c=ce(r,n.pluginUUID,n.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:l},c),await ht(t,l,n.attachmentUUID),{ok:!0})}catch(l){return{error:`Could not remove this viewer: ${l.message}`}}}case"getViewerSummary":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};let l=z(t,n),r=await ut(t,l,n.attachmentUUID);try{let c=await ue(t,l,n.attachmentUUID);return{name:r,count:c.length}}catch{return{name:r,count:0}}}case"setCollapsed":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=z(t,n),r=await t.getNoteContent({uuid:l}),c=Ke(r,n.pluginUUID,n.attachmentUUID,n.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:l},c),{ok:!0})}catch(l){return{error:`Could not resize this viewer: ${l.message}`}}}case"exportAll":{if(!n.noteName)return{error:"Missing destination note name."};try{let l=await t.findNote({name:n.noteName}),r=l?l.uuid:await t.createNote(n.noteName);return await t.replaceNoteContent({uuid:r},n.content||""),{ok:!0,noteUUID:r}}catch(l){return{error:`Could not export highlights: ${l.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(n.action)}`}}}function ke(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function s(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function n(u,f){var x=Math.pow(10,f===void 0?2:f),w=function(C){return Math.round(C*x)/x};return{x:w(u.x),y:w(u.y),width:w(u.width),height:w(u.height)}}function l(u){return u.width>.01&&u.height>.01}function r(u,f,x){for(var w=String(u??""),C=Math.max(0,f===void 0?0:f),N=Math.min(w.length,x===void 0?w.length:x),A=function($){return $===""||/\s/.test($)},P=[],I=C;I<N;){for(;I<N&&A(w.charAt(I));)I++;if(I>=N)break;for(var O=I;I<N&&!A(w.charAt(I));)I++;P.push({start:O,end:I})}return P}function c(u){for(var f=1/0,x=1/0,w=-1/0,C=-1/0,N=0;N<(u?u.length:0);N++){var A=u[N];l(A)&&(f=Math.min(f,A.left),x=Math.min(x,A.top),w=Math.max(w,A.left+A.width),C=Math.max(C,A.top+A.height))}return isFinite(f)?{left:f,top:x,width:w-f,height:C-x}:null}function o(u,f,x){for(var w=[],C=0;C<u.length;C++){var N=t(u[C],f);if(l(N)){var A=x(N.x,N.y),P=x(N.x+N.width,N.y+N.height),I=n(s(A,P));l(I)&&w.push(I)}}return w}function h(u,f){var x=f(u.x,u.y),w=f(u.x+u.width,u.y+u.height);return s(x,w)}function b(u,f,x){var w=f.right-f.left,C=f.bottom-f.top;if(w<=0||C<=0)return null;var N=u.x2-u.x1,A=u.y2-u.y1,P=u.x1+(x.left-f.left)/w*N,I=u.x2-(f.right-x.right)/w*N,O=u.y1+(x.bottom-f.bottom)/C*A,$=u.y2-(f.top-x.top)/C*A;return{x:P,y:O,width:I-P,height:$-O}}function g(u,f){var x=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return x>.5*Math.min(u.height,f.height)}function k(u,f){var x=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var w=u.slice().sort(function(V,J){return J.y-V.y||V.x-J.x}),C=[],N=0;N<w.length;N++){for(var A=!1,P=0;P<C.length;P++)if(g(C[P][0],w[N])){C[P].push(w[N]),A=!0;break}A||C.push([w[N]])}for(var I=[],O=0;O<C.length;O++){for(var $=C[O].slice().sort(function(V,J){return V.x-J.x}),D=null,Q=0;Q<$.length;Q++){var H=$[Q];if(D===null){D={x:H.x,y:H.y,width:H.width,height:H.height};continue}var oe=H.x-(D.x+D.width);if(oe<=x*Math.max(D.height,H.height)){var ge=Math.max(D.x+D.width,H.x+H.width),B=Math.max(D.y+D.height,H.y+H.height);D.x=Math.min(D.x,H.x),D.y=Math.min(D.y,H.y),D.width=ge-D.x,D.height=B-D.y}else I.push(D),D={x:H.x,y:H.y,width:H.width,height:H.height}}D!==null&&I.push(D)}return I.map(function(V){return n(V)})}function S(u,f,x,w){var C=w===void 0?0:w;return f>=u.x-C&&f<=u.x+u.width+C&&x>=u.y-C&&x<=u.y+u.height+C}function y(u,f,x,w,C){for(var N=u||[],A=N.length-1;A>=0;A--){var P=N[A];if(!(!P||P.page!==f||!P.rects)){for(var I=0;I<P.rects.length;I++)if(S(P.rects[I],x,w,C===void 0?1:C))return P}}return null}function E(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:s,roundRect:n,isVisibleRect:l,textTokenRanges:r,unionClientRects:c,clientRectsToPdfRects:o,pdfRectToViewportRect:h,itemRelativeRect:b,mergeLineRects:k,rectContainsPoint:S,hitTestHighlights:y,normalizeQuoteText:E}}var _=ke(),zn=_.clientRectToLocal,Bn=_.rectFromCorners,qn=_.roundRect,Gn=_.isVisibleRect,Vn=_.textTokenRanges,Wn=_.unionClientRects,Jn=_.clientRectsToPdfRects,Xn=_.pdfRectToViewportRect,Yn=_.itemRelativeRect,Zn=_.mergeLineRects,Qn=_.rectContainsPoint,Kn=_.hitTestHighlights,eo=_.normalizeQuoteText;function Ie(){var t=[.957,.871,.424];function s(c,o,h,b,g){var k=o.context.register(o.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),S=[c.pushGraphicsState(),c.setGraphicsState("GS0")];S.push(c.setFillingColor(c.rgb(b[0],b[1],b[2])));for(var y=0;y<h.length;y++){var E=h[y];S.push(c.moveTo(E.x,E.y)),S.push(c.lineTo(E.x,E.y+E.height)),S.push(c.lineTo(E.x+E.width,E.y+E.height)),S.push(c.lineTo(E.x+E.width,E.y)),S.push(c.closePath())}S.push(c.fill()),S.push(c.popGraphicsState());var u=o.context.formXObject(S,{BBox:g,Resources:{ExtGState:{GS0:k}}});return o.context.register(u)}function n(c,o,h,b){for(var g=h.rects,k=[],S=g[0].x,y=g[0].y,E=g[0].x+g[0].width,u=g[0].y+g[0].height,f=0;f<g.length;f++){var x=g[f],w=x.x,C=x.x+x.width,N=x.y,A=x.y+x.height;k.push(w,A,C,A,w,N,C,N),S=Math.min(S,w),y=Math.min(y,N),E=Math.max(E,C),u=Math.max(u,A)}var P=o.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:o.context.obj([S,y,E,u]),QuadPoints:o.context.obj(k),C:o.context.obj(b),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&P.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var I=s(c,o,g,b,[S,y,E,u]);P.set(c.PDFName.of("AP"),o.context.obj({N:I}));var O=o.context.register(P),$=[O];if(h.note){var D=o.context.register(o.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:o.context.obj([E+8,y-60,E+208,y+12]),Parent:O,Open:!1}));P.set(c.PDFName.of("Popup"),D),$.push(D)}return $}function l(c,o,h){var b=o.node.get(c.PDFName.of("Annots"));if(b instanceof c.PDFArray)for(var g=0;g<h.length;g++)b.push(h[g]);else o.node.set(c.PDFName.of("Annots"),o.doc.context.obj(h))}async function r(c,o,h,b){for(var g=await c.PDFDocument.load(o),k=g.getPages(),S=h||[],y=0;y<S.length;y++){var E=S[y];if(!(!E||!E.rects||!E.rects.length)){var u=k[E.page-1];if(u){var f=b&&b[E.color]||t,x=n(c,g,E,f);l(c,u,x)}}}return g.save()}return{writeHighlightsIntoPdf:r,buildHighlightAnnotation:n,appendAnnotationRefs:l}}var De=Ie(),no=De.writeHighlightsIntoPdf,oo=De.buildHighlightAnnotation,ao=De.appendAnnotationRefs;function Ue(){function t(o){return String(o??"").replace(/\]/g,"\\]")}function s(o,h,b,g,k){var S=new URLSearchParams;h&&S.set("att",h),Number.isFinite(b)&&b>=1&&S.set("page",String(Math.floor(b))),g&&S.set("hl",g),k&&S.set("note",k);var y=S.toString();return"plugin://"+o+(y?"?"+y:"")}function n(o,h){return String(o??"").split(/\r?\n/).map(function(b){return(h+" "+b).replace(/[ \t]+$/,"")})}function l(o,h,b,g,k,S){var y=s(h,b,g.page,g.id,S),E=t(o||"PDF"),u='==\u25CF<!-- {"cycleColor":"'+k+'"} -->==',f=u+" ["+E+"]("+y+")",x=[f].concat(n(g.quoteText,"> >"));return g.note&&(x.push(">"),x=x.concat(n(g.note,">"))),x.join(`
`)}function r(o){return o.slice().sort(function(h,b){if(h.page!==b.page)return h.page-b.page;var g=h.rects&&h.rects[0]?h.rects[0].y:0,k=b.rects&&b.rects[0]?b.rects[0].y:0;return k-g})}function c(o,h,b,g,k,S,y){var E=S&&S.length?S:null,u=(g||[]).filter(function(w){return w&&(!E||E.indexOf(w.color)!==-1)}),f=r(u),x=f.map(function(w){var C=k?k[w.color]:void 0;return l(o,h,b,w,C,y)});return x.join(`

`)}return{buildDeepLink:s,buildHighlightBlock:l,buildExportAllContent:c}}var Pe=Ue(),io=Pe.buildDeepLink,so=Pe.buildHighlightBlock,lo=Pe.buildExportAllContent;function mt(){var t=window.__PDFA_CONFIG||{},s=window.__PDFA_GEOM||{},n=window.__PDFA_ANNOTATIONS||{},l=window.__PDFA_EXPORT||{},r={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(o.attachmentName=e,r.name&&(r.name.textContent=e),r.collapsedName&&(r.collapsedName.textContent=e))}var o={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,a){r.status.textContent=e||"",r.status.style.display=e?"block":"none",r.status.className=a?"pdfa-status pdfa-error":"pdfa-status"}function b(e){var a=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(i,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");i(window.callAmplenotePlugin(JSON.stringify(a)))}catch(p){d(p)}}).then(function(i){if(i&&typeof i=="object")return i;if(typeof i!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(i)}catch{throw new Error("Unreadable reply from the plugin: "+String(i).slice(0,120))}})}function g(){return t.colors||[]}function k(e){for(var a=g(),i=0;i<a.length;i++)if(a[i].id===e)return a[i].hex;return a.length?a[0].hex:"#F4DE6C"}function S(e){for(var a=0;a<o.highlights.length;a++)if(o.highlights[a].id===e)return o.highlights[a];return null}function y(e,a,i){var d=document.createElement("button");return d.className="pdfa-btn"+(a?" "+a:""),d.textContent=e,d.onclick=function(p){p.stopPropagation(),i()},d}function E(e,a,i,d){var p=document.createElement("button");return p.className="pdfa-color",p.dataset.color=e.id,p.style.background=e.hex,p.title=d+" "+e.label,p.setAttribute("aria-label",d+" "+e.label),p.setAttribute("aria-pressed",String(!!a)),p.onclick=function(m){m.stopPropagation(),i(e.id)},p}function u(){for(var e=g(),a=0;a<e.length;a++)r.colors.appendChild(E(e[a],e[a].id===o.activeColorId,function(i){o.activeColorId=i,f(),o.pendingSelection&&He(o.pendingSelection,i)},"Highlight"))}function f(){for(var e=r.colors.querySelectorAll(".pdfa-color"),a=0;a<e.length;a++)e[a].setAttribute("aria-pressed",String(e[a].dataset.color===o.activeColorId))}function x(e,a){var i=e.getViewport({scale:o.scale});o.viewports[a]=i;var d=document.createElement("div");d.className="pdfa-page",d.dataset.page=String(a),d.style.width=i.width+"px",d.style.height=i.height+"px";var p=document.createElement("canvas"),m=window.devicePixelRatio||1;p.width=Math.floor(i.width*m),p.height=Math.floor(i.height*m),p.style.width=i.width+"px",p.style.height=i.height+"px",d.appendChild(p);var v=document.createElement("div");v.className="pdfa-highlights",d.appendChild(v);var T=document.createElement("div");T.className="textLayer",T.style.width=i.width+"px",T.style.height=i.height+"px",T.style.setProperty("--scale-factor",String(o.scale)),d.appendChild(T),r.pages.appendChild(d);var R=p.getContext("2d");return R.scale(m,m),e.render({canvasContext:R,viewport:i}).promise.then(function(){return e.getTextContent()}).then(function(F){var U=[];return window.pdfjsLib.renderTextLayer({textContent:F,container:T,viewport:i,textDivs:U}).promise.then(function(){o.textSpans+=U.length;for(var L=0;L<U.length;L++)U[L].__pdfaItem=F.items[L];N(a)})})}function w(){if(o.rendering)return Promise.resolve();o.rendering=!0,M(!0),r.pages.innerHTML="",o.viewports={},o.textSpans=0,h("Rendering...");for(var e=Promise.resolve(),a=1;a<=o.pageCount;a++)(function(i){e=e.then(function(){return o.doc.getPage(i).then(function(d){return x(d,i)})})})(a);return e.then(function(){o.textSpans===0?h("No selectable text found - this PDF may be a scan.",!0):h(""),o.rendering=!1,K(),be()}).catch(function(i){o.rendering=!1,h("Failed to render: "+i.message,!0)})}function C(e){return function(a,i){return e.convertToViewportPoint(a,i)}}function N(e){for(var a=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",i=r.pages.querySelectorAll(a),d=0;d<i.length;d++){var p=i[d],m=Number(p.dataset.page),v=p.querySelector(".pdfa-highlights"),T=o.viewports[m];if(!(!v||!T)){v.innerHTML="";for(var R=C(T),F=0;F<o.highlights.length;F++){var U=o.highlights[F];if(!(!U||U.page!==m||!U.rects||!U.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=U.id||"";for(var W=0;W<U.rects.length;W++){var Y=s.pdfRectToViewportRect(U.rects[W],R),j=document.createElement("div");j.className="pdfa-hl",j.style.left=Y.x+"px",j.style.top=Y.y+"px",j.style.width=Y.width+"px",j.style.height=Y.height+"px",j.style.background=k(U.color),L.appendChild(j)}v.appendChild(L)}}}}}function A(){N(),I(),r.count.textContent=String(o.highlights.length)}function P(){return o.highlights.slice().sort(function(e,a){return e.page!==a.page?e.page-a.page:(a.rects[0]?a.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function I(){r.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var a=document.createElement("span");a.textContent="Highlights",e.appendChild(a),e.appendChild(y("Close","",function(){$(!1)})),r.panel.appendChild(e);var i=P();if(!i.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",r.panel.appendChild(d);return}for(var p=0;p<i.length;p++)r.panel.appendChild(O(i[p]))}function O(e){var a=document.createElement("div");a.className="pdfa-hl-row",a.dataset.id=e.id||"",a.title="Jump to this highlight";var i=document.createElement("span");i.className="pdfa-chip",i.style.background=k(e.color),a.appendChild(i);var d=document.createElement("div"),p=document.createElement("div");p.className="pdfa-hl-page",p.textContent="Page "+e.page,d.appendChild(p);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(m),e.note){var v=document.createElement("div");v.className="pdfa-hl-note",v.textContent=e.note,d.appendChild(v)}return a.appendChild(d),a.onclick=function(){Le(e)},a}function $(e){var a=e===void 0?!r.panel.classList.contains("pdfa-open"):e;r.panel.classList.toggle("pdfa-open",a),r.listToggle.setAttribute("aria-pressed",String(a)),a&&I()}function D(e){for(var a=e&&e.nodeType===1?e:e&&e.parentElement;a;){if(a.classList&&a.classList.contains("textLayer"))return a;a=a.parentElement}return null}function Q(e,a){for(var i=[],d=[],p=null,m=document.createTreeWalker(a,NodeFilter.SHOW_TEXT,null),v;v=m.nextNode();)if(e.intersectsNode(v)){var T=v.nodeValue||"",R=v===e.startContainer?e.startOffset:0,F=v===e.endContainer?e.endOffset:T.length,U=v.parentElement,L=U&&U.__pdfaItem;if(L)for(var W={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},Y=U.getBoundingClientRect(),j=s.textTokenRanges(T,R,F),Z=0;Z<j.length;Z++){var ye=document.createRange();ye.setStart(v,j[Z].start),ye.setEnd(v,j[Z].end);var q=s.unionClientRects(ye.getClientRects());if(q){var Be={left:q.left,top:q.top,width:q.width,height:q.height,right:q.left+q.width,bottom:q.top+q.height},qe=s.itemRelativeRect(W,Y,Be);qe&&(i.push(qe),d.push(T.slice(j[Z].start,j[Z].end)),p=Be)}}}return{rects:i,text:d.join(" "),lastCssRect:p}}function H(e){if(o.pendingSelection=e,o.lastCapturedText=e&&e.rawText||"",!e){r.hint.textContent="",r.hint.style.display="none";return}r.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",r.hint.style.display="inline"}function oe(e){if(!o.noteEditing){var a=window.getSelection();if(!a||a.isCollapsed||a.rangeCount===0){H(null),M();return}var i=a.getRangeAt(0),d=D(i.startContainer);if(!d)return H(null);var p=d.parentElement;if(!p||!p.dataset||!p.dataset.page)return H(null);var m=Number(p.dataset.page);if(!o.viewports[m])return H(null);var v=D(i.endContainer)!==d,T=Q(i,d),R=s.mergeLineRects(T.rects);if(!R.length)return H(null);var F=T.lastCssRect||p.getBoundingClientRect(),U=e&&e.clientX?e.clientX:F.left+F.width/2,L=e&&e.clientY?e.clientY:F.top+F.height,W={page:m,rects:R,quoteText:s.normalizeQuoteText(T.text),spilled:v,anchorX:U,anchorY:L,rawText:String(a)};H(W),yt(W)}}var ge=300,B=null;function V(){o.noteEditing||(B&&clearTimeout(B),B=setTimeout(J,ge))}function J(){if(B=null,!o.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||D(e.getRangeAt(0).startContainer)&&String(e)!==o.lastCapturedText&&oe(null)}}function ae(e,a){var i=o.highlights;return o.highlights=e,A(),b(a).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return o.highlights=d.highlights||e,A(),h(""),!0}).catch(function(d){return o.highlights=i,A(),h(d.message||String(d),!0),!1})}function He(e,a){var i={id:null,page:e.page,color:a,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,p=e.anchorY;H(null),M(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),ae(o.highlights.concat([i]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:i}).then(function(v){if(v){var T=o.highlights[o.highlights.length-1];T&&T.id&&we(T,d,p,!0)}})}function xt(e,a){M(!0),ae(o.highlights.map(function(i){return i.id===e?Object.assign({},i,{color:a}):i}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:a})}function bt(e){M(!0),ae(o.highlights.filter(function(a){return a.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function me(e,a){var i=String(a??"").trim();o.noteEditing=null,M(!0),ae(o.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:i||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:i})}function X(e,a,i,d){r.popover.innerHTML="",r.popover.classList.toggle("pdfa-editing",d==="editing"),r.popover.classList.toggle("pdfa-exporting",d==="exporting"),r.popover.classList.toggle("pdfa-menu",d==="menu");for(var p=0;p<e.length;p++)r.popover.appendChild(e[p]);r.popover.classList.add("pdfa-open");var m=r.popover.offsetWidth,v=r.popover.offsetHeight,T=Math.max(4,Math.min(a-m/2,window.innerWidth-m-4)),R=i+12;R+v>window.innerHeight-4&&(R=Math.max(4,i-v-12)),r.popover.style.left=T+"px",r.popover.style.top=R+"px"}function M(e){o.noteEditing&&!e||(o.noteEditing=null,r.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),r.popover.innerHTML="")}function yt(e){for(var a=g(),i=[],d=0;d<a.length;d++)i.push(E(a[d],a[d].id===o.activeColorId,function(p){o.activeColorId=p,f(),He(e,p)},"Highlight"));X(i,e.anchorX,e.anchorY)}function we(e,a,i,d){for(var p=g(),m=[],v=0;v<p.length;v++)m.push(E(p[v],p[v].id===e.color,function(R){xt(e.id,R)},"Change to"));var T=!!e.note;m.push(y(T?"Edit note":"Add note",d&&!T?"pdfa-btn-primary":"",function(){Et(e,a,i)})),m.push(y("Copy","",function(){Rt(e)})),m.push(y("Send to note","",function(){Lt(e)})),m.push(y("Remove","pdfa-remove",function(){bt(e.id)})),X(m,a,i)}function Ct(e,a){for(var i=g(),d={},p=0;p<i.length;p++)d[i[p].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var v=document.createElement("div");v.className="pdfa-export-colors";for(var T=0;T<i.length;T++)(function(F){var U=E(F,!0,function(L){d[L]=!d[L],U.setAttribute("aria-pressed",String(d[L]))},"Toggle");v.appendChild(U)})(i[T]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(y("Create / update note","pdfa-btn-primary",function(){for(var F=[],U=0;U<i.length;U++)d[i[U].id]&&F.push(i[U].id);Mt(F.length===i.length?null:F)})),X([m,v,R],e,a,"exporting")}function Et(e,a,i){o.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var p=document.createElement("div");p.className="pdfa-note-actions",e.note&&p.appendChild(y("Delete note","",function(){me(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",p.appendChild(m),p.appendChild(y("Cancel","",function(){Re(e,a,i)})),p.appendChild(y("Save","pdfa-btn-primary",function(){me(e.id,d.value)})),d.onkeydown=function(v){v.key==="Enter"&&(v.ctrlKey||v.metaKey)?(v.preventDefault(),v.stopPropagation(),me(e.id,d.value)):v.key==="Escape"&&(v.preventDefault(),v.stopPropagation(),Re(e,a,i))},X([d,p],a,i,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function Re(e,a,i){o.noteEditing=null;var d=S(e.id)||e;we(d,a,i)}function Nt(e){if(!o.noteEditing){var a=window.getSelection();if(!(a&&!a.isCollapsed)){for(var i=e.target,d=null;i&&i!==r.pages;){if(i.classList&&i.classList.contains("pdfa-page")){d=i;break}i=i.parentElement}if(!d)return M();var p=Number(d.dataset.page),m=o.viewports[p];if(!m)return M();var v=d.getBoundingClientRect(),T=m.convertToPdfPoint(e.clientX-v.left,e.clientY-v.top),R=s.hitTestHighlights(o.highlights,p,T[0],T[1],1);R&&R.id?we(R,e.clientX,e.clientY):M()}}}function K(){r.pageLabel.textContent=o.current+" / "+o.pageCount,r.zoomLabel.textContent=Math.round(o.scale*100)+"%"}function ee(){return r.root.querySelector(".pdfa-scroll")}function ve(e){var a=Math.min(Math.max(1,e),o.pageCount),i=r.pages.querySelector('[data-page="'+a+'"]');i&&i.scrollIntoView({behavior:"smooth",block:"start"}),o.current=a,K()}function Le(e){var a=r.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),i=o.viewports[e.page];if(!(!a||!i||!e.rects||!e.rects.length)){var d=s.pdfRectToViewportRect(e.rects[0],C(i)),p=ee(),m=a.getBoundingClientRect().top+d.y;p.scrollTop+=m-p.getBoundingClientRect().top-p.clientHeight/3,o.current=e.page,K()}}function St(){try{r.root.setAttribute("tabindex","-1"),r.root.focus()}catch{}}function Tt(e){if(!(!e||!e.id)){var a=r.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');a&&(a.classList.add("pdfa-hl-flash"),setTimeout(function(){a.classList.remove("pdfa-hl-flash")},2600))}}function xe(e){return o.scale=Math.min(Math.max(.4,e),4),w()}function At(){return o.doc?o.doc.getPage(1).then(function(e){var a=ee();if(a){var i=window.getComputedStyle(a),d=a.clientWidth-(parseFloat(i.paddingLeft)||0)-(parseFloat(i.paddingRight)||0),p=e.getViewport({scale:1}).width;if(!(!(d>0)||!(p>0))){var m=Math.max(.4,d/p);m<o.scale&&(o.scale=m,K())}}}).catch(function(){}):Promise.resolve()}function Me(e){var a=ee();a&&(a.scrollTop+=e*Math.max(80,a.clientHeight*.85),be())}function be(){var e=ee();if(!(!e||!r.scrollUp)){var a=e.scrollHeight-e.clientHeight;r.scrollUp.disabled=e.scrollTop<=1,r.scrollDown.disabled=e.scrollTop>=a-1}}function kt(){be(),M();for(var e=r.pages.querySelectorAll(".pdfa-page"),a=o.current,i=1/0,d=0;d<e.length;d++){var p=Math.abs(e[d].getBoundingClientRect().top-60);p<i&&(i=p,a=Number(e[d].dataset.page))}a!==o.current&&(o.current=a,K())}function It(){return new Promise(function(e,a){if(window.pdfjsLib)return e(window.pdfjsLib);var i=document.createElement("script");i.src=t.pdfJsSrc,i.onload=function(){window.pdfjsLib?e(window.pdfjsLib):a(new Error("PDF.js loaded but did not register itself."))},i.onerror=function(){a(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(i)})}function Dt(){return new Promise(function(e,a){if(window.PDFLib)return e(window.PDFLib);var i=document.createElement("script");i.src=t.pdfLibSrc,i.onload=function(){window.PDFLib?e(window.PDFLib):a(new Error("pdf-lib loaded but did not register itself."))},i.onerror=function(){a(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(i)})}function Ut(){for(var e={},a=g(),i=0;i<a.length;i++)a[i].rgb&&(e[a[i].id]=a[i].rgb);return e}function Pt(){var e=(o.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Fe(){for(var e={},a=g(),i=0;i<a.length;i++)a[i].cycleIndex!==void 0&&(e[a[i].id]=a[i].cycleIndex);return e}function Oe(){var e=(o.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function $e(e){return l.buildHighlightBlock(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,Fe()[e.color],t.noteUUID)}function Ht(e){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(e):new Promise(function(a,i){var d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select();var p=!1;try{p=document.execCommand("copy")}catch{p=!1}document.body.removeChild(d),p?a():i(new Error("Clipboard access is unavailable here."))})}function Rt(e){M(!0),Ht($e(e)).then(function(){h("Highlight copied - paste it into any note.")}).catch(function(a){h("Could not copy: "+(a.message||a),!0)})}function Lt(e){M(!0),b({action:"sendToNote",content:$e(e)}).then(function(a){if(!a||a.error)throw new Error(a&&a.error||"Could not send this to the note.");h("Sent to the bottom of this note.")}).catch(function(a){h(a.message||String(a),!0)})}function Mt(e){M(!0);var a=l.buildExportAllContent(o.attachmentName,t.pluginUUID,t.attachmentUUID,o.highlights,Fe(),e,t.noteUUID);if(!a){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}b({action:"exportAll",noteName:Oe(),content:a}).then(function(i){if(!i||i.error)throw new Error(i&&i.error||"Could not export highlights.");h('Exported to "'+Oe()+'".')}).catch(function(i){h(i.message||String(i),!0)})}function je(e,a){var i=document.createElement("div");i.className="pdfa-menu-name",i.textContent=o.attachmentName||"PDF Annotator",i.title=i.textContent;var d=[i];window.matchMedia&&window.matchMedia("(max-width: 520px)").matches&&d.push(Ft(e,a)),d.push(y("Collapse","",function(){M(!0),zt()}),y("Download","",function(){M(!0),jt()}),y("Export...","",function(){Ct(e,a)}),y("Remove viewer...","pdfa-remove",function(){Ot(e,a)})),X(d,e,a,"menu")}function Ft(e,a){var i=document.createElement("div");i.className="pdfa-menu-zoom";var d=document.createElement("span");d.className="pdfa-menu-zoom-label",d.textContent=Math.round(o.scale*100)+"%";var p=function(T){return function(){xe(o.scale+T).then(function(){je(e,a)})}},m=y("\u2212","",p(-.25)),v=y("+","",p(.25));return m.title="Zoom out",v.title="Zoom in",m.disabled=o.scale<=.4,v.disabled=o.scale>=4,i.appendChild(m),i.appendChild(d),i.appendChild(v),i}function Ot(e,a){var i=document.createElement("div");i.className="pdfa-export-hint",i.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(y("Cancel","",function(){M(!0)}));var p=document.createElement("span");p.className="pdfa-spacer",d.appendChild(p),d.appendChild(y("Remove","pdfa-remove",$t)),X([i,d],e,a,"exporting")}function $t(){M(!0),h("Removing this viewer..."),b({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function jt(){o.pdfBytes&&(h("Preparing the download..."),Dt().then(function(e){return n.writeHighlightsIntoPdf(e,o.pdfBytes,o.highlights,Ut())}).then(function(e){var a=new Blob([e],{type:"application/pdf"}),i=URL.createObjectURL(a),d=document.createElement("a");d.href=i,d.download=Pt(),document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(i)},4e3),h("")}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function _t(){return b({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");o.highlights=e.highlights||[]}).catch(function(e){o.highlights=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function zt(){var e=o.highlights.length;r.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",r.root.classList.add("pdfa-collapsed-mode"),_e(!0)}function _e(e){b({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Bt(){r.root.classList.remove("pdfa-collapsed-mode"),o.doc||ze(),_e(!1)}function ze(){h("Loading PDF..."),(t.highlightId||t.page)&&St(),It().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,b({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return o.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return o.doc=e,o.pageCount=e.numPages,_t()}).then(function(){return At()}).then(function(){return w()}).then(function(){A();var e=t.highlightId?S(t.highlightId):null;e?(Le(e),Tt(e)):t.page&&ve(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ve(o.current-1)},document.getElementById("pdfa-next").onclick=function(){ve(o.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){xe(o.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){xe(o.scale-.25)},r.scrollUp.onclick=function(){Me(-1)},r.scrollDown.onclick=function(){Me(1)},r.listToggle.onclick=function(){$()},r.more.onclick=function(e){je(e.clientX,e.clientY)},ee().addEventListener("scroll",kt),r.pages.addEventListener("mouseup",oe),r.pages.addEventListener("click",Nt),document.addEventListener("selectionchange",V),r.pages.addEventListener("touchend",function(){B&&clearTimeout(B),B=null,J()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!o.noteEditing&&M()}),document.addEventListener("mousedown",function(e){r.popover.classList.contains("pdfa-open")&&(r.popover.contains(e.target)||M())}),u(),I(),r.root.querySelector(".pdfa-collapsed").onclick=Bt,t.collapsed?b({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var a=e.count||0;r.collapsedCount.textContent=a?a+(a===1?" highlight":" highlights"):""}}).catch(function(){}):ze()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function dn(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function cn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var hn=`
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
  /* The zoom stepper the same menu grows on a narrow embed. A row, not stacked buttons:
     it is a single control with two directions, and it has to stay distinguishable from
     the one-action-per-line items below it. */
  .pdfa-menu-zoom { display: flex; align-items: center; gap: 6px; padding: 2px 4px 6px;
    margin-bottom: 4px; border-bottom: 1px solid var(--pdfa-border); }
  /* Outranks ".pdfa-popover.pdfa-menu .pdfa-btn" above, which strips the border and
     left-aligns its items so they read as menu entries. These two are not menu entries -
     they are a stepper - so they have to keep looking like buttons. */
  .pdfa-popover.pdfa-menu .pdfa-menu-zoom .pdfa-btn { flex: 0 0 auto; min-width: 42px;
    text-align: center; border-color: var(--pdfa-border); background: var(--pdfa-btn); }
  .pdfa-menu-zoom-label { flex: 1 1 auto; text-align: center; opacity: .8;
    font-variant-numeric: tabular-nums; }
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
  .pdfa-scrollnav { display: none; position: absolute; right: 6px; top: 50%;
    transform: translateY(-50%); flex-direction: column; gap: 8px; z-index: 12; }
  .pdfa-scrollnav button { width: 40px; height: 40px; border-radius: 50%; font: inherit;
    font-size: 13px; line-height: 1; cursor: pointer; color: inherit; padding: 0;
    border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); opacity: .85;
    box-shadow: 0 1px 4px rgba(0,0,0,.25); }
  .pdfa-scrollnav button:disabled { opacity: .35; }
  /* Higher specificity than the coarse-pointer rule that reveals these, so it wins
     wherever it applies without depending on which block comes last: on a narrow embed
     the panel is full width, and these would otherwise float on top of it. */
  .pdfa-panel.pdfa-open ~ .pdfa-scrollnav { display: none; }

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
    /* Zoom moves into the overflow menu here, freeing a whole 40px row of a box that
       only has ~358px to give. It is the one control that got CHEAPER to bury: the
       viewer now opens already fitted to the box's width (see fitInitialZoom), so zoom
       went from the first thing you touch to an occasional adjustment - the same test
       Download and Export already pass. The page controls stay put; those are still
       used constantly. viewer.js reads this same breakpoint via matchMedia, so the
       button row and the menu can never both show zoom, or both hide it. */
    #pdfa-zoom-in, #pdfa-zoom-out, #pdfa-zoom-label { display: none; }
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
`,wt={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function vt({attachmentUUID:t,attachmentName:s="",page:n=null,highlightId:l=null,lightDarkMode:r="light",pluginUUID:c=null,noteUUID:o=null,collapsed:h=!1}={}){let b=wt[r]||wt.light,g={attachmentUUID:t,page:n,highlightId:l,pluginUUID:c,noteUUID:o,pdfJsSrc:te.pdfJs,workerSrc:te.pdfJsWorker,pdfLibSrc:te.pdfLib,colors:re.map(k=>({id:k.id,label:k.label,hex:k.hex,rgb:k.rgb,cycleIndex:k.cycleIndex})),defaultColorId:ie,collapsed:h,attachmentName:s};return`<link rel="stylesheet" href="${te.pdfViewerCss}">
<style>:root{${b}}${hn}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${dn(s)}</span>
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
<script>window.__PDFA_CONFIG = ${cn(g)};
window.__PDFA_GEOM = (${ke.toString()})();
window.__PDFA_ANNOTATIONS = (${Ie.toString()})();
window.__PDFA_EXPORT = (${Ue.toString()})();<\/script>
<script>(${mt.toString()})();<\/script>`}var pn={noteOption:{"Annotate PDF":async function(t,s){return et(t,s,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,s){return tt(t,s)}},insertText:async function(t){return nt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...s){return ot(t,s[0])},renderEmbed:function(t,...s){let{attachmentUUID:n,page:l,highlightId:r,collapsed:c,attachmentName:o}=ne(s[0]);return n?vt({attachmentUUID:n,page:l,highlightId:r,collapsed:c,attachmentName:o,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...s){return gt(t,s[0])}},un=pn;return Xt(fn);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
