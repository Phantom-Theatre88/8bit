const Module_Sim16Bit = {
    // --- 内部状態管理 ---
    dmx16Bit: 48896,
    curveMode: 'linear',
    MAX_BOTTOM: 252,
    draggingFaderId: null,
    startY: 0,
    startBottom: 0,

    // --- HTMLテンプレート（Coarseの青線、Fineの緑線を完全復元） ---
    getHTML() {
        const createFaderHTML = (id, label, knobClass, lineStyle = '') => `
            <div class="fader-cell-wrap" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 100%; flex: 1;">
                <button class="step-btn" id="sim16bit-btn-up-${id}" style="width: 42px; height: 35px; background: #252525; border: 2px solid #444; border-radius: 6px; color: #e0e0e0; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 5px rgba(0,0,0,0.3); -webkit-tap-highlight-color: transparent;">▲</button>
                <div class="fader-area" id="sim16bit-boundary-${id}" data-fader="${id}" style="height: 340px; width: 50px; position: relative; touch-action: none;">
                    <div class="fader-scale" style="position: absolute; left: -2px; height: 300px; top: 20px; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; font-weight: bold; color: #505050; z-index: 0;">
                        <div>${id==='fine'||id==='coarse'?'255':'100'}</div>
                        <div>${id==='fine'||id==='coarse'?'192':'75'}</div>
                        <div>${id==='fine'||id==='coarse'?'128':'50'}</div>
                        <div>${id==='fine'||id==='coarse'?'64':'25'}</div>
                        <div>0</div>
                    </div>
                    <div class="fader-track-container" data-fader="${id}" style="position: absolute; right: 0px; width: 34px; height: 300px; top: 20px;">
                        <div class="fader-track" style="position: absolute; left: 15px; width: 4px; height: 100%; background: #000; border: 1px solid #2a2a2a; border-radius: 2px;"></div>
                        <div class="fader-knob ${knobClass}" id="sim16bit-knob-${id}" style="position: absolute; left: 0; width: 34px; height: 48px; background: #d5d5d5; border: 3px solid #444; border-radius: 4px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2; bottom: 0px;">
                            <div style="width: 100%; height: 3px; ${lineStyle}"></div>
                        </div>
                    </div>
                </div>
                <button class="step-btn" id="sim16bit-btn-down-${id}" style="width: 42px; height: 35px; background: #252525; border: 2px solid #444; border-radius: 6px; color: #e0e0e0; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 5px rgba(0,0,0,0.3); -webkit-tap-highlight-color: transparent;">▼</button>
                <div class="fader-label" id="sim16bit-label-${id}" style="font-size: 10px; font-weight: bold; color: #555; text-align: center; white-space: nowrap;">${label}</div>
            </div>`;

        return `
            <div style="display: flex; width: 100%; height: 100%; gap: 20px;">
                <div class="col fader-col" style="width: 32%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: #0f0f0f; border-radius: 10px; padding: 10px 5px; border: 1px solid #222;">
                    <div class="fader-bank" style="display: flex; width: 100%; height: 100%; justify-content: center; gap: 5px;">
                        ${createFaderHTML('master', 'Master', '', 'background: #ff3d00;')}
                        ${createFaderHTML('coarse', 'Coarse', 'coarse-knob', 'background: #00e5ff;')}
                        ${createFaderHTML('fine', 'Fine', 'fine-knob', 'background: #00e676;')}
                    </div>
                </div>

                <div class="col center-col" style="width: 36%; display: flex; flex-direction: column; gap: 12px;">
                    <div class="section-title" style="font-size: 11px; font-weight: bold; color: #888; letter-spacing: 2px; text-align: center; margin-bottom: 3px;">MONITOR STATUS (16-BIT FINE)</div>
                    <div class="digital-row" style="display: flex; gap: 8px;">
                        <div class="led-panel" style="background: #050505; border: 2px solid #444; border-radius: 6px; padding: 8px 3px; flex: 1; text-align: center;">
                            <div class="led-label" style="font-size: 10px; color: #666; margin-bottom: 2px; font-weight: bold;">RATIO</div>
                            <div class="led-num" id="sim16bit-num-percent" style="font-size: 22px; font-weight: 700; color: #00e5ff; text-shadow: 0 0 8px rgba(0,229,255,0.5);">75%</div>
                        </div>
                        <div class="led-panel" style="background: #050505; border: 2px solid #444; border-radius: 6px; padding: 8px 3px; flex: 1; text-align: center;">
                            <div class="led-label" style="font-size: 10px; color: #666; margin-bottom: 2px; font-weight: bold;">16-BIT TOTAL</div>
                            <div class="led-num" id="sim16bit-num-dmx" style="font-size: 18px; line-height: 26px; font-weight: 700; color: #00e5ff; text-shadow: 0 0 8px rgba(0,229,255,0.5);">0</div>
                        </div>
                        <div class="led-panel" style="background: #050505; border: 2px solid #ff3d00; border-radius: 6px; padding: 8px 3px; flex: 1; text-align: center;">
                            <div class="led-label" style="font-size: 10px; color: #ff3d00; margin-bottom: 2px; font-weight: bold;">VOLTAGE</div>
                            <div class="led-num" id="sim16bit-num-voltage" style="font-size: 22px; font-weight: 700; color: #ff3d00; text-shadow: 0 0 8px rgba(255,61,0,0.6);">75.0 V</div>
                        </div>
                    </div>

                    <div class="panel-box" id="sim16bit-upper-graph-box" style="background: #0c0c0c; border: 2px solid #444; border-radius: 8px; padding: 10px; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden;">
                        <div class="led-label" style="text-align: center; font-size: 10px; color: #666; margin-bottom: 2px; font-weight: bold;">16-BIT RESOLUTION MONITOR</div>
                        <div style="display:flex; flex-direction:column; justify-content:center; height:100%; gap:10px; padding:10px 0;">
                            <div style="display:flex; justify-content:space-between; background:#111; padding:8px; border-radius:4px; border-left:4px solid #00e5ff;">
                                <span style="font-size:11px; color:#aaa;">Coarse (Ch1 上位):</span>
                                <span id="sim16bit-txt-coarse-val" style="font-weight:bold; color:#00e5ff;">0</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; background:#111; padding:8px; border-radius:4px; border-left:4px solid #00e676;">
                                <span style="font-size:11px; color:#aaa;">Fine (Ch2 下位):</span>
                                <span id="sim16bit-txt-fine-val" style="font-weight:bold; color:#00e676;">0</span>
                            </div>
                        </div>
                    </div>

                    <div class="panel-box" style="background: #0c0c0c; border: 2px solid #444; border-radius: 8px; padding: 10px; flex-grow: 0; display: flex; flex-direction: column; overflow: hidden;">
                        <div class="led-label" style="text-align: center; font-size: 10px; color: #666; margin-bottom: 2px; font-weight: bold;">16-BIT BINARY MATRIX (HIGH 8-bit ... LOW 8-bit)</div>
                        <div class="matrix-grid" id="sim16bit-binary-matrix-grid" style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px; margin-top: 6px;"></div>
                    </div>
                </div>

                <div class="col bulb-col" style="width: 32%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                    <div class="section-title" style="font-size: 11px; font-weight: bold; color: #888; letter-spacing: 2px; text-align: center; margin-bottom: 3px;">OUTPUT LUMINANCE</div>
                    <div class="dark-room" style="width: 100%; height: 100%; background: #030303; border: 2px solid #444; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: visible; position: relative;">
                        <div class="ambient-glow" id="sim16bit-ambient-glow" style="position: absolute; top: -5%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,143,0,0.38) 0%, rgba(255,87,34,0.08) 50%, rgba(0,0,0,0) 70%); mix-blend-mode: screen; pointer-events: none; opacity: 0; transform: scale(0.3); transition: opacity 0.05s ease, transform 0.05s ease; z-index: 0;"></div>
                        <div class="bulb-image-container" style="position: relative; width: 220px; height: 360px; display: flex; align-items: center; justify-content: center;">
                            <img src="assets/Light.png" class="large-bulb-img" alt="Bulb Base" style="width: 100%; height: 100%; object-fit: contain; z-index: 1; pointer-events: none; opacity: 0.85;">
                            <div class="internal-gas-glow" id="sim16bit-gas-glow" style="position: absolute; top: 6%; left: 5%; width: 90%; height: 55%; border-radius: 50%; background: radial-gradient(circle, rgba(255,213,79,0.9) 0%, rgba(255,109,0,0.3) 55%, rgba(0,0,0,0) 75%); z-index: 2; mix-blend-mode: screen; pointer-events: none; opacity: 0; transition: opacity 0.05s ease;"></div>
                            <div class="filament-glow-layer" id="sim16bit-filament-glow" style="position: absolute; top: 25%; left: 36%; width: 28%; height: 12%; z-index: 3; mix-blend-mode: screen; pointer-events: none; opacity: 0; border-radius: 40% 40% 50% 50%; box-shadow: 0 0 0px rgba(0,0,0,0); transition: opacity 0.05s ease, background-color 0.05s ease, box-shadow 0.05s ease;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    init() {
        const matrixGrid = document.getElementById('sim16bit-binary-matrix-grid');
        matrixGrid.innerHTML = Array.from({length: 16}, (_, i) => `
            <div class="matrix-cell" id="sim16bit-cell-${15-i}" style="flex: 1; min-width: 18px; height: 30px; background: #151515; border: 2px solid #444; border-radius: 4px; font-size: 12px; line-height: 26px; text-align: center; color: #444; transition: all 0.05s ease;">0</div>
        `).join('');
        this.bindEvents(['master', 'coarse', 'fine']);
        this.syncPositionsFromValues();
        this.updateSystem();
    },

    bindEvents(ids) {
        ids.forEach(id => {
            const knob = document.getElementById(`sim16bit-knob-${id}`);
            const boundary = document.getElementById(`sim16bit-boundary-${id}`);
            const btnUp = document.getElementById(`sim16bit-btn-up-${id}`);
            const btnDown = document.getElementById(`sim16bit-btn-down-${id}`);

            const startHandler = (e) => {
                this.draggingFaderId = id;
                this.startY = e.touches ? e.touches[0].clientY : e.clientY;
                this.startBottom = parseInt(knob.style.bottom) || 0;
                e.preventDefault();
                const label = document.getElementById(`sim16bit-label-${id}`);
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

    destroy() {
        window.removeEventListener('mousemove', this._moveHandler);
        window.removeEventListener('touchmove', this._moveHandler);
        window.removeEventListener('mouseup', this._endHandler);
        window.removeEventListener('touchend', this._endHandler);
    },

    handleGlobalMove(e) {
        if (!this.draggingFaderId) return;
        e.preventDefault();
        const knob = document.getElementById(`sim16bit-knob-${this.draggingFaderId}`);
        const currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = this.startY - currentY;
        let targetBottom = this.startBottom + deltaY;
        if (targetBottom < 0) targetBottom = 0;
        if (targetBottom > this.MAX_BOTTOM) targetBottom = this.MAX_BOTTOM;
        knob.style.bottom = targetBottom + 'px';
        this.calculateValueFromPosition(this.draggingFaderId, targetBottom);
    },

    handleGlobalEnd() {
        if (!this.draggingFaderId) return;
        const label = document.getElementById('sim16bit-label-' + this.draggingFaderId);
        if(label) label.style.color = '#555';
        this.draggingFaderId = null;
    },

    calculateValueFromPosition(id, position) {
        const ratio = position / this.MAX_BOTTOM;
        if (id === 'master') { this.dmx16Bit = Math.round(ratio * 65535); } 
        else if (id === 'coarse') { this.dmx16Bit = (Math.round(ratio * 255) * 256) + (this.dmx16Bit % 256); } 
        else if (id === 'fine') { this.dmx16Bit = (Math.floor(this.dmx16Bit / 256) * 256) + Math.round(ratio * 255); }
        this.syncPositionsFromValues(id);
        this.updateSystem();
    },

    syncPositionsFromValues(excludeId = null) {
        const cVal = Math.floor(this.dmx16Bit / 256);
        const fVal = this.dmx16Bit % 256;
        if (excludeId !== 'master') document.getElementById('sim16bit-knob-master').style.bottom = Math.round((this.dmx16Bit / 65535) * this.MAX_BOTTOM) + 'px';
        if (excludeId !== 'coarse') document.getElementById('sim16bit-knob-coarse').style.bottom = Math.round((cVal / 255) * this.MAX_BOTTOM) + 'px';
        if (excludeId !== 'fine') document.getElementById('sim16bit-knob-fine').style.bottom = Math.round((fVal / 255) * this.MAX_BOTTOM) + 'px';
        document.getElementById('sim16bit-txt-coarse-val').textContent = `${cVal} (Hex: 0x${cVal.toString(16).toUpperCase().padStart(2,'0')})`;
        document.getElementById('sim16bit-txt-fine-val').textContent = `${fVal} (Hex: 0x${fVal.toString(16).toUpperCase().padStart(2,'0')})`;
    },

    adjustFaderValue(id, delta) {
        if (id === 'master') { this.dmx16Bit = Math.max(0, Math.min(65535, this.dmx16Bit + delta)); } 
        else if (id === 'coarse') { let c = Math.max(0, Math.min(255, Math.floor(this.dmx16Bit / 256) + delta)); this.dmx16Bit = (c * 256) + (this.dmx16Bit % 256); } 
        else if (id === 'fine') {
            let f = (this.dmx16Bit % 256) + delta; let c = Math.floor(this.dmx16Bit / 256);
            if (f > 255) { f = 0; c = Math.min(255, c + 1); } if (f < 0) { f = 255; c = Math.max(0, c - 1); }
            this.dmx16Bit = (c * 256) + f;
        }
        this.syncPositionsFromValues();
        this.updateSystem();
    },

    updateSystem() {
        document.getElementById('sim16bit-num-dmx').textContent = this.dmx16Bit;
        let ratio = ((this.dmx16Bit / 65535) * 100).toFixed(2);
        document.getElementById('sim16bit-num-percent').textContent = ratio + '%';
        let factor = this.dmx16Bit / 65535;
        let voltage = factor * 100;

        for (let i = 0; i < 16; i++) {
            const cell = document.getElementById('sim16bit-cell-' + i);
            const isSet = (this.dmx16Bit >> i) & 1;
            if (cell) {
                cell.textContent = isSet ? '1' : '0';
                if (isSet) { cell.style.background = '#e65100'; cell.style.color = '#ffffff'; cell.style.borderColor = '#ff6d00'; cell.style.boxShadow = '0 0 6px rgba(255,109,0,0.5)'; } 
                else { cell.style.background = '#151515'; cell.style.color = '#444'; cell.style.borderColor = '#444'; cell.style.boxShadow = 'none'; }
            }
        }
        document.getElementById('sim16bit-num-voltage').textContent = voltage.toFixed(2) + ' V';
        this.updateBulb(factor, voltage);
    },

    updateBulb(factor, voltage) {
        const filamentGlow = document.getElementById('sim16bit-filament-glow');
        const gasGlow = document.getElementById('sim16bit-gas-glow');
        const ambientGlow = document.getElementById('sim16bit-ambient-glow');
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