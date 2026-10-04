// 縦横比と縮小サイズの計算(画面表示から切り離して、単体でテストできるようにしてある)
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// 偶数に丸める(動画は幅・高さが偶数でないと書き出せないことが多い)
function toEven(x) { return 2 * Math.round(x / 2); }

function ratio(w, h) {
  const g = gcd(w, h);
  return { w: w / g, h: h / g };
}

// 元のw×hを、新しい幅(または高さ)に合わせて縮小した時のサイズ
function scale(w, h, newW, newH) {
  if (newW) return { w: toEven(newW), h: toEven(newW * h / w), exactH: newW * h / w };
  return { w: toEven(newH * w / h), h: toEven(newH), exactW: newH * w / h };
}

// 元の画面(w×h)を目標の比率(tw:th)に合わせる時の差
// cropTo = 切り取った後のサイズ、padTo = 余白(黒帯)を足した後のサイズ
function fit(w, h, tw, th) {
  const src = w / h, dst = tw / th;
  if (Math.abs(src - dst) < 1e-9) return { kind: "same" };
  if (src > dst) { // 元の方が横に広い:左右を削る or 上下に余白
    return { kind: "wider", cropTo: { w: Math.round(h * dst), h: h }, padTo: { w: toEven(w), h: toEven(w / dst) } };
  }
  // 元の方が縦に長い:上下を削る or 左右に余白
  return { kind: "taller", cropTo: { w: w, h: Math.round(w / dst) }, padTo: { w: toEven(h * dst), h: toEven(h) } };
}

if (typeof module !== "undefined") module.exports = { gcd, toEven, ratio, scale, fit };
