(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Re=Object.defineProperty;var En=Object.getOwnPropertyDescriptor;var kn=Object.getOwnPropertyNames;var Sn=Object.prototype.hasOwnProperty;var Nn=(t,i)=>{for(var a in i)Re(t,a,{get:i[a],enumerable:!0})},Tn=(t,i,a,s)=>{if(i&&typeof i=="object"||typeof i=="function")for(let r of kn(i))!Sn.call(t,r)&&r!==a&&Re(t,r,{get:()=>i[r],enumerable:!(s=En(i,r))||s.enumerable});return t};var An=t=>Tn(Re({},"__esModule",{value:!0}),t);var Xn={};Nn(Xn,{default:()=>Jn});function In(t){return[1,3,5].map(i=>Math.round(parseInt(t.slice(i,i+2),16)/255*1e3)/1e3)}var pe=[["coral","Coral","#F2998C",12],["peach","Peach","#F9B68D",13],["yellow","Yellow","#F3DE6C",14],["green","Green","#BBE077",15],["mint","Mint","#65D2AA",16],["sky","Sky","#87D7E4",17],["blue","Blue","#84B6D9",18],["purple","Purple","#B49EE2",19],["orchid","Orchid","#DA99E0",20],["pink","Pink","#E893BD",21],["grey","Grey","#DFDFDF",22]].map(([t,i,a,s])=>({id:t,label:i,hex:a,cycleIndex:s,rgb:In(a)})),se=["coral","yellow","green","blue"],rt=4,it="Highlight colors",ue="yellow",_="PDF Annotator data",st="attachment://",lt=1,dt=16,ae={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",robotoCss:"https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"},Un="https://plugins.amplenote.com/cors-proxy";function ct(t){let i=new URL(Un);return i.searchParams.set("apiurl",t),i.toString()}var Dn="application/pdf";function Hn(t){return Array.isArray(t)?t.filter(i=>i&&i.type===Dn&&i.uuid):[]}async function fe(t,i){let a=await t.getNoteAttachments({uuid:i}),s=Hn(a);if(s.length===0)return null;if(s.length===1)return s[0];let r=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:s.map(n=>({label:n.name,value:n.uuid})),value:s[0].uuid}]});if(r==null)return null;let c=Array.isArray(r)?r[0]:r;return s.find(n=>n.uuid===c)||null}async function ht(t,i){if(!i)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(i);if(!a)throw new Error(`No URL returned for attachment ${i}`);return ct(a)}function pt(t){return t?dt:lt}function le(t){let i={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return i;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return i}let s=c=>{let n=a.get(c);if(n===null||n.trim()==="")return null;let p=Number(n);return Number.isFinite(p)?p:null},r=s("page");return{attachmentUUID:a.get("att")||null,page:r!==null&&r>=1?Math.floor(r):null,x:s("x"),y:s("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function ut({attachmentUUID:t,page:i,x:a,y:s,highlightId:r,collapsed:c,attachmentName:n}={}){let p=new URLSearchParams;return t&&p.set("att",t),c&&p.set("c","1"),n&&p.set("n",n),Number.isFinite(i)&&i>=1&&p.set("page",String(Math.floor(i))),Number.isFinite(a)&&p.set("x",String(a)),Number.isFinite(s)&&p.set("y",String(s)),r&&p.set("hl",r),p.toString()}function ge(t,i={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=pt(i.collapsed));let s=ut(i);return`<object data="${s?`plugin://${t}?${s}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function ft(t,i,a){if(!t||!i||!a)return null;let s=t.split(`
`),r=s.findIndex(n=>n.includes(`${st}${i}`));if(r===-1)return null;let c=s.slice();return s[r+1]===""?c.splice(r+2,0,a.trim(),""):c.splice(r+1,0,"",a.trim(),""),c.join(`
`)}function me(t,i,a=null){return!t||!i||!t.includes(`plugin://${i}`)?!1:a?t.includes(`att=${a}`):!0}function ve(t,i,a){if(!t||!i||!a)return null;let s=t.split(`
`),r=`plugin://${i}`,c=s.findIndex(p=>p.includes(r)&&p.includes(`att=${a}`));if(c===-1)return null;let n=s.slice();return n.splice(c,1),n[c]===""&&n[c-1]===""&&n.splice(c,1),n.join(`
`)}function de(t,i,a,s={}){if(!t||!i||!a)return null;let r=t.split(`
`),c=`plugin://${i}`,n=r.findIndex(T=>T.includes(c)&&T.includes(`att=${a}`));if(n===-1)return null;let p=r[n],E=p.match(/data="(plugin:\/\/[^"]*)"/);if(!E)return null;let N=E[1],v=N.indexOf("?"),C=v===-1?"":N.slice(v+1),k={...le(C),attachmentUUID:a,...s},u=ut(k),f=u?`plugin://${i}?${u}`:`plugin://${i}`,b=r.slice(),w=p.replace(E[0],`data="${f}"`),x=pt(k.collapsed),y=w.match(/data-aspect-ratio="[^"]*"/);return w=y?w.replace(y[0],`data-aspect-ratio="${x}"`):w.replace(/\s*\/>\s*$/,` data-aspect-ratio="${x}" />`),b[n]=w,b.join(`
`)}function gt(t,i,a,s){return de(t,i,a,{collapsed:!!s})}async function mt(t,i,a){let s=await fe(t,i);if(!s){let p=await t.getNoteAttachments({uuid:i});return(!(Array.isArray(p)&&p.length>0)||!p.some(N=>N&&N.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let r=await t.getNoteContent({uuid:i});if(me(r,a,s.uuid))return await t.alert(`"${s.name}" is already open in this note - scroll to the viewer.`),s.uuid;let c=ge(a,{attachmentUUID:s.uuid,attachmentName:s.name}),n=ft(r,s.uuid,c);return n!==null?(await t.replaceNoteContent({uuid:i},n),s.uuid):(await t.insertNoteContent({uuid:i},`
${c}
`,{atEnd:!0}),s.uuid)}var Rn="Raw markdown";function Pn(t){let i=(String(t||"").match(/`+/g)||[]).reduce((a,s)=>Math.max(a,s.length),0);return"`".repeat(Math.max(3,i+1))}async function vt(t,i){let a=await t.getNoteContent({uuid:i});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let s=await t.getNoteAttachments({uuid:i}),r=(Array.isArray(s)?s:[]).map(p=>`- ${p&&p.name} | ${p&&p.type} | ${p&&p.uuid}`).join(`
`),c=Pn(a),n=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:n},`# Attachments

${r||"- (none)"}

# ${Rn}

${c}
${a}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),n}async function wt(t,i,a){if(!i)return"";let s=await fe(t,i);if(!s){let c=await t.getNoteAttachments({uuid:i});return(!(Array.isArray(c)&&c.length>0)||!c.some(p=>p&&p.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let r=await t.getNoteContent({uuid:i});return me(r,a,s.uuid)?(await t.alert(`"${s.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${ge(a,{attachmentUUID:s.uuid,attachmentName:s.name})}
`}async function Ln(t,i,a,s){let r={uuid:i},c=ve(a,t.context.pluginUUID,s);if(c!==null)try{await t.replaceNoteContent(r,c)}catch{}try{await t.replaceNoteContent(r,a)}catch{await t.replaceNoteContent(r,a)}}async function bt(t,i){let{noteUUID:a,attachmentUUID:s,page:r,highlightId:c}=le(i);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let n=await t.getNoteContent({uuid:a}),p=de(n,t.context.pluginUUID,s,{page:r,highlightId:c,collapsed:!1});p!==null&&(t.context&&t.context.noteUUID===a?await Ln(t,a,p,s):await t.replaceNoteContent({uuid:a},p))}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function ce(t){if(!t)return null;let i=String(t).trim().toLowerCase(),a=i.startsWith("#")?i:"#"+i;return pe.find(s=>s.id===i||s.hex.toLowerCase()===a||s.label.toLowerCase()===i)||null}function xt(){return ce(ue)}function yt(t){let i=[];for(let a of String(t??"").split(/[,;\s]+/)){let s=ce(a);if(s&&i.indexOf(s.id)===-1&&i.push(s.id),i.length===rt)break}return i.length?i:se.slice()}function Ct(t){let i=t&&t.length?t:se;return i.indexOf(ue)!==-1?ue:i[0]}function Mn(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function we({page:t,color:i,rects:a,quoteText:s,note:r=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let p of a)if(![p.x,p.y,p.width,p.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(p)}`);let n=ce(i)||xt();return{id:c||Mn(),page:t,color:n.id,rects:a.map(p=>({x:p.x,y:p.y,width:p.width,height:p.height})),quoteText:String(s||""),note:r?String(r):null}}function Et(t,i){let a=i==null?null:String(i).trim();return{...t,note:a||null}}function kt(t,i){let a=ce(i);if(!a)throw new Error(`withColor: unknown color "${i}"`);return{...t,color:a.id}}function St(t,i){return(t||[]).filter(a=>a.id!==i)}function Pe(t,i,a){let s=!1,r=(t||[]).map(c=>c.id!==i?c:(s=!0,a(c)));return s?r:t}var On="json",Nt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function Tt(t){let i=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${Nt}
\`\`\`${On}
${i}
\`\`\``}function Le(t){if(!t)return null;let i=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!i&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),s=(i?i[1]:a?a[1]:t).trim();if(!s)return null;try{return JSON.parse(s)}catch{return null}}function zn(t){if(!Array.isArray(t))return[];let i=[];for(let a of t)try{i.push(we(a))}catch{}return i}async function be(t,i,a){let s=await t.getNoteContent({uuid:i}),r=Oe(s,_),c=Le(r);return!c||typeof c!="object"?[]:zn(c[a])}async function At(t,i,a,s){let r={uuid:i},c=await t.getNoteContent(r),n=Oe(c,_),E={...Le(n)||{},[a]:s},N=Tt(E);n===null&&await t.insertNoteContent(r,`

# ${_}

`,{atEnd:!0});let v=$n(c,N);if(v!==null){await t.replaceNoteContent(r,v);return}await t.replaceNoteContent(r,N,{section:{heading:{text:_,level:1}}})}async function It(t,i,a){let s={uuid:i},r=await t.getNoteContent(s),c=Oe(r,_);if(c===null)return;let n=Le(c)||{};if(!(a in n))return;let p={...n};delete p[a],await t.replaceNoteContent(s,Tt(p),{section:{heading:{text:_,level:1}}})}function Me(t,i){let a=/^#\s+(.*)$/,s=t.findIndex(c=>{let n=c.match(a);return n&&n[1].trim()===i});if(s===-1)return null;let r=t.length;for(let c=s+1;c<t.length;c++)if(/^#\s+/.test(t[c])){r=c;break}return{start:s,end:r}}function Oe(t,i){if(!t)return null;let a=t.split(`
`),s=Me(a,i);return s?a.slice(s.start+1,s.end).join(`
`).trim():null}function Fn(t){if(!t)return"";let i=t,a=i.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return a&&(i=i.replace(a[0],"")),i=i.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),i=i.replace(Nt,""),i.trim()}function Ut(t,i){return String(t||"").includes("](plugin://")?i:`---

${i}`}function Dt(t,i){let a=(t||"").split(`
`),s=Me(a,_);if(!s)return null;let r=a.slice(0,s.start).join(`
`).replace(/\s+$/,""),c=a.slice(s.start).join(`
`);return`${r?r+`

`:""}${i}

${c}`}function $n(t,i){let a=(t||"").split(`
`),s=Me(a,_);if(!s)return null;let r=Fn(a.slice(s.start+1,s.end).join(`
`).trim());if(!r)return null;let c=a.slice(0,s.start).join(`
`).replace(/\s+$/,""),n=a.slice(s.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${r}

${a[s.start]}

${i}${n?`

`+n:""}`}function Ht(t){return/^\s*>/.test(t)}function Rt(t,i,a,s){if(!t||!i||!s)return null;for(let r=0;r<t.length;r++){let c=t[r];if(!c.includes(`](plugin://${i}`)||a&&!c.includes(`att=${a}`)||!new RegExp(`hl=${Bn(s)}(?![\\w-])`).test(c))continue;let n=r+1;for(n<t.length&&t[n].trim()===""&&n+1<t.length&&Ht(t[n+1])&&n++;n<t.length&&Ht(t[n]);)n++;return{start:r,end:n}}return null}function Bn(t){return String(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function _n(t,i,a){if(!t||!i)return[];let s=[],r=String(t).split(`
`);for(let c of r){if(!c.includes(`](plugin://${i}`)||a&&!c.includes(`att=${a}`))continue;let n=c.match(/[?&]hl=([^&)\s]+)/);n&&s.indexOf(n[1])===-1&&s.push(n[1])}return s}function Pt(t,i,a,s){let r=String(t||"").split(`
`),c=Rt(r,i,a,s);if(!c)return null;let{start:n,end:p}=c;p<r.length&&r[p].trim()===""&&p++;let E=r.slice(0,n).concat(r.slice(p));return _n(E.join(`
`),i,a).length?E.join(`
`):jn(E).join(`
`)}function jn(t){let i=t.findIndex(a=>a.trim()===`# ${_}`);i===-1&&(i=t.length);for(let a=i-1;a>=0;a--){let s=t[a].trim();if(s==="")continue;if(s!=="---")return t;let r=t.slice(0,a).concat(t.slice(a+1)),c=a;for(;c<r.length&&r[c].trim()===""&&(c===0||r[c-1].trim()==="");)r.splice(c,1);return r}return t}function ze(t,i,a,s,r){let c=String(t||"").split(`
`),n=Rt(c,i,a,s);return n?c.slice(0,n.start).concat(String(r).split(`
`),c.slice(n.end)).join(`
`):null}function j(t,i){return i.noteUUID||t.context.noteUUID}async function Lt(t,i,a){try{let s=await t.getNoteAttachments({uuid:i}),r=Array.isArray(s)&&s.find(c=>c&&c.uuid===a);return r?r.name:""}catch{return""}}async function xe(t,i,a,s){let r=await be(t,i,a),c=s(r);return c!==r&&await At(t,i,a,c),{highlights:c}}async function Mt(t,i,a,s){if(a.pluginUUID)try{let r=await t.getNoteContent({uuid:i}),c=s(r);c!==null&&c!==r&&await t.replaceNoteContent({uuid:i},c)}catch{}}function Ot(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let i=t.trim();if(!i.startsWith("{"))return{action:i};try{return JSON.parse(i)}catch{return{action:i}}}async function zt(t,i){return JSON.stringify(await Vn(t,Ot(i)))}async function Vn(t,i){let a=Ot(i);switch(a.action){case"getPdfUrl":{let s=a.attachmentUUID;if(!s)return{error:"No attachment specified for this viewer."};try{return{url:await ht(t,s),name:await Lt(t,j(t,a),s)}}catch(r){return{error:`Could not load the PDF: ${r.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=j(t,a);return{highlights:await be(t,s,a.attachmentUUID)}}catch(s){return{error:`Could not load highlights: ${s.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=we(a.highlight||{});return await xe(t,j(t,a),a.attachmentUUID,r=>r.concat([s]))}catch(s){return{error:`Could not save the highlight: ${s.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=j(t,a),r=await xe(t,s,a.attachmentUUID,c=>Pe(c,a.id,n=>kt(n,a.color)));return a.exportBlock&&await Mt(t,s,a,c=>ze(c,a.pluginUUID,a.attachmentUUID,a.id,a.exportBlock)),r}catch(s){return{error:`Could not change the highlight color: ${s.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await xe(t,j(t,a),a.attachmentUUID,s=>Pe(s,a.id,r=>Et(r,a.note)))}catch(s){return{error:`Could not save the note: ${s.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=j(t,a),r=await xe(t,s,a.attachmentUUID,c=>St(c,a.id));return await Mt(t,s,a,c=>Pt(c,a.pluginUUID,a.attachmentUUID,a.id)),r}catch(s){return{error:`Could not remove the highlight: ${s.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{let s={uuid:j(t,a)},r=await t.getNoteContent(s);if(a.highlightId){let p=ze(r,a.pluginUUID,a.attachmentUUID,a.highlightId,a.content);if(p!==null)return await t.replaceNoteContent(s,p),{ok:!0,replaced:!0}}let c=Ut(r,a.content),n=Dt(r,c);return n===null?await t.insertNoteContent(s,`
`+c+`
`,{atEnd:!0}):await t.replaceNoteContent(s,n),{ok:!0}}catch(s){return{error:`Could not add this to the note: ${s.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=j(t,a),r=await t.getNoteContent({uuid:s}),c=ve(r,a.pluginUUID,a.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:s},c),await It(t,s,a.attachmentUUID),{ok:!0})}catch(s){return{error:`Could not remove this viewer: ${s.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let s=j(t,a),r=await Lt(t,s,a.attachmentUUID);try{let c=await be(t,s,a.attachmentUUID);return{name:r,count:c.length}}catch{return{name:r,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=j(t,a),r=await t.getNoteContent({uuid:s}),c=gt(r,a.pluginUUID,a.attachmentUUID,a.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:s},c),{ok:!0})}catch(s){return{error:`Could not resize this viewer: ${s.message}`}}}case"clearDeepLink":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=j(t,a),r=await t.getNoteContent({uuid:s}),c=de(r,a.pluginUUID,a.attachmentUUID,{page:null,highlightId:null});return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:s},c),{ok:!0})}catch(s){return{error:`Could not clear this viewer's deep link: ${s.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let s=await t.findNote({name:a.noteName}),r=s?s.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:r},a.content||""),{ok:!0,noteUUID:r}}catch(s){return{error:`Could not export highlights: ${s.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}var W={chevronLeft:"M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",chevronRight:"M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",remove:"M19 13H5v-2h14v2z",add:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",moreVert:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",listBulleted:"M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",arrowUp:"M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z",arrowDown:"M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"},Ft={note:"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z",copy:"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",send:"M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",remove:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",download:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",postAdd:"M17 19.22H5V7h7V5H5c-1.1 0-2 .9-2 2v12.22c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h-2v7.22zM19 2h-2v3h-3v2h3v3h2V7h3V5h-3V2zM7 9h8v2H7zm0 3v2h8v-2H7zm0 3h5v2H7z",collapse:"M7.41 18.59 8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.42 5.41 12 10l4.59-4.59z"};function J(t){return'<svg class="pdfa-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+t+'"></path></svg>'}function Fe(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function i(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function a(u,f){var b=Math.pow(10,f===void 0?2:f),w=function(x){return Math.round(x*b)/b};return{x:w(u.x),y:w(u.y),width:w(u.width),height:w(u.height)}}function s(u){return u.width>.01&&u.height>.01}function r(u,f,b){for(var w=String(u??""),x=Math.max(0,f===void 0?0:f),y=Math.min(w.length,b===void 0?w.length:b),T=function(B){return B===""||/\s/.test(B)},U=[],A=x;A<y;){for(;A<y&&T(w.charAt(A));)A++;if(A>=y)break;for(var z=A;A<y&&!T(w.charAt(A));)A++;U.push({start:z,end:A})}return U}function c(u){for(var f=1/0,b=1/0,w=-1/0,x=-1/0,y=0;y<(u?u.length:0);y++){var T=u[y];s(T)&&(f=Math.min(f,T.left),b=Math.min(b,T.top),w=Math.max(w,T.left+T.width),x=Math.max(x,T.top+T.height))}return isFinite(f)?{left:f,top:b,width:w-f,height:x-b}:null}function n(u,f,b){for(var w=[],x=0;x<u.length;x++){var y=t(u[x],f);if(s(y)){var T=b(y.x,y.y),U=b(y.x+y.width,y.y+y.height),A=a(i(T,U));s(A)&&w.push(A)}}return w}function p(u,f){var b=f(u.x,u.y),w=f(u.x+u.width,u.y+u.height);return i(b,w)}function E(u,f,b){var w=f.right-f.left,x=f.bottom-f.top;if(w<=0||x<=0)return null;var y=u.x2-u.x1,T=u.y2-u.y1,U=u.x1+(b.left-f.left)/w*y,A=u.x2-(f.right-b.right)/w*y,z=u.y1+(b.bottom-f.bottom)/x*T,B=u.y2-(f.top-b.top)/x*T;return{x:U,y:z,width:A-U,height:B-z}}function N(u,f){var b=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return b>.5*Math.min(u.height,f.height)}function v(u,f){var b=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var w=u.slice().sort(function(q,X){return X.y-q.y||q.x-X.x}),x=[],y=0;y<w.length;y++){for(var T=!1,U=0;U<x.length;U++)if(N(x[U][0],w[y])){x[U].push(w[y]),T=!0;break}T||x.push([w[y]])}for(var A=[],z=0;z<x.length;z++){for(var B=x[z].slice().sort(function(q,X){return q.x-X.x}),R=null,V=0;V<B.length;V++){var L=B[V];if(R===null){R={x:L.x,y:L.y,width:L.width,height:L.height};continue}var Ce=L.x-(R.x+R.width);if(Ce<=b*Math.max(R.height,L.height)){var ee=Math.max(R.x+R.width,L.x+L.width),Ee=Math.max(R.y+R.height,L.y+L.height);R.x=Math.min(R.x,L.x),R.y=Math.min(R.y,L.y),R.width=ee-R.x,R.height=Ee-R.y}else A.push(R),R={x:L.x,y:L.y,width:L.width,height:L.height}}R!==null&&A.push(R)}return A.map(function(q){return a(q)})}function C(u,f,b,w){var x=w===void 0?0:w;return f>=u.x-x&&f<=u.x+u.width+x&&b>=u.y-x&&b<=u.y+u.height+x}function S(u,f,b,w,x){for(var y=u||[],T=y.length-1;T>=0;T--){var U=y[T];if(!(!U||U.page!==f||!U.rects)){for(var A=0;A<U.rects.length;A++)if(C(U.rects[A],b,w,x===void 0?1:x))return U}}return null}function k(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:i,roundRect:a,isVisibleRect:s,textTokenRanges:r,unionClientRects:c,clientRectsToPdfRects:n,pdfRectToViewportRect:p,itemRelativeRect:E,mergeLineRects:v,rectContainsPoint:C,hitTestHighlights:S,normalizeQuoteText:k}}var $=Fe(),Ao=$.clientRectToLocal,Io=$.rectFromCorners,Uo=$.roundRect,Do=$.isVisibleRect,Ho=$.textTokenRanges,Ro=$.unionClientRects,Po=$.clientRectsToPdfRects,Lo=$.pdfRectToViewportRect,Mo=$.itemRelativeRect,Oo=$.mergeLineRects,zo=$.rectContainsPoint,Fo=$.hitTestHighlights,$o=$.normalizeQuoteText;function $e(){var t=[.957,.871,.424];function i(n,p,E,N,v){var C=p.context.register(p.context.obj({Type:n.PDFName.of("ExtGState"),BM:n.PDFName.of("Multiply"),ca:n.PDFNumber.of(.4)})),S=[n.pushGraphicsState(),n.setGraphicsState("GS0")];S.push(n.setFillingColor(n.rgb(N[0],N[1],N[2])));for(var k=0;k<E.length;k++){var u=E[k];S.push(n.moveTo(u.x,u.y)),S.push(n.lineTo(u.x,u.y+u.height)),S.push(n.lineTo(u.x+u.width,u.y+u.height)),S.push(n.lineTo(u.x+u.width,u.y)),S.push(n.closePath())}S.push(n.fill()),S.push(n.popGraphicsState());var f=p.context.formXObject(S,{BBox:v,Resources:{ExtGState:{GS0:C}}});return p.context.register(f)}function a(n,p,E,N){for(var v=8,C=220,S=String(n||""),k=0,u=S.split(/\r?\n/),f=0;f<u.length;f++)k+=Math.max(1,Math.ceil(u[f].length/45));var b=Math.max(72,Math.min(22+k*14,260)),w=p.maxX+v;w+C>E-v&&(w=E-v-C),w<v&&(w=v);var x=p.maxY;x>N-v&&(x=N-v);var y=x-b;return y<v&&(y=v,x=Math.min(y+b,N-v)),[w,y,w+C,x]}function s(n,p,E,N,v){for(var C=E.rects,S=[],k=C[0].x,u=C[0].y,f=C[0].x+C[0].width,b=C[0].y+C[0].height,w=0;w<C.length;w++){var x=C[w],y=x.x,T=x.x+x.width,U=x.y,A=x.y+x.height;S.push(y,A,T,A,y,U,T,U),k=Math.min(k,y),u=Math.min(u,U),f=Math.max(f,T),b=Math.max(b,A)}var z=p.context.obj({Type:n.PDFName.of("Annot"),Subtype:n.PDFName.of("Highlight"),Rect:p.context.obj([k,u,f,b]),QuadPoints:p.context.obj(S),C:p.context.obj(N),F:n.PDFNumber.of(4),T:n.PDFString.of("PDF Annotator"),M:n.PDFString.of(new Date().toISOString()),CA:n.PDFNumber.of(.4)});E.note&&z.set(n.PDFName.of("Contents"),n.PDFString.of(E.note));var B=i(n,p,C,N,[k,u,f,b]);z.set(n.PDFName.of("AP"),p.context.obj({N:B}));var R=p.context.register(z),V=[R];if(E.note){var L=p.context.register(p.context.obj({Type:n.PDFName.of("Annot"),Subtype:n.PDFName.of("Popup"),Rect:p.context.obj(a(E.note,{maxX:f,maxY:b},v&&v.width||612,v&&v.height||792)),Parent:R,Open:!1}));z.set(n.PDFName.of("Popup"),L),V.push(L)}return V}function r(n,p,E){var N=p.node.get(n.PDFName.of("Annots"));if(N instanceof n.PDFArray)for(var v=0;v<E.length;v++)N.push(E[v]);else p.node.set(n.PDFName.of("Annots"),p.doc.context.obj(E))}async function c(n,p,E,N){for(var v=await n.PDFDocument.load(p),C=v.getPages(),S=E||[],k=0;k<S.length;k++){var u=S[k];if(!(!u||!u.rects||!u.rects.length)){var f=C[u.page-1];if(f){var b=N&&N[u.color]||t,w=s(n,v,u,b,f.getSize());r(n,f,w)}}}return v.save()}return{writeHighlightsIntoPdf:c,buildHighlightAnnotation:s,appendAnnotationRefs:r}}var Be=$e(),_o=Be.writeHighlightsIntoPdf,jo=Be.buildHighlightAnnotation,Vo=Be.appendAnnotationRefs;function _e(){function t(v){return String(v??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function i(v,C,S,k,u){var f=new URLSearchParams;C&&f.set("att",C),Number.isFinite(S)&&S>=1&&f.set("page",String(Math.floor(S))),k&&f.set("hl",k),u&&f.set("note",u);var b=f.toString();return"plugin://"+v+(b?"?"+b:"")}function a(v,C){return String(v??"").split(/\r?\n/).map(function(S){return(C+" "+S).replace(/[ \t]+$/,"")})}function s(v,C){return C?'<mark style="background-color:'+C+';">'+v+"</mark>":v}function r(v,C,S,k,u,f){var b=i(C,S,k.page,k.id,f),w=s(t(v||"PDF"),u),x="["+w+"]("+b+")",y=[x].concat(a(k.quoteText,"> >"));return k.note&&(y.push(">"),y=y.concat(a(k.note,">"))),y.join(`
`)}function c(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function n(v){return"<p>"+c(v).replace(/\r?\n/g,"<br>")+"</p>"}function p(v,C,S,k,u,f){var b=i(C,S,k.page,k.id,f),w=c(v||"PDF"),x=u?'<mark style="background-color: '+c(u)+';">'+w+"</mark>":w,y='<p><a href="'+c(b)+'">'+x+"</a></p>",T="<blockquote><blockquote>"+n(k.quoteText)+"</blockquote></blockquote>",U=k.note?"<blockquote>"+n(k.note)+"</blockquote>":"";return y+T+U}function E(v){return v.slice().sort(function(C,S){if(C.page!==S.page)return C.page-S.page;var k=C.rects&&C.rects[0]?C.rects[0].y:0,u=S.rects&&S.rects[0]?S.rects[0].y:0;return u-k})}function N(v,C,S,k,u,f,b){var w=f&&f.length?f:null,x=(k||[]).filter(function(U){return U&&(!w||w.indexOf(U.color)!==-1)}),y=E(x),T=y.map(function(U){var A=u&&u[U.color]||{};return r(v,C,S,U,A.hex,b)});return T.join(`

`)}return{buildDeepLink:i,buildHighlightBlock:r,buildHighlightHtml:p,buildExportAllContent:N}}var ye=_e(),Go=ye.buildDeepLink,Wo=ye.buildHighlightBlock,Jo=ye.buildHighlightHtml,Xo=ye.buildExportAllContent;function $t(){var t=window.__PDFA_CONFIG||{},i=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},s=window.__PDFA_EXPORT||{},r={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(n.attachmentName=e,r.name&&(r.name.textContent=e),r.collapsedName&&(r.collapsedName.textContent=e))}var n={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function p(e,o){r.status.textContent=e||"",r.status.style.display=e?"block":"none",r.status.className=o?"pdfa-status pdfa-error":"pdfa-status"}function E(e){var o=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(l,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");l(window.callAmplenotePlugin(JSON.stringify(o)))}catch(h){d(h)}}).then(function(l){if(l&&typeof l=="object")return l;if(typeof l!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(l)}catch{throw new Error("Unreadable reply from the plugin: "+String(l).slice(0,120))}})}function N(){return t.colors||[]}function v(){for(var e=t.toolbarColorIds||[],o=N(),l=[],d=0;d<e.length;d++)for(var h=0;h<o.length;h++)if(o[h].id===e[d]){l.push(o[h]);break}return l.length?l:o.slice(0,4)}function C(){for(var e={},o=0;o<n.highlights.length;o++)e[n.highlights[o].color]=!0;var l=N().filter(function(d){return e[d.id]});return l.length?l:v()}function S(e){for(var o=N(),l=0;l<o.length;l++)if(o[l].id===e)return o[l].hex;return o.length?o[0].hex:"#F4DE6C"}function k(e){for(var o=0;o<n.highlights.length;o++)if(n.highlights[o].id===e)return n.highlights[o];return null}function u(e){var o=(t.icons||{})[e];if(!o)return null;var l="http://www.w3.org/2000/svg",d=document.createElementNS(l,"svg");d.setAttribute("class","pdfa-icon"),d.setAttribute("viewBox","0 0 24 24"),d.setAttribute("aria-hidden","true");var h=document.createElementNS(l,"path");return h.setAttribute("d",o),d.appendChild(h),d}function f(e,o,l,d){var h=document.createElement("button");h.className="pdfa-btn"+(o?" "+o:"");var g=d?u(d):null;if(g){h.appendChild(g);var m=document.createElement("span");m.textContent=e,h.appendChild(m)}else h.textContent=e;return h.onclick=function(I){I.stopPropagation(),l()},h}function b(e,o,l,d){var h=document.createElement("button");return h.className="pdfa-color",h.dataset.color=e.id,h.style.background=e.hex,h.title=d+" "+e.label,h.setAttribute("aria-label",d+" "+e.label),h.setAttribute("aria-pressed",String(!!o)),h.onclick=function(g){g.stopPropagation(),l(e.id)},h}function w(){for(var e=v(),o=0;o<e.length;o++)r.colors.appendChild(b(e[o],e[o].id===n.activeColorId,function(l){n.activeColorId=l,x(),n.pendingSelection&&qe(n.pendingSelection,l)},"Highlight"))}function x(){for(var e=r.colors.querySelectorAll(".pdfa-color"),o=0;o<e.length;o++)e[o].setAttribute("aria-pressed",String(e[o].dataset.color===n.activeColorId))}function y(){for(var e=[],o=1;o<=n.pageCount;o++)(function(l){e.push(n.doc.getPage(l).then(function(d){n.viewports[l]=d.getViewport({scale:n.scale})}))})(o);return Promise.all(e)}function T(e){var o=n.viewports[e],l=document.createElement("div");return l.className="pdfa-page",l.dataset.page=String(e),l.style.width=o.width+"px",l.style.height=o.height+"px",l}function U(e,o){if(n.rendered[o]||n.renderingPage[o])return Promise.resolve();n.renderingPage[o]=!0;var l=n.viewports[o],d=document.createElement("canvas"),h=window.devicePixelRatio||1;d.width=Math.floor(l.width*h),d.height=Math.floor(l.height*h),d.style.width=l.width+"px",d.style.height=l.height+"px",e.appendChild(d);var g=document.createElement("div");g.className="pdfa-highlights",e.appendChild(g);var m=document.createElement("div");m.className="textLayer",m.style.width=l.width+"px",m.style.height=l.height+"px",m.style.setProperty("--scale-factor",String(n.scale)),e.appendChild(m);var I=d.getContext("2d");I.scale(h,h);var H=null;return n.doc.getPage(o).then(function(P){return H=P,P.render({canvasContext:I,viewport:l}).promise}).then(function(){return H.getTextContent()}).then(function(P){var D=[];return window.pdfjsLib.renderTextLayer({textContent:P,container:m,viewport:l,textDivs:D}).promise.then(function(){n.textSpans+=D.length;for(var M=0;M<D.length;M++)D[M].__pdfaItem=P.items[M];n.rendered[o]=!0,n.renderingPage[o]=!1,V(o),z()})}).catch(function(P){n.renderingPage[o]=!1,p("Failed to render page "+o+": "+(P.message||P),!0)})}function A(){var e=K();if(!e||!n.doc)return Promise.resolve();for(var o=e.getBoundingClientRect(),l=e.clientHeight,d=r.pages.querySelectorAll(".pdfa-page"),h=[],g=0;g<d.length;g++){var m=d[g],I=Number(m.dataset.page);if(!(n.rendered[I]||n.renderingPage[I])){var H=m.getBoundingClientRect(),P=H.top-o.top,D=H.bottom-o.top;D<-l||P>e.clientHeight+l||h.push(U(m,I))}}return Promise.all(h)}function z(){var e=0;for(var o in n.rendered)n.rendered[o]&&e++;if(e){var l=n.textSpans===0;p(l?"No selectable text found - this PDF may be a scan.":"",l)}}function B(){if(n.rendering)return Promise.resolve();n.rendering=!0,O(!0),p("Rendering...");var e=K(),o=e?e.scrollHeight-e.clientHeight:0,l=o>0?e.scrollTop/o:0;return r.pages.innerHTML="",n.viewports={},n.rendered={},n.renderingPage={},n.textSpans=0,y().then(function(){for(var d=1;d<=n.pageCount;d++)r.pages.appendChild(T(d));if(e){var h=e.scrollHeight-e.clientHeight;e.scrollTop=l*(h>0?h:0)}n.rendering=!1,re(),ie(),A()}).catch(function(d){n.rendering=!1,p("Failed to render: "+(d.message||d),!0)})}function R(e){return function(o,l){return e.convertToViewportPoint(o,l)}}function V(e){for(var o=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",l=r.pages.querySelectorAll(o),d=0;d<l.length;d++){var h=l[d],g=Number(h.dataset.page),m=h.querySelector(".pdfa-highlights"),I=n.viewports[g];if(!(!m||!I)){m.innerHTML="";for(var H=R(I),P=0;P<n.highlights.length;P++){var D=n.highlights[P];if(!(!D||D.page!==g||!D.rects||!D.rects.length)){var M=document.createElement("div");M.className="pdfa-hl-group",M.dataset.id=D.id||"";for(var Y=0;Y<D.rects.length;Y++){var ne=i.pdfRectToViewportRect(D.rects[Y],H),F=document.createElement("div");F.className="pdfa-hl",F.style.left=ne.x+"px",F.style.top=ne.y+"px",F.style.width=ne.width+"px",F.style.height=ne.height+"px",F.style.background=S(D.color),M.appendChild(F)}m.appendChild(M)}}}}}function L(){V(),ee(),r.count.textContent=String(n.highlights.length)}function Ce(){return n.highlights.slice().sort(function(e,o){return e.page!==o.page?e.page-o.page:(o.rects[0]?o.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function ee(){r.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var o=document.createElement("span");o.textContent="Highlights",e.appendChild(o),e.appendChild(f("Close","",function(){q(!1)})),r.panel.appendChild(e);var l=Ce();if(!l.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",r.panel.appendChild(d);return}for(var h=0;h<l.length;h++)r.panel.appendChild(Ee(l[h]))}function Ee(e){var o=document.createElement("div");o.className="pdfa-hl-row",o.dataset.id=e.id||"",o.title="Jump to this highlight";var l=document.createElement("span");l.className="pdfa-chip",l.style.background=S(e.color),o.appendChild(l);var d=document.createElement("div"),h=document.createElement("div");h.className="pdfa-hl-page",h.textContent="Page "+e.page,d.appendChild(h);var g=document.createElement("div");if(g.className="pdfa-hl-quote",g.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(g),e.note){var m=document.createElement("div");m.className="pdfa-hl-note",m.textContent=e.note,d.appendChild(m)}return o.appendChild(d),o.onclick=function(){Xe(e)},o}function q(e){var o=e===void 0?!r.panel.classList.contains("pdfa-open"):e;r.panel.classList.toggle("pdfa-open",o),r.listToggle.setAttribute("aria-pressed",String(o)),o&&ee(),ie()}function X(e){for(var o=e&&e.nodeType===1?e:e&&e.parentElement;o;){if(o.classList&&o.classList.contains("textLayer"))return o;o=o.parentElement}return null}function Vt(e,o){for(var l=[],d=[],h=null,g=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,null),m;m=g.nextNode();)if(e.intersectsNode(m)){var I=m.nodeValue||"",H=m===e.startContainer?e.startOffset:0,P=m===e.endContainer?e.endOffset:I.length,D=m.parentElement,M=D&&D.__pdfaItem;if(M)for(var Y={x1:M.transform[4],y1:M.transform[5],x2:M.transform[4]+M.width,y2:M.transform[5]+M.height},ne=D.getBoundingClientRect(),F=i.textTokenRanges(I,H,P),oe=0;oe<F.length;oe++){var He=document.createRange();He.setStart(m,F[oe].start),He.setEnd(m,F[oe].end);var G=i.unionClientRects(He.getClientRects());if(G){var ot={left:G.left,top:G.top,width:G.width,height:G.height,right:G.left+G.width,bottom:G.top+G.height},at=i.itemRelativeRect(Y,ne,ot);at&&(l.push(at),d.push(I.slice(F[oe].start,F[oe].end)),h=ot)}}}return{rects:l,text:d.join(" "),lastCssRect:h}}function Z(e){if(n.pendingSelection=e,n.lastCapturedText=e&&e.rawText||"",!e){r.hint.textContent="",r.hint.style.display="none";return}r.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",r.hint.style.display="inline"}function je(e){if(!n.noteEditing){var o=window.getSelection();if(!o||o.isCollapsed||o.rangeCount===0){Z(null),O();return}var l=o.getRangeAt(0),d=X(l.startContainer);if(!d)return Z(null);var h=d.parentElement;if(!h||!h.dataset||!h.dataset.page)return Z(null);var g=Number(h.dataset.page);if(!n.rendered[g])return Z(null);var m=X(l.endContainer)!==d,I=Vt(l,d),H=i.mergeLineRects(I.rects);if(!H.length)return Z(null);var P=I.lastCssRect||h.getBoundingClientRect(),D=e&&e.clientX?e.clientX:P.left+P.width/2,M=e&&e.clientY?e.clientY:P.top+P.height,Y={page:g,rects:H,quoteText:i.normalizeQuoteText(I.text),spilled:m,anchorX:D,anchorY:M,rawText:String(o)};Z(Y),Xt(Y)}}var qt=300,Q=null;function Gt(){n.noteEditing||(Q&&clearTimeout(Q),Q=setTimeout(Ve,qt))}function Ve(){if(Q=null,!n.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||X(e.getRangeAt(0).startContainer)&&String(e)!==n.lastCapturedText&&je(null)}}function he(e,o){var l=n.highlights;return n.highlights=e,L(),E(o).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return n.highlights=d.highlights||e,L(),p(""),!0}).catch(function(d){return n.highlights=l,L(),p(d.message||String(d),!0),!1})}function qe(e,o){var l={id:null,page:e.page,color:o,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,h=e.anchorY;Z(null),O(!0);var g=window.getSelection();g&&g.removeAllRanges&&g.removeAllRanges(),he(n.highlights.concat([l]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:l}).then(function(m){if(m){var I=n.highlights[n.highlights.length-1];I&&I.id&&Se(I,d,h,!0)}})}function Wt(e,o){O(!0);for(var l=n.highlights.map(function(g){return g.id===e?Object.assign({},g,{color:o}):g}),d=null,h=0;h<l.length;h++)l[h].id===e&&(d=l[h]);he(l,{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e,color:o,exportBlock:d?De(d):null})}function Jt(e){O(!0),he(n.highlights.filter(function(o){return o.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e})}function ke(e,o){var l=String(o??"").trim();n.noteEditing=null,O(!0),he(n.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:l||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:l})}function te(e,o,l,d){r.popover.innerHTML="",r.popover.classList.toggle("pdfa-editing",d==="editing"),r.popover.classList.toggle("pdfa-exporting",d==="exporting"),r.popover.classList.toggle("pdfa-menu",d==="menu");for(var h=0;h<e.length;h++)r.popover.appendChild(e[h]);r.popover.classList.add("pdfa-open");var g=r.popover.offsetWidth,m=r.popover.offsetHeight,I=Math.max(4,Math.min(o-g/2,window.innerWidth-g-4)),H=l+12;H+m>window.innerHeight-4&&(H=Math.max(4,l-m-12)),H=Math.max(4,Math.min(H,window.innerHeight-m-4)),r.popover.style.left=I+"px",r.popover.style.top=H+"px"}function O(e){n.noteEditing&&!e||(n.noteEditing=null,r.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu"),r.popover.innerHTML="")}function Xt(e){for(var o=v(),l=[],d=0;d<o.length;d++)l.push(b(o[d],o[d].id===n.activeColorId,function(h){n.activeColorId=h,x(),qe(e,h)},"Highlight"));te(l,e.anchorX,e.anchorY)}function Se(e,o,l,d){for(var h=N(),g=[],m=0;m<h.length;m++)g.push(b(h[m],h[m].id===e.color,function(H){Wt(e.id,H)},"Change to"));var I=!!e.note;g.push(f(I?"Edit note":"Add note",d&&!I?"pdfa-btn-primary":"",function(){Zt(e,o,l)},"note")),g.push(f("Copy","",function(){hn(e)},"copy")),g.push(f("Send to note","",function(){pn(e)},"send")),g.push(f("Remove","pdfa-remove",function(){Jt(e.id)},"remove")),te(g,o,l)}function Yt(e,o){for(var l=C(),d={},h=0;h<l.length;h++)d[l[h].id]=!0;var g=document.createElement("div");g.className="pdfa-export-hint",g.textContent="Export highlights to a note";var m=document.createElement("div");m.className="pdfa-export-colors";for(var I=0;I<l.length;I++)(function(P){var D=b(P,!0,function(M){d[M]=!d[M],D.setAttribute("aria-pressed",String(d[M]))},"Toggle");m.appendChild(D)})(l[I]);var H=document.createElement("div");H.className="pdfa-note-actions",H.appendChild(f("Create / update note","pdfa-btn-primary",function(){for(var P=[],D=0;D<l.length;D++)d[l[D].id]&&P.push(l[D].id);un(P.length===l.length?null:P)})),te([g,m,H],e,o,"exporting")}function Zt(e,o,l){n.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var h=document.createElement("div");h.className="pdfa-note-actions",e.note&&h.appendChild(f("Delete note","",function(){ke(e.id,"")}));var g=document.createElement("span");g.className="pdfa-spacer",h.appendChild(g),h.appendChild(f("Cancel","",function(){Ge(e,o,l)})),h.appendChild(f("Save","pdfa-btn-primary",function(){ke(e.id,d.value)})),d.onkeydown=function(m){m.key==="Enter"&&(m.ctrlKey||m.metaKey)?(m.preventDefault(),m.stopPropagation(),ke(e.id,d.value)):m.key==="Escape"&&(m.preventDefault(),m.stopPropagation(),Ge(e,o,l))},te([d,h],o,l,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function Ge(e,o,l){n.noteEditing=null;var d=k(e.id)||e;Se(d,o,l)}function Qt(e){if(!n.noteEditing){var o=window.getSelection();if(!(o&&!o.isCollapsed)){for(var l=e.target,d=null;l&&l!==r.pages;){if(l.classList&&l.classList.contains("pdfa-page")){d=l;break}l=l.parentElement}if(!d)return O();var h=Number(d.dataset.page),g=n.viewports[h];if(!g)return O();var m=d.getBoundingClientRect(),I=g.convertToPdfPoint(e.clientX-m.left,e.clientY-m.top),H=i.hitTestHighlights(n.highlights,h,I[0],I[1],1);H&&H.id?Se(H,e.clientX,e.clientY):O()}}}function Ne(){return Math.round(n.scale*100)+"%"}function re(){r.pageLabel.textContent=n.current+" / "+n.pageCount,document.activeElement!==r.zoomLabel&&(r.zoomLabel.value=Ne())}function K(){return r.root.querySelector(".pdfa-scroll")}function We(){return r.panel&&r.panel.classList.contains("pdfa-open")?r.panel:K()}function Je(e){var o=r.pages.querySelector('.pdfa-page[data-page="'+e+'"]');o&&U(o,e)}function Te(e){var o=Math.min(Math.max(1,e),n.pageCount),l=r.pages.querySelector('.pdfa-page[data-page="'+o+'"]');Je(o);var d=K();l&&d&&(d.scrollTop+=l.getBoundingClientRect().top-d.getBoundingClientRect().top),A(),n.current=o,re()}function Xe(e){var o=r.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),l=n.viewports[e.page];if(!(!o||!l||!e.rects||!e.rects.length)){var d=i.pdfRectToViewportRect(e.rects[0],R(l)),h=K(),g=o.getBoundingClientRect().top+d.y;h.scrollTop+=g-h.getBoundingClientRect().top-h.clientHeight/3,Je(e.page),A(),n.current=e.page,re()}}function Kt(){try{r.root.setAttribute("tabindex","-1"),r.root.focus(),r.root.scrollIntoView&&r.root.scrollIntoView({block:"nearest"})}catch{}}function en(e){if(!(!e||!e.id)){var o=r.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');o&&(o.classList.add("pdfa-hl-flash"),setTimeout(function(){o.classList.remove("pdfa-hl-flash")},2600))}}function Ae(e){return Math.min(Math.max(.4,e),4)}function Ie(e){return n.scale=Ae(e),B()}function Ye(){var e=String(r.zoomLabel.value).replace(/[\s%]/g,""),o=/^\d*\.?\d+$/.test(e)?parseFloat(e):NaN;if(o>0){var l=Ae(o/100);l!==n.scale&&Ie(l)}r.zoomLabel.value=Ne()}function tn(){return n.doc?n.doc.getPage(1).then(function(e){var o=K();if(o){var l=window.getComputedStyle(o),d=o.clientWidth-(parseFloat(l.paddingLeft)||0)-(parseFloat(l.paddingRight)||0),h=e.getViewport({scale:1}).width;if(!(!(d>0)||!(h>0))){var g=Ae(d/h);g<n.scale&&(n.scale=g,re())}}}).catch(function(){}):Promise.resolve()}function Ze(e){var o=We();o&&(o.scrollTop+=e*Math.max(80,o.clientHeight*.85),ie(),A())}function Qe(e,o){var l=null,d=null,h=!1,g=function(){l&&clearTimeout(l),d&&clearInterval(d),l=d=null};e.addEventListener("pointerdown",function(){g(),h=!1,l=setTimeout(function(){h=!0,d=setInterval(function(){if(e.disabled)return g();Ze(o*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(m){e.addEventListener(m,g)}),e.onclick=function(){if(h){h=!1;return}Ze(o)}}function ie(){var e=We();if(!(!e||!r.scrollUp)){var o=e.scrollHeight-e.clientHeight;r.scrollUp.disabled=e.scrollTop<=1,r.scrollDown.disabled=e.scrollTop>=o-1}}function nn(){ie(),A(),O();for(var e=r.pages.querySelectorAll(".pdfa-page"),o=n.current,l=1/0,d=0;d<e.length;d++){var h=Math.abs(e[d].getBoundingClientRect().top-60);h<l&&(l=h,o=Number(e[d].dataset.page))}o!==n.current&&(n.current=o,re())}function on(){return new Promise(function(e,o){if(window.pdfjsLib)return e(window.pdfjsLib);var l=document.createElement("script");l.src=t.pdfJsSrc,l.onload=function(){window.pdfjsLib?e(window.pdfjsLib):o(new Error("PDF.js loaded but did not register itself."))},l.onerror=function(){o(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(l)})}function an(){return new Promise(function(e,o){if(window.PDFLib)return e(window.PDFLib);var l=document.createElement("script");l.src=t.pdfLibSrc,l.onload=function(){window.PDFLib?e(window.PDFLib):o(new Error("pdf-lib loaded but did not register itself."))},l.onerror=function(){o(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(l)})}function rn(){for(var e={},o=N(),l=0;l<o.length;l++)o[l].rgb&&(e[o[l].id]=o[l].rgb);return e}function sn(){var e=(n.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Ue(){for(var e={},o=N(),l=0;l<o.length;l++)e[o[l].id]={hex:o[l].hex};return e}function Ke(){var e=(n.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function De(e){var o=Ue()[e.color]||{};return s.buildHighlightBlock(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,o.hex,t.noteUUID)}function ln(e){if(!s.buildHighlightHtml)return null;var o=Ue()[e.color]||{};return s.buildHighlightHtml(n.attachmentName,t.pluginUUID,t.attachmentUUID,e,o.hex,t.noteUUID)}function dn(e,o){var l=function(g){var m=g.clipboardData||window.clipboardData;m&&(m.setData("text/plain",e),o&&m.setData("text/html",o),g.preventDefault())},d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select(),document.addEventListener("copy",l,!0);var h=!1;try{h=document.execCommand("copy")}catch{h=!1}return document.removeEventListener("copy",l,!0),document.body.removeChild(d),h}function cn(e,o){var l=function(){return!navigator.clipboard||!navigator.clipboard.writeText?d():navigator.clipboard.writeText(e).then(function(){return"plain"},d)},d=function(){return dn(e,o)?Promise.resolve(o?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(o&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var h=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([o],{type:"text/html"})});return navigator.clipboard.write([h]).then(function(){return"rich"},l)}catch{return l()}return l()}function hn(e){O(!0);var o,l;try{o=De(e),l=ln(e)}catch(d){p("Could not build the copy: "+(d.message||d),!0);return}cn(o,l).then(function(d){p(d==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(d){p("Could not copy: "+(d.message||d),!0)})}function pn(e){O(!0),E({action:"sendToNote",content:De(e),highlightId:e.id,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(o){if(!o||o.error)throw new Error(o&&o.error||"Could not send this to the note.");ee(),p(o.replaced?"Updated this highlight where it already sits in the note.":"Added to this note, below the text.")}).catch(function(o){p(o.message||String(o),!0)})}function un(e){O(!0);var o=s.buildExportAllContent(n.attachmentName,t.pluginUUID,t.attachmentUUID,n.highlights,Ue(),e,t.noteUUID);if(!o){p(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}E({action:"exportAll",noteName:Ke(),content:o}).then(function(l){if(!l||l.error)throw new Error(l&&l.error||"Could not export highlights.");p('Exported to "'+Ke()+'".')}).catch(function(l){p(l.message||String(l),!0)})}function fn(e,o){var l=[];l.push(f("Collapse","",function(){O(!0),xn()},"collapse"),f("Download","",function(){O(!0),vn()},"download"),f("Export...","",function(){Yt(e,o)},"postAdd"),f("Remove viewer...","pdfa-remove",function(){gn(e,o)},"remove")),te(l,e,o,"menu")}function gn(e,o){var l=document.createElement("div");l.className="pdfa-export-hint",l.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(f("Cancel","",function(){O(!0)}));var h=document.createElement("span");h.className="pdfa-spacer",d.appendChild(h),d.appendChild(f("Remove","pdfa-remove",mn)),te([l,d],e,o,"exporting")}function mn(){O(!0),p("Removing this viewer..."),E({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){p(e.message||String(e),!0)})}function vn(){n.pdfBytes&&(p("Preparing the download..."),an().then(function(e){return a.writeHighlightsIntoPdf(e,n.pdfBytes,n.highlights,rn())}).then(function(e){return wn(e,sn())}).catch(function(e){p("Could not prepare the download: "+(e.message||e),!0)}))}function wn(e,o){var l=new Blob([e],{type:"application/pdf"}),d=null;try{d=new File([l],o,{type:"application/pdf"})}catch{}return d&&navigator.share&&navigator.canShare&&navigator.canShare({files:[d]})?navigator.share({files:[d],title:o}).then(function(){p("")}).catch(function(h){return h&&h.name==="AbortError"?p(""):et(l,o)}):et(l,o)}function et(e,o){var l=URL.createObjectURL(e),d=document.createElement("a");d.href=l,d.download=o,document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(l)},4e3);var h=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return p(h?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function bn(){return E({action:"loadHighlights",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");n.highlights=e.highlights||[]}).catch(function(e){n.highlights=[],p("Could not load saved highlights: "+(e.message||e),!0)})}function xn(){var e=n.highlights.length;r.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",r.root.classList.add("pdfa-collapsed-mode"),tt(!0)}function tt(e){E({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function yn(){E({action:"clearDeepLink",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Cn(){r.root.classList.remove("pdfa-collapsed-mode"),n.doc||nt(),tt(!1)}function nt(){p("Loading PDF..."),(t.highlightId||t.page)&&(Kt(),yn()),on().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,E({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return n.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return n.doc=e,n.pageCount=e.numPages,bn()}).then(function(){return tn()}).then(function(){return B()}).then(function(){L();var e=t.highlightId?k(t.highlightId):null;e?(Xe(e),en(e)):t.page&&Te(t.page)}).catch(function(e){p(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){Te(n.current-1)},document.getElementById("pdfa-next").onclick=function(){Te(n.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){Ie(n.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){Ie(n.scale-.25)},r.zoomLabel.addEventListener("focus",function(){r.zoomLabel.value=String(Math.round(n.scale*100)),setTimeout(function(){document.activeElement===r.zoomLabel&&r.zoomLabel.select()},0)}),r.zoomLabel.addEventListener("blur",Ye),r.zoomLabel.addEventListener("keydown",function(e){e.key==="Enter"?(e.preventDefault(),Ye(),r.zoomLabel.blur()):e.key==="Escape"&&(e.preventDefault(),r.zoomLabel.value=Ne(),r.zoomLabel.blur())}),Qe(r.scrollUp,-1),Qe(r.scrollDown,1),r.listToggle.onclick=function(){q()},r.more.onclick=function(e){fn(e.clientX,e.clientY)},K().addEventListener("scroll",nn),r.panel.addEventListener("scroll",ie),r.pages.addEventListener("mouseup",je),r.pages.addEventListener("click",Qt),document.addEventListener("selectionchange",Gt),r.pages.addEventListener("touchend",function(){Q&&clearTimeout(Q),Q=null,Ve()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!n.noteEditing&&O()}),document.addEventListener("mousedown",function(e){r.popover.classList.contains("pdfa-open")&&(r.popover.contains(e.target)||O())}),w(),ee(),r.root.querySelector(".pdfa-collapsed").onclick=Cn,t.collapsed?E({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var o=e.count||0;r.collapsedCount.textContent=o?o+(o===1?" highlight":" highlights"):""}}).catch(function(){}):nt()}catch(e){p("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function Bt(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function qn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var Gn=`
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
`,_t={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function jt({attachmentUUID:t,attachmentName:i="",page:a=null,highlightId:s=null,lightDarkMode:r="light",pluginUUID:c=null,noteUUID:n=null,collapsed:p=!1,toolbarColorIds:E=se}={}){let N=_t[r]||_t.light,v={attachmentUUID:t,page:a,highlightId:s,pluginUUID:c,noteUUID:n,pdfJsSrc:ae.pdfJs,workerSrc:ae.pdfJsWorker,pdfLibSrc:ae.pdfLib,colors:pe.map(C=>({id:C.id,label:C.label,hex:C.hex,rgb:C.rgb})),toolbarColorIds:E,defaultColorId:Ct(E),icons:Ft,collapsed:p,attachmentName:i};return`<link rel="stylesheet" href="${ae.pdfViewerCss}">
<link rel="stylesheet" href="${Bt(ae.robotoCss)}">
<style>:root{${N}}${Gn}</style>
<div id="pdfa-root"${p?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${Bt(i)}</span>
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
            aria-label="Previous page">${J(W.chevronLeft)}</button>
    <span class="pdfa-label" id="pdfa-page-label">- / -</span>
    <button id="pdfa-next" class="pdfa-icon-btn" title="Next page"
            aria-label="Next page">${J(W.chevronRight)}</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" class="pdfa-icon-btn" title="Zoom out"
            aria-label="Zoom out">${J(W.remove)}</button>
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
            aria-label="Zoom in">${J(W.add)}</button>
    <span class="pdfa-sep"></span>
    <!-- The four single-click highlight color buttons, mounted by the viewer from
         config.toolbarColorIds (which four) resolved against config.colors (the whole
         catalog). Top-level toolbar buttons with no submenu is an explicit spec
         requirement (section 4), which is why the slot is here and not in a panel. -->
    <span id="pdfa-colors"></span>
    <span class="pdfa-hint" id="pdfa-hint"></span>
    <span class="pdfa-sep"></span>
    <!-- The list glyph replaces the word "Notes"; the count stays, since that is the part
         the word was not carrying. -->
    <button id="pdfa-list-toggle" class="pdfa-icon-btn pdfa-notes-btn"
            title="Show highlights and notes" aria-label="Show highlights and notes"
            >${J(W.listBulleted)}<span class="pdfa-count" id="pdfa-count">0</span></button>
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
            aria-label="More actions">${J(W.moreVert)}</button>
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
      <button id="pdfa-scroll-up" title="Scroll up" aria-label="Scroll up">${J(W.arrowUp)}</button>
      <button id="pdfa-scroll-down" title="Scroll down" aria-label="Scroll down">${J(W.arrowDown)}</button>
    </div>
  </div>
  <!-- Colors on a fresh selection; recolor / note / remove on an existing highlight;
       the note editor itself. One element, filled in per context by the viewer. -->
  <div class="pdfa-popover" id="pdfa-popover"></div>
</div>
<script>window.__PDFA_CONFIG = ${qn(v)};
window.__PDFA_GEOM = (${Fe.toString()})();
window.__PDFA_ANNOTATIONS = (${$e.toString()})();
window.__PDFA_EXPORT = (${_e.toString()})();<\/script>
<script>(${$t.toString()})();<\/script>`}var Wn={noteOption:{"Annotate PDF":async function(t,i){return mt(t,i,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,i){return vt(t,i)}},insertText:async function(t){return wt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...i){return bt(t,i[0])},renderEmbed:function(t,...i){let{attachmentUUID:a,page:s,highlightId:r,collapsed:c,attachmentName:n}=le(i[0]);return a?jt({attachmentUUID:a,page:s,highlightId:r,collapsed:c,attachmentName:n,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID,toolbarColorIds:yt(t.settings?t.settings[it]:null)}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...i){return zt(t,i[0])}},Jn=Wn;return An(Xn);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
