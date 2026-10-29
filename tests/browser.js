import {placementFromDetail,movePlacement,fitPlacement} from '../js/transforms.js';
import {TextEditor} from '../js/editor.js';
import {BACKGROUNDS} from '../js/backgrounds.js';
import {FontManager} from '../js/fonts.js';
import {render,makeExport} from '../js/render.js';
import {DEFAULT_STATE,clone,alphaBounds} from '../js/core.js';
import {THEMES,MATERIALS,SHAPES} from '../js/catalog.js';
const out=document.getElementById('results'),status=document.getElementById('status');
function assert(condition,message){if(!condition)throw new Error(message);}
function log(message){out.textContent+=message+'\n';}
function fingerprint(canvas){const d=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let hash=2166136261;for(let i=0;i<d.length;i++)hash=Math.imul(hash^d[i],16777619);return hash>>>0;}
document.getElementById('run').onclick=async()=>{out.textContent='';status.textContent='Running…';status.className='';document.getElementById('run').disabled=true;try{const fm=await new FontManager().init();const probe=document.createElement('canvas');probe.width=260;probe.height=180;const pc=probe.getContext('2d');let glyphCount=0;
 for(const f of fm.fonts){await fm.ensure(f.id);const hashes=[];for(const letter of ['ღ','ლ']){pc.clearRect(0,0,260,180);pc.font=fm.css(f.id,90);pc.fillStyle='#222';pc.fillText(letter,50,120);hashes.push(fingerprint(probe));}assert(hashes[0]!==hashes[1],f.id+': ღ and ლ are indistinguishable');glyphCount++;}log(`PASS ${glyphCount}/86 browser fonts loaded; ღ and ლ produce different pixels in every font.`);
 let s=clone(DEFAULT_STATE);s.width=1200;s.height=500;s.blocks[0].text='პრინცესა ნანა, პრინცი გიორგი და ფრთიანი ცხენი ბუბუ';
 for(const mode of ['1','2','3','manual','auto']){s.blocks[0].lineMode=mode;if(mode==='manual')s.blocks[0].text='ჩურჩულა ბაღის\nსაიდუმლო';const r=await render(s,fm);for(const d of r.details){assert(d.width<=d.box.width+1&&d.height<=d.box.height+1,mode+': overflow');}if(['1','2','3'].includes(mode))assert(r.details[0].lines.length===+mode,mode+': wrong line count');}log('PASS exact line counts, long Georgian title, manual Enter and automatic fitting.');
 s.blocks[1].enabled=true;s.blocks[1].text='La princesa Nana, el príncipe Zhorzhi y el caballo alado Bubu';const bilingual=await render(s,fm);assert(bilingual.details.length===2,'secondary block missing');assert(!bilingual.warnings.some(w=>w.includes('დამხმარე')),'Spanish fallback unexpectedly needed');for(const d of bilingual.details)assert(d.width<=d.box.width+1&&d.height<=d.box.height+1,'bilingual overflow');log('PASS bilingual layout with Spanish accents.');
 s=clone(DEFAULT_STATE);s.width=900;s.height=350;const themes=new Set();for(const theme of THEMES){s.theme=theme.id;const r=await render(s,fm);themes.add(fingerprint(r.canvas));}assert(themes.size===30,'duplicate theme artwork');log('PASS all 30 frame themes render different artwork.');
 s.frameEnabled=false;s.blocks[0].text='მარიამი ღ ლ';s.blocks[0].lineMode='1';const materials=new Map();for(const m of MATERIALS){s.material=m.id;const r=await render(s,fm);const hash=fingerprint(r.canvas);assert(!materials.has(hash),m.id+' duplicates '+materials.get(hash));materials.set(hash,m.id);}log('PASS all 25 materials render different pixels.');
 s=clone(DEFAULT_STATE);s.width=900;s.height=350;s.exportScale=2;s.trim=true;s.padding=20;for(const layers of ['both','text','frame']){s.exportLayers=layers;const r=await makeExport(s,fm);assert(r.blob.type==='image/png','not PNG');const bitmap=await createImageBitmap(r.blob);const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;c.getContext('2d').drawImage(bitmap,0,0);const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const bounds=alphaBounds(data,c.width,c.height);assert(bounds&&bounds.width>10,'empty image');assert(data[3]===0&&data[data.length-1]===0,'background is not transparent');assert(bounds.x===40&&bounds.y===40,'crop padding is incorrect');if(layers==='both')document.getElementById('sample').replaceChildren(c);bitmap.close();log(`PASS ${layers} export: ${r.width}×${r.height}, ${r.blob.size} bytes, true alpha and exact padding.`);}

 s=clone(DEFAULT_STATE);s.width=900;s.height=350;s.exportScale=1;s.trim=false;s.exportLayers='frame';s.frameFillColor='#123456';s.frameBackground='solid';
 for(const shape of SHAPES){s.frameShape=shape;const frame=await render(s,fm,{layers:'frame'});const ctx=frame.canvas.getContext('2d');assert([...ctx.getImageData(450,175,1,1).data].join(',')==='18,52,86,255',shape+': preview interior must be opaque and use selected color');assert(ctx.getImageData(0,0,1,1).data[3]===0,shape+': outer area must stay transparent');const result=await makeExport(s,fm);const bitmap=await createImageBitmap(result.blob);const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const ec=c.getContext('2d');ec.drawImage(bitmap,0,0);assert([...ec.getImageData(450,175,1,1).data].join(',')==='18,52,86,255',shape+': PNG interior lost its color');assert(ec.getImageData(0,0,1,1).data[3]===0,shape+': PNG outer area is opaque');bitmap.close();}
 s.blocks[0].text='';s.blocks[1].enabled=false;const textOnly=await render(s,fm,{layers:'text'});assert(textOnly.canvas.getContext('2d').getImageData(450,175,1,1).data[3]===0,'text-only output must exclude the frame fill');s.frameEnabled=false;const withoutFrame=await render(s,fm);assert(withoutFrame.canvas.getContext('2d').getImageData(450,175,1,1).data[3]===0,'hidden frames must not leave a fill');log('PASS all 5 shapes: opaque custom interior in preview and PNG, transparent exterior, no fill in text-only or hidden-frame output.');

 s=clone(DEFAULT_STATE);s.width=900;s.height=350;s.exportScale=1;s.trim=false;s.exportLayers='frame';
 const backgrounds=new Set();
 for(const style of BACKGROUNDS.filter(b=>b.id!=='auto')){
   s.frameBackground=style.id;
   for(const shape of SHAPES){
     s.frameShape=shape;const r=await render(s,fm,{layers:'frame'}),rc=r.canvas.getContext('2d');
     assert(rc.getImageData(450,175,1,1).data[3]===255,style.id+'/'+shape+': nonopaque center');
     assert(rc.getImageData(0,0,1,1).data[3]===0,style.id+'/'+shape+': background leaks beyond frame');
     if(shape==='ornate')backgrounds.add(fingerprint(r.canvas));
     const exp=await makeExport(s,fm),bitmap=await createImageBitmap(exp.blob),c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const ec=c.getContext('2d');ec.drawImage(bitmap,0,0);bitmap.close();
     for(const [x,y] of [[450,175],[300,120],[600,230]])assert([...ec.getImageData(x,y,1,1).data].join(',')===[...rc.getImageData(x,y,1,1).data].join(','),style.id+'/'+shape+': PNG differs from preview');
     assert(ec.getImageData(0,0,1,1).data[3]===0,style.id+'/'+shape+': exported exterior not transparent');
   }
 }
 assert(backgrounds.size===8,'background styles are not distinct');log('PASS all 8 background styles × 5 shapes: opaque centers, transparent exteriors and matching PNG colors.');
 s.frameBackground='cosmic';s.frameShape='shield';s.framePattern=75;const decorated=await render(s,fm,{layers:'frame'}),repeat=await render(s,fm,{layers:'frame'});assert(fingerprint(decorated.canvas)===fingerprint(repeat.canvas),'seeded background must be stable');s.framePattern=0;const quiet=await render(s,fm,{layers:'frame'});assert(fingerprint(quiet.canvas)!==fingerprint(decorated.canvas),'ornament intensity has no effect');
 s.frameCustomColors=true;s.frameFillColor='#172331';s.frameFillColor2='#af5496';const custom=await render(s,fm,{layers:'frame'});assert(fingerprint(custom.canvas)!==fingerprint(quiet.canvas),'two custom colors have no effect');
 s.blocks[0].text='';s.blocks[1].enabled=false;const backgroundTextOnly=await render(s,fm,{layers:'text'});assert(backgroundTextOnly.canvas.getContext('2d').getImageData(450,175,1,1).data[3]===0,'text-only export contains a themed background');s.frameEnabled=false;const hiddenBackground=await render(s,fm);assert(hiddenBackground.canvas.getContext('2d').getImageData(450,175,1,1).data[3]===0,'hidden frame contains a themed background');
 log('PASS repeatable ornaments, zero intensity, two custom colors and background-free text-only/hidden-frame output.');

 s=clone(DEFAULT_STATE);s.width=900;s.height=350;s.exportScale=1;s.trim=false;s.blocks[0].text='პრინცესა ნანა';s.blocks[0].lineMode='1';s.blocks[1].enabled=true;s.blocks[1].text='და ფრთიანი ცხენი ბუბუ';s.blocks[1].lineMode='1';
 const automatic=await render(s,fm),first=automatic.details.find(d=>d.index===0),second=automatic.details.find(d=>d.index===1);
 s.blocks[0].placement=placementFromDetail(first,s);
 const frozen=await render(s,fm),fd=frozen.details.find(d=>d.index===0);
 for(const key of ['x','y','width','height'])assert(Math.abs(fd.bounds[key]-first.bounds[key])<.05,'entering free layout changed '+key);
 const frameBefore=await render(s,fm,{layers:'frame'});
 s.blocks[0].placement=movePlacement(fd.baseBounds,s.blocks[0].placement,{x:45,y:-12},s).placement;
 s.blocks[0].placement=fitPlacement(fd.baseBounds,{...s.blocks[0].placement,scale:1.22},s).placement;
 const moved=await render(s,fm),md=moved.details.find(d=>d.index===0),sd=moved.details.find(d=>d.index===1);
 assert(md.bounds.width>first.bounds.width*1.2,'resize did not enlarge text');
 assert(JSON.stringify(sd.bounds)===JSON.stringify(second.bounds),'moving the first block disturbed the second');
 assert(md.lines.join(' ')==='პრინცესა ნანა','resizing changed line breaks');
 const frameAfter=await render(s,fm,{layers:'frame'});assert(fingerprint(frameBefore.canvas)===fingerprint(frameAfter.canvas),'text transforms changed the frame');
 s.exportLayers='text';const expected=await render(s,fm,{layers:'text'}),png=await makeExport(s,fm),bitmap=await createImageBitmap(png.blob),decoded=document.createElement('canvas');decoded.width=bitmap.width;decoded.height=bitmap.height;decoded.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
 const expectedBounds=alphaBounds(expected.canvas.getContext('2d').getImageData(0,0,900,350).data,900,350),exportBounds=alphaBounds(decoded.getContext('2d').getImageData(0,0,900,350).data,900,350);
 assert(JSON.stringify(expectedBounds)===JSON.stringify(exportBounds),'PNG text position/scale differs from preview');
 s.blocks[0].placement=null;const reset=await render(s,fm);assert(JSON.stringify(reset.details[0].bounds)===JSON.stringify(first.bounds),'reset did not restore automatic placement');
 log('PASS manual layout enters without jumping, scales and moves independently, preserves lines and frame pixels, exports matching PNG positions, and resets exactly.');

 const fixture=document.createElement('div');fixture.style.cssText='position:relative;width:600px;height:240px;margin:20px 0';const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=400;canvas.style.cssText='width:100%;height:100%';const layer=document.createElement('div');layer.style.cssText='position:absolute';fixture.append(canvas,layer);document.body.append(fixture);
 const model={width:1000,height:400},detail={index:0,baseBounds:{x:250,y:150,width:500,height:100},bounds:{x:250,y:150,width:500,height:100},matrix:{scale:1,x:0,y:0},wrapWidth:.7,fontScale:1};let latest=null,ended=null,commands=[];
 const editor=new TextEditor({stage:fixture,canvas,layer,isCurrent:()=>true,onSelect:()=>{},onStart:()=>{},onUpdate:(_,p)=>latest=p,onEnd:e=>ended=e,onCommand:(...args)=>commands.push(args)});editor.setModel(model,[detail]);
 const move=layer.querySelector('.text-move');const point=(x,y)=>({clientX:canvas.getBoundingClientRect().left+x*.6,clientY:canvas.getBoundingClientRect().top+y*.6});
 const send=(target,type,id,x,y,pointerType='touch')=>target.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType,button:0,...point(x,y)}));
 send(move,'pointerdown',11,400,200);send(fixture,'pointermove',11,440,230);send(fixture,'pointerup',11,440,230);
 assert(Math.abs(latest.x-.54)<.001&&Math.abs(latest.y-.575)<.001,'touch drag coordinate mapping failed');assert(ended.changed&&!ended.cancel,'touch drag was not committed');
 fixture.style.marginTop='100px';latest=null;send(move,'pointerdown',21,400,200);send(fixture,'pointerdown',22,600,200);send(fixture,'pointermove',21,350,200);send(fixture,'pointermove',22,650,200);send(fixture,'pointerup',21,350,200);send(fixture,'pointerup',22,650,200);
 assert(Math.abs(latest.scale-1.5)<.001,'two-finger pinch failed');assert(Math.abs(latest.x-.5)<.001&&Math.abs(latest.y-.5)<.001,'moving the preview on screen broke gesture mapping');assert(!editor.gesture&&editor.points.size===0,'pinch left pointer state active');
 send(move,'pointerdown',31,500,200);send(fixture,'pointermove',31,530,215);send(fixture,'pointercancel',31,530,215);assert(ended.cancel,'pointer cancellation must revert a gesture');
 move.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',shiftKey:true,bubbles:true,cancelable:true}));assert(commands[0][0]==='move'&&commands[0][1].x===10,'keyboard movement failed');
 editor.observer.disconnect();fixture.remove();log('PASS touch drag, two-finger pinch, cancellation and keyboard nudge through the editor event handlers.');
 s.frameEnabled=false;s.blocks[0].text='';s.blocks[1].enabled=false;s.exportLayers='text';let rejected=false;try{await makeExport(s,fm);}catch{rejected=true;}assert(rejected,'empty PNG should be rejected');log('PASS empty export gives a useful error.');status.textContent='ALL CHECKS PASSED';status.className='pass';
 }catch(e){status.textContent='CHECK FAILED';status.className='fail';log('FAIL '+e.message);console.error(e);}finally{document.getElementById('run').disabled=false;}};
