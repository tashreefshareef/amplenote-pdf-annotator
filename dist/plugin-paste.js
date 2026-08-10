(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
var __pluginModule=(()=>{var Le=Object.defineProperty;var Nn=Object.getOwnPropertyDescriptor;var Tn=Object.getOwnPropertyNames;var An=Object.prototype.hasOwnProperty;var In=(t,l)=>{for(var a in l)Le(t,a,{get:l[a],enumerable:!0})},Dn=(t,l,a,s)=>{if(l&&typeof l=="object"||typeof l=="function")for(let r of Tn(l))!An.call(t,r)&&r!==a&&Le(t,r,{get:()=>l[r],enumerable:!(s=Nn(l,r))||s.enumerable});return t};var Un=t=>Dn(Le({},"__esModule",{value:!0}),t);var Qn={};In(Qn,{default:()=>Zn});function Hn(t){return[1,3,5].map(l=>Math.round(parseInt(t.slice(l,l+2),16)/255*1e3)/1e3)}var ue=[["coral","Coral","#F2998C",12],["peach","Peach","#F9B68D",13],["yellow","Yellow","#F3DE6C",14],["green","Green","#BBE077",15],["mint","Mint","#65D2AA",16],["sky","Sky","#87D7E4",17],["blue","Blue","#84B6D9",18],["purple","Purple","#B49EE2",19],["orchid","Orchid","#DA99E0",20],["pink","Pink","#E893BD",21],["grey","Grey","#DFDFDF",22]].map(([t,l,a,s])=>({id:t,label:l,hex:a,cycleIndex:s,rgb:Hn(a)})),le=["coral","yellow","green","blue"],st=4,fe="Highlight colors",ge="yellow",V="PDF Annotator data",lt="attachment://",dt=1,ct=16,re={pdfJs:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",pdfJsWorker:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",pdfViewerCss:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",pdfLib:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",robotoCss:"https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"},Rn="https://plugins.amplenote.com/cors-proxy";function ht(t){let l=new URL(Rn);return l.searchParams.set("apiurl",t),l.toString()}var Pn="application/pdf";function Ln(t){return Array.isArray(t)?t.filter(l=>l&&l.type===Pn&&l.uuid):[]}async function me(t,l){let a=await t.getNoteAttachments({uuid:l}),s=Ln(a);if(s.length===0)return null;if(s.length===1)return s[0];let r=await t.prompt("Which PDF do you want to annotate?",{inputs:[{label:"PDF",type:"radio",options:s.map(o=>({label:o.name,value:o.uuid})),value:s[0].uuid}]});if(r==null)return null;let c=Array.isArray(r)?r[0]:r;return s.find(o=>o.uuid===c)||null}async function pt(t,l){if(!l)throw new Error("fetchableAttachmentURL: attachmentUUID required");let a=await t.getAttachmentURL(l);if(!a)throw new Error(`No URL returned for attachment ${l}`);return ht(a)}function ut(t){return t?ct:dt}function de(t){let l={attachmentUUID:null,page:null,x:null,y:null,highlightId:null,noteUUID:null,collapsed:!1,attachmentName:""};if(!t||typeof t!="string")return l;let a;try{a=new URLSearchParams(t.replace(/^\?/,""))}catch{return l}let s=c=>{let o=a.get(c);if(o===null||o.trim()==="")return null;let p=Number(o);return Number.isFinite(p)?p:null},r=s("page");return{attachmentUUID:a.get("att")||null,page:r!==null&&r>=1?Math.floor(r):null,x:s("x"),y:s("y"),highlightId:a.get("hl")||null,noteUUID:a.get("note")||null,collapsed:a.get("c")==="1",attachmentName:a.get("n")||""}}function ft({attachmentUUID:t,page:l,x:a,y:s,highlightId:r,collapsed:c,attachmentName:o}={}){let p=new URLSearchParams;return t&&p.set("att",t),c&&p.set("c","1"),o&&p.set("n",o),Number.isFinite(l)&&l>=1&&p.set("page",String(Math.floor(l))),Number.isFinite(a)&&p.set("x",String(a)),Number.isFinite(s)&&p.set("y",String(s)),r&&p.set("hl",r),p.toString()}function ve(t,l={},a=null){if(!t)throw new Error("buildEmbedMarkup: pluginUUID required");a===null&&(a=ut(l.collapsed));let s=ft(l);return`<object data="${s?`plugin://${t}?${s}`:`plugin://${t}`}" data-aspect-ratio="${a}" />`}function gt(t,l,a){if(!t||!l||!a)return null;let s=t.split(`
`),r=s.findIndex(o=>o.includes(`${lt}${l}`));if(r===-1)return null;let c=s.slice();return s[r+1]===""?c.splice(r+2,0,a.trim(),""):c.splice(r+1,0,"",a.trim(),""),c.join(`
`)}function we(t,l,a=null){return!t||!l||!t.includes(`plugin://${l}`)?!1:a?t.includes(`att=${a}`):!0}function be(t,l,a){if(!t||!l||!a)return null;let s=t.split(`
`),r=`plugin://${l}`,c=s.findIndex(p=>p.includes(r)&&p.includes(`att=${a}`));if(c===-1)return null;let o=s.slice();return o.splice(c,1),o[c]===""&&o[c-1]===""&&o.splice(c,1),o.join(`
`)}function ce(t,l,a,s={}){if(!t||!l||!a)return null;let r=t.split(`
`),c=`plugin://${l}`,o=r.findIndex(A=>A.includes(c)&&A.includes(`att=${a}`));if(o===-1)return null;let p=r[o],E=p.match(/data="(plugin:\/\/[^"]*)"/);if(!E)return null;let k=E[1],v=k.indexOf("?"),C=v===-1?"":k.slice(v+1),S={...de(C),attachmentUUID:a,...s},u=ft(S),f=u?`plugin://${l}?${u}`:`plugin://${l}`,b=r.slice(),w=p.replace(E[0],`data="${f}"`),x=ut(S.collapsed),y=w.match(/data-aspect-ratio="[^"]*"/);return w=y?w.replace(y[0],`data-aspect-ratio="${x}"`):w.replace(/\s*\/>\s*$/,` data-aspect-ratio="${x}" />`),b[o]=w,b.join(`
`)}function mt(t,l,a,s){return ce(t,l,a,{collapsed:!!s})}async function vt(t,l,a){let s=await me(t,l);if(!s){let p=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(p)&&p.length>0)||!p.some(k=>k&&k.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then run this again.`),null}let r=await t.getNoteContent({uuid:l});if(we(r,a,s.uuid))return await t.alert(`"${s.name}" is already open in this note - scroll to the viewer.`),s.uuid;let c=ve(a,{attachmentUUID:s.uuid,attachmentName:s.name}),o=gt(r,s.uuid,c);return o!==null?(await t.replaceNoteContent({uuid:l},o),s.uuid):(await t.insertNoteContent({uuid:l},`
${c}
`,{atEnd:!0}),s.uuid)}var Mn="Raw markdown";function On(t){let l=(String(t||"").match(/`+/g)||[]).reduce((a,s)=>Math.max(a,s.length),0);return"`".repeat(Math.max(3,l+1))}async function wt(t,l){let a=await t.getNoteContent({uuid:l});if(typeof a!="string"||a==="")return await t.alert("That note came back empty - nothing to dump."),null;let s=await t.getNoteAttachments({uuid:l}),r=(Array.isArray(s)?s:[]).map(p=>`- ${p&&p.name} | ${p&&p.type} | ${p&&p.uuid}`).join(`
`),c=On(a),o=await t.createNote("PDF Annotator debug - note markdown");return await t.insertNoteContent({uuid:o},`# Attachments

${r||"- (none)"}

# ${Mn}

${c}
${a}
${c}
`,{atEnd:!0}),await t.alert(`Wrote the note's raw markdown to a new note: "PDF Annotator debug - note markdown".

Open it and look for how the PDF attachment is referenced.`),o}async function bt(t,l,a){if(!l)return"";let s=await me(t,l);if(!s){let c=await t.getNoteAttachments({uuid:l});return(!(Array.isArray(c)&&c.length>0)||!c.some(p=>p&&p.type==="application/pdf"))&&await t.alert(`No PDF attachments on this note.

Attach a PDF to this note, then type {PDF Annotator} again where you want the viewer.`),""}let r=await t.getNoteContent({uuid:l});return we(r,a,s.uuid)?(await t.alert(`"${s.name}" already has a viewer in this note.

Detach that one first if you want to move it here.`),""):`
${ve(a,{attachmentUUID:s.uuid,attachmentName:s.name})}
`}async function zn(t,l,a,s){let r={uuid:l},c=be(a,t.context.pluginUUID,s);if(c!==null)try{await t.replaceNoteContent(r,c)}catch{}try{await t.replaceNoteContent(r,a)}catch{await t.replaceNoteContent(r,a)}}async function xt(t,l){let{noteUUID:a,attachmentUUID:s,page:r,highlightId:c}=de(l);if(!a){await t.alert("This link doesn't say which note the PDF lives on - it was likely exported by an older version of this plugin. Re-export the highlight to get a working link.");return}try{let o=await t.getNoteContent({uuid:a}),p=ce(o,t.context.pluginUUID,s,{page:r,highlightId:c,collapsed:!1});p!==null&&(t.context&&t.context.noteUUID===a?await zn(t,a,p,s):await t.replaceNoteContent({uuid:a},p))}catch{}await t.navigate(`https://www.amplenote.com/notes/${a}`)}function he(t){if(!t)return null;let l=String(t).trim().toLowerCase(),a=l.startsWith("#")?l:"#"+l;return ue.find(s=>s.id===l||s.hex.toLowerCase()===a||s.label.toLowerCase()===l)||null}function yt(){return he(ge)}function xe(t){let l=[];for(let a of String(t??"").split(/[,;\s]+/)){let s=he(a);if(s&&l.indexOf(s.id)===-1&&l.push(s.id),l.length===st)break}return l.length?l:le.slice()}function Ct(t){let l=t&&t.length?t:le;return l.indexOf(ge)!==-1?ge:l[0]}function Fn(){return"hl-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}function ye({page:t,color:l,rects:a,quoteText:s,note:r=null,id:c=null}){if(!Number.isInteger(t)||t<1)throw new Error(`createHighlight: page must be a positive integer, got ${t}`);if(!Array.isArray(a)||a.length===0)throw new Error("createHighlight: rects must be a non-empty array");for(let p of a)if(![p.x,p.y,p.width,p.height].every(Number.isFinite))throw new Error(`createHighlight: malformed rect ${JSON.stringify(p)}`);let o=he(l)||yt();return{id:c||Fn(),page:t,color:o.id,rects:a.map(p=>({x:p.x,y:p.y,width:p.width,height:p.height})),quoteText:String(s||""),note:r?String(r):null}}function Et(t,l){let a=l==null?null:String(l).trim();return{...t,note:a||null}}function kt(t,l){let a=he(l);if(!a)throw new Error(`withColor: unknown color "${l}"`);return{...t,color:a.id}}function St(t,l){return(t||[]).filter(a=>a.id!==l)}function Me(t,l,a){let s=!1,r=(t||[]).map(c=>c.id!==l?c:(s=!0,a(c)));return s?r:t}var $n="json",Nt="*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";function Tt(t){let l=JSON.stringify(t,null,0).replace(/`/g,"\\u0060");return`${Nt}
\`\`\`${$n}
${l}
\`\`\``}function Oe(t){if(!t)return null;let l=t.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/),a=!l&&t.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/),s=(l?l[1]:a?a[1]:t).trim();if(!s)return null;try{return JSON.parse(s)}catch{return null}}function Bn(t){if(!Array.isArray(t))return[];let l=[];for(let a of t)try{l.push(ye(a))}catch{}return l}async function Ce(t,l,a){let s=await t.getNoteContent({uuid:l}),r=Fe(s,V),c=Oe(r);return!c||typeof c!="object"?[]:Bn(c[a])}async function At(t,l,a,s){let r={uuid:l},c=await t.getNoteContent(r),o=Fe(c,V),E={...Oe(o)||{},[a]:s},k=Tt(E);o===null&&await t.insertNoteContent(r,`

# ${V}

`,{atEnd:!0});let v=jn(c,k);if(v!==null){await t.replaceNoteContent(r,v);return}await t.replaceNoteContent(r,k,{section:{heading:{text:V,level:1}}})}async function It(t,l,a){let s={uuid:l},r=await t.getNoteContent(s),c=Fe(r,V);if(c===null)return;let o=Oe(c)||{};if(!(a in o))return;let p={...o};delete p[a],await t.replaceNoteContent(s,Tt(p),{section:{heading:{text:V,level:1}}})}function ze(t,l){let a=/^#\s+(.*)$/,s=t.findIndex(c=>{let o=c.match(a);return o&&o[1].trim()===l});if(s===-1)return null;let r=t.length;for(let c=s+1;c<t.length;c++)if(/^#\s+/.test(t[c])){r=c;break}return{start:s,end:r}}function Fe(t,l){if(!t)return null;let a=t.split(`
`),s=ze(a,l);return s?a.slice(s.start+1,s.end).join(`
`).trim():null}function _n(t){if(!t)return"";let l=t,a=l.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);return a&&(l=l.replace(a[0],"")),l=l.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/,""),l=l.replace(Nt,""),l.trim()}function Dt(t,l){return String(t||"").includes("](plugin://")?l:`---

${l}`}function Ut(t,l){let a=(t||"").split(`
`),s=ze(a,V);if(!s)return null;let r=a.slice(0,s.start).join(`
`).replace(/\s+$/,""),c=a.slice(s.start).join(`
`);return`${r?r+`

`:""}${l}

${c}`}function jn(t,l){let a=(t||"").split(`
`),s=ze(a,V);if(!s)return null;let r=_n(a.slice(s.start+1,s.end).join(`
`).trim());if(!r)return null;let c=a.slice(0,s.start).join(`
`).replace(/\s+$/,""),o=a.slice(s.end).join(`
`).replace(/^\s+/,"");return`${c?c+`

`:""}${r}

${a[s.start]}

${l}${o?`

`+o:""}`}function Ht(t){return/^\s*>/.test(t)}function Rt(t,l,a,s){if(!t||!l||!s)return null;for(let r=0;r<t.length;r++){let c=t[r];if(!c.includes(`](plugin://${l}`)||a&&!c.includes(`att=${a}`)||!new RegExp(`hl=${qn(s)}(?![\\w-])`).test(c))continue;let o=r+1;for(o<t.length&&t[o].trim()===""&&o+1<t.length&&Ht(t[o+1])&&o++;o<t.length&&Ht(t[o]);)o++;return{start:r,end:o}}return null}function qn(t){return String(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Vn(t,l,a){if(!t||!l)return[];let s=[],r=String(t).split(`
`);for(let c of r){if(!c.includes(`](plugin://${l}`)||a&&!c.includes(`att=${a}`))continue;let o=c.match(/[?&]hl=([^&)\s]+)/);o&&s.indexOf(o[1])===-1&&s.push(o[1])}return s}function Pt(t,l,a,s){let r=String(t||"").split(`
`),c=Rt(r,l,a,s);if(!c)return null;let{start:o,end:p}=c;p<r.length&&r[p].trim()===""&&p++;let E=r.slice(0,o).concat(r.slice(p));return Vn(E.join(`
`),l,a).length?E.join(`
`):Gn(E).join(`
`)}function Gn(t){let l=t.findIndex(a=>a.trim()===`# ${V}`);l===-1&&(l=t.length);for(let a=l-1;a>=0;a--){let s=t[a].trim();if(s==="")continue;if(s!=="---")return t;let r=t.slice(0,a).concat(t.slice(a+1)),c=a;for(;c<r.length&&r[c].trim()===""&&(c===0||r[c-1].trim()==="");)r.splice(c,1);return r}return t}function $e(t,l,a,s,r){let c=String(t||"").split(`
`),o=Rt(c,l,a,s);return o?c.slice(0,o.start).concat(String(r).split(`
`),c.slice(o.end)).join(`
`):null}function G(t,l){return l.noteUUID||t.context.noteUUID}async function Lt(t,l,a){try{let s=await t.getNoteAttachments({uuid:l}),r=Array.isArray(s)&&s.find(c=>c&&c.uuid===a);return r?r.name:""}catch{return""}}async function Ee(t,l,a,s){let r=await Ce(t,l,a),c=s(r);return c!==r&&await At(t,l,a,c),{highlights:c}}async function Mt(t,l,a,s){if(a.pluginUUID)try{let r=await t.getNoteContent({uuid:l}),c=s(r);c!==null&&c!==r&&await t.replaceNoteContent({uuid:l},c)}catch{}}function Ot(t){if(t&&typeof t=="object")return t;if(typeof t!="string")return{};let l=t.trim();if(!l.startsWith("{"))return{action:l};try{return JSON.parse(l)}catch{return{action:l}}}async function zt(t,l){return JSON.stringify(await Wn(t,Ot(l)))}async function Wn(t,l){let a=Ot(l);switch(a.action){case"getPdfUrl":{let s=a.attachmentUUID;if(!s)return{error:"No attachment specified for this viewer."};try{return{url:await pt(t,s),name:await Lt(t,G(t,a),s)}}catch(r){return{error:`Could not load the PDF: ${r.message}`}}}case"loadHighlights":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=G(t,a);return{highlights:await Ce(t,s,a.attachmentUUID)}}catch(s){return{error:`Could not load highlights: ${s.message}`}}}case"addHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=ye(a.highlight||{});return await Ee(t,G(t,a),a.attachmentUUID,r=>r.concat([s]))}catch(s){return{error:`Could not save the highlight: ${s.message}`}}}case"recolorHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=G(t,a),r=await Ee(t,s,a.attachmentUUID,c=>Me(c,a.id,o=>kt(o,a.color)));return a.exportBlock&&await Mt(t,s,a,c=>$e(c,a.pluginUUID,a.attachmentUUID,a.id,a.exportBlock)),r}catch(s){return{error:`Could not change the highlight color: ${s.message}`}}}case"setHighlightNote":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{return await Ee(t,G(t,a),a.attachmentUUID,s=>Me(s,a.id,r=>Et(r,a.note)))}catch(s){return{error:`Could not save the note: ${s.message}`}}}case"removeHighlight":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};try{let s=G(t,a),r=await Ee(t,s,a.attachmentUUID,c=>St(c,a.id));return await Mt(t,s,a,c=>Pt(c,a.pluginUUID,a.attachmentUUID,a.id)),r}catch(s){return{error:`Could not remove the highlight: ${s.message}`}}}case"sendToNote":{if(!a.content)return{error:"Nothing to send."};try{let s={uuid:G(t,a)},r=await t.getNoteContent(s);if(a.highlightId){let p=$e(r,a.pluginUUID,a.attachmentUUID,a.highlightId,a.content);if(p!==null)return await t.replaceNoteContent(s,p),{ok:!0,replaced:!0}}let c=Dt(r,a.content),o=Ut(r,c);return o===null?await t.insertNoteContent(s,`
`+c+`
`,{atEnd:!0}):await t.replaceNoteContent(s,o),{ok:!0}}catch(s){return{error:`Could not add this to the note: ${s.message}`}}}case"removeViewer":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=G(t,a),r=await t.getNoteContent({uuid:s}),c=be(r,a.pluginUUID,a.attachmentUUID);return c===null?{error:"Could not find this viewer's block in the note - it may already be removed."}:(await t.replaceNoteContent({uuid:s},c),await It(t,s,a.attachmentUUID),{ok:!0})}catch(s){return{error:`Could not remove this viewer: ${s.message}`}}}case"getViewerSummary":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};let s=G(t,a),r=await Lt(t,s,a.attachmentUUID);try{let c=await Ce(t,s,a.attachmentUUID);return{name:r,count:c.length}}catch{return{name:r,count:0}}}case"setCollapsed":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=G(t,a),r=await t.getNoteContent({uuid:s}),c=mt(r,a.pluginUUID,a.attachmentUUID,a.collapsed);return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:s},c),{ok:!0})}catch(s){return{error:`Could not resize this viewer: ${s.message}`}}}case"clearDeepLink":{if(!a.attachmentUUID)return{error:"No attachment specified for this viewer."};if(!a.pluginUUID)return{error:"Missing plugin id - cannot locate this viewer."};try{let s=G(t,a),r=await t.getNoteContent({uuid:s}),c=ce(r,a.pluginUUID,a.attachmentUUID,{page:null,highlightId:null});return c===null?{ok:!1}:(await t.replaceNoteContent({uuid:s},c),{ok:!0})}catch(s){return{error:`Could not clear this viewer's deep link: ${s.message}`}}}case"exportAll":{if(!a.noteName)return{error:"Missing destination note name."};try{let s=await t.findNote({name:a.noteName}),r=s?s.uuid:await t.createNote(a.noteName);return await t.replaceNoteContent({uuid:r},a.content||""),{ok:!0,noteUUID:r}}catch(s){return{error:`Could not export highlights: ${s.message}`}}}case"setToolbarColors":{let s=xe(Array.isArray(a.colorIds)?a.colorIds.join(","):a.colorIds),r=s.join(", ");try{return typeof t.setSetting!="function"?{ids:s,saved:!1,error:"This Amplenote version can't save plugin settings."}:(await t.setSetting(fe,r),{ids:s,saved:!0})}catch(c){return{ids:s,saved:!1,error:`Could not save your colors: ${c.message}`}}}case"ping":return{ok:!0};default:return{error:`Unknown embed action: ${String(a.action)}`}}}var Z={chevronLeft:"M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",chevronRight:"M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",remove:"M19 13H5v-2h14v2z",add:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",moreVert:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",listBulleted:"M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",arrowUp:"M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z",arrowDown:"M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"},Ft={note:"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z",copy:"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",send:"M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",remove:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",download:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",postAdd:"M17 19.22H5V7h7V5H5c-1.1 0-2 .9-2 2v12.22c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h-2v7.22zM19 2h-2v3h-3v2h3v3h2V7h3V5h-3V2zM7 9h8v2H7zm0 3v2h8v-2H7zm0 3h5v2H7z",collapse:"M7.41 18.59 8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.42 5.41 12 10l4.59-4.59z",palette:"M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7zM6.5 11.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"};function Q(t){return'<svg class="pdfa-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+t+'"></path></svg>'}function Be(){function t(u,f){return{x:u.left-f.left,y:u.top-f.top,width:u.width,height:u.height}}function l(u,f){return{x:Math.min(u[0],f[0]),y:Math.min(u[1],f[1]),width:Math.abs(f[0]-u[0]),height:Math.abs(f[1]-u[1])}}function a(u,f){var b=Math.pow(10,f===void 0?2:f),w=function(x){return Math.round(x*b)/b};return{x:w(u.x),y:w(u.y),width:w(u.width),height:w(u.height)}}function s(u){return u.width>.01&&u.height>.01}function r(u,f,b){for(var w=String(u??""),x=Math.max(0,f===void 0?0:f),y=Math.min(w.length,b===void 0?w.length:b),A=function(_){return _===""||/\s/.test(_)},D=[],I=x;I<y;){for(;I<y&&A(w.charAt(I));)I++;if(I>=y)break;for(var F=I;I<y&&!A(w.charAt(I));)I++;D.push({start:F,end:I})}return D}function c(u){for(var f=1/0,b=1/0,w=-1/0,x=-1/0,y=0;y<(u?u.length:0);y++){var A=u[y];s(A)&&(f=Math.min(f,A.left),b=Math.min(b,A.top),w=Math.max(w,A.left+A.width),x=Math.max(x,A.top+A.height))}return isFinite(f)?{left:f,top:b,width:w-f,height:x-b}:null}function o(u,f,b){for(var w=[],x=0;x<u.length;x++){var y=t(u[x],f);if(s(y)){var A=b(y.x,y.y),D=b(y.x+y.width,y.y+y.height),I=a(l(A,D));s(I)&&w.push(I)}}return w}function p(u,f){var b=f(u.x,u.y),w=f(u.x+u.width,u.y+u.height);return l(b,w)}function E(u,f,b){var w=f.right-f.left,x=f.bottom-f.top;if(w<=0||x<=0)return null;var y=u.x2-u.x1,A=u.y2-u.y1,D=u.x1+(b.left-f.left)/w*y,I=u.x2-(f.right-b.right)/w*y,F=u.y1+(b.bottom-f.bottom)/x*A,_=u.y2-(f.top-b.top)/x*A;return{x:D,y:F,width:I-D,height:_-F}}function k(u,f){var b=Math.min(u.y+u.height,f.y+f.height)-Math.max(u.y,f.y);return b>.5*Math.min(u.height,f.height)}function v(u,f){var b=f===void 0?.6:f;if(!u||u.length<2)return(u||[]).slice();for(var w=u.slice().sort(function(X,K){return K.y-X.y||X.x-K.x}),x=[],y=0;y<w.length;y++){for(var A=!1,D=0;D<x.length;D++)if(k(x[D][0],w[y])){x[D].push(w[y]),A=!0;break}A||x.push([w[y]])}for(var I=[],F=0;F<x.length;F++){for(var _=x[F].slice().sort(function(X,K){return X.x-K.x}),L=null,Y=0;Y<_.length;Y++){var M=_[Y];if(L===null){L={x:M.x,y:M.y,width:M.width,height:M.height};continue}var Se=M.x-(L.x+L.width);if(Se<=b*Math.max(L.height,M.height)){var ae=Math.max(L.x+L.width,M.x+M.width),Ne=Math.max(L.y+L.height,M.y+M.height);L.x=Math.min(L.x,M.x),L.y=Math.min(L.y,M.y),L.width=ae-L.x,L.height=Ne-L.y}else I.push(L),L={x:M.x,y:M.y,width:M.width,height:M.height}}L!==null&&I.push(L)}return I.map(function(X){return a(X)})}function C(u,f,b,w){var x=w===void 0?0:w;return f>=u.x-x&&f<=u.x+u.width+x&&b>=u.y-x&&b<=u.y+u.height+x}function N(u,f,b,w,x){for(var y=u||[],A=y.length-1;A>=0;A--){var D=y[A];if(!(!D||D.page!==f||!D.rects)){for(var I=0;I<D.rects.length;I++)if(C(D.rects[I],b,w,x===void 0?1:x))return D}}return null}function S(u){return String(u??"").replace(/\s+/g," ").trim()}return{clientRectToLocal:t,rectFromCorners:l,roundRect:a,isVisibleRect:s,textTokenRanges:r,unionClientRects:c,clientRectsToPdfRects:o,pdfRectToViewportRect:p,itemRelativeRect:E,mergeLineRects:v,rectContainsPoint:C,hitTestHighlights:N,normalizeQuoteText:S}}var B=Be(),Ro=B.clientRectToLocal,Po=B.rectFromCorners,Lo=B.roundRect,Mo=B.isVisibleRect,Oo=B.textTokenRanges,zo=B.unionClientRects,Fo=B.clientRectsToPdfRects,$o=B.pdfRectToViewportRect,Bo=B.itemRelativeRect,_o=B.mergeLineRects,jo=B.rectContainsPoint,qo=B.hitTestHighlights,Vo=B.normalizeQuoteText;function _e(){var t=[.957,.871,.424];function l(o,p,E,k,v){var C=p.context.register(p.context.obj({Type:o.PDFName.of("ExtGState"),BM:o.PDFName.of("Multiply"),ca:o.PDFNumber.of(.4)})),N=[o.pushGraphicsState(),o.setGraphicsState("GS0")];N.push(o.setFillingColor(o.rgb(k[0],k[1],k[2])));for(var S=0;S<E.length;S++){var u=E[S];N.push(o.moveTo(u.x,u.y)),N.push(o.lineTo(u.x,u.y+u.height)),N.push(o.lineTo(u.x+u.width,u.y+u.height)),N.push(o.lineTo(u.x+u.width,u.y)),N.push(o.closePath())}N.push(o.fill()),N.push(o.popGraphicsState());var f=p.context.formXObject(N,{BBox:v,Resources:{ExtGState:{GS0:C}}});return p.context.register(f)}function a(o,p,E,k){for(var v=8,C=220,N=String(o||""),S=0,u=N.split(/\r?\n/),f=0;f<u.length;f++)S+=Math.max(1,Math.ceil(u[f].length/45));var b=Math.max(72,Math.min(22+S*14,260)),w=p.maxX+v;w+C>E-v&&(w=E-v-C),w<v&&(w=v);var x=p.maxY;x>k-v&&(x=k-v);var y=x-b;return y<v&&(y=v,x=Math.min(y+b,k-v)),[w,y,w+C,x]}function s(o,p,E,k,v){for(var C=E.rects,N=[],S=C[0].x,u=C[0].y,f=C[0].x+C[0].width,b=C[0].y+C[0].height,w=0;w<C.length;w++){var x=C[w],y=x.x,A=x.x+x.width,D=x.y,I=x.y+x.height;N.push(y,I,A,I,y,D,A,D),S=Math.min(S,y),u=Math.min(u,D),f=Math.max(f,A),b=Math.max(b,I)}var F=p.context.obj({Type:o.PDFName.of("Annot"),Subtype:o.PDFName.of("Highlight"),Rect:p.context.obj([S,u,f,b]),QuadPoints:p.context.obj(N),C:p.context.obj(k),F:o.PDFNumber.of(4),T:o.PDFString.of("PDF Annotator"),M:o.PDFString.of(new Date().toISOString()),CA:o.PDFNumber.of(.4)});E.note&&F.set(o.PDFName.of("Contents"),o.PDFString.of(E.note));var _=l(o,p,C,k,[S,u,f,b]);F.set(o.PDFName.of("AP"),p.context.obj({N:_}));var L=p.context.register(F),Y=[L];if(E.note){var M=p.context.register(p.context.obj({Type:o.PDFName.of("Annot"),Subtype:o.PDFName.of("Popup"),Rect:p.context.obj(a(E.note,{maxX:f,maxY:b},v&&v.width||612,v&&v.height||792)),Parent:L,Open:!1}));F.set(o.PDFName.of("Popup"),M),Y.push(M)}return Y}function r(o,p,E){var k=p.node.get(o.PDFName.of("Annots"));if(k instanceof o.PDFArray)for(var v=0;v<E.length;v++)k.push(E[v]);else p.node.set(o.PDFName.of("Annots"),p.doc.context.obj(E))}async function c(o,p,E,k){for(var v=await o.PDFDocument.load(p),C=v.getPages(),N=E||[],S=0;S<N.length;S++){var u=N[S];if(!(!u||!u.rects||!u.rects.length)){var f=C[u.page-1];if(f){var b=k&&k[u.color]||t,w=s(o,v,u,b,f.getSize());r(o,f,w)}}}return v.save()}return{writeHighlightsIntoPdf:c,buildHighlightAnnotation:s,appendAnnotationRefs:r}}var je=_e(),Wo=je.writeHighlightsIntoPdf,Jo=je.buildHighlightAnnotation,Yo=je.appendAnnotationRefs;function qe(){function t(v){return String(v??"").replace(/\]/g,"\\]").replace(/</g,"&lt;")}function l(v,C,N,S,u){var f=new URLSearchParams;C&&f.set("att",C),Number.isFinite(N)&&N>=1&&f.set("page",String(Math.floor(N))),S&&f.set("hl",S),u&&f.set("note",u);var b=f.toString();return"plugin://"+v+(b?"?"+b:"")}function a(v,C){return String(v??"").split(/\r?\n/).map(function(N){return(C+" "+N).replace(/[ \t]+$/,"")})}function s(v,C){return C?'<mark style="background-color:'+C+';">'+v+"</mark>":v}function r(v,C,N,S,u,f){var b=l(C,N,S.page,S.id,f),w=s(t(v||"PDF"),u),x="["+w+"]("+b+")",y=[x].concat(a(S.quoteText,"> >"));return S.note&&(y.push(">"),y=y.concat(a(S.note,">"))),y.join(`
`)}function c(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(v){return"<p>"+c(v).replace(/\r?\n/g,"<br>")+"</p>"}function p(v,C,N,S,u,f){var b=l(C,N,S.page,S.id,f),w=c(v||"PDF"),x=u?'<mark style="background-color: '+c(u)+';">'+w+"</mark>":w,y='<p><a href="'+c(b)+'">'+x+"</a></p>",A="<blockquote><blockquote>"+o(S.quoteText)+"</blockquote></blockquote>",D=S.note?"<blockquote>"+o(S.note)+"</blockquote>":"";return y+A+D}function E(v){return v.slice().sort(function(C,N){if(C.page!==N.page)return C.page-N.page;var S=C.rects&&C.rects[0]?C.rects[0].y:0,u=N.rects&&N.rects[0]?N.rects[0].y:0;return u-S})}function k(v,C,N,S,u,f,b){var w=f&&f.length?f:null,x=(S||[]).filter(function(D){return D&&(!w||w.indexOf(D.color)!==-1)}),y=E(x),A=y.map(function(D){var I=u&&u[D.color]||{};return r(v,C,N,D,I.hex,b)});return A.join(`

`)}return{buildDeepLink:l,buildHighlightBlock:r,buildHighlightHtml:p,buildExportAllContent:k}}var ke=qe(),Zo=ke.buildDeepLink,Qo=ke.buildHighlightBlock,Ko=ke.buildHighlightHtml,ea=ke.buildExportAllContent;function $t(){var t=window.__PDFA_CONFIG||{},l=window.__PDFA_GEOM||{},a=window.__PDFA_ANNOTATIONS||{},s=window.__PDFA_EXPORT||{},r={root:document.getElementById("pdfa-root"),pages:document.getElementById("pdfa-pages"),status:document.getElementById("pdfa-status"),pageLabel:document.getElementById("pdfa-page-label"),zoomLabel:document.getElementById("pdfa-zoom-label"),colors:document.getElementById("pdfa-colors"),hint:document.getElementById("pdfa-hint"),popover:document.getElementById("pdfa-popover"),panel:document.getElementById("pdfa-panel"),listToggle:document.getElementById("pdfa-list-toggle"),count:document.getElementById("pdfa-count"),more:document.getElementById("pdfa-more"),open:document.getElementById("pdfa-open"),scrollUp:document.getElementById("pdfa-scroll-up"),scrollDown:document.getElementById("pdfa-scroll-down"),collapsedCount:document.getElementById("pdfa-collapsed-count"),collapsedName:document.querySelector(".pdfa-collapsed-name"),name:document.querySelector(".pdfa-name")};function c(e){e&&(o.attachmentName=e,r.name&&(r.name.textContent=e),r.collapsedName&&(r.collapsedName.textContent=e))}var o={doc:null,scale:1.25,pageCount:0,current:1,rendering:!1,textSpans:0,viewports:{},rendered:{},renderingPage:{},highlights:[],pdfBytes:null,attachmentName:t.attachmentName||"",activeColorId:t.defaultColorId||((t.colors||[{}])[0]||{}).id,pendingSelection:null,lastCapturedText:"",noteEditing:null};function p(e,n){r.status.textContent=e||"",r.status.style.display=e?"block":"none",r.status.className=n?"pdfa-status pdfa-error":"pdfa-status"}function E(e){var n=Object.assign({noteUUID:t.noteUUID},e);return new Promise(function(i,d){try{if(typeof window.callAmplenotePlugin!="function")throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");i(window.callAmplenotePlugin(JSON.stringify(n)))}catch(h){d(h)}}).then(function(i){if(i&&typeof i=="object")return i;if(typeof i!="string")throw new Error("Empty reply from the plugin");try{return JSON.parse(i)}catch{throw new Error("Unreadable reply from the plugin: "+String(i).slice(0,120))}})}function k(){return t.colors||[]}function v(){for(var e=t.toolbarColorIds||[],n=k(),i=[],d=0;d<e.length;d++)for(var h=0;h<n.length;h++)if(n[h].id===e[d]){i.push(n[h]);break}return i.length?i:n.slice(0,4)}function C(){for(var e={},n=0;n<o.highlights.length;n++)e[o.highlights[n].color]=!0;var i=k().filter(function(d){return e[d.id]});return i.length?i:v()}function N(e){for(var n=k(),i=0;i<n.length;i++)if(n[i].id===e)return n[i].hex;return n.length?n[0].hex:"#F4DE6C"}function S(e){for(var n=0;n<o.highlights.length;n++)if(o.highlights[n].id===e)return o.highlights[n];return null}function u(e){var n=(t.icons||{})[e];if(!n)return null;var i="http://www.w3.org/2000/svg",d=document.createElementNS(i,"svg");d.setAttribute("class","pdfa-icon"),d.setAttribute("viewBox","0 0 24 24"),d.setAttribute("aria-hidden","true");var h=document.createElementNS(i,"path");return h.setAttribute("d",n),d.appendChild(h),d}function f(e,n,i,d){var h=document.createElement("button");h.className="pdfa-btn"+(n?" "+n:"");var g=d?u(d):null;if(g){h.appendChild(g);var m=document.createElement("span");m.textContent=e,h.appendChild(m)}else h.textContent=e;return h.onclick=function(T){T.stopPropagation(),i()},h}function b(e,n,i,d){var h=document.createElement("button");return h.className="pdfa-color",h.dataset.color=e.id,h.style.background=e.hex,h.title=d+" "+e.label,h.setAttribute("aria-label",d+" "+e.label),h.setAttribute("aria-pressed",String(!!n)),h.onclick=function(g){g.stopPropagation(),i(e.id)},h}function w(){for(var e=v(),n=0;n<e.length;n++)r.colors.appendChild(b(e[n],e[n].id===o.activeColorId,function(i){o.activeColorId=i,x(),o.pendingSelection&&We(o.pendingSelection,i)},"Highlight"))}function x(){for(var e=r.colors.querySelectorAll(".pdfa-color"),n=0;n<e.length;n++)e[n].setAttribute("aria-pressed",String(e[n].dataset.color===o.activeColorId))}function y(){for(var e=[],n=1;n<=o.pageCount;n++)(function(i){e.push(o.doc.getPage(i).then(function(d){o.viewports[i]=d.getViewport({scale:o.scale})}))})(n);return Promise.all(e)}function A(e){var n=o.viewports[e],i=document.createElement("div");return i.className="pdfa-page",i.dataset.page=String(e),i.style.width=n.width+"px",i.style.height=n.height+"px",i}function D(e,n){if(o.rendered[n]||o.renderingPage[n])return Promise.resolve();o.renderingPage[n]=!0;var i=o.viewports[n],d=document.createElement("canvas"),h=window.devicePixelRatio||1;d.width=Math.floor(i.width*h),d.height=Math.floor(i.height*h),d.style.width=i.width+"px",d.style.height=i.height+"px",e.appendChild(d);var g=document.createElement("div");g.className="pdfa-highlights",e.appendChild(g);var m=document.createElement("div");m.className="textLayer",m.style.width=i.width+"px",m.style.height=i.height+"px",m.style.setProperty("--scale-factor",String(o.scale)),e.appendChild(m);var T=d.getContext("2d");T.scale(h,h);var H=null;return o.doc.getPage(n).then(function(U){return H=U,U.render({canvasContext:T,viewport:i}).promise}).then(function(){return H.getTextContent()}).then(function(U){var R=[];return window.pdfjsLib.renderTextLayer({textContent:U,container:m,viewport:i,textDivs:R}).promise.then(function(){o.textSpans+=R.length;for(var P=0;P<R.length;P++)R[P].__pdfaItem=U.items[P];o.rendered[n]=!0,o.renderingPage[n]=!1,Y(n),F()})}).catch(function(U){o.renderingPage[n]=!1,p("Failed to render page "+n+": "+(U.message||U),!0)})}function I(){var e=oe();if(!e||!o.doc)return Promise.resolve();for(var n=e.getBoundingClientRect(),i=e.clientHeight,d=r.pages.querySelectorAll(".pdfa-page"),h=[],g=0;g<d.length;g++){var m=d[g],T=Number(m.dataset.page);if(!(o.rendered[T]||o.renderingPage[T])){var H=m.getBoundingClientRect(),U=H.top-n.top,R=H.bottom-n.top;R<-i||U>e.clientHeight+i||h.push(D(m,T))}}return Promise.all(h)}function F(){var e=0;for(var n in o.rendered)o.rendered[n]&&e++;if(e){var i=o.textSpans===0;p(i?"No selectable text found - this PDF may be a scan.":"",i)}}function _(){if(o.rendering)return Promise.resolve();o.rendering=!0,O(!0),p("Rendering...");var e=oe(),n=e?e.scrollHeight-e.clientHeight:0,i=n>0?e.scrollTop/n:0;return r.pages.innerHTML="",o.viewports={},o.rendered={},o.renderingPage={},o.textSpans=0,y().then(function(){for(var d=1;d<=o.pageCount;d++)r.pages.appendChild(A(d));if(e){var h=e.scrollHeight-e.clientHeight;e.scrollTop=i*(h>0?h:0)}o.rendering=!1,ie(),se(),I()}).catch(function(d){o.rendering=!1,p("Failed to render: "+(d.message||d),!0)})}function L(e){return function(n,i){return e.convertToViewportPoint(n,i)}}function Y(e){for(var n=e?'.pdfa-page[data-page="'+e+'"]':".pdfa-page",i=r.pages.querySelectorAll(n),d=0;d<i.length;d++){var h=i[d],g=Number(h.dataset.page),m=h.querySelector(".pdfa-highlights"),T=o.viewports[g];if(!(!m||!T)){m.innerHTML="";for(var H=L(T),U=0;U<o.highlights.length;U++){var R=o.highlights[U];if(!(!R||R.page!==g||!R.rects||!R.rects.length)){var P=document.createElement("div");P.className="pdfa-hl-group",P.dataset.id=R.id||"";for(var q=0;q<R.rects.length;q++){var W=l.pdfRectToViewportRect(R.rects[q],H),z=document.createElement("div");z.className="pdfa-hl",z.style.left=W.x+"px",z.style.top=W.y+"px",z.style.width=W.width+"px",z.style.height=W.height+"px",z.style.background=N(R.color),P.appendChild(z)}m.appendChild(P)}}}}}function M(){Y(),ae(),r.count.textContent=String(o.highlights.length)}function Se(){return o.highlights.slice().sort(function(e,n){return e.page!==n.page?e.page-n.page:(n.rects[0]?n.rects[0].y:0)-(e.rects[0]?e.rects[0].y:0)})}function ae(){r.panel.innerHTML="";var e=document.createElement("div");e.className="pdfa-panel-title";var n=document.createElement("span");n.textContent="Highlights",e.appendChild(n),e.appendChild(f("Close","",function(){X(!1)})),r.panel.appendChild(e);var i=Se();if(!i.length){var d=document.createElement("div");d.className="pdfa-panel-empty",d.textContent="No highlights yet. Select some text in the PDF and pick a color.",r.panel.appendChild(d);return}for(var h=0;h<i.length;h++)r.panel.appendChild(Ne(i[h]))}function Ne(e){var n=document.createElement("div");n.className="pdfa-hl-row",n.dataset.id=e.id||"",n.title="Jump to this highlight";var i=document.createElement("span");i.className="pdfa-chip",i.style.background=N(e.color),n.appendChild(i);var d=document.createElement("div"),h=document.createElement("div");h.className="pdfa-hl-page",h.textContent="Page "+e.page,d.appendChild(h);var g=document.createElement("div");if(g.className="pdfa-hl-quote",g.textContent=e.quoteText.length>160?e.quoteText.slice(0,160)+"...":e.quoteText,d.appendChild(g),e.note){var m=document.createElement("div");m.className="pdfa-hl-note",m.textContent=e.note,d.appendChild(m)}return n.appendChild(d),n.onclick=function(){Ze(e)},n}function X(e){var n=e===void 0?!r.panel.classList.contains("pdfa-open"):e;r.panel.classList.toggle("pdfa-open",n),r.listToggle.setAttribute("aria-pressed",String(n)),n&&ae(),se()}function K(e){for(var n=e&&e.nodeType===1?e:e&&e.parentElement;n;){if(n.classList&&n.classList.contains("textLayer"))return n;n=n.parentElement}return null}function qt(e,n){for(var i=[],d=[],h=null,g=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),m;m=g.nextNode();)if(e.intersectsNode(m)){var T=m.nodeValue||"",H=m===e.startContainer?e.startOffset:0,U=m===e.endContainer?e.endOffset:T.length,R=m.parentElement,P=R&&R.__pdfaItem;if(P)for(var q={x1:P.transform[4],y1:P.transform[5],x2:P.transform[4]+P.width,y2:P.transform[5]+P.height},W=R.getBoundingClientRect(),z=l.textTokenRanges(T,H,U),$=0;$<z.length;$++){var J=document.createRange();J.setStart(m,z[$].start),J.setEnd(m,z[$].end);var j=l.unionClientRects(J.getClientRects());if(j){var rt={left:j.left,top:j.top,width:j.width,height:j.height,right:j.left+j.width,bottom:j.top+j.height},it=l.itemRelativeRect(q,W,rt);it&&(i.push(it),d.push(T.slice(z[$].start,z[$].end)),h=rt)}}}return{rects:i,text:d.join(" "),lastCssRect:h}}function ee(e){if(o.pendingSelection=e,o.lastCapturedText=e&&e.rawText||"",!e){r.hint.textContent="",r.hint.style.display="none";return}r.hint.textContent=e.spilled?"Pick a color (page "+e.page+" only)":"Pick a color",r.hint.style.display="inline"}function Ve(e){if(!o.noteEditing){var n=window.getSelection();if(!n||n.isCollapsed||n.rangeCount===0){ee(null),O();return}var i=n.getRangeAt(0),d=K(i.startContainer);if(!d)return ee(null);var h=d.parentElement;if(!h||!h.dataset||!h.dataset.page)return ee(null);var g=Number(h.dataset.page);if(!o.rendered[g])return ee(null);var m=K(i.endContainer)!==d,T=qt(i,d),H=l.mergeLineRects(T.rects);if(!H.length)return ee(null);var U=T.lastCssRect||h.getBoundingClientRect(),R=e&&e.clientX?e.clientX:U.left+U.width/2,P=e&&e.clientY?e.clientY:U.top+U.height,q={page:g,rects:H,quoteText:l.normalizeQuoteText(T.text),spilled:m,anchorX:R,anchorY:P,rawText:String(n)};ee(q),Yt(q)}}var Vt=300,te=null;function Gt(){o.noteEditing||(te&&clearTimeout(te),te=setTimeout(Ge,Vt))}function Ge(){if(te=null,!o.noteEditing){var e=window.getSelection();!e||e.isCollapsed||e.rangeCount===0||K(e.getRangeAt(0).startContainer)&&String(e)!==o.lastCapturedText&&Ve(null)}}function pe(e,n){var i=o.highlights;return o.highlights=e,M(),E(n).then(function(d){if(!d||d.error)throw new Error(d&&d.error||"The plugin did not confirm the change.");return o.highlights=d.highlights||e,M(),p(""),!0}).catch(function(d){return o.highlights=i,M(),p(d.message||String(d),!0),!1})}function We(e,n){var i={id:null,page:e.page,color:n,rects:e.rects,quoteText:e.quoteText,note:null},d=e.anchorX,h=e.anchorY;ee(null),O(!0);var g=window.getSelection();g&&g.removeAllRanges&&g.removeAllRanges(),pe(o.highlights.concat([i]),{action:"addHighlight",attachmentUUID:t.attachmentUUID,highlight:i}).then(function(m){if(m){var T=o.highlights[o.highlights.length-1];T&&T.id&&Ae(T,d,h,!0)}})}function Wt(e,n){O(!0);for(var i=o.highlights.map(function(g){return g.id===e?Object.assign({},g,{color:n}):g}),d=null,h=0;h<i.length;h++)i[h].id===e&&(d=i[h]);pe(i,{action:"recolorHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e,color:n,exportBlock:d?Pe(d):null})}function Jt(e){O(!0),pe(o.highlights.filter(function(n){return n.id!==e}),{action:"removeHighlight",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID,id:e})}function Te(e,n){var i=String(n??"").trim();o.noteEditing=null,O(!0),pe(o.highlights.map(function(d){return d.id===e?Object.assign({},d,{note:i||null}):d}),{action:"setHighlightNote",attachmentUUID:t.attachmentUUID,id:e,note:i})}function ne(e,n,i,d){r.popover.innerHTML="",r.popover.classList.toggle("pdfa-editing",d==="editing"),r.popover.classList.toggle("pdfa-exporting",d==="exporting"),r.popover.classList.toggle("pdfa-menu",d==="menu"),r.popover.classList.toggle("pdfa-palette",d==="palette");for(var h=0;h<e.length;h++)r.popover.appendChild(e[h]);r.popover.classList.add("pdfa-open");var g=r.popover.offsetWidth,m=r.popover.offsetHeight,T=Math.max(4,Math.min(n-g/2,window.innerWidth-g-4)),H=i+12;H+m>window.innerHeight-4&&(H=Math.max(4,i-m-12)),H=Math.max(4,Math.min(H,window.innerHeight-m-4)),r.popover.style.left=T+"px",r.popover.style.top=H+"px"}function O(e){o.noteEditing&&!e||(o.noteEditing=null,r.popover.classList.remove("pdfa-open","pdfa-editing","pdfa-exporting","pdfa-menu","pdfa-palette"),r.popover.innerHTML="")}function Yt(e){for(var n=v(),i=[],d=0;d<n.length;d++)i.push(b(n[d],n[d].id===o.activeColorId,function(h){o.activeColorId=h,x(),We(e,h)},"Highlight"));ne(i,e.anchorX,e.anchorY)}function Ae(e,n,i,d){for(var h=k(),g=[],m=0;m<h.length;m++)g.push(b(h[m],h[m].id===e.color,function(H){Wt(e.id,H)},"Change to"));var T=!!e.note;g.push(f(T?"Edit note":"Add note",d&&!T?"pdfa-btn-primary":"",function(){en(e,n,i)},"note")),g.push(f("Copy","",function(){fn(e)},"copy")),g.push(f("Send to note","",function(){gn(e)},"send")),g.push(f("Remove","pdfa-remove",function(){Jt(e.id)},"remove")),ne(g,n,i)}function Xt(e,n){for(var i=C(),d={},h=0;h<i.length;h++)d[i[h].id]=!0;var g=document.createElement("div");g.className="pdfa-export-hint",g.textContent="Export highlights to a note";var m=document.createElement("div");m.className="pdfa-export-colors";for(var T=0;T<i.length;T++)(function(U){var R=b(U,!0,function(P){d[P]=!d[P],R.setAttribute("aria-pressed",String(d[P]))},"Toggle");m.appendChild(R)})(i[T]);var H=document.createElement("div");H.className="pdfa-note-actions",H.appendChild(f("Create / update note","pdfa-btn-primary",function(){for(var U=[],R=0;R<i.length;R++)d[i[R].id]&&U.push(i[R].id);mn(U.length===i.length?null:U)})),ne([g,m,H],e,n,"exporting")}function Zt(e,n){var i=v().map(function(P){return P.id}),d=document.createElement("div");d.className="pdfa-slot-row";var h=document.createElement("div");h.className="pdfa-export-colors pdfa-catalog-row";function g(){d.innerHTML="";for(var P=0;P<4;P++)(function(z){var $=i[z];if(!$){var J=document.createElement("span");J.className="pdfa-slot-empty",J.title="Empty slot - pick a color below",d.appendChild(J);return}var j=b(Qt($),!0,function(){i.splice(z,1),g()},"Remove");j.classList.add("pdfa-slot"),d.appendChild(j)})(P);h.innerHTML="";for(var q=k(),W=0;W<q.length;W++)(function(z){var $=i.indexOf(z.id)!==-1,J=b(z,!1,function(){$?i.splice(i.indexOf(z.id),1):i.length<4&&i.push(z.id),g()},$?"Remove":"Add");$&&J.classList.add("pdfa-taken"),h.appendChild(J)})(q[W])}g();var m=document.createElement("div");m.className="pdfa-export-hint",m.textContent="Your toolbar - click a color below to fill a slot";var T=document.createElement("div");T.className="pdfa-export-hint",T.textContent="All "+k().length+" Amplenote colors";var H=document.createElement("div");H.className="pdfa-export-hint pdfa-scope-hint",H.textContent="Applies to every PDF, on every device.";var U=document.createElement("div");U.className="pdfa-note-actions",U.appendChild(f("Save","pdfa-btn-primary",function(){Kt(i)})),U.appendChild(f("Cancel","",function(){O(!0)}));var R=document.createElement("span");R.className="pdfa-spacer",U.appendChild(R),U.appendChild(f("Reset","",function(){i=[],g()})),ne([m,d,T,h,H,U],e,n,"palette")}function Qt(e){for(var n=k(),i=0;i<n.length;i++)if(n[i].id===e)return n[i];return n[0]}function Kt(e){E({action:"setToolbarColors",colorIds:e}).then(function(n){t.toolbarColorIds=n&&n.ids||e,t.toolbarColorIds.indexOf(o.activeColorId)===-1&&(o.activeColorId=t.toolbarColorIds[0]),r.colors.innerHTML="",w(),x(),O(!0),p(n&&n.error?n.error:"Highlight colors updated.",!!(n&&n.error))}).catch(function(n){p("Could not save your colors: "+n.message,!0)})}function en(e,n,i){o.noteEditing=e.id;var d=document.createElement("textarea");d.className="pdfa-note-input",d.rows=3,d.value=e.note||"",d.placeholder="Note for this highlight";var h=document.createElement("div");h.className="pdfa-note-actions",e.note&&h.appendChild(f("Delete note","",function(){Te(e.id,"")}));var g=document.createElement("span");g.className="pdfa-spacer",h.appendChild(g),h.appendChild(f("Cancel","",function(){Je(e,n,i)})),h.appendChild(f("Save","pdfa-btn-primary",function(){Te(e.id,d.value)})),d.onkeydown=function(m){m.key==="Enter"&&(m.ctrlKey||m.metaKey)?(m.preventDefault(),m.stopPropagation(),Te(e.id,d.value)):m.key==="Escape"&&(m.preventDefault(),m.stopPropagation(),Je(e,n,i))},ne([d,h],n,i,"editing"),d.focus(),d.setSelectionRange(d.value.length,d.value.length)}function Je(e,n,i){o.noteEditing=null;var d=S(e.id)||e;Ae(d,n,i)}function tn(e){if(!o.noteEditing){var n=window.getSelection();if(!(n&&!n.isCollapsed)){for(var i=e.target,d=null;i&&i!==r.pages;){if(i.classList&&i.classList.contains("pdfa-page")){d=i;break}i=i.parentElement}if(!d)return O();var h=Number(d.dataset.page),g=o.viewports[h];if(!g)return O();var m=d.getBoundingClientRect(),T=g.convertToPdfPoint(e.clientX-m.left,e.clientY-m.top),H=l.hitTestHighlights(o.highlights,h,T[0],T[1],1);H&&H.id?Ae(H,e.clientX,e.clientY):O()}}}function Ie(){return Math.round(o.scale*100)+"%"}function ie(){r.pageLabel.textContent=o.current+" / "+o.pageCount,document.activeElement!==r.zoomLabel&&(r.zoomLabel.value=Ie())}function oe(){return r.root.querySelector(".pdfa-scroll")}function Ye(){return r.panel&&r.panel.classList.contains("pdfa-open")?r.panel:oe()}function Xe(e){var n=r.pages.querySelector('.pdfa-page[data-page="'+e+'"]');n&&D(n,e)}function De(e){var n=Math.min(Math.max(1,e),o.pageCount),i=r.pages.querySelector('.pdfa-page[data-page="'+n+'"]');Xe(n);var d=oe();i&&d&&(d.scrollTop+=i.getBoundingClientRect().top-d.getBoundingClientRect().top),I(),o.current=n,ie()}function Ze(e){var n=r.pages.querySelector('.pdfa-page[data-page="'+e.page+'"]'),i=o.viewports[e.page];if(!(!n||!i||!e.rects||!e.rects.length)){var d=l.pdfRectToViewportRect(e.rects[0],L(i)),h=oe(),g=n.getBoundingClientRect().top+d.y;h.scrollTop+=g-h.getBoundingClientRect().top-h.clientHeight/3,Xe(e.page),I(),o.current=e.page,ie()}}function nn(){try{r.root.setAttribute("tabindex","-1"),r.root.focus(),r.root.scrollIntoView&&r.root.scrollIntoView({block:"nearest"})}catch{}}function on(e){if(!(!e||!e.id)){var n=r.pages.querySelector('.pdfa-hl-group[data-id="'+e.id+'"]');n&&(n.classList.add("pdfa-hl-flash"),setTimeout(function(){n.classList.remove("pdfa-hl-flash")},2600))}}function Ue(e){return Math.min(Math.max(.4,e),4)}function He(e){return o.scale=Ue(e),_()}function Qe(){var e=String(r.zoomLabel.value).replace(/[\s%]/g,""),n=/^\d*\.?\d+$/.test(e)?parseFloat(e):NaN;if(n>0){var i=Ue(n/100);i!==o.scale&&He(i)}r.zoomLabel.value=Ie()}function an(){return o.doc?o.doc.getPage(1).then(function(e){var n=oe();if(n){var i=window.getComputedStyle(n),d=n.clientWidth-(parseFloat(i.paddingLeft)||0)-(parseFloat(i.paddingRight)||0),h=e.getViewport({scale:1}).width;if(!(!(d>0)||!(h>0))){var g=Ue(d/h);g<o.scale&&(o.scale=g,ie())}}}).catch(function(){}):Promise.resolve()}function Ke(e){var n=Ye();n&&(n.scrollTop+=e*Math.max(80,n.clientHeight*.85),se(),I())}function et(e,n){var i=null,d=null,h=!1,g=function(){i&&clearTimeout(i),d&&clearInterval(d),i=d=null};e.addEventListener("pointerdown",function(){g(),h=!1,i=setTimeout(function(){h=!0,d=setInterval(function(){if(e.disabled)return g();Ke(n*.25)},120)},320)}),["pointerup","pointercancel","pointerleave"].forEach(function(m){e.addEventListener(m,g)}),e.onclick=function(){if(h){h=!1;return}Ke(n)}}function se(){var e=Ye();if(!(!e||!r.scrollUp)){var n=e.scrollHeight-e.clientHeight;r.scrollUp.disabled=e.scrollTop<=1,r.scrollDown.disabled=e.scrollTop>=n-1}}function rn(){se(),I(),O();for(var e=r.pages.querySelectorAll(".pdfa-page"),n=o.current,i=1/0,d=0;d<e.length;d++){var h=Math.abs(e[d].getBoundingClientRect().top-60);h<i&&(i=h,n=Number(e[d].dataset.page))}n!==o.current&&(o.current=n,ie())}function sn(){return new Promise(function(e,n){if(window.pdfjsLib)return e(window.pdfjsLib);var i=document.createElement("script");i.src=t.pdfJsSrc,i.onload=function(){window.pdfjsLib?e(window.pdfjsLib):n(new Error("PDF.js loaded but did not register itself."))},i.onerror=function(){n(new Error("Could not load PDF.js from the CDN."))},document.head.appendChild(i)})}function ln(){return new Promise(function(e,n){if(window.PDFLib)return e(window.PDFLib);var i=document.createElement("script");i.src=t.pdfLibSrc,i.onload=function(){window.PDFLib?e(window.PDFLib):n(new Error("pdf-lib loaded but did not register itself."))},i.onerror=function(){n(new Error("Could not load pdf-lib from the CDN."))},document.head.appendChild(i)})}function dn(){for(var e={},n=k(),i=0;i<n.length;i++)n[i].rgb&&(e[n[i].id]=n[i].rgb);return e}function cn(){var e=(o.attachmentName||"annotated").replace(/\.pdf$/i,"");return e+"-annotated.pdf"}function Re(){for(var e={},n=k(),i=0;i<n.length;i++)e[n[i].id]={hex:n[i].hex};return e}function tt(){var e=(o.attachmentName||"PDF").replace(/\.pdf$/i,"");return e+" - Highlights"}function Pe(e){var n=Re()[e.color]||{};return s.buildHighlightBlock(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,n.hex,t.noteUUID)}function hn(e){if(!s.buildHighlightHtml)return null;var n=Re()[e.color]||{};return s.buildHighlightHtml(o.attachmentName,t.pluginUUID,t.attachmentUUID,e,n.hex,t.noteUUID)}function pn(e,n){var i=function(g){var m=g.clipboardData||window.clipboardData;m&&(m.setData("text/plain",e),n&&m.setData("text/html",n),g.preventDefault())},d=document.createElement("textarea");d.value=e,d.style.position="fixed",d.style.left="-9999px",document.body.appendChild(d),d.focus(),d.select(),document.addEventListener("copy",i,!0);var h=!1;try{h=document.execCommand("copy")}catch{h=!1}return document.removeEventListener("copy",i,!0),document.body.removeChild(d),h}function un(e,n){var i=function(){return!navigator.clipboard||!navigator.clipboard.writeText?d():navigator.clipboard.writeText(e).then(function(){return"plain"},d)},d=function(){return pn(e,n)?Promise.resolve(n?"rich":"plain"):Promise.reject(new Error("every clipboard route was refused"))};if(n&&navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem=="function")try{var h=new ClipboardItem({"text/plain":new Blob([e],{type:"text/plain"}),"text/html":new Blob([n],{type:"text/html"})});return navigator.clipboard.write([h]).then(function(){return"rich"},i)}catch{return i()}return i()}function fn(e){O(!0);var n,i;try{n=Pe(e),i=hn(e)}catch(d){p("Could not build the copy: "+(d.message||d),!0);return}un(n,i).then(function(d){p(d==="rich"?"Highlight copied - paste it into any note.":"Highlight copied as plain text - this browser would not allow a formatted copy.")}).catch(function(d){p("Could not copy: "+(d.message||d),!0)})}function gn(e){O(!0),E({action:"sendToNote",content:Pe(e),highlightId:e.id,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(n){if(!n||n.error)throw new Error(n&&n.error||"Could not send this to the note.");ae(),p(n.replaced?"Updated this highlight where it already sits in the note.":"Added to this note, below the text.")}).catch(function(n){p(n.message||String(n),!0)})}function mn(e){O(!0);var n=s.buildExportAllContent(o.attachmentName,t.pluginUUID,t.attachmentUUID,o.highlights,Re(),e,t.noteUUID);if(!n){p(e?"No highlights match those colors.":"No highlights to export yet.",!0);return}E({action:"exportAll",noteName:tt(),content:n}).then(function(i){if(!i||i.error)throw new Error(i&&i.error||"Could not export highlights.");p('Exported to "'+tt()+'".')}).catch(function(i){p(i.message||String(i),!0)})}function vn(e,n){var i=[];i.push(f("Collapse","",function(){O(!0),En()},"collapse"),f("Download","",function(){O(!0),xn()},"download"),f("Export...","",function(){Xt(e,n)},"postAdd"),f("Highlight colors...","",function(){Zt(e,n)},"palette"),f("Remove viewer...","pdfa-remove",function(){wn(e,n)},"remove")),ne(i,e,n,"menu")}function wn(e,n){var i=document.createElement("div");i.className="pdfa-export-hint",i.textContent="Remove this viewer and all its highlights from this note? This cannot be undone.";var d=document.createElement("div");d.className="pdfa-note-actions",d.appendChild(f("Cancel","",function(){O(!0)}));var h=document.createElement("span");h.className="pdfa-spacer",d.appendChild(h),d.appendChild(f("Remove","pdfa-remove",bn)),ne([i,d],e,n,"exporting")}function bn(){O(!0),p("Removing this viewer..."),E({action:"removeViewer",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"Could not remove this viewer.");document.body.innerHTML='<div style="padding:16px;font:13px sans-serif;opacity:.75">Removed - this block will disappear once the note refreshes.</div>'}).catch(function(e){p(e.message||String(e),!0)})}function xn(){o.pdfBytes&&(p("Preparing the download..."),ln().then(function(e){return a.writeHighlightsIntoPdf(e,o.pdfBytes,o.highlights,dn())}).then(function(e){return yn(e,cn())}).catch(function(e){p("Could not prepare the download: "+(e.message||e),!0)}))}function yn(e,n){var i=new Blob([e],{type:"application/pdf"}),d=null;try{d=new File([i],n,{type:"application/pdf"})}catch{}return d&&navigator.share&&navigator.canShare&&navigator.canShare({files:[d]})?navigator.share({files:[d],title:n}).then(function(){p("")}).catch(function(h){return h&&h.name==="AbortError"?p(""):nt(i,n)}):nt(i,n)}function nt(e,n){var i=URL.createObjectURL(e),d=document.createElement("a");d.href=i,d.download=n,document.body.appendChild(d),d.click(),d.remove(),setTimeout(function(){URL.revokeObjectURL(i)},4e3);var h=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return p(h?"If no file appeared, this app can't save files - open the note on a computer to download it.":""),Promise.resolve()}function Cn(){return E({action:"loadHighlights",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).then(function(e){if(!e||e.error)throw new Error(e&&e.error||"No answer from the plugin");o.highlights=e.highlights||[]}).catch(function(e){o.highlights=[],p("Could not load saved highlights: "+(e.message||e),!0)})}function En(){var e=o.highlights.length;r.collapsedCount.textContent=e?e+(e===1?" highlight":" highlights"):"",r.root.classList.add("pdfa-collapsed-mode"),ot(!0)}function ot(e){E({action:"setCollapsed",collapsed:e,attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function kn(){E({action:"clearDeepLink",attachmentUUID:t.attachmentUUID,pluginUUID:t.pluginUUID}).catch(function(){})}function Sn(){r.root.classList.remove("pdfa-collapsed-mode"),o.doc||at(),ot(!1)}function at(){p("Loading PDF..."),(t.highlightId||t.page)&&(nn(),kn()),sn().then(function(e){return e.GlobalWorkerOptions.workerSrc=t.workerSrc,E({action:"getPdfUrl",attachmentUUID:t.attachmentUUID})}).then(function(e){if(!e||!e.url)throw new Error(e&&e.error||"Could not resolve the PDF URL");return c(e.name),fetch(e.url)}).then(function(e){if(!e.ok)throw new Error("Download failed (HTTP "+e.status+")");return e.arrayBuffer()}).then(function(e){return o.pdfBytes=e.slice(0),window.pdfjsLib.getDocument({data:e}).promise}).then(function(e){return o.doc=e,o.pageCount=e.numPages,Cn()}).then(function(){return an()}).then(function(){return _()}).then(function(){M();var e=t.highlightId?S(t.highlightId):null;e?(Ze(e),on(e)):t.page&&De(t.page)}).catch(function(e){p(e.message||String(e),!0)})}try{document.getElementById("pdfa-prev").onclick=function(){De(o.current-1)},document.getElementById("pdfa-next").onclick=function(){De(o.current+1)},document.getElementById("pdfa-zoom-in").onclick=function(){He(o.scale+.25)},document.getElementById("pdfa-zoom-out").onclick=function(){He(o.scale-.25)},r.zoomLabel.addEventListener("focus",function(){r.zoomLabel.value=String(Math.round(o.scale*100)),setTimeout(function(){document.activeElement===r.zoomLabel&&r.zoomLabel.select()},0)}),r.zoomLabel.addEventListener("blur",Qe),r.zoomLabel.addEventListener("keydown",function(e){e.key==="Enter"?(e.preventDefault(),Qe(),r.zoomLabel.blur()):e.key==="Escape"&&(e.preventDefault(),r.zoomLabel.value=Ie(),r.zoomLabel.blur())}),et(r.scrollUp,-1),et(r.scrollDown,1),r.listToggle.onclick=function(){X()},r.more.onclick=function(e){vn(e.clientX,e.clientY)},oe().addEventListener("scroll",rn),r.panel.addEventListener("scroll",se),r.pages.addEventListener("mouseup",Ve),r.pages.addEventListener("click",tn),document.addEventListener("selectionchange",Gt),r.pages.addEventListener("touchend",function(){te&&clearTimeout(te),te=null,Ge()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&!o.noteEditing&&O()}),document.addEventListener("mousedown",function(e){r.popover.classList.contains("pdfa-open")&&(r.popover.contains(e.target)||O())}),w(),ae(),r.root.querySelector(".pdfa-collapsed").onclick=Sn,t.collapsed?E({action:"getViewerSummary",attachmentUUID:t.attachmentUUID}).then(function(e){if(!(!e||e.error)){c(e.name);var n=e.count||0;r.collapsedCount.textContent=n?n+(n===1?" highlight":" highlights"):""}}).catch(function(){}):at()}catch(e){p("Viewer failed to start: "+(e&&e.message?e.message:e),!0)}}function Bt(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Jn(t){return JSON.stringify(t).replace(/</g,"\\u003c")}var Yn=`
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
  /* Same column layout as the filter, wider: eleven 20px swatches plus their gaps need
     ~250px of content box to sit six-and-five rather than in a ragged three rows. */
  .pdfa-popover.pdfa-palette { flex-direction: column; align-items: stretch; width: 274px; }
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
  /* THE PALETTE PICKER (openPalettePopover). Eleven swatches need to wrap; the export
     filter's row never had to, which is why this is a separate rule rather than a tweak
     to the one above. */
  .pdfa-catalog-row { flex-wrap: wrap; gap: 8px; }
  /* Already on the toolbar: dimmed, not hidden. Seeing what is spoken for is the reason
     to show all eleven at once, and a gap where a color used to be reads as a bug. */
  .pdfa-catalog-row .pdfa-taken { opacity: .3; }
  /* The four slots ARE the toolbar preview, so they are bigger than catalog swatches and
     spaced like the bar itself rather than packed like a palette. */
  .pdfa-slot-row { display: flex; gap: 12px; align-items: center; padding: 2px 0 10px; }
  .pdfa-slot-row .pdfa-slot { width: 24px; height: 24px; }
  /* An empty slot has to read as "a color goes here", which a gap cannot. Dashed ring,
     same diameter as a filled slot so the row does not reflow as slots fill and empty. */
  .pdfa-slot-empty { width: 24px; height: 24px; border-radius: 50%;
    border: 1px dashed var(--pdfa-border); }
  /* Sits under both rows as the consequence of pressing Save, so it gets a rule of its
     own rather than sharing the hints' bottom padding. */
  .pdfa-scope-hint { padding-top: 2px; }
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
`,_t={light:"--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;",dark:"--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;"};function jt({attachmentUUID:t,attachmentName:l="",page:a=null,highlightId:s=null,lightDarkMode:r="light",pluginUUID:c=null,noteUUID:o=null,collapsed:p=!1,toolbarColorIds:E=le}={}){let k=_t[r]||_t.light,v={attachmentUUID:t,page:a,highlightId:s,pluginUUID:c,noteUUID:o,pdfJsSrc:re.pdfJs,workerSrc:re.pdfJsWorker,pdfLibSrc:re.pdfLib,colors:ue.map(C=>({id:C.id,label:C.label,hex:C.hex,rgb:C.rgb})),toolbarColorIds:E,defaultColorId:Ct(E),icons:Ft,collapsed:p,attachmentName:l};return`<link rel="stylesheet" href="${re.pdfViewerCss}">
<link rel="stylesheet" href="${Bt(re.robotoCss)}">
<style>:root{${k}}${Yn}</style>
<div id="pdfa-root"${p?' class="pdfa-collapsed-mode"':""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${Bt(l)}</span>
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
            aria-label="Previous page">${Q(Z.chevronLeft)}</button>
    <span class="pdfa-label" id="pdfa-page-label">- / -</span>
    <button id="pdfa-next" class="pdfa-icon-btn" title="Next page"
            aria-label="Next page">${Q(Z.chevronRight)}</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" class="pdfa-icon-btn" title="Zoom out"
            aria-label="Zoom out">${Q(Z.remove)}</button>
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
            aria-label="Zoom in">${Q(Z.add)}</button>
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
            >${Q(Z.listBulleted)}<span class="pdfa-count" id="pdfa-count">0</span></button>
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
            aria-label="More actions">${Q(Z.moreVert)}</button>
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
      <button id="pdfa-scroll-up" title="Scroll up" aria-label="Scroll up">${Q(Z.arrowUp)}</button>
      <button id="pdfa-scroll-down" title="Scroll down" aria-label="Scroll down">${Q(Z.arrowDown)}</button>
    </div>
  </div>
  <!-- Colors on a fresh selection; recolor / note / remove on an existing highlight;
       the note editor itself. One element, filled in per context by the viewer. -->
  <div class="pdfa-popover" id="pdfa-popover"></div>
</div>
<script>window.__PDFA_CONFIG = ${Jn(v)};
window.__PDFA_GEOM = (${Be.toString()})();
window.__PDFA_ANNOTATIONS = (${_e.toString()})();
window.__PDFA_EXPORT = (${qe.toString()})();<\/script>
<script>(${$t.toString()})();<\/script>`}var Xn={noteOption:{"Annotate PDF":async function(t,l){return vt(t,l,t.context.pluginUUID)},"Debug: dump note markdown":async function(t,l){return wt(t,l)}},insertText:async function(t){return bt(t,t.context.noteUUID,t.context.pluginUUID)},linkTarget:async function(t,...l){return xt(t,l[0])},renderEmbed:function(t,...l){let{attachmentUUID:a,page:s,highlightId:r,collapsed:c,attachmentName:o}=de(l[0]);return a?jt({attachmentUUID:a,page:s,highlightId:r,collapsed:c,attachmentName:o,lightDarkMode:t.context.lightDarkMode,pluginUUID:t.context.pluginUUID,noteUUID:t.context.noteUUID,toolbarColorIds:xe(t.settings?t.settings[fe]:null)}):`<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`},onEmbedCall:async function(t,...l){return zt(t,l[0])}},Zn=Xn;return Un(Qn);})();

  var plugin = __pluginModule.default;
  return plugin;
})()
