const Module_NetArtNet = {
    // --- 内部状態管理 ---
    currentMode: 2,
    knobStates: [2, 61, 120],
    speedFactors: [0, 0.1, 1.0],
    trainScrollX: 0,
    packets: [],
    lastTime: 0,
    animationFrameId: null,
    canvas: null,
    ctx: null,

    // --- 定数定義 ---
    chColors: ['#ffca28', '#00e5ff', '#00e676', '#ff4081', '#ff6d00', '#b388ff', '#aeea00', '#00b0ff', '#f50057', '#ffffff'],
    lineColors: ['#00e5ff', '#ff4081', '#00e676', '#ffca28', '#b388ff'],
    dataLabels: ['75%', '00%', 'FL', '30%', '85%', '50%', '99%', '20%', '10%', 'FL'],
    universeData: [],

    ENGINE_W: 55,
    CAR_W: 38,
    CAR_M: 3,
    TOTAL_CAR_W: 41,
    NUM_CARS: 10,
    TRAIN_W: 465,
    DMX_SPEED: 650,
    TRAIN_GAP: 260,
    TRAIN_PERIOD: 725,
    LAN_SPEED: 2400,
    V_WIDTH: 1200,
    V_HEIGHT: 520,

    // --- HTMLテンプレート（スライドスイッチUIおよび固有CSSスタイルを完全復元） ---
    getHTML() {
        return `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; gap: 10px;">
                <div class="artnet-control-panel" style="display: flex; justify-content: center; align-items: center; gap: 15px; background: #161616; padding: 8px 20px; border-radius: 30px; border: 1px solid #444444; width: fit-content; margin: 0 auto; z-index: 10;">
                    <span style="font-size: 12px; font-weight: bold; color: #aaa;">SPEED CONTROL :</span>
                    <div id="artnet-speedSwitch" style="position: relative; width: 180px; height: 32px; background: #000; border-radius: 16px; border: 2px solid #444; display: flex; justify-content: space-between; align-items: center; padding: 0 10px; cursor: pointer;">
                        <div id="artnet-switchKnob" style="position: absolute; top: 2px; left: 2px; width: 54px; height: 24px; background: #ff6f00; border-radius: 12px; z-index: 1; transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
                        <span id="artnet-btn-stop" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">Stop</span>
                        <span id="artnet-btn-slow" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">スロー</span>
                        <span id="artnet-btn-real" style="font-size: 11px; font-weight: 700; color: #666; width: 50px; text-align: center; z-index: 2; transition: color 0.2s ease;">実速度</span>
                    </div>
                </div>

                <div class="canvas-wrapper" style="background: #000000; border: 3px solid #444444; border-radius: 12px; position: relative; width: 100%; flex-grow: 1; box-shadow: inset 0 0 30px rgba(0,0,0,0.9); overflow: hidden;">
                    <canvas id="net-artnet-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block;"></canvas>
                </div>
            </div>
            <style>
                .artnet-switch-text-active { color: #fff !important; }
            </style>
        `;
    },

    // --- 初期化ライフサイクル ---
    init() {
        this.universeData = [];
        for (let u = 0; u < 5; u++) {
            let cars = [];
            for (let c = 0; c < 10; c++) {
                cars.push({
                    text: this.dataLabels[(u + c) % this.dataLabels.length],
                    color: this.chColors[c % this.chColors.length]
                });
            }
            this.universeData.push(cars);
        }

        this.canvas = document.getElementById('net-artnet-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.trainScrollX = 0;
        this.packets = [];

        // 復元：スイッチイベント制御
        const speedSwitch = document.getElementById('artnet-speedSwitch');
        const knob = document.getElementById('artnet-switchKnob');
        const texts = [document.getElementById('artnet-btn-stop'), document.getElementById('artnet-btn-slow'), document.getElementById('artnet-btn-real')];

        const updateSwitchUI = (mode) => {
            this.currentMode = mode;
            knob.style.transform = `translateX(${this.knobStates[mode]}px)`;
            texts.forEach((txt, idx) => {
                if (idx === mode) txt.classList.add('artnet-switch-text-active');
                else txt.classList.remove('artnet-switch-text-active');
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
        const nodeW = 130;
        const nodeH = 400;
        const nodeX = centerX - nodeW / 2;
        const nodeY = this.V_HEIGHT / 2 - nodeH / 2;
        const dmxInLimitX = nodeX + nodeW - 4;
        const lanTrackY = this.V_HEIGHT / 2 + 25;

        let dmxLedActive = [false, false, false, false, false];
        let lanLedActive = false;

        if (this.currentMode === 0) {
            this.trainScrollX = Math.floor(this.trainScrollX / this.TRAIN_PERIOD) * this.TRAIN_PERIOD + this.TRAIN_W;
            if (this.packets.length === 0) {
                for (let u = 0; u < 5; u++) {
                    this.packets.push({ x: nodeX, uni: u, delay: 0, data: this.universeData[u] });
                }
            }
            this.packets.forEach(p => { p.delay = 0; });
            dmxLedActive = [true, true, true, true, true];
            lanLedActive = true;
        } else {
            const prevScrollX = this.trainScrollX;
            this.trainScrollX += this.DMX_SPEED * deltaTime;

            const prevCycle = Math.floor(prevScrollX / this.TRAIN_PERIOD);
            const currCycle = Math.floor(this.trainScrollX / this.TRAIN_PERIOD);
            
            if (currCycle > prevCycle) {
                this.packets = []; 
                for (let u = 0; u < 5; u++) {
                    this.packets.push({
                        x: nodeX,
                        uni: u,
                        delay: u * 0.025, 
                        data: this.universeData[u]
                    });
                }
            }

            this.packets.forEach(p => {
                if (p.delay > 0) {
                    p.delay -= deltaTime;
                } else {
                    p.x -= this.LAN_SPEED * deltaTime;
                }
            });

            const currentBaseOffset = this.trainScrollX % this.TRAIN_PERIOD;
            for (let t = -1; t < 2; t++) {
                const trainHeadX = dmxInLimitX - currentBaseOffset + (t * this.TRAIN_PERIOD) + this.TRAIN_GAP;
                const trainTailX = trainHeadX + this.TRAIN_W;

                if (trainHeadX <= dmxInLimitX && trainTailX >= dmxInLimitX) {
                    dmxLedActive = [true, true, true, true, true];
                    lanLedActive = true;
                }
            }

            this.packets.forEach(p => {
                if (p.delay <= 0 && p.x < nodeX && p.x > nodeX - 30) {
                    lanLedActive = true;
                }
            });

            this.packets = this.packets.filter(p => p.x > -220);
        }

        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

        this.ctx.strokeStyle = "#111111"; this.ctx.lineWidth = 1;
        this.ctx.beginPath(); this.ctx.moveTo(centerX, 0); this.ctx.lineTo(centerX, this.V_HEIGHT); this.ctx.stroke();

        this.ctx.font = "12px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "rgba(0, 229, 255, 0.4)";
        this.ctx.fillText("【右】DMX世界 (太いDMXケーブルを42Hzのリアル速度で直進する信号列車流)", centerX + (this.V_WIDTH - centerX) / 2 + 30, 25);
        this.ctx.fillStyle = "rgba(255, 111, 0, 0.6)";
        this.ctx.fillText("【左】NETWORK世界 (たった1本のLANケーブル道路へ梱包・超高速射出)", centerX / 2 - 40, 25);

        const currentBaseOffset = this.trainScrollX % this.TRAIN_PERIOD;

        for (let u = 0; u < 5; u++) {
            const trackY = nodeY + 65 + (u * 74);

            this.ctx.strokeStyle = "#252525"; this.ctx.lineWidth = 10; 
            this.ctx.beginPath(); this.ctx.moveTo(dmxInLimitX, trackY); this.ctx.lineTo(this.V_WIDTH, trackY); this.ctx.stroke();
            this.ctx.strokeStyle = this.lineColors[u] + "55"; this.ctx.lineWidth = 2; 
            this.ctx.beginPath(); this.ctx.moveTo(dmxInLimitX, trackY); this.ctx.lineTo(this.V_WIDTH, trackY); this.ctx.stroke();

            this.ctx.fillStyle = "#555555"; this.ctx.font = "bold 9px monospace"; this.ctx.textAlign = "right";
            this.ctx.fillText(`DMX CABLE LINE ${u+1} (Universe ${u}) ──`, this.V_WIDTH - 15, trackY - 22);

            if (this.currentMode > 0) {
                for (let t = -1; t < 2; t++) {
                    const trainHeadX = dmxInLimitX - currentBaseOffset + (t * this.TRAIN_PERIOD) + this.TRAIN_GAP;

                    let engX = trainHeadX;
                    if (engX < this.V_WIDTH + 50 && engX + this.ENGINE_W > dmxInLimitX) {
                        let engW = this.ENGINE_W;
                        if (engX < dmxInLimitX) { engW = (engX + this.ENGINE_W) - dmxInLimitX; engX = dmxInLimitX; }

                        if (engW > 0) {
                            this.ctx.fillStyle = "#111111"; this.ctx.fillRect(engX, trackY - 32, engW, 32);
                            this.ctx.strokeStyle = this.lineColors[u]; this.ctx.lineWidth = 2.5;
                            this.ctx.strokeRect(engX, trackY - 32, engW, 32);

                            if (engW === this.ENGINE_W) {
                                this.ctx.fillStyle = "#ffffff"; this.ctx.font = "bold 11px sans-serif"; this.ctx.textAlign = "center";
                                this.ctx.fillText("DMX", engX + this.ENGINE_W / 2 - 3, trackY - 18);
                                this.ctx.fillStyle = this.lineColors[u]; this.ctx.font = "9px monospace";
                                this.ctx.fillText(`U${u}`, engX + this.ENGINE_W / 2 - 3, trackY - 6);
                            }
                        }
                    }

                    for (let i = 0; i < this.NUM_CARS; i++) {
                        let carX = trainHeadX + this.ENGINE_W + 4 + (i * this.TOTAL_CAR_W);
                        const carData = this.universeData[u][i];

                        if (carX + this.CAR_W > dmxInLimitX && carX < this.V_WIDTH + 50) {
                            let currentCarW = this.CAR_W;
                            if (carX < dmxInLimitX) { currentCarW = (carX + this.CAR_W) - dmxInLimitX; carX = dmxInLimitX; }

                            if (currentCarW > 0) {
                                this.ctx.fillStyle = "#111111"; this.ctx.fillRect(carX, trackY - 26, currentCarW, 26);
                                this.ctx.strokeStyle = carData.color; this.ctx.lineWidth = 1.8;
                                this.ctx.strokeRect(carX, trackY - 26, currentCarW, 26);

                                if (currentCarW === this.CAR_W) {
                                    this.ctx.fillStyle = "#ffffff"; this.ctx.font = "bold 10px sans-serif"; this.ctx.textAlign = "center";
                                    this.ctx.fillText(carData.text, carX + this.CAR_W / 2, trackY - 14);
                                    this.ctx.fillStyle = "#666666"; this.ctx.font = "7px monospace";
                                    this.ctx.fillText(`ch${i+1}`, carX + this.CAR_W / 2, trackY - 4);
                                }
                            }
                        }
                    }
                }
            }
        }

        this.ctx.fillStyle = "#222222";
        this.ctx.fillRect(nodeX, nodeY, nodeW, nodeH);
        this.ctx.strokeStyle = "#333333"; this.ctx.lineWidth = 1; this.ctx.strokeRect(nodeX, nodeY, nodeW, nodeH);

        for (let u = 0; u < 5; u++) {
            const ledY = nodeY + 65 + (u * 74);
            this.ctx.fillStyle = dmxLedActive[u] ? "#00d2ff" : "#1a1a1a"; 
            this.ctx.beginPath(); this.ctx.arc(nodeX + nodeW - 12, ledY, 3.5, 0, Math.PI*2); this.ctx.fill();
            this.ctx.strokeStyle = "#333"; this.ctx.lineWidth = 1; this.ctx.strokeRect(nodeX + nodeW - 18, ledY - 8, 18, 16);
        }

        this.ctx.fillStyle = "#00d2ff";
        this.ctx.beginPath(); this.ctx.arc(nodeX + 16, nodeY + nodeH - 14, 3.5, 0, Math.PI*2); this.ctx.fill();

        this.ctx.fillStyle = "#ffffff"; this.ctx.font = "700 12px sans-serif"; this.ctx.textAlign = "center";
        this.ctx.fillText("Art-Net NODE", centerX, nodeY + 22);
        this.ctx.font = "10px monospace"; this.ctx.fillStyle = "#555";
        this.ctx.fillText("5系統 DMX IN ◀", centerX + 10, nodeY + nodeH - 24);
        this.ctx.fillText("◀ 1本 LAN OUT", centerX - 10, nodeY + nodeH - 10);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, 0, nodeX, this.V_HEIGHT); 
        this.ctx.clip();

        this.ctx.strokeStyle = "#221105"; this.ctx.lineWidth = 12; 
        this.ctx.beginPath(); this.ctx.moveTo(0, lanTrackY); this.ctx.lineTo(nodeX, lanTrackY); this.ctx.stroke();
        this.ctx.strokeStyle = "#ff6f00"; this.ctx.lineWidth = 2; 
        this.ctx.beginPath(); this.ctx.moveTo(0, lanTrackY); this.ctx.lineTo(nodeX, lanTrackY); this.ctx.stroke();

        this.ctx.fillStyle = "#111"; this.ctx.fillRect(nodeX - 12, lanTrackY - 12, 12, 24);
        this.ctx.strokeStyle = "#ff6f00"; this.ctx.strokeRect(nodeX - 12, lanTrackY - 12, 12, 24);

        const pW = 190;  
        const pH = 74; 

        this.packets.forEach(p => {
            if (p.delay <= 0) {
                let pX, pY;

                if (this.currentMode === 0) {
                    pX = nodeX - pW - 20; 
                    pY = nodeY + 25 + (p.uni * 74); 
                } else {
                    pX = p.x - pW - (p.uni * 12); 
                    pY = lanTrackY - pH + 15 - (p.uni * 14); 
                }

                if (pX < nodeX) {
                    const lidH = 10; 
                    this.ctx.fillStyle = "var(--packet-dark)";
                    this.ctx.beginPath();
                    this.ctx.moveTo(pX, pY + lidH); this.ctx.lineTo(pX + 10, pY); this.ctx.lineTo(pX + pW, pY);
                    this.ctx.lineTo(pX + pW, pY + pH - lidH); this.ctx.lineTo(pX, pY + pH);
                    this.ctx.closePath(); this.ctx.fill();

                    this.ctx.fillStyle = "var(--packet-bg)";
                    this.ctx.fillRect(pX, pY + lidH, pW - 8, pH - lidH);
                    this.ctx.strokeStyle = "#8a5a36"; this.ctx.lineWidth = 1.5;
                    this.ctx.strokeRect(pX, pY + lidH, pW - 8, pH - lidH);

                    this.ctx.fillStyle = "var(--packet-tape)";
                    this.ctx.fillRect(pX + (pW - 8)/2 - 8, pY + lidH, 16, pH - lidH);

                    const labelX = pX + 6; const labelY = pY + lidH + 4;
                    const labelW = pW - 20; const labelH = pH - lidH - 8;

                    this.ctx.fillStyle = "#ffffff"; this.ctx.fillRect(labelX, labelY, labelW, labelH);
                    this.ctx.strokeStyle = "#444444"; this.ctx.lineWidth = 1; this.ctx.strokeRect(labelX, labelY, labelW, labelH);

                    this.ctx.fillStyle = "#222222"; this.ctx.fillRect(labelX, labelY, labelW, 11);
                    this.ctx.fillStyle = "#ffffff"; this.ctx.font = "bold 8px sans-serif"; this.ctx.textAlign = "center";
                    this.ctx.fillText("ETHERNET / Art-Net PACKET", labelX + labelW/2, labelY + 8);

                    this.ctx.textAlign = "left"; this.ctx.font = "bold 8.5px monospace";
                    this.ctx.fillStyle = "#d32f2f"; this.ctx.fillText(`DST: 192.168.0.50 (Broadcast)`, labelX + 4, labelY + 21);
                    this.ctx.fillStyle = "#1976d2"; this.ctx.fillText(`PROT: UDP / Art-Net`, labelX + 4, labelY + 31);
                    
                    this.ctx.fillStyle = this.lineColors[p.uni];
                    this.ctx.fillRect(labelX + 4, labelY + 34, labelW - 8, 11);
                    this.ctx.fillStyle = "#000000"; this.ctx.font = "700 8.5px sans-serif";
                    this.ctx.fillText(`UNI : Universe ${p.uni} (Line ${p.uni+1})`, labelX + 8, labelY + 43);

                    if (this.currentMode > 0) {
                        this.ctx.strokeStyle = "rgba(255, 111, 0, 0.4)"; this.ctx.lineWidth = 1.5;
                        this.ctx.beginPath(); this.ctx.moveTo(p.x + 5, lanTrackY - 10); this.ctx.lineTo(p.x + 35, lanTrackY - 10); this.ctx.stroke();
                    }
                }
            }
        });
        this.ctx.restore(); 
    }
};