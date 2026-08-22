const Module_Sim8Bit = {
    // --- 内部状態管理 ---
    dmx8Bit: 191,
    curveMode: 'linear',
    current8bitView: 'analog',
    MAX_BOTTOM: 252,
    canvasMain: null,
    ctxMain: null,
    draggingFaderId: null,
    startY: 0,
    startBottom: 0,

    // --- 定数定義 ---
    curveColors: { 'linear': '#ffffff', 'jat-a': '#ff6f00', 'jat-b': '#00e5ff' },

    // --- HTMLテンプレート（ノブの赤線スリットを完全復元） ---
    getHTML() {
        return `
            <div style="display: flex; width: 100%; height: 100%; gap: 20px;">
                <div class="col fader-col" id="sim8bit-fader-column" style="width: 18%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: #0f0f0f; border-radius: 10px; padding: 10px 5px; border: 1px solid #222;">
                    <div class="fader-bank" style="display: flex; width: 100%; height: 100%; justify-content: center; gap: 5px;">
                        <div class="fader-cell-wrap" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 100%; flex: 1;">
                            <button class="step-btn" id="sim8bit-btn-up-main" style="width: 42px; height: 35px; background: #252525; border: 2px solid #444; border-radius: 6px; color: #e0e0e0; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 5px rgba(0,0,0,0.3); -webkit-tap-highlight-color: transparent;">▲</button>
                            <div class="fader-area" id="sim8bit-boundary-main" data-fader="main" style="height: 340px; width: 50px; position: relative; touch-action: none;">
                                <div class="fader-scale" style="position: absolute; left: -2px; height: 300px; top: 20px; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; font-weight: bold; color: #505050; z-index: 0;">
                                    <div>100</div><div>75</div><div>50</div><div>25</div><div>0</div>
                                </div>
                                <div class="fader-track-container" data-fader="main" style="position: absolute; right: 0px; width: 34px; height: 300px; top: 20px;">
                                    <div class="fader-track" style="position: absolute; left: 15px; width: 4px; height: 100%; background: #000; border: 1px solid #2a2a2a; border-radius: 2px;"></div>
                                    <!-- 内包する赤線スリット用div（::afterの完全代替）を追加 -->
                                    <div class="fader-knob" id="sim8bit-knob-main" style="position: absolute; left: 0; width: 34px; height: 48px; background: #d5d5d5; border: 3px solid #444; border-radius: 4px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2; bottom: 0px;">
                                        <div style="width: 100%; height: 3px; background: #ff3d00;"></div>
                                    </div>
                                </div>
                            </div>
                            <button class="step-btn" id="sim8bit-btn-down-main" style="width: 42px; height: 35px; background: #252525; border: 2px solid #444; border-radius: 6px; color: #e0e0e0; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 5px rgba(0,0,0,0.3); -webkit-tap-highlight-color: transparent;">▼</button>
                            <div class="fader-label" id="sim8bit-label-main" style="font-size: 10px; font-weight: bold; color: #555; text-align: center; white-space: nowrap;">FADER</div>
                        </div>
                    </div>
                </div>

                <div class="col center-col" style="width: 44%; display: flex; flex-direction: column; gap: 12px;">
                    <div class="section-title" style="font-size: 11px; font-weight: bold; color: #888; letter-spacing: 2px; text-align: center; margin-bottom: 3px;">数値モニター</div>
                    <div class="digital-row" style="display: flex; gap: 8px;">
                        <div class="led-panel" style="background: #090d10; border: 2px solid #3d4b55; border-radius: 6px; padding: 8px 3px; flex: 1; text-align: center;">
                            <div class="led-label" style="font-size: 11px; color: #9fb2bf; margin-bottom: 2px; font-weight: bold;">明るさの割合</div>
                            <div class="led-num" id="sim8bit-num-percent" style="font-size: 22px; font-weight: 700; color: #00e5ff; text-shadow: 0 0 8px rgba(0,229,255,0.5);">75%</div>
                        </div>
                        <div class="led-panel" style="background: #090d10; border: 2px solid #3d4b55; border-radius: 6px; padding: 8px 3px; flex: 1; text-align: center;">
                            <div class="led-label" style="font-size: 11px; color: #9fb2bf; margin-bottom: 2px; font-weight: bold;">DMX値</div>
                            <div class="led-num" id="sim8bit-num-dmx" style="font-size: 22px; line-height: 26px; font-weight: 700; color: #66e8ff; text-shadow: 0 0 8px rgba(0,229,255,0.45);">191</div>
                        </div>
                        <div class="led-panel" style="background: #050505; border: 2px solid #ff3d00; border-radius: 6px; padding: 8px 3px; flex: 1; text-align: center;">
                            <div class="led-label" style="font-size: 11px; color: #ff6d00; margin-bottom: 2px; font-weight: bold;">出力電圧</div>
                            <div class="led-num" id="sim8bit-num-voltage" style="font-size: 22px; font-weight: 700; color: #ff3d00; text-shadow: 0 0 8px rgba(255,61,0,0.6);">75.0 V</div>
                        </div>
                    </div>

                    <div class="view-mode-selector" style="display: flex; background: #080808; padding: 3px; border-radius: 6px; border: 1px solid #222; width: 100%;">
                        <button id="sim8bit-toggle-analog" class="view-toggle-btn active" style="flex: 1; background: #252525; border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 6px 0; cursor: pointer; border-radius: 4px; transition: all 0.2s; -webkit-tap-highlight-color: transparent; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">【ANALOG】 3本カーブ & 通電面積表示</button>
                        <button id="sim8bit-toggle-digital" class="view-toggle-btn" style="flex: 1; background: transparent; border: none; color: #555; font-size: 11px; font-weight: bold; padding: 6px 0; cursor: pointer; border-radius: 4px; transition: all 0.2s; -webkit-tap-highlight-color: transparent;">【DIGITAL】 8-Bit 光グラフ表示</button>
                    </div>

                    <div class="panel-box" id="sim8bit-upper-graph-box" style="background: #0c0c0c; border: 2px solid #444; border-radius: 8px; padding: 10px; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden;"></div>

                    <div class="panel-box" style="background: #0c0c0c; border: 2px solid #444; border-radius: 8px; padding: 10px; flex-grow: 0; display: flex; flex-direction: column; overflow: hidden;">
                        <div class="led-label" style="text-align: center; font-size: 10px; color: #666; margin-bottom: 2px; font-weight: bold;">DMX値の中身：8個の0/1</div>
                        <div class="matrix-grid" id="sim8bit-binary-matrix-grid" style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px; margin-top: 6px;"></div>
                    </div>

                    <div class="curve-selector" id="sim8bit-curve-selector-row" style="display: flex; justify-content: center; gap: 8px; margin-top: 2px;">
                        <button id="sim8bit-curve-jat-a" class="toggle-btn" style="font-weight: bold; font-size: 11px; background: #222; border: 2px solid #444; color: #888; padding: 6px 12px; border-radius: 6px; cursor: pointer; -webkit-tap-highlight-color: transparent;">JATET A (2.3乗)</button>
                        <button id="sim8bit-curve-lin" class="toggle-btn active" style="font-weight: bold; font-size: 11px; background: #ff6f00; border: 2px solid #ff6f00; color: #fff; padding: 6px 12px; border-radius: 6px; cursor: pointer; -webkit-tap-highlight-color: transparent; box-shadow: 0 0 10px rgba(255,111,0,0.5);">LINEAR (直線)</button>
                        <button id="sim8bit-curve-jat-b" class="toggle-btn" style="font-weight: bold; font-size: 11px; background: #222; border: 2px solid #444; color: #888; padding: 6px 12px; border-radius: 6px; cursor: pointer; -webkit-tap-highlight-color: transparent;">JATET B (2.7乗)</button>
                    </div>
                </div>

                <div class="col bulb-col" style="width: 38%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                    <div class="section-title" style="font-size: 11px; font-weight: bold; color: #888; letter-spacing: 2px; text-align: center; margin-bottom: 3px;">見た目の明るさ</div>
                    <div class="dark-room" style="width: 100%; height: 100%; background: #030303; border: 2px solid #444; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: visible; position: relative;">
                        <div class="ambient-glow" id="sim8bit-ambient-glow" style="position: absolute; top: -5%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,143,0,0.38) 0%, rgba(255,87,34,0.08) 50%, rgba(0,0,0,0) 70%); mix-blend-mode: screen; pointer-events: none; opacity: 0; transform: scale(0.3); transition: opacity 0.05s ease, transform 0.05s ease; z-index: 0;"></div>
                        <div class="bulb-image-container" style="position: relative; width: 220px; height: 360px; display: flex; align-items: center; justify-content: center;">
                            <img src="assets/Light.png" class="large-bulb-img" alt="Bulb Base" style="width: 100%; height: 100%; object-fit: contain; z-index: 1; pointer-events: none; opacity: 0.85;">
                            <div class="internal-gas-glow" id="sim8bit-gas-glow" style="position: absolute; top: 6%; left: 5%; width: 90%; height: 55%; border-radius: 50%; background: radial-gradient(circle, rgba(255,213,79,0.9) 0%, rgba(255,109,0,0.3) 55%, rgba(0,0,0,0) 75%); z-index: 2; mix-blend-mode: screen; pointer-events: none; opacity: 0; transition: opacity 0.05s ease;"></div>
                            <div class="filament-glow-layer" id="sim8bit-filament-glow" style="position: absolute; top: 25%; left: 36%; width: 28%; height: 12%; z-index: 3; mix-blend-mode: screen; pointer-events: none; opacity: 0; border-radius: 40% 40% 50% 50%; box-shadow: 0 0 0px rgba(0,0,0,0); transition: opacity 0.05s ease, background-color 0.05s ease, box-shadow 0.05s ease;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.update8bitViewDOM();
        const matrixGrid = document.getElementById('sim8bit-binary-matrix-grid');
        matrixGrid.innerHTML = Array.from({length: 8}, (_, i) => `
            <div class="matrix-cell" id="sim8bit-cell-${7-i}" style="flex: 1; min-width: 22px; height: 34px; background: #151515; border: 2px solid #444; border-radius: 4px; font-size: 15px; font-weight: bold; line-height: 30px; text-align: center; color: #444; transition: all 0.05s ease;">0</div>
        `).join('');
        this.bindEvents();
        this.syncPositionsFromValues();
        this.updateSystem();
    },

    update8bitViewDOM() {
        const upperGraphBox = document.getElementById('sim8bit-upper-graph-box');
        if (this.current8bitView === 'analog') {
            upperGraphBox.innerHTML = `
                <div class="monitor-canvas-container" style="width: 100%; height: 100%; min-height: 120px; background: #000; border: 1px solid #1a1a1a; border-radius: 4px; position: relative;">
                    <canvas id="sim8bit-main-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
                </div>`;
            this.canvasMain = document.getElementById('sim8bit-main-canvas');
            this.ctxMain = this.canvasMain.getContext('2d');
            document.getElementById('sim8bit-curve-selector-row').style.display = "flex"; 
            this.resizeCanvas();
        } else {
            this.canvasMain = null;
            this.ctxMain = null;
            upperGraphBox.innerHTML = `
                <div class="led-label" style="text-align: center; font-size: 10px; color: #666; margin-bottom: 2px; font-weight: bold;">8-BIT LUMINANCE GRAPH</div>
                <div class="graph-grid" id="sim8bit-graph-grid-8bit" style="display: flex; justify-content: space-between; align-items: flex-end; height: 120px; border-bottom: 2px solid #333; padding: 0 2px; margin-top: 5px;">
                    ${[128, 64, 32, 16, 8, 4, 2, 1].map((w, i) => `
                        <div class="bar-wrap" style="display: flex; flex-direction: column; align-items: center; width: 11%;"><div class="bar-fill" id="sim8bit-bar-${7-i}" style="width: 100%; background: #151515; border: 1.5px solid #252525; border-bottom: none; border-radius: 2px 2px 0 0; height: 2px; transition: height 0.05s ease, background-color 0.05s ease;"></div><div class="bar-num" style="font-size: 9px; font-weight: bold; color: #555; margin-top: 4px;">${w}</div></div>
                    `).join('')}
                </div>`;
            document.getElementById('sim8bit-curve-selector-row').style.display = "none"; 
        }
    },

    resizeCanvas() {
        if (this.current8bitView === 'analog' && this.canvasMain) {
            this.canvasMain.width = this.canvasMain.clientWidth * window.devicePixelRatio;
            this.canvasMain.height = this.canvasMain.clientHeight * window.devicePixelRatio;
            this.ctxMain.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    },

    bindEvents() {
        const knob = document.getElementById('sim8bit-knob-main');
        const boundary = document.getElementById('sim8bit-boundary-main');
        const btnUp = document.getElementById('sim8bit-btn-up-main');
        const btnDown = document.getElementById('sim8bit-btn-down-main');

        const startHandler = (e) => {
            this.draggingFaderId = 'main';
            this.startY = e.touches ? e.touches[0].clientY : e.clientY;
            this.startBottom = parseInt(knob.style.bottom) || 0;
            e.preventDefault();
            const label = document.getElementById('sim8bit-label-main');
            if(label) label.style.color = '#aaa';
        };

        knob.addEventListener('mousedown', startHandler);
        knob.addEventListener('touchstart', startHandler, { passive: false });

        const jumpHandler = (e) => {
            if (e.target === knob) return;
            const rect = boundary.getBoundingClientRect();
            const clickY = e.touches ? e.touches[0].clientY : e.clientY;
            const relY = clickY - rect.top - 20; 
            let targetBottom = this.MAX_BOTTOM - relY + 24; 
            
            if (targetBottom < 0) targetBottom = 0;
            if (targetBottom > this.MAX_BOTTOM) targetBottom = this.MAX_BOTTOM;
            
            knob.style.bottom = targetBottom + 'px';
            this.calculateValueFromPosition(targetBottom);
            startHandler(e); 
        };

        boundary.addEventListener('mousedown', jumpHandler);
        boundary.addEventListener('touchstart', jumpHandler, { passive: false });

        btnUp.addEventListener('click', () => this.adjustFaderValue(1));
        btnDown.addEventListener('click', () => this.adjustFaderValue(-1));

        this._moveHandler = (e) => this.handleGlobalMove(e);
        this._endHandler = () => this.handleGlobalEnd();
        window.addEventListener('mousemove', this._moveHandler, { passive: false });
        window.addEventListener('touchmove', this._moveHandler, { passive: false });
        window.addEventListener('mouseup', this._endHandler);
        window.addEventListener('touchend', this._endHandler);

        document.getElementById('sim8bit-toggle-analog').addEventListener('click', () => {
            if(this.current8bitView === 'analog') return;
            this.current8bitView = 'analog';
            document.getElementById('sim8bit-toggle-analog').style.background = '#252525'; document.getElementById('sim8bit-toggle-analog').style.color = '#fff';
            document.getElementById('sim8bit-toggle-digital').style.background = 'transparent'; document.getElementById('sim8bit-toggle-digital').style.color = '#555';
            this.update8bitViewDOM(); this.updateSystem();
        });
        document.getElementById('sim8bit-toggle-digital').addEventListener('click', () => {
            if(this.current8bitView === 'digital') return;
            this.current8bitView = 'digital';
            document.getElementById('sim8bit-toggle-digital').style.background = '#252525'; document.getElementById('sim8bit-toggle-digital').style.color = '#fff';
            document.getElementById('sim8bit-toggle-analog').style.background = 'transparent'; document.getElementById('sim8bit-toggle-analog').style.color = '#555';
            this.update8bitViewDOM(); this.updateSystem();
        });

        const setCurve = (mode, btnId) => {
            this.curveMode = mode;
            ['sim8bit-curve-lin', 'sim8bit-curve-jat-a', 'sim8bit-curve-jat-b'].forEach(id => {
                const b = document.getElementById(id);
                b.style.background = '#222'; b.style.borderColor = '#444'; b.style.color = '#888'; b.style.boxShadow = 'none';
            });
            const ab = document.getElementById(btnId);
            ab.style.background = '#ff6f00'; ab.style.borderColor = '#ff6f00'; ab.style.color = '#fff'; ab.style.boxShadow = '0 0 10px rgba(255,111,0,0.5)';
            this.updateSystem();
        };
        document.getElementById('sim8bit-curve-jat-a').addEventListener('click', () => setCurve('jat-a', 'sim8bit-curve-jat-a'));
        document.getElementById('sim8bit-curve-lin').addEventListener('click', () => setCurve('linear', 'sim8bit-curve-lin'));
        document.getElementById('sim8bit-curve-jat-b').addEventListener('click', () => setCurve('jat-b', 'sim8bit-curve-jat-b'));
    },

    destroy() {
        window.removeEventListener('mousemove', this._moveHandler);
        window.removeEventListener('touchmove', this._moveHandler);
        window.removeEventListener('mouseup', this._endHandler);
        window.removeEventListener('touchend', this._endHandler);
    },

    handleGlobalMove(e) {
        if (!this.draggingFaderId) return;
        e.preventDefault();
        const knob = document.getElementById('sim8bit-knob-main');
        const currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = this.startY - currentY;
        let targetBottom = this.startBottom + deltaY;
        if (targetBottom < 0) targetBottom = 0;
        if (targetBottom > this.MAX_BOTTOM) targetBottom = this.MAX_BOTTOM;
        knob.style.bottom = targetBottom + 'px';
        this.calculateValueFromPosition(targetBottom);
    },

    handleGlobalEnd() {
        if (!this.draggingFaderId) return;
        const label = document.getElementById('sim8bit-label-main');
        if(label) label.style.color = '#555';
        this.draggingFaderId = null;
    },

    calculateValueFromPosition(position) {
        const ratio = position / this.MAX_BOTTOM;
        this.dmx8Bit = Math.round(ratio * 255);
        this.updateSystem();
    },

    syncPositionsFromValues() {
        const b = Math.round((this.dmx8Bit / 255) * this.MAX_BOTTOM);
        const knob = document.getElementById('sim8bit-knob-main');
        if (knob) knob.style.bottom = b + 'px';
    },

    adjustFaderValue(delta) {
        this.dmx8Bit = Math.max(0, Math.min(255, this.dmx8Bit + delta));
        this.syncPositionsFromValues();
        this.updateSystem();
    },

    getCurveFactor(val, mode) {
        let x = val / 255;
        if (mode === 'linear') return x;
        if (mode === 'jat-a') return Math.pow(x, 2.3); 
        if (mode === 'jat-b') return Math.pow(x, 0.6); 
        return x;
    },

    updateSystem() {
        let factor = 0; let voltage = 0; let ratio = 0;
        document.getElementById('sim8bit-num-dmx').textContent = this.dmx8Bit;
        factor = this.getCurveFactor(this.dmx8Bit, this.curveMode);
        ratio = Math.round((this.dmx8Bit / 255) * 100);
        document.getElementById('sim8bit-num-percent').textContent = ratio + '%';
        voltage = factor * 100;

        if (this.current8bitView === 'analog') {
            this.draw8bitAnalogCanvas(factor);
        } else {
            for (let i = 0; i < 8; i++) {
                const bar = document.getElementById('sim8bit-bar-' + i);
                const isSet = (this.dmx8Bit >> i) & 1;
                if (bar) {
                    if (isSet) {
                        bar.style.background = '#66e8ff'; bar.style.borderColor = '#2ad4ff'; bar.style.boxShadow = '0 0 8px rgba(42,212,255,0.35)';
                        bar.style.height = (Math.pow(2, i) / 128 * 110) + 'px';
                    } else {
                        bar.style.background = '#151515'; bar.style.borderColor = '#252525'; bar.style.boxShadow = 'none';
                        bar.style.height = '2px';
                    }
                }
            }
        }

        for (let i = 0; i < 8; i++) {
            const cell = document.getElementById('sim8bit-cell-' + i);
            const isSet = (this.dmx8Bit >> i) & 1;
            if (cell) {
                cell.textContent = isSet ? '1' : '0';
                if (isSet) {
                    cell.style.background = '#123946'; cell.style.color = '#d9fbff'; cell.style.borderColor = '#2ad4ff'; cell.style.boxShadow = '0 0 6px rgba(42,212,255,0.35)';
                } else {
                    cell.style.background = '#151515'; cell.style.color = '#444'; cell.style.borderColor = '#444'; cell.style.boxShadow = 'none';
                }
            }
        }

        document.getElementById('sim8bit-num-voltage').textContent = voltage.toFixed(2) + ' V';
        this.updateBulb(factor, voltage);
    },

    draw8bitAnalogCanvas(factor) {
        if(!this.canvasMain || !this.ctxMain) return;
        let w = this.canvasMain.clientWidth; let h = this.canvasMain.clientHeight;
        this.ctxMain.clearRect(0, 0, w, h);
        let padLeft = 15; let padRight = 15; let midX = w * 0.46; 
        this.ctxMain.strokeStyle = '#1a1a1a'; this.ctxMain.lineWidth = 1;
        this.ctxMain.beginPath(); this.ctxMain.moveTo(midX, 0); this.ctxMain.lineTo(midX, h); this.ctxMain.stroke();

        let gw = midX - padLeft - 15; let gh = h - 35; let gyStart = 15;
        const allCurves = ['linear', 'jat-a', 'jat-b'];

        allCurves.forEach(m => {
            if (m !== this.curveMode) {
                this.ctxMain.beginPath(); this.ctxMain.lineWidth = 1.5; this.ctxMain.strokeStyle = 'rgba(160, 160, 160, 0.25)'; 
                for(let i=0; i<=40; i++) {
                    let f = this.getCurveFactor((i / 40) * 255, m);
                    let gx = padLeft + (i/40)*gw; let gy = gyStart + gh - (f * gh);
                    if(i===0) this.ctxMain.moveTo(gx, gy); else this.ctxMain.lineTo(gx, gy);
                }
                this.ctxMain.stroke();
            }
        });

        this.ctxMain.beginPath(); this.ctxMain.lineWidth = 2.5; this.ctxMain.strokeStyle = this.curveColors[this.curveMode];
        this.ctxMain.shadowBlur = 6; this.ctxMain.shadowColor = this.curveColors[this.curveMode];
        for(let i=0; i<=40; i++) {
            let f = this.getCurveFactor((i / 40) * 255, this.curveMode);
            let gx = padLeft + (i/40)*gw; let gy = gyStart + gh - (f * gh);
            if(i===0) this.ctxMain.moveTo(gx, gy); else this.ctxMain.lineTo(gx, gy);
        }
        this.ctxMain.stroke(); this.ctxMain.shadowBlur = 0;

        let currentX = padLeft + (this.dmx8Bit / 255) * gw;
        let currentY = gyStart + gh - (this.getCurveFactor(this.dmx8Bit, this.curveMode) * gh);
        this.ctxMain.fillStyle = this.curveColors[this.curveMode]; this.ctxMain.shadowBlur = 10; this.ctxMain.shadowColor = this.curveColors[this.curveMode];
        this.ctxMain.beginPath(); this.ctxMain.arc(currentX, currentY, 5, 0, Math.PI*2); this.ctxMain.fill(); this.ctxMain.shadowBlur = 0;

        this.ctxMain.fillStyle = '#444'; this.ctxMain.font = '9px monospace'; this.ctxMain.textAlign = 'left';
        this.ctxMain.fillText('IN(0)', padLeft, h - 5); this.ctxMain.fillText('IN(255)', padLeft + gw - 35, h - 5);
        this.ctxMain.fillText('OUT(100%)', padLeft, 11);

        let ox = midX + 15; let oy = h / 2; let sw = w - ox - padRight; let sh = gh / 2;
        this.ctxMain.strokeStyle = '#151515'; this.ctxMain.lineWidth = 1.5;
        this.ctxMain.beginPath();
        for(let i=0; i<=100; i++) {
            let angle = (i / 100) * Math.PI;
            let sx = ox + (i/100)*sw; let sy = oy - Math.sin(angle)*sh;
            if(i===0) this.ctxMain.moveTo(sx, sy); else this.ctxMain.lineTo(sx, sy);
        }
        this.ctxMain.lineTo(ox+sw, oy); this.ctxMain.lineTo(ox, oy); this.ctxMain.stroke();

        let triggerPercent = 1 - factor; let startIdx = Math.floor(triggerPercent * 100);
        this.ctxMain.fillStyle = 'rgba(255, 109, 0, 0.28)'; this.ctxMain.beginPath();
        if (startIdx < 100) {
            let firstAngle = (startIdx / 100) * Math.PI; this.ctxMain.moveTo(ox + (startIdx/100)*sw, oy);
            for(let i=startIdx; i<=100; i++) { let angle = (i / 100) * Math.PI; this.ctxMain.lineTo(ox + (i/100)*sw, oy - Math.sin(angle)*sh); }
            this.ctxMain.lineTo(ox + sw, oy); this.ctxMain.closePath(); this.ctxMain.fill();
            this.ctxMain.strokeStyle = '#ff9100'; this.ctxMain.lineWidth = 2; this.ctxMain.shadowBlur = 6; this.ctxMain.shadowColor = '#ff9100';
            this.ctxMain.beginPath(); this.ctxMain.moveTo(ox + (startIdx/100)*sw, oy); this.ctxMain.lineTo(ox + (startIdx/100)*sw, oy - Math.sin(firstAngle)*sh); 
            for(let i=startIdx; i<=100; i++) { let angle = (i / 100) * Math.PI; this.ctxMain.lineTo(ox + (i/100)*sw, oy - Math.sin(angle)*sh); }
            this.ctxMain.stroke(); this.ctxMain.shadowBlur = 0;
        }
        this.ctxMain.strokeStyle = '#222'; this.ctxMain.lineWidth = 1; this.ctxMain.beginPath(); this.ctxMain.moveTo(ox, oy); this.ctxMain.lineTo(ox+sw, oy); this.ctxMain.stroke();
        this.ctxMain.fillStyle = '#444'; this.ctxMain.font = '9px monospace'; this.ctxMain.textAlign = 'right';
        this.ctxMain.fillText('AC100V WAVE', w - padRight, 11);
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