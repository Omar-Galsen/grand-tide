const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const hpBar=document.getElementById("hpBar"),hpText=document.getElementById("hpText"),goldEl=document.getElementById("gold"),objectiveEl=document.getElementById("objectiveText"),messageEl=document.getElementById("message");
const keys={}; let paused=false,last=performance.now(),kills=0,gold=0,bossSpawned=false,won=false;
const player={x:640,y:420,r:18,hp:100,maxHp:100,speed:230,attackCd:0,rollCd:0,rolling:0,invuln:0,dirX:0,dirY:1};
const enemies=[
  {x:410,y:300,r:17,hp:45,maxHp:45,speed:72,name:"Port Pirate",boss:false,alive:true,hitCd:0},
  {x:760,y:270,r:17,hp:45,maxHp:45,speed:72,name:"Port Pirate",boss:false,alive:true,hitCd:0},
  {x:880,y:470,r:17,hp:45,maxHp:45,speed:72,name:"Port Pirate",boss:false,alive:true,hitCd:0}
];
const boat={x:1090,y:555,w:110,h:56};

function resize(){const rect=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*d);canvas.height=Math.round(rect.width*9/16*d);ctx.setTransform(canvas.width/1280,0,0,canvas.height/720,0,0)}
addEventListener("resize",resize);resize();

addEventListener("keydown",e=>{keys[e.code]=true;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();});
addEventListener("keyup",e=>keys[e.code]=false);
document.querySelectorAll("[data-key]").forEach(b=>{
  const code=b.dataset.key;
  const on=e=>{e.preventDefault();keys[code]=true};
  const off=e=>{e.preventDefault();keys[code]=false};
  b.addEventListener("pointerdown",on); b.addEventListener("pointerup",off); b.addEventListener("pointercancel",off); b.addEventListener("pointerleave",off);
});
document.getElementById("pauseBtn").onclick=()=>{paused=!paused;document.getElementById("pauseBtn").textContent=paused?"▶ Resume":"Ⅱ Pause"};

