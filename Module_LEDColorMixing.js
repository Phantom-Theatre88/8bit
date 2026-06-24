/**
 * Module_LEDColorMixing.js
 * 新人向け照明教材：LEDの色混ぜ
 *
 * v0.2 Top style test
 * - Top.html風の1教材タブとして表示するための単体Module
 * - CIE色度図風の概念地図 + RGB/W/WW/CW/Amber/Lime/Cyan操作
 * - 実測色ではなく「考え方の地図」
 */

window.Module_LEDColorMixing = {
  id: "led-color-mixing",
  title: "LED Color Mixing",
  label: "LEDの色混ぜ",
  version: "production-top-1.0",

  state: {
    mode: "rgb",
    values: {
      r: 255,
      g: 255,
      b: 255,
      w: 0,
      ww: 0,
      cw: 0,
      a: 0,
      l: 0,
      c: 0
    }
  },

  modes: {
    rgb: {
      tab: "RGB",
      title: "RGB｜3色で色を作る",
      subtitle: "Red / Green / Blue の3点を結んだ三角形で、色を考える。",
      enabled: ["r", "g", "b"],
      preset: { r: 255, g: 255, b: 255, w: 0, ww: 0, cw: 0, a: 0, l: 0, c: 0 },
      pointTitle: "RGBだけでも「白っぽい」は作れる",
      pointText: "RGBを全部点けると、白に近い色は作れます。でも、その白は「どんな白でも自然に見える」という意味ではありません。人物の肌、衣裳、淡い色では、RGBだけだと不自然に見えることがあります。",
      note: "入口：RGBは色作りの基本。ただし人物の肌、衣裳、淡い色では、RGBだけでは不自然に見えることがある。",
      whiteScore: "△",
      skinScore: "△",
      rangeScore: "基本"
    },
    rgbw: {
      tab: "RGBW",
      title: "RGBW｜白チャンネルを足す",
      subtitle: "Whiteは外側の派手な色ではなく、中央寄りの白・淡色を補うチャンネル。",
      enabled: ["r", "g", "b", "w"],
      preset: { r: 120, g: 120, b: 120, w: 180, ww: 0, cw: 0, a: 0, l: 0, c: 0 },
      pointTitle: "Whiteは白の質と明るさを補う",
      pointText: "RGBで作った白っぽさにWhiteを足すと、白や淡色の安定感を出しやすくなります。",
      note: "注意：White LEDの色味や演色性は機種によって違う。",
      whiteScore: "○",
      skinScore: "△〜○",
      rangeScore: "RGB + 白"
    },
    whiteTemp: {
      tab: "WW/CW",
      title: "Warm White / Cool White｜白にも方向がある",
      subtitle: "Warmは赤〜黄寄り、Coolは青寄り。白の印象を分けて考える。",
      enabled: ["r", "g", "b", "ww", "cw"],
      preset: { r: 60, g: 60, b: 80, w: 0, ww: 150, cw: 90, a: 0, l: 0, c: 0 },
      pointTitle: "Warm / Cool は白の色味を分ける",
      pointText: "Warm Whiteは電球っぽい暖かい白、Cool Whiteは青白い白として感じられやすい方向です。",
      note: "現場では、白の色温度が人物・衣裳・空間の印象に直結する。",
      whiteScore: "◎",
      skinScore: "○",
      rangeScore: "白の幅"
    },
    rgbal: {
      tab: "RGBAL",
      title: "RGBAL｜Amber / Limeで穴を埋める",
      subtitle: "Amberは赤〜黄〜肌色方向、Limeは黄緑〜白っぽさ・淡色方向を助ける。",
      enabled: ["r", "g", "b", "a", "l"],
      preset: { r: 130, g: 90, b: 35, w: 0, ww: 0, cw: 0, a: 140, l: 80, c: 0 },
      pointTitle: "Amber / Limeは肌色・淡色を助ける",
      pointText: "RGBだけでは作りにくい赤〜黄の間や、黄緑〜白寄りのニュアンスを補いやすくします。",
      note: "“色が増える”だけではなく、弱い部分を補うためのチャンネルとして見る。",
      whiteScore: "○",
      skinScore: "◎",
      rangeScore: "補助色あり"
    },
    seven: {
      tab: "7色LED",
      title: "7色LED｜表現の道具が増える",
      subtitle: "RGBにWhite系、Amber、Lime、Cyanなどが加わると、白・淡色・色域の考え方が変わる。",
      enabled: ["r", "g", "b", "w", "ww", "cw", "a", "l", "c"],
      preset: { r: 90, g: 90, b: 100, w: 90, ww: 90, cw: 65, a: 80, l: 80, c: 55 },
      pointTitle: "7色LEDは“派手な色が増える”だけではない",
      pointText: "色の点が増えると、RGBだけでは作りにくい白、肌色、淡い色、Cyan方向などを補いやすくなります。",
      note: "これは実機の完全再現ではなく、色作りの考え方を掴むための地図。",
      whiteScore: "◎",
      skinScore: "◎",
      rangeScore: "広い / 滑らか"
    }
  },

  channelColors: {
    r: [255, 0, 0],
    g: [0, 255, 0],
    b: [0, 0, 255],
    w: [255, 255, 255],
    ww: [255, 198, 118],
    cw: [205, 238, 255],
    a: [255, 132, 0],
    l: [190, 255, 70],
    c: [0, 220, 255]
  },

  // 教材用の概念座標。実測CIE座標ではなく、画面上の「考え方の地図」用。
  mapPoints: {
    r: [76, 57],
    g: [30, 18],
    b: [25, 79],
    w: [43, 55],
    ww: [50, 57],
    cw: [38, 52],
    a: [63, 47],
    l: [42, 31],
    c: [27, 48]
  },

  getHTML() {
    return `
      <section class="ledmix-root" id="${this.id}">
        ${this.getHeaderHTML()}
        <div class="ledmix-stage">
          ${this.getControlPaneHTML()}
          ${this.getMapPaneHTML()}
        </div>
      </section>
    `;
  },

  getHeaderHTML() {
    return `
      <header class="ledmix-header">
        <div>
          <h1>LED Color Mixing｜RGBで白は作れるのか</h1>
          <p>RGB、White、Warm White、Cool White、Amber、Lime、Cyanを「考え方の地図」で見る。</p>
        </div>
        <div class="ledmix-mode-tabs">
          ${Object.entries(this.modes).map(([key, mode]) => {
            return `<button class="ledmix-mode-btn ${key === this.state.mode ? "active" : ""}" data-mode="${key}">${mode.tab}</button>`;
          }).join("")}
        </div>
      </header>
    `;
  },

  getMapPaneHTML() {
    return `
      <div class="ledmix-right map-side">
        <div class="ledmix-panel-head">
          <h2>色の地図｜このLED色はどの位置？</h2>
          <span>外側ほど鮮やかな色。中央寄りほど白・淡色・肌色の説明に近づく。</span>
        </div>

        <div class="ledmix-cie-card">
          <div class="ledmix-cie-soft-glow"></div>
          <div class="ledmix-cie-color"></div>
          <div class="ledmix-cie-mask"></div>
          <div class="ledmix-cie-grid"></div>

          <svg class="ledmix-gamut-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon class="ledmix-poly rgb" points="76,57 30,18 25,79"></polygon>
            <polygon class="ledmix-poly extended" data-role="extended-poly" points="76,57 30,18 25,79"></polygon>
            <path class="ledmix-white-locus" d="M 50 57 C 47 56, 45 55, 43 55 C 41 54, 39 53, 38 52"></path>
          </svg>

          ${this.getColorPointsHTML()}
          <div class="ledmix-current-point" data-role="current-point">
            <span data-role="current-point-label">現在色</span>
          </div>
        </div>

        <div class="ledmix-legend">
          <div>
            <b>RGB三角形</b>
            <span>Red / Green / Blue の3点を結んだ範囲。中央付近は白っぽく見えるが、白の質は別問題。</span>
          </div>
          <div>
            <b>補助色チャンネル</b>
            <span>White、Amber、Lime、Cyanなどは、RGBだけでは作りにくい白・肌色・淡色を補う。</span>
          </div>
        </div>

        <div class="ledmix-point-card map-point-card">
          <b>POINT</b>
          <h3 data-role="point-title">${this.modes[this.state.mode].pointTitle}</h3>
          <p data-role="point-text">${this.modes[this.state.mode].pointText}</p>
          <div data-role="mode-note">${this.modes[this.state.mode].note}</div>
        </div>

        <div class="ledmix-warning map-warning">
          この図はCIE色度図を元にした教材用の概念図です。実際のLED素子のx,y座標、分光分布、演色性、白の質はメーカー・機種・キャリブレーションで変わります。
        </div>
      </div>
    `;
  },

  getColorPointsHTML() {
    const points = [
      ["r", "Red", "p-r"],
      ["g", "Green", "p-g"],
      ["b", "Blue", "p-b"],
      ["w", "White", "p-w"],
      ["ww", "Warm W", "p-ww"],
      ["cw", "Cool W", "p-cw"],
      ["a", "Amber", "p-a"],
      ["l", "Lime", "p-l"],
      ["c", "Cyan", "p-c"]
    ];

    return points.map(([ch, label, cls]) => {
      return `<div class="ledmix-point ${cls}" data-point="${ch}" data-label="${label}"></div>`;
    }).join("");
  },

  getControlPaneHTML() {
    const mode = this.modes[this.state.mode];

    return `
      <div class="ledmix-left fader-side">
        <div class="ledmix-output-card">
          <div class="ledmix-swatch-wrap">
            <div class="ledmix-swatch" data-role="swatch"></div>
            <div class="ledmix-readout" data-role="rgb-readout">rgb(255,255,255)</div>
          </div>

          <div class="ledmix-output-info">
            <h3 data-role="mode-title">${mode.title}</h3>
            <p data-role="mode-text">${mode.subtitle}</p>

            <div class="ledmix-quality-grid">
              <div class="ledmix-quality"><span>白の作りやすさ</span><b data-role="white-score">${mode.whiteScore}</b></div>
              <div class="ledmix-quality"><span>肌色・淡色</span><b data-role="skin-score">${mode.skinScore}</b></div>
              <div class="ledmix-quality"><span>色域イメージ</span><b data-role="range-score">${mode.rangeScore}</b></div>
            </div>
          </div>
        </div>

        <div class="ledmix-fader-head">
          <b>FADER BANK</b>
          <span>モードで使えるチャンネルが変わる</span>
        </div>

        <div class="ledmix-sliders ledmix-fader-bank">
          ${this.getSliderHTML("r", "Red")}
          ${this.getSliderHTML("g", "Green")}
          ${this.getSliderHTML("b", "Blue")}
          ${this.getSliderHTML("w", "White")}
          ${this.getSliderHTML("ww", "Warm W")}
          ${this.getSliderHTML("cw", "Cool W")}
          ${this.getSliderHTML("a", "Amber")}
          ${this.getSliderHTML("l", "Lime")}
          ${this.getSliderHTML("c", "Cyan")}
        </div>

      </div>
    `;
  },

  getSliderHTML(ch, label) {
    return `
      <div class="ledmix-fader-cell ch-${ch}" data-slider-row="${ch}">
        <div class="ledmix-fader-label">${label}</div>
        <div class="ledmix-fader-value" data-output="${ch}">${this.state.values[ch]}</div>
        <div class="ledmix-fader-slot" data-fader-slot="${ch}" role="slider" aria-label="${label}" aria-valuemin="0" aria-valuemax="255" aria-valuenow="${this.state.values[ch]}" tabindex="0">
          <div class="ledmix-fader-track"></div>
          <div class="ledmix-fader-fill" data-fader-fill="${ch}"></div>
          <div class="ledmix-fader-knob" data-fader-knob="${ch}"></div>
        </div>
        <div class="ledmix-fader-zero">0</div>
      </div>
    `;
  },

  init(root = document) {
    const host = root.querySelector(`#${this.id}`);

    if (!host) {
      return;
    }

    host.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        this.state.mode = button.dataset.mode;
        Object.assign(this.state.values, this.modes[this.state.mode].preset);
        this.update(host);
      });
    });

    host.querySelectorAll("[data-fader-slot]").forEach((slot) => {
      const ch = slot.dataset.faderSlot;

      const setFromPointer = (event) => {
        const mode = this.modes[this.state.mode];

        if (!mode.enabled.includes(ch)) {
          return;
        }

        const rect = slot.getBoundingClientRect();
        const y = event.clientY - rect.top;
        const ratio = 1 - Math.max(0, Math.min(1, y / rect.height));

        this.state.values[ch] = this.clamp(ratio * 255);
        this.update(host);
      };

      slot.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        slot.setPointerCapture(event.pointerId);
        setFromPointer(event);
      });

      slot.addEventListener("pointermove", (event) => {
        if (event.buttons !== 1) return;
        event.preventDefault();
        setFromPointer(event);
      });

      slot.addEventListener("keydown", (event) => {
        const mode = this.modes[this.state.mode];

        if (!mode.enabled.includes(ch)) {
          return;
        }

        let delta = 0;

        if (event.key === "ArrowUp") delta = 1;
        if (event.key === "ArrowDown") delta = -1;
        if (event.key === "PageUp") delta = 10;
        if (event.key === "PageDown") delta = -10;
        if (event.key === "Home") {
          this.state.values[ch] = 0;
          this.update(host);
          event.preventDefault();
          return;
        }
        if (event.key === "End") {
          this.state.values[ch] = 255;
          this.update(host);
          event.preventDefault();
          return;
        }

        if (delta !== 0) {
          this.state.values[ch] = this.clamp(this.state.values[ch] + delta);
          this.update(host);
          event.preventDefault();
        }
      });
    });

    this.update(host);
  },

  update(host) {
    const mode = this.modes[this.state.mode];

    host.querySelectorAll("[data-mode]").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === this.state.mode);
    });

    host.querySelector('[data-role="mode-title"]').textContent = mode.title;
    host.querySelector('[data-role="mode-text"]').textContent = mode.subtitle;
    host.querySelector('[data-role="white-score"]').textContent = mode.whiteScore;
    host.querySelector('[data-role="skin-score"]').textContent = mode.skinScore;
    host.querySelector('[data-role="range-score"]').textContent = mode.rangeScore;
    host.querySelector('[data-role="point-title"]').textContent = mode.pointTitle;
    host.querySelector('[data-role="point-text"]').textContent = mode.pointText;
    host.querySelector('[data-role="mode-note"]').textContent = mode.note;

    host.querySelectorAll("[data-slider-row]").forEach((row) => {
      const ch = row.dataset.sliderRow;
      const enabled = mode.enabled.includes(ch);
      const value = this.state.values[ch];
      const ratio = Math.max(0, Math.min(1, value / 255));
      const knob = row.querySelector(`[data-fader-knob="${ch}"]`);
      const fill = row.querySelector(`[data-fader-fill="${ch}"]`);
      const slot = row.querySelector(`[data-fader-slot="${ch}"]`);

      row.classList.toggle("disabled", !enabled);
      row.querySelector(`[data-output="${ch}"]`).textContent = value;

      if (knob) {
        knob.style.bottom = `calc(${ratio * 100}% - 13px)`;
      }

      if (fill) {
        fill.style.height = `${ratio * 100}%`;
      }

      if (slot) {
        slot.setAttribute("aria-valuenow", String(value));
        slot.classList.toggle("disabled", !enabled);
      }
    });

    host.querySelectorAll("[data-point]").forEach((point) => {
      const ch = point.dataset.point;
      point.classList.toggle("disabled", !mode.enabled.includes(ch));
    });

    const extended = host.querySelector('[data-role="extended-poly"]');
    if (this.state.mode === "rgb") {
      extended.style.opacity = "0";
      extended.setAttribute("points", "76,57 30,18 25,79");
    } else if (this.state.mode === "rgbw" || this.state.mode === "whiteTemp") {
      extended.style.opacity = "1";
      extended.setAttribute("points", "76,57 30,18 25,79 43,55 50,57 38,52");
    } else if (this.state.mode === "rgbal") {
      extended.style.opacity = "1";
      extended.setAttribute("points", "76,57 63,47 42,31 30,18 25,79");
    } else {
      extended.style.opacity = "1";
      extended.setAttribute("points", "76,57 63,47 42,31 30,18 27,48 25,79 43,55 50,57 38,52");
    }

    const [r, g, b] = this.mixColor();
    const swatch = host.querySelector('[data-role="swatch"]');
    swatch.style.background = `rgb(${r}, ${g}, ${b})`;
    swatch.style.boxShadow = `0 0 0 1px rgba(0,0,0,.65), 0 0 38px rgba(${r},${g},${b},.56)`;

    host.querySelector('[data-role="rgb-readout"]').textContent =
      `rgb(${r},${g},${b})`;

    const currentPoint = host.querySelector('[data-role="current-point"]');

    if (currentPoint) {
      const [x, y] = this.mixMapPosition();
      currentPoint.style.left = `${x}%`;
      currentPoint.style.top = `${y}%`;
      currentPoint.style.background = `rgb(${r}, ${g}, ${b})`;
      currentPoint.style.boxShadow =
        `0 0 0 3px rgba(255,255,255,.96), 0 0 0 6px rgba(0,0,0,.75), 0 0 22px rgba(${r},${g},${b},.85)`;
    }
  },

  mixMapPosition() {
    const mode = this.modes[this.state.mode];
    let total = 0;
    let x = 0;
    let y = 0;

    mode.enabled.forEach((ch) => {
      const amount = this.state.values[ch] / 255;
      const point = this.mapPoints[ch];

      if (!point || amount <= 0) {
        return;
      }

      x += point[0] * amount;
      y += point[1] * amount;
      total += amount;
    });

    if (total <= 0) {
      return [43, 55];
    }

    return [
      Math.max(18, Math.min(82, x / total)),
      Math.max(18, Math.min(82, y / total))
    ];
  },

  mixColor() {
    const mode = this.modes[this.state.mode];
    let total = 0;
    let r = 0;
    let g = 0;
    let b = 0;

    mode.enabled.forEach((ch) => {
      const amount = this.state.values[ch] / 255;
      const [cr, cg, cb] = this.channelColors[ch];

      r += cr * amount;
      g += cg * amount;
      b += cb * amount;
      total += amount;
    });

    if (total <= 0) {
      return [0, 0, 0];
    }

    const max = Math.max(r, g, b, 1);
    const normalize = max > 255 ? 255 / max : 1;

    return [
      this.clamp(r * normalize),
      this.clamp(g * normalize),
      this.clamp(b * normalize)
    ];
  },

  clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }
};
