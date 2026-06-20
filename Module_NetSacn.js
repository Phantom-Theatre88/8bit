const Module_NetSacn = {
    // --- 内部状態管理 ---
    currentMode: 2,
    knobStates: [2, 61, 120],
    speedFactors: [0, 0.1, 1.0],
    streamScrollX: 0,
    inputPackets: [],
    outputPackets: [],
    passedPackets: [],
    hubBuffer: [],
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

    // --- HTMLテンプレート（スライドスイッチUIおよび固有スタイルを完全復元） ---
    getHTML() {
        return `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; gap: 10px;">
                <div class="sacn-control-panel" style="display: flex; justify-content: center; align-items: center; gap: 15px; background: #161616; padding: 8px 20px; border-radius: 30px; border: 1px solid #444444; width: fit-content; margin: 0 auto; z-index: 10;">
                    <span style="font-size: 12px; font-weight: bold; color: #aaa;">SPEED CONTROL :</span>
                    <div id="sacn-speedSwitch" style="position: relative; width: 180px; height: 32px; background: #000; border-radius: 16px; border: 2px solid #444; display: flex; justify-content: space-between; align-items: center; padding: 0 10px; cursor: pointer;">
                        <div id="sacn-switchKnob" style="position: absolute; top: 2px; left: 2px; width: 54px; height: 24px; background: #00e676; border-radius: 12px; z-index: 1; transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
                        <span id="sacn-btn-stop" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">Stop</span>
                        <span id="sacn-btn-slow" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">スロー</span>
                        <span id="sacn-btn-real" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">実速度</span>
                    </div>
                </div>

                <div class="canvas-wrapper" style="background: #000000; border: 3px solid #444444; border-radius: 12px; position: relative; width: 100%; flex-grow: 1; box-shadow: inset 0 0 30px rgba(0,0,0,0.9); overflow: hidden;">
                    <canvas id="net-sacn-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;"></canvas>
                </div>
            </div>
            <style>
                .sacn-switch-text-active { color: #fff !important; }
            </style>
        `;
    },

    init() {
        this.canvas = document.getElementById('net-sacn-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.streamScrollX = 0;
        this.inputPackets = [];
        this.outputPackets = [];
        this.passedPackets = [];
        this.hubBuffer = [];

        // 復元：スイッチイベント制御
        const speedSwitch = document.getElementById('sacn-speedSwitch');
        const knob = document.getElementById('sacn-switchKnob');
        const texts = [document.getElementById('sacn-btn-stop'), document.getElementById('sacn-btn-slow'), document.getElementById('sacn-btn-real')];

        const updateSwitchUI = (mode) => {
            this.currentMode = mode;
            knob.style.transform = `translateX(${this.knobStates[mode]}px)`;
            texts.forEach((txt, idx) => {
                if (idx === mode) txt.classList.add('sacn-switch-text-active');
                else txt.classList.remove('sacn-switch-text-active');
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
            this.passedPackets = [];
            this.hubBuffer = [];

            if (this.outputPackets.length === 0) {
                for (let n = 0; n < 5; n++) {
                    const targetPortY = nodeYPositions[n] + nodeH / 2;
                    this.outputPackets.push({
                        x: nodeX + nodeW + 150,
                        y: targetPortY,
                        targetNode: n,
                        uni: n
                    });
                }
            }
        } else {
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
                    this.hubBuffer.push(p.uni);
                    this.inputPackets.splice(index, 1);
                }
            });

            if (this.hubBuffer.length >= 5) {
                this.hubBuffer.forEach(uniNum => {
                    this.outputPackets.push({
                        x: hubX,
                        y: nodeYPositions[uniNum] + nodeH / 2,
                        targetNode: uniNum,
                        uni: uniNum
                    });
                });
                this.hubBuffer = [];
            }

            this.outputPackets.forEach(p => { p.x -= this.HUB_OUT_SPEED * deltaTime; });

            this.outputPackets.forEach((p, index) => {
                if (p.x <= nodeX + nodeW) {
                    this.passedPackets.push({ x: nodeX + nodeW - 5, y: p.y, uni: p.uni });
                    this.outputPackets.splice(index, 1);
                }
            });

            this.passedPackets.forEach((p, index) => {
                p.x -= this.HUB_OUT_SPEED * deltaTime;
                if (p.x < nodeX - 80) this.passedPackets.splice(index, 1);
            });
        }

        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

        this.ctx.font = "12px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "rgba(0, 230, 118, 0.4)";
        this.ctx.fillText("【右】入力：卓からの1本のLAN道路 (5系統がカプセル化されている状態)", this.V_WIDTH - 250, 25);
        this.ctx.fillStyle = "rgba(0, 230, 118, 0.6)";
        this.ctx.fillText("【左】静寂：sACNマルチキャストによるインテリジェント仕分け (各Nodeには最初から正解の箱しか届かない)", 400, 25);

        this.ctx.strokeStyle = "#221105"; this.ctx.lineWidth = 12;
        this.ctx.beginPath(); this.ctx.moveTo(hubX + hubW, lanTrackY); this.ctx.lineTo(this.V_WIDTH, lanTrackY); this.ctx.stroke();
        this.ctx.strokeStyle = "#00e676"; this.ctx.lineWidth = 2; 
        this.ctx.beginPath(); this.ctx.moveTo(hubX + hubW, lanTrackY); this.ctx.lineTo(this.V_WIDTH, lanTrackY); this.ctx.stroke();

        for (let i = 0; i < 5; i++) {
            const pY = nodeYPositions[i] + nodeH / 2;
            this.ctx.strokeStyle = "#252525"; this.ctx.lineWidth = 8;
            this.ctx.beginPath(); this.ctx.moveTo(nodeX + nodeW, pY); this.ctx.lineTo(hubX + 2, pY); this.ctx.stroke();
            this.ctx.strokeStyle = "#444444"; this.ctx.lineWidth = 1.2;
            this.ctx.beginPath(); this.ctx.moveTo(nodeX + nodeW, pY); this.ctx.lineTo(hubX + 2, pY); this.ctx.stroke();
        }

        for (let i = 0; i < 5; i++) {
            const pY = nodeYPositions[i] + nodeH / 2;
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(hubX - 2, pY - 8, 14, 16);
            this.ctx.strokeStyle = "#555555"; this.ctx.lineWidth = 1;
            this.ctx.strokeRect(hubX - 2, pY - 8, 14, 16);
        }
        this.ctx.fillStyle = "#000000"; this.ctx.fillRect(hubX + hubW - 12, lanTrackY - 10, 14, 20);
        this.ctx.strokeStyle = "#00e676"; this.ctx.strokeRect(hubX + hubW - 12, lanTrackY - 10, 14, 20);

        this.ctx.fillStyle = "#2a2a2a";
        this.ctx.fillRect(hubX, hubY, hubW, hubH);
        this.ctx.strokeStyle = "#444444"; this.ctx.lineWidth = 2;
        this.ctx.strokeRect(hubX, hubY, hubW, hubH);

        this.ctx.fillStyle = "#ffffff"; this.ctx.font = "bold 12px sans-serif"; this.ctx.shadowColor = "transparent"; this.ctx.textAlign = "center";
        this.ctx.fillText("SMART SWITCH", hubX + hubW/2 + 3, hubY + 30);
        this.ctx.font = "9px monospace"; this.ctx.fillStyle = "#00e676";
        this.ctx.fillText("sACN Multicast", hubX + hubW/2 + 3, hubY + 48);

        for (let i = 0; i < 5; i++) {
            const nY = nodeYPositions[i];
            
            this.ctx.fillStyle = "#222222"; 
            this.ctx.fillRect(nodeX, nY, nodeW, nodeH);
            this.ctx.strokeStyle = this.lineColors[i]; this.ctx.lineWidth = 2;
            this.ctx.strokeRect(nodeX, nY, nodeW, nodeH);

            if (this.currentMode === 0) {
                this.ctx.fillStyle = "#1a1a1a"; 
            } else {
                let active = false;
                this.outputPackets.forEach(p => { if(p.targetNode === i && p.x < nodeX + nodeW + 30) active = true; });
                this.passedPackets.forEach(p => { if(p.y === nY + nodeH/2) active = true; });
                this.ctx.fillStyle = active ? "#00e676" : "#1a1a1a";
            }
            this.ctx.beginPath(); this.ctx.arc(nodeX + nodeW - 12, nY + nodeH / 2, 3.5, 0, Math.PI*2); this.ctx.fill();

            this.ctx.fillStyle = "#ffffff"; this.ctx.font = "bold 11px sans-serif"; this.ctx.textAlign = "left";
            this.ctx.fillText(`Port ${i+1} (U${i})`, nodeX + 10, nY + 22);

            this.ctx.font = "bold 9px sans-serif";
            this.ctx.fillStyle = "#00e676"; 
            this.ctx.fillText("● 正常・快適", nodeX + 10, nY + 40);
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

                    const lx = p.x - this.pW - 10; const ly = p.y - this.pH/2 - 24;
                    this.ctx.fillStyle = "#ffffff"; this.ctx.fillRect(lx, ly, this.pW + 20, 20);
                    this.ctx.strokeStyle = "#00e676"; this.ctx.lineWidth = 1; this.ctx.strokeRect(lx, ly, this.pW + 20, 20);

                    this.ctx.fillStyle = "#000000"; this.ctx.font = "800 7px sans-serif"; this.ctx.textAlign = "center";
                    this.ctx.fillText(`239.255.0.${p.uni}`, lx + (this.pW+20)/2, ly + 8);
                    this.ctx.fillStyle = "#00e676"; this.ctx.font = "700 6px monospace";
                    this.ctx.fillText("sACN / MC", lx + (this.pW+20)/2, ly + 16);
                }
            }
        });

        this.passedPackets.forEach(p => {
            this.ctx.fillStyle = this.lineColors[p.uni];
            this.ctx.fillRect(p.x - this.pW, p.y - this.pH/2, this.pW, this.pH);
            this.ctx.fillStyle = "#000000"; this.ctx.font = "bold 10px monospace"; this.ctx.textAlign = "center";
            this.ctx.fillText(`U${p.uni}`, p.x - this.pW/2, p.y + 4);
        });
    }
};