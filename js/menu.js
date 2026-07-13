/**
 * menu.js — ハンバーガーメニュー 自動クローズ処理
 * ============================================================
 * メニュー内のリンクをタップ・クリックしたとき、
 * メニューパネルを自動的に閉じます。
 *
 * CSS-only のチェックボックス方式では、リンクをタップして
 * ページ内スクロールが起きてもチェックが外れないため、
 * この最小限のJSでチェックを強制解除します。
 *
 * ============================================================
 * ✅ 【編集ガイド】
 * このファイルは基本的に変更不要です。
 * メニューに新しいリンクを追加したい場合は HTML の
 * nav-menu__list 内に <li> を追加するだけで自動で適用されます。
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  // メニュー内の全リンクを取得
  var menuLinks = document.querySelectorAll('.nav-menu__link');
  // メニュー開閉用チェックボックス
  var navToggle = document.getElementById('nav-toggle');

  if (!navToggle) return; // チェックボックスが存在しないページでは何もしない

  menuLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      // チェックを外す → CSS の :checked が外れてメニューが閉じる
      navToggle.checked = false;
    });
  });
});
