let ctx = null;

function getCtx() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function playToss() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;

  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g);
  g.connect(ac.destination);
  o.type = "sawtooth";
  o.frequency.setValueAtTime(120, now);
  o.frequency.exponentialRampToValueAtTime(280, now + 0.18);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.05, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  o.start(now);
  o.stop(now + 0.25);
}

export function playLand() {
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;

  // Metallic high partials
  [2200, 3100].forEach((freq, idx) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g);
    g.connect(ac.destination);
    o.type = "triangle";
    o.frequency.value = freq + (Math.random() - 0.5) * 200;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    o.start(now);
    o.stop(now + 0.2);
  });

  // Low thump
  const o2 = ac.createOscillator();
  const g2 = ac.createGain();
  o2.connect(g2);
  g2.connect(ac.destination);
  o2.type = "sine";
  o2.frequency.setValueAtTime(180, now);
  o2.frequency.exponentialRampToValueAtTime(90, now + 0.08);
  g2.gain.setValueAtTime(0, now);
  g2.gain.linearRampToValueAtTime(0.1, now + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  o2.start(now);
  o2.stop(now + 0.12);
}
