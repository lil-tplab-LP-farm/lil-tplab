// 割り勘の計算(画面表示から切り離して、単体でテストできるようにしてある)
// 金額はすべて整数(円)。割り算は整数だけで行い、小数の誤差を持ち込まない。

// 整数a÷整数b(b>0)の床(負の数でも正しく切り下げ)
function idiv(a, b) {
  let q = Math.floor(a / b);
  while (q * b > a) q--;
  while ((q + 1) * b <= a) q++;
  return q;
}

// a/b を unit 円単位に丸めた金額。mode: "ceil"(切り上げ) / "floor"(切り捨て) / "round"(四捨五入)
function roundShare(a, b, unit, mode) {
  const d = b * unit;
  let q;
  if (mode === "floor") q = idiv(a, d);
  else if (mode === "ceil") q = -idiv(-a, d);
  else q = idiv(2 * a + d, 2 * d);
  return q * unit;
}

// 均等割り。diff = 合計 − 集めた額(正=足りない=幹事などが負担、負=余る)
// lastPays = 残り(n−1)人が per ずつ払った時に、最後の1人が払えばちょうど合う額
function splitEven(total, n, unit, mode) {
  const per = roundShare(total, n, unit, mode);
  const collected = per * n;
  return { per: per, collected: collected, diff: total - collected, lastPays: total - per * (n - 1) };
}

// 傾斜配分。weights は10倍した整数(1.2倍→12、1.0倍→10)の配列。
function splitWeighted(total, weights, unit, mode) {
  const W = weights.reduce(function (s, x) { return s + x; }, 0);
  const shares = weights.map(function (w) { return roundShare(total * w, W, unit, mode); });
  const collected = shares.reduce(function (s, x) { return s + x; }, 0);
  return { shares: shares, collected: collected, diff: total - collected };
}

if (typeof module !== "undefined") module.exports = { idiv, roundShare, splitEven, splitWeighted };
