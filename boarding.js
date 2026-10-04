 'use strict';
let boarding=null;
const boardingTerrain={areas:[[[470,170],[1050,170],[1200,850],[330,850]]],blockers:[]};
function startBoarding(){
 if(boarding||!canBoardShip())return;
 boarding={player,enemies,particles,over,victoryPending,toastTime,slash,shake};
 player={x:770,y:730,hp:100,sp:100,dir:1,face:{x:0,y:-1},inv:1,cool:0,roll:0,rollDir:1,rollFace:{x:0,y:-1},walk:0,gold:0,attack:0,attackHit:false,attackDir:1};
 enemies=[[605,530,false],[930,480,false],[770,330,true]].map(([x,y,boss])=>({x,y,home:{x,y},hp:boss?240:70,max:boss?240:70,boss,spriteType:boss?'guard':'pirate',dir:0,attack:0,attackHit:false,attackDir:0,cool:1.3,flash:0,walk:0}));
 particles=[];slash=0;shake=0;paused=false;over=false;victoryPending=false;keys.clear();navalKeys.clear();navalHeld=false;resetNavalStick();joyEnd();
 document.getElementById('game').classList.add('boarding');document.getElementById('naval').hidden=true;document.getElementById('overlay').hidden=true;
 document.getElementById('chapter-number').textContent='BOARDING ACTION';document.getElementById('island-name').textContent='Blackwake’s flagship';document.getElementById('quest-region').textContent='CAPTURE THE FLAGSHIP';
 notify('Defeat the two deck guards, then Captain Blackwake. J: slash · Space: roll.',6);updateHud();canvas.focus();
}
function updateBoardingHud(){
 const alive=enemies.filter(e=>!e.boss&&e.hp>0).length,boss=enemies.find(e=>e.boss);
 document.getElementById('hp').style.width=player.hp+'%';document.getElementById('sp').style.width=player.sp+'%';document.getElementById('stats').textContent=Math.ceil(player.hp)+' / 100 HP';document.getElementById('coins').textContent='BOARDING CREW';
 document.getElementById('quest').textContent=alive?'Defeat the two deck guards.':'Defeat Captain Blackwake.';
 document.getElementById('progress').textContent=alive?(2-alive)+' / 2 guards defeated':'Captain · '+Math.ceil(boss.hp)+' / '+boss.max+' HP';
}
function finishBoarding(won){
 if(!boarding)return;const prior=boarding;boarding=null;player=prior.player;enemies=prior.enemies;particles=prior.particles;over=prior.over;victoryPending=prior.victoryPending;toastTime=prior.toastTime;slash=prior.slash;shake=prior.shake;paused=true;
 keys.clear();navalKeys.clear();navalHeld=false;joyEnd();resetNavalStick();document.getElementById('game').classList.remove('boarding');document.getElementById('overlay').hidden=true;
 document.getElementById('chapter-number').textContent='CHAPTER 0'+(currentLevel+1);document.getElementById('island-name').textContent=islands[currentLevel].name;document.getElementById('quest-region').textContent=islands[currentLevel].region;updateHud();
 document.getElementById('naval').hidden=false;naval.shots=[];if(won){naval.captured=true;const boss=naval.enemies.find(e=>e.boss);if(boss)boss.hp=0;}
 endNavalBattle(won);document.getElementById('naval-result-title').textContent=won?'Blackwake’s flagship is yours.':'The boarding party was defeated.';document.getElementById('naval-result-text').textContent=won?'Captain Blackwake has fallen. You captured the flagship and won the sea battle.':'Your island progress is safe. Retry the sea battle to challenge Blackwake again.';
}
document.getElementById('boarding-retreat').onclick=()=>finishBoarding(false);
