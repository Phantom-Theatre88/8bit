const Module_NetBroadcast = {
    // --- 内部状態管理 ---
    currentMode: 2,
    knobStates: [2, 61, 120],
    speedFactors: [0, 0.1, 1.0],
    streamScrollX: 0,
    inputPackets: [],
    outputPackets: [],
    rejectedPackets: [],
    passedPackets: [],
    nodeHeat: [0, 0, 0, 0, 0],
    lastTime: 0,
    animationFrameId: null,
    canvas: null,
    ctx: null,

    // --- 定数定義 ---
    lineColors: ['#00e5ff', '#ff4081', '#00e676', '#ffca28', '#b388ff'],
    INPUT_SPEED: 500,
    HUB_OUT_SPEED: 950,
    BUNDLE_GAP: 280,
    V_WIDTH: 1200,
    V_HEIGHT: 520,
    pW: 40,
    pH: 20,



    // --- Visual test helpers: logic untouched / drawing polish only ---
    drawRoundedRect(x, y, w, h, r, fillStyle, strokeStyle = null, lineWidth = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        if (fillStyle) { ctx.fillStyle = fillStyle; ctx.fill(); }
        if (strokeStyle) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; ctx.stroke(); }
        ctx.restore();
    },

    drawTechBackground(accent = '#00e5ff') {
        const ctx = this.ctx;
        const g = ctx.createLinearGradient(0, 0, 0, this.V_HEIGHT);
        g.addColorStop(0, '#061012');
        g.addColorStop(0.55, '#030506');
        g.addColorStop(1, '#090909');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        for (let x = 0; x <= this.V_WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.V_HEIGHT); ctx.stroke(); }
        for (let y = 0; y <= this.V_HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.V_WIDTH, y); ctx.stroke(); }
        ctx.globalAlpha = 0.06;
        for (let x = 0; x <= this.V_WIDTH; x += 200) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.V_HEIGHT); ctx.stroke(); }
        ctx.restore();
    },

    drawPacket(x, y, w, h, color, label, modeLabel = '') {
        const ctx = this.ctx;
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        const g = ctx.createLinearGradient(x - w, y - h/2, x, y + h/2);
        g.addColorStop(0, 'rgba(255,255,255,0.65)');
        g.addColorStop(0.18, color);
        g.addColorStop(1, 'rgba(0,0,0,0.38)');
        this.drawRoundedRect(x - w, y - h/2, w, h, 9, g, color, 1.4);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#061012';
        ctx.font = '900 10px Roboto Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x - w/2, y + 4);
        if (modeLabel) {
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            ctx.font = '700 6px Roboto Mono, monospace';
            ctx.fillText(modeLabel, x - w/2, y - 8);
        }
        ctx.restore();
    },

    drawSwitchDevice(x, y, w, h, title, subtitle, accent) {
        const ctx = this.ctx;
        const body = ctx.createLinearGradient(x, y, x + w, y + h);
        body.addColorStop(0, '#1e2426');
        body.addColorStop(0.5, '#0b0f10');
        body.addColorStop(1, '#242a2c');
        ctx.save();
        ctx.shadowColor = accent;
        ctx.shadowBlur = 14;
        this.drawRoundedRect(x, y, w, h, 14, body, accent, 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, x + w/2, y + 30);
        ctx.fillStyle = accent;
        ctx.font = '800 9px Roboto Mono, monospace';
        ctx.fillText(subtitle, x + w/2, y + 49);
        for (let i = 0; i < 5; i++) {
            const px = x + 16 + (i * 18);
            this.drawRoundedRect(px, y + h - 34, 12, 14, 3, '#050707', '#2c484c', 1);
            ctx.fillStyle = i % 2 ? accent : '#1a1a1a';
            ctx.beginPath(); ctx.arc(px + 6, y + h - 12, 2.4, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    },

    drawNodeDevice(x, y, w, h, label, status, accent, heat = 0, active = false, danger = false) {
        const ctx = this.ctx;
        const glow = danger ? '#ff3d00' : accent;
        const body = ctx.createLinearGradient(x, y, x + w, y + h);
        body.addColorStop(0, danger ? '#3a1712' : '#192023');
        body.addColorStop(0.55, '#0a0d0e');
        body.addColorStop(1, danger ? '#2d0805' : '#171d1f');
        ctx.save();
        ctx.shadowColor = glow;
        ctx.shadowBlur = danger ? 16 : 8;
        this.drawRoundedRect(x, y, w, h, 10, body, glow, danger ? 2.7 : 1.8);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#e9f7f8';
        ctx.font = '900 11px Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 11, y + 21);
        ctx.fillStyle = danger ? '#ffd0ca' : '#a9c8cc';
        ctx.font = '800 9px Roboto, sans-serif';
        ctx.fillText(status, x + 11, y + 39);

        for (let k = 0; k < 4; k++) {
            this.drawRoundedRect(x + 10 + k*16, y + h - 13, 12, 6, 2, '#020303', '#26393c', 0.8);
        }
        ctx.fillStyle = active ? accent : '#152024';
        if (danger && Math.random() < 0.7) ctx.fillStyle = '#ff3d00';
        ctx.beginPath(); ctx.arc(x + w - 14, y + h/2, 4.2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    },

    // --- HTMLテンプレート ---
    getHTML() {
        return `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; gap: 10px;">
                <div class="broadcast-control-panel" style="display: flex; justify-content: center; align-items: center; gap: 15px; background: #161616; padding: 8px 20px; border-radius: 30px; border: 1px solid #444444; width: fit-content; margin: 0 auto; z-index: 10;">
                    <span style="font-size: 12px; font-weight: bold; color: #aaa;">SPEED CONTROL :</span>
                    <div id="broadcast-speedSwitch" style="position: relative; width: 180px; height: 32px; background: #000; border-radius: 16px; border: 2px solid #444; display: flex; justify-content: space-between; align-items: center; padding: 0 10px; cursor: pointer;">
                        <div id="broadcast-switchKnob" style="position: absolute; top: 2px; left: 2px; width: 54px; height: 24px; background: #d32f2f; border-radius: 12px; z-index: 1; transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
                        <span id="broadcast-btn-stop" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">Stop</span>
                        <span id="broadcast-btn-slow" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">スロー</span>
                        <span id="broadcast-btn-real" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">実速度</span>
                    </div>
                </div>

                <div class="canvas-wrapper" style="background: #030607; border: 3px solid #1f5f66; border-radius: 12px; position: relative; width: 100%; flex-grow: 1; box-shadow: inset 0 0 34px rgba(0,0,0,0.95), 0 0 18px rgba(0,229,255,0.10); overflow: hidden;">
                    <canvas id="net-broadcast-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;"></canvas>
                </div>
            </div>
            <style>
                .broadcast-switch-text-active { color: #fff !important; }
            </style>
        `;
    },

    init() {
        this.canvas = document.getElementById('net-broadcast-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.streamScrollX = 0;
        this.inputPackets = [];
        this.outputPackets = [];
        this.rejectedPackets = [];
        this.passedPackets = [];
        this.nodeHeat = [0.0, 0.0, 0.0, 0.0, 0.0];

        // スイッチイベント制御
        const speedSwitch = document.getElementById('broadcast-speedSwitch');
        const knob = document.getElementById('broadcast-switchKnob');
        const texts = [document.getElementById('broadcast-btn-stop'), document.getElementById('broadcast-btn-slow'), document.getElementById('broadcast-btn-real')];

        const updateSwitchUI = (mode) => {
            this.currentMode = mode;
            knob.style.transform = `translateX(${this.knobStates[mode]}px)`;
            texts.forEach((txt, idx) => {
                if (idx === mode) txt.classList.add('broadcast-switch-text-active');
                else txt.classList.remove('broadcast-switch-text-active');
            });
        };

        speedSwitch.addEventListener('click', (e) => {
            const rect = speedSwitch.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < 60) updateSwitchUI(0);
            else if (clickX < 120) updateSwitchUI(1);
            else updateSwitchUI(2);
        });
        updateSwitchUI(this.currentMode);

        this.resizeCanvas();

        this.lastTime = performance.now();
        const loop = (timestamp) => {
            this.animateLoop(timestamp);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    },

    destroy() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    },

    resizeCanvas() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = Math.floor(rect.width * dpr);
        this.canvas.height = Math.floor(rect.height * dpr);
        this.ctx.restore();
        this.ctx.save();
        const scale = rect.width / this.V_WIDTH;
        this.ctx.scale(scale * dpr, scale * dpr);
    },

    animateLoop(currentTime) {
        let deltaTime = ((currentTime - this.lastTime) / 1000) * this.speedFactors[this.currentMode];
        this.lastTime = currentTime;

        const centerX = this.V_WIDTH / 2;
        const hubW = 120;
        const hubH = 340;
        const hubX = centerX - hubW / 2;
        const hubY = this.V_HEIGHT / 2 - hubH / 2;

        const nodeX = 140;
        const nodeW = 120;
        const nodeH = 50;
        const nodeYPositions = [90, 162, 234, 306, 378];
        const lanTrackY = this.V_HEIGHT / 2;

        if (this.currentMode === 0) {
            this.inputPackets = [];
            this.outputPackets = [];
            this.rejectedPackets = [];
            this.passedPackets = [];
            this.nodeHeat = [0.0, 0.0, 0.0, 0.0, 0.0];

            if (this.outputPackets.length === 0) {
                for (let n = 0; n < 5; n++) {
                    const targetPortY = nodeYPositions[n] + nodeH / 2;
                    for (let u = 0; u < 5; u++) {
                        this.outputPackets.push({
                            x: nodeX + nodeW + 25 + (u * (this.pW + 12)),
                            y: targetPortY,
                            targetNode: n,
                            uni: u
                        });
                    }
                }
            }
        } else {
            for (let i = 0; i < 5; i++) {
                if (this.nodeHeat[i] > 0) this.nodeHeat[i] -= deltaTime * 0.08;
            }

            this.streamScrollX += this.INPUT_SPEED * deltaTime;

            if (this.streamScrollX >= this.BUNDLE_GAP) {
                this.streamScrollX = 0;
                for (let u = 0; u < 5; u++) {
                    this.inputPackets.push({ x: this.V_WIDTH + (u * this.pW), uni: u });
                }
            }

            this.inputPackets.forEach(p => { p.x -= this.INPUT_SPEED * deltaTime; });

            this.inputPackets.forEach((p, index) => {
                if (p.x <= hubX + hubW) {
                    for (let n = 0; n < 5; n++) {
                        this.outputPackets.push({
                            x: hubX,
                            y: nodeYPositions[n] + nodeH / 2,
                            targetNode: n,
                            uni: p.uni
                        });
                    }
                    this.inputPackets.splice(index, 1);
                }
            });

            this.outputPackets.forEach(p => { p.x -= this.HUB_OUT_SPEED * deltaTime; });

            this.outputPackets.forEach((p, index) => {
                if (p.x <= nodeX + nodeW) {
                    if (p.uni === p.targetNode) {
                        this.passedPackets.push({ x: nodeX + nodeW - 5, y: p.y, uni: p.uni });
                    } else {
                        const angle = (Math.random() - 0.5) * 1.5 - 0.5; 
                        this.rejectedPackets.push({
                            x: nodeX + nodeW,
                            y: p.y,
                            vx: (Math.random() * 300 + 200),
                            vy: Math.sin(angle) * (Math.random() * 400 + 200),
                            uni: p.uni,
                            alpha: 1.0
                        });
                        if (this.nodeHeat[p.targetNode] < 1.0) {
                            this.nodeHeat[p.targetNode] += 0.16;
                        }
                    }
                    this.outputPackets.splice(index, 1);
                }
            });

            this.passedPackets.forEach((p, index) => {
                p.x -= this.HUB_OUT_SPEED * deltaTime;
                if (p.x < nodeX - 80) this.passedPackets.splice(index, 1);
            });

            this.rejectedPackets.forEach((p, index) => {
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;
                p.alpha -= deltaTime * 2.2;
                if (p.alpha <= 0) this.rejectedPackets.splice(index, 1);
            });
        }

        this.drawTechBackground('#ff6f00');

        this.ctx.strokeStyle = "#221105"; this.ctx.lineWidth = 12;
        this.ctx.beginPath(); this.ctx.moveTo(hubX + hubW, lanTrackY); this.ctx.lineTo(this.V_WIDTH, lanTrackY); this.ctx.stroke();
        this.ctx.strokeStyle = "#ff6f00"; this.ctx.lineWidth = 2;
        this.ctx.beginPath(); this.ctx.moveTo(hubX + hubW, lanTrackY); this.ctx.lineTo(this.V_WIDTH, lanTrackY); this.ctx.stroke();

        this.drawSwitchDevice(hubX, hubY, hubW, hubH, "NETWORK HUB", "Broadcast 配信", "#ff6f00");

        for (let i = 0; i < 5; i++) {
            const pY = nodeYPositions[i] + nodeH / 2;
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(hubX, pY - 8, 12, 16);
            this.ctx.strokeStyle = "#555555"; this.ctx.lineWidth = 1;
            this.ctx.strokeRect(hubX, pY - 8, 12, 16);

            this.ctx.strokeStyle = "#252525"; this.ctx.lineWidth = 8;
            this.ctx.beginPath(); this.ctx.moveTo(nodeX + nodeW, pY); this.ctx.lineTo(hubX + 2, pY); this.ctx.stroke(); // 修正：this.ctx.stroke() にリペア
            this.ctx.strokeStyle = "#444444"; this.ctx.lineWidth = 1.2;
            this.ctx.beginPath(); this.ctx.moveTo(nodeX + nodeW, pY); this.ctx.lineTo(hubX + 2, pY); this.ctx.stroke();
        }
        this.ctx.fillStyle = "#000000"; this.ctx.fillRect(hubX + hubW - 12, lanTrackY - 10, 12, 20);
        this.ctx.strokeStyle = "#ff6f00"; this.ctx.strokeRect(hubX + hubW - 12, lanTrackY - 10, 12, 20);

        for (let i = 0; i < 5; i++) {
            const nY = nodeYPositions[i];
            let r = Math.floor(34 + (221 * this.nodeHeat[i]));
            let g = Math.floor(34 + (136 * (this.nodeHeat[i] < 0.5 ? this.nodeHeat[i] * 2 : (1.0 - this.nodeHeat[i]) * 2)));
            let b = Math.floor(34 * (1.0 - this.nodeHeat[i]));
            if (g < 0) g = 0; if (b < 0) b = 0;

            let status = "STANDBY / RECEIVE";
            let danger = this.nodeHeat[i] > 0.7;
            let active = this.currentMode !== 0 && (Math.random() < 0.5 || this.nodeHeat[i] > 0.6);
            if (this.nodeHeat[i] > 0.7) status = "OVERLOAD / FILTERING";
            else if (this.nodeHeat[i] > 0.3) status = "FILTERING UNUSED DATA";
            this.drawNodeDevice(nodeX, nY, nodeW, nodeH, `PORT ${i+1} / U${i}`, status, this.lineColors[i], this.nodeHeat[i], active, danger);
        }

        this.inputPackets.forEach(p => {
            if (p.x > hubX + hubW) {
                this.drawPacket(p.x, lanTrackY, this.pW - 2, this.pH, this.lineColors[p.uni], `U${p.uni}`, "UDP");
            }
        });

        this.outputPackets.forEach(p => {
            if (p.x > nodeX + nodeW) {
                this.drawPacket(p.x, p.y, this.pW, this.pH, this.lineColors[p.uni], `U${p.uni}`, "BCAST");

                if (this.currentMode === 0) {
                    this.ctx.fillStyle = "#000000"; this.ctx.font = "bold 10px monospace"; this.ctx.textAlign = "center";
                    this.ctx.fillText(`U${p.uni}`, p.x - this.pW/2, p.y + 4);

                    const lx = p.x - this.pW - 5; const ly = p.y - this.pH/2 - 24;
                    this.ctx.fillStyle = "#ffffff"; this.ctx.fillRect(lx, ly, this.pW + 10, 20);
                    this.ctx.strokeStyle = "#d32f2f"; this.ctx.lineWidth = 1; this.ctx.strokeRect(lx, ly, this.pW + 10, 20);

                    this.ctx.fillStyle = "#000000"; this.ctx.font = "800 6.5px sans-serif"; this.ctx.textAlign = "center";
                    this.ctx.fillText("*.255", lx + (this.pW+10)/2, ly + 8);
                    this.ctx.fillStyle = "#1976d2"; this.ctx.font = "700 6px monospace";
                    this.ctx.fillText("Art-Net", lx + (this.pW+10)/2, ly + 16);
                }
            }
        });

        this.passedPackets.forEach(p => {
            this.drawPacket(p.x, p.y, this.pW, this.pH, this.lineColors[p.uni], `U${p.uni}`, "PASS");
        });

        this.rejectedPackets.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.drawPacket(p.x + this.pW/2, p.y, this.pW * 0.7, this.pH * 0.7, this.lineColors[p.uni], `U${p.uni}`, "DROP");
            this.ctx.restore();
        });
    }
};