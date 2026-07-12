/**
 * countdown.js — リアルタイムカウントダウンタイマー
 * ============================================================
 * このファイルは「閉門まであと」の数字をリアルタイムで
 * 自動更新するためのJavaScriptです。
 *
 * HTML の構造は壊さず、数字の textContent を書き換えるだけの
 * 最小限の処理です。
 *
 * ============================================================
 * ✅ 【編集ガイド】カウントダウンの終了時刻を変更する方法
 * ============================================================
 * 下の TARGET_DATE の日時を、実際の文化祭の閉門時刻に変更してください。
 *
 * 書き方：new Date('YYYY-MM-DDTHH:MM:SS')
 *
 * 例）
 *   2026年9月20日（日）17:00 閉門の場合
 *   → new Date('2026-09-20T17:00:00')
 *
 *   2026年10月25日（日）16:30 閉門の場合
 *   → new Date('2026-10-25T16:30:00')
 *
 * ⚠️ 注意：
 *   - 日本時間（JST）で設定してください。
 *   - 月・日・時・分は必ず2桁で書いてください（例：9月→09）。
 * ============================================================
 */

// ✅ ここを実際の閉門時刻に変更してください
const TARGET_DATE = new Date('2026-07-20T17:00:00');

/**
 * カウントダウンを更新する関数
 * 1秒ごとに自動で呼び出されます（setInterval）。
 * HTML の各要素の textContent だけを書き換えます。
 */
function updateCountdown() {
  // 現在の日時を取得
  const now = new Date();
  // 目標時刻との差（ミリ秒）
  const diff = TARGET_DATE - now;

  // ─── カウントダウン終了（目標時刻を過ぎた場合）───────────────
  if (diff <= 0) {
    const el = document.getElementById('cd-hours');
    const em = document.getElementById('cd-minutes');
    const es = document.getElementById('cd-seconds');

    // 要素が存在する場合だけ更新（ページにいないときのエラー防止）
    if (el) el.textContent = '00';
    if (em) em.textContent = '00';
    if (es) es.textContent = '00';

    // タイマーを止めてもよいが、ここでは継続（表示が変わらないため問題なし）
    return;
  }

  // ─── 残り時間を時・分・秒に変換 ──────────────────────────────
  const totalSeconds = Math.floor(diff / 1000);

  // 時間（何時間でも表示できるよう hours は上限なし）
  const hours = Math.floor(totalSeconds / 3600);
  // 分（0〜59）
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  // 秒（0〜59）
  const seconds = totalSeconds % 60;

  // ─── HTML の要素を書き換える ─────────────────────────────────
  // ※ id が見つからない場合（ページ未表示時など）はスキップ
  const elH = document.getElementById('cd-hours');
  const elM = document.getElementById('cd-minutes');
  const elS = document.getElementById('cd-seconds');

  // String().padStart(2, '0') で常に2桁以上になるようにゼロ埋め
  // 例：5 → "05"、10 → "10"、100 → "100"
  if (elH) elH.textContent = String(hours).padStart(2, '0');
  if (elM) elM.textContent = String(minutes).padStart(2, '0');
  if (elS) elS.textContent = String(seconds).padStart(2, '0');
}

// ─── 初回実行 & 1秒ごとに繰り返す ───────────────────────────────
// ページ読み込み直後に一度実行してから、毎秒更新します。
updateCountdown();
setInterval(updateCountdown, 1000);
