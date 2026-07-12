# 残り5テーマの実装設計書 (No.27〜No.31)

このファイルは、fable5セッションで**調査・設計まで完了させた**残り5テーマの実装仕様書です。実装者(Sonnet/Opus/fable5いずれでも)は、**CLAUDE.mdの標準パイプラインに従い**、この設計をもとに1テーマずつ実装してください。出典はすべて2026-07-13時点でWebSearch検証済みです(コピーを設計の範囲を超えて拡張する場合は再検証すること)。

共通事項:
- 実装順 = 図鑑No.順(下記の順にSIMS末尾へ追加): 27→28→29→30→31
- 書籍のISBNは設計時点の候補。**実装時に再検索で現物確認**し、ユーザーに素のAmazon URLを提示してamzn.toリンクを依頼→検証→挿入(CLAUDE.md手順8)
- モデル定数は設計値。境界値テストは各節の「テスト要件」を満たすこと。微調整した場合はテストも合わせて更新
- チャートは各節で指定した形式を使う(直近ページとの見た目の重複を避ける設計になっている)

---

## No.27 定量化の罠 (slug: `quantification-trap`, cat: `team`)

**タイトル**: JA「数字で見えるものだけを、見ていない?」 / EN "Are you only seeing what the numbers show?"
**名前**: 定量化の罠シミュレーター / Quantification Trap Simulator
**タグ**: ja:["定量化の罠","指標"] en:["Quantification trap","Metrics"]

**出典(検証済み)**:
- マクナマラの誤謬(McNamara fallacy)。有名な4段階の引用「第一段階は、簡単に測れるものを測ること。ここまではよい。第二段階は、簡単に測れないものを無視するか、恣意的な数値を与えること。これは人為的で誤解を招く。第三段階は、簡単に測れないものは重要でないと考えること。これは盲目である。第四段階は、簡単に測れないものは存在しないと言うこと。これは自殺である」——**真の出典はDaniel Yankelovich (1972, "Corporate Priorities"。1971年のSales Management誌記事が先行)**。Charles Handyが『The Empty Raincoat』(1994)で引用した際に**McNamara本人の言葉と誤帰属**し、その名で広まった。この誤帰属の経緯はヘッジとしてページに明記する(それ自体が面白い)
- ベトナム戦争でのMcNamara国防長官のボディカウント偏重が名前の由来(こちらは史実として通説)
- 開発文脈への適用(行数・ベロシティ・カバレッジ偏重)はこのページの独自の敷衍であることを明記

**モデル**(2スライダー):
- 操作1 `dep`: 定量指標への依存度 0-100, step5, 初期40
- 操作2 `hidden`: 測りにくい価値の割合 10-70%, step5, 初期40 (品質・信頼・学習・保守性など、短期の数字に出ない価値)
- `apparentOf(dep) = 40 + dep * 0.55` (数字上の見かけの成果。単調増加——数字だけ見ると改善し続ける)
- `actualOf(dep, hidden) = 45 + 0.5*dep - (dep*dep/100) * (hidden/100) * 1.5` (実際の総合成果。**逆U字**: 適度な定量化は成果を上げるが、依存しすぎると測れない価値の毀損が上回る)
  - ピーク位置 dep* = 2500/(1.5*hidden) 。hidden=40でdep*≈42、hidden=70でdep*≈24、hidden=20でdep*≈83(隠れ価値が少ないほど定量化してよい、という含意が出る)
- `illusionOf = apparent - actual` (数字と実態の乖離=幻想の大きさ)
- `scoreOf = round(actualの0-100正規化)`: min/max はグリッド全域から実装時に算出して固定値で正規化
- tier: actualの5帯域。scenario-boxは依存度の帯域で「会議で何が起きているか」を5段階(例: 帯域4「ダッシュボードは全部緑。なのに顧客は静かに離れている」)

