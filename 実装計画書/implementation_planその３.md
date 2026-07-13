# UI/UX 改善・バグ修正 実装計画

## 対象ファイル概要

| ファイル | 変更区分 | 主な変更内容 |
|---|---|---|
| `js/menu.js` | **NEW** | メニューリンクタップ後に自動クローズするJS |
| `css/common.css` | MODIFY | ✕ボタン拡大・ダイヤ区切り線修正 |
| `index.html` | MODIFY | `menu.js` 読み込みを追加 |
| `pages/sample-project/index.html` | MODIFY | nav構造修正・back-nav削除・パス修正 |
| `pages/*/index.html` × 8 | MODIFY | 同上（全企画ページに反映） |

---

## 修正①：メニューリンクタップ後の自動クローズ（`js/menu.js` 新規作成）

**原因**：CSS-only のチェックボックス方式では、リンクをタップしてページ内スクロールが起きても
チェック状態が自動では解除されないため、メニューが開いたまま残る。

**修正方針**：最小限のJSで `nav-toggle` チェックボックスを `false` に切り替える。

```javascript
// js/menu.js
document.querySelectorAll('.nav-menu__link').forEach(function (link) {
  link.addEventListener('click', function () {
    var toggle = document.getElementById('nav-toggle');
    if (toggle) toggle.checked = false;
  });
});
```

- `index.html` の `</body>` 直前に `<script src="js/menu.js">` を追加
- 企画ページでは `<script src="../../js/menu.js">` を追加

---

## 修正②：企画ページのハンバーガーメニュー動作修正

**原因**：企画ページの `<nav>` が `input#nav-toggle` の**兄弟要素より前**にあり、
CSSの `~`（兄弟セレクタ）が機能していない。また `input#nav-toggle` 自体も存在しない。

**修正方針**：`index.html` と同じHTML構造（`input → nav → .nav-menu → .backdrop` の順）に揃える。

#### 修正前（`pages/sample-project/index.html`）
```html
<body>
  <nav class="site-nav">  ← input が存在しない
    ...
    <div class="site-nav__hamburger" aria-hidden="true">  ← divで装飾のみ
```

#### 修正後
```html
<body>
  <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-hidden="true">
  <nav class="site-nav">
    ...
    <label for="nav-toggle" class="site-nav__hamburger">  ← label に変更
  ...
  <div class="nav-menu"> ... </div>
  <label class="nav-menu__backdrop" for="nav-toggle"></label>
  <script src="../../js/menu.js"></script>
```

この修正は `sample-project` + 8企画フォルダすべてに適用します。
`pages/` 配下に統一された構造になるため、今後フォルダを量産してもバグが起きません。

---

## 修正③：✕ 閉じるボタンの拡大（`css/common.css`）

#### 修正前
```css
.nav-menu__close {
  width: 28px;
  height: 28px;
  font-size: 1.2rem;
```

#### 修正後（タップしやすい44px以上のタッチターゲット）
```css
.nav-menu__close {
  width: 44px;
  height: 44px;
  font-size: 1.4rem;
  border-radius: 50%;
  background-color: transparent;
  transition: background-color 0.2s, color 0.2s;
}
.nav-menu__close:hover {
  background-color: rgba(181,148,105,0.1);
  color: var(--color-text);
}
```

---

## 修正④：「← キャンフェストップページへ」リンク削除（企画ページ）

- `.back-nav` ブロック（62〜69行目）を完全削除
- `site-nav__logo` はすでに `../../index.html` へのリンクになっているため変更不要
- 関連する `.back-nav` CSSは `pages/sample-project/style.css` に存在するため、そちらも削除

---

## 修正⑤：ダイヤ区切り線の背景浮き修正（`css/common.css`）

**問題**：`background-color: inherit` で線を「塗りつぶして隠す」方式のため、
body の背景テクスチャ（グラデーション）と食い違い、四角く浮いて見える。

**修正方針**：`border-top` を削除し、`::after` 擬似要素で線を **左右に分割した2本** として描画する。
ダイヤ文字自体の背景は完全に `transparent` のまま重ねる。

#### 修正後CSS
```css
.section + .section {
  position: relative;
  /* border-top は削除 */
}

/* ダイヤ本体 (::before) → 背景なし・透明のままで中央に配置 */
.section + .section::before {
  content: '◆';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.55rem;
  color: var(--color-accent);
  z-index: 1;
  line-height: 1;
  /* background は一切設定しない */
}

/* 左右に分割した罫線 (::after) */
.section + .section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    var(--color-accent-pale) calc(50% - 1.4em),
    transparent calc(50% - 1.4em),
    transparent calc(50% + 1.4em),
    var(--color-accent-pale) calc(50% + 1.4em)
  );
}

/* background-color inherit のための各セクション指定は不要になるため削除 */
```

---

## 作業順序

1. `js/menu.js` 新規作成
2. `css/common.css` 修正（✕ボタン拡大・ダイヤ区切り線）
3. `pages/sample-project/index.html` のナビ構造修正・back-nav削除・JS読み込み追加
4. `pages/sample-project/style.css` の `.back-nav` CSS 削除
5. `index.html` に `menu.js` 読み込みを追加
6. `pages/` の8企画フォルダの `index.html` を一括修正（`sed` コマンドで効率化）

> [!IMPORTANT]
> 企画ページの nav 構造修正（修正②）は、`input#nav-toggle` / `.nav-menu` / `.nav-menu__backdrop`
> の3要素を `sample-project/index.html` に追加する必要があります。
> これが完了した後、8企画フォルダへ `cp -f` でテンプレートを上書きコピーする方式をとります。
> （各フォルダのコンテンツはまだテンプレートのままなので上書き可能）

> [!NOTE]
> 企画ページのメニューリンク（About / Chambers 等）は `index.html` 内の各セクションへの
> ページ内リンクのため、企画ページから遷移後はメインページが開きます（正常な動作）。
