// 割引・割増・パーセントの計算(画面表示から切り離して、単体でテストできるようにしてある)

// Aの p% はいくつ
function pctOf(a, p) { return a * p / 100; }

// A は B の何%か(B が 0 の時は null)
function whatPct(a, b) { return b === 0 ? null : a / b * 100; }

// A から p% 引いた金額と、引かれた額
function discount(a, p) { const price = a * (100 - p) / 100; return { price: price, diff: a - price }; }

// A に p% 上乗せした金額と、増えた額
function markup(a, p) { const price = a * (100 + p) / 100; return { price: price, diff: price - a }; }

// 2段階割引(p1% 引きの後に、さらに p2% 引き)
// totalOff は、元の金額から見た合計の割引率(%)。単純に p1+p2 にはならない。
function twoStage(a, p1, p2) {
  const afterFirst = a * (100 - p1) / 100;
  const price = afterFirst * (100 - p2) / 100;
  return { afterFirst: afterFirst, price: price, diff: a - price, totalOff: a === 0 ? null : (a - price) / a * 100 };
}

// 表示用:小数第2位までに丸める(1.005 のような2進数の誤差を避けるため、100倍した値を有効数字12桁にそろえてから丸める)
function round2(x) { return Math.round(Number((x * 100).toPrecision(12))) / 100; }

if (typeof module !== "undefined") module.exports = { pctOf, whatPct, discount, markup, twoStage, round2 };
