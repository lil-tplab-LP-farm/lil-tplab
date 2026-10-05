// 時給・月給・年収の換算(画面表示から切り離して、単体でテストできるようにしてある)
// 額面の換算のみ。税・社会保険料は計算しない。
// 年間の労働日数 = 365 − 年間休日、年間の労働時間 = 年間の労働日数 × 1日の労働時間。
// 月給 = 賞与を除く年収 ÷ 12。賞与は「月給の○か月分」か「年間の金額」で指定する。

function annualHours(hoursPerDay, holidays) {
  return (365 - holidays) * hoursPerDay;
}

// from: "hourly"(時給から) / "monthly"(月給から。賞与を除く) / "annual"(年収から。賞与を含む)
// bonus: { type: "months", value: 月数 } または { type: "amount", value: 円 }(賞与なしは value: 0)
// 戻り値: { hourly, monthly, base(賞与を除く年収), bonus, annual(賞与を含む年収), hoursYear, daysYear }。
// 年収から換算する時に、賞与が年収より大きいなど成り立たない場合は null。
function convert(from, value, hoursPerDay, holidays, bonus) {
  const hoursYear = annualHours(hoursPerDay, holidays);
  const daysYear = 365 - holidays;
  let base, monthly, bonusYen;
  if (from === "hourly") {
    base = value * hoursYear;
    monthly = base / 12;
    bonusYen = bonus.type === "months" ? monthly * bonus.value : bonus.value;
  } else if (from === "monthly") {
    monthly = value;
    base = value * 12;
    bonusYen = bonus.type === "months" ? monthly * bonus.value : bonus.value;
  } else {
    if (bonus.type === "months") {
      monthly = value / (12 + bonus.value);
      base = monthly * 12;
      bonusYen = monthly * bonus.value;
    } else {
      base = value - bonus.value;
      if (base < 0) return null;
      monthly = base / 12;
      bonusYen = bonus.value;
    }
  }
  return { hourly: base / hoursYear, monthly: monthly, base: base, bonus: bonusYen, annual: base + bonusYen, hoursYear: hoursYear, daysYear: daysYear };
}

if (typeof module !== "undefined") module.exports = { annualHours, convert };
