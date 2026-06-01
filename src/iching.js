import { HEXAGRAMS, TRIGRAM } from "./data";

export function tossThreeCoins() {
  const coins = Array.from({ length: 3 }, () =>
    Math.random() < 0.5 ? "sap" : "ngua"
  );
  const total = coins.reduce((s, c) => s + (c === "ngua" ? 3 : 2), 0);
  return { coins, total };
}

export const isYang = (v) => v === 7 || v === 9;
export const isChanging = (v) => v === 6 || v === 9;

function trigramCode(bottomUp) {
  let code = 0;
  bottomUp.forEach((yang, i) => {
    if (yang) code |= 1 << i;
  });
  return code;
}

export function lookupHexagram(yinYangBottomUp) {
  const lower = trigramCode(yinYangBottomUp.slice(0, 3));
  const upper = trigramCode(yinYangBottomUp.slice(3, 6));
  const [num, name, meaning] = HEXAGRAMS[`${upper},${lower}`];
  return {
    num,
    name,
    meaning,
    upper: TRIGRAM[upper],
    lower: TRIGRAM[lower],
  };
}

export function transformLines(values) {
  return values.map((v) => {
    if (v === 9) return 8;
    if (v === 6) return 7;
    return v;
  });
}
