(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var De=Object.defineProperty;var mn=Object.getOwnPropertyDescriptor;var vn=Object.getOwnPropertyNames;var wn=Object.prototype.hasOwnProperty;var bn=(t,l)=>{for(var o in l)De(t,o,{get:l[o],enumerable:!0})},xn=(t,l,o,i)=>{if(l&&typeof l=="object"||typeof l=="function")for(let r of vn(l))!wn.call(t,r)&&r!==o&&De(t,r,{get:()=>l[r],enumerable:!(i=mn(l,r))||i.enumerable});return t};var yn=t=>xn(De({},"__esModule",{value:!0}),t);var Bn={};bn(Bn,{default:()=>Fn});var ce=[{id:"coral",label:"Coral",hex:"#F3998C",cycleIndex:12,rgb:[.953,.6,.549]},{id:"yellow",label:"Yellow",hex:"#F4DE6C",cycleIndex:14,rgb:[.957,.871,.424]},{id:"green",label:"Green",hex:"#BBE077",cycleIndex:15,rgb:[.733,.878,.467]},{id:"blue",label:"Blue",hex:"#84B6D9",cycleIndex:18,rgb:[.518,.714,.851]}],he="yellow",_="PDF Annotator data",ot="attachment://",at=1,rt=16,ne={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",robotoCss:"https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"},En="https://plugins.amplenote.com/cors-proxy";function it(t){let l=new URL(En);return l.searchParams.set("apiurl",t),l.toString()}var Cn="application/pdf";function kn(t){return Array.isArray(t)?t.filter(l=>l&&l.type===Cn&&l.uuid):[]}async function pe(t,l){let o=await t.getNoteAttachments({uuid:l}),i=kn(o);if(i.length===0)return null;if(i.length===1)return i[0];let r=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:i.map(n=>({label:n.name,value:n.uuid})),value:i[0].uuid}]});if(r==null)return null;let c=Array.isArray(r)?r[0]:r;return i.find(n=>n.uuid===c)||null}async function st(t,l){if(!l)throw new Error("fetchableAttachmentURL: attachmentUUID required");let o=await t.getAttachmentURL(l);if(!o)throw new Error(`No URL returned for attachment ${l}`);return it(o)}function lt(t){return t?rt:at}function ie(t){let l={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return l;let o;try{o=new URLSearchParams(t.replace(/^\?/,""))}catch{return l}let i=c=>{let n=o.get(c);if(n===null||n.trim()==="")return null;let h=Number(n);return Number.isFinite(h)?h:null},r=i("page");return{attachmentUUID:o.get("att")||null,page:r!==null&&r>=1?Math.floor(r):null,x:i("x"),y:i("y"),highlightId:o.get("hl")||null,noteUUID:o.get("note")||null,collapsed:o.get("c")==="1",attachmentName:o.get("n")||""}}function dt({attachmentUUID:t,page:l,x:o,y:i,highlightId:r,collapsed:c,attachmentName:n}={}){let h=new URLSearchParams;return t&&h.set("att",t),c&&h.set("c","1"),n&&h.set("n",n),Number.isFinite(l)&&l>=1&&h.set("page",String(Math.floor(l))),Number.isFinite(o)&&h.set("x",String(o)),Number.isFinite(i)&&h.set("y",String(i)),r&&h.set("hl",r),h.toString()}function ue(t,l={},o=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");o===null&&(o=lt(l.collapsed));let i=dt(l);return`<object data="${i?`plugin://${t}?${i}`:`plugin://${t}`}" data-aspect-ratio="${o}" />`}function ct(t,l,o){if(!t||!l||!o)return null;let i=t.split(`
`),r=i.findIndex(n=>n.includes(`${ot}${l}`));if(r===-1)return null;let c=i.slice();return i[r+1]===""?c.splice(r+2,0,o.trim(),""):c.splice(r+1,0,"",o.trim(),""),c.join(`
`)}function fe(t,l,o=null){return!t||!l||!t.includes(`plugin://${l}`)?!1:o?t.includes(`att=${o}`):!0}function ge(t,l,o){if(!t||!l||!o)return null;let i=t.split(`
`),r=`plugin://${l}`,c=i.findIndex(h=>h.includes(r)&&h.includes(`att=${o}`));if(c===-1)return null;let n=i.slice();return n.splice(c,1),n[c]===""&&n[c-1]===""&&n.splice(c,1),n.join(`
`)}function se(t,l,o,i={}){if(!t||!l||!o)return null;let r=t.split(`
`),c=`plugin://${l}`,n=r.findIndex(I=>I.includes(c)&&I.includes(`att=${o}`));if(n===-1)return null;let h=r[n],k=h.match(/data="(plugin:\/\/[^"]*)"/);if(!k)return null;let S=k[1],g=S.indexOf("?"),C=g===-1?"":S.slice(g+1),b={...ie(C),attachmentUUID:o,...i},p=dt(b),f=p?`plugin://${l}?${p}`:`plugin://${l}`,x=r.slice(),w=h.replace(k[0],`data="${f}"`),y=lt(b.collapsed),E=w.match(/data-aspect-ratio="[^"]*"/);return w=E?w.replace(E[0],`data-aspect-ratio="${y}"`):w.replace(/\s*\/>\s*$/,` data-aspect-ratio="${y}" />`),x[n]=w,x.join(`
`)}function ht(t,l,o,i){return se(t,l,o,{collapsed:!!i})}async function pt(t,l,o){let i=await pe(t,l);if(!i){let h=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(h)&&h.length>0)||!h.some(S=>S&&S.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let r=await t.getNoteContent({uuid:l});if(fe(r,o,i.uuid))return await t.alert(`"${i.name}" is already open in this note - scroll to the viewer.`),i.uuid;let c=ue(o,{attachmentUUID:i.uuid,attachmentName:i.name}),n=ct(r,i.uuid,c);return n!==null?(await t.replaceNoteContent({uuid:l},n),i.uuid):(await t.insertNoteContent({uuid:l},`
${c}
`,{atEnd:!0}),i.uuid)}var Sn="Raw markdown";function Nn(t){let l=(String(t||"").match(/`+/g)||[]).reduce((o,i)=>Math.max(o,i.length),0);return"`".repeat(Math.max(3,l+1))}async function ut(t,l){let o=await t.getNoteContent({uuid:l});if(typeof o!="string"||o==="")return await t.alert("That note came back empty - nothing to dump."),null;let i=await t.getNoteAttachments({uuid:l}),r=(Array.isArray(i)?i:[]).map(h=>`- ${h&&h.name} | ${h&&h.type} | ${h&&h.uuid}`).join(`
`),c=Nn(o),n=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:n},`# Attachments

${r||"- (none)"}

# ${Sn}

${c}
${o}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),n}async function ft(t,l,o){if(!l)return"";let i=await pe(t,l);if(!i){let c=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(c)&&c.length>0)||!c.some(h=>h&&h.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let r=await t.getNoteContent({uuid:l});return fe(r,o,i.uuid)?(await t.alert(`"${i.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${ue(o,{attachmentUUID:i.uuid,attachmentName:i.name})}
`}async function In(t,l,o,i){let r={uuid:l},c=ge(o,t.context.pluginUUID,i);if(c!==null)try{await t.replaceNoteContent(r,c)}catch{}try{await t.replaceNoteContent(r,o)}catch{await t.replaceNoteContent(r,o)}}async function gt(t,l){let{noteUUID:o,attachmentUUID:i,page:r,highlightId:c}=ie(l);if(!o){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let n=await t.getNoteContent({uuid:o}),h=se(n,t.context.pluginUUID,i,{page:r,highlightId:c,collapsed:!1});h!==null&&(t.context&&t.context.noteUUID===o?await In(t,o,h,i):await t.replaceNoteContent({uuid:o},h))}catch{}await t.navigate(`https://www.amplenote.com/notes/${o}`)}function me(t){if(!t)return null;let l=String(t).trim().toLowerCase();return ce.find(o=>o.id===l||o.hex.toLowerCase()===l)||null}function mt(){return me(he)}function Tn(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function ve({page:t,color:l,rects:o,quoteText:i,note:r=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(o)||o.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let h of o)if(![h.x,h.y,h.width,h.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(h)}`);let n=me(l)||mt();return{id:c||Tn(),page:t,color:n.id,rects:o.map(h=>({x:h.x,y:h.y,width:h.width,height:h.height})),quoteText:String(i||""),note:r?String(r):null}}function vt(t,l){let o=l==null?null:String(l).trim();return{...t,note:o||null}}function wt(t,l){let o=me(l);if(!o)throw new Error(`withColor: unknown color "${l}"`);return{...t,color:o.id}}function bt(t,l){return(t||[]).filter(o=>o.id!==l)}function He(t,l,o){let i=!1,r=(t||[]).map(c=>c.id!==l?c:(i=!0,o(c)));return i?r:t}var An="json",xt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function yt(t){let l=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${xt}
\`\`\`${An}
${l}
\`\`\``}function Pe(t){if(!t)return null;let l=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),o=!l&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),i=(l?l[1]:o?o[1]:t).trim();if(!i)return null;try{return JSON.parse(i)}catch{return null}}function Un(t){if(!Array.isArray(t))return[];let l=[];for(let o of t)try{l.push(ve(o))}catch{}return l}async function we(t,l,o){let i=await t.getNoteContent({uuid:l}),r=Le(i,_),c=Pe(r);return!c||typeof c!="object"?[]:Un(c[o])}async function Et(t,l,o,i){let r={uuid:l},c=await t.getNoteContent(r),n=Le(c,_),k={...Pe(n)||{},[o]:i},S=yt(k);n===null&&await t.insertNoteContent(r,`

# ${_}

`,{atEnd:!0});let g=Hn(c,S);if(g!==null){await t.replaceNoteContent(r,g);return}await t.replaceNoteContent(r,S,{section:{heading:{text:_,level:1}}})}async function Ct(t,l,o){let i={uuid:l},r=await t.getNoteContent(i),c=Le(r,_);if(c===null)return;let n=Pe(c)||{};if(!(o in n))return;let h={...n};delete h[o],await t.replaceNoteContent(i,yt(h),{section:{heading:{text:_,level:1}}})}function Re(t,l){let o=/^#\s+(.*)$/,i=t.findIndex(c=>{let n=c.match(o);return n&&n[1].trim()===l});if(i===-1)return null;let r=t.length;for(let c=i+1;c<t.length;c++)if(/^#\s+/.test(t[c])){r=c;break}return{start:i,end:r}}function Le(t,l){if(!t)return null;let o=t.split(`
`),i=Re(o,l);return i?o.slice(i.start+1,i.end).join(`
`).trim():null}function Dn(t){if(!t)return"";let l=t,o=l.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return o&&(l=l.replace(o[0],"")),l=l.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),l=l.replace(xt,""),l.trim()}function kt(t,l){return String(t||"").includes("](plugin://")?l:`---

${l}`}function St(t,l){let o=(t||"").split(`
`),i=Re(o,_);if(!i)return null;let r=o.slice(0,i.start).join(`
`).replace(/\s+$/,""),c=o.slice(i.start).join(`
`);return`${r?r+`

`:""}${l}

${c}`}function Hn(t,l){let o=(t||"").split(`
`),i=Re(o,_);if(!i)return null;let r=Dn(o.slice(i.start+1,i.end).join(`
`).trim());if(!r)return null;let c=o.slice(0,i.start).join(`
`).replace(/\s+$/,""),n=o.slice(i.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${r}

${o[i.start]}

${l}${n?`

`+n:""}`}function Nt(t){return/^\s*>/.test(t)}function It(t,l,o,i){if(!t||!l||!i)return null;for(let r=0;r<t.length;r++){let c=t[r];if(!c.includes(`](plugin://${l}`)||o&&!c.includes(`att=${o}`)||!new RegExp(`hl=${Pn(i)}(?![\\w-])`).test(c))continue;let n=r+1;for(n<t.length&&t[n].trim()===""&&n+1<t.length&&Nt(t[n+1])&&n++;n<t.length&&Nt(t[n]);)n++;return{start:r,end:n}}return null}function Pn(t){return String(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Rn(t,l,o){if(!t||!l)return[];let i=[],r=String(t).split(`
`);for(let c of r){if(!c.includes(`](plugin://${l}`)||o&&!c.includes(`att=${o}`))continue;let n=c.match(/[?&]hl=([^&)\s]+)/);n&&i.indexOf(n[1])===-1&&i.push(n[1])}return i}function Tt(t,l,o,i){let r=String(t||"").split(`
`),c=It(r,l,o,i);if(!c)return null;let{start:n,end:h}=c;h<r.length&&r[h].trim()===""&&h++;let k=r.slice(0,n).concat(r.slice(h));return Rn(k.join(`
`),l,o).length?k.join(`
`):Ln(k).join(`
`)}function Ln(t){let l=t.findIndex(o=>o.trim()===`# ${_}`);l===-1&&(l=t.length);for(let o=l-1;o>=0;o--){let i=t[o].trim();if(i==="")continue;if(i!=="---")return t;let r=t.slice(0,o).concat(t.slice(o+1)),c=o;for(;c<r.length&&r[c].trim()===""&&(c===0||r[c-1].trim()==="");)r.splice(c,1);return r}return t}function Me(t,l,o,i,r){let c=String(t||"").split(`
`),n=It(c,l,o,i);return n?c.slice(0,n.start).concat(String(r).split(`
`),c.slice(n.end)).join(`
`):null}function V(t,l){return l.noteUUID||t.context.noteUUID}async function At(t,l,o){try{let i=await t.getNoteAttachments({uuid:l}),r=Array.isArray(i)&&i.find(c=>c&&c.uuid===o);return r?r.name:""}catch{return""}}async function be(t,l,o,i){let r=await we(t,l,o),c=i(r);return c!==r&&await Et(t,l,o,c),{highlights:c}}async function Ut(t,l,o,i){if(o.pluginUUID)try{let r=await t.getNoteContent({uuid:l}),c=i(r);c!==null&&c!==r&&await t.replaceNoteContent({uuid:l},c)}catch{}}function Dt(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let l=t.trim();if(!l.startsWith("{"))return{action:l};try{return JSON.parse(l)}catch{return{action:l}}}async function Ht(t,l){return JSON.stringify(await Mn(t,Dt(l)))}async function Mn(t,l){let o=Dt(l);switch(o.action){case"getPdfUrl":{let i=o.attachmentUUID;if(!i)return{error:"No attachment specified for this viewer."};try{return{url:await st(t,i),name:await At(t,V(t,o),i)}}catch(r){return{error:`Could not load the PDF: ${r.message}`}}}case"loadHighlights":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=V(t,o);return{highlights:await we(t,i,o.attachmentUUID)}}catch(i){return{error:`Could not load highlights: ${i.message}`}}}case"addHighlight":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=ve(o.highlight||{});return await be(t,V(t,o),o.attachmentUUID,r=>r.concat([i]))}catch(i){return{error:`Could not save the highlight: ${i.message}`}}}case"recolorHighlight":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=V(t,o),r=await be(t,i,o.attachmentUUID,c=>He(c,o.id,n=>wt(n,o.color)));return o.exportBlock&&await Ut(t,i,o,c=>Me(c,o.pluginUUID,o.attachmentUUID,o.id,o.exportBlock)),r}catch(i){return{error:`Could not change the highlight color: ${i.message}`}}}case"setHighlightNote":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await be(t,V(t,o),o.attachmentUUID,i=>He(i,o.id,r=>vt(r,o.note)))}catch(i){return{error:`Could not save the note: ${i.message}`}}}case"removeHighlight":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let i=V(t,o),r=await be(t,i,o.attachmentUUID,c=>bt(c,o.id));return await Ut(t,i,o,c=>Tt(c,o.pluginUUID,o.attachmentUUID,o.id)),r}catch(i){return{error:`Could not remove the highlight: ${i.message}`}}}case"sendToNote":{if(!o.content)return{error:"Nothing to send."};try{let i={uuid:V(t,o)},r=await t.getNoteContent(i);if(o.highlightId){let h=Me(r,o.pluginUUID,o.attachmentUUID,o.highlightId,o.content);if(h!==null)return await t.replaceNoteContent(i,h),{ok:!0,replaced:!0}}let c=kt(r,o.content),n=St(r,c);return n===null?await t.insertNoteContent(i,`
`+c+`
`,{atEnd:!0}):await t.replaceNoteContent(i,n),{ok:!0}}catch(i){return{error:`Could not add this to the note: ${i.message}`}}}case"removeViewer":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!o.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=V(t,o),r=await t.getNoteContent({uuid:i}),c=ge(r,o.pluginUUID,o.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:i},c),await Ct(t,i,o.attachmentUUID),{ok:!0})}catch(i){return{error:`Could not remove this viewer: ${i.message}`}}}case"getViewerSummary":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};let i=V(t,o),r=await At(t,i,o.attachmentUUID);try{let c=await we(t,i,o.attachmentUUID);return{name:r,count:c.length}}catch{return{name:r,count:0}}}case"setCollapsed":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!o.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=V(t,o),r=await t.getNoteContent({uuid:i}),c=ht(r,o.pluginUUID,o.attachmentUUID,o.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},c),{ok:!0})}catch(i){return{error:`Could not resize this viewer: ${i.message}`}}}case"clearDeepLink":{if(!o.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!o.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let i=V(t,o),r=await t.getNoteContent({uuid:i}),c=se(r,o.pluginUUID,o.attachmentUUID,{page:null,highlightId:null});return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:i},c),{ok:!0})}catch(i){return{error:`Could not clear this viewer's deep link: ${i.message}`}}}case"exportAll":{if(!o.noteName)return{error:"Missing destination note name."};try{let i=await t.findNote({name:o.noteName}),r=i?i.uuid:await t.createNote(o.noteName);return await t.replaceNoteContent({uuid:r},o.content||""),{ok:!0,noteUUID:r}}catch(i){return{error:`Could not export highlights: ${i.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(o.action)}`}}}var G={chevronLeft:"M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",chevronRight:"M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",remove:"M19 13H5v-2h14v2z",add:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",moreVert:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",listBulleted:"M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",arrowUp:"M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z",arrowDown:"M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"},Pt={note:"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z",copy:"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",send:"M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",remove:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",download:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",postAdd:"M17 19.22H5V7h7V5H5c-1.1 0-2 .9-2 2v12.22c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h-2v7.22zM19 2h-2v3h-3v2h3v3h2V7h3V5h-3V2zM7 9h8v2H7zm0 3v2h8v-2H7zm0 3h5v2H7z",collapse:"M7.41 18.59 8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.42 5.41 12 10l4.59-4.59z"};function W(t){return'<svg class="pdfa-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+t+'"></path></svg>'}function ze(){function t(p,f){return{x:p.left-f.left,y:p.top-f.top,width:p.width,height:p.height}}function l(p,f){return{x:Math.min(p[0],f[0]),y:Math.min(p[1],f[1]),width:Math.abs(f[0]-p[0]),height:Math.abs(f[1]-p[1])}}function o(p,f){var x=Math.pow(10,f===void 0?2:f),w=function(y){return Math.round(y*x)/x};return{x:w(p.x),y:w(p.y),width:w(p.width),height:w(p.height)}}function i(p){return p.width>.01&&p.height>.01}function r(p,f,x){for(var w=String(p??""),y=Math.max(0,f===void 0?0:f),E=Math.min(w.length,x===void 0?w.length:x),I=function(B){return B===""||/\s/.test(B)},A=[],U=y;U<E;){for(;U<E&&I(w.charAt(U));)U++;if(U>=E)break;for(var O=U;U<E&&!I(w.charAt(U));)U++;A.push({start:O,end:U})}return A}function c(p){for(var f=1/0,x=1/0,w=-1/0,y=-1/0,E=0;E<(p?p.length:0);E++){var I=p[E];i(I)&&(f=Math.min(f,I.left),x=Math.min(x,I.top),w=Math.max(w,I.left+I.width),y=Math.max(y,I.top+I.height))}return isFinite(f)?{left:f,top:x,width:w-f,height:y-x}:null}function n(p,f,x){for(var w=[],y=0;y<p.length;y++){var E=t(p[y],f);if(i(E)){var I=x(E.x,E.y),A=x(E.x+E.width,E.y+E.height),U=o(l(I,A));i(U)&&w.push(U)}}return w}function h(p,f){var x=f(p.x,p.y),w=f(p.x+p.width,p.y+p.height);return l(x,w)}function k(p,f,x){var w=f.right-f.left,y=f.bottom-f.top;if(w<=0||y<=0)return null;var E=p.x2-p.x1,I=p.y2-p.y1,A=p.x1+(x.left-f.left)/w*E,U=p.x2-(f.right-x.right)/w*E,O=p.y1+(x.bottom-f.bottom)/y*I,B=p.y2-(f.top-x.top)/y*I;return{x:A,y:O,width:U-A,height:B-O}}function S(p,f){var x=Math.min(p.y+p.height,f.y+f.height)-Math.max(p.y,f.y);return x>.5*Math.min(p.height,f.height)}function g(p,f){var x=f===void 0?.6:f;if(!p||p.length<2)return(p||[]).slice();for(var w=p.slice().sort(function(X,j){return j.y-X.y||X.x-j.x}),y=[],E=0;E<w.length;E++){for(var I=!1,A=0;A<y.length;A++)if(S(y[A][0],w[E])){y[A].push(w[E]),I=!0;break}I||y.push([w[E]])}for(var U=[],O=0;O<y.length;O++){for(var B=y[O].slice().sort(function(X,j){return X.x-j.x}),D=null,J=0;J<B.length;J++){var L=B[J];if(D===null){D={x:L.x,y:L.y,width:L.width,height:L.height};continue}var ye=L.x-(D.x+D.width);if(ye<=x*Math.max(D.height,L.height)){var le=Math.max(D.x+D.width,L.x+L.width),oe=Math.max(D.y+D.height,L.y+L.height);D.x=Math.min(D.x,L.x),D.y=Math.min(D.y,L.y),D.width=le-D.x,D.height=oe-D.y}else U.push(D),D={x:L.x,y:L.y,width:L.width,height:L.height}}D!==null&&U.push(D)}return U.map(function(X){return o(X)})}function C(p,f,x,w){var y=w===void 0?0:w;return f>=p.x-y&&f<=p.x+p.width+y&&x>=p.y-y&&x<=p.y+p.height+y}function N(p,f,x,w,y){for(var E=p||[],I=E.length-1;I>=0;I--){var A=E[I];if(!(!A||A.page!==f||!A.rects)){for(var U=0;U<A.rects.length;U++)if(C(A.rects[U],x,w,y===void 0?1:y))return A}}return null}function b(p){return String(p??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:l,roundRect:o,isVisibleRect:i,textTokenRanges:r,unionClientRects:c,clientRectsToPdfRects:n,pdfRectToViewportRect:h,itemRelativeRect:k,mergeLineRects:g,rectContainsPoint:C,hitTestHighlights:N,normalizeQuoteText:b}}var F=ze(),xo=F.clientRectToLocal,yo=F.rectFromCorners,Eo=F.roundRect,Co=F.isVisibleRect,ko=F.textTokenRanges,So=F.unionClientRects,No=F.clientRectsToPdfRects,Io=F.pdfRectToViewportRect,To=F.itemRelativeRect,Ao=F.mergeLineRects,Uo=F.rectContainsPoint,Do=F.hitTestHighlights,Ho=F.normalizeQuoteText;function Oe(){var t=[.957,.871,.424];function l(n,h,k,S,g){var C=h.context.register(h.context.obj({Type:n.PDFName.of("ExtGState"),BM:n.PDFName.of("Multiply"),ca:n.PDFNumber.of(.4)})),N=[n.pushGraphicsState(),n.setGraphicsState("GS0")];N.push(n.setFillingColor(n.rgb(S[0],S[1],S[2])));for(var b=0;b<k.length;b++){var p=k[b];N.push(n.moveTo(p.x,p.y)),N.push(n.lineTo(p.x,p.y+p.height)),N.push(n.lineTo(p.x+p.width,p.y+p.height)),N.push(n.lineTo(p.x+p.width,p.y)),N.push(n.closePath())}N.push(n.fill()),N.push(n.popGraphicsState());var f=h.context.formXObject(N,{BBox:g,Resources:{ExtGState:{GS0:C}}});return h.context.register(f)}function o(n,h,k,S){for(var g=8,C=220,N=String(n||""),b=0,p=N.split(/\r?\n/),f=0;f<p.length;f++)b+=Math.max(1,Math.ceil(p[f].length/45));var x=Math.max(72,Math.min(22+b*14,260)),w=h.maxX+g;w+C>k-g&&(w=k-g-C),w<g&&(w=g);var y=h.maxY;y>S-g&&(y=S-g);var E=y-x;return E<g&&(E=g,y=Math.min(E+x,S-g)),[w,E,w+C,y]}function i(n,h,k,S,g){for(var C=k.rects,N=[],b=C[0].x,p=C[0].y,f=C[0].x+C[0].width,x=C[0].y+C[0].height,w=0;w<C.length;w++){var y=C[w],E=y.x,I=y.x+y.width,A=y.y,U=y.y+y.height;N.push(E,U,I,U,E,A,I,A),b=Math.min(b,E),p=Math.min(p,A),f=Math.max(f,I),x=Math.max(x,U)}var O=h.context.obj({Type:n.PDFName.of("Annot"),Subtype:n.PDFName.of("Highlight"),Rect:h.context.obj([b,p,f,x]),QuadPoints:h.context.obj(N),C:h.context.obj(S),F:n.PDFNumber.of(4),T:n.PDFString.of("PDF Annotator"),M:n.PDFString.of(new Date().toISOString()),CA:n.PDFNumber.of(.4)});k.note&&O.set(n.PDFName.of("Contents"),n.PDFString.of(k.note));var B=l(n,h,C,S,[b,p,f,x]);O.set(n.PDFName.of("AP"),h.context.obj({N:B}));var D=h.context.register(O),J=[D];if(k.note){var L=h.context.register(h.context.obj({Type:n.PDFName.of("Annot"),Subtype:n.PDFName.of("Popup"),Rect:h.context.obj(o(k.note,{maxX:f,maxY:x},g&&g.width||612,g&&g.height||792)),Parent:D,Open:!1}));O.set(n.PDFName.of("Popup"),L),J.push(L)}return J}function r(n,h,k){var S=h.node.get(n.PDFName.of("Annots"));if(S instanceof n.PDFArray)for(var g=0;g<k.length;g++)S.push(k[g]);else h.node.set(n.PDFName.of("Annots"),h.doc.context.obj(k))}async function c(n,h,k,S){for(var g=await n.PDFDocument.load(h),C=g.getPages(),N=k||[],b=0;b<N.length;b++){var p=N[b];if(!(!p||!p.rects||!p.rects.length)){var f=C[p.page-1];if(f){var x=S&&S[p.color]||t,w=i(n,g,p,x,f.getSize());r(n,f,w)}}}return g.save()}return{writeHighlightsIntoPdf:c,buildHighlightAnnotation:i,appendAnnotationRefs:r}}var $e=Oe(),Ro=$e.writeHighlightsIntoPdf,Lo=$e.buildHighlightAnnotation,Mo=$e.appendAnnotationRefs;function Fe(){function t(g){return String(g??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function l(g,C,N,b,p){var f=new URLSearchParams;C&&f.set("att",C),Number.isFinite(N)&&N>=1&&f.set("page",String(Math.floor(N))),b&&f.set("hl",b),p&&f.set("note",p);var x=f.toString();return"plugin://"+g+(x?"?"+x:"")}function o(g,C){return String(g??"").split(/\r?\n/).map(function(N){return(C+" "+N).replace(/[ \t]+$/,"")})}function i(g,C){return C?'<mark style="background-color:'+C+';">'+g+"</mark>":g}function r(g,C,N,b,p,f){var x=l(C,N,b.page,b.id,f),w=i(t(g||"PDF"),p),y="["+w+"]("+x+")",E=[y].concat(o(b.quoteText,"> >"));return b.note&&(E.push(">"),E=E.concat(o(b.note,">"))),E.join(`
`)}function c(g){return String(g??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function n(g){return"<p>"+c(g).replace(/\r?\n/g,"<br>")+"</p>"}function h(g,C,N,b,p,f){var x=l(C,N,b.page,b.id,f),w=c(g||"PDF"),y=p?'<mark style="background-color: '+c(p)+';">'+w+"</mark>":w,E='<p><a href="'+c(x)+'">'+y+"</a></p>",I="<blockquote><blockquote>"+n(b.quoteText)+"</blockquote></blockquote>",A=b.note?"<blockquote>"+n(b.note)+"</blockquote>":"";return E+I+A}function k(g){return g.slice().sort(function(C,N){if(C.page!==N.page)return C.page-N.page;var b=C.rects&&C.rects[0]?C.rects[0].y:0,p=N.rects&&N.rects[0]?N.rects[0].y:0;return p-b})}function S(g,C,N,b,p,f,x){var w=f&&f.length?f:null,y=(b||[]).filter(function(A){return A&&(!w||w.indexOf(A.color)!==-1)}),E=k(y),I=E.map(function(A){var U=p&&p[A.color]||{};return r(g,C,N,A,U.hex,x)});return I.join(`

`)}return{buildDeepLink:l,buildHighlightBlock:r,buildHighlightHtml:h,buildExportAllContent:S}}var xe=Fe(),Oo=xe.buildDeepLink,$o=xe.buildHighlightBlock,Fo=xe.buildHighlightHtml,Bo=xe.buildExportAllContent;function Rt(){var t=window.__PDFA_CONFIG||{},l=window.__PDFA_GEOM||{},o=window.__PDFA_ANNOTATIONS||{},i=window.__PDFA_EXPORT||{},r={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(n.attachmentName=e,r.name&&(r.name.textContent=e),r.collapsedName&&(r.collapsedName.textContent=e))}var n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function h(e,a){r.status.textContent=e||"",r.status.style.display=e?"block":"none",r.status.className=a?"pdfa-status pdfa-error":"pdfa-status"}function k(e){var a=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(s,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");s(window.callAmplenotePlugin(JSON.stringify(a)))}catch(u){d(u)}}).then(function(s){if(s&&typeof s=="object")return s;if(typeof s!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(s)}catch{throw new Error("Unreadable reply from the plugin: "+String(s).slice(0,120))}})}function S(){return t.colors||[]}function g(e){for(var a=S(),s=0;s<a.length;s++)if(a[s].id===e)return a[s].hex;return a.length?a[0].hex:"#F4DE6C"}function C(e){for(var a=0;a<n.highlights.length;a++)if(n.highlights[a].id===e)return n.highlights[a];return null}function N(e){var a=(t.icons||{})[e];if(!a)return null;var s="http://www.w3.org/2000/svg",d=document.createElementNS(s,"svg");d.setAttribute("class","pdfa-icon"),d.setAttribute("viewBox","0 0 24 24"),d.setAttribute("aria-hidden","true");var u=document.createElementNS(s,"path");return u.setAttribute("d",a),d.appendChild(u),d}function b(e,a,s,d){var u=document.createElement("button");u.className="pdfa-btn"+(a?" "+a:"");var m=d?N(d):null;if(m){u.appendChild(m);var v=document.createElement("span");v.textContent=e,u.appendChild(v)}else u.textContent=e;return u.onclick=function(T){T.stopPropagation(),s()},u}function p(e,a,s,d){var u=document.createElement("button");return u.className="pdfa-color",u.dataset.color=e.id,u.style.background=e.hex,u.title=d+" "+e.label,u.setAttribute("aria-label",d+" "+e.label),u.setAttribute("aria-pressed",String(!!a)),u.onclick=function(m){m.stopPropagation(),s(e.id)},u}function f(){for(var e=S(),a=0;a<e.length;a++)r.colors.appendChild(p(e[a],e[a].id===n.activeColorId,function(s){n.activeColorId=s,x(),n.pendingSelection&&_e(n.pendingSelection,s)},"Highlight"))}function x(){for(var e=r.colors.querySelectorAll(".pdfa-color"),a=0;a<e.length;a++)e[a].setAttribute("aria-pressed",String(e[a].dataset.color===n.activeColorId))}function w(){for(var e=[],a=1;a<=n.pageCount;a++)(function(s){e.push(n.doc.getPage(s).then(function(d){n.viewports[s]=d.getViewport({scale:n.scale})}))})(a);return Promise.all(e)}function y(e){var a=n.viewports[e],s=document.createElement("div");return s.className="pdfa-page",s.dataset.page=String(e),s.style.width=a.width+"px",s.style.height=a.height+"px",s}function E(e,a){if(n.rendered[a]||n.renderingPage[a])return Promise.resolve();n.renderingPage[a]=!0;var s=n.viewports[a],d=document.createElement("canvas"),u=window.devicePixelRatio||1;d.width=Math.floor(s.width*u),d.height=Math.floor(s.height*u),d.style.width=s.width+"px",d.style.height=s.height+"px",e.appendChild(d);var m=document.createElement("div");m.className="pdfa-highlights",e.appendChild(m);var v=document.createElement("div");v.className="textLayer",v.style.width=s.width+"px",v.style.height=s.height+"px",v.style.setProperty("--scale-factor",String(n.scale)),e.appendChild(v);var T=d.getContext("2d");T.scale(u,u);var P=null;return n.doc.getPage(a).then(function(R){return P=R,R.render({canvasContext:T,viewport:s}).promise}).then(function(){return P.getTextContent()}).then(function(R){var H=[];return window.pdfjsLib.renderTextLayer({textContent:R,container:v,viewport:s,textDivs:H}).promise.then(function(){n.textSpans+=H.length;for(var M=0;M<H.length;M++)H[M].__pdfaItem=R.items[M];n.rendered[a]=!0,n.renderingPage[a]=!1,B(a),A()})}).catch(function(R){n.renderingPage[a]=!1,h("Failed to render page "+a+": "+(R.message||R),!0)})}function I(){var e=Q();if(!e||!n.doc)return Promise.resolve();for(var a=e.getBoundingClientRect(),s=e.clientHeight,d=r.pages.querySelectorAll(".pdfa-page"),u=[],m=0;m<d.length;m++){var v=d[m],T=Number(v.dataset.page);if(!(n.rendered[T]||n.renderingPage[T])){var P=v.getBoundingClientRect(),R=P.top-a.top,H=P.bottom-a.top;H<-s||R>e.clientHeight+s||u.push(E(v,T))}}return Promise.all(u)}function A(){var e=0;for(var a in n.rendered)n.rendered[a]&&e++;if(e){var s=n.textSpans===0;h(s?"No selectable text found - this PDF may be a scan.":"",s)}}function U(){if(n.rendering)return Promise.resolve();n.rendering=!0,z(!0),h("Rendering...");var e=Q(),a=e?e.scrollHeight-e.clientHeight:0,s=a>0?e.scrollTop/a:0;return r.pages.innerHTML="",n.viewports={},n.rendered={},n.renderingPage={},n.textSpans=0,w().then(function(){for(var d=1;d<=n.pageCount;d++)r.pages.appendChild(y(d));if(e){var u=e.scrollHeight-e.clientHeight;e.scrollTop=s*(u>0?u:0)}n.rendering=!1,ae(),re(),I()}).catch(function(d){n.rendering=!1,h("Failed to render: "+(d.message||d),!0)})}function O(e){return function(a,s){return e.convertToViewportPoint(a,s)}}function B(e){for(var a=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",s=r.pages.querySelectorAll(a),d=0;d<s.length;d++){var u=s[d],m=Number(u.dataset.page),v=u.querySelector(".pdfa-highlights"),T=n.viewports[m];if(!(!v||!T)){v.innerHTML="";for(var P=O(T),R=0;R<n.highlights.length;R++){var H=n.highlights[R];if(!(!H||H.page!==m||!H.rects||!H.rects.length)){var M=document.createElement("div");M.className="pdfa-hl-group",M.dataset.id=H.id||"";for(var Y=0;Y<H.rects.length;Y++){var ee=l.pdfRectToViewportRect(H.rects[Y],P),$=document.createElement("div");$.className="pdfa-hl",$.style.left=ee.x+"px",$.style.top=ee.y+"px",$.style.width=ee.width+"px",$.style.height=ee.height+"px",$.style.background=g(H.color),M.appendChild($)}v.appendChild(M)}}}}}function D(){B(),L(),r.count.textContent=String(n.highlights.length)}function J(){return n.highlights.slice().sort(function(e,a){return e.page!==a.page?e.page-a.page:(a.rects[0]?a.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function L(){r.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var a=document.createElement("span");a.textContent="Highlights",e.appendChild(a),e.appendChild(b("Close","",function(){le(!1)})),r.panel.appendChild(e);var s=J();if(!s.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",r.panel.appendChild(d);return}for(var u=0;u<s.length;u++)r.panel.appendChild(ye(s[u]))}function ye(e){var a=document.createElement("div");a.className="pdfa-hl-row",a.dataset.id=e.id||"",a.title="Jump to this highlight";var s=document.createElement("span");s.className="pdfa-chip",s.style.background=g(e.color),a.appendChild(s);var d=document.createElement("div"),u=document.createElement("div");u.className="pdfa-hl-page",u.textContent="Page "+e.page,d.appendChild(u);var m=document.createElement("div");if(m.className="pdfa-hl-quote",m.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(m),e.note){var v=document.createElement("div");v.className="pdfa-hl-note",v.textContent=e.note,d.appendChild(v)}return a.appendChild(d),a.onclick=function(){We(e)},a}function le(e){var a=e===void 0?!r.panel.classList.contains("pdfa-open"):e;r.panel.classList.toggle("pdfa-open",a),r.listToggle.setAttribute("aria-pressed",String(a)),a&&L(),re()}function oe(e){for(var a=e&&e.nodeType===1?e:e&&e.parentElement;a;){if(a.classList&&a.classList.contains("textLayer"))return a;a=a.parentElement}return null}function X(e,a){for(var s=[],d=[],u=null,m=document.createTreeWalker(a,NodeFilter.SHOW_TEXT,null),v;v=m.nextNode();)if(e.intersectsNode(v)){var T=v.nodeValue||"",P=v===e.startContainer?e.startOffset:0,R=v===e.endContainer?e.endOffset:T.length,H=v.parentElement,M=H&&H.__pdfaItem;if(M)for(var Y={x1:M.transform[4],y1:M.transform[5],x2:M.transform[4]+M.width,y2:M.transform[5]+M.height},ee=H.getBoundingClientRect(),$=l.textTokenRanges(T,P,R),te=0;te<$.length;te++){var Ue=document.createRange();Ue.setStart(v,$[te].start),Ue.setEnd(v,$[te].end);var q=l.unionClientRects(Ue.getClientRects());if(q){var tt={left:q.left,top:q.top,width:q.width,height:q.height,right:q.left+q.width,bottom:q.top+q.height},nt=l.itemRelativeRect(Y,ee,tt);nt&&(s.push(nt),d.push(T.slice($[te].start,$[te].end)),u=tt)}}}return{rects:s,text:d.join(" "),lastCssRect:u}}function j(e){if(n.pendingSelection=e,n.lastCapturedText=e&&e.rawText||"",!e){r.hint.textContent="",r.hint.style.display="none";return}r.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",r.hint.style.display="inline"}function Be(e){if(!n.noteEditing){var a=window.getSelection();if(!a||a.isCollapsed||a.rangeCount===0){j(null),z();return}var s=a.getRangeAt(0),d=oe(s.startContainer);if(!d)return j(null);var u=d.parentElement;if(!u||!u.dataset||!u.dataset.page)return j(null);var m=Number(u.dataset.page);if(!n.rendered[m])return j(null);var v=oe(s.endContainer)!==d,T=X(s,d),P=l.mergeLineRects(T.rects);if(!P.length)return j(null);var R=T.lastCssRect||u.getBoundingClientRect(),H=e&&e.clientX?e.clientX:R.left+R.width/2,M=e&&e.clientY?e.clientY:R.top+R.height,Y={page:m,rects:P,quoteText:l.normalizeQuoteText(T.text),spilled:v,anchorX:H,anchorY:M,rawText:String(a)};j(Y),jt(Y)}}var Ot=300,Z=null;function $t(){n.noteEditing||(Z&&clearTimeout(Z),Z=setTimeout(je,Ot))}function je(){if(Z=null,!n.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||oe(e.getRangeAt(0).startContainer)&&String(e)!==n.lastCapturedText&&Be(null)}}function de(e,a){var s=n.highlights;return n.highlights=e,D(),k(a).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return n.highlights=d.highlights||e,D(),h(""),!0}).catch(function(d){return n.highlights=s,D(),h(d.message||String(d),!0),!1})}function _e(e,a){var s={id:null,page:e.page,color:a,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,u=e.anchorY;j(null),z(!0);var m=window.getSelection();m&&m.removeAllRanges&&m.removeAllRanges(),de(n.highlights.concat([s]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:s}).then(function(v){if(v){var T=n.highlights[n.highlights.length-1];T&&T.id&&Ce(T,d,u,!0)}})}function Ft(e,a){z(!0);for(var s=n.highlights.map(function(m){return m.id===e?Object.assign({},m,{color:a}):m}),d=null,u=0;u<s.length;u++)s[u].id===e&&(d=s[u]);de(s,{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e,color:a,exportBlock:d?Ae(d):null})}function Bt(e){z(!0),de(n.highlights.filter(function(a){return a.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e})}function Ee(e,a){var s=String(a??"").trim();n.noteEditing=null,z(!0),de(n.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:s||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:s})}function K(e,a,s,d){r.popover.innerHTML="",r.popover.classList.toggle("pdfa-editing",d==="editing"),r.popover.classList.toggle("pdfa-exporting",d==="exporting"),r.popover.classList.toggle("pdfa-menu",d==="menu");for(var u=0;u<e.length;u++)r.popover.appendChild(e[u]);r.popover.classList.add("pdfa-open");var m=r.popover.offsetWidth,v=r.popover.offsetHeight,T=Math.max(4,Math.min(a-m/2,window.innerWidth-m-4)),P=s+12;P+v>window.innerHeight-4&&(P=Math.max(4,s-v-12)),P=Math.max(4,Math.min(P,window.innerHeight-v-4)),r.popover.style.left=T+"px",r.popover.style.top=P+"px"}function z(e){n.noteEditing&&!e||(n.noteEditing=null,r.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),r.popover.innerHTML="")}function jt(e){for(var a=S(),s=[],d=0;d<a.length;d++)s.push(p(a[d],a[d].id===n.activeColorId,function(u){n.activeColorId=u,x(),_e(e,u)},"Highlight"));K(s,e.anchorX,e.anchorY)}function Ce(e,a,s,d){for(var u=S(),m=[],v=0;v<u.length;v++)m.push(p(u[v],u[v].id===e.color,function(P){Ft(e.id,P)},"Change to"));var T=!!e.note;m.push(b(T?"Edit note":"Add note",d&&!T?"pdfa-btn-primary":"",function(){Vt(e,a,s)},"note")),m.push(b("Copy","",function(){on(e)},"copy")),m.push(b("Send to note","",function(){an(e)},"send")),m.push(b("Remove","pdfa-remove",function(){Bt(e.id)},"remove")),K(m,a,s)}function _t(e,a){for(var s=S(),d={},u=0;u<s.length;u++)d[s[u].id]=!0;var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Export highlights to a note";var v=document.createElement("div");v.className="pdfa-export-colors";for(var T=0;T<s.length;T++)(function(R){var H=p(R,!0,function(M){d[M]=!d[M],H.setAttribute("aria-pressed",String(d[M]))},"Toggle");v.appendChild(H)})(s[T]);var P=document.createElement("div");P.className="pdfa-note-actions",P.appendChild(b("Create / update note","pdfa-btn-primary",function(){for(var R=[],H=0;H<s.length;H++)d[s[H].id]&&R.push(s[H].id);rn(R.length===s.length?null:R)})),K([m,v,P],e,a,"exporting")}function Vt(e,a,s){n.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var u=document.createElement("div");u.className="pdfa-note-actions",e.note&&u.appendChild(b("Delete note","",function(){Ee(e.id,"")}));var m=document.createElement("span");m.className="pdfa-spacer",u.appendChild(m),u.appendChild(b("Cancel","",function(){Ve(e,a,s)})),u.appendChild(b("Save","pdfa-btn-primary",function(){Ee(e.id,d.value)})),d.onkeydown=function(v){v.key==="Enter"&&(v.ctrlKey||v.metaKey)?(v.preventDefault(),v.stopPropagation(),Ee(e.id,d.value)):v.key==="Escape"&&(v.preventDefault(),v.stopPropagation(),Ve(e,a,s))},K([d,u],a,s,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function Ve(e,a,s){n.noteEditing=null;var d=C(e.id)||e;Ce(d,a,s)}function qt(e){if(!n.noteEditing){var a=window.getSelection();if(!(a&&!a.isCollapsed)){for(var s=e.target,d=null;s&&s!==r.pages;){if(s.classList&&s.classList.contains("pdfa-page")){d=s;break}s=s.parentElement}if(!d)return z();var u=Number(d.dataset.page),m=n.viewports[u];if(!m)return z();var v=d.getBoundingClientRect(),T=m.convertToPdfPoint(e.clientX-v.left,e.clientY-v.top),P=l.hitTestHighlights(n.highlights,u,T[0],T[1],1);P&&P.id?Ce(P,e.clientX,e.clientY):z()}}}function ke(){return Math.round(n.scale*100)+"%"}function ae(){r.pageLabel.textContent=n.current+" / "+n.pageCount,document.activeElement!==r.zoomLabel&&(r.zoomLabel.value=ke())}function Q(){return r.root.querySelector(".pdfa-scroll")}function qe(){return r.panel&&r.panel.classList.contains("pdfa-open")?r.panel:Q()}function Ge(e){var a=r.pages.querySelector('.pdfa-page[data-page="'+e+'"]');a&&E(a,e)}function Se(e){var a=Math.min(Math.max(1,e),n.pageCount),s=r.pages.querySelector('.pdfa-page[data-page="'+a+'"]');Ge(a);var d=Q();s&&d&&(d.scrollTop+=s.getBoundingClientRect().top-d.getBoundingClientRect().top),I(),n.current=a,ae()}function We(e){var a=r.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),s=n.viewports[e.page];if(!(!a||!s||!e.rects||!e.rects.length)){var d=l.pdfRectToViewportRect(e.rects[0],O(s)),u=Q(),m=a.getBoundingClientRect().top+d.y;u.scrollTop+=m-u.getBoundingClientRect().top-u.clientHeight/3,Ge(e.page),I(),n.current=e.page,ae()}}function Gt(){try{r.root.setAttribute("tabindex","-1"),r.root.focus(),r.root.scrollIntoView&&r.root.scrollIntoView({block:"nearest"})}catch{}}function Wt(e){if(!(!e||!e.id)){var a=r.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');a&&(a.classList.add("pdfa-hl-flash"),setTimeout(function(){a.classList.remove("pdfa-hl-flash")},2600))}}function Ne(e){return Math.min(Math.max(.4,e),4)}function Ie(e){return n.scale=Ne(e),U()}function Je(){var e=String(r.zoomLabel.value).replace(/[\s%]/g,""),a=/^\d*\.?\d+$/.test(e)?parseFloat(e):NaN;if(a>0){var s=Ne(a/100);s!==n.scale&&Ie(s)}r.zoomLabel.value=ke()}function Jt(){return n.doc?n.doc.getPage(1).then(function(e){var a=Q();if(a){var s=window.getComputedStyle(a),d=a.clientWidth-(parseFloat(s.paddingLeft)||0)-(parseFloat(s.paddingRight)||0),u=e.getViewport({scale:1}).width;if(!(!(d>0)||!(u>0))){var m=Ne(d/u);m<n.scale&&(n.scale=m,ae())}}}).catch(function(){}):Promise.resolve()}function Xe(e){var a=qe();a&&(a.scrollTop+=e*Math.max(80,a.clientHeight*.85),re(),I())}function Ye(e,a){var s=null,d=null,u=!1,m=function(){s&&clearTimeout(s),d&&clearInterval(d),s=d=null};e.addEventListener("pointerdown",function(){m(),u=!1,s=setTimeout(function(){u=!0,d=setInterval(function(){if(e.disabled)return m();Xe(a*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(v){e.addEventListener(v,m)}),e.onclick=function(){if(u){u=!1;return}Xe(a)}}function re(){var e=qe();if(!(!e||!r.scrollUp)){var a=e.scrollHeight-e.clientHeight;r.scrollUp.disabled=e.scrollTop<=1,r.scrollDown.disabled=e.scrollTop>=a-1}}function Xt(){re(),I(),z();for(var e=r.pages.querySelectorAll(".pdfa-page"),a=n.current,s=1/0,d=0;d<e.length;d++){var u=Math.abs(e[d].getBoundingClientRect().top-60);u<s&&(s=u,a=Number(e[d].dataset.page))}a!==n.current&&(n.current=a,ae())}function Yt(){return new Promise(function(e,a){if(window.pdfjsLib)return e(window.pdfjsLib);var s=document.createElement("script");s.src=t.pdfJsSrc,s.onload=function(){window.pdfjsLib?e(window.pdfjsLib):a(new Error("PDF.js loaded but did not register itself."))},s.onerror=function(){a(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(s)})}function Zt(){return new Promise(function(e,a){if(window.PDFLib)return e(window.PDFLib);var s=document.createElement("script");s.src=t.pdfLibSrc,s.onload=function(){window.PDFLib?e(window.PDFLib):a(new Error("pdf-lib loaded but did not register itself."))},s.onerror=function(){a(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(s)})}function Qt(){for(var e={},a=S(),s=0;s<a.length;s++)a[s].rgb&&(e[a[s].id]=a[s].rgb);return e}function Kt(){var e=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Te(){for(var e={},a=S(),s=0;s<a.length;s++)e[a[s].id]={hex:a[s].hex};return e}function Ze(){var e=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Ae(e){var a=Te()[e.color]||{};return i.buildHighlightBlock(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,a.hex,t.noteUUID)}function en(e){if(!i.buildHighlightHtml)return null;var a=Te()[e.color]||{};return i.buildHighlightHtml(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,a.hex,t.noteUUID)}function tn(e,a){var s=function(m){var v=m.clipboardData||window.clipboardData;v&&(v.setData("text/plain",e),a&&v.setData("text/html",a),m.preventDefault())},d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select(),document.addEventListener("copy",s,!0);var u=!1;try{u=document.execCommand("copy")}catch{u=!1}return document.removeEventListener("copy",s,!0),document.body.removeChild(d),u}function nn(e,a){var s=function(){return!navigator.clipboard||!navigator.clipboard.writeText?d():navigator.clipboard.writeText(e).then(function(){return"plain"},d)},d=function(){return tn(e,a)?Promise.resolve(a?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(a&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var u=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([a],{type:"text/html"})});return navigator.clipboard.write([u]).then(function(){return"rich"},s)}catch{return s()}return s()}function on(e){z(!0);var a,s;try{a=Ae(e),s=en(e)}catch(d){h("Could not build the copy: "+(d.message||d),!0);return}nn(a,s).then(function(d){h(d==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(d){h("Could not copy: "+(d.message||d),!0)})}function an(e){z(!0),k({action:"sendToNote",content:Ae(e),highlightId:e.id,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(a){if(!a||a.error)throw new Error(a&&a.error||"Could not send this to the note.");L(),h(a.replaced?"Updated this highlight where it already sits in the note.":"Added to this note, below the text.")}).catch(function(a){h(a.message||String(a),!0)})}function rn(e){z(!0);var a=i.buildExportAllContent(n.attachmentName,t.pluginUUID,t.attachmentUUID,n.highlights,Te(),e,t.noteUUID);if(!a){h(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}k({action:"exportAll",noteName:Ze(),content:a}).then(function(s){if(!s||s.error)throw new Error(s&&s.error||"Could not export highlights.");h('Exported to "'+Ze()+'".')}).catch(function(s){h(s.message||String(s),!0)})}function sn(e,a){var s=[];s.push(b("Collapse","",function(){z(!0),un()},"collapse"),b("Download","",function(){z(!0),cn()},"download"),b("Export...","",function(){_t(e,a)},"postAdd"),b("Remove viewer...","pdfa-remove",function(){ln(e,a)},"remove")),K(s,e,a,"menu")}function ln(e,a){var s=document.createElement("div");s.className="pdfa-export-hint",s.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(b("Cancel","",function(){z(!0)}));var u=document.createElement("span");u.className="pdfa-spacer",d.appendChild(u),d.appendChild(b("Remove","pdfa-remove",dn)),K([s,d],e,a,"exporting")}function dn(){z(!0),h("Removing this viewer..."),k({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){h(e.message||String(e),!0)})}function cn(){n.pdfBytes&&(h("Preparing the download..."),Zt().then(function(e){return o.writeHighlightsIntoPdf(e,n.pdfBytes,n.highlights,Qt())}).then(function(e){return hn(e,Kt())}).catch(function(e){h("Could not prepare the download: "+(e.message||e),!0)}))}function hn(e,a){var s=new Blob([e],{type:"application/pdf"}),d=null;try{d=new File([s],a,{type:"application/pdf"})}catch{}return d&&navigator.share&&navigator.canShare&&navigator.canShare({files:[d]})?navigator.share({files:[d],title:a}).then(function(){h("")}).catch(function(u){return u&&u.name==="AbortError"?h(""):Qe(s,a)}):Qe(s,a)}function Qe(e,a){var s=URL.createObjectURL(e),d=document.createElement("a");d.href=s,d.download=a,document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(s)},4e3);var u=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return h(u?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function pn(){return k({action:"loadHighlights",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");n.highlights=e.highlights||[]}).catch(function(e){n.highlights=[],h("Could not load saved highlights: "+(e.message||e),!0)})}function un(){var e=n.highlights.length;r.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",r.root.classList.add("pdfa-collapsed-mode"),Ke(!0)}function Ke(e){k({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function fn(){k({action:"clearDeepLink",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function gn(){r.root.classList.remove("pdfa-collapsed-mode"),n.doc||et(),Ke(!1)}function et(){h("Loading PDF..."),(t.highlightId||t.page)&&(Gt(),fn()),Yt().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,k({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return n.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return n.doc=e,n.pageCount=e.numPages,pn()}).then(function(){return Jt()}).then(function(){return U()}).then(function(){D();var e=t.highlightId?C(t.highlightId):null;e?(We(e),Wt(e)):t.page&&Se(t.page)}).catch(function(e){h(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){Se(n.current-1)},document.getElementById("pdfa-next").onclick=function(){Se(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){Ie(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){Ie(n.scale-.25)},r.zoomLabel.addEventListener("focus",function(){r.zoomLabel.value=String(Math.round(n.scale*100)),setTimeout(function(){document.activeElement===r.zoomLabel&&r.zoomLabel.select()},0)}),r.zoomLabel.addEventListener("blur",Je),r.zoomLabel.addEventListener("keydown",function(e){e.key==="Enter"?(e.preventDefault(),Je(),r.zoomLabel.blur()):e.key==="Escape"&&(e.preventDefault(),r.zoomLabel.value=ke(),r.zoomLabel.blur())}),Ye(r.scrollUp,-1),Ye(r.scrollDown,1),r.listToggle.onclick=function(){le()},r.more.onclick=function(e){sn(e.clientX,e.clientY)},Q().addEventListener("scroll",Xt),r.panel.addEventListener("scroll",re),r.pages.addEventListener("mouseup",Be),r.pages.addEventListener("click",qt),document.addEventListener("selectionchange",$t),r.pages.addEventListener("touchend",function(){Z&&clearTimeout(Z),Z=null,je()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!n.noteEditing&&z()}),document.addEventListener("mousedown",function(e){r.popover.classList.contains("pdfa-open")&&(r.popover.contains(e.target)||z())}),f(),L(),r.root.querySelector(".pdfa-collapsed").onclick=gn,t.collapsed?k({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var a=e.count||0;r.collapsedCount.textContent=a?a+(a===1?" highlight":" highlights"):""}}).catch(function(){}):et()}catch(e){h("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function Lt(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function zn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var On=`
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
`,Mt={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function zt({attachmentUUID:t,attachmentName:l="",page:o=null,highlightId:i=null,lightDarkMode:r="light",pluginUUID:c=null,noteUUID:n=null,collapsed:h=!1}={}){let k=Mt[r]||Mt.light,S={attachmentUUID:t,page:o,highlightId:i,pluginUUID:c,noteUUID:n,pdfJsSrc:ne.pdfJs,workerSrc:ne.pdfJsWorker,pdfLibSrc:ne.pdfLib,colors:ce.map(g=>({id:g.id,label:g.label,hex:g.hex,rgb:g.rgb})),defaultColorId:he,icons:Pt,collapsed:h,attachmentName:l};return`<link rel="stylesheet" href="${ne.pdfViewerCss}">
<link rel="stylesheet" href="${Lt(ne.robotoCss)}">
<style>:root{${k}}${On}</style>
<div id="pdfa-root"${h?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${Lt(l)}</span>
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
<script>window.__PDFA_CONFIG = ${zn(S)};
window.__PDFA_GEOM = (${ze.toString()})();
window.__PDFA_ANNOTATIONS = (${Oe.toString()})();
window.__PDFA_EXPORT = (${Fe.toString()})();<\/script>
<script>(${Rt.toString()})();<\/script>`}var $n={noteOption:{"Annotate PDF":async function(t,l){return pt(t,l,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,l){return ut(t,l)}},insertText:async function(t){return ft(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...l){return gt(t,l[0])},renderEmbed:function(t,...l){let{attachmentUUID:o,page:i,highlightId:r,collapsed:c,attachmentName:n}=ie(l[0]);return o?zt({attachmentUUID:o,page:i,highlightId:r,collapsed:c,attachmentName:n,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...l){return Ht(t,l[0])}},Fn=$n;return yn(Bn);})();

  var plugin = __pluginModule.default;
})();
