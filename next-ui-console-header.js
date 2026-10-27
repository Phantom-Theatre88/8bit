/* LOCK: Single shared header DOM for all eight lesson pages. Page-specific styles belong below it. */
(() => {
  const categories = [["electric","電気","<path d=\"M13.5 2 5 13h6l-.5 9L19 10h-6z\"/>",[["V・W・Aの法則","Analog.html"],["単相3線","SinglePhase3.html"],["電気って波なの？","Waveforms.html"],["三相3線（未実装）",null]]],["dimming","調光","<path d=\"M5 3v18M12 3v18M19 3v18\"/><path d=\"M2 8h6M9 15h6M16 10h6\"/>",[["8-bit 調光卓","sim8bit"],["16-bit 調光卓","sim16bit"]]],["signal","信号","<path d=\"M2 12h4l3-7 5 14 3-7h5\"/>",[["DMX通信列車","simdmx"],["DMXの通信速度","DmxSpeed.html"],["LED色混ぜ","ledcolormix"],["Scroller","scroller"],["Moving Head","movinghead"]]],["network","Network","<rect x=\"9\" y=\"2\" width=\"6\" height=\"5\" rx=\"1\"/><rect x=\"2\" y=\"17\" width=\"6\" height=\"5\" rx=\"1\"/><rect x=\"16\" y=\"17\" width=\"6\" height=\"5\" rx=\"1\"/><path d=\"M12 7v5M5 17v-5h14v5\"/>",[["IPアドレス","netipaddress"],["DMX on LAN","netartnet"],["Broadcast / Art-Net 1","netbroadcast"],["Multicast / sACN","netsacn"],["結線 / 冗長化","explain"]]],["history","照明史","<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 6v6l4 3\"/>",[["舞台照明史 Timeline","History.html"]]],["fixture","灯具","<path d=\"m4 7 12-3v16L4 17z\"/><ellipse cx=\"16\" cy=\"12\" rx=\"3\" ry=\"8\"/><path d=\"M6 17v4h8v-3\"/>",[["平凸レンズ","ConvexLens.html"]]],["shoot","シュート","<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 1v4M12 19v4M1 12h4M19 12h4\"/>",[["教材を準備中",null]]]];
  const root = document.getElementById('shared-console-header-root');
  if (!root) return;
  const file = location.pathname.split('/').pop() || 'Top.html';
  const isTop = file === 'Top.html';
  // Only navigation targets differ by page; geometry and markup are shared.
  const navigation = {
    'Analog.html': [null,'SinglePhase3.html'],
    'SinglePhase3.html': ['Analog.html','Waveforms.html'],
    'Waveforms.html': ['SinglePhase3.html',null],
    'ConvexLens.html': ['index.html',null],
    'PersonLighting.html': ['index.html',null],
    'DmxSpeed.html': ['Top.html?tab=simdmx',null]
  };
  const controls = (file === 'History.html' || file === 'HistoryMap.html')
    ? '<button class="next-ui-page-button" type="button" data-nav-target="index.html">⌂ TOP</button>'
    : isTop
      ? '<button class="next-ui-page-button" id="next-ui-prev" type="button">◀ 前</button><button class="next-ui-page-button" id="next-ui-next" type="button">次 ▶</button>'
      : (navigation[file] || [null,null]).map((target,i) =>
          '<button class="next-ui-page-button" type="button"'+(target ? ' data-nav-target="'+target+'"' : ' disabled')+'>'+(i ? '次 ▶' : '◀ 前')+'</button>'
        ).join('');
  root.outerHTML =
    '<header class="next-ui-header next-ui-console-header" aria-label="8bit図鑑 共通ナビゲーション">'+
      '<div class="next-ui-header-top">'+
        '<a class="next-ui-brand" href="index.html" aria-label="8bit Lighting Theatre トップへ"></a>'+
        '<nav class="next-ui-category-tabs" aria-label="教材の大分類"></nav>'+
        '<div class="next-ui-tools" aria-label="教材ページ移動">'+
          '<div class="next-ui-page-controls">'+controls+'</div>'+
        '</div>'+
      '</div>'+
    '</header>';
  const header = document.querySelector('body > .next-ui-console-header');
  header.querySelectorAll('[data-nav-target]').forEach(button => {
    button.addEventListener('click', () => { location.href = button.dataset.navTarget; });
  });
  const categoryForPage = {
    'Analog.html':'electric','SinglePhase3.html':'electric','Waveforms.html':'electric',
    'History.html':'history','HistoryMap.html':'history','ConvexLens.html':'fixture','PersonLighting.html':'fixture','DmxSpeed.html':'signal'
  };
  const activeCategory = isTop ? 'dimming' : (categoryForPage[file] || '');
  const brand = header.querySelector('.next-ui-brand');
  if (brand) {
    brand.setAttribute('aria-label','8bit Lighting Theatre トップへ');
    brand.replaceChildren();
    const img = document.createElement('img');
    img.src = 'assets/index/8bit-lighting-theatre-logo-c.svg';
    img.alt = '8bit Lighting Theatre';
    img.width = 530;
    img.height = 239;
    img.decoding = 'async';
    brand.append(img);
  }
  const nav = header.querySelector('.next-ui-category-tabs');
  if (!nav) return;
  nav.innerHTML = categories.map(([key,label,svg,lessons]) => {
    const active = key === activeCategory ? ' active' : '';
    const items = lessons.map(([title,target]) => {
      if (!target) return '<span class="pending">'+title+'</span>';
      const href = target.endsWith('.html') ? target : 'Top.html?tab='+encodeURIComponent(target);
      if (isTop && !target.endsWith('.html')) {
        return '<button type="button" data-lesson-key="'+target+'" role="menuitem">'+title+'</button>';
      }
      const selected = file === target ? ' class="active"' : '';
      return '<a'+selected+' href="'+href+'" role="menuitem">'+title+'</a>';
    }).join('');
    return '<div class="next-ui-category-menu" data-category-menu="'+key+'">'+
      '<button class="next-ui-category-tab'+active+'" type="button" data-category="'+key+'" aria-expanded="false">'+
      '<span class="next-ui-category-icon" aria-hidden="true"><svg viewBox="0 0 24 24">'+svg+'</svg></span>'+label+'</button>'+
      '<div class="next-ui-dropdown" role="menu">'+items+'</div></div>';
  }).join('');
  header.classList.add('next-ui-console-header');
})();
