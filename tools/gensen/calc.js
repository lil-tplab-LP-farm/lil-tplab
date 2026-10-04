// 源泉徴収(原稿料・講演料など)と請求額の計算(画面表示から切り離して、単体でテストできるようにしてある)
// 国税庁 タックスアンサー No.2795 / No.2792 で確認(2026/10/05)した現行の率を使う。すべて整数計算。
// 令和9年(2027年)分以後は防衛特別所得税が加算される予定のため、2027年以降の報酬には使えない。
var GENSEN_CHECKED_AT = "2026/10/05";
var GENSEN_SOURCES = [
  { label: "国税庁 タックスアンサー No.2795", url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2795.htm" },
  { label: "国税庁 タックスアンサー No.2792", url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2792_qa.htm" }
];
var LIMIT = 100000000; // 金額の上限(1億円)
var THRESHOLD = 1000000; // 100万円
var BASE_TAX_AT_THRESHOLD = 102100; // 100万円ちょうどの税額(1,000,000 × 10.21%)

// 源泉徴収税額(円未満切り捨て)。target = 源泉徴収の対象額
function withholding(target) {
  if (target <= THRESHOLD) return Math.floor((target * 1021) / 10000);
  return Math.floor(((target - THRESHOLD) * 2042) / 10000) + BASE_TAX_AT_THRESHOLD;
}

// 消費税(報酬の10%、1円未満切り捨て)
function consumptionTax(fee) { return Math.floor(fee / 10); }

// mode: "separate"=消費税10%を別に請求(区分する) / "none"=消費税なし / "included"=税込の金額で区分していない
// 報酬 → 振込額
function forward(fee, mode) {
  var tax = mode === "separate" ? consumptionTax(fee) : 0;
  var target = fee; // separate は消費税を除いた報酬額だけが対象。none/included は入力額の全額が対象
  var w = withholding(target);
  var invoice = fee + tax;
  return { fee: fee, tax: tax, target: target, withholding: w, invoice: invoice, transfer: invoice - w };
}

function validAmount(n) { return typeof n === "number" && isFinite(n) && Math.floor(n) === n && n >= 0 && n <= LIMIT; }

// 欲しい振込額 → 振込額がぴったり合う最小の報酬額(整数の二分探索)。見つからなければ exact:false で、振込額が届く最小の報酬額を返す
function reverse(wantTransfer, mode) {
  if (wantTransfer === 0) return { exact: true, result: forward(0, mode) };
  // 振込額は報酬額に対して「減らない」ので、振込額が wantTransfer 以上になる最小の報酬額を探す
  var lo = 0, hi = LIMIT;
  if (forward(hi, mode).transfer < wantTransfer) return { exact: false, tooLarge: true };
  while (lo < hi) {
    var mid = Math.floor((lo + hi) / 2);
    if (forward(mid, mode).transfer >= wantTransfer) hi = mid; else lo = mid + 1;
  }
  var r = forward(lo, mode);
  return { exact: r.transfer === wantTransfer, result: r };
}

if (typeof module !== "undefined") module.exports = { GENSEN_CHECKED_AT, GENSEN_SOURCES, LIMIT, withholding, consumptionTax, forward, reverse, validAmount };
