/**
 * banner.js — 一番くじ追従バナー 制御スクリプト
 * ============================================================
 * フローティングバナー（#floating-kuji-banner）の
 * 再表示タブ（#floating-kuji-open-tab）の表示・非表示を
 * MutationObserver で制御します。
 *
 * ✏️ バナーの閉じる／開くボタン制御は HTML 側の
 *   onclick 属性（または common.css のCSSトグル）と
 *   連携しています。
 * ============================================================
 */

(function () {
  'use strict';

  var banner  = document.getElementById('floating-kuji-banner');
  var openTab = document.getElementById('floating-kuji-open-tab');

  if (!banner || !openTab) return;

  // バナーの class 変化を監視し、is-hidden のときだけタブを表示する
  var observer = new MutationObserver(function () {
    openTab.style.display = banner.classList.contains('is-hidden') ? 'flex' : 'none';
  });

  observer.observe(banner, { attributes: true, attributeFilter: ['class'] });
})();
