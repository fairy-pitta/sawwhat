// utils/formatDate.ts

export default function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // 月・日・時・分を取得
  let hours = date.getHours();          // 0 ～ 23
  const minutes = date.getMinutes();
  const month = date.getMonth() + 1;    // 0-based → +1で 1～12
  const day = date.getDate();           // 1～31

  // 12時間表記のためのAM/PM判定
  const suffix = hours >= 12 ? "pm" : "am";
  // 0～23 を 1～12 の範囲へ（0 は 12 に）
  hours = hours % 12 || 12;

  // 先頭ゼロ埋め
  const hh = hours.toString().padStart(2, "0");      // 01～12
  const mm = minutes.toString().padStart(2, "0");    // 00～59
  const MM = month.toString().padStart(2, "0");      // 01～12
  const DD = day.toString().padStart(2, "0");        // 01～31

  // "MM/DD hh:mm am/pm" の形で返す
  // 例: 01/19 09:25 am
  return `${MM}/${DD} ${hh}:${mm} ${suffix}`;
}