const Module_NetExplain = {
    currentMode: 2, 
    speedFactors: [0, 0.1, 1.0],
    lastTime: 0,
    animationFrameId: null,
    canvas: null,
    ctx: null,

    consoleImage: null,
    isImageLoaded: false,

    packets: [],
    spawnTimer: 0,
    SPAWN_INTERVAL: 1.0, 

    // 断線ステート
    starCuts: [false, false, false, false, false],
    ringMainCut: false, 
    ringPrimaryCuts: [false, false, false],   
    ringSecondaryCuts: [false, false, false], 

    V_WIDTH: 1200,
    V_HEIGHT: 530,
    clickTriggers: [],

    getHTML() {
        return `
            <div class="canvas-wrapper" style="background: #000000; border: 3px solid #444444; border-radius: 12px; position: relative; width: 100%; height: 100%; box-shadow: inset 0 0 30px rgba(0,0,0,0.9); overflow: hidden;">
                <canvas id="net-explain-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; cursor: pointer;"></canvas>
            </div>
        `;
    },

    init() {
        this.canvas = document.getElementById('net-explain-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.packets = [];
        this.spawnTimer = 0;
        this.starCuts = [false, false, false, false, false];
        this.ringMainCut = false;
        this.ringPrimaryCuts = [false, false, false];
        this.ringSecondaryCuts = [false, false, false];

        this.consoleImage = new Image();
        this.consoleImage.src = 'assets/GrandMa2.png';
        this.consoleImage.onload = () => this.isImageLoaded = true;
        this.consoleImage.onerror = () => this.isImageLoaded = false;

        this.resizeCanvas();
        this.bindClickEvents();

        this.lastTime = performance.now();
        const loop = (timestamp) => {
            this.animateLoop(timestamp);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    },

    destroy() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this._clickHandler) {
            this.canvas.removeEventListener('click', this._clickHandler);
            this.canvas.removeEventListener('touchstart', this._clickHandler);
        }
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

    bindClickEvents() {
        this._clickHandler = (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const scale = rect.width / this.V_WIDTH;
            const clickX = (clientX - rect.left) / scale;
            const clickY = (clientY - rect.top) / scale;

            this.clickTriggers.forEach(t => {
                if (Math.hypot(clickX - t.x, clickY - t.y) <= 15) {
                    if (t.type === 'star') this.starCuts[t.index] = !this.starCuts[t.index];
                    else if (t.type === 'ring_main') this.ringMainCut = !this.ringMainCut;
                    else if (t.type === 'ring_p') this.ringPrimaryCuts[t.index] = !this.ringPrimaryCuts[t.index];
                    else if (t.type === 'ring_s') this.ringSecondaryCuts[t.index] = !this.ringSecondaryCuts[t.index];
                }
            });
        };
        this.canvas.addEventListener('click', this._clickHandler);
        this.canvas.addEventListener('touchstart', this._clickHandler, { passive: false });
    },

    animateLoop(currentTime) {
        let deltaTime = ((currentTime - this.lastTime) / 1000) * this.speedFactors[this.currentMode];
        this.lastTime = currentTime;
        if (this.currentMode > 0) {
            this.spawnTimer += deltaTime;
            if (this.spawnTimer >= this.SPAWN_INTERVAL) { this.spawnTimer = 0; this.spawnPackets(); }
        }
        this.updatePacketsPhysical(deltaTime);
        this.drawStageTopology();
    },

    spawnPackets() {
        this.packets.push({ stage: 'star', state: 'to_hub', x: 130, y: 265, tx: 250, ty: 265, speed: 220 });
        this.packets.push({ stage: 'ring', state: 'to_hubA', x: 620, y: 410, tx: 740, ty: 410, speed: 220 });
    },

    updatePacketsPhysical(dt) {
        this.packets.forEach((p, idx) => {
            if (p.stage === 'star') {
                if (p.state === 'to_hub') {
                    if (this.starCuts[0] && p.x > 175) { this.packets.splice(idx, 1); return; }
                    p.x += p.speed * dt;
                    if (p.x >= p.tx) {
                        const starTargets = [{ x: 100, y: 115 }, { x: 400, y: 115 }, { x: 100, y: 415 }, { x: 400, y: 415 }];
                        for (let i = 0; i < 4; i++) {
                            this.packets.push({ stage: 'star', state: 'to_node', index: i + 1, x: 250, y: 265, tx: starTargets[i].x, ty: starTargets[i].y, speed: 260 });
                        }
                        this.packets.splice(idx, 1);
                    }
                } else if (p.state === 'to_node') {
                    let dx = p.tx - p.x; let dy = p.ty - p.y; let dist = Math.hypot(dx, dy);
                    if (dist < 5) this.packets.splice(idx, 1);
                    else if (this.starCuts[p.index] && dist < 120) this.packets.splice(idx, 1);
                    else { p.x += (dx / dist) * p.speed * dt; p.y += (dy / dist) * p.speed * dt; }
                }
            } else if (p.stage === 'ring') {
                if (p.state === 'to_hubA') {
                    if (this.ringMainCut && p.x > 675) { this.packets.splice(idx, 1); return; }
                    p.x += p.speed * dt;
                    if (p.x >= p.tx) {
                        if (!this.ringPrimaryCuts[2]) { p.state = 'on_ring'; p.lineType = 'primary'; p.routeIndex = 2; p.x = 740; p.y = 410; p.tx = 890; p.ty = 150; p.speed = 300; }
                        else if (!this.ringSecondaryCuts[2]) { p.state = 'on_ring'; p.lineType = 'secondary'; p.routeIndex = 2; p.x = 740; p.y = 410; p.tx = 890; p.ty = 150; p.speed = 300; }
                        else this.packets.splice(idx, 1);
                    }
                } else if (p.state === 'on_ring') {
                    let dx = p.tx - p.x; let dy = p.ty - p.y; let dist = Math.hypot(dx, dy);
                    if ((p.lineType === 'primary' && this.ringPrimaryCuts[p.routeIndex] && dist < 150) || (p.lineType === 'secondary' && this.ringSecondaryCuts[p.routeIndex] && dist < 150)) { this.packets.splice(idx, 1); return; }
                    if (dist < 6) {
                        if (p.routeIndex === 2) {
                            let nextLine = p.lineType;
                            if (this.ringPrimaryCuts[0] && !this.ringSecondaryCuts[0]) nextLine = 'secondary';
                            if (!this.ringPrimaryCuts[0] || !this.ringSecondaryCuts[0]) { p.lineType = nextLine; p.routeIndex = 0; p.x = 890; p.y = 150; p.tx = 1040; p.ty = 410; }
                            else this.packets.splice(idx, 1);
                        } else if (p.routeIndex === 0) this.packets.splice(idx, 1);
                    } else { p.x += (dx / dist) * p.speed * dt; p.y += (dy / dist) * p.speed * dt; }
                }
            }
        });
    },

    drawStageTopology() {
        if (!this.canvas || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.V_WIDTH, this.V_HEIGHT);
        this.clickTriggers = [];
        this.ctx.strokeStyle = '#222222'; this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 6]); this.ctx.beginPath(); this.ctx.moveTo(560, 0); this.ctx.lineTo(560, this.V_HEIGHT); this.ctx.stroke(); this.ctx.setLineDash([]);

        // STAR
        this.ctx.fillStyle = 'rgba(255, 111, 0, 0.2)'; this.ctx.font = '700 12px sans-serif'; this.ctx.fillText("■ LEFT : STAR TOPOLOGY (本格星形配置盤)", 20, 25);
        let isMainCut = this.starCuts[0];
        this.drawCable(110, 265, 250, 265, isMainCut, isMainCut ? '#d32f2f' : '#333');
        this.drawCutButton(180, 265, isMainCut, 'star', 0);
        this.drawConsoleDevice(10, 220, 120, 90);
        const starTargets = [{ x: 100, y: 115 }, { x: 400, y: 115 }, { x: 100, y: 415 }, { x: 400, y: 415 }];
        for (let i = 0; i < 4; i++) {
            let isBranchCut = this.starCuts[i+1];
            this.drawCable(250, 265, starTargets[i].x, starTargets[i].y, isBranchCut, isBranchCut ? '#d32f2f' : '#252525');
            this.drawCutButton(250+(starTargets[i].x-250)*0.5, 265+(starTargets[i].y-265)*0.5, isBranchCut, 'star', i+1);
            this.drawNodeDevice(starTargets[i].x-42, starTargets[i].y-16, `Node Port ${i+1}`, !(isMainCut || isBranchCut));
        }
        this.drawHubBox(215, 240, "SWITCHING\nHUB");

        // RING
        this.ctx.fillStyle = 'rgba(0, 230, 118, 0.25)'; this.ctx.fillText("■ RIGHT : DOUBLE RING REDUNDANT (二重化幹線ループ盤)", 590, 25);
        this.drawCable(620, 410, 740, 410, this.ringMainCut, this.ringMainCut ? '#d32f2f' : '#333');
        this.drawCutButton(680, 410, this.ringMainCut, 'ring_main', 0);
        this.drawConsoleDevice(520, 365, 120, 90);
        const [hA, hB, hC] = [{x:740, y:410}, {x:890, y:150}, {x:1040, y:410}];
        this.drawDoubleCable(hA.x, hA.y, hB.x, hB.y, this.ringPrimaryCuts[2], this.ringSecondaryCuts[2], 2);
        this.drawDoubleCable(hB.x, hB.y, hC.x, hC.y, this.ringPrimaryCuts[0], this.ringSecondaryCuts[0], 0);
        this.drawHubBox(hA.x-40, hA.y-25, "HUB (A)\n[PRIMARY]"); this.drawHubBox(hB.x-40, hB.y-25, "HUB (B)"); this.drawHubBox(hC.x-40, hC.y-25, "HUB (C)");
        this.drawNodeDevice(hB.x-42, 45, "Node Port A", !this.ringMainCut && (!this.ringPrimaryCuts[2] || !this.ringSecondaryCuts[2] || !this.ringPrimaryCuts[0] || !this.ringSecondaryCuts[0]));
        this.drawNodeDevice(hC.x+40, hC.y-16, "Node Port B", !this.ringMainCut && (!this.ringPrimaryCuts[0] || !this.ringSecondaryCuts[0] || (!this.ringPrimaryCuts[2] && !this.ringSecondaryCuts[2])));

        this.packets.forEach(p => {
            this.ctx.fillStyle = (p.stage === 'star') ? '#ff6f00' : '#00e676';
            let rx = p.x, ry = p.y;
            if (p.state === 'on_ring') {
                let d = Math.hypot(p.tx-p.x, p.ty-p.y);
                if (d > 0) { let off = (p.lineType==='primary')?8:-8; rx += (-(p.ty-p.y)/d)*off; ry += ((p.tx-p.x)/d)*off; }
            }
            this.ctx.fillRect(rx-6, ry-6, 12, 12);
        });
    },
    drawConsoleDevice(x, y, w, h) {
        if (this.isImageLoaded) this.ctx.drawImage(this.consoleImage, x, y, w, h);
        else { this.ctx.fillStyle='#111'; this.ctx.strokeStyle='#ff6f00'; this.ctx.lineWidth=2; this.ctx.fillRect(x,y,w,h); this.ctx.strokeRect(x,y,w,h); this.ctx.fillStyle='#fff'; this.ctx.textAlign='center'; this.ctx.fillText("MA2", x+w/2, y+h/2); }
    },
    drawDoubleCable(x1, y1, x2, y2, pC, sC, idx) {
        let d = Math.hypot(x2-x1, y2-y1), nx = -(y2-y1)/d, ny = (x2-x1)/d;
        this.drawCable(x1+nx*9, y1+ny*9, x2+nx*9, y2+ny*9, pC, pC?'#d32f2f':'#00b0ff');
        this.drawCable(x1-nx*9, y1-ny*9, x2-nx*9, y2-ny*9, sC, sC?'#d32f2f':'#00e676');
        this.drawCutButton(x1+nx*9+(x2-x1)*0.5, y1+ny*9+(y2-y1)*0.5, pC, 'ring_p', idx);
        this.drawCutButton(x1-nx*9+(x2-x1)*0.5, y1-ny*9+(y2-y1)*0.5, sC, 'ring_s', idx);
    },
    drawCable(x1, y1, x2, y2, isC, color) { this.ctx.lineWidth=4; this.ctx.strokeStyle=isC?'#d32f2f':color; if(isC) this.ctx.setLineDash([4,4]); this.ctx.beginPath(); this.ctx.moveTo(x1,y1); this.ctx.lineTo(x2,y2); this.ctx.stroke(); this.ctx.setLineDash([]); },
    drawCutButton(x, y, isC, t, i) { this.clickTriggers.push({x,y,type:t,index:i}); this.ctx.fillStyle=isC?'#d32f2f':'#222'; this.ctx.strokeStyle=isC?'#ff5252':'#555'; this.ctx.lineWidth=1.5; this.ctx.beginPath(); this.ctx.arc(x,y,10,0,Math.PI*2); this.ctx.fill(); this.ctx.stroke(); this.ctx.fillStyle='#fff'; this.ctx.font='bold 9px sans-serif'; this.ctx.textAlign='center'; this.ctx.fillText(isC?'✖':'✂',x,y+3); },
    drawHubBox(x, y, t) { this.ctx.fillStyle='#1e1e1e'; this.ctx.strokeStyle='#444'; this.ctx.lineWidth=2; this.ctx.fillRect(x,y,70,50); this.ctx.strokeRect(x,y,70,50); this.ctx.fillStyle='#aaa'; this.ctx.font='bold 8px sans-serif'; this.ctx.textAlign='center'; let l=t.split('\n'); this.ctx.fillText(l[0],x+35,y+24); if(l[1]) this.ctx.fillText(l[1],x+35,y+36); },
    drawNodeDevice(x, y, t, a) { this.ctx.fillStyle='#0f0f0f'; this.ctx.strokeStyle=a?'#333':'#d32f2f'; this.ctx.lineWidth=1.5; this.ctx.fillRect(x,y,84,32); this.ctx.strokeRect(x,y,84,32); this.ctx.fillStyle=a?'#00e676':'#ff3d00'; if(!a && Math.sin(performance.now()*0.01)>0) this.ctx.fillStyle='#222'; this.ctx.beginPath(); this.ctx.arc(x+12, y+16, 3.5, 0, Math.PI*2); this.ctx.fill(); this.ctx.fillStyle=a?'#fff':'#555'; this.ctx.font='bold 8.5px sans-serif'; this.ctx.textAlign='left'; this.ctx.fillText(t,x+24,y+20); }
};