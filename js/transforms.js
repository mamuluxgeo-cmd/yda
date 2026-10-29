// Geometry is expressed in design pixels; persisted positions are canvas-relative.
const limit=(n,a,b)=>Math.max(a,Math.min(b,n));
const number=(v,fallback,min,max)=>typeof v==='number'&&Number.isFinite(v)?limit(v,min,max):fallback;
export function sanitizePlacement(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 return {x:number(value.x,.5,0,1),y:number(value.y,.5,0,1),scale:number(value.scale,1,.01,8),wrapWidth:number(value.wrapWidth,.7,.01,1),fontScale:number(value.fontScale,1,.00001,4)};
}
export const centerOf=r=>({x:r.x+r.width/2,y:r.y+r.height/2});
export function fitPlacement(base,placement,stage){
 const p=sanitizePlacement(placement)||{x:.5,y:.5,scale:1,wrapWidth:.7,fontScale:1};
 const margin=Math.min(stage.width,stage.height)*.012;
 const maxScale=Math.max(.00001,Math.min(8,(stage.width-2*margin)/base.width,(stage.height-2*margin)/base.height));
 const scale=limit(p.scale,Math.min(.01,maxScale),maxScale),width=base.width*scale,height=base.height*scale;
 const cx=limit(p.x*stage.width,margin+width/2,stage.width-margin-width/2);
 const cy=limit(p.y*stage.height,margin+height/2,stage.height-margin-height/2);
 const c=centerOf(base);
 return {placement:{...p,x:cx/stage.width,y:cy/stage.height,scale},bounds:{x:cx-width/2,y:cy-height/2,width,height},matrix:{scale,x:cx-c.x*scale,y:cy-c.y*scale}};
}
export function placementFromDetail(detail,stage){
 const c=centerOf(detail.bounds);
 return {x:c.x/stage.width,y:c.y/stage.height,scale:detail.matrix.scale,wrapWidth:detail.wrapWidth,fontScale:detail.fontScale};
}
export function movePlacement(base,start,delta,stage,snap=0){
 const p={...start,x:start.x+delta.x/stage.width,y:start.y+delta.y/stage.height};
 const guides={x:false,y:false};
 for(const [axis,size]of [['x',stage.width],['y',stage.height]])if(snap&&Math.abs(p[axis]-.5)*size<=snap){p[axis]=.5;guides[axis]=true;}
 return {...fitPlacement(base,p,stage),guides};
}
export function resizePlacement(base,start,corner,point,stage){
 const current=fitPlacement(base,start,stage),r=current.bounds;
 const sx=corner.includes('w')?-1:1,sy=corner.includes('n')?-1:1;
 const anchor={x:sx<0?r.x+r.width:r.x,y:sy<0?r.y+r.height:r.y};
 const vx=sx*r.width,vy=sy*r.height;
 const ratio=((point.x-anchor.x)*vx+(point.y-anchor.y)*vy)/(vx*vx+vy*vy);
 const margin=Math.min(stage.width,stage.height)*.012;
 const availableX=sx<0?anchor.x-margin:stage.width-margin-anchor.x;
 const availableY=sy<0?anchor.y-margin:stage.height-margin-anchor.y;
 const maxScale=Math.max(.00001,Math.min(8,availableX/base.width,availableY/base.height));
 const scale=limit(current.placement.scale*ratio,Math.min(.01,maxScale),maxScale);
 const p={...start,scale,x:(anchor.x+sx*base.width*scale/2)/stage.width,y:(anchor.y+sy*base.height*scale/2)/stage.height};
 return fitPlacement(base,p,stage);
}
export function pinchPlacement(base,start,from,to,stage){
 const distance=points=>Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y);
 const middle=points=>({x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2});
 const a=middle(from),b=middle(to),ratio=distance(to)/Math.max(1,distance(from));
 return fitPlacement(base,{...start,scale:start.scale*ratio,x:(b.x+(start.x*stage.width-a.x)*ratio)/stage.width,y:(b.y+(start.y*stage.height-a.y)*ratio)/stage.height},stage);
}
export function clientToDesign(client,viewport,stage){return {x:(client.x-viewport.left)*stage.width/viewport.width,y:(client.y-viewport.top)*stage.height/viewport.height};}
export function containedViewport(rect,stage){
 const ratio=stage.width/stage.height,width=Math.min(rect.width,rect.height*ratio),height=width/ratio;
 return {left:rect.left+(rect.width-width)/2,top:rect.top+(rect.height-height)/2,width,height};
}
