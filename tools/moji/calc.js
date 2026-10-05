// 文字数カウント(画面表示から切り離して、単体でテストできるようにしてある)
// 「1文字」= Array.from で分けた1要素(Unicodeのコードポイント1つ)。
// 絵文字の一部(家族・肌色つき・国旗など)や結合文字は、見た目は1文字でも2以上に数えられる。

function codePoints(text) { return Array.from(text); }

// UTF-8でのバイト数(単独のサロゲートは置換文字と同じ3バイトとして数える)
function utf8Bytes(text) {
  let n = 0;
  for (const ch of codePoints(text)) {
    const cp = ch.codePointAt(0);
    n += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
  }
  return n;
}

function splitLines(text) { return text === "" ? [] : text.split(/\r\n|\r|\n/); }

// 原稿用紙(1枚=20字×20行=400字)に当てはめた枚数
// simple: 改行を除いた文字数÷400
// rows: 段落(改行で区切った行)ごとに行頭から書き、空行も1行使う場合の行数と枚数
function genko(lines) {
  const chars = lines.reduce(function (s, l) { return s + codePoints(l).length; }, 0);
  let rows = 0;
  lines.forEach(function (l) { const c = codePoints(l).length; rows += c === 0 ? 1 : Math.ceil(c / 20); });
  return { simple: chars / 400, simpleSheets: Math.ceil(chars / 400), rows: rows, rowSheets: Math.ceil(rows / 20) };
}

function count(text) {
  const all = codePoints(text);
  const lines = splitLines(text);
  return {
    all: all.length,
    noSpace: all.filter(function (c) { return !/\s/u.test(c); }).length,
    noNewline: all.filter(function (c) { return c !== "\n" && c !== "\r"; }).length,
    lines: lines.length,
    bytes: utf8Bytes(text),
    genko: genko(lines)
  };
}

if (typeof module !== "undefined") module.exports = { codePoints, utf8Bytes, splitLines, genko, count };
