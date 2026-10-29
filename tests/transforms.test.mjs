import test from 'node:test';
import assert from 'node:assert/strict';
import {clone,DEFAULT_STATE,sanitizeState} from '../js/core.js';
import {sanitizePlacement,fitPlacement,movePlacement,resizePlacement,pinchPlacement,placementFromDetail,clientToDesign,containedViewport,centerOf} from '../js/transforms.js';
const stage={width:1800,height:700},base={x:350,y:260,width:600,height:100};
const placement={x:.5,y:.5,scale:1,wrapWidth:.7,fontScale:.8};
const close=(a,b)=>assert.ok(Math.abs(a-b)<.000001,`${a} != ${b}`);
test('old projects keep automatic layout and both manual text placements round-trip',()=>{
 assert.equal(sanitizeState({}).blocks[0].placement,null);
 const s=clone(DEFAULT_STATE);s.blocks[0].placement={...placement,x:.3};s.blocks[1].placement={...placement,y:.7,scale:1.2};s.blocks[1].enabled=true;
 assert.deepEqual(sanitizeState(JSON.parse(JSON.stringify(s))),s);
 assert.equal(sanitizePlacement(null),null);assert.equal(sanitizePlacement('bad'),null);
 assert.deepEqual(sanitizePlacement({x:Infinity,y:-5,scale:1000,wrapWidth:0,fontScale:NaN}),{x:.5,y:0,scale:8,wrapWidth:.01,fontScale:1});
});
test('drag coordinates are independent of zoom, letterboxing and cover photo placement',()=>{
 const viewport=containedViewport({left:50,top:80,width:900,height:600},stage);
 close(viewport.height,350);close(viewport.top,205);
 assert.deepEqual(clientToDesign({x:500,y:380},viewport,stage),{x:900,y:350});
 const cover={left:74,top:190,width:360,height:140};assert.deepEqual(clientToDesign({x:254,y:260},cover,stage),{x:900,y:350});
});
test('moving one block changes only its placement; snapping centers and clamps keep it visible',()=>{
 const m=movePlacement(base,placement,{x:120,y:-50},stage);close(m.placement.x,.5+120/1800);close(m.placement.y,.5-50/700);assert.equal(m.placement.scale,1);
 const snap=movePlacement(base,{...placement,x:.49},{x:16,y:0},stage,5);assert.equal(snap.placement.x,.5);assert.equal(snap.guides.x,true);
 const edge=movePlacement(base,placement,{x:100000,y:-100000},stage);assert.ok(edge.bounds.x+edge.bounds.width<stage.width);assert.ok(edge.bounds.y>0);
});
test('all four resize handles preserve proportions and hold the opposite corner fixed',()=>{
 const initial=fitPlacement(base,placement,stage).bounds;
 for(const corner of ['nw','ne','sw','se']){
   const sx=corner.includes('w')?-1:1,sy=corner.includes('n')?-1:1;
   const anchor={x:sx<0?initial.x+initial.width:initial.x,y:sy<0?initial.y+initial.height:initial.y};
   const point={x:anchor.x+sx*initial.width*1.3,y:anchor.y+sy*initial.height*1.3};
   const result=resizePlacement(base,placement,corner,point,stage),r=result.bounds;
   close(result.placement.scale,1.3);close(r.width/r.height,base.width/base.height);
   close(sx<0?r.x+r.width:r.x,anchor.x);close(sy<0?r.y+r.height:r.y,anchor.y);
   const clamped=resizePlacement(base,placement,corner,{x:sx*1e6,y:sy*1e6},stage).bounds;
   assert.ok(clamped.x>=0&&clamped.y>=0&&clamped.x+clamped.width<=stage.width+.001&&clamped.y+clamped.height<=stage.height+.001);
 }
});
test('pinching scales around its midpoint and can translate the selected block',()=>{
 const r=pinchPlacement(base,placement,[{x:800,y:350},{x:1000,y:350}],[{x:850,y:300},{x:1150,y:300}],stage);
 close(r.placement.scale,1.5);close(centerOf(r.bounds).x,1000);close(centerOf(r.bounds).y,300);
});
test('render details become absolute placements without moving the text',()=>{
 const detail={baseBounds:base,bounds:base,matrix:{scale:1,x:0,y:0},fontScale:.8,wrapWidth:.7};
 const p=placementFromDetail(detail,stage),result=fitPlacement(base,p,stage);
 close(result.bounds.x,base.x);close(result.bounds.y,base.y);assert.equal(p.fontScale,.8);assert.equal(p.wrapWidth,.7);
});
