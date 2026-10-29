import {mkdir,cp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
await mkdir(root+'dist',{recursive:true});
for(const item of ['index.html','style.css','.nojekyll','assets','js','tests'])await cp(root+item,root+'dist/'+item,{recursive:true});
console.log('Preview assets copied to dist/.');
