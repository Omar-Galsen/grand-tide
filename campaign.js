'use strict';
const islands=[
 {name:'Windward Island',region:'THE FIRST VOYAGE',theme:'windward',enemyType:'pirate',enemyName:'Port pirates',image:'assets/mountain-windward.png',captain:'Captain Redwake',scouts:3,scoutHP:65,bossHP:180,damage:0,description:'Climb the mountain valley and break Redwake’s hold on the high pass.'},
 {name:'Verdant Ruins',region:'THE EMERALD REACH',theme:'jungle',enemyType:'raider',enemyName:'Jungle raiders',image:'assets/mountain-jungle.png',captain:'Captain Thorn',scouts:4,scoutHP:75,bossHP:220,damage:2,description:'Follow the jungle saddle around the mountain to reach the temple.'},
 {name:'Cinder Cay',region:'THE ASHEN WATERS',theme:'volcano',enemyType:'corsair',enemyName:'Ember corsairs',image:'assets/mountain-volcano.png',captain:'Captain Ashfang',scouts:5,scoutHP:85,bossHP:260,damage:4,description:'Circle the volcanic crater and defeat the raiders on its rim.'},
 {name:'Crownfall Keep',region:'THE FINAL CONQUEST',theme:'fortress',enemyType:'guard',enemyName:'Royal guards',image:'assets/mountain-fortress.png',captain:'Admiral Ironcrown',scouts:6,scoutHP:95,bossHP:310,damage:6,description:'Fight up the switchback terraces to the admiral’s mountain fortress.'}
];
const campaignKey='grand-tide-conquest-v1';
let conquered=0,currentLevel=0,victoryPending=false,saveAvailable=true,voyage=null,voyageFrame=0;
try{const saved=JSON.parse(localStorage.getItem(campaignKey)||'null');if(saved&&saved.version===1){conquered=Math.max(0,Math.min(4,Number.isInteger(saved.conquered)?saved.conquered:0));currentLevel=Math.max(0,Math.min(3,conquered,Number.isInteger(saved.currentLevel)?saved.currentLevel:0));}}catch{saveAvailable=false;}
function saveCampaign(){try{localStorage.setItem(campaignKey,JSON.stringify({version:1,conquered,currentLevel}));}catch{saveAvailable=false;}}
function unlockedIsland(index){return Number.isInteger(index)&&index>=0&&index<islands.length&&index<=conquered;}
function renderCampaign(){
 drawSeaRoute(document.getElementById("sea-route-map"),"chart",true);
 const list=document.getElementById('island-route');list.replaceChildren();
 document.getElementById('campaign-count').textContent=conquered+' / '+islands.length+' islands conquered';
 document.getElementById('campaign-heading').textContent=conquered===4?'The archipelago is yours.':'Choose your next conquest.';
 document.getElementById('campaign-intro').textContent=conquered===4?'Every captain has fallen. Return to any island to fight again.':'Defeat the scouts, challenge the captain, and raise your flag. Each victory opens the next island.';
 document.getElementById('save-note').textContent=saveAvailable?'Conquest progress is saved on this device. Battles restart when you sail.':'Progress stays available for this session. Browser storage is unavailable.';
 islands.forEach((island,index)=>{
  const unlocked=unlockedIsland(index),done=index<conquered;
  const card=document.createElement('article');card.className='island-card '+island.theme+(unlocked?'':' locked');
  card.innerHTML=`<div class="island-art"><img src="${island.image}" alt="${island.name} island landscape"><span class="level-number">0${index+1}</span><span class="island-state">${done?'⚑ CONQUERED':unlocked?'READY TO SAIL':'LOCKED'}</span></div><div class="island-info"><small>${island.region}</small><h3>${island.name}</h3><p>${island.description}</p><div class="island-foes">${island.scouts} ${island.enemyName.toLowerCase()} · ${island.captain}</div></div>`;
  const button=document.createElement('button');button.type='button';button.disabled=!unlocked;button.textContent=done?'Replay island':unlocked?'Sail to new island':'Conquer '+islands[index-1].name;button.addEventListener('click',()=>sailToIsland(index));card.append(button);list.append(card);
 });
}
function openCampaign(){
 if(!player||voyage)return;paused=true;keys.clear();joyEnd();document.getElementById('overlay').hidden=true;renderCampaign();document.getElementById('campaign').hidden=false;document.getElementById('campaign-close').focus();
}
function closeCampaign(){if(voyage)return;document.getElementById('campaign').hidden=true;paused=false;over=false;victoryPending=false;keys.clear();canvas.focus();}
function sailToIsland(index){
 if(voyage||!unlockedIsland(index))return false;
 if(index===currentLevel){reset();canvas.focus();return true;}
 paused=true;keys.clear();joyEnd();document.getElementById('overlay').hidden=true;document.getElementById('campaign').hidden=true;
 voyage={from:currentLevel,to:index,started:null};
 document.getElementById('voyage-title').textContent='Sailing to '+islands[index].name;
 document.getElementById('voyage-subtitle').textContent=islands[currentLevel].name+' → '+islands[index].name;
 document.getElementById('voyage-progress').value=0;
 document.getElementById('voyage').hidden=false;
 drawSeaRoute(document.getElementById('voyage-map'),'voyage',false);
 document.getElementById('skip-voyage').focus();
 voyageFrame=requestAnimationFrame(animateVoyage);return true;
}
function finishVoyage(){
 if(!voyage)return;if(!voyage.battleCleared){startNavalBattle();return;}const destination=voyage.to;voyage=null;cancelAnimationFrame(voyageFrame);
 document.getElementById('voyage').hidden=true;currentLevel=destination;saveCampaign();reset();canvas.focus();
 notify('Arrived at '+islands[destination].name+' · '+islands[destination].enemyName+' await.',5);
}
const seaNodes=[[115,235],[340,120],[565,235],[790,120]];
const seaPaths=['M115 235 C190 235 230 120 340 120','M340 120 C430 120 465 235 565 235','M565 235 C655 235 685 120 790 120'];
function drawSeaRoute(container,prefix,interactive){
 const nodes=islands.map((island,index)=>{const [x,y]=seaNodes[index],active=unlockedIsland(index);return `<g class="sea-stop ${active?'':'sea-locked'}" ${interactive?`role="button" tabindex="${active?0:-1}" aria-label="Sail to ${island.name}" aria-disabled="${!active}" data-island="${index}"`:''}><circle cx="${x}" cy="${y}" r="51" fill="#173f4c" stroke="${index<conquered?'#f0cc83':'#589299'}" stroke-width="3"/><image href="${island.image}" x="${x-48}" y="${y-48}" width="96" height="96" preserveAspectRatio="xMidYMid slice" clip-path="url(#${prefix}-clip-${index})"/><text x="${x}" y="${y+79}" text-anchor="middle" class="sea-label">${island.name}</text><text x="${x}" y="${y+102}" text-anchor="middle" class="sea-status">${index<conquered?'CONQUERED':active?'UNLOCKED':'LOCKED'}</text></g>`;}).join('');
 container.innerHTML=`<svg viewBox="0 0 910 365" class="sea-svg" aria-label="Travel route between the four islands"><defs>${seaNodes.map(([x,y],i)=>`<clipPath id="${prefix}-clip-${i}"><circle cx="${x}" cy="${y}" r="48"/></clipPath>`).join('')}</defs>${seaPaths.map((d,i)=>`<path id="${prefix}-path-${i}" d="${d}" class="sea-path"/>`).join('')}${nodes}<g id="${prefix}-ship" transform="translate(${seaNodes[currentLevel].join(' ')})"><circle r="24" fill="#082d3f" stroke="#ffe09b" stroke-width="2"/><text text-anchor="middle" dominant-baseline="central" font-size="29">⛵</text></g></svg>`;
 if(interactive)container.querySelectorAll('[data-island]').forEach(node=>{const activate=()=>sailToIsland(Number(node.dataset.island));node.addEventListener('click',activate);node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});});
}
function animateVoyage(timestamp){
 if(!voyage)return;if(voyage.started===null)voyage.started=timestamp-(voyage.resumeAt||0)*3400;
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const fraction=Math.min(1,(timestamp-voyage.started)/(reduced?250:3400));
 const paths=seaPaths.map((_,i)=>document.getElementById('voyage-path-'+i)),lengths=paths.map(path=>path.getTotalLength()),offsets=[0];
 for(const length of lengths)offsets.push(offsets[offsets.length-1]+length);
 const ease=fraction*fraction*(3-2*fraction);let distance=offsets[voyage.from]+(offsets[voyage.to]-offsets[voyage.from])*ease,segment=0;
 while(segment<paths.length-1&&distance>lengths[segment])distance-=lengths[segment++];
 const point=paths[segment].getPointAtLength(Math.max(0,distance));document.getElementById('voyage-ship').setAttribute('transform',`translate(${point.x} ${point.y})`);
 document.getElementById('voyage-progress').value=Math.round(fraction*100);
 const viewport=document.getElementById('voyage-map'),svg=viewport.querySelector('svg');if(svg){const ratio=svg.getBoundingClientRect().width/910;viewport.scrollLeft=point.x*ratio-viewport.clientWidth/2;}
 if(fraction>=.45&&!voyage.battleCleared){startNavalBattle();return;}if(fraction>=1){finishVoyage();return;}voyageFrame=requestAnimationFrame(animateVoyage);
}
document.getElementById('skip-voyage').onclick=finishVoyage;
function completeIsland(){
 if(victoryPending)return;victoryPending=true;
 if(currentLevel===conquered)conquered=Math.min(islands.length,conquered+1);saveCampaign();over=true;
 const final=conquered===islands.length;
 showModal(final?'ARCHIPELAGO CONQUERED':'ISLAND CONQUERED',final?'The crown is yours.':islands[currentLevel].name+' is yours.',final?'All four islands fly your flag. Revisit any island from the sea chart.':currentLevel===0?'Redwake is defeated. You claim his ship, and Verdant Ruins is now open.':islands[currentLevel].captain+' is defeated. '+islands[Math.min(3,currentLevel+1)].name+' is now open.','Open sea chart');
 updateHud();
}
document.getElementById('sea-chart').onclick=openCampaign;
document.getElementById('campaign-close').onclick=closeCampaign;
