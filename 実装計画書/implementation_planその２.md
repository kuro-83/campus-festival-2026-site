# ブラッシュアップ & 機能追加 実装計画

## 概要

現在のアンティーク調デザインの世界観を維持しつつ、以下3点を実装します：

1. **デザインブラッシュアップ** — ゴールド飾り線・背景テクスチャの追加
2. **CSS-only ハンバーガーメニュー** — `<input type="checkbox">` で開閉
3. **リアルタイムカウントダウン** — 独立した `js/countdown.js` で実装

---

## 変更ファイル一覧

| ファイル | 変更区分 | 内容 |
|---|---|---|
| `css/common.css` | MODIFY | 背景テクスチャ・セクション飾り線・ハンバーガーメニューCSSを追加 |
| `index.html` | MODIFY | ナビをcheckbox方式に差し替え・カウントダウンのID付与・JS読み込み追加 |
| `js/countdown.js` | NEW | リアルタイムカウントダウンのJS（新規ファイル） |

---

## 1. デザインブラッシュアップ（css/common.css）

### 背景テクスチャ
`body` に CSSのみの微細な奥行き感を追加します：

```css
body {
  background-image:
    /* 極めて薄いゴールドの点々（羊皮紙のシミ感） */
    radial-gradient(ellipse at 20% 50%, rgba(181,148,105,0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(181,148,105,0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(181,148,105,0.04) 0%, transparent 50%);
}
```

### セクション境界の飾り線
各 `.section` のトップに細いゴールドの罫線を追加：

```css
.section + .section {
  border-top: 1px solid var(--color-accent-pale);
  position: relative;
}
/* 中央にダイヤモンド型の装飾を配置 */
.section + .section::before {
  content: '◆';
  position: absolute;
  top: -0.6em;
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-accent);
  font-size: 0.6rem;
  background: var(--color-bg);
  padding: 0 8px;
}
```

---

## 2. CSS-only ハンバーガーメニュー（共通）

### HTML構造（index.html の `<nav>` を置き換え）

```html
<!-- チェックボックス（非表示だがメニュー開閉の制御役） -->
<input type="checkbox" id="nav-toggle" class="nav-toggle" aria-hidden="true">

<nav class="site-nav">
  <div class="site-nav__inner">
    <div class="site-nav__logo">Campus Festival</div>
    <!-- ハンバーガーアイコン（labelタグでチェックボックスと連動） -->
    <label for="nav-toggle" class="site-nav__hamburger" aria-label="メニューを開く">
      <span></span><span></span><span></span>
    </label>
  </div>
</nav>

<!-- オーバーレイメニュー（チェック時にふわっと表示） -->
<div class="nav-menu">
  <label for="nav-toggle" class="nav-menu__close" aria-label="メニューを閉じる">✕</label>
  <nav>
    <ul class="nav-menu__list">
      <li><a href="#about">About</a></li>
      <li><a href="#projects">Chambers</a></li>
      ...
    </ul>
  </nav>
</div>
<!-- 背景暗転オーバーレイ（クリックで閉じる） -->
<label for="nav-toggle" class="nav-menu__backdrop"></label>
```

### CSSアニメーション（css/common.css に追加）

```css
/* チェックボックスを非表示 */
.nav-toggle { display: none; }

/* メニューパネル（デフォルト：非表示・右外側へ） */
.nav-menu {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: min(320px, 85vw);
  background: var(--color-bg);
  transform: translateX(100%);
  transition: transform 0.35s ease;
  z-index: 2000;
}

/* チェック時：メニューをスライドイン */
.nav-toggle:checked ~ .nav-menu {
  transform: translateX(0);
}

/* 背景オーバーレイ（クリックで閉じる） */
.nav-menu__backdrop {
  display: none;
  position: fixed; inset: 0;
  background: rgba(74,59,50,0.35);
  z-index: 1999;
}
.nav-toggle:checked ~ .nav-menu__backdrop {
  display: block;
}

/* ハンバーガー → ✕ のアニメーション */
.nav-toggle:checked ~ .site-nav .site-nav__hamburger span:nth-child(1) {
  transform: rotate(45deg) translateY(10px);
}
/* ...等 */
```

### メニュー項目（添付画像の絵文字なし版）

```
About            → #about（概要セクション）
Chambers         → #projects（企画一覧）
Schedule         → #schedule（タイムスケジュール）
Map              → #map（キャンパスマップ）
Mystery Quest    → #caution（注意事項）
```

---

## 3. カウントダウン JS（js/countdown.js）

### 方針
- HTMLの既存の構造（`class="countdown__num"`）はそのまま維持
- `id` 属性を追加して JS からターゲット指定
- `js/countdown.js` に処理を完全分離

### HTML側の変更（最小限）

```html
<!-- 時間の数字に id を追加するだけ -->
<span class="countdown__num" id="cd-hours">6</span>
<span class="countdown__num" id="cd-minutes">30</span>
<span class="countdown__num" id="cd-seconds">00</span>
```

### js/countdown.js の設計

```javascript
/*
 * countdown.js — カウントダウンタイマー
 *
 * ✏️ 【編集ガイド】
 * TARGET_DATE の日時を、実際の文化祭の閉門時刻に変更してください。
 * 書き方：new Date('YYYY-MM-DDTHH:MM:SS')
 * 例）2026年9月20日 17:00 閉門 → new Date('2026-09-20T17:00:00')
 */
const TARGET_DATE = new Date('2026-09-20T17:00:00');

function updateCountdown() {
  const now  = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    // カウントダウン終了時の表示
    document.getElementById('cd-hours').textContent   = '00';
    document.getElementById('cd-minutes').textContent = '00';
    document.getElementById('cd-seconds').textContent = '00';
    return;
  }

  const hours   = Math.floor(diff / 1000 / 3600);
  const minutes = Math.floor((diff / 1000 % 3600) / 60);
  const seconds = Math.floor(diff / 1000 % 60);

  document.getElementById('cd-hours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);
```

### index.html への読み込み追加（`</body>` 直前）

```html
<!-- カウントダウンJS（閉門時刻の設定は js/countdown.js で変更） -->
<script src="js/countdown.js"></script>
```

---

## 作業順序

1. `css/common.css` — テクスチャ・飾り線・ハンバーガーメニューCSS追加
2. `index.html` — nav差し替え・カウントダウンID付与・JS読み込み
3. `js/countdown.js` — 新規作成

---

## 検証計画

- ブラウザで両ページを開いて目視確認
- スマホサイズ（375px幅）でハンバーガーメニューの開閉確認
- カウントダウンが毎秒更新されることを確認

> [!NOTE]
> `index.html` の `#about` IDセクションは現在存在しないため、
> ヒーローセクション（`id="top"`）の直後に `id="about"` を追加するか、
> メニューリンクを `#top` に向けます。今回は実態に合わせて `#top` にします。

> [!IMPORTANT]
> CSS-only メニューは `<input>` と `<label>` のペアで動作します。
> チェックボックスの `id="nav-toggle"` と `<label for="nav-toggle">` が一致している必要があります。
> ナビ・メニュー・バックドロップの3要素が `<input>` の兄弟要素として配置される必要があります。
