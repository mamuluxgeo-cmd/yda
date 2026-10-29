// Shared by the live canvas, thumbnails and PNG export. Every base fill is opaque.
export const BACKGROUNDS = [
 {id:'auto',name:'თემის მიხედვით'},
 {id:'solid',name:'ერთი ფერი',variants:[['#ffffff','#ffffff']]},
 {id:'gradient',name:'გრადიენტი',variants:[['#f3e6fa','#b2dbe6'],['#ffeed7','#e1b4c9'],['#d8ebdf','#a8bbdf']]},
 {id:'cosmic',name:'კოსმოსი',variants:[['#101a40','#7351a0'],['#08233a','#287f8d'],['#262048','#954f80']]},
 {id:'royal',name:'სამეფო',variants:[['#fff4d4','#c59a4c'],['#ffe6df','#c38d81'],['#eaf2fd','#7797bd']]},
 {id:'forest',name:'ჯადოსნური ტყე',variants:[['#dbedcd','#357653'],['#ebedcd','#668345'],['#d7f0df','#2c7b70']]},
 {id:'pearl',name:'მარგალიტი',variants:[['#f6dce9','#b4deda'],['#ede0fc','#b8c9f5'],['#ffe9cf','#efbaca']]},
 {id:'football',name:'ფეხბურთი',variants:[['#20583e','#4b9560'],['#153e37','#358276'],['#34582c','#739746']]},
 {id:'racing',name:'რბოლა',variants:[['#252a37','#df514e'],['#242e42','#5089d8'],['#352b41','#a36bc0']]}
];
export const THEME_BACKGROUNDS = {
 football:'football',racing:'racing',dinosaurs:'forest',space:'cosmic',
 princess:'royal',prince:'royal',pegasus:'pearl',unicorn:'pearl',dragon:'forest',
 forest:'forest',fairy:'forest',underwater:'pearl',pirates:'royal',treasure:'royal',
 jungle:'forest',safari:'forest',winter:'pearl',christmas:'royal',candyland:'pearl',
 dreams:'cosmic',heroes:'cosmic',robots:'racing',submarine:'pearl',airplanes:'cosmic',
 trains:'racing',construction:'racing',firefighters:'racing',detectives:'royal',
 music:'cosmic',georgian:'royal'
};
export function resolveBackground(s) {
 const id=!s.frameBackground?'solid':s.frameBackground==='auto'?(THEME_BACKGROUNDS[s.theme]||'royal'):s.frameBackground;
 const style=BACKGROUNDS.find(b=>b.id===id&&b.variants)||BACKGROUNDS[1];
 const variant=Math.max(0,Math.floor(s.frameBackgroundVariant||0))%style.variants.length;
 const colors=style.id==='solid'?[s.frameFillColor||'#ffffff',s.frameFillColor||'#ffffff']:
   s.frameCustomColors?[s.frameFillColor||style.variants[variant][0],s.frameFillColor2||style.variants[variant][1]]:style.variants[variant];
 return {...style,colors,variant};
}
export function randomizeBackground(s,random=Math.random) {
 if(s.frameBackground==='solid')s.frameBackground='auto';
 const style=resolveBackground(s);
 s.frameBackgroundVariant=(style.variant+1+Math.floor(random()*Math.max(1,style.variants.length-1)))%style.variants.length;
 s.frameCustomColors=false;
 s.framePattern=[35,55,75][Math.min(2,Math.floor(random()*3))];
 s.frameBackgroundSeed=Math.floor(random()*1000000000);
}
export function rethemeBackground(s,theme) {
 // A locked automatic background becomes explicit before its theme changes.
 if(s.locks?.background){if(s.frameBackground==='auto')s.frameBackground=resolveBackground(s).id;}
 else {s.frameBackground='auto';s.frameCustomColors=false;s.frameBackgroundVariant=0;}
 s.theme=theme;
}
const blend=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
function randomSource(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function line(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function sparkle(ctx,x,y,r){ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.22:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
function glow(ctx,w,h,x,y,r,color,opacity){ctx.save();ctx.translate(x*w,y*h);ctx.scale(w,h);const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,color);g.addColorStop(1,color+'00');ctx.globalAlpha=opacity;ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();}
function ellipse(ctx,x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke();}
function leaf(ctx,x,y,size,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-size*.6,-size*.35,-size*.45,-size*.9,0,-size);ctx.bezierCurveTo(size*.55,-size*.75,size*.6,-size*.3,0,0);ctx.fill();ctx.stroke();line(ctx,[[0,0],[0,-size*.85]]);ctx.restore();}
function edgePoint(rng,w,h){const x=w*(.1+rng()*.8),y=h*(rng()<.5?.16+rng()*.13:.71+rng()*.13);return [x,y];}

export function drawFrameBackground(ctx,s) {
 const w=s.width,h=s.height,u=Math.min(w/1000,h/400),{id,colors:[a,b],variant}=resolveBackground(s);
 ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 if(id==='solid'){ctx.fillStyle=a;ctx.fillRect(0,0,w,h);ctx.restore();return;}
 let base;
 if(id==='royal'||id==='forest'){
   ctx.save();ctx.scale(w,h);base=ctx.createRadialGradient(.5,.46,.03,.5,.5,.6);base.addColorStop(0,a);base.addColorStop(.4,a);base.addColorStop(1,b);ctx.fillStyle=base;ctx.fillRect(0,0,1,1);ctx.restore();
 }else{
   base=ctx.createLinearGradient(w*.12,h*.13,w*.88,h*.87);
   base.addColorStop(0,a);base.addColorStop(1,id==='racing'?blend(a,b,.13):b);ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 }
 if(id==='cosmic'){glow(ctx,w,h,.16,.9,.55,'#43bdcd',.25);glow(ctx,w,h,.75,.18,.45,b,.5);glow(ctx,w,h,.5,.5,.52,a,.78);}
 if(id==='pearl'){glow(ctx,w,h,.28,.1,.65,'#fff5da',.7);glow(ctx,w,h,.55,.55,.45,'#ffffff',.3);}
 if(id==='gradient')glow(ctx,w,h,.5,.45,.6,'#ffffff',.28);
 if(id==='football')glow(ctx,w,h,.5,.3,.7,b,.2);
 const intensity=Math.max(0,Math.min(100,s.framePattern??55))/100;
 if(!intensity){ctx.restore();return;}
 const rng=randomSource((s.frameBackgroundSeed??1234)+variant*997),ink=blend(b,'#ffffff',.68);
 ctx.lineWidth=Math.max(.7,u*1.3);ctx.lineCap='round';ctx.lineJoin='round';
 if(id==='cosmic'){
   ctx.fillStyle='#edfbff';
   for(let i=0;i<75;i++){const [x,y]=edgePoint(rng,w,h);ctx.globalAlpha=intensity*(.25+rng()*.65);if(i%6===0)sparkle(ctx,x,y,(2+rng()*4)*u);else{ctx.beginPath();ctx.arc(x,y,(.7+rng()*1.3)*u,0,Math.PI*2);ctx.fill();}}
   ctx.globalAlpha=intensity*.45;ctx.strokeStyle=ink;
   ctx.save();ctx.translate(w*.9,h*.69);ctx.rotate(-.24);ellipse(ctx,0,0,w*.19,h*.15);ellipse(ctx,0,0,w*.22,h*.18);ctx.restore();
   ctx.globalAlpha=intensity*.27;ctx.fillStyle=ink;ctx.beginPath();ctx.arc(w*.18,h*.24,h*.035,0,Math.PI*2);ctx.fill();
 }else if(id==='royal'){
   ctx.strokeStyle=blend(b,'#654319',.25);ctx.fillStyle=ctx.strokeStyle;ctx.globalAlpha=intensity*.57;
   for(const side of [-1,1])for(const vertical of [-1,1]){
     ctx.save();ctx.translate(w/2+side*w*.29,h/2+vertical*h*.26);ctx.scale(side,vertical);
     ctx.beginPath();ctx.moveTo(-w*.13,0);ctx.bezierCurveTo(-w*.02,-h*.07,w*.08,h*.06,w*.12,-h*.025);ctx.bezierCurveTo(w*.18,-h*.15,w*.015,-h*.17,w*.06,-h*.025);ctx.bezierCurveTo(w*.075,h*.02,w*.11,-h*.04,w*.08,-h*.055);ctx.stroke();
     leaf(ctx,w*.035,-h*.02,h*.048,-.8);leaf(ctx,-w*.01,-h*.01,h*.04,-1.1);ctx.restore();
   }
   ctx.globalAlpha=intensity*.35;
   for(let i=0;i<13;i++){const x=w*(.22+i*.047);for(const y of [h*.19,h*.81])sparkle(ctx,x,y,(i%3===0?3:1.6)*u);}
   ctx.globalAlpha=intensity*.3;const y=h*.21;line(ctx,[[w*.476,y+h*.025],[w*.473,y-h*.012],[w*.487,y],[w*.5,y-h*.032],[w*.513,y],[w*.527,y-h*.012],[w*.524,y+h*.025],[w*.476,y+h*.025]]);
 }else if(id==='forest'){
   ctx.fillStyle=blend(b,'#21432e',.25);ctx.strokeStyle=blend(b,a,.25);
   for(const side of [-1,1]){
     ctx.save();ctx.translate(w/2+side*w*.37,h*.5);ctx.scale(side,1);ctx.globalAlpha=intensity*.55;
     ctx.beginPath();ctx.moveTo(w*.015,h*.32);ctx.bezierCurveTo(-w*.025,h*.12,w*.04,-h*.12,-w*.01,-h*.31);ctx.stroke();
     for(let i=0;i<7;i++){const y=h*(-.25+i*.08);leaf(ctx,0,y,h*(.08+rng()*.045),(i%2?.8:-.9));}
     ctx.restore();
   }
   ctx.fillStyle='#fff5b5';
   for(let i=0;i<26;i++){const [x,y]=edgePoint(rng,w,h);ctx.globalAlpha=intensity*(.25+rng()*.6);ctx.beginPath();ctx.arc(x,y,(1.1+rng()*2.5)*u,0,Math.PI*2);ctx.fill();}
 }else if(id==='pearl'){
   for(let i=0;i<16;i++){
     const [x,y]=edgePoint(rng,w,h),r=(5+rng()*19)*u;const g=ctx.createRadialGradient(x-r*.3,y-r*.4,r*.02,x,y,r);g.addColorStop(0,'#ffffffd9');g.addColorStop(.6,a+'44');g.addColorStop(1,blend(b,'#9b83af',.3)+'66');ctx.globalAlpha=intensity;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffffffb0';ctx.stroke();
   }
   ctx.fillStyle='#ffffff';ctx.globalAlpha=intensity*.85;for(let i=0;i<11;i++){const [x,y]=edgePoint(rng,w,h);sparkle(ctx,x,y,(2+rng()*3)*u);}
 }else if(id==='football'){
   ctx.fillStyle='#e8f4d5';ctx.globalAlpha=intensity*.055;for(let i=0;i<14;i+=2)ctx.fillRect(w*(i/14),0,w/14,h);
   ctx.strokeStyle='#edffdc';ctx.globalAlpha=intensity*.42;ctx.lineWidth=1.3*u;ctx.strokeRect(w*.09,h*.19,w*.82,h*.62);
   ctx.strokeRect(w*.09,h*.34,w*.09,h*.32);ctx.strokeRect(w*.82,h*.34,w*.09,h*.32);
   ctx.globalAlpha=intensity*.17;ellipse(ctx,w/2,h/2,h*.22,h*.22);line(ctx,[[w/2,h*.19],[w/2,h*.81]]);
   ctx.globalAlpha=intensity*.32;ctx.fillStyle='#efffdb';for(let i=0;i<11;i++){ctx.beginPath();ctx.arc(w*(.25+i*.05),h*.2,1.8*u,0,Math.PI*2);ctx.fill();}
 }else if(id==='racing'){
   ctx.globalAlpha=intensity*.055;ctx.strokeStyle='#ffffff';
   for(let i=-20;i<80;i++){const x=i*w/60;line(ctx,[[x,0],[x-w*.2,h]]);}
   for(const side of [0,1]){
     ctx.save();ctx.translate(side?w*.86:w*.14,h*.5);ctx.rotate(.36);ctx.globalAlpha=intensity*.8;ctx.fillStyle=b;ctx.fillRect(-w*.015,-h,w*.02,h*2);ctx.globalAlpha=intensity*.32;ctx.fillRect(w*.016,-h,w*.01,h*2);ctx.restore();
   }
   ctx.fillStyle='#ffffff';ctx.globalAlpha=intensity*.45;const size=11*u;
   for(const [x,y]of [[w*.23,h*.71],[w*.68,h*.21]])for(let row=0;row<3;row++)for(let col=0;col<8;col++)if((row+col)%2===0)ctx.fillRect(x+col*size,y+row*size,size,size);
   ctx.strokeStyle=b;ctx.globalAlpha=intensity*.4;for(let i=0;i<4;i++){const x=w*(.28+rng()*.4),y=h*(i%2?.79:.22);line(ctx,[[x,y],[x+w*(.035+rng()*.04),y]]);}
 }
 ctx.restore();
}
