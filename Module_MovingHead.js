const Module_MovingHead = {
    panValue: 128,
    tiltValue: 128,
    panFineValue: 255,
    tiltFineValue: 128,
    mode: '8bit',
    resolutionMode: false,
    panRange: 540,
    tiltRange: 270,
    powerOn: false,
    errorMode: false,
    status: 'POWER OFF',
    phase: 'off',
    phaseStart: 0,
    animId: null,
    canvas: null,
    ctx: null,
    dragging: null,
    cal: {
        panStart: false,
        panEnd: false,
        tiltStart: false,
        tiltEnd: false,
        panEndError: false,
        tiltEndError: false
    },
    calPosition: { pan: 0.5, tilt: 0.5 },
    V_WIDTH: 1000,
    V_HEIGHT: 640,
    _canvasModeError: null,

    getHTML() {
        return `
            <div class="movinghead-root">
                <div class="mh-topbar">
                    <div>
                        <div class="mh-title">Moving Head Calibration Test v1.2</div>
                        <div class="mh-subtitle">Calibration / Error / 16bit精度比較 / PAN540°回転</div>
                    </div>
                    <div class="mh-top-controls">
                        <button class="mh-btn power" id="mh-power-btn">POWER OFF</button>
                        <button class="mh-btn error" id="mh-error-btn">CAL ERROR OFF</button>
                        <button class="mh-btn compare" id="mh-resolution-btn">精度比較 OFF</button>
                        <div class="mh-mode-switch">
                            <button id="mh-mode-8" class="mh-mode-btn active">8-bit</button>
                            <button id="mh-mode-16" class="mh-mode-btn">16-bit</button>
                        </div>
                    </div>
                </div>

                <div class="mh-layout">
                    <div class="mh-panel mh-control-panel">
                        <div class="mh-panel-title">1. DMX FADER + CAL INDICATOR</div>
                        <div class="mh-fader-bank mh-normal-faders">
                            ${this.createFaderHTML('pan', 'PAN', '#00e5ff')}
                            ${this.createFaderHTML('tilt', 'TILT', '#ffca28')}
                        </div>
                        <div class="mh-resolution-faders">
                            ${this.createResFaderHTML('rpan', 'PAN Coarse', '#00e5ff')}
                            ${this.createResFaderHTML('rpanfine', 'PAN Fine', '#fff176')}
                        </div>
                        <div class="mh-readout-grid">
                            <div class="mh-readout mh-readout-target"><span id="mh-pan-dmx-label">PAN DMX</span><strong id="mh-pan-dmx">128</strong></div>
                            <div class="mh-readout mh-readout-8bit"><span id="mh-pan-angle-label">PAN</span><strong id="mh-pan-angle">0.0°</strong></div>
                            <div class="mh-readout mh-readout-16bit"><span id="mh-tilt-dmx-label">TILT DMX</span><strong id="mh-tilt-dmx">128</strong></div>
                            <div class="mh-readout mh-readout-diff"><span id="mh-tilt-angle-label">TILT</span><strong id="mh-tilt-angle">正面</strong></div>
                        </div>
                    </div>

                    <div class="mh-panel mh-canvas-panel">
                        <div class="mh-panel-title">2. NORMAL / ERROR / 精度比較 VIEW</div>
                        <canvas id="movinghead-canvas"></canvas>
                    </div>

                    <div class="mh-panel mh-info-panel">
                        <div class="mh-panel-title">3. CALIBRATION STATE</div>
                        <div class="mh-status-box">
                            <div class="mh-status-line"><b>POWER</b><span class="mh-status-value" id="mh-power-state">OFF</span></div>
                            <div class="mh-status-line"><b>STATUS</b><span class="mh-status-value" id="mh-status-state">POWER OFF</span></div>
                            <div class="mh-status-line"><b>PHASE</b><span class="mh-status-value" id="mh-phase-state">---</span></div>
                            <div class="mh-status-line"><b>RANGE</b><span class="mh-status-value">PAN 540° / TILT 270°</span></div>
                        </div>
                        <div class="mh-mini-leds">
                            <div class="mh-led" id="mh-led-pan-start">PAN START</div>
                            <div class="mh-led" id="mh-led-pan-end">PAN END</div>
                            <div class="mh-led" id="mh-led-tilt-start">TILT START</div>
                            <div class="mh-led" id="mh-led-tilt-end">TILT END</div>
                        </div>
                        <div class="mh-note">
                            <strong>狙い：</strong><br>
                            電源投入時に機材が端まで動くのは、可動範囲の <b>Start</b> と <b>End</b> を確認するため。確認できた端だけ、フェーダー横のインジケーターにマークが点く。
                        </div>
                        <div class="mh-note mh-error-note">
                            <strong>エラー：</strong><br>
                            CAL ERROR ONでは、下段のエラー側が指令位置からズレる。Endを検出できない状態も表示する。
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    createFaderHTML(id, label, color) {
        return `
            <div class="mh-fader-block">
                <div class="mh-fader-head"><span id="mh-${id}-label">${label}</span><span id="mh-${id}-percent">50%</span></div>
                <div class="mh-fader-wrap">
                    <div class="mh-cal-indicator">
                        <div class="mh-cal-mark end" id="mh-${id}-end-mark">END</div>
                        <div class="mh-cal-error-stop" id="mh-${id}-error-stop">END ×</div>
                        <div class="mh-cal-mark start" id="mh-${id}-start-mark">START</div>
                    </div>
                    <div class="mh-fader-track-wrap" id="mh-${id}-track" data-fader="${id}">
                        <div class="mh-fader-track"></div>
                        <div class="mh-fader-fill" id="mh-${id}-fill" style="background:${color};"></div>
                        <div class="mh-fader-knob" id="mh-${id}-knob"><div style="background:${color};"></div></div>
                    </div>
                    <div class="mh-step-stack">
                        <button class="mh-step-btn" id="mh-${id}-up">▲</button>
                        <button class="mh-step-btn" id="mh-${id}-down">▼</button>
                    </div>
                </div>
            </div>
        `;
    },


    createResFaderHTML(id, label, color) {
        return `
            <div class="mh-fader-block mh-res-fader-block">
                <div class="mh-fader-head"><span>${label}</span><span id="mh-${id}-percent">50%</span></div>
                <div class="mh-res-fader-wrap">
                    <div class="mh-res-scale"><span>255</span><span>128</span><span>0</span></div>
                    <div class="mh-fader-track-wrap mh-res-track" id="mh-${id}-track" data-fader="${id}">
                        <div class="mh-fader-track"></div>
                        <div class="mh-fader-fill" id="mh-${id}-fill" style="background:${color};"></div>
                        <div class="mh-fader-knob" id="mh-${id}-knob"><div style="background:${color};"></div></div>
                    </div>
                    <div class="mh-step-stack mh-res-step">
                        <button class="mh-step-btn" id="mh-${id}-up">▲</button>
                        <button class="mh-step-btn" id="mh-${id}-down">▼</button>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.animId = null;
        this.canvas = document.getElementById('movinghead-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.bindEvents();
        this.resizeCanvas();
        this.updateSystem();
        requestAnimationFrame(() => {
            this.resizeCanvas();
            this.updateSystem();
            requestAnimationFrame(() => {
                this.resizeCanvas();
                this.updateSystem();
            });
        });
        this.loop(performance.now());
    },

    destroy() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.animId = null;
        window.removeEventListener('resize', this._resizeHandler);
        window.removeEventListener('mousemove', this._moveHandler);
        window.removeEventListener('mouseup', this._upHandler);
        window.removeEventListener('touchmove', this._moveHandler);
        window.removeEventListener('touchend', this._upHandler);
    },

    bindEvents() {
        this._resizeHandler = () => this.resizeCanvas();
        window.addEventListener('resize', this._resizeHandler);
        const bindButton = (id, fn) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.onclick = null;
            el.onpointerdown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                fn();
            };
        };
        bindButton('mh-power-btn', () => this.togglePower());
        bindButton('mh-error-btn', () => this.toggleError());
        bindButton('mh-resolution-btn', () => this.toggleResolution());
        bindButton('mh-mode-8', () => this.setMode('8bit'));
        bindButton('mh-mode-16', () => this.setMode('16bit'));
        ['pan', 'tilt', 'rpan', 'rpanfine'].forEach(id => {
            const track = document.getElementById(`mh-${id}-track`);
            if (!track) return;
            track.addEventListener('mousedown', e => this.startDrag(e, id));
            track.addEventListener('touchstart', e => this.startDrag(e, id), { passive: false });
            const upBtn = document.getElementById(`mh-${id}-up`);
            const downBtn = document.getElementById(`mh-${id}-down`);
            if (upBtn) upBtn.onpointerdown = (e) => { e.preventDefault(); e.stopPropagation(); this.stepValue(id, 1); };
            if (downBtn) downBtn.onpointerdown = (e) => { e.preventDefault(); e.stopPropagation(); this.stepValue(id, -1); };
        });
        this._moveHandler = e => this.onDrag(e);
        this._upHandler = () => this.endDrag();
        window.addEventListener('mousemove', this._moveHandler);
        window.addEventListener('mouseup', this._upHandler);
        window.addEventListener('touchmove', this._moveHandler, { passive: false });
        window.addEventListener('touchend', this._upHandler);
    },

    togglePower() {
        this.powerOn = !this.powerOn;
        if (this.powerOn && this.resolutionMode) this.toggleResolution();
        if (this.powerOn) this.startCalibration();
        else {
            this.phase = 'off';
            this.status = 'POWER OFF';
            this.calPosition = { pan: 0.5, tilt: 0.5 };
            this.resetCalibrationMarks();
        }
        this.updateSystem();
    },

    syncTopButtons() {
        const pbtn = document.getElementById('mh-power-btn');
        if (pbtn) {
            pbtn.classList.toggle('active', this.powerOn);
            pbtn.textContent = this.powerOn ? 'POWER ON' : 'POWER OFF';
        }
        const ebtn = document.getElementById('mh-error-btn');
        if (ebtn) {
            ebtn.classList.toggle('active', this.errorMode);
            ebtn.textContent = this.resolutionMode ? 'CAL ERROR OFF' : (this.errorMode ? 'CAL ERROR ON' : 'CAL ERROR OFF');
        }
        const rbtn = document.getElementById('mh-resolution-btn');
        if (rbtn) {
            rbtn.classList.toggle('active', this.resolutionMode);
            rbtn.textContent = this.resolutionMode ? '精度比較中' : '精度比較 OFF';
        }
        const m8 = document.getElementById('mh-mode-8');
        const m16 = document.getElementById('mh-mode-16');
        if (m8 && m16) {
            if (this.resolutionMode) {
                m8.classList.remove('active');
                m16.classList.add('active');
                m8.setAttribute('aria-disabled', 'true');
                m16.setAttribute('aria-disabled', 'true');
            } else {
                m8.removeAttribute('aria-disabled');
                m16.removeAttribute('aria-disabled');
                m8.classList.toggle('active', this.mode === '8bit');
                m16.classList.toggle('active', this.mode === '16bit');
            }
        }
    },

    toggleError() {
        if (this.resolutionMode) {
            // 比較モードとキャリブレーションエラーは混ぜない。
            this.resolutionMode = false;
            this.phase = this.powerOn ? this.phase : 'off';
            this.status = this.powerOn ? this.status : 'POWER OFF';
        }
        this.errorMode = !this.errorMode;
        this.syncTopButtons();
        if (this.powerOn) this.startCalibration();
        this.updateCanvasMode();
        this.updateSystem();
    },

    toggleResolution() {
        this.resolutionMode = !this.resolutionMode;
        if (this.resolutionMode) {
            // v0.15 FIX:
            // 8/16比較では、キャリブレーション／エラー表示を完全に切り離す。
            // 左フェーダー＝Coarse、右フェーダー＝Fine。
            this.powerOn = false;
            this.errorMode = false;
            this.mode = '16bit';
            this.phase = 'resolution';
            this.status = '16bit 精度比較中';
            this.resetCalibrationMarks();
            const max = this.getMaxValue();
            this.panValue = Math.max(0, Math.min(255, Math.round((this.panValue / max) * 255)));
            this.tiltValue = Math.max(0, Math.min(255, Math.round((this.tiltValue / max) * 255)));
            this.panFineValue = Math.max(0, Math.min(255, this.panFineValue ?? 255));
            this.tiltFineValue = Math.max(0, Math.min(255, this.tiltFineValue ?? 128));
        } else {
            this.phase = 'off';
            this.status = 'POWER OFF';
        }
        this.syncTopButtons();
        this.updateCanvasMode();
        this.updateSystem();
    },

    startCalibration() {
        this.resetCalibrationMarks();
        this.phase = 'pan_start';
        this.status = 'CALIBRATING';
        this.phaseStart = performance.now();
        this.calPosition = { pan: 0.5, tilt: 0.5 };
    },

    resetCalibrationMarks() {
        this.cal = { panStart: false, panEnd: false, tiltStart: false, tiltEnd: false, panEndError: false, tiltEndError: false };
    },

    setMode(mode) {
        if (this.resolutionMode) return;
        this.mode = mode;
        document.getElementById('mh-mode-8').classList.toggle('active', mode === '8bit');
        document.getElementById('mh-mode-16').classList.toggle('active', mode === '16bit');
        if (!this.resolutionMode) {
            const max = this.getMaxValue();
            this.panValue = Math.max(0, Math.min(max, this.panValue));
            this.tiltValue = Math.max(0, Math.min(max, this.tiltValue));
        }
        this.updateSystem();
    },

    startDrag(e, id) { e.preventDefault(); this.dragging = id; this.setValueFromPointer(e, id); },
    onDrag(e) { if (!this.dragging) return; e.preventDefault(); this.setValueFromPointer(e, this.dragging); },
    endDrag() { this.dragging = null; },

    setValueFromPointer(e, id) {
        const touch = e.touches ? e.touches[0] : e;
        const rect = document.getElementById(`mh-${id}-track`).getBoundingClientRect();
        const y = Math.max(0, Math.min(rect.height, touch.clientY - rect.top));
        const ratio = 1 - (y / rect.height);
        const value = Math.round(ratio * (this.resolutionMode ? 255 : this.getMaxValue()));
        if (id === 'pan' || id === 'rpan') this.panValue = value;
        if (id === 'tilt' || id === 'rtilt') this.tiltValue = value;
        if (id === 'rpanfine') this.panFineValue = value;
        if (id === 'rtiltfine') this.tiltFineValue = value;
        this.updateSystem();
    },

    stepValue(id, direction) {
        const max = this.resolutionMode ? 255 : this.getMaxValue();
        const step = this.resolutionMode ? 1 : (this.mode === '8bit' ? 1 : 257);
        if (id === 'pan' || id === 'rpan') this.panValue = Math.max(0, Math.min(max, this.panValue + direction * step));
        if (id === 'tilt' || id === 'rtilt') this.tiltValue = Math.max(0, Math.min(max, this.tiltValue + direction * step));
        if (id === 'rpanfine') this.panFineValue = Math.max(0, Math.min(max, this.panFineValue + direction * step));
        if (id === 'rtiltfine') this.tiltFineValue = Math.max(0, Math.min(max, this.tiltFineValue + direction * step));
        this.updateSystem();
    },

    getMaxValue() { return this.mode === '8bit' ? 255 : 65535; },
    ratioToCenteredAngle(ratio, range) { return (ratio - 0.5) * range; },
    getPanRatio() { return this.panValue / this.getMaxValue(); },
    getTiltRatio() { return this.tiltValue / this.getMaxValue(); },

    loop(now) {
        this.updateCalibration(now);
        this.updateSystem();
        this.animId = requestAnimationFrame(t => this.loop(t));
    },

    updateCalibration(now) {
        if (!this.powerOn || this.phase === 'ready' || this.phase === 'error' || this.phase === 'off') return;
        const t = Math.min(1, (now - this.phaseStart) / 950);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        if (this.phase === 'pan_start') {
            this.calPosition.pan = 0.5 + (0 - 0.5) * ease;
            if (t >= 1) { this.cal.panStart = true; this.nextPhase('pan_end', now); }
        } else if (this.phase === 'pan_end') {
            const target = this.errorMode ? 0.84 : 1;
            this.calPosition.pan = 0 + (target - 0) * ease;
            if (t >= 1) {
                if (this.errorMode) { this.cal.panEndError = true; this.nextPhase('tilt_start', now); }
                else { this.cal.panEnd = true; this.nextPhase('tilt_start', now); }
            }
        } else if (this.phase === 'tilt_start') {
            this.calPosition.tilt = 0.5 + (0 - 0.5) * ease;
            if (t >= 1) { this.cal.tiltStart = true; this.nextPhase('tilt_end', now); }
        } else if (this.phase === 'tilt_end') {
            const target = this.errorMode ? 0.78 : 1;
            this.calPosition.tilt = 0 + (target - 0) * ease;
            if (t >= 1) {
                if (this.errorMode) { this.cal.tiltEndError = true; this.nextPhase('home', now); }
                else { this.cal.tiltEnd = true; this.nextPhase('home', now); }
            }
        } else if (this.phase === 'home') {
            this.calPosition.pan = this.calPosition.pan + (0.5 - this.calPosition.pan) * 0.08;
            this.calPosition.tilt = this.calPosition.tilt + (0.5 - this.calPosition.tilt) * 0.08;
            if (now - this.phaseStart > 1100) {
                this.phase = this.errorMode ? 'error' : 'ready';
                this.status = this.errorMode ? 'CALIBRATION ERROR' : 'READY';
            }
        }
    },

    nextPhase(phase, now) {
        this.phase = phase;
        this.phaseStart = now;
    },

    updateCanvasMode() {
        if (!this.canvas) return;
        const canvasModeKey = `${this.errorMode}-${this.resolutionMode}`;
        if (this._canvasModeError === canvasModeKey) return;
        this._canvasModeError = canvasModeKey;
        this.V_HEIGHT = this.errorMode ? 1160 : 640;
        this.canvas.style.height = this.errorMode ? '1160px' : '100%';
        this.resizeCanvas();
    },

    resizeCanvas() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = Math.floor(rect.width * dpr);
        this.canvas.height = Math.floor(rect.height * dpr);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        const scale = Math.min(rect.width / this.V_WIDTH, rect.height / this.V_HEIGHT);
        const offsetX = (rect.width - this.V_WIDTH * scale) / 2;
        // v0.13 LARGE4 UPFIX:
        // 縦長キャンバス内で描画を中央寄せすると、上に大きな余白が出る。
        // 4画面を同じ大きさで縦に並べる時は、描画基準を上端に固定する。
        const offsetY = 0;
        this.ctx.translate(offsetX, offsetY);
        this.ctx.scale(scale, scale);
    },

    updateSystem() {
        const max = this.resolutionMode ? 255 : this.getMaxValue();
        this.panValue = Math.max(0, Math.min(max, this.panValue));
        this.tiltValue = Math.max(0, Math.min(max, this.tiltValue));

        let panRatio = this.getPanRatio();
        let tiltRatio = this.getTiltRatio();
        let panAngle = this.ratioToCenteredAngle(panRatio, this.panRange);
        let tiltAngle = this.ratioToCenteredAngle(tiltRatio, this.tiltRange);

        if (this.resolutionMode) {
            // v0.18:
            // 16bitの説明はPANだけに絞る。
            // 左Fader = Coarse、右Fader = Fine/Target。
            // 8bitはCoarse段だけ、16bitはFineで狙い位置へ寄せる。
            const panCoarse = this.panValue;
            const panFine = this.panFineValue;
            const pan8Ratio = panCoarse / 255;
            const exaggerateDeg = ((panFine / 255) - 0.5) * 4.0; // 教材用：最大±2°の見えるズレ
            const targetRatio = Math.max(0, Math.min(1, pan8Ratio + exaggerateDeg / this.panRange));
            const pan8Angle = this.ratioToCenteredAngle(pan8Ratio, this.panRange);
            const targetAngle = this.ratioToCenteredAngle(targetRatio, this.panRange);
            this.text('mh-pan-dmx-label', 'TARGET');
            this.text('mh-pan-angle-label', '8bit');
            this.text('mh-tilt-dmx-label', '16bit');
            this.text('mh-tilt-angle-label', 'ズレ');
            this.text('mh-pan-dmx', `${targetAngle.toFixed(2)}°`);
            this.text('mh-pan-angle', `${pan8Angle.toFixed(2)}°`);
            this.text('mh-tilt-dmx', `${targetAngle.toFixed(2)}°`);
            this.text('mh-tilt-angle', `約 ${Math.abs(targetAngle - pan8Angle).toFixed(2)}°`);
            this.text('mh-rpan-percent', `${Math.round(pan8Ratio * 100)}%`);
            this.text('mh-rpanfine-percent', `${Math.round((panFine / 255) * 100)}%`);
            panRatio = pan8Ratio;
            tiltRatio = 0.5;
            panAngle = targetAngle;
            tiltAngle = 0;
            this.updateFader('rpan', pan8Ratio);
            this.updateFader('rpanfine', panFine / 255);
        } else {
            this.text('mh-pan-label', 'PAN');
            this.text('mh-tilt-label', 'TILT');
            this.text('mh-pan-dmx-label', 'PAN DMX');
            this.text('mh-pan-angle-label', 'PAN');
            this.text('mh-tilt-dmx-label', 'TILT DMX');
            this.text('mh-tilt-angle-label', 'TILT');
            this.text('mh-pan-dmx', this.panValue);
            this.text('mh-tilt-dmx', this.tiltValue);
            this.text('mh-pan-angle', `${panAngle.toFixed(1)}°`);
            this.text('mh-tilt-angle', this.formatTilt(tiltAngle));
            this.text('mh-pan-percent', `${Math.round(panRatio * 100)}%`);
            this.text('mh-tilt-percent', `${Math.round(tiltRatio * 100)}%`);
        }

        this.text('mh-power-state', this.powerOn ? 'ON' : 'OFF');
        this.text('mh-status-state', this.resolutionMode ? '16bit 精度比較中' : this.status);
        this.text('mh-phase-state', this.resolutionMode ? '精度比較' : this.phase.toUpperCase());
        this.syncTopButtons();
        const root = document.querySelector('.movinghead-root');
        if (root) root.classList.toggle('mh-resolution-mode', this.resolutionMode);

        this.updateFader('pan', panRatio);
        this.updateFader('tilt', tiltRatio);
        this.updateIndicator('pan', 'start', this.cal.panStart, false);
        this.updateIndicator('pan', 'end', this.cal.panEnd, this.cal.panEndError);
        this.updateIndicator('tilt', 'start', this.cal.tiltStart, false);
        this.updateIndicator('tilt', 'end', this.cal.tiltEnd, this.cal.tiltEndError);
        this.updateLED('pan-start', this.cal.panStart, false);
        this.updateLED('pan-end', this.cal.panEnd, this.cal.panEndError);
        this.updateLED('tilt-start', this.cal.tiltStart, false);
        this.updateLED('tilt-end', this.cal.tiltEnd, this.cal.tiltEndError);
        this.updateErrorStopLines();
        this.updateCanvasMode();

        this.drawCanvas(panRatio, tiltRatio, panAngle, tiltAngle);
    },

    text(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; },

    formatTilt(angle) {
        if (Math.abs(angle) < 0.5) return '正面 0°';
        return angle < 0 ? `下 ${Math.abs(angle).toFixed(1)}°` : `上 ${angle.toFixed(1)}°`;
    },

    updateFader(id, ratio) {
        const knob = document.getElementById(`mh-${id}-knob`);
        const fill = document.getElementById(`mh-${id}-fill`);
        if (!knob || !fill) return;
        const y = ratio * 100;
        knob.style.bottom = `calc(${y}% - 23px)`;
        fill.style.height = `${y}%`;
    },

    updateIndicator(axis, side, ok, err) {
        const el = document.getElementById(`mh-${axis}-${side}-mark`);
        if (!el) return;
        if (this.resolutionMode) {
            el.classList.remove('active', 'error', 'current');
            el.textContent = side === 'start' ? (axis === 'pan' ? '0' : 'Fine 0') : (axis === 'pan' ? '255' : 'Fine 255');
            return;
        }
        const current = this.powerOn && this.phase === `${axis}_${side}`;
        const isEndError = side === 'end' && err;
        el.classList.toggle('active', ok && !isEndError);
        el.classList.toggle('error', false);
        el.classList.toggle('current', current && !isEndError);
        const label = side.toUpperCase();
        el.textContent = isEndError ? `${label} 本来位置` : ok ? `${label} ✓` : current ? `${label} ...` : label;
    },

    updateErrorStopLines() {
        const setStop = (axis, visible, ratio) => {
            const el = document.getElementById(`mh-${axis}-error-stop`);
            if (!el) return;
            el.classList.toggle('visible', !!visible);
            el.style.top = `${100 - ratio * 100}%`;
        };
        const panVisible = !this.resolutionMode && this.errorMode && (this.phase === 'pan_end' || this.cal.panEndError || this.phase === 'tilt_start' || this.phase === 'tilt_end' || this.phase === 'home' || this.phase === 'error');
        const tiltVisible = !this.resolutionMode && this.errorMode && (this.phase === 'tilt_end' || this.cal.tiltEndError || this.phase === 'home' || this.phase === 'error');
        setStop('pan', panVisible, 0.84);
        setStop('tilt', tiltVisible, 0.78);
    },

    updateLED(name, ok, err) {
        const el = document.getElementById(`mh-led-${name}`);
        if (!el) return;
        if (this.resolutionMode) {
            el.classList.remove('ok', 'err');
            el.textContent = name.includes('start') ? '8bit STEP' : '16bit FINE';
            return;
        }
        el.classList.toggle('ok', ok);
        el.classList.toggle('err', err);
        const base = name.toUpperCase().replace('-', ' ');
        el.textContent = err ? `${base} ×` : ok ? `${base} ✓` : base;
    },

    drawCanvas(panRatio, tiltRatio, panAngle, tiltAngle) {
        const ctx = this.ctx;
        if (!ctx) return;
        ctx.clearRect(-1000, -1000, 3000, 3000);
        ctx.fillStyle = '#071013';
        ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);
        this.drawGrid(ctx);
        this.drawPowerBanner(ctx);

        if (this.resolutionMode) {
            this.drawResolutionCanvas(ctx);
        } else if (this.errorMode) {
            // CAL ERROR ONの時だけ4画面比較。
            // ただし各画面は通常2画面時と同じ大きさで描く。
            // 中央パネル内を縦スクロールして、下段のエラー表示を見る。
            this.drawQuadrant(ctx, 24, 52, 464, 520, 'NORMAL : PAN FRONT VIEW', false, panRatio, tiltRatio, panAngle, tiltAngle, 'pan');
            this.drawQuadrant(ctx, 512, 52, 464, 520, 'NORMAL : TILT RIGHT-SIDE VIEW', false, panRatio, tiltRatio, panAngle, tiltAngle, 'tilt');
            this.drawQuadrant(ctx, 24, 608, 464, 520, 'ERROR : PAN FRONT VIEW', true, panRatio, tiltRatio, panAngle, tiltAngle, 'pan');
            this.drawQuadrant(ctx, 512, 608, 464, 520, 'ERROR : TILT RIGHT-SIDE VIEW', true, panRatio, tiltRatio, panAngle, tiltAngle, 'tilt');
        } else {
            // 通常時は正常PAN/TILTの2画面だけ。情報量を減らす。
            this.drawQuadrant(ctx, 24, 52, 464, 520, 'NORMAL : PAN FRONT VIEW', false, panRatio, tiltRatio, panAngle, tiltAngle, 'pan');
            this.drawQuadrant(ctx, 512, 52, 464, 520, 'NORMAL : TILT RIGHT-SIDE VIEW', false, panRatio, tiltRatio, panAngle, tiltAngle, 'tilt');
        }
        this.drawCanvasFooter(ctx);
    },

    drawGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,229,255,.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= this.V_WIDTH; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,this.V_HEIGHT); ctx.stroke(); }
        for (let y = 0; y <= this.V_HEIGHT; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(this.V_WIDTH,y); ctx.stroke(); }
        ctx.restore();
    },

    drawPowerBanner(ctx) {
        const active = this.powerOn && !['ready','error','off'].includes(this.phase);
        ctx.save();
        const compare = this.resolutionMode;
        ctx.fillStyle = compare ? 'rgba(179,136,255,.18)' : (this.powerOn ? 'rgba(0,230,118,.16)' : 'rgba(255,255,255,.06)');
        ctx.strokeStyle = compare ? '#b388ff' : (this.powerOn ? '#00e676' : '#555');
        ctx.lineWidth = 2;
        this.roundRect(ctx, 24, 14, 952, 28, 10, true, true);
        ctx.font = 'bold 14px Roboto Mono, monospace';
        ctx.fillStyle = compare ? '#eadcff' : (this.powerOn ? '#baffd8' : '#777');
        const bannerText = compare ? '精度比較 / PAN540°回転 / Coarse + Fine' : (this.powerOn ? `POWER ON / ${this.status} / PHASE: ${this.phase.toUpperCase()}` : 'POWER OFF / キャリブレーション待機');
        ctx.fillText(bannerText, 42, 33);
        if (active) {
            const now = performance.now();
            const x = 42 + ((now / 7) % 900);
            const g = ctx.createLinearGradient(x - 70, 0, x + 70, 0);
            g.addColorStop(0, 'rgba(0,230,118,0)');
            g.addColorStop(.5, 'rgba(0,230,118,.95)');
            g.addColorStop(1, 'rgba(0,230,118,0)');
            ctx.strokeStyle = g;
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(x - 70, 40); ctx.lineTo(x + 70, 40); ctx.stroke();
            ctx.fillStyle = '#00e676';
            ctx.font = 'bold 12px Roboto, sans-serif';
            ctx.fillText('AUTO CALIBRATION RUNNING', 760, 33);
        }
        ctx.restore();
    },

    drawQuadrant(ctx, x, y, w, h, title, isError, panRatio, tiltRatio, panAngle, tiltAngle, view) {
        ctx.save();
        ctx.fillStyle = isError ? 'rgba(55,12,6,.72)' : 'rgba(5,21,24,.78)';
        ctx.strokeStyle = isError ? '#ff3d00' : '#00e5ff';
        ctx.lineWidth = 3;
        this.roundRect(ctx, x, y, w, h, 14, true, true);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Roboto, sans-serif';
        ctx.fillText(title, x + 18, y + 30);
        const active = this.powerOn && !['ready','error','off'].includes(this.phase);
        const usePan = active ? this.calPosition.pan : panRatio;
        const useTilt = active ? this.calPosition.tilt : tiltRatio;
        const ePan = isError ? Math.max(0, Math.min(1, usePan - 0.16)) : usePan;
        const eTilt = isError ? Math.max(0, Math.min(1, useTilt - 0.22)) : useTilt;
        const cx = x + w / 2;
        const isLargeView = h >= 500;
        const cy = isLargeView ? (y + h / 2 + 34) : (y + h / 2 + 12);
        const objectScale = isLargeView
            ? (view === 'tilt' ? 1.50 : 1.58)
            : (h > 300 ? (view === 'tilt' ? 1.12 : 1.16) : (view === 'tilt' ? 0.88 : 0.90));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(objectScale, objectScale);
        if (view === 'pan') this.drawPanView(ctx, 0, 0, isError ? ePan : usePan, isError);
        else this.drawTiltView(ctx, 0, 0, isError ? eTilt : useTilt, isError);
        ctx.restore();
        ctx.font = 'bold 14px Roboto Mono, monospace';
        ctx.fillStyle = isError ? '#ffb199' : '#9df5ff';
        const label = view === 'pan'
            ? `PAN CMD ${panAngle.toFixed(1)}° ${isError ? '/ ACTUAL SHIFTED' : '/ ACTUAL OK'}`
            : `TILT CMD ${this.formatTilt(tiltAngle)} ${isError ? '/ ACTUAL SHIFTED' : '/ ACTUAL OK'}`;
        ctx.fillText(label, x + 18, y + h - 18);
        if (isError && this.errorMode) {
            ctx.fillStyle = '#ff3d00';
            ctx.font = 'bold 20px Roboto, sans-serif';
            ctx.fillText('CALIBRATION ERROR', x + w - 220, y + 30);
        }
        ctx.restore();
    },

    drawPanView(ctx, cx, cy, ratio, isError) {
        // PAN 540°を画面上でも回す。
        // 0→360°で1周、360→540°でさらに半周する。
        const travelDeg = ratio * this.panRange;
        const angle = -Math.PI + (travelDeg * Math.PI / 180);
        const firstLap = Math.min(travelDeg, 360);
        const secondLap = Math.max(0, travelDeg - 360);

        ctx.save();
        ctx.translate(cx, cy);

        // 1周目のガイドリング。
        ctx.strokeStyle = 'rgba(255,255,255,.18)';
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.arc(0, 0, 98, -Math.PI, Math.PI); ctx.stroke();

        // 2周目の追加180°ガイド。外側の半円で「一周以上」を見せる。
        ctx.strokeStyle = 'rgba(179,136,255,.22)';
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(0, 0, 122, -Math.PI, 0); ctx.stroke();

        // 1周目の進行表示。
        if (firstLap > 0) {
            ctx.strokeStyle = isError ? 'rgba(255,61,0,.78)' : 'rgba(0,229,255,.82)';
            ctx.lineWidth = 7;
            ctx.beginPath(); ctx.arc(0, 0, 98, -Math.PI, -Math.PI + firstLap * Math.PI / 180); ctx.stroke();
        }

        // 2周目の進行表示。
        if (secondLap > 0) {
            ctx.strokeStyle = isError ? 'rgba(255,138,101,.90)' : 'rgba(179,136,255,.96)';
            ctx.lineWidth = 7;
            ctx.beginPath(); ctx.arc(0, 0, 122, -Math.PI, -Math.PI + secondLap * Math.PI / 180); ctx.stroke();
        }

        // 現在位置マーカー。
        const markerR = secondLap > 0 ? 122 : 98;
        const markerAngle = secondLap > 0 ? (-Math.PI + secondLap * Math.PI / 180) : (-Math.PI + firstLap * Math.PI / 180);
        ctx.fillStyle = secondLap > 0 ? '#b388ff' : (isError ? '#ff3d00' : '#00e5ff');
        ctx.beginPath();
        ctx.arc(Math.cos(markerAngle) * markerR, Math.sin(markerAngle) * markerR, 8, 0, Math.PI * 2);
        ctx.fill();

        // 固定ベース。
        ctx.strokeStyle = isError ? '#ff3d00' : '#00e5ff';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0,-128); ctx.lineTo(0,128); ctx.stroke();
        ctx.fillStyle = '#333'; ctx.strokeStyle = '#888'; ctx.lineWidth = 4;
        this.roundRect(ctx, -95, 70, 190, 55, 12, true, true);

        // 実際のヘッド。ここも540°ぶん回転させる。
        ctx.rotate(angle);
        ctx.fillStyle = '#444'; this.roundRect(ctx, -88, -28, 176, 56, 10, true, true);
        ctx.fillStyle = '#555'; this.roundRect(ctx, -108, -75, 38, 110, 9, true, true); this.roundRect(ctx, 70, -75, 38, 110, 9, true, true);
        ctx.fillStyle = '#666'; this.roundRect(ctx, -65, -92, 130, 95, 20, true, true);
        ctx.fillStyle = '#090909'; ctx.beginPath(); ctx.ellipse(0, -45, 40, 28, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = isError ? '#ff8a65' : '#00e5ff'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(0,-70); ctx.lineTo(0,-150); ctx.stroke();
        ctx.restore();
    },

    drawTiltView(ctx, cx, cy, ratio, isError) {
        // v0.12 TILT right-side educational view:
        // Kim指示の「天地逆」版。固定アーム／支点を中央に置き、
        // その上側にヘッド筐体を描く。横から見たTILTとして、
        // 支点を中心にヘッド筐体が時計回り／反時計回りに回る。
        const visualDeg = (ratio - 0.5) * 270;
        const visualRad = visualDeg * Math.PI / 180;
        const centerDeg = -90; // 0°位置は支点の上側
        const startDeg = centerDeg - 135;
        const endDeg = centerDeg + 135;
        const guideR = 116;
        const color = isError ? '#ff3d00' : '#ffca28';
        const activePhase = this.powerOn && !['ready','error','off'].includes(this.phase);

        ctx.save();
        ctx.translate(cx, cy + 12);

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,.82)';
        ctx.font = 'bold 12px Roboto, sans-serif';
        ctx.fillText('TILT RIGHT-SIDE VIEW', -86, -116);
        ctx.fillStyle = color;
        ctx.fillText('FIXED ARM / TILT AXIS', -78, -98);

        // TILT軸。画面中央に固定。
        const pivotX = 0;
        const pivotY = 8;

        // ベース。TILTでは動かない。下側へ固定配置。
        ctx.fillStyle = 'rgba(0,0,0,.36)';
        ctx.beginPath();
        ctx.ellipse(0, 140, 116, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        const baseGrad = ctx.createLinearGradient(-112, 92, 112, 148);
        baseGrad.addColorStop(0, '#777');
        baseGrad.addColorStop(.26, '#303030');
        baseGrad.addColorStop(.62, '#666');
        baseGrad.addColorStop(1, '#1d1d1d');
        ctx.fillStyle = baseGrad;
        ctx.strokeStyle = '#b7b7b7';
        ctx.lineWidth = 4;
        this.roundRect(ctx, -108, 104, 216, 42, 14, true, true);
        ctx.strokeStyle = 'rgba(255,255,255,.24)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 106, 98, 16, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 中央支柱。ベースから支点へ伸びる固定部。
        const columnGrad = ctx.createLinearGradient(-40, 28, 40, 106);
        columnGrad.addColorStop(0, '#b0b0b0');
        columnGrad.addColorStop(.42, '#303030');
        columnGrad.addColorStop(1, '#777');
        ctx.fillStyle = columnGrad;
        ctx.strokeStyle = '#a8a8a8';
        ctx.lineWidth = 3;
        this.roundRect(ctx, -34, 32, 68, 74, 12, true, true);

        // 固定アーム。ここは回転しない。
        const armGrad = ctx.createLinearGradient(-88, -16, 88, 36);
        armGrad.addColorStop(0, '#8d8d8d');
        armGrad.addColorStop(.38, '#3c3c3c');
        armGrad.addColorStop(.72, '#777');
        armGrad.addColorStop(1, '#282828');
        ctx.fillStyle = armGrad;
        ctx.strokeStyle = '#c7c7c7';
        ctx.lineWidth = 4;
        this.roundRect(ctx, -68, -18, 136, 36, 12, true, true);
        this.roundRect(ctx, -22, 10, 44, 36, 10, true, true);

        // 支点マーク。
        ctx.fillStyle = '#0c0c0c';
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
        ctx.fill();

        // 可動範囲ガイド。支点を中心に、上側の円弧として見せる。
        ctx.save();
        ctx.translate(pivotX, pivotY);
        ctx.strokeStyle = 'rgba(255,255,255,.16)';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(0, 0, guideR, startDeg * Math.PI / 180, endDeg * Math.PI / 180);
        ctx.stroke();

        ctx.strokeStyle = activePhase ? 'rgba(255,202,40,.48)' : 'rgba(255,202,40,.20)';
        ctx.lineWidth = activePhase ? 5 : 3;
        ctx.beginPath();
        ctx.arc(0, 0, guideR, startDeg * Math.PI / 180, (centerDeg + visualDeg) * Math.PI / 180);
        ctx.stroke();

        this.drawArcEndpoint(ctx, guideR, startDeg, 'START', this.cal.tiltStart, false);
        this.drawArcEndpoint(ctx, guideR, endDeg, 'END', this.cal.tiltEnd, this.cal.tiltEndError);
        ctx.restore();

        // ゴースト：0°位置。支点の上で垂直に立つ基準。
        ctx.save();
        ctx.translate(pivotX, pivotY);
        ctx.globalAlpha = .16;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -112); ctx.lineTo(0, 112); ctx.stroke();
        this.roundRect(ctx, -45, -94, 90, 188, 22, false, true);
        ctx.beginPath(); ctx.moveTo(-45, 0); ctx.lineTo(45, 0); ctx.stroke();
        ctx.restore();

        // 回転ヘッド本体。v0.12：回転軸をヘッド筐体の中央へ移動。
        // 固定アームの支点は、ヘッドの端ではなく中央を貫く。
        ctx.save();
        ctx.translate(pivotX, pivotY);
        ctx.rotate(visualRad);

        // ヘッド筐体。0°では支点を中心に上下へ伸びる縦長形状。
        const bodyGrad = ctx.createLinearGradient(-60, -92, 60, 92);
        bodyGrad.addColorStop(0, '#eeeeee');
        bodyGrad.addColorStop(.18, '#a0a0a0');
        bodyGrad.addColorStop(.50, '#3a3a3a');
        bodyGrad.addColorStop(.78, '#5a5a5a');
        bodyGrad.addColorStop(1, '#111');
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = '#dddddd';
        ctx.lineWidth = 4;
        this.roundRect(ctx, -54, -94, 108, 188, 30, true, true);

        // 支点を通るセンターリング。ここがTILT回転軸。
        ctx.strokeStyle = 'rgba(255,255,255,.42)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-54, 0); ctx.lineTo(54, 0); ctx.stroke();
        ctx.fillStyle = '#151515';
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // 側面の面取り線。
        ctx.strokeStyle = 'rgba(255,255,255,.32)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-22, -82); ctx.lineTo(-22, 82); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(22, -82); ctx.lineTo(22, 82); ctx.stroke();

        // レンズ。0°ではヘッド上側。回転するとビームも同じ向きへ動く。
        const lensY = -100;
        const lensGrad = ctx.createRadialGradient(0, lensY, 4, 0, lensY, 37);
        lensGrad.addColorStop(0, '#ffffff');
        lensGrad.addColorStop(.28, '#fff59d');
        lensGrad.addColorStop(.65, color);
        lensGrad.addColorStop(1, '#160f00');
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(0, lensY, 36, 21, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.ellipse(0, lensY, 24, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // ビーム。レンズから上方向へ出る。ヘッドと一緒に回転する。
        ctx.strokeStyle = isError ? '#ff8a65' : '#ffca28';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(0, lensY - 18); ctx.lineTo(0, lensY - 78); ctx.stroke();
        ctx.fillStyle = isError ? 'rgba(255,61,0,.14)' : 'rgba(255,202,40,.14)';
        ctx.beginPath();
        ctx.moveTo(-18, lensY - 18); ctx.lineTo(0, lensY - 104); ctx.lineTo(18, lensY - 18); ctx.closePath(); ctx.fill();

        ctx.restore();

        // 回転方向表示。
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 140, -Math.PI * .46, -Math.PI * .28);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = 'bold 20px Roboto, sans-serif';
        ctx.fillText(visualDeg >= 0 ? '↻' : '↺', 112, -18);

        if (activePhase && this.phase.startsWith('tilt_')) {
            ctx.font = 'bold 13px Roboto Mono, monospace';
            ctx.fillText(this.phase === 'tilt_start' ? 'MOVING TO START' : 'MOVING TO END', -84, 166);
        }

        ctx.restore();
    },

    drawArcEndpoint(ctx, r, deg, label, ok, err) {
        const rad = deg * Math.PI / 180;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        ctx.save();
        ctx.fillStyle = err ? '#ff3d00' : ok ? '#00e676' : '#555';
        ctx.strokeStyle = err ? '#ff3d00' : ok ? '#00e676' : '#777';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x, y, ok || err ? 8 : 5, 0, Math.PI*2); ctx.fill();
        ctx.font = 'bold 11px Roboto Mono, monospace';
        const suffix = err ? ' ×' : ok ? ' ✓' : '';
        ctx.fillText(label + suffix, x + (x < 0 ? -62 : 12), y + (y < 0 ? -8 : 16));
        ctx.restore();
    },

    drawResolutionCanvas(ctx) {
        const panCoarse = Math.max(0, Math.min(255, this.panValue));
        const panFine = Math.max(0, Math.min(255, this.panFineValue));
        const pan8 = panCoarse / 255;

        // v1.0：PANは540°＝一周＋半周。
        // 見た目の向きだけでは差が見えにくいので、540°可動域ゲージも併記する。
        // 教材用にFineで狙う位置は最大±2°で誇張表示。
        const ghostDiffDeg = ((panFine / 255) - 0.5) * 4.0;
        const target = Math.max(0, Math.min(1, pan8 + ghostDiffDeg / this.panRange));

        this.drawResolutionGhostPanel(ctx, 24, 52, 464, 385, '8bit PAN：段で止まる', pan8, target, false);
        this.drawResolutionGhostPanel(ctx, 512, 52, 464, 385, '16bit PAN：Fineで狙う', target, target, true);
        this.drawPan540RangeGauge(ctx, 44, 464, 912, 118, pan8, target);
        this.drawResolutionFooter(ctx, pan8, target);
    },

    drawResolutionGhostPanel(ctx, x, y, w, h, title, actualRatio, targetRatio, is16) {
        const actualAngle = this.ratioToCenteredAngle(actualRatio, this.panRange);
        const targetAngle = this.ratioToCenteredAngle(targetRatio, this.panRange);
        const diff = targetAngle - actualAngle;

        ctx.save();
        ctx.fillStyle = is16 ? 'rgba(5,24,18,.86)' : 'rgba(28,21,4,.84)';
        ctx.strokeStyle = is16 ? '#00e676' : '#ffca28';
        ctx.lineWidth = 4;
        this.roundRect(ctx, x, y, w, h, 16, true, true);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px Roboto, sans-serif';
        ctx.fillText(title, x + 20, y + 34);
        ctx.font = 'bold 15px Roboto, sans-serif';
        ctx.fillStyle = is16 ? '#baffd8' : '#fff3a0';
        ctx.fillText(is16 ? 'TARGET と ACTUAL がほぼ重なる' : 'TARGET と ACTUAL が約2°ズレて見える', x + 20, y + 58);

        const cx = x + w / 2;
        const cy = y + 212;
        const scale = 1.30;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // TARGETゴースト。本体も薄く重ねる。
        ctx.save();
        ctx.globalAlpha = is16 ? 0.22 : 0.30;
        this.drawPanView(ctx, 0, 0, targetRatio, false);
        ctx.restore();

        // ACTUAL本体。
        this.drawPanView(ctx, 0, 0, actualRatio, false);

        // 見るべき線を大きく強調。
        this.drawPanAngleLine(ctx, targetRatio, '#ffffff', 'TARGET', true, 7);
        this.drawPanAngleLine(ctx, actualRatio, is16 ? '#00e676' : '#ffca28', is16 ? '16bit' : '8bit', false, 7);
        if (!is16) this.drawPanDiffArc(ctx, actualRatio, targetRatio);
        ctx.restore();

        // 数字は最小限。細かい数値より、絵とゲージで見る。
        ctx.fillStyle = 'rgba(0,0,0,.56)';
        ctx.strokeStyle = is16 ? 'rgba(0,230,118,.82)' : 'rgba(255,202,40,.88)';
        ctx.lineWidth = 2;
        this.roundRect(ctx, x + 20, y + h - 76, w - 40, 54, 12, true, true);
        ctx.font = '900 17px Roboto Mono, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`TARGET ${targetAngle.toFixed(2)}°`, x + 36, y + h - 44);
        ctx.fillStyle = is16 ? '#00e676' : '#ffca28';
        ctx.fillText(is16 ? 'ACTUAL ほぼ一致' : `ACTUAL 約${Math.abs(diff).toFixed(2)}°ズレ`, x + 236, y + h - 44);

        ctx.restore();
    },

    drawPan540RangeGauge(ctx, x, y, w, h, pan8Ratio, targetRatio) {
        const toX = (ratio) => x + 26 + ratio * (w - 52);
        const trackX = x + 26;
        const trackW = w - 52;
        const centerY = y + 54;
        const pan8Angle = pan8Ratio * this.panRange;
        const targetAngle = targetRatio * this.panRange;

        ctx.save();
        ctx.fillStyle = 'rgba(4,8,10,.86)';
        ctx.strokeStyle = 'rgba(0,229,255,.65)';
        ctx.lineWidth = 3;
        this.roundRect(ctx, x, y, w, h, 16, true, true);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px Roboto, sans-serif';
        ctx.fillText('PAN 540° 可動域：0° → 360° → 540°（一周＋半周）', x + 22, y + 28);

        // 540° linear track
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(trackX, centerY); ctx.lineTo(trackX + trackW, centerY); ctx.stroke();

        // 0 / 360 / 540 ticks
        const ticks = [
            {r:0, label:'0° / START'},
            {r:360/540, label:'360°'},
            {r:1, label:'540° / END'}
        ];
        ticks.forEach(t => {
            const tx = trackX + t.r * trackW;
            ctx.strokeStyle = t.r === 360/540 ? '#9e9e9e' : '#cccccc';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(tx, centerY - 22); ctx.lineTo(tx, centerY + 22); ctx.stroke();
            ctx.fillStyle = '#bbbbbb';
            ctx.font = 'bold 13px Roboto Mono, monospace';
            ctx.fillText(t.label, tx - (t.r === 1 ? 88 : 36), centerY + 42);
        });

        // 8bit / target / 16bit markers
        const markers = [
            {x: toX(targetRatio), color:'#ffffff', label:'TARGET', yOff:-46},
            {x: toX(pan8Ratio), color:'#ffca28', label:'8bit', yOff:-22},
            {x: toX(targetRatio), color:'#00e676', label:'16bit', yOff:18},
        ];
        markers.forEach(m => {
            ctx.strokeStyle = m.color;
            ctx.fillStyle = m.color;
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(m.x, centerY - 30); ctx.lineTo(m.x, centerY + 30); ctx.stroke();
            ctx.beginPath(); ctx.arc(m.x, centerY, 7, 0, Math.PI * 2); ctx.fill();
            ctx.font = '900 14px Roboto Mono, monospace';
            ctx.fillText(m.label, m.x + 10, centerY + m.yOff);
        });

        // visible exaggerated gap
        const gapStart = Math.min(toX(pan8Ratio), toX(targetRatio));
        const gapEnd = Math.max(toX(pan8Ratio), toX(targetRatio));
        if (Math.abs(gapEnd - gapStart) > 2) {
            ctx.strokeStyle = '#ff7043';
            ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(gapStart, centerY - 34); ctx.lineTo(gapEnd, centerY - 34); ctx.stroke();
            ctx.fillStyle = '#ff7043';
            ctx.font = '900 14px Roboto, sans-serif';
            ctx.fillText(`表示上のズレ 約${Math.abs(targetAngle - pan8Angle).toFixed(2)}°`, (gapStart + gapEnd) / 2 - 66, centerY - 43);
        }

        ctx.fillStyle = '#d9faff';
        ctx.font = 'bold 13px Roboto, sans-serif';
        ctx.fillText('同じ向きに見えても、PAN 0° と 360° は機械位置としては別。だから、円だけでなく可動域ゲージで見る。', x + 22, y + h - 16);
        ctx.restore();
    },

    drawResolutionFooter(ctx, pan8Ratio, targetRatio) {
        const pan8 = this.ratioToCenteredAngle(pan8Ratio, this.panRange);
        const target = this.ratioToCenteredAngle(targetRatio, this.panRange);
        ctx.save();
        ctx.fillStyle = '#d9faff';
        ctx.font = '900 16px Roboto, sans-serif';
        ctx.fillText(`PAN比較：8bitは540°を256段階で止まる。16bitはFineで段の間を狙える。表示差分 約 ${Math.abs(target-pan8).toFixed(2)}°`, 30, this.V_HEIGHT - 18);
        ctx.restore();
    },

    drawPanAngleLine(ctx, ratio, color, label, dashed, width = 5) {
        const angle = -Math.PI + ratio * Math.PI * 3;
        ctx.save();
        ctx.rotate(angle);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        if (dashed) ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.lineTo(0, -175);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.font = '900 13px Roboto, sans-serif';
        ctx.fillText(label, 10, -168);
        ctx.restore();
    },

    drawPanDiffArc(ctx, actualRatio, targetRatio) {
        const a1 = -Math.PI + actualRatio * Math.PI * 3;
        const a2 = -Math.PI + targetRatio * Math.PI * 3;
        const start = Math.min(a1, a2);
        const end = Math.max(a1, a2);
        ctx.save();
        ctx.strokeStyle = '#ff3d00';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, 142, start, end);
        ctx.stroke();
        const mid = (start + end) / 2;
        ctx.fillStyle = '#ff7043';
        ctx.font = '900 14px Roboto, sans-serif';
        ctx.fillText('ズレ', Math.cos(mid) * 150 - 14, Math.sin(mid) * 150 + 4);
        ctx.restore();
    },


    drawPanTargetOverlay(ctx, ratio, is16) {
        const angle = -Math.PI + ratio * Math.PI * 3;
        ctx.save();
        ctx.rotate(angle);
        ctx.strokeStyle = is16 ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.95)';
        ctx.lineWidth = is16 ? 3 : 4;
        ctx.setLineDash(is16 ? [8, 8] : [6, 6]);
        ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, -160); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Roboto Mono, monospace';
        ctx.fillText('TARGET', 8, -154);
        ctx.restore();
    },

    drawTiltTargetOverlay(ctx, ratio, is16) {
        const visualDeg = (ratio - 0.5) * 270;
        const visualRad = visualDeg * Math.PI / 180;
        const pivotY = 20;
        const lensY = -100;
        ctx.save();
        ctx.translate(0, pivotY);
        ctx.rotate(visualRad);
        ctx.strokeStyle = is16 ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.95)';
        ctx.lineWidth = is16 ? 3 : 4;
        ctx.setLineDash(is16 ? [8, 8] : [6, 6]);
        ctx.beginPath(); ctx.moveTo(0, lensY - 18); ctx.lineTo(0, lensY - 92); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Roboto Mono, monospace';
        ctx.fillText('TARGET', 8, lensY - 82);
        ctx.restore();
    },

    drawCanvasFooter(ctx) {
        ctx.save();
        ctx.fillStyle = '#b8c7c9';
        ctx.font = '14px Roboto, sans-serif';
        ctx.fillText('通常時は正常PAN/TILT。CAL ERROR ONはエラー比較。精度比較ONではPAN540°ゲージとゴーストで比較する。', 30, this.V_HEIGHT - 12);
        ctx.restore();
    },

    roundRect(ctx, x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
        if (fill) ctx.fill(); if (stroke) ctx.stroke();
    }
};
