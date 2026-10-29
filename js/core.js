import {THEMES,PALETTES,MATERIALS,SHAPES} from './catalog.js';
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const clone=v=>JSON.parse(JSON.stringify(v));
export const uniqueId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
export const DEFAULT_STATE={version:1,theme:'princess',palette:'royal',material:'gold',customColor:null,outlineColor:'#62402a',rainbow:false,depth:12,stroke:2,shadow:8,shine:60,direction:'se',frameEnabled:true,frameShape:'ornate',decor:100,inset:16,seed:1234,blockGap:20,fitText:true,width:1800,height:700,exportScale:2,exportLayers:'both',trim:true,padding:28,locks:{font:false,color:false,frame:false,material:false},blocks:[{text:'მარიამის\nჯადოსნური თავგადასავალი',fontId:'gl-kupiura-bold',fontSize:158,lineMode:'manual',align:'center',letterSpacing:0,lineHeight:1.2,enabled:true},{text:'La aventura mágica de Mariam',fontId:'gl-parizuli-bold',fontSize:76,lineMode:'auto',align:'center',letterSpacing:0,lineHeight:1.2,enabled:false}]};
const num=(v,d,min,max)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,min,max):d;
const bool=(v,d)=>typeof v==='boolean'?v:d;
const choice=(v,allowed,d)=>allowed.includes(v)?v:d;
const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:null;
export function sanitizeState(raw={},fontIds=null){
 if(!raw||typeof raw!=='object')raw={};
 const s=clone(DEFAULT_STATE);
 for(const [k,items]of Object.entries({theme:THEMES,palette:PALETTES,material:MATERIALS}))s[k]=choice(raw[k],items.map(x=>x.id),s[k]);
 s.frameShape=choice(raw.frameShape,SHAPES,s.frameShape);s.direction=choice(raw.direction,['se','sw','s'],'se');s.exportLayers=choice(raw.exportLayers,['both','text','frame'],'both');
 for(const [k,min,max]of [['depth',0,32],['stroke',0,9],['shadow',0,24],['shine',0,100],['decor',65,130],['inset',0,80],['seed',0,1e9],['blockGap',0,80],['width',400,4096],['height',200,4096],['exportScale',1,3],['padding',0,100]])s[k]=num(raw[k],s[k],min,max);
 s.width=Math.round(s.width);s.height=Math.round(s.height);
 for(const k of ['rainbow','frameEnabled','fitText','trim'])s[k]=bool(raw[k],s[k]);
 s.customColor=color(raw.customColor);s.outlineColor=color(raw.outlineColor)||s.outlineColor;
 for(const k of Object.keys(s.locks))s.locks[k]=bool(raw.locks?.[k],false);
 s.blocks=s.blocks.map((def,i)=>{const b=raw.blocks?.[i]||{};return {...def,text:typeof b.text==='string'?b.text.slice(0,500):def.text,fontId:typeof b.fontId==='string'&&(!fontIds||fontIds.has(b.fontId))?b.fontId:def.fontId,fontSize:num(b.fontSize,def.fontSize,40,260),lineMode:choice(b.lineMode,['auto','1','2','3','manual'],'auto'),align:choice(b.align,['center','left','right'],'center'),letterSpacing:num(b.letterSpacing,0,-3,12),lineHeight:num(b.lineHeight,1.2,1,1.8),enabled:i===0?true:bool(b.enabled,false)};});
 return s;
}
export function splitBalanced(text,count,measure){
 const words=text.trim().split(/\s+/).filter(Boolean);if(!words.length)return [''];
 count=Math.min(count,words.length);
 if(count===1)return [words.join(' ')];
 // Minimize the widest line first; stable for Georgian, names and Spanish accents.
 const memo=new Map();
 const solve=(start,n)=>{const key=`${start}:${n}`;if(memo.has(key))return memo.get(key);if(n===1){const line=words.slice(start).join(' ');return {cost:measure(line)**2,lines:[line]};}let best={cost:Infinity,lines:[]};for(let end=start+1;end<=words.length-n+1;end++){const line=words.slice(start,end).join(' '),rest=solve(end,n-1);const cost=measure(line)**2+rest.cost;if(cost<best.cost)best={cost,lines:[line,...rest.lines]};}memo.set(key,best);return best;};
 return solve(0,count).lines;
}
export function wrapLines(text,maxWidth,measure,mode='auto'){
 if(mode==='manual')return text.split('\n');
 if(['1','2','3'].includes(mode))return splitBalanced(text,Number(mode),measure);
 const lines=[];
 for(const paragraph of text.split('\n')){let line='';for(const word of paragraph.split(/\s+/).filter(Boolean)){const proposed=line?`${line} ${word}`:word;if(line&&measure(proposed)>maxWidth){lines.push(line);line=word;}else line=proposed;}lines.push(line);}
 return lines.length?lines:[''];
}
export function exportDimensions(state){const maxPixels=14000000,maxEdge=6000,pad=state.trim?state.padding*2:0;const scale=Math.min(state.exportScale,maxEdge/(state.width+pad),maxEdge/(state.height+pad),Math.sqrt(maxPixels/((state.width+pad)*(state.height+pad))));return {width:Math.round(state.width*scale),height:Math.round(state.height*scale),scale};}
export function alphaBounds(data,width,height){let minX=width,minY=height,maxX=-1,maxY=-1;for(let y=0;y<height;y++){for(let x=0;x<width;x++){if(data[(y*width+x)*4+3]>0){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}}}return maxX<0?null:{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1};}
export function mulberry32(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
