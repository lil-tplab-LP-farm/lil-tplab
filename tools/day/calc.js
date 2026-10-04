// 日数・日割りの計算(画面表示から切り離して、単体でテストできるようにしてある)
// 日付は「年・月・日」だけを使い、UTCの0時に揃えて扱う(時刻・タイムゾーンのずれを避ける)

// 内閣府の公式ページ https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html で確認(2026/10/04)した祝日。この年の分だけ内蔵。
var HOLIDAYS_CHECKED_AT = "2026/10/04";
var HOLIDAYS_SOURCE = "https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html";
var HOLIDAYS = {
  2026: ["01-01", "01-12", "02-11", "02-23", "03-20", "04-29", "05-03", "05-04", "05-05", "05-06", "07-20", "08-11", "09-21", "09-22", "09-23", "10-12", "11-03", "11-23"],
  2027: ["01-01", "01-11", "02-11", "02-23", "03-21", "03-22", "04-29", "05-03", "05-04", "05-05", "07-19", "08-11", "09-20", "09-23", "10-11", "11-03", "11-23"]
};

var DAY_MS = 86400000;
function utc(y, m, d) { return Date.UTC(y, m - 1, d); }
function parseYMD(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) return null;
  var y = +m[1], mo = +m[2], d = +m[3], t = utc(y, mo, d), dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return t;
}
function ymd(t) { var d = new Date(t); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; }
function fmt(t) { var o = ymd(t); return o.y + "/" + o.m + "/" + o.d + "(" + "日月火水木金土"[new Date(t).getUTCDay()] + ")"; }
function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
function addDays(t, n) { return t + n * DAY_MS; }

// 開始日〜終了日の日数。初日を含む:+1
function countDays(start, end, includeFirst) {
  return Math.round((end - start) / DAY_MS) + (includeFirst ? 1 : 0);
}
// ○日後/○日前。初日を含む場合は、開始日を1日目と数える(○日後なら開始日+○-1日)
function shiftDate(start, n, dir, includeFirst) {
  var k = includeFirst ? n - 1 : n;
  return dir === "before" ? addDays(start, -k) : addDays(start, k);
}

// 整数どうしの割り算を、浮動小数点の誤差なしで端数処理する
function roundDiv(num, den, mode) {
  var q = Math.floor(num / den), r = num - q * den;
  if (r === 0) return q;
  if (mode === "floor") return q;
  if (mode === "ceil") return q + 1;
  return 2 * r >= den ? q + 1 : q; // 四捨五入
}

function isHoliday(t) {
  var o = ymd(t), list = HOLIDAYS[o.y];
  if (!list) return false;
  var key = (o.m < 10 ? "0" : "") + o.m + "-" + (o.d < 10 ? "0" : "") + o.d;
  return list.indexOf(key) >= 0;
}

// 数える範囲(first〜last、両端を含む)。初日を含まない時は開始日の翌日から
function range(start, end, includeFirst) {
  return { first: includeFirst ? start : addDays(start, 1), last: end };
}

// 営業日数(土日を除く。祝日を内蔵している年は祝日も除く)。内蔵外の年が範囲に含まれるかも返す
function businessDays(first, last) {
  var n = 0, outOfRange = false, holidaysHit = 0;
  for (var t = first; t <= last; t = addDays(t, 1)) {
    var o = ymd(t);
    if (!HOLIDAYS[o.y]) outOfRange = true;
    var wd = new Date(t).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    if (isHoliday(t)) { holidaysHit++; continue; }
    n++;
  }
  return { count: n, holidayCountExcluded: holidaysHit, outOfRange: outOfRange };
}

// 月ごとの内訳(月額は整数円)。方式A:月ごとに 月額×日数÷その月の日数(月ごとに端数処理して合計)
// 方式B:月額×12×合計日数÷365
function breakdown(first, last, monthly, mode) {
  var rows = [], total = 0, days = 0;
  if (first > last) return { rows: rows, totalA: 0, totalB: 0, days: 0 };
  var t = first;
  while (t <= last) {
    var o = ymd(t), dim = daysInMonth(o.y, o.m);
    var monthEnd = utc(o.y, o.m, dim), segEnd = Math.min(monthEnd, last);
    var n = Math.round((segEnd - t) / DAY_MS) + 1;
    var amt = roundDiv(monthly * n, dim, mode);
    rows.push({ y: o.y, m: o.m, days: n, dim: dim, amount: amt });
    total += amt; days += n;
    t = addDays(segEnd, 1);
  }
  return { rows: rows, totalA: total, totalB: roundDiv(monthly * 12 * days, 365, mode), days: days };
}

if (typeof module !== "undefined") module.exports = { HOLIDAYS, HOLIDAYS_CHECKED_AT, HOLIDAYS_SOURCE, parseYMD, ymd, fmt, isLeap, daysInMonth, addDays, countDays, shiftDate, roundDiv, isHoliday, range, businessDays, breakdown };