**チャート**: X=依存度、緑線=実際の総合成果(**逆U字——このサイト初のカーブ形状**)、赤線=数字上の見かけの成果(単調増加)。2本の乖離が「幻想」。マーカードラッグ+両線に値ラベル
**シナリオボタン**: 「シナリオ: ダッシュボードがすべて緑の職場」dep=90
**アドバイス**: 定量・定性のバランス評価。定性情報の定例化(顧客の生の声、現場ヒアリング)、指標は「意思決定の入力」であって「目的」ではない、Yankelovichの4段階を点検リストとして使う
**書籍候補**: JA「測りすぎ——なぜパフォーマンス評価は失敗するのか」(ジェリー・ミュラー、みすず書房、ISBN候補 4622087936 要確認) / EN "The Tyranny of Metrics" (Jerry Z. Muller, ISBN候補 0691191913 要確認)
**RELATED**: quantification-trap → ["survivorship-bias","confirmation-bias","utilization-trap"]。被参照: survivorship-bias のリストの3件目(skill-variance)を quantification-trap に差し替え
**テスト要件**: apparent単調増加 / actualが指定hiddenでピークを持つ(hidden=20では0-100内で単調増加になることも確認) / illusion≧0となる領域の確認(低depでactual>apparentになり得る——それは「数字に出ていない健全さ」なので、カード表示は差の絶対値でなく符号を保つ) / score 0-100 / 全tier到達

---

## No.28 顧客が本当に必要だったもの (slug: `tire-swing`, cat: `cognition`)

**タイトル**: JA「仕様どおり完成したのに、なぜ喜ばれない?」 / EN "Built exactly to spec — so why is nobody happy?"
**名前**: タイヤのブランコ・シミュレーター / Tire Swing Simulator
**タグ**: ja:["要求分析","顧客"] en:["Requirements","Customer"]

**出典(検証済み)**:
- 「木にぶら下がったブランコ」風刺画。**最古の記録はロンドン大学計算センター(ULCC)のニュースレター#53、1973年3月**。作者不詳で、1960年代末から非公式に流通していたとみられる。以後IBMの研修資料やシステム分析の教科書で世界中に拡散。最終コマ「顧客が本当に必要だったもの」=タイヤのブランコ
- 真面目な背骨: Brooks "No Silver Bullet" (1987)の「ソフトウェア構築で最も難しいのは、何を作るかを正確に決めることである」(実装時に原文を再確認して引用)
- XY問題(No.22)との棲み分けを本文に明記: XY問題=質問者が手段を聞く(社内Q&A)、本ページ=顧客が「自分で考えた仕様」を要求として持ち込む(要求分析)。顧客の仕様は「顧客が考えた最強の仕様」であり、課題から掘り直すともっと良い解(開発不要を含む)があり得る

**モデル**(2スライダー):
- 操作1 `dig`: 要求の裏の課題を掘る度合い 0-100, step5, 初期30 (0=仕様を受け取ってそのまま実装、100=「そもそも何にお困りですか」から始める)
- 操作2 `artic`: 顧客が課題を言語化できている度合い 20-80, step5, 初期50
- `specDoneOf() = 95` (定数!「仕様どおりの完成率」——掘っても掘らなくても仕様は完成する)
- `solvedOf(dig, artic) = 0.9 * (artic + (dig/100) * (100-artic) * 0.85)` (本来の課題の解決度%)
  - dig=0: artic×0.9(顧客の言語化精度なりにしか解決しない)。dig=100: artic=20でも約81%まで回復
- `scoreOf = round(solved)` / tier: solvedの5帯域
- scenario-box(digの帯域で5段階): 「仕様書を受領、そのまま実装開始。質問は納期の確認のみ」→…→「『その仕様で解決したい課題』から確認。開発しない選択肢も含めて提案している」

**チャート**: 緑の点線=仕様どおりの完成率(**95%で真っ平ら——完成はする、というオチ**)、赤実線=本来の課題の解決度(digで上昇、articで底上げ)。フラット線と可変線の対比はサイト初
**シナリオボタン**: 「シナリオ: 『とにかくこれを実装してくれ』」dig=0
**センシティブ注意**: 顧客を愚かに描かない。「言語化の難しさは顧客の能力の問題ではなく、課題と解決策の翻訳がそもそも難しい」(木のブランコ風刺画も全職種が誤解する構図)を明記
**書籍候補**: JA「ジョブ理論」(クレイトン・クリステンセン、ハーパーコリンズ、ISBN候補 4596551227 要確認) / EN "The Mom Test" (Rob Fitzpatrick, ISBN候補 1492180742 要確認)
**RELATED**: tire-swing → ["xy-problem","curse-of-knowledge","qcd-tradeoff"]。被参照: xy-problem のリスト3件目(speak-up-cost)を tire-swing に差し替え
**テスト要件**: solvedが両操作で単調増加 / dig=0でsolved=0.9*artic / 上限95未満(specDone=95との交差なし、漸近) / artic=80,dig=100でsolved≈87 / 全tier到達

