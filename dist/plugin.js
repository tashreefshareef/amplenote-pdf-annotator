(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var be=Object.defineProperty;var $t=Object.getOwnPropertyDescriptor;var _t=Object.getOwnPropertyNames;var jt=Object.prototype.hasOwnProperty;var Bt=(t,l)=>{for(var a in l)be(t,a,{get:l[a],enumerable:!0})},zt=(t,l,a,s)=>{if(l&&typeof l=="object"||typeof l=="function")for(let i of _t(l))!jt.call(t,i)&&i!==a&&be(t,i,{get:()=>l[i],enumerable:!(s=$t(l,i))||s.enumerable});return t};var qt=t=>zt(be({},"__esModule",{value:!0}),t);var rn={};Bt(rn,{default:()=>an});var re=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ie="yellow",J="PDF Annotator data",Be="attachment://",ze=1.2,qe=16,te={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},Gt="https://plugins.amplenote.com/cors-proxy";function Ge(t){let l=new URL(Gt);return l.searchParams.set("apiurl",t),l.toString()}var Vt="application/pdf";function Wt(t){return Array.isArray(t)?t.filter(l=>l&&l.type===Vt&&l.uuid):[]}async function le(t,l){let a=await t.getNoteAttachments({uuid:l}),s=Wt(a);if(s.length===0)return null;if(s.length===1)return s[0];let i=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:s.map(n=>({label:n.name,value:n.uuid})),value:s[0].uuid}]});if(i==null)return null;let c=Array.isArray(i)?i[0]:i;return s.find(n=>n.uuid===c)||null}async function Ve(t,l){if(!l)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(l);if(!a)throw new Error(`No URL returned for attachment ${l}`);return Ge(a)}function We(t){return t?qe:ze}function ne(t){let l={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return l;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return l}let s=c=>{let n=a.get(c);if(n===null||n.trim()==="")return null;let h=Number(n);return Number.isFinite(h)?h:null},i=s("page");return{attachmentUUID:a.get("att")||null,page:i!==null&&i>=1?Math.floor(i):null,x:s("x"),y:s("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function Je({attachmentUUID:t,page:l,x:a,y:s,highlightId:i,collapsed:c,attachmentName:n}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),n&&h.set("n",n),Number.isFinite(l)&&l>=1&&h.set("page",String(Math.floor(l))),Number.isFinite(a)&&h.set("x",String(a)),Number.isFinite(s)&&h.set("y",String(s)),i&&h.set("hl",i),h.toString()}function se(t,l={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=We(l.collapsed));let s=Je(l);return`<object data="${s?`plugin://${t}?${s}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function Xe(t,l,a){if(!t||!l||!a)return null;let s=t.split(`
`),i=s.findIndex(n=>n.includes(`${Be}${l}`));if(i===-1)return null;let c=s.slice();return s[i+1]===""?c.splice(i+2,0,a.trim(),""):c.splice(i+1,0,"",a.trim(),""),c.join(`
`)}function de(t,l,a=null){return!t||!l||!t.includes(`plugin://${l}`)?!1:a?t.includes(`att=${a}`):!0}function Ye(t,l,a){if(!t||!l||!a)return null;let s=t.split(`
`),i=`plugin://${l}`,c=s.findIndex(h=>h.includes(i)&&h.includes(`att=${a}`));if(c===-1)return null;let n=s.slice();return n.splice(c,1),n[c]===""&&n[c-1]===""&&n.splice(c,1),n.join(`
`)}function ye(t,l,a,s={}){if(!t||!l||!a)return null;let i=t.split(`
`),c=`plugin://${l}`,n=i.findIndex(T=>T.includes(c)&&T.includes(`att=${a}`));if(n===-1)return null;let h=i[n],w=h.match(/data="(plugin:\/\/[^"]*)"/);if(!w)return null;let g=w[1],k=g.indexOf("?"),S=k===-1?"":g.slice(k+1),C={...ne(S),attachmentUUID:a,...s},p=Je(C),f=p?`plugin://${l}?${p}`:`plugin://${l}`,v=i.slice(),m=h.replace(w[0],`data="${f}"`),y=We(C.collapsed),N=m.match(/data-aspect-ratio="[^"]*"/);return m=N?m.replace(N[0],`data-aspect-ratio="${y}"`):m.replace(/\s*\/>\s*$/,` data-aspect-ratio="${y}" />`),v[n]=m,v.join(`
`)}function Qe(t,l,a,s){return ye(t,l,a,{collapsed:!!s})}async function Ze(t,l,a){let s=await le(t,l);if(!s){let h=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(h)&&h.length>0)||!h.some(g=>g&&g.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let i=await t.getNoteContent({uuid:l});if(de(i,a,s.uuid))return await t.alert(`"${s.name}" is already open in this note - scroll to the viewer.`),s.uuid;let c=se(a,{attachmentUUID:s.uuid,attachmentName:s.name}),n=Xe(i,s.uuid,c);return n!==null?(await t.replaceNoteContent({uuid:l},n),s.uuid):(await t.insertNoteContent({uuid:l},`
${c}
`,{atEnd:!0}),s.uuid)}var Jt="Raw markdown";function Xt(t){let l=(String(t||"").match(/`+/g)||[]).reduce((a,s)=>Math.max(a,s.length),0);return"`".repeat(Math.max(3,l+1))}async function Ke(t,l){let a=await t.getNoteContent({uuid:l});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let s=await t.getNoteAttachments({uuid:l}),i=(Array.isArray(s)?s:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=Xt(a),n=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:n},`# Attachments

${i||"- (none)"}

# ${Jt}

${c}
${a}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),n}async function et(t,l,a){if(!l)return"";let s=await le(t,l);if(!s){let c=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let i=await t.getNoteContent({uuid:l});return de(i,a,s.uuid)?(await t.alert(`"${s.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${se(a,{attachmentUUID:s.uuid,attachmentName:s.name})}
`}async function tt(t,l){let{noteUUID:a,attachmentUUID:s,page:i,highlightId:c}=ne(l);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let n=await t.getNoteContent({uuid:a}),h=ye(n,t.context.pluginUUID,s,{page:i,highlightId:c,collapsed:!1});h!==null&&await t.replaceNoteContent({uuid:a},h)}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function ce(t){if(!t)return null;let l=String(t).trim().toLowerCase();return re.find(a=>a.id===l||a.hex.toLowerCase()===l)||null}function nt(){return ce(ie)}function Yt(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function he({page:t,color:l,rects:a,quoteText:s,note:i=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of a)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let n=ce(l)||nt();return{id:c||Yt(),page:t,color:n.id,rects:a.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(s||""),note:i?String(i):null}}function ot(t,l){let a=l==null?null:String(l).trim();return{...t,note:a||null}}function at(t,l){let a=ce(l);if(!a)throw new Error(`withColor: unknown color "${l}"`);return{...t,color:a.id}}function rt(t,l){return(t||[]).filter(a=>a.id!==l)}function Ce(t,l,a){let s=!1,i=(t||[]).map(c=>c.id!==l?c:(s=!0,a(c)));return s?i:t}var Qt="json",Zt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function it(t){let l=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${Zt}
\`\`\`${Qt}
${l}
\`\`\``}function Ee(t){if(!t)return null;let l=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!l&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),s=(l?l[1]:a?a[1]:t).trim();if(!s)return null;try{return JSON.parse(s)}catch{return null}}function Kt(t){if(!Array.isArray(t))return[];let l=[];for(let a of t)try{l.push(he(a))}catch{}return l}async function pe(t,l,a){let s=await t.getNoteContent({uuid:l}),i=Ne(s,J),c=Ee(i);return!c||typeof c!="object"?[]:Kt(c[a])}async function lt(t,l,a,s){let i={uuid:l},c=await t.getNoteContent(i),n=Ne(c,J),w={...Ee(n)||{},[a]:s},g=it(w);n===null&&await t.insertNoteContent(i,`

# ${J}

`,{atEnd:!0}),await t.replaceNoteContent(i,g,{section:{heading:{text:J,level:1}}})}async function st(t,l,a){let s={uuid:l},i=await t.getNoteContent(s),c=Ne(i,J);if(c===null)return;let n=Ee(c)||{};if(!(a in n))return;let h={...n};delete h[a],await t.replaceNoteContent(s,it(h),{section:{heading:{text:J,level:1}}})}function Ne(t,l){if(!t)return null;let a=t.split(`
`),s=/^#\s+(.*)$/,i=a.findIndex(n=>{let h=n.match(s);return h&&h[1].trim()===l});if(i===-1)return null;let c=a.length;for(let n=i+1;n<a.length;n++)if(/^#\s+/.test(a[n])){c=n;break}return a.slice(i+1,c).join(`
`).trim()}function B(t,l){return l.noteUUID||t.context.noteUUID}async function dt(t,l,a){try{let s=await t.getNoteAttachments({uuid:l}),i=Array.isArray(s)&&s.find(c=>c&&c.uuid===a);return i?i.name:""}catch{return""}}async function ue(t,l,a,s){let i=await pe(t,l,a),c=s(i);return c!==i&&await lt(t,l,a,c),{highlights:c}}function ct(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let l=t.trim();if(!l.startsWith("{"))return{action:l};try{return JSON.parse(l)}catch{return{action:l}}}async function ht(t,l){return JSON.stringify(await en(t,ct(l)))}async function en(t,l){let a=ct(l);switch(a.action){case"getPdfUrl":{let s=a.attachmentUUID;if(!s)return{error:"No attachment specified for this viewer."};try{return{url:await Ve(t,s),name:await dt(t,B(t,a),s)}}catch(i){return{error:`Could not load the PDF: ${i.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await pe(t,B(t,a),a.attachmentUUID)}}catch(s){return{error:`Could not load highlights: ${s.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=he(a.highlight||{});return await ue(t,B(t,a),a.attachmentUUID,i=>i.concat([s]))}catch(s){return{error:`Could not save the highlight: ${s.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,B(t,a),a.attachmentUUID,s=>Ce(s,a.id,i=>at(i,a.color)))}catch(s){return{error:`Could not change the highlight color: ${s.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,B(t,a),a.attachmentUUID,s=>Ce(s,a.id,i=>ot(i,a.note)))}catch(s){return{error:`Could not save the note: ${s.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ue(t,B(t,a),a.attachmentUUID,s=>rt(s,a.id))}catch(s){return{error:`Could not remove the highlight: ${s.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{return await t.insertNoteContent({uuid:B(t,a)},`
`+a.content+`
`,{atEnd:!0}),{ok:!0}}catch(s){return{error:`Could not add this to the note: ${s.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=B(t,a),i=await t.getNoteContent({uuid:s}),c=Ye(i,a.pluginUUID,a.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:s},c),await st(t,s,a.attachmentUUID),{ok:!0})}catch(s){return{error:`Could not remove this viewer: ${s.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let s=B(t,a),i=await dt(t,s,a.attachmentUUID);try{let c=await pe(t,s,a.attachmentUUID);return{name:i,count:c.length}}catch{return{name:i,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=B(t,a),i=await t.getNoteContent({uuid:s}),c=Qe(i,a.pluginUUID,a.attachmentUUID,a.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:s},c),{ok:!0})}catch(s){return{error:`Could not resize this viewer: ${s.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let s=await t.findNote({name:a.noteName}),i=s?s.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:i},a.content||""),{ok:!0,noteUUID:i}}catch(s){return{error:`Could not export highlights: ${s.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function Se(){function t(p,f){return{x:p.left-f.left,y:p.top-f.top,width:p.width,height:p.height}}function l(p,f){return{x:Math.min(p[0],f[0]),y:Math.min(p[1],f[1]),width:Math.abs(f[0]-p[0]),height:Math.abs(f[1]-p[1])}}function a(p,f){var v=Math.pow(10,f===void 0?2:f),m=function(y){return Math.round(y*v)/v};return{x:m(p.x),y:m(p.y),width:m(p.width),height:m(p.height)}}function s(p){return p.width>.01&&p.height>.01}function i(p,f,v){for(var m=String(p??""),y=Math.max(0,f===void 0?0:f),N=Math.min(m.length,v===void 0?m.length:v),T=function($){return $===""||/\s/.test($)},U=[],I=y;I<N;){for(;I<N&&T(m.charAt(I));)I++;if(I>=N)break;for(var O=I;I<N&&!T(m.charAt(I));)I++;U.push({start:O,end:I})}return U}function c(p){for(var f=1/0,v=1/0,m=-1/0,y=-1/0,N=0;N<(p?p.length:0);N++){var T=p[N];s(T)&&(f=Math.min(f,T.left),v=Math.min(v,T.top),m=Math.max(m,T.left+T.width),y=Math.max(y,T.top+T.height))}return isFinite(f)?{left:f,top:v,width:m-f,height:y-v}:null}function n(p,f,v){for(var m=[],y=0;y<p.length;y++){var N=t(p[y],f);if(s(N)){var T=v(N.x,N.y),U=v(N.x+N.width,N.y+N.height),I=a(l(T,U));s(I)&&m.push(I)}}return m}function h(p,f){var v=f(p.x,p.y),m=f(p.x+p.width,p.y+p.height);return l(v,m)}function w(p,f,v){var m=f.right-f.left,y=f.bottom-f.top;if(m<=0||y<=0)return null;var N=p.x2-p.x1,T=p.y2-p.y1,U=p.x1+(v.left-f.left)/m*N,I=p.x2-(f.right-v.right)/m*N,O=p.y1+(v.bottom-f.bottom)/y*T,$=p.y2-(f.top-v.top)/y*T;return{x:U,y:O,width:I-U,height:$-O}}function g(p,f){var v=Math.min(p.y+p.height,f.y+f.height)-Math.max(p.y,f.y);return v>.5*Math.min(p.height,f.height)}function k(p,f){var v=f===void 0?.6:f;if(!p||p.length<2)return(p||[]).slice();for(var m=p.slice().sort(function(G,W){return W.y-G.y||G.x-W.x}),y=[],N=0;N<m.length;N++){for(var T=!1,U=0;U<y.length;U++)if(g(y[U][0],m[N])){y[U].push(m[N]),T=!0;break}T||y.push([m[N]])}for(var I=[],O=0;O<y.length;O++){for(var $=y[O].slice().sort(function(G,W){return G.x-W.x}),D=null,Z=0;Z<$.length;Z++){var H=$[Z];if(D===null){D={x:H.x,y:H.y,width:H.width,height:H.height};continue}var oe=H.x-(D.x+D.width);if(oe<=v*Math.max(D.height,H.height)){var fe=Math.max(D.x+D.width,H.x+H.width),z=Math.max(D.y+D.height,H.y+H.height);D.x=Math.min(D.x,H.x),D.y=Math.min(D.y,H.y),D.width=fe-D.x,D.height=z-D.y}else I.push(D),D={x:H.x,y:H.y,width:H.width,height:H.height}}D!==null&&I.push(D)}return I.map(function(G){return a(G)})}function S(p,f,v,m){var y=m===void 0?0:m;return f>=p.x-y&&f<=p.x+p.width+y&&v>=p.y-y&&v<=p.y+p.height+y}function E(p,f,v,m,y){for(var N=p||[],T=N.length-1;T>=0;T--){var U=N[T];if(!(!U||U.page!==f||!U.rects)){for(var I=0;I<U.rects.length;I++)if(S(U.rects[I],v,m,y===void 0?1:y))return U}}return null}function C(p){return String(p??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:l,roundRect:a,isVisibleRect:s,textTokenRanges:i,unionClientRects:c,clientRectsToPdfRects:n,pdfRectToViewportRect:h,itemRelativeRect:w,mergeLineRects:k,rectContainsPoint:S,hitTestHighlights:E,normalizeQuoteText:C}}var j=Se(),Rn=j.clientRectToLocal,Ln=j.rectFromCorners,Mn=j.roundRect,Fn=j.isVisibleRect,On=j.textTokenRanges,$n=j.unionClientRects,_n=j.clientRectsToPdfRects,jn=j.pdfRectToViewportRect,Bn=j.itemRelativeRect,zn=j.mergeLineRects,qn=j.rectContainsPoint,Gn=j.hitTestHighlights,Vn=j.normalizeQuoteText;function Te(){var t=[.957,.871,.424];function l(c,n,h,w,g){var k=n.context.register(n.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),S=[c.pushGraphicsState(),c.setGraphicsState("GS0")];S.push(c.setFillingColor(c.rgb(w[0],w[1],w[2])));for(var E=0;E<h.length;E++){var C=h[E];S.push(c.moveTo(C.x,C.y)),S.push(c.lineTo(C.x,C.y+C.height)),S.push(c.lineTo(C.x+C.width,C.y+C.height)),S.push(c.lineTo(C.x+C.width,C.y)),S.push(c.closePath())}S.push(c.fill()),S.push(c.popGraphicsState());var p=n.context.formXObject(S,{BBox:g,Resources:{ExtGState:{GS0:k}}});return n.context.register(p)}function a(c,n,h,w){for(var g=h.rects,k=[],S=g[0].x,E=g[0].y,C=g[0].x+g[0].width,p=g[0].y+g[0].height,f=0;f<g.length;f++){var v=g[f],m=v.x,y=v.x+v.width,N=v.y,T=v.y+v.height;k.push(m,T,y,T,m,N,y,N),S=Math.min(S,m),E=Math.min(E,N),C=Math.max(C,y),p=Math.max(p,T)}var U=n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:n.context.obj([S,E,C,p]),QuadPoints:n.context.obj(k),C:n.context.obj(w),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&U.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var I=l(c,n,g,w,[S,E,C,p]);U.set(c.PDFName.of("AP"),n.context.obj({N:I}));var O=n.context.register(U),$=[O];if(h.note){var D=n.context.register(n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:n.context.obj([C+8,E-60,C+208,E+12]),Parent:O,Open:!1}));U.set(c.PDFName.of("Popup"),D),$.push(D)}return $}function s(c,n,h){var w=n.node.get(c.PDFName.of("Annots"));if(w instanceof c.PDFArray)for(var g=0;g<h.length;g++)w.push(h[g]);else n.node.set(c.PDFName.of("Annots"),n.doc.context.obj(h))}async function i(c,n,h,w){for(var g=await c.PDFDocument.load(n),k=g.getPages(),S=h||[],E=0;E<S.length;E++){var C=S[E];if(!(!C||!C.rects||!C.rects.length)){var p=k[C.page-1];if(p){var f=w&&w[C.color]||t,v=a(c,g,C,f);s(c,p,v)}}}return g.save()}return{writeHighlightsIntoPdf:i,buildHighlightAnnotation:a,appendAnnotationRefs:s}}var Ae=Te(),Jn=Ae.writeHighlightsIntoPdf,Xn=Ae.buildHighlightAnnotation,Yn=Ae.appendAnnotationRefs;function ke(){function t(n){return String(n??"").replace(/\]/g,"\\]")}function l(n,h,w,g,k){var S=new URLSearchParams;h&&S.set("att",h),Number.isFinite(w)&&w>=1&&S.set("page",String(Math.floor(w))),g&&S.set("hl",g),k&&S.set("note",k);var E=S.toString();return"plugin://"+n+(E?"?"+E:"")}function a(n,h){return String(n??"").split(/\r?\n/).map(function(w){return(h+" "+w).replace(/[ \t]+$/,"")})}function s(n,h,w,g,k,S){var E=l(h,w,g.page,g.id,S),C=t(n||"PDF"),p='==\u25CF<!-- {"cycleColor":"'+k+'"} -->==',f=p+" ["+C+"]("+E+")",v=[f].concat(a(g.quoteText,"> >"));return g.note&&(v.push(">"),v=v.concat(a(g.note,">"))),v.join(`
`)}function i(n){return n.slice().sort(function(h,w){if(h.page!==w.page)return h.page-w.page;var g=h.rects&&h.rects[0]?h.rects[0].y:0,k=w.rects&&w.rects[0]?w.rects[0].y:0;return k-g})}function c(n,h,w,g,k,S,E){var C=S&&S.length?S:null,p=(g||[]).filter(function(m){return m&&(!C||C.indexOf(m.color)!==-1)}),f=i(p),v=f.map(function(m){var y=k?k[m.color]:void 0;return s(n,h,w,m,y,E)});return v.join(`

`)}return{buildDeepLink:l,buildHighlightBlock:s,buildExportAllContent:c}}var Ie=ke(),Zn=Ie.buildDeepLink,Kn=Ie.buildHighlightBlock,eo=Ie.buildExportAllContent;function pt(){var t=window.__PDFA_CONFIG||{},l=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},s=window.__PDFA_EXPORT||{},i={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(n.attachmentName=e,i.name&&(i.name.textContent=e),i.collapsedName&&(i.collapsedName.textContent=e))}var n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,o){i.status.textContent=e||"",i.status.style.display=e?"block":"none",i.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function w(e){var o=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(r,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(o)))}catch(u){d(u)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function g(){return t.colors||[]}function k(e){for(var o=g(),r=0;r<o.length;r++)if(o[r].id===e)return o[r].hex;return o.length?o[0].hex:"#F4DE6C"}function S(e){for(var o=0;o<n.highlights.length;o++)if(n.highlights[o].id===e)return n.highlights[o];return null}function E(e,o,r){var d=document.createElement("button");return d.className="pdfa-btn"+(o?" "+o:""),d.textContent=e,d.onclick=function(u){u.stopPropagation(),r()},d}function C(e,o,r,d){var u=document.createElement("button");return u.className="pdfa-color",u.dataset.color=e.id,u.style.background=e.hex,u.title=d+" "+e.label,u.setAttribute("aria-label",d+" "+e.label),u.setAttribute("aria-pressed",String(!!o)),u.onclick=function(x){x.stopPropagation(),r(e.id)},u}function p(){for(var e=g(),o=0;o<e.length;o++)i.colors.appendChild(C(e[o],e[o].id===n.activeColorId,function(r){n.activeColorId=r,f(),n.pendingSelection&&De(n.pendingSelection,r)},"Highlight"))}function f(){for(var e=i.colors.querySelectorAll(".pdfa-color"),o=0;o<e.length;o++)e[o].setAttribute("aria-pressed",String(e[o].dataset.color===n.activeColorId))}function v(e,o){var r=e.getViewport({scale:n.scale});n.viewports[o]=r;var d=document.createElement("div");d.className="pdfa-page",d.dataset.page=String(o),d.style.width=r.width+"px",d.style.height=r.height+"px";var u=document.createElement("canvas"),x=window.devicePixelRatio||1;u.width=Math.floor(r.width*x),u.height=Math.floor(r.height*x),u.style.width=r.width+"px",u.style.height=r.height+"px",d.appendChild(u);var b=document.createElement("div");b.className="pdfa-highlights",d.appendChild(b);var A=document.createElement("div");A.className="textLayer",A.style.width=r.width+"px",A.style.height=r.height+"px",A.style.setProperty("--scale-factor",String(n.scale)),d.appendChild(A),i.pages.appendChild(d);var R=u.getContext("2d");return R.scale(x,x),e.render({canvasContext:R,viewport:r}).promise.then(function(){return e.getTextContent()}).then(function(F){var P=[];return window.pdfjsLib.renderTextLayer({textContent:F,container:A,viewport:r,textDivs:P}).promise.then(function(){n.textSpans+=P.length;for(var L=0;L<P.length;L++)P[L].__pdfaItem=F.items[L];N(o)})})}function m(){if(n.rendering)return Promise.resolve();n.rendering=!0,M(!0),i.pages.innerHTML="",n.viewports={},n.textSpans=0,h("Rendering...");for(var e=Promise.resolve(),o=1;o<=n.pageCount;o++)(function(r){e=e.then(function(){return n.doc.getPage(r).then(function(d){return v(d,r)})})})(o);return e.then(function(){n.textSpans===0?h("No selectable text found - this PDF may be a scan.",!0):h(""),n.rendering=!1,K(),we()}).catch(function(r){n.rendering=!1,h("Failed to render: "+r.message,!0)})}function y(e){return function(o,r){return e.convertToViewportPoint(o,r)}}function N(e){for(var o=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",r=i.pages.querySelectorAll(o),d=0;d<r.length;d++){var u=r[d],x=Number(u.dataset.page),b=u.querySelector(".pdfa-highlights"),A=n.viewports[x];if(!(!b||!A)){b.innerHTML="";for(var R=y(A),F=0;F<n.highlights.length;F++){var P=n.highlights[F];if(!(!P||P.page!==x||!P.rects||!P.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=P.id||"";for(var V=0;V<P.rects.length;V++){var Y=l.pdfRectToViewportRect(P.rects[V],R),_=document.createElement("div");_.className="pdfa-hl",_.style.left=Y.x+"px",_.style.top=Y.y+"px",_.style.width=Y.width+"px",_.style.height=Y.height+"px",_.style.background=k(P.color),L.appendChild(_)}b.appendChild(L)}}}}}function T(){N(),I(),i.count.textContent=String(n.highlights.length)}function U(){return n.highlights.slice().sort(function(e,o){return e.page!==o.page?e.page-o.page:(o.rects[0]?o.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function I(){i.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",e.appendChild(o),e.appendChild(E("Close","",function(){$(!1)})),i.panel.appendChild(e);var r=U();if(!r.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",i.panel.appendChild(d);return}for(var u=0;u<r.length;u++)i.panel.appendChild(O(r[u]))}function O(e){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=e.id||"",o.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=k(e.color),o.appendChild(r);var d=document.createElement("div"),u=document.createElement("div");u.className="pdfa-hl-page",u.textContent="Page "+e.page,d.appendChild(u);var x=document.createElement("div");if(x.className="pdfa-hl-quote",x.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(x),e.note){var b=document.createElement("div");b.className="pdfa-hl-note",b.textContent=e.note,d.appendChild(b)}return o.appendChild(d),o.onclick=function(){Ue(e)},o}function $(e){var o=e===void 0?!i.panel.classList.contains("pdfa-open"):e;i.panel.classList.toggle("pdfa-open",o),i.listToggle.setAttribute("aria-pressed",String(o)),o&&I()}function D(e){for(var o=e&&e.nodeType===1?e:e&&e.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function Z(e,o){for(var r=[],d=[],u=null,x=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),b;b=x.nextNode();)if(e.intersectsNode(b)){var A=b.nodeValue||"",R=b===e.startContainer?e.startOffset:0,F=b===e.endContainer?e.endOffset:A.length,P=b.parentElement,L=P&&P.__pdfaItem;if(L)for(var V={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},Y=P.getBoundingClientRect(),_=l.textTokenRanges(A,R,F),Q=0;Q<_.length;Q++){var xe=document.createRange();xe.setStart(b,_[Q].start),xe.setEnd(b,_[Q].end);var q=l.unionClientRects(xe.getClientRects());if(q){var _e={left:q.left,top:q.top,width:q.width,height:q.height,right:q.left+q.width,bottom:q.top+q.height},je=l.itemRelativeRect(V,Y,_e);je&&(r.push(je),d.push(A.slice(_[Q].start,_[Q].end)),u=_e)}}}return{rects:r,text:d.join(" "),lastCssRect:u}}function H(e){if(n.pendingSelection=e,n.lastCapturedText=e&&e.rawText||"",!e){i.hint.textContent="",i.hint.style.display="none";return}i.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",i.hint.style.display="inline"}function oe(e){if(!n.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){H(null),M();return}var r=o.getRangeAt(0),d=D(r.startContainer);if(!d)return H(null);var u=d.parentElement;if(!u||!u.dataset||!u.dataset.page)return H(null);var x=Number(u.dataset.page);if(!n.viewports[x])return H(null);var b=D(r.endContainer)!==d,A=Z(r,d),R=l.mergeLineRects(A.rects);if(!R.length)return H(null);var F=A.lastCssRect||u.getBoundingClientRect(),P=e&&e.clientX?e.clientX:F.left+F.width/2,L=e&&e.clientY?e.clientY:F.top+F.height,V={page:x,rects:R,quoteText:l.normalizeQuoteText(A.text),spilled:b,anchorX:P,anchorY:L,rawText:String(o)};H(V),wt(V)}}var fe=300,z=null;function G(){n.noteEditing||(z&&clearTimeout(z),z=setTimeout(W,fe))}function W(){if(z=null,!n.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||D(e.getRangeAt(0).startContainer)&&String(e)!==n.lastCapturedText&&oe(null)}}function ae(e,o){var r=n.highlights;return n.highlights=e,T(),w(o).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return n.highlights=d.highlights||e,T(),h(""),!0}).catch(function(d){return n.highlights=r,T(),h(d.message||String(d),!0),!1})}function De(e,o){var r={id:null,page:e.page,color:o,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,u=e.anchorY;H(null),M(!0);var x=window.getSelection();x&&x.removeAllRanges&&x.removeAllRanges(),ae(n.highlights.concat([r]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:r}).then(function(b){if(b){var A=n.highlights[n.highlights.length-1];A&&A.id&&me(A,d,u,!0)}})}function mt(e,o){M(!0),ae(n.highlights.map(function(r){return r.id===e?Object.assign({},r,{color:o}):r}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:o})}function vt(e){M(!0),ae(n.highlights.filter(function(o){return o.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function ge(e,o){var r=String(o??"").trim();n.noteEditing=null,M(!0),ae(n.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:r||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:r})}function X(e,o,r,d){i.popover.innerHTML="",i.popover.classList.toggle("pdfa-editing",d==="editing"),i.popover.classList.toggle("pdfa-exporting",d==="exporting"),i.popover.classList.toggle("pdfa-menu",d==="menu");for(var u=0;u<e.length;u++)i.popover.appendChild(e[u]);i.popover.classList.add("pdfa-open");var x=i.popover.offsetWidth,b=i.popover.offsetHeight,A=Math.max(4,Math.min(o-x/2,window.innerWidth-x-4)),R=r+12;R+b>window.innerHeight-4&&(R=Math.max(4,r-b-12)),i.popover.style.left=A+"px",i.popover.style.top=R+"px"}function M(e){n.noteEditing&&!e||(n.noteEditing=null,i.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),i.popover.innerHTML="")}function wt(e){for(var o=g(),r=[],d=0;d<o.length;d++)r.push(C(o[d],o[d].id===n.activeColorId,function(u){n.activeColorId=u,f(),De(e,u)},"Highlight"));X(r,e.anchorX,e.anchorY)}function me(e,o,r,d){for(var u=g(),x=[],b=0;b<u.length;b++)x.push(C(u[b],u[b].id===e.color,function(R){mt(e.id,R)},"Change to"));var A=!!e.note;x.push(E(A?"Edit note":"Add note",d&&!A?"pdfa-btn-primary":"",function(){bt(e,o,r)})),x.push(E("Copy","",function(){It(e)})),x.push(E("Send to note","",function(){Dt(e)})),x.push(E("Remove","pdfa-remove",function(){vt(e.id)})),X(x,o,r)}function xt(e,o){for(var r=g(),d={},u=0;u<r.length;u++)d[r[u].id]=!0;var x=document.createElement("div");x.className="pdfa-export-hint",x.textContent="Export highlights to a note";var b=document.createElement("div");b.className="pdfa-export-colors";for(var A=0;A<r.length;A++)(function(F){var P=C(F,!0,function(L){d[L]=!d[L],P.setAttribute("aria-pressed",String(d[L]))},"Toggle");b.appendChild(P)})(r[A]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(E("Create / update note","pdfa-btn-primary",function(){for(var F=[],P=0;P<r.length;P++)d[r[P].id]&&F.push(r[P].id);Pt(F.length===r.length?null:F)})),X([x,b,R],e,o,"exporting")}function bt(e,o,r){n.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var u=document.createElement("div");u.className="pdfa-note-actions",e.note&&u.appendChild(E("Delete note","",function(){ge(e.id,"")}));var x=document.createElement("span");x.className="pdfa-spacer",u.appendChild(x),u.appendChild(E("Cancel","",function(){Pe(e,o,r)})),u.appendChild(E("Save","pdfa-btn-primary",function(){ge(e.id,d.value)})),d.onkeydown=function(b){b.key==="Enter"&&(b.ctrlKey||b.metaKey)?(b.preventDefault(),b.stopPropagation(),ge(e.id,d.value)):b.key==="Escape"&&(b.preventDefault(),b.stopPropagation(),Pe(e,o,r))},X([d,u],o,r,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function Pe(e,o,r){n.noteEditing=null;var d=S(e.id)||e;me(d,o,r)}function yt(e){if(!n.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var r=e.target,d=null;r&&r!==i.pages;){if(r.classList&&r.classList.contains("pdfa-page")){d=r;break}r=r.parentElement}if(!d)return M();var u=Number(d.dataset.page),x=n.viewports[u];if(!x)return M();var b=d.getBoundingClientRect(),A=x.convertToPdfPoint(e.clientX-b.left,e.clientY-b.top),R=l.hitTestHighlights(n.highlights,u,A[0],A[1],1);R&&R.id?me(R,e.clientX,e.clientY):M()}}}function K(){i.pageLabel.textContent=n.current+" / "+n.pageCount,i.zoomLabel.textContent=Math.round(n.scale*100)+"%"}function ee(){return i.root.querySelector(".pdfa-scroll")}function ve(e){var o=Math.min(Math.max(1,e),n.pageCount),r=i.pages.querySelector('[data-page="'+o+'"]');r&&r.scrollIntoView({behavior:"smooth",block:"start"}),n.current=o,K()}function Ue(e){var o=i.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),r=n.viewports[e.page];if(!(!o||!r||!e.rects||!e.rects.length)){var d=l.pdfRectToViewportRect(e.rects[0],y(r)),u=ee(),x=o.getBoundingClientRect().top+d.y;u.scrollTop+=x-u.getBoundingClientRect().top-u.clientHeight/3,n.current=e.page,K()}}function He(e){n.scale=Math.min(Math.max(.4,e),4),m()}function Ct(){return n.doc?n.doc.getPage(1).then(function(e){var o=ee();if(o){var r=window.getComputedStyle(o),d=o.clientWidth-(parseFloat(r.paddingLeft)||0)-(parseFloat(r.paddingRight)||0),u=e.getViewport({scale:1}).width;if(!(!(d>0)||!(u>0))){var x=Math.max(.4,d/u);x<n.scale&&(n.scale=x,K())}}}).catch(function(){}):Promise.resolve()}function Re(e){var o=ee();o&&(o.scrollTop+=e*Math.max(80,o.clientHeight*.85),we())}function we(){var e=ee();if(!(!e||!i.scrollUp)){var o=e.scrollHeight-e.clientHeight;i.scrollUp.disabled=e.scrollTop<=1,i.scrollDown.disabled=e.scrollTop>=o-1}}function Et(){we(),M();for(var e=i.pages.querySelectorAll(".pdfa-page"),o=n.current,r=1/0,d=0;d<e.length;d++){var u=Math.abs(e[d].getBoundingClientRect().top-60);u<r&&(r=u,o=Number(e[d].dataset.page))}o!==n.current&&(n.current=o,K())}function Nt(){return new Promise(function(e,o){if(window.pdfjsLib)return e(window.pdfjsLib);var r=document.createElement("script");r.src=t.pdfJsSrc,r.onload=function(){window.pdfjsLib?e(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function St(){return new Promise(function(e,o){if(window.PDFLib)return e(window.PDFLib);var r=document.createElement("script");r.src=t.pdfLibSrc,r.onload=function(){window.PDFLib?e(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function Tt(){for(var e={},o=g(),r=0;r<o.length;r++)o[r].rgb&&(e[o[r].id]=o[r].rgb);return e}function At(){var e=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Le(){for(var e={},o=g(),r=0;r<o.length;r++)o[r].cycleIndex!==void 0&&(e[o[r].id]=o[r].cycleIndex);return e}function Me(){var e=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Fe(e){return s.buildHighlightBlock(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,Le()[e.color],t.noteUUID)}function kt(e){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(e):new Promise(function(o,r){var d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select();var u=!1;try{u=document.execCommand("copy")}catch{u=!1}document.body.removeChild(d),u?o():r(new Error("Clipboard access is unavailable here."))})}function It(e){M(!0),kt(Fe(e)).then(function(){h("Highlight copied - paste it into any note.")}).catch(function(o){h("Could not copy: "+(o.message||o),!0)})}function Dt(e){M(!0),w({action:"sendToNote",content:Fe(e)}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");h("Sent to the bottom of this note.")}).catch(function(o){h(o.message||String(o),!0)})}function Pt(e){M(!0);var o=s.buildExportAllContent(n.attachmentName,t.pluginUUID,t.attachmentUUID,n.highlights,Le(),e,t.noteUUID);if(!o){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}w({action:"exportAll",noteName:Me(),content:o}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");h('Exported to "'+Me()+'".')}).catch(function(r){h(r.message||String(r),!0)})}function Ut(e,o){var r=[E("Collapse","",function(){M(!0),Ft()}),E("Download","",function(){M(!0),Lt()}),E("Export...","",function(){xt(e,o)}),E("Remove viewer...","pdfa-remove",function(){Ht(e,o)})];X(r,e,o,"menu")}function Ht(e,o){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(E("Cancel","",function(){M(!0)}));var u=document.createElement("span");u.className="pdfa-spacer",d.appendChild(u),d.appendChild(E("Remove","pdfa-remove",Rt)),X([r,d],e,o,"exporting")}function Rt(){M(!0),h("Removing this viewer..."),w({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function Lt(){n.pdfBytes&&(h("Preparing the download..."),St().then(function(e){return a.writeHighlightsIntoPdf(e,n.pdfBytes,n.highlights,Tt())}).then(function(e){var o=new Blob([e],{type:"application/pdf"}),r=URL.createObjectURL(o),d=document.createElement("a");d.href=r,d.download=At(),document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3),h("")}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function Mt(){return w({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");n.highlights=e.highlights||[]}).catch(function(e){n.highlights=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function Ft(){var e=n.highlights.length;i.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",i.root.classList.add("pdfa-collapsed-mode"),Oe(!0)}function Oe(e){w({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Ot(){i.root.classList.remove("pdfa-collapsed-mode"),n.doc||$e(),Oe(!1)}function $e(){h("Loading PDF..."),Nt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,w({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return n.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return n.doc=e,n.pageCount=e.numPages,Mt()}).then(function(){return Ct()}).then(function(){return m()}).then(function(){T();var e=t.highlightId?S(t.highlightId):null;e?Ue(e):t.page&&ve(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){ve(n.current-1)},document.getElementById("pdfa-next").onclick=function(){ve(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){He(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){He(n.scale-.25)},i.scrollUp.onclick=function(){Re(-1)},i.scrollDown.onclick=function(){Re(1)},i.listToggle.onclick=function(){$()},i.more.onclick=function(e){Ut(e.clientX,e.clientY)},ee().addEventListener("scroll",Et),i.pages.addEventListener("mouseup",oe),i.pages.addEventListener("click",yt),document.addEventListener("selectionchange",G),i.pages.addEventListener("touchend",function(){z&&clearTimeout(z),z=null,W()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!n.noteEditing&&M()}),document.addEventListener("mousedown",function(e){i.popover.classList.contains("pdfa-open")&&(i.popover.contains(e.target)||M())}),p(),I(),i.root.querySelector(".pdfa-collapsed").onclick=Ot,t.collapsed?w({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var o=e.count||0;i.collapsedCount.textContent=o?o+(o===1?" highlight":" highlights"):""}}).catch(function(){}):$e()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function ut(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function tn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var nn=`
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
  /* The standby copy of the brand. Hidden while the toolbar has room to show its
     own; the narrow-embed query below swaps which one is visible, so exactly one is
     on screen at any width. */
  .pdfa-filename-bar .pdfa-brand { display: none; }
  .pdfa-name { display: inline-block; max-width: 90%; opacity: .7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
    /* The brand moves down to the filename row rather than being dropped. It is
       there to answer "which viewer is this" - Amplenote renders its OWN preview
       for the same attachment and the two look broadly alike - so losing it
       entirely would undo that fix instead of just relocating it. */
    .pdfa-toolbar .pdfa-brand { display: none; }
    .pdfa-filename-bar .pdfa-brand { display: inline; }
    .pdfa-toolbar { gap: 4px; padding: 5px 6px; justify-content: center; }
    .pdfa-label { min-width: 44px; }
    /* Same information, about half the row. The filename is also on the attachment
       chip immediately above the embed and on the collapsed bar, so this is the
       third place it appears - worth keeping, not worth 27px of a 298px box. */
    .pdfa-filename-bar { padding: 0 6px 3px; font-size: 11px; }
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
`,ft={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function gt({attachmentUUID:t,attachmentName:l="",page:a=null,highlightId:s=null,lightDarkMode:i="light",pluginUUID:c=null,noteUUID:n=null,collapsed:h=!1}={}){let w=ft[i]||ft.light,g={attachmentUUID:t,page:a,highlightId:s,pluginUUID:c,noteUUID:n,pdfJsSrc:te.pdfJs,workerSrc:te.pdfJsWorker,pdfLibSrc:te.pdfLib,colors:re.map(k=>({id:k.id,label:k.label,hex:k.hex,rgb:k.rgb,cycleIndex:k.cycleIndex})),defaultColorId:ie,collapsed:h,attachmentName:l};return`<link rel="stylesheet" href="${te.pdfViewerCss}">
<style>:root{${w}}${nn}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${ut(l)}</span>
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
    <!-- Only ever visible on a narrow embed, where the toolbar above has given up
         its own copy to save a row. See the CSS for why the brand has to survive
         somewhere rather than just being dropped. -->
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-name">${ut(l)}</span>
  </div>
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
window.__PDFA_GEOM = (${Se.toString()})();
window.__PDFA_ANNOTATIONS = (${Te.toString()})();
window.__PDFA_EXPORT = (${ke.toString()})();<\/script>
<script>(${pt.toString()})();<\/script>`}var on={noteOption:{"Annotate PDF":async function(t,l){return Ze(t,l,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,l){return Ke(t,l)}},insertText:async function(t){return et(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...l){return tt(t,l[0])},renderEmbed:function(t,...l){let{attachmentUUID:a,page:s,highlightId:i,collapsed:c,attachmentName:n}=ne(l[0]);return a?gt({attachmentUUID:a,page:s,highlightId:i,collapsed:c,attachmentName:n,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...l){return ht(t,l[0])}},an=on;return qt(rn);})();

  var plugin = __pluginModule.default;
})();
