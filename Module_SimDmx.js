const Module_SimDmx = {
    // --- 内部状態管理 ---
    dmxChannels: [191, 128, 64, 255, 0, 191, 42, 128, 0, 255],
    MAX_BOTTOM_DMX: 69,
    draggingFaderId: null,
    startY: 0,
    startBottom: 0,
    trainPosition: 0,
    speedFactor: 0.05,
    lastTime: 0,
    canvas: null,
    ctx: null,
    animationFrameId: null,

    // --- 定数定義 ---
    chColors: ['#ffca28', '#00e5ff', '#00e676', '#ff4081', '#ff6d00', '#b388ff', '#aeea00', '#00b0ff', '#f50057', '#ffffff'],
    CAR_BODY_W: 80,
    CAR_MARGIN: 4,
    CAR_TOTAL_W: 84, 
    LAST_CAR_W: 120,
    loopWidth: 1464,

    // --- HTMLテンプレート（ミニフェーダーの各識別ラインを完全復元） ---
    getHTML() {
        let fadersHTML = '';
        for(let c=1;c<=10;c++){
            const color=this.chColors[c-1],id='dmx'+c;
            fadersHTML += `<div class="fader-cell-wrap" style="display:flex;flex:1;flex-direction:column;align-items:center;justify-content:space-between;gap:2px;min-width:0">
              <div id="simdmx-label-${id}" style="font-size:13px;color:${color};font-weight:800">CH${c}</div>
              <button id="simdmx-btn-up-${id}" class="step-btn" style="color:${color};background:#192532;border:1px solid #445;cursor:pointer">▲</button>
              <div id="simdmx-boundary-${id}" class="fader-area" data-fader="${id}" style="height:115px;width:34px;position:relative;touch-action:none">
                <div class="fader-track-container" style="position:absolute;left:5px;top:5px;width:24px;height:105px">
                  <div style="position:absolute;left:10px;width:4px;height:100%;background:${color}55"></div>
                  <div id="simdmx-knob-${id}" class="fader-knob" style="position:absolute;left:0;width:24px;height:28px;bottom:0;border:2px solid ${color};background:#344254;border-radius:5px;z-index:2;cursor:grab"></div>
                </div>
              </div>
              <button id="simdmx-btn-down-${id}" class="step-btn" style="color:${color};background:#192532;border:1px solid #445;cursor:pointer">▼</button>
              <output id="simdmx-fader-value-${c}" style="font-size:15px;color:#fff;font-weight:700;font-variant-numeric:tabular-nums">0</output>
            </div>`;
        }
        return `<style>
.simdmx-v2{height:100%;min-height:0;display:grid;grid-template-rows:minmax(138px,1.05fr) minmax(122px,.83fr) minmax(185px,1.42fr);gap:8px;color:#e8edf5;font-family:inherit}
.simdmx-v2 *{box-sizing:border-box}
.simdmx-v2 .sd-panel{background:linear-gradient(180deg,#121d2a,#080f17);border:1px solid #27546d;border-radius:9px;min-height:0;overflow:hidden}
.simdmx-v2 .sd-title{font-size:16px;font-weight:800;letter-spacing:.02em;color:#f5f7ff}
.simdmx-v2 .sd-teacher{display:grid;grid-template-columns:minmax(80px,14%) minmax(170px,27%) minmax(0,1fr);align-items:center;gap:12px;padding:10px 14px;border-color:#bf338f}
.simdmx-v2 .sd-teacher img{max-width:100%;max-height:100%;height:100%;object-fit:contain;align-self:end}
.simdmx-v2 .sd-teacher-copy{font-size:14px;line-height:1.5;color:#f3e8c9;overflow:auto;max-height:100%}
.simdmx-v2 .sd-teacher-copy strong{display:block;color:#ffdd91;font-size:16px;margin-bottom:5px}
.simdmx-v2 .sd-wave-panel{height:100%;min-width:0;display:flex;flex-direction:column;gap:5px}
.simdmx-v2 .sd-wave-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:14px}
.simdmx-v2 .sd-wave{width:100%;flex:1;min-height:50px;background:#050b13;border:1px solid #354d63;border-radius:6px}
.simdmx-v2 .sd-wave-caption{font-size:12px;color:#b7c9dc;display:flex;justify-content:space-between;gap:8px}
.simdmx-v2 .sd-train{display:flex;flex-direction:column;padding:8px 12px;gap:5px}
.simdmx-v2 .sd-train-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.simdmx-v2 .sd-train-head .sd-note{font-size:12px;color:#a7bfd2}
.simdmx-v2 .sd-go{margin-left:auto;background:#086ba6;border:1px solid #33c7ff;color:white;border-radius:7px;font-weight:800;padding:7px 18px;cursor:pointer}
.simdmx-v2 .sd-track{flex:1;min-height:92px;position:relative;overflow:hidden;background:linear-gradient(180deg,#060c12,#0c1420);border:1px solid #344653;border-radius:6px}
.simdmx-v2 .sd-rails{position:absolute;bottom:2px;height:6px;width:100%;background:repeating-linear-gradient(90deg,#59626a 0 14px,#242a32 14px 23px);border-top:2px solid #92979c}
.simdmx-v2 .sd-consist{display:flex;align-items:flex-end;gap:4px;position:absolute;bottom:9px;left:12px;will-change:transform;white-space:nowrap}
.simdmx-v2 .sd-engine{width:185px;height:73px;position:relative;flex:none;display:flex;align-items:center;gap:5px;padding:7px 10px 7px 5px;border-bottom:5px solid #5a626c}
.simdmx-v2 .sd-engine-art{font-size:53px;line-height:1;filter:drop-shadow(0 0 8px #e08a32)}
.simdmx-v2 .sd-engine-note{font-size:10px;color:#ffdfae;line-height:1.25;background:#111b28df;border:1px solid #b67b37;padding:4px;border-radius:5px}
.simdmx-v2 .sd-car{height:82px;min-width:102px;border:2px solid var(--car);background:#0d1b2b;border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;position:relative;flex:none}
.simdmx-v2 .sd-car::before{content:'';position:absolute;left:-6px;top:32px;width:5px;height:6px;background:#a9aeb6}
.simdmx-v2 .sd-car .sd-ch{font-size:12px;color:var(--car);font-weight:800}
.simdmx-v2 .sd-car svg{width:94px;height:34px;display:block}
.simdmx-v2 .sd-car .sd-value{font-size:15px;letter-spacing:.025em;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
.simdmx-v2 .sd-car.sd-selected{box-shadow:0 0 0 2px #fff4,0 0 12px var(--car)}
.simdmx-v2 .sd-caboose{width:132px;height:69px;border:2px solid #bc5d51;border-radius:8px;background:#381d21;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px;font-size:11px;flex:none}
.simdmx-v2 .sd-caboose span{font-size:9px;color:#e4bcb8}
.simdmx-v2 .sd-bottom{display:grid;grid-template-columns:minmax(0,2fr) minmax(200px,.8fr);gap:8px;min-height:0}
.simdmx-v2 .sd-faders{padding:8px 10px;display:flex;flex-direction:column;gap:6px}
.simdmx-v2 .sd-fader-row{display:flex;gap:2px;justify-content:space-around;flex:1;min-height:0}
.simdmx-v2 .fader-cell-wrap{min-width:0}
.simdmx-v2 .sd-bulb{padding:8px;position:relative;display:flex;flex-direction:column}
.simdmx-v2 .sd-bulb-content{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:minmax(88px,40%) minmax(0,60%);align-items:center;gap:4px}
.simdmx-v2 .sd-bulb-value{font-size:15px;color:#ffcf80;position:relative;z-index:4;min-width:0;font-variant-numeric:tabular-nums}
.simdmx-v2 .sd-bulb-value b{font-size:30px;display:block;font-variant-numeric:tabular-nums}
.simdmx-v2 .bulb-image-container{position:relative;height:100%;width:100%;min-width:0;display:flex;align-items:center;justify-content:center}
.simdmx-v2 .large-bulb-img{width:100%;height:100%;object-fit:contain;position:relative;z-index:1}
.simdmx-v2 .ambient-glow{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,#ff980055,transparent 70%);pointer-events:none;opacity:0}
.simdmx-v2 .internal-gas-glow{position:absolute;top:7%;left:12%;width:76%;height:55%;border-radius:50%;background:radial-gradient(circle,#ffde66aa,transparent 72%);mix-blend-mode:screen;z-index:2;opacity:0;pointer-events:none}
.simdmx-v2 .filament-glow-layer{position:absolute;top:25%;left:36%;width:28%;height:12%;border-radius:50%;z-index:3;mix-blend-mode:screen;opacity:0;pointer-events:none}
.simdmx-v2 .sd-overlay{position:absolute;z-index:12;top:22%;left:50%;transform:translateX(-50%);max-width:390px;width:calc(100% - 24px);background:#0b1b2bf5;border:2px solid #25baf0;border-radius:10px;box-shadow:0 10px 35px #000b;padding:18px;text-align:center;font-size:13px;line-height:1.6}
.simdmx-v2 .sd-overlay button{margin-top:10px;background:#127cae;color:#fff;border:1px solid #51d3ff;border-radius:6px;padding:7px 15px;cursor:pointer}
@media(max-width:850px){.simdmx-v2 .sd-teacher{grid-template-columns:70px minmax(130px,35%) minmax(0,1fr);gap:6px;padding:7px}.simdmx-v2 .sd-teacher-copy{font-size:12px}.simdmx-v2 .sd-title{font-size:14px}.simdmx-v2 .sd-bottom{grid-template-columns:minmax(0,2fr) minmax(160px,.8fr)}}
</style>
        <div class="simdmx-v2" id="simdmx-v2">
          <section class="sd-panel sd-teacher">
            <img src="assets/wave_teacher_transparent.svg" alt="先生">
            <div class="sd-teacher-copy"><strong>先生の解説</strong>客車の中は8bitのデータ。前にスタート1bit、後ろにストップ2bitが付いて、<b>1チャンネルのスロットは合計11bit</b>になるよ。<br><a href="Top.html?tab=sim8bit" style="color:#71dfff">前の8bit教材を見る ↗</a><br><button id="simdmx-details" style="margin-top:5px;background:#18374d;color:#dff;border:1px solid #367e9b;border-radius:4px;cursor:pointer">機関車と車掌車の詳しい説明</button></div>
            <div class="sd-wave-panel">
              <div class="sd-wave-head"><b>選択CHの信号を拡大（11bit）</b><span id="simdmx-wave-label">CH1 / 191</span></div>
              <svg id="simdmx-detail-wave" class="sd-wave" viewBox="0 0 560 112" preserveAspectRatio="none" aria-label="スタートビット、8データビット、2ストップビットの波形"></svg>
              <div class="sd-wave-caption"><span>入口：Start 1bit（LOW）</span><span>客車：Data 8bit（LSBから送信）</span><span>連結器：Stop 2bit（HIGH）</span></div>
            </div>
          </section>
          <section class="sd-panel sd-train">
            <div class="sd-train-head"><span class="sd-title">🚂 DMX通信列車</span><span class="sd-note">機関車 → 客車（最大512CH） → 車掌車｜発車すると右から左へ</span><button class="sd-go" id="simdmx-depart">▶ 次へ（発車）</button></div>
            <div class="sd-track"><div class="sd-rails"></div><div id="simdmx-train-wagon-line" class="sd-consist"></div><div id="simdmx-speed-overlay" class="sd-overlay" hidden><b>この列車は、どれくらいの速さで走る？</b><br>DMX512ではデータを繰り返し送っているよ。通信の速さと更新頻度の違いは次のページで学ぼう。<br><button id="simdmx-speed-continue">次のページへ →</button></div></div>
          </section>
          <section class="sd-bottom">
            <div class="sd-panel sd-faders"><div class="sd-title">フェーダーを動かして、客車の8bit波形を変えてみよう</div><div id="simdmx-multi-fader-container" class="sd-fader-row">${fadersHTML}</div></div>
            <div class="sd-panel sd-bulb"><div class="sd-title">受信側：裸電球</div><div class="sd-bulb-content">
              <div class="sd-bulb-value">CH<span id="simdmx-selected-ch">1</span><div style="font-size:11px;color:#c3d2de">DMX値（0〜255）</div><b id="simdmx-selected-value">191</b><span id="simdmx-selected-percent">約75%</span></div>
              <div class="bulb-image-container"><div id="simdmx-ambient-glow" class="ambient-glow"></div><img src="assets/Light.webp" class="large-bulb-img" alt="裸電球"><div id="simdmx-gas-glow" class="internal-gas-glow"></div><div id="simdmx-filament-glow" class="filament-glow-layer"></div></div>
            </div></div>
          </section>
        </div>`;
    },

    init() {
        this.running=false;this.trainPosition=0;this.speedFactor=1;this.selectedChannel=1;
        this.buildTrainWagons();
        this.bindFaderEvents(Array.from({length:10},(_,i)=>'dmx'+(i+1)));
        this.syncPositionsFromValues();this.updateSystem();
        document.getElementById('simdmx-depart')?.addEventListener('click',()=>this.depart());
        document.getElementById('simdmx-details')?.addEventListener('click',()=>{
          alert('機関車：BREAK → MAB → START CODE（通常0）。START CODEもスタート1bit・データ8bit・ストップ2bitの11bitスロットです。\n客車：各CHの入口がスタート1bit、内部が8bit、後部連結器がストップ2bit。\n車掌車：次のBREAKまでのMARK区間（MBB）の比喩。END CODEはありません。MBBの長さは0の場合もあります。');
        });
        document.getElementById('simdmx-speed-continue')?.addEventListener('click',()=>{
          // 速度教材がまだ独立していないため、既存の別テーマへ誤誘導しない。
          alert('次の「DMX通信速度」教材は準備中です。250kbit/sと、512スロット時の最大約44Hzを区別して学びます。');
        });
        this.lastTime=performance.now();
        const loop=t=>{this.animationLoop(t);this.animationFrameId=requestAnimationFrame(loop)};
        this.animationFrameId=requestAnimationFrame(loop);
    },
    depart(){
      if(this.running)return;
      this.running=true;
      const btn=document.getElementById('simdmx-depart');if(btn){btn.textContent='走行中';btn.disabled=true}
      const overlay=document.getElementById('simdmx-speed-overlay');
      if(overlay){overlay.hidden=false;overlay.style.display='block'}
    },

    destroy() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('mousemove', this._moveHandler);
        window.removeEventListener('touchmove', this._moveHandler);
        window.removeEventListener('mouseup', this._endHandler);
        window.removeEventListener('touchend', this._endHandler);
    },

    buildTrainWagons() {
        const line=document.getElementById('simdmx-train-wagon-line');
        if(!line)return;
        let html='<div class="sd-engine"><span class="sd-engine-art" aria-label="蒸気機関車">🚂</span><span class="sd-engine-note"><b>START CODE：通常0</b><br>BREAK → MAB<br>→ START CODE</span></div>';
        for(let i=1;i<=10;i++){
          html+=`<div class="sd-car" data-ch="${i}" style="--car:${this.chColors[i-1]}"><span class="sd-ch">CH${i}</span><svg class="sd-car-wave" viewBox="0 0 96 34" aria-label="CH${i}の8bitデータ波形"></svg><span class="sd-value simdmx-pct-ch${i}">00000000</span></div>`;
        }
        html+='<div class="sd-car" style="--car:#87919d"><span class="sd-ch">… CH11〜511 …</span></div><div class="sd-car" style="--car:#6cbdff"><span class="sd-ch">CH512</span><span class="sd-value">8bit</span></div><div class="sd-caboose"><b>🚃 車掌車</b><b>MBB</b><span>次のBREAKまでのMARK</span></div>';
        line.innerHTML=html;
    },
    bitWave(value,full){
      const bits=full?[0,...Array.from({length:8},(_,i)=>(value>>i)&1),1,1]:Array.from({length:8},(_,i)=>(value>>i)&1);
      const x0=full?10:4,step=full?48:11,high=full?29:7,low=full?78:28;
      let d='M'+x0+' '+(bits[0]?high:low);
      bits.forEach((bit,i)=>{const x=x0+i*step,y=bit?high:low;d+=' H'+x+' V'+y+' H'+(x+step)});
      return d;
    },
    updateWaves(){
      document.querySelectorAll('#simdmx-train-wagon-line .sd-car[data-ch]').forEach(car=>{
        const i=Number(car.dataset.ch),val=this.dmxChannels[i-1],svg=car.querySelector('svg'),color=this.chColors[i-1];
        const grid=Array.from({length:9},(_,j)=>`<line x1="${4+j*11}" y1="2" x2="${4+j*11}" y2="32" stroke="#9acde4" stroke-opacity=".76" stroke-width="1" ${j===0||j===8?'':'stroke-dasharray="2 2"'}/>`).join('');
        svg.innerHTML=`${grid}<path d="${this.bitWave(val,false)}" fill="none" stroke="${color}" stroke-width="2.3" stroke-linejoin="miter"/>`;
        car.classList.toggle('sd-selected',i===this.selectedChannel);
        car.querySelector('.sd-value').textContent=val.toString(2).padStart(8,'0');
      });
      const i=this.selectedChannel-1,val=this.dmxChannels[i],svg=document.getElementById('simdmx-detail-wave');
      if(svg){
        const bits=[0,...Array.from({length:8},(_,b)=>(val>>b)&1),1,1];
        let labels=bits.map((b,j)=>`<text x="${34+j*48}" y="103" text-anchor="middle" fill="${j===0?'#ff799d':j>=9?'#b99dff':'#ffce76'}" font-size="14">${b}</text>`).join('');
        const grid=Array.from({length:12},(_,j)=>`<line x1="${10+j*48}" y1="9" x2="${10+j*48}" y2="86" stroke="#a3c5dc" stroke-opacity=".7" stroke-width="1.2" ${j===0||j===11?'':'stroke-dasharray="3 4"'}/>`).join('');
        svg.innerHTML=`<rect x="10" y="9" width="48" height="77" fill="#e8386420"/><rect x="58" y="9" width="384" height="77" fill="#f4a62612"/><rect x="442" y="9" width="96" height="77" fill="#8777ff24"/>${grid}<path d="${this.bitWave(val,true)}" fill="none" stroke="#ffc04d" stroke-width="3"/>${labels}`;
      }
      document.getElementById('simdmx-wave-label').textContent='CH'+this.selectedChannel+' / '+val+' ('+val.toString(2).padStart(8,'0')+'₂)';
      document.getElementById('simdmx-selected-ch').textContent=this.selectedChannel;
      document.getElementById('simdmx-selected-value').textContent=val;
      document.getElementById('simdmx-selected-percent').textContent='約'+Math.round(val/255*100)+'%';
    },

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
            this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    },

    bindFaderEvents(ids) {
        ids.forEach(id => {
            const knob = document.getElementById(`simdmx-knob-${id}`);
            const boundary = document.getElementById(`simdmx-boundary-${id}`);
            const btnUp = document.getElementById(`simdmx-btn-up-${id}`);
            const btnDown = document.getElementById(`simdmx-btn-down-${id}`);

            const startHandler = (e) => {
                this.draggingFaderId = id;
                this.startY = e.touches ? e.touches[0].clientY : e.clientY;
                this.startBottom = parseInt(knob.style.bottom) || 0;
                e.preventDefault();
                const label = document.getElementById(`simdmx-label-${id}`);
                if(label) label.style.color = '#aaa';
            };

            knob.addEventListener('mousedown', startHandler);
            knob.addEventListener('touchstart', startHandler, { passive: false });

            const jumpHandler = (e) => {
                if (e.target === knob) return;
                const rect = boundary.getBoundingClientRect();
                const clickY = e.touches ? e.touches[0].clientY : e.clientY;
                const relY = clickY - rect.top - 13;
                let targetBottom = this.MAX_BOTTOM_DMX - relY + 13;
                if (targetBottom < 0) targetBottom = 0;
                if (targetBottom > this.MAX_BOTTOM_DMX) targetBottom = this.MAX_BOTTOM_DMX;
                knob.style.bottom = targetBottom + 'px';
                this.calculateValueFromPosition(id, targetBottom);
                startHandler(e);
            };

            boundary.addEventListener('mousedown', jumpHandler);
            boundary.addEventListener('touchstart', jumpHandler, { passive: false });

            btnUp.addEventListener('click', () => this.adjustFaderValue(id, 1));
            btnDown.addEventListener('click', () => this.adjustFaderValue(id, -1));
        });

        this._moveHandler = (e) => this.handleGlobalMove(e);
        this._endHandler = () => this.handleGlobalEnd();
        window.addEventListener('mousemove', this._moveHandler, { passive: false });
        window.addEventListener('touchmove', this._moveHandler, { passive: false });
        window.addEventListener('mouseup', this._endHandler);
        window.addEventListener('touchend', this._endHandler);
    },

    handleGlobalMove(e) {
        if (!this.draggingFaderId) return;
        e.preventDefault();
        const knob = document.getElementById(`simdmx-knob-${this.draggingFaderId}`);
        const currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = this.startY - currentY;
        let targetBottom = this.startBottom + deltaY;
        if (targetBottom < 0) targetBottom = 0;
        if (targetBottom > this.MAX_BOTTOM_DMX) targetBottom = this.MAX_BOTTOM_DMX;
        knob.style.bottom = targetBottom + 'px';
        this.calculateValueFromPosition(this.draggingFaderId, targetBottom);
    },

    handleGlobalEnd() {
        if (!this.draggingFaderId) return;
        const label = document.getElementById('simdmx-label-' + this.draggingFaderId);
        if(label) label.style.color = this.chColors[parseInt(this.draggingFaderId.replace('dmx', '')) - 1] + 'aa';
        this.draggingFaderId = null;
    },

    calculateValueFromPosition(id, position) {
        const ratio = position / this.MAX_BOTTOM_DMX;
        let chIndex = parseInt(id.replace('dmx', '')) - 1;
        this.dmxChannels[chIndex] = Math.round(ratio * 255); this.selectedChannel=chIndex+1;
        this.updateSystem();
    },

    syncPositionsFromValues() {
        for(let c=1; c<=10; c++) {
            let id = `dmx${c}`;
            let val = this.dmxChannels[c-1];
            const b = Math.round((val / 255) * this.MAX_BOTTOM_DMX);
            const knob = document.getElementById(`simdmx-knob-${id}`);
            if(knob) knob.style.bottom = b + 'px';
        }
    },

    adjustFaderValue(id, delta) {
        let chIndex = parseInt(id.replace('dmx', '')) - 1;
        this.dmxChannels[chIndex] = Math.max(0, Math.min(255, this.dmxChannels[chIndex] + delta)); this.selectedChannel=chIndex+1;
        this.syncPositionsFromValues();
        this.updateSystem();
    },

    updateSystem() {
        for(let c=1;c<=10;c++){
          const out=document.getElementById('simdmx-fader-value-'+c);
          if(out)out.textContent=this.dmxChannels[c-1];
        }
        this.updateWaves();
        const factor=this.dmxChannels[this.selectedChannel-1]/255;
        this.updateBulb(factor,factor*100);
    },

    updateBulb(factor, voltage) {
        const filamentGlow = document.getElementById('simdmx-filament-glow');
        const gasGlow = document.getElementById('simdmx-gas-glow');
        const ambientGlow = document.getElementById('simdmx-ambient-glow');
        if (voltage === 0) {
            filamentGlow.style.opacity = 0; gasGlow.style.opacity = 0; ambientGlow.style.opacity = 0;
        } else {
            let r = 255, g = 0, b = 0, shadowColor = '';
            if (factor < 0.2) { g = Math.floor(factor * 5 * 100); shadowColor = `rgba(255, 30, 0, ${0.4 + factor * 2})`; } 
            else if (factor < 0.6) { g = Math.floor(100 + ((factor - 0.2) / 0.4) * 100); b = Math.floor(((factor - 0.2) / 0.4) * 50); shadowColor = `rgba(255, 143, 0, ${0.6 + factor})`; } 
            else { g = Math.floor(200 + ((factor - 0.6) / 0.4) * 45); b = Math.floor(50 + ((factor - 0.6) / 0.4) * 110); shadowColor = `rgba(255, 235, 59, 1)`; }
            filamentGlow.style.opacity = (0.25 + factor * 0.75).toString();
            filamentGlow.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            filamentGlow.style.boxShadow = `0 0 ${8 + factor * 28}px ${shadowColor}, 0 0 ${3 + factor * 12}px #fff`;
            gasGlow.style.opacity = Math.min(factor * 1.1, 1.0).toString();
            ambientGlow.style.opacity = factor.toString();
            ambientGlow.style.transform = `scale(${0.3 + (factor * 0.9)})`;
        }
    },

    animationLoop(timestamp) {
        if(!this.lastTime)this.lastTime=timestamp;
        const delta=Math.min(.05,(timestamp-this.lastTime)/1000);this.lastTime=timestamp;
        if(!this.running)return;
        const line=document.getElementById('simdmx-train-wagon-line');
        const track=document.querySelector('.simdmx-v2 .sd-track');
        if(!line||!track)return;
        // 約44Hzはフレーム更新頻度の理論値。CSS上の移動速度とは異なる。
        this.trainPosition-=210*delta;
        const width=line.scrollWidth;
        if(this.trainPosition < -width)this.trainPosition=track.clientWidth;
        line.style.transform='translateX('+this.trainPosition+'px)';
    }
};