// Compare the SCR phase-controlled load voltage (RMS) against one 8-bit DMX command.
// Curves are illustrative power laws, not a claim of JATET compliance.
const Module_Sim8Bit = {
    dmx8Bit: 191,
    curveMode: 'linear',
    current8bitView: 'wave',
    getHTML() {
        return `
        <div class="sim8-workbench">
          <section class="sim8-input sim8-zone">
            <h2>① フェーダーを動かす</h2>
            <p class="sim8-note">前ページと同じフェーダーで操作しよう。</p>
            <div class="sim8-position"><span>フェーダー位置</span><strong id="sim8bit-num-percent">75%</strong></div>
            <div class="sim8-fader">
              <div class="sim8-fader-figure" id="sim8bit-fader" role="slider" tabindex="0"
                   aria-label="8bitのフェーダー位置" aria-orientation="vertical"
                   aria-valuemin="0" aria-valuemax="255" aria-valuenow="191">
                <img class="sim8-fader-body" src="assets/control/fader-body.webp" alt="" width="278" height="688">
                <img class="sim8-fader-cap" id="sim8bit-fader-cap" src="assets/control/fader-cap.png" alt="" width="89" height="89">
              </div>
            </div>
            <div class="sim8-step"><button id="sim8bit-down" aria-label="DMX値を1下げる">−</button><button id="sim8bit-up" aria-label="DMX値を1上げる">＋</button></div>
          </section>
          <section class="sim8-signal sim8-zone">
            <div class="sim8-dmx-head"><div><h2>② SCR出力とDMXの8bitを比べる</h2><p class="sim8-note" id="sim8bit-value-label">SCR出力の実効電圧</p></div><div class="sim8-dmx-value"><strong id="sim8bit-num-dmx">86.5</strong><span id="sim8bit-value-unit">V</span></div></div>
            <div class="sim8-views" role="group" aria-label="見る図を選ぶ">
              <button data-sim8-view="wave" aria-pressed="true">SCR出力</button><button data-sim8-view="digital" aria-pressed="false">DMX 8bit</button><button data-sim8-view="curve" aria-pressed="false">出力カーブ</button>
            </div>
            <div class="sim8-graph" id="sim8bit-upper-graph-box"></div>
            <div class="sim8-curve-controls"><div class="sim8-curves" role="group" aria-label="出力カーブ">
              <button data-sim8-curve="linear" aria-pressed="true">直線</button><button data-sim8-curve="jat-a" aria-pressed="false">ゆっくり</button><button data-sim8-curve="jat-b" aria-pressed="false">さらにゆっくり</button>
            </div></div>

          </section>
          <section class="sim8-light sim8-zone">
            <h2>③ 灯りを見る</h2><p class="sim8-note">数字と、見た目を見比べよう。</p>
            <div class="dark-room">
              <div id="sim8bit-ambient-glow" style="position:absolute;inset:0;background:radial-gradient(circle,rgba(255,160,20,.5),transparent 70%);opacity:0"></div>
              <div class="bulb-image-container" style="position: relative; width: 220px; height: 360px; display: flex; align-items: center; justify-content: center;">
                            <img src="assets/Light.webp" class="large-bulb-img" alt="Bulb Base" style="width: 100%; height: 100%; object-fit: contain; z-index: 1; pointer-events: none; opacity: 0.85;">
                            <div class="internal-gas-glow" id="sim8bit-gas-glow" style="position: absolute; top: 6%; left: 5%; width: 90%; height: 55%; border-radius: 50%; background: radial-gradient(circle, rgba(255,213,79,0.9) 0%, rgba(255,109,0,0.3) 55%, rgba(0,0,0,0) 75%); z-index: 2; mix-blend-mode: screen; pointer-events: none; opacity: 0; transition: opacity 0.05s ease;"></div>
                            <div class="filament-glow-layer" id="sim8bit-filament-glow" style="position: absolute; top: 25%; left: 36%; width: 28%; height: 12%; z-index: 3; mix-blend-mode: screen; pointer-events: none; opacity: 0; border-radius: 40% 40% 50% 50%; box-shadow: 0 0 0px rgba(0,0,0,0); transition: opacity 0.05s ease, background-color 0.05s ease, box-shadow 0.05s ease;"></div>
                        </div>
            </div>
            <div class="sim8-light-state" id="sim8bit-light-state">点灯中</div>
            <p class="sim8-note">フェーダーの％と、目で感じる明るさは同じではありません。</p>
          </section>
        </div>`;
    },
    init() {
        this.destroy();
        const root = document.querySelector('.sim8-workbench');
        if (!root) return;
        this.abort = new AbortController();
        const options = {signal: this.abort.signal};
        const fader=root.querySelector('#sim8bit-fader');
        const valueAtY=(y)=>{
            const rect=fader.getBoundingClientRect();
            if (!rect.height) return this.dmx8Bit;
            // Same approved artwork/throw as DimmingControl: 100% top / 0% bottom.
            return Math.round(Math.max(0,Math.min(1,(0.84-(y-rect.top)/rect.height)/0.67))*255);
        };
        fader.addEventListener('pointerdown',e=>{
            e.preventDefault();fader.setPointerCapture(e.pointerId);
            this.dmx8Bit=valueAtY(e.clientY);this.updateSystem();
        },options);
        fader.addEventListener('pointermove',e=>{
            if(fader.hasPointerCapture(e.pointerId)){
                this.dmx8Bit=valueAtY(e.clientY);this.updateSystem();
            }
        },options);
        fader.addEventListener('keydown',e=>{
            const delta={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1,PageUp:10,PageDown:-10}[e.key];
            if(delta){e.preventDefault();this.adjustFaderValue(delta);}
            else if(e.key==='Home'||e.key==='End'){
                e.preventDefault();this.dmx8Bit=e.key==='Home'?0:255;this.updateSystem();
            }
        },options);
        root.querySelector('#sim8bit-up').addEventListener('click', () => this.adjustFaderValue(1), options);
        root.querySelector('#sim8bit-down').addEventListener('click', () => this.adjustFaderValue(-1), options);
        root.querySelectorAll('[data-sim8-view]').forEach(button => button.addEventListener('click', () => {
            this.current8bitView = button.dataset.sim8View; this.updateSystem();
        }, options));
        root.querySelectorAll('[data-sim8-curve]').forEach(button => button.addEventListener('click', () => {
            this.curveMode = button.dataset.sim8Curve; this.updateSystem();
        }, options));
        this.observer = new ResizeObserver(() => this.resizeCanvas());
        this.observer.observe(root.querySelector('.sim8-graph'));
        this.updateSystem();
    },
    destroy() { this.abort?.abort(); this.observer?.disconnect(); },
    resizeCanvas() {
        // SVG coordinates follow the actual panel width: labels remain 16px on screen.
        if (document.querySelector('.sim8-workbench')) this.drawGraph();
    },
    getCurveFactor(val, mode) {
        const x = Math.max(0, Math.min(255, val)) / 255;
        return mode === 'jat-a' ? Math.pow(x, 2.3) : mode === 'jat-b' ? Math.pow(x, 2.7) : x;
    },
    // Resistive-load example: invert the sine-squared energy integral.
    // Curves describe normalized output voltage; waveform energy uses its square.
    getFiringAngle(power) {
        if (power <= 0) return Math.PI;
        if (power >= 1) return 0;
        let low = 0, high = Math.PI;
        for (let i = 0; i < 40; i++) {
            const a = (low + high) / 2;
            const delivered = (Math.PI - a + Math.sin(2 * a) / 2) / Math.PI;
            if (delivered > power) low = a; else high = a;
        }
        return (low + high) / 2;
    },
    adjustFaderValue(delta) {
        this.dmx8Bit = Math.max(0, Math.min(255, this.dmx8Bit + delta)); this.updateSystem();
    },
    updateSystem() {
        const root = document.querySelector('.sim8-workbench');
        if (!root) return;
        const fader=root.querySelector('#sim8bit-fader');
        const position=this.dmx8Bit/255;
        fader.setAttribute('aria-valuenow',String(this.dmx8Bit));
        fader.setAttribute('aria-valuetext',Math.round(position*100)+'パーセント、8bit値 '+this.dmx8Bit);
        root.querySelector('#sim8bit-fader-cap').style.top=(77.5-66*position)+'%';
        document.getElementById('sim8bit-num-percent').textContent = Math.round(position*100) + '%';
        root.querySelectorAll('[data-sim8-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sim8View === this.current8bitView)));
        root.querySelectorAll('[data-sim8-curve]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sim8Curve === this.curveMode)));
        const factor = this.getCurveFactor(this.dmx8Bit, this.curveMode);
        const digital = this.current8bitView === 'digital';
        document.getElementById('sim8bit-num-dmx').textContent = digital ? this.dmx8Bit : (100 * factor).toFixed(1);
        document.getElementById('sim8bit-value-unit').textContent = digital ? 'DMX' : 'V';
        document.getElementById('sim8bit-value-label').textContent = digital ? '調光器への数値指令：0〜255' : 'SCRから灯具へのAC出力（実効値）';
        this.updateBulb(factor, factor);
        document.getElementById('sim8bit-light-state').textContent = this.dmx8Bit === 0 ? '消灯' : this.dmx8Bit === 255 ? '最大の指示で点灯' : '点灯中';
        const teacher = document.getElementById('sim8-teacher-message');
        if (teacher) teacher.innerHTML = this.current8bitView === 'digital'
          ? 'DMXの1つの値は8個の0／1。<br>受信側へ送る指令で、電球の電圧そのものではないよ。'
          : this.current8bitView === 'curve'
          ? '「直線」は実効電圧が位置に比例する教材例。<br>変わるのは点弧角で、波形を半分に切る意味じゃないよ。'
          : 'SCRは交流の途中から通電するよ。<br>フェーダー50％＝通電時間50％ではないんだ。';
        this.drawGraph();
    },
    drawGraph(size) {
        const box = document.getElementById('sim8bit-upper-graph-box');
        if (!box) return;
        if (this.current8bitView === 'digital') {
            const weights = [128,64,32,16,8,4,2,1];
            const terms = weights.filter(w => (this.dmx8Bit & w) !== 0);
            box.innerHTML = `<h3>8個の0／1で、256段階</h3><p class="sim8-note">1の桁だけ、その下の数字を足します。</p>
              <div class="sim8-bits">${weights.map((w,i) => `<div class="sim8-bit ${this.dmx8Bit & w ? 'on' : ''}"><strong>${(this.dmx8Bit >> (7-i)) & 1}</strong><span>${w}</span></div>`).join('')}</div>
              <p class="sim8-sum">${terms.length ? terms.join(' ＋ ') : '0'}<br><b>＝ ${this.dmx8Bit}</b></p><p class="sim8-note sim8-byte-note">DMXの1つの値＝8bit（0〜255）。これは制御指令。電球へ送る交流電圧とは別。</p>`;
            return;
        }
        const w = size?.w || Math.max(280, box.clientWidth - 16);
        const h = size?.h || Math.max(80, box.clientHeight - (this.current8bitView === 'wave' ? 90 : 68));
        const x0 = 35, x1 = w - 15, y0 = 28, y1 = h - 28;
        const factor = this.getCurveFactor(this.dmx8Bit, this.curveMode);
        let svg = '';
        const text = (x,y,label,anchor='start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="#e2e8ef" font-size="16">${label}</text>`;
        if (this.current8bitView === 'curve') {
            for (const mode of ['linear','jat-a','jat-b']) {
                const points = Array.from({length:101},(_,i) => `${x0+i/100*(x1-x0)},${y1-this.getCurveFactor(i/100*255,mode)*(y1-y0)}`).join(' ');
                svg += `<polyline points="${points}" fill="none" stroke="${mode===this.curveMode?'#ffb84d':'#8796a5'}" stroke-width="${mode===this.curveMode?3:1.5}" ${mode===this.curveMode?'':'stroke-dasharray="5 5" opacity=".5"'}/>`;
            }
            svg += `<path d="M${x0} ${y0}V${y1}H${x1}" fill="none" stroke="#b3bfcb"/>
              <circle cx="${x0+this.dmx8Bit/255*(x1-x0)}" cy="${y1-factor*(y1-y0)}" r="7" fill="#ff4b55" stroke="#fff" stroke-width="2"/>`;
            svg += text(x0,18,'実効電圧 100V') + text(x0,y1+22,'0%') + text(x1,y1+22,'フェーダー位置 100%','end');
            box.innerHTML = `<h3>フェーダー位置とSCRの出力実効電圧</h3><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="フェーダー位置と出力実効電圧の関係">${svg}</svg><p class="sim8-note">直線は実効電圧が位置に比例する教材モデル。ゆっくり／さらにゆっくりは比較用の仮想カーブ。</p>`;
            if (!size) { const s=box.querySelector('svg'); if(s.clientHeight>0) this.drawGraph({w:s.clientWidth,h:s.clientHeight}); }
            return;
        }
        const mid = (y0+y1)/2, amp = (y1-y0)/2 - 5, alpha = this.getFiringAngle(factor * factor);
        const firingDeg=Math.round(alpha*180/Math.PI);
        const voltageV=(100*factor).toFixed(1);
        const powerPct=Math.round(100*factor*factor);
        const curveName=this.curveMode==='linear'?'直線（電圧比例）':this.curveMode==='jat-a'?'ゆっくり':'さらにゆっくり';
        const px = a => x0 + a/(2*Math.PI)*(x1-x0);
        const py = a => mid - Math.sin(a)*amp;
        const points = Array.from({length:241},(_,i) => `${px(i/240*2*Math.PI)},${py(i/240*2*Math.PI)}`).join(' ');
        svg += `<path d="M${x0} ${mid}H${x1}" stroke="#aebac6" stroke-width="1.5"/>
          <polyline points="${points}" fill="none" stroke="#bdc8d4" stroke-width="2" stroke-dasharray="6 5"/>`;
        for (let half = 0; half < 2; half++) {
            const start = half*Math.PI + alpha, end = (half+1)*Math.PI;
            const p = Array.from({length:101},(_,i) => {const a = start+(end-start)*i/100;return `${px(a)},${py(a)}`;}).join(' ');
            svg += `<polygon points="${px(start)},${mid} ${p} ${px(end)},${mid}" fill="#ffad3d" opacity=".24"/>
              <polyline points="${px(half*Math.PI)},${mid} ${px(start)},${mid} ${p}" fill="none" stroke="#ffb84d" stroke-width="3"/>`;
            if (factor > 0 && factor < 1) svg += `<circle cx="${px(start)}" cy="${py(start)}" r="7" fill="#ff4b55" stroke="#fff" stroke-width="2"/>`;
        }
        svg += text(8,mid+5,'0') + text(px(Math.PI/2),y0,'山','middle') + text(px(3*Math.PI/2),y1+2,'谷','middle') + text(x1,h-4,'時間 →','end');
        box.innerHTML = `<h3>SCRの位相制御｜通電開始位置を見る</h3><div class="sim8-legend"><span>┄ 電源（100V・実効値）</span><span>━ 灯具へ通す部分</span></div><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="山と谷を含む1周期の波。破線が元の交流、橙色がSCRの調光出力、赤い点が点弧位置。">${svg}</svg><div class="sim8-scr-explain"><strong>${curveName}｜出力 ${voltageV}V（実効値）・点弧角 約${firingDeg}°</strong><span>フェーダーの％は通電時間の割合ではない。抵抗一定のモデルなら電力は最大の約${powerPct}％。</span></div>`;
        if (!size) { const s=box.querySelector('svg'); if(s.clientHeight>0) this.drawGraph({w:s.clientWidth,h:s.clientHeight}); }
    },
    updateBulb(factor, voltage) {
        const filamentGlow = document.getElementById('sim8bit-filament-glow');
        const gasGlow = document.getElementById('sim8bit-gas-glow');
        const ambientGlow = document.getElementById('sim8bit-ambient-glow');
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
    }
};

