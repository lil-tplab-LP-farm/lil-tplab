// 消費税の計算(画面表示から切り離して、単体でテストできるようにしてある)
// 金額はすべて0以上の整数(円)。端数は整数どうしの割り算で処理し、小数の誤差が入らないようにしてある。

// n÷d(n≥0、d>0、整数)を mode("floor"=切り捨て / "round"=四捨五入 / "ceil"=切り上げ)で整数にする
function roundDiv(n, d, mode) {
  let q = Math.floor(n / d);
  while (q * d > n) q--;
  while ((q + 1) * d <= n) q++;
  const r = n - q * d;
  if (r === 0) return q;
  if (mode === "floor") return q;
  if (mode === "ceil") return q + 1;
  return 2 * r >= d ? q + 1 : q;
}

// 税込の金額に含まれる消費税額(税込 × 税率 ÷ (100+税率) を端数処理)
function taxFromIncl(incl, rate, mode) { return roundDiv(incl * rate, 100 + rate, mode); }

// 税抜の金額にかかる消費税額(税抜 × 税率 ÷ 100 を端数処理)
function taxFromExcl(excl, rate, mode) { return roundDiv(excl * rate, 100, mode); }

// 複数の品目の計算。items = [{ amount, rate }]、basis = "incl"(入力は税込) / "excl"(入力は税抜)
// 税率ごとに合計してから1回だけ端数処理する(請求書の原則)。
// perItemTax は「品目ごとに端数処理して足した」場合の消費税額の合計(比較用)。
function calcItems(items, basis, mode) {
  const groups = {};
  let perItemTax = 0;
  items.forEach(function (it) {
    const g = groups[it.rate] || (groups[it.rate] = { rate: it.rate, sum: 0 });
    g.sum += it.amount;
    perItemTax += basis === "incl" ? taxFromIncl(it.amount, it.rate, mode) : taxFromExcl(it.amount, it.rate, mode);
  });
  const total = { excl: 0, tax: 0, incl: 0 };
  Object.keys(groups).forEach(function (k) {
    const g = groups[k];
    if (basis === "incl") { g.incl = g.sum; g.tax = taxFromIncl(g.sum, g.rate, mode); g.excl = g.sum - g.tax; }
    else { g.excl = g.sum; g.tax = taxFromExcl(g.sum, g.rate, mode); g.incl = g.sum + g.tax; }
    total.excl += g.excl; total.tax += g.tax; total.incl += g.incl;
  });
  return { groups: groups, total: total, perItemTax: perItemTax };
}

if (typeof module !== "undefined") module.exports = { roundDiv, taxFromIncl, taxFromExcl, calcItems };
