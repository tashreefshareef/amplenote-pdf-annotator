(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var He=Object.defineProperty;var wn=Object.getOwnPropertyDescriptor;var bn=Object.getOwnPropertyNames;var xn=Object.prototype.hasOwnProperty;var yn=(t,l)=>{for(var n in l)He(t,n,{get:l[n],enumerable:!0})},Cn=(t,l,n,i)=>{if(l&&typeof l=="object"||typeof l=="function")for(let a of bn(l))!xn.call(t,a)&&a!==n&&He(t,a,{get:()=>l[a],enumerable:!(i=wn(l,a))||i.enumerable});return t};var En=t=>Cn(He({},"__esModule",{value:!0}),t);var jn={};yn(jn,{default:()=>Bn});var ce=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],he="yellow",_="PDF Annotator data",it="attachment://",st=1,lt=16,ne={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",robotoCss:"https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"},kn="https://plugins.amplenote.com/cors-proxy";function dt(t){let l=new URL(kn);return l.searchParams.set("apiurl",t),l.toString()}var In="application/pdf";function Nn(t){return Array.isArray(t)?t.filter(l=>l&&l.type===In&&l.uuid):[]}async function pe(t,l){let n=await t.getNoteAttachments({uuid:l}),i=Nn(n);if(i.length===0)return null;if(i.length===1)return i[0];let a=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:i.map(r=>({label:r.name,value:r.uuid})),value:i[0].uuid}]});if(a==null)return null;let d=Array.isArray(a)?a[0]:a;return i.find(r=>r.uuid===d)||null}async function ct(t,l){if(!l)throw new Error("fetchableAttachmentURL: attachmentUUID required");let n=await t.getAttachmentURL(l);if(!n)throw new Error(`No URL returned for attachment ${l}`);return dt(n)}function ht(t){return t?lt:st}function ie(t){let l={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return l;let n;try{n=new URLSearchParams(t.replace(/^\?/,""))}catch{return l}let i=d=>{let r=n.get(d);if(r===null||r.trim()==="")return null;let p=Number(r);return Number.isFinite(p)?p:null},a=i("page");return{attachmentUUID:n.get("att")||null,page:a!==null&&a>=1?Math.floor(a):null,x:i("x"),y:i("y"),highlightId:n.get("hl")||null,noteUUID:n.get("note")||null,collapsed:n.get("c")==="1",attachmentName:n.get("n")||""}}function pt({attachmentUUID:t,page:l,x:n,y:i,highlightId:a,collapsed:d,attachmentName:r}={}){let p=new URLSearchParams;return t&&p.set("att",t),d&&p.set("c","1"),r&&p.set("n",r),Number.isFinite(l)&&l>=1&&p.set("page",String(Math.floor(l))),Number.isFinite(n)&&p.set("x",String(n)),Number.isFinite(i)&&p.set("y",String(i)),a&&p.set("hl",a),p.toString()}function ue(t,l={},n=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");n===null&&(n=ht(l.collapsed));let i=pt(l);return`<object data="${i?`plugin://${t}?${i}`:`plugin://${t}`}" data-aspect-ratio="${n}" />`}function ut(t,l,n){if(!t||!l||!n)return null;let i=t.split(`
`),a=i.findIndex(r=>r.includes(`${it}${l}`));if(a===-1)return null;let d=i.slice();return i[a+1]===""?d.splice(a+2,0,n.trim(),""):d.splice(a+1,0,"",n.trim(),""),d.join(`
`)}function fe(t,l,n=null){return!t||!l||!t.includes(`plugin://${l}`)?!1:n?t.includes(`att=${n}`):!0}function ge(t,l,n){if(!t||!l||!n)return null;let i=t.split(`
`),a=`plugin://${l}`,d=i.findIndex(p=>p.includes(a)&&p.includes(`att=${n}`));if(d===-1)return null;let r=i.slice();return r.splice(d,1),r[d]===""&&r[d-1]===""&&r.splice(d,1),r.join(`
`)}function se(t,l,n,i={}){if(!t||!l||!n)return null;let a=t.split(`
`),d=`plugin://${l}`,r=a.findIndex(k=>k.includes(d)&&k.includes(`att=${n}`));if(r===-1)return null;let p=a[r],S=p.match(/data="(plugin:\/\/[^"]*)"/);if(!S)return null;let I=S[1],x=I.indexOf("?"),y=x===-1?"":I.slice(x+1),g={...ie(y),attachmentUUID:n,...i},u=pt(g),f=u?`plugin://${l}?${u}`:`plugin://${l}`,w=a.slice(),b=p.replace(S[0],`data="${f}"`),C=ht(g.collapsed),E=b.match(/data-aspect-ratio="[^"]*"/);return b=E?b.replace(E[0],`data-aspect-ratio="${C}"`):b.replace(/\s*\/>\s*$/,` data-aspect-ratio="${C}" />`),w[r]=b,w.join(`
`)}function ft(t,l,n,i){return se(t,l,n,{collapsed:!!i})}async function gt(t,l,n){let i=await pe(t,l);if(!i){let p=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(p)&&p.length>0)||!p.some(I=>I&&I.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let a=await t.getNoteContent({uuid:l});if(fe(a,n,i.uuid))return await t.alert(`"${i.name}" is already open in this note - scroll to the viewer.`),i.uuid;let d=ue(n,{attachmentUUID:i.uuid,attachmentName:i.name}),r=ut(a,i.uuid,d);return r!==null?(await t.replaceNoteContent({uuid:l},r),i.uuid):(await t.insertNoteContent({uuid:l},`
${d}
`,{atEnd:!0}),i.uuid)}var Sn="Raw markdown";function Un(t){let l=(String(t||"").match(/`+/g)||[]).reduce((n,i)=>Math.max(n,i.length),0);return"`".repeat(Math.max(3,l+1))}async function mt(t,l){let n=await t.getNoteContent({uuid:l});if(typeof n!="string"||n==="")return await t.alert("That note came back empty - nothing to dump."),null;let i=await t.getNoteAttachments({uuid:l}),a=(Array.isArray(i)?i:[]).map(p=>`- ${p&&p.name} | ${p&&p.type} | ${p&&p.uuid}`).join(`
`),d=Un(n),r=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:r},`# Attachments

${a||"- (none)"}

# ${Sn}

${d}
${n}
${d}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),r}async function vt(t,l,n){if(!l)return"";let i=await pe(t,l);if(!i){let d=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(d)&&d.length>0)||!d.some(p=>p&&p.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let a=await t.getNoteContent({uuid:l});return fe(a,n,i.uuid)?(await t.alert(`"${i.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${ue(n,{attachmentUUID:i.uuid,attachmentName:i.name})}
`}async function Tn(t,l,n,i){let a={uuid:l},d=ge(n,t.context.pluginUUID,i);if(d!==null)try{await t.replaceNoteContent(a,d)}catch{}try{await t.replaceNoteContent(a,n)}catch{await t.replaceNoteContent(a,n)}}async function wt(t,l){let{noteUUID:n,attachmentUUID:i,page:a,highlightId:d}=ie(l);if(!n){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let r=await t.getNoteContent({uuid:n}),p=se(r,t.context.pluginUUID,i,{page:a,highlightId:d,collapsed:!1});p!==null&&(t.context&&t.context.noteUUID===n?await Tn(t,n,p,i):await t.replaceNoteContent({uuid:n},p))}catch{}await t.navigate(`https://www.amplenote.com/notes/${n}`)}function me(t){if(!t)return null;let l=String(t).trim().toLowerCase();return ce.find(n=>n.id===l||n.hex.toLowerCase()===l)||null}function bt(){return me(he)}function An(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function ve({page:t,color:l,rects:n,quoteText:i,note:a=null,id:d=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(n)||n.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let p of n)if(![p.x,p.y,p.width,p.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(p)}`);let r=me(l)||bt();return{id:d||An(),page:t,color:r.id,rects:n.map(p=>({x:p.x,y:p.y,width:p.width,height:p.height})),quoteText:String(i||""),note:a?String(a):null}}function xt(t,l){let n=l==null?null:String(l).trim();return{...t,note:n||null}}function yt(t,l){let n=me(l);if(!n)throw new Error(`withColor: unknown color "${l}"`);return{...t,color:n.id}}function Ct(t,l){return(t||[]).filter(n=>n.id!==l)}function Pe(t,l,n){let i=!1,a=(t||[]).map(d=>d.id!==l?d:(i=!0,n(d)));return i?a:t}var Dn="json",Et="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function kt(t){let l=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${Et}
\`\`\`${Dn}
${l}
\`\`\``}function Re(t){if(!t)return null;let l=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),n=!l&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),i=(l?l[1]:n?n[1]:t).trim();if(!i)return null;try{return JSON.parse(i)}catch{return null}}function Hn(t){if(!Array.isArray(t))return[];let l=[];for(let n of t)try{l.push(ve(n))}catch{}return l}async function we(t,l,n){let i=await t.getNoteContent({uuid:l}),a=Me(i,_),d=Re(a);return!d||typeof d!="object"?[]:Hn(d[n])}async function It(t,l,n,i){let a={uuid:l},d=await t.getNoteContent(a),r=Me(d,_),S={...Re(r)||{},[n]:i},I=kt(S);r===null&&await t.insertNoteContent(a,`

# ${_}

`,{atEnd:!0});let x=Rn(d,I);if(x!==null){await t.replaceNoteContent(a,x);return}await t.replaceNoteContent(a,I,{section:{heading:{text:_,level:1}}})}async function Nt(t,l,n){let i={uuid:l},a=await t.getNoteContent(i),d=Me(a,_);if(d===null)return;let r=Re(d)||{};if(!(n in r))return;let p={...r};delete p[n],await t.replaceNoteContent(i,kt(p),{section:{heading:{text:_,level:1}}})}function Le(t,l){let n=/^#\s+(.*)$/,i=t.findIndex(d=>{let r=d.match(n);return r&&r[1].trim()===l});if(i===-1)return null;let a=t.length;for(let d=i+1;d<t.length;d++)if(/^#\s+/.test(t[d])){a=d;break}return{start:i,end:a}}function Me(t,l){if(!t)return null;let n=t.split(`
`),i=Le(n,l);return i?n.slice(i.start+1,i.end).join(`
`).trim():null}function Pn(t){if(!t)return"";let l=t,n=l.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return n&&(l=l.replace(n[0],"")),l=l.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),l=l.replace(Et,""),l.trim()}function St(t,l){return String(t||"").includes("](plugin://")?l:`---

${l}`}function Ut(t,l){let n=(t||"").split(`
`),i=Le(n,_);if(!i)return null;let a=n.slice(0,i.start).join(`
`).replace(/\s+$/,""),d=n.slice(i.start).join(`
`);return`${a?a+`

`:""}${l}

${d}`}function Rn(t,l){let n=(t||"").split(`
`),i=Le(n,_);if(!i)return null;let a=Pn(n.slice(i.start+1,i.end).join(`
`).trim());if(!a)return null;let d=n.slice(0,i.start).join(`
`).replace(/\s+$/,""),r=n.slice(i.end).join(`
`).replace(/^\s+/,"");return`${d?d+`

`:""}${a}

${n[i.start]}

${l}${r?`

`+r:""}`}function Tt(t){return/^\s*>/.test(t)}function At(t,l,n,i){if(!t||!l||!i)return null;for(let a=0;a<t.length;a++){let d=t[a];if(!d.includes(`](plugin://${l}`)||n&&!d.includes(`att=${n}`)||!new RegExp(`hl=${Ln(i)}(?![\\w-])`).test(d))continue;let r=a+1;for(r<t.length&&t[r].trim()===""&&r+1<t.length&&Tt(t[r+1])&&r++;r<t.length&&Tt(t[r]);)r++;return{start:a,end:r}}return null}function Ln(t){return String(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function ze(t,l,n){if(!t||!l)return[];let i=[],a=String(t).split(`
`);for(let d of a){if(!d.includes(`](plugin://${l}`)||n&&!d.includes(`att=${n}`))continue;let r=d.match(/[?&]hl=([^&)\s]+)/);r&&i.indexOf(r[1])===-1&&i.push(r[1])}return i}function Oe(t,l,n,i){let a=String(t||"").split(`
`),d=At(a,l,n,i);if(!d)return null;let{start:r,end:p}=d;p<a.length&&a[p].trim()===""&&p++;let S=a.slice(0,r).concat(a.slice(p));return ze(S.join(`
`),l,n).length?S.join(`
`):Mn(S).join(`
`)}function Mn(t){let l=t.findIndex(n=>n.trim()===`# ${_}`);l===-1&&(l=t.length);for(let n=l-1;n>=0;n--){let i=t[n].trim();if(i==="")continue;if(i!=="---")return t;let a=t.slice(0,n).concat(t.slice(n+1)),d=n;for(;d<a.length&&a[d].trim()===""&&(d===0||a[d-1].trim()==="");)a.splice(d,1);return a}return t}function $e(t,l,n,i,a){let d=String(t||"").split(`
`),r=At(d,l,n,i);return r?d.slice(0,r.start).concat(String(a).split(`
`),d.slice(r.end)).join(`
`):null}function j(t,l){return l.noteUUID||t.context.noteUUID}async function Dt(t,l,n){try{let i=await t.getNoteAttachments({uuid:l}),a=Array.isArray(i)&&i.find(d=>d&&d.uuid===n);return a?a.name:""}catch{return""}}async function be(t,l,n,i){let a=await we(t,l,n),d=i(a);return d!==a&&await It(t,l,n,d),{highlights:d}}async function Ht(t,l,n,i){if(n.pluginUUID)try{let a=await t.getNoteContent({uuid:l}),d=i(a);d!==null&&d!==a&&await t.replaceNoteContent({uuid:l},d)}catch{}}function Pt(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let l=t.trim();if(!l.startsWith("{"))return{action:l};try{return JSON.parse(l)}catch{return{action:l}}}async function Rt(t,l){return JSON.stringify(await zn(t,Pt(l)))}async function zn(t,l){let n=Pt(l);switch(n.action){case"getPdfUrl":{let i=n.attachmentUUID;if(!i)return{error:"No attachment specified for this viewer."};try{return{url:await ct(t,i),name:await Dt(t,j(t,n),i)}}catch(a){return{error:`Could not load the PDF: ${a.message}`}}}case"loadHighlights":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=j(t,n),a=await we(t,i,n.attachmentUUID),d=[];if(n.pluginUUID){let r=await t.getNoteContent({uuid:i});d=ze(r,n.pluginUUID,n.attachmentUUID)}return{highlights:a,sentIds:d}}catch(i){return{error:`Could not load highlights: ${i.message}`}}}case"addHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=ve(n.highlight||{});return await be(t,j(t,n),n.attachmentUUID,a=>a.concat([i]))}catch(i){return{error:`Could not save the highlight: ${i.message}`}}}case"recolorHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=j(t,n),a=await be(t,i,n.attachmentUUID,d=>Pe(d,n.id,r=>yt(r,n.color)));return n.exportBlock&&await Ht(t,i,n,d=>$e(d,n.pluginUUID,n.attachmentUUID,n.id,n.exportBlock)),a}catch(i){return{error:`Could not change the highlight color: ${i.message}`}}}case"setHighlightNote":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await be(t,j(t,n),n.attachmentUUID,i=>Pe(i,n.id,a=>xt(a,n.note)))}catch(i){return{error:`Could not save the note: ${i.message}`}}}case"removeHighlight":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=j(t,n),a=await be(t,i,n.attachmentUUID,d=>Ct(d,n.id));return await Ht(t,i,n,d=>Oe(d,n.pluginUUID,n.attachmentUUID,n.id)),a}catch(i){return{error:`Could not remove the highlight: ${i.message}`}}}case"removeFromNote":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate the block."};if(!n.id)return{error:"No highlight specified."};try{let i=j(t,n),a=await t.getNoteContent({uuid:i}),d=Oe(a,n.pluginUUID,n.attachmentUUID,n.id);return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},d),{ok:!0})}catch(i){return{error:`Could not remove it from the note: ${i.message}`}}}case"sendToNote":{if(!n.content)return{error:"Nothing to send."};try{let i={uuid:j(t,n)},a=await t.getNoteContent(i);if(n.highlightId){let p=$e(a,n.pluginUUID,n.attachmentUUID,n.highlightId,n.content);if(p!==null)return await t.replaceNoteContent(i,p),{ok:!0,replaced:!0}}let d=St(a,n.content),r=Ut(a,d);return r===null?await t.insertNoteContent(i,`
`+d+`
`,{atEnd:!0}):await t.replaceNoteContent(i,r),{ok:!0}}catch(i){return{error:`Could not add this to the note: ${i.message}`}}}case"removeViewer":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=j(t,n),a=await t.getNoteContent({uuid:i}),d=ge(a,n.pluginUUID,n.attachmentUUID);return d===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:i},d),await Nt(t,i,n.attachmentUUID),{ok:!0})}catch(i){return{error:`Could not remove this viewer: ${i.message}`}}}case"getViewerSummary":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};let i=j(t,n),a=await Dt(t,i,n.attachmentUUID);try{let d=await we(t,i,n.attachmentUUID);return{name:a,count:d.length}}catch{return{name:a,count:0}}}case"setCollapsed":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=j(t,n),a=await t.getNoteContent({uuid:i}),d=ft(a,n.pluginUUID,n.attachmentUUID,n.collapsed);return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},d),{ok:!0})}catch(i){return{error:`Could not resize this viewer: ${i.message}`}}}case"clearDeepLink":{if(!n.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!n.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=j(t,n),a=await t.getNoteContent({uuid:i}),d=se(a,n.pluginUUID,n.attachmentUUID,{page:null,highlightId:null});return d===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},d),{ok:!0})}catch(i){return{error:`Could not clear this viewer's deep link: ${i.message}`}}}case"exportAll":{if(!n.noteName)return{error:"Missing destination note name."};try{let i=await t.findNote({name:n.noteName}),a=i?i.uuid:await t.createNote(n.noteName);return await t.replaceNoteContent({uuid:a},n.content||""),{ok:!0,noteUUID:a}}catch(i){return{error:`Could not export highlights: ${i.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(n.action)}`}}}var G={chevronLeft:"M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",chevronRight:"M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",remove:"M19 13H5v-2h14v2z",add:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",moreVert:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",listBulleted:"M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",arrowUp:"M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z",arrowDown:"M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"},Lt={note:"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z",copy:"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",send:"M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",remove:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",download:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",postAdd:"M17 19.22H5V7h7V5H5c-1.1 0-2 .9-2 2v12.22c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h-2v7.22zM19 2h-2v3h-3v2h3v3h2V7h3V5h-3V2zM7 9h8v2H7zm0 3v2h8v-2H7zm0 3h5v2H7z",collapse:"M7.41 18.59 8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.42 5.41 12 10l4.59-4.59z"};function W(t){return'<svg class="pdfa-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+t+'"></path></svg>'}function Fe(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function l(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function n(u,f){var w=Math.pow(10,f===void 0?2:f),b=function(C){return Math.round(C*w)/w};return{x:b(u.x),y:b(u.y),width:b(u.width),height:b(u.height)}}function i(u){return u.width>.01&&u.height>.01}function a(u,f,w){for(var b=String(u??""),C=Math.max(0,f===void 0?0:f),E=Math.min(b.length,w===void 0?b.length:w),k=function($){return $===""||/\s/.test($)},T=[],A=C;A<E;){for(;A<E&&k(b.charAt(A));)A++;if(A>=E)break;for(var O=A;A<E&&!k(b.charAt(A));)A++;T.push({start:O,end:A})}return T}function d(u){for(var f=1/0,w=1/0,b=-1/0,C=-1/0,E=0;E<(u?u.length:0);E++){var k=u[E];i(k)&&(f=Math.min(f,k.left),w=Math.min(w,k.top),b=Math.max(b,k.left+k.width),C=Math.max(C,k.top+k.height))}return isFinite(f)?{left:f,top:w,width:b-f,height:C-w}:null}function r(u,f,w){for(var b=[],C=0;C<u.length;C++){var E=t(u[C],f);if(i(E)){var k=w(E.x,E.y),T=w(E.x+E.width,E.y+E.height),A=n(l(k,T));i(A)&&b.push(A)}}return b}function p(u,f){var w=f(u.x,u.y),b=f(u.x+u.width,u.y+u.height);return l(w,b)}function S(u,f,w){var b=f.right-f.left,C=f.bottom-f.top;if(b<=0||C<=0)return null;var E=u.x2-u.x1,k=u.y2-u.y1,T=u.x1+(w.left-f.left)/b*E,A=u.x2-(f.right-w.right)/b*E,O=u.y1+(w.bottom-f.bottom)/C*k,$=u.y2-(f.top-w.top)/C*k;return{x:T,y:O,width:A-T,height:$-O}}function I(u,f){var w=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return w>.5*Math.min(u.height,f.height)}function x(u,f){var w=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var b=u.slice().sort(function(q,Q){return Q.y-q.y||q.x-Q.x}),C=[],E=0;E<b.length;E++){for(var k=!1,T=0;T<C.length;T++)if(I(C[T][0],b[E])){C[T].push(b[E]),k=!0;break}k||C.push([b[E]])}for(var A=[],O=0;O<C.length;O++){for(var $=C[O].slice().sort(function(q,Q){return q.x-Q.x}),H=null,oe=0;oe<$.length;oe++){var M=$[oe];if(H===null){H={x:M.x,y:M.y,width:M.width,height:M.height};continue}var ye=M.x-(H.x+H.width);if(ye<=w*Math.max(H.height,M.height)){var Ce=Math.max(H.x+H.width,M.x+M.width),le=Math.max(H.y+H.height,M.y+M.height);H.x=Math.min(H.x,M.x),H.y=Math.min(H.y,M.y),H.width=Ce-H.x,H.height=le-H.y}else A.push(H),H={x:M.x,y:M.y,width:M.width,height:M.height}}H!==null&&A.push(H)}return A.map(function(q){return n(q)})}function y(u,f,w,b){var C=b===void 0?0:b;return f>=u.x-C&&f<=u.x+u.width+C&&w>=u.y-C&&w<=u.y+u.height+C}function U(u,f,w,b,C){for(var E=u||[],k=E.length-1;k>=0;k--){var T=E[k];if(!(!T||T.page!==f||!T.rects)){for(var A=0;A<T.rects.length;A++)if(y(T.rects[A],w,b,C===void 0?1:C))return T}}return null}function g(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:l,roundRect:n,isVisibleRect:i,textTokenRanges:a,unionClientRects:d,clientRectsToPdfRects:r,pdfRectToViewportRect:p,itemRelativeRect:S,mergeLineRects:x,rectContainsPoint:y,hitTestHighlights:U,normalizeQuoteText:g}}var B=Fe(),yo=B.clientRectToLocal,Co=B.rectFromCorners,Eo=B.roundRect,ko=B.isVisibleRect,Io=B.textTokenRanges,No=B.unionClientRects,So=B.clientRectsToPdfRects,Uo=B.pdfRectToViewportRect,To=B.itemRelativeRect,Ao=B.mergeLineRects,Do=B.rectContainsPoint,Ho=B.hitTestHighlights,Po=B.normalizeQuoteText;function Be(){var t=[.957,.871,.424];function l(d,r,p,S,I){var x=r.context.register(r.context.obj({Type:d.PDFName.of("ExtGState"),BM:d.PDFName.of("Multiply"),ca:d.PDFNumber.of(.4)})),y=[d.pushGraphicsState(),d.setGraphicsState("GS0")];y.push(d.setFillingColor(d.rgb(S[0],S[1],S[2])));for(var U=0;U<p.length;U++){var g=p[U];y.push(d.moveTo(g.x,g.y)),y.push(d.lineTo(g.x,g.y+g.height)),y.push(d.lineTo(g.x+g.width,g.y+g.height)),y.push(d.lineTo(g.x+g.width,g.y)),y.push(d.closePath())}y.push(d.fill()),y.push(d.popGraphicsState());var u=r.context.formXObject(y,{BBox:I,Resources:{ExtGState:{GS0:x}}});return r.context.register(u)}function n(d,r,p,S){for(var I=p.rects,x=[],y=I[0].x,U=I[0].y,g=I[0].x+I[0].width,u=I[0].y+I[0].height,f=0;f<I.length;f++){var w=I[f],b=w.x,C=w.x+w.width,E=w.y,k=w.y+w.height;x.push(b,k,C,k,b,E,C,E),y=Math.min(y,b),U=Math.min(U,E),g=Math.max(g,C),u=Math.max(u,k)}var T=r.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Highlight"),Rect:r.context.obj([y,U,g,u]),QuadPoints:r.context.obj(x),C:r.context.obj(S),F:d.PDFNumber.of(4),T:d.PDFString.of("PDF Annotator"),M:d.PDFString.of(new Date().toISOString()),CA:d.PDFNumber.of(.4)});p.note&&T.set(d.PDFName.of("Contents"),d.PDFString.of(p.note));var A=l(d,r,I,S,[y,U,g,u]);T.set(d.PDFName.of("AP"),r.context.obj({N:A}));var O=r.context.register(T),$=[O];if(p.note){var H=r.context.register(r.context.obj({Type:d.PDFName.of("Annot"),Subtype:d.PDFName.of("Popup"),Rect:r.context.obj([g+8,U-60,g+208,U+12]),Parent:O,Open:!1}));T.set(d.PDFName.of("Popup"),H),$.push(H)}return $}function i(d,r,p){var S=r.node.get(d.PDFName.of("Annots"));if(S instanceof d.PDFArray)for(var I=0;I<p.length;I++)S.push(p[I]);else r.node.set(d.PDFName.of("Annots"),r.doc.context.obj(p))}async function a(d,r,p,S){for(var I=await d.PDFDocument.load(r),x=I.getPages(),y=p||[],U=0;U<y.length;U++){var g=y[U];if(!(!g||!g.rects||!g.rects.length)){var u=x[g.page-1];if(u){var f=S&&S[g.color]||t,w=n(d,I,g,f);i(d,u,w)}}}return I.save()}return{writeHighlightsIntoPdf:a,buildHighlightAnnotation:n,appendAnnotationRefs:i}}var je=Be(),Lo=je.writeHighlightsIntoPdf,Mo=je.buildHighlightAnnotation,zo=je.appendAnnotationRefs;function _e(){function t(x){return String(x??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function l(x,y,U,g,u){var f=new URLSearchParams;y&&f.set("att",y),Number.isFinite(U)&&U>=1&&f.set("page",String(Math.floor(U))),g&&f.set("hl",g),u&&f.set("note",u);var w=f.toString();return"plugin://"+x+(w?"?"+w:"")}function n(x,y){return String(x??"").split(/\r?\n/).map(function(U){return(y+" "+U).replace(/[ \t]+$/,"")})}function i(x,y,U){return y==null?x:"<mark"+(U?' style="background-color:'+U+';"':"")+">"+x+'<!-- {"backgroundCycleColor":"'+y+'"} --></mark>'}function a(x,y,U,g,u,f,w){var b=l(y,U,g.page,g.id,w),C=i(t(x||"PDF"),u,f),E="["+C+"]("+b+")",k=[E].concat(n(g.quoteText,"> >"));return g.note&&(k.push(">"),k=k.concat(n(g.note,">"))),k.join(`
`)}function d(x){return String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function r(x){return"<p>"+d(x).replace(/\r?\n/g,"<br>")+"</p>"}function p(x,y,U,g,u,f,w){var b=l(y,U,g.page,g.id,w),C=d(x||"PDF"),E=f?'<mark style="background-color: '+d(f)+';">'+C+"</mark>":C,k='<p><a href="'+d(b)+'">'+E+"</a></p>",T="<blockquote><blockquote>"+r(g.quoteText)+"</blockquote></blockquote>",A=g.note?"<blockquote>"+r(g.note)+"</blockquote>":"";return k+T+A}function S(x){return x.slice().sort(function(y,U){if(y.page!==U.page)return y.page-U.page;var g=y.rects&&y.rects[0]?y.rects[0].y:0,u=U.rects&&U.rects[0]?U.rects[0].y:0;return u-g})}function I(x,y,U,g,u,f,w){var b=f&&f.length?f:null,C=(g||[]).filter(function(T){return T&&(!b||b.indexOf(T.color)!==-1)}),E=S(C),k=E.map(function(T){var A=u&&u[T.color]||{};return a(x,y,U,T,A.cycleIndex,A.hex,w)});return k.join(`

`)}return{buildDeepLink:l,buildHighlightBlock:a,buildHighlightHtml:p,buildExportAllContent:I}}var xe=_e(),$o=xe.buildDeepLink,Fo=xe.buildHighlightBlock,Bo=xe.buildHighlightHtml,jo=xe.buildExportAllContent;function Mt(){var t=window.__PDFA_CONFIG||{},l=window.__PDFA_GEOM||{},n=window.__PDFA_ANNOTATIONS||{},i=window.__PDFA_EXPORT||{},a={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function d(e){e&&(r.attachmentName=e,a.name&&(a.name.textContent=e),a.collapsedName&&(a.collapsedName.textContent=e))}var r={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],sentIds:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function p(e,o){a.status.textContent=e||"",a.status.style.display=e?"block":"none",a.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function S(e){var o=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(s,c){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");s(window.callAmplenotePlugin(JSON.stringify(o)))}catch(h){c(h)}}).then(function(s){if(s&&typeof s=="object")return s;if(typeof s!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(s)}catch{throw new Error("Unreadable reply from the plugin: "+String(s).slice(0,120))}})}function I(){return t.colors||[]}function x(e){for(var o=I(),s=0;s<o.length;s++)if(o[s].id===e)return o[s].hex;return o.length?o[0].hex:"#F4DE6C"}function y(e){for(var o=0;o<r.highlights.length;o++)if(r.highlights[o].id===e)return r.highlights[o];return null}function U(e){var o=(t.icons||{})[e];if(!o)return null;var s="http://www.w3.org/2000/svg",c=document.createElementNS(s,"svg");c.setAttribute("class","pdfa-icon"),c.setAttribute("viewBox","0 0 24 24"),c.setAttribute("aria-hidden","true");var h=document.createElementNS(s,"path");return h.setAttribute("d",o),c.appendChild(h),c}function g(e,o,s,c){var h=document.createElement("button");h.className="pdfa-btn"+(o?" "+o:"");var m=c?U(c):null;if(m){h.appendChild(m);var v=document.createElement("span");v.textContent=e,h.appendChild(v)}else h.textContent=e;return h.onclick=function(N){N.stopPropagation(),s()},h}function u(e,o,s,c){var h=document.createElement("button");return h.className="pdfa-color",h.dataset.color=e.id,h.style.background=e.hex,h.title=c+" "+e.label,h.setAttribute("aria-label",c+" "+e.label),h.setAttribute("aria-pressed",String(!!o)),h.onclick=function(m){m.stopPropagation(),s(e.id)},h}function f(){for(var e=I(),o=0;o<e.length;o++)a.colors.appendChild(u(e[o],e[o].id===r.activeColorId,function(s){r.activeColorId=s,w(),r.pendingSelection&&Ge(r.pendingSelection,s)},"Highlight"))}function w(){for(var e=a.colors.querySelectorAll(".pdfa-color"),o=0;o<e.length;o++)e[o].setAttribute("aria-pressed",String(e[o].dataset.color===r.activeColorId))}function b(){for(var e=[],o=1;o<=r.pageCount;o++)(function(s){e.push(r.doc.getPage(s).then(function(c){r.viewports[s]=c.getViewport({scale:r.scale})}))})(o);return Promise.all(e)}function C(e){var o=r.viewports[e],s=document.createElement("div");return s.className="pdfa-page",s.dataset.page=String(e),s.style.width=o.width+"px",s.style.height=o.height+"px",s}function E(e,o){if(r.rendered[o]||r.renderingPage[o])return Promise.resolve();r.renderingPage[o]=!0;var s=r.viewports[o],c=document.createElement("canvas"),h=window.devicePixelRatio||1;c.width=Math.floor(s.width*h),c.height=Math.floor(s.height*h),c.style.width=s.width+"px",c.style.height=s.height+"px",e.appendChild(c);var m=document.createElement("div");m.className="pdfa-highlights",e.appendChild(m);var v=document.createElement("div");v.className="textLayer",v.style.width=s.width+"px",v.style.height=s.height+"px",v.style.setProperty("--scale-factor",String(r.scale)),e.appendChild(v);var N=c.getContext("2d");N.scale(h,h);var D=null;return r.doc.getPage(o).then(function(R){return D=R,R.render({canvasContext:N,viewport:s}).promise}).then(function(){return D.getTextContent()}).then(function(R){var P=[];return window.pdfjsLib.renderTextLayer({textContent:R,container:v,viewport:s,textDivs:P}).promise.then(function(){r.textSpans+=P.length;for(var L=0;L<P.length;L++)P[L].__pdfaItem=R.items[L];r.rendered[o]=!0,r.renderingPage[o]=!1,$(o),T()})}).catch(function(R){r.renderingPage[o]=!1,p("Failed to render page "+o+": "+(R.message||R),!0)})}function k(){var e=Z();if(!e||!r.doc)return Promise.resolve();for(var o=e.getBoundingClientRect(),s=e.clientHeight,c=a.pages.querySelectorAll(".pdfa-page"),h=[],m=0;m<c.length;m++){var v=c[m],N=Number(v.dataset.page);if(!(r.rendered[N]||r.renderingPage[N])){var D=v.getBoundingClientRect(),R=D.top-o.top,P=D.bottom-o.top;P<-s||R>e.clientHeight+s||h.push(E(v,N))}}return Promise.all(h)}function T(){var e=0;for(var o in r.rendered)r.rendered[o]&&e++;if(e){var s=r.textSpans===0;p(s?"No selectable text found - this PDF may be a scan.":"",s)}}function A(){if(r.rendering)return Promise.resolve();r.rendering=!0,z(!0),p("Rendering...");var e=Z(),o=e?e.scrollHeight-e.clientHeight:0,s=o>0?e.scrollTop/o:0;return a.pages.innerHTML="",r.viewports={},r.rendered={},r.renderingPage={},r.textSpans=0,b().then(function(){for(var c=1;c<=r.pageCount;c++)a.pages.appendChild(C(c));if(e){var h=e.scrollHeight-e.clientHeight;e.scrollTop=s*(h>0?h:0)}r.rendering=!1,ae(),re(),k()}).catch(function(c){r.rendering=!1,p("Failed to render: "+(c.message||c),!0)})}function O(e){return function(o,s){return e.convertToViewportPoint(o,s)}}function $(e){for(var o=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",s=a.pages.querySelectorAll(o),c=0;c<s.length;c++){var h=s[c],m=Number(h.dataset.page),v=h.querySelector(".pdfa-highlights"),N=r.viewports[m];if(!(!v||!N)){v.innerHTML="";for(var D=O(N),R=0;R<r.highlights.length;R++){var P=r.highlights[R];if(!(!P||P.page!==m||!P.rects||!P.rects.length)){var L=document.createElement("div");L.className="pdfa-hl-group",L.dataset.id=P.id||"";for(var J=0;J<P.rects.length;J++){var ee=l.pdfRectToViewportRect(P.rects[J],D),F=document.createElement("div");F.className="pdfa-hl",F.style.left=ee.x+"px",F.style.top=ee.y+"px",F.style.width=ee.width+"px",F.style.height=ee.height+"px",F.style.background=x(P.color),L.appendChild(F)}v.appendChild(L)}}}}}function H(){$(),M(),a.count.textContent=String(r.highlights.length)}function oe(){return r.highlights.slice().sort(function(e,o){return e.page!==o.page?e.page-o.page:(o.rects[0]?o.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function M(){a.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",e.appendChild(o),e.appendChild(g("Close","",function(){le(!1)})),a.panel.appendChild(e);var s=oe();if(!s.length){var c=document.createElement("div");c.className="pdfa-panel-empty",c.textContent="No highlights yet. Select some text in the PDF and pick a color.",a.panel.appendChild(c);return}for(var h=0;h<s.length;h++)a.panel.appendChild(ye(s[h]))}function ye(e){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=e.id||"",o.title="Jump to this highlight";var s=document.createElement("span");s.className="pdfa-chip",s.style.background=x(e.color),o.appendChild(s);var c=document.createElement("div"),h=document.createElement("div");h.className="pdfa-hl-page",h.textContent="Page "+e.page,c.appendChild(h);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,c.appendChild(m),e.note){var v=document.createElement("div");v.className="pdfa-hl-note",v.textContent=e.note,c.appendChild(v)}if(o.appendChild(c),r.sentIds.indexOf(e.id)!==-1){var N=document.createElement("button");N.className="pdfa-hl-unsend",N.type="button",N.title="Remove this from the note (keeps the highlight)",N.setAttribute("aria-label","Remove this highlight from the note"),N.textContent="\u{1F5D1}",N.onclick=function(D){D.stopPropagation(),Ce(e)},o.appendChild(N)}return o.onclick=function(){Ye(e)},o}function Ce(e){S({action:"removeFromNote",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e.id}).then(function(o){if(o&&o.error)throw new Error(o.error);var s=r.sentIds.indexOf(e.id);s!==-1&&r.sentIds.splice(s,1),M(),p("Removed from the note. The highlight is still here.")}).catch(function(o){p(o.message||String(o),!0)})}function le(e){var o=e===void 0?!a.panel.classList.contains("pdfa-open"):e;a.panel.classList.toggle("pdfa-open",o),a.listToggle.setAttribute("aria-pressed",String(o)),o&&M(),re()}function q(e){for(var o=e&&e.nodeType===1?e:e&&e.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function Q(e,o){for(var s=[],c=[],h=null,m=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),v;v=m.nextNode();)if(e.intersectsNode(v)){var N=v.nodeValue||"",D=v===e.startContainer?e.startOffset:0,R=v===e.endContainer?e.endOffset:N.length,P=v.parentElement,L=P&&P.__pdfaItem;if(L)for(var J={x1:L.transform[4],y1:L.transform[5],x2:L.transform[4]+L.width,y2:L.transform[5]+L.height},ee=P.getBoundingClientRect(),F=l.textTokenRanges(N,D,R),te=0;te<F.length;te++){var De=document.createRange();De.setStart(v,F[te].start),De.setEnd(v,F[te].end);var V=l.unionClientRects(De.getClientRects());if(V){var at={left:V.left,top:V.top,width:V.width,height:V.height,right:V.left+V.width,bottom:V.top+V.height},rt=l.itemRelativeRect(J,ee,at);rt&&(s.push(rt),c.push(N.slice(F[te].start,F[te].end)),h=at)}}}return{rects:s,text:c.join(" "),lastCssRect:h}}function X(e){if(r.pendingSelection=e,r.lastCapturedText=e&&e.rawText||"",!e){a.hint.textContent="",a.hint.style.display="none";return}a.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",a.hint.style.display="inline"}function qe(e){if(!r.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){X(null),z();return}var s=o.getRangeAt(0),c=q(s.startContainer);if(!c)return X(null);var h=c.parentElement;if(!h||!h.dataset||!h.dataset.page)return X(null);var m=Number(h.dataset.page);if(!r.rendered[m])return X(null);var v=q(s.endContainer)!==c,N=Q(s,c),D=l.mergeLineRects(N.rects);if(!D.length)return X(null);var R=N.lastCssRect||h.getBoundingClientRect(),P=e&&e.clientX?e.clientX:R.left+R.width/2,L=e&&e.clientY?e.clientY:R.top+R.height,J={page:m,rects:D,quoteText:l.normalizeQuoteText(N.text),spilled:v,anchorX:P,anchorY:L,rawText:String(o)};X(J),qt(J)}}var Ft=300,Y=null;function Bt(){r.noteEditing||(Y&&clearTimeout(Y),Y=setTimeout(Ve,Ft))}function Ve(){if(Y=null,!r.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||q(e.getRangeAt(0).startContainer)&&String(e)!==r.lastCapturedText&&qe(null)}}function de(e,o){var s=r.highlights;return r.highlights=e,H(),S(o).then(function(c){if(!c||c.error)throw new Error(c&&c.error||"The plugin did not confirm the change.");return r.highlights=c.highlights||e,H(),p(""),!0}).catch(function(c){return r.highlights=s,H(),p(c.message||String(c),!0),!1})}function Ge(e,o){var s={id:null,page:e.page,color:o,rects:e.rects,quoteText:e.quoteText,note:null},c=e.anchorX,h=e.anchorY;X(null),z(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),de(r.highlights.concat([s]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:s}).then(function(v){if(v){var N=r.highlights[r.highlights.length-1];N&&N.id&&ke(N,c,h,!0)}})}function jt(e,o){z(!0);for(var s=r.highlights.map(function(m){return m.id===e?Object.assign({},m,{color:o}):m}),c=null,h=0;h<s.length;h++)s[h].id===e&&(c=s[h]);de(s,{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e,color:o,exportBlock:c?Ae(c):null})}function _t(e){z(!0),de(r.highlights.filter(function(o){return o.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e})}function Ee(e,o){var s=String(o??"").trim();r.noteEditing=null,z(!0),de(r.highlights.map(function(c){return c.id===e?Object.assign({},c,{note:s||null}):c}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:s})}function K(e,o,s,c){a.popover.innerHTML="",a.popover.classList.toggle("pdfa-editing",c==="editing"),a.popover.classList.toggle("pdfa-exporting",c==="exporting"),a.popover.classList.toggle("pdfa-menu",c==="menu");for(var h=0;h<e.length;h++)a.popover.appendChild(e[h]);a.popover.classList.add("pdfa-open");var m=a.popover.offsetWidth,v=a.popover.offsetHeight,N=Math.max(4,Math.min(o-m/2,window.innerWidth-m-4)),D=s+12;D+v>window.innerHeight-4&&(D=Math.max(4,s-v-12)),D=Math.max(4,Math.min(D,window.innerHeight-v-4)),a.popover.style.left=N+"px",a.popover.style.top=D+"px"}function z(e){r.noteEditing&&!e||(r.noteEditing=null,a.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),a.popover.innerHTML="")}function qt(e){for(var o=I(),s=[],c=0;c<o.length;c++)s.push(u(o[c],o[c].id===r.activeColorId,function(h){r.activeColorId=h,w(),Ge(e,h)},"Highlight"));K(s,e.anchorX,e.anchorY)}function ke(e,o,s,c){for(var h=I(),m=[],v=0;v<h.length;v++)m.push(u(h[v],h[v].id===e.color,function(D){jt(e.id,D)},"Change to"));var N=!!e.note;m.push(g(N?"Edit note":"Add note",c&&!N?"pdfa-btn-primary":"",function(){Gt(e,o,s)},"note")),m.push(g("Copy","",function(){rn(e)},"copy")),m.push(g("Send to note","",function(){sn(e)},"send")),m.push(g("Remove","pdfa-remove",function(){_t(e.id)},"remove")),K(m,o,s)}function Vt(e,o){for(var s=I(),c={},h=0;h<s.length;h++)c[s[h].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var v=document.createElement("div");v.className="pdfa-export-colors";for(var N=0;N<s.length;N++)(function(R){var P=u(R,!0,function(L){c[L]=!c[L],P.setAttribute("aria-pressed",String(c[L]))},"Toggle");v.appendChild(P)})(s[N]);var D=document.createElement("div");D.className="pdfa-note-actions",D.appendChild(g("Create / update note","pdfa-btn-primary",function(){for(var R=[],P=0;P<s.length;P++)c[s[P].id]&&R.push(s[P].id);ln(R.length===s.length?null:R)})),K([m,v,D],e,o,"exporting")}function Gt(e,o,s){r.noteEditing=e.id;var c=document.createElement("textarea");c.className="pdfa-note-input",c.rows=3,c.value=e.note||"",c.placeholder="Note for this highlight";var h=document.createElement("div");h.className="pdfa-note-actions",e.note&&h.appendChild(g("Delete note","",function(){Ee(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",h.appendChild(m),h.appendChild(g("Cancel","",function(){We(e,o,s)})),h.appendChild(g("Save","pdfa-btn-primary",function(){Ee(e.id,c.value)})),c.onkeydown=function(v){v.key==="Enter"&&(v.ctrlKey||v.metaKey)?(v.preventDefault(),v.stopPropagation(),Ee(e.id,c.value)):v.key==="Escape"&&(v.preventDefault(),v.stopPropagation(),We(e,o,s))},K([c,h],o,s,"editing"),c.focus(),c.setSelectionRange(c.value.length,c.value.length)}function We(e,o,s){r.noteEditing=null;var c=y(e.id)||e;ke(c,o,s)}function Wt(e){if(!r.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var s=e.target,c=null;s&&s!==a.pages;){if(s.classList&&s.classList.contains("pdfa-page")){c=s;break}s=s.parentElement}if(!c)return z();var h=Number(c.dataset.page),m=r.viewports[h];if(!m)return z();var v=c.getBoundingClientRect(),N=m.convertToPdfPoint(e.clientX-v.left,e.clientY-v.top),D=l.hitTestHighlights(r.highlights,h,N[0],N[1],1);D&&D.id?ke(D,e.clientX,e.clientY):z()}}}function Ie(){return Math.round(r.scale*100)+"%"}function ae(){a.pageLabel.textContent=r.current+" / "+r.pageCount,document.activeElement!==a.zoomLabel&&(a.zoomLabel.value=Ie())}function Z(){return a.root.querySelector(".pdfa-scroll")}function Je(){return a.panel&&a.panel.classList.contains("pdfa-open")?a.panel:Z()}function Xe(e){var o=a.pages.querySelector('.pdfa-page[data-page="'+e+'"]');o&&E(o,e)}function Ne(e){var o=Math.min(Math.max(1,e),r.pageCount),s=a.pages.querySelector('.pdfa-page[data-page="'+o+'"]');Xe(o);var c=Z();s&&c&&(c.scrollTop+=s.getBoundingClientRect().top-c.getBoundingClientRect().top),k(),r.current=o,ae()}function Ye(e){var o=a.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),s=r.viewports[e.page];if(!(!o||!s||!e.rects||!e.rects.length)){var c=l.pdfRectToViewportRect(e.rects[0],O(s)),h=Z(),m=o.getBoundingClientRect().top+c.y;h.scrollTop+=m-h.getBoundingClientRect().top-h.clientHeight/3,Xe(e.page),k(),r.current=e.page,ae()}}function Jt(){try{a.root.setAttribute("tabindex","-1"),a.root.focus(),a.root.scrollIntoView&&a.root.scrollIntoView({block:"nearest"})}catch{}}function Xt(e){if(!(!e||!e.id)){var o=a.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');o&&(o.classList.add("pdfa-hl-flash"),setTimeout(function(){o.classList.remove("pdfa-hl-flash")},2600))}}function Se(e){return Math.min(Math.max(.4,e),4)}function Ue(e){return r.scale=Se(e),A()}function Ze(){var e=String(a.zoomLabel.value).replace(/[\s%]/g,""),o=/^\d*\.?\d+$/.test(e)?parseFloat(e):NaN;if(o>0){var s=Se(o/100);s!==r.scale&&Ue(s)}a.zoomLabel.value=Ie()}function Yt(){return r.doc?r.doc.getPage(1).then(function(e){var o=Z();if(o){var s=window.getComputedStyle(o),c=o.clientWidth-(parseFloat(s.paddingLeft)||0)-(parseFloat(s.paddingRight)||0),h=e.getViewport({scale:1}).width;if(!(!(c>0)||!(h>0))){var m=Se(c/h);m<r.scale&&(r.scale=m,ae())}}}).catch(function(){}):Promise.resolve()}function Qe(e){var o=Je();o&&(o.scrollTop+=e*Math.max(80,o.clientHeight*.85),re(),k())}function Ke(e,o){var s=null,c=null,h=!1,m=function(){s&&clearTimeout(s),c&&clearInterval(c),s=c=null};e.addEventListener("pointerdown",function(){m(),h=!1,s=setTimeout(function(){h=!0,c=setInterval(function(){if(e.disabled)return m();Qe(o*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(v){e.addEventListener(v,m)}),e.onclick=function(){if(h){h=!1;return}Qe(o)}}function re(){var e=Je();if(!(!e||!a.scrollUp)){var o=e.scrollHeight-e.clientHeight;a.scrollUp.disabled=e.scrollTop<=1,a.scrollDown.disabled=e.scrollTop>=o-1}}function Zt(){re(),k(),z();for(var e=a.pages.querySelectorAll(".pdfa-page"),o=r.current,s=1/0,c=0;c<e.length;c++){var h=Math.abs(e[c].getBoundingClientRect().top-60);h<s&&(s=h,o=Number(e[c].dataset.page))}o!==r.current&&(r.current=o,ae())}function Qt(){return new Promise(function(e,o){if(window.pdfjsLib)return e(window.pdfjsLib);var s=document.createElement("script");s.src=t.pdfJsSrc,s.onload=function(){window.pdfjsLib?e(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},s.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(s)})}function Kt(){return new Promise(function(e,o){if(window.PDFLib)return e(window.PDFLib);var s=document.createElement("script");s.src=t.pdfLibSrc,s.onload=function(){window.PDFLib?e(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},s.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(s)})}function en(){for(var e={},o=I(),s=0;s<o.length;s++)o[s].rgb&&(e[o[s].id]=o[s].rgb);return e}function tn(){var e=(r.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Te(){for(var e={},o=I(),s=0;s<o.length;s++)e[o[s].id]={cycleIndex:o[s].cycleIndex,hex:o[s].hex};return e}function et(){var e=(r.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Ae(e){var o=Te()[e.color]||{};return i.buildHighlightBlock(r.attachmentName,t.pluginUUID,t.attachmentUUID,e,o.cycleIndex,o.hex,t.noteUUID)}function nn(e){if(!i.buildHighlightHtml)return null;var o=Te()[e.color]||{};return i.buildHighlightHtml(r.attachmentName,t.pluginUUID,t.attachmentUUID,e,o.cycleIndex,o.hex,t.noteUUID)}function on(e,o){var s=function(m){var v=m.clipboardData||window.clipboardData;v&&(v.setData("text/plain",e),o&&v.setData("text/html",o),m.preventDefault())},c=document.createElement("textarea");c.value=e,c.style.position="fixed",c.style.left="-9999px",document.body.appendChild(c),c.focus(),c.select(),document.addEventListener("copy",s,!0);var h=!1;try{h=document.execCommand("copy")}catch{h=!1}return document.removeEventListener("copy",s,!0),document.body.removeChild(c),h}function an(e,o){var s=function(){return!navigator.clipboard||!navigator.clipboard.writeText?c():navigator.clipboard.writeText(e).then(function(){return"plain"},c)},c=function(){return on(e,o)?Promise.resolve(o?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(o&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var h=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([o],{type:"text/html"})});return navigator.clipboard.write([h]).then(function(){return"rich"},s)}catch{return s()}return s()}function rn(e){z(!0);var o,s;try{o=Ae(e),s=nn(e)}catch(c){p("Could not build the copy: "+(c.message||c),!0);return}an(o,s).then(function(c){p(c==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(c){p("Could not copy: "+(c.message||c),!0)})}function sn(e){z(!0),S({action:"sendToNote",content:Ae(e),highlightId:e.id,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");r.sentIds.indexOf(e.id)===-1&&r.sentIds.push(e.id),M(),p(o.replaced?"Updated this highlight where it already sits in the note.":"Added to this note, below the text.")}).catch(function(o){p(o.message||String(o),!0)})}function ln(e){z(!0);var o=i.buildExportAllContent(r.attachmentName,t.pluginUUID,t.attachmentUUID,r.highlights,Te(),e,t.noteUUID);if(!o){p(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}S({action:"exportAll",noteName:et(),content:o}).then(function(s){if(!s||s.error)throw new Error(s&&s.error||"Could not export highlights.");p('Exported to "'+et()+'".')}).catch(function(s){p(s.message||String(s),!0)})}function dn(e,o){var s=[];s.push(g("Collapse","",function(){z(!0),gn()},"collapse"),g("Download","",function(){z(!0),pn()},"download"),g("Export...","",function(){Vt(e,o)},"postAdd"),g("Remove viewer...","pdfa-remove",function(){cn(e,o)},"remove")),K(s,e,o,"menu")}function cn(e,o){var s=document.createElement("div");s.className="pdfa-export-hint",s.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var c=document.createElement("div");c.className="pdfa-note-actions",c.appendChild(g("Cancel","",function(){z(!0)}));var h=document.createElement("span");h.className="pdfa-spacer",c.appendChild(h),c.appendChild(g("Remove","pdfa-remove",hn)),K([s,c],e,o,"exporting")}function hn(){z(!0),p("Removing this viewer..."),S({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){p(e.message||String(e),!0)})}function pn(){r.pdfBytes&&(p("Preparing the download..."),Kt().then(function(e){return n.writeHighlightsIntoPdf(e,r.pdfBytes,r.highlights,en())}).then(function(e){return un(e,tn())}).catch(function(e){p("Could not prepare the download: "+(e.message||e),!0)}))}function un(e,o){var s=new Blob([e],{type:"application/pdf"}),c=null;try{c=new File([s],o,{type:"application/pdf"})}catch{}return c&&navigator.share&&navigator.canShare&&navigator.canShare({files:[c]})?navigator.share({files:[c],title:o}).then(function(){p("")}).catch(function(h){return h&&h.name==="AbortError"?p(""):tt(s,o)}):tt(s,o)}function tt(e,o){var s=URL.createObjectURL(e),c=document.createElement("a");c.href=s,c.download=o,document.body.appendChild(c),c.click(),c.remove(),setTimeout(function(){URL.revokeObjectURL(s)},4e3);var h=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return p(h?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function fn(){return S({action:"loadHighlights",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");r.highlights=e.highlights||[],r.sentIds=e.sentIds||[]}).catch(function(e){r.highlights=[],r.sentIds=[],p("Could not load saved highlights: "+(e.message||e),!0)})}function gn(){var e=r.highlights.length;a.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",a.root.classList.add("pdfa-collapsed-mode"),nt(!0)}function nt(e){S({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function mn(){S({action:"clearDeepLink",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function vn(){a.root.classList.remove("pdfa-collapsed-mode"),r.doc||ot(),nt(!1)}function ot(){p("Loading PDF..."),(t.highlightId||t.page)&&(Jt(),mn()),Qt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,S({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return d(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return r.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return r.doc=e,r.pageCount=e.numPages,fn()}).then(function(){return Yt()}).then(function(){return A()}).then(function(){H();var e=t.highlightId?y(t.highlightId):null;e?(Ye(e),Xt(e)):t.page&&Ne(t.page)}).catch(function(e){p(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){Ne(r.current-1)},document.getElementById("pdfa-next").onclick=function(){Ne(r.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){Ue(r.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){Ue(r.scale-.25)},a.zoomLabel.addEventListener("focus",function(){a.zoomLabel.value=String(Math.round(r.scale*100)),setTimeout(function(){document.activeElement===a.zoomLabel&&a.zoomLabel.select()},0)}),a.zoomLabel.addEventListener("blur",Ze),a.zoomLabel.addEventListener("keydown",function(e){e.key==="Enter"?(e.preventDefault(),Ze(),a.zoomLabel.blur()):e.key==="Escape"&&(e.preventDefault(),a.zoomLabel.value=Ie(),a.zoomLabel.blur())}),Ke(a.scrollUp,-1),Ke(a.scrollDown,1),a.listToggle.onclick=function(){le()},a.more.onclick=function(e){dn(e.clientX,e.clientY)},Z().addEventListener("scroll",Zt),a.panel.addEventListener("scroll",re),a.pages.addEventListener("mouseup",qe),a.pages.addEventListener("click",Wt),document.addEventListener("selectionchange",Bt),a.pages.addEventListener("touchend",function(){Y&&clearTimeout(Y),Y=null,Ve()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!r.noteEditing&&z()}),document.addEventListener("mousedown",function(e){a.popover.classList.contains("pdfa-open")&&(a.popover.contains(e.target)||z())}),f(),M(),a.root.querySelector(".pdfa-collapsed").onclick=vn,t.collapsed?S({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){d(e.name);var o=e.count||0;a.collapsedCount.textContent=o?o+(o===1?" highlight":" highlights"):""}}).catch(function(){}):ot()}catch(e){p("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function zt(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function On(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var $n=`
  * { box-sizing: border-box; }
  /* Roboto is Amplenote's own UI font; the rest is the fallback. See the header. */
  body { margin: 0; background: transparent;
    font: 13px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  /* A bordered card. overflow and the transparent body above are both load-bearing, and
     nothing here may gain a transform, filter or contain - see the header for all three. */
  #pdfa-root { display: flex; flex-direction: column; height: 100vh; background: var(--pdfa-bg); color: var(--pdfa-fg);
    border: 1px solid var(--pdfa-border); border-radius: 10px; overflow: hidden; }
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
  /* Collapsed, this bar IS the card - its own rule would draw the bottom edge twice. */
  #pdfa-root.pdfa-collapsed-mode .pdfa-collapsed { border-bottom: none; }
  #pdfa-root.pdfa-collapsed-mode .pdfa-collapsed { display: flex; }
  .pdfa-collapsed-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    opacity: .85; }
  .pdfa-collapsed-count { opacity: .6; font-size: 12px; white-space: nowrap; }
  /* Holds the page scroller and the highlights panel. Positioned so the panel can
     overlay the pages without the toolbar, and without reflowing the PDF - the embed is
     often barely wider than a page, so a panel that stole width would squeeze it. */
  .pdfa-body { position: relative; flex: 1 1 auto; display: flex; min-height: 0; }
  /* Modelled on Amplenote's own editor toolbar: a plain bar, borderless controls, and a
     rounded tint on hover rather than a box around every button at rest. min-height keeps
     the row a constant height whether or not a swatch is showing its selected ring, which
     is what made the bar appear to grow and shrink as colors were picked. */
  .pdfa-toolbar { display: flex; align-items: center; gap: 4px; padding: 5px 8px; min-height: 38px;
    background: var(--pdfa-toolbar); border-bottom: 1px solid var(--pdfa-border);
    flex: 0 0 auto; flex-wrap: wrap; }
  /* Transparent BORDER rather than none: the button keeps the same box either way, so
     nothing shifts by a pixel when a state adds one back. */
  .pdfa-toolbar button { font: inherit; padding: 5px 9px; border: 1px solid transparent;
    background: transparent; color: inherit; border-radius: 6px; cursor: pointer; line-height: 1.2; }
  .pdfa-toolbar button:hover { background: var(--pdfa-btn-hover); }
  .pdfa-toolbar button:disabled { opacity: .4; cursor: default; background: transparent; }
  /* What Amplenote's toolbar does for an active control (its H2 button, with the cursor
     in an H2): hover's own tint, held on. Not the swatches - they carry aria-pressed for
     the selected color, and a grey tint would dirty the color they exist to show. */
  .pdfa-toolbar button[aria-pressed="true"]:not(.pdfa-color) { background: var(--pdfa-btn-hover); }
  /* ICON BUTTONS. A square box around an 18px Material glyph (see icons.js). inline-flex
     plus the svg's own display:block is what kills the inline-layout descender gap that
     otherwise lifts a glyph a pixel off centre.

     "button.pdfa-icon-btn", not ".pdfa-icon-btn": ".pdfa-toolbar button" above is one
     point more specific, so a bare class loses the padding and the buttons come out 38px
     wide around an 18px glyph. Measured, not guessed. */
  .pdfa-toolbar button.pdfa-icon-btn { display: inline-flex; align-items: center;
    justify-content: center; gap: 5px; padding: 6px; }
  .pdfa-icon { display: block; width: 18px; height: 18px; fill: currentColor; opacity: .78; }
  .pdfa-toolbar button:hover .pdfa-icon,
  .pdfa-toolbar button[aria-pressed="true"] .pdfa-icon { opacity: 1; }
  /* The count stays beside the list glyph - it is what the word "Notes" was not saying.
     Tabular figures, so the bar does not shift as the count crosses 10. */
  .pdfa-toolbar button.pdfa-notes-btn { padding: 6px 8px; }
  .pdfa-notes-btn .pdfa-count { font-size: 12px; opacity: .85; font-variant-numeric: tabular-nums; }
  .pdfa-label { min-width: 62px; text-align: center; opacity: .85; font-variant-numeric: tabular-nums; }
  /* The zoom "label" is really an INPUT (see the markup for why), so it has to be talked
     back down into looking like the span it replaced: a browser hands an input its own
     font, border, background and width, none of which belong in this bar. width rather
     than the min-width above, because an input does not size itself to its content -
     .pdfa-label's min-width would leave it at the browser's ~170px default. */
  .pdfa-zoom-field { font: inherit; width: 62px; padding: 5px 4px; border: 1px solid transparent;
    border-radius: 6px; background: transparent; color: inherit; cursor: text; }
  /* The one cue that it is typable at all, and deliberately the SAME hover the - and +
     either side of it use: "these controls respond" stays one idea rather than two. */
  .pdfa-zoom-field:hover { background: var(--pdfa-btn-hover); }
  /* A border, not the browser's outline ring: the ring is drawn OUTWARD from the control
     and this bar's height is set by its contents, so it was clipped by the toolbar edge -
     the same problem the color swatches' selected state already solves this way. */
  .pdfa-zoom-field:focus { outline: none; opacity: 1;
    background: var(--pdfa-toolbar); border-color: var(--pdfa-accent); }
  /* The overflow trigger is now a plain icon button (Material's more_vert, the glyph the
     note menu above this embed uses), so it needs no rule of its own. Its contents render
     as ordinary popover buttons below. */
  /* Short and centred rather than edge to edge: a full-bleed divider is heavier than
     anything Amplenote's toolbar draws, and it was the loudest thing in a borderless bar. */
  .pdfa-sep { width: 1px; height: 20px; align-self: center; background: var(--pdfa-border); margin: 0 5px; }
  /* 500, not 600 - medium is the heaviest weight Amplenote's own UI uses. */
  .pdfa-brand { font-weight: 500; font-size: 12px; letter-spacing: .01em; color: var(--pdfa-accent);
    white-space: nowrap; padding-right: 2px; }
  .pdfa-spacer { flex: 1 1 auto; }
  /* No filename heading in the overflow menu. It was moved there when its own toolbar row
     was removed for duplicating Amplenote's attachment chip - but the chip is right above
     the embed, so the menu copy duplicated it just as much, only truncated to uselessness
     in a 216px card. The collapsed bar still carries the name, which is the one state
     where no chip is in view. */
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
  .pdfa-color:hover, .pdfa-toolbar .pdfa-color:hover { background-clip: padding-box; }
  /* The selected ring is drawn INSIDE the swatch - a 2px accent border with an inset ring
     of the bar's own color holding it off the fill. It used to be two stacked outer
     box-shadows, which added 4px on every side of a 20px circle and pushed the ring past
     the toolbar's edges: the bar looked like the selection was spilling out of it.
     Anything drawn outward from a control sitting in a tight bar has to be paid for by
     the bar's padding, and here the padding is set by the other controls' text. */
  .pdfa-color[aria-pressed="true"], .pdfa-toolbar .pdfa-color[aria-pressed="true"] {
    border: 2px solid var(--pdfa-accent); box-shadow: inset 0 0 0 2px var(--pdfa-toolbar); }
  .pdfa-hint { display: none; opacity: .75; font-size: 12px; white-space: nowrap; }

  /* Remove / recolor actions for an existing highlight. Positioned "fixed" because the
     embed is its own iframe, so a click's client coordinates are already relative to
     this element's containing block - no scroll-offset arithmetic to get wrong. */
  /* max-height + scroll is what keeps a popover INSIDE the embed. It is fixed-positioned
     in an iframe, so "off the bottom" is not merely ugly - the parent page cannot show
     the overflow and the rest of the menu is simply unreachable. A short embed with a
     six-item menu hit this: showPopover flips above the cursor when it would overflow
     below, but when the menu is taller than the whole viewport there is nowhere to flip
     to, and it clipped. Scrolling is the only answer that always fits.

     Shadow is softer than it was, to sit with Amplenote's own menus rather than shout
     over them; the border is what carries the edge in dark mode, where a shadow reads as
     nothing at all.

     BOTH axes are named. Setting only overflow-y does not leave the other axis alone:
     CSS computes an "overflow: visible" on one axis to "auto" when the other is not
     visible, so a y-only rule quietly buys an x scrollbar too, and any sub-pixel width
     overflow then draws a horizontal bar across the bottom of the menu. Reported live as
     "the slider is unnecessary" - it was, and nothing was actually scrollable sideways. */
  .pdfa-popover { position: fixed; display: none; gap: 5px; align-items: center; padding: 6px 8px;
    z-index: 20; background: var(--pdfa-toolbar); color: var(--pdfa-fg); max-width: 320px; flex-wrap: wrap;
    max-height: calc(100vh - 8px); overflow-x: hidden; overflow-y: auto;
    border: 1px solid var(--pdfa-border); border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.10); }
  .pdfa-popover.pdfa-open { display: flex; }
  /* The note editor turns the popover into a small column form. */
  .pdfa-popover.pdfa-editing { flex-direction: column; align-items: stretch; width: 274px; }
  /* Export all's color filter: independently-toggled swatches, not the single-select
     behaviour the same .pdfa-color class has everywhere else - the filter is "any
     combination of colors", not "one active color". */
  .pdfa-popover.pdfa-exporting { flex-direction: column; align-items: stretch; width: 220px; }
  /* The toolbar overflow menu (Download / Export / Remove), shaped after Amplenote's own
     note menu: a tight card of full-width rows, left-aligned, no borders at rest, and a
     rounded tint under the row on hover. The gap goes to 0 and the spacing moves into the
     rows themselves, so the hover tint is a continuous band rather than a button with
     visible gutters above and below it. */
  .pdfa-popover.pdfa-menu { flex-direction: column; align-items: stretch; width: 216px; gap: 0; padding: 5px; }
  .pdfa-popover.pdfa-menu .pdfa-btn { justify-content: flex-start; text-align: left; padding: 8px 10px; }
  /* Rows keep their height when the menu hits its max-height, so the overflow SCROLLS
     rather than compressing every row toward illegibility. Without this the column's
     flex children shrink to fit and the cap silently squashes the menu instead of
     letting it scroll - which measures as "fits" while looking broken. */
  .pdfa-popover.pdfa-menu > * { flex: 0 0 auto; }
  .pdfa-popover.pdfa-menu .pdfa-btn:hover { background: var(--pdfa-btn-hover); }
  .pdfa-export-colors { display: flex; gap: 6px; padding: 2px 0 8px; }
  .pdfa-export-hint { font-size: 12px; opacity: .75; padding-bottom: 6px; }
  .pdfa-note-input { font: inherit; font-size: 12px; width: 100%; resize: vertical; padding: 6px;
    border: 1px solid var(--pdfa-border); border-radius: 5px;
    background: var(--pdfa-bg); color: inherit; }
  .pdfa-note-actions { display: flex; gap: 5px; margin-top: 6px; align-items: center; }
  .pdfa-note-actions .pdfa-spacer { flex: 1 1 auto; }

  /* Borderless with a tint on hover, the same vocabulary as the toolbar - these used to
     be bordered chips, which made the plugin speak in three button dialects at once (a
     bar of borderless controls, a menu of borderless rows, and this). The border stays
     as "transparent" rather than going to none so the primary variant can put one back
     without moving anything by a pixel. */
  .pdfa-btn { font: inherit; font-size: 13px; padding: 6px 10px; line-height: 1.25;
    display: inline-flex; align-items: center; gap: 7px;
    border: 1px solid transparent; background: transparent; color: inherit;
    border-radius: 6px; cursor: pointer; white-space: nowrap; }
  .pdfa-btn:hover { background: var(--pdfa-btn-hover); }
  .pdfa-btn:hover .pdfa-icon { opacity: 1; }
  /* Marks the "add a note" offer that the spec requires to appear as soon as a
     highlight is created, so it reads as the suggested next step. Now that the others
     have no border, this one having a whole box to itself is what carries that. */
  .pdfa-btn-primary { border-color: var(--pdfa-accent); color: var(--pdfa-accent); }
  /* The destructive one. viewer.js has been putting this class on Remove, Remove
     viewer... and its confirm all along, and nothing here styled it - so the action that
     discards work looked exactly like Copy. Color only: a filled danger button would be
     the loudest thing in a popover whose other actions are all borderless. */
  .pdfa-remove { color: var(--pdfa-error); }
  .pdfa-remove .pdfa-icon { opacity: .9; }

  /* HIGHLIGHTS PANEL - the list of every highlight and its note. Groundwork for the
     Phase 5 color filter, which needs somewhere to filter. */
  /* A floating card, inset from the body's edges rather than filling them. Flush against
     the right and bottom with only a left border, it read as bleeding out of the viewer -
     nothing marked where the panel stopped and the embed ended, so it looked like
     overflow even though its box was exactly inside the body. The inset plus a full
     border, rounded corners and a shadow is what makes it read as sitting ABOVE the page,
     which is what it actually does.

     max-width leaves the same 8px on the other side, so the card stays inset rather than
     growing flush again on a narrow embed. */
  .pdfa-panel { position: absolute; top: 8px; right: 8px; bottom: 8px; width: 292px;
    max-width: calc(100% - 16px);
    background: var(--pdfa-toolbar); border: 1px solid var(--pdfa-border); border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.10);
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
  /* "Remove from note", revealed on hover over its row. The row is the body text, so the
     button takes no width from it at rest - opacity rather than display, or the quote
     would reflow every time the pointer crossed a row.

     :focus-within on the row keeps it reachable by keyboard, where there is no hover to
     reveal it with. Always visible on touch, for the same reason - see the coarse block. */
  .pdfa-hl-unsend { flex: 0 0 auto; margin-left: auto; align-self: center;
    font: inherit; font-size: 13px; line-height: 1; padding: 4px 5px; cursor: pointer;
    background: transparent; border: 1px solid transparent; border-radius: 6px;
    color: inherit; opacity: 0; transition: opacity .12s ease; }
  .pdfa-hl-row:hover .pdfa-hl-unsend,
  .pdfa-hl-row:focus-within .pdfa-hl-unsend { opacity: .75; }
  .pdfa-hl-unsend:hover { opacity: 1; background: var(--pdfa-btn-hover); }

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
    box-shadow: 0 1px 4px rgba(0,0,0,.25);
    display: flex; align-items: center; justify-content: center; }
  /* Bigger than the toolbar's 18px and at full strength - on touch these are the only way
     to scroll at all, so they are a primary control, not one of a bar of secondary ones. */
  .pdfa-scrollnav .pdfa-icon { width: 24px; height: 24px; opacity: 1; }
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
    /* Shrinks with the label it sits among - see .pdfa-zoom-field for why the zoom one
       needs a width of its own rather than inheriting the min-width above. Still wide
       enough for the longest value it can hold, "400%". */
    .pdfa-zoom-field { width: 46px; padding: 5px 2px; }
    /* Zoom was moved into the overflow menu here for one release, to buy back a 40px
       toolbar row. Reverted after use on a real phone: a stepper reached through a menu
       is worse than a second toolbar row, and the row costs proportionally less now that
       the box is taller (a phone gets ~358px rather than ~298px). Kept as a note rather
       than deleted silently, so the idea is not re-proposed as if untried. */
    /* Spans the body, since the row it shares is no longer competing with a page - but
       via "left" rather than a 100% width, so it keeps the same 8px inset on every side
       and stays a card. Going full-bleed here is what made it look like overflow. */
    .pdfa-panel { left: 8px; width: auto; max-width: none; }
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
    /* Not a button, so the rule above skips it - and a 26px-tall text field wedged
       between two 40px buttons is both the odd one out and the hardest thing in the
       toolbar to tap accurately. */
    .pdfa-zoom-field { min-height: 40px; }
    /* Square, not the 8px 12px above - an icon button has no text to pad around, and the
       extra width would push a phone's toolbar into another row. */
    .pdfa-toolbar button.pdfa-icon-btn { min-width: 40px; padding: 8px; }
    .pdfa-btn { min-height: 38px; }
    .pdfa-hl-row { padding: 11px 8px; }
    /* No hover to reveal it with, so it is simply there - and big enough to hit. */
    .pdfa-hl-unsend { opacity: .75; min-width: 38px; min-height: 38px; }
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
`,Ot={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function $t({attachmentUUID:t,attachmentName:l="",page:n=null,highlightId:i=null,lightDarkMode:a="light",pluginUUID:d=null,noteUUID:r=null,collapsed:p=!1}={}){let S=Ot[a]||Ot.light,I={attachmentUUID:t,page:n,highlightId:i,pluginUUID:d,noteUUID:r,pdfJsSrc:ne.pdfJs,workerSrc:ne.pdfJsWorker,pdfLibSrc:ne.pdfLib,colors:ce.map(x=>({id:x.id,label:x.label,hex:x.hex,rgb:x.rgb,cycleIndex:x.cycleIndex})),defaultColorId:he,icons:Lt,collapsed:p,attachmentName:l};return`<link rel="stylesheet" href="${ne.pdfViewerCss}">
<link rel="stylesheet" href="${zt(ne.robotoCss)}">
<style>:root{${S}}${$n}</style>
<div id="pdfa-root"${p?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${zt(l)}</span>
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
    <!-- Material Icons (icons.js), the set Amplenote's own toolbar is drawn in. Icon-only
         buttons, so each carries an aria-label as well as its tooltip. -->
    <button id="pdfa-prev" class="pdfa-icon-btn" title="Previous page"
            aria-label="Previous page">${W(G.chevronLeft)}</button>
    <span class="pdfa-label" id="pdfa-page-label">- / -</span>
    <button id="pdfa-next" class="pdfa-icon-btn" title="Next page"
            aria-label="Next page">${W(G.chevronRight)}</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" class="pdfa-icon-btn" title="Zoom out"
            aria-label="Zoom out">${W(G.remove)}</button>
    <!-- An input, not the label it looks like. The stepper moves in fixed 25% jumps from
         wherever the initial fit-to-width landed, so an exact zoom - "100%" - was often
         not reachable at all, only bracketed: from a fitted 83% the steps run 58/108/133.
         It still READS as a label (transparent, centred, no spinner) until it is focused,
         so nothing about the toolbar's shape changes for someone who only ever clicks the
         buttons. type=text, not number: number brings spinner arrows this bar has no room
         for and rejects the "%" people naturally type; inputmode gets the numeric keypad
         on a phone anyway. -->
    <input id="pdfa-zoom-label" class="pdfa-label pdfa-zoom-field" type="text"
           inputmode="numeric" autocomplete="off" spellcheck="false"
           aria-label="Zoom level in percent"
           title="Zoom level - type a percentage and press Enter" value="125%">
    <button id="pdfa-zoom-in" class="pdfa-icon-btn" title="Zoom in"
            aria-label="Zoom in">${W(G.add)}</button>
    <span class="pdfa-sep"></span>
    <!-- The four single-click highlight color buttons, mounted by the viewer from
         config.colors. Top-level toolbar buttons with no submenu is an explicit spec
         requirement (section 4), which is why the slot is here and not in a panel. -->
    <span id="pdfa-colors"></span>
    <span class="pdfa-hint" id="pdfa-hint"></span>
    <span class="pdfa-sep"></span>
    <!-- The list glyph replaces the word "Notes"; the count stays, since that is the part
         the word was not carrying. -->
    <button id="pdfa-list-toggle" class="pdfa-icon-btn pdfa-notes-btn"
            title="Show highlights and notes" aria-label="Show highlights and notes"
            >${W(G.listBulleted)}<span class="pdfa-count" id="pdfa-count">0</span></button>
    <span class="pdfa-sep"></span>
    <!-- Download, Export and Remove are all occasional, one-off actions - unlike the
         colors (top-level is an explicit spec requirement) or page/zoom/Notes (used
         constantly while reading) - so they live behind one overflow menu instead of
         three permanent buttons competing for space in an embed that's often barely
         wider than a page. Nothing here is spec-mandated to be top-level; this is our
         own toolbar design, not an Amplenote requirement. Grouped with the other
         controls on the left, not off by the filename, so it reads as part of the
         toolbar rather than a stray button wrapped onto its own line. -->
    <button id="pdfa-more" class="pdfa-icon-btn" title="More actions"
            aria-label="More actions">${W(G.moreVert)}</button>
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
      <button id="pdfa-scroll-up" title="Scroll up" aria-label="Scroll up">${W(G.arrowUp)}</button>
      <button id="pdfa-scroll-down" title="Scroll down" aria-label="Scroll down">${W(G.arrowDown)}</button>
    </div>
  </div>
  <!-- Colors on a fresh selection; recolor / note / remove on an existing highlight;
       the note editor itself. One element, filled in per context by the viewer. -->
  <div class="pdfa-popover" id="pdfa-popover"></div>
</div>
<script>window.__PDFA_CONFIG = ${On(I)};
window.__PDFA_GEOM = (${Fe.toString()})();
window.__PDFA_ANNOTATIONS = (${Be.toString()})();
window.__PDFA_EXPORT = (${_e.toString()})();<\/script>
<script>(${Mt.toString()})();<\/script>`}var Fn={noteOption:{"Annotate PDF":async function(t,l){return gt(t,l,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,l){return mt(t,l)}},insertText:async function(t){return vt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...l){return wt(t,l[0])},renderEmbed:function(t,...l){let{attachmentUUID:n,page:i,highlightId:a,collapsed:d,attachmentName:r}=ie(l[0]);return n?$t({attachmentUUID:n,page:i,highlightId:a,collapsed:d,attachmentName:r,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...l){return Rt(t,l[0])}},Bn=Fn;return En(jn);})();

  var plugin = __pluginModule.default;
})();
