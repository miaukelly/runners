(() => {
  if(!window.runnersDevAPI)return;
  const game=document.querySelector('.game');
  const style=document.createElement('style');
  style.textContent=`
    .dev-overlay{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:18px;background:#07101bd9;font-family:'Press Start 2P',monospace;text-shadow:2px 2px 0 #0008}
    .dev-overlay[hidden]{display:none}
    .dev-panel{width:min(92%,540px);padding:18px;background:#111d32;border:1px solid #ffffff55;box-shadow:0 18px 65px #000b}
    .dev-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid #ffffff38}
    .dev-header h2{font:10px 'Press Start 2P',monospace;margin:0;color:#ffe18a}
    .dev-panel button{font:8px 'Press Start 2P',monospace;color:#f5f6f9;background:#1b2a43;border:1px solid #ffffff42;border-radius:0;padding:10px}
    .dev-panel button{cursor:pointer}.dev-close{width:34px;height:32px;padding:0!important}
    .dev-row{display:grid;grid-template-columns:1fr auto;align-items:end;gap:9px;margin:12px 0}
    .dev-row>label{display:grid;gap:8px;color:#9eafc5;font-size:7px}
    .dev-picker{position:relative}.dev-current{width:100%;height:60px;display:flex;align-items:center;justify-content:center;padding:5px!important;position:relative}
    .dev-current img{width:100%;height:48px;object-fit:contain;image-rendering:pixelated}.dev-caret{position:absolute;right:8px;bottom:5px;color:#ffe18a;font:10px monospace}
    .dev-options{position:absolute;z-index:2;top:calc(100% + 3px);left:0;right:0;max-height:260px;overflow:auto;background:#101a2d;border:1px solid #ffffff55;box-shadow:0 10px 28px #000a}
    .dev-options[hidden]{display:none}.dev-option{width:100%;display:grid;grid-template-columns:46px 1fr auto;align-items:center;gap:8px;text-align:left;border:0!important;border-bottom:1px solid #ffffff20!important}
    .dev-option img{width:44px;height:38px;object-fit:contain;image-rendering:pixelated}.dev-option span{font-size:7px}.dev-option small{font:6px 'Press Start 2P',monospace;color:#9eafc5}
    .dev-spawn{min-width:88px;color:#ffe18a!important}
    @media(max-width:520px){.dev-row{grid-template-columns:1fr}.dev-spawn{height:38px}.dev-options{max-height:190px}}
  `;
  document.head.append(style);
  const overlay=document.createElement('div');overlay.className='dev-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Developer spawn panel');
  overlay.innerHTML=`<section class="dev-panel"><header class="dev-header"><h2>DEV SPAWNER</h2><button class="dev-close" type="button" aria-label="Close">X</button></header><div class="dev-row"><label>RUNNER<div class="dev-picker" data-picker="runner"><button class="dev-current" type="button" aria-label="Choose runner" aria-haspopup="listbox" aria-expanded="false"><img alt=""><span class="dev-caret">▼</span></button><div class="dev-options" role="listbox" hidden></div></div></label><button class="dev-spawn" data-spawn="runner" type="button">SPAWN</button></div><div class="dev-row"><label>CAR<div class="dev-picker" data-picker="car"><button class="dev-current" type="button" aria-label="Choose car" aria-haspopup="listbox" aria-expanded="false"><img alt=""><span class="dev-caret">▼</span></button><div class="dev-options" role="listbox" hidden></div></div></label><button class="dev-spawn" data-spawn="car" type="button">SPAWN</button></div></section>`;
  game.append(overlay);
  const selected={runner:null,car:null};
  const pools={runner:window.runnersDevAPI.runners,car:window.runnersDevAPI.cars};
  function setupPicker(kind){
    const picker=overlay.querySelector(`[data-picker="${kind}"]`),current=picker.querySelector('.dev-current'),menu=picker.querySelector('.dev-options');
    const fill=(items)=>items.forEach(item=>{
      const option=document.createElement('button');option.type='button';option.className='dev-option';option.setAttribute('role','option');option.setAttribute('aria-label',`${item.name}, ${item.rarity}`);
      option.innerHTML=`<img src="${item.icon}" alt=""><span></span><small></small>`;option.querySelector('span').textContent=item.name;option.querySelector('small').textContent=item.rarity.toUpperCase();
      option.addEventListener('click',()=>{selected[kind]=item;current.querySelector('img').src=item.icon;current.setAttribute('aria-label',`Selected ${item.name}. Choose ${kind}`);menu.hidden=true;current.setAttribute('aria-expanded','false')});menu.append(option);
    });
    fill(pools[kind]);
    current.addEventListener('click',()=>{const opening=menu.hidden;for(const other of overlay.querySelectorAll('.dev-options'))other.hidden=true;for(const button of overlay.querySelectorAll('.dev-current'))button.setAttribute('aria-expanded','false');menu.hidden=!opening;current.setAttribute('aria-expanded',String(opening))});
    selected[kind]=pools[kind][0];current.querySelector('img').src=selected[kind].icon;
  }
  setupPicker('runner');setupPicker('car');
  const close=()=>{overlay.hidden=true;for(const menu of overlay.querySelectorAll('.dev-options'))menu.hidden=true};
  overlay.querySelector('.dev-close').addEventListener('click',close);
  overlay.querySelector('[data-spawn="runner"]').addEventListener('click',()=>window.runnersDevAPI.spawnRunner(selected.runner.id));
  overlay.querySelector('[data-spawn="car"]').addEventListener('click',()=>window.runnersDevAPI.spawnCar(selected.car.id));
  let typed='';
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!overlay.hidden){close();typed='';return}
    if(event.target.closest('input,textarea,select'))return;
    if(event.key==='Enter'){if(typed==='dev'){overlay.hidden=false;overlay.querySelector('.dev-current').focus()}typed='';return}
    if(event.key.length===1&&/[a-z]/i.test(event.key))typed=(typed+event.key.toLowerCase()).slice(-3);
  });
})();
