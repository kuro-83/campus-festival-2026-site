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

/**
 * ============================================================
 * 初回表示制御
 * ------------------------------------------------------------
 * ページ読み込み直後はバナーを非表示（HTML 側で is-hidden 付与）にしておき、
 * 「企画一覧」セクション（#projects）が最初に画面内へ入ったタイミングで
 * is-hidden を外してスライドインさせる。一度表示したら監視を解除し、
 * 以降は自動で隠さない（×閉じる／タブ再開の既存挙動には干渉しない）。
 * ============================================================
 */
(function () {
  'use strict';

  var banner = document.getElementById('floating-kuji-banner');
  var projectsSection = document.getElementById('projects');

  if (!banner || !projectsSection) return;

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        banner.classList.remove('is-hidden');
        revealObserver.disconnect();
      }
    });
  }, { threshold: 0 });

  revealObserver.observe(projectsSection);
})();
