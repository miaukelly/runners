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
    .dev-panel button,.dev-panel select{font:8px 'Press Start 2P',monospace;color:#f5f6f9;background:#1b2a43;border:1px solid #ffffff42;border-radius:0;padding:10px}
    .dev-panel button{cursor:pointer}.dev-close{width:34px;height:32px;padding:0!important}
    .dev-row{display:grid;grid-template-columns:1fr auto;align-items:end;gap:9px;margin:12px 0}
    .dev-row label{display:grid;gap:8px;color:#9eafc5;font-size:7px}
    .dev-row select{width:100%;min-width:0}
    .dev-spawn{min-width:88px;color:#ffe18a!important}
    @media(max-width:520px){.dev-row{grid-template-columns:1fr}.dev-spawn{height:38px}}
  `;
  document.head.append(style);
  const overlay=document.createElement('div');overlay.className='dev-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Developer spawn panel');
  overlay.innerHTML=`<section class="dev-panel"><header class="dev-header"><h2>DEV SPAWNER</h2><button class="dev-close" type="button" aria-label="Close">X</button></header><div class="dev-row"><label>RUNNER<select data-pick="runner"></select></label><button class="dev-spawn" data-spawn="runner" type="button">SPAWN</button></div><div class="dev-row"><label>CAR<select data-pick="car"></select></label><button class="dev-spawn" data-spawn="car" type="button">SPAWN</button></div></section>`;
  game.append(overlay);
  const runnerSelect=overlay.querySelector('[data-pick="runner"]'),carSelect=overlay.querySelector('[data-pick="car"]');
  function fill(select,items){for(const item of items){const option=document.createElement('option');option.value=item.id;option.textContent=`${item.name} - ${item.rarity}`;select.append(option)}}
  fill(runnerSelect,window.runnersDevAPI.runners);fill(carSelect,window.runnersDevAPI.cars);
  const open=()=>{overlay.hidden=false;runnerSelect.focus()},close=()=>{overlay.hidden=true};
  overlay.querySelector('.dev-close').addEventListener('click',close);
  overlay.querySelector('[data-spawn="runner"]').addEventListener('click',()=>window.runnersDevAPI.spawnRunner(runnerSelect.value));
  overlay.querySelector('[data-spawn="car"]').addEventListener('click',()=>window.runnersDevAPI.spawnCar(carSelect.value));
  let typed='';
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!overlay.hidden){close();typed='';return}
    if(event.target.closest('input,textarea,select'))return;
    if(event.key==='Enter'){if(typed==='dev')open();typed='';return}
    if(event.key.length===1&&/[a-z]/i.test(event.key))typed=(typed+event.key.toLowerCase()).slice(-3);
  });
})();
