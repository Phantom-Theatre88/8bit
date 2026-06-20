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

                <div class="canvas-wrapper" style="background: #000000; border: 3px solid #444444; border-radius: 12px; position: relative; width: 100%; flex-grow: 1; box-shadow: inset 0 0 30px rgba(0,0,0,0.9); overflow: hidden;">
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

        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

        this.ctx.strokeStyle = "#221105"; this.ctx.lineWidth = 12;
        this.ctx.beginPath(); this.ctx.moveTo(hubX + hubW, lanTrackY); this.ctx.lineTo(this.V_WIDTH, lanTrackY); this.ctx.stroke();
        this.ctx.strokeStyle = "#ff6f00"; this.ctx.lineWidth = 2;
        this.ctx.beginPath(); this.ctx.moveTo(hubX + hubW, lanTrackY); this.ctx.lineTo(this.V_WIDTH, lanTrackY); this.ctx.stroke();

        this.ctx.fillStyle = "#2a2a2a";
        this.ctx.fillRect(hubX, hubY, hubW, hubH);
        this.ctx.strokeStyle = "#444444"; this.ctx.lineWidth = 2;
        this.ctx.strokeRect(hubX, hubY, hubW, hubH);

        this.ctx.fillStyle = "#ffffff"; this.ctx.font = "bold 13px sans-serif"; this.ctx.textAlign = "center";
        this.ctx.fillText("NETWORK HUB", hubX + hubW/2, hubY + 30);
        this.ctx.font = "9px monospace"; this.ctx.fillStyle = "#ff6f00";
        this.ctx.fillText("Broadcast Mode", hubX + hubW/2, hubY + 48);

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

            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            this.ctx.fillRect(nodeX, nY, nodeW, nodeH);
            this.ctx.strokeStyle = this.lineColors[i]; this.ctx.lineWidth = this.nodeHeat[i] > 0.7 ? 3 : 2;
            this.ctx.strokeRect(nodeX, nY, nodeW, nodeH);

            if (this.currentMode === 0) {
                this.ctx.fillStyle = "#1a1a1a";
            } else {
                this.ctx.fillStyle = (Math.random() < 0.5 || this.nodeHeat[i] > 0.6) ? "#00d2ff" : "#1a1a1a";
            }
            this.ctx.beginPath(); this.ctx.arc(nodeX + nodeW - 12, nY + nodeH / 2, 3.5, 0, Math.PI*2); this.ctx.fill();

            this.ctx.fillStyle = "#ffffff"; this.ctx.font = "bold 11px sans-serif"; this.ctx.textAlign = "left";
            this.ctx.fillText(`Port ${i+1} (U${i})`, nodeX + 10, nY + 22);

            this.ctx.font = "bold 9px sans-serif";
            if (this.nodeHeat[i] > 0.7) {
                this.ctx.fillStyle = "#ffcccc"; this.ctx.fillText("🔥 OVERLOAD", nodeX + 10, nY + 40);
            } else if (this.nodeHeat[i] > 0.3) {
                this.ctx.fillStyle = "#ffffaa"; this.ctx.fillText("⚠ ゴミ破棄中", nodeX + 10, nY + 40);
            } else {
                this.ctx.fillStyle = "#aaaaaa"; this.ctx.fillText("● 待機・受信", nodeX + 10, nY + 40);
            }
        }

        this.inputPackets.forEach(p => {
            if (p.x > hubX + hubW) {
                this.ctx.fillStyle = this.lineColors[p.uni];
                this.ctx.fillRect(p.x - this.pW, lanTrackY - this.pH/2, this.pW - 2, this.pH);
                this.ctx.fillStyle = "#000000"; this.ctx.font = "bold 10px monospace"; this.ctx.textAlign = "center";
                this.ctx.fillText(`U${p.uni}`, p.x - this.pW/2 - 1, lanTrackY + 4);
            }
        });

        this.outputPackets.forEach(p => {
            if (p.x > nodeX + nodeW) {
                this.ctx.fillStyle = this.lineColors[p.uni];
                this.ctx.fillRect(p.x - this.pW, p.y - this.pH/2, this.pW, this.pH);

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
            this.ctx.fillStyle = this.lineColors[p.uni];
            this.ctx.fillRect(p.x - this.pW, p.y - this.pH/2, this.pW, this.pH);
            this.ctx.fillStyle = "#000000"; this.ctx.font = "bold 10px monospace"; this.ctx.textAlign = "center";
            this.ctx.fillText(`U${p.uni}`, p.x - this.pW/2, p.y + 4);
        });

        this.rejectedPackets.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = this.lineColors[p.uni];
            this.ctx.fillRect(p.x - this.pW/2, p.y - this.pH/4, this.pW * 0.7, this.pH * 0.7);
            this.ctx.restore();
        });
    }
};