function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function updateHud(){
  hpBar.style.width=(100*player.hp/player.maxHp)+"%";hpText.textContent=`${Math.ceil(player.hp)} / ${player.maxHp} HP`;goldEl.textContent=gold+" gold";
  if(won)objectiveEl.textContent="Windward Island conquered. Board your ship.";
  else if(bossSpawned)objectiveEl.textContent="Captain Redwake has appeared — defeat him!";
  else objectiveEl.textContent=`Defeat the 3 port pirates. ${kills} / 3 scouts defeated`;
}
function attack(){
  if(player.attackCd>0)return;player.attackCd=.38;
  enemies.forEach(e=>{if(e.alive&&dist(player,e)<78){e.hp-=e.boss?26:32;if(e.hp<=0){e.alive=false;gold+=e.boss?100:25;if(e.boss){won=true;messageEl.textContent="Captain Redwake defeated! The sea route is open — board your ship."}else kills++;}}});
}
function roll(){
  if(player.rollCd>0)return;player.rollCd=1.15;player.rolling=.23;player.invuln=.38;
}
function spawnBoss(){
  if(bossSpawned||kills<3)return;bossSpawned=true;enemies.push({x:640,y:185,r:27,hp:150,maxHp:150,speed:92,name:"Captain Redwake",boss:true,alive:true,hitCd:0});messageEl.textContent="⚑ Captain Redwake has entered the port!";
}
function interact(){
  if(!won)return;
  const cx=boat.x+boat.w/2,cy=boat.y+boat.h/2;
  if(Math.hypot(player.x-cx,player.y-cy)<110) messageEl.textContent="⛵ Boat Battle unlocked — next voyage ready for expansion.";
}
function update(dt){
  if(paused)return;
  player.attackCd=Math.max(0,player.attackCd-dt);player.rollCd=Math.max(0,player.rollCd-dt);player.rolling=Math.max(0,player.rolling-dt);player.invuln=Math.max(0,player.invuln-dt);
  let dx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),dy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
  const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;if(dx||dy){player.dirX=dx;player.dirY=dy}
  if(keys.KeyJ){attack();keys.KeyJ=false} if(keys.Space){roll();keys.Space=false} if(keys.KeyE){interact();keys.KeyE=false}
  const sp=player.speed*(player.rolling>0?2.45:1);player.x=clamp(player.x+dx*sp*dt,75,1205);player.y=clamp(player.y+dy*sp*dt,120,650);
  enemies.forEach(e=>{
    if(!e.alive)return;e.hitCd=Math.max(0,e.hitCd-dt);
    const d=dist(player,e),vx=(player.x-e.x)/(d||1),vy=(player.y-e.y)/(d||1);
    if(d<260&&d>e.r+player.r+7){e.x+=vx*e.speed*dt;e.y+=vy*e.speed*dt}
    if(d<e.r+player.r+10&&e.hitCd<=0&&player.invuln<=0){player.hp=Math.max(0,player.hp-(e.boss?18:10));e.hitCd=.8;player.invuln=.45;if(player.hp<=0){player.hp=100;player.x=640;player.y=600;messageEl.textContent="You were defeated and washed back ashore.";}}
  });
  spawnBoss();updateHud();
}
function diamond(x,y,w,h,fill,stroke){ctx.beginPath();ctx.moveTo(x,y-h/2);ctx.lineTo(x+w/2,y);ctx.lineTo(x,y+h/2);ctx.lineTo(x-w/2,y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function draw(){
  ctx.clearRect(0,0,1280,720);
  ctx.fillStyle="#174e61";ctx.fillRect(0,0,1280,720);
  diamond(640,385,1090,560,"#c7a969","#dbc889");
  ctx.fillStyle="#6e8f55";ctx.beginPath();ctx.ellipse(640,350,390,190,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#806545";ctx.fillRect(330,225,620,58);ctx.fillStyle="#d5bb82";for(let i=0;i<9;i++)ctx.fillRect(345+i*72,235,52,38);
  ctx.fillStyle="#263b42";ctx.fillRect(570,150,140,80);ctx.fillStyle="#8a342e";ctx.fillRect(620,105,40,48);
  for(let i=0;i<14;i++){const x=180+(i*83)%930,y=160+((i*57)%390);ctx.fillStyle="#3b692f";ctx.beginPath();ctx.arc(x,y,16,0,7);ctx.fill();ctx.fillStyle="#674733";ctx.fillRect(x-3,y+12,6,20)}
  ctx.fillStyle="#583b27";ctx.fillRect(boat.x,boat.y,boat.w,boat.h);ctx.fillStyle="#ead7a5";ctx.beginPath();ctx.moveTo(boat.x+55,boat.y-72);ctx.lineTo(boat.x+55,boat.y+10);ctx.lineTo(boat.x+105,boat.y-5);ctx.closePath();ctx.fill();
  ctx.fillStyle="#f2d66b";ctx.font="bold 14px system-ui";ctx.fillText("BOAT BATTLE",boat.x-4,boat.y-82);
  enemies.forEach(e=>{if(!e.alive)return;ctx.fillStyle=e.boss?"#7d1f26":"#452b2b";ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,7);ctx.fill();ctx.fillStyle="#eee";ctx.font="12px system-ui";ctx.textAlign="center";ctx.fillText(e.name,e.x,e.y-e.r-17);ctx.fillStyle="#321818";ctx.fillRect(e.x-28,e.y-e.r-11,56,5);ctx.fillStyle="#d95a55";ctx.fillRect(e.x-28,e.y-e.r-11,56*(e.hp/e.maxHp),5)});
  ctx.save();ctx.translate(player.x,player.y);ctx.fillStyle=player.invuln>0?"#fff1ad":"#1e5d8b";ctx.beginPath();ctx.arc(0,0,player.r,0,7);ctx.fill();ctx.strokeStyle="#d9edf7";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(player.dirX*10,player.dirY*10);ctx.lineTo(player.dirX*31,player.dirY*31);ctx.stroke();if(player.attackCd>.18){ctx.strokeStyle="#f8e6a7";ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,48,-1.2,1.2);ctx.stroke()}ctx.restore();
  ctx.textAlign="left";
  if(paused){ctx.fillStyle="rgba(0,0,0,.55)";ctx.fillRect(0,0,1280,720);ctx.fillStyle="#fff";ctx.font="bold 42px system-ui";ctx.textAlign="center";ctx.fillText("PAUSED",640,360)}
}
function loop(t){const dt=Math.min(.033,(t-last)/1000);last=t;update(dt);draw();requestAnimationFrame(loop)}updateHud();requestAnimationFrame(loop);
