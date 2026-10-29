import {TextEditor} from './editor.js';
import {placementFromDetail,fitPlacement,movePlacement} from './transforms.js';
import {BACKGROUNDS,resolveBackground,drawFrameBackground,randomizeBackground,rethemeBackground} from './backgrounds.js';
import {THEMES,PALETTES,MATERIALS,SHAPES,PRESETS,FONT_PICKS,getTheme,getPalette,iconUrl} from './catalog.js';
import {DEFAULT_STATE,clone,sanitizeState,exportDimensions,clamp,uniqueId} from './core.js';
import {FontManager} from './fonts.js';
import {render,makeExport} from './render.js';
import {assetPut,assetGet,assetDelete,safeRead,safeWrite,fileDataUrl} from './storage.js';

const $=id=>document.getElementById(id);
const fonts=new FontManager();
document.body.setAttribute('aria-busy','true');
for(const control of document.querySelectorAll('button,input,select,textarea'))control.disabled=true;
let state=clone(DEFAULT_STATE),activeBlock=0,undo=[],redo=[],lastChange={key:'',time:0},renderTicket=0,raf=0,saveTimer,toastTimer,dirty=false,autoTimer=null,busy=false,galleryKind='fonts',fontObserver,cover=null;
let textEditor,placementBefore=null,previewVersion=-1,previewDetails=[];
let favorites=safeRead('yda-favorites-v1',[]);
if(!Array.isArray(favorites))favorites=[];
const tabButtons=[...document.querySelectorAll('[data-tab]')];
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,6500);}
function persistCurrent(){if(!dirty)return;const ok=safeWrite('yda-project-v1',state);dirty=!ok;$('saveStatus').textContent=ok?'შენახულია ამ ბრაუზერში':'ავტომატური შენახვა მიუწვდომელია — შეინახე პროექტის ფაილი';}
function save(){dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(persistCurrent,450);}
function updateUndo(){$('undo').disabled=!undo.length;$('redo').disabled=!redo.length;}
function stopAuto(){if(autoTimer)clearInterval(autoTimer);autoTimer=null;$('autoplay').setAttribute('aria-pressed','false');$('autoplay').innerHTML='▷ <span>ავტო</span>';}
function change(fn,{key='',sync=false,automatic=false}={}){textEditor?.finish();if(!automatic)stopAuto();const now=Date.now();if(key!==lastChange.key||now-lastChange.time>500||!key){undo.push(clone(state));if(undo.length>60)undo.shift();}redo=[];lastChange={key,time:now};fn(state);if(sync)syncControls();updateUndo();queueRender();save();}
function restore(next){stopAuto();state=sanitizeState(next,fonts.ids());syncControls();queueRender();save();updateUndo();}
function stepBack(){textEditor?.finish();if(!undo.length)return;redo.push(clone(state));restore(undo.pop());lastChange.key='';}
function stepForward(){textEditor?.finish();if(!redo.length)return;undo.push(clone(state));restore(redo.pop());lastChange.key='';}
function queueRender(){renderTicket++;$('stage').setAttribute('aria-busy','true');cancelAnimationFrame(raf);const ticket=renderTicket;raf=requestAnimationFrame(()=>updatePreview(ticket));}
async function updatePreview(ticket){const snap=clone(state);const timer=setTimeout(()=>{if(ticket===renderTicket)$('loading').hidden=false;},180);try{const result=await render(snap,fonts,{scale:Math.min(1,1600/snap.width,1200/snap.height)});if(ticket!==renderTicket)return;const target=$('preview');target.width=result.canvas.width;target.height=result.canvas.height;target.getContext('2d').drawImage(result.canvas,0,0);target.setAttribute('aria-label',snap.blocks.filter(b=>b.enabled).map(b=>b.text).join(' — '));$('previewStatus').textContent=getTheme(snap.theme).name;$('dimensions').textContent=`${snap.width} × ${snap.height} px`;$('fitNote').textContent=result.warnings.join(' · ');$('fitNote').classList.toggle('warning',result.warnings.length>0);if(!cover)$('stage').style.aspectRatio=`${snap.width} / ${snap.height}`;updateExportInfo();previewVersion=ticket;previewDetails=result.details;textEditor.setModel(snap,result.details);textEditor.select(activeBlock,false);syncPlacementControls();}catch(error){if(ticket===renderTicket){$('previewStatus').textContent='ვერ განახლდა';toast(error.message||'სცადე სხვა შრიფტი');}}finally{clearTimeout(timer);if(ticket===renderTicket){$('loading').hidden=true;$('stage').setAttribute('aria-busy','false');}}}
function populateSelect(id,items){const el=$(id);el.replaceChildren();for(const item of items){const op=document.createElement('option');op.value=item.id;op.textContent=item.name;el.append(op);}}
function populateFonts(){const select=$('fontSelect');select.replaceChildren();const sources=[...new Set(fonts.fonts.map(f=>f.source))];for(const source of sources){const group=document.createElement('optgroup');group.label=source;for(const f of fonts.fonts.filter(f=>f.source===source)){const op=document.createElement('option');op.value=f.id;op.textContent=f.label;group.append(op);}select.append(group);}$('fontCount').textContent=`${fonts.fonts.length} ვარიანტი`;}
function syncControls(){const b=state.blocks[activeBlock];$('titleInput').value=b.text;$('charCount').textContent=`${[...b.text].length} / 500`;$('fontSelect').value=b.fontId;$('lineMode').value=b.lineMode;$('align').value=b.align;$('fontSize').value=b.fontSize;$('letterSpacing').value=b.letterSpacing;$('lineHeight').value=b.lineHeight;$('secondaryEnabled').checked=state.blocks[1].enabled;$('secondEnable').hidden=activeBlock!==1;
 for(const btn of document.querySelectorAll('[data-block]')){btn.classList.toggle('active',+btn.dataset.block===activeBlock);if(btn.dataset.block==='1')btn.textContent=state.blocks[1].enabled?'მეორე ტექსტი':'+ მეორე ტექსტი';}
 const values={material:'material',palette:'palette',theme:'theme',depth:'depth',stroke:'stroke',shadow:'shadow',shine:'shine',direction:'direction',frameShape:'frameShape',decor:'decor',framePattern:'framePattern',inset:'inset',blockGap:'blockGap',canvasWidth:'width',canvasHeight:'height',exportScale:'exportScale',exportLayers:'exportLayers',padding:'padding'};
 for(const[id,key]of Object.entries(values))$(id).value=state[key];
 for(const id of ['rainbow','frameEnabled','fitText','trim'])$(id).checked=state[id];
 for(const key of Object.keys(state.locks))$('lock'+key[0].toUpperCase()+key.slice(1)).checked=state.locks[key];
 syncBackgroundControls();$('outlineColor').value=state.outlineColor;$('customColor').value=state.customColor||getPalette(state.palette).colors[0];
 $('aspect').value=state.width===1800&&state.height===700?'wide':state.width===1600&&state.height===900?'classic':state.width===1200&&state.height===1200?'square':'custom';
 for(const card of document.querySelectorAll('.theme-card'))card.classList.toggle('active',card.dataset.theme===state.theme);
 updateOutputs();updateSwatches();updateExportInfo();syncPlacementControls();textEditor?.select(activeBlock,false);
}
function syncPlacementControls(){
 const b=state.blocks[activeBlock],exists=b.enabled&&!!b.text.trim();
 const rendered=previewVersion===renderTicket?previewDetails.find(d=>d.index===activeBlock)?.matrix.scale:null;
 $('placementScale').value=Math.round((rendered??b.placement?.scale??1)*100)+'%';
 for(const btn of document.querySelectorAll('[data-select-block]')){btn.setAttribute('aria-pressed',String(+btn.dataset.selectBlock===activeBlock));btn.disabled=+btn.dataset.selectBlock===1&&!state.blocks[1].enabled;}
 for(const id of ['textSmaller','textLarger','centerText','resetText'])$(id).disabled=!exists;
}
function initTextEditor(){
 textEditor=new TextEditor({stage:$('stage'),canvas:$('preview'),layer:$('textEditor'),isCurrent:()=>previewVersion===renderTicket,
   onSelect:index=>{activeBlock=index;syncControls();},
   onStart:()=>{stopAuto();document.body.classList.remove('text-editing');placementBefore=clone(state);},
   onUpdate:(index,placement)=>{state.blocks[index].placement=placement;queueRender();syncPlacementControls();save();},
   onEnd:({cancel,changed})=>{
     const before=placementBefore;placementBefore=null;if(!before)return;
     if(cancel){state=before;queueRender();save();}
     else if(changed){undo.push(before);if(undo.length>60)undo.shift();redo=[];lastChange={key:'',time:0};queueRender();save();}
     syncControls();updateUndo();
   },onCommand:placementCommand});
}
function placementCommand(command,value){
 textEditor?.finish();const detail=previewDetails.find(d=>d.index===activeBlock);
 if(command==='reset'){change(s=>s.blocks[activeBlock].placement=null,{sync:true});return;}
 if(!detail||previewVersion!==renderTicket)return;
 const start=placementFromDetail(detail,state);let next;
 if(command==='move')next=movePlacement(detail.baseBounds,start,value,state).placement;
 else if(command==='center')next=fitPlacement(detail.baseBounds,{...start,x:.5},state).placement;
 else next=fitPlacement(detail.baseBounds,{...start,scale:start.scale*value},state).placement;
 change(s=>s.blocks[activeBlock].placement=next,{key:`placement-${command}-${activeBlock}`,sync:true});
}
function updateOutputs(){const b=state.blocks[activeBlock];const values={sizeValue:b.fontSize,spacingValue:b.letterSpacing,lineHeightValue:b.lineHeight.toFixed(2),gapValue:state.blockGap,depthValue:state.depth,strokeValue:state.stroke,shadowValue:state.shadow,shineValue:state.shine+'%',decorValue:state.decor+'%',framePatternValue:state.framePattern+'%',insetValue:state.inset,paddingValue:state.padding};for(const[id,value]of Object.entries(values))$(id).value=value;}
function syncBackgroundControls(){
 const bg=resolveBackground(state);$('backgroundName').textContent=bg.name;
 $('frameFillColor').value=bg.colors[0];$('frameFillColor2').value=bg.colors[1];
 $('secondBackgroundColor').hidden=bg.id==='solid';$('frameOrnamentControl').hidden=['solid','gradient'].includes(bg.id);
 for(const button of document.querySelectorAll('[data-background]')){
   const selected=button.dataset.background===state.frameBackground;button.setAttribute('aria-pressed',String(selected));
   const canvas=button.querySelector('canvas');const sample=selected?{...state}:{...state,frameBackground:button.dataset.background,frameCustomColors:false,frameBackgroundVariant:0,frameFillColor:'#ffffff',framePattern:60};
   if(button.dataset.background==='auto')sample.frameBackground='auto';
   drawFrameBackground(canvas.getContext('2d'),{...sample,width:canvas.width,height:canvas.height});
 }
}
function buildBackgroundGrid(){
 for(const style of BACKGROUNDS){const button=document.createElement('button');button.type='button';button.className='background-choice';button.dataset.background=style.id;button.setAttribute('aria-label',style.name);button.setAttribute('aria-pressed','false');const c=document.createElement('canvas');c.width=240;c.height=96;c.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=style.name;button.append(c,label);button.onclick=()=>change(s=>{const colors=resolveBackground(s).colors;s.frameBackground=style.id;s.frameCustomColors=false;s.frameBackgroundVariant=0;if(style.id==='solid')s.frameFillColor=colors[0];},{sync:true});$('backgroundGrid').append(button);}
}
function editBackgroundColor(key){
 const value=$(key).value;change(s=>{const colors=resolveBackground(s).colors;s.frameFillColor=colors[0];s.frameFillColor2=colors[1];s.frameCustomColors=true;s[key]=value;},{key});syncBackgroundControls();
}
function updateSwatches(){const wrap=$('paletteSwatches');wrap.replaceChildren();for(const color of getPalette(state.palette).colors){const btn=document.createElement('button');btn.style.backgroundColor=color;btn.title=`მთავარი ფერი: ${color}`;btn.setAttribute('aria-label',`ფერი ${color}`);btn.onclick=()=>change(s=>s.customColor=color,{sync:true});wrap.append(btn);}}
function updateExportInfo(){const d=exportDimensions(state);$('exportSize').textContent=`${d.width} × ${d.height} px${state.trim?' — მოჭრამდე':''} · 300 dpi-ზე დაახლოებით ${(d.width/300*2.54).toFixed(1)} სმ სიგანე` ;}
function setTab(tab){for(const button of tabButtons)button.classList.toggle('active',button.dataset.tab===tab);for(const panel of document.querySelectorAll('.tab-panel'))panel.hidden=panel.id!==`panel-${tab}`;if(tab==='saved')renderFavorites();}
function bindBlock(id,key,convert=v=>v,event='change'){$(id).addEventListener(event,()=>{change(s=>{s.blocks[activeBlock][key]=convert($(id).value);},{key:id});updateOutputs();});}
function bindValue(id,key,convert=v=>v,event='change'){$(id).addEventListener(event,()=>{change(s=>s[key]=convert($(id).value),{key:id});updateOutputs();});}
const pick=items=>items[Math.floor(Math.random()*items.length)];
function shuffle(part='all',automatic=false){change(s=>{const theme=getTheme(s.theme);if(part==='all'&&!s.locks.background)randomizeBackground(s);if((part==='all'||part==='colors')&&!s.locks.color){s.palette=pick(theme.palettes);s.customColor=null;s.rainbow=Math.random()<.25;s.outlineColor=getPalette(s.palette).colors[3]||'#625078';}if((part==='all'||part==='style')&&!s.locks.material){s.material=pick(theme.materials);s.depth=pick([6,10,14,18,22]);s.shine=pick([35,65,85]);}if((part==='all'||part==='style')&&!s.locks.font){const pool=fonts.fonts.filter(f=>f.source!=='ჩემი შრიფტები'&&(!s.blocks[0].text.match(/[a-záéíóúñ]/i)||!f.legacy));s.blocks[0].fontId=pick(pool).id;}if((part==='all'||part==='frame')&&!s.locks.frame){s.frameShape=pick(SHAPES);s.decor=pick([85,95,105,115]);s.seed=Math.floor(Math.random()*999999);}}, {sync:true,automatic});}
function applyTheme(id){change(s=>{rethemeBackground(s,id);const t=getTheme(id);if(!s.locks.color){s.palette=t.palettes[0];s.customColor=null;s.outlineColor=getPalette(s.palette).colors[3];}if(!s.locks.material)s.material=t.materials[0];s.seed=Math.floor(Math.random()*999999);},{sync:true});}
function buildThemeGrid(){const grid=$('themeGrid');for(const theme of THEMES){const btn=document.createElement('button');btn.className='theme-card';btn.dataset.theme=theme.id;btn.title=theme.name;btn.setAttribute('aria-label',theme.name);const img=new Image();img.src=iconUrl(theme.icon,getPalette(theme.palettes[0]).colors);img.alt='';const label=document.createElement('span');label.textContent=theme.name;btn.append(img,label);btn.onclick=()=>applyTheme(theme.id);grid.append(btn);}}
function addFavorite(){stopAuto();favorites.unshift({id:uniqueId(),name:state.blocks[0].text.replace(/\s+/g,' ').slice(0,65)||'ჩემი კომბინაცია',state:clone(state),date:new Date().toISOString()});favorites=favorites.slice(0,60);if(!safeWrite('yda-favorites-v1',favorites)){toast('შენახვა ვერ მოხერხდა — ჩამოტვირთე პროექტის ფაილი');return;}renderFavorites();toast('კომბინაცია რჩეულებში შეინახა');}
function renderFavorites(){const wrap=$('favorites');wrap.replaceChildren();if(!favorites.length){const div=document.createElement('div');div.className='empty-state';div.textContent='შენი საყვარელი კომბინაციები აქ გამოჩნდება ♡';wrap.append(div);return;}for(const f of favorites){if(!f||typeof f.name!=='string'||!f.state)continue;const card=document.createElement('div');card.className='favorite-card';const open=document.createElement('button');open.className='favorite-open';const title=document.createElement('strong'),subtitle=document.createElement('small');title.textContent=f.name;subtitle.textContent=getTheme(f.state.theme).name;open.append(title,subtitle);open.onclick=()=>{change(()=>{state=sanitizeState(f.state,fonts.ids());},{sync:true});toast('კომბინაცია დაბრუნდა');};const remove=document.createElement('button');remove.className='delete';remove.textContent='×';remove.setAttribute('aria-label','რჩეულის წაშლა');remove.onclick=()=>{favorites=favorites.filter(x=>x.id!==f.id);safeWrite('yda-favorites-v1',favorites);renderFavorites();};card.append(open,remove);wrap.append(card);}}
function openGallery(kind){stopAuto();galleryKind=kind;$('galleryTitle').textContent=kind==='fonts'?`აირჩიე შრიფტი · ${fonts.fonts.length}`:'100 მზა იდეა';$('gallerySearch').value='';renderGallery();$('galleryDialog').showModal();}
function renderGallery(){fontObserver?.disconnect();const content=$('galleryContent');content.replaceChildren();const query=$('gallerySearch').value.toLocaleLowerCase();if(galleryKind==='fonts'){fontObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const el=entry.target;fonts.ensure(el.dataset.font).then(f=>el.style.fontFamily=`"${f.cssFamily}"`).catch(()=>{});fontObserver.unobserve(el);}}},{root:$('galleryDialog'),rootMargin:'100px'});for(const f of fonts.fonts.filter(f=>(f.label+' '+f.source).toLowerCase().includes(query))){const card=document.createElement('button');card.className='gallery-card';const specimen=document.createElement('span');specimen.className='specimen';specimen.textContent=state.blocks[activeBlock].text.replace(/\s+/g,' ').slice(0,22)||'მარიამი · ღ ლ';specimen.dataset.font=f.id;const label=document.createElement('small');label.textContent=f.label;const source=document.createElement('small');source.textContent=f.source+(f.legacy?' · ქართული':'');card.append(specimen,label,source);card.onclick=()=>{change(s=>s.blocks[activeBlock].fontId=f.id,{sync:true});$('galleryDialog').close();};content.append(card);fontObserver.observe(specimen);}}else{for(const preset of PRESETS.filter(p=>p.name.toLowerCase().includes(query))){const card=document.createElement('button');card.className='gallery-card';const specimen=document.createElement('span');specimen.className='specimen';specimen.textContent='ზღაპარი';const p=getPalette(preset.palette);specimen.style.color=p.colors[0];specimen.style.textShadow=`1px 1px ${p.colors[3]},2px 2px ${p.colors[3]},3px 3px ${p.colors[1]}`;const name=document.createElement('small');name.textContent=preset.name;const swatches=document.createElement('div');swatches.className='mini-swatches';for(const c of p.colors){const chip=document.createElement('i');chip.style.backgroundColor=c;swatches.append(chip);}card.append(specimen,name,swatches);card.onclick=()=>{change(s=>{rethemeBackground(s,preset.theme);if(!s.locks.color){s.palette=preset.palette;s.customColor=null;s.rainbow=preset.rainbow;s.outlineColor=p.colors[3];}if(!s.locks.material)s.material=preset.material;if(!s.locks.frame){s.frameShape=preset.shape;s.seed=preset.seed;}if(!s.locks.font)s.blocks[0].fontId=fonts.get(preset.font).id;},{sync:true});$('galleryDialog').close();};content.append(card);}}if(!content.children.length){const p=document.createElement('p');p.className='hint';p.textContent='ვერ მოიძებნა — სცადე სხვა სახელი';content.append(p);}}
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function filename(){return (state.blocks[0].text.trim().replace(/[\n\r]+/g,' ').replace(/[\\/:*?"<>|]/g,'').slice(0,55)||'yda-title');}
function setBusy(value){busy=value;$('copyPng').disabled=value;$('downloadPng').disabled=value;$('downloadPng').querySelector('span').textContent=value?'მზადდება…':'PNG ჩამოტვირთვა';}
async function downloadPNG(){if(busy)return;stopAuto();const snap=clone(state);setBusy(true);try{const result=await makeExport(snap,fonts);download(result.blob,filename()+'.png');toast(`PNG მზადაა · ${result.width} × ${result.height} px · ჩარჩოს გარეთ გამჭვირვალეა`);}catch(e){toast(e.message||'PNG ვერ შეიქმნა');}finally{setBusy(false);}}
async function copyPNG(){if(busy)return;stopAuto();if(!window.isSecureContext||!navigator.clipboard?.write||!window.ClipboardItem){toast('ამ ბრაუზერში სურათის კოპირება მიუწვდომელია. გამოიყენე „PNG ჩამოტვირთვა“.');return;}const snap=clone(state);setBusy(true);try{const task=makeExport(snap,fonts);const png=task.then(r=>r.blob);const write=navigator.clipboard.write([new ClipboardItem({'image/png':png})]);await Promise.all([write,task]);toast('სურათი დაკოპირდა! Canva-ში ჩასვი Ctrl+V / ⌘V-ით.');}catch(e){toast('ბრაუზერმა კოპირება ვერ შეასრულა. გამოიყენე „PNG ჩამოტვირთვა“ და ატვირთე Canva-ში.');}finally{setBusy(false);}}
async function saveProject(){stopAuto();try{const customs=[];for(const f of fonts.custom){const data=await fileDataUrl(new Blob([f.buffer],{type:'application/octet-stream'}));customs.push({id:f.id,name:f.originalName,data});}const project={app:'yda-studio',version:1,state:clone(state),fonts:customs,cover:cover?{data:cover.data,y:+$('coverY').value,scale:+$('coverScale').value}:null};download(new Blob([JSON.stringify(project)],{type:'application/json'}),filename()+'.yda.json');toast('პროექტის ფაილი მზადაა');}catch{toast('პროექტის შენახვა ვერ მოხერხდა');}}
async function readProject(file){if(!file)return;stopAuto();try{if(file.size>50*1024*1024)throw new Error('პროექტი ძალიან დიდია (მაქსიმუმ 50 MB)');const project=JSON.parse(await file.text());if(project.app!=='yda-studio'||project.version!==1||!project.state)throw new Error('აირჩიე „ყდა“-ში შენახული პროექტის ფაილი');if(Array.isArray(project.fonts)){for(const entry of project.fonts.slice(0,20)){if(typeof entry.data!=='string'||!/^data:[^,]*;base64,/.test(entry.data)||entry.data.length>14*1024*1024||typeof entry.name!=='string'||!/^custom-[\w-]{1,70}$/.test(entry.id))continue;const buffer=Uint8Array.from(atob(entry.data.split(',')[1]),c=>c.charCodeAt(0));await fonts.addCustom(new File([buffer],entry.name),entry.id);}}await persistCustomFonts();populateFonts();change(()=>{state=sanitizeState(project.state,fonts.ids());},{sync:true});if(project.cover?.data?.startsWith('data:image/')&&project.cover.data.length<28*1024*1024){await setCover(project.cover.data);$('coverY').value=clamp(Number(project.cover.y)||20,5,95);$('coverScale').value=clamp(Number(project.cover.scale)||85,20,100);positionCover();}else await removeCover();toast('პროექტი გაიხსნა');}catch(e){toast(e.message||'პროექტი ვერ გაიხსნა');}}
async function persistCustomFonts(){try{await assetPut('customFonts',fonts.custom.map(f=>({id:f.id,name:f.originalName,buffer:f.buffer})));}catch{toast('შრიფტი მუშაობს, მაგრამ შენახვა ვერ მოხერხდა. შეინახე პროექტის ფაილი.');}}
async function loadFontFiles(files){stopAuto();let first=null,added=0;for(const file of files){try{const f=await fonts.addCustom(file);first??=f;added++;}catch(e){toast(e.message);}}if(added){await persistCustomFonts();populateFonts();change(s=>s.blocks[activeBlock].fontId=first.id,{sync:true});toast(`${added} შრიფტი დაემატა. თუ ქართული არ აქვს, გამოჩნდება დამხმარე შრიფტით.`);} }
async function setCover(data,persist=true){const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('ფოტო ვერ გაიხსნა'));img.src=data;});cover={data,width:img.naturalWidth,height:img.naturalHeight};const stage=$('stage');stage.className='stage cover';stage.style.backgroundImage=`url("${data}")`;stage.style.aspectRatio=`${cover.width} / ${cover.height}`;$('coverTools').hidden=false;document.querySelectorAll('[data-bg]').forEach(b=>b.classList.remove('active'));positionCover();if(persist){try{await assetPut('cover',cover);}catch{toast('ფოტო ჩანს, მაგრამ ავტომატურად ვერ შეინახა');}}}
function positionCover(){if(!cover)return;$('preview').style.top=$('coverY').value+'%';$('preview').style.width=$('coverScale').value+'%';safeWrite('yda-cover-position',{y:+$('coverY').value,scale:+$('coverScale').value});textEditor?.syncViewport();}
async function removeCover(){cover=null;const stage=$('stage');stage.style.backgroundImage='';stage.style.aspectRatio=`${state.width} / ${state.height}`;stage.className='stage checker';$('preview').style.top='';$('preview').style.width='';$('coverTools').hidden=true;textEditor?.syncViewport();document.querySelectorAll('[data-bg]').forEach(b=>b.classList.toggle('active',b.dataset.bg==='checker'));try{await assetDelete('cover');}catch{}}
function bindEvents(){
 for(const button of document.querySelectorAll('[data-select-block]'))button.onclick=()=>textEditor.select(+button.dataset.selectBlock);
 $('textSmaller').onclick=()=>placementCommand('scale',1/1.1);$('textLarger').onclick=()=>placementCommand('scale',1.1);$('centerText').onclick=()=>placementCommand('center');$('resetText').onclick=()=>placementCommand('reset');
 document.addEventListener('focusin',e=>{if(e.target.matches('textarea,input[type=number]'))document.body.classList.add('text-editing');});
 document.addEventListener('focusout',()=>setTimeout(()=>{if(!document.activeElement.matches('textarea,input[type=number]'))document.body.classList.remove('text-editing');},0));
 for(const btn of tabButtons)btn.onclick=()=>setTab(btn.dataset.tab);
 $('undo').onclick=stepBack;$('redo').onclick=stepForward;
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();e.shiftKey?stepForward():stepBack();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){textEditor?.finish();stopAuto();clearTimeout(saveTimer);persistCurrent();}});
 $('titleInput').oninput=()=>{change(s=>s.blocks[activeBlock].text=$('titleInput').value,{key:'text'});$('charCount').textContent=`${[...$('titleInput').value].length} / 500`;};
 document.querySelectorAll('[data-block]').forEach(btn=>btn.onclick=()=>{activeBlock=+btn.dataset.block;if(activeBlock===1&&!state.blocks[1].enabled)change(s=>s.blocks[1].enabled=true,{sync:true});else syncControls();});
 $('secondaryEnabled').onchange=()=>change(s=>s.blocks[1].enabled=$('secondaryEnabled').checked,{sync:true});
 bindBlock('fontSelect','fontId');bindBlock('lineMode','lineMode');bindBlock('align','align');bindBlock('fontSize','fontSize',Number,'input');bindBlock('letterSpacing','letterSpacing',Number,'input');bindBlock('lineHeight','lineHeight',Number,'input');
 for(const id of ['depth','stroke','shadow','shine','decor','framePattern','inset','blockGap','padding'])bindValue(id,id,Number,'input');
 for(const id of ['material','direction','frameShape','exportLayers'])bindValue(id,id);
 bindValue('exportScale','exportScale',Number);
 for(const id of ['rainbow','frameEnabled','fitText','trim'])$(id).onchange=()=>change(s=>s[id]=$(id).checked);
 $('frameFillColor').oninput=()=>editBackgroundColor('frameFillColor');
 $('frameFillColor2').oninput=()=>editBackgroundColor('frameFillColor2');
 $('whiteFrameFill').onclick=()=>change(s=>{s.frameBackground='solid';s.frameFillColor='#ffffff';s.frameCustomColors=false;},{sync:true});
 $('themeFrameFill').onclick=()=>change(s=>{s.frameBackground='auto';s.frameBackgroundVariant=0;s.frameCustomColors=false;},{sync:true});
 $('shuffleBackground').onclick=()=>change(s=>randomizeBackground(s),{sync:true});
 $('customColor').oninput=()=>change(s=>s.customColor=$('customColor').value,{key:'customColor'});$('outlineColor').oninput=()=>change(s=>s.outlineColor=$('outlineColor').value,{key:'outlineColor'});
 $('palette').onchange=()=>change(s=>{s.palette=$('palette').value;s.customColor=null;s.outlineColor=getPalette(s.palette).colors[3];},{sync:true});
 $('theme').onchange=()=>applyTheme($('theme').value);
 for(const key of Object.keys(state.locks))$('lock'+key[0].toUpperCase()+key.slice(1)).onchange=e=>change(s=>s.locks[key]=e.target.checked);
 $('shuffle').onclick=()=>shuffle();$('shuffleColors').onclick=()=>shuffle('colors');$('shuffleStyle').onclick=()=>shuffle('style');$('shuffleFrame').onclick=$('shuffleFrame2').onclick=()=>shuffle('frame');
 $('autoplay').onclick=()=>{if(autoTimer){stopAuto();return;}shuffle('all',true);autoTimer=setInterval(()=>shuffle('all',true),5000);$('autoplay').innerHTML='Ⅱ <span>პაუზა</span>';$('autoplay').setAttribute('aria-pressed','true');};
 $('fontGallery').onclick=()=>openGallery('fonts');$('presetGallery').onclick=()=>openGallery('presets');$('gallerySearch').oninput=renderGallery;$('closeGallery').onclick=()=>$('galleryDialog').close();$('galleryDialog').addEventListener('close',()=>fontObserver?.disconnect());
 $('favorite').onclick=$('saveFavorite').onclick=addFavorite;
 $('downloadPng').onclick=downloadPNG;$('copyPng').onclick=copyPNG;
 $('aspect').onchange=()=>{const dims={wide:[1800,700],classic:[1600,900],square:[1200,1200]}[$('aspect').value];if(dims)change(s=>{[s.width,s.height]=dims;},{sync:true});};
 for(const[id,key,min]of [['canvasWidth','width',400],['canvasHeight','height',200]])$(id).onchange=()=>change(s=>s[key]=Math.round(clamp(Number($(id).value)||min,min,4096)),{sync:true});
 $('uploadFont').onclick=()=>$('fontFile').click();$('fontFile').onchange=async e=>{await loadFontFiles([...e.target.files]);e.target.value='';};
 $('coverButton').onclick=()=>{stopAuto();$('coverFile').click();};$('coverFile').onchange=async e=>{const file=e.target.files[0];if(file){try{if(file.size>20*1024*1024)throw new Error('ფოტო 20 MB-ზე ნაკლები უნდა იყოს');await setCover(await fileDataUrl(file));toast('ფოტო მხოლოდ შესამოწმებლად ჩანს — PNG-ში არ ჩაიწერება');}catch(err){toast(err.message);}}e.target.value='';};
 $('coverY').oninput=$('coverScale').oninput=()=>{stopAuto();positionCover();};$('removeCover').onclick=removeCover;
 document.querySelectorAll('[data-bg]').forEach(btn=>btn.onclick=async()=>{await removeCover();$('stage').className='stage '+btn.dataset.bg;document.querySelectorAll('[data-bg]').forEach(b=>b.classList.toggle('active',b===btn));});
 $('saveProject').onclick=$('projectSave').onclick=saveProject;$('loadProject').onclick=$('projectOpen').onclick=()=>{$('projectDialog').close();$('projectFile').click();};$('projectFile').onchange=async e=>{await readProject(e.target.files[0]);e.target.value='';};
 $('projectMenu').onclick=()=>{stopAuto();$('projectDialog').showModal();};$('closeProject').onclick=()=>$('projectDialog').close();$('projectNew').onclick=()=>{addFavorite();change(()=>{state=clone(DEFAULT_STATE);},{sync:true});activeBlock=0;syncControls();$('projectDialog').close();toast('ახალი წარწერა. წინა ნამუშევარი რჩეულებში შეინახა.');};
}
async function init(){try{await fonts.init();try{const custom=await assetGet('customFonts');if(Array.isArray(custom)){for(const f of custom){try{await fonts.addCustom(new File([f.buffer],f.name),f.id);}catch{}}}}catch{}state=sanitizeState(safeRead('yda-project-v1',DEFAULT_STATE),fonts.ids());populateFonts();populateSelect('theme',THEMES);populateSelect('palette',PALETTES);populateSelect('material',MATERIALS);buildThemeGrid();buildBackgroundGrid();initTextEditor();bindEvents();syncControls();for(const control of document.querySelectorAll('button,input,select,textarea'))control.disabled=false;document.body.dataset.ready='true';document.body.setAttribute('aria-busy','false');updateUndo();queueRender();try{const savedCover=await assetGet('cover');if(savedCover?.data){const position=safeRead('yda-cover-position',{y:20,scale:85});$('coverY').value=position.y;$('coverScale').value=position.scale;await setCover(savedCover.data,false);}}catch{} }catch(error){$('loading').textContent='ჩატვირთვა ვერ მოხერხდა — განაახლე გვერდი';$('previewStatus').textContent='კავშირის შეცდომა';toast(error.message);}}
init();
