(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Ee=Object.defineProperty;var Xt=Object.getOwnPropertyDescriptor;var Yt=Object.getOwnPropertyNames;var Zt=Object.prototype.hasOwnProperty;var Qt=(t,s)=>{for(var a in s)Ee(t,a,{get:s[a],enumerable:!0})},Kt=(t,s,a,l)=>{if(s&&typeof s=="object"||typeof s=="function")for(let i of Yt(s))!Zt.call(t,i)&&i!==a&&Ee(t,i,{get:()=>s[i],enumerable:!(l=Xt(s,i))||l.enumerable});return t};var en=t=>Kt(Ee({},"__esModule",{value:!0}),t);var xn={};Qt(xn,{default:()=>wn});var ie=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],se="yellow",G="PDF Annotator data",Je="attachment://",Xe=1,Ye=16,ne={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"},tn="https://plugins.amplenote.com/cors-proxy";function Ze(t){let s=new URL(tn);return s.searchParams.set("apiurl",t),s.toString()}var nn="application/pdf";function on(t){return Array.isArray(t)?t.filter(s=>s&&s.type===nn&&s.uuid):[]}async function le(t,s){let a=await t.getNoteAttachments({uuid:s}),l=on(a);if(l.length===0)return null;if(l.length===1)return l[0];let i=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:l.map(o=>({label:o.name,value:o.uuid})),value:l[0].uuid}]});if(i==null)return null;let c=Array.isArray(i)?i[0]:i;return l.find(o=>o.uuid===c)||null}async function Qe(t,s){if(!s)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(s);if(!a)throw new Error(`No URL returned for attachment ${s}`);return Ze(a)}function Ke(t){return t?Ye:Xe}function oe(t){let s={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return s;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return s}let l=c=>{let o=a.get(c);if(o===null||o.trim()==="")return null;let h=Number(o);return Number.isFinite(h)?h:null},i=l("page");return{attachmentUUID:a.get("att")||null,page:i!==null&&i>=1?Math.floor(i):null,x:l("x"),y:l("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function et({attachmentUUID:t,page:s,x:a,y:l,highlightId:i,collapsed:c,attachmentName:o}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),o&&h.set("n",o),Number.isFinite(s)&&s>=1&&h.set("page",String(Math.floor(s))),Number.isFinite(a)&&h.set("x",String(a)),Number.isFinite(l)&&h.set("y",String(l)),i&&h.set("hl",i),h.toString()}function de(t,s={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=Ke(s.collapsed));let l=et(s);return`<object data="${l?`plugin://${t}?${l}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function tt(t,s,a){if(!t||!s||!a)return null;let l=t.split(`
`),i=l.findIndex(o=>o.includes(`${Je}${s}`));if(i===-1)return null;let c=l.slice();return l[i+1]===""?c.splice(i+2,0,a.trim(),""):c.splice(i+1,0,"",a.trim(),""),c.join(`
`)}function ce(t,s,a=null){return!t||!s||!t.includes(`plugin://${s}`)?!1:a?t.includes(`att=${a}`):!0}function he(t,s,a){if(!t||!s||!a)return null;let l=t.split(`
`),i=`plugin://${s}`,c=l.findIndex(h=>h.includes(i)&&h.includes(`att=${a}`));if(c===-1)return null;let o=l.slice();return o.splice(c,1),o[c]===""&&o[c-1]===""&&o.splice(c,1),o.join(`
`)}function Ne(t,s,a,l={}){if(!t||!s||!a)return null;let i=t.split(`
`),c=`plugin://${s}`,o=i.findIndex(k=>k.includes(c)&&k.includes(`att=${a}`));if(o===-1)return null;let h=i[o],b=h.match(/data="(plugin:\/\/[^"]*)"/);if(!b)return null;let v=b[1],A=v.indexOf("?"),S=A===-1?"":v.slice(A+1),E={...oe(S),attachmentUUID:a,...l},u=et(E),f=u?`plugin://${s}?${u}`:`plugin://${s}`,w=i.slice(),x=h.replace(b[0],`data="${f}"`),C=Ke(E.collapsed),N=x.match(/data-aspect-ratio="[^"]*"/);return x=N?x.replace(N[0],`data-aspect-ratio="${C}"`):x.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),w[o]=x,w.join(`
`)}function nt(t,s,a,l){return Ne(t,s,a,{collapsed:!!l})}async function ot(t,s,a){let l=await le(t,s);if(!l){let h=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(h)&&h.length>0)||!h.some(v=>v&&v.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then run this again.`),null}let i=await t.getNoteContent({uuid:s});if(ce(i,a,l.uuid))return await t.alert(`"${l.name}" is already open in this note - scroll to the viewer.`),l.uuid;let c=de(a,{attachmentUUID:l.uuid,attachmentName:l.name}),o=tt(i,l.uuid,c);return o!==null?(await t.replaceNoteContent({uuid:s},o),l.uuid):(await t.insertNoteContent({uuid:s},`
${c}
`,{atEnd:!0}),l.uuid)}var an="Raw markdown";function rn(t){let s=(String(t||"").match(/`+/g)||[]).reduce((a,l)=>Math.max(a,l.length),0);return"`".repeat(Math.max(3,s+1))}async function at(t,s){let a=await t.getNoteContent({uuid:s});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let l=await t.getNoteAttachments({uuid:s}),i=(Array.isArray(l)?l:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=rn(a),o=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:o},`# Attachments

${i||"- (none)"}

# ${an}

${c}
${a}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),o}async function rt(t,s,a){if(!s)return"";let l=await le(t,s);if(!l){let c=await t.getNoteAttachments({uuid:s});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF with the paperclip button in the note toolbar, then type {PDF Annotator} again where you want the viewer.`),""}let i=await t.getNoteContent({uuid:s});return ce(i,a,l.uuid)?(await t.alert(`"${l.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${de(a,{attachmentUUID:l.uuid,attachmentName:l.name})}
`}async function sn(t,s,a,l){let i={uuid:s},c=he(a,t.context.pluginUUID,l);if(c!==null)try{await t.replaceNoteContent(i,c)}catch{}try{await t.replaceNoteContent(i,a)}catch{await t.replaceNoteContent(i,a)}}async function it(t,s){let{noteUUID:a,attachmentUUID:l,page:i,highlightId:c}=oe(s);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let o=await t.getNoteContent({uuid:a}),h=Ne(o,t.context.pluginUUID,l,{page:i,highlightId:c,collapsed:!1});h!==null&&(t.context&&t.context.noteUUID===a?await sn(t,a,h,l):await t.replaceNoteContent({uuid:a},h))}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function pe(t){if(!t)return null;let s=String(t).trim().toLowerCase();return ie.find(a=>a.id===s||a.hex.toLowerCase()===s)||null}function st(){return pe(se)}function ln(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function ue({page:t,color:s,rects:a,quoteText:l,note:i=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of a)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let o=pe(s)||st();return{id:c||ln(),page:t,color:o.id,rects:a.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(l||""),note:i?String(i):null}}function lt(t,s){let a=s==null?null:String(s).trim();return{...t,note:a||null}}function dt(t,s){let a=pe(s);if(!a)throw new Error(`withColor: unknown color "${s}"`);return{...t,color:a.id}}function ct(t,s){return(t||[]).filter(a=>a.id!==s)}function Se(t,s,a){let l=!1,i=(t||[]).map(c=>c.id!==s?c:(l=!0,a(c)));return l?i:t}var dn="json",ht="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function pt(t){let s=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${ht}
\`\`\`${dn}
${s}
\`\`\``}function Te(t){if(!t)return null;let s=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!s&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),l=(s?s[1]:a?a[1]:t).trim();if(!l)return null;try{return JSON.parse(l)}catch{return null}}function cn(t){if(!Array.isArray(t))return[];let s=[];for(let a of t)try{s.push(ue(a))}catch{}return s}async function fe(t,s,a){let l=await t.getNoteContent({uuid:s}),i=ke(l,G),c=Te(i);return!c||typeof c!="object"?[]:cn(c[a])}async function ut(t,s,a,l){let i={uuid:s},c=await t.getNoteContent(i),o=ke(c,G),b={...Te(o)||{},[a]:l},v=pt(b);o===null&&await t.insertNoteContent(i,`

# ${G}

`,{atEnd:!0});let A=pn(c,v);if(A!==null){await t.replaceNoteContent(i,A);return}await t.replaceNoteContent(i,v,{section:{heading:{text:G,level:1}}})}async function ft(t,s,a){let l={uuid:s},i=await t.getNoteContent(l),c=ke(i,G);if(c===null)return;let o=Te(c)||{};if(!(a in o))return;let h={...o};delete h[a],await t.replaceNoteContent(l,pt(h),{section:{heading:{text:G,level:1}}})}function Ae(t,s){let a=/^#\s+(.*)$/,l=t.findIndex(c=>{let o=c.match(a);return o&&o[1].trim()===s});if(l===-1)return null;let i=t.length;for(let c=l+1;c<t.length;c++)if(/^#\s+/.test(t[c])){i=c;break}return{start:l,end:i}}function ke(t,s){if(!t)return null;let a=t.split(`
`),l=Ae(a,s);return l?a.slice(l.start+1,l.end).join(`
`).trim():null}function hn(t){if(!t)return"";let s=t,a=s.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return a&&(s=s.replace(a[0],"")),s=s.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),s=s.replace(ht,""),s.trim()}function gt(t,s){let a=(t||"").split(`
`),l=Ae(a,G);if(!l)return null;let i=a.slice(0,l.start).join(`
`).replace(/\s+$/,""),c=a.slice(l.start).join(`
`);return`${i?i+`

`:""}${s}

${c}`}function pn(t,s){let a=(t||"").split(`
`),l=Ae(a,G);if(!l)return null;let i=hn(a.slice(l.start+1,l.end).join(`
`).trim());if(!i)return null;let c=a.slice(0,l.start).join(`
`).replace(/\s+$/,""),o=a.slice(l.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${i}

${a[l.start]}

${s}${o?`

`+o:""}`}function B(t,s){return s.noteUUID||t.context.noteUUID}async function mt(t,s,a){try{let l=await t.getNoteAttachments({uuid:s}),i=Array.isArray(l)&&l.find(c=>c&&c.uuid===a);return i?i.name:""}catch{return""}}async function ge(t,s,a,l){let i=await fe(t,s,a),c=l(i);return c!==i&&await ut(t,s,a,c),{highlights:c}}function vt(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let s=t.trim();if(!s.startsWith("{"))return{action:s};try{return JSON.parse(s)}catch{return{action:s}}}async function wt(t,s){return JSON.stringify(await un(t,vt(s)))}async function un(t,s){let a=vt(s);switch(a.action){case"getPdfUrl":{let l=a.attachmentUUID;if(!l)return{error:"No attachment specified for this viewer."};try{return{url:await Qe(t,l),name:await mt(t,B(t,a),l)}}catch(i){return{error:`Could not load the PDF: ${i.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return{highlights:await fe(t,B(t,a),a.attachmentUUID)}}catch(l){return{error:`Could not load highlights: ${l.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let l=ue(a.highlight||{});return await ge(t,B(t,a),a.attachmentUUID,i=>i.concat([l]))}catch(l){return{error:`Could not save the highlight: ${l.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ge(t,B(t,a),a.attachmentUUID,l=>Se(l,a.id,i=>dt(i,a.color)))}catch(l){return{error:`Could not change the highlight color: ${l.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ge(t,B(t,a),a.attachmentUUID,l=>Se(l,a.id,i=>lt(i,a.note)))}catch(l){return{error:`Could not save the note: ${l.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await ge(t,B(t,a),a.attachmentUUID,l=>ct(l,a.id))}catch(l){return{error:`Could not remove the highlight: ${l.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{let l={uuid:B(t,a)},i=await t.getNoteContent(l),c=gt(i,a.content);return c===null?await t.insertNoteContent(l,`
`+a.content+`
`,{atEnd:!0}):await t.replaceNoteContent(l,c),{ok:!0}}catch(l){return{error:`Could not add this to the note: ${l.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=B(t,a),i=await t.getNoteContent({uuid:l}),c=he(i,a.pluginUUID,a.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:l},c),await ft(t,l,a.attachmentUUID),{ok:!0})}catch(l){return{error:`Could not remove this viewer: ${l.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let l=B(t,a),i=await mt(t,l,a.attachmentUUID);try{let c=await fe(t,l,a.attachmentUUID);return{name:i,count:c.length}}catch{return{name:i,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let l=B(t,a),i=await t.getNoteContent({uuid:l}),c=nt(i,a.pluginUUID,a.attachmentUUID,a.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:l},c),{ok:!0})}catch(l){return{error:`Could not resize this viewer: ${l.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let l=await t.findNote({name:a.noteName}),i=l?l.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:i},a.content||""),{ok:!0,noteUUID:i}}catch(l){return{error:`Could not export highlights: ${l.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}function Ie(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function s(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function a(u,f){var w=Math.pow(10,f===void 0?2:f),x=function(C){return Math.round(C*w)/w};return{x:x(u.x),y:x(u.y),width:x(u.width),height:x(u.height)}}function l(u){return u.width>.01&&u.height>.01}function i(u,f,w){for(var x=String(u??""),C=Math.max(0,f===void 0?0:f),N=Math.min(x.length,w===void 0?x.length:w),k=function(O){return O===""||/\s/.test(O)},D=[],P=C;P<N;){for(;P<N&&k(x.charAt(P));)P++;if(P>=N)break;for(var $=P;P<N&&!k(x.charAt(P));)P++;D.push({start:$,end:P})}return D}function c(u){for(var f=1/0,w=1/0,x=-1/0,C=-1/0,N=0;N<(u?u.length:0);N++){var k=u[N];l(k)&&(f=Math.min(f,k.left),w=Math.min(w,k.top),x=Math.max(x,k.left+k.width),C=Math.max(C,k.top+k.height))}return isFinite(f)?{left:f,top:w,width:x-f,height:C-w}:null}function o(u,f,w){for(var x=[],C=0;C<u.length;C++){var N=t(u[C],f);if(l(N)){var k=w(N.x,N.y),D=w(N.x+N.width,N.y+N.height),P=a(s(k,D));l(P)&&x.push(P)}}return x}function h(u,f){var w=f(u.x,u.y),x=f(u.x+u.width,u.y+u.height);return s(w,x)}function b(u,f,w){var x=f.right-f.left,C=f.bottom-f.top;if(x<=0||C<=0)return null;var N=u.x2-u.x1,k=u.y2-u.y1,D=u.x1+(w.left-f.left)/x*N,P=u.x2-(f.right-w.right)/x*N,$=u.y1+(w.bottom-f.bottom)/C*k,O=u.y2-(f.top-w.top)/C*k;return{x:D,y:$,width:P-D,height:O-$}}function v(u,f){var w=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return w>.5*Math.min(u.height,f.height)}function A(u,f){var w=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var x=u.slice().sort(function(j,X){return X.y-j.y||j.x-X.x}),C=[],N=0;N<x.length;N++){for(var k=!1,D=0;D<C.length;D++)if(v(C[D][0],x[N])){C[D].push(x[N]),k=!0;break}k||C.push([x[N]])}for(var P=[],$=0;$<C.length;$++){for(var O=C[$].slice().sort(function(j,X){return j.x-X.x}),H=null,J=0;J<O.length;J++){var F=O[J];if(H===null){H={x:F.x,y:F.y,width:F.width,height:F.height};continue}var ae=F.x-(H.x+H.width);if(ae<=w*Math.max(H.height,F.height)){var ee=Math.max(H.x+H.width,F.x+F.width),me=Math.max(H.y+H.height,F.y+F.height);H.x=Math.min(H.x,F.x),H.y=Math.min(H.y,F.y),H.width=ee-H.x,H.height=me-H.y}else P.push(H),H={x:F.x,y:F.y,width:F.width,height:F.height}}H!==null&&P.push(H)}return P.map(function(j){return a(j)})}function S(u,f,w,x){var C=x===void 0?0:x;return f>=u.x-C&&f<=u.x+u.width+C&&w>=u.y-C&&w<=u.y+u.height+C}function y(u,f,w,x,C){for(var N=u||[],k=N.length-1;k>=0;k--){var D=N[k];if(!(!D||D.page!==f||!D.rects)){for(var P=0;P<D.rects.length;P++)if(S(D.rects[P],w,x,C===void 0?1:C))return D}}return null}function E(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:s,roundRect:a,isVisibleRect:l,textTokenRanges:i,unionClientRects:c,clientRectsToPdfRects:o,pdfRectToViewportRect:h,itemRelativeRect:b,mergeLineRects:A,rectContainsPoint:S,hitTestHighlights:y,normalizeQuoteText:E}}var z=Ie(),Wn=z.clientRectToLocal,Jn=z.rectFromCorners,Xn=z.roundRect,Yn=z.isVisibleRect,Zn=z.textTokenRanges,Qn=z.unionClientRects,Kn=z.clientRectsToPdfRects,eo=z.pdfRectToViewportRect,to=z.itemRelativeRect,no=z.mergeLineRects,oo=z.rectContainsPoint,ao=z.hitTestHighlights,ro=z.normalizeQuoteText;function Pe(){var t=[.957,.871,.424];function s(c,o,h,b,v){var A=o.context.register(o.context.obj({Type:c.PDFName.of("ExtGState"),BM:c.PDFName.of("Multiply"),ca:c.PDFNumber.of(.4)})),S=[c.pushGraphicsState(),c.setGraphicsState("GS0")];S.push(c.setFillingColor(c.rgb(b[0],b[1],b[2])));for(var y=0;y<h.length;y++){var E=h[y];S.push(c.moveTo(E.x,E.y)),S.push(c.lineTo(E.x,E.y+E.height)),S.push(c.lineTo(E.x+E.width,E.y+E.height)),S.push(c.lineTo(E.x+E.width,E.y)),S.push(c.closePath())}S.push(c.fill()),S.push(c.popGraphicsState());var u=o.context.formXObject(S,{BBox:v,Resources:{ExtGState:{GS0:A}}});return o.context.register(u)}function a(c,o,h,b){for(var v=h.rects,A=[],S=v[0].x,y=v[0].y,E=v[0].x+v[0].width,u=v[0].y+v[0].height,f=0;f<v.length;f++){var w=v[f],x=w.x,C=w.x+w.width,N=w.y,k=w.y+w.height;A.push(x,k,C,k,x,N,C,N),S=Math.min(S,x),y=Math.min(y,N),E=Math.max(E,C),u=Math.max(u,k)}var D=o.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Highlight"),Rect:o.context.obj([S,y,E,u]),QuadPoints:o.context.obj(A),C:o.context.obj(b),F:c.PDFNumber.of(4),T:c.PDFString.of("PDF Annotator"),M:c.PDFString.of(new Date().toISOString()),CA:c.PDFNumber.of(.4)});h.note&&D.set(c.PDFName.of("Contents"),c.PDFString.of(h.note));var P=s(c,o,v,b,[S,y,E,u]);D.set(c.PDFName.of("AP"),o.context.obj({N:P}));var $=o.context.register(D),O=[$];if(h.note){var H=o.context.register(o.context.obj({Type:c.PDFName.of("Annot"),Subtype:c.PDFName.of("Popup"),Rect:o.context.obj([E+8,y-60,E+208,y+12]),Parent:$,Open:!1}));D.set(c.PDFName.of("Popup"),H),O.push(H)}return O}function l(c,o,h){var b=o.node.get(c.PDFName.of("Annots"));if(b instanceof c.PDFArray)for(var v=0;v<h.length;v++)b.push(h[v]);else o.node.set(c.PDFName.of("Annots"),o.doc.context.obj(h))}async function i(c,o,h,b){for(var v=await c.PDFDocument.load(o),A=v.getPages(),S=h||[],y=0;y<S.length;y++){var E=S[y];if(!(!E||!E.rects||!E.rects.length)){var u=A[E.page-1];if(u){var f=b&&b[E.color]||t,w=a(c,v,E,f);l(c,u,w)}}}return v.save()}return{writeHighlightsIntoPdf:i,buildHighlightAnnotation:a,appendAnnotationRefs:l}}var De=Pe(),so=De.writeHighlightsIntoPdf,lo=De.buildHighlightAnnotation,co=De.appendAnnotationRefs;function Ue(){function t(o){return String(o??"").replace(/\]/g,"\\]")}function s(o,h,b,v,A){var S=new URLSearchParams;h&&S.set("att",h),Number.isFinite(b)&&b>=1&&S.set("page",String(Math.floor(b))),v&&S.set("hl",v),A&&S.set("note",A);var y=S.toString();return"plugin://"+o+(y?"?"+y:"")}function a(o,h){return String(o??"").split(/\r?\n/).map(function(b){return(h+" "+b).replace(/[ \t]+$/,"")})}function l(o,h,b,v,A,S){var y=s(h,b,v.page,v.id,S),E=t(o||"PDF"),u='==\u25CF<!-- {"cycleColor":"'+A+'"} -->==',f=u+" ["+E+"]("+y+")",w=[f].concat(a(v.quoteText,"> >"));return v.note&&(w.push(">"),w=w.concat(a(v.note,">"))),w.join(`
`)}function i(o){return o.slice().sort(function(h,b){if(h.page!==b.page)return h.page-b.page;var v=h.rects&&h.rects[0]?h.rects[0].y:0,A=b.rects&&b.rects[0]?b.rects[0].y:0;return A-v})}function c(o,h,b,v,A,S,y){var E=S&&S.length?S:null,u=(v||[]).filter(function(x){return x&&(!E||E.indexOf(x.color)!==-1)}),f=i(u),w=f.map(function(x){var C=A?A[x.color]:void 0;return l(o,h,b,x,C,y)});return w.join(`

`)}return{buildDeepLink:s,buildHighlightBlock:l,buildExportAllContent:c}}var He=Ue(),po=He.buildDeepLink,uo=He.buildHighlightBlock,fo=He.buildExportAllContent;function xt(){var t=window.__PDFA_CONFIG||{},s=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},l=window.__PDFA_EXPORT||{},i={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(o.attachmentName=e,i.name&&(i.name.textContent=e),i.collapsedName&&(i.collapsedName.textContent=e))}var o={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,n){i.status.textContent=e||"",i.status.style.display=e?"block":"none",i.status.className=n?"pdfa-status pdfa-error":"pdfa-status"}function b(e){var n=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(r,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");r(window.callAmplenotePlugin(JSON.stringify(n)))}catch(p){d(p)}}).then(function(r){if(r&&typeof r=="object")return r;if(typeof r!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(r)}catch{throw new Error("Unreadable reply from the plugin: "+String(r).slice(0,120))}})}function v(){return t.colors||[]}function A(e){for(var n=v(),r=0;r<n.length;r++)if(n[r].id===e)return n[r].hex;return n.length?n[0].hex:"#F4DE6C"}function S(e){for(var n=0;n<o.highlights.length;n++)if(o.highlights[n].id===e)return o.highlights[n];return null}function y(e,n,r){var d=document.createElement("button");return d.className="pdfa-btn"+(n?" "+n:""),d.textContent=e,d.onclick=function(p){p.stopPropagation(),r()},d}function E(e,n,r,d){var p=document.createElement("button");return p.className="pdfa-color",p.dataset.color=e.id,p.style.background=e.hex,p.title=d+" "+e.label,p.setAttribute("aria-label",d+" "+e.label),p.setAttribute("aria-pressed",String(!!n)),p.onclick=function(m){m.stopPropagation(),r(e.id)},p}function u(){for(var e=v(),n=0;n<e.length;n++)i.colors.appendChild(E(e[n],e[n].id===o.activeColorId,function(r){o.activeColorId=r,f(),o.pendingSelection&&Le(o.pendingSelection,r)},"Highlight"))}function f(){for(var e=i.colors.querySelectorAll(".pdfa-color"),n=0;n<e.length;n++)e[n].setAttribute("aria-pressed",String(e[n].dataset.color===o.activeColorId))}function w(){for(var e=[],n=1;n<=o.pageCount;n++)(function(r){e.push(o.doc.getPage(r).then(function(d){o.viewports[r]=d.getViewport({scale:o.scale})}))})(n);return Promise.all(e)}function x(e){var n=o.viewports[e],r=document.createElement("div");return r.className="pdfa-page",r.dataset.page=String(e),r.style.width=n.width+"px",r.style.height=n.height+"px",r}function C(e,n){if(o.rendered[n]||o.renderingPage[n])return Promise.resolve();o.renderingPage[n]=!0;var r=o.viewports[n],d=document.createElement("canvas"),p=window.devicePixelRatio||1;d.width=Math.floor(r.width*p),d.height=Math.floor(r.height*p),d.style.width=r.width+"px",d.style.height=r.height+"px",e.appendChild(d);var m=document.createElement("div");m.className="pdfa-highlights",e.appendChild(m);var g=document.createElement("div");g.className="textLayer",g.style.width=r.width+"px",g.style.height=r.height+"px",g.style.setProperty("--scale-factor",String(o.scale)),e.appendChild(g);var T=d.getContext("2d");T.scale(p,p);var R=null;return o.doc.getPage(n).then(function(U){return R=U,U.render({canvasContext:T,viewport:r}).promise}).then(function(){return R.getTextContent()}).then(function(U){var I=[];return window.pdfjsLib.renderTextLayer({textContent:U,container:g,viewport:r,textDivs:I}).promise.then(function(){o.textSpans+=I.length;for(var L=0;L<I.length;L++)I[L].__pdfaItem=U.items[L];o.rendered[n]=!0,o.renderingPage[n]=!1,$(n),k()})}).catch(function(U){o.renderingPage[n]=!1,h("Failed to render page "+n+": "+(U.message||U),!0)})}function N(){var e=V();if(!e||!o.doc)return Promise.resolve();for(var n=e.getBoundingClientRect(),r=e.clientHeight,d=i.pages.querySelectorAll(".pdfa-page"),p=[],m=0;m<d.length;m++){var g=d[m],T=Number(g.dataset.page);if(!(o.rendered[T]||o.renderingPage[T])){var R=g.getBoundingClientRect(),U=R.top-n.top,I=R.bottom-n.top;I<-r||U>e.clientHeight+r||p.push(C(g,T))}}return Promise.all(p)}function k(){var e=0;for(var n in o.rendered)o.rendered[n]&&e++;if(e){var r=o.textSpans===0;h(r?"No selectable text found - this PDF may be a scan.":"",r)}}function D(){if(o.rendering)return Promise.resolve();o.rendering=!0,M(!0),h("Rendering...");var e=V(),n=e?e.scrollHeight-e.clientHeight:0,r=n>0?e.scrollTop/n:0;return i.pages.innerHTML="",o.viewports={},o.rendered={},o.renderingPage={},o.textSpans=0,w().then(function(){for(var d=1;d<=o.pageCount;d++)i.pages.appendChild(x(d));if(e){var p=e.scrollHeight-e.clientHeight;e.scrollTop=r*(p>0?p:0)}o.rendering=!1,te(),ye(),N()}).catch(function(d){o.rendering=!1,h("Failed to render: "+(d.message||d),!0)})}function P(e){return function(n,r){return e.convertToViewportPoint(n,r)}}function $(e){for(var n=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",r=i.pages.querySelectorAll(n),d=0;d<r.length;d++){var p=r[d],m=Number(p.dataset.page),g=p.querySelector(".pdfa-highlights"),T=o.viewports[m];if(!(!g||!T)){g.innerHTML="";for(var R=P(T),U=0;U<o.highlights.length;U++){var I=o.highlights[U];if(!(!I||I.page!==m||!I.rects||!I.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=I.id||"";for(var W=0;W<I.rects.length;W++){var Q=s.pdfRectToViewportRect(I.rects[W],R),_=document.createElement("div");_.className="pdfa-hl",_.style.left=Q.x+"px",_.style.top=Q.y+"px",_.style.width=Q.width+"px",_.style.height=Q.height+"px",_.style.background=A(I.color),L.appendChild(_)}g.appendChild(L)}}}}}function O(){$(),J(),i.count.textContent=String(o.highlights.length)}function H(){return o.highlights.slice().sort(function(e,n){return e.page!==n.page?e.page-n.page:(n.rects[0]?n.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function J(){i.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var n=document.createElement("span");n.textContent="Highlights",e.appendChild(n),e.appendChild(y("Close","",function(){ae(!1)})),i.panel.appendChild(e);var r=H();if(!r.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",i.panel.appendChild(d);return}for(var p=0;p<r.length;p++)i.panel.appendChild(F(r[p]))}function F(e){var n=document.createElement("div");n.className="pdfa-hl-row",n.dataset.id=e.id||"",n.title="Jump to this highlight";var r=document.createElement("span");r.className="pdfa-chip",r.style.background=A(e.color),n.appendChild(r);var d=document.createElement("div"),p=document.createElement("div");p.className="pdfa-hl-page",p.textContent="Page "+e.page,d.appendChild(p);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(m),e.note){var g=document.createElement("div");g.className="pdfa-hl-note",g.textContent=e.note,d.appendChild(g)}return n.appendChild(d),n.onclick=function(){Oe(e)},n}function ae(e){var n=e===void 0?!i.panel.classList.contains("pdfa-open"):e;i.panel.classList.toggle("pdfa-open",n),i.listToggle.setAttribute("aria-pressed",String(n)),n&&J()}function ee(e){for(var n=e&&e.nodeType===1?e:e&&e.parentElement;n;){if(n.classList&&n.classList.contains("textLayer"))return n;n=n.parentElement}return null}function me(e,n){for(var r=[],d=[],p=null,m=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),g;g=m.nextNode();)if(e.intersectsNode(g)){var T=g.nodeValue||"",R=g===e.startContainer?e.startOffset:0,U=g===e.endContainer?e.endOffset:T.length,I=g.parentElement,L=I&&I.__pdfaItem;if(L)for(var W={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},Q=I.getBoundingClientRect(),_=s.textTokenRanges(T,R,U),K=0;K<_.length;K++){var Ce=document.createRange();Ce.setStart(g,_[K].start),Ce.setEnd(g,_[K].end);var q=s.unionClientRects(Ce.getClientRects());if(q){var Ve={left:q.left,top:q.top,width:q.width,height:q.height,right:q.left+q.width,bottom:q.top+q.height},We=s.itemRelativeRect(W,Q,Ve);We&&(r.push(We),d.push(T.slice(_[K].start,_[K].end)),p=Ve)}}}return{rects:r,text:d.join(" "),lastCssRect:p}}function j(e){if(o.pendingSelection=e,o.lastCapturedText=e&&e.rawText||"",!e){i.hint.textContent="",i.hint.style.display="none";return}i.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",i.hint.style.display="inline"}function X(e){if(!o.noteEditing){var n=window.getSelection();if(!n||n.isCollapsed||n.rangeCount===0){j(null),M();return}var r=n.getRangeAt(0),d=ee(r.startContainer);if(!d)return j(null);var p=d.parentElement;if(!p||!p.dataset||!p.dataset.page)return j(null);var m=Number(p.dataset.page);if(!o.rendered[m])return j(null);var g=ee(r.endContainer)!==d,T=me(r,d),R=s.mergeLineRects(T.rects);if(!R.length)return j(null);var U=T.lastCssRect||p.getBoundingClientRect(),I=e&&e.clientX?e.clientX:U.left+U.width/2,L=e&&e.clientY?e.clientY:U.top+U.height,W={page:m,rects:R,quoteText:s.normalizeQuoteText(T.text),spilled:g,anchorX:I,anchorY:L,rawText:String(n)};j(W),Tt(W)}}var Ct=300,Y=null;function Et(){o.noteEditing||(Y&&clearTimeout(Y),Y=setTimeout(Re,Ct))}function Re(){if(Y=null,!o.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||ee(e.getRangeAt(0).startContainer)&&String(e)!==o.lastCapturedText&&X(null)}}function re(e,n){var r=o.highlights;return o.highlights=e,O(),b(n).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return o.highlights=d.highlights||e,O(),h(""),!0}).catch(function(d){return o.highlights=r,O(),h(d.message||String(d),!0),!1})}function Le(e,n){var r={id:null,page:e.page,color:n,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,p=e.anchorY;j(null),M(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),re(o.highlights.concat([r]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:r}).then(function(g){if(g){var T=o.highlights[o.highlights.length-1];T&&T.id&&we(T,d,p,!0)}})}function Nt(e,n){M(!0),re(o.highlights.map(function(r){return r.id===e?Object.assign({},r,{color:n}):r}),{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,id:e,color:n})}function St(e){M(!0),re(o.highlights.filter(function(n){return n.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,id:e})}function ve(e,n){var r=String(n??"").trim();o.noteEditing=null,M(!0),re(o.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:r||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:r})}function Z(e,n,r,d){i.popover.innerHTML="",i.popover.classList.toggle("pdfa-editing",d==="editing"),i.popover.classList.toggle("pdfa-exporting",d==="exporting"),i.popover.classList.toggle("pdfa-menu",d==="menu");for(var p=0;p<e.length;p++)i.popover.appendChild(e[p]);i.popover.classList.add("pdfa-open");var m=i.popover.offsetWidth,g=i.popover.offsetHeight,T=Math.max(4,Math.min(n-m/2,window.innerWidth-m-4)),R=r+12;R+g>window.innerHeight-4&&(R=Math.max(4,r-g-12)),i.popover.style.left=T+"px",i.popover.style.top=R+"px"}function M(e){o.noteEditing&&!e||(o.noteEditing=null,i.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),i.popover.innerHTML="")}function Tt(e){for(var n=v(),r=[],d=0;d<n.length;d++)r.push(E(n[d],n[d].id===o.activeColorId,function(p){o.activeColorId=p,f(),Le(e,p)},"Highlight"));Z(r,e.anchorX,e.anchorY)}function we(e,n,r,d){for(var p=v(),m=[],g=0;g<p.length;g++)m.push(E(p[g],p[g].id===e.color,function(R){Nt(e.id,R)},"Change to"));var T=!!e.note;m.push(y(T?"Edit note":"Add note",d&&!T?"pdfa-btn-primary":"",function(){kt(e,n,r)})),m.push(y("Copy","",function(){$t(e)})),m.push(y("Send to note","",function(){jt(e)})),m.push(y("Remove","pdfa-remove",function(){St(e.id)})),Z(m,n,r)}function At(e,n){for(var r=v(),d={},p=0;p<r.length;p++)d[r[p].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var g=document.createElement("div");g.className="pdfa-export-colors";for(var T=0;T<r.length;T++)(function(U){var I=E(U,!0,function(L){d[L]=!d[L],I.setAttribute("aria-pressed",String(d[L]))},"Toggle");g.appendChild(I)})(r[T]);var R=document.createElement("div");R.className="pdfa-note-actions",R.appendChild(y("Create / update note","pdfa-btn-primary",function(){for(var U=[],I=0;I<r.length;I++)d[r[I].id]&&U.push(r[I].id);_t(U.length===r.length?null:U)})),Z([m,g,R],e,n,"exporting")}function kt(e,n,r){o.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var p=document.createElement("div");p.className="pdfa-note-actions",e.note&&p.appendChild(y("Delete note","",function(){ve(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",p.appendChild(m),p.appendChild(y("Cancel","",function(){Me(e,n,r)})),p.appendChild(y("Save","pdfa-btn-primary",function(){ve(e.id,d.value)})),d.onkeydown=function(g){g.key==="Enter"&&(g.ctrlKey||g.metaKey)?(g.preventDefault(),g.stopPropagation(),ve(e.id,d.value)):g.key==="Escape"&&(g.preventDefault(),g.stopPropagation(),Me(e,n,r))},Z([d,p],n,r,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function Me(e,n,r){o.noteEditing=null;var d=S(e.id)||e;we(d,n,r)}function It(e){if(!o.noteEditing){var n=window.getSelection();if(!(n&&!n.isCollapsed)){for(var r=e.target,d=null;r&&r!==i.pages;){if(r.classList&&r.classList.contains("pdfa-page")){d=r;break}r=r.parentElement}if(!d)return M();var p=Number(d.dataset.page),m=o.viewports[p];if(!m)return M();var g=d.getBoundingClientRect(),T=m.convertToPdfPoint(e.clientX-g.left,e.clientY-g.top),R=s.hitTestHighlights(o.highlights,p,T[0],T[1],1);R&&R.id?we(R,e.clientX,e.clientY):M()}}}function te(){i.pageLabel.textContent=o.current+" / "+o.pageCount,i.zoomLabel.textContent=Math.round(o.scale*100)+"%"}function V(){return i.root.querySelector(".pdfa-scroll")}function Fe(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e+'"]');n&&C(n,e)}function xe(e){var n=Math.min(Math.max(1,e),o.pageCount),r=i.pages.querySelector('.pdfa-page[data-page="'+n+'"]');Fe(n);var d=V();r&&d&&(d.scrollTop+=r.getBoundingClientRect().top-d.getBoundingClientRect().top),N(),o.current=n,te()}function Oe(e){var n=i.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),r=o.viewports[e.page];if(!(!n||!r||!e.rects||!e.rects.length)){var d=s.pdfRectToViewportRect(e.rects[0],P(r)),p=V(),m=n.getBoundingClientRect().top+d.y;p.scrollTop+=m-p.getBoundingClientRect().top-p.clientHeight/3,Fe(e.page),N(),o.current=e.page,te()}}function Pt(){try{i.root.setAttribute("tabindex","-1"),i.root.focus()}catch{}}function Dt(e){if(!(!e||!e.id)){var n=i.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');n&&(n.classList.add("pdfa-hl-flash"),setTimeout(function(){n.classList.remove("pdfa-hl-flash")},2600))}}function be(e){return o.scale=Math.min(Math.max(.4,e),4),D()}function Ut(){return o.doc?o.doc.getPage(1).then(function(e){var n=V();if(n){var r=window.getComputedStyle(n),d=n.clientWidth-(parseFloat(r.paddingLeft)||0)-(parseFloat(r.paddingRight)||0),p=e.getViewport({scale:1}).width;if(!(!(d>0)||!(p>0))){var m=Math.max(.4,d/p);m<o.scale&&(o.scale=m,te())}}}).catch(function(){}):Promise.resolve()}function $e(e){var n=V();n&&(n.scrollTop+=e*Math.max(80,n.clientHeight*.85),ye(),N())}function ye(){var e=V();if(!(!e||!i.scrollUp)){var n=e.scrollHeight-e.clientHeight;i.scrollUp.disabled=e.scrollTop<=1,i.scrollDown.disabled=e.scrollTop>=n-1}}function Ht(){ye(),N(),M();for(var e=i.pages.querySelectorAll(".pdfa-page"),n=o.current,r=1/0,d=0;d<e.length;d++){var p=Math.abs(e[d].getBoundingClientRect().top-60);p<r&&(r=p,n=Number(e[d].dataset.page))}n!==o.current&&(o.current=n,te())}function Rt(){return new Promise(function(e,n){if(window.pdfjsLib)return e(window.pdfjsLib);var r=document.createElement("script");r.src=t.pdfJsSrc,r.onload=function(){window.pdfjsLib?e(window.pdfjsLib):n(new Error("PDF.js loaded but did not register itself."))},r.onerror=function(){n(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(r)})}function Lt(){return new Promise(function(e,n){if(window.PDFLib)return e(window.PDFLib);var r=document.createElement("script");r.src=t.pdfLibSrc,r.onload=function(){window.PDFLib?e(window.PDFLib):n(new Error("pdf-lib loaded but did not register itself."))},r.onerror=function(){n(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(r)})}function Mt(){for(var e={},n=v(),r=0;r<n.length;r++)n[r].rgb&&(e[n[r].id]=n[r].rgb);return e}function Ft(){var e=(o.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function je(){for(var e={},n=v(),r=0;r<n.length;r++)n[r].cycleIndex!==void 0&&(e[n[r].id]=n[r].cycleIndex);return e}function _e(){var e=(o.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function ze(e){return l.buildHighlightBlock(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,je()[e.color],t.noteUUID)}function Ot(e){return navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(e):new Promise(function(n,r){var d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select();var p=!1;try{p=document.execCommand("copy")}catch{p=!1}document.body.removeChild(d),p?n():r(new Error("Clipboard access is unavailable here."))})}function $t(e){M(!0),Ot(ze(e)).then(function(){h("Highlight copied - paste it into any note.")}).catch(function(n){h("Could not copy: "+(n.message||n),!0)})}function jt(e){M(!0),b({action:"sendToNote",content:ze(e)}).then(function(n){if(!n||n.error)throw new Error(n&&n.error||"Could not send this to the note.");h("Sent to the bottom of this note.")}).catch(function(n){h(n.message||String(n),!0)})}function _t(e){M(!0);var n=l.buildExportAllContent(o.attachmentName,t.pluginUUID,t.attachmentUUID,o.highlights,je(),e,t.noteUUID);if(!n){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}b({action:"exportAll",noteName:_e(),content:n}).then(function(r){if(!r||r.error)throw new Error(r&&r.error||"Could not export highlights.");h('Exported to "'+_e()+'".')}).catch(function(r){h(r.message||String(r),!0)})}function Be(e,n){var r=document.createElement("div");r.className="pdfa-menu-name",r.textContent=o.attachmentName||"PDF Annotator",r.title=r.textContent;var d=[r];window.matchMedia&&window.matchMedia("(max-width: 520px)").matches&&d.push(zt(e,n)),d.push(y("Collapse","",function(){M(!0),Wt()}),y("Download","",function(){M(!0),Gt()}),y("Export...","",function(){At(e,n)}),y("Remove viewer...","pdfa-remove",function(){Bt(e,n)})),Z(d,e,n,"menu")}function zt(e,n){var r=document.createElement("div");r.className="pdfa-menu-zoom";var d=document.createElement("span");d.className="pdfa-menu-zoom-label",d.textContent=Math.round(o.scale*100)+"%";var p=function(T){return function(){be(o.scale+T).then(function(){Be(e,n)})}},m=y("\u2212","",p(-.25)),g=y("+","",p(.25));return m.title="Zoom out",g.title="Zoom in",m.disabled=o.scale<=.4,g.disabled=o.scale>=4,r.appendChild(m),r.appendChild(d),r.appendChild(g),r}function Bt(e,n){var r=document.createElement("div");r.className="pdfa-export-hint",r.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(y("Cancel","",function(){M(!0)}));var p=document.createElement("span");p.className="pdfa-spacer",d.appendChild(p),d.appendChild(y("Remove","pdfa-remove",qt)),Z([r,d],e,n,"exporting")}function qt(){M(!0),h("Removing this viewer..."),b({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function Gt(){o.pdfBytes&&(h("Preparing the download..."),Lt().then(function(e){return a.writeHighlightsIntoPdf(e,o.pdfBytes,o.highlights,Mt())}).then(function(e){var n=new Blob([e],{type:"application/pdf"}),r=URL.createObjectURL(n),d=document.createElement("a");d.href=r,d.download=Ft(),document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(r)},4e3),h("")}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function Vt(){return b({action:"loadHighlights",attachmentUUID:t.attachmentUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");o.highlights=e.highlights||[]}).catch(function(e){o.highlights=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function Wt(){var e=o.highlights.length;i.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",i.root.classList.add("pdfa-collapsed-mode"),qe(!0)}function qe(e){b({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Jt(){i.root.classList.remove("pdfa-collapsed-mode"),o.doc||Ge(),qe(!1)}function Ge(){h("Loading PDF..."),(t.highlightId||t.page)&&Pt(),Rt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,b({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return o.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return o.doc=e,o.pageCount=e.numPages,Vt()}).then(function(){return Ut()}).then(function(){return D()}).then(function(){O();var e=t.highlightId?S(t.highlightId):null;e?(Oe(e),Dt(e)):t.page&&xe(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){xe(o.current-1)},document.getElementById("pdfa-next").onclick=function(){xe(o.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){be(o.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){be(o.scale-.25)},i.scrollUp.onclick=function(){$e(-1)},i.scrollDown.onclick=function(){$e(1)},i.listToggle.onclick=function(){ae()},i.more.onclick=function(e){Be(e.clientX,e.clientY)},V().addEventListener("scroll",Ht),i.pages.addEventListener("mouseup",X),i.pages.addEventListener("click",It),document.addEventListener("selectionchange",Et),i.pages.addEventListener("touchend",function(){Y&&clearTimeout(Y),Y=null,Re()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!o.noteEditing&&M()}),document.addEventListener("mousedown",function(e){i.popover.classList.contains("pdfa-open")&&(i.popover.contains(e.target)||M())}),u(),J(),i.root.querySelector(".pdfa-collapsed").onclick=Jt,t.collapsed?b({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var n=e.count||0;i.collapsedCount.textContent=n?n+(n===1?" highlight":" highlights"):""}}).catch(function(){}):Ge()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function fn(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function gn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var mn=`
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
`,bt={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function yt({attachmentUUID:t,attachmentName:s="",page:a=null,highlightId:l=null,lightDarkMode:i="light",pluginUUID:c=null,noteUUID:o=null,collapsed:h=!1}={}){let b=bt[i]||bt.light,v={attachmentUUID:t,page:a,highlightId:l,pluginUUID:c,noteUUID:o,pdfJsSrc:ne.pdfJs,workerSrc:ne.pdfJsWorker,pdfLibSrc:ne.pdfLib,colors:ie.map(A=>({id:A.id,label:A.label,hex:A.hex,rgb:A.rgb,cycleIndex:A.cycleIndex})),defaultColorId:se,collapsed:h,attachmentName:s};return`<link rel="stylesheet" href="${ne.pdfViewerCss}">
<style>:root{${b}}${mn}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${fn(s)}</span>
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
<script>window.__PDFA_CONFIG = ${gn(v)};
window.__PDFA_GEOM = (${Ie.toString()})();
window.__PDFA_ANNOTATIONS = (${Pe.toString()})();
window.__PDFA_EXPORT = (${Ue.toString()})();<\/script>
<script>(${xt.toString()})();<\/script>`}var vn={noteOption:{"Annotate PDF":async function(t,s){return ot(t,s,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,s){return at(t,s)}},insertText:async function(t){return rt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...s){return it(t,s[0])},renderEmbed:function(t,...s){let{attachmentUUID:a,page:l,highlightId:i,collapsed:c,attachmentName:o}=oe(s[0]);return a?yt({attachmentUUID:a,page:l,highlightId:i,collapsed:c,attachmentName:o,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...s){return wt(t,s[0])}},wn=vn;return en(xn);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
