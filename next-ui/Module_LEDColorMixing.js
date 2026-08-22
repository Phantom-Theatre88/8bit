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

  // CIE 1931 xy色度図の見た目に寄せた教材用座標。
  // 実測値ではなく、LED色作りの考え方を見せるための概念配置。
  mapPoints: {
    r: [86, 58],
    g: [24, 14],
    b: [22, 86],
    w: [47, 58],
    ww: [54, 62],
    cw: [43, 54],
    a: [74, 53],
    l: [46, 28],
    c: [18, 54]
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
          <p>右上のボタンでLEDのチャンネル構成を切り替え、RGB、White、Amber、Lime、Cyanなどの位置を色地図で見る。</p>
        </div>
        <div class="ledmix-mode-area" aria-label="LED構成選択">
          <div class="ledmix-mode-label">LED構成を選ぶ</div>
          <div class="ledmix-mode-tabs">
            ${Object.entries(this.modes).map(([key, mode]) => {
              return `<button class="ledmix-mode-btn ${key === this.state.mode ? "active" : ""}" data-mode="${key}">${mode.tab}</button>`;
            }).join("")}
          </div>
        </div>
      </header>
    `;
  },

  getMapPaneHTML() {
    return `
      <div class="ledmix-right map-side">
        <div class="ledmix-panel-head">
          <h2>色の地図｜このLED色はどの位置？</h2>
        </div>

        <div class="ledmix-cie-card">
          <div class="ledmix-cie-plot">
            <div class="ledmix-cie-soft-glow"></div>
            <img class="ledmix-cie-bg-img" src="assets/led_cie_concept.svg" alt="" aria-hidden="true">

            <div class="ledmix-cie-grid"></div>

            <svg class="ledmix-gamut-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon class="ledmix-poly rgb" points="86,58 24,14 22,86"></polygon>
              <polygon class="ledmix-poly extended" data-role="extended-poly" points="86,58 24,14 22,86"></polygon>
              <path class="ledmix-white-locus" d="M 54 62 C 51 61, 49 59, 47 58 C 45 56, 44 55, 43 54"></path>
            </svg>

            ${this.getColorPointsHTML()}
            <div class="ledmix-current-point" data-role="current-point">
              <span data-role="current-point-label">現在色</span>
            </div>
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

        <div class="ledmix-channel-bank">
          <div class="ledmix-channel-head">
            <b>FADER BANK</b>
            <span data-role="fader-mode-label">選択中のLED構成で使うチャンネル</span>
          </div>

          <div class="ledmix-channel-grid">
            ${this.getChannelFaderHTML("r", "Red")}
            ${this.getChannelFaderHTML("g", "Green")}
            ${this.getChannelFaderHTML("b", "Blue")}
            ${this.getChannelFaderHTML("w", "White")}
            ${this.getChannelFaderHTML("ww", "Warm W")}
            ${this.getChannelFaderHTML("cw", "Cool W")}
            ${this.getChannelFaderHTML("a", "Amber")}
            ${this.getChannelFaderHTML("l", "Lime")}
            ${this.getChannelFaderHTML("c", "Cyan")}
          </div>
        </div>

      </div>
    `;
  },

  getChannelFaderHTML(ch, label) {
    return `
      <div class="ledmix-channel-cell ch-${ch}" data-channel-row="${ch}">
        <div class="ledmix-channel-label">${label}</div>
        <div class="ledmix-channel-value" data-channel-output="${ch}">${this.state.values[ch]}</div>
        <div class="ledmix-channel-slot" data-channel-slot="${ch}" role="slider" aria-label="${label}" aria-valuemin="0" aria-valuemax="255" aria-valuenow="${this.state.values[ch]}" tabindex="0">
          <div class="ledmix-channel-track"></div>
          <div class="ledmix-channel-fill" data-channel-fill="${ch}"></div>
          <div class="ledmix-channel-knob" data-channel-knob="${ch}"></div>
        </div>
        <div class="ledmix-channel-zero">0</div>
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

    host.querySelectorAll("[data-channel-slot]").forEach((slot) => {
      const ch = slot.dataset.channelSlot;

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
    const modeNote = host.querySelector('[data-role="mode-note"]');
    if (modeNote) {
      modeNote.textContent = mode.note;
    }

    host.querySelectorAll("[data-channel-row]").forEach((row) => {
      const ch = row.dataset.channelRow;
      const enabled = mode.enabled.includes(ch);
      const value = this.state.values[ch];
      const ratio = Math.max(0, Math.min(1, value / 255));
      const knob = row.querySelector(`[data-channel-knob="${ch}"]`);
      const fill = row.querySelector(`[data-channel-fill="${ch}"]`);
      const slot = row.querySelector(`[data-channel-slot="${ch}"]`);
      const output = row.querySelector(`[data-channel-output="${ch}"]`);

      row.classList.toggle("disabled", !enabled);

      if (output) {
        output.textContent = value;
      }

      if (knob) {
        const slotHeight = slot ? slot.clientHeight : 0;
        const knobHeight = knob ? knob.offsetHeight : 18;
        const travel = Math.max(0, slotHeight - knobHeight);
        knob.style.bottom = `${travel * ratio}px`;
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
      extended.setAttribute("points", "86,58 24,14 22,86");
    } else if (this.state.mode === "rgbw" || this.state.mode === "whiteTemp") {
      extended.style.opacity = "1";
      extended.setAttribute("points", "86,58 24,14 22,86 47,58 54,62 43,54");
    } else if (this.state.mode === "rgbal") {
      extended.style.opacity = "1";
      extended.setAttribute("points", "86,58 74,53 46,28 24,14 22,86");
    } else {
      extended.style.opacity = "1";
      extended.setAttribute("points", "86,58 74,53 46,28 24,14 18,54 22,86 47,58 54,62 43,54");
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
      Math.max(16, Math.min(86, x / total)),
      Math.max(14, Math.min(88, y / total))
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
