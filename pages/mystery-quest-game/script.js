/**
 * script.js — マツッター 謎解きゲーム ロジック
 * ============================================================
 *
 * ✏️ 【編集ガイド】
 *   このファイルで変更する箇所は主に2つです：
 *
 *   1. STAGE_ANSWER  : 1〜6問クリア用の「捜査コード」（正解キーワード）
 *   2. FINAL_ANSWER  : 最終問題の正解（犯人の名前など）
 *
 *   正解はすべて「半角英数字小文字に統一して比較」します。
 *   大文字・スペース・全角は自動的に正規化されます。
 *
 * ============================================================
 */

'use strict';

/* ===========================================================
   ① 正解キーワード設定
   ===========================================================
   ✏️ 【編集ガイド】
      STAGE_ANSWER  : 捜査コード（1〜6問目をまとめたキーワード）
      FINAL_ANSWER  : 最終問題の正解（犯人名など）

      例えば正解を「matsuda」にしたい場合：
        const STAGE_ANSWER = 'matsuda';

      複数の正解を許容したい場合は配列で：
        const STAGE_ANSWER = ['matsuda', 'まつだ'];
   =========================================================== */

/** 捜査コード（1〜6問クリア用）正解キーワード */
const STAGE_ANSWER = 'matsuda';   // ← ✏️ ここを実際の正解に変更してください

/** 最終問題の正解 */
const FINAL_ANSWER = 'clear';     // ← ✏️ ここを実際の正解に変更してください

/* ===========================================================
   ② ゲーム状態管理
   =========================================================== */
const state = {
  stage1Cleared: false,
  finalCleared: false,
};

/* ===========================================================
   ③ ユーティリティ関数
   =========================================================== */

/**
 * 入力値を正規化する（全角→半角、大文字→小文字、スペース除去）
 * これにより「MATSUDA」「Ｍａｔｓｕｄａ」「matsuda 」などすべて一致します。
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  return str
    .trim()
    // 全角英数字→半角
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
    )
    // 全角スペース→半角
    .replace(/　/g, ' ')
    // 前後スペース除去・小文字化
    .replace(/\s+/g, '')
    .toLowerCase();
}

/**
 * 正解チェック（配列または文字列で複数正解に対応）
 * @param {string} input
 * @param {string|string[]} answer
 * @returns {boolean}
 */
function checkAnswer(input, answer) {
  const normalized = normalize(input);
  if (Array.isArray(answer)) {
    return answer.some((a) => normalize(a) === normalized);
  }
  return normalize(answer) === normalized;
}

/**
 * 要素を hidden から表示してアニメーションを付与する
 * @param {HTMLElement} el
 */
function revealElement(el) {
  if (!el) return;
  el.hidden = false;
  // 次のフレームでアニメーションを有効化（hidden解除直後はtransition無効のため）
  requestAnimationFrame(() => {
    el.classList.add('post--animate-in');
  });
}

/**
 * スムーズスクロールでターゲットまで移動
 * @param {HTMLElement} el
 */
function scrollToElement(el) {
  if (!el) return;
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
}

/**
 * エラーメッセージを表示してシェイクアニメーションをリセット
 * @param {HTMLElement} errorEl
 */
function showError(errorEl) {
  if (!errorEl) return;
  errorEl.hidden = false;
  // シェイクアニメーションを再実行するためにリセット
  errorEl.style.animation = 'none';
  requestAnimationFrame(() => {
    errorEl.style.animation = '';
  });
}

/* ===========================================================
   ④ Stage 1 : 捜査コード 送信処理
   =========================================================== */

/**
 * Stage 1 の正解処理
 * - 入力欄を正解表示にする
 * - エラーを非表示
 * - 「鍵解除」演出メッセージを挿入
 * - 最終問題ポストを表示してスクロール
 */
function handleStage1Success() {
  state.stage1Cleared = true;

  const inputEl   = document.getElementById('stage1-input');
  const submitEl  = document.getElementById('stage1-submit');
  const errorEl   = document.getElementById('stage1-error');
  const finalPost = document.getElementById('final-post');
  const dmMsg2    = document.getElementById('dm-msg-2');
  const finalZone = document.getElementById('input-zone-final');

  // 入力欄をクリア状態に
  if (inputEl)  inputEl.classList.add('is-correct');
  if (submitEl) submitEl.disabled = true;
  // エラーを必ず非表示（直前まで表示されていた場合も含む）
  if (errorEl) { errorEl.hidden = true; errorEl.style.animation = 'none'; }

  // タイムライン側：犯人の挑発投稿（メッセージのみ）を表示
  // ※ DMタブを見ている場合もあるので、強制的なタブ切り替え・スクロールはしない
  if (finalPost) revealElement(finalPost);

  // DM側：2通目メッセージ（旧「🔓 捜査コード認証完了…」の置き換え）と
  //        最終回答入力フォームを表示
  if (dmMsg2)    revealElement(dmMsg2);
  if (finalZone) {
    revealElement(finalZone);
    scrollToElement(finalZone);
  }
}

/**
 * Stage 1 の不正解処理
 */
function handleStage1Fail() {
  showError(document.getElementById('stage1-error'));
  // 入力欄を軽く振動（CSSシェイク）
  const inputEl = document.getElementById('stage1-input');
  if (inputEl) {
    inputEl.style.animation = 'none';
    requestAnimationFrame(() => {
      inputEl.style.animation = 'shake 0.35s ease';
    });
  }
}