---

## No.29 バス係数 (slug: `bus-factor`, cat: `team`)

**タイトル**: JA「あの人が1週間休んだら、開発は止まる?」 / EN "If that one person takes a week off, does development stop?"
**名前**: バス係数シミュレーター / Bus Factor Simulator
**タグ**: ja:["属人化","ナレッジ共有"] en:["Bus factor","Knowledge sharing"]

**出典(検証済み)**:
- バス係数/トラック係数: 「チームの何人がバスに轢かれたら(=突然離脱したら)プロジェクトが立ち行かなくなるか」という開発者フォークロア由来の指標
- 実証: **Avelino et al. 2016 ("A Novel Approach for Estimating Truck Factors", GitHub人気133プロジェクト)——65%がTF≤2(46%がTF=1、28%がTF=2)、TF>10は10%未満**。数字はこのまま引用可
- 「バスに轢かれる」という表現は縁起が悪いので、本文では「宝くじが当たって退職」「長期休暇」など穏当な言い換えも添える(英語圏でも lottery factor と言い換える慣習がある)

**モデル**(2スライダー):
- 操作1 `share`: 知識共有の実践度 0-100, step5, 初期30 (ドキュメント・ペア作業・ローテーションの度合い)
- 操作2 `team`: チーム人数 3-12, step1, 初期6
- `busFactorOf(share, team) = max(1, min(team, round(1 + (team - 1) * (share/100) * 0.6)))` (share=0でも1、share=100でチームの約6割が代替可能)
- `stopProbOf(n, share, team)`: n人が同時に離脱したとき開発が停止する確率。`n < busFactor` なら `5 + n*5`(小さなリスク)、`n >= busFactor` なら `min(95, 60 + (n - busFactor) * 15)`(急上昇)
- サムラベル: バス係数(=何人抜けたら止まるか)
- `scoreOf = round((busFactor - 1) / (team - 1) * 100)` (1人依存=0点、全員代替可能=100点) / tier: scoreの5帯域
- scenario-box(shareの帯域): 「デプロイ手順はあの人の頭の中にだけある」→…→「誰が休んでも、ドキュメントとペア履歴で翌日から引き継げる」

**チャート**: X=同時に離脱する人数(0〜5)、Y=開発が停止する確率。**階段状に急上昇する棒グラフ or ステップ線**(バス係数の位置で崖ができる)。shareを上げると崖が右に動くのが見どころ。マーカーは離脱人数をドラッグ
**シナリオボタン**: 「シナリオ: エース1人にすべてを任せた職場」share=0, team=6
**センシティブ注意**: 属人化した本人を責めない。主語は「知識の置き場所」「チームの仕組み」。エース個人は組織の資産であり、問題は組織がその知識を1か所にしか置いていないこと、と明記
**書籍候補**: JA「Googleのソフトウェアエンジニアリング」リンク再利用可(chestertons-fenceで使用済み、ナレッジ共有の章がある) or 新規で「チームトポロジー」(ISBN候補 4820729632 要確認) / EN "Software Engineering at Google" リンク再利用
**RELATED**: bus-factor → ["onboarding-ramp","pause-cost","brooks-law"]。被参照: onboarding-ramp のリスト3件目(curse-of-knowledge)を bus-factor に差し替え
**テスト要件**: busFactorが両操作で単調非減少 / share=0で常に1 / busFactor≦team / stopProbがn=busFactorで不連続に跳ねる / score: share=0で0・share=100で最大 / 全tier到達

---

## No.30 90-90ルール (slug: `ninety-ninety`, cat: `planning`)

