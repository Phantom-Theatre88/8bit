(() => {
  const lessons = {
    sim16bit: {
      title: '16-bit 調光卓',
      sub: 'Master / Coarse / Fineと、0〜65,535の二層構造をつなげて読む。',
      explain: [
        '<b>Coarse</b>は上位8-bit。大きな段の位置を決めます。',
        '<b>Fine</b>は下位8-bit。Coarseの1段の中を256段階に分けます。',
        '<span class="cyan">16-bit値 = Coarse × 256 + Fine</span>です。'
      ],
      teacher: 'まずCoarseを動かして、大きな位置変化を確認します。次にFineを動かし、同じCoarseの段の中を細かく追い込めることを見てみよう。Masterは16-bit全体をまとめて動かす操作です。',
      remember: ['□ 16-bit = 65,536段階', '□ Coarse = 上位8-bit', '□ Fine = 下位8-bit'],
      tip: 'まずCoarse、次にFineの順で操作。',
      footer: 'Master / Coarse / Fine操作'
    },
    simdmx: {
      title: 'DMX通信列車',
      sub: '1番から512番までのチャンネル値を、順番に送り続ける信号を見る。',
      explain: [
        '<b>START CODE</b>の後に、CH1〜CH512の値が並びます。',
        '各チャンネルの値は<span class="cyan">0〜255</span>です。',
        '値が変わらなくても、DMXは同じ並びを繰り返し送ります。'
      ],
      teacher: 'フェーダーを動かし、列車の同じチャンネル番号の値が変わることを確認しよう。表示速度は観察用です。実際のDMXは止まらず、およそ1秒間に42回ほど繰り返し送られます。',
      remember: ['□ 1系統は最大512ch', '□ 各chは0〜255', '□ 機材は必要な番地を読む'],
      tip: 'スロー表示で順番を確認。',
      footer: 'フェーダー操作 / 速度表示 / 波形確認'
    },
    ledcolormix: {
      title: 'LED色混ぜ',
      sub: 'RGBと補助色チャンネルを操作し、色域と白の質の違いを見る。',
      explain: [
        '<b>RGB</b>の割合で色相と彩度を作ります。',
        '<b>White</b>系チャンネルは、白や肌色の見え方を補います。',
        '<span class="pink">Amber / Lime / Cyan</span>などで作れる色域が広がります。'
      ],
      teacher: '最初にLED構成を選び、同じ色をそれぞれの構成で作ってみよう。RGBだけの白と、WhiteやAmberなどを使った白を比べると、数値が似ていても色の質が同じではないことが分かります。',
      remember: ['□ RGB全点灯でも白の質は別', '□ 補助色で色域が広がる', '□ 灯具ごとに構成が違う'],
      tip: '白・肌色・淡色を見比べる。',
      footer: 'LED構成切替 / 色混ぜ / 色地図'
    },
    scroller: {
      title: 'Scroller',
      sub: '2色と24色のフィルム移動、8-bit位置制御、START / END検出を見る。',
      explain: [
        'DMX値<span class="cyan">0〜255</span>をフィルムの位置へ変換します。',
        '2色と24色で、1色ぶんの物理幅は同じです。',
        '電源投入時にSTART / ENDを検出し、移動範囲を覚えます。'
      ],
      teacher: 'まずPOWERを入れ、STARTシールからENDシールまでを探すキャリブレーションを見よう。READYになったらフェーダーを動かし、同じDMX値でも2色と24色ではフィルム全体の移動距離が違うことを確認します。',
      remember: ['□ START / ENDで基準出し', '□ 位置制御は8-bit', '□ 色数が多いほどENDが遠い'],
      tip: 'READY後にフェーダーを操作。',
      footer: 'POWER / Calibration / 8-bit位置操作'
    },
    movinghead: {
      title: 'Moving Head',
      sub: 'PAN / TILT、キャリブレーション、8-bitと16-bitの位置精度を比べる。',
      explain: [
        '電源投入時にPAN / TILTの<span class="green">START / END</span>を探します。',
        '<b>8-bit</b>は大きな段、<b>16-bit</b>はFineで細かく位置を決めます。',
        '検出できない場合はキャリブレーションエラーになります。'
      ],
      teacher: 'まずPOWERを入れ、PANとTILTが端を探して基準位置へ戻る流れを確認しよう。次に精度比較をONにし、8-bitでは止めにくい位置へ16-bitのFineで近づける違いを見ます。',
      remember: ['□ 起動時に基準位置を検出', '□ PAN / TILTに可動限界', '□ Fineで位置を追い込む'],
      tip: 'POWER → 精度比較の順で確認。',
      footer: 'Calibration / Error / 8・16-bit比較'
    },
    netipaddress: {
      title: 'IPアドレス',
      sub: '機器ごとの住所、同一ネットワーク、サブネットマスク、重複を確認する。',
      explain: [
        'IPアドレスはネットワーク上の<b>機器ごとの住所</b>です。',
        '通信にはアドレスだけでなく、サブネットマスクも関係します。',
        '<span class="pink">同じIPの重複</span>は通信エラーの原因になります。'
      ],
      teacher: 'CHALLENGEの順に数値を変え、どこまでが同じネットワークなのかを確認しよう。アドレスが違って見えても同じ範囲の場合があり、同じアドレスを2台へ付けると重複になります。',
      remember: ['□ IPは機器ごとの住所', '□ Maskで範囲を決める', '□ 同じIPを重複させない'],
      tip: 'IPだけでなくMaskも確認。',
      footer: 'IP変更 / Mask確認 / 重複テスト'
    },
    netartnet: {
      title: 'DMX on LAN',
      sub: '複数のDMX Universeを、Ethernet上のパケットとして運ぶ流れを見る。',
      explain: [
        'DMXの値を<b>LAN用パケット</b>へ包み直します。',
        '1本のLAN幹線で複数Universeを運べます。',
        'Nodeが受け取り、必要なUniverseをDMXへ戻します。'
      ],
      teacher: '左の教材図を順番に見て、DMXがLAN用パケットへ変わり、スイッチを通ってNodeへ届く流れを確認しよう。LANケーブルの中をDMX信号そのものがそのまま走るわけではありません。',
      remember: ['□ DMX値をPacket化', '□ 複数Universeを運べる', '□ NodeでDMXへ戻す'],
      tip: 'Universe番号と送信先を確認。',
      footer: '教材図切替 / Packet表示 / 速度切替'
    },
    netbroadcast: {
      title: 'Broadcast / Art-Net 1',
      sub: '同じネットワーク内の全Nodeへ届く配信と、受信側の仕分けを見る。',
      explain: [
        '<b>Broadcast</b>は同じ範囲の全機器へ送ります。',
        '不要なNodeにもパケットが届き、受信側で仕分けます。',
        'Universeや機器が増えると、不要通信も増えます。'
      ],
      teacher: '教材図を進め、1つの送信が全Nodeへ届く様子を見よう。小規模では分かりやすい方式ですが、必要のないNodeにも届くため、規模が大きくなるほど負荷を意識する必要があります。',
      remember: ['□ 同一範囲へ一斉送信', '□ 不要なNodeにも届く', '□ 大規模化で負荷が増える'],
      tip: '通信量とNode数を確認。',
      footer: '教材図切替 / 全体配信 / 負荷表示'
    },
    netsacn: {
      title: 'Multicast / sACN',
      sub: 'UniverseごとのグループとIGMP Snoopingで、必要なNodeへ届ける。',
      explain: [
        '<b>Multicast</b>はUniverseごとに通信グループを分けます。',
        'Nodeは必要なUniverseのグループへ参加します。',
        '<span class="green">IGMP Snooping</span>が必要なポートへ通信を振り分けます。'
      ],
      teacher: 'どのNodeがどのUniverseを必要としているかを見てみよう。IGMP Snooping対応スイッチでは、参加情報を使って必要なポートへだけ流しやすくなります。設定と機器対応の確認が重要です。',
      remember: ['□ UniverseごとのGroup', '□ NodeがGroupへ参加', '□ IGMP Snoopingを確認'],
      tip: '対応スイッチと設定を確認。',
      footer: 'Group表示 / IGMP / 速度切替'
    },
    explain: {
      title: '結線 / 冗長化',
      sub: 'Star構成とRing構成を比べ、断線時の影響範囲と迂回経路を見る。',
      explain: [
        '<b>Star</b>は中央のHubから各Nodeへ個別に配線します。',
        '<b>Ring / 二重化</b>は別経路を用意し、断線時に迂回します。',
        '冗長化は機器・設定・経路の全てが対応して成立します。'
      ],
      teacher: '画面上のハサミを押し、ケーブル断線を再現しよう。Starでは切れた枝の先だけが止まり、Ringでは別経路へ回れる場合があります。ただし、輪にしただけで自動的に冗長化されるわけではありません。',
      remember: ['□ Starは枝ごとに影響', '□ Ringは別経路を持つ', '□ 対応機器と設定が必要'],
      tip: '断線箇所と影響範囲を確認。',
      footer: '断線操作 / Star・Ring比較'
    }
  };

  function render(key, moduleHTML) {
    const lesson = lessons[key];
    if (!lesson) return moduleHTML;
    const networkClass = ['netartnet', 'netbroadcast', 'netsacn'].includes(key) ? ' network-main' : '';
    const networkExplainId = ['netipaddress', 'netartnet', 'netbroadcast', 'netsacn'].includes(key)
      ? ` id="${key}-common-explain"`
      : '';
    const teacherSpeechId = key === 'netipaddress'
      ? ' id="netipaddress-teacher-speech"'
      : '';
    let titleExtra = '';
    if (key === 'ledcolormix' && window.Module_LEDColorMixing?.getModeControlsHTML) {
      titleExtra = window.Module_LEDColorMixing.getModeControlsHTML();
    }
    if (key === 'netipaddress' && window.Module_NetIpAddress?.getCheckerTitleHTML) {
      titleExtra = window.Module_NetIpAddress.getCheckerTitleHTML();
    }
    if (['netartnet', 'netbroadcast', 'netsacn'].includes(key)) {
      titleExtra = `<div class="network-title-tools" data-network-tools="${key}"><div data-network-speed-slot="${key}"></div><button class="network-expand-button" type="button" data-network-expand="${key}" aria-label="ネットワークシミュレーションを拡大">⛶ 拡大</button></div>`;
    }
    const explain = lesson.explain.map(item => `<div>${item}</div>`).join('');
    const remember = lesson.remember.map(item => `<div class="common-remember-item">${item}</div>`).join('');
    return `
      <div class="common-lesson-page ${key}-page">
        <header class="common-page-titlebar"><div class="common-page-heading"><h1 class="common-page-title">${lesson.title}</h1><div class="common-page-sub">${lesson.sub}</div></div>${titleExtra}</header>
        <section class="common-page-main ${key}-main${networkClass}">${moduleHTML}</section>
        <section class="common-page-bottom">
          <section class="common-bottom-card"><h2 class="common-bottom-title">▤ 解説</h2><div class="common-explain-list"${networkExplainId}>${explain}</div></section>
          <section class="common-bottom-card common-teacher-card"><img class="common-teacher-img" src="assets/analog_teacher_pointing.webp" alt="照明教材の先生"><div class="common-teacher-copy"><h3>先生のひとこと</h3><div class="common-teacher-speech"${teacherSpeechId}>${lesson.teacher}</div></div></section>
          <section class="common-bottom-card common-remember-card"><h2 class="common-bottom-title">♙ 覚えておこう</h2><div class="common-remember-list">${remember}</div><div class="common-tip">⚡ 操作TIP<br>${lesson.tip}</div></section>
        </section>
        <footer class="common-page-footer"><span>8bit Lighting Study　v3.0.1</span><span>${lesson.footer}</span></footer>
      </div>`;
  }

  function wrapElement(key, element) {
    if (!element || element.closest('.common-lesson-page')) return;
    const marker = `next-ui-slot-${key}`;
    const holder = document.createElement('div');
    holder.innerHTML = render(key, `<div data-next-ui-slot="${marker}"></div>`).trim();
    const page = holder.firstElementChild;
    const slot = page.querySelector(`[data-next-ui-slot="${marker}"]`);
    element.replaceWith(page);
    slot.replaceWith(element);
  }

  window.NextUiLessonShell = { lessons, render, wrapElement };
})();
