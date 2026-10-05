// 和暦⇄西暦の変換(画面表示から切り離して、単体でテストできるようにしてある)
// 対象: 1873年(明治6年)1月1日以降の太陽暦。明治5年以前は旧暦のため対象外。
// 改元日: 令和=2019/5/1、平成=1989/1/8、昭和=1926/12/25、大正=1912/7/30、明治=1873/1/1(太陽暦の開始日)
// base = 元年にあたる西暦の年。明治だけは元年が1868年なので、1873年が明治6年になる。
const ERAS = [
  { name: "令和", base: 2019, y: 2019, m: 5, d: 1 },
  { name: "平成", base: 1989, y: 1989, m: 1, d: 8 },
  { name: "昭和", base: 1926, y: 1926, m: 12, d: 25 },
  { name: "大正", base: 1912, y: 1912, m: 7, d: 30 },
  { name: "明治", base: 1868, y: 1873, m: 1, d: 1 }
];
const MIN_YEAR = 1873, MAX_YEAR = 9999;

function key(y, m, d) { return y * 10000 + m * 100 + d; }
function eraKey(e) { return key(e.y, e.m, e.d); }
function yearLabel(n) { return n === 1 ? "元" : String(n); }
function startsMidYear(e) { return !(e.m === 1 && e.d === 1); }

function isRealDate(y, m, d) {
  if (![y, m, d].every(Number.isInteger)) return false;
  const t = new Date(Date.UTC(2000, 0, 1));
  t.setUTCFullYear(y, m - 1, d); // new Date(y,…) は0〜99年を補正するため setUTCFullYear を使う
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

// 年月日 → 和暦。範囲外・存在しない日付は null
function dateToWareki(y, m, d) {
  if (!isRealDate(y, m, d) || y < MIN_YEAR || y > MAX_YEAR) return null;
  const k = key(y, m, d);
  const e = ERAS.find(function (x) { return k >= eraKey(x); });
  return { era: e.name, year: y - e.base + 1 };
}

// 西暦の年 → その年に含まれる和暦(改元の年は2つ。古い順)
function yearToWareki(y) {
  if (!Number.isInteger(y) || y < MIN_YEAR || y > MAX_YEAR) return null;
  const out = [];
  for (let i = ERAS.length - 1; i >= 0; i--) {
    const e = ERAS[i], next = ERAS[i - 1];
    if (y >= e.y && (!next || y <= next.y)) {
      out.push({ era: e.name, year: y - e.base + 1, partialStart: y === e.y && startsMidYear(e), partialEnd: !!next && y === next.y });
    }
  }
  return out;
}

// 和暦の年 → 西暦。その元号に存在しない年・対象外は null
function warekiToYear(era, n) {
  const i = ERAS.findIndex(function (x) { return x.name === era; });
  if (i < 0 || !Number.isInteger(n) || n < 1) return null;
  const e = ERAS[i], next = ERAS[i - 1];
  const y = e.base + n - 1;
  if (y < MIN_YEAR || y > MAX_YEAR) return null;
  if (next && y > next.y) return null;
  return { year: y, partialStart: y === e.y && startsMidYear(e), partialEnd: !!next && y === next.y };
}

// 十二支・干支(1月1日で切り替える一般的な数え方。旧暦・立春では切り替えない)
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
function mod(a, b) { return ((a % b) + b) % b; }
function eto(y) { return { branch: BRANCHES[mod(y - 4, 12)], kanshi: STEMS[mod(y - 4, 10)] + BRANCHES[mod(y - 4, 12)] }; }

// 年齢。年だけ:今年中に迎える年齢(今年−生まれ年)。年月日:基準日時点の満年齢
function ageByYear(birthYear, nowYear) { return nowYear - birthYear; }
function ageFull(by, bm, bd, ny, nm, nd) {
  let a = ny - by;
  if (key(ny, nm, nd) < key(ny, bm, bd)) a--;
  return a;
}

if (typeof module !== "undefined") module.exports = { ERAS, key, yearLabel, isRealDate, dateToWareki, yearToWareki, warekiToYear, eto, ageByYear, ageFull };
