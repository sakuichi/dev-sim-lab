# dev-sim-lab 引き継ぎ書 (CLAUDE.md)

このファイルは、モデルやセッションが変わっても同じ品質・同じ手順でテーマを追加し続けるための引き継ぎ書です。作業前に必ず全体を読んでください。

## サイト概要

- **開発あるある図鑑 / Dev Sim Lab**: ソフトウェア開発の「あるある」(誤解・認知バイアス・経験則)を、経営層やステークホルダーにも伝わるインタラクティブなシミュレーターで体験できるシリーズ。
- 公開先: https://sakuichi.github.io/dev-sim-lab/ (GitHub Pages、masterへのpushで自動デプロイ)
- 完全静的サイト。ビルド工程なし。vanilla HTML/CSS/JS のみ。フレームワーク・npm依存の導入は禁止。
- 全ページ日英バイリンガル(JA/EN)。テーマは1ページ=1つの問い=1つのシミュレーター。

## リポジトリ構成

```
index.html              … トップページ(今日のあるある + カード一覧)
<slug>/index.html       … 各テーマページ(全コードをこの1ファイルに内包)
assets/common.css       … 共有スタイル(.console/.assess/.controls/.sim-card等)
assets/common.js        … 共有基盤。SIMS配列(全ページの台帳)・RELATED(関連ページの手動マップ)・
                          CHROME(ヘッダ/フッタ文言)・renderShare/renderRelated/initChrome
assets/ogp/<slug>.png   … OGP画像(scripts/generate-ogp.pyで生成)
scripts/check-i18n-keys.js … JA/EN辞書のキー整合性チェッカー
scripts/generate-ogp.py    … OGP画像生成(要Pillow)
sitemap.xml
```

**SIMSが唯一の台帳**: トップのカード一覧・今日のあるある・全テーマ数の表示・各ページの関連セクションは、すべて `assets/common.js` の `SIMS` から描画される。新ページはここに登録するだけでトップに自動で載る。

## 新テーマ追加の標準パイプライン(この順番を守る)

1. **理論の裏取り** — ページが依拠する研究・出典をWebSearchで検証してからコピーを書く。
   - 反証や論争がある主張(例: Boehmのコスト曲線)は、本文で明示的にヘッジする。注記に埋めず、目立つ位置に書く。
   - モデルの数式が演出(独自の簡易モデル)なのか実証値なのかを、chartNoteで必ず区別して明記する。
   - 提案されたテーマに複数のメカニズムが混ざっていないか確認する(例: オンボーディングと個人差、心理的安全性と発言コストは別ページに分割した)。混ざっていたら分割を提案し、ユーザーの確認を待つ。
2. **センシティブ判定** — 個人の適性・競争力・失敗に触れるテーマは、文の主語を常に「方法・組織・プロセス」にし、読者が自己診断できる表現を避ける。ページ冒頭に目立つ免責を置く(例: survivorship-bias の .disclaimer)。
3. **ページ作成** — 既存ページ(新しめの bikeshedding / rubber-duck / confirmation-bias あたり)をテンプレートとして踏襲。構成要素は後述の「ページの解剖図」参照。
4. **機械検証(ブラウザを開く前に全部通す)**:
   ```powershell
   # PATHは毎回このおまじないが必要
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   # i18nキー整合性
   node scripts/check-i18n-keys.js <slug>/index.html
   # インラインscriptの構文チェック(最後の<script>を抽出。UTF8で書き出すこと)
   $content = Get-Content <slug>/index.html -Raw -Encoding UTF8
   $m = [regex]::Matches($content, '(?s)<script(?![^>]*\ssrc=)[^>]*>(.*?)</script>')
   [System.IO.File]::WriteAllText("$scratch\inline.js", $m[$m.Count-1].Groups[1].Value, [System.Text.Encoding]::UTF8)
   node --check "$scratch\inline.js"
   ```