**タイトル**: JA「進捗90%です(先週も、先々週も)」 / EN "We're 90% done (same as last week, and the week before)"
**名前**: 90-90ルール・シミュレーター / Ninety-Ninety Rule Simulator
**タグ**: ja:["進捗報告","見積もり"] en:["Progress reporting","Estimation"]

**出典(検証済み)**:
- 「コードの最初の90%は開発期間の最初の90%を消費する。残りの10%のコードが、もう一つの90%を消費する」——**Tom Cargill(ベル研)**の言葉として、**Jon BentleyのCACM 1985年9月号のBumper-Sticker Computer Scienceコラム**(Programming Pearls連載)で紹介され広まった。当初はRule of Credibilityと呼ばれたが定着せず
- ホフスタッターの法則(No.24)との棲み分け: ホフスタッター=見積もり全体の自己言及的超過、本ページ=**進捗報告の非線形性**(報告される「90%」に残作業の大半が隠れている)。関連ページとして相互参照

**モデル**(2スライダー+チャートドラッグ):
- 操作1 `elapsed`: 経過時間 0〜180(当初見積もり比%), step5, 初期90 ——チャートマーカーと連動
- 操作2 `lastMile`: 最後の10%の重さ 0.5〜2.0, step0.1, 初期1.0 (統合・エッジケース・磨き込みの密度。1.0でCargillの言う「もう一つの90%」)
- `progressOf(elapsed, lastMile)`: elapsed≦90 → `progress = elapsed`(報告進捗は順調に伸びる)。elapsed>90 → `progress = 90 + 10 * (elapsed - 90) / (90 * lastMile)`、上限100
- `totalTimeOf(lastMile) = 90 + 90 * lastMile` (完了に必要な実時間。lastMile=1.0で180%=当初見積もりの1.8倍)
- `remainingAt90Of(lastMile) = 90 * lastMile` (報告90%時点の実際の残り時間——サムラベルに使う)
- `scoreOf(elapsed, lastMile) = round(progressOf(...))`? ではなく「報告進捗の信頼度」: `scoreOf = round(100 * elapsed / totalTime)` (実際の完了率)。報告90%時点でスコア50、という乖離が見どころ
- カード: 「報告される進捗」vs「実際の完了率」(=elapsed/totalTime)。**報告90%のとき実際は50%**、が最大のオチ
- tier: 報告進捗と実完了率の乖離幅の5帯域

**チャート**: X=経過時間(0〜180%)、Y=進捗(%)。赤線=報告される進捗(90まで直線で急上昇→そこから100に向けて長い平坦)、緑の点線=実際の完了率(elapsed/totalTimeの直線)。**「90%で寝る」平坦部分**が視覚の主役。マーカーは経過時間をドラッグ
**シナリオボタン**: 「シナリオ: 3週連続『進捗90%』の定例」elapsed=90
**開発者モードのネタ方向**: 「進捗90%。ここから3か月90%のまま」「残り10%の内訳: 統合、テスト、例外処理、そして本物の10%」
**書籍候補**: JA「熊とワルツを——リスクを愉しむプロジェクト管理」(トム・デマルコ、日経BP、ISBN候補 4822281868 要確認、入手性も確認) or ピープルウエア。入手性が悪ければ「アジャイルな見積りと計画づくり」(マイク・コーン)も候補 / EN "The Mythical Man-Month" 再利用可否確認(brooks-lawページで使用済みのはず→リンク再利用)
**RELATED**: ninety-ninety → ["hofstadters-law","estimation-uncertainty","technical-debt"]。被参照: hofstadters-law のリスト3件目(bikeshedding)を ninety-ninety に差し替え
**テスト要件**: progressが90到達までelapsedと等しい / elapsed>90で傾きが1/lastMileに低下 / totalTimeでprogress=100ちょうど / lastMile=1.0のとき報告90%時点の実完了率=50% / score単調増加 / 全tier到達

---

## No.31 コンウェイの法則 (slug: `conways-law`, cat: `team`)

**タイトル**: JA「システムの形が、組織図とそっくりなのはなぜ?」 / EN "Why does your architecture look exactly like your org chart?"
**名前**: コンウェイの法則シミュレーター / Conway's Law Simulator
**タグ**: ja:["コンウェイの法則","組織設計"] en:["Conway's law","Org design"]

