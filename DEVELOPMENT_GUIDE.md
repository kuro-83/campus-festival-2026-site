# 🏫 キャンフェス 2026 — 開発ガイド (DEVELOPMENT_GUIDE.md)

> このファイルは、新規ページ（企画ページなど）を追加・開発するメンバー向けのガイドです。  
> 共通アセットの読み込みや HTML 構造のルールを守って開発してください。

---

## 📁 ディレクトリ構成（概要）

```
campus-festival-2026-site-git/
├── index.html          ← サイトトップページ
├── css/
│   └── common.css      ← 共通スタイルシート（ナビ・色変数・レイアウト等）
├── js/
│   ├── menu.js         ← ハンバーガーメニュー 自動クローズ処理
│   └── countdown.js    ← リアルタイムカウントダウンタイマー
└── pages/
    └── あなたの企画名/
        ├── index.html  ← 企画ページ本体
        └── style.css   ← このページ専用スタイル（任意）
```

---

## 1. 共通アセット一覧と読み込みコード

### 1-1. `css/common.css` — 共通スタイルシート

サイト全体のデザインシステム（カラー変数、フォント、ナビゲーション、各共通コンポーネント）が定義されています。  
**すべてのページで必ず読み込んでください。**

#### ルート直下 (`index.html`) から読み込む場合

```html
<link rel="stylesheet" href="css/common.css">
```

#### `pages/xxx/index.html` から読み込む場合

```html
<link rel="stylesheet" href="../../css/common.css">
```

---

### 1-2. `js/menu.js` — ハンバーガーメニュー 自動クローズ処理

メニュー内のリンクをタップしたとき、メニューを自動で閉じるための JS です。  
**`<body>` の閉じタグ直前に配置してください。**

#### ルート直下 (`index.html`) から読み込む場合

```html
<script src="js/menu.js"></script>
```

#### `pages/xxx/index.html` から読み込む場合

```html
<script src="../../js/menu.js"></script>
```

---

### 1-3. `js/countdown.js` — リアルタイムカウントダウンタイマー

カウントダウンウィジェット（`id="cd-hours"` / `"cd-minutes"` / `"cd-seconds"`）を持つページにのみ必要です。  
カウントダウン要素がないページには読み込まなくて構いません。

#### ルート直下 (`index.html`) から読み込む場合

```html
<script src="js/countdown.js"></script>
```

#### `pages/xxx/index.html` から読み込む場合

```html
<script src="../../js/countdown.js"></script>
```

---

### ⚠️ 相対パスの注意点

| ページの場所 | `css/common.css` へのパス | `js/menu.js` へのパス |
|---|---|---|
| `index.html`（ルート直下） | `css/common.css` | `js/menu.js` |
| `pages/xxx/index.html`（2階層下） | `../../css/common.css` | `../../js/menu.js` |
| `pages/xxx/sub/index.html`（3階層下） | `../../../css/common.css` | `../../../js/menu.js` |

> **ポイント：** `../` は「1つ上のディレクトリへ移動」を意味します。  
> `pages/xxx/index.html` はルートから2階層下にあるため `../../` が必要です。

---

## 2. 必須となる HTML の共通基本構造

ハンバーガーメニューとナビゲーションが正常に動作するために、  
**`<body>` 直下に以下の順序・ID・クラス名で HTML を配置してください。**

順序や ID・クラス名を変えると、CSS（`:checked` セレクター）と JS（`getElementById`）が正しく動作しなくなります。

