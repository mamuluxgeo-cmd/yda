export const PALETTES = [
 ['royal','სამეფო',['#ffdc83','#ba7c2b','#fff1c8','#344778']],
 ['rainbow','ცისარტყელა',['#ff638d','#ffbe57','#5ad6c8','#8073ed','#68b5ff']],
 ['pastel','პასტელის კანფეტი',['#f5a9cf','#b7a3ed','#9bdbd5','#ffdda3']],
 ['coral','მარჯანი და შამპანური',['#f28f82','#ebbd83','#fff1d3','#a55558']],
 ['pink','ვარდისფერი მაგია',['#ff83cc','#cb60e6','#fcb8e9','#7046bd']],
 ['cosmic','კოსმოსური',['#65e5e9','#8a75f3','#79b6ff','#34448e']],
 ['ice','ყინულისფერი',['#a8e5f7','#f2faff','#86aac8','#5476ac']],
 ['football','მწვანე მოედანი',['#6bd488','#f4f9e8','#ffda7b','#27634d']],
 ['racing','რბოლის ენერგია',['#ff685a','#f0f2f5','#454b63','#ffbf49']],
 ['dino','დინოზავრის ხეობა',['#a6d562','#ffb26a','#eed9a7','#546c37']],
 ['sea','ზღვის საგანძური',['#6cddd7','#f49d98','#e8fff1','#4285ae']],
 ['unicorn','ერთრქას სიზმარი',['#bf9cf1','#f9badb','#a2d6f2','#f7e1a3']],
 ['forest','ჯადოსნური ტყე',['#80c59b','#a97d57','#f7d182','#345c47']],
 ['chocolate','შოკოლადის ამბავი',['#c88d60','#f2c28c','#fff1d6','#704c3f']],
 ['midnight','მთვარის შუქი',['#8ca7ea','#cad9f4','#ffe4a7','#405082']]
].map(([id,name,colors])=>({id,name,colors}));

export const MATERIALS = [
 ['glossy','ბზინვარე სათამაშო','gloss'],['matte','რბილი მატე','matte'],['balloon','ბუშტი','balloon'],['gold','სამეფო ოქრო','metal'],['silver','ვერცხლი','metal'],['bronze','ძველი ბრინჯაო','metal'],['rose','ვარდისფერი ოქრო','metal'],['chrome','ფერადი ქრომი','metal'],['glass','ფერადი მინა','glass'],['ice','ყინულის კრისტალი','cracks'],['gem','ძვირფასი ქვა','gem'],['jelly','ჟელე','balloon'],['candy','ზოლიანი კანფეტი','stripes'],['chocolate','შოკოლადი','gloss'],['cookie','ბისკვიტი და მინანქარი','sprinkles'],['plush','ფუმფულა ქსოვილი','noise'],['felt','ფეტრი და ნაკერი','stitch'],['wood','ხის ტექსტურა','wood'],['marble','მარმარილო','marble'],['stone','უძველესი ქვა','noise'],['lava','ცეცხლოვანი ლავა','cracks'],['water','წყლის წვეთები','drops'],['moss','ხავსი','noise'],['galaxy','ვარსკვლავური','stars'],['neon','ნეონის ნათება','neon']
].map(([id,name,texture])=>({id,name,texture}));

