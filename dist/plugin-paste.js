(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var ye=Object.defineProperty;var zt=Object.getOwnPropertyDescriptor;var Bt=Object.getOwnPropertyNames;var qt=Object.prototype.hasOwnProperty;var Gt=(t,i)=>{for(var o in i)ye(t,o,{get:i[o],enumerable:!0})},Vt=(t,i,o,l)=>{if(i&&typeof i=="object"||typeof i=="function")for(let s of Bt(i))!qt.call(t,s)&&s!==o&&ye(t,s,{get:()=>i[s],enumerable:!(l=zt(i,s))||l.enumerable});return t};var Wt=t=>Vt(ye({},"__esModule",{value:!0}),t);var hn={};Gt(hn,{default:()=>cn});var re=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ie="yellow",G="PDF Annotator data",qe="attachment://",Ge=1,Ve=16,te={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},Jt="https://plugins.amplenote.com/cors-proxy";function We(t){let i=new URL(Jt);return i.searchParams.set("apiurl",t),i.toString()}var Xt="application/pdf";function Yt(t){return Array.isArray(t)?t.filter(i=>i&&i.type===Xt&&i.uuid):[]}async function se(t,i){let o=await t.getNoteAttachments({uuid:i}),l=Yt(o);if(l.length===0)return null;if(l.length===1)return l[0];let s=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:l.map(n=>({label:n.name,value:n.uuid})),value:l[0].uuid}]});if(s==null)return null;let c=Array.isArray(s)?s[0]:s;return l.find(n=>n.uuid===c)||null}async function Je(t,i){if(!i)throw new Error("fetchableAttachmentURL: attachmentUUID required");let o=await t.getAttachmentURL(i);if(!o)throw new Error(`No URL returned for attachment ${i}`);return We(o)}function Xe(t){return t?Ve:Ge}function ne(t){let i={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return i;let o;try{o=new URLSearchParams(t.replace(/^\?/,""))}catch{return i}let l=c=>{let n=o.get(c);if(n===null||n.trim()==="")return null;let h=Number(n);return Number.isFinite(h)?h:null},s=l("page");return{attachmentUUID:o.get("att")||null,page:s!==null&&s>=1?Math.floor(s):null,x:l("x"),y:l("y"),highlightId:o.get("hl")||null,noteUUID:o.get("note")||null,collapsed:o.get("c")==="1",attachmentName:o.get("n")||""}}function Ye({attachmentUUID:t,page:i,x:o,y:l,highlightId:s,collapsed:c,attachmentName:n}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),n&&h.set("n",n),Number.isFinite(i)&&i>=1&&h.set("page",String(Math.floor(i))),Number.isFinite(o)&&h.set("x",String(o)),Number.isFinite(l)&&h.set("y",String(l)),s&&h.set("hl",s),h.toString()}function le(t,i={},o=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");o===null&&(o=Xe(i.collapsed));let l=Ye(i);return`<object data="${l?`plugin://${t}?${l}`:`plugin://${t}`}" data-aspect-ratio="${o}" />`}function Ze(t,i,o){if(!t||!i||!o)return null;let l=t.split(`
`),s=l.findIndex(n=>n.includes(`${qe}${i}`));if(s===-1)return null;let c=l.slice();return l[s+1]===""?c.splice(s+2,0,o.trim(),""):c.splice(s+1,0,"",o.trim(),""),c.join(`
`)}function de(t,i,o=null){return!t||!i||!t.includes(`plugin://${i}`)?!1:o?t.includes(`att=${o}`):!0}function Qe(t,i,o){if(!t||!i||!o)return null;let l=t.split(`
`),s=`plugin://${i}`,c=l.findIndex(h=>h.includes(s)&&h.includes(`att=${o}`));if(c===-1)return null;let n=l.slice();return n.splice(c,1),n[c]===""&&n[c-1]===""&&n.splice(c,1),n.join(`
`)}function Ce(t,i,o,l={}){if(!t||!i||!o)return null;let s=t.split(`
`),c=`plugin://${i}`,n=s.findIndex(A=>A.includes(c)&&A.includes(`att=${o}`));if(n===-1)return null;let h=s[n],b=h.match(/data="(plugin:\/\/[^"]*)"/);if(!b)return null;let g=b[1],k=g.indexOf("?"),S=k===-1?"":g.slice(k+1),E={...ne(S),attachmentUUID:o,...l},u=Ye(E),f=u?`plugin://${i}?${u}`:`plugin://${i}`,x=s.slice(),v=h.replace(b[0],`data="${f}"`),C=Xe(E.collapsed),N=v.match(/data-aspect-ratio="[^"]*"/);return v=N?v.replace(N[0],`data-aspect-ratio="${C}"`):v.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),x[n]=v,x.join(`
`)}function Ke(t,i,o,l){return Ce(t,i,o,{collapsed:!!l})}async function et(t,i,o){let l=await se(t,i);if(!l){let h=await t.getNoteAttachments({uuid:i});return(!(Array.isArray(h)&&h.length>0)||!h.some(g=>g&&g.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let s=await t.getNoteContent({uuid:i});if(de(s,o,l.uuid))return await t.alert(`"${l.name}" is already open in this note - scroll to the viewer.`),l.uuid;let c=le(o,{attachmentUUID:l.uuid,attachmentName:l.name}),n=Ze(s,l.uuid,c);return n!==null?(await t.replaceNoteContent({uuid:i},n),l.uuid):(await t.insertNoteContent({uuid:i},`
${c}
`,{atEnd:!0}),l.uuid)}var Zt="Raw markdown";function Qt(t){let i=(String(t||"").match(/`+/g)||[]).reduce((o,l)=>Math.max(o,l.length),0);return"`".repeat(Math.max(3,i+1))}async function tt(t,i){let o=await t.getNoteContent({uuid:i});if(typeof o!="string"||o==="")return await t.alert("That note came back empty - nothing to dump."),null;let l=await t.getNoteAttachments({uuid:i}),s=(Array.isArray(l)?l:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=Qt(o),n=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:n},`# Attachments

${s||"- (none)"}

# ${Zt}

${c}
${o}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),n}async function nt(t,i,o){if(!i)return"";let l=await se(t,i);if(!l){let c=await t.getNoteAttachments({uuid:i});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let s=await t.getNoteContent({uuid:i});return de(s,o,l.uuid)?(await t.alert(`"${l.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${le(o,{attachmentUUID:l.uuid,attachmentName:l.name})}
`}async function ot(t,i){let{noteUUID:o,attachmentUUID:l,page:s,highlightId:c}=ne(i);if(!o){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let n=await t.getNoteContent({uuid:o}),h=Ce(n,t.context.pluginUUID,l,{page:s,highlightId:c,collapsed:!1});h!==null&&await t.replaceNoteContent({uuid:o},h)}catch{}await t.navigate(`https://www.amplenote.com/notes/${o}`)}function ce(t){if(!t)return null;let i=String(t).trim().toLowerCase();return re.find(o=>o.id===i||o.hex.toLowerCase()===i)||null}function at(){return ce(ie)}function Kt(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function he({page:t,color:i,rects:o,quoteText:l,note:s=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(o)||o.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of o)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let n=ce(i)||at();return{id:c||Kt(),page:t,color:n.id,rects:o.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(l||""),note:s?String(s):null}}function rt(t,i){let o=i==null?null:String(i).trim();return{...t,note:o||null}}function it(t,i){let o=ce(i);if(!o)throw new Error(`withColor: unknown color "${i}"`);return{...t,color:o.id}}function st(t,i){return(t||[]).filter(o=>o.id!==i)}function Ee(t,i,o){let l=!1,s=(t||[]).map(c=>c.id!==i?c:(l=!0,o(c)));return l?s:t}var en="json",lt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function dt(t){let i=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${lt}
\`\`\`${en}
${i}
\`\`\``}function Ne(t){if(!t)return null;let i=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),o=!i&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),l=(i?i[1]:o?o[1]:t).trim();if(!l)return null;try{return JSON.parse(l)}catch{return null}}function tn(t){if(!Array.isArray(t))return[];let i=[];for(let o of t)try{i.push(he(o))}catch{}return i}async function pe(t,i,o){let l=await t.getNoteContent({uuid:i}),s=Te(l,G),c=Ne(s);return!c||typeof c!="object"?[]:tn(c[o])}async function ct(t,i,o,l){let s={uuid:i},c=await t.getNoteContent(s),n=Te(c,G),b={...Ne(n)||{},[o]:l},g=dt(b);n===null&&await t.insertNoteContent(s,`

# ${G}

`,{atEnd:!0});let k=on(c,g);if(k!==null){await t.replaceNoteContent(s,k);return}await t.replaceNoteContent(s,g,{section:{heading:{text:G,level:1}}})}async function ht(t,i,o){let l={uuid:i},s=await t.getNoteContent(l),c=Te(s,G);if(c===null)return;let n=Ne(c)||{};if(!(o in n))return;let h={...n};delete h[o],await t.replaceNoteContent(l,dt(h),{section:{heading:{text:G,level:1}}})}function Se(t,i){let o=/^#\s+(.*)$/,l=t.findIndex(c=>{let n=c.match(o);return n&&n[1].trim()===i});if(l===-1)return null;let s=t.length;for(let c=l+1;c<t.length;c++)if(/^#\s+/.test(t[c])){s=c;break}return{start:l,end:s}}function Te(t,i){if(!t)return null;let o=t.split(`
`),l=Se(o,i);return l?o.slice(l.start+1,l.end).join(`
`).trim():null}function nn(t){if(!t)return"";let i=t,o=i.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return o&&(i=i.replace(o[0],"")),i=i.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),i=i.replace(lt,""),i.trim()}function pt(t,i){let o=(t||"").split(`
`),l=Se(o,G);if(!l)return null;let s=o.slice(0,l.start).join(`
`).replace(/\s+$/,""),c=o.slice(l.start).join(`
`);return`${s?s+`

`:""}${i}

${c}`}function on(t,i){let o=(t||"").split(`
`),l=Se(o,G);if(!l)return null;let s=nn(o.slice(l.start+1,l.end).join(`
`).trim());if(!s)return null;let c=o.slice(0,l.start).join(`
`).replace(/\s+$/,""),n=o.slice(l.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${s}

${o[l.start]}

${i}${n?`

`+n:""}`}function z(t,i){return i.noteUUID||t.context.noteUUID}async function ut(t,i,o){try{let l=await t.getNoteAttachments({uuid:i}),s=Array.isArray(l)&&l.find(c=>c&&c.uuid===o);return s?s.name:""}catch{return""}}async function ue(t,i,o,l){let s=await pe(t,i,o),c=l(s);return c!==s&&await ct(t,i,o,c),{highlights:c}}function ft(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let i=t.trim();if(!i.startsWith("{"))return{action:i};try{return JSON.parse(i)}catch{return{action:i}}}async function gt(t,i){return JSON.stringify(await an(t,ft(i)))}async function an(t,i){let o=ft(i);switch(o.action){case"getPdfUrl":{let l=o.attachmentUUID;if(!l)return{error:"No attachment specified for this viewer."};try{return{url:await Je(t,l),name:await ut(t,z(t,o),l)}}catch(s){return{error:`Could not load the PDF: ${s.message}`}}}case"loadHighlights":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await pe(t,z(t,o),o.attachmentUUID)}}catch(l){return{error:`Could not load highlights: ${l.message}`}}}case"addHighlight":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let l=he(o.highlight||{});return await ue(t,z(t,o),o.attachmentUUID,s=>s.concat([l]))}catch(l){return{error:`Could not save the highlight: ${l.message}`}}}case"recolorHighlight":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,z(t,o),o.attachmentUUID,l=>Ee(l,o.id,s=>it(s,o.color)))}catch(l){return{error:`Could not change the highlight color: ${l.message}`}}}case"setHighlightNote":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,z(t,o),o.attachmentUUID,l=>Ee(l,o.id,s=>rt(s,o.note)))}catch(l){return{error:`Could not save the note: ${l.message}`}}}case"removeHighlight":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,z(t,o),o.attachmentUUID,l=>st(l,o.id))}catch(l){return{error:`Could not remove the highlight: ${l.message}`}}}case"sendToNote":{if(!o.content)return{error:"Nothing to send."};try{let l={uuid:z(t,o)},s=await t.getNoteContent(l),c=pt(s,o.content);return c===null?await t.insertNoteContent(l,`
`+o.content+`
`,{atEnd:!0}):await t.replaceNoteContent(l,c),{ok:!0}}catch(l){return{error:`Could not add this to the note: ${l.message}`}}}case"removeViewer":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!o.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=z(t,o),s=await t.getNoteContent({uuid:l}),c=Qe(s,o.pluginUUID,o.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:l},c),await ht(t,l,o.attachmentUUID),{ok:!0})}catch(l){return{error:`Could not remove this viewer: ${l.message}`}}}case"getViewerSummary":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};let l=z(t,o),s=await ut(t,l,o.attachmentUUID);try{let c=await pe(t,l,o.attachmentUUID);return{name:s,count:c.length}}catch{return{name:s,count:0}}}case"setCollapsed":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!o.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=z(t,o),s=await t.getNoteContent({uuid:l}),c=Ke(s,o.pluginUUID,o.attachmentUUID,o.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:l},c),{ok:!0})}catch(l){return{error:`Could not resize this viewer: ${l.message}`}}}case"exportAll":{if(!o.noteName)return{error:"Missing destination note name."};try{let l=await t.findNote({name:o.noteName}),s=l?l.uuid:await t.createNote(o.noteName);return await t.replaceNoteContent({uuid:s},o.content||""),{ok:!0,noteUUID:s}}catch(l){return{error:`Could not export highlights: ${l.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(o.action)}`}}}function Ae(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function i(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function o(u,f){var x=Math.pow(10,f===void 0?2:f),v=function(C){return Math.round(C*x)/x};return{x:v(u.x),y:v(u.y),width:v(u.width),height:v(u.height)}}function l(u){return u.width>.01&&u.height>.01}function s(u,f,x){for(var v=String(u??""),C=Math.max(0,f===void 0?0:f),N=Math.min(v.length,x===void 0?v.length:x),A=function($){return $===""||/\s/.test($)},U=[],I=C;I<N;){for(;I<N&&A(v.charAt(I));)I++;if(I>=N)break;for(var O=I;I<N&&!A(v.charAt(I));)I++;U.push({start:O,end:I})}return U}function c(u){for(var f=1/0,x=1/0,v=-1/0,C=-1/0,N=0;N<(u?u.length:0);N++){var A=u[N];l(A)&&(f=Math.min(f,A.left),x=Math.min(x,A.top),v=Math.max(v,A.left+A.width),C=Math.max(C,A.top+A.height))}return isFinite(f)?{left:f,top:x,width:v-f,height:C-x}:null}function n(u,f,x){for(var v=[],C=0;C<u.length;C++){var N=t(u[C],f);if(l(N)){var A=x(N.x,N.y),U=x(N.x+N.width,N.y+N.height),I=o(i(A,U));l(I)&&v.push(I)}}return v}function h(u,f){var x=f(u.x,u.y),v=f(u.x+u.width,u.y+u.height);return i(x,v)}function b(u,f,x){var v=f.right-f.left,C=f.bottom-f.top;if(v<=0||C<=0)return null;var N=u.x2-u.x1,A=u.y2-u.y1,U=u.x1+(x.left-f.left)/v*N,I=u.x2-(f.right-x.right)/v*N,O=u.y1+(x.bottom-f.bottom)/C*A,$=u.y2-(f.top-x.top)/C*A;return{x:U,y:O,width:I-U,height:$-O}}function g(u,f){var x=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return x>.5*Math.min(u.height,f.height)}function k(u,f){var x=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var v=u.slice().sort(function(V,J){return J.y-V.y||V.x-J.x}),C=[],N=0;N<v.length;N++){for(var A=!1,U=0;U<C.length;U++)if(g(C[U][0],v[N])){C[U].push(v[N]),A=!0;break}A||C.push([v[N]])}for(var I=[],O=0;O<C.length;O++){for(var $=C[O].slice().sort(function(V,J){return V.x-J.x}),D=null,Q=0;Q<$.length;Q++){var H=$[Q];if(D===null){D={x:H.x,y:H.y,width:H.width,height:H.height};continue}var oe=H.x-(D.x+D.width);if(oe<=x*Math.max(D.height,H.height)){var fe=Math.max(D.x+D.width,H.x+H.width),B=Math.max(D.y+D.height,H.y+H.height);D.x=Math.min(D.x,H.x),D.y=Math.min(D.y,H.y),D.width=fe-D.x,D.height=B-D.y}else I.push(D),D={x:H.x,y:H.y,width:H.width,height:H.height}}D!==null&&I.push(D)}return I.map(function(V){return o(V)})}function S(u,f,x,v){var C=v===void 0?0:v;return f>=u.x-C&&f<=u.x+u.width+C&&x>=u.y-C&&x<=u.y+u.height+C}function y(u,f,x,v,C){for(var N=u||[],A=N.length-1;A>=0;A--){var U=N[A];if(!(!U||U.page!==f||!U.rects)){for(var I=0;I<U.rects.length;I++)if(S(U.rects[I],x,v,C===void 0?1:C))return U}}return null}function E(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:i,roundRect:o,isVisibleRect:l,textTokenRanges:s,unionClientRects:c,clientRectsToPdfRects:n,pdfRectToViewportRect:h,itemRelativeRect:b,mergeLineRects:k,rectContainsPoint:S,hitTestHighlights:y,normalizeQuoteText:E}}var _=Ae(),$n=_.clientRectToLocal,jn=_.rectFromCorners,_n=_.roundRect,zn=_.isVisibleRect,Bn=_.textTokenRanges,qn=_.unionClientRects,Gn=_.clientRectsToPdfRects,Vn=_.pdfRectToViewportRect,Wn=_.itemRelativeRect,Jn=_.mergeLineRects,Xn=_.rectContainsPoint,Yn=_.hitTestHighlights,Zn=_.normalizeQuoteText;function ke(){var t=[.957,.871,.424];function i(c,n,h,b,g){var k=n.context.register(n.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),S=[c.pushGraphicsState(),c.setGraphicsState("GS0")];S.push(c.setFillingColor(c.rgb(b[0],b[1],b[2])));for(var y=0;y<h.length;y++){var E=h[y];S.push(c.moveTo(E.x,E.y)),S.push(c.lineTo(E.x,E.y+E.height)),S.push(c.lineTo(E.x+E.width,E.y+E.height)),S.push(c.lineTo(E.x+E.width,E.y)),S.push(c.closePath())}S.push(c.fill()),S.push(c.popGraphicsState());var u=n.context.formXObject(S,{BBox:g,Resources:{ExtGState:{GS0:k}}});return n.context.register(u)}function o(c,n,h,b){for(var g=h.rects,k=[],S=g[0].x,y=g[0].y,E=g[0].x+g[0].width,u=g[0].y+g[0].height,f=0;f<g.length;f++){var x=g[f],v=x.x,C=x.x+x.width,N=x.y,A=x.y+x.height;k.push(v,A,C,A,v,N,C,N),S=Math.min(S,v),y=Math.min(y,N),E=Math.max(E,C),u=Math.max(u,A)}var U=n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:n.context.obj([S,y,E,u]),QuadPoints:n.context.obj(k),C:n.context.obj(b),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&U.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var I=i(c,n,g,b,[S,y,E,u]);U.set(c.PDFName.of("AP"),n.context.obj({N:I}));var O=n.context.register(U),$=[O];if(h.note){var D=n.context.register(n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:n.context.obj([E+8,y-60,E+208,y+12]),Parent:O,Open:!1}));U.set(c.PDFName.of("Popup"),D),$.push(D)}return $}function l(c,n,h){var b=n.node.get(c.PDFName.of("Annots"));if(b instanceof c.PDFArray)for(var g=0;g<h.length;g++)b.push(h[g]);else n.node.set(c.PDFName.of("Annots"),n.doc.context.obj(h))}async function s(c,n,h,b){for(var g=await c.PDFDocument.load(n),k=g.getPages(),S=h||[],y=0;y<S.length;y++){var E=S[y];if(!(!E||!E.rects||!E.rects.length)){var u=k[E.page-1];if(u){var f=b&&b[E.color]||t,x=o(c,g,E,f);l(c,u,x)}}}return g.save()}return{writeHighlightsIntoPdf:s,buildHighlightAnnotation:o,appendAnnotationRefs:l}}var Ie=ke(),Kn=Ie.writeHighlightsIntoPdf,eo=Ie.buildHighlightAnnotation,to=Ie.appendAnnotationRefs;function De(){function t(n){return String(n??"").replace(/\]/g,"\\]")}function i(n,h,b,g,k){var S=new URLSearchParams;h&&S.set("att",h),Number.isFinite(b)&&b>=1&&S.set("page",String(Math.floor(b))),g&&S.set("hl",g),k&&S.set("note",k);var y=S.toString();return"plugin://"+n+(y?"?"+y:"")}function o(n,h){return String(n??"").split(/\r?\n/).map(function(b){return(h+" "+b).replace(/[ \t]+$/,"")})}function l(n,h,b,g,k,S){var y=i(h,b,g.page,g.id,S),E=t(n||"PDF"),u='==\u25CF<!-- {"cycleColor":"'+k+'"} -->==',f=u+" ["+E+"]("+y+")",x=[f].concat(o(g.quoteText,"> >"));return g.note&&(x.push(">"),x=x.concat(o(g.note,">"))),x.join(`
`)}function s(n){return n.slice().sort(function(h,b){if(h.page!==b.page)return h.page-b.page;var g=h.rects&&h.rects[0]?h.rects[0].y:0,k=b.rects&&b.rects[0]?b.rects[0].y:0;return k-g})}function c(n,h,b,g,k,S,y){var E=S&&S.length?S:null,u=(g||[]).filter(function(v){return v&&(!E||E.indexOf(v.color)!==-1)}),f=s(u),x=f.map(function(v){var C=k?k[v.color]:void 0;return l(n,h,b,v,C,y)});return x.join(`

`)}return{buildDeepLink:i,buildHighlightBlock:l,buildExportAllContent:c}}var Pe=De(),oo=Pe.buildDeepLink,ao=Pe.buildHighlightBlock,ro=Pe.buildExportAllContent;function mt(){var t=window.__PDFA_CONFIG||{},i=window.__PDFA_GEOM||{},o=window.__PDFA_ANNOTATIONS||{},l=window.__PDFA_EXPORT||{},s={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(n.attachmentName=e,s.name&&(s.name.textContent=e),s.collapsedName&&(s.collapsedName.textContent=e))}var n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,a){s.status.textContent=e||"",s.status.style.display=e?"block":"none",s.status.className=a?"pdfa-status pdfa-error":"pdfa-status"}function b(e){var a=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(r,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(a)))}catch(p){d(p)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function g(){return t.colors||[]}function k(e){for(var a=g(),r=0;r<a.length;r++)if(a[r].id===e)return a[r].hex;return a.length?a[0].hex:"#F4DE6C"}function S(e){for(var a=0;a<n.highlights.length;a++)if(n.highlights[a].id===e)return n.highlights[a];return null}function y(e,a,r){var d=document.createElement("button");return d.className="pdfa-btn"+(a?" "+a:""),d.textContent=e,d.onclick=function(p){p.stopPropagation(),r()},d}function E(e,a,r,d){var p=document.createElement("button");return p.className="pdfa-color",p.dataset.color=e.id,p.style.background=e.hex,p.title=d+" "+e.label,p.setAttribute("aria-label",d+" "+e.label),p.setAttribute("aria-pressed",String(!!a)),p.onclick=function(m){m.stopPropagation(),r(e.id)},p}function u(){for(var e=g(),a=0;a<e.length;a++)s.colors.appendChild(E(e[a],e[a].id===n.activeColorId,function(r){n.activeColorId=r,f(),n.pendingSelection&&Ue(n.pendingSelection,r)},"Highlight"))}function f(){for(var e=s.colors.querySelectorAll(".pdfa-color"),a=0;a<e.length;a++)e[a].setAttribute("aria-pressed",String(e[a].dataset.color===n.activeColorId))}function x(e,a){var r=e.getViewport({scale:n.scale});n.viewports[a]=r;var d=document.createElement("div");d.className="pdfa-page",d.dataset.page=String(a),d.style.width=r.width+"px",d.style.height=r.height+"px";var p=document.createElement("canvas"),m=window.devicePixelRatio||1;p.width=Math.floor(r.width*m),p.height=Math.floor(r.height*m),p.style.width=r.width+"px",p.style.height=r.height+"px",d.appendChild(p);var w=document.createElement("div");w.className="pdfa-highlights",d.appendChild(w);var T=document.createElement("div");T.className="textLayer",T.style.width=r.width+"px",T.style.height=r.height+"px",T.style.setProperty("--scale-factor",String(n.scale)),d.appendChild(T),s.pages.appendChild(d);var R=p.getContext("2d");return R.scale(m,m),e.render({canvasContext:R,viewport:r}).promise.then(function(){return e.getTextContent()}).then(function(F){var P=[];return window.pdfjsLib.renderTextLayer({textContent:F,container:T,viewport:r,textDivs:P}).promise.then(function(){n.textSpans+=P.length;for(var L=0;L<P.length;L++)P[L].__pdfaItem=F.items[L];N(a)})})}function v(){if(n.rendering)return Promise.resolve();n.rendering=!0,M(!0),s.pages.innerHTML="",n.viewports={},n.textSpans=0,h("Rendering...");for(var e=Promise.resolve(),a=1;a<=n.pageCount;a++)(function(r){e=e.then(function(){return n.doc.getPage(r).then(function(d){return x(d,r)})})})(a);return e.then(function(){n.textSpans===0?h("No selectable text found - this PDF may be a scan.",!0):h(""),n.rendering=!1,K(),xe()}).catch(function(r){n.rendering=!1,h("Failed to render: "+r.message,!0)})}function C(e){return function(a,r){return e.convertToViewportPoint(a,r)}}function N(e){for(var a=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",r=s.pages.querySelectorAll(a),d=0;d<r.length;d++){var p=r[d],m=Number(p.dataset.page),w=p.querySelector(".pdfa-highlights"),T=n.viewports[m];if(!(!w||!T)){w.innerHTML="";for(var R=C(T),F=0;F<n.highlights.length;F++){var P=n.highlights[F];if(!(!P||P.page!==m||!P.rects||!P.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=P.id||"";for(var W=0;W<P.rects.length;W++){var Y=i.pdfRectToViewportRect(P.rects[W],R),j=document.createElement("div");j.className="pdfa-hl",j.style.left=Y.x+"px",j.style.top=Y.y+"px",j.style.width=Y.width+"px",j.style.height=Y.height+"px",j.style.background=k(P.color),L.appendChild(j)}w.appendChild(L)}}}}}function A(){N(),I(),s.count.textContent=String(n.highlights.length)}function U(){return n.highlights.slice().sort(function(e,a){return e.page!==a.page?e.page-a.page:(a.rects[0]?a.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function I(){s.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var a=document.createElement("span");a.textContent="Highlights",e.appendChild(a),e.appendChild(y("Close","",function(){$(!1)})),s.panel.appendChild(e);var r=U();if(!r.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",s.panel.appendChild(d);return}for(var p=0;p<r.length;p++)s.panel.appendChild(O(r[p]))}function O(e){var a=document.createElement("div");a.className="pdfa-hl-row",a.dataset.id=e.id||"",a.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=k(e.color),a.appendChild(r);var d=document.createElement("div"),p=document.createElement("div");p.className="pdfa-hl-page",p.textContent="Page "+e.page,d.appendChild(p);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(m),e.note){var w=document.createElement("div");w.className="pdfa-hl-note",w.textContent=e.note,d.appendChild(w)}return a.appendChild(d),a.onclick=function(){Re(e)},a}function $(e){var a=e===void 0?!s.panel.classList.contains("pdfa-open"):e;s.panel.classList.toggle("pdfa-open",a),s.listToggle.setAttribute("aria-pressed",String(a)),a&&I()}function D(e){for(var a=e&&e.nodeType===1?e:e&&e.parentElement;a;){if(a.classList&&a.classList.contains("textLayer"))return a;a=a.parentElement}return null}function Q(e,a){for(var r=[],d=[],p=null,m=document.createTreeWalker(a,NodeFilter.SHOW_TEXT,null),w;w=m.nextNode();)if(e.intersectsNode(w)){var T=w.nodeValue||"",R=w===e.startContainer?e.startOffset:0,F=w===e.endContainer?e.endOffset:T.length,P=w.parentElement,L=P&&P.__pdfaItem;if(L)for(var W={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},Y=P.getBoundingClientRect(),j=i.textTokenRanges(T,R,F),Z=0;Z<j.length;Z++){var be=document.createRange();be.setStart(w,j[Z].start),be.setEnd(w,j[Z].end);var q=i.unionClientRects(be.getClientRects());if(q){var ze={left:q.left,top:q.top,width:q.width,height:q.height,right:q.left+q.width,bottom:q.top+q.height},Be=i.itemRelativeRect(W,Y,ze);Be&&(r.push(Be),d.push(T.slice(j[Z].start,j[Z].end)),p=ze)}}}return{rects:r,text:d.join(" "),lastCssRect:p}}function H(e){if(n.pendingSelection=e,n.lastCapturedText=e&&e.rawText||"",!e){s.hint.textContent="",s.hint.style.display="none";return}s.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",s.hint.style.display="inline"}function oe(e){if(!n.noteEditing){var a=window.getSelection();if(!a||a.isCollapsed||a.rangeCount===0){H(null),M();return}var r=a.getRangeAt(0),d=D(r.startContainer);if(!d)return H(null);var p=d.parentElement;if(!p||!p.dataset||!p.dataset.page)return H(null);var m=Number(p.dataset.page);if(!n.viewports[m])return H(null);var w=D(r.endContainer)!==d,T=Q(r,d),R=i.mergeLineRects(T.rects);if(!R.length)return H(null);var F=T.lastCssRect||p.getBoundingClientRect(),P=e&&e.clientX?e.clientX:F.left+F.width/2,L=e&&e.clientY?e.clientY:F.top+F.height,W={page:m,rects:R,quoteText:i.normalizeQuoteText(T.text),spilled:w,anchorX:P,anchorY:L,rawText:String(a)};H(W),yt(W)}}var fe=300,B=null;function V(){n.noteEditing||(B&&clearTimeout(B),B=setTimeout(J,fe))}function J(){if(B=null,!n.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||D(e.getRangeAt(0).startContainer)&&String(e)!==n.lastCapturedText&&oe(null)}}function ae(e,a){var r=n.highlights;return n.highlights=e,A(),b(a).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return n.highlights=d.highlights||e,A(),h(""),!0}).catch(function(d){return n.highlights=r,A(),h(d.message||String(d),!0),!1})}function Ue(e,a){var r={id:null,page:e.page,color:a,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,p=e.anchorY;H(null),M(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),ae(n.highlights.concat([r]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:r}).then(function(w){if(w){var T=n.highlights[n.highlights.length-1];T&&T.id&&me(T,d,p,!0)}})}function xt(e,a){M(!0),ae(n.highlights.map(function(r){return r.id===e?Object.assign({},r,{color:a}):r}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:a})}function bt(e){M(!0),ae(n.highlights.filter(function(a){return a.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function ge(e,a){var r=String(a??"").trim();n.noteEditing=null,M(!0),ae(n.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:r||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:r})}function X(e,a,r,d){s.popover.innerHTML="",s.popover.classList.toggle("pdfa-editing",d==="editing"),s.popover.classList.toggle("pdfa-exporting",d==="exporting"),s.popover.classList.toggle("pdfa-menu",d==="menu");for(var p=0;p<e.length;p++)s.popover.appendChild(e[p]);s.popover.classList.add("pdfa-open");var m=s.popover.offsetWidth,w=s.popover.offsetHeight,T=Math.max(4,Math.min(a-m/2,window.innerWidth-m-4)),R=r+12;R+w>window.innerHeight-4&&(R=Math.max(4,r-w-12)),s.popover.style.left=T+"px",s.popover.style.top=R+"px"}function M(e){n.noteEditing&&!e||(n.noteEditing=null,s.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),s.popover.innerHTML="")}function yt(e){for(var a=g(),r=[],d=0;d<a.length;d++)r.push(E(a[d],a[d].id===n.activeColorId,function(p){n.activeColorId=p,f(),Ue(e,p)},"Highlight"));X(r,e.anchorX,e.anchorY)}function me(e,a,r,d){for(var p=g(),m=[],w=0;w<p.length;w++)m.push(E(p[w],p[w].id===e.color,function(R){xt(e.id,R)},"Change to"));var T=!!e.note;m.push(y(T?"Edit note":"Add note",d&&!T?"pdfa-btn-primary":"",function(){Et(e,a,r)})),m.push(y("Copy","",function(){Ut(e)})),m.push(y("Send to note","",function(){Ht(e)})),m.push(y("Remove","pdfa-remove",function(){bt(e.id)})),X(m,a,r)}function Ct(e,a){for(var r=g(),d={},p=0;p<r.length;p++)d[r[p].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var w=document.createElement("div");w.className="pdfa-export-colors";for(var T=0;T<r.length;T++)(function(F){var P=E(F,!0,function(L){d[L]=!d[L],P.setAttribute("aria-pressed",String(d[L]))},"Toggle");w.appendChild(P)})(r[T]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(y("Create / update note","pdfa-btn-primary",function(){for(var F=[],P=0;P<r.length;P++)d[r[P].id]&&F.push(r[P].id);Rt(F.length===r.length?null:F)})),X([m,w,R],e,a,"exporting")}function Et(e,a,r){n.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var p=document.createElement("div");p.className="pdfa-note-actions",e.note&&p.appendChild(y("Delete note","",function(){ge(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",p.appendChild(m),p.appendChild(y("Cancel","",function(){He(e,a,r)})),p.appendChild(y("Save","pdfa-btn-primary",function(){ge(e.id,d.value)})),d.onkeydown=function(w){w.key==="Enter"&&(w.ctrlKey||w.metaKey)?(w.preventDefault(),w.stopPropagation(),ge(e.id,d.value)):w.key==="Escape"&&(w.preventDefault(),w.stopPropagation(),He(e,a,r))},X([d,p],a,r,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function He(e,a,r){n.noteEditing=null;var d=S(e.id)||e;me(d,a,r)}function Nt(e){if(!n.noteEditing){var a=window.getSelection();if(!(a&&!a.isCollapsed)){for(var r=e.target,d=null;r&&r!==s.pages;){if(r.classList&&r.classList.contains("pdfa-page")){d=r;break}r=r.parentElement}if(!d)return M();var p=Number(d.dataset.page),m=n.viewports[p];if(!m)return M();var w=d.getBoundingClientRect(),T=m.convertToPdfPoint(e.clientX-w.left,e.clientY-w.top),R=i.hitTestHighlights(n.highlights,p,T[0],T[1],1);R&&R.id?me(R,e.clientX,e.clientY):M()}}}function K(){s.pageLabel.textContent=n.current+" / "+n.pageCount,s.zoomLabel.textContent=Math.round(n.scale*100)+"%"}function ee(){return s.root.querySelector(".pdfa-scroll")}function ve(e){var a=Math.min(Math.max(1,e),n.pageCount),r=s.pages.querySelector('[data-page="'+a+'"]');r&&r.scrollIntoView({behavior:"smooth",block:"start"}),n.current=a,K()}function Re(e){var a=s.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),r=n.viewports[e.page];if(!(!a||!r||!e.rects||!e.rects.length)){var d=i.pdfRectToViewportRect(e.rects[0],C(r)),p=ee(),m=a.getBoundingClientRect().top+d.y;p.scrollTop+=m-p.getBoundingClientRect().top-p.clientHeight/3,n.current=e.page,K()}}function we(e){return n.scale=Math.min(Math.max(.4,e),4),v()}function St(){return n.doc?n.doc.getPage(1).then(function(e){var a=ee();if(a){var r=window.getComputedStyle(a),d=a.clientWidth-(parseFloat(r.paddingLeft)||0)-(parseFloat(r.paddingRight)||0),p=e.getViewport({scale:1}).width;if(!(!(d>0)||!(p>0))){var m=Math.max(.4,d/p);m<n.scale&&(n.scale=m,K())}}}).catch(function(){}):Promise.resolve()}function Le(e){var a=ee();a&&(a.scrollTop+=e*Math.max(80,a.clientHeight*.85),xe())}function xe(){var e=ee();if(!(!e||!s.scrollUp)){var a=e.scrollHeight-e.clientHeight;s.scrollUp.disabled=e.scrollTop<=1,s.scrollDown.disabled=e.scrollTop>=a-1}}function Tt(){xe(),M();for(var e=s.pages.querySelectorAll(".pdfa-page"),a=n.current,r=1/0,d=0;d<e.length;d++){var p=Math.abs(e[d].getBoundingClientRect().top-60);p<r&&(r=p,a=Number(e[d].dataset.page))}a!==n.current&&(n.current=a,K())}function At(){return new Promise(function(e,a){if(window.pdfjsLib)return e(window.pdfjsLib);var r=document.createElement("script");r.src=t.pdfJsSrc,r.onload=function(){window.pdfjsLib?e(window.pdfjsLib):a(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){a(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function kt(){return new Promise(function(e,a){if(window.PDFLib)return e(window.PDFLib);var r=document.createElement("script");r.src=t.pdfLibSrc,r.onload=function(){window.PDFLib?e(window.PDFLib):a(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){a(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function It(){for(var e={},a=g(),r=0;r<a.length;r++)a[r].rgb&&(e[a[r].id]=a[r].rgb);return e}function Dt(){var e=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Me(){for(var e={},a=g(),r=0;r<a.length;r++)a[r].cycleIndex!==void 0&&(e[a[r].id]=a[r].cycleIndex);return e}function Fe(){var e=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Oe(e){return l.buildHighlightBlock(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,Me()[e.color],t.noteUUID)}function Pt(e){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(e):new Promise(function(a,r){var d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select();var p=!1;try{p=document.execCommand("copy")}catch{p=!1}document.body.removeChild(d),p?a():r(new Error("Clipboard access is unavailable here."))})}function Ut(e){M(!0),Pt(Oe(e)).then(function(){h("Highlight copied - paste it into any note.")}).catch(function(a){h("Could not copy: "+(a.message||a),!0)})}function Ht(e){M(!0),b({action:"sendToNote",content:Oe(e)}).then(function(a){if(!a||a.error)throw new Error(a&&a.error||"Could not send this to the note.");h("Sent to the bottom of this note.")}).catch(function(a){h(a.message||String(a),!0)})}function Rt(e){M(!0);var a=l.buildExportAllContent(n.attachmentName,t.pluginUUID,t.attachmentUUID,n.highlights,Me(),e,t.noteUUID);if(!a){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}b({action:"exportAll",noteName:Fe(),content:a}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");h('Exported to "'+Fe()+'".')}).catch(function(r){h(r.message||String(r),!0)})}function $e(e,a){var r=document.createElement("div");r.className="pdfa-menu-name",r.textContent=n.attachmentName||"PDF Annotator",r.title=r.textContent;var d=[r];window.matchMedia&&window.matchMedia("(max-width: 520px)").matches&&d.push(Lt(e,a)),d.push(y("Collapse","",function(){M(!0),jt()}),y("Download","",function(){M(!0),Ot()}),y("Export...","",function(){Ct(e,a)}),y("Remove viewer...","pdfa-remove",function(){Mt(e,a)})),X(d,e,a,"menu")}function Lt(e,a){var r=document.createElement("div");r.className="pdfa-menu-zoom";var d=document.createElement("span");d.className="pdfa-menu-zoom-label",d.textContent=Math.round(n.scale*100)+"%";var p=function(T){return function(){we(n.scale+T).then(function(){$e(e,a)})}},m=y("\u2212","",p(-.25)),w=y("+","",p(.25));return m.title="Zoom out",w.title="Zoom in",m.disabled=n.scale<=.4,w.disabled=n.scale>=4,r.appendChild(m),r.appendChild(d),r.appendChild(w),r}function Mt(e,a){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(y("Cancel","",function(){M(!0)}));var p=document.createElement("span");p.className="pdfa-spacer",d.appendChild(p),d.appendChild(y("Remove","pdfa-remove",Ft)),X([r,d],e,a,"exporting")}function Ft(){M(!0),h("Removing this viewer..."),b({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function Ot(){n.pdfBytes&&(h("Preparing the download..."),kt().then(function(e){return o.writeHighlightsIntoPdf(e,n.pdfBytes,n.highlights,It())}).then(function(e){var a=new Blob([e],{type:"application/pdf"}),r=URL.createObjectURL(a),d=document.createElement("a");d.href=r,d.download=Dt(),document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3),h("")}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function $t(){return b({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");n.highlights=e.highlights||[]}).catch(function(e){n.highlights=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function jt(){var e=n.highlights.length;s.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",s.root.classList.add("pdfa-collapsed-mode"),je(!0)}function je(e){b({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function _t(){s.root.classList.remove("pdfa-collapsed-mode"),n.doc||_e(),je(!1)}function _e(){h("Loading PDF..."),At().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,b({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return n.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return n.doc=e,n.pageCount=e.numPages,$t()}).then(function(){return St()}).then(function(){return v()}).then(function(){A();var e=t.highlightId?S(t.highlightId):null;e?Re(e):t.page&&ve(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ve(n.current-1)},document.getElementById("pdfa-next").onclick=function(){ve(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){we(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){we(n.scale-.25)},s.scrollUp.onclick=function(){Le(-1)},s.scrollDown.onclick=function(){Le(1)},s.listToggle.onclick=function(){$()},s.more.onclick=function(e){$e(e.clientX,e.clientY)},ee().addEventListener("scroll",Tt),s.pages.addEventListener("mouseup",oe),s.pages.addEventListener("click",Nt),document.addEventListener("selectionchange",V),s.pages.addEventListener("touchend",function(){B&&clearTimeout(B),B=null,J()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!n.noteEditing&&M()}),document.addEventListener("mousedown",function(e){s.popover.classList.contains("pdfa-open")&&(s.popover.contains(e.target)||M())}),u(),I(),s.root.querySelector(".pdfa-collapsed").onclick=_t,t.collapsed?b({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var a=e.count||0;s.collapsedCount.textContent=a?a+(a===1?" highlight":" highlights"):""}}).catch(function(){}):_e()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function rn(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function sn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var ln=`
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
`,vt={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function wt({attachmentUUID:t,attachmentName:i="",page:o=null,highlightId:l=null,lightDarkMode:s="light",pluginUUID:c=null,noteUUID:n=null,collapsed:h=!1}={}){let b=vt[s]||vt.light,g={attachmentUUID:t,page:o,highlightId:l,pluginUUID:c,noteUUID:n,pdfJsSrc:te.pdfJs,workerSrc:te.pdfJsWorker,pdfLibSrc:te.pdfLib,colors:re.map(k=>({id:k.id,label:k.label,hex:k.hex,rgb:k.rgb,cycleIndex:k.cycleIndex})),defaultColorId:ie,collapsed:h,attachmentName:i};return`<link rel="stylesheet" href="${te.pdfViewerCss}">
<style>:root{${b}}${ln}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${rn(i)}</span>
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
<script>window.__PDFA_CONFIG = ${sn(g)};
window.__PDFA_GEOM = (${Ae.toString()})();
window.__PDFA_ANNOTATIONS = (${ke.toString()})();
window.__PDFA_EXPORT = (${De.toString()})();<\/script>
<script>(${mt.toString()})();<\/script>`}var dn={noteOption:{"Annotate PDF":async function(t,i){return et(t,i,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,i){return tt(t,i)}},insertText:async function(t){return nt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...i){return ot(t,i[0])},renderEmbed:function(t,...i){let{attachmentUUID:o,page:l,highlightId:s,collapsed:c,attachmentName:n}=ne(i[0]);return o?wt({attachmentUUID:o,page:l,highlightId:s,collapsed:c,attachmentName:n,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...i){return gt(t,i[0])}},cn=dn;return Wt(hn);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