**出典(検証済み)**:
- **Melvin Conway, "How Do Committees Invent?", Datamation, 1968年4月**。「システムを設計する組織は、その組織のコミュニケーション構造をコピーした設計を生み出すよう制約される」
- 実証1: **ハーバード・ビジネス・スクールのミラーリング仮説研究(MacCormack, Rusnak, Baldwin, 2007/2012)**——疎結合な組織は有意にモジュラーな製品を、密結合な組織は密結合な製品を作ることを実証
- 実証2: **Microsoft Research (Nagappan, Murphy, Basili, 2008, Windows Vista)——組織構造のメトリクスが、コードのメトリクス(churn・複雑度・カバレッジ)より高い精度でバグの発生しやすさを予測(精度・再現率85%)**。経営層向けの決定打としてheroに使う
- 逆コンウェイ戦略(欲しいアーキテクチャに合わせて組織を設計する。Team Topologiesで普及)もアドバイスで紹介

**モデル**(2スライダー):
- 操作1 `silo`: 部門間の分断度 0-100, step5, 初期60 (部門をまたぐ日常的なコミュニケーションの薄さ)
- 操作2 `crossNeed`: 部門横断が必要な機能の割合 10-70%, step5, 初期40 (ユーザー体験上、複数部門の連携が必要な機能)
- `withinQualityOf(silo) = 88 - silo * 0.08` (部門内で完結する機能の品質。siloの影響は小さい——サイロでも部門内はうまくいく、が皮肉)
- `crossQualityOf(silo) = 85 - silo * 0.6` (部門横断機能の品質。siloで大きく劣化——境界がそのまま製品の亀裂になる)
- `overallOf(silo, crossNeed) = withinQuality * (1 - crossNeed/100) + crossQuality * (crossNeed/100)`
- `scoreOf = round(overall)` / tier: overallの5帯域
- scenario-box(siloの帯域): 「画面のこちら半分はA部の担当なので、そちらの不具合はB部にお問い合わせください(ユーザーには関係がない)」等、ユーザーから見た亀裂の具体例5段階

**チャート**: X=部門間の分断度、緑線=部門内機能の品質(ほぼ水平)、赤線=部門横断機能の品質(急落)。**ほぼ水平線と急落線の対比**。crossNeedスライダーはカードの総合品質に効く。マーカードラッグ+値ラベル
**シナリオボタン**: 「シナリオ: 3つのチームでコンパイラを作ると3パスになる」silo=85 (Conwayの著名な観察の言い換え。実装時に原典の正確な表現を確認)
**書籍候補**: JA「チームトポロジー」(マシュー・スケルトン&マニュエル・パイス、日本能率協会マネジメントセンター、ISBN候補 4820729632 要確認) / EN "Team Topologies" (ISBN候補 1942788819 要確認)
**RELATED**: conways-law → ["brooks-law","psychological-safety","technical-debt"]。被参照: brooks-law のリスト3件目(wip-lead-time)を conways-law に差し替え
**テスト要件**: within/crossとも silo で単調減少、crossの傾きがwithinより急 / overallがcrossNeedで単調減少(silo>5のとき) / score 0-100 / silo=0でwithin≈cross(分断がなければ差もない: 88 vs 85で近い) / 全tier到達

---

## 実装後のチェックリスト(全テーマ共通、CLAUDE.mdの再掲+本件固有)

1. SIMS末尾に追加(cat必須)、RELATED本体+被参照の差し替え(各節の指定どおり)、sitemap(privacyの直前)、OGP生成
2. scratchpadの整合性テスト(site-improvements-test.js相当)がある場合は件数非依存になっているか確認して実行
3. 31本目(conways-law)を追加した時点で**31テーマ達成**。トップの見出しは自動で「全31テーマ」になる。達成後はCLAUDE.mdの「サイトの最終目標」に従い新規テーマ追加を原則停止
4. 本設計書の各テーマが出荷されたら、該当節の冒頭に「✅ 出荷済み (コミットハッシュ)」を追記すること