const THEME_ROWS = [
 ['football','ფეხბურთი','football',['football','royal'],['glossy','matte','gold']],
 ['racing','რბოლა','car',['racing','cosmic'],['chrome','glossy','silver']],
 ['dinosaurs','დინოზავრები','dino',['dino','forest'],['moss','stone','glossy']],
 ['space','კოსმოსი','rocket',['cosmic','midnight'],['galaxy','chrome','neon']],
 ['princess','პრინცესა','crown',['royal','pink','pastel'],['gold','rose','balloon']],
 ['prince','პრინცი','castle',['royal','midnight'],['gold','silver','matte']],
 ['pegasus','ფრთიანი ცხენი','pegasus',['royal','ice','unicorn'],['gold','glass','silver']],
 ['unicorn','ერთრქა','unicorn',['unicorn','pastel','rainbow'],['balloon','chrome','jelly']],
 ['dragon','დრაკონი','dragon',['dino','racing','forest'],['lava','gem','bronze']],
 ['forest','ჯადოსნური ტყე','tree',['forest','dino'],['wood','moss','gold']],
 ['fairy','ფერიების ბაღი','fairy',['pastel','pink','forest'],['glass','rose','jelly']],
 ['underwater','წყალქვეშა სამეფო','shell',['sea','ice'],['gem','water','silver']],
 ['pirates','მეკობრეები','pirate',['chocolate','royal'],['wood','bronze','gold']],
 ['treasure','განძის რუკა','map',['chocolate','royal'],['bronze','wood','gold']],
 ['jungle','ჯუნგლები','lion',['forest','dino'],['moss','wood','matte']],
 ['safari','საფარი','elephant',['dino','chocolate'],['matte','plush','wood']],
 ['winter','ზამთრის სამეფო','snow',['ice','midnight'],['ice','silver','glass']],
 ['christmas','შობა','gift',['forest','racing','royal'],['gold','felt','glossy']],
 ['candyland','ტკბილეთის ქვეყანა','candy',['pastel','rainbow','chocolate'],['candy','cookie','chocolate']],
 ['dreams','მთვარე და სიზმრები','moon',['midnight','unicorn'],['plush','galaxy','silver']],
 ['heroes','სუპერგმირები','hero',['racing','cosmic','rainbow'],['chrome','neon','glossy']],
 ['robots','რობოტები','robot',['cosmic','ice'],['silver','chrome','neon']],
 ['submarine','წყალქვეშა ექსპედიცია','submarine',['sea','royal'],['water','silver','glossy']],
 ['airplanes','თვითმფრინავები','plane',['ice','racing'],['silver','glossy','chrome']],
 ['trains','მატარებლები','train',['racing','forest'],['glossy','bronze','matte']],
 ['construction','მშენებლობა','crane',['royal','racing'],['matte','chrome','glossy']],
 ['firefighters','მეხანძრეები','firetruck',['racing','royal'],['glossy','chrome','gold']],
 ['detectives','დეტექტივები','magnifier',['chocolate','midnight'],['bronze','wood','silver']],
 ['music','მუსიკა და ცეკვა','music',['pink','cosmic','rainbow'],['neon','chrome','balloon']],
 ['georgian','ქართული ზღაპარი','tower',['royal','forest','chocolate'],['gold','stone','wood']]
];
export const THEMES=THEME_ROWS.map(([id,name,icon,palettes,materials])=>({id,name,icon,palettes,materials}));
export const SHAPES=['ornate','oval','banner','shield','corners'];

