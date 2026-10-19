// Coarse/Fine live lesson: two DMX bytes combine into one 16-bit value.
const Module_Sim16Bit = {
    dmx16Bit: 32832,
    getHTML() {
        const fader = (id, title, description, value) => `<section class="s16-fader-card ${id}">
          <h3>${title}</h3><p>${description}</p><output id="s16-${id}-value">${value}</output>
          <div class="s16-fader-row"><div class="s16-scale"><span>255</span><span>192</span><span>128</span><span>64</span><span>0</span></div>
          <input class="s16-vertical" id="s16-${id}" type="range" min="0" max="255" step="1" value="${value}" aria-label="${title}：${description}" orient="vertical">
          <div class="s16-step"><button data-s16-step="${id}:1" aria-label="${title}を1上げる">＋</button><button data-s16-step="${id}:-1" aria-label="${title}を1下げる">−</button></div></div></section>`;
        return `<div class="s16-page">
          <header class="s16-title"><h1>16-bit 調光卓</h1><p>大きく動かすCoarseと、細かく合わせるFine。</p><button id="s16-help-open">ⓘ 詳細説明</button></header>
          <main class="s16-workbench">
            <section class="s16-zone s16-input"><h2>① 大きく・細かく動かす</h2>
              <div class="s16-faders">${fader('coarse','Coarse','大きく調整',128)}${fader('fine','Fine','細かく調整',64)}</div>
              <div class="s16-master"><label for="s16-master">全体操作（Master）</label><output id="s16-percent">50.10%</output><input id="s16-master" type="range" min="0" max="65535" step="1" value="32832" aria-label="全体操作（Master）"><div class="s16-master-scale"><span>0%</span><span>100%</span></div></div>
            </section>
            <section class="s16-zone s16-center"><h2>② 1段の中を拡大して見る</h2>
              <div class="s16-overview"><h3><span class="s16-blue">Coarse</span>：大きな位置（256段階）</h3><div class="s16-ruler-labels"><span>0</span><span id="s16-selected">128</span><span>255</span></div><div class="s16-coarse-ruler" role="img" aria-label="Coarseの現在の段"><span id="s16-coarse-marker"></span></div></div>
              <div class="s16-zoom-link" aria-hidden="true"></div>
              <div class="s16-detail"><h3><span class="s16-green">Fine</span>：この1段を256段階に分ける</h3><div class="s16-fine-ruler" role="img" aria-label="選んだ1段の中のFine位置"><span id="s16-fine-marker"><b>今ここ</b><i></i></span></div><div class="s16-ruler-labels"><span>0</span><span>64</span><span>128</span><span>192</span><span>255</span></div></div>
              <div class="s16-formula"><span>16-bitの計算</span><div><b class="s16-blue" id="s16-calc-coarse">128</b> × 256 ＋ <b class="s16-green" id="s16-calc-fine">64</b> ＝ <strong id="s16-total">32,832</strong></div></div>
              <div class="s16-binary"><h3>2進数で見る（それぞれ8-bit）</h3><div class="s16-bytes"><div class="coarse"><div id="s16-coarse-bits" class="s16-bits"></div><p>Coarse（上位8-bit）</p></div><div class="fine"><div id="s16-fine-bits" class="s16-bits"></div><p>Fine（下位8-bit）</p></div></div></div>
            </section>
            <section class="s16-zone s16-light"><h2>③ 灯りを見る</h2><div class="s16-dark-room"><div id="sim16bit-ambient-glow" class="s16-ambient"></div><div class="s16-bulb"><img src="assets/Light.webp" alt="白熱電球"><div id="sim16bit-gas-glow" class="s16-gas"></div><div id="sim16bit-filament-glow" class="s16-filament"></div></div></div><div class="s16-readout"><span>16-bit値</span><strong id="s16-lamp-total">32,832</strong><span id="s16-light-state">点灯中</span></div><p class="s16-note">灯りは見た目のイメージ。</p></section>
          </main>
          <section class="s16-bottom"><section class="s16-zone"><h2>▤ 解説</h2><p><span class="s16-blue">Coarse</span>で、大きな位置を決める。</p><p><span class="s16-green">Fine</span>で、その中を細かく合わせる。</p></section>
            <section class="s16-zone s16-teacher"><img src="assets/wave_teacher_transparent.svg" alt="照明教材の先生"><div><h2>先生のひとこと</h2><p id="s16-teacher-message">Coarseを固定して、<br>Fineだけ動かしてみよう。</p></div></section>
            <section class="s16-zone"><h2>覚えておこう</h2><p>8-bit：<b>256段階</b><br>16-bit：<b>65,536段階</b></p><p>DMXの2つの値を組み合わせる。</p></section></section>
          
          <dialog id="s16-help-dialog" aria-labelledby="s16-help-title"><div class="s16-help-heading"><h2 id="s16-help-title">16-bitの詳細説明</h2><button id="s16-help-close" aria-label="詳細説明を閉じる">閉じる ×</button></div><p>大きく／細かく調整するしくみの説明図です。図の数値と距離の単位はたとえで、操作中の現在値ではありません。</p><img src="assets/16bit_coarse_fine_infographic.webp" alt="Master、Coarse、Fineの関係と上位・下位8-bitを説明するイラスト"></dialog>
        </div>`;
    },
    init() {
        this.destroy();
        const root=document.querySelector('.s16-page'); if(!root)return;
        this.abort=new AbortController(); const opts={signal:this.abort.signal};
        for(const id of ['master','coarse','fine'])root.querySelector('#s16-'+id).addEventListener('input',e=>this.setValue(id,Number(e.target.value)),opts);
        root.querySelectorAll('[data-s16-step]').forEach(b=>b.addEventListener('click',()=>{const [id,delta]=b.dataset.s16Step.split(':');this.adjustFaderValue(id,Number(delta));},opts));
        const dialog=root.querySelector('#s16-help-dialog');
        root.querySelector('#s16-help-open').addEventListener('click',()=>dialog.showModal(),opts);
        root.querySelector('#s16-help-close').addEventListener('click',()=>dialog.close(),opts);
        dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}},opts);
        this.updateSystem();
    },
    destroy(){this.abort?.abort();document.querySelector('#s16-help-dialog')?.close();},
    setValue(id,value){
        const v=Math.round(Number(value));if(!Number.isFinite(v))return;
        if(id==='master')this.dmx16Bit=Math.max(0,Math.min(65535,v));
        else if(id==='coarse')this.dmx16Bit=Math.max(0,Math.min(255,v))*256+(this.dmx16Bit%256);
        else if(id==='fine')this.dmx16Bit=Math.floor(this.dmx16Bit/256)*256+Math.max(0,Math.min(255,v));
        this.updateSystem();
    },
    adjustFaderValue(id,delta){
        if(id==='coarse')this.setValue(id,Math.floor(this.dmx16Bit/256)+delta);
        else this.setValue('master',this.dmx16Bit+delta);
    },
    resizeCanvas(){},
    updateSystem(){
        const root=document.querySelector('.s16-page');if(!root)return;
        const c=Math.floor(this.dmx16Bit/256),f=this.dmx16Bit%256,total=this.dmx16Bit.toLocaleString('en-US');
        const set=(id,value)=>root.querySelector('#'+id).textContent=value;
        for(const [id,v]of [['master',this.dmx16Bit],['coarse',c],['fine',f]])root.querySelector('#s16-'+id).value=v;
        set('s16-coarse-value',c);set('s16-fine-value',f);set('s16-percent',(this.dmx16Bit/65535*100).toFixed(2)+'%');
        set('s16-selected',c);set('s16-calc-coarse',c);set('s16-calc-fine',f);set('s16-total',total);set('s16-lamp-total',total);
        root.querySelector('.s16-center').style.setProperty('--coarse-pos',((c+.5)/256*100)+'%');
        root.querySelector('.s16-center').style.setProperty('--fine-pos',(f/255*100)+'%');
        root.querySelector('#s16-fine-marker b').style.transform=f<24?'translateX(0)':f>231?'translateX(-100%)':'translateX(-50%)';
        root.querySelector('.s16-coarse-ruler').setAttribute('aria-label',`Coarse：256段階のうち${c}の段`);
        root.querySelector('.s16-fine-ruler').setAttribute('aria-label',`Coarse ${c}の段の中のFine ${f}`);
        for(const [id,value]of [['coarse',c],['fine',f]])root.querySelector('#s16-'+id+'-bits').innerHTML=value.toString(2).padStart(8,'0').split('').map(bit=>`<span class="${bit==='1'?'on':''}">${bit}</span>`).join('');
        root.querySelectorAll('[data-s16-step]').forEach(b=>{const[id,ds]=b.dataset.s16Step.split(':'),delta=Number(ds);b.disabled=id==='coarse'?(delta<0?c===0:c===255):(delta<0?this.dmx16Bit===0:this.dmx16Bit===65535);});
        set('s16-light-state',this.dmx16Bit===0?'消灯':this.dmx16Bit===65535?'最大の指示':'点灯中');
        this.updateBulb(this.dmx16Bit/65535,this.dmx16Bit/65535);
    },
    updateBulb(factor){
        const root=document.querySelector('.s16-page');
        const gas=root.querySelector('#sim16bit-gas-glow'),filament=root.querySelector('#sim16bit-filament-glow'),ambient=root.querySelector('#sim16bit-ambient-glow');
        gas.style.opacity=String(factor);ambient.style.opacity=String(factor);
        filament.style.opacity=factor===0?'0':String(.15+.85*factor);
        const color=`rgb(255,${Math.round(40+205*factor)},${Math.round(110*factor)})`;
        filament.style.background=color;filament.style.boxShadow=`0 0 ${8+factor*28}px ${color}`;
    }
};
