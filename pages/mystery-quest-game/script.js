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

  // 入力欄をクリア状態に
  if (inputEl)  inputEl.classList.add('is-correct');
  if (submitEl) submitEl.disabled = true;
  // エラーを必ず非表示（直前まで表示されていた場合も含む）
  if (errorEl) { errorEl.hidden = true; errorEl.style.animation = 'none'; }

  // 「鍵解除」演出メッセージをinput-zone内に追加
  const zone = document.getElementById('input-zone-stage1');
  if (zone) {
    const msg = document.createElement('p');
    msg.style.cssText = [
      'margin-top:12px',
      'font-family:var(--font-mono)',
      'font-size:0.82rem',
      'color:var(--text-green)',
      'animation:slide-in-post 0.4s ease both',
    ].join(';');
    // ✏️ 鍵解除演出のメッセージ（変更可）
    msg.textContent = '🔓 捜査コード認証完了 — 暗号化された最終通信を受信しました…';
    zone.querySelector('.input-zone__inner').appendChild(msg);
  }

  // 最終問題ポストを表示
  if (finalPost) {
    revealElement(finalPost);
    scrollToElement(finalPost);
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
  const ending   = document.getElementById('ending');

  if (inputEl)  inputEl.classList.add('is-correct');
  if (submitEl) submitEl.disabled = true;
  if (errorEl)  errorEl.hidden = true;

  // エンディングを表示
  if (ending) {
    revealElement(ending);
    scrollToElement(ending);
  }
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
   ⑦ 初期化（DOMContentLoaded）
   =========================================================== */
document.addEventListener('DOMContentLoaded', () => {

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