/* ===========================================================
   ⑤ Final : 最終問題 送信処理
   =========================================================== */

/**
 * Final の正解処理
 * - 最終回答欄を正解状態に
 * - エンディングを表示してスクロール
 */
function handleFinalSuccess() {
  state.finalCleared = true;

  const inputEl  = document.getElementById('final-input');
  const submitEl = document.getElementById('final-submit');
  const errorEl  = document.getElementById('final-error');
  const dmMsg3   = document.getElementById('dm-msg-3');
  const followup = document.getElementById('post-reveal-followup');

  if (inputEl)  inputEl.classList.add('is-correct');
  if (submitEl) submitEl.disabled = true;
  if (errorEl)  errorEl.hidden = true;

  // DM側：3通目メッセージ（旧エンディングを統合・景品受け取り案内を含む）を表示
  if (dmMsg3) {
    revealElement(dmMsg3);
    scrollToElement(dmMsg3);
  }

  // タイムライン側：事件解決後の続報投稿（ももこ）を表示
  if (followup) revealElement(followup);
}

/**
 * Final の不正解処理
 */
function handleFinalFail() {
  showError(document.getElementById('final-error'));
  const inputEl = document.getElementById('final-input');
  if (inputEl) {
    inputEl.style.animation = 'none';
    requestAnimationFrame(() => {
      inputEl.style.animation = 'shake 0.35s ease';
    });
  }
}

/* ===========================================================
   ⑥ イベントリスナー設定
   =========================================================== */

/**
 * 送信ボタン + Enter キーの両方に対応する汎用バインド
 * @param {string} inputId    - input要素のID
 * @param {string} submitId   - buttonのID
 * @param {Function} onSubmit - 送信時に呼ぶコールバック
 */
function bindInputActions(inputId, submitId, onSubmit) {
  const inputEl  = document.getElementById(inputId);
  const submitEl = document.getElementById(submitId);

  if (submitEl) {
    submitEl.addEventListener('click', onSubmit);
  }

  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    });
  }
}

/* ===========================================================
   ⑦ 下部タブバー：3ビューの切り替え
   =========================================================== */

/** タブバーを初期化する（初期表示はタイムライン） */
function initTabBar() {
  const tabbar = document.querySelector('.tabbar');
  if (!tabbar) return;

  const buttons = Array.from(tabbar.querySelectorAll('.tabbar__btn'));
  const viewIds = ['view-timeline', 'view-search', 'view-dm'];

  function activate(targetId) {
    viewIds.forEach((id) => {
      const view = document.getElementById(id);
      if (view) view.hidden = (id !== targetId);
    });
    buttons.forEach((btn) => {
      const isActive = btn.dataset.view === targetId;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
    // ビュー切り替え時はページ上端へ（アプリらしい挙動）
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => activate(btn.dataset.view));
  });

  activate('view-timeline');
}

/* ===========================================================
   ⑧ 検索ビュー：ヒント投稿のリアルタイム絞り込み
   =========================================================== */

/** 検索ビューを初期化する */
function initSearch() {
  const input   = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const pool    = document.getElementById('hint-pool');
  if (!input || !results || !pool) return;

  const hintPosts = Array.from(pool.querySelectorAll('.post'));

  function runSearch(rawQuery) {
    const query = (rawQuery || '').trim().toLowerCase();
    results.innerHTML = '';

    // 空欄のときは結果を出さない（ガイド文＋チップのみの状態）
    if (!query) return;

    const matched = hintPosts.filter((post) =>
      post.textContent.toLowerCase().includes(query)
    );

    if (matched.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = '「' + rawQuery.trim() + '」に一致する投稿は見つかりませんでした。';
      results.appendChild(empty);
      return;
    }

    matched.forEach((post) => {
      const clone = post.cloneNode(true);
      clone.hidden = false;
      results.appendChild(clone);
    });
  }

  // 入力のたびにリアルタイムで絞り込み
  input.addEventListener('input', () => runSearch(input.value));

  // 候補ハッシュタグチップ：クリックで検索欄に入れて実行
  document.querySelectorAll('.search-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.query || chip.textContent.trim();
      runSearch(input.value);
      input.focus();
    });
  });
}

/* ===========================================================
   ⑨ 初期化（DOMContentLoaded）
   =========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  initTabBar();
  initSearch();


  /* --- Stage 1 --- */
  bindInputActions('stage1-input', 'stage1-submit', () => {
    if (state.stage1Cleared) return; // 二重送信防止

    const inputEl = document.getElementById('stage1-input');
    const value   = inputEl ? inputEl.value : '';

    if (checkAnswer(value, STAGE_ANSWER)) {
      handleStage1Success();
    } else {
      handleStage1Fail();
    }
  });

  /* --- Final --- */
  bindInputActions('final-input', 'final-submit', () => {
    if (state.finalCleared) return; // 二重送信防止

    const inputEl = document.getElementById('final-input');
    const value   = inputEl ? inputEl.value : '';

    if (checkAnswer(value, FINAL_ANSWER)) {
      handleFinalSuccess();
    } else {
      handleFinalFail();
    }
  });

  /*
  ✏️ 【開発用デバッグ】
     ブラウザのコンソールで以下を実行すると各ステージをスキップできます。
       handleStage1Success();  // stage1をクリア
       handleFinalSuccess();   // finalをクリア
  */
});
