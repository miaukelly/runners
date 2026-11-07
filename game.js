(() => {
  const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
  const W=1672,H=941,scene=new Image();let bgWidth=W;scene.onload=()=>{bgWidth=scene.naturalWidth*H/scene.naturalHeight};scene.src='assets/scene/backdrop.png';
  const roster=window.ROSTER;
  const loadPool=(pool,folder)=>pool.map(item=>{const frames=window.GIF_FRAMES?.[item.file.replace(/\.gif$/i,'')];return {...item,img:frames?null:Object.assign(new Image(),{src:`assets/${folder}/${item.file}`}),frames:frames?.frames.map(src=>Object.assign(new Image(),{src})),durations:frames?.durations}});
  const imageAt=(item,now)=>{if(!item.frames)return item.img;const cycle=item.durations.reduce((a,b)=>a+b,0);let t=now%cycle;for(let i=0;i<item.frames.length;i++){if(t<item.durations[i])return item.frames[i];t-=item.durations[i]}return item.frames[0]};
  const coinData=window.GIF_FRAMES?.coin,coinAnimation=coinData?{frames:coinData.frames.map(src=>Object.assign(new Image(),{src})),durations:coinData.durations}:null;
  const presentImage=Object.assign(new Image(),{src:'assets/ui/present.png'});
  const runners=loadPool(roster.runners,'runners'),cars=loadPool(roster.cars,'cars');
  const coinsEl=document.querySelector('#coins'),toast=document.querySelector('#toast'),soundButton=document.querySelector('#sound'),currencyElement=document.querySelector('.currency');
  const indexOverlay=document.querySelector('#indexOverlay'),indexContent=document.querySelector('#indexContent'),indexButton=document.querySelector('#openIndex');
  const saved=(()=>{try{return JSON.parse(localStorage.getItem('road-runners-save'))||{coins:0,unlocked:['runner']}}catch{return {coins:0,unlocked:['runner']}}})();
  if(!Array.isArray(saved.unlocked))saved.unlocked=['runner'];
  if(!Array.isArray(saved.unlockedCars))saved.unlockedCars=[];
  let coins=Math.max(0,Number(saved.coins)||0),unlocked=new Set(saved.unlocked),unlockedCars=new Set(saved.unlockedCars),bgOffset=0,last=performance.now(),runnerTimer=1.8,carTimer=3.9,toastTimer=0,soundOn=true,audioReady=false,indexTab='runners',indexOpen=false;
  const carsOnRoad=[],runnersOnRoad=[],presents=[],worldCoins=[];let coinSequence=0,bumpTimer=0;
  const fit=()=>{const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};addEventListener('resize',fit);fit();coinsEl.textContent=coins;
  function persist(){try{localStorage.setItem('road-runners-save',JSON.stringify({coins,unlocked:[...unlocked],unlockedCars:[...unlockedCars]}))}catch{}}
  function bumpCurrency(){currencyElement.classList.remove('bump');void currencyElement.offsetWidth;currencyElement.classList.add('bump');clearTimeout(bumpTimer);bumpTimer=setTimeout(()=>currencyElement.classList.remove('bump'),450)}
  function grantCoins(amount){coins+=amount;coinsEl.textContent=coins;persist();bumpCurrency()}
  function weighted(pool){let n=Math.random()*pool.reduce((s,x)=>s+x.weight,0);for(const item of pool){n-=item.weight;if(n<=0)return item}return pool[pool.length-1]}
  function percent(value){const rounded=Math.round(value*10)/10;return `${Number.isInteger(rounded)?rounded:rounded.toFixed(1)}%`}
  function odds(item,pool){return `${percent(item.weight/pool.reduce((s,x)=>s+x.weight,0)*100)} chance`}
  const rarityOrder=['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
  function renderIndex(){
    const pool=indexTab==='runners'?runners:cars,owned=indexTab==='runners'?unlocked:unlockedCars,folder=indexTab==='runners'?'runners':'cars';
    indexContent.replaceChildren();
    for(const rarity of rarityOrder){
      const items=pool.filter(item=>item.rarity===rarity);if(!items.length)continue;
      const section=document.createElement('section');section.className='rarity-section';
      const groupWeight=items.reduce((sum,item)=>sum+item.weight,0),poolWeight=pool.reduce((sum,item)=>sum+item.weight,0);
      const heading=document.createElement('h2');heading.className='rarity-heading';heading.textContent=`${rarity.toUpperCase()} [${percent(groupWeight/poolWeight*100)} TOTAL]`;section.append(heading);
      const grid=document.createElement('div');grid.className='index-grid';
      for(const item of items){
        const have=owned.has(item.id),card=document.createElement('article');card.className=`index-card${have?'':' locked'}`;
        const image=document.createElement('img');image.src=`assets/${folder}/${item.file}`;image.alt=item.name;image.loading='lazy';if(!have)image.className='locked';
        const name=document.createElement('div');name.className='index-name';name.textContent=item.name;
        const chance=document.createElement('div');chance.className='index-chance';chance.textContent=odds(item,pool);
        card.append(image,name,chance);grid.append(card);
      }
      section.append(grid);indexContent.append(section);
    }
  }
  function setIndex(open){indexOpen=open;indexOverlay.hidden=!open;if(open)renderIndex()}
  indexButton.addEventListener('click',()=>setIndex(true));
  document.querySelector('#closeIndex').addEventListener('click',()=>setIndex(false));
  for(const tab of document.querySelectorAll('.index-tab'))tab.addEventListener('click',()=>{indexTab=tab.dataset.tab;for(const item of document.querySelectorAll('.index-tab')){const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active))}renderIndex()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&indexOpen)setIndex(false)});
  function popToast(item,detail,pool,coinValue=0){toast.querySelector('.toast-rarity').textContent=item.rarity.toUpperCase();toast.querySelector('.toast-name').textContent=item.name;toast.querySelector('.toast-detail').textContent=`${odds(item,pool)}\n${detail}`;toast.style.borderTopColor=({Common:'#b6c4d7',Uncommon:'#7de3b0',Rare:'#72c6ff',Epic:'#c69cff',Legendary:'#ffd36c',Mythic:'#ff7b95'})[item.rarity]||'#fff';toast.classList.add('show');toastTimer=2.6;playRaritySound(item);if(coinValue>0)queueToastCoins(coinValue)}
  const pitch=()=>.84+Math.random()*.34;
  function variedSpeed(base){
    const weights=[50,25,13,7,4,1];let roll=Math.random()*weights.reduce((sum,n)=>sum+n,0),step=0;
    for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<0){step=i;break}}
    const faster=Math.random()<.5,factor=1+(faster?1:-1)*step*.09;
    return {speed:base*factor,fast:faster&&step>=2};
  }
  const sounds={
    engine:new Audio('assets/audio/engineLoop.mp3'),
    running:new Audio('assets/audio/runningLoop.mp3'),
    music:new Audio('assets/audio/music.mp3')
  };
  const loopVolumes={engine:.13,running:.14,music:.08},loopStates={};
  for(const [key,audio] of Object.entries(sounds)){audio.loop=true;audio.volume=0;loopStates[key]={target:null,animation:0};}
  for(const audio of Object.values(sounds)){
    let previous=0;
    audio.addEventListener('timeupdate',()=>{if(audio.currentTime+.15<previous)audio.playbackRate=pitch();previous=audio.currentTime});
  }
  function fadeLoop(key,shouldPlay){
    const audio=sounds[key],state=loopStates[key],target=shouldPlay?loopVolumes[key]:0;
    if(state.target===target)return;
    state.target=target;if(state.animation)cancelAnimationFrame(state.animation);
    if(shouldPlay&&audio.paused){audio.volume=0;audio.playbackRate=pitch();audio.play().catch(()=>{state.target=null})}
    if(!shouldPlay&&audio.paused){audio.volume=0;return}
    const initial=audio.volume,start=performance.now(),duration=480;
    const ramp=now=>{const p=Math.min(1,(now-start)/duration);audio.volume=initial+(target-initial)*p;if(p<1)state.animation=requestAnimationFrame(ramp);else{state.animation=0;if(!shouldPlay)audio.pause()}};
    state.animation=requestAnimationFrame(ramp);
  }
  function syncLoops(){
    const needs={engine:carsOnRoad.length>0,running:runnersOnRoad.some(r=>!r.hit),music:true};
    for(const key of Object.keys(sounds))fadeLoop(key,soundOn&&audioReady&&needs[key]);
  }
  function effect(file,volume){if(!soundOn||!audioReady)return;const audio=new Audio(`assets/audio/${file}`);audio.volume=volume;audio.playbackRate=pitch();audio.play().catch(()=>{});audio.addEventListener('ended',()=>audio.remove(),{once:true})}
  function playRaritySound(item){effect(item.rarity==='Common'||item.rarity==='Uncommon'?'commonItem.mp3':'goodItem.mp3',.42)}
  function queueToastCoins(amount){
    const toastBounds=toast.getBoundingClientRect(),canvasBounds=canvas.getBoundingClientRect(),startX=(toastBounds.left+toastBounds.width/2-canvasBounds.left)*W/canvasBounds.width,startY=(toastBounds.bottom-canvasBounds.top)*H/canvasBounds.height;
    const count=Math.min(3,Math.max(1,Math.ceil(amount/25))),base=Math.floor(amount/count),remainder=amount%count,now=performance.now();
    for(let i=0;i<count;i++)worldCoins.push({id:coinSequence++,lane:0,x:startX+(i-(count-1)/2)*9,y:startY,vx:0,vy:0,gravity:0,floorY:H,size:22,angle:0,spin:1,state:'zip',value:base+(i<remainder?1:0),zipStart:now+i*70,zipDuration:620+Math.random()*180,fromX:startX+(i-(count-1)/2)*9,fromY:startY});
  }
  document.addEventListener('pointerdown',()=>{audioReady=true;syncLoops()},{once:true});
  document.addEventListener('keydown',()=>{audioReady=true;syncLoops()},{once:true});
  soundButton.addEventListener('click',()=>{soundOn=!soundOn;soundButton.classList.toggle('off',!soundOn);syncLoops()});
  function addRunner(now){
    const type=weighted(runners),dir=Math.random()<.5?-1:1,lane=Math.random()<.5?0:1;
    const variation=variedSpeed(215+Math.random()*55);
    const height=116*type.scale,width=height*(type.aspect||1);
    const startX=dir>0?-width-24:W+24,endX=dir>0?W+24:-width-24,dropCount=type.id==='santa'?1+Math.floor(Math.random()*5):0;
    const dropMarks=Array.from({length:dropCount},()=>.12+Math.random()*.76).sort((a,b)=>a-b);
    runnersOnRoad.push({type,dir,lane,x:startX,startX,endX,dropMarks,dropIndex:0,y:lane===0?745:810,vy:0,vx:dir*variation.speed,width,height,fastStart:variation.fast?now:0,fastUntil:variation.fast?now+4500:0,kmh:Math.round(variation.speed*.12),angle:0,spinning:0,passed:false,hit:false,scale:type.scale});
  }
  function addCar(now){
    const type=weighted(cars),dir=Math.random()<.5?-1:1,lane=Math.random()<.5?0:1;
    const height=92*type.scale,width=height*(type.aspect||1),laneCenter=lane===0?811:876,roadY=laneCenter-height/2,variation=variedSpeed(285+Math.random()*85);
    carsOnRoad.push({type,dir,lane,x:dir>0?-width-20:W+20,y:roadY,drawY:roadY,w:width,h:height,vx:dir*variation.speed,fastStart:variation.fast?now:0,fastUntil:variation.fast?now+4500:0,kmh:Math.round(variation.speed*.22),bob:Math.random()*Math.PI*2});
    if(type.id==='catmobile')effect('meow.mp3',.4);
    carTimer=6.5+Math.random()*2.4;
  }
  function drawSpeedLabel(actor,x,y,now){
    if(!actor.fastUntil||now>actor.fastUntil||x<-20||x>W+20)return;
    const clamp=value=>Math.max(0,Math.min(1,value)),easeOut=value=>1-Math.pow(1-value,3);
    const enter=easeOut(clamp((now-actor.fastStart)/300)),leave=easeOut(clamp((actor.fastUntil-now)/520)),alpha=Math.min(enter,leave);
    const scale=(.78+.22*enter)*(.86+.14*leave),text=`${actor.kmh} KM/H`;
    ctx.save();ctx.font='12px "Press Start 2P", monospace';
    const width=ctx.measureText(text).width+16,height=25,left=Math.max(8,Math.min(W-width-8,x-width/2)),top=Math.max(8,y-41),lineX=Math.max(left+8,Math.min(left+width-8,x)),cx=left+width/2,cy=top+height/2;
    ctx.globalAlpha=alpha;ctx.translate(cx,cy);ctx.scale(scale,scale);
    ctx.strokeStyle='#ffe58b';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(lineX-cx,height/2);ctx.lineTo(x-cx,y-cy);ctx.stroke();
    ctx.fillStyle='#101a2de8';ctx.fillRect(-width/2,-height/2,width,height);ctx.strokeStyle='#ffe58b';ctx.lineWidth=1.2;ctx.strokeRect(-width/2,-height/2,width,height);
    ctx.fillStyle='#fff1b5';ctx.textBaseline='middle';ctx.fillText(text,-width/2+8,0);ctx.restore();
  }
  function hit(r,c){return r.x+r.width*.68>c.x+26&&r.x+r.width*.22<c.x+c.w-20&&Math.abs((r.y+r.height*.65)-(c.drawY+c.h*.58))<60}
  function reward(item){return item.rarity==='Common'?5:item.rarity==='Uncommon'?9:item.rarity==='Rare'?16:item.rarity==='Epic'?28:item.rarity==='Legendary'?60:120}
  function dropPresent(r){
    const size=24,presentX=r.dir>0?r.x+r.width*.18:r.x+r.width*.82;
    presents.push({owner:r,lane:r.lane,x:presentX,y:r.y+r.height*.55,vx:(Math.random()-.5)*45,vy:30+Math.random()*35,gravity:700,angle:0,spin:(Math.random()-.5)*3,size,floorY:r.lane===0?827:927,state:'falling'});
  }
  function removePresents(owner){for(let i=presents.length-1;i>=0;i--)if(presents[i].owner===owner)presents.splice(i,1)}
  function releasePresents(owner,now){for(const present of presents)if(present.owner===owner){present.state='opening';present.openStart=now;present.openAt=now+260+Math.random()*180}}
  function spawnCoinsFrom(present){
    const count=1+Math.floor(Math.random()*3);
    for(let i=0;i<count;i++)worldCoins.push({id:coinSequence++,lane:present.lane,x:present.x+(Math.random()-.5)*12,y:present.y-8,vx:(Math.random()-.5)*150,vy:-170-Math.random()*150,gravity:720,floorY:present.floorY,size:22,angle:(Math.random()-.5)*.7,spin:(Math.random()-.5)*7,bounces:0,state:'pop',value:5+Math.floor(Math.random()*46)});
  }
  function counterTarget(){
    const icon=document.querySelector('.coin-image').getBoundingClientRect(),bounds=canvas.getBoundingClientRect();
    return {x:(icon.left+icon.width/2-bounds.left)*W/bounds.width,y:(icon.top+icon.height/2-bounds.top)*H/bounds.height};
  }
  function updateLoot(now,dt){
    for(let i=presents.length-1;i>=0;i--){
      const p=presents[i];
      if(p.state==='falling'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.angle+=p.spin*dt;if(p.y+p.size/2>=p.floorY){p.y=p.floorY-p.size/2;p.vy=0;p.vx*=.45;p.spin=0;p.state='ground'}}
      else if(p.state==='opening'&&now>=p.openAt){spawnCoinsFrom(p);presents.splice(i,1)}
    }
    for(let i=worldCoins.length-1;i>=0;i--){
      const coin=worldCoins[i];
      if(coin.state==='pop'){
        coin.x+=coin.vx*dt;coin.y+=coin.vy*dt;coin.vy+=coin.gravity*dt;coin.angle+=coin.spin*dt;
        if(coin.y+coin.size/2>=coin.floorY){coin.y=coin.floorY-coin.size/2;if(coin.bounces===0&&Math.abs(coin.vy)>55){coin.vy=-Math.abs(coin.vy)*.28;coin.vx*=.55;coin.bounces++}else{coin.vy=0;coin.state='ground';coin.zipAt=now+260+Math.random()*250}}
      }else if(coin.state==='ground'&&now>=coin.zipAt){coin.state='zip';coin.zipStart=now;coin.zipDuration=560+Math.random()*230;coin.fromX=coin.x;coin.fromY=coin.y}
      else if(coin.state==='zip'){
        const t=Math.max(0,Math.min(1,(now-coin.zipStart)/coin.zipDuration)),ease=1-Math.pow(1-t,3),target=counterTarget();coin.x=coin.fromX+(target.x-coin.fromX)*ease;coin.y=coin.fromY+(target.y-coin.fromY)*ease;coin.angle+=(Math.sign(coin.spin)||1)*dt*9;
        if(t>=1){grantCoins(coin.value);worldCoins.splice(i,1)}
      }
    }
  }
  function frame(now){
    const dt=Math.min(.04,(now-last)/1000);last=now;bgOffset=(bgOffset+34*dt)%bgWidth;runnerTimer-=dt;carTimer-=dt;toastTimer-=dt;
    if(toastTimer<=0)toast.classList.remove('show');
    if(runnerTimer<=0){addRunner(now);runnerTimer=5.4+Math.random()*3.4}
    if(carTimer<=0)addCar(now);
    syncLoops();
    ctx.clearRect(0,0,W,H);
    if(scene.complete&&scene.naturalWidth){ctx.drawImage(scene,-bgOffset,0,bgWidth,H);ctx.drawImage(scene,bgWidth-bgOffset,0,bgWidth,H)}
    else{ctx.fillStyle='#4f93dc';ctx.fillRect(0,0,W,H);ctx.fillStyle='#343c50';ctx.fillRect(0,760,W,181)}
    for(let i=carsOnRoad.length-1;i>=0;i--){
      const c=carsOnRoad[i];c.x+=c.vx*dt;c.drawY=c.y+Math.sin(now*.004+c.bob)*3.2;
      if(c.dir>0&&c.x>W+20||c.dir<0&&c.x<-c.w-20){const isNew=!unlockedCars.has(c.type.id);unlockedCars.add(c.type.id);persist();if(isNew)popToast(c.type,'UNLOCKED',cars);if(indexOpen&&indexTab==='cars')renderIndex();carsOnRoad.splice(i,1)}
    }
    for(let i=runnersOnRoad.length-1;i>=0;i--){
      const r=runnersOnRoad[i],rw=r.width,rh=r.height;
      if(!r.hit){
        r.x+=r.vx*dt;
        if(r.type.id==='santa'&&r.dropIndex<r.dropMarks.length){const progress=Math.max(0,Math.min(1,(r.x-r.startX)/(r.endX-r.startX)));while(r.dropIndex<r.dropMarks.length&&progress>=r.dropMarks[r.dropIndex]){dropPresent(r);r.dropIndex++}}
        if((r.dir<0&&r.x<-rw)||(r.dir>0&&r.x>W)){
          r.passed=true;unlocked.add(r.type.id);const prize=reward(r.type);if(r.type.id==='santa')releasePresents(r,now);persist();if(indexOpen&&indexTab==='runners')renderIndex();popToast(r.type,`UNLOCKED +${prize}¢`,runners,prize);runnerTimer=Math.max(runnerTimer,4.3);
        }else for(const c of carsOnRoad){if(hit(r,c)){r.hit=true;removePresents(r);r.fastUntil=0;r.spinning=(Math.random()<.5?-1:1)*(18+Math.random()*22);r.vx=(Math.random()-.5)*1850;r.vy=-1150-Math.random()*650;effect('crash.mp3',.46);popToast(c.type,'TRAFFIC',cars);break}}
      }else{r.x+=r.vx*dt;r.y+=r.vy*dt;r.vy+=1550*dt;r.angle+=r.spinning*dt;if(r.x<-350||r.x>W+350||r.y>H+250){runnersOnRoad.splice(i,1);continue}}
      if(r.passed){runnersOnRoad.splice(i,1);continue}
    }
    updateLoot(now,dt);
    const drawables=[...carsOnRoad.map(actor=>({actor,kind:'car',layer:0})),...runnersOnRoad.map(actor=>({actor,kind:'runner',layer:1})),...presents.map(actor=>({actor,kind:'present',layer:2})),...worldCoins.map(actor=>({actor,kind:'coin',layer:3}))].sort((a,b)=>a.actor.lane-b.actor.lane||a.layer-b.layer);
    for(const {actor,kind} of drawables){
      if(kind==='car'){
        const im=imageAt(actor.type,now);if(im?.complete&&im.naturalWidth){const flip=Boolean(actor.type.flip)!==(actor.dir<0);if(flip){ctx.save();ctx.translate(actor.x+actor.w,actor.drawY);ctx.scale(-1,1);ctx.drawImage(im,0,0,actor.w,actor.h);ctx.restore()}else ctx.drawImage(im,actor.x,actor.drawY,actor.w,actor.h)}
        drawSpeedLabel(actor,actor.x+actor.w/2,actor.drawY+12,now);
      }else if(kind==='runner'){
        const rw=actor.width,rh=actor.height;ctx.save();ctx.translate(actor.x+rw/2,actor.y+rh/2);ctx.rotate(actor.angle);if(Boolean(actor.type.flip)!==(actor.dir<0))ctx.scale(-1,1);const im=imageAt(actor.type,now);if(im?.complete&&im.naturalWidth)ctx.drawImage(im,-rw/2,-rh/2,rw,rh);ctx.restore();
        drawSpeedLabel(actor,actor.x+rw/2,actor.y+24,now);
      }else if(kind==='present'){
        let scale=1;if(actor.state==='opening'){const t=Math.min(1,(now-actor.openStart)/(actor.openAt-actor.openStart));scale=1+.35*Math.sin(t*Math.PI)}
        if(presentImage.complete&&presentImage.naturalWidth){ctx.save();ctx.translate(actor.x,actor.y);ctx.rotate(actor.angle);ctx.drawImage(presentImage,-actor.size*scale/2,-actor.size*scale/2,actor.size*scale,actor.size*scale);ctx.restore()}
      }else{
        const im=coinAnimation?imageAt(coinAnimation,now):document.querySelector('.coin-image');
        if(im?.complete&&im.naturalWidth){const t=actor.state==='zip'?Math.min(1,(now-actor.zipStart)/actor.zipDuration):0,size=actor.size*(1-.28*t),width=size*.75;ctx.save();ctx.translate(actor.x,actor.y);ctx.rotate(actor.angle*(1-t));ctx.drawImage(im,-width/2,-size/2,width,size);ctx.restore()}
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
