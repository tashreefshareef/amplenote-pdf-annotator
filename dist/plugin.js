(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var gt=Object.defineProperty;var Ee=Object.getOwnPropertyDescriptor;var Ne=Object.getOwnPropertyNames;var ke=Object.prototype.hasOwnProperty;var Se=(e,i)=>{for(var a in i)gt(e,a,{get:i[a],enumerable:!0})},Ae=(e,i,a,d)=>{if(i&&typeof i=="object"||typeof i=="function")for(let l of Ne(i))!ke.call(e,l)&&l!==a&&gt(e,l,{get:()=>i[l],enumerable:!(d=Ee(i,l))||d.enumerable});return e};var Ie=e=>Ae(gt({},"__esModule",{value:!0}),e);var qe={};Se(qe,{default:()=>ze});var ot=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],rt="yellow",J="PDF Annotator data",Z={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},Te="https://plugins.amplenote.com/cors-proxy";function Lt(e){let i=new URL(Te);return i.searchParams.set("apiurl",e),i.toString()}var Pe="application/pdf";function De(e){return Array.isArray(e)?e.filter(i=>i&&i.type===Pe&&i.uuid):[]}async function at(e,i){let a=await e.getNoteAttachments({uuid:i}),d=De(a);if(d.length===0)return null;if(d.length===1)return d[0];let l=await e.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:d.map(c=>({label:c.name,value:c.uuid})),value:d[0].uuid}]});if(l==null)return null;let n=Array.isArray(l)?l[0]:l;return d.find(c=>c.uuid===n)||null}async function Mt(e,i){if(!i)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await e.getAttachmentURL(i);if(!a)throw new Error(`No URL returned for attachment ${i}`);return Lt(a)}function tt(e){let i={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null};if(!e||typeof e!="string")return i;let a;try{a=new URLSearchParams(e.replace(/^\?/,""))}catch{return i}let d=n=>{let c=a.get(n);if(c===null||c.trim()==="")return null;let h=Number(c);return Number.isFinite(h)?h:null},l=d("page");return{attachmentUUID:a.get("att")||null,page:l!==null&&l>=1?Math.floor(l):null,x:d("x"),y:d("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null}}function Ft({attachmentUUID:e,page:i,x:a,y:d,highlightId:l}={}){let n=new URLSearchParams;return e&&n.set("att",e),Number.isFinite(i)&&i>=1&&n.set("page",String(Math.floor(i))),Number.isFinite(a)&&n.set("x",String(a)),Number.isFinite(d)&&n.set("y",String(d)),l&&n.set("hl",l),n.toString()}function it(e,i={},a=1.2){if(!e)throw new Error("buildEmbedMarkup: pluginUUID required");let d=Ft(i);return`<object data="${d?`plugin://${e}?${d}`:`plugin://${e}`}" data-aspect-ratio="${a}" />`}function lt(e,i,a=null){return!e||!i||!e.includes(`plugin://${i}`)?!1:a?e.includes(`att=${a}`):!0}function Ot(e,i,a){if(!e||!i||!a)return null;let d=e.split(`
`),l=`plugin://${i}`,n=d.findIndex(h=>h.includes(l)&&h.includes(`att=${a}`));if(n===-1)return null;let c=d.slice();return c.splice(n,1),c[n]===""&&c[n-1]===""&&c.splice(n,1),c.join(`
`)}function $t(e,i,a,d={}){if(!e||!i||!a)return null;let l=e.split(`
`),n=`plugin://${i}`,c=l.findIndex(g=>g.includes(n)&&g.includes(`att=${a}`));if(c===-1)return null;let h=l[c],b=h.match(/data="(plugin:\/\/[^"]*)"/);if(!b)return null;let v=b[1],D=v.indexOf("?"),w=D===-1?"":v.slice(D+1),S=tt(w),C=Ft({...S,attachmentUUID:a,...d}),p=C?`plugin://${i}?${C}`:`plugin://${i}`,f=l.slice();return f[c]=h.replace(b[0],`data="${p}"`),f.join(`
`)}async function jt(e,i,a){let d=await at(e,i);if(!d){let n=await e.getNoteAttachments({uuid:i});return(!(Array.isArray(n)&&n.length>0)||!n.some(h=>h&&h.type==="application/pdf"))&&await e.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let l=await e.getNoteContent({uuid:i});return lt(l,a,d.uuid)?(await e.alert(`"${d.name}" is already open in this note - scroll to the viewer.`),d.uuid):(await e.insertNoteContent({uuid:i},`
${it(a,{attachmentUUID:d.uuid})}
`,{atEnd:!0}),d.uuid)}var He="Raw markdown";function Re(e){let i=(String(e||"").match(/`+/g)||[]).reduce((a,d)=>Math.max(a,d.length),0);return"`".repeat(Math.max(3,i+1))}async function _t(e,i){let a=await e.getNoteContent({uuid:i});if(typeof a!="string"||a==="")return await e.alert("That note came back empty - nothing to dump."),null;let d=await e.getNoteAttachments({uuid:i}),l=(Array.isArray(d)?d:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),n=Re(a),c=await e.createNote("PDF Annotator debug - note markdown");return await e.insertNoteContent({uuid:c},`# Attachments

${l||"- (none)"}

# ${He}

${n}
${a}
${n}
`,{atEnd:!0}),await e.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),c}async function Bt(e,i,a){if(!i)return"";let d=await at(e,i);if(!d){let n=await e.getNoteAttachments({uuid:i});return(!(Array.isArray(n)&&n.length>0)||!n.some(h=>h&&h.type==="application/pdf"))&&await e.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let l=await e.getNoteContent({uuid:i});return lt(l,a,d.uuid)?(await e.alert(`"${d.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${it(a,{attachmentUUID:d.uuid})}
`}async function zt(e,i){let{noteUUID:a,attachmentUUID:d,page:l,highlightId:n}=tt(i);if(!a){await e.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let c=await e.getNoteContent({uuid:a}),h=$t(c,e.context.pluginUUID,d,{page:l,highlightId:n});h!==null&&await e.replaceNoteContent({uuid:a},h)}catch{}await e.navigate(`https://www.amplenote.com/notes/${a}`)}function st(e){if(!e)return null;let i=String(e).trim().toLowerCase();return ot.find(a=>a.id===i||a.hex.toLowerCase()===i)||null}function qt(){return st(rt)}function Ue(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function dt({page:e,color:i,rects:a,quoteText:d,note:l=null,id:n=null}){if(!Number.isInteger(e)||e<1)throw new Error(`createHighlight: page must be a positive integer, got ${e}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of a)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let c=st(i)||qt();return{id:n||Ue(),page:e,color:c.id,rects:a.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(d||""),note:l?String(l):null}}function Gt(e,i){let a=i==null?null:String(i).trim();return{...e,note:a||null}}function Vt(e,i){let a=st(i);if(!a)throw new Error(`withColor: unknown color "${i}"`);return{...e,color:a.id}}function Wt(e,i){return(e||[]).filter(a=>a.id!==i)}function mt(e,i,a){let d=!1,l=(e||[]).map(n=>n.id!==i?n:(d=!0,a(n)));return d?l:e}var Le="json",Me="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function Jt(e){let i=JSON.stringify(e,null,0).replace(/`/g,"\\u0060");return`${Me}
\`\`\`${Le}
${i}
\`\`\``}function vt(e){if(!e)return null;let i=e.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!i&&e.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),d=(i?i[1]:a?a[1]:e).trim();if(!d)return null;try{return JSON.parse(d)}catch{return null}}function Fe(e){if(!Array.isArray(e))return[];let i=[];for(let a of e)try{i.push(dt(a))}catch{}return i}async function wt(e,i,a){let d=await e.getNoteContent({uuid:i}),l=xt(d,J),n=vt(l);return!n||typeof n!="object"?[]:Fe(n[a])}async function Yt(e,i,a,d){let l={uuid:i},n=await e.getNoteContent(l),c=xt(n,J),b={...vt(c)||{},[a]:d},v=Jt(b);c===null&&await e.insertNoteContent(l,`

# ${J}

`,{atEnd:!0}),await e.replaceNoteContent(l,v,{section:{heading:{text:J,level:1}}})}async function Xt(e,i,a){let d={uuid:i},l=await e.getNoteContent(d),n=xt(l,J);if(n===null)return;let c=vt(n)||{};if(!(a in c))return;let h={...c};delete h[a],await e.replaceNoteContent(d,Jt(h),{section:{heading:{text:J,level:1}}})}function xt(e,i){if(!e)return null;let a=e.split(`
`),d=/^#\s+(.*)$/,l=a.findIndex(c=>{let h=c.match(d);return h&&h[1].trim()===i});if(l===-1)return null;let n=a.length;for(let c=l+1;c<a.length;c++)if(/^#\s+/.test(a[c])){n=c;break}return a.slice(l+1,n).join(`
`).trim()}function W(e,i){return i.noteUUID||e.context.noteUUID}async function Oe(e,i,a){try{let d=await e.getNoteAttachments({uuid:i}),l=Array.isArray(d)&&d.find(n=>n&&n.uuid===a);return l?l.name:""}catch{return""}}async function ct(e,i,a,d){let l=await wt(e,i,a),n=d(l);return n!==l&&await Yt(e,i,a,n),{highlights:n}}function Qt(e){if(e&&typeof e=="object")return e;if(typeof e!="string")return{};let i=e.trim();if(!i.startsWith("{"))return{action:i};try{return JSON.parse(i)}catch{return{action:i}}}async function Kt(e,i){return JSON.stringify(await $e(e,Qt(i)))}async function $e(e,i){let a=Qt(i);switch(a.action){case"getPdfUrl":{let d=a.attachmentUUID;if(!d)return{error:"No attachment specified for this viewer."};try{return{url:await Mt(e,d),name:await Oe(e,W(e,a),d)}}catch(l){return{error:`Could not load the PDF: ${l.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await wt(e,W(e,a),a.attachmentUUID)}}catch(d){return{error:`Could not load highlights: ${d.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let d=dt(a.highlight||{});return await ct(e,W(e,a),a.attachmentUUID,l=>l.concat([d]))}catch(d){return{error:`Could not save the highlight: ${d.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ct(e,W(e,a),a.attachmentUUID,d=>mt(d,a.id,l=>Vt(l,a.color)))}catch(d){return{error:`Could not change the highlight color: ${d.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ct(e,W(e,a),a.attachmentUUID,d=>mt(d,a.id,l=>Gt(l,a.note)))}catch(d){return{error:`Could not save the note: ${d.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ct(e,W(e,a),a.attachmentUUID,d=>Wt(d,a.id))}catch(d){return{error:`Could not remove the highlight: ${d.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{return await e.insertNoteContent({uuid:W(e,a)},`
`+a.content+`
`,{atEnd:!0}),{ok:!0}}catch(d){return{error:`Could not add this to the note: ${d.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let d=W(e,a),l=await e.getNoteContent({uuid:d}),n=Ot(l,a.pluginUUID,a.attachmentUUID);return n===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await e.replaceNoteContent({uuid:d},n),await Xt(e,d,a.attachmentUUID),{ok:!0})}catch(d){return{error:`Could not remove this viewer: ${d.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let d=await e.findNote({name:a.noteName}),l=d?d.uuid:await e.createNote(a.noteName);return await e.replaceNoteContent({uuid:l},a.content||""),{ok:!0,noteUUID:l}}catch(d){return{error:`Could not export highlights: ${d.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function bt(){function e(p,f){return{x:p.left-f.left,y:p.top-f.top,width:p.width,height:p.height}}function i(p,f){return{x:Math.min(p[0],f[0]),y:Math.min(p[1],f[1]),width:Math.abs(f[0]-p[0]),height:Math.abs(f[1]-p[1])}}function a(p,f){var g=Math.pow(10,f===void 0?2:f),y=function(E){return Math.round(E*g)/g};return{x:y(p.x),y:y(p.y),width:y(p.width),height:y(p.height)}}function d(p){return p.width>.01&&p.height>.01}function l(p,f,g){for(var y=String(p??""),E=Math.max(0,f===void 0?0:f),N=Math.min(y.length,g===void 0?y.length:g),A=function($){return $===""||/\s/.test($)},I=[],T=E;T<N;){for(;T<N&&A(y.charAt(T));)T++;if(T>=N)break;for(var O=T;T<N&&!A(y.charAt(T));)T++;I.push({start:O,end:T})}return I}function n(p){for(var f=1/0,g=1/0,y=-1/0,E=-1/0,N=0;N<(p?p.length:0);N++){var A=p[N];d(A)&&(f=Math.min(f,A.left),g=Math.min(g,A.top),y=Math.max(y,A.left+A.width),E=Math.max(E,A.top+A.height))}return isFinite(f)?{left:f,top:g,width:y-f,height:E-g}:null}function c(p,f,g){for(var y=[],E=0;E<p.length;E++){var N=e(p[E],f);if(d(N)){var A=g(N.x,N.y),I=g(N.x+N.width,N.y+N.height),T=a(i(A,I));d(T)&&y.push(T)}}return y}function h(p,f){var g=f(p.x,p.y),y=f(p.x+p.width,p.y+p.height);return i(g,y)}function b(p,f,g){var y=f.right-f.left,E=f.bottom-f.top;if(y<=0||E<=0)return null;var N=p.x2-p.x1,A=p.y2-p.y1,I=p.x1+(g.left-f.left)/y*N,T=p.x2-(f.right-g.right)/y*N,O=p.y1+(g.bottom-f.bottom)/E*A,$=p.y2-(f.top-g.top)/E*A;return{x:I,y:O,width:T-I,height:$-O}}function v(p,f){var g=Math.min(p.y+p.height,f.y+f.height)-Math.max(p.y,f.y);return g>.5*Math.min(p.height,f.height)}function D(p,f){var g=f===void 0?.6:f;if(!p||p.length<2)return(p||[]).slice();for(var y=p.slice().sort(function(q,G){return G.y-q.y||q.x-G.x}),E=[],N=0;N<y.length;N++){for(var A=!1,I=0;I<E.length;I++)if(v(E[I][0],y[N])){E[I].push(y[N]),A=!0;break}A||E.push([y[N]])}for(var T=[],O=0;O<E.length;O++){for(var $=E[O].slice().sort(function(q,G){return q.x-G.x}),H=null,B=0;B<$.length;B++){var F=$[B];if(H===null){H={x:F.x,y:F.y,width:F.width,height:F.height};continue}var Y=F.x-(H.x+H.width);if(Y<=g*Math.max(H.height,F.height)){var et=Math.max(H.x+H.width,F.x+F.width),pt=Math.max(H.y+H.height,F.y+F.height);H.x=Math.min(H.x,F.x),H.y=Math.min(H.y,F.y),H.width=et-H.x,H.height=pt-H.y}else T.push(H),H={x:F.x,y:F.y,width:F.width,height:F.height}}H!==null&&T.push(H)}return T.map(function(q){return a(q)})}function w(p,f,g,y){var E=y===void 0?0:y;return f>=p.x-E&&f<=p.x+p.width+E&&g>=p.y-E&&g<=p.y+p.height+E}function S(p,f,g,y,E){for(var N=p||[],A=N.length-1;A>=0;A--){var I=N[A];if(!(!I||I.page!==f||!I.rects)){for(var T=0;T<I.rects.length;T++)if(w(I.rects[T],g,y,E===void 0?1:E))return I}}return null}function C(p){return String(p??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:e,rectFromCorners:i,roundRect:a,isVisibleRect:d,textTokenRanges:l,unionClientRects:n,clientRectsToPdfRects:c,pdfRectToViewportRect:h,itemRelativeRect:b,mergeLineRects:D,rectContainsPoint:w,hitTestHighlights:S,normalizeQuoteText:C}}var _=bt(),wn=_.clientRectToLocal,xn=_.rectFromCorners,bn=_.roundRect,yn=_.isVisibleRect,Cn=_.textTokenRanges,En=_.unionClientRects,Nn=_.clientRectsToPdfRects,kn=_.pdfRectToViewportRect,Sn=_.itemRelativeRect,An=_.mergeLineRects,In=_.rectContainsPoint,Tn=_.hitTestHighlights,Pn=_.normalizeQuoteText;function yt(){var e=[.957,.871,.424];function i(n,c,h,b,v){var D=c.context.register(c.context.obj({Type:n.PDFName.of("ExtGState"),BM:n.PDFName.of("Multiply"),ca:n.PDFNumber.of(.4)})),w=[n.pushGraphicsState(),n.setGraphicsState("GS0")];w.push(n.setFillingColor(n.rgb(b[0],b[1],b[2])));for(var S=0;S<h.length;S++){var C=h[S];w.push(n.moveTo(C.x,C.y)),w.push(n.lineTo(C.x,C.y+C.height)),w.push(n.lineTo(C.x+C.width,C.y+C.height)),w.push(n.lineTo(C.x+C.width,C.y)),w.push(n.closePath())}w.push(n.fill()),w.push(n.popGraphicsState());var p=c.context.formXObject(w,{BBox:v,Resources:{ExtGState:{GS0:D}}});return c.context.register(p)}function a(n,c,h,b){for(var v=h.rects,D=[],w=v[0].x,S=v[0].y,C=v[0].x+v[0].width,p=v[0].y+v[0].height,f=0;f<v.length;f++){var g=v[f],y=g.x,E=g.x+g.width,N=g.y,A=g.y+g.height;D.push(y,A,E,A,y,N,E,N),w=Math.min(w,y),S=Math.min(S,N),C=Math.max(C,E),p=Math.max(p,A)}var I=c.context.obj({Type:n.PDFName.of("Annot"),Subtype:n.PDFName.of("Highlight"),Rect:c.context.obj([w,S,C,p]),QuadPoints:c.context.obj(D),C:c.context.obj(b),F:n.PDFNumber.of(4),T:n.PDFString.of("PDF Annotator"),M:n.PDFString.of(new Date().toISOString()),CA:n.PDFNumber.of(.4)});h.note&&I.set(n.PDFName.of("Contents"),n.PDFString.of(h.note));var T=i(n,c,v,b,[w,S,C,p]);I.set(n.PDFName.of("AP"),c.context.obj({N:T}));var O=c.context.register(I),$=[O];if(h.note){var H=c.context.register(c.context.obj({Type:n.PDFName.of("Annot"),Subtype:n.PDFName.of("Popup"),Rect:c.context.obj([C+8,S-60,C+208,S+12]),Parent:O,Open:!1}));I.set(n.PDFName.of("Popup"),H),$.push(H)}return $}function d(n,c,h){var b=c.node.get(n.PDFName.of("Annots"));if(b instanceof n.PDFArray)for(var v=0;v<h.length;v++)b.push(h[v]);else c.node.set(n.PDFName.of("Annots"),c.doc.context.obj(h))}async function l(n,c,h,b){for(var v=await n.PDFDocument.load(c),D=v.getPages(),w=h||[],S=0;S<w.length;S++){var C=w[S];if(!(!C||!C.rects||!C.rects.length)){var p=D[C.page-1];if(p){var f=b&&b[C.color]||e,g=a(n,v,C,f);d(n,p,g)}}}return v.save()}return{writeHighlightsIntoPdf:l,buildHighlightAnnotation:a,appendAnnotationRefs:d}}var Ct=yt(),Hn=Ct.writeHighlightsIntoPdf,Rn=Ct.buildHighlightAnnotation,Un=Ct.appendAnnotationRefs;function Et(){function e(n){return String(n??"").replace(/\]/g,"\\]")}function i(n,c,h,b,v){var D=new URLSearchParams;c&&D.set("att",c),Number.isFinite(h)&&h>=1&&D.set("page",String(Math.floor(h))),b&&D.set("hl",b),v&&D.set("note",v);var w=D.toString();return"plugin://"+n+(w?"?"+w:"")}function a(n,c,h,b,v,D){var w=i(c,h,b.page,b.id,D),S=e(n||"PDF"),C='==\u25CF<!-- {"cycleColor":"'+v+'"} -->==',p=C+" ["+S+"]("+w+")",f='> "'+(b.quoteText||"")+'"',g=[p,f];return b.note&&g.push(b.note),g.join(`
`)}function d(n){return n.slice().sort(function(c,h){if(c.page!==h.page)return c.page-h.page;var b=c.rects&&c.rects[0]?c.rects[0].y:0,v=h.rects&&h.rects[0]?h.rects[0].y:0;return v-b})}function l(n,c,h,b,v,D,w){var S=D&&D.length?D:null,C=(b||[]).filter(function(g){return g&&(!S||S.indexOf(g.color)!==-1)}),p=d(C),f=p.map(function(g){var y=v?v[g.color]:void 0;return a(n,c,h,g,y,w)});return f.join(`

`)}return{buildDeepLink:i,buildHighlightBlock:a,buildExportAllContent:l}}var Nt=Et(),Mn=Nt.buildDeepLink,Fn=Nt.buildHighlightBlock,On=Nt.buildExportAllContent;function Zt(){var e=window.__PDFA_CONFIG||{},i=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},d=window.__PDFA_EXPORT||{},l={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),collapsedCount:document.getElementById("pdfa-collapsed-count")},n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},highlights:[],pdfBytes:null,attachmentName:"",activeColorId:e.defaultColorId||((e.colors||[{}])[0]||{}).id,pendingSelection:null,noteEditing:null};function c(t,o){l.status.textContent=t||"",l.status.style.display=t?"block":"none",l.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function h(t){var o=Object.assign({noteUUID:e.noteUUID},t);return new Promise(function(r,s){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(o)))}catch(u){s(u)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function b(){return e.colors||[]}function v(t){for(var o=b(),r=0;r<o.length;r++)if(o[r].id===t)return o[r].hex;return o.length?o[0].hex:"#F4DE6C"}function D(t){for(var o=0;o<n.highlights.length;o++)if(n.highlights[o].id===t)return n.highlights[o];return null}function w(t,o,r){var s=document.createElement("button");return s.className="pdfa-btn"+(o?" "+o:""),s.textContent=t,s.onclick=function(u){u.stopPropagation(),r()},s}function S(t,o,r,s){var u=document.createElement("button");return u.className="pdfa-color",u.dataset.color=t.id,u.style.background=t.hex,u.title=s+" "+t.label,u.setAttribute("aria-label",s+" "+t.label),u.setAttribute("aria-pressed",String(!!o)),u.onclick=function(x){x.stopPropagation(),r(t.id)},u}function C(){for(var t=b(),o=0;o<t.length;o++)l.colors.appendChild(S(t[o],t[o].id===n.activeColorId,function(r){n.activeColorId=r,p(),n.pendingSelection&&et(n.pendingSelection,r)},"Highlight"))}function p(){for(var t=l.colors.querySelectorAll(".pdfa-color"),o=0;o<t.length;o++)t[o].setAttribute("aria-pressed",String(t[o].dataset.color===n.activeColorId))}function f(t,o){var r=t.getViewport({scale:n.scale});n.viewports[o]=r;var s=document.createElement("div");s.className="pdfa-page",s.dataset.page=String(o),s.style.width=r.width+"px",s.style.height=r.height+"px";var u=document.createElement("canvas"),x=window.devicePixelRatio||1;u.width=Math.floor(r.width*x),u.height=Math.floor(r.height*x),u.style.width=r.width+"px",u.style.height=r.height+"px",s.appendChild(u);var m=document.createElement("div");m.className="pdfa-highlights",s.appendChild(m);var k=document.createElement("div");k.className="textLayer",k.style.width=r.width+"px",k.style.height=r.height+"px",k.style.setProperty("--scale-factor",String(n.scale)),s.appendChild(k),l.pages.appendChild(s);var R=u.getContext("2d");return R.scale(x,x),t.render({canvasContext:R,viewport:r}).promise.then(function(){return t.getTextContent()}).then(function(M){var P=[];return window.pdfjsLib.renderTextLayer({textContent:M,container:k,viewport:r,textDivs:P}).promise.then(function(){n.textSpans+=P.length;for(var U=0;U<P.length;U++)P[U].__pdfaItem=M.items[U];E(o)})})}function g(){if(n.rendering)return Promise.resolve();n.rendering=!0,L(!0),l.pages.innerHTML="",n.viewports={},n.textSpans=0,c("Rendering...");for(var t=Promise.resolve(),o=1;o<=n.pageCount;o++)(function(r){t=t.then(function(){return n.doc.getPage(r).then(function(s){return f(s,r)})})})(o);return t.then(function(){n.textSpans===0?c("No selectable text found - this PDF may be a scan.",!0):c(""),n.rendering=!1,nt()}).catch(function(r){n.rendering=!1,c("Failed to render: "+r.message,!0)})}function y(t){return function(o,r){return t.convertToViewportPoint(o,r)}}function E(t){for(var o=t?'.pdfa-page[data-page="'+t+'"]':".pdfa-page",r=l.pages.querySelectorAll(o),s=0;s<r.length;s++){var u=r[s],x=Number(u.dataset.page),m=u.querySelector(".pdfa-highlights"),k=n.viewports[x];if(!(!m||!k)){m.innerHTML="";for(var R=y(k),M=0;M<n.highlights.length;M++){var P=n.highlights[M];if(!(!P||P.page!==x||!P.rects||!P.rects.length)){var U=document.createElement("div");U.className="pdfa-hl-group",U.dataset.id=P.id||"";for(var V=0;V<P.rects.length;V++){var Q=i.pdfRectToViewportRect(P.rects[V],R),j=document.createElement("div");j.className="pdfa-hl",j.style.left=Q.x+"px",j.style.top=Q.y+"px",j.style.width=Q.width+"px",j.style.height=Q.height+"px",j.style.background=v(P.color),U.appendChild(j)}m.appendChild(U)}}}}}function N(){E(),I(),l.count.textContent=String(n.highlights.length)}function A(){return n.highlights.slice().sort(function(t,o){return t.page!==o.page?t.page-o.page:(o.rects[0]?o.rects[0].y:0)-(t.rects[0]?t.rects[0].y:0)})}function I(){l.panel.innerHTML="";var t=document.createElement("div");t.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",t.appendChild(o),t.appendChild(w("Close","",function(){O(!1)})),l.panel.appendChild(t);var r=A();if(!r.length){var s=document.createElement("div");s.className="pdfa-panel-empty",s.textContent="No highlights yet. Select some text in the PDF and pick a color.",l.panel.appendChild(s);return}for(var u=0;u<r.length;u++)l.panel.appendChild(T(r[u]))}function T(t){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=t.id||"",o.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=v(t.color),o.appendChild(r);var s=document.createElement("div"),u=document.createElement("div");u.className="pdfa-hl-page",u.textContent="Page "+t.page,s.appendChild(u);var x=document.createElement("div");if(x.className="pdfa-hl-quote",x.textContent=t.quoteText.length>160?t.quoteText.slice(0,160)+"...":t.quoteText,s.appendChild(x),t.note){var m=document.createElement("div");m.className="pdfa-hl-note",m.textContent=t.note,s.appendChild(m)}return o.appendChild(s),o.onclick=function(){At(t)},o}function O(t){var o=t===void 0?!l.panel.classList.contains("pdfa-open"):t;l.panel.classList.toggle("pdfa-open",o),l.listToggle.setAttribute("aria-pressed",String(o)),o&&I()}function $(t){for(var o=t&&t.nodeType===1?t:t&&t.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function H(t,o){for(var r=[],s=[],u=null,x=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),m;m=x.nextNode();)if(t.intersectsNode(m)){var k=m.nodeValue||"",R=m===t.startContainer?t.startOffset:0,M=m===t.endContainer?t.endOffset:k.length,P=m.parentElement,U=P&&P.__pdfaItem;if(U)for(var V={x1:U.transform[4],y1:U.transform[5],x2:U.transform[4]+U.width,y2:U.transform[5]+U.height},Q=P.getBoundingClientRect(),j=i.textTokenRanges(k,R,M),K=0;K<j.length;K++){var ft=document.createRange();ft.setStart(m,j[K].start),ft.setEnd(m,j[K].end);var z=i.unionClientRects(ft.getClientRects());if(z){var Rt={left:z.left,top:z.top,width:z.width,height:z.height,right:z.left+z.width,bottom:z.top+z.height},Ut=i.itemRelativeRect(V,Q,Rt);Ut&&(r.push(Ut),s.push(k.slice(j[K].start,j[K].end)),u=Rt)}}}return{rects:r,text:s.join(" "),lastCssRect:u}}function B(t){if(n.pendingSelection=t,!t){l.hint.textContent="",l.hint.style.display="none";return}l.hint.textContent=t.spilled?"Pick a color (page "+t.page+" only)":"Pick a color",l.hint.style.display="inline"}function F(t){if(!n.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){B(null),L();return}var r=o.getRangeAt(0),s=$(r.startContainer);if(!s)return B(null);var u=s.parentElement;if(!u||!u.dataset||!u.dataset.page)return B(null);var x=Number(u.dataset.page);if(!n.viewports[x])return B(null);var m=$(r.endContainer)!==s,k=H(r,s),R=i.mergeLineRects(k.rects);if(!R.length)return B(null);var M=k.lastCssRect||u.getBoundingClientRect(),P=t&&t.clientX?t.clientX:M.left+M.width/2,U=t&&t.clientY?t.clientY:M.top+M.height,V={page:x,rects:R,quoteText:i.normalizeQuoteText(k.text),spilled:m,anchorX:P,anchorY:U};B(V),oe(V)}}function Y(t,o){var r=n.highlights;return n.highlights=t,N(),h(o).then(function(s){if(!s||s.error)throw new Error(s&&s.error||"The plugin did not confirm the change.");return n.highlights=s.highlights||t,N(),c(""),!0}).catch(function(s){return n.highlights=r,N(),c(s.message||String(s),!0),!1})}function et(t,o){var r={id:null,page:t.page,color:o,rects:t.rects,quoteText:t.quoteText,note:null},s=t.anchorX,u=t.anchorY;B(null),L(!0);var x=window.getSelection();x&&x.removeAllRanges&&x.removeAllRanges(),Y(n.highlights.concat([r]),{action:"addHighlight",attachmentUUID:e.attachmentUUID,highlight:r}).then(function(m){if(m){var k=n.highlights[n.highlights.length-1];k&&k.id&&ht(k,s,u,!0)}})}function pt(t,o){L(!0),Y(n.highlights.map(function(r){return r.id===t?Object.assign({},r,{color:o}):r}),{action:"recolorHighlight",attachmentUUID:e.attachmentUUID,id:t,color:o})}function q(t){L(!0),Y(n.highlights.filter(function(o){return o.id!==t}),{action:"removeHighlight",attachmentUUID:e.attachmentUUID,id:t})}function G(t,o){var r=String(o??"").trim();n.noteEditing=null,L(!0),Y(n.highlights.map(function(s){return s.id===t?Object.assign({},s,{note:r||null}):s}),{action:"setHighlightNote",attachmentUUID:e.attachmentUUID,id:t,note:r})}function X(t,o,r,s){l.popover.innerHTML="",l.popover.classList.toggle("pdfa-editing",s==="editing"),l.popover.classList.toggle("pdfa-exporting",s==="exporting"),l.popover.classList.toggle("pdfa-menu",s==="menu");for(var u=0;u<t.length;u++)l.popover.appendChild(t[u]);l.popover.classList.add("pdfa-open");var x=l.popover.offsetWidth,m=l.popover.offsetHeight,k=Math.max(4,Math.min(o-x/2,window.innerWidth-x-4)),R=r+12;R+m>window.innerHeight-4&&(R=Math.max(4,r-m-12)),l.popover.style.left=k+"px",l.popover.style.top=R+"px"}function L(t){n.noteEditing&&!t||(n.noteEditing=null,l.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),l.popover.innerHTML="")}function oe(t){for(var o=b(),r=[],s=0;s<o.length;s++)r.push(S(o[s],o[s].id===n.activeColorId,function(u){n.activeColorId=u,p(),et(t,u)},"Highlight"));X(r,t.anchorX,t.anchorY)}function ht(t,o,r,s){for(var u=b(),x=[],m=0;m<u.length;m++)x.push(S(u[m],u[m].id===t.color,function(R){pt(t.id,R)},"Change to"));var k=!!t.note;x.push(w(k?"Edit note":"Add note",s&&!k?"pdfa-btn-primary":"",function(){ae(t,o,r)})),x.push(w("Copy","",function(){ue(t)})),x.push(w("Send to note","",function(){fe(t)})),x.push(w("Remove","pdfa-remove",function(){q(t.id)})),X(x,o,r)}function re(t,o){for(var r=b(),s={},u=0;u<r.length;u++)s[r[u].id]=!0;var x=document.createElement("div");x.className="pdfa-export-hint",x.textContent="Export highlights to a note";var m=document.createElement("div");m.className="pdfa-export-colors";for(var k=0;k<r.length;k++)(function(M){var P=S(M,!0,function(U){s[U]=!s[U],P.setAttribute("aria-pressed",String(s[U]))},"Toggle");m.appendChild(P)})(r[k]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(w("Create / update note","pdfa-btn-primary",function(){for(var M=[],P=0;P<r.length;P++)s[r[P].id]&&M.push(r[P].id);ge(M.length===r.length?null:M)})),X([x,m,R],t,o,"exporting")}function ae(t,o,r){n.noteEditing=t.id;var s=document.createElement("textarea");s.className="pdfa-note-input",s.rows=3,s.value=t.note||"",s.placeholder="Note for this highlight";var u=document.createElement("div");u.className="pdfa-note-actions",t.note&&u.appendChild(w("Delete note","",function(){G(t.id,"")}));var x=document.createElement("span");x.className="pdfa-spacer",u.appendChild(x),u.appendChild(w("Cancel","",function(){kt(t,o,r)})),u.appendChild(w("Save","pdfa-btn-primary",function(){G(t.id,s.value)})),s.onkeydown=function(m){m.key==="Enter"&&(m.ctrlKey||m.metaKey)?(m.preventDefault(),m.stopPropagation(),G(t.id,s.value)):m.key==="Escape"&&(m.preventDefault(),m.stopPropagation(),kt(t,o,r))},X([s,u],o,r,"editing"),s.focus(),s.setSelectionRange(s.value.length,s.value.length)}function kt(t,o,r){n.noteEditing=null;var s=D(t.id)||t;ht(s,o,r)}function ie(t){if(!n.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var r=t.target,s=null;r&&r!==l.pages;){if(r.classList&&r.classList.contains("pdfa-page")){s=r;break}r=r.parentElement}if(!s)return L();var u=Number(s.dataset.page),x=n.viewports[u];if(!x)return L();var m=s.getBoundingClientRect(),k=x.convertToPdfPoint(t.clientX-m.left,t.clientY-m.top),R=i.hitTestHighlights(n.highlights,u,k[0],k[1],1);R&&R.id?ht(R,t.clientX,t.clientY):L()}}}function nt(){l.pageLabel.textContent=n.current+" / "+n.pageCount,l.zoomLabel.textContent=Math.round(n.scale*100)+"%"}function St(){return l.root.querySelector(".pdfa-scroll")}function ut(t){var o=Math.min(Math.max(1,t),n.pageCount),r=l.pages.querySelector('[data-page="'+o+'"]');r&&r.scrollIntoView({behavior:"smooth",block:"start"}),n.current=o,nt()}function At(t){var o=l.pages.querySelector('.pdfa-page[data-page="'+t.page+'"]'),r=n.viewports[t.page];if(!(!o||!r||!t.rects||!t.rects.length)){var s=i.pdfRectToViewportRect(t.rects[0],y(r)),u=St(),x=o.getBoundingClientRect().top+s.y;u.scrollTop+=x-u.getBoundingClientRect().top-u.clientHeight/3,n.current=t.page,nt()}}function It(t){n.scale=Math.min(Math.max(.4,t),4),g()}function le(){L();for(var t=l.pages.querySelectorAll(".pdfa-page"),o=n.current,r=1/0,s=0;s<t.length;s++){var u=Math.abs(t[s].getBoundingClientRect().top-60);u<r&&(r=u,o=Number(t[s].dataset.page))}o!==n.current&&(n.current=o,nt())}function se(){return new Promise(function(t,o){if(window.pdfjsLib)return t(window.pdfjsLib);var r=document.createElement("script");r.src=e.pdfJsSrc,r.onload=function(){window.pdfjsLib?t(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function de(){return new Promise(function(t,o){if(window.PDFLib)return t(window.PDFLib);var r=document.createElement("script");r.src=e.pdfLibSrc,r.onload=function(){window.PDFLib?t(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function ce(){for(var t={},o=b(),r=0;r<o.length;r++)o[r].rgb&&(t[o[r].id]=o[r].rgb);return t}function pe(){var t=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return t+"-annotated.pdf"}function Tt(){for(var t={},o=b(),r=0;r<o.length;r++)o[r].cycleIndex!==void 0&&(t[o[r].id]=o[r].cycleIndex);return t}function Pt(){var t=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return t+" - Highlights"}function Dt(t){return d.buildHighlightBlock(n.attachmentName,e.pluginUUID,e.attachmentUUID,t,Tt()[t.color],e.noteUUID)}function he(t){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):new Promise(function(o,r){var s=document.createElement("textarea");s.value=t,s.style.position="fixed",s.style.left="-9999px",document.body.appendChild(s),s.focus(),s.select();var u=!1;try{u=document.execCommand("copy")}catch{u=!1}document.body.removeChild(s),u?o():r(new Error("Clipboard access is unavailable here."))})}function ue(t){L(!0),he(Dt(t)).then(function(){c("Highlight copied - paste it into any note.")}).catch(function(o){c("Could not copy: "+(o.message||o),!0)})}function fe(t){L(!0),h({action:"sendToNote",content:Dt(t)}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");c("Sent to the bottom of this note.")}).catch(function(o){c(o.message||String(o),!0)})}function ge(t){L(!0);var o=d.buildExportAllContent(n.attachmentName,e.pluginUUID,e.attachmentUUID,n.highlights,Tt(),t,e.noteUUID);if(!o){c(t?"No highlights match those colors.":"No highlights to export yet.",!0);return}h({action:"exportAll",noteName:Pt(),content:o}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");c('Exported to "'+Pt()+'".')}).catch(function(r){c(r.message||String(r),!0)})}function me(t,o){var r=[w("Collapse","",function(){L(!0),ye()}),w("Download","",function(){L(!0),xe()}),w("Export...","",function(){re(t,o)}),w("Remove viewer...","pdfa-remove",function(){ve(t,o)})];X(r,t,o,"menu")}function ve(t,o){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var s=document.createElement("div");s.className="pdfa-note-actions",s.appendChild(w("Cancel","",function(){L(!0)}));var u=document.createElement("span");u.className="pdfa-spacer",s.appendChild(u),s.appendChild(w("Remove","pdfa-remove",we)),X([r,s],t,o,"exporting")}function we(){L(!0),c("Removing this viewer..."),h({action:"removeViewer",attachmentUUID:e.attachmentUUID,pluginUUID:e.pluginUUID}).then(function(t){if(!t||t.error)throw new Error(t&&t.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(t){c(t.message||String(t),!0)})}function xe(){n.pdfBytes&&(c("Preparing the download..."),de().then(function(t){return a.writeHighlightsIntoPdf(t,n.pdfBytes,n.highlights,ce())}).then(function(t){var o=new Blob([t],{type:"application/pdf"}),r=URL.createObjectURL(o),s=document.createElement("a");s.href=r,s.download=pe(),document.body.appendChild(s),s.click(),s.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3),c("")}).catch(function(t){c("Could not prepare the download: "+(t.message||t),!0)}))}function be(){return h({action:"loadHighlights",attachmentUUID:e.attachmentUUID}).then(function(t){if(!t||t.error)throw new Error(t&&t.error||"No answer from the plugin");n.highlights=t.highlights||[]}).catch(function(t){n.highlights=[],c("Could not load saved highlights: "+(t.message||t),!0)})}function ye(){var t=n.highlights.length;l.collapsedCount.textContent=t?t+(t===1?" highlight":" highlights"):"",l.root.classList.add("pdfa-collapsed-mode")}function Ce(){l.root.classList.remove("pdfa-collapsed-mode"),n.doc||Ht()}function Ht(){c("Loading PDF..."),se().then(function(t){return t.GlobalWorkerOptions.workerSrc=e.workerSrc,h({action:"getPdfUrl",attachmentUUID:e.attachmentUUID})}).then(function(t){if(!t||!t.url)throw new Error(t&&t.error||"Could not resolve the PDF URL");return t.name&&(n.attachmentName=t.name,document.querySelector(".pdfa-name").textContent=t.name),fetch(t.url)}).then(function(t){if(!t.ok)throw new Error("Download failed (HTTP "+t.status+")");return t.arrayBuffer()}).then(function(t){return n.pdfBytes=t.slice(0),window.pdfjsLib.getDocument({data:t}).promise}).then(function(t){return n.doc=t,n.pageCount=t.numPages,be()}).then(function(){return g()}).then(function(){N();var t=e.highlightId?D(e.highlightId):null;t?At(t):e.page&&ut(e.page)}).catch(function(t){c(t.message||String(t),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ut(n.current-1)},document.getElementById("pdfa-next").onclick=function(){ut(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){It(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){It(n.scale-.25)},l.listToggle.onclick=function(){O()},l.more.onclick=function(t){me(t.clientX,t.clientY)},St().addEventListener("scroll",le),l.pages.addEventListener("mouseup",F),l.pages.addEventListener("click",ie),document.addEventListener("keydown",function(t){t.key==="Escape"&&!n.noteEditing&&L()}),document.addEventListener("mousedown",function(t){l.popover.classList.contains("pdfa-open")&&(l.popover.contains(t.target)||L())}),C(),I(),l.open.onclick=Ce,Ht()}catch(t){c("Viewer failed to start: "+(t&&t.message?t.message:t),!0)}}function te(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function je(e){return JSON.stringify(e).replace(/</g,"\\u003c")}var _e=`
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
`,ee={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function ne({attachmentUUID:e,attachmentName:i="",page:a=null,highlightId:d=null,lightDarkMode:l="light",pluginUUID:n=null,noteUUID:c=null}={}){let h=ee[l]||ee.light,b={attachmentUUID:e,page:a,highlightId:d,pluginUUID:n,noteUUID:c,pdfJsSrc:Z.pdfJs,workerSrc:Z.pdfJsWorker,pdfLibSrc:Z.pdfLib,colors:ot.map(v=>({id:v.id,label:v.label,hex:v.hex,rgb:v.rgb,cycleIndex:v.cycleIndex})),defaultColorId:rt};return`<link rel="stylesheet" href="${Z.pdfViewerCss}">
<style>:root{${h}}${_e}</style>
<div id="pdfa-root">
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${te(i)}</span>
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
    <span class="pdfa-name">${te(i)}</span>
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
<script>window.__PDFA_CONFIG = ${je(b)};
window.__PDFA_GEOM = (${bt.toString()})();
window.__PDFA_ANNOTATIONS = (${yt.toString()})();
window.__PDFA_EXPORT = (${Et.toString()})();<\/script>
<script>(${Zt.toString()})();<\/script>`}var Be={noteOption:{"Annotate PDF":async function(e,i){return jt(e,i,e.context.pluginUUID)},"Debug: dump note markdown":async function(e,i){return _t(e,i)}},insertText:async function(e){return Bt(e,e.context.noteUUID,e.context.pluginUUID)},linkTarget:async function(e,...i){return zt(e,i[0])},renderEmbed:function(e,...i){let{attachmentUUID:a,page:d,highlightId:l}=tt(i[0]);return a?ne({attachmentUUID:a,page:d,highlightId:l,lightDarkMode:e.context.lightDarkMode,pluginUUID:e.context.pluginUUID,noteUUID:e.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(e,...i){return Kt(e,i[0])}},ze=Be;return Ie(qe);})();

  var plugin = __pluginModule.default;
})();
