const Module_Scroller = (() => {
  const S = {
    dmx: 128,
    power: false,
    calibrating: false,
    ready: false,
    phase: 'POWER OFF',
    calStep: 0,
    calPos: 'normal',
    dragging: false,
    animTimer: null,
    detectedStart: false,
    detectedEnd: false
  };

  const COLORS24 = [
    '#ed4a44','#f06b35','#f58d32','#f0b73c','#d9cf35','#a7c93b',
    '#65bd4b','#39ad72','#2aa99d','#2d9ebc','#3889cf','#4772cb',
    '#5b60c7','#7652bf','#934cb3','#ad4fa2','#c15491','#cf5b7d',
    '#d86c69','#d47d55','#be8d48','#9f9b49','#7ea25a','#5aa16e'
  ];

  const SEGMENT_RATIO = 0.34;

  const css = `
    #main-tab-scroller{background:#1e1a17;border:2px solid #3a322d;color:#8b7d72}
    #main-tab-scroller.active{background:#161616;color:#fff;border-color:#ffb300;border-bottom-color:#161616;box-shadow:0 -4px 12px rgba(255,179,0,.38),inset 0 1px 3px rgba(255,179,0,.28);text-shadow:0 0 7px rgba(255,179,0,.7)}
    #panel-scroller{height:100%}
    .master-console-container.scroller-active{gap:8px}
    .master-console-container.scroller-active .console-main-screen{aspect-ratio:1200/650;flex-shrink:0}
    .master-console-container.scroller-active .console-help-display{flex:0 0 94px;min-height:78px;padding:9px 18px}
    .master-console-container.scroller-active .help-text-content{font-size:12.5px;line-height:1.48}
    .scr-root{width:100%;height:100%;display:grid;grid-template-columns:185px minmax(0,1fr);grid-template-rows:minmax(0,1fr) 150px;gap:9px;background:#0a0f14;border:2px solid #263643;border-radius:14px;padding:10px;overflow:hidden;color:#e9f4fb}
    .scr-panel{background:linear-gradient(180deg,#071018,#03070b);border:2px solid #21445c;border-radius:10px;box-shadow:inset 0 0 18px rgba(0,0,0,.72);overflow:hidden}
    .scr-left{grid-row:1/3;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:7px}
    .scr-left-title{width:100%;padding:7px 4px;text-align:center;background:#07346c;color:#fff;font-weight:900;font-size:13px;letter-spacing:.04em;border-radius:5px}
    .scr-big-value{font-family:'Roboto Mono',monospace;font-size:32px;font-weight:900;color:#ffd54f;line-height:1;margin-top:4px}.scr-big-value small{font-size:15px;color:#bac3ca}
    .scr-percent{font:900 16px 'Roboto Mono',monospace;color:#00d9ff}
    .scr-fader-row{flex:1;min-height:0;width:100%;display:grid;grid-template-columns:34px 52px;justify-content:center;gap:6px;align-items:center}
    .scr-scale{height:300px;display:flex;flex-direction:column;justify-content:space-between;text-align:right;color:#b8c2cb;font:800 11px 'Roboto Mono',monospace}
    .scr-trackbox{position:relative;width:46px;height:300px;touch-action:none;cursor:ns-resize}
    .scr-track{position:absolute;left:20px;top:0;width:5px;height:100%;background:#020202;border:1px solid #2a2a2a;border-radius:3px}
    .scr-fill{position:absolute;left:20px;bottom:0;width:5px;background:#0d5acb;box-shadow:0 0 9px rgba(40,120,255,.45)}
    .scr-knob{position:absolute;left:1px;width:43px;height:50px;background:linear-gradient(#ededed,#9c9c9c);border:3px solid #444;border-radius:4px;box-shadow:0 5px 10px #000b;display:flex;align-items:center;z-index:3}.scr-knob:after{content:'';width:100%;height:3px;background:#ff3d00}
    .scr-step-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:112px}.scr-step{height:30px;background:#23272b;border:2px solid #41474d;color:#eee;border-radius:6px;font-weight:900}
    .scr-readouts{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:6px}.scr-read{background:#05080a;border:1px solid #2d5268;border-radius:6px;padding:5px;text-align:center}.scr-read span{display:block;color:#8fa4b2;font-size:9px}.scr-read b{font:900 15px 'Roboto Mono',monospace;color:#eaf8ff}
    .scr-power{width:100%;height:34px;border:2px solid #4c5258;background:#1d2226;color:#ddd;border-radius:7px;font-weight:900}.scr-power.on{border-color:#00e676;color:#b8ffd3;box-shadow:0 0 10px rgba(0,230,118,.3)}
    .scr-main{grid-column:2;display:grid;grid-template-rows:1fr 1fr;gap:8px;min-height:0}
    .scr-deck{position:relative;padding:9px 12px;display:grid;grid-template-columns:145px minmax(0,1fr);gap:10px;align-items:stretch}.scr-deck.red{border-color:#763232}.scr-deck.green{border-color:#376c3a}
    .scr-meta h3{margin:0 0 7px;font-size:16px}.scr-deck.red h3{color:#ff7676}.scr-deck.green h3{color:#8ce884}.scr-meta p{margin:3px 0;color:#d5dee5;font-size:11px;line-height:1.35}.scr-meta strong{color:#fff}
    .scr-stage{position:relative;min-width:0;display:grid;grid-template-rows:1fr 22px;gap:4px}
    .scr-window{position:relative;overflow:hidden;border:5px solid #424951;border-radius:7px;background:#171b1f;box-shadow:inset 0 0 16px #000,0 3px 10px #0007}
    .scr-axis{position:absolute;left:50%;top:0;bottom:0;border-left:2px dashed #ffd400;z-index:8;pointer-events:none}.scr-axis-label{position:absolute;left:50%;top:2px;transform:translateX(-50%);z-index:9;color:#ffd400;font-size:10px;font-weight:900;white-space:nowrap;background:#111a;padding:2px 5px;border-radius:4px}
    .scr-film{position:absolute;top:0;height:100%;display:flex;align-items:stretch;will-change:transform;transition:transform .10s linear}
    .scr-film.cal-move{transition:transform .55s ease-in-out}
    .scr-seg{height:100%;flex:0 0 auto;border-right:1px solid rgba(0,0,0,.42);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;text-shadow:0 1px 2px #000;position:relative;color:white}
    .scr-ref{background:linear-gradient(90deg,rgba(255,255,255,.94),rgba(225,239,246,.78));color:#111;text-shadow:none}.scr-seal{position:absolute;left:50%;top:11%;bottom:11%;width:25%;transform:translateX(-50%);background:#151515;border:1px solid #555;box-shadow:0 0 0 2px rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:#ff5757;font:900 9px 'Roboto Mono',monospace;writing-mode:vertical-rl}.scr-ref-label{position:absolute;left:4px;bottom:4px;font-size:8px;color:#333}
    .scr-sensor{position:absolute;left:50%;bottom:-5px;transform:translate(-50%,100%);z-index:12;text-align:center;color:#44eaff;font-size:9px;font-weight:900}.scr-sensor:before{content:'';display:block;margin:auto;width:22px;height:10px;border:2px solid #29dfff;border-radius:4px;background:#09202a;box-shadow:0 0 8px rgba(41,223,255,.45)}.scr-sensor.detect:before{background:#ffca28;border-color:#fff176;box-shadow:0 0 15px #ffca28}.scr-sensor.detect{color:#ffe86a}
    .scr-direction{display:flex;justify-content:space-between;align-items:center;color:#9db0bc;font-size:10px}.scr-direction b{color:#eafaff;font:800 10px 'Roboto Mono',monospace}.scr-direction span{letter-spacing:.14em}
    .scr-bottom{grid-column:2;padding:9px 11px;display:grid;grid-template-columns:1.35fr .8fr;gap:10px}.scr-cal{min-width:0}.scr-cal h3{margin:0 0 4px;color:#24dfff;font-size:15px}.scr-cal p{margin:0 0 7px;color:#dbe7ed;font-size:10.5px}.scr-steps{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}.scr-stepcard{min-width:0;background:#071018;border:1px solid #28536a;border-radius:6px;padding:5px;text-align:center;font-size:8.5px;color:#c9d7df;line-height:1.25}.scr-stepcard b{display:block;color:#fff;font-size:10px;margin-bottom:3px}.scr-stepcard.active{border-color:#ffd54f;box-shadow:0 0 10px rgba(255,213,79,.28)}.scr-stepcard.done{border-color:#00e676;color:#baffd2}
    .scr-sense-note{border-left:1px solid #2b4656;padding-left:10px;font-size:10px;line-height:1.45;color:#d2e0e6}.scr-sense-note h3{margin:0 0 5px;color:#ffd54f;font-size:14px}.scr-legend{display:flex;gap:7px;align-items:center;margin:5px 0}.scr-demo-transparent,.scr-demo-seal{width:34px;height:13px;border:1px solid #94a7b3}.scr-demo-transparent{background:#eaf7fc}.scr-demo-seal{background:#111}.scr-status{margin-top:5px;padding:5px 7px;border-radius:5px;background:#05090c;border:1px solid #345361;color:#a7bed0}.scr-status.ready{border-color:#00e676;color:#adffd0}.scr-status.run{border-color:#ffd54f;color:#ffe99a}
    @media(max-width:1050px){.scr-root{grid-template-columns:160px 1fr}.scr-deck{grid-template-columns:120px 1fr}.scr-steps{grid-template-columns:repeat(3,1fr)}}
  `;

  function insertStyle(){
    if(document.getElementById('scroller-style')) return;
    const el=document.createElement('style'); el.id='scroller-style'; el.textContent=css; document.head.appendChild(el);
  }

  function buildFilm(id,count){
    const colors=count===2?['#d74444','#275ec7']:COLORS24;
    return `<div class="scr-film" id="scr-film-${id}">
      <div class="scr-seg scr-ref" data-kind="start"><div class="scr-seal">START</div><span class="scr-ref-label">0 / CLEAR</span></div>
      ${colors.map((c,i)=>`<div class="scr-seg" style="background:${c}">${count===2?(i===0?'色 A':'色 B'):(i+1)}</div>`).join('')}
      <div class="scr-seg scr-ref" data-kind="end"><div class="scr-seal">END</div><span class="scr-ref-label">END / CLEAR</span></div>
    </div>`;
  }

  function deck(id,count,title,cls){
    return `<div class="scr-panel scr-deck ${cls}">
      <div class="scr-meta"><h3>${title}</h3><p>フィルム構成：<strong>${count}色</strong></p><p>色枠の物理幅：<strong>2色 / 24色 共通</strong></p><p>${count===2?'短いフィルム。ENDは近い。':'長いフィルム。現在色＋前後の約3色を表示。'}</p></div>
      <div class="scr-stage"><div class="scr-window" id="scr-window-${id}"><div class="scr-axis"></div><div class="scr-axis-label" id="scr-axis-label-${id}">現在位置 DMX 128</div>${buildFilm(id,count)}<div class="scr-sensor" id="scr-sensor-${id}">透過センサー</div></div><div class="scr-direction"><b>START</b><span>← FILM MOVE →</span><b>END</b></div></div>
    </div>`;
  }

  function html(){
    return `<div class="scr-root">
      <div class="scr-panel scr-left">
        <div class="scr-left-title">DMX VALUE (8-bit)</div>
        <div class="scr-big-value"><span id="scr-dmx">128</span><small> / 255</small></div><div class="scr-percent" id="scr-percent">50%</div>
        <div class="scr-fader-row"><div class="scr-scale"><span>255</span><span>192</span><span>128</span><span>64</span><span>0</span></div><div class="scr-trackbox" id="scr-track"><div class="scr-track"></div><div class="scr-fill" id="scr-fill"></div><div class="scr-knob" id="scr-knob"></div></div></div>
        <div class="scr-step-row"><button class="scr-step" id="scr-down">▼</button><button class="scr-step" id="scr-up">▲</button></div>
        <div class="scr-readouts"><div class="scr-read"><span>出力値 (8bit)</span><b id="scr-read-dmx">128</b></div><div class="scr-read"><span>2進数</span><b id="scr-binary">1000 0000</b></div></div>
        <button class="scr-power" id="scr-power">POWER OFF / 電源投入</button>
      </div>
      <div class="scr-main">${deck('2',2,'2色スクローラー','red')}${deck('24',24,'24色スクローラー','green')}</div>
      <div class="scr-panel scr-bottom"><div class="scr-cal"><h3>キャリブレーション（基準出し）とは？</h3><p>電源投入と同時にSTARTへ移動し、STARTシールを検出。その後ENDまで走ってENDシールを検出し、実際の移動範囲を覚えます。</p><div class="scr-steps">
        <div class="scr-stepcard" data-phase="1"><b>1 電源ON</b>CAL開始</div><div class="scr-stepcard" data-phase="2"><b>2 STARTへ</b>横移動</div><div class="scr-stepcard" data-phase="3"><b>3 START検出</b>両方同じ位置</div><div class="scr-stepcard" data-phase="4"><b>4 ENDへ</b>反対端へ</div><div class="scr-stepcard" data-phase="5"><b>5 END検出</b>2色 / 24色で距離差</div><div class="scr-stepcard" data-phase="6"><b>6 READY</b>DMX制御へ</div>
      </div></div><div class="scr-sense-note"><h3>START / END シールと透過センサー</h3><div class="scr-legend"><span class="scr-demo-transparent"></span>透明フィルム＝光が通る</div><div class="scr-legend"><span class="scr-demo-seal"></span>シール＝光を遮る</div><div>START位置と色枠幅は共通。色数が増えるほどENDだけ遠くなる。</div><div class="scr-status" id="scr-status">POWER OFF</div></div></div>
    </div>`;
  }

  function inject(){
    insertStyle();
    const movingTab=document.getElementById('main-tab-movinghead');
    const movingPanel=document.getElementById('panel-movinghead');
    if(!movingTab||!movingPanel||document.getElementById('main-tab-scroller')) return;
    const tab=document.createElement('button'); tab.className='main-tab-btn'; tab.id='main-tab-scroller'; tab.textContent='Scroller'; movingTab.parentNode.insertBefore(tab,movingTab);
    const panel=document.createElement('div'); panel.id='panel-scroller'; panel.className='stage-view-panel fade-type'; panel.innerHTML=html(); movingPanel.parentNode.insertBefore(panel,movingPanel);
    if(typeof modules!=='undefined') modules.scroller=Module_Scroller;
    if(typeof explanationData!=='undefined') explanationData.scroller='<strong>【Scroller：同じ8-bitでも色数でフィルム長が変わる】</strong><br>2色と24色で1色ぶんの物理幅は同じです。STARTシールも同じ位置から始まります。24色は色数が多いぶんフィルム全体が長くなり、ENDシールだけ遠くなります。<br><strong>【Calibration：電源投入でSTART / ENDを探す】</strong><br>POWERを入れると自動で横移動を開始し、透過センサーがSTARTシール、続いてENDシールを検出します。';
    bind(tab,panel); render();
    document.addEventListener('pointerdown',e=>{if(e.target.closest('.main-tab-btn')&&e.target.id!=='main-tab-scroller')deactivate(panel)},true);
    const params=new URLSearchParams(location.search);const q=(params.get('tab')||'').toLowerCase();if(q==='scroller'||q==='scroll')requestAnimationFrame(()=>tab.click());
  }

  function bind(tab,panel){
    tab.addEventListener('click',()=>activate(tab,panel));
    const track=document.getElementById('scr-track');
    const setFrom=e=>{if(S.calibrating)return;const p=e.touches?e.touches[0]:e;const r=track.getBoundingClientRect();const ratio=1-Math.max(0,Math.min(1,(p.clientY-r.top)/r.height));S.dmx=Math.round(ratio*255);render()};
    track.addEventListener('pointerdown',e=>{S.dragging=true;track.setPointerCapture?.(e.pointerId);setFrom(e)});track.addEventListener('pointermove',e=>{if(S.dragging)setFrom(e)});track.addEventListener('pointerup',()=>S.dragging=false);track.addEventListener('pointercancel',()=>S.dragging=false);
    document.getElementById('scr-up').onclick=()=>{if(!S.calibrating){S.dmx=Math.min(255,S.dmx+1);render()}};
    document.getElementById('scr-down').onclick=()=>{if(!S.calibrating){S.dmx=Math.max(0,S.dmx-1);render()}};
    document.getElementById('scr-power').onclick=togglePower;
  }

  function activate(tab,panel){
    if(typeof activeModuleKey!=='undefined'&&activeModuleKey==='scroller')return;
    if(typeof modules!=='undefined'&&typeof activeModuleKey!=='undefined'&&modules[activeModuleKey]?.destroy)modules[activeModuleKey].destroy();
    document.querySelectorAll('.main-tab-btn').forEach(t=>t.classList.remove('active'));tab.classList.add('active');document.querySelectorAll('.stage-view-panel.fade-type').forEach(p=>p.classList.remove('active'));panel.classList.add('active');document.getElementById('network-carousel-window')?.classList.remove('active');
    const mc=document.querySelector('.master-console-container');mc?.classList.remove('movinghead-active','sim8bit-active','sim16bit-active','simdmx-active','ledmix-active','network-active','ipaddress-active','network-layout-active');mc?.classList.add('scroller-active');
    if(typeof activeModuleKey!=='undefined')activeModuleKey='scroller';const help=document.getElementById('help-text-target');if(help)help.innerHTML=explanationData?.scroller||'Scroller';render();
  }
  function deactivate(panel){panel.classList.remove('active');document.querySelector('.master-console-container')?.classList.remove('scroller-active')}

  function togglePower(){
    if(S.calibrating)return;
    if(S.power){clearTimeout(S.animTimer);S.power=false;S.ready=false;S.phase='POWER OFF';S.calStep=0;S.calPos='normal';S.detectedStart=false;S.detectedEnd=false;render();return}
    S.power=true;S.ready=false;S.detectedStart=false;S.detectedEnd=false;runCalibration();
  }

  function runCalibration(){
    clearTimeout(S.animTimer);S.calibrating=true;
    const seq=[
      {p:1,phase:'POWER ON / CAL START',pos:'center',ms:500},
      {p:2,phase:'MOVING TO START',pos:'startApproach',ms:850},
      {p:3,phase:'START SEAL DETECTED',pos:'start',ms:700,start:true},
      {p:4,phase:'MOVING TO END',pos:'endApproach',ms:1450},
      {p:5,phase:'END SEAL DETECTED',pos:'end',ms:750,end:true},
      {p:6,phase:'READY',pos:'normal',ms:500,ready:true}
    ];
    let i=0;
    const next=()=>{const x=seq[i++];if(!x){S.calibrating=false;S.ready=true;S.phase='READY';S.calPos='normal';render();return}S.phase=x.phase;S.calPos=x.pos;S.calStep=x.p;if(x.start)S.detectedStart=true;if(x.end)S.detectedEnd=true;if(x.ready){S.ready=true;S.calibrating=false}render();S.animTimer=setTimeout(next,x.ms)};next();
  }

  function segmentWidth(windowW){return windowW*SEGMENT_RATIO}
  function normalOffset(count,windowW){const segW=segmentWidth(windowW);const idx=1+(S.dmx/255)*(count-1);return windowW*.5-(idx+.5)*segW}
  function calibrationOffset(count,windowW,pos){
    const segW=segmentWidth(windowW),sensorX=windowW*.5;
    let idx=1+(S.dmx/255)*(count-1);
    if(pos==='center')idx=1;
    if(pos==='startApproach')idx=-.15;
    if(pos==='start')idx=0;
    if(pos==='endApproach')idx=count+.35;
    if(pos==='end')idx=count+1;
    if(pos==='normal')return normalOffset(count,windowW);
    return sensorX-(idx+.5)*segW;
  }

  function updateFilm(id,count){
    const win=document.getElementById(`scr-window-${id}`),film=document.getElementById(`scr-film-${id}`);if(!win||!film)return;
    const w=win.clientWidth||600,segW=segmentWidth(w);film.querySelectorAll('.scr-seg').forEach(s=>s.style.width=`${segW}px`);
    const off=S.calibrating?calibrationOffset(count,w,S.calPos):normalOffset(count,w);film.style.transform=`translateX(${off}px)`;film.classList.toggle('cal-move',S.calibrating);
    const label=document.getElementById(`scr-axis-label-${id}`);if(label)label.textContent=S.calibrating?S.phase:`現在位置 DMX ${S.dmx}`;
    const sensor=document.getElementById(`scr-sensor-${id}`);const detectStart=S.phase==='START SEAL DETECTED';const detectEnd=S.phase==='END SEAL DETECTED';sensor?.classList.toggle('detect',detectStart||detectEnd);
  }

  function render(){
    if(!document.querySelector('.scr-root'))return;
    const pct=Math.round(S.dmx/255*100),bin=S.dmx.toString(2).padStart(8,'0').replace(/(.{4})/g,'$1 ').trim();
    document.getElementById('scr-dmx').textContent=S.dmx;document.getElementById('scr-percent').textContent=`${pct}%`;document.getElementById('scr-read-dmx').textContent=S.dmx;document.getElementById('scr-binary').textContent=bin;
    const knob=document.getElementById('scr-knob'),fill=document.getElementById('scr-fill'),y=S.dmx/255*100;knob.style.bottom=`calc(${y}% - 25px)`;fill.style.height=`${y}%`;
    updateFilm('2',2);updateFilm('24',24);
    const pb=document.getElementById('scr-power');pb.classList.toggle('on',S.power);pb.textContent=S.power?(S.calibrating?'POWER ON / CALIBRATING…':'POWER ON / 電源OFF'):'POWER OFF / 電源投入';
    const st=document.getElementById('scr-status');st.textContent=`${S.phase}${S.detectedStart?' / START ✓':''}${S.detectedEnd?' / END ✓':''}`;st.classList.toggle('ready',S.ready);st.classList.toggle('run',S.calibrating);
    document.querySelectorAll('.scr-stepcard').forEach((el,i)=>{const n=i+1;el.classList.toggle('active',S.calibrating&&S.calStep===n);el.classList.toggle('done',S.ready||S.calStep>n)});
  }

  window.addEventListener('resize',()=>{if(document.getElementById('panel-scroller')?.classList.contains('active'))render()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
  return {inject,render,init:render,destroy(){S.dragging=false}};
})();