5. **境界値テスト** — モデルの純関数をコピーした使い捨てNodeスクリプトを書き、端点値・単調性・不変量(和が一定、スコア範囲0-100、tierの全帯域到達など)を検証。ALL PASSまで先に進まない。
6. **登録** — (a) `SIMS` 末尾にエントリ追加、(b) `RELATED` に新ページの関連3件を追加し、既存ページのどれかからも新ページを参照させる(孤立させない)、(c) `sitemap.xml` のprivacyの直前に`<url>`追加、(d) OGP生成:
   ```powershell
   python scripts/generate-ogp.py <slug> --title "<JAタイトル>" --subtitle "<JA一行説明>" --eyebrow "DEV SIM LAB"
   ```
7. **ブラウザ確認** — localhostサーバーを立て(`python -m http.server 8000` をリポジトリ直下でバックグラウンド起動)、ヘッドレスEdgeでスクリーンショットを撮って自分の目で確認する:
   ```powershell
   cmd.exe /c "`"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`" --headless --disable-gpu --screenshot=`"<out>.png`" --window-size=1280,1800 http://localhost:8000/<slug>/ > log 2>nul"
   ```
   - JA(`/<slug>/`)・EN(`?lang=en`)・モバイルの3点。
   - **モバイルは直接 --window-size=390 で撮ってはいけない**(偽の水平カットが出る)。幅390-430pxのiframeで対象を包んだ診断用HTMLをscratchpadに作り、それを撮る。
8. **書籍** — 実在する本のみ。WebSearchでISBNまで確認してから候補提示。新しめ・現役で新品が買える本を優先。JA/EN各1冊(または文脈次第でJA2冊)。
   - アフィリエイトリンクは**ユーザーがSiteStripeで生成する**。こちらは素のAmazon URL(`https://www.amazon.co.jp/dp/<ISBN>` 等)を提示して依頼する。
   - 受け取ったamzn.toリンクは挿入前に必ず検証する:
     ```powershell
     (Invoke-WebRequest -Uri <amzn.to> -MaximumRedirection 10 -UseBasicParsing -Headers @{ "User-Agent" = "Mozilla/5.0" }).BaseResponse.ResponseUri
     ```
     期待ISBN・期待ドメインに解決されること(JAはamazon.co.jp/タグ20306-22、ENはamazon.com/タグqcdtradeoff-20)。
   - 既出の本はリンク再利用可(過去の使用例: ファスト&スロー、達人プログラマー、認知バイアス事典、恐れのない組織)。
9. **レビュー儀式(必須)** — スクリーンショットを見せたうえで、必ず次の3点を聞く:
   1. commitしていいか / 2. 改善したい箇所があるか / 3. その他
   **自動チェックが全部通っていても、ユーザー自身の確認なしにcommitの許可を求めない・commitしない。**
10. **コミット** — ユーザーの明示的なOK後のみ。コピー修正をした場合は再チェック(手順4)を回してからコミット。

## ページの解剖図(全ページ共通の構造)

- `<head>`: title/description/canonical/OGP/JSON-LD(WebApplication)/Googleフォント(IBM Plex Sans JP + IBM Plex Mono)/common.css/ページ専用`<style>`
- `<header>`: 言語スイッチ、`heroTitle`(疑問文タイトル、`<br>`可)、`heroLead`(出典エピソードから始まる導入文)
- `.console`: SVGチャート+凡例+chartCaption(グラフの読み方)+chartNote(モデルの限界・ヘッジ)+(必要なら).scenario-box+2枚の.tier-card+hint+.assess(スコア)+.controls(axis-card×2: スライダー+数値入力)+.actions(リセット+シナリオ/実例ボタン)
- share / secAdvice(現実にはどう向き合うか: intro+箇条書き4件) / 書籍 / 関連する問題 / footer
- スクリプト構造: モデル純関数(先頭のコメントブロックに出典と限界を書く) → `I18N = {ja:{...}, en:{...}}` → `DEV`(開発者モードの上書き辞書: hint/hintScenario/commentsのみ差し替え) → `T()` → チャート描画 → render → applyStaticText → イベント → ドラッグ処理 → `DevSimLab.initChrome`

