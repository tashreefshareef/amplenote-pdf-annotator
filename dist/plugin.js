(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var gt=Object.defineProperty;var Ae=Object.getOwnPropertyDescriptor;var ke=Object.getOwnPropertyNames;var Se=Object.prototype.hasOwnProperty;var Te=(e,i)=>{for(var a in i)gt(e,a,{get:i[a],enumerable:!0})},Ie=(e,i,a,s)=>{if(i&&typeof i=="object"||typeof i=="function")for(let l of ke(i))!Se.call(e,l)&&l!==a&&gt(e,l,{get:()=>i[l],enumerable:!(s=Ae(i,l))||s.enumerable});return e};var Pe=e=>Ie(gt({},"__esModule",{value:!0}),e);var Ve={};Te(Ve,{default:()=>Ge});var ot=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],rt="yellow",J="PDF Annotator data",Lt="attachment://",Z={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},He="https://plugins.amplenote.com/cors-proxy";function Mt(e){let i=new URL(He);return i.searchParams.set("apiurl",e),i.toString()}var De="application/pdf";function Re(e){return Array.isArray(e)?e.filter(i=>i&&i.type===De&&i.uuid):[]}async function at(e,i){let a=await e.getNoteAttachments({uuid:i}),s=Re(a);if(s.length===0)return null;if(s.length===1)return s[0];let l=await e.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:s.map(c=>({label:c.name,value:c.uuid})),value:s[0].uuid}]});if(l==null)return null;let n=Array.isArray(l)?l[0]:l;return s.find(c=>c.uuid===n)||null}async function Ft(e,i){if(!i)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await e.getAttachmentURL(i);if(!a)throw new Error(`No URL returned for attachment ${i}`);return Mt(a)}function tt(e){let i={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null};if(!e||typeof e!="string")return i;let a;try{a=new URLSearchParams(e.replace(/^\?/,""))}catch{return i}let s=n=>{let c=a.get(n);if(c===null||c.trim()==="")return null;let h=Number(c);return Number.isFinite(h)?h:null},l=s("page");return{attachmentUUID:a.get("att")||null,page:l!==null&&l>=1?Math.floor(l):null,x:s("x"),y:s("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null}}function Ot({attachmentUUID:e,page:i,x:a,y:s,highlightId:l}={}){let n=new URLSearchParams;return e&&n.set("att",e),Number.isFinite(i)&&i>=1&&n.set("page",String(Math.floor(i))),Number.isFinite(a)&&n.set("x",String(a)),Number.isFinite(s)&&n.set("y",String(s)),l&&n.set("hl",l),n.toString()}function it(e,i={},a=1.2){if(!e)throw new Error("buildEmbedMarkup: pluginUUID required");let s=Ot(i);return`<object data="${s?`plugin://${e}?${s}`:`plugin://${e}`}" data-aspect-ratio="${a}" />`}function $t(e,i,a){if(!e||!i||!a)return null;let s=e.split(`
`),l=s.findIndex(c=>c.includes(`${Lt}${i}`));if(l===-1)return null;let n=s.slice();return s[l+1]===""?n.splice(l+2,0,a.trim(),""):n.splice(l+1,0,"",a.trim(),""),n.join(`
`)}function lt(e,i,a=null){return!e||!i||!e.includes(`plugin://${i}`)?!1:a?e.includes(`att=${a}`):!0}function jt(e,i,a){if(!e||!i||!a)return null;let s=e.split(`
`),l=`plugin://${i}`,n=s.findIndex(h=>h.includes(l)&&h.includes(`att=${a}`));if(n===-1)return null;let c=s.slice();return c.splice(n,1),c[n]===""&&c[n-1]===""&&c.splice(n,1),c.join(`
`)}function _t(e,i,a,s={}){if(!e||!i||!a)return null;let l=e.split(`
`),n=`plugin://${i}`,c=l.findIndex(g=>g.includes(n)&&g.includes(`att=${a}`));if(c===-1)return null;let h=l[c],b=h.match(/data="(plugin:\/\/[^"]*)"/);if(!b)return null;let m=b[1],H=m.indexOf("?"),w=H===-1?"":m.slice(H+1),k=tt(w),C=Ot({...k,attachmentUUID:a,...s}),p=C?`plugin://${i}?${C}`:`plugin://${i}`,f=l.slice();return f[c]=h.replace(b[0],`data="${p}"`),f.join(`
`)}async function Bt(e,i,a){let s=await at(e,i);if(!s){let h=await e.getNoteAttachments({uuid:i});return(!(Array.isArray(h)&&h.length>0)||!h.some(m=>m&&m.type==="application/pdf"))&&await e.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let l=await e.getNoteContent({uuid:i});if(lt(l,a,s.uuid))return await e.alert(`"${s.name}" is already open in this note - scroll to the viewer.`),s.uuid;let n=it(a,{attachmentUUID:s.uuid}),c=$t(l,s.uuid,n);return c!==null?(await e.replaceNoteContent({uuid:i},c),s.uuid):(await e.insertNoteContent({uuid:i},`
${n}
`,{atEnd:!0}),s.uuid)}var Ue="Raw markdown";function Le(e){let i=(String(e||"").match(/`+/g)||[]).reduce((a,s)=>Math.max(a,s.length),0);return"`".repeat(Math.max(3,i+1))}async function zt(e,i){let a=await e.getNoteContent({uuid:i});if(typeof a!="string"||a==="")return await e.alert("That note came back empty - nothing to dump."),null;let s=await e.getNoteAttachments({uuid:i}),l=(Array.isArray(s)?s:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),n=Le(a),c=await e.createNote("PDF Annotator debug - note markdown");return await e.insertNoteContent({uuid:c},`# Attachments

${l||"- (none)"}

# ${Ue}

${n}
${a}
${n}
`,{atEnd:!0}),await e.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),c}async function qt(e,i,a){if(!i)return"";let s=await at(e,i);if(!s){let n=await e.getNoteAttachments({uuid:i});return(!(Array.isArray(n)&&n.length>0)||!n.some(h=>h&&h.type==="application/pdf"))&&await e.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let l=await e.getNoteContent({uuid:i});return lt(l,a,s.uuid)?(await e.alert(`"${s.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${it(a,{attachmentUUID:s.uuid})}
`}async function Gt(e,i){let{noteUUID:a,attachmentUUID:s,page:l,highlightId:n}=tt(i);if(!a){await e.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let c=await e.getNoteContent({uuid:a}),h=_t(c,e.context.pluginUUID,s,{page:l,highlightId:n});h!==null&&await e.replaceNoteContent({uuid:a},h)}catch{}await e.navigate(`https://www.amplenote.com/notes/${a}`)}function st(e){if(!e)return null;let i=String(e).trim().toLowerCase();return ot.find(a=>a.id===i||a.hex.toLowerCase()===i)||null}function Vt(){return st(rt)}function Me(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function dt({page:e,color:i,rects:a,quoteText:s,note:l=null,id:n=null}){if(!Number.isInteger(e)||e<1)throw new Error(`createHighlight: page must be a positive integer, got ${e}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of a)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let c=st(i)||Vt();return{id:n||Me(),page:e,color:c.id,rects:a.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(s||""),note:l?String(l):null}}function Wt(e,i){let a=i==null?null:String(i).trim();return{...e,note:a||null}}function Jt(e,i){let a=st(i);if(!a)throw new Error(`withColor: unknown color "${i}"`);return{...e,color:a.id}}function Yt(e,i){return(e||[]).filter(a=>a.id!==i)}function mt(e,i,a){let s=!1,l=(e||[]).map(n=>n.id!==i?n:(s=!0,a(n)));return s?l:e}var Fe="json",Oe="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function Xt(e){let i=JSON.stringify(e,null,0).replace(/`/g,"\\u0060");return`${Oe}
\`\`\`${Fe}
${i}
\`\`\``}function vt(e){if(!e)return null;let i=e.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!i&&e.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),s=(i?i[1]:a?a[1]:e).trim();if(!s)return null;try{return JSON.parse(s)}catch{return null}}function $e(e){if(!Array.isArray(e))return[];let i=[];for(let a of e)try{i.push(dt(a))}catch{}return i}async function wt(e,i,a){let s=await e.getNoteContent({uuid:i}),l=xt(s,J),n=vt(l);return!n||typeof n!="object"?[]:$e(n[a])}async function Qt(e,i,a,s){let l={uuid:i},n=await e.getNoteContent(l),c=xt(n,J),b={...vt(c)||{},[a]:s},m=Xt(b);c===null&&await e.insertNoteContent(l,`

# ${J}

`,{atEnd:!0}),await e.replaceNoteContent(l,m,{section:{heading:{text:J,level:1}}})}async function Kt(e,i,a){let s={uuid:i},l=await e.getNoteContent(s),n=xt(l,J);if(n===null)return;let c=vt(n)||{};if(!(a in c))return;let h={...c};delete h[a],await e.replaceNoteContent(s,Xt(h),{section:{heading:{text:J,level:1}}})}function xt(e,i){if(!e)return null;let a=e.split(`
`),s=/^#\s+(.*)$/,l=a.findIndex(c=>{let h=c.match(s);return h&&h[1].trim()===i});if(l===-1)return null;let n=a.length;for(let c=l+1;c<a.length;c++)if(/^#\s+/.test(a[c])){n=c;break}return a.slice(l+1,n).join(`
`).trim()}function W(e,i){return i.noteUUID||e.context.noteUUID}async function je(e,i,a){try{let s=await e.getNoteAttachments({uuid:i}),l=Array.isArray(s)&&s.find(n=>n&&n.uuid===a);return l?l.name:""}catch{return""}}async function ct(e,i,a,s){let l=await wt(e,i,a),n=s(l);return n!==l&&await Qt(e,i,a,n),{highlights:n}}function Zt(e){if(e&&typeof e=="object")return e;if(typeof e!="string")return{};let i=e.trim();if(!i.startsWith("{"))return{action:i};try{return JSON.parse(i)}catch{return{action:i}}}async function te(e,i){return JSON.stringify(await _e(e,Zt(i)))}async function _e(e,i){let a=Zt(i);switch(a.action){case"getPdfUrl":{let s=a.attachmentUUID;if(!s)return{error:"No attachment specified for this viewer."};try{return{url:await Ft(e,s),name:await je(e,W(e,a),s)}}catch(l){return{error:`Could not load the PDF: ${l.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await wt(e,W(e,a),a.attachmentUUID)}}catch(s){return{error:`Could not load highlights: ${s.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=dt(a.highlight||{});return await ct(e,W(e,a),a.attachmentUUID,l=>l.concat([s]))}catch(s){return{error:`Could not save the highlight: ${s.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ct(e,W(e,a),a.attachmentUUID,s=>mt(s,a.id,l=>Jt(l,a.color)))}catch(s){return{error:`Could not change the highlight color: ${s.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ct(e,W(e,a),a.attachmentUUID,s=>mt(s,a.id,l=>Wt(l,a.note)))}catch(s){return{error:`Could not save the note: ${s.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ct(e,W(e,a),a.attachmentUUID,s=>Yt(s,a.id))}catch(s){return{error:`Could not remove the highlight: ${s.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{return await e.insertNoteContent({uuid:W(e,a)},`
`+a.content+`
`,{atEnd:!0}),{ok:!0}}catch(s){return{error:`Could not add this to the note: ${s.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=W(e,a),l=await e.getNoteContent({uuid:s}),n=jt(l,a.pluginUUID,a.attachmentUUID);return n===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await e.replaceNoteContent({uuid:s},n),await Kt(e,s,a.attachmentUUID),{ok:!0})}catch(s){return{error:`Could not remove this viewer: ${s.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let s=await e.findNote({name:a.noteName}),l=s?s.uuid:await e.createNote(a.noteName);return await e.replaceNoteContent({uuid:l},a.content||""),{ok:!0,noteUUID:l}}catch(s){return{error:`Could not export highlights: ${s.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function bt(){function e(p,f){return{x:p.left-f.left,y:p.top-f.top,width:p.width,height:p.height}}function i(p,f){return{x:Math.min(p[0],f[0]),y:Math.min(p[1],f[1]),width:Math.abs(f[0]-p[0]),height:Math.abs(f[1]-p[1])}}function a(p,f){var g=Math.pow(10,f===void 0?2:f),y=function(E){return Math.round(E*g)/g};return{x:y(p.x),y:y(p.y),width:y(p.width),height:y(p.height)}}function s(p){return p.width>.01&&p.height>.01}function l(p,f,g){for(var y=String(p??""),E=Math.max(0,f===void 0?0:f),N=Math.min(y.length,g===void 0?y.length:g),S=function($){return $===""||/\s/.test($)},T=[],I=E;I<N;){for(;I<N&&S(y.charAt(I));)I++;if(I>=N)break;for(var O=I;I<N&&!S(y.charAt(I));)I++;T.push({start:O,end:I})}return T}function n(p){for(var f=1/0,g=1/0,y=-1/0,E=-1/0,N=0;N<(p?p.length:0);N++){var S=p[N];s(S)&&(f=Math.min(f,S.left),g=Math.min(g,S.top),y=Math.max(y,S.left+S.width),E=Math.max(E,S.top+S.height))}return isFinite(f)?{left:f,top:g,width:y-f,height:E-g}:null}function c(p,f,g){for(var y=[],E=0;E<p.length;E++){var N=e(p[E],f);if(s(N)){var S=g(N.x,N.y),T=g(N.x+N.width,N.y+N.height),I=a(i(S,T));s(I)&&y.push(I)}}return y}function h(p,f){var g=f(p.x,p.y),y=f(p.x+p.width,p.y+p.height);return i(g,y)}function b(p,f,g){var y=f.right-f.left,E=f.bottom-f.top;if(y<=0||E<=0)return null;var N=p.x2-p.x1,S=p.y2-p.y1,T=p.x1+(g.left-f.left)/y*N,I=p.x2-(f.right-g.right)/y*N,O=p.y1+(g.bottom-f.bottom)/E*S,$=p.y2-(f.top-g.top)/E*S;return{x:T,y:O,width:I-T,height:$-O}}function m(p,f){var g=Math.min(p.y+p.height,f.y+f.height)-Math.max(p.y,f.y);return g>.5*Math.min(p.height,f.height)}function H(p,f){var g=f===void 0?.6:f;if(!p||p.length<2)return(p||[]).slice();for(var y=p.slice().sort(function(q,G){return G.y-q.y||q.x-G.x}),E=[],N=0;N<y.length;N++){for(var S=!1,T=0;T<E.length;T++)if(m(E[T][0],y[N])){E[T].push(y[N]),S=!0;break}S||E.push([y[N]])}for(var I=[],O=0;O<E.length;O++){for(var $=E[O].slice().sort(function(q,G){return q.x-G.x}),D=null,B=0;B<$.length;B++){var F=$[B];if(D===null){D={x:F.x,y:F.y,width:F.width,height:F.height};continue}var Y=F.x-(D.x+D.width);if(Y<=g*Math.max(D.height,F.height)){var et=Math.max(D.x+D.width,F.x+F.width),pt=Math.max(D.y+D.height,F.y+F.height);D.x=Math.min(D.x,F.x),D.y=Math.min(D.y,F.y),D.width=et-D.x,D.height=pt-D.y}else I.push(D),D={x:F.x,y:F.y,width:F.width,height:F.height}}D!==null&&I.push(D)}return I.map(function(q){return a(q)})}function w(p,f,g,y){var E=y===void 0?0:y;return f>=p.x-E&&f<=p.x+p.width+E&&g>=p.y-E&&g<=p.y+p.height+E}function k(p,f,g,y,E){for(var N=p||[],S=N.length-1;S>=0;S--){var T=N[S];if(!(!T||T.page!==f||!T.rects)){for(var I=0;I<T.rects.length;I++)if(w(T.rects[I],g,y,E===void 0?1:E))return T}}return null}function C(p){return String(p??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:e,rectFromCorners:i,roundRect:a,isVisibleRect:s,textTokenRanges:l,unionClientRects:n,clientRectsToPdfRects:c,pdfRectToViewportRect:h,itemRelativeRect:b,mergeLineRects:H,rectContainsPoint:w,hitTestHighlights:k,normalizeQuoteText:C}}var _=bt(),yn=_.clientRectToLocal,Cn=_.rectFromCorners,En=_.roundRect,Nn=_.isVisibleRect,An=_.textTokenRanges,kn=_.unionClientRects,Sn=_.clientRectsToPdfRects,Tn=_.pdfRectToViewportRect,In=_.itemRelativeRect,Pn=_.mergeLineRects,Hn=_.rectContainsPoint,Dn=_.hitTestHighlights,Rn=_.normalizeQuoteText;function yt(){var e=[.957,.871,.424];function i(n,c,h,b,m){var H=c.context.register(c.context.obj({Type:n.PDFName.of("ExtGState"),BM:n.PDFName.of("Multiply"),ca:n.PDFNumber.of(.4)})),w=[n.pushGraphicsState(),n.setGraphicsState("GS0")];w.push(n.setFillingColor(n.rgb(b[0],b[1],b[2])));for(var k=0;k<h.length;k++){var C=h[k];w.push(n.moveTo(C.x,C.y)),w.push(n.lineTo(C.x,C.y+C.height)),w.push(n.lineTo(C.x+C.width,C.y+C.height)),w.push(n.lineTo(C.x+C.width,C.y)),w.push(n.closePath())}w.push(n.fill()),w.push(n.popGraphicsState());var p=c.context.formXObject(w,{BBox:m,Resources:{ExtGState:{GS0:H}}});return c.context.register(p)}function a(n,c,h,b){for(var m=h.rects,H=[],w=m[0].x,k=m[0].y,C=m[0].x+m[0].width,p=m[0].y+m[0].height,f=0;f<m.length;f++){var g=m[f],y=g.x,E=g.x+g.width,N=g.y,S=g.y+g.height;H.push(y,S,E,S,y,N,E,N),w=Math.min(w,y),k=Math.min(k,N),C=Math.max(C,E),p=Math.max(p,S)}var T=c.context.obj({Type:n.PDFName.of("Annot"),Subtype:n.PDFName.of("Highlight"),Rect:c.context.obj([w,k,C,p]),QuadPoints:c.context.obj(H),C:c.context.obj(b),F:n.PDFNumber.of(4),T:n.PDFString.of("PDF Annotator"),M:n.PDFString.of(new Date().toISOString()),CA:n.PDFNumber.of(.4)});h.note&&T.set(n.PDFName.of("Contents"),n.PDFString.of(h.note));var I=i(n,c,m,b,[w,k,C,p]);T.set(n.PDFName.of("AP"),c.context.obj({N:I}));var O=c.context.register(T),$=[O];if(h.note){var D=c.context.register(c.context.obj({Type:n.PDFName.of("Annot"),Subtype:n.PDFName.of("Popup"),Rect:c.context.obj([C+8,k-60,C+208,k+12]),Parent:O,Open:!1}));T.set(n.PDFName.of("Popup"),D),$.push(D)}return $}function s(n,c,h){var b=c.node.get(n.PDFName.of("Annots"));if(b instanceof n.PDFArray)for(var m=0;m<h.length;m++)b.push(h[m]);else c.node.set(n.PDFName.of("Annots"),c.doc.context.obj(h))}async function l(n,c,h,b){for(var m=await n.PDFDocument.load(c),H=m.getPages(),w=h||[],k=0;k<w.length;k++){var C=w[k];if(!(!C||!C.rects||!C.rects.length)){var p=H[C.page-1];if(p){var f=b&&b[C.color]||e,g=a(n,m,C,f);s(n,p,g)}}}return m.save()}return{writeHighlightsIntoPdf:l,buildHighlightAnnotation:a,appendAnnotationRefs:s}}var Ct=yt(),Ln=Ct.writeHighlightsIntoPdf,Mn=Ct.buildHighlightAnnotation,Fn=Ct.appendAnnotationRefs;function Et(){function e(n){return String(n??"").replace(/\]/g,"\\]")}function i(n,c,h,b,m){var H=new URLSearchParams;c&&H.set("att",c),Number.isFinite(h)&&h>=1&&H.set("page",String(Math.floor(h))),b&&H.set("hl",b),m&&H.set("note",m);var w=H.toString();return"plugin://"+n+(w?"?"+w:"")}function a(n,c,h,b,m,H){var w=i(c,h,b.page,b.id,H),k=e(n||"PDF"),C='==\u25CF<!-- {"cycleColor":"'+m+'"} -->==',p=C+" ["+k+"]("+w+")",f='> "'+(b.quoteText||"")+'"',g=[p,f];return b.note&&g.push(b.note),g.join(`
`)}function s(n){return n.slice().sort(function(c,h){if(c.page!==h.page)return c.page-h.page;var b=c.rects&&c.rects[0]?c.rects[0].y:0,m=h.rects&&h.rects[0]?h.rects[0].y:0;return m-b})}function l(n,c,h,b,m,H,w){var k=H&&H.length?H:null,C=(b||[]).filter(function(g){return g&&(!k||k.indexOf(g.color)!==-1)}),p=s(C),f=p.map(function(g){var y=m?m[g.color]:void 0;return a(n,c,h,g,y,w)});return f.join(`

`)}return{buildDeepLink:i,buildHighlightBlock:a,buildExportAllContent:l}}var Nt=Et(),$n=Nt.buildDeepLink,jn=Nt.buildHighlightBlock,_n=Nt.buildExportAllContent;function ee(){var e=window.__PDFA_CONFIG||{},i=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},s=window.__PDFA_EXPORT||{},l={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),collapsedCount:document.getElementById("pdfa-collapsed-count")},n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},highlights:[],pdfBytes:null,attachmentName:"",activeColorId:e.defaultColorId||((e.colors||[{}])[0]||{}).id,pendingSelection:null,noteEditing:null};function c(t,o){l.status.textContent=t||"",l.status.style.display=t?"block":"none",l.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function h(t){var o=Object.assign({noteUUID:e.noteUUID},t);return new Promise(function(r,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(o)))}catch(u){d(u)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function b(){return e.colors||[]}function m(t){for(var o=b(),r=0;r<o.length;r++)if(o[r].id===t)return o[r].hex;return o.length?o[0].hex:"#F4DE6C"}function H(t){for(var o=0;o<n.highlights.length;o++)if(n.highlights[o].id===t)return n.highlights[o];return null}function w(t,o,r){var d=document.createElement("button");return d.className="pdfa-btn"+(o?" "+o:""),d.textContent=t,d.onclick=function(u){u.stopPropagation(),r()},d}function k(t,o,r,d){var u=document.createElement("button");return u.className="pdfa-color",u.dataset.color=t.id,u.style.background=t.hex,u.title=d+" "+t.label,u.setAttribute("aria-label",d+" "+t.label),u.setAttribute("aria-pressed",String(!!o)),u.onclick=function(x){x.stopPropagation(),r(t.id)},u}function C(){for(var t=b(),o=0;o<t.length;o++)l.colors.appendChild(k(t[o],t[o].id===n.activeColorId,function(r){n.activeColorId=r,p(),n.pendingSelection&&et(n.pendingSelection,r)},"Highlight"))}function p(){for(var t=l.colors.querySelectorAll(".pdfa-color"),o=0;o<t.length;o++)t[o].setAttribute("aria-pressed",String(t[o].dataset.color===n.activeColorId))}function f(t,o){var r=t.getViewport({scale:n.scale});n.viewports[o]=r;var d=document.createElement("div");d.className="pdfa-page",d.dataset.page=String(o),d.style.width=r.width+"px",d.style.height=r.height+"px";var u=document.createElement("canvas"),x=window.devicePixelRatio||1;u.width=Math.floor(r.width*x),u.height=Math.floor(r.height*x),u.style.width=r.width+"px",u.style.height=r.height+"px",d.appendChild(u);var v=document.createElement("div");v.className="pdfa-highlights",d.appendChild(v);var A=document.createElement("div");A.className="textLayer",A.style.width=r.width+"px",A.style.height=r.height+"px",A.style.setProperty("--scale-factor",String(n.scale)),d.appendChild(A),l.pages.appendChild(d);var R=u.getContext("2d");return R.scale(x,x),t.render({canvasContext:R,viewport:r}).promise.then(function(){return t.getTextContent()}).then(function(M){var P=[];return window.pdfjsLib.renderTextLayer({textContent:M,container:A,viewport:r,textDivs:P}).promise.then(function(){n.textSpans+=P.length;for(var U=0;U<P.length;U++)P[U].__pdfaItem=M.items[U];E(o)})})}function g(){if(n.rendering)return Promise.resolve();n.rendering=!0,L(!0),l.pages.innerHTML="",n.viewports={},n.textSpans=0,c("Rendering...");for(var t=Promise.resolve(),o=1;o<=n.pageCount;o++)(function(r){t=t.then(function(){return n.doc.getPage(r).then(function(d){return f(d,r)})})})(o);return t.then(function(){n.textSpans===0?c("No selectable text found - this PDF may be a scan.",!0):c(""),n.rendering=!1,nt()}).catch(function(r){n.rendering=!1,c("Failed to render: "+r.message,!0)})}function y(t){return function(o,r){return t.convertToViewportPoint(o,r)}}function E(t){for(var o=t?'.pdfa-page[data-page="'+t+'"]':".pdfa-page",r=l.pages.querySelectorAll(o),d=0;d<r.length;d++){var u=r[d],x=Number(u.dataset.page),v=u.querySelector(".pdfa-highlights"),A=n.viewports[x];if(!(!v||!A)){v.innerHTML="";for(var R=y(A),M=0;M<n.highlights.length;M++){var P=n.highlights[M];if(!(!P||P.page!==x||!P.rects||!P.rects.length)){var U=document.createElement("div");U.className="pdfa-hl-group",U.dataset.id=P.id||"";for(var V=0;V<P.rects.length;V++){var Q=i.pdfRectToViewportRect(P.rects[V],R),j=document.createElement("div");j.className="pdfa-hl",j.style.left=Q.x+"px",j.style.top=Q.y+"px",j.style.width=Q.width+"px",j.style.height=Q.height+"px",j.style.background=m(P.color),U.appendChild(j)}v.appendChild(U)}}}}}function N(){E(),T(),l.count.textContent=String(n.highlights.length)}function S(){return n.highlights.slice().sort(function(t,o){return t.page!==o.page?t.page-o.page:(o.rects[0]?o.rects[0].y:0)-(t.rects[0]?t.rects[0].y:0)})}function T(){l.panel.innerHTML="";var t=document.createElement("div");t.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",t.appendChild(o),t.appendChild(w("Close","",function(){O(!1)})),l.panel.appendChild(t);var r=S();if(!r.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",l.panel.appendChild(d);return}for(var u=0;u<r.length;u++)l.panel.appendChild(I(r[u]))}function I(t){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=t.id||"",o.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=m(t.color),o.appendChild(r);var d=document.createElement("div"),u=document.createElement("div");u.className="pdfa-hl-page",u.textContent="Page "+t.page,d.appendChild(u);var x=document.createElement("div");if(x.className="pdfa-hl-quote",x.textContent=t.quoteText.length>160?t.quoteText.slice(0,160)+"...":t.quoteText,d.appendChild(x),t.note){var v=document.createElement("div");v.className="pdfa-hl-note",v.textContent=t.note,d.appendChild(v)}return o.appendChild(d),o.onclick=function(){St(t)},o}function O(t){var o=t===void 0?!l.panel.classList.contains("pdfa-open"):t;l.panel.classList.toggle("pdfa-open",o),l.listToggle.setAttribute("aria-pressed",String(o)),o&&T()}function $(t){for(var o=t&&t.nodeType===1?t:t&&t.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function D(t,o){for(var r=[],d=[],u=null,x=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),v;v=x.nextNode();)if(t.intersectsNode(v)){var A=v.nodeValue||"",R=v===t.startContainer?t.startOffset:0,M=v===t.endContainer?t.endOffset:A.length,P=v.parentElement,U=P&&P.__pdfaItem;if(U)for(var V={x1:U.transform[4],y1:U.transform[5],x2:U.transform[4]+U.width,y2:U.transform[5]+U.height},Q=P.getBoundingClientRect(),j=i.textTokenRanges(A,R,M),K=0;K<j.length;K++){var ft=document.createRange();ft.setStart(v,j[K].start),ft.setEnd(v,j[K].end);var z=i.unionClientRects(ft.getClientRects());if(z){var Rt={left:z.left,top:z.top,width:z.width,height:z.height,right:z.left+z.width,bottom:z.top+z.height},Ut=i.itemRelativeRect(V,Q,Rt);Ut&&(r.push(Ut),d.push(A.slice(j[K].start,j[K].end)),u=Rt)}}}return{rects:r,text:d.join(" "),lastCssRect:u}}function B(t){if(n.pendingSelection=t,!t){l.hint.textContent="",l.hint.style.display="none";return}l.hint.textContent=t.spilled?"Pick a color (page "+t.page+" only)":"Pick a color",l.hint.style.display="inline"}function F(t){if(!n.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){B(null),L();return}var r=o.getRangeAt(0),d=$(r.startContainer);if(!d)return B(null);var u=d.parentElement;if(!u||!u.dataset||!u.dataset.page)return B(null);var x=Number(u.dataset.page);if(!n.viewports[x])return B(null);var v=$(r.endContainer)!==d,A=D(r,d),R=i.mergeLineRects(A.rects);if(!R.length)return B(null);var M=A.lastCssRect||u.getBoundingClientRect(),P=t&&t.clientX?t.clientX:M.left+M.width/2,U=t&&t.clientY?t.clientY:M.top+M.height,V={page:x,rects:R,quoteText:i.normalizeQuoteText(A.text),spilled:v,anchorX:P,anchorY:U};B(V),ae(V)}}function Y(t,o){var r=n.highlights;return n.highlights=t,N(),h(o).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return n.highlights=d.highlights||t,N(),c(""),!0}).catch(function(d){return n.highlights=r,N(),c(d.message||String(d),!0),!1})}function et(t,o){var r={id:null,page:t.page,color:o,rects:t.rects,quoteText:t.quoteText,note:null},d=t.anchorX,u=t.anchorY;B(null),L(!0);var x=window.getSelection();x&&x.removeAllRanges&&x.removeAllRanges(),Y(n.highlights.concat([r]),{action:"addHighlight",attachmentUUID:e.attachmentUUID,highlight:r}).then(function(v){if(v){var A=n.highlights[n.highlights.length-1];A&&A.id&&ht(A,d,u,!0)}})}function pt(t,o){L(!0),Y(n.highlights.map(function(r){return r.id===t?Object.assign({},r,{color:o}):r}),{action:"recolorHighlight",attachmentUUID:e.attachmentUUID,id:t,color:o})}function q(t){L(!0),Y(n.highlights.filter(function(o){return o.id!==t}),{action:"removeHighlight",attachmentUUID:e.attachmentUUID,id:t})}function G(t,o){var r=String(o??"").trim();n.noteEditing=null,L(!0),Y(n.highlights.map(function(d){return d.id===t?Object.assign({},d,{note:r||null}):d}),{action:"setHighlightNote",attachmentUUID:e.attachmentUUID,id:t,note:r})}function X(t,o,r,d){l.popover.innerHTML="",l.popover.classList.toggle("pdfa-editing",d==="editing"),l.popover.classList.toggle("pdfa-exporting",d==="exporting"),l.popover.classList.toggle("pdfa-menu",d==="menu");for(var u=0;u<t.length;u++)l.popover.appendChild(t[u]);l.popover.classList.add("pdfa-open");var x=l.popover.offsetWidth,v=l.popover.offsetHeight,A=Math.max(4,Math.min(o-x/2,window.innerWidth-x-4)),R=r+12;R+v>window.innerHeight-4&&(R=Math.max(4,r-v-12)),l.popover.style.left=A+"px",l.popover.style.top=R+"px"}function L(t){n.noteEditing&&!t||(n.noteEditing=null,l.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),l.popover.innerHTML="")}function ae(t){for(var o=b(),r=[],d=0;d<o.length;d++)r.push(k(o[d],o[d].id===n.activeColorId,function(u){n.activeColorId=u,p(),et(t,u)},"Highlight"));X(r,t.anchorX,t.anchorY)}function ht(t,o,r,d){for(var u=b(),x=[],v=0;v<u.length;v++)x.push(k(u[v],u[v].id===t.color,function(R){pt(t.id,R)},"Change to"));var A=!!t.note;x.push(w(A?"Edit note":"Add note",d&&!A?"pdfa-btn-primary":"",function(){le(t,o,r)})),x.push(w("Copy","",function(){ge(t)})),x.push(w("Send to note","",function(){me(t)})),x.push(w("Remove","pdfa-remove",function(){q(t.id)})),X(x,o,r)}function ie(t,o){for(var r=b(),d={},u=0;u<r.length;u++)d[r[u].id]=!0;var x=document.createElement("div");x.className="pdfa-export-hint",x.textContent="Export highlights to a note";var v=document.createElement("div");v.className="pdfa-export-colors";for(var A=0;A<r.length;A++)(function(M){var P=k(M,!0,function(U){d[U]=!d[U],P.setAttribute("aria-pressed",String(d[U]))},"Toggle");v.appendChild(P)})(r[A]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(w("Create / update note","pdfa-btn-primary",function(){for(var M=[],P=0;P<r.length;P++)d[r[P].id]&&M.push(r[P].id);ve(M.length===r.length?null:M)})),X([x,v,R],t,o,"exporting")}function le(t,o,r){n.noteEditing=t.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=t.note||"",d.placeholder="Note for this highlight";var u=document.createElement("div");u.className="pdfa-note-actions",t.note&&u.appendChild(w("Delete note","",function(){G(t.id,"")}));var x=document.createElement("span");x.className="pdfa-spacer",u.appendChild(x),u.appendChild(w("Cancel","",function(){At(t,o,r)})),u.appendChild(w("Save","pdfa-btn-primary",function(){G(t.id,d.value)})),d.onkeydown=function(v){v.key==="Enter"&&(v.ctrlKey||v.metaKey)?(v.preventDefault(),v.stopPropagation(),G(t.id,d.value)):v.key==="Escape"&&(v.preventDefault(),v.stopPropagation(),At(t,o,r))},X([d,u],o,r,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function At(t,o,r){n.noteEditing=null;var d=H(t.id)||t;ht(d,o,r)}function se(t){if(!n.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var r=t.target,d=null;r&&r!==l.pages;){if(r.classList&&r.classList.contains("pdfa-page")){d=r;break}r=r.parentElement}if(!d)return L();var u=Number(d.dataset.page),x=n.viewports[u];if(!x)return L();var v=d.getBoundingClientRect(),A=x.convertToPdfPoint(t.clientX-v.left,t.clientY-v.top),R=i.hitTestHighlights(n.highlights,u,A[0],A[1],1);R&&R.id?ht(R,t.clientX,t.clientY):L()}}}function nt(){l.pageLabel.textContent=n.current+" / "+n.pageCount,l.zoomLabel.textContent=Math.round(n.scale*100)+"%"}function kt(){return l.root.querySelector(".pdfa-scroll")}function ut(t){var o=Math.min(Math.max(1,t),n.pageCount),r=l.pages.querySelector('[data-page="'+o+'"]');r&&r.scrollIntoView({behavior:"smooth",block:"start"}),n.current=o,nt()}function St(t){var o=l.pages.querySelector('.pdfa-page[data-page="'+t.page+'"]'),r=n.viewports[t.page];if(!(!o||!r||!t.rects||!t.rects.length)){var d=i.pdfRectToViewportRect(t.rects[0],y(r)),u=kt(),x=o.getBoundingClientRect().top+d.y;u.scrollTop+=x-u.getBoundingClientRect().top-u.clientHeight/3,n.current=t.page,nt()}}function Tt(t){n.scale=Math.min(Math.max(.4,t),4),g()}function de(){L();for(var t=l.pages.querySelectorAll(".pdfa-page"),o=n.current,r=1/0,d=0;d<t.length;d++){var u=Math.abs(t[d].getBoundingClientRect().top-60);u<r&&(r=u,o=Number(t[d].dataset.page))}o!==n.current&&(n.current=o,nt())}function ce(){return new Promise(function(t,o){if(window.pdfjsLib)return t(window.pdfjsLib);var r=document.createElement("script");r.src=e.pdfJsSrc,r.onload=function(){window.pdfjsLib?t(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function pe(){return new Promise(function(t,o){if(window.PDFLib)return t(window.PDFLib);var r=document.createElement("script");r.src=e.pdfLibSrc,r.onload=function(){window.PDFLib?t(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function he(){for(var t={},o=b(),r=0;r<o.length;r++)o[r].rgb&&(t[o[r].id]=o[r].rgb);return t}function ue(){var t=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return t+"-annotated.pdf"}function It(){for(var t={},o=b(),r=0;r<o.length;r++)o[r].cycleIndex!==void 0&&(t[o[r].id]=o[r].cycleIndex);return t}function Pt(){var t=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return t+" - Highlights"}function Ht(t){return s.buildHighlightBlock(n.attachmentName,e.pluginUUID,e.attachmentUUID,t,It()[t.color],e.noteUUID)}function fe(t){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):new Promise(function(o,r){var d=document.createElement("textarea");d.value=t,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select();var u=!1;try{u=document.execCommand("copy")}catch{u=!1}document.body.removeChild(d),u?o():r(new Error("Clipboard access is unavailable here."))})}function ge(t){L(!0),fe(Ht(t)).then(function(){c("Highlight copied - paste it into any note.")}).catch(function(o){c("Could not copy: "+(o.message||o),!0)})}function me(t){L(!0),h({action:"sendToNote",content:Ht(t)}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");c("Sent to the bottom of this note.")}).catch(function(o){c(o.message||String(o),!0)})}function ve(t){L(!0);var o=s.buildExportAllContent(n.attachmentName,e.pluginUUID,e.attachmentUUID,n.highlights,It(),t,e.noteUUID);if(!o){c(t?"No highlights match those colors.":"No highlights to export yet.",!0);return}h({action:"exportAll",noteName:Pt(),content:o}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");c('Exported to "'+Pt()+'".')}).catch(function(r){c(r.message||String(r),!0)})}function we(t,o){var r=[w("Collapse","",function(){L(!0),Ee()}),w("Download","",function(){L(!0),ye()}),w("Export...","",function(){ie(t,o)}),w("Remove viewer...","pdfa-remove",function(){xe(t,o)})];X(r,t,o,"menu")}function xe(t,o){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(w("Cancel","",function(){L(!0)}));var u=document.createElement("span");u.className="pdfa-spacer",d.appendChild(u),d.appendChild(w("Remove","pdfa-remove",be)),X([r,d],t,o,"exporting")}function be(){L(!0),c("Removing this viewer..."),h({action:"removeViewer",attachmentUUID:e.attachmentUUID,pluginUUID:e.pluginUUID}).then(function(t){if(!t||t.error)throw new Error(t&&t.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(t){c(t.message||String(t),!0)})}function ye(){n.pdfBytes&&(c("Preparing the download..."),pe().then(function(t){return a.writeHighlightsIntoPdf(t,n.pdfBytes,n.highlights,he())}).then(function(t){var o=new Blob([t],{type:"application/pdf"}),r=URL.createObjectURL(o),d=document.createElement("a");d.href=r,d.download=ue(),document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3),c("")}).catch(function(t){c("Could not prepare the download: "+(t.message||t),!0)}))}function Ce(){return h({action:"loadHighlights",attachmentUUID:e.attachmentUUID}).then(function(t){if(!t||t.error)throw new Error(t&&t.error||"No answer from the plugin");n.highlights=t.highlights||[]}).catch(function(t){n.highlights=[],c("Could not load saved highlights: "+(t.message||t),!0)})}function Ee(){var t=n.highlights.length;l.collapsedCount.textContent=t?t+(t===1?" highlight":" highlights"):"",l.root.classList.add("pdfa-collapsed-mode")}function Ne(){l.root.classList.remove("pdfa-collapsed-mode"),n.doc||Dt()}function Dt(){c("Loading PDF..."),ce().then(function(t){return t.GlobalWorkerOptions.workerSrc=e.workerSrc,h({action:"getPdfUrl",attachmentUUID:e.attachmentUUID})}).then(function(t){if(!t||!t.url)throw new Error(t&&t.error||"Could not resolve the PDF URL");return t.name&&(n.attachmentName=t.name,document.querySelector(".pdfa-name").textContent=t.name),fetch(t.url)}).then(function(t){if(!t.ok)throw new Error("Download failed (HTTP "+t.status+")");return t.arrayBuffer()}).then(function(t){return n.pdfBytes=t.slice(0),window.pdfjsLib.getDocument({data:t}).promise}).then(function(t){return n.doc=t,n.pageCount=t.numPages,Ce()}).then(function(){return g()}).then(function(){N();var t=e.highlightId?H(e.highlightId):null;t?St(t):e.page&&ut(e.page)}).catch(function(t){c(t.message||String(t),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ut(n.current-1)},document.getElementById("pdfa-next").onclick=function(){ut(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){Tt(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){Tt(n.scale-.25)},l.listToggle.onclick=function(){O()},l.more.onclick=function(t){we(t.clientX,t.clientY)},kt().addEventListener("scroll",de),l.pages.addEventListener("mouseup",F),l.pages.addEventListener("click",se),document.addEventListener("keydown",function(t){t.key==="Escape"&&!n.noteEditing&&L()}),document.addEventListener("mousedown",function(t){l.popover.classList.contains("pdfa-open")&&(l.popover.contains(t.target)||L())}),C(),T(),l.open.onclick=Ne,Dt()}catch(t){c("Viewer failed to start: "+(t&&t.message?t.message:t),!0)}}function ne(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Be(e){return JSON.stringify(e).replace(/</g,"\\u003c")}var ze=`
  * { box-sizing: border-box; }
  body { margin: 0; font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  #pdfa-root { display: flex; flex-direction: column; height: 100vh; background: var(--pdfa-bg); color: var(--pdfa-fg); }
  /* A MANUAL toggle, applied by viewer.js's collapseViewer/openViewer - never present on
     initial render (see buildEmbedHtml's own comment on why a default-collapsed embed,
     tried first, was explicitly rejected: it added a forced extra click before every
     annotation). height:auto here (not the 100vh above) so the collapsed bar takes only
     its own natural height, not a nearly-empty full-height box. */
  #pdfa-root.pdfa-collapsed-mode { height: auto; }
  #pdfa-root.pdfa-collapsed-mode .pdfa-toolbar,
  #pdfa-root.pdfa-collapsed-mode .pdfa-filename-bar,
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
  /* The filename gets its own row below the controls, genuinely centered relative to the
     WHOLE toolbar width - not "centered in whatever room the button row happens to leave
     over", which with a left-heavy control cluster (colors + Notes + the overflow menu)
     would still land noticeably right of center. A dedicated row also means it can never
     overlap the buttons above it, unlike true position:absolute centering would risk on
     a narrow embed where the controls alone can span more than half the width. */
  .pdfa-filename-bar { text-align: center; padding: 0 8px 6px; border-bottom: 1px solid var(--pdfa-border);
    background: var(--pdfa-toolbar); flex: 0 0 auto; }
  .pdfa-name { display: inline-block; max-width: 90%; opacity: .7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* No align-items: center here on purpose - see the .pdfa-page comment below. */
  .pdfa-scroll { flex: 1 1 auto; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px; }
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
`,oe={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function re({attachmentUUID:e,attachmentName:i="",page:a=null,highlightId:s=null,lightDarkMode:l="light",pluginUUID:n=null,noteUUID:c=null}={}){let h=oe[l]||oe.light,b={attachmentUUID:e,page:a,highlightId:s,pluginUUID:n,noteUUID:c,pdfJsSrc:Z.pdfJs,workerSrc:Z.pdfJsWorker,pdfLibSrc:Z.pdfLib,colors:ot.map(m=>({id:m.id,label:m.label,hex:m.hex,rgb:m.rgb,cycleIndex:m.cycleIndex})),defaultColorId:rt};return`<link rel="stylesheet" href="${Z.pdfViewerCss}">
<style>:root{${h}}${ze}</style>
<div id="pdfa-root">
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${ne(i)}</span>
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
  <!-- Its own row, centered - see the CSS comment on .pdfa-filename-bar for why this
       isn't just centered inline with the buttons above. -->
  <div class="pdfa-filename-bar">
    <span class="pdfa-name">${ne(i)}</span>
  </div>
  <div class="pdfa-status" id="pdfa-status">Loading...</div>
  <div class="pdfa-body">
    <div class="pdfa-scroll"><div id="pdfa-pages"></div></div>
    <div class="pdfa-panel" id="pdfa-panel"></div>
  </div>
  <!-- Colors on a fresh selection; recolor / note / remove on an existing highlight;
       the note editor itself. One element, filled in per context by the viewer. -->
  <div class="pdfa-popover" id="pdfa-popover"></div>
</div>
<script>window.__PDFA_CONFIG = ${Be(b)};
window.__PDFA_GEOM = (${bt.toString()})();
window.__PDFA_ANNOTATIONS = (${yt.toString()})();
window.__PDFA_EXPORT = (${Et.toString()})();<\/script>
<script>(${ee.toString()})();<\/script>`}var qe={noteOption:{"Annotate PDF":async function(e,i){return Bt(e,i,e.context.pluginUUID)},"Debug: dump note markdown":async function(e,i){return zt(e,i)}},insertText:async function(e){return qt(e,e.context.noteUUID,e.context.pluginUUID)},linkTarget:async function(e,...i){return Gt(e,i[0])},renderEmbed:function(e,...i){let{attachmentUUID:a,page:s,highlightId:l}=tt(i[0]);return a?re({attachmentUUID:a,page:s,highlightId:l,lightDarkMode:e.context.lightDarkMode,pluginUUID:e.context.pluginUUID,noteUUID:e.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(e,...i){return te(e,i[0])}},Ge=qe;return Pe(Ve);})();

  var plugin = __pluginModule.default;
})();
