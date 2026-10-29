import {uniqueId} from './core.js';
export class FontManager {
 constructor(){this.fonts=[];this.loaded=new Map();this.custom=[];this.fallbackId='gl-mkafio-regular';}
 async init(){const response=await fetch(new URL('./fonts.json',import.meta.url));if(!response.ok)throw new Error('შრიფტების სია ვერ ჩაიტვირთა');this.fonts=await response.json();await this.ensure(this.fallbackId);return this;}
 get(id){return this.fonts.find(f=>f.id===id)||this.fonts.find(f=>f.id===this.fallbackId);}
 async ensure(id){const font=this.get(id);if(!font)throw new Error('შრიფტი ვერ მოიძებნა');if(this.loaded.has(font.id))return this.loaded.get(font.id);const promise=(async()=>{const source=font.buffer||`url("${new URL('../'+font.src,import.meta.url).href}")`;const face=new FontFace(font.cssFamily,source,{weight:'400',style:'normal',display:'swap'});await face.load();document.fonts.add(face);return font;})();this.loaded.set(font.id,promise);try{return await promise;}catch(error){this.loaded.delete(font.id);throw error;}}
 async addCustom(file,existingId=null){if(file.size>10*1024*1024)throw new Error('შრიფტი 10 MB-ზე ნაკლები უნდა იყოს');if(!/\.(ttf|otf|woff2?)$/i.test(file.name))throw new Error('აირჩიე TTF, OTF ან WOFF შრიფტი');const id=existingId||'custom-'+uniqueId();if(this.fonts.some(f=>f.id===id))return this.get(id);const buffer=await file.arrayBuffer();const label=file.name.replace(/\.(ttf|otf|woff2?)$/i,'');const font={id,family:label,style:'პირადი',label,cssFamily:'YDA_'+id.replace(/[^a-z0-9]/gi,'_'),source:'ჩემი შრიფტები',legacy:false,coverage:null,buffer,originalName:file.name};this.fonts.push(font);try{await this.ensure(id);}catch(e){this.fonts=this.fonts.filter(f=>f.id!==id);throw new Error('ეს შრიფტი ბრაუზერმა ვერ წაიკითხა');}this.custom.push(font);return font;}
 css(id,size){return `400 ${size}px "${this.get(id).cssFamily}", "${this.get(this.fallbackId).cssFamily}", sans-serif`;}
 missing(id,text){const coverage=this.get(id).coverage;if(!coverage)return [];const set=new Set(coverage);return [...new Set([...text].filter(c=>!/[\s]/u.test(c)&&!set.has(c.codePointAt(0))))];}
 ids(){return new Set(this.fonts.map(f=>f.id));}
}