### デザイン・UXの約束事

- チャートは**直近のページとスタイルをずらす**(交差2本線・積み上げ面・階段・S字・下降線+基準点線・対数軸などを使い分け)。マーカーは縦線ドラッグ+チャート上に値ラベル(範囲を示すときは**上端と下端に〇**。中央〇は使わない)。
- 値が動的にスケールすると分かりやすい場合はY軸を動的に(グリッド線1本=意味のある単位、の形が理想。例: xy-problemは1往復、hofstadters-lawは見積もり1個ぶん)。
- 抽象的なパーセンテージだけのモデルには`.scenario-box`(スライダー帯域ごとの具体的状況文)を付ける。
- スコアは原則0-100で最適化可能に。ただしテーマ自体がそれを裏切る場合は例外可(hofstadters-lawはスコア常時63が仕掛け)。
- 開発者モード(DEV辞書)のジョークは自虐・あるある系で。特定の役職や個人を馬鹿にする表現は不可。
- 数値表記: JAは「1倍」「60分」「24.0日」のように単位まで日本語。"1x"のような英語式は使わない。

### コピーの約束事

- タイトルは疑問文(「〜、なぜ〜?」「〜は正しい?」)。
- heroLeadは検証済みの出典エピソード(年号・人名込み)から始め、最後に「〜を動かして確認してください」で操作へ誘導。
- chartNoteには必ず「これは方向性を示す簡易モデルで実証値ではない」旨+実話・実測部分との区別を書く。
- adviceIntroは研究の含意→現実の対策、adviceItemsは実行可能な4項目。

## トップページ(index.html)の特殊要素

- **今日のあるある**: 日付(YYYYMMDD)シードの決定的選択 `(seed*48271)%2147483647 % live.length`。専用シェアボタンのテキストは「今日のあるあるは「{title}」です。今日もこれに気をつけていきましょう!」。
- 一覧見出しのテーマ数は `SIMS.filter(s=>s.status==="live").length` で自動算出。手動更新禁止。

## Windows/PowerShell 固有の罠(全部実際に踏んだもの)

- PATHは**毎回のPowerShell呼び出しで**再エクスポートしないとgit/node/pythonが見つからない。
- `git commit -m` のメッセージ本文に二重引用符のネストがあるとpathspecエラーで壊れる。メッセージは引用符なしの平文にする。
- PowerShell 5.1: `&&`/`||`は使えない。ファイル書き出しはUTF-16 LEがデフォルトなので、nodeに読ませるものは必ずUTF8指定(`[System.IO.File]::WriteAllText(..., [System.Text.Encoding]::UTF8)`が確実)。
- `Get-Content`には`-Encoding UTF8`を付けないと日本語が化けて`node --check`が偽の構文エラーを出す。
- ヘッドレスEdge: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`。`cmd.exe /c "... > log 2>nul"`でリダイレクトする。
- localhostサーバーはバックグラウンド起動し、ページ出荷後に停止する。

## コミット規約

- 形式: 英語1行 `Add <slug> simulator (<出典キーワード>)` / 修正は内容を平叙で。`--no-verify`等の迂回禁止。ユーザーOK前のcommit/push禁止。

## 既知のバックログ(ユーザーと合意済みの候補)

- 90-90ルール(Tom Cargill / Programming Pearls 1985)
- パーキンソンの法則本体「仕事は与えられた時間いっぱいに膨張する」(1957、bikesheddingと同じ本)
- チェスタトンのフェンス(G.K. Chesterton, The Thing, 1929)

過去の全ページの出典・モデル・経緯の詳細は、Claude Codeのメモリ(`project_dev_sim_lab.md`ほか)にもあるが、このファイルだけで作業を開始できるように書いてある。矛盾があればこのファイルとリポジトリの実装を正とする。
