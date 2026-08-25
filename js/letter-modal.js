/**
 * letter-modal.js — 謎解き封筒モーダル 開閉ロジック
 * ============================================================
 * ヘッダーの手紙アイコン（#header-letter-btn）をクリックすると
 * 封筒モーダル（#letter-overlay）が開閉します。
 *
 * DOMContentLoaded でラップしているため、JSがHTMLより先に
 * 読み込まれても正しく動作します。
 *
 * ✏️ 【編集不要】
 *   挑戦状の文面や遷移先は index.html の #letter-overlay 内を
 *   直接編集してください。
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var overlay  = document.getElementById('letter-overlay');
  var openBtn  = document.getElementById('header-letter-btn');
  var closeBtn = document.getElementById('letter-close');

  if (!overlay || !openBtn) return;

  /* --- モーダルを開く --- */
  function openModal() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // スクロール防止
    // フォーカスを閉じるボタンへ（アニメーション完了後）
    if (closeBtn) {
      setTimeout(function () { closeBtn.focus(); }, 500);
    }
  }

  /* --- モーダルを閉じる --- */
  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // フォーカスをアイコンボタンへ戻す
    openBtn.focus();
  }

  /* --- イベント設定 --- */

  // 手紙アイコンクリックで開く
  openBtn.addEventListener('click', openModal);

  // × ボタンで閉じる
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // オーバーレイの外枠クリックで閉じる
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  // Escape キーで閉じる
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });
});
