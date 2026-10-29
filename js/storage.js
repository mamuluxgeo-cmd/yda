let dbPromise;
function database(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const request=indexedDB.open('yda-studio',1);request.onupgradeneeded=()=>request.result.createObjectStore('assets');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});return dbPromise;}
export async function assetPut(key,value){const db=await database();return new Promise((resolve,reject)=>{const transaction=db.transaction('assets','readwrite');transaction.objectStore('assets').put(value,key);transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);});}
export async function assetGet(key){const db=await database();return new Promise((resolve,reject)=>{const request=db.transaction('assets').objectStore('assets').get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function assetDelete(key){const db=await database();return new Promise((resolve,reject)=>{const transaction=db.transaction('assets','readwrite');transaction.objectStore('assets').delete(key);transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);});}
export function safeRead(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
export function safeWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function fileDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});}
