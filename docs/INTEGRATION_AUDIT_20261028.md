# 8bit新UI 統合監査・修正台帳

2026年10月28日（日本時間）／対象：Phantom-Theatre88/8bit

## 結果と完成範囲

既存教材17件の入口、統合タブ11件、補助ページを一つの共通ナビへ接続し、重大な表示・詳細連動不具合を開発ブランチで修正した。図鑑全体の内容制作完了・最終LOCK・公開完了とはしない。歴史は古代中心の制作途中であり、後代の本文、候補カードの根拠照合、iPad実機確認が残る。

- 修正PR：[新UI図鑑の統合修正 #2](https://github.com/Phantom-Theatre88/8bit/pull/2)（Draft）。
- 開発ブランチ：`codex/integrate-encyclopedia-20261028`。
- 公開ブランチ：`main` のまま。GitHub Pagesの設定は `main` / `/`。マージ・公開変更は実施していない。
- 実ブラウザ：GitHub Actions上のChromium。1366×1024は表示領域の寸法でありiPad実機ではない。1366×900も確認しブラウザ操作部で高さが減る場合を補完した。

## 保存・ブランチ差分

| 対象 | 確認結果・扱い |
|---|---|
| main | 開始時 `175a8eb19380b8f57c0795403a55c2eb9f2a4d05`。これを基点に開発 |
| 保存版main | `archive/main-before-integration-20261028`。上記SHAをGitHubに保存 |
| feature/next-ui-refresh | `6f0716f4d5c361044e5212e74087b350ac78477e`。mainの祖先。main側674コミット、feature側固有0。再マージ不要 |
| 保存版next-ui | `archive/next-ui-before-integration-20261028`。上記SHAをGitHubに保存 |
| baseline/pre-next-ui-20260822 | 既存保存用参照を維持 |
| review/history-ancient-cards | 分岐後の固有コミット1件。現mainにも太陽光・ギリシャ劇場データが存在。古いHistory本体への置換は行わない。派生画像・クレジットの追加内容は採用候補として残す |
| preview/ancient-18-cards-20261017 | 固有コミット1件。候補18件は現mainにも存在するが未確定。正式完成扱いしない |
| refine-network-copy-v01 | 分岐後の固有コミット5件。mainにはその後のNetwork改修が多数あり、旧UI・旧文面の一括マージは行わない |
| legacy-ui/、next-ui/ | 履歴保存ディレクトリ。現在の正本はルートのHTML・共通資産。保存版は変更しない |

## 修正した問題

| ID | 問題 | 修正・検証 |
|---|---|---|
| F01 | Historyカードが配列用の `f[0]` 等を参照し、実データの本文・出典・先生を表示しない | `id` と `data` で連動。円陣の正面カード変更にも詳細を同期。該当なしでは前カードの本文・出典・リンクを消去 |
| F02 | Historyのタップがstageのポインター捕捉で失われる | タップとドラッグを分け、タップしたカードの選択を実行。円陣の密度・比率・Split-flap方式は維持 |
| F03 | ページごとにメニュー開閉処理が異なり、新規ページでは不足 | 共通ヘッダーで開閉・外側操作・Escを処理。旧ページ処理の二重発火を防止 |
| F04 | Esc後もhover/focus用CSSでメニューが見た目だけ残る | `.open` と表示状態を一致させ、全20画面で検証 |
| F05 | Top.htmlの前後移動リストに新DMX速度教材がなく、共通メニューと不一致 | 教材順序を共通定義から生成。HistoryMapにも共通メニューから到達可能にした |
| F06 | トップ背景が `assets/index/assets/index/...` へ解決され404 | 画像URLを画像と同じ階層のCSS定義にまとめ、テーマ画像を維持したまま修正 |
| F07 | 平凸レンズの3列比率が100%＋列間余白になり横はみ出し | メインと下段を比率付きfr列へ変更。内容・操作を維持 |
| F08 | 人物教材が390px幅で442pxにはみ出す | 見出し折返し、最小幅、先生欄の列幅を修正。人物教材自体は試作扱いを維持 |
| F09 | 波形教材の入口説明が「100V・200V・三相」でLOCKの教材範囲と不一致 | 「交流の波と50Hz／60Hzを見比べる」へ修正 |
| F10 | 太陽光本文・期間が古代のみへ縮小し、既存LOCKと不一致 | LOCKの導入本文とBC500頃〜AD1600頃を復元。1600年で利用終了という意味ではないことを明記。先生のLOCK文は維持 |
| F11 | UI検証用テーマ構図が歴史カードの正面に出る | 独立プレビューに残し、History本体の史実カード集合から除外。候補18件は【制作中】と明示 |
| F13 | 縦画面でHistoryの探索領域が高さ0へつぶれる | 共通フレームに探索専用の高さ制約を追加し、詳細欄38%を維持。探索領域の実寸を回帰検査へ追加。年代軸の重複ラベルも整理 |
| F12 | 歴史の小画面文字に9〜11px指定、写真とAI参考画像の区別・出典導線が不明瞭 | 該当px指定を12px以上へ。既存画像の説明を詳細に表示し、写真にはCREDITSへのリンクを追加。画像の再生成は行わない |

共通ヘッダー資産の更新番号も変更し、古いキャッシュと新しいTop.htmlの定義が混在する不具合を避けた。

## LOCKとの照合

参照した正本：`docs/8bit_LEARNING_LOCK.md`、`docs/8bit-lighting-theatre-brand-unification-v1.md`、`docs/history_timeline_LOCK.md`、`docs/history/History_UI_聖典.md`。これらの文書は変更していない。

| LOCK | 今回の扱い／残差分 |
|---|---|
| 初学者向け・用語説明から始める | 電気の説明順序・教材モデルを維持。全教材の教育内容の全面監修は今回のテスト範囲外 |
| 8-bit／16-bit採用構成 | フェーダー・比較・計算・既存詳細図の構成を維持。値連動とFine端を回帰検証 |
| 7分類・正式ロゴ・共通ヘッダー | 同一JS/CSSの正本を維持し、操作と教材一覧のずれを修正。9教材ページのヘッダー外寸は1366×1024で共通60px |
| 先生標準素材 | 既存透過SVGを継続。HistoryMapへ先生を追加しない |
| TOP回転ホイール・固定の右欄・採用画像 | 構造と画像を維持。7テーマの切替と右欄一致を検証 |
| History円陣・左Split-flap・詳細欄38% | 方式・密度・比率を維持。独立承認試作は原本のまま保存。今回の修正で本番最終承認を代替しない |
| 太陽光の総論・長い年代帯 | 本文と期間を復元。写真4系統のカルーセルは未実装 |
| 歴史データの根拠・確度 | 候補18件は仮配置のまま。新しい史実・年代・図版を推測で追加しない |
| タイムライン⇔劇場MAPの年代連携 | 未実装。`from` による戻り先指定はあるが年代は引き継がれない |
| 下部本文連続スクロール／先生固定 | 現Historyはパネル全体がスクロールし、先生常駐の厳密な要件に未達。次の限定改修対象 |
| 承認済み9テーマ小アイコン | 承認バイナリのGitHub保存が未完了のものがある。代替素材の生成・置換は行わない |

## 教材・統合タブ台帳

| 分類 | 教材 | 正本・入口 | 状態 |
|---|---|---|---|
| 電気 | V・W・Aの法則 | Analog.html | 既存教材、表示確認 |
| 電気 | 単相3線 | SinglePhase3.html | 既存教材、表示確認 |
| 電気 | 電気って波なの？ | Waveforms.html | 既存教材、表示・波形モデル検証 |
| 電気 | 三相3線 | なし | 準備中、リンクなしを維持 |
| 調光 | 8-bit 調光卓 | Top.html?tab=sim8bit | 既存LOCK、連動・比較を検証 |
| 調光 | 16-bit 調光卓 | Top.html?tab=sim16bit | 既存LOCK、計算・Fine端を検証 |
| 信号 | DMX通信列車 | Top.html?tab=simdmx | 表示・タブ切替確認 |
| 信号 | DMXの通信速度 | DmxSpeed.html | 表示・停止／再開・詳細を検証 |
| 信号 | LED色混ぜ | Top.html?tab=ledcolormix | 表示・タブ切替確認 |
| 信号 | Scroller | Top.html?tab=scroller | 表示・タブ切替確認 |
| 信号 | Moving Head | Top.html?tab=movinghead | 表示・タブ切替確認 |
| Network | IPアドレス | Top.html?tab=netipaddress | 表示・タブ切替確認 |
| Network | DMX on LAN | Top.html?tab=netartnet | 表示・タブ切替確認 |
| Network | Broadcast / Art-Net 1 | Top.html?tab=netbroadcast | 表示・タブ切替確認 |
| Network | Multicast / sACN | Top.html?tab=netsacn | 表示・タブ切替確認 |
| Network | 結線 / 冗長化 | Top.html?tab=explain | 表示・タブ切替確認 |
| 照明史 | 舞台照明史 | History.html | 動作修正済み、全時代の内容制作は未完 |
| 照明史 | 劇場MAP | HistoryMap.html | 補助教材、地図表示確認、年代連携未完 |
| 灯具 | 平凸レンズ | ConvexLens.html | 表示・横はみ出し修正 |
| シュート | シュート | なし | 準備中、リンクなしを維持 |
| 試作 | 人物の見え方 | PersonLighting.html | Top／Side／Back表示に未実装説明が残る。正式メニューへの採用は行わない |

## 歴史カード台帳

| 区分 | 項目 | 状態 |
|---|---|---|
| 既存主要項目 | 太陽光、古代ギリシャ劇場 | 詳細連動を修正。写真・本文の追加制作は残る |
| UI試作 | 光源・照明B案テーマ構図 | 独立プレビューに保存。歴史上の出来事として扱わない |
| 制作候補18件 | テアトロン／オルケストラ／スケネ／プロスケニオン／パロドス／プロエドリア／コロス／喜劇俳優／仮面／喜劇の衣裳／ディオニュソスと演劇／祭礼と劇場／市民と名誉制度／ギリシャからローマへ／舞台背景の描画パネル／客席と舞台の高低差／デルフィ劇場／デロス劇場 | 制作中表示。本文・図版・原文照合・正式採用は未完 |
| 後代 | 中世〜現代の光源・調光・信号・Network等 | LOCK上の計画は存在するが、現Historyの実カードには未制作 |

## 検証方法と実施範囲

- 対象20ビュー（TOP入口1＋独立教材・補助8＋統合タブ11）×4サイズ＝80画面。
- 1366×1024、1366×900、768×1024、390×844。
- JavaScript例外、HTTPエラー、表示画像、ページ全体の横はみ出し、直接タブ指定、共通メニューとEsc閉鎖、ローカルリンク先の存在。
- TOPの全7テーマと右欄の一致、統合タブの往復切替、表示中range操作の最小・最大・復元時の例外有無。
- 8-bitの6値・2表示の切替とビット合計、16-bitの7値・Coarse／Fine計算・4つの端／繰上がりケース。
- DMXの再生・停止・累計値・詳細表示。歴史の詳細本文・出典・先生・対象なし時の消去。
- 波形モデル：既存 `tests/wave-model.test.cjs`。共通ヘッダー9ページのDOM操作も補助確認。
- 全HTML39ファイルの静的参照を棚卸し。公開ルートと現教材に静的参照切れなし。保存用 `docs/history/backups/History-before-slide-change-20261019.html` の相対参照6件は移動前のままで、直接表示用としては壊れている。証跡原本として変更しない。

再実行：`npm ci` → `npx playwright install --with-deps chromium` → `npm test` → `npm run test:browser`。結果と画像は `test-results/` に出力。ブラウザ起動を許可する環境で実行する。

## 残課題・制作優先順位

| 優先 | 次工程 | 完了条件 |
|---|---|---|
| P1 | iPad Safari実機・実際のPCで操作確認 | タップ／スワイプ／Split-flap追従／画面の収まり／画像可読性を実機で確認。自動Chromium結果と別に記録 |
| P1 | Historyを制作物として仕上げる | 太陽光写真カルーセル、写真の作者・ライセンス表示、史料リンク、詳細拡大、本文連続スクロールと先生固定を実装し検証 |
| P1 | 18候補の出典原文照合 | 各カードの年代帯・地域・本文・図版・確度を確定し、制作中表示を外せる状態にする |
| P1 | タイムラインと劇場MAPの年代共有 | 両方向の遷移で選択年代を保持。地図の時代段階と連続年の対応を明示 |
| P2 | 全時代の歴史本文制作 | LOCKで計画された油灯・ろうそく・ガス・電球・記憶調光・DMX・Network等を根拠付きで制作。未制作を完成扱いしない |
| P2 | 人物教材の実装・採用判断 | プレースホルダー図を操作と連動する実表示にし、採用後に正式導線へ追加 |
| P2 | 三相3線・シュート | 新規教材として別途制作。現在の準備中項目にダミーリンクを作らない |
| P2 | 9テーマの承認画像を回収・登録 | 承認原本を確保し、透過・輪郭・小サイズ表示を検品。未承認画像で置換しない |
| P3 | 保存版・古いレイアウトテストの保守案内 | 正本と保存版の区別、旧テストのfooter前提を整理。原本証跡を維持 |

画面ごとの全ての文章・canvas図内の小文字・内部スクロール内の全項目・外部リンクの内容・史実・全ての入力組合せは、この自動テストだけで保証しない。Safari実機・ユーザー最終承認は未実施。

## 全HTML一覧（39ファイル）

| 種別 | パス | タイトル |
|---|---|---|
| 教材・入口 | `Analog.html` | 電気を見える化｜V・W・A / V・I・R |
| 教材・入口 | `ConvexLens.html` | 平凸レンズ｜8bit Lighting Theatre |
| 教材・入口 | `DmxSpeed.html` | DMX通信速度｜8bit Lighting Theatre |
| 試作・検証 | `History-depth-drift-test.html` | 照明史｜奥行き浮遊・呼び出し試験 |
| 試作・検証 | `History-drift-test.html` | 照明史｜10枚浮遊テスト |
| 試作・検証 | `History-dynamic-cards-test.html` | History 年代フェーダー×カード動的切替テスト |
| 試作・検証 | `History-integrated-ui-test.html` | History 時代×テーマ×歴史カード 統合テスト |
| 試作・検証 | `History-layout-preview.html` | 照明史｜STEP1 レイアウト検証 |
| 試作・検証 | `History-orbit-switch-test.html` | 照明史｜大判10枚・浮遊切替試験 |
| 試作・検証 | `History-rolodex-test.html` | History Rolodex 試作 |
| 試作・検証 | `History-slide-change-content-preview.html` | History 実データ統合 Slide Change 検証版 |
| 試作・検証 | `History-slide-change-test.html` | History Slide Change 動的カードテスト |
| 試作・検証 | `History-split-flap-test.html` | History Rolodex 試作 |
| 試作・検証 | `History-water-scrub-test.html` | 照明史｜水面浮遊・時間スクラブ試験 v2 |
| 試作・検証 | `History-xyz-float-isolated-test.html` | 歴史カード｜XYZ浮遊 独立テスト |
| 試作・検証 | `History-year-fader-test-v2.html` | History 連続年代フェーダー テスト v2 |
| 教材・入口 | `History.html` | 照明史｜8bit Lighting Theatre |
| 教材・入口 | `HistoryMap.html` | 古代劇場 地図モード｜8bit Lighting Theatre |
| 試作・検証 | `HistoryThemeBPreview.html` | 光源・照明 B案｜実装比較 |
| 試作・検証 | `HistoryThemePhotoReview.html` | 古代編・9テーマ代表写真の実物比較 |
| 教材・入口 | `PersonLighting.html` | 人物の見え方シミュレーター｜8bit Lighting Theatre |
| 教材・入口 | `SinglePhase3.html` | 電気を見える化｜単相3線 L1・N・L2 |
| 教材・入口 | `Top.html` | Integrated Lighting & Network Console Master Top |
| 教材・入口 | `Waveforms.html` | 電気って波なの？｜交流と50Hz・60Hzを知る |
| 保存証跡 | `docs/history/backups/History-before-slide-change-20261019.html` | 照明史｜8bit Lighting Theatre |
| 教材・入口 | `index.html` | 8bit Lighting Theatre｜舞台照明インタラクティブ図鑑 |
| 保存版 | `legacy-ui/Analog.html` | 電気を見える化｜V・W・A / V・I・R |
| 保存版 | `legacy-ui/SinglePhase3.html` | 電気を見える化｜単相3線 L1・N・L2 |
| 保存版 | `legacy-ui/Top.html` | Integrated Lighting & Network Console Master Top |
| 保存版 | `legacy-ui/index.html` | 新人向け 舞台照明インタラクティブ教材 |
| 保存版 | `next-ui/Analog.html` | 電気を見える化｜V・W・A / V・I・R |
| 保存版 | `next-ui/SinglePhase3.html` | 電気を見える化｜単相3線 L1・N・L2 |
| 保存版 | `next-ui/Top.html` | Integrated Lighting & Network Console Master Top |
| 保存版 | `next-ui/index.html` | 新人向け 舞台照明インタラクティブ教材 |
| 試作・検証 | `tests/analog-layout.html` | Analog レイアウト検証 |
| 試作・検証 | `tests/sim16-layout.html` | 16-bit layout and interaction checks |
| 試作・検証 | `tests/sim8-layout.html` | 8-bit layout checks |
| 試作・検証 | `tests/singlephase-layout.html` | SinglePhase3 レイアウト検証 |
| 試作・検証 | `tests/wave-layout.html` | Waveforms レイアウト検証 |
