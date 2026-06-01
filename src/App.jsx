import { useState } from "react";
import { isYang, isChanging, lookupHexagram, transformLines } from "./iching";
import { LINE_NAME } from "./data";
import { playToss, playLand } from "./sound";
import "./App.css";

function CoinDisplay({ state, params }) {
  if (state === null) return <div className="coin idle">·</div>;
  if (state === "tossing") {
    return (
      <div
        className="coin tossing"
        style={{
          "--duration": `${params.duration}ms`,
          "--peak": `${params.peak}px`,
          "--rot": `${params.rotation}deg`,
        }}
      >
        ?
      </div>
    );
  }
  return (
    <div className={`coin ${state} landed`}>
      {state === "ngua" ? "N" : "S"}
    </div>
  );
}

function TossArea({ lineIdx, totalLines, onResult }) {
  const [coinStates, setCoinStates] = useState([null, null, null]);
  const [animParams, setAnimParams] = useState([null, null, null]);
  const [phase, setPhase] = useState("ready");

  const startToss = () => {
    setPhase("tossing");

    const params = Array.from({ length: 3 }, () => ({
      duration: 1100 + Math.random() * 700,
      peak: -(150 + Math.random() * 70),
      rotation: 1440 + Math.floor(Math.random() * 5) * 360,
    }));
    setAnimParams(params);
    setCoinStates(["tossing", "tossing", "tossing"]);

    playToss();

    const results = Array.from({ length: 3 }, () =>
      Math.random() < 0.5 ? "sap" : "ngua"
    );

    results.forEach((r, i) => {
      setTimeout(() => {
        playLand();
        setCoinStates((prev) => {
          const next = [...prev];
          next[i] = r;
          return next;
        });
      }, params[i].duration);
    });

    const maxLand = Math.max(...params.map((p) => p.duration));
    setTimeout(() => setPhase("settled"), maxLand + 250);
  };

  const handleClick = () => {
    if (phase === "tossing") return;
    if (phase === "settled") {
      const total = coinStates.reduce(
        (s, c) => s + (c === "ngua" ? 3 : 2),
        0
      );
      onResult({ coins: [...coinStates], total });
      if (lineIdx < totalLines) startToss();
    } else {
      startToss();
    }
  };

  const total =
    phase === "settled"
      ? coinStates.reduce((s, c) => s + (c === "ngua" ? 3 : 2), 0)
      : null;

  return (
    <div className="toss-area">
      <div className="toss-header">
        Hào <strong>{lineIdx}</strong> / {totalLines}
      </div>
      <div className="toss-coins">
        {coinStates.map((s, i) => (
          <div key={i} className="coin-slot">
            <CoinDisplay state={s} params={animParams[i]} />
          </div>
        ))}
      </div>
      {phase === "settled" && (
        <div className="toss-result">
          Tổng <strong>{total}</strong> — {LINE_NAME[total]}
        </div>
      )}
      <button onClick={handleClick} disabled={phase === "tossing"}>
        {phase === "tossing" ? "Đang tung..." : "Tung 3 đồng xu"}
      </button>
    </div>
  );
}

function Line({ value, idx, changing }) {
  const yang = isYang(value);
  return (
    <div className="line">
      <span className="line-idx">Hào {idx}</span>
      <span className="line-bar">
        {yang ? (
          <span className="bar yang" />
        ) : (
          <>
            <span className="bar yin" />
            <span className="bar yin" />
          </>
        )}
      </span>
      {changing && <span className="changing">⟵ động</span>}
    </div>
  );
}

function Hexagram({ values, showChanging }) {
  const display = [...values].reverse();
  return (
    <div className="hex">
      {display.map((v, i) => {
        const realIdx = 6 - i;
        return (
          <Line
            key={realIdx}
            value={v}
            idx={realIdx}
            changing={showChanging && isChanging(v)}
          />
        );
      })}
    </div>
  );
}

function CoinResult({ coins, total, idx }) {
  return (
    <div className="coin-row">
      <span className="coin-idx">Hào {idx}</span>
      <span className="coins">
        {coins.map((c, i) => (
          <span key={i} className={`coin small ${c}`}>
            {c === "ngua" ? "N" : "S"}
          </span>
        ))}
      </span>
      <span className="coin-total">= {total}</span>
      <span className="coin-name">{LINE_NAME[total]}</span>
    </div>
  );
}

