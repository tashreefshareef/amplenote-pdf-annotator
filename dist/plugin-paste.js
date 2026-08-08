(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var we=Object.defineProperty;var Ht=Object.getOwnPropertyDescriptor;var Rt=Object.getOwnPropertyNames;var Lt=Object.prototype.hasOwnProperty;var Mt=(t,i)=>{for(var a in i)we(t,a,{get:i[a],enumerable:!0})},Ft=(t,i,a,l)=>{if(i&&typeof i=="object"||typeof i=="function")for(let s of Rt(i))!Lt.call(t,s)&&s!==a&&we(t,s,{get:()=>i[s],enumerable:!(l=Ht(i,s))||l.enumerable});return t};var Ot=t=>Ft(we({},"__esModule",{value:!0}),t);var Kt={};Mt(Kt,{default:()=>Zt});var oe=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],ae="yellow",V="PDF Annotator data",Oe="attachment://",$e=1.2,_e=16,ee={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},$t="https://plugins.amplenote.com/cors-proxy";function je(t){let i=new URL($t);return i.searchParams.set("apiurl",t),i.toString()}var _t="application/pdf";function jt(t){return Array.isArray(t)?t.filter(i=>i&&i.type===_t&&i.uuid):[]}async function re(t,i){let a=await t.getNoteAttachments({uuid:i}),l=jt(a);if(l.length===0)return null;if(l.length===1)return l[0];let s=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:l.map(n=>({label:n.name,value:n.uuid})),value:l[0].uuid}]});if(s==null)return null;let c=Array.isArray(s)?s[0]:s;return l.find(n=>n.uuid===c)||null}async function Be(t,i){if(!i)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(i);if(!a)throw new Error(`No URL returned for attachment ${i}`);return je(a)}function ze(t){return t?_e:$e}function te(t){let i={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return i;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return i}let l=c=>{let n=a.get(c);if(n===null||n.trim()==="")return null;let h=Number(n);return Number.isFinite(h)?h:null},s=l("page");return{attachmentUUID:a.get("att")||null,page:s!==null&&s>=1?Math.floor(s):null,x:l("x"),y:l("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function qe({attachmentUUID:t,page:i,x:a,y:l,highlightId:s,collapsed:c,attachmentName:n}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),n&&h.set("n",n),Number.isFinite(i)&&i>=1&&h.set("page",String(Math.floor(i))),Number.isFinite(a)&&h.set("x",String(a)),Number.isFinite(l)&&h.set("y",String(l)),s&&h.set("hl",s),h.toString()}function ie(t,i={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=ze(i.collapsed));let l=qe(i);return`<object data="${l?`plugin://${t}?${l}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function Ge(t,i,a){if(!t||!i||!a)return null;let l=t.split(`
`),s=l.findIndex(n=>n.includes(`${Oe}${i}`));if(s===-1)return null;let c=l.slice();return l[s+1]===""?c.splice(s+2,0,a.trim(),""):c.splice(s+1,0,"",a.trim(),""),c.join(`
`)}function se(t,i,a=null){return!t||!i||!t.includes(`plugin://${i}`)?!1:a?t.includes(`att=${a}`):!0}function Ve(t,i,a){if(!t||!i||!a)return null;let l=t.split(`
`),s=`plugin://${i}`,c=l.findIndex(h=>h.includes(s)&&h.includes(`att=${a}`));if(c===-1)return null;let n=l.slice();return n.splice(c,1),n[c]===""&&n[c-1]===""&&n.splice(c,1),n.join(`
`)}function xe(t,i,a,l={}){if(!t||!i||!a)return null;let s=t.split(`
`),c=`plugin://${i}`,n=s.findIndex(T=>T.includes(c)&&T.includes(`att=${a}`));if(n===-1)return null;let h=s[n],w=h.match(/data="(plugin:\/\/[^"]*)"/);if(!w)return null;let g=w[1],I=g.indexOf("?"),A=I===-1?"":g.slice(I+1),C={...te(A),attachmentUUID:a,...l},p=qe(C),f=p?`plugin://${i}?${p}`:`plugin://${i}`,v=s.slice(),m=h.replace(w[0],`data="${f}"`),y=ze(C.collapsed),N=m.match(/data-aspect-ratio="[^"]*"/);return m=N?m.replace(N[0],`data-aspect-ratio="${y}"`):m.replace(/\s*\/>\s*$/,` data-aspect-ratio="${y}" />`),v[n]=m,v.join(`
`)}function We(t,i,a,l){return xe(t,i,a,{collapsed:!!l})}async function Je(t,i,a){let l=await re(t,i);if(!l){let h=await t.getNoteAttachments({uuid:i});return(!(Array.isArray(h)&&h.length>0)||!h.some(g=>g&&g.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let s=await t.getNoteContent({uuid:i});if(se(s,a,l.uuid))return await t.alert(`"${l.name}" is already open in this note - scroll to the viewer.`),l.uuid;let c=ie(a,{attachmentUUID:l.uuid,attachmentName:l.name}),n=Ge(s,l.uuid,c);return n!==null?(await t.replaceNoteContent({uuid:i},n),l.uuid):(await t.insertNoteContent({uuid:i},`
${c}
`,{atEnd:!0}),l.uuid)}var Bt="Raw markdown";function zt(t){let i=(String(t||"").match(/`+/g)||[]).reduce((a,l)=>Math.max(a,l.length),0);return"`".repeat(Math.max(3,i+1))}async function Xe(t,i){let a=await t.getNoteContent({uuid:i});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let l=await t.getNoteAttachments({uuid:i}),s=(Array.isArray(l)?l:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=zt(a),n=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:n},`# Attachments

${s||"- (none)"}

# ${Bt}

${c}
${a}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),n}async function Ye(t,i,a){if(!i)return"";let l=await re(t,i);if(!l){let c=await t.getNoteAttachments({uuid:i});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let s=await t.getNoteContent({uuid:i});return se(s,a,l.uuid)?(await t.alert(`"${l.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${ie(a,{attachmentUUID:l.uuid,attachmentName:l.name})}
`}async function Qe(t,i){let{noteUUID:a,attachmentUUID:l,page:s,highlightId:c}=te(i);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let n=await t.getNoteContent({uuid:a}),h=xe(n,t.context.pluginUUID,l,{page:s,highlightId:c,collapsed:!1});h!==null&&await t.replaceNoteContent({uuid:a},h)}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function le(t){if(!t)return null;let i=String(t).trim().toLowerCase();return oe.find(a=>a.id===i||a.hex.toLowerCase()===i)||null}function Ze(){return le(ae)}function qt(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function de({page:t,color:i,rects:a,quoteText:l,note:s=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of a)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let n=le(i)||Ze();return{id:c||qt(),page:t,color:n.id,rects:a.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(l||""),note:s?String(s):null}}function Ke(t,i){let a=i==null?null:String(i).trim();return{...t,note:a||null}}function et(t,i){let a=le(i);if(!a)throw new Error(`withColor: unknown color "${i}"`);return{...t,color:a.id}}function tt(t,i){return(t||[]).filter(a=>a.id!==i)}function be(t,i,a){let l=!1,s=(t||[]).map(c=>c.id!==i?c:(l=!0,a(c)));return l?s:t}var Gt="json",Vt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function nt(t){let i=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${Vt}
\`\`\`${Gt}
${i}
\`\`\``}function ye(t){if(!t)return null;let i=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!i&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),l=(i?i[1]:a?a[1]:t).trim();if(!l)return null;try{return JSON.parse(l)}catch{return null}}function Wt(t){if(!Array.isArray(t))return[];let i=[];for(let a of t)try{i.push(de(a))}catch{}return i}async function ce(t,i,a){let l=await t.getNoteContent({uuid:i}),s=Ce(l,V),c=ye(s);return!c||typeof c!="object"?[]:Wt(c[a])}async function ot(t,i,a,l){let s={uuid:i},c=await t.getNoteContent(s),n=Ce(c,V),w={...ye(n)||{},[a]:l},g=nt(w);n===null&&await t.insertNoteContent(s,`

# ${V}

`,{atEnd:!0}),await t.replaceNoteContent(s,g,{section:{heading:{text:V,level:1}}})}async function at(t,i,a){let l={uuid:i},s=await t.getNoteContent(l),c=Ce(s,V);if(c===null)return;let n=ye(c)||{};if(!(a in n))return;let h={...n};delete h[a],await t.replaceNoteContent(l,nt(h),{section:{heading:{text:V,level:1}}})}function Ce(t,i){if(!t)return null;let a=t.split(`
`),l=/^#\s+(.*)$/,s=a.findIndex(n=>{let h=n.match(l);return h&&h[1].trim()===i});if(s===-1)return null;let c=a.length;for(let n=s+1;n<a.length;n++)if(/^#\s+/.test(a[n])){c=n;break}return a.slice(s+1,c).join(`
`).trim()}function B(t,i){return i.noteUUID||t.context.noteUUID}async function rt(t,i,a){try{let l=await t.getNoteAttachments({uuid:i}),s=Array.isArray(l)&&l.find(c=>c&&c.uuid===a);return s?s.name:""}catch{return""}}async function he(t,i,a,l){let s=await ce(t,i,a),c=l(s);return c!==s&&await ot(t,i,a,c),{highlights:c}}function it(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let i=t.trim();if(!i.startsWith("{"))return{action:i};try{return JSON.parse(i)}catch{return{action:i}}}async function st(t,i){return JSON.stringify(await Jt(t,it(i)))}async function Jt(t,i){let a=it(i);switch(a.action){case"getPdfUrl":{let l=a.attachmentUUID;if(!l)return{error:"No attachment specified for this viewer."};try{return{url:await Be(t,l),name:await rt(t,B(t,a),l)}}catch(s){return{error:`Could not load the PDF: ${s.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await ce(t,B(t,a),a.attachmentUUID)}}catch(l){return{error:`Could not load highlights: ${l.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let l=de(a.highlight||{});return await he(t,B(t,a),a.attachmentUUID,s=>s.concat([l]))}catch(l){return{error:`Could not save the highlight: ${l.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await he(t,B(t,a),a.attachmentUUID,l=>be(l,a.id,s=>et(s,a.color)))}catch(l){return{error:`Could not change the highlight color: ${l.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await he(t,B(t,a),a.attachmentUUID,l=>be(l,a.id,s=>Ke(s,a.note)))}catch(l){return{error:`Could not save the note: ${l.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await he(t,B(t,a),a.attachmentUUID,l=>tt(l,a.id))}catch(l){return{error:`Could not remove the highlight: ${l.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{return await t.insertNoteContent({uuid:B(t,a)},`
`+a.content+`
`,{atEnd:!0}),{ok:!0}}catch(l){return{error:`Could not add this to the note: ${l.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=B(t,a),s=await t.getNoteContent({uuid:l}),c=Ve(s,a.pluginUUID,a.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:l},c),await at(t,l,a.attachmentUUID),{ok:!0})}catch(l){return{error:`Could not remove this viewer: ${l.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let l=B(t,a),s=await rt(t,l,a.attachmentUUID);try{let c=await ce(t,l,a.attachmentUUID);return{name:s,count:c.length}}catch{return{name:s,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=B(t,a),s=await t.getNoteContent({uuid:l}),c=We(s,a.pluginUUID,a.attachmentUUID,a.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:l},c),{ok:!0})}catch(l){return{error:`Could not resize this viewer: ${l.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let l=await t.findNote({name:a.noteName}),s=l?l.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:s},a.content||""),{ok:!0,noteUUID:s}}catch(l){return{error:`Could not export highlights: ${l.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function Ee(){function t(p,f){return{x:p.left-f.left,y:p.top-f.top,width:p.width,height:p.height}}function i(p,f){return{x:Math.min(p[0],f[0]),y:Math.min(p[1],f[1]),width:Math.abs(f[0]-p[0]),height:Math.abs(f[1]-p[1])}}function a(p,f){var v=Math.pow(10,f===void 0?2:f),m=function(y){return Math.round(y*v)/v};return{x:m(p.x),y:m(p.y),width:m(p.width),height:m(p.height)}}function l(p){return p.width>.01&&p.height>.01}function s(p,f,v){for(var m=String(p??""),y=Math.max(0,f===void 0?0:f),N=Math.min(m.length,v===void 0?m.length:v),T=function($){return $===""||/\s/.test($)},U=[],k=y;k<N;){for(;k<N&&T(m.charAt(k));)k++;if(k>=N)break;for(var O=k;k<N&&!T(m.charAt(k));)k++;U.push({start:O,end:k})}return U}function c(p){for(var f=1/0,v=1/0,m=-1/0,y=-1/0,N=0;N<(p?p.length:0);N++){var T=p[N];l(T)&&(f=Math.min(f,T.left),v=Math.min(v,T.top),m=Math.max(m,T.left+T.width),y=Math.max(y,T.top+T.height))}return isFinite(f)?{left:f,top:v,width:m-f,height:y-v}:null}function n(p,f,v){for(var m=[],y=0;y<p.length;y++){var N=t(p[y],f);if(l(N)){var T=v(N.x,N.y),U=v(N.x+N.width,N.y+N.height),k=a(i(T,U));l(k)&&m.push(k)}}return m}function h(p,f){var v=f(p.x,p.y),m=f(p.x+p.width,p.y+p.height);return i(v,m)}function w(p,f,v){var m=f.right-f.left,y=f.bottom-f.top;if(m<=0||y<=0)return null;var N=p.x2-p.x1,T=p.y2-p.y1,U=p.x1+(v.left-f.left)/m*N,k=p.x2-(f.right-v.right)/m*N,O=p.y1+(v.bottom-f.bottom)/y*T,$=p.y2-(f.top-v.top)/y*T;return{x:U,y:O,width:k-U,height:$-O}}function g(p,f){var v=Math.min(p.y+p.height,f.y+f.height)-Math.max(p.y,f.y);return v>.5*Math.min(p.height,f.height)}function I(p,f){var v=f===void 0?.6:f;if(!p||p.length<2)return(p||[]).slice();for(var m=p.slice().sort(function(q,J){return J.y-q.y||q.x-J.x}),y=[],N=0;N<m.length;N++){for(var T=!1,U=0;U<y.length;U++)if(g(y[U][0],m[N])){y[U].push(m[N]),T=!0;break}T||y.push([m[N]])}for(var k=[],O=0;O<y.length;O++){for(var $=y[O].slice().sort(function(q,J){return q.x-J.x}),D=null,Z=0;Z<$.length;Z++){var H=$[Z];if(D===null){D={x:H.x,y:H.y,width:H.width,height:H.height};continue}var pe=H.x-(D.x+D.width);if(pe<=v*Math.max(D.height,H.height)){var W=Math.max(D.x+D.width,H.x+H.width),ne=Math.max(D.y+D.height,H.y+H.height);D.x=Math.min(D.x,H.x),D.y=Math.min(D.y,H.y),D.width=W-D.x,D.height=ne-D.y}else k.push(D),D={x:H.x,y:H.y,width:H.width,height:H.height}}D!==null&&k.push(D)}return k.map(function(q){return a(q)})}function A(p,f,v,m){var y=m===void 0?0:m;return f>=p.x-y&&f<=p.x+p.width+y&&v>=p.y-y&&v<=p.y+p.height+y}function E(p,f,v,m,y){for(var N=p||[],T=N.length-1;T>=0;T--){var U=N[T];if(!(!U||U.page!==f||!U.rects)){for(var k=0;k<U.rects.length;k++)if(A(U.rects[k],v,m,y===void 0?1:y))return U}}return null}function C(p){return String(p??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:i,roundRect:a,isVisibleRect:l,textTokenRanges:s,unionClientRects:c,clientRectsToPdfRects:n,pdfRectToViewportRect:h,itemRelativeRect:w,mergeLineRects:I,rectContainsPoint:A,hitTestHighlights:E,normalizeQuoteText:C}}var j=Ee(),In=j.clientRectToLocal,kn=j.rectFromCorners,Dn=j.roundRect,Pn=j.isVisibleRect,Un=j.textTokenRanges,Hn=j.unionClientRects,Rn=j.clientRectsToPdfRects,Ln=j.pdfRectToViewportRect,Mn=j.itemRelativeRect,Fn=j.mergeLineRects,On=j.rectContainsPoint,$n=j.hitTestHighlights,_n=j.normalizeQuoteText;function Ne(){var t=[.957,.871,.424];function i(c,n,h,w,g){var I=n.context.register(n.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),A=[c.pushGraphicsState(),c.setGraphicsState("GS0")];A.push(c.setFillingColor(c.rgb(w[0],w[1],w[2])));for(var E=0;E<h.length;E++){var C=h[E];A.push(c.moveTo(C.x,C.y)),A.push(c.lineTo(C.x,C.y+C.height)),A.push(c.lineTo(C.x+C.width,C.y+C.height)),A.push(c.lineTo(C.x+C.width,C.y)),A.push(c.closePath())}A.push(c.fill()),A.push(c.popGraphicsState());var p=n.context.formXObject(A,{BBox:g,Resources:{ExtGState:{GS0:I}}});return n.context.register(p)}function a(c,n,h,w){for(var g=h.rects,I=[],A=g[0].x,E=g[0].y,C=g[0].x+g[0].width,p=g[0].y+g[0].height,f=0;f<g.length;f++){var v=g[f],m=v.x,y=v.x+v.width,N=v.y,T=v.y+v.height;I.push(m,T,y,T,m,N,y,N),A=Math.min(A,m),E=Math.min(E,N),C=Math.max(C,y),p=Math.max(p,T)}var U=n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:n.context.obj([A,E,C,p]),QuadPoints:n.context.obj(I),C:n.context.obj(w),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&U.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var k=i(c,n,g,w,[A,E,C,p]);U.set(c.PDFName.of("AP"),n.context.obj({N:k}));var O=n.context.register(U),$=[O];if(h.note){var D=n.context.register(n.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:n.context.obj([C+8,E-60,C+208,E+12]),Parent:O,Open:!1}));U.set(c.PDFName.of("Popup"),D),$.push(D)}return $}function l(c,n,h){var w=n.node.get(c.PDFName.of("Annots"));if(w instanceof c.PDFArray)for(var g=0;g<h.length;g++)w.push(h[g]);else n.node.set(c.PDFName.of("Annots"),n.doc.context.obj(h))}async function s(c,n,h,w){for(var g=await c.PDFDocument.load(n),I=g.getPages(),A=h||[],E=0;E<A.length;E++){var C=A[E];if(!(!C||!C.rects||!C.rects.length)){var p=I[C.page-1];if(p){var f=w&&w[C.color]||t,v=a(c,g,C,f);l(c,p,v)}}}return g.save()}return{writeHighlightsIntoPdf:s,buildHighlightAnnotation:a,appendAnnotationRefs:l}}var Ae=Ne(),Bn=Ae.writeHighlightsIntoPdf,zn=Ae.buildHighlightAnnotation,qn=Ae.appendAnnotationRefs;function Te(){function t(n){return String(n??"").replace(/\]/g,"\\]")}function i(n,h,w,g,I){var A=new URLSearchParams;h&&A.set("att",h),Number.isFinite(w)&&w>=1&&A.set("page",String(Math.floor(w))),g&&A.set("hl",g),I&&A.set("note",I);var E=A.toString();return"plugin://"+n+(E?"?"+E:"")}function a(n,h){return String(n??"").split(/\r?\n/).map(function(w){return(h+" "+w).replace(/[ \t]+$/,"")})}function l(n,h,w,g,I,A){var E=i(h,w,g.page,g.id,A),C=t(n||"PDF"),p='==\u25CF<!-- {"cycleColor":"'+I+'"} -->==',f=p+" ["+C+"]("+E+")",v=[f].concat(a(g.quoteText,"> >"));return g.note&&(v.push(">"),v=v.concat(a(g.note,">"))),v.join(`
`)}function s(n){return n.slice().sort(function(h,w){if(h.page!==w.page)return h.page-w.page;var g=h.rects&&h.rects[0]?h.rects[0].y:0,I=w.rects&&w.rects[0]?w.rects[0].y:0;return I-g})}function c(n,h,w,g,I,A,E){var C=A&&A.length?A:null,p=(g||[]).filter(function(m){return m&&(!C||C.indexOf(m.color)!==-1)}),f=s(p),v=f.map(function(m){var y=I?I[m.color]:void 0;return l(n,h,w,m,y,E)});return v.join(`

`)}return{buildDeepLink:i,buildHighlightBlock:l,buildExportAllContent:c}}var Se=Te(),Vn=Se.buildDeepLink,Wn=Se.buildHighlightBlock,Jn=Se.buildExportAllContent;function lt(){var t=window.__PDFA_CONFIG||{},i=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},l=window.__PDFA_EXPORT||{},s={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(n.attachmentName=e,s.name&&(s.name.textContent=e),s.collapsedName&&(s.collapsedName.textContent=e))}var n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,noteEditing:null};function h(e,o){s.status.textContent=e||"",s.status.style.display=e?"block":"none",s.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function w(e){var o=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(r,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(o)))}catch(u){d(u)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function g(){return t.colors||[]}function I(e){for(var o=g(),r=0;r<o.length;r++)if(o[r].id===e)return o[r].hex;return o.length?o[0].hex:"#F4DE6C"}function A(e){for(var o=0;o<n.highlights.length;o++)if(n.highlights[o].id===e)return n.highlights[o];return null}function E(e,o,r){var d=document.createElement("button");return d.className="pdfa-btn"+(o?" "+o:""),d.textContent=e,d.onclick=function(u){u.stopPropagation(),r()},d}function C(e,o,r,d){var u=document.createElement("button");return u.className="pdfa-color",u.dataset.color=e.id,u.style.background=e.hex,u.title=d+" "+e.label,u.setAttribute("aria-label",d+" "+e.label),u.setAttribute("aria-pressed",String(!!o)),u.onclick=function(x){x.stopPropagation(),r(e.id)},u}function p(){for(var e=g(),o=0;o<e.length;o++)s.colors.appendChild(C(e[o],e[o].id===n.activeColorId,function(r){n.activeColorId=r,f(),n.pendingSelection&&ne(n.pendingSelection,r)},"Highlight"))}function f(){for(var e=s.colors.querySelectorAll(".pdfa-color"),o=0;o<e.length;o++)e[o].setAttribute("aria-pressed",String(e[o].dataset.color===n.activeColorId))}function v(e,o){var r=e.getViewport({scale:n.scale});n.viewports[o]=r;var d=document.createElement("div");d.className="pdfa-page",d.dataset.page=String(o),d.style.width=r.width+"px",d.style.height=r.height+"px";var u=document.createElement("canvas"),x=window.devicePixelRatio||1;u.width=Math.floor(r.width*x),u.height=Math.floor(r.height*x),u.style.width=r.width+"px",u.style.height=r.height+"px",d.appendChild(u);var b=document.createElement("div");b.className="pdfa-highlights",d.appendChild(b);var S=document.createElement("div");S.className="textLayer",S.style.width=r.width+"px",S.style.height=r.height+"px",S.style.setProperty("--scale-factor",String(n.scale)),d.appendChild(S),s.pages.appendChild(d);var R=u.getContext("2d");return R.scale(x,x),e.render({canvasContext:R,viewport:r}).promise.then(function(){return e.getTextContent()}).then(function(F){var P=[];return window.pdfjsLib.renderTextLayer({textContent:F,container:S,viewport:r,textDivs:P}).promise.then(function(){n.textSpans+=P.length;for(var L=0;L<P.length;L++)P[L].__pdfaItem=F.items[L];N(o)})})}function m(){if(n.rendering)return Promise.resolve();n.rendering=!0,M(!0),s.pages.innerHTML="",n.viewports={},n.textSpans=0,h("Rendering...");for(var e=Promise.resolve(),o=1;o<=n.pageCount;o++)(function(r){e=e.then(function(){return n.doc.getPage(r).then(function(d){return v(d,r)})})})(o);return e.then(function(){n.textSpans===0?h("No selectable text found - this PDF may be a scan.",!0):h(""),n.rendering=!1,K()}).catch(function(r){n.rendering=!1,h("Failed to render: "+r.message,!0)})}function y(e){return function(o,r){return e.convertToViewportPoint(o,r)}}function N(e){for(var o=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",r=s.pages.querySelectorAll(o),d=0;d<r.length;d++){var u=r[d],x=Number(u.dataset.page),b=u.querySelector(".pdfa-highlights"),S=n.viewports[x];if(!(!b||!S)){b.innerHTML="";for(var R=y(S),F=0;F<n.highlights.length;F++){var P=n.highlights[F];if(!(!P||P.page!==x||!P.rects||!P.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=P.id||"";for(var G=0;G<P.rects.length;G++){var Y=i.pdfRectToViewportRect(P.rects[G],R),_=document.createElement("div");_.className="pdfa-hl",_.style.left=Y.x+"px",_.style.top=Y.y+"px",_.style.width=Y.width+"px",_.style.height=Y.height+"px",_.style.background=I(P.color),L.appendChild(_)}b.appendChild(L)}}}}}function T(){N(),k(),s.count.textContent=String(n.highlights.length)}function U(){return n.highlights.slice().sort(function(e,o){return e.page!==o.page?e.page-o.page:(o.rects[0]?o.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function k(){s.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",e.appendChild(o),e.appendChild(E("Close","",function(){$(!1)})),s.panel.appendChild(e);var r=U();if(!r.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",s.panel.appendChild(d);return}for(var u=0;u<r.length;u++)s.panel.appendChild(O(r[u]))}function O(e){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=e.id||"",o.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=I(e.color),o.appendChild(r);var d=document.createElement("div"),u=document.createElement("div");u.className="pdfa-hl-page",u.textContent="Page "+e.page,d.appendChild(u);var x=document.createElement("div");if(x.className="pdfa-hl-quote",x.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(x),e.note){var b=document.createElement("div");b.className="pdfa-hl-note",b.textContent=e.note,d.appendChild(b)}return o.appendChild(d),o.onclick=function(){ke(e)},o}function $(e){var o=e===void 0?!s.panel.classList.contains("pdfa-open"):e;s.panel.classList.toggle("pdfa-open",o),s.listToggle.setAttribute("aria-pressed",String(o)),o&&k()}function D(e){for(var o=e&&e.nodeType===1?e:e&&e.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function Z(e,o){for(var r=[],d=[],u=null,x=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),b;b=x.nextNode();)if(e.intersectsNode(b)){var S=b.nodeValue||"",R=b===e.startContainer?e.startOffset:0,F=b===e.endContainer?e.endOffset:S.length,P=b.parentElement,L=P&&P.__pdfaItem;if(L)for(var G={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},Y=P.getBoundingClientRect(),_=i.textTokenRanges(S,R,F),Q=0;Q<_.length;Q++){var ve=document.createRange();ve.setStart(b,_[Q].start),ve.setEnd(b,_[Q].end);var z=i.unionClientRects(ve.getClientRects());if(z){var Me={left:z.left,top:z.top,width:z.width,height:z.height,right:z.left+z.width,bottom:z.top+z.height},Fe=i.itemRelativeRect(G,Y,Me);Fe&&(r.push(Fe),d.push(S.slice(_[Q].start,_[Q].end)),u=Me)}}}return{rects:r,text:d.join(" "),lastCssRect:u}}function H(e){if(n.pendingSelection=e,!e){s.hint.textContent="",s.hint.style.display="none";return}s.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",s.hint.style.display="inline"}function pe(e){if(!n.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){H(null),M();return}var r=o.getRangeAt(0),d=D(r.startContainer);if(!d)return H(null);var u=d.parentElement;if(!u||!u.dataset||!u.dataset.page)return H(null);var x=Number(u.dataset.page);if(!n.viewports[x])return H(null);var b=D(r.endContainer)!==d,S=Z(r,d),R=i.mergeLineRects(S.rects);if(!R.length)return H(null);var F=S.lastCssRect||u.getBoundingClientRect(),P=e&&e.clientX?e.clientX:F.left+F.width/2,L=e&&e.clientY?e.clientY:F.top+F.height,G={page:x,rects:R,quoteText:i.normalizeQuoteText(S.text),spilled:b,anchorX:P,anchorY:L};H(G),pt(G)}}function W(e,o){var r=n.highlights;return n.highlights=e,T(),w(o).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return n.highlights=d.highlights||e,T(),h(""),!0}).catch(function(d){return n.highlights=r,T(),h(d.message||String(d),!0),!1})}function ne(e,o){var r={id:null,page:e.page,color:o,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,u=e.anchorY;H(null),M(!0);var x=window.getSelection();x&&x.removeAllRanges&&x.removeAllRanges(),W(n.highlights.concat([r]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:r}).then(function(b){if(b){var S=n.highlights[n.highlights.length-1];S&&S.id&&fe(S,d,u,!0)}})}function q(e,o){M(!0),W(n.highlights.map(function(r){return r.id===e?Object.assign({},r,{color:o}):r}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:o})}function J(e){M(!0),W(n.highlights.filter(function(o){return o.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function ue(e,o){var r=String(o??"").trim();n.noteEditing=null,M(!0),W(n.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:r||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:r})}function X(e,o,r,d){s.popover.innerHTML="",s.popover.classList.toggle("pdfa-editing",d==="editing"),s.popover.classList.toggle("pdfa-exporting",d==="exporting"),s.popover.classList.toggle("pdfa-menu",d==="menu");for(var u=0;u<e.length;u++)s.popover.appendChild(e[u]);s.popover.classList.add("pdfa-open");var x=s.popover.offsetWidth,b=s.popover.offsetHeight,S=Math.max(4,Math.min(o-x/2,window.innerWidth-x-4)),R=r+12;R+b>window.innerHeight-4&&(R=Math.max(4,r-b-12)),s.popover.style.left=S+"px",s.popover.style.top=R+"px"}function M(e){n.noteEditing&&!e||(n.noteEditing=null,s.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),s.popover.innerHTML="")}function pt(e){for(var o=g(),r=[],d=0;d<o.length;d++)r.push(C(o[d],o[d].id===n.activeColorId,function(u){n.activeColorId=u,f(),ne(e,u)},"Highlight"));X(r,e.anchorX,e.anchorY)}function fe(e,o,r,d){for(var u=g(),x=[],b=0;b<u.length;b++)x.push(C(u[b],u[b].id===e.color,function(R){q(e.id,R)},"Change to"));var S=!!e.note;x.push(E(S?"Edit note":"Add note",d&&!S?"pdfa-btn-primary":"",function(){ft(e,o,r)})),x.push(E("Copy","",function(){Et(e)})),x.push(E("Send to note","",function(){Nt(e)})),x.push(E("Remove","pdfa-remove",function(){J(e.id)})),X(x,o,r)}function ut(e,o){for(var r=g(),d={},u=0;u<r.length;u++)d[r[u].id]=!0;var x=document.createElement("div");x.className="pdfa-export-hint",x.textContent="Export highlights to a note";var b=document.createElement("div");b.className="pdfa-export-colors";for(var S=0;S<r.length;S++)(function(F){var P=C(F,!0,function(L){d[L]=!d[L],P.setAttribute("aria-pressed",String(d[L]))},"Toggle");b.appendChild(P)})(r[S]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(E("Create / update note","pdfa-btn-primary",function(){for(var F=[],P=0;P<r.length;P++)d[r[P].id]&&F.push(r[P].id);At(F.length===r.length?null:F)})),X([x,b,R],e,o,"exporting")}function ft(e,o,r){n.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var u=document.createElement("div");u.className="pdfa-note-actions",e.note&&u.appendChild(E("Delete note","",function(){ue(e.id,"")}));var x=document.createElement("span");x.className="pdfa-spacer",u.appendChild(x),u.appendChild(E("Cancel","",function(){Ie(e,o,r)})),u.appendChild(E("Save","pdfa-btn-primary",function(){ue(e.id,d.value)})),d.onkeydown=function(b){b.key==="Enter"&&(b.ctrlKey||b.metaKey)?(b.preventDefault(),b.stopPropagation(),ue(e.id,d.value)):b.key==="Escape"&&(b.preventDefault(),b.stopPropagation(),Ie(e,o,r))},X([d,u],o,r,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function Ie(e,o,r){n.noteEditing=null;var d=A(e.id)||e;fe(d,o,r)}function gt(e){if(!n.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var r=e.target,d=null;r&&r!==s.pages;){if(r.classList&&r.classList.contains("pdfa-page")){d=r;break}r=r.parentElement}if(!d)return M();var u=Number(d.dataset.page),x=n.viewports[u];if(!x)return M();var b=d.getBoundingClientRect(),S=x.convertToPdfPoint(e.clientX-b.left,e.clientY-b.top),R=i.hitTestHighlights(n.highlights,u,S[0],S[1],1);R&&R.id?fe(R,e.clientX,e.clientY):M()}}}function K(){s.pageLabel.textContent=n.current+" / "+n.pageCount,s.zoomLabel.textContent=Math.round(n.scale*100)+"%"}function ge(){return s.root.querySelector(".pdfa-scroll")}function me(e){var o=Math.min(Math.max(1,e),n.pageCount),r=s.pages.querySelector('[data-page="'+o+'"]');r&&r.scrollIntoView({behavior:"smooth",block:"start"}),n.current=o,K()}function ke(e){var o=s.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),r=n.viewports[e.page];if(!(!o||!r||!e.rects||!e.rects.length)){var d=i.pdfRectToViewportRect(e.rects[0],y(r)),u=ge(),x=o.getBoundingClientRect().top+d.y;u.scrollTop+=x-u.getBoundingClientRect().top-u.clientHeight/3,n.current=e.page,K()}}function De(e){n.scale=Math.min(Math.max(.4,e),4),m()}function mt(){return n.doc?n.doc.getPage(1).then(function(e){var o=ge();if(o){var r=window.getComputedStyle(o),d=o.clientWidth-(parseFloat(r.paddingLeft)||0)-(parseFloat(r.paddingRight)||0),u=e.getViewport({scale:1}).width;if(!(!(d>0)||!(u>0))){var x=Math.max(.4,d/u);x<n.scale&&(n.scale=x,K())}}}).catch(function(){}):Promise.resolve()}function vt(){M();for(var e=s.pages.querySelectorAll(".pdfa-page"),o=n.current,r=1/0,d=0;d<e.length;d++){var u=Math.abs(e[d].getBoundingClientRect().top-60);u<r&&(r=u,o=Number(e[d].dataset.page))}o!==n.current&&(n.current=o,K())}function wt(){return new Promise(function(e,o){if(window.pdfjsLib)return e(window.pdfjsLib);var r=document.createElement("script");r.src=t.pdfJsSrc,r.onload=function(){window.pdfjsLib?e(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function xt(){return new Promise(function(e,o){if(window.PDFLib)return e(window.PDFLib);var r=document.createElement("script");r.src=t.pdfLibSrc,r.onload=function(){window.PDFLib?e(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function bt(){for(var e={},o=g(),r=0;r<o.length;r++)o[r].rgb&&(e[o[r].id]=o[r].rgb);return e}function yt(){var e=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Pe(){for(var e={},o=g(),r=0;r<o.length;r++)o[r].cycleIndex!==void 0&&(e[o[r].id]=o[r].cycleIndex);return e}function Ue(){var e=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function He(e){return l.buildHighlightBlock(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,Pe()[e.color],t.noteUUID)}function Ct(e){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(e):new Promise(function(o,r){var d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select();var u=!1;try{u=document.execCommand("copy")}catch{u=!1}document.body.removeChild(d),u?o():r(new Error("Clipboard access is unavailable here."))})}function Et(e){M(!0),Ct(He(e)).then(function(){h("Highlight copied - paste it into any note.")}).catch(function(o){h("Could not copy: "+(o.message||o),!0)})}function Nt(e){M(!0),w({action:"sendToNote",content:He(e)}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");h("Sent to the bottom of this note.")}).catch(function(o){h(o.message||String(o),!0)})}function At(e){M(!0);var o=l.buildExportAllContent(n.attachmentName,t.pluginUUID,t.attachmentUUID,n.highlights,Pe(),e,t.noteUUID);if(!o){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}w({action:"exportAll",noteName:Ue(),content:o}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");h('Exported to "'+Ue()+'".')}).catch(function(r){h(r.message||String(r),!0)})}function Tt(e,o){var r=[E("Collapse","",function(){M(!0),Pt()}),E("Download","",function(){M(!0),kt()}),E("Export...","",function(){ut(e,o)}),E("Remove viewer...","pdfa-remove",function(){St(e,o)})];X(r,e,o,"menu")}function St(e,o){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(E("Cancel","",function(){M(!0)}));var u=document.createElement("span");u.className="pdfa-spacer",d.appendChild(u),d.appendChild(E("Remove","pdfa-remove",It)),X([r,d],e,o,"exporting")}function It(){M(!0),h("Removing this viewer..."),w({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function kt(){n.pdfBytes&&(h("Preparing the download..."),xt().then(function(e){return a.writeHighlightsIntoPdf(e,n.pdfBytes,n.highlights,bt())}).then(function(e){var o=new Blob([e],{type:"application/pdf"}),r=URL.createObjectURL(o),d=document.createElement("a");d.href=r,d.download=yt(),document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3),h("")}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function Dt(){return w({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");n.highlights=e.highlights||[]}).catch(function(e){n.highlights=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function Pt(){var e=n.highlights.length;s.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",s.root.classList.add("pdfa-collapsed-mode"),Re(!0)}function Re(e){w({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Ut(){s.root.classList.remove("pdfa-collapsed-mode"),n.doc||Le(),Re(!1)}function Le(){h("Loading PDF..."),wt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,w({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return n.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return n.doc=e,n.pageCount=e.numPages,Dt()}).then(function(){return mt()}).then(function(){return m()}).then(function(){T();var e=t.highlightId?A(t.highlightId):null;e?ke(e):t.page&&me(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){me(n.current-1)},document.getElementById("pdfa-next").onclick=function(){me(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){De(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){De(n.scale-.25)},s.listToggle.onclick=function(){$()},s.more.onclick=function(e){Tt(e.clientX,e.clientY)},ge().addEventListener("scroll",vt),s.pages.addEventListener("mouseup",pe),s.pages.addEventListener("click",gt),document.addEventListener("keydown",function(e){e.key==="Escape"&&!n.noteEditing&&M()}),document.addEventListener("mousedown",function(e){s.popover.classList.contains("pdfa-open")&&(s.popover.contains(e.target)||M())}),p(),k(),s.root.querySelector(".pdfa-collapsed").onclick=Ut,t.collapsed?w({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var o=e.count||0;s.collapsedCount.textContent=o?o+(o===1?" highlight":" highlights"):""}}).catch(function(){}):Le()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function dt(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Xt(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var Yt=`
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
`,ct={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function ht({attachmentUUID:t,attachmentName:i="",page:a=null,highlightId:l=null,lightDarkMode:s="light",pluginUUID:c=null,noteUUID:n=null,collapsed:h=!1}={}){let w=ct[s]||ct.light,g={attachmentUUID:t,page:a,highlightId:l,pluginUUID:c,noteUUID:n,pdfJsSrc:ee.pdfJs,workerSrc:ee.pdfJsWorker,pdfLibSrc:ee.pdfLib,colors:oe.map(I=>({id:I.id,label:I.label,hex:I.hex,rgb:I.rgb,cycleIndex:I.cycleIndex})),defaultColorId:ae,collapsed:h,attachmentName:i};return`<link rel="stylesheet" href="${ee.pdfViewerCss}">
<style>:root{${w}}${Yt}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${dt(i)}</span>
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
    <span class="pdfa-name">${dt(i)}</span>
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
<script>window.__PDFA_CONFIG = ${Xt(g)};
window.__PDFA_GEOM = (${Ee.toString()})();
window.__PDFA_ANNOTATIONS = (${Ne.toString()})();
window.__PDFA_EXPORT = (${Te.toString()})();<\/script>
<script>(${lt.toString()})();<\/script>`}var Qt={noteOption:{"Annotate PDF":async function(t,i){return Je(t,i,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,i){return Xe(t,i)}},insertText:async function(t){return Ye(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...i){return Qe(t,i[0])},renderEmbed:function(t,...i){let{attachmentUUID:a,page:l,highlightId:s,collapsed:c,attachmentName:n}=te(i[0]);return a?ht({attachmentUUID:a,page:l,highlightId:s,collapsed:c,attachmentName:n,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...i){return st(t,i[0])}},Zt=Qt;return Ot(Kt);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
