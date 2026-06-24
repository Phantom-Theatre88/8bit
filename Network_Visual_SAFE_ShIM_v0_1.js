/*
  Network_Visual_SAFE_ShIM_v0.1 for Top.html integration

  REGULATION:
  - Do NOT touch network module heart logic.
  - Do NOT change animation progress, packet generation, arrival detection,
    LED blinking timing, universe routing, Broadcast/sACN delivery logic,
    or Art-Net DMX receive -> LED -> UDP send timing.

  compact layout v0.1 compatible.\n  network layout v0.3 compatible.\n\n  This shim only patches display surface:
  - full-canvas background clear appearance
  - outer CSS polish
  - display text normalization
  - Art-Net data label display values only: 0% / 25% / 50% / 75% / FF
*/

(function () {
  const THEMES = {
    netartnet: {
      accent: "#ff8a00",
      glow: "rgba(255,138,0,0.18)",
      wrapClass: "network-safe-artnet"
    },
    netbroadcast: {
      accent: "#ff4081",
      glow: "rgba(255,64,129,0.16)",
      wrapClass: "network-safe-broadcast"
    },
    netsacn: {
      accent: "#00e676",
      glow: "rgba(0,230,118,0.16)",
      wrapClass: "network-safe-sacn"
    }
  };

  const VALUE_LABELS = ["0%", "25%", "50%", "75%", "FF", "50%", "75%", "25%", "0%", "FF"];

  function injectStyle() {
    if (document.getElementById("network-visual-safe-shim-style")) return;

    const style = document.createElement("style");
    style.id = "network-visual-safe-shim-style";
    style.textContent = `
      .network-safe-module {
        width: 100%;
        height: 100%;
      }

      .network-safe-module .canvas-wrapper {
        border-color: rgba(0,229,255,.28) !important;
        border-radius: 16px !important;
        background: #050808 !important;
        box-shadow:
          inset 0 0 30px rgba(0,0,0,.92),
          0 0 22px rgba(0,229,255,.10) !important;
      }

      .network-safe-artnet .canvas-wrapper {
        border-color: rgba(255,138,0,.42) !important;
      }

      .network-safe-broadcast .canvas-wrapper {
        border-color: rgba(255,64,129,.42) !important;
      }

      .network-safe-sacn .canvas-wrapper {
        border-color: rgba(0,230,118,.42) !important;
      }

      .artnet-control-panel,
      .broadcast-control-panel,
      .sacn-control-panel {
        background: #0b1011 !important;
        border: 1px solid rgba(0,229,255,.22) !important;
        box-shadow: 0 0 16px rgba(0,229,255,.08) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeDisplayText(text, key) {
    const s = String(text);

    // Shared display rule: percent display, max only FF.
    if (s === "00%") return "0%";
    if (s === "FL") return "FF";
    if (s === "99%") return "FF";

    if (key === "netartnet") {
      if (s === "ETHERNET / Art-Net PACKET") return "Art-Net UDP PACKET";
      if (s.includes("DST: 192.168.0.50")) return "Delivery: Broadcast例";
      if (s.includes("【右】DMX世界")) return "【右】DMX入力：5系統のDMX信号がNodeへ入る";
      if (s.includes("【左】NETWORK世界")) return "【左】Network出力：受信後にArt-Net UDPとして送出";
    }

    if (key === "netbroadcast") {
      if (s === "Broadcast Mode") return "Broadcast / 全体配信";
      if (s === "⚠ ゴミ破棄中") return "⚠ 不要データ破棄";
      if (s.includes("【右】入力")) return "【右】入力：全UniverseがHubへ届く";
      if (s.includes("【左】")) return "【左】Broadcast：全Nodeへ配信、不要分はNode側で破棄";
      if (s === "*.255") return "Broadcast";
      if (s === "Art-Net") return "all nodes";
    }

    if (key === "netsacn") {
      if (s === "SMART SWITCH") return "sACN SWITCH";
      if (s === "sACN Multicast") return "sACN / Multicast";
      if (s === "● 正常・快適") return "● 必要分のみ受信";
      if (s.includes("【右】入力")) return "【右】入力：UniverseごとのUDPパケット";
      if (s.includes("【左】静寂")) return "【左】sACN：必要なUniverseだけNodeへ届く";
    }

    return s;
  }

  function isFullCanvasClear(module, x, y, w, h) {
    const W = module.V_WIDTH || 1200;
    const H = module.V_HEIGHT || 520;
    return x === 0 && y === 0 && Math.abs(w - W) < 0.1 && Math.abs(h - H) < 0.1;
  }

  function drawUnifiedBackground(ctx, module, key, originalFillRect) {
    const W = module.V_WIDTH || 1200;
    const H = module.V_HEIGHT || 520;
    const theme = THEMES[key] || THEMES.netartnet;

    ctx.save();

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#071113");
    grad.addColorStop(0.55, "#020506");
    grad.addColorStop(1, "#070707");
    ctx.fillStyle = grad;
    originalFillRect(0, 0, W, H);

    const radial = ctx.createRadialGradient(W * 0.5, 0, 20, W * 0.5, 0, W * 0.82);
    radial.addColorStop(0, theme.glow);
    radial.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = radial;
    originalFillRect(0, 0, W, H);

    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= W; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.14;
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "rgba(0,229,255,0.65)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(W / 2, 42);
    ctx.lineTo(W / 2, H - 26);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  function patchContext(ctx, module, key) {
    if (!ctx || ctx.__networkVisualSafePatched) return;
    ctx.__networkVisualSafePatched = true;

    const originalFillRect = ctx.fillRect.bind(ctx);
    const originalFillText = ctx.fillText.bind(ctx);
    const originalStrokeRect = ctx.strokeRect.bind(ctx);

    ctx.fillRect = function (x, y, w, h) {
      if (isFullCanvasClear(module, x, y, w, h)) {
        drawUnifiedBackground(ctx, module, key, originalFillRect);
        return;
      }
      return originalFillRect(x, y, w, h);
    };

    ctx.fillText = function (text, x, y, maxWidth) {
      const nextText = normalizeDisplayText(text, key);
      if (maxWidth === undefined) return originalFillText(nextText, x, y);
      return originalFillText(nextText, x, y, maxWidth);
    };

    ctx.strokeRect = function (x, y, w, h) {
      const theme = THEMES[key] || THEMES.netartnet;
      const oldShadowColor = ctx.shadowColor;
      const oldShadowBlur = ctx.shadowBlur;
      ctx.shadowColor = theme.accent;
      ctx.shadowBlur = Math.max(ctx.shadowBlur || 0, 3);
      const result = originalStrokeRect(x, y, w, h);
      ctx.shadowColor = oldShadowColor;
      ctx.shadowBlur = oldShadowBlur;
      return result;
    };
  }

  function wrapModule(module, key) {
    if (!module || module.__networkVisualSafeWrapped) return;
    module.__networkVisualSafeWrapped = true;

    if (key === "netartnet" && Array.isArray(module.dataLabels)) {
      module.dataLabels = VALUE_LABELS.slice();
    }

    const theme = THEMES[key] || THEMES.netartnet;

    if (module.getHTML) {
      const originalGetHTML = module.getHTML.bind(module);
      module.getHTML = function () {
        const html = originalGetHTML();
        return `<div class="network-safe-module ${theme.wrapClass}">${html}</div>`;
      };
    }

    if (module.init) {
      const originalInit = module.init.bind(module);
      module.init = function () {
        const result = originalInit();
        patchContext(module.ctx, module, key);
        return result;
      };
    }
  }

  window.NetworkVisualSafeShim = {
    install(modules) {
      injectStyle();

      // Top.html uses netartnet / netbroadcast / netsacn.
      wrapModule(modules.netartnet, "netartnet");
      wrapModule(modules.netbroadcast, "netbroadcast");
      wrapModule(modules.netsacn, "netsacn");

      // Standalone test aliases are also supported.
      wrapModule(modules.artnet, "netartnet");
      wrapModule(modules.broadcast, "netbroadcast");
      wrapModule(modules.sacn, "netsacn");
    }
  };
})();