// All illustrations are self-contained vector paths. No emoji or external image requests.
const ICONS={
 football:'<circle cx="50" cy="50" r="34"/><path d="m50 31 18 13-7 21H39l-7-21z" fill="D"/><path d="m50 31-5-15m23 28 16-4M61 65l9 14M39 65 28 79M32 44l-16-4" fill="none"/>',
 car:'<path d="m15 60 5-20 17-5 11-15h22l13 26 7 5v17H12V56z"/><path d="m45 37 9-12h13l8 20H41z" fill="W"/><circle cx="29" cy="67" r="12" fill="D"/><circle cx="74" cy="67" r="12" fill="D"/><circle cx="29" cy="67" r="5" fill="W"/><circle cx="74" cy="67" r="5" fill="W"/><path d="M17 51h15m48 0h8" stroke="W"/>',
 dino:'<path d="M14 69q19-2 24-26l5-15q4-16 23-12 14 2 13 16-1 11-17 10v19l10 18H58l-8-14-8 15H29l7-20Q21 83 10 77z"/><circle cx="65" cy="27" r="2" fill="D"/><path d="m39 39-10-6 10-6m-6 26-11-5 11-6M53 48l9 8h9" fill="none"/>',
 rocket:'<path d="M39 65q-22 2-23 20l24-6m24-39q2-22 21-24l-6 24" fill="A"/><path d="M33 60Q39 21 80 17q5 41-33 49z"/><circle cx="61" cy="38" r="10" fill="W"/><path d="m31 67-13 15 20-6m-9-1-9 13" fill="none" stroke="A"/><path d="m34 55 18 17"/>',
 crown:'<path d="m14 30 19 15 17-27 17 27 19-15-9 43H23z"/><path d="M23 63h54v14H23z" fill="A"/><path d="m50 43 8 10-8 10-8-10z" fill="W"/><circle cx="14" cy="28" r="5"/><circle cx="50" cy="16" r="5"/><circle cx="86" cy="28" r="5"/>',
 castle:'<path d="M13 40V26h9v8h8v-8h9v14l-4 5v38H17V45zm48 0V26h9v8h8v-8h9v14l-4 5v38H65V45z"/><path d="M35 49h30v34H35zM40 28l10-17 10 17v21H40z" fill="A"/><path d="M43 83V66q7-13 14 0v17" fill="W"/><path d="M24 52v8m52-8v8M50 32v8" stroke="D"/>',
 pegasus:'<path d="M61 69q-25 6-36-11L12 31q26 4 37 23L34 20q27 9 31 32l-4 17z" fill="W"/><path d="m53 68 4-25 18-23 14 7-7 14-10-1-3 15 10 25H61z"/><path d="m58 42 6-23 10 1m5 61 5 8M48 47 25 33m25 24L23 46" fill="none"/><circle cx="78" cy="30" r="2" fill="D"/>',
 unicorn:'<path d="m58 33 9-25 5 27" fill="W"/><path d="M31 82q-6-30 12-54l22 2 22 17-10 16-17-5-5 24z"/><path d="M43 28Q15 31 18 76l13 6q-3-30 17-39" fill="A"/><path d="m46 30 3-15 12 15"/><circle cx="65" cy="43" r="3" fill="D"/><path d="M20 48 37 34m-18 25 17-14m-15 25 14-14" fill="none" stroke="W"/>',
 dragon:'<path d="m50 61-20-9-14 12 5-31 24 12 7-19 17-10 15 19-9 12-12-4-2 20 18 16-27 7-22-15-14 8-7-7z"/><path d="m27 41 15 5-14 5zm33-15 4-13 7 6" fill="A"/><path d="m82 39 14 6-10 5" stroke="#ff9555" fill="#ffce61"/><circle cx="71" cy="29" r="2" fill="D"/>',
 tree:'<path d="M43 58h14v30H43z" fill="A"/><path d="M25 68Q6 65 15 48q-8-18 11-25 1-19 23-16 20-4 26 18 21 7 12 26 6 17-12 20z"/><path d="M50 67V32M50 51 32 41m18 16 22-14" fill="none" stroke="W"/>',
 fairy:'<path d="M47 49Q8 5 12 44q2 17 29 14-30 10-18 25 13 12 25-20m5-14Q92 5 88 44q-2 17-29 14 30 10 18 25-13 12-25-20" fill="A"/><circle cx="50" cy="34" r="9"/><path d="m48 45-13 28h30L52 45M42 70l-4 20m20-20 4 20"/><path d="m59 48 21-22m-4-3 5-7 6 5-4 7z" fill="W"/>',
 shell:'<path d="M47 79Q13 64 13 39q0-18 17-12 0-24 20-16 20-8 20 16 17-6 17 12 0 25-34 40z"/><path d="M50 16v58M31 28l16 48m23-48L53 76M18 39l27 37m37-37L55 76" fill="none" stroke="W"/><circle cx="50" cy="78" r="10" fill="W"/>',
 pirate:'<path d="M12 53q-2-19 19-20 18-36 38 0 21 1 19 20z" fill="D"/><path d="M18 56h64v12H18z"/><path d="m32 80 36-16m-36 0 36 16" stroke="W"/><circle cx="50" cy="39" r="10" fill="W"/><circle cx="46" cy="37" r="2" fill="D"/><circle cx="54" cy="37" r="2" fill="D"/><path d="M46 48h8" stroke="W"/>',
 map:'<path d="m10 25 25-10 29 8 25-10v62L64 87l-29-8-25 10z"/><path d="M35 17v62m29-55v61" stroke="W"/><path d="M20 64q10-35 24-13t28-11" fill="none" stroke="D" stroke-dasharray="4 5"/><path d="m68 28 13 14m-12 0 11-15" fill="none" stroke="#ec675d"/>',
 lion:'<path d="m50 8 11 9 14-1 4 13 12 8-5 14 4 14-13 7-5 14-14-2-10 9-11-9-15 1-4-14-12-8 4-14-3-14 13-7 4-14 15 3z" fill="A"/><circle cx="50" cy="49" r="27"/><circle cx="39" cy="45" r="3" fill="D"/><circle cx="61" cy="45" r="3" fill="D"/><path d="m44 55 6 6 6-6zM38 63q12 12 24 0" fill="W"/>',
 elephant:'<ellipse cx="28" cy="46" rx="20" ry="26" fill="A"/><ellipse cx="73" cy="46" rx="20" ry="26" fill="A"/><path d="M29 49Q22 14 50 14q28 0 21 35L59 65v14q13 10 18-5 5 22-16 21-17-2-16-20V57z"/><circle cx="39" cy="43" r="3" fill="D"/><circle cx="62" cy="43" r="3" fill="D"/><path d="m31 56 7 16 4-16m20 1 4 14 5-18" fill="W"/>',
 snow:'<path d="M50 8v84M14 29l72 42M14 71l72-42M39 17l11 11 11-11M39 83l11-11 11 11M15 43l16-4-4-16m46 54-4-16 16-4M15 57l16 4-4 16m46-54-4 16 16 4" fill="none" stroke="P" stroke-width="7"/>',
 gift:'<path d="M18 43h64v43H18zM12 31h76v16H12z"/><path d="M43 32h14v54H43z" fill="A"/><path d="M48 30Q15 32 27 15q11-10 23 15zm4 0q33 2 21-15-11-10-23 15z" fill="W"/>',
 candy:'<path d="m25 36-18-9 7 24-7 22 22-9m44-28 20-9-7 24 7 22-22-9" fill="A"/><rect x="22" y="29" width="55" height="44" rx="20"/><path d="m33 33 29 36m-14-38 24 30M26 44l22 27" stroke="W" stroke-width="8"/>',
 moon:'<path d="M71 15Q27 8 18 44 8 82 51 91q21 3 34-16-34 10-43-20-8-25 29-40z"/><path d="m73 29 4 11 12 3-10 8v12l-10-7-12 4 4-12-8-9 13-1z" fill="W"/>',
 hero:'<path d="m50 10 35 14-4 39-31 28L19 63l-4-39z"/><path d="m54 24-23 30h19l-5 24 26-35H53z" fill="W"/>',
 robot:'<rect x="19" y="24" width="62" height="50" rx="12"/><path d="M50 24V12M12 37H5v25h14m62-25h14v25H81M31 74v14m38-14v14" fill="none"/><circle cx="50" cy="10" r="5" fill="A"/><rect x="28" y="34" width="44" height="22" rx="7" fill="D"/><circle cx="39" cy="45" r="4" fill="W"/><circle cx="61" cy="45" r="4" fill="W"/><path d="M37 64h26" stroke="W"/>',
 submarine:'<rect x="10" y="38" width="73" height="38" rx="19"/><path d="M41 38V20h21v10H51v8m32 11 12-9v33L83 65" fill="A"/><circle cx="29" cy="57" r="8" fill="W"/><circle cx="52" cy="57" r="8" fill="W"/><path d="M26 76v7h38v-7" fill="none"/>',
 plane:'<path d="M46 12q4-11 8 0l4 26 33 21v10L57 58l-2 22 12 8v6l-17-5-17 5v-6l12-8-2-22L9 69V59l33-21z"/><path d="M47 23h6v18h-6z" fill="W"/>',
 train:'<path d="M20 56V24h30v32h30V41h9v30H14V56z"/><path d="M25 29h20v19H25z" fill="W"/><path d="M61 55V29h10v26M56 29h20v-8H56z" fill="A"/><circle cx="28" cy="73" r="11" fill="D"/><circle cx="64" cy="73" r="11" fill="D"/><path d="M12 88h78" fill="none"/><path d="M68 15q7-15 17-6" fill="none" stroke="W"/>',
 crane:'<path d="M27 18h12v70H27zM12 18h77v12H12z"/><path d="m29 30 10 12-10 12 10 12-10 12M42 18 32 6 18 18M75 30v28q15 6 3 17" fill="none"/><path d="M18 87h31v7H18z" fill="A"/>',
 firetruck:'<path d="M11 42h48V31h19l12 22v20H11z"/><path d="M65 37h10l9 17H65z" fill="W"/><path d="M18 28h39v10H18zM22 48v17m10-17v17m10-17v17" fill="none" stroke="W"/><circle cx="29" cy="73" r="11" fill="D"/><circle cx="74" cy="73" r="11" fill="D"/><path d="M61 26h13" stroke="#fb7070" stroke-width="7"/>',
 magnifier:'<circle cx="40" cy="40" r="27"/><circle cx="40" cy="40" r="19" fill="W"/><path d="m61 58 27 25-8 8-27-26z" fill="A"/><path d="M29 31q11-13 23-1" fill="none" stroke="P"/>',
 music:'<path d="M31 69V27l49-12v45M31 37l49-12" fill="none" stroke="P" stroke-width="9"/><ellipse cx="21" cy="72" rx="14" ry="10" transform="rotate(-20 21 72)"/><ellipse cx="70" cy="63" rx="14" ry="10" transform="rotate(-20 70 63)"/><path d="m14 21 3 8 9 2-7 6v9l-7-5-9 2 3-8-5-7 9-1z" fill="A"/>',
 tower:'<path d="M29 27V12h10v9h8v-9h10v9h8v-9h9v15l-6 7 7 53H25l10-53z"/><path d="M43 87V67q8-12 15 0v20" fill="D"/><path d="M43 39h15v11H43z" fill="W"/><path d="M13 87q-9-20 3-36m-1 19-10-7m10 1 10-7m63 30q9-20-3-36m1 19 10-7m-10 1-10-7" fill="none" stroke="A"/>'
};
export function iconSvg(icon, colors=['#ddba72','#996ec5','#fff2d7','#645082']){
 const replacements={P:colors[0],A:colors[1],W:colors[2]||'#fff4df',D:colors[3]||'#514468'};
 let body=ICONS[icon]||ICONS.crown;
 body=body.replace(/="([PAWD])"/g,(_,key)=>`="${replacements[key]}"`);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x2=".5" y2="1"><stop stop-color="${colors[2]||'#fff9e8'}"/><stop offset=".45" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><g fill="url(#g)" stroke="${colors[3]||'#514468'}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
}
export function iconUrl(icon,colors){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(iconSvg(icon,colors));}
export const FONT_PICKS=['gl-kupiura-bold','gl-mkafio-regular','gl-parizuli-bold','gl-dumbadze-garnituri-semi-bold','gl-venuri-bold','gl-gordeziani-bold','gl-chonchkhi-regular'];
export const PRESETS=Array.from({length:100},(_,i)=>{const t=THEMES[i%30],v=Math.floor(i/30);return {id:`idea-${i+1}`,name:`${t.name} · ${['კლასიკა','ბზინვარება','ფერადი ამბავი','ფანტაზია'][v]}`,theme:t.id,palette:t.palettes[v%t.palettes.length],material:t.materials[v%t.materials.length],shape:SHAPES[(i+v)%5],font:FONT_PICKS[(i+v*2)%FONT_PICKS.length],rainbow:v===2,seed:((i+1)*7919)%100000};});
export const getTheme=id=>THEMES.find(t=>t.id===id)||THEMES[4];
export const getPalette=id=>PALETTES.find(p=>p.id===id)||PALETTES[0];
export const getMaterial=id=>MATERIALS.find(m=>m.id===id)||MATERIALS[0];