function formatResult(lines, main, changingIdx, changed) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  const out = [];
  out.push(`GIEO QUẺ KINH DỊCH — ${dd}/${mm}/${yyyy} ${hh}:${min}`);
  out.push("");

  // Show lines top-down (hào 6 trên cùng, hào 1 dưới cùng)
  for (let i = 5; i >= 0; i--) {
    const t = lines[i];
    const face = t.coins
      .map((c) => (c === "ngua" ? "N" : "S"))
      .join(" ");
    const mark = isChanging(t.total) ? " ⟵ động" : "";
    out.push(
      `Hào ${i + 1}: ${face} = ${t.total}  (${LINE_NAME[t.total]})${mark}`
    );
  }
  out.push("");
  out.push("═══════════════════════════════════════");
  out.push(`QUẺ CHÍNH: #${main.num} — ${main.name}`);
  out.push("═══════════════════════════════════════");
  out.push(`  Ý nghĩa: ${main.meaning}`);
  out.push(
    `  Thượng quái: ${main.upper.symbol} ${main.upper.name} (${main.upper.element})`
  );
  out.push(
    `  Hạ quái:     ${main.lower.symbol} ${main.lower.name} (${main.lower.element})`
  );

  if (changingIdx.length > 0) {
    out.push("");
    out.push(`Hào động: ${changingIdx.join(", ")}`);
    out.push("");
    out.push("═══════════════════════════════════════");
    out.push(`QUẺ BIẾN: #${changed.num} — ${changed.name}`);
    out.push("═══════════════════════════════════════");
    out.push(`  Ý nghĩa: ${changed.meaning}`);
    out.push(
      `  Thượng quái: ${changed.upper.symbol} ${changed.upper.name} (${changed.upper.element})`
    );
    out.push(
      `  Hạ quái:     ${changed.lower.symbol} ${changed.lower.name} (${changed.lower.element})`
    );
  } else {
    out.push("");
    out.push("Không có hào động — quẻ tĩnh.");
  }

  return out.join("\n");
}

export default function App() {
  const [lines, setLines] = useState([]);
  const [copied, setCopied] = useState(false);

  const complete = lines.length === 6;
  const handleResult = (r) => setLines((prev) => [...prev, r]);
  const reset = () => {
    setLines([]);
    setCopied(false);
  };

  const values = lines.map((t) => t.total);
  const yinYang = complete ? values.map((v) => (isYang(v) ? 1 : 0)) : [];
  const main = complete ? lookupHexagram(yinYang) : null;

  const changingIdx = complete
    ? values
        .map((v, i) => (isChanging(v) ? i + 1 : null))
        .filter((x) => x !== null)
    : [];

  let changed = null;
  let changedValues = null;
  if (complete && changingIdx.length > 0) {
    changedValues = transformLines(values);
    const cyy = changedValues.map((v) => (isYang(v) ? 1 : 0));
    changed = lookupHexagram(cyy);
  }

  const copyText = async () => {
    const text = formatResult(lines, main, changingIdx, changed);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Kinh Dịch — Gieo quẻ 3 đồng xu</h1>
        <p className="sub">
          Sấp = 2 · Ngửa = 3 · Tung 6 lần, mỗi lần 1 hào (từ dưới lên)
        </p>
      </header>

      {!complete && (
        <section className="panel toss-panel">
          <TossArea
            lineIdx={lines.length + 1}
            totalLines={6}
            onResult={handleResult}
          />
        </section>
      )}

      {lines.length > 0 && (
        <section className="panel">
          <h2>Lịch sử gieo</h2>
          <div className="coin-list">
            {lines.map((t, i) => (
              <CoinResult
                key={i}
                coins={t.coins}
                total={t.total}
                idx={i + 1}
              />
            ))}
          </div>
        </section>
      )}

      {complete && (
        <section className="panel">
          <div className="hex-grid">
            <div className="hex-col">
              <h2>Quẻ chính</h2>
              <Hexagram values={values} showChanging={true} />
              <div className="hex-info">
                <div className="hex-num">#{main.num}</div>
                <div className="hex-name">{main.name}</div>
                <div className="hex-meaning">{main.meaning}</div>
                <div className="trigrams">
                  <div>
                    <strong>Thượng quái:</strong> {main.upper.symbol}{" "}
                    {main.upper.name} ({main.upper.element})
                  </div>
                  <div>
                    <strong>Hạ quái:</strong> {main.lower.symbol}{" "}
                    {main.lower.name} ({main.lower.element})
                  </div>
                </div>
              </div>
            </div>

            {changed && (
              <>
                <div className="arrow">→</div>
                <div className="hex-col">
                  <h2>Quẻ biến</h2>
                  <Hexagram values={changedValues} showChanging={false} />
                  <div className="hex-info">
                    <div className="hex-num">#{changed.num}</div>
                    <div className="hex-name">{changed.name}</div>
                    <div className="hex-meaning">{changed.meaning}</div>
                    <div className="trigrams">
                      <div>
                        <strong>Thượng quái:</strong> {changed.upper.symbol}{" "}
                        {changed.upper.name}
                      </div>
                      <div>
                        <strong>Hạ quái:</strong> {changed.lower.symbol}{" "}
                        {changed.lower.name}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {changingIdx.length > 0 ? (
            <p className="note">
              Hào động: <strong>{changingIdx.join(", ")}</strong> — quẻ chính
              biến thành quẻ biến.
            </p>
          ) : (
            <p className="note">Không có hào động — quẻ tĩnh.</p>
          )}

          <div className="actions">
            <button onClick={copyText}>
              {copied ? "✓ Đã copy" : "Copy kết quả"}
            </button>
            <button className="secondary" onClick={reset}>
              Gieo quẻ mới
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
