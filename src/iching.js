import { HEXAGRAMS, TRIGRAM } from "./data";

// Một bit ngẫu nhiên thật từ CSPRNG của trình duyệt (rơi về Math.random nếu không có).
// Mỗi lần tung 1 đồng xu = 1 bit độc lập, đúng như xác suất 50/50 ngoài đời.
function randomBit() {
  const c = globalThis.crypto;
  if (c && c.getRandomValues) {
    const a = new Uint8Array(1);
    c.getRandomValues(a);
    return a[0] & 1;
  }
  return Math.random() < 0.5 ? 0 : 1;
}

export function flipCoin() {
  return randomBit() === 1 ? "ngua" : "sap";
}

export const coinValue = (c) => (c === "ngua" ? 3 : 2);

export function tossThreeCoins() {
  const coins = Array.from({ length: 3 }, flipCoin);
  const total = coins.reduce((s, c) => s + coinValue(c), 0);
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