```html
<body>

  <!-- ① メニュー開閉用チェックボックス（非表示） -->
  <!-- ⚠️ id="nav-toggle" は固定。変更禁止。-->
  <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-hidden="true">

  <!-- ② ナビゲーションバー（上部固定） -->
  <nav class="site-nav" aria-label="サイトナビゲーション">
    <div class="site-nav__inner">
      <!-- ✏️ サイト名（クリックでトップページへ戻る） -->
      <div class="site-nav__logo">
        <a href="../../index.html">Campus Festival</a>
      </div>
      <!-- ハンバーガーアイコン（<label> で checkbox と連動） -->
      <label for="nav-toggle" class="site-nav__hamburger" aria-label="メニューを開く">
        <span></span>
        <span></span>
        <span></span>
      </label>
    </div>
  </nav>

  <!-- ③ メニューパネル（右側からスライドイン） -->
  <!-- ⚠️ class="nav-menu" は固定。変更禁止。-->
  <div class="nav-menu" role="dialog" aria-modal="true" aria-label="サイトメニュー">
    <!-- ✕ 閉じるボタン -->
    <label for="nav-toggle" class="nav-menu__close" aria-label="メニューを閉じる">×</label>
    <!-- メニュー内のサイト名 -->
    <p class="nav-menu__logo">Campus Festival</p>
    <nav aria-label="バーガーメニュー">
      <ul class="nav-menu__list">
        <!-- ✏️ メニュー項目を追加・変更するのはここだけでOK -->
        <li>
          <a href="../../index.html#top" class="nav-menu__link">
            About <span>概要</span>
          </a>
        </li>
        <li>
          <a href="../../index.html#projects" class="nav-menu__link">
            Chambers <span>企画一覧</span>
          </a>
        </li>
        <!-- 必要に応じてリンクを追加 -->
      </ul>
    </nav>
  </div>
  <!-- /nav-menu -->

  <!-- ④ 背景暗転オーバーレイ（クリックでメニューを閉じる） -->
  <!-- ⚠️ class="nav-menu__backdrop" は固定。変更禁止。-->
  <label for="nav-toggle" class="nav-menu__backdrop" aria-hidden="true"></label>

  <!-- ===== ここから先にページ固有のコンテンツを書く ===== -->
  <main>
    <!-- 企画ページの内容 -->
  </main>

  <!-- フッター等 -->

  <!-- ===== body 閉じタグの直前に JS を読み込む ===== -->
  <script src="../../js/menu.js"></script>

</body>
```

### 必須要素まとめ

| 要素 | 固定すべき属性 | 役割 |
|---|---|---|
| `<input>` | `id="nav-toggle"` | CSS と JS がメニュー開閉を制御する起点 |
| `<nav class="site-nav">` | `class="site-nav"` | 上部ナビバー全体 |
| `<label for="nav-toggle" class="site-nav__hamburger">` | `for="nav-toggle"` `class="site-nav__hamburger"` | ハンバーガーアイコン（チェックボックスと連動） |
| `<div class="nav-menu">` | `class="nav-menu"` | スライドインメニューパネル本体 |
| `<a class="nav-menu__link">` | `class="nav-menu__link"` | JS の自動クローズ対象リンク（`menu.js` が監視） |
| `<label class="nav-menu__backdrop">` | `class="nav-menu__backdrop"` | 背景暗転・クリック時クローズ |

---

## 3. 新規企画ページを作るときの手順

1. `pages/` 配下に企画名のフォルダを作成（例：`pages/my-project/`）
2. `pages/sample-project/` の `index.html` と `style.css` をコピーして土台にする
3. `../../css/common.css` の読み込みパスが正しいか確認する
4. ページ固有のスタイルは `style.css` に追記する（`common.css` は編集しない）
5. `<body>` 閉じタグ直前に `<script src="../../js/menu.js"></script>` があることを確認する

---

## 4. AI（Antigravity）向け運用ルール

> **🤖 AI への指示（Antigravity 必読）**
>
> 今後、開発が進む中で共通の CSS（`css/common.css`）、JS（`js/menu.js`、`js/countdown.js`）、  
> あるいは新しい共通コンポーネント・共通アセットが **追加・変更・削除** された場合、  
> AI（Antigravity）は **この `DEVELOPMENT_GUIDE.md` も必ず合わせて最新の状態に編集・更新すること**。
>
> 具体的には以下のタイミングで必ずこのファイルを更新する：
>
> - `css/common.css` に新しい共通コンポーネントやクラスが追加されたとき
> - `js/` 配下に新しい共通スクリプトが追加されたとき
> - 共通の HTML 構造（ナビ・フッター等）が変更されたとき
> - 読み込みパスのルールや命名規則が変更されたとき
> - ディレクトリ構成が変更されたとき
>
> ガイドの内容が実際のコードと乖離した状態は **絶対に放置しない**こと。

---

*最終更新：2026-07-15*
