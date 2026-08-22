/**
 * Module_NetIpAddress.js
 * Network教材：IPアドレス
 *
 * v0.13.1 role color fixed
 * - 右側を Interactive IP Checker 化
 * - IP / Subnet Mask を触って OK / NG / ERROR を確認できる
 */

window.Module_NetIpAddress = {
  id: "net-ip-address",
  title: "IP Address",
  label: "IPアドレス",
  version: "top-style-test-0.15-challenge-guide",

  state: {
    consoleIp: [192, 168, 0, 10],
    nodeAIp: [192, 168, 0, 21],
    nodeBIp: [192, 168, 0, 22],
    mask: [255, 255, 255, 0],
    activeTarget: "nodeA"
  },

  slides: [
    {
      title: "1. IPアドレスとは",
      imageTitle: "卓・Node・PCに、それぞれ住所を持たせる",
      pointTitle: "NETWORK / IP ADDRESS POINT 1",
      pointHead: "IPアドレスは、ネットワーク上の機器を見分ける住所",
      pointText:
        "照明卓、Node、PCなどは、IPアドレスを使って相手を見つけます。" +
        "同じIPアドレスを2台に設定すると、住所が重なり通信が不安定になります。",
      bottomNote:
        "たとえ：劇場内の部屋番号。番号が重なると、荷物が正しく届かない。",
      simMode: "address"
    },
    {
      title: "2. 同じネットワークとは",
      imageTitle: "Subnet Mask込みで、同じ範囲か確認する",
      pointTitle: "NETWORK / IP ADDRESS POINT 2",
      pointHead: "同じネットワークにいないと、通信できないことがある",
      pointText:
        "IPアドレスだけでなく、サブネットマスクと合わせて見ます。" +
        "255.255.255.0 の場合は、前3つの数字が同じかを見る入口になります。",
      bottomNote:
        "192.168.0.21 はOK。192.168.1.21 は別ネットワークとして扱われる。",
      simMode: "same"
    },
    {
      title: "3. サブネットマスクとは",
      imageTitle: "どこまでを同じグループとして見るか",
      pointTitle: "NETWORK / IP ADDRESS POINT 3",
      pointHead: "サブネットマスクは、見る範囲を決める設定",
      pointText:
        "255の場所をネットワーク側として見る、という入口で考えます。" +
        "255.255.255.0 なら、192.168.0 までを同じグループとして見ます。",
      bottomNote:
        "新人向け入口：255.255.255.0 は「前3つを見る」で覚える。",
      simMode: "subnet"
    },
    {
      title: "4. IP重複とは",
      imageTitle: "同じIPが2台あると、通信が乱れる",
      pointTitle: "NETWORK / IP ADDRESS POINT 4",
      pointHead: "IPアドレスの重複は現場トラブルの原因になる",
      pointText:
        "Node A と Node B に同じIPを入れると、卓から見た相手が曖昧になります。" +
        "通信できたり、できなかったりする不安定な状態になります。",
      bottomNote:
        "確認順：ケーブル → リンクランプ → IP → 重複 → Art-Net/sACN設定。",
      simMode: "duplicate"
    }
  ],

  getHTML() {
    return `
      <section class="net-ip-root" id="${this.id}">
        ${this.getHeaderHTML()}
        ${this.getStageHTML()}
      </section>
    `;
  },

  getHeaderHTML() {
    return `
      <header class="net-ip-titlebar">
        <div>
          <h1>IP Address｜IPアドレス</h1>
          <p>照明卓・Node・PCが同じネットワークで通信するための住所を理解する。</p>
        </div>
      </header>
    `;
  },

  getStageHTML() {
    const firstSlide = this.slides[0];

    return `
      <div class="net-ip-stage">
        ${this.getLeftPaneHTML(firstSlide, 0)}
        ${this.getRightPaneHTML(firstSlide.simMode)}
      </div>
    `;
  },

  getLeftPaneHTML(slide, index) {
    return `
      <div class="net-ip-left">
        ${this.getSlideHeadHTML(slide)}
        ${this.getLessonVisualHTML(slide, index)}
        ${this.getPointCardHTML(slide)}
      </div>
    `;
  },

  getSlideHeadHTML(slide) {
    return `
      <div class="slide-head">
        <h2 data-role="slide-title">${slide.title}</h2>

        <div class="slide-pager" aria-label="IP教材ページ切替">
          ${this.getPagerButtonsHTML()}
        </div>
      </div>
    `;
  },

  getPagerButtonsHTML() {
    return this.slides
      .map((_, index) => {
        const activeClass = index === 0 ? "active" : "";

        return `
          <button class="slide-btn ${activeClass}" data-slide="${index}">
            ${index + 1}
          </button>
        `;
      })
      .join("");
  },

  getLessonVisualHTML(slide, index) {
    return `
      <div class="lesson-visual-card image-asset-card">
        <div class="visual-number" data-role="visual-number">${index + 1}</div>

        <div class="visual-caption">
          <b data-role="image-title">${slide.imageTitle}</b>
        </div>

        <div class="comic-board image-comic-board" data-role="comic-board">
          ${this.getComicHTML(slide.simMode)}
        </div>
      </div>
    `;
  },

  getPointCardHTML(slide) {
    return `
      <div class="point-card">
        <div class="point-label" data-role="point-title">
          ${slide.pointTitle}
        </div>

        <h3 data-role="point-head">
          ${slide.pointHead}
        </h3>

        <p data-role="point-text">
          ${slide.pointText}
        </p>

        <div class="bottom-note" data-role="bottom-note">
          ${slide.bottomNote}
        </div>
      </div>
    `;
  },

  getComicHTML(mode) {
    const imageMap = {
      address: "assets/net/net_ip_01_address.png",
      same: "assets/net/net_ip_02_same_network.png",
      subnet: "assets/net/net_ip_03_subnet_mask.png",
      duplicate: "assets/net/net_ip_04_duplicate.png"
    };

    const altMap = {
      address: "IPアドレスの住所札を配るイラスト",
      same: "Node Bだけ別の町内にいるイラスト",
      subnet: "Maskを変えると見える範囲が変わるイラスト",
      duplicate: "同じ住所札が2枚あって混乱するイラスト"
    };

    const src = imageMap[mode] || imageMap.address;
    const alt = altMap[mode] || "IPアドレス教材イラスト";

    return `
      <img
        class="lesson-comic-image"
        src="${src}"
        alt="${alt}"
        loading="eager"
      />
    `;
  },

  getAddressComicHTML() {
    return `
      <div class="teacher-card">
        <div class="avatar">卓</div>
        <div class="bubble">みんなに住所をつけるよ！</div>
      </div>

      <div class="mini-devices">
        <div>
          <b>Console</b>
          <code>192.168.0.10</code>
        </div>

        <div>
          <b>Node A</b>
          <code>192.168.0.21</code>
        </div>

        <div>
          <b>PC</b>
          <code>192.168.0.50</code>
        </div>
      </div>

      <div class="comic-note">
        IPアドレス＝ネットワーク上の住所
      </div>
    `;
  },

  getSameNetworkComicHTML() {
    return `
      <div class="teacher-card">
        <div class="avatar">確認</div>
        <div class="bubble">Mask込みで同じ範囲を見るよ！</div>
      </div>

      <div class="mini-devices">
        <div class="ok">
          <b>Console</b>
          <code>192.168.0.10</code>
        </div>

        <div class="ok">
          <b>Node A</b>
          <code>192.168.0.21</code>
        </div>

        <div class="ng">
          <b>Node B</b>
          <code>192.168.1.21</code>
        </div>
      </div>

      <div class="comic-note">
        Subnet Mask：255.255.255.0
      </div>
    `;
  },

  getSubnetComicHTML() {
    return `
      <div class="teacher-card">
        <div class="avatar">Mask</div>
        <div class="bubble">255.255.255.0 は前3つを見る！</div>
      </div>

      <div class="subnet-strip">
        <span class="hi">192</span>
        <span class="hi">168</span>
        <span class="hi">0</span>
        <span>10</span>
      </div>

      <div class="mask-strip">
        <span>255</span>
        <span>255</span>
        <span>255</span>
        <span>0</span>
      </div>

      <div class="comic-note">
        同じネットワークを見るための物差し
      </div>
    `;
  },

  getDuplicateComicHTML() {
    return `
      <div class="teacher-card">
        <div class="avatar">重複</div>
        <div class="bubble">同じ住所が2台あるぞ！</div>
      </div>

      <div class="mini-devices">
        <div class="ng">
          <b>Node A</b>
          <code>192.168.0.21</code>
        </div>

        <div class="ng">
          <b>Node B</b>
          <code>192.168.0.21</code>
        </div>

        <div class="ok">
          <b>Console</b>
          <code>192.168.0.10</code>
        </div>
      </div>

      <div class="comic-note">
        同じIPは通信不安定の原因
      </div>
    `;
  },

  getRightPaneHTML(simMode) {
    return `
      <div class="net-ip-right">
        <div class="sim-frame">
          <div class="grid-bg"></div>

          <div class="interactive-layer" data-role="interactive-layer">
            ${this.getInteractiveHTML(simMode)}
          </div>
        </div>
      </div>
    `;
  },

  init(root = document) {
    const host = root.querySelector(`#${this.id}`);

    if (!host) {
      return;
    }

    this.bindSlideButtons(host);
    this.bindInteractive(host);
    this.updateInteractive(host);
  },

  bindSlideButtons(host) {
    const buttons = host.querySelectorAll(".slide-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.slide);

        this.renderSlide(host, index);

        buttons.forEach((btn) => {
          btn.classList.toggle("active", btn === button);
        });

        this.bindInteractive(host);
        this.updateInteractive(host);
      });
    });
  },

  bindInteractive(host) {
    const inputs = host.querySelectorAll("[data-ip-field]");
    const presetButtons = host.querySelectorAll("[data-preset]");
    const targetButtons = host.querySelectorAll("[data-target]");

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const group = input.dataset.group;
        const index = Number(input.dataset.index);
        const value = this.clampOctet(Number(input.value));

        input.value = value;
        this.state[group][index] = value;
        this.updateInteractive(host);
      });
    });

    presetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.applyPreset(button.dataset.preset);
        this.renderInteractiveOnly(host);
      });
    });

    targetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.state.activeTarget = button.dataset.target;
        this.updateInteractive(host);
      });
    });
  },

  renderSlide(host, index) {
    const slide = this.slides[index];

    host.querySelector('[data-role="slide-title"]').textContent =
      slide.title;

    host.querySelector('[data-role="visual-number"]').textContent =
      String(index + 1);

    host.querySelector('[data-role="image-title"]').textContent =
      slide.imageTitle;

    host.querySelector('[data-role="point-title"]').textContent =
      slide.pointTitle;

    host.querySelector('[data-role="point-head"]').textContent =
      slide.pointHead;

    host.querySelector('[data-role="point-text"]').textContent =
      slide.pointText;

    host.querySelector('[data-role="bottom-note"]').textContent =
      slide.bottomNote;

    host.querySelector('[data-role="comic-board"]').innerHTML =
      this.getComicHTML(slide.simMode);

    host.querySelector('[data-role="interactive-layer"]').innerHTML =
      this.getInteractiveHTML(slide.simMode);
  },

  renderInteractiveOnly(host) {
    const activeButton = host.querySelector(".slide-btn.active");
    const index = activeButton ? Number(activeButton.dataset.slide) : 0;
    const slide = this.slides[index];

    host.querySelector('[data-role="interactive-layer"]').innerHTML =
      this.getInteractiveHTML(slide.simMode);

    this.bindInteractive(host);
    this.updateInteractive(host);
  },

  updateInteractive(host) {
    const status = this.getNetworkStatus();

    this.updateIpText(host);
    this.updateResult(host, status);
    this.updateLines(host, status);
    this.updateTargetButtons(host);
  },

  updateIpText(host) {
    const map = {
      consoleIpText: this.ipToString(this.state.consoleIp),
      nodeAIpText: this.ipToString(this.state.nodeAIp),
      nodeBIpText: this.ipToString(this.state.nodeBIp),
      maskText: this.ipToString(this.state.mask),
      networkText: this.getNetworkPartText(this.state.consoleIp, this.state.mask)
    };

    Object.entries(map).forEach(([role, text]) => {
      host.querySelectorAll(`[data-role="${role}"]`).forEach((el) => {
        el.textContent = text;
      });
    });
  },

  updateResult(host, status) {
    const resultBox = host.querySelector('[data-role="interactive-result"]');

    if (!resultBox) {
      return;
    }

    resultBox.className = `interactive-result ${status.kind}`;
    resultBox.querySelector("b").textContent = status.title;
    resultBox.querySelector("span").textContent = status.message;
  },

  updateLines(host, status) {
    const aLine = host.querySelector('[data-role="line-a"]');
    const bLine = host.querySelector('[data-role="line-b"]');
    const aNode = host.querySelector('[data-role="node-a-box"]');
    const bNode = host.querySelector('[data-role="node-b-box"]');
    const aPacket = host.querySelector('[data-role="packet-a"]');
    const bPacket = host.querySelector('[data-role="packet-b"]');

    if (!aLine || !bLine || !aNode || !bNode) {
      return;
    }

    aLine.className = `interactive-line line-a ${status.nodeAClass}`;
    bLine.className = `interactive-line line-b ${status.nodeBClass}`;
    aNode.className = `interactive-node node-a ${status.nodeAClass}`;
    bNode.className = `interactive-node node-b ${status.nodeBClass}`;

    if (aPacket) {
      aPacket.className = this.getPacketClassName("packet-to-a", status.nodeAClass, "A");
      aPacket.textContent = this.getPacketLabel(status.nodeAClass, "A");
    }

    if (bPacket) {
      bPacket.className = this.getPacketClassName("packet-to-b", status.nodeBClass, "B");
      bPacket.textContent = this.getPacketLabel(status.nodeBClass, "B");
    }
  },

  getPacketClassName(baseClass, statusClass) {
    if (statusClass === "ng") {
      return `packet-dot ${baseClass} blocked`;
    }

    if (statusClass === "error") {
      return `packet-dot ${baseClass} error-packet`;
    }

    return `packet-dot ${baseClass} ok-packet`;
  },

  getPacketLabel(statusClass, defaultLabel) {
    if (statusClass === "error") {
      return "?";
    }

    return defaultLabel;
  },

  updateTargetButtons(host) {
    host.querySelectorAll("[data-target]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.target === this.state.activeTarget
      );
    });
  },

  getInteractiveHTML(mode) {
    return `
      <div class="interactive-root mode-${mode}">
        ${this.getInteractiveHeaderHTML(mode)}
        ${this.getChallengeHTML(mode)}

        <div class="interactive-main">
          ${this.getInputPanelHTML(mode)}
          ${this.getNetworkDiagramHTML(mode)}
        </div>

        ${this.getResultHTML()}
      </div>
    `;
  },


  getChallengeHTML(mode) {
    const challenges = {
      address: {
        title: "CHALLENGE 1",
        action: "Console / Node A / Node B の数字を変えてみる",
        goal: "機器ごとに違う住所を持つことを確認する",
        hint: "最後の数字を変える"
      },
      same: {
        title: "CHALLENGE 2",
        action: "Node B を 192.168.1.22 にしてみる",
        goal: "別ネットワークになると NG になることを確認する",
        hint: "プリセット：別ネットワーク"
      },
      subnet: {
        title: "CHALLENGE 3",
        action: "Mask を 255.255.255.0 から 255.255.0.0 に変える",
        goal: "見える範囲が広がることを確認する",
        hint: "プリセット：Mask /16"
      },
      duplicate: {
        title: "CHALLENGE 4",
        action: "Node A と Node B を同じIPにしてみる",
        goal: "ERROR：IP重複になることを確認する",
        hint: "プリセット：IP重複"
      }
    };

    const item = challenges[mode] || challenges.address;

    return `
      <div class="sim-challenge">
        <div class="challenge-badge">${item.title}</div>
        <div class="challenge-main">
          <b>${item.action}</b>
          <span>${item.goal}</span>
        </div>
        <div class="challenge-hint">${item.hint}</div>
      </div>
    `;
  },

  getInteractiveHeaderHTML(mode) {
    const titles = {
      address: ["IP ADDRESS CHECKER", "IPはネットワーク上の住所"],
      same: ["SAME NETWORK CHECK", "同じネットワークにいるか判定する"],
      subnet: ["SUBNET MASK CHECK", "Maskが見る範囲を決める"],
      duplicate: ["IP DUPLICATE CHECK", "同じIPが2台ないか確認する"]
    };

    const [title, sub] = titles[mode];

    return `
      <div class="interactive-header">
        <b>${title}</b>
        <span>${sub}</span>
      </div>
    `;
  },

  getInputPanelHTML(mode) {
    const modeHelp = {
      address: "各機器のIPを触って、住所が変わることを確認する。",
      same: "NodeのIPを変えると、OK / NG が変わる。",
      subnet: "Maskを変えると、見る範囲が変わる。",
      duplicate: "Node A と Node B を同じIPにすると ERROR になる。"
    };

    return `
      <div class="ip-control-panel role-input">
        <div class="control-title">
          <b>IP INPUT</b>
          <span>${modeHelp[mode]}</span>
        </div>

        <div class="input-rows">
          ${this.getIpRowHTML("Console", "consoleIp", this.state.consoleIp)}
          ${this.getIpRowHTML("Node A", "nodeAIp", this.state.nodeAIp)}
          ${this.getIpRowHTML("Node B", "nodeBIp", this.state.nodeBIp)}
          ${this.getIpRowHTML("Subnet", "mask", this.state.mask)}
        </div>

        <div class="subnet-readout role-subnet">
          <span>Subnet Mask</span>
          <b data-role="maskText">${this.ipToString(this.state.mask)}</b>
          <em>見る範囲：<i data-role="networkText">${this.getNetworkPartText(this.state.consoleIp, this.state.mask)}</i></em>
        </div>

        <div class="preset-row">
          <button data-preset="normal">正常</button>
          <button data-preset="differentNetwork">別ネットワーク</button>
          <button data-preset="duplicate">IP重複</button>
          <button data-preset="mask16">Mask /16</button>
          <button data-preset="reset">初期化</button>
        </div>
      </div>
    `;
  },

  getIpRowHTML(label, group, values) {
    return `
      <div class="ip-row-control ${this.getIpRowRoleClass(label)}">
        <label>${label}</label>

        <div class="octet-inputs">
          ${values
            .map((value, index) => {
              return `
                <input
                  type="number"
                  min="0"
                  max="255"
                  value="${value}"
                  data-ip-field
                  data-group="${group}"
                  data-index="${index}"
                />
              `;
            })
            .join("<span>.</span>")}
        </div>
      </div>
    `;
  },

  getIpRowRoleClass(label) {
    if (label === "Console") {
      return "row-console";
    }

    if (label === "Node A" || label === "Node B") {
      return "row-node";
    }

    return "row-subnet";
  },

  getNetworkDiagramHTML(mode) {
    return `
      <div class="interactive-diagram role-diagram">
        <div class="diagram-console role-console">
          <b>CONSOLE</b>
          <span data-role="consoleIpText">${this.ipToString(this.state.consoleIp)}</span>
        </div>

        <div class="judge-block role-check">
          <b>CHECK</b>
          <span>Mask：<i data-role="maskText">${this.ipToString(this.state.mask)}</i></span>
          <em>Network：<i data-role="networkText">${this.getNetworkPartText(this.state.consoleIp, this.state.mask)}</i></em>
        </div>

        <div class="interactive-node node-a" data-role="node-a-box">
          <b>NODE A</b>
          <span data-role="nodeAIpText">${this.ipToString(this.state.nodeAIp)}</span>
          <button data-target="nodeA">Aを判定</button>
        </div>

        <div class="interactive-node node-b" data-role="node-b-box">
          <b>NODE B</b>
          <span data-role="nodeBIpText">${this.ipToString(this.state.nodeBIp)}</span>
          <button data-target="nodeB">Bを判定</button>
        </div>

        <div class="interactive-line line-console"></div>
        <div class="interactive-line line-a" data-role="line-a"></div>
        <div class="interactive-line line-b" data-role="line-b"></div>

        <div class="packet-dot packet-to-check">IP</div>
        <div class="packet-dot packet-to-a" data-role="packet-a">A</div>
        <div class="packet-dot packet-to-b" data-role="packet-b">B</div>
      </div>
    `;
  },

  getResultHTML() {
    return `
      <div class="interactive-result wait" data-role="interactive-result">
        <b>CHECK</b>
        <span>IPを変更すると判定が変わります。</span>
      </div>
    `;
  },

  getNetworkStatus() {
    const consoleIp = this.state.consoleIp;
    const nodeA = this.state.nodeAIp;
    const nodeB = this.state.nodeBIp;
    const mask = this.state.mask;
    const target = this.state.activeTarget === "nodeA" ? nodeA : nodeB;

    const duplicateAB = this.sameIp(nodeA, nodeB);
    const duplicateConsoleA = this.sameIp(consoleIp, nodeA);
    const duplicateConsoleB = this.sameIp(consoleIp, nodeB);

    const aSameNetwork = this.sameNetwork(consoleIp, nodeA, mask);
    const bSameNetwork = this.sameNetwork(consoleIp, nodeB, mask);

    if (duplicateConsoleA || duplicateConsoleB || duplicateAB) {
      return {
        kind: "error",
        title: "ERROR：IPが重複しています",
        message: this.getDuplicateMessage(duplicateConsoleA, duplicateConsoleB, duplicateAB),
        nodeAClass: duplicateConsoleA || duplicateAB ? "error" : aSameNetwork ? "ok" : "ng",
        nodeBClass: duplicateConsoleB || duplicateAB ? "error" : bSameNetwork ? "ok" : "ng"
      };
    }

    if (!this.sameNetwork(consoleIp, target, mask)) {
      return {
        kind: "ng",
        title: "NG：別ネットワークです",
        message:
          `${this.state.activeTarget === "nodeA" ? "Node A" : "Node B"} は、Consoleと同じネットワークではありません。`,
        nodeAClass: aSameNetwork ? "ok" : "ng",
        nodeBClass: bSameNetwork ? "ok" : "ng"
      };
    }

    return {
      kind: "ok",
      title: "OK：通信できる設定です",
      message:
        `${this.state.activeTarget === "nodeA" ? "Node A" : "Node B"} は、Consoleと同じネットワークです。`,
      nodeAClass: aSameNetwork ? "ok" : "ng",
      nodeBClass: bSameNetwork ? "ok" : "ng"
    };
  },

  getDuplicateMessage(duplicateConsoleA, duplicateConsoleB, duplicateAB) {
    if (duplicateConsoleA) {
      return "Console と Node A が同じIPです。";
    }

    if (duplicateConsoleB) {
      return "Console と Node B が同じIPです。";
    }

    if (duplicateAB) {
      return "Node A と Node B が同じIPです。";
    }

    return "同じIPを持つ機器があります。";
  },

  applyPreset(name) {
    const presets = {
      normal: {
        consoleIp: [192, 168, 0, 10],
        nodeAIp: [192, 168, 0, 21],
        nodeBIp: [192, 168, 0, 22],
        mask: [255, 255, 255, 0],
        activeTarget: "nodeA"
      },
      differentNetwork: {
        consoleIp: [192, 168, 0, 10],
        nodeAIp: [192, 168, 0, 21],
        nodeBIp: [192, 168, 1, 22],
        mask: [255, 255, 255, 0],
        activeTarget: "nodeB"
      },
      duplicate: {
        consoleIp: [192, 168, 0, 10],
        nodeAIp: [192, 168, 0, 21],
        nodeBIp: [192, 168, 0, 21],
        mask: [255, 255, 255, 0],
        activeTarget: "nodeB"
      },
      mask16: {
        consoleIp: [192, 168, 0, 10],
        nodeAIp: [192, 168, 1, 21],
        nodeBIp: [192, 168, 2, 22],
        mask: [255, 255, 0, 0],
        activeTarget: "nodeA"
      },
      reset: {
        consoleIp: [192, 168, 0, 10],
        nodeAIp: [192, 168, 0, 21],
        nodeBIp: [192, 168, 0, 22],
        mask: [255, 255, 255, 0],
        activeTarget: "nodeA"
      }
    };

    Object.assign(this.state, presets[name]);
  },

  sameIp(a, b) {
    return a.every((value, index) => value === b[index]);
  },

  sameNetwork(a, b, mask) {
    return a.every((value, index) => {
      if (mask[index] === 255) {
        return value === b[index];
      }

      if (mask[index] === 0) {
        return true;
      }

      return Math.floor(value / (256 - mask[index])) ===
        Math.floor(b[index] / (256 - mask[index]));
    });
  },

  getNetworkPartText(ip, mask) {
    const parts = ip.filter((_, index) => mask[index] === 255);

    if (parts.length === 0) {
      return "全体";
    }

    return parts.join(".");
  },

  ipToString(ip) {
    return ip.join(".");
  },

  clampOctet(value) {
    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.max(0, Math.min(255, value));
  }
};
