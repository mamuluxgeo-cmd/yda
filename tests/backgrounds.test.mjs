import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_STATE,clone,sanitizeState} from '../js/core.js';
import {THEMES} from '../js/catalog.js';
import {BACKGROUNDS,THEME_BACKGROUNDS,resolveBackground,randomizeBackground,rethemeBackground} from '../js/backgrounds.js';

test('all 30 themes resolve to one of the six illustrated backgrounds',()=>{
 const illustrated=new Set(['cosmic','royal','forest','pearl','football','racing']);
 for(const t of THEMES){assert.ok(illustrated.has(THEME_BACKGROUNDS[t.id]),t.id);const bg=resolveBackground({...DEFAULT_STATE,theme:t.id});assert.equal(bg.id,THEME_BACKGROUNDS[t.id]);assert.ok(bg.colors.every(c=>/^#[0-9a-f]{6}$/i.test(c)));}
 assert.equal(BACKGROUNDS.length,9);
});
test('migration upgrades plain white but keeps a deliberately chosen old solid color',()=>{
 assert.equal(sanitizeState({frameFillColor:'#ffffff'}).frameBackground,'auto');
 const old=sanitizeState({frameFillColor:'#123456'});assert.equal(old.frameBackground,'solid');assert.deepEqual(resolveBackground(old).colors,['#123456','#123456']);
 assert.equal(sanitizeState({frameFillColor:'#ffffff',frameBackground:'solid'}).frameBackground,'solid');
});
test('background controls survive project serialization and reject malformed imports',()=>{
 const s=sanitizeState({...DEFAULT_STATE,frameBackground:'cosmic',frameFillColor:'#123456',frameFillColor2:'#789abc',frameCustomColors:true,frameBackgroundVariant:2,frameBackgroundSeed:6789,framePattern:70,locks:{background:true}});
 assert.deepEqual(sanitizeState(JSON.parse(JSON.stringify(s))),s);
 assert.deepEqual(resolveBackground(s).colors,['#123456','#789abc']);
 const unsafe=sanitizeState({frameBackground:'bogus',frameFillColor2:'#00000000',framePattern:Infinity,frameBackgroundSeed:-20,frameBackgroundVariant:1.7,frameCustomColors:'yes'});
 assert.equal(unsafe.frameBackground,'auto');assert.equal(unsafe.frameFillColor2,DEFAULT_STATE.frameFillColor2);assert.equal(unsafe.framePattern,55);assert.equal(unsafe.frameBackgroundSeed,0);assert.equal(unsafe.frameBackgroundVariant,1);assert.equal(unsafe.frameCustomColors,false);
});
test('other background changes the background while keeping text, frames and materials intact',()=>{
 const s=clone(DEFAULT_STATE);s.theme='space';s.frameCustomColors=true;
 const before=clone(s),old=resolveBackground({...s,frameCustomColors:false});randomizeBackground(s,()=>.65);
 assert.equal(resolveBackground(s).id,'cosmic');assert.notDeepEqual(resolveBackground(s).colors,old.colors);assert.equal(s.frameCustomColors,false);
 const backgroundKeys=new Set(['frameBackground','frameBackgroundVariant','frameBackgroundSeed','framePattern','frameCustomColors']);
 for(const key of Object.keys(before))if(!backgroundKeys.has(key))assert.deepEqual(s[key],before[key],key);
});
test('theme selection follows themes unless the background is locked',()=>{
 const s=clone(DEFAULT_STATE);rethemeBackground(s,'space');assert.equal(resolveBackground(s).id,'cosmic');
 s.frameBackgroundVariant=2;s.locks.background=true;const before=resolveBackground(s);rethemeBackground(s,'football');
 assert.equal(s.theme,'football');assert.equal(resolveBackground(s).id,before.id);assert.deepEqual(resolveBackground(s).colors,before.colors);
 s.locks.background=false;rethemeBackground(s,'football');assert.equal(s.frameBackground,'auto');assert.equal(resolveBackground(s).id,'football');
});
