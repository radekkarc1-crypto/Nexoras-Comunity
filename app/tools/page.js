"use client";

import { useMemo, useState } from "react";

export default function ToolsPage() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState("+");
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [text, setText] = useState("");
  const [random, setRandom] = useState(null);

  const result = useMemo(() => {
    const x = Number(a) || 0;
    const y = Number(b) || 0;
    if (op === "+") return x + y;
    if (op === "-") return x - y;
    if (op === "*") return x * y;
    return y === 0 ? "Nie można dzielić przez 0" : x / y;
  }, [a, b, op]);

  function startTimer() {
    if (running || seconds <= 0) return;
    setRunning(true);
    const id = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <main className="shell">
      <header className="topbar">
        <div className="logo">NEXORAS <span>TOOLS</span></div>
        <a className="profile" href="/">← Nexoras</a>
      </header>
      <section className="notesPage">
        <div className="kicker">🧰 NEXORAS TOOLS</div>
        <h1>Przydatne narzędzia</h1>
        <p>Mały zestaw narzędzi, które działają od razu.</p>
        <div className="grid">
          <article className="card">
            <div className="icon">🧮</div>
            <h2>Kalkulator</h2>
            <input value={a} onChange={(e) => setA(e.target.value)} type="number" placeholder="Liczba 1" />
            <select value={op} onChange={(e) => setOp(e.target.value)}>
              <option value="+">+</option><option value="-">−</option><option value="*">×</option><option value="/">÷</option>
            </select>
            <input value={b} onChange={(e) => setB(e.target.value)} type="number" placeholder="Liczba 2" />
            <p><strong>Wynik: {result}</strong></p>
          </article>
          <article className="card">
            <div className="icon">⏱️</div>
            <h2>Timer</h2>
            <input value={seconds} onChange={(e) => setSeconds(Math.max(0, Number(e.target.value) || 0))} type="number" min="0" disabled={running} />
            <p className="kicker">{mm}:{ss}</p>
            <button onClick={startTimer} disabled={running || seconds === 0}>{running ? "Odliczam..." : "▶ Start"}</button>
            <button onClick={() => { setRunning(false); setSeconds(60); }} style={{ marginLeft: 8 }}>🔄 Reset</button>
          </article>
          <article className="card">
            <div className="icon">📝</div>
            <h2>Licznik tekstu</h2>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Wpisz tekst..." rows={5} />
            <p><strong>{text.length}</strong> znaków • <strong>{text.trim() ? text.trim().split(/\s+/).length : 0}</strong> słów</p>
          </article>
          <article className="card">
            <div className="icon">🎲</div>
            <h2>Losowanie</h2>
            <p>{random === null ? "Kliknij i wylosuj liczbę od 1 do 100." : `Wylosowano: ${random}`}</p>
            <button onClick={() => setRandom(Math.floor(Math.random() * 100) + 1)}>🎲 Losuj</button>
          </article>
        </div>
      </section>
    </main>
  );
}
