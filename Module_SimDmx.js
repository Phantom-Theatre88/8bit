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
        const createMiniFaderHTML = (id, label, color) => `
            <div class="fader-cell-wrap" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 160px; flex: 1;">
                <button class="step-btn" id="simdmx-btn-up-${id}" style="width: 30px; height: 24px; background: #252525; border: 2px solid #444; border-radius: 6px; color: #e0e0e0; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">▲</button>
                <div class="fader-area" id="simdmx-boundary-${id}" data-fader="${id}" style="height: 95px; width: 34px; position: relative; touch-action: none;">
                    <div class="fader-track-container" data-fader="${id}" style="position: absolute; right: 0; left: 0; margin: auto; width: 24px; height: 85px; top: 5px;">
                        <div class="fader-track" style="position: absolute; left: 10px; width: 4px; height: 100%; border: 1px solid #2a2a2a; border-radius: 2px; background:${color}33;"></div>
                        <div class="fader-knob" id="simdmx-knob-${id}" style="position: absolute; left: 0; width: 24px; height: 26px; border: 2px solid #444; border-radius: 4px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2; bottom: 0px; border-color:${color};">
                            <div style="width: 100%; height: 3px; background:${id==='dmx1'?'#ff3d00':color};"></div>
                        </div>
                    </div>
                </div>
                <button class="step-btn" id="simdmx-btn-down-${id}" style="width: 30px; height: 24px; background: #252525; border: 2px solid #444; border-radius: 6px; color: #e0e0e0; font-size: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">▼</button>
                <div class="fader-label" id="simdmx-label-${id}" style="font-size: 10px; font-weight: bold; color:${color}aa; text-align: center; white-space: nowrap;">${label}</div>
            </div>`;

        for(let c=1; c<=10; c++) { fadersHTML += createMiniFaderHTML(`dmx${c}`, `CH${c}`, this.chColors[c-1]); }
        fadersHTML += `
            <div class="fader-cell-wrap" style="display: flex; flex-direction: column; align-items: center; justify-content: center; opacity:0.15; flex:1; height:160px;">
                <div style="font-size:18px; font-weight:bold; letter-spacing:1px; transform:rotate(90deg); margin-bottom:15px;">...</div>
                <div class="fader-label" style="font-size:10px; font-weight:bold;">CH11-512</div>
            </div>`;

        return `
            <div style="display: flex; width: 100%; height: 100%; gap: 20px;">
                <div class="col center-col" style="width: 62%; display: flex; flex-direction: column; gap: 8px;">
                    <div class="section-title" style="font-size: 11px; font-weight: bold; color: #888; letter-spacing: 2px; text-align: center; margin-bottom: 3px;">DMX512 PACKET STREAM / MULTI-CHANNEL CONSOLE</div>
                    <div class="oscilloscope-screen" style="background: #000; border: 2px solid #333; border-radius: 6px; height: 95px; width: 100%; position: relative;">
                        <canvas id="simdmx-osc-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
                    </div>
                    <div class="train-track-area" style="background: #0c0c0c; border: 2px solid #444; border-radius: 6px; height: 95px; display: flex; align-items: center; position: relative; overflow: hidden; padding: 0;">
                        <div class="train-track-line" style="position: absolute; left: 0; width: 100%; height: 4px; background: #555; border-top: 1px solid #777; border-bottom: 1px solid #333; bottom: 22px; z-index: 1;"></div>
                        <div class="train-container" id="simdmx-train-wagon-line" style="display: flex; position: absolute; bottom: 25px; left: 0; z-index: 2; will-change: transform;"></div>
                    </div>
                    <div class="speed-control-row" style="display: flex; align-items: center; justify-content: space-between; background: #111; padding: 4px 10px; border-radius: 5px; border: 1px solid #222;">
                        <div class="speed-label-text" style="font-size: 10px; color: #aaa; font-weight: bold;">TRANSMISSION SPEED (DMX規格: 42Hz)</div>
                        <div class="speed-slider-wrap" style="display: flex; align-items: center; gap: 10px; flex-grow: 1; margin-left: 20px;">
                            <span id="simdmx-speed-display-text" style="font-size: 11px; color: #ff6f00; font-weight: bold; width: 80px;">スロー</span>
                            <input type="range" id="simdmx-speed-range-slider" class="speed-slider" min="0" max="100" value="20" style="flex-grow: 1; -webkit-appearance: none; background: #333; height: 6px; border-radius: 3px; outline: none;">
                        </div>
                    </div>
                    <div class="dmx-fader-row-box" id="simdmx-multi-fader-container" style="background: #0a0a0a; border: 2px solid #444; border-radius: 8px; padding: 8px 5px; display: flex; justify-content: space-between;">
                        ${fadersHTML}
                    </div>
                    <div class="dmx-explain-box" style="background: #111; border: 1px solid #222; border-radius: 6px; padding: 8px 12px; font-size: 11px; color: #aaa; line-height: 1.5em; text-align: justify;">
                        <strong>【DMX512伝送：42Hzの定期列車】</strong><br>DMX信号は、1番から512番までの調光データ（％と 8bitバイナリ）を乗せた「512両編成の超ロングな列車」です。調光卓は、値が変化していなくても関係なく1秒間に約42回（42Hz）、この定期列車を劇場内へ絶え間なく垂れ流しで送り続けています。
                    </div>
                </div>

                <div class="col bulb-col" style="width: 38%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                    <div class="section-title" style="font-size: 11px; font-weight: bold; color: #888; letter-spacing: 2px; text-align: center; margin-bottom: 3px;">OUTPUT LUMINANCE</div>
                    <div class="dark-room" style="width: 100%; height: 100%; background: #030303; border: 2px solid #444; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: visible; position: relative;">
                        <div class="ambient-glow" id="simdmx-ambient-glow" style="position: absolute; top: -5%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,143,0,0.38) 0%, rgba(255,87,34,0.08) 50%, rgba(0,0,0,0) 70%); mix-blend-mode: screen; pointer-events: none; opacity: 0; transform: scale(0.3); transition: opacity 0.05s ease, transform 0.05s ease; z-index: 0;"></div>
                        <div class="bulb-image-container" style="position: relative; width: 220px; height: 360px; display: flex; align-items: center; justify-content: center;">
                            <img src="assets/Light.png" class="large-bulb-img" alt="Bulb Base" style="width: 100%; height: 100%; object-fit: contain; z-index: 1; pointer-events: none; opacity: 0.85;">
                            <div class="internal-gas-glow" id="simdmx-gas-glow" style="position: absolute; top: 6%; left: 5%; width: 90%; height: 55%; border-radius: 50%; background: radial-gradient(circle, rgba(255,213,79,0.9) 0%, rgba(255,109,0,0.3) 55%, rgba(0,0,0,0) 75%); z-index: 2; mix-blend-mode: screen; pointer-events: none; opacity: 0; transition: opacity 0.05s ease;"></div>
                            <div class="filament-glow-layer" id="simdmx-filament-glow" style="position: absolute; top: 25%; left: 36%; width: 28%; height: 12%; z-index: 3; mix-blend-mode: screen; pointer-events: none; opacity: 0; border-radius: 40% 40% 50% 50%; box-shadow: 0 0 0px rgba(0,0,0,0); transition: opacity 0.05s ease, background-color 0.05s ease, box-shadow 0.05s ease;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    init() {
        this.canvas = document.getElementById('simdmx-osc-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.buildTrainWagons();
        this.resizeCanvas();
        let dmxIds = Array.from({length:10}, (_, i) => `dmx${i+1}`);
        this.bindFaderEvents(dmxIds);
        this.syncPositionsFromValues();
        this.updateSystem();

        document.getElementById('simdmx-speed-range-slider').addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (val === 0) { this.speedFactor = 0; document.getElementById('simdmx-speed-display-text').textContent = "一時停止"; } 
            else if (val < 85) { this.speedFactor = (val / 85) * 0.18; document.getElementById('simdmx-speed-display-text').textContent = `スロー (${val})`; } 
            else { this.speedFactor = 1.0; document.getElementById('simdmx-speed-display-text').textContent = "42 Hz"; }
        });

        this.lastTime = performance.now();
        const loop = (timestamp) => {
            this.animationLoop(timestamp);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    },

    destroy() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('mousemove', this._moveHandler);
        window.removeEventListener('touchmove', this._moveHandler);
        window.removeEventListener('mouseup', this._endHandler);
        window.removeEventListener('touchend', this._endHandler);
    },

    buildTrainWagons() {
        let singleHTML = `
            <div class="car start-code-car" style="width: 80px; height: 48px; border: 2px solid #ffb300; border-radius: 6px 6px 2px 2px; margin-right: 4px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; position: relative; box-shadow: inset 0 4px 6px rgba(255,255,255,0.1); background: repeating-linear-gradient(45deg, #1e1e1e, #1e1e1e 8px, #ffb300 8px, #ffb300 16px);">
                <div class="car-num-tag" style="font-size: 8px; position: absolute; top: 2px; left: 4px; color: #ffb300;">CH0</div>
                <div class="car-pct" style="font-size: 11px; font-weight: bold; margin-top: 4px; color: #ffb300;">START</div>
            </div>`;

        for(let i=1; i<=10; i++) {
            let col = this.chColors[i-1];
            singleHTML += `
                <div class="car" style="width: 80px; height: 48px; border: 2px solid ${col}; background:${col}15; border-radius: 6px 6px 2px 2px; margin-right: 4px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; position: relative; box-shadow: inset 0 4px 6px rgba(255,255,255,0.1);">
                    <div class="car-num-tag" style="font-size: 8px; position: absolute; top: 2px; left: 4px; color:${col}aa">CH${i}</div>
                    <div class="car-pct simdmx-pct-ch${i}" style="font-size: 11px; font-weight: bold; margin-top: 4px; color:${col};">0%</div>
                    <div class="car-bin simdmx-bin-ch${i}" style="font-size: 7px; font-family: monospace; color: #fff; background: rgba(0,0,0,0.5); padding: 1px 2px; border-radius: 2px; margin-top: 2px; letter-spacing: -0.2px;">00000000</div>
                </div>`;
        }
        for(let i=11; i<=15; i++) {
            singleHTML += `
                <div class="car gray-car" style="width: 80px; height: 48px; background: #151515; border: 2px solid #333; border-radius: 6px 6px 2px 2px; margin-right: 4px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #444; position: relative; box-shadow: inset 0 4px 6px rgba(255,255,255,0.1);">
                    <div class="car-num-tag" style="font-size: 8px; position: absolute; top: 2px; left: 4px; color: #333;">CH${i}</div>
                    <div class="car-pct" style="font-size: 11px; font-weight: bold; margin-top: 4px; color: #444;">- -</div>
                </div>`;
        }
        singleHTML += `
            <div class="car gray-car" style="width:${this.LAST_CAR_W}px; height: 48px; border: 2px dashed #333; background:transparent; margin-right:0; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #444; position: relative;">
                <div style="font-size:14px; font-weight:bold; color:#333;">... CH512</div>
            </div>`;
            
        document.getElementById('simdmx-train-wagon-line').innerHTML = singleHTML + singleHTML;
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
        this.dmxChannels[chIndex] = Math.round(ratio * 255);
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
        this.dmxChannels[chIndex] = Math.max(0, Math.min(255, this.dmxChannels[chIndex] + delta));
        this.syncPositionsFromValues();
        this.updateSystem();
    },

    updateSystem() {
        let ch1Val = this.dmxChannels[0];
        let factor = ch1Val / 255;
        let voltage = factor * 100;
        const trainLine = document.getElementById('simdmx-train-wagon-line');
        for(let c=1; c<=10; c++) {
            let val = this.dmxChannels[c-1];
            let pcts = trainLine.querySelectorAll(`.simdmx-pct-ch${c}`);
            let bins = trainLine.querySelectorAll(`.simdmx-bin-ch${c}`);
            pcts.forEach(el => el.textContent = Math.round((val/255)*100) + '%');
            bins.forEach(el => el.textContent = val.toString(2).padStart(8, '0'));
        }
        this.updateBulb(factor, voltage);
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
            else { g = Math.floor(200 + ((factor - 0.6) / 0.4) * 45); b = Math.floor(50 + ((factor - 0.6) / 0.4) * 110); shadowColor = `rgba(255, 235,  yellow 59, 1)`; }
            filamentGlow.style.opacity = (0.25 + factor * 0.75).toString();
            filamentGlow.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            filamentGlow.style.boxShadow = `0 0 ${8 + factor * 28}px ${shadowColor}, 0 0 ${3 + factor * 12}px #fff`;
            gasGlow.style.opacity = Math.min(factor * 1.1, 1.0).toString();
            ambientGlow.style.opacity = factor.toString();
            ambientGlow.style.transform = `scale(${0.3 + (factor * 0.9)})`;
        }
    },

    animationLoop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        let delta = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        let baseSpeed = 900; 
        this.trainPosition -= baseSpeed * this.speedFactor * delta;
        if (this.trainPosition < -this.loopWidth) { this.trainPosition = this.trainPosition % this.loopWidth; }
        const trainLine = document.getElementById('simdmx-train-wagon-line');
        if (trainLine) trainLine.style.transform = `translateX(${this.trainPosition}px)`;
        this.drawOscilloscopeAbsolute();
    },

    drawOscilloscopeAbsolute() {
        if (!this.canvas) return;
        let w = this.canvas.clientWidth; let h = this.canvas.clientHeight;
        this.canvas.width = w * window.devicePixelRatio; this.canvas.height = h * window.devicePixelRatio;
        this.ctx.resetTransform(); this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.ctx.clearRect(0, 0, w, h);
        this.ctx.strokeStyle = '#112211'; this.ctx.lineWidth = 1;
        let gridOffsetX = (this.trainPosition % 40);
        for(let x = gridOffsetX - 40; x < w + 40; x += 40) { this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, h); this.ctx.stroke(); }
        for(let y = 0; y < h; y += 20) { this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(w, y); this.ctx.stroke(); }
        this.ctx.lineWidth = 2.5; let lastY = h - 25;
        for (let x = 0; x < w; x++) {
            let trainLocalX = x - this.trainPosition;
            trainLocalX = ((trainLocalX % this.loopWidth) + this.loopWidth) % this.loopWidth;
            let carIdx = Math.floor(trainLocalX / this.CAR_TOTAL_W);
            let carInternalX = trainLocalX % this.CAR_TOTAL_W;
            let val = 0; let carColor = '#111';
            if (carIdx === 0) { val = 0; carColor = '#ffb300'; } 
            else if (carIdx >= 1 && carIdx <= 10) { val = this.dmxChannels[carIdx - 1]; carColor = this.chColors[carIdx - 1]; } 
            else if (carIdx >= 11 && carIdx <= 15) { val = 0; carColor = '#333'; } 
            else if (carIdx === 16) { val = 0; carColor = '#444'; if (carInternalX >= this.LAST_CAR_W) carColor = '#111'; }
            if (carIdx < 16 && carInternalX >= this.CAR_BODY_W) { val = 0; carColor = '#111'; }
            let targetY = h - 25;
            if (carColor !== '#111' && carIdx >= 1 && carIdx <= 10) {
                let bitIndex = 7 - Math.floor(carInternalX / 10);
                if (bitIndex >= 0 && bitIndex <= 7) { let bit = (val >> bitIndex) & 1; targetY = (bit === 1) ? 25 : h - 25; }
            }
            if (x === 0) {
                this.ctx.beginPath(); this.ctx.strokeStyle = carColor; this.ctx.moveTo(x, targetY);
                this.ctx.shadowBlur = (carColor !== '#333' && carColor !== '#111') ? 8 : 0; this.ctx.shadowColor = carColor;
            } else if (this.ctx.strokeStyle !== carColor || lastY !== targetY) {
                this.ctx.lineTo(x, lastY); this.ctx.lineTo(x, targetY); this.ctx.stroke();
                this.ctx.beginPath(); this.ctx.strokeStyle = carColor; this.ctx.moveTo(x, targetY);
                this.ctx.shadowBlur = (carColor !== '#333' && carColor !== '#111') ? 8 : 0; this.ctx.shadowColor = carColor;
            } else { this.ctx.lineTo(x, targetY); }
            lastY = targetY;
        }
        this.ctx.stroke(); this.ctx.shadowBlur = 0;
    }
};