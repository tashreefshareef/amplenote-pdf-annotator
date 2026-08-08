(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var be=Object.defineProperty;var Ot=Object.getOwnPropertyDescriptor;var $t=Object.getOwnPropertyNames;var _t=Object.prototype.hasOwnProperty;var jt=(t,s)=>{for(var a in s)be(t,a,{get:s[a],enumerable:!0})},Bt=(t,s,a,l)=>{if(s&&typeof s=="object"||typeof s=="function")for(let i of $t(s))!_t.call(t,i)&&i!==a&&be(t,i,{get:()=>s[i],enumerable:!(l=Ot(s,i))||l.enumerable});return t};var zt=t=>Bt(be({},"__esModule",{value:!0}),t);var rn={};jt(rn,{default:()=>an});var re=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ie="yellow",J="PDF Annotator data",Be="attachment://",ze=1,qe=16,te={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},qt="https://plugins.amplenote.com/cors-proxy";function Ge(t){let s=new URL(qt);return s.searchParams.set("apiurl",t),s.toString()}var Gt="application/pdf";function Vt(t){return Array.isArray(t)?t.filter(s=>s&&s.type===Gt&&s.uuid):[]}async function se(t,s){let a=await t.getNoteAttachments({uuid:s}),l=Vt(a);if(l.length===0)return null;if(l.length===1)return l[0];let i=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:l.map(n=>({label:n.name,value:n.uuid})),value:l[0].uuid}]});if(i==null)return null;let c=Array.isArray(i)?i[0]:i;return l.find(n=>n.uuid===c)||null}async function Ve(t,s){if(!s)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(s);if(!a)throw new Error(`No URL returned for attachment ${s}`);return Ge(a)}function We(t){return t?qe:ze}function ne(t){let s={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return s;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return s}let l=c=>{let n=a.get(c);if(n===null||n.trim()==="")return null;let h=Number(n);return Number.isFinite(h)?h:null},i=l("page");return{attachmentUUID:a.get("att")||null,page:i!==null&&i>=1?Math.floor(i):null,x:l("x"),y:l("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function Je({attachmentUUID:t,page:s,x:a,y:l,highlightId:i,collapsed:c,attachmentName:n}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),n&&h.set("n",n),Number.isFinite(s)&&s>=1&&h.set("page",String(Math.floor(s))),Number.isFinite(a)&&h.set("x",String(a)),Number.isFinite(l)&&h.set("y",String(l)),i&&h.set("hl",i),h.toString()}function le(t,s={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=We(s.collapsed));let l=Je(s);return`<object data="${l?`plugin://${t}?${l}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function Xe(t,s,a){if(!t||!s||!a)return null;let l=t.split(`
`),i=l.findIndex(n=>n.includes(`${Be}${s}`));if(i===-1)return null;let c=l.slice();return l[i+1]===""?c.splice(i+2,0,a.trim(),""):c.splice(i+1,0,"",a.trim(),""),c.join(`
`)}function de(t,s,a=null){return!t||!s||!t.includes(`plugin://${s}`)?!1:a?t.includes(`att=${a}`):!0}function Ye(t,s,a){if(!t||!s||!a)return null;let l=t.split(`
`),i=`plugin://${s}`,c=l.findIndex(h=>h.includes(i)&&h.includes(`att=${a}`));if(c===-1)return null;let n=l.slice();return n.splice(c,1),n[c]===""&&n[c-1]===""&&n.splice(c,1),n.join(`
`)}function ye(t,s,a,l={}){if(!t||!s||!a)return null;let i=t.split(`
`),c=`plugin://${s}`,n=i.findIndex(S=>S.includes(c)&&S.includes(`att=${a}`));if(n===-1)return null;let h=i[n],w=h.match(/data="(plugin:\/\/[^"]*)"/);if(!w)return null;let g=w[1],I=g.indexOf("?"),T=I===-1?"":g.slice(I+1),C={...ne(T),attachmentUUID:a,...l},p=Je(C),f=p?`plugin://${s}?${p}`:`plugin://${s}`,v=i.slice(),m=h.replace(w[0],`data="${f}"`),y=We(C.collapsed),N=m.match(/data-aspect-ratio="[^"]*"/);return m=N?m.replace(N[0],`data-aspect-ratio="${y}"`):m.replace(/\s*\/>\s*$/,` data-aspect-ratio="${y}" />`),v[n]=m,v.join(`
`)}function Qe(t,s,a,l){return ye(t,s,a,{collapsed:!!l})}async function Ke(t,s,a){let l=await se(t,s);if(!l){let h=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(h)&&h.length>0)||!h.some(g=>g&&g.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let i=await t.getNoteContent({uuid:s});if(de(i,a,l.uuid))return await t.alert(`"${l.name}" is already open in this note - scroll to the viewer.`),l.uuid;let c=le(a,{attachmentUUID:l.uuid,attachmentName:l.name}),n=Xe(i,l.uuid,c);return n!==null?(await t.replaceNoteContent({uuid:s},n),l.uuid):(await t.insertNoteContent({uuid:s},`
${c}
`,{atEnd:!0}),l.uuid)}var Wt="Raw markdown";function Jt(t){let s=(String(t||"").match(/`+/g)||[]).reduce((a,l)=>Math.max(a,l.length),0);return"`".repeat(Math.max(3,s+1))}async function Ze(t,s){let a=await t.getNoteContent({uuid:s});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let l=await t.getNoteAttachments({uuid:s}),i=(Array.isArray(l)?l:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=Jt(a),n=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:n},`# Attachments

${i||"- (none)"}

# ${Wt}

${c}
${a}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),n}async function et(t,s,a){if(!s)return"";let l=await se(t,s);if(!l){let c=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let i=await t.getNoteContent({uuid:s});return de(i,a,l.uuid)?(await t.alert(`"${l.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${le(a,{attachmentUUID:l.uuid,attachmentName:l.name})}
`}async function tt(t,s){let{noteUUID:a,attachmentUUID:l,page:i,highlightId:c}=ne(s);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let n=await t.getNoteContent({uuid:a}),h=ye(n,t.context.pluginUUID,l,{page:i,highlightId:c,collapsed:!1});h!==null&&await t.replaceNoteContent({uuid:a},h)}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function ce(t){if(!t)return null;let s=String(t).trim().toLowerCase();return re.find(a=>a.id===s||a.hex.toLowerCase()===s)||null}function nt(){return ce(ie)}function Xt(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function he({page:t,color:s,rects:a,quoteText:l,note:i=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of a)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let n=ce(s)||nt();return{id:c||Xt(),page:t,color:n.id,rects:a.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(l||""),note:i?String(i):null}}function ot(t,s){let a=s==null?null:String(s).trim();return{...t,note:a||null}}function at(t,s){let a=ce(s);if(!a)throw new Error(`withColor: unknown color "${s}"`);return{...t,color:a.id}}function rt(t,s){return(t||[]).filter(a=>a.id!==s)}function Ce(t,s,a){let l=!1,i=(t||[]).map(c=>c.id!==s?c:(l=!0,a(c)));return l?i:t}var Yt="json",Qt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function it(t){let s=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${Qt}
\`\`\`${Yt}
${s}
\`\`\``}function Ee(t){if(!t)return null;let s=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!s&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),l=(s?s[1]:a?a[1]:t).trim();if(!l)return null;try{return JSON.parse(l)}catch{return null}}function Kt(t){if(!Array.isArray(t))return[];let s=[];for(let a of t)try{s.push(he(a))}catch{}return s}async function pe(t,s,a){let l=await t.getNoteContent({uuid:s}),i=Ne(l,J),c=Ee(i);return!c||typeof c!="object"?[]:Kt(c[a])}async function st(t,s,a,l){let i={uuid:s},c=await t.getNoteContent(i),n=Ne(c,J),w={...Ee(n)||{},[a]:l},g=it(w);n===null&&await t.insertNoteContent(i,`

# ${J}

`,{atEnd:!0}),await t.replaceNoteContent(i,g,{section:{heading:{text:J,level:1}}})}async function lt(t,s,a){let l={uuid:s},i=await t.getNoteContent(l),c=Ne(i,J);if(c===null)return;let n=Ee(c)||{};if(!(a in n))return;let h={...n};delete h[a],await t.replaceNoteContent(l,it(h),{section:{heading:{text:J,level:1}}})}function Ne(t,s){if(!t)return null;let a=t.split(`
`),l=/^#\s+(.*)$/,i=a.findIndex(n=>{let h=n.match(l);return h&&h[1].trim()===s});if(i===-1)return null;let c=a.length;for(let n=i+1;n<a.length;n++)if(/^#\s+/.test(a[n])){c=n;break}return a.slice(i+1,c).join(`
`).trim()}function B(t,s){return s.noteUUID||t.context.noteUUID}async function dt(t,s,a){try{let l=await t.getNoteAttachments({uuid:s}),i=Array.isArray(l)&&l.find(c=>c&&c.uuid===a);return i?i.name:""}catch{return""}}async function ue(t,s,a,l){let i=await pe(t,s,a),c=l(i);return c!==i&&await st(t,s,a,c),{highlights:c}}function ct(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let s=t.trim();if(!s.startsWith("{"))return{action:s};try{return JSON.parse(s)}catch{return{action:s}}}async function ht(t,s){return JSON.stringify(await Zt(t,ct(s)))}async function Zt(t,s){let a=ct(s);switch(a.action){case"getPdfUrl":{let l=a.attachmentUUID;if(!l)return{error:"No attachment specified for this viewer."};try{return{url:await Ve(t,l),name:await dt(t,B(t,a),l)}}catch(i){return{error:`Could not load the PDF: ${i.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await pe(t,B(t,a),a.attachmentUUID)}}catch(l){return{error:`Could not load highlights: ${l.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let l=he(a.highlight||{});return await ue(t,B(t,a),a.attachmentUUID,i=>i.concat([l]))}catch(l){return{error:`Could not save the highlight: ${l.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,B(t,a),a.attachmentUUID,l=>Ce(l,a.id,i=>at(i,a.color)))}catch(l){return{error:`Could not change the highlight color: ${l.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,B(t,a),a.attachmentUUID,l=>Ce(l,a.id,i=>ot(i,a.note)))}catch(l){return{error:`Could not save the note: ${l.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,B(t,a),a.attachmentUUID,l=>rt(l,a.id))}catch(l){return{error:`Could not remove the highlight: ${l.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{return await t.insertNoteContent({uuid:B(t,a)},`
`+a.content+`
`,{atEnd:!0}),{ok:!0}}catch(l){return{error:`Could not add this to the note: ${l.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=B(t,a),i=await t.getNoteContent({uuid:l}),c=Ye(i,a.pluginUUID,a.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:l},c),await lt(t,l,a.attachmentUUID),{ok:!0})}catch(l){return{error:`Could not remove this viewer: ${l.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let l=B(t,a),i=await dt(t,l,a.attachmentUUID);try{let c=await pe(t,l,a.attachmentUUID);return{name:i,count:c.length}}catch{return{name:i,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=B(t,a),i=await t.getNoteContent({uuid:l}),c=Qe(i,a.pluginUUID,a.attachmentUUID,a.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:l},c),{ok:!0})}catch(l){return{error:`Could not resize this viewer: ${l.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let l=await t.findNote({name:a.noteName}),i=l?l.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:i},a.content||""),{ok:!0,noteUUID:i}}catch(l){return{error:`Could not export highlights: ${l.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function Te(){function t(p,f){return{x:p.left-f.left,y:p.top-f.top,width:p.width,height:p.height}}function s(p,f){return{x:Math.min(p[0],f[0]),y:Math.min(p[1],f[1]),width:Math.abs(f[0]-p[0]),height:Math.abs(f[1]-p[1])}}function a(p,f){var v=Math.pow(10,f===void 0?2:f),m=function(y){return Math.round(y*v)/v};return{x:m(p.x),y:m(p.y),width:m(p.width),height:m(p.height)}}function l(p){return p.width>.01&&p.height>.01}function i(p,f,v){for(var m=String(p??""),y=Math.max(0,f===void 0?0:f),N=Math.min(m.length,v===void 0?m.length:v),S=function($){return $===""||/\s/.test($)},P=[],k=y;k<N;){for(;k<N&&S(m.charAt(k));)k++;if(k>=N)break;for(var O=k;k<N&&!S(m.charAt(k));)k++;P.push({start:O,end:k})}return P}function c(p){for(var f=1/0,v=1/0,m=-1/0,y=-1/0,N=0;N<(p?p.length:0);N++){var S=p[N];l(S)&&(f=Math.min(f,S.left),v=Math.min(v,S.top),m=Math.max(m,S.left+S.width),y=Math.max(y,S.top+S.height))}return isFinite(f)?{left:f,top:v,width:m-f,height:y-v}:null}function n(p,f,v){for(var m=[],y=0;y<p.length;y++){var N=t(p[y],f);if(l(N)){var S=v(N.x,N.y),P=v(N.x+N.width,N.y+N.height),k=a(s(S,P));l(k)&&m.push(k)}}return m}function h(p,f){var v=f(p.x,p.y),m=f(p.x+p.width,p.y+p.height);return s(v,m)}function w(p,f,v){var m=f.right-f.left,y=f.bottom-f.top;if(m<=0||y<=0)return null;var N=p.x2-p.x1,S=p.y2-p.y1,P=p.x1+(v.left-f.left)/m*N,k=p.x2-(f.right-v.right)/m*N,O=p.y1+(v.bottom-f.bottom)/y*S,$=p.y2-(f.top-v.top)/y*S;return{x:P,y:O,width:k-P,height:$-O}}function g(p,f){var v=Math.min(p.y+p.height,f.y+f.height)-Math.max(p.y,f.y);return v>.5*Math.min(p.height,f.height)}function I(p,f){var v=f===void 0?.6:f;if(!p||p.length<2)return(p||[]).slice();for(var m=p.slice().sort(function(G,W){return W.y-G.y||G.x-W.x}),y=[],N=0;N<m.length;N++){for(var S=!1,P=0;P<y.length;P++)if(g(y[P][0],m[N])){y[P].push(m[N]),S=!0;break}S||y.push([m[N]])}for(var k=[],O=0;O<y.length;O++){for(var $=y[O].slice().sort(function(G,W){return G.x-W.x}),D=null,K=0;K<$.length;K++){var H=$[K];if(D===null){D={x:H.x,y:H.y,width:H.width,height:H.height};continue}var oe=H.x-(D.x+D.width);if(oe<=v*Math.max(D.height,H.height)){var fe=Math.max(D.x+D.width,H.x+H.width),z=Math.max(D.y+D.height,H.y+H.height);D.x=Math.min(D.x,H.x),D.y=Math.min(D.y,H.y),D.width=fe-D.x,D.height=z-D.y}else k.push(D),D={x:H.x,y:H.y,width:H.width,height:H.height}}D!==null&&k.push(D)}return k.map(function(G){return a(G)})}function T(p,f,v,m){var y=m===void 0?0:m;return f>=p.x-y&&f<=p.x+p.width+y&&v>=p.y-y&&v<=p.y+p.height+y}function E(p,f,v,m,y){for(var N=p||[],S=N.length-1;S>=0;S--){var P=N[S];if(!(!P||P.page!==f||!P.rects)){for(var k=0;k<P.rects.length;k++)if(T(P.rects[k],v,m,y===void 0?1:y))return P}}return null}function C(p){return String(p??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:s,roundRect:a,isVisibleRect:l,textTokenRanges:i,unionClientRects:c,clientRectsToPdfRects:n,pdfRectToViewportRect:h,itemRelativeRect:w,mergeLineRects:I,rectContainsPoint:T,hitTestHighlights:E,normalizeQuoteText:C}}var j=Te(),Rn=j.clientRectToLocal,Ln=j.rectFromCorners,Mn=j.roundRect,Fn=j.isVisibleRect,On=j.textTokenRanges,$n=j.unionClientRects,_n=j.clientRectsToPdfRects,jn=j.pdfRectToViewportRect,Bn=j.itemRelativeRect,zn=j.mergeLineRects,qn=j.rectContainsPoint,Gn=j.hitTestHighlights,Vn=j.normalizeQuoteText;function Se(){var t=[.957,.871,.424];function s(c,n,h,w,g){var I=n.context.register(n.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),T=[c.pushGraphicsState(),c.setGraphicsState("GS0")];T.push(c.setFillingColor(c.rgb(w[0],w[1],w[2])));for(var E=0;E<h.length;E++){var C=h[E];T.push(c.moveTo(C.x,C.y)),T.push(c.lineTo(C.x,C.y+C.height)),T.push(c.lineTo(C.x+C.width,C.y+C.height)),T.push(c.lineTo(C.x+C.width,C.y)),T.push(c.closePath())}T.push(c.fill()),T.push(c.popGraphicsState());var p=n.context.formXObject(T,{BBox:g,Resources:{ExtGState:{GS0:I}}});return n.context.register(p)}function a(c,n,h,w){for(var g=h.rects,I=[],T=g[0].x,E=g[0].y,C=g[0].x+g[0].width,p=g[0].y+g[0].height,f=0;f<g.length;f++){var v=g[f],m=v.x,y=v.x+v.width,N=v.y,S=v.y+v.height;I.push(m,S,y,S,m,N,y,N),T=Math.min(T,m),E=Math.min(E,N),C=Math.max(C,y),p=Math.max(p,S)}var P=n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:n.context.obj([T,E,C,p]),QuadPoints:n.context.obj(I),C:n.context.obj(w),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&P.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var k=s(c,n,g,w,[T,E,C,p]);P.set(c.PDFName.of("AP"),n.context.obj({N:k}));var O=n.context.register(P),$=[O];if(h.note){var D=n.context.register(n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:n.context.obj([C+8,E-60,C+208,E+12]),Parent:O,Open:!1}));P.set(c.PDFName.of("Popup"),D),$.push(D)}return $}function l(c,n,h){var w=n.node.get(c.PDFName.of("Annots"));if(w instanceof c.PDFArray)for(var g=0;g<h.length;g++)w.push(h[g]);else n.node.set(c.PDFName.of("Annots"),n.doc.context.obj(h))}async function i(c,n,h,w){for(var g=await c.PDFDocument.load(n),I=g.getPages(),T=h||[],E=0;E<T.length;E++){var C=T[E];if(!(!C||!C.rects||!C.rects.length)){var p=I[C.page-1];if(p){var f=w&&w[C.color]||t,v=a(c,g,C,f);l(c,p,v)}}}return g.save()}return{writeHighlightsIntoPdf:i,buildHighlightAnnotation:a,appendAnnotationRefs:l}}var Ae=Se(),Jn=Ae.writeHighlightsIntoPdf,Xn=Ae.buildHighlightAnnotation,Yn=Ae.appendAnnotationRefs;function Ie(){function t(n){return String(n??"").replace(/\]/g,"\\]")}function s(n,h,w,g,I){var T=new URLSearchParams;h&&T.set("att",h),Number.isFinite(w)&&w>=1&&T.set("page",String(Math.floor(w))),g&&T.set("hl",g),I&&T.set("note",I);var E=T.toString();return"plugin://"+n+(E?"?"+E:"")}function a(n,h){return String(n??"").split(/\r?\n/).map(function(w){return(h+" "+w).replace(/[ \t]+$/,"")})}function l(n,h,w,g,I,T){var E=s(h,w,g.page,g.id,T),C=t(n||"PDF"),p='==\u25CF<!-- {"cycleColor":"'+I+'"} -->==',f=p+" ["+C+"]("+E+")",v=[f].concat(a(g.quoteText,"> >"));return g.note&&(v.push(">"),v=v.concat(a(g.note,">"))),v.join(`
`)}function i(n){return n.slice().sort(function(h,w){if(h.page!==w.page)return h.page-w.page;var g=h.rects&&h.rects[0]?h.rects[0].y:0,I=w.rects&&w.rects[0]?w.rects[0].y:0;return I-g})}function c(n,h,w,g,I,T,E){var C=T&&T.length?T:null,p=(g||[]).filter(function(m){return m&&(!C||C.indexOf(m.color)!==-1)}),f=i(p),v=f.map(function(m){var y=I?I[m.color]:void 0;return l(n,h,w,m,y,E)});return v.join(`

`)}return{buildDeepLink:s,buildHighlightBlock:l,buildExportAllContent:c}}var ke=Ie(),Kn=ke.buildDeepLink,Zn=ke.buildHighlightBlock,eo=ke.buildExportAllContent;function pt(){var t=window.__PDFA_CONFIG||{},s=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},l=window.__PDFA_EXPORT||{},i={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(n.attachmentName=e,i.name&&(i.name.textContent=e),i.collapsedName&&(i.collapsedName.textContent=e))}var n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,o){i.status.textContent=e||"",i.status.style.display=e?"block":"none",i.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function w(e){var o=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(r,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(o)))}catch(u){d(u)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function g(){return t.colors||[]}function I(e){for(var o=g(),r=0;r<o.length;r++)if(o[r].id===e)return o[r].hex;return o.length?o[0].hex:"#F4DE6C"}function T(e){for(var o=0;o<n.highlights.length;o++)if(n.highlights[o].id===e)return n.highlights[o];return null}function E(e,o,r){var d=document.createElement("button");return d.className="pdfa-btn"+(o?" "+o:""),d.textContent=e,d.onclick=function(u){u.stopPropagation(),r()},d}function C(e,o,r,d){var u=document.createElement("button");return u.className="pdfa-color",u.dataset.color=e.id,u.style.background=e.hex,u.title=d+" "+e.label,u.setAttribute("aria-label",d+" "+e.label),u.setAttribute("aria-pressed",String(!!o)),u.onclick=function(x){x.stopPropagation(),r(e.id)},u}function p(){for(var e=g(),o=0;o<e.length;o++)i.colors.appendChild(C(e[o],e[o].id===n.activeColorId,function(r){n.activeColorId=r,f(),n.pendingSelection&&De(n.pendingSelection,r)},"Highlight"))}function f(){for(var e=i.colors.querySelectorAll(".pdfa-color"),o=0;o<e.length;o++)e[o].setAttribute("aria-pressed",String(e[o].dataset.color===n.activeColorId))}function v(e,o){var r=e.getViewport({scale:n.scale});n.viewports[o]=r;var d=document.createElement("div");d.className="pdfa-page",d.dataset.page=String(o),d.style.width=r.width+"px",d.style.height=r.height+"px";var u=document.createElement("canvas"),x=window.devicePixelRatio||1;u.width=Math.floor(r.width*x),u.height=Math.floor(r.height*x),u.style.width=r.width+"px",u.style.height=r.height+"px",d.appendChild(u);var b=document.createElement("div");b.className="pdfa-highlights",d.appendChild(b);var A=document.createElement("div");A.className="textLayer",A.style.width=r.width+"px",A.style.height=r.height+"px",A.style.setProperty("--scale-factor",String(n.scale)),d.appendChild(A),i.pages.appendChild(d);var R=u.getContext("2d");return R.scale(x,x),e.render({canvasContext:R,viewport:r}).promise.then(function(){return e.getTextContent()}).then(function(F){var U=[];return window.pdfjsLib.renderTextLayer({textContent:F,container:A,viewport:r,textDivs:U}).promise.then(function(){n.textSpans+=U.length;for(var L=0;L<U.length;L++)U[L].__pdfaItem=F.items[L];N(o)})})}function m(){if(n.rendering)return Promise.resolve();n.rendering=!0,M(!0),i.pages.innerHTML="",n.viewports={},n.textSpans=0,h("Rendering...");for(var e=Promise.resolve(),o=1;o<=n.pageCount;o++)(function(r){e=e.then(function(){return n.doc.getPage(r).then(function(d){return v(d,r)})})})(o);return e.then(function(){n.textSpans===0?h("No selectable text found - this PDF may be a scan.",!0):h(""),n.rendering=!1,Z(),we()}).catch(function(r){n.rendering=!1,h("Failed to render: "+r.message,!0)})}function y(e){return function(o,r){return e.convertToViewportPoint(o,r)}}function N(e){for(var o=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",r=i.pages.querySelectorAll(o),d=0;d<r.length;d++){var u=r[d],x=Number(u.dataset.page),b=u.querySelector(".pdfa-highlights"),A=n.viewports[x];if(!(!b||!A)){b.innerHTML="";for(var R=y(A),F=0;F<n.highlights.length;F++){var U=n.highlights[F];if(!(!U||U.page!==x||!U.rects||!U.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=U.id||"";for(var V=0;V<U.rects.length;V++){var Y=s.pdfRectToViewportRect(U.rects[V],R),_=document.createElement("div");_.className="pdfa-hl",_.style.left=Y.x+"px",_.style.top=Y.y+"px",_.style.width=Y.width+"px",_.style.height=Y.height+"px",_.style.background=I(U.color),L.appendChild(_)}b.appendChild(L)}}}}}function S(){N(),k(),i.count.textContent=String(n.highlights.length)}function P(){return n.highlights.slice().sort(function(e,o){return e.page!==o.page?e.page-o.page:(o.rects[0]?o.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function k(){i.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",e.appendChild(o),e.appendChild(E("Close","",function(){$(!1)})),i.panel.appendChild(e);var r=P();if(!r.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",i.panel.appendChild(d);return}for(var u=0;u<r.length;u++)i.panel.appendChild(O(r[u]))}function O(e){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=e.id||"",o.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=I(e.color),o.appendChild(r);var d=document.createElement("div"),u=document.createElement("div");u.className="pdfa-hl-page",u.textContent="Page "+e.page,d.appendChild(u);var x=document.createElement("div");if(x.className="pdfa-hl-quote",x.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(x),e.note){var b=document.createElement("div");b.className="pdfa-hl-note",b.textContent=e.note,d.appendChild(b)}return o.appendChild(d),o.onclick=function(){Pe(e)},o}function $(e){var o=e===void 0?!i.panel.classList.contains("pdfa-open"):e;i.panel.classList.toggle("pdfa-open",o),i.listToggle.setAttribute("aria-pressed",String(o)),o&&k()}function D(e){for(var o=e&&e.nodeType===1?e:e&&e.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function K(e,o){for(var r=[],d=[],u=null,x=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),b;b=x.nextNode();)if(e.intersectsNode(b)){var A=b.nodeValue||"",R=b===e.startContainer?e.startOffset:0,F=b===e.endContainer?e.endOffset:A.length,U=b.parentElement,L=U&&U.__pdfaItem;if(L)for(var V={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},Y=U.getBoundingClientRect(),_=s.textTokenRanges(A,R,F),Q=0;Q<_.length;Q++){var xe=document.createRange();xe.setStart(b,_[Q].start),xe.setEnd(b,_[Q].end);var q=s.unionClientRects(xe.getClientRects());if(q){var _e={left:q.left,top:q.top,width:q.width,height:q.height,right:q.left+q.width,bottom:q.top+q.height},je=s.itemRelativeRect(V,Y,_e);je&&(r.push(je),d.push(A.slice(_[Q].start,_[Q].end)),u=_e)}}}return{rects:r,text:d.join(" "),lastCssRect:u}}function H(e){if(n.pendingSelection=e,n.lastCapturedText=e&&e.rawText||"",!e){i.hint.textContent="",i.hint.style.display="none";return}i.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",i.hint.style.display="inline"}function oe(e){if(!n.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){H(null),M();return}var r=o.getRangeAt(0),d=D(r.startContainer);if(!d)return H(null);var u=d.parentElement;if(!u||!u.dataset||!u.dataset.page)return H(null);var x=Number(u.dataset.page);if(!n.viewports[x])return H(null);var b=D(r.endContainer)!==d,A=K(r,d),R=s.mergeLineRects(A.rects);if(!R.length)return H(null);var F=A.lastCssRect||u.getBoundingClientRect(),U=e&&e.clientX?e.clientX:F.left+F.width/2,L=e&&e.clientY?e.clientY:F.top+F.height,V={page:x,rects:R,quoteText:s.normalizeQuoteText(A.text),spilled:b,anchorX:U,anchorY:L,rawText:String(o)};H(V),vt(V)}}var fe=300,z=null;function G(){n.noteEditing||(z&&clearTimeout(z),z=setTimeout(W,fe))}function W(){if(z=null,!n.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||D(e.getRangeAt(0).startContainer)&&String(e)!==n.lastCapturedText&&oe(null)}}function ae(e,o){var r=n.highlights;return n.highlights=e,S(),w(o).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return n.highlights=d.highlights||e,S(),h(""),!0}).catch(function(d){return n.highlights=r,S(),h(d.message||String(d),!0),!1})}function De(e,o){var r={id:null,page:e.page,color:o,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,u=e.anchorY;H(null),M(!0);var x=window.getSelection();x&&x.removeAllRanges&&x.removeAllRanges(),ae(n.highlights.concat([r]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:r}).then(function(b){if(b){var A=n.highlights[n.highlights.length-1];A&&A.id&&me(A,d,u,!0)}})}function gt(e,o){M(!0),ae(n.highlights.map(function(r){return r.id===e?Object.assign({},r,{color:o}):r}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:o})}function mt(e){M(!0),ae(n.highlights.filter(function(o){return o.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function ge(e,o){var r=String(o??"").trim();n.noteEditing=null,M(!0),ae(n.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:r||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:r})}function X(e,o,r,d){i.popover.innerHTML="",i.popover.classList.toggle("pdfa-editing",d==="editing"),i.popover.classList.toggle("pdfa-exporting",d==="exporting"),i.popover.classList.toggle("pdfa-menu",d==="menu");for(var u=0;u<e.length;u++)i.popover.appendChild(e[u]);i.popover.classList.add("pdfa-open");var x=i.popover.offsetWidth,b=i.popover.offsetHeight,A=Math.max(4,Math.min(o-x/2,window.innerWidth-x-4)),R=r+12;R+b>window.innerHeight-4&&(R=Math.max(4,r-b-12)),i.popover.style.left=A+"px",i.popover.style.top=R+"px"}function M(e){n.noteEditing&&!e||(n.noteEditing=null,i.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),i.popover.innerHTML="")}function vt(e){for(var o=g(),r=[],d=0;d<o.length;d++)r.push(C(o[d],o[d].id===n.activeColorId,function(u){n.activeColorId=u,f(),De(e,u)},"Highlight"));X(r,e.anchorX,e.anchorY)}function me(e,o,r,d){for(var u=g(),x=[],b=0;b<u.length;b++)x.push(C(u[b],u[b].id===e.color,function(R){gt(e.id,R)},"Change to"));var A=!!e.note;x.push(E(A?"Edit note":"Add note",d&&!A?"pdfa-btn-primary":"",function(){xt(e,o,r)})),x.push(E("Copy","",function(){It(e)})),x.push(E("Send to note","",function(){kt(e)})),x.push(E("Remove","pdfa-remove",function(){mt(e.id)})),X(x,o,r)}function wt(e,o){for(var r=g(),d={},u=0;u<r.length;u++)d[r[u].id]=!0;var x=document.createElement("div");x.className="pdfa-export-hint",x.textContent="Export highlights to a note";var b=document.createElement("div");b.className="pdfa-export-colors";for(var A=0;A<r.length;A++)(function(F){var U=C(F,!0,function(L){d[L]=!d[L],U.setAttribute("aria-pressed",String(d[L]))},"Toggle");b.appendChild(U)})(r[A]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(E("Create / update note","pdfa-btn-primary",function(){for(var F=[],U=0;U<r.length;U++)d[r[U].id]&&F.push(r[U].id);Dt(F.length===r.length?null:F)})),X([x,b,R],e,o,"exporting")}function xt(e,o,r){n.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var u=document.createElement("div");u.className="pdfa-note-actions",e.note&&u.appendChild(E("Delete note","",function(){ge(e.id,"")}));var x=document.createElement("span");x.className="pdfa-spacer",u.appendChild(x),u.appendChild(E("Cancel","",function(){Ue(e,o,r)})),u.appendChild(E("Save","pdfa-btn-primary",function(){ge(e.id,d.value)})),d.onkeydown=function(b){b.key==="Enter"&&(b.ctrlKey||b.metaKey)?(b.preventDefault(),b.stopPropagation(),ge(e.id,d.value)):b.key==="Escape"&&(b.preventDefault(),b.stopPropagation(),Ue(e,o,r))},X([d,u],o,r,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function Ue(e,o,r){n.noteEditing=null;var d=T(e.id)||e;me(d,o,r)}function bt(e){if(!n.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var r=e.target,d=null;r&&r!==i.pages;){if(r.classList&&r.classList.contains("pdfa-page")){d=r;break}r=r.parentElement}if(!d)return M();var u=Number(d.dataset.page),x=n.viewports[u];if(!x)return M();var b=d.getBoundingClientRect(),A=x.convertToPdfPoint(e.clientX-b.left,e.clientY-b.top),R=s.hitTestHighlights(n.highlights,u,A[0],A[1],1);R&&R.id?me(R,e.clientX,e.clientY):M()}}}function Z(){i.pageLabel.textContent=n.current+" / "+n.pageCount,i.zoomLabel.textContent=Math.round(n.scale*100)+"%"}function ee(){return i.root.querySelector(".pdfa-scroll")}function ve(e){var o=Math.min(Math.max(1,e),n.pageCount),r=i.pages.querySelector('[data-page="'+o+'"]');r&&r.scrollIntoView({behavior:"smooth",block:"start"}),n.current=o,Z()}function Pe(e){var o=i.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),r=n.viewports[e.page];if(!(!o||!r||!e.rects||!e.rects.length)){var d=s.pdfRectToViewportRect(e.rects[0],y(r)),u=ee(),x=o.getBoundingClientRect().top+d.y;u.scrollTop+=x-u.getBoundingClientRect().top-u.clientHeight/3,n.current=e.page,Z()}}function He(e){n.scale=Math.min(Math.max(.4,e),4),m()}function yt(){return n.doc?n.doc.getPage(1).then(function(e){var o=ee();if(o){var r=window.getComputedStyle(o),d=o.clientWidth-(parseFloat(r.paddingLeft)||0)-(parseFloat(r.paddingRight)||0),u=e.getViewport({scale:1}).width;if(!(!(d>0)||!(u>0))){var x=Math.max(.4,d/u);x<n.scale&&(n.scale=x,Z())}}}).catch(function(){}):Promise.resolve()}function Re(e){var o=ee();o&&(o.scrollTop+=e*Math.max(80,o.clientHeight*.85),we())}function we(){var e=ee();if(!(!e||!i.scrollUp)){var o=e.scrollHeight-e.clientHeight;i.scrollUp.disabled=e.scrollTop<=1,i.scrollDown.disabled=e.scrollTop>=o-1}}function Ct(){we(),M();for(var e=i.pages.querySelectorAll(".pdfa-page"),o=n.current,r=1/0,d=0;d<e.length;d++){var u=Math.abs(e[d].getBoundingClientRect().top-60);u<r&&(r=u,o=Number(e[d].dataset.page))}o!==n.current&&(n.current=o,Z())}function Et(){return new Promise(function(e,o){if(window.pdfjsLib)return e(window.pdfjsLib);var r=document.createElement("script");r.src=t.pdfJsSrc,r.onload=function(){window.pdfjsLib?e(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function Nt(){return new Promise(function(e,o){if(window.PDFLib)return e(window.PDFLib);var r=document.createElement("script");r.src=t.pdfLibSrc,r.onload=function(){window.PDFLib?e(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function Tt(){for(var e={},o=g(),r=0;r<o.length;r++)o[r].rgb&&(e[o[r].id]=o[r].rgb);return e}function St(){var e=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Le(){for(var e={},o=g(),r=0;r<o.length;r++)o[r].cycleIndex!==void 0&&(e[o[r].id]=o[r].cycleIndex);return e}function Me(){var e=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Fe(e){return l.buildHighlightBlock(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,Le()[e.color],t.noteUUID)}function At(e){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(e):new Promise(function(o,r){var d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select();var u=!1;try{u=document.execCommand("copy")}catch{u=!1}document.body.removeChild(d),u?o():r(new Error("Clipboard access is unavailable here."))})}function It(e){M(!0),At(Fe(e)).then(function(){h("Highlight copied - paste it into any note.")}).catch(function(o){h("Could not copy: "+(o.message||o),!0)})}function kt(e){M(!0),w({action:"sendToNote",content:Fe(e)}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");h("Sent to the bottom of this note.")}).catch(function(o){h(o.message||String(o),!0)})}function Dt(e){M(!0);var o=l.buildExportAllContent(n.attachmentName,t.pluginUUID,t.attachmentUUID,n.highlights,Le(),e,t.noteUUID);if(!o){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}w({action:"exportAll",noteName:Me(),content:o}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");h('Exported to "'+Me()+'".')}).catch(function(r){h(r.message||String(r),!0)})}function Ut(e,o){var r=document.createElement("div");r.className="pdfa-menu-name",r.textContent=n.attachmentName||"PDF Annotator",r.title=r.textContent;var d=[r,E("Collapse","",function(){M(!0),Mt()}),E("Download","",function(){M(!0),Rt()}),E("Export...","",function(){wt(e,o)}),E("Remove viewer...","pdfa-remove",function(){Pt(e,o)})];X(d,e,o,"menu")}function Pt(e,o){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(E("Cancel","",function(){M(!0)}));var u=document.createElement("span");u.className="pdfa-spacer",d.appendChild(u),d.appendChild(E("Remove","pdfa-remove",Ht)),X([r,d],e,o,"exporting")}function Ht(){M(!0),h("Removing this viewer..."),w({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function Rt(){n.pdfBytes&&(h("Preparing the download..."),Nt().then(function(e){return a.writeHighlightsIntoPdf(e,n.pdfBytes,n.highlights,Tt())}).then(function(e){var o=new Blob([e],{type:"application/pdf"}),r=URL.createObjectURL(o),d=document.createElement("a");d.href=r,d.download=St(),document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3),h("")}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function Lt(){return w({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");n.highlights=e.highlights||[]}).catch(function(e){n.highlights=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function Mt(){var e=n.highlights.length;i.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",i.root.classList.add("pdfa-collapsed-mode"),Oe(!0)}function Oe(e){w({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Ft(){i.root.classList.remove("pdfa-collapsed-mode"),n.doc||$e(),Oe(!1)}function $e(){h("Loading PDF..."),Et().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,w({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return n.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return n.doc=e,n.pageCount=e.numPages,Lt()}).then(function(){return yt()}).then(function(){return m()}).then(function(){S();var e=t.highlightId?T(t.highlightId):null;e?Pe(e):t.page&&ve(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ve(n.current-1)},document.getElementById("pdfa-next").onclick=function(){ve(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){He(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){He(n.scale-.25)},i.scrollUp.onclick=function(){Re(-1)},i.scrollDown.onclick=function(){Re(1)},i.listToggle.onclick=function(){$()},i.more.onclick=function(e){Ut(e.clientX,e.clientY)},ee().addEventListener("scroll",Ct),i.pages.addEventListener("mouseup",oe),i.pages.addEventListener("click",bt),document.addEventListener("selectionchange",G),i.pages.addEventListener("touchend",function(){z&&clearTimeout(z),z=null,W()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!n.noteEditing&&M()}),document.addEventListener("mousedown",function(e){i.popover.classList.contains("pdfa-open")&&(i.popover.contains(e.target)||M())}),p(),k(),i.root.querySelector(".pdfa-collapsed").onclick=Ft,t.collapsed?w({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var o=e.count||0;i.collapsedCount.textContent=o?o+(o===1?" highlight":" highlights"):""}}).catch(function(){}):$e()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function en(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function tn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var nn=`
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
`,ut={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function ft({attachmentUUID:t,attachmentName:s="",page:a=null,highlightId:l=null,lightDarkMode:i="light",pluginUUID:c=null,noteUUID:n=null,collapsed:h=!1}={}){let w=ut[i]||ut.light,g={attachmentUUID:t,page:a,highlightId:l,pluginUUID:c,noteUUID:n,pdfJsSrc:te.pdfJs,workerSrc:te.pdfJsWorker,pdfLibSrc:te.pdfLib,colors:re.map(I=>({id:I.id,label:I.label,hex:I.hex,rgb:I.rgb,cycleIndex:I.cycleIndex})),defaultColorId:ie,collapsed:h,attachmentName:s};return`<link rel="stylesheet" href="${te.pdfViewerCss}">
<style>:root{${w}}${nn}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${en(s)}</span>
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
<script>window.__PDFA_CONFIG = ${tn(g)};
window.__PDFA_GEOM = (${Te.toString()})();
window.__PDFA_ANNOTATIONS = (${Se.toString()})();
window.__PDFA_EXPORT = (${Ie.toString()})();<\/script>
<script>(${pt.toString()})();<\/script>`}var on={noteOption:{"Annotate PDF":async function(t,s){return Ke(t,s,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,s){return Ze(t,s)}},insertText:async function(t){return et(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...s){return tt(t,s[0])},renderEmbed:function(t,...s){let{attachmentUUID:a,page:l,highlightId:i,collapsed:c,attachmentName:n}=ne(s[0]);return a?ft({attachmentUUID:a,page:l,highlightId:i,collapsed:c,attachmentName:n,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...s){return ht(t,s[0])}},an=on;return zt(rn);})();

  var plugin = __pluginModule.default;
})();
