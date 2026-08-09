(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var ye=Object.defineProperty;var qt=Object.getOwnPropertyDescriptor;var Gt=Object.getOwnPropertyNames;var Vt=Object.prototype.hasOwnProperty;var Wt=(t,s)=>{for(var a in s)ye(t,a,{get:s[a],enumerable:!0})},Jt=(t,s,a,l)=>{if(s&&typeof s=="object"||typeof s=="function")for(let i of Gt(s))!Vt.call(t,i)&&i!==a&&ye(t,i,{get:()=>s[i],enumerable:!(l=qt(s,i))||l.enumerable});return t};var Xt=t=>Jt(ye({},"__esModule",{value:!0}),t);var un={};Wt(un,{default:()=>pn});var re=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ie="yellow",G="PDF Annotator data",qe="attachment://",Ge=1,Ve=16,te={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},Yt="https://plugins.amplenote.com/cors-proxy";function We(t){let s=new URL(Yt);return s.searchParams.set("apiurl",t),s.toString()}var Zt="application/pdf";function Qt(t){return Array.isArray(t)?t.filter(s=>s&&s.type===Zt&&s.uuid):[]}async function se(t,s){let a=await t.getNoteAttachments({uuid:s}),l=Qt(a);if(l.length===0)return null;if(l.length===1)return l[0];let i=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:l.map(n=>({label:n.name,value:n.uuid})),value:l[0].uuid}]});if(i==null)return null;let c=Array.isArray(i)?i[0]:i;return l.find(n=>n.uuid===c)||null}async function Je(t,s){if(!s)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(s);if(!a)throw new Error(`No URL returned for attachment ${s}`);return We(a)}function Xe(t){return t?Ve:Ge}function ne(t){let s={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return s;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return s}let l=c=>{let n=a.get(c);if(n===null||n.trim()==="")return null;let h=Number(n);return Number.isFinite(h)?h:null},i=l("page");return{attachmentUUID:a.get("att")||null,page:i!==null&&i>=1?Math.floor(i):null,x:l("x"),y:l("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function Ye({attachmentUUID:t,page:s,x:a,y:l,highlightId:i,collapsed:c,attachmentName:n}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),n&&h.set("n",n),Number.isFinite(s)&&s>=1&&h.set("page",String(Math.floor(s))),Number.isFinite(a)&&h.set("x",String(a)),Number.isFinite(l)&&h.set("y",String(l)),i&&h.set("hl",i),h.toString()}function le(t,s={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=Xe(s.collapsed));let l=Ye(s);return`<object data="${l?`plugin://${t}?${l}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function Ze(t,s,a){if(!t||!s||!a)return null;let l=t.split(`
`),i=l.findIndex(n=>n.includes(`${qe}${s}`));if(i===-1)return null;let c=l.slice();return l[i+1]===""?c.splice(i+2,0,a.trim(),""):c.splice(i+1,0,"",a.trim(),""),c.join(`
`)}function de(t,s,a=null){return!t||!s||!t.includes(`plugin://${s}`)?!1:a?t.includes(`att=${a}`):!0}function Qe(t,s,a){if(!t||!s||!a)return null;let l=t.split(`
`),i=`plugin://${s}`,c=l.findIndex(h=>h.includes(i)&&h.includes(`att=${a}`));if(c===-1)return null;let n=l.slice();return n.splice(c,1),n[c]===""&&n[c-1]===""&&n.splice(c,1),n.join(`
`)}function Ce(t,s,a,l={}){if(!t||!s||!a)return null;let i=t.split(`
`),c=`plugin://${s}`,n=i.findIndex(A=>A.includes(c)&&A.includes(`att=${a}`));if(n===-1)return null;let h=i[n],b=h.match(/data="(plugin:\/\/[^"]*)"/);if(!b)return null;let g=b[1],k=g.indexOf("?"),S=k===-1?"":g.slice(k+1),E={...ne(S),attachmentUUID:a,...l},u=Ye(E),f=u?`plugin://${s}?${u}`:`plugin://${s}`,x=i.slice(),v=h.replace(b[0],`data="${f}"`),C=Xe(E.collapsed),N=v.match(/data-aspect-ratio="[^"]*"/);return v=N?v.replace(N[0],`data-aspect-ratio="${C}"`):v.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),x[n]=v,x.join(`
`)}function Ke(t,s,a,l){return Ce(t,s,a,{collapsed:!!l})}async function et(t,s,a){let l=await se(t,s);if(!l){let h=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(h)&&h.length>0)||!h.some(g=>g&&g.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let i=await t.getNoteContent({uuid:s});if(de(i,a,l.uuid))return await t.alert(`"${l.name}" is already open in this note - scroll to the viewer.`),l.uuid;let c=le(a,{attachmentUUID:l.uuid,attachmentName:l.name}),n=Ze(i,l.uuid,c);return n!==null?(await t.replaceNoteContent({uuid:s},n),l.uuid):(await t.insertNoteContent({uuid:s},`
${c}
`,{atEnd:!0}),l.uuid)}var Kt="Raw markdown";function en(t){let s=(String(t||"").match(/`+/g)||[]).reduce((a,l)=>Math.max(a,l.length),0);return"`".repeat(Math.max(3,s+1))}async function tt(t,s){let a=await t.getNoteContent({uuid:s});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let l=await t.getNoteAttachments({uuid:s}),i=(Array.isArray(l)?l:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=en(a),n=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:n},`# Attachments

${i||"- (none)"}

# ${Kt}

${c}
${a}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),n}async function nt(t,s,a){if(!s)return"";let l=await se(t,s);if(!l){let c=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let i=await t.getNoteContent({uuid:s});return de(i,a,l.uuid)?(await t.alert(`"${l.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${le(a,{attachmentUUID:l.uuid,attachmentName:l.name})}
`}async function ot(t,s){let{noteUUID:a,attachmentUUID:l,page:i,highlightId:c}=ne(s);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let n=await t.getNoteContent({uuid:a}),h=Ce(n,t.context.pluginUUID,l,{page:i,highlightId:c,collapsed:!1});h!==null&&await t.replaceNoteContent({uuid:a},h)}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function ce(t){if(!t)return null;let s=String(t).trim().toLowerCase();return re.find(a=>a.id===s||a.hex.toLowerCase()===s)||null}function at(){return ce(ie)}function tn(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function he({page:t,color:s,rects:a,quoteText:l,note:i=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of a)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let n=ce(s)||at();return{id:c||tn(),page:t,color:n.id,rects:a.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(l||""),note:i?String(i):null}}function rt(t,s){let a=s==null?null:String(s).trim();return{...t,note:a||null}}function it(t,s){let a=ce(s);if(!a)throw new Error(`withColor: unknown color "${s}"`);return{...t,color:a.id}}function st(t,s){return(t||[]).filter(a=>a.id!==s)}function Ee(t,s,a){let l=!1,i=(t||[]).map(c=>c.id!==s?c:(l=!0,a(c)));return l?i:t}var nn="json",lt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function dt(t){let s=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${lt}
\`\`\`${nn}
${s}
\`\`\``}function Ne(t){if(!t)return null;let s=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!s&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),l=(s?s[1]:a?a[1]:t).trim();if(!l)return null;try{return JSON.parse(l)}catch{return null}}function on(t){if(!Array.isArray(t))return[];let s=[];for(let a of t)try{s.push(he(a))}catch{}return s}async function pe(t,s,a){let l=await t.getNoteContent({uuid:s}),i=Te(l,G),c=Ne(i);return!c||typeof c!="object"?[]:on(c[a])}async function ct(t,s,a,l){let i={uuid:s},c=await t.getNoteContent(i),n=Te(c,G),b={...Ne(n)||{},[a]:l},g=dt(b);n===null&&await t.insertNoteContent(i,`

# ${G}

`,{atEnd:!0});let k=rn(c,g);if(k!==null){await t.replaceNoteContent(i,k);return}await t.replaceNoteContent(i,g,{section:{heading:{text:G,level:1}}})}async function ht(t,s,a){let l={uuid:s},i=await t.getNoteContent(l),c=Te(i,G);if(c===null)return;let n=Ne(c)||{};if(!(a in n))return;let h={...n};delete h[a],await t.replaceNoteContent(l,dt(h),{section:{heading:{text:G,level:1}}})}function Se(t,s){let a=/^#\s+(.*)$/,l=t.findIndex(c=>{let n=c.match(a);return n&&n[1].trim()===s});if(l===-1)return null;let i=t.length;for(let c=l+1;c<t.length;c++)if(/^#\s+/.test(t[c])){i=c;break}return{start:l,end:i}}function Te(t,s){if(!t)return null;let a=t.split(`
`),l=Se(a,s);return l?a.slice(l.start+1,l.end).join(`
`).trim():null}function an(t){if(!t)return"";let s=t,a=s.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return a&&(s=s.replace(a[0],"")),s=s.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),s=s.replace(lt,""),s.trim()}function pt(t,s){let a=(t||"").split(`
`),l=Se(a,G);if(!l)return null;let i=a.slice(0,l.start).join(`
`).replace(/\s+$/,""),c=a.slice(l.start).join(`
`);return`${i?i+`

`:""}${s}

${c}`}function rn(t,s){let a=(t||"").split(`
`),l=Se(a,G);if(!l)return null;let i=an(a.slice(l.start+1,l.end).join(`
`).trim());if(!i)return null;let c=a.slice(0,l.start).join(`
`).replace(/\s+$/,""),n=a.slice(l.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${i}

${a[l.start]}

${s}${n?`

`+n:""}`}function z(t,s){return s.noteUUID||t.context.noteUUID}async function ut(t,s,a){try{let l=await t.getNoteAttachments({uuid:s}),i=Array.isArray(l)&&l.find(c=>c&&c.uuid===a);return i?i.name:""}catch{return""}}async function ue(t,s,a,l){let i=await pe(t,s,a),c=l(i);return c!==i&&await ct(t,s,a,c),{highlights:c}}function ft(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let s=t.trim();if(!s.startsWith("{"))return{action:s};try{return JSON.parse(s)}catch{return{action:s}}}async function gt(t,s){return JSON.stringify(await sn(t,ft(s)))}async function sn(t,s){let a=ft(s);switch(a.action){case"getPdfUrl":{let l=a.attachmentUUID;if(!l)return{error:"No attachment specified for this viewer."};try{return{url:await Je(t,l),name:await ut(t,z(t,a),l)}}catch(i){return{error:`Could not load the PDF: ${i.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await pe(t,z(t,a),a.attachmentUUID)}}catch(l){return{error:`Could not load highlights: ${l.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let l=he(a.highlight||{});return await ue(t,z(t,a),a.attachmentUUID,i=>i.concat([l]))}catch(l){return{error:`Could not save the highlight: ${l.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,z(t,a),a.attachmentUUID,l=>Ee(l,a.id,i=>it(i,a.color)))}catch(l){return{error:`Could not change the highlight color: ${l.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,z(t,a),a.attachmentUUID,l=>Ee(l,a.id,i=>rt(i,a.note)))}catch(l){return{error:`Could not save the note: ${l.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,z(t,a),a.attachmentUUID,l=>st(l,a.id))}catch(l){return{error:`Could not remove the highlight: ${l.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{let l={uuid:z(t,a)},i=await t.getNoteContent(l),c=pt(i,a.content);return c===null?await t.insertNoteContent(l,`
`+a.content+`
`,{atEnd:!0}):await t.replaceNoteContent(l,c),{ok:!0}}catch(l){return{error:`Could not add this to the note: ${l.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=z(t,a),i=await t.getNoteContent({uuid:l}),c=Qe(i,a.pluginUUID,a.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:l},c),await ht(t,l,a.attachmentUUID),{ok:!0})}catch(l){return{error:`Could not remove this viewer: ${l.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let l=z(t,a),i=await ut(t,l,a.attachmentUUID);try{let c=await pe(t,l,a.attachmentUUID);return{name:i,count:c.length}}catch{return{name:i,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=z(t,a),i=await t.getNoteContent({uuid:l}),c=Ke(i,a.pluginUUID,a.attachmentUUID,a.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:l},c),{ok:!0})}catch(l){return{error:`Could not resize this viewer: ${l.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let l=await t.findNote({name:a.noteName}),i=l?l.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:i},a.content||""),{ok:!0,noteUUID:i}}catch(l){return{error:`Could not export highlights: ${l.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function Ae(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function s(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function a(u,f){var x=Math.pow(10,f===void 0?2:f),v=function(C){return Math.round(C*x)/x};return{x:v(u.x),y:v(u.y),width:v(u.width),height:v(u.height)}}function l(u){return u.width>.01&&u.height>.01}function i(u,f,x){for(var v=String(u??""),C=Math.max(0,f===void 0?0:f),N=Math.min(v.length,x===void 0?v.length:x),A=function($){return $===""||/\s/.test($)},U=[],I=C;I<N;){for(;I<N&&A(v.charAt(I));)I++;if(I>=N)break;for(var O=I;I<N&&!A(v.charAt(I));)I++;U.push({start:O,end:I})}return U}function c(u){for(var f=1/0,x=1/0,v=-1/0,C=-1/0,N=0;N<(u?u.length:0);N++){var A=u[N];l(A)&&(f=Math.min(f,A.left),x=Math.min(x,A.top),v=Math.max(v,A.left+A.width),C=Math.max(C,A.top+A.height))}return isFinite(f)?{left:f,top:x,width:v-f,height:C-x}:null}function n(u,f,x){for(var v=[],C=0;C<u.length;C++){var N=t(u[C],f);if(l(N)){var A=x(N.x,N.y),U=x(N.x+N.width,N.y+N.height),I=a(s(A,U));l(I)&&v.push(I)}}return v}function h(u,f){var x=f(u.x,u.y),v=f(u.x+u.width,u.y+u.height);return s(x,v)}function b(u,f,x){var v=f.right-f.left,C=f.bottom-f.top;if(v<=0||C<=0)return null;var N=u.x2-u.x1,A=u.y2-u.y1,U=u.x1+(x.left-f.left)/v*N,I=u.x2-(f.right-x.right)/v*N,O=u.y1+(x.bottom-f.bottom)/C*A,$=u.y2-(f.top-x.top)/C*A;return{x:U,y:O,width:I-U,height:$-O}}function g(u,f){var x=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return x>.5*Math.min(u.height,f.height)}function k(u,f){var x=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var v=u.slice().sort(function(V,J){return J.y-V.y||V.x-J.x}),C=[],N=0;N<v.length;N++){for(var A=!1,U=0;U<C.length;U++)if(g(C[U][0],v[N])){C[U].push(v[N]),A=!0;break}A||C.push([v[N]])}for(var I=[],O=0;O<C.length;O++){for(var $=C[O].slice().sort(function(V,J){return V.x-J.x}),D=null,Q=0;Q<$.length;Q++){var H=$[Q];if(D===null){D={x:H.x,y:H.y,width:H.width,height:H.height};continue}var oe=H.x-(D.x+D.width);if(oe<=x*Math.max(D.height,H.height)){var fe=Math.max(D.x+D.width,H.x+H.width),B=Math.max(D.y+D.height,H.y+H.height);D.x=Math.min(D.x,H.x),D.y=Math.min(D.y,H.y),D.width=fe-D.x,D.height=B-D.y}else I.push(D),D={x:H.x,y:H.y,width:H.width,height:H.height}}D!==null&&I.push(D)}return I.map(function(V){return a(V)})}function S(u,f,x,v){var C=v===void 0?0:v;return f>=u.x-C&&f<=u.x+u.width+C&&x>=u.y-C&&x<=u.y+u.height+C}function y(u,f,x,v,C){for(var N=u||[],A=N.length-1;A>=0;A--){var U=N[A];if(!(!U||U.page!==f||!U.rects)){for(var I=0;I<U.rects.length;I++)if(S(U.rects[I],x,v,C===void 0?1:C))return U}}return null}function E(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:s,roundRect:a,isVisibleRect:l,textTokenRanges:i,unionClientRects:c,clientRectsToPdfRects:n,pdfRectToViewportRect:h,itemRelativeRect:b,mergeLineRects:k,rectContainsPoint:S,hitTestHighlights:y,normalizeQuoteText:E}}var _=Ae(),_n=_.clientRectToLocal,zn=_.rectFromCorners,Bn=_.roundRect,qn=_.isVisibleRect,Gn=_.textTokenRanges,Vn=_.unionClientRects,Wn=_.clientRectsToPdfRects,Jn=_.pdfRectToViewportRect,Xn=_.itemRelativeRect,Yn=_.mergeLineRects,Zn=_.rectContainsPoint,Qn=_.hitTestHighlights,Kn=_.normalizeQuoteText;function ke(){var t=[.957,.871,.424];function s(c,n,h,b,g){var k=n.context.register(n.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),S=[c.pushGraphicsState(),c.setGraphicsState("GS0")];S.push(c.setFillingColor(c.rgb(b[0],b[1],b[2])));for(var y=0;y<h.length;y++){var E=h[y];S.push(c.moveTo(E.x,E.y)),S.push(c.lineTo(E.x,E.y+E.height)),S.push(c.lineTo(E.x+E.width,E.y+E.height)),S.push(c.lineTo(E.x+E.width,E.y)),S.push(c.closePath())}S.push(c.fill()),S.push(c.popGraphicsState());var u=n.context.formXObject(S,{BBox:g,Resources:{ExtGState:{GS0:k}}});return n.context.register(u)}function a(c,n,h,b){for(var g=h.rects,k=[],S=g[0].x,y=g[0].y,E=g[0].x+g[0].width,u=g[0].y+g[0].height,f=0;f<g.length;f++){var x=g[f],v=x.x,C=x.x+x.width,N=x.y,A=x.y+x.height;k.push(v,A,C,A,v,N,C,N),S=Math.min(S,v),y=Math.min(y,N),E=Math.max(E,C),u=Math.max(u,A)}var U=n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:n.context.obj([S,y,E,u]),QuadPoints:n.context.obj(k),C:n.context.obj(b),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&U.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var I=s(c,n,g,b,[S,y,E,u]);U.set(c.PDFName.of("AP"),n.context.obj({N:I}));var O=n.context.register(U),$=[O];if(h.note){var D=n.context.register(n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:n.context.obj([E+8,y-60,E+208,y+12]),Parent:O,Open:!1}));U.set(c.PDFName.of("Popup"),D),$.push(D)}return $}function l(c,n,h){var b=n.node.get(c.PDFName.of("Annots"));if(b instanceof c.PDFArray)for(var g=0;g<h.length;g++)b.push(h[g]);else n.node.set(c.PDFName.of("Annots"),n.doc.context.obj(h))}async function i(c,n,h,b){for(var g=await c.PDFDocument.load(n),k=g.getPages(),S=h||[],y=0;y<S.length;y++){var E=S[y];if(!(!E||!E.rects||!E.rects.length)){var u=k[E.page-1];if(u){var f=b&&b[E.color]||t,x=a(c,g,E,f);l(c,u,x)}}}return g.save()}return{writeHighlightsIntoPdf:i,buildHighlightAnnotation:a,appendAnnotationRefs:l}}var Ie=ke(),to=Ie.writeHighlightsIntoPdf,no=Ie.buildHighlightAnnotation,oo=Ie.appendAnnotationRefs;function De(){function t(n){return String(n??"").replace(/\]/g,"\\]")}function s(n,h,b,g,k){var S=new URLSearchParams;h&&S.set("att",h),Number.isFinite(b)&&b>=1&&S.set("page",String(Math.floor(b))),g&&S.set("hl",g),k&&S.set("note",k);var y=S.toString();return"plugin://"+n+(y?"?"+y:"")}function a(n,h){return String(n??"").split(/\r?\n/).map(function(b){return(h+" "+b).replace(/[ \t]+$/,"")})}function l(n,h,b,g,k,S){var y=s(h,b,g.page,g.id,S),E=t(n||"PDF"),u='==\u25CF<!-- {"cycleColor":"'+k+'"} -->==',f=u+" ["+E+"]("+y+")",x=[f].concat(a(g.quoteText,"> >"));return g.note&&(x.push(">"),x=x.concat(a(g.note,">"))),x.join(`
`)}function i(n){return n.slice().sort(function(h,b){if(h.page!==b.page)return h.page-b.page;var g=h.rects&&h.rects[0]?h.rects[0].y:0,k=b.rects&&b.rects[0]?b.rects[0].y:0;return k-g})}function c(n,h,b,g,k,S,y){var E=S&&S.length?S:null,u=(g||[]).filter(function(v){return v&&(!E||E.indexOf(v.color)!==-1)}),f=i(u),x=f.map(function(v){var C=k?k[v.color]:void 0;return l(n,h,b,v,C,y)});return x.join(`

`)}return{buildDeepLink:s,buildHighlightBlock:l,buildExportAllContent:c}}var Pe=De(),ro=Pe.buildDeepLink,io=Pe.buildHighlightBlock,so=Pe.buildExportAllContent;function mt(){var t=window.__PDFA_CONFIG||{},s=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},l=window.__PDFA_EXPORT||{},i={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(n.attachmentName=e,i.name&&(i.name.textContent=e),i.collapsedName&&(i.collapsedName.textContent=e))}var n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,o){i.status.textContent=e||"",i.status.style.display=e?"block":"none",i.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function b(e){var o=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(r,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(o)))}catch(p){d(p)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function g(){return t.colors||[]}function k(e){for(var o=g(),r=0;r<o.length;r++)if(o[r].id===e)return o[r].hex;return o.length?o[0].hex:"#F4DE6C"}function S(e){for(var o=0;o<n.highlights.length;o++)if(n.highlights[o].id===e)return n.highlights[o];return null}function y(e,o,r){var d=document.createElement("button");return d.className="pdfa-btn"+(o?" "+o:""),d.textContent=e,d.onclick=function(p){p.stopPropagation(),r()},d}function E(e,o,r,d){var p=document.createElement("button");return p.className="pdfa-color",p.dataset.color=e.id,p.style.background=e.hex,p.title=d+" "+e.label,p.setAttribute("aria-label",d+" "+e.label),p.setAttribute("aria-pressed",String(!!o)),p.onclick=function(m){m.stopPropagation(),r(e.id)},p}function u(){for(var e=g(),o=0;o<e.length;o++)i.colors.appendChild(E(e[o],e[o].id===n.activeColorId,function(r){n.activeColorId=r,f(),n.pendingSelection&&Ue(n.pendingSelection,r)},"Highlight"))}function f(){for(var e=i.colors.querySelectorAll(".pdfa-color"),o=0;o<e.length;o++)e[o].setAttribute("aria-pressed",String(e[o].dataset.color===n.activeColorId))}function x(e,o){var r=e.getViewport({scale:n.scale});n.viewports[o]=r;var d=document.createElement("div");d.className="pdfa-page",d.dataset.page=String(o),d.style.width=r.width+"px",d.style.height=r.height+"px";var p=document.createElement("canvas"),m=window.devicePixelRatio||1;p.width=Math.floor(r.width*m),p.height=Math.floor(r.height*m),p.style.width=r.width+"px",p.style.height=r.height+"px",d.appendChild(p);var w=document.createElement("div");w.className="pdfa-highlights",d.appendChild(w);var T=document.createElement("div");T.className="textLayer",T.style.width=r.width+"px",T.style.height=r.height+"px",T.style.setProperty("--scale-factor",String(n.scale)),d.appendChild(T),i.pages.appendChild(d);var R=p.getContext("2d");return R.scale(m,m),e.render({canvasContext:R,viewport:r}).promise.then(function(){return e.getTextContent()}).then(function(F){var P=[];return window.pdfjsLib.renderTextLayer({textContent:F,container:T,viewport:r,textDivs:P}).promise.then(function(){n.textSpans+=P.length;for(var L=0;L<P.length;L++)P[L].__pdfaItem=F.items[L];N(o)})})}function v(){if(n.rendering)return Promise.resolve();n.rendering=!0,M(!0),i.pages.innerHTML="",n.viewports={},n.textSpans=0,h("Rendering...");for(var e=Promise.resolve(),o=1;o<=n.pageCount;o++)(function(r){e=e.then(function(){return n.doc.getPage(r).then(function(d){return x(d,r)})})})(o);return e.then(function(){n.textSpans===0?h("No selectable text found - this PDF may be a scan.",!0):h(""),n.rendering=!1,K(),xe()}).catch(function(r){n.rendering=!1,h("Failed to render: "+r.message,!0)})}function C(e){return function(o,r){return e.convertToViewportPoint(o,r)}}function N(e){for(var o=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",r=i.pages.querySelectorAll(o),d=0;d<r.length;d++){var p=r[d],m=Number(p.dataset.page),w=p.querySelector(".pdfa-highlights"),T=n.viewports[m];if(!(!w||!T)){w.innerHTML="";for(var R=C(T),F=0;F<n.highlights.length;F++){var P=n.highlights[F];if(!(!P||P.page!==m||!P.rects||!P.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=P.id||"";for(var W=0;W<P.rects.length;W++){var Y=s.pdfRectToViewportRect(P.rects[W],R),j=document.createElement("div");j.className="pdfa-hl",j.style.left=Y.x+"px",j.style.top=Y.y+"px",j.style.width=Y.width+"px",j.style.height=Y.height+"px",j.style.background=k(P.color),L.appendChild(j)}w.appendChild(L)}}}}}function A(){N(),I(),i.count.textContent=String(n.highlights.length)}function U(){return n.highlights.slice().sort(function(e,o){return e.page!==o.page?e.page-o.page:(o.rects[0]?o.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function I(){i.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",e.appendChild(o),e.appendChild(y("Close","",function(){$(!1)})),i.panel.appendChild(e);var r=U();if(!r.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",i.panel.appendChild(d);return}for(var p=0;p<r.length;p++)i.panel.appendChild(O(r[p]))}function O(e){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=e.id||"",o.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=k(e.color),o.appendChild(r);var d=document.createElement("div"),p=document.createElement("div");p.className="pdfa-hl-page",p.textContent="Page "+e.page,d.appendChild(p);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(m),e.note){var w=document.createElement("div");w.className="pdfa-hl-note",w.textContent=e.note,d.appendChild(w)}return o.appendChild(d),o.onclick=function(){Re(e)},o}function $(e){var o=e===void 0?!i.panel.classList.contains("pdfa-open"):e;i.panel.classList.toggle("pdfa-open",o),i.listToggle.setAttribute("aria-pressed",String(o)),o&&I()}function D(e){for(var o=e&&e.nodeType===1?e:e&&e.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function Q(e,o){for(var r=[],d=[],p=null,m=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),w;w=m.nextNode();)if(e.intersectsNode(w)){var T=w.nodeValue||"",R=w===e.startContainer?e.startOffset:0,F=w===e.endContainer?e.endOffset:T.length,P=w.parentElement,L=P&&P.__pdfaItem;if(L)for(var W={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},Y=P.getBoundingClientRect(),j=s.textTokenRanges(T,R,F),Z=0;Z<j.length;Z++){var be=document.createRange();be.setStart(w,j[Z].start),be.setEnd(w,j[Z].end);var q=s.unionClientRects(be.getClientRects());if(q){var ze={left:q.left,top:q.top,width:q.width,height:q.height,right:q.left+q.width,bottom:q.top+q.height},Be=s.itemRelativeRect(W,Y,ze);Be&&(r.push(Be),d.push(T.slice(j[Z].start,j[Z].end)),p=ze)}}}return{rects:r,text:d.join(" "),lastCssRect:p}}function H(e){if(n.pendingSelection=e,n.lastCapturedText=e&&e.rawText||"",!e){i.hint.textContent="",i.hint.style.display="none";return}i.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",i.hint.style.display="inline"}function oe(e){if(!n.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){H(null),M();return}var r=o.getRangeAt(0),d=D(r.startContainer);if(!d)return H(null);var p=d.parentElement;if(!p||!p.dataset||!p.dataset.page)return H(null);var m=Number(p.dataset.page);if(!n.viewports[m])return H(null);var w=D(r.endContainer)!==d,T=Q(r,d),R=s.mergeLineRects(T.rects);if(!R.length)return H(null);var F=T.lastCssRect||p.getBoundingClientRect(),P=e&&e.clientX?e.clientX:F.left+F.width/2,L=e&&e.clientY?e.clientY:F.top+F.height,W={page:m,rects:R,quoteText:s.normalizeQuoteText(T.text),spilled:w,anchorX:P,anchorY:L,rawText:String(o)};H(W),yt(W)}}var fe=300,B=null;function V(){n.noteEditing||(B&&clearTimeout(B),B=setTimeout(J,fe))}function J(){if(B=null,!n.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||D(e.getRangeAt(0).startContainer)&&String(e)!==n.lastCapturedText&&oe(null)}}function ae(e,o){var r=n.highlights;return n.highlights=e,A(),b(o).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return n.highlights=d.highlights||e,A(),h(""),!0}).catch(function(d){return n.highlights=r,A(),h(d.message||String(d),!0),!1})}function Ue(e,o){var r={id:null,page:e.page,color:o,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,p=e.anchorY;H(null),M(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),ae(n.highlights.concat([r]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:r}).then(function(w){if(w){var T=n.highlights[n.highlights.length-1];T&&T.id&&me(T,d,p,!0)}})}function xt(e,o){M(!0),ae(n.highlights.map(function(r){return r.id===e?Object.assign({},r,{color:o}):r}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:o})}function bt(e){M(!0),ae(n.highlights.filter(function(o){return o.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function ge(e,o){var r=String(o??"").trim();n.noteEditing=null,M(!0),ae(n.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:r||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:r})}function X(e,o,r,d){i.popover.innerHTML="",i.popover.classList.toggle("pdfa-editing",d==="editing"),i.popover.classList.toggle("pdfa-exporting",d==="exporting"),i.popover.classList.toggle("pdfa-menu",d==="menu");for(var p=0;p<e.length;p++)i.popover.appendChild(e[p]);i.popover.classList.add("pdfa-open");var m=i.popover.offsetWidth,w=i.popover.offsetHeight,T=Math.max(4,Math.min(o-m/2,window.innerWidth-m-4)),R=r+12;R+w>window.innerHeight-4&&(R=Math.max(4,r-w-12)),i.popover.style.left=T+"px",i.popover.style.top=R+"px"}function M(e){n.noteEditing&&!e||(n.noteEditing=null,i.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),i.popover.innerHTML="")}function yt(e){for(var o=g(),r=[],d=0;d<o.length;d++)r.push(E(o[d],o[d].id===n.activeColorId,function(p){n.activeColorId=p,f(),Ue(e,p)},"Highlight"));X(r,e.anchorX,e.anchorY)}function me(e,o,r,d){for(var p=g(),m=[],w=0;w<p.length;w++)m.push(E(p[w],p[w].id===e.color,function(R){xt(e.id,R)},"Change to"));var T=!!e.note;m.push(y(T?"Edit note":"Add note",d&&!T?"pdfa-btn-primary":"",function(){Et(e,o,r)})),m.push(y("Copy","",function(){Rt(e)})),m.push(y("Send to note","",function(){Lt(e)})),m.push(y("Remove","pdfa-remove",function(){bt(e.id)})),X(m,o,r)}function Ct(e,o){for(var r=g(),d={},p=0;p<r.length;p++)d[r[p].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var w=document.createElement("div");w.className="pdfa-export-colors";for(var T=0;T<r.length;T++)(function(F){var P=E(F,!0,function(L){d[L]=!d[L],P.setAttribute("aria-pressed",String(d[L]))},"Toggle");w.appendChild(P)})(r[T]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(y("Create / update note","pdfa-btn-primary",function(){for(var F=[],P=0;P<r.length;P++)d[r[P].id]&&F.push(r[P].id);Mt(F.length===r.length?null:F)})),X([m,w,R],e,o,"exporting")}function Et(e,o,r){n.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var p=document.createElement("div");p.className="pdfa-note-actions",e.note&&p.appendChild(y("Delete note","",function(){ge(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",p.appendChild(m),p.appendChild(y("Cancel","",function(){He(e,o,r)})),p.appendChild(y("Save","pdfa-btn-primary",function(){ge(e.id,d.value)})),d.onkeydown=function(w){w.key==="Enter"&&(w.ctrlKey||w.metaKey)?(w.preventDefault(),w.stopPropagation(),ge(e.id,d.value)):w.key==="Escape"&&(w.preventDefault(),w.stopPropagation(),He(e,o,r))},X([d,p],o,r,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function He(e,o,r){n.noteEditing=null;var d=S(e.id)||e;me(d,o,r)}function Nt(e){if(!n.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var r=e.target,d=null;r&&r!==i.pages;){if(r.classList&&r.classList.contains("pdfa-page")){d=r;break}r=r.parentElement}if(!d)return M();var p=Number(d.dataset.page),m=n.viewports[p];if(!m)return M();var w=d.getBoundingClientRect(),T=m.convertToPdfPoint(e.clientX-w.left,e.clientY-w.top),R=s.hitTestHighlights(n.highlights,p,T[0],T[1],1);R&&R.id?me(R,e.clientX,e.clientY):M()}}}function K(){i.pageLabel.textContent=n.current+" / "+n.pageCount,i.zoomLabel.textContent=Math.round(n.scale*100)+"%"}function ee(){return i.root.querySelector(".pdfa-scroll")}function ve(e){var o=Math.min(Math.max(1,e),n.pageCount),r=i.pages.querySelector('[data-page="'+o+'"]');r&&r.scrollIntoView({behavior:"smooth",block:"start"}),n.current=o,K()}function Re(e){var o=i.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),r=n.viewports[e.page];if(!(!o||!r||!e.rects||!e.rects.length)){var d=s.pdfRectToViewportRect(e.rects[0],C(r)),p=ee(),m=o.getBoundingClientRect().top+d.y;p.scrollTop+=m-p.getBoundingClientRect().top-p.clientHeight/3,n.current=e.page,K()}}function St(){try{i.root.setAttribute("tabindex","-1"),i.root.focus()}catch{}}function Tt(e){if(!(!e||!e.id)){var o=i.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');o&&(o.classList.add("pdfa-hl-flash"),setTimeout(function(){o.classList.remove("pdfa-hl-flash")},2600))}}function we(e){return n.scale=Math.min(Math.max(.4,e),4),v()}function At(){return n.doc?n.doc.getPage(1).then(function(e){var o=ee();if(o){var r=window.getComputedStyle(o),d=o.clientWidth-(parseFloat(r.paddingLeft)||0)-(parseFloat(r.paddingRight)||0),p=e.getViewport({scale:1}).width;if(!(!(d>0)||!(p>0))){var m=Math.max(.4,d/p);m<n.scale&&(n.scale=m,K())}}}).catch(function(){}):Promise.resolve()}function Le(e){var o=ee();o&&(o.scrollTop+=e*Math.max(80,o.clientHeight*.85),xe())}function xe(){var e=ee();if(!(!e||!i.scrollUp)){var o=e.scrollHeight-e.clientHeight;i.scrollUp.disabled=e.scrollTop<=1,i.scrollDown.disabled=e.scrollTop>=o-1}}function kt(){xe(),M();for(var e=i.pages.querySelectorAll(".pdfa-page"),o=n.current,r=1/0,d=0;d<e.length;d++){var p=Math.abs(e[d].getBoundingClientRect().top-60);p<r&&(r=p,o=Number(e[d].dataset.page))}o!==n.current&&(n.current=o,K())}function It(){return new Promise(function(e,o){if(window.pdfjsLib)return e(window.pdfjsLib);var r=document.createElement("script");r.src=t.pdfJsSrc,r.onload=function(){window.pdfjsLib?e(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function Dt(){return new Promise(function(e,o){if(window.PDFLib)return e(window.PDFLib);var r=document.createElement("script");r.src=t.pdfLibSrc,r.onload=function(){window.PDFLib?e(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function Pt(){for(var e={},o=g(),r=0;r<o.length;r++)o[r].rgb&&(e[o[r].id]=o[r].rgb);return e}function Ut(){var e=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Me(){for(var e={},o=g(),r=0;r<o.length;r++)o[r].cycleIndex!==void 0&&(e[o[r].id]=o[r].cycleIndex);return e}function Fe(){var e=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Oe(e){return l.buildHighlightBlock(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,Me()[e.color],t.noteUUID)}function Ht(e){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(e):new Promise(function(o,r){var d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select();var p=!1;try{p=document.execCommand("copy")}catch{p=!1}document.body.removeChild(d),p?o():r(new Error("Clipboard access is unavailable here."))})}function Rt(e){M(!0),Ht(Oe(e)).then(function(){h("Highlight copied - paste it into any note.")}).catch(function(o){h("Could not copy: "+(o.message||o),!0)})}function Lt(e){M(!0),b({action:"sendToNote",content:Oe(e)}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");h("Sent to the bottom of this note.")}).catch(function(o){h(o.message||String(o),!0)})}function Mt(e){M(!0);var o=l.buildExportAllContent(n.attachmentName,t.pluginUUID,t.attachmentUUID,n.highlights,Me(),e,t.noteUUID);if(!o){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}b({action:"exportAll",noteName:Fe(),content:o}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");h('Exported to "'+Fe()+'".')}).catch(function(r){h(r.message||String(r),!0)})}function $e(e,o){var r=document.createElement("div");r.className="pdfa-menu-name",r.textContent=n.attachmentName||"PDF Annotator",r.title=r.textContent;var d=[r];window.matchMedia&&window.matchMedia("(max-width: 520px)").matches&&d.push(Ft(e,o)),d.push(y("Collapse","",function(){M(!0),zt()}),y("Download","",function(){M(!0),jt()}),y("Export...","",function(){Ct(e,o)}),y("Remove viewer...","pdfa-remove",function(){Ot(e,o)})),X(d,e,o,"menu")}function Ft(e,o){var r=document.createElement("div");r.className="pdfa-menu-zoom";var d=document.createElement("span");d.className="pdfa-menu-zoom-label",d.textContent=Math.round(n.scale*100)+"%";var p=function(T){return function(){we(n.scale+T).then(function(){$e(e,o)})}},m=y("\u2212","",p(-.25)),w=y("+","",p(.25));return m.title="Zoom out",w.title="Zoom in",m.disabled=n.scale<=.4,w.disabled=n.scale>=4,r.appendChild(m),r.appendChild(d),r.appendChild(w),r}function Ot(e,o){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(y("Cancel","",function(){M(!0)}));var p=document.createElement("span");p.className="pdfa-spacer",d.appendChild(p),d.appendChild(y("Remove","pdfa-remove",$t)),X([r,d],e,o,"exporting")}function $t(){M(!0),h("Removing this viewer..."),b({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function jt(){n.pdfBytes&&(h("Preparing the download..."),Dt().then(function(e){return a.writeHighlightsIntoPdf(e,n.pdfBytes,n.highlights,Pt())}).then(function(e){var o=new Blob([e],{type:"application/pdf"}),r=URL.createObjectURL(o),d=document.createElement("a");d.href=r,d.download=Ut(),document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3),h("")}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function _t(){return b({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");n.highlights=e.highlights||[]}).catch(function(e){n.highlights=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function zt(){var e=n.highlights.length;i.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",i.root.classList.add("pdfa-collapsed-mode"),je(!0)}function je(e){b({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Bt(){i.root.classList.remove("pdfa-collapsed-mode"),n.doc||_e(),je(!1)}function _e(){h("Loading PDF..."),It().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,b({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return n.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return n.doc=e,n.pageCount=e.numPages,_t()}).then(function(){return At()}).then(function(){return v()}).then(function(){A();var e=t.highlightId?S(t.highlightId):null;e?(Re(e),Tt(e)):t.page&&ve(t.page),(e||t.page)&&St()}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ve(n.current-1)},document.getElementById("pdfa-next").onclick=function(){ve(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){we(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){we(n.scale-.25)},i.scrollUp.onclick=function(){Le(-1)},i.scrollDown.onclick=function(){Le(1)},i.listToggle.onclick=function(){$()},i.more.onclick=function(e){$e(e.clientX,e.clientY)},ee().addEventListener("scroll",kt),i.pages.addEventListener("mouseup",oe),i.pages.addEventListener("click",Nt),document.addEventListener("selectionchange",V),i.pages.addEventListener("touchend",function(){B&&clearTimeout(B),B=null,J()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!n.noteEditing&&M()}),document.addEventListener("mousedown",function(e){i.popover.classList.contains("pdfa-open")&&(i.popover.contains(e.target)||M())}),u(),I(),i.root.querySelector(".pdfa-collapsed").onclick=Bt,t.collapsed?b({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var o=e.count||0;i.collapsedCount.textContent=o?o+(o===1?" highlight":" highlights"):""}}).catch(function(){}):_e()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function ln(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function dn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var cn=`
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
`,vt={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function wt({attachmentUUID:t,attachmentName:s="",page:a=null,highlightId:l=null,lightDarkMode:i="light",pluginUUID:c=null,noteUUID:n=null,collapsed:h=!1}={}){let b=vt[i]||vt.light,g={attachmentUUID:t,page:a,highlightId:l,pluginUUID:c,noteUUID:n,pdfJsSrc:te.pdfJs,workerSrc:te.pdfJsWorker,pdfLibSrc:te.pdfLib,colors:re.map(k=>({id:k.id,label:k.label,hex:k.hex,rgb:k.rgb,cycleIndex:k.cycleIndex})),defaultColorId:ie,collapsed:h,attachmentName:s};return`<link rel="stylesheet" href="${te.pdfViewerCss}">
<style>:root{${b}}${cn}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${ln(s)}</span>
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
<script>window.__PDFA_CONFIG = ${dn(g)};
window.__PDFA_GEOM = (${Ae.toString()})();
window.__PDFA_ANNOTATIONS = (${ke.toString()})();
window.__PDFA_EXPORT = (${De.toString()})();<\/script>
<script>(${mt.toString()})();<\/script>`}var hn={noteOption:{"Annotate PDF":async function(t,s){return et(t,s,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,s){return tt(t,s)}},insertText:async function(t){return nt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...s){return ot(t,s[0])},renderEmbed:function(t,...s){let{attachmentUUID:a,page:l,highlightId:i,collapsed:c,attachmentName:n}=ne(s[0]);return a?wt({attachmentUUID:a,page:l,highlightId:i,collapsed:c,attachmentName:n,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...s){return gt(t,s[0])}},pn=hn;return Xt(un);})();

  var plugin = __pluginModule.default;
})();
