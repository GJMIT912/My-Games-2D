const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
canvas.width=800; canvas.height=600;

const menu=document.getElementById("menu");
const finalScore=document.getElementById("finalScore");

function img(s){let i=new Image();i.src=s;return i;}

/* 🔊 SAFE SOUND FUNCTION (FREEZE FIX) */
function playSound(s){
 if(!s) return;
 try{
  s.pause();
  s.currentTime=0;
  s.play();
 }catch(e){}
}

const bg=[img("assets/images/background1.png"),img("assets/images/background2.png")];
let bgImg=bg[Math.random()*2|0];

const playerImg=img("assets/images/player1.png");
const enemyImg=Array.from({length:9},(_,i)=>img(`assets/images/enemy${i+1}.png`));
const bulletImg=img("assets/images/playerfire.png");
const eBulletImg=img("assets/images/enemyfire.png");
const shieldImg=img("assets/images/shield1.png");
const healthImg=img("assets/images/health1.png");
const tripleImg=img("assets/images/tripleammo.png");

const snd={
 pf:new Audio("assets/sounds/playerfire.ogg"),
 ef:new Audio("assets/sounds/enemyfire.ogg"),
 go:new Audio("assets/sounds/gameover.ogg"),
 sh:new Audio("assets/sounds/shield1.ogg"),
 he:new Audio("assets/sounds/health1.ogg"),
 tr:new Audio("assets/sounds/tripleammo.ogg")
};

let keys={},score=0,over=false;

let player={x:360,y:520,w:50,h:50,hp:50,shield:false,triple:false};
let bullets=[],eb=[],enemies=[],drops=[];

document.addEventListener("keydown",e=>keys[e.key]=true);
document.addEventListener("keyup",e=>keys[e.key]=false);

/* MOBILE CONTROLS */
["pointerdown","pointerup","pointerleave"].forEach(ev=>{
 leftBtn.addEventListener(ev,()=>keys.ArrowLeft=ev==="pointerdown");
 rightBtn.addEventListener(ev,()=>keys.ArrowRight=ev==="pointerdown");
});

function spawn(){
 for(let i=0;i<5;i++){
  enemies.push({
   x:Math.random()*720,
   y:Math.random()*200,
   w:45,h:45,hp:2,
   img:enemyImg[Math.random()*enemyImg.length|0],
   d:Math.random()>0.5?2:-2
  });
 }
}
spawn();

function shoot(){
 playSound(snd.pf);
 if(player.triple){
  [-12,0,12].forEach(o=>bullets.push({x:player.x+22+o,y:player.y}));
 }else{
  bullets.push({x:player.x+22,y:player.y});
 }
}

function hit(a,b){
 if(!a||!b) return false;
 return a.x<b.x+b.w && a.x+10>b.x && a.y<b.y+b.h && a.y+10>b.y;
}

function loop(){
 if(over) return;

 if(keys.ArrowLeft&&player.x>0)player.x-=5;
 if(keys.ArrowRight&&player.x<750)player.x+=5;
 if(keys[" "]&&Math.random()<0.1)shoot();

 for(let i=bullets.length-1;i>=0;i--) bullets[i].y-=8;
 for(let i=eb.length-1;i>=0;i--) eb[i].y+=5;

 enemies.forEach(e=>{
  e.x+=e.d;
  if(e.x<0||e.x>755)e.d*=-1;
  if(Math.random()<0.01){
   playSound(snd.ef);
   eb.push({x:e.x+20,y:e.y+40});
  }
 });

 /* COLLISION (SAFE) */
 for(let i=bullets.length-1;i>=0;i--){
  let hitDone=false;
  for(let j=enemies.length-1;j>=0;j--){
   if(hit(bullets[i],enemies[j])){
    enemies[j].hp--;
    hitDone=true;
    if(enemies[j].hp<=0){
     score+=5;
     if(Math.random()<0.4){
      drops.push({
       x:enemies[j].x,
       y:enemies[j].y,
       t:["shield","health","triple"][Math.random()*3|0]
      });
     }
     enemies.splice(j,1);
    }
    break;
   }
  }
  if(hitDone) bullets.splice(i,1);
 }

 for(let i=eb.length-1;i>=0;i--){
  if(hit(eb[i],player)){
   eb.splice(i,1);
   if(!player.shield){
    player.hp-=10;
    if(player.hp<=0){
     over=true;
     playSound(snd.go);
     menu.style.display="flex";
     finalScore.innerText="Score : "+score;
    }
   }
  }
 }

 for(let i=drops.length-1;i>=0;i--){
  drops[i].y+=2;
  if(hit(drops[i],player)){
   if(drops[i].t==="shield"){
    playSound(snd.sh);
    player.shield=true;
    setTimeout(()=>player.shield=false,5000);
   }
   if(drops[i].t==="health"){
    playSound(snd.he);
    player.hp=Math.min(50,player.hp+[10,15,20][Math.random()*3|0]);
   }
   if(drops[i].t==="triple"){
    playSound(snd.tr);
    player.triple=true;
    setTimeout(()=>player.triple=false,8000);
   }
   drops.splice(i,1);
  }
 }

 if(enemies.length===0)spawn();

 draw();
 requestAnimationFrame(loop);
}

function draw(){
 ctx.drawImage(bgImg,0,0,800,600);
 ctx.drawImage(playerImg,player.x,player.y,50,50);

 if(player.shield){
  ctx.strokeStyle="white";
  ctx.lineWidth=3;
  ctx.strokeRect(player.x-6,player.y-6,62,62);
 }

 bullets.forEach(b=>ctx.drawImage(bulletImg,b.x,b.y,10,20));
 eb.forEach(b=>ctx.drawImage(eBulletImg,b.x,b.y,10,20));
 enemies.forEach(e=>ctx.drawImage(e.img,e.x,e.y,45,45));
 drops.forEach(d=>{
  let i=d.t==="shield"?shieldImg:d.t==="health"?healthImg:tripleImg;
  ctx.drawImage(i,d.x,d.y,30,30);
 });

 ctx.fillStyle="white";
 ctx.font="24px Arial";
 ctx.fillText("SCORE : "+score,600,30);

 ctx.font="16px Arial";
 ctx.fillText("HP",20,28);
 ctx.strokeRect(45,15,140,12);
 ctx.fillStyle="lime";
 ctx.fillRect(45,15,140*(player.hp/50),12);
}

loop();