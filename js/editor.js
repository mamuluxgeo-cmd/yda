import {placementFromDetail,fitPlacement,movePlacement,resizePlacement,pinchPlacement,clientToDesign,containedViewport} from './transforms.js';

export class TextEditor {
 constructor({stage,canvas,layer,onSelect,onStart,onUpdate,onEnd,onCommand,isCurrent}){
   Object.assign(this,{stage,canvas,layer,onSelect,onStart,onUpdate,onEnd,onCommand,isCurrent});
   this.selected=0;this.details=[];this.gesture=null;this.points=new Map();this.boxes=[];
   const corners={nw:'ზედა მარცხენა',ne:'ზედა მარჯვენა',sw:'ქვედა მარცხენა',se:'ქვედა მარჯვენა'};
   for(let index=0;index<2;index++){
     const box=document.createElement('div');box.className='text-box';box.dataset.editorBlock=index;box.hidden=true;
     const move=document.createElement('button');move.type='button';move.className='text-move';move.dataset.editorBlock=index;
     move.setAttribute('aria-label',`${index?'მეორე':'მთავარი'} ტექსტის მონიშვნა და გადაადგილება`);
     move.title='გადაათრიე · ისრებით გადაადგილება · Shift — დიდი ნაბიჯი';box.append(move);
     for(const [corner,label]of Object.entries(corners)){
       const handle=document.createElement('button');handle.type='button';handle.className=`text-handle corner-${corner}`;
       handle.dataset.editorBlock=index;handle.dataset.corner=corner;handle.setAttribute('aria-label',`${index?'მეორე':'მთავარი'} ტექსტი: ${label} კუთხით ზომის შეცვლა`);handle.title='გადიდება / დაპატარავება';box.append(handle);
     }
     layer.append(box);this.boxes.push(box);
   }
   this.guides={};for(const axis of ['x','y']){const guide=document.createElement('div');guide.className=`placement-guide guide-${axis}`;guide.hidden=true;guide.setAttribute('aria-hidden','true');layer.append(guide);this.guides[axis]=guide;}
   stage.addEventListener('pointerdown',e=>this.pointerDown(e));
   stage.addEventListener('pointermove',e=>this.pointerMove(e));
   stage.addEventListener('pointerup',e=>{if(this.gesture&&this.points.has(e.pointerId)){this.pointerMove(e);this.finish();}});
   stage.addEventListener('pointercancel',()=>this.finish(true));
   stage.addEventListener('lostpointercapture',e=>{if(this.gesture&&this.points.has(e.pointerId))this.finish();});
   layer.addEventListener('keydown',e=>this.keyDown(e));
   layer.addEventListener('focusin',e=>{const index=e.target.dataset.editorBlock;if(index!==undefined&&this.selected!==+index)this.select(+index);});
   document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.gesture){e.preventDefault();this.finish(true);}});
   this.observer=new ResizeObserver(()=>this.syncViewport());this.observer.observe(stage);this.observer.observe(canvas);
   window.addEventListener('resize',()=>this.syncViewport());
   window.addEventListener('blur',()=>this.finish());
 }
 setModel(state,details){this.model=state;this.details=details;this.syncViewport();}
 select(index,notify=true){this.selected=index;if(notify&&index!==null)this.onSelect(index);this.drawBoxes();}
 syncViewport(){
   if(!this.model)return;const viewport=containedViewport(this.canvas.getBoundingClientRect(),this.model),parent=this.stage.getBoundingClientRect();
   if(viewport.width<=0||viewport.height<=0)return;this.viewport=viewport;
   Object.assign(this.layer.style,{left:`${viewport.left-parent.left}px`,top:`${viewport.top-parent.top}px`,width:`${viewport.width}px`,height:`${viewport.height}px`});this.drawBoxes();
 }
 drawBoxes(){
   if(!this.model||!this.viewport)return;
   for(const [index,box]of this.boxes.entries()){
     const detail=this.details.find(d=>d.index===index);box.hidden=!detail;if(!detail)continue;
     const bounds=this.gesture?.index===index&&this.gesture.last?this.gesture.last.bounds:detail.bounds;
     Object.assign(box.style,{left:`${100*bounds.x/this.model.width}%`,top:`${100*bounds.y/this.model.height}%`,width:`${100*bounds.width/this.model.width}%`,height:`${100*bounds.height/this.model.height}%`});
     box.classList.toggle('selected',this.selected===index);box.classList.toggle('dragging',this.gesture?.index===index);
     box.dataset.small=String(bounds.height*this.viewport.height/this.model.height<46||bounds.width*this.viewport.width/this.model.width<90);
     box.querySelector('.text-move').setAttribute('aria-pressed',String(this.selected===index));
     for(const handle of box.querySelectorAll('.text-handle'))handle.hidden=this.selected!==index;
   }
 }
 point(event){this.viewport=containedViewport(this.canvas.getBoundingClientRect(),this.model);return clientToDesign({x:event.clientX,y:event.clientY},this.viewport,this.model);}
 capture(id){try{this.stage.setPointerCapture(id);}catch{/* Synthetic browser checks have no native pointer to capture. */}}
 pointerDown(event){
   if(!this.model||!this.viewport||(event.pointerType==='mouse'&&event.button!==0))return;
   if(this.gesture){
     if(event.pointerType!=='touch'||this.points.size!==1)return;
     event.preventDefault();this.points.set(event.pointerId,this.point(event));this.capture(event.pointerId);
     const g=this.gesture;g.kind='pinch';g.start=g.last?.placement||g.start;g.from=[...this.points.values()].map(p=>({...p}));return;
   }
   const hit=event.target.closest('[data-editor-block]');
   if(!hit){this.select(null,false);return;}
   if(!this.isCurrent())return;
   const index=+hit.dataset.editorBlock,detail=this.details.find(d=>d.index===index);if(!detail)return;
   event.preventDefault();this.select(index);this.onStart(index);
   this.boxes[index].querySelector('.text-move').focus({preventScroll:true});this.syncViewport();
   const p=this.point(event),start=placementFromDetail(detail,this.model);
   this.gesture={index,kind:event.target.dataset.corner?'resize':'move',corner:event.target.dataset.corner,base:detail.baseBounds,start,origin:p,moved:false,last:fitPlacement(detail.baseBounds,start,this.model)};
   this.points.set(event.pointerId,p);this.capture(event.pointerId);this.stage.classList.add('is-transforming');
   this.drawBoxes();
 }
 pointerMove(event){
   const g=this.gesture;if(!g||!this.points.has(event.pointerId))return;event.preventDefault();
   const p=this.point(event);this.points.set(event.pointerId,p);
   if(!g.moved&&g.kind!=='pinch'&&Math.hypot(p.x-g.origin.x,p.y-g.origin.y)*this.viewport.width/this.model.width<2)return;
   let result;
   if(g.kind==='pinch')result=pinchPlacement(g.base,g.start,g.from,[...this.points.values()],this.model);
   else if(g.kind==='resize')result=resizePlacement(g.base,g.start,g.corner,p,this.model);
   else result=movePlacement(g.base,g.start,{x:p.x-g.origin.x,y:p.y-g.origin.y},this.model,event.altKey?0:6*this.model.width/this.viewport.width);
   g.moved=true;g.last=result;
   for(const axis of ['x','y'])this.guides[axis].hidden=!result.guides?.[axis];
   this.drawBoxes();this.onUpdate(g.index,result.placement);
 }
 finish(cancel=false){
   const g=this.gesture;if(!g)return;this.gesture=null;
   for(const id of this.points.keys())try{if(this.stage.hasPointerCapture(id))this.stage.releasePointerCapture(id);}catch{}
   this.points.clear();this.stage.classList.remove('is-transforming');for(const guide of Object.values(this.guides))guide.hidden=true;
   this.onEnd({cancel,changed:g.moved});this.drawBoxes();
 }
 keyDown(event){
   if(this.selected===null)return;
   if(event.key==='Escape'){event.preventDefault();if(this.gesture)this.finish(true);else this.select(null,false);return;}
   const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
   if(moves[event.key]){event.preventDefault();const step=event.shiftKey?10:1;this.onCommand('move',{x:moves[event.key][0]*step,y:moves[event.key][1]*step});}
   else if(['+','=','-','_'].includes(event.key)){event.preventDefault();this.onCommand('scale',event.key==='-'||event.key==='_'?1/1.1:1.1);}
   else if(event.key==='Enter'||event.key===' '){event.preventDefault();this.select(this.selected);}
 }
}
