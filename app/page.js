"use client";

import { useState } from "react";

const cards = [
  ["🎮", "Gry", "Kółko-krzyżyk z AI i kolejne gry."],
  ["🤖", "AI Chat", "Darmowy chat AI prosto z Nexorasa."],
  ["💡", "Pomysły", "Twórz projekty i rozwijaj je ze społecznością."],
  ["📻", "Radio", "Nexoras Radio z bangerami."],
  ["📝", "Notatnik", "Twoje notatki i foldery."],
  ["🧰", "Narzędzia", "Przydatne narzędzia w jednym miejscu."],
];

const emptyBoard = Array(9).fill(null);

function winner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "draw" : null;
}

function aiMove(board) {
  const free = board.map((v,i) => v ? null : i).filter(v => v !== null);
  if (!free.length) return board;

  // AI najpierw próbuje wygrać.
  for (const i of free) {
    const test = [...board]; test[i] = "O";
    if (winner(test) === "O") return test;
  }
  // Potem blokuje gracza.
  for (const i of free) {
    const test = [...board]; test[i] = "X";
    if (winner(test) === "X") { const next=[...board]; next[i]="O"; return next; }
  }
  // Preferuje środek, potem narożniki, potem losowe wolne pole.
  const preferred = [4,0,2,6,8,1,3,5,7].filter(i => !board[i]);
  const i = preferred[Math.floor(Math.random() * Math.min(preferred.length, 3))];
  const next = [...board]; next[i] = "O"; return next;
}

export default function Home() {
  const [toast, setToast] = useState("");
  const [gameOpen, setGameOpen] = useState(false);
  const [board, setBoard] = useState(emptyBoard);
  const [thinking, setThinking] = useState(false);

  function click(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function resetGame() {
    setBoard(emptyBoard);
    setThinking(false);
  }

  function playerMove(index) {
    if (thinking || board[index] || winner(board)) return;
    const next = [...board]; next[index] = "X";
    setBoard(next);
    const result = winner(next);
    if (result) { click(result === "X" ? "🏆 WYGRANA! AI właśnie dostało po głowie." : "🤝 Remis!"); return; }
    setThinking(true);
    window.setTimeout(() => {
      const afterAI = aiMove(next);
      setBoard(afterAI);
      setThinking(false);
      const aiResult = winner(afterAI);
      if (aiResult) click(aiResult === "O" ? "🤖 AI WYGRYWA! Rewanż?" : "🤝 Remis!");
    }, 450);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="logo">NEXORAS <span>COMMUNITY</span></div>
        <nav className="nav">
          <button onClick={() => setGameOpen(true)}>Gry</button>
          <button onClick={() => click("💡 Czas wymyślić coś wielkiego.")}>Pomysły</button>
          <button onClick={() => click("🤖 AI czeka na pytania.")}>AI</button>
          <button onClick={() => click("📻 Radio: banger incoming!")}>Radio</button>
        </nav>
        <button className="profile" onClick={() => click("👤 Profile pojawią się w następnym etapie.")}>Profil</button>
      </header>

      <section className="hero">
        <div className="kicker">Nexoras Community • v0.2</div>
        <h1>Jedno miejsce.<br />Dużo możliwości.</h1>
        <p>Gry, AI, radio, pomysły i społeczność. Każdy klik może coś odpalić. 👀</p>
      </section>

      <section className="grid">
        {cards.map(([icon, title, description]) => (
          <article className="card" key={title}>
            <div className="icon">{icon}</div>
            <h2>{title}</h2>
            <p>{description}</p>
            <button onClick={() => title === "Gry" ? setGameOpen(true) : click(`${icon} ${title}: nadchodzimy!`)}>Otwórz</button>
          </article>
        ))}

        <article className="card wide radio">
          <div><div className="icon">🔊</div><h2>Nexoras Radio</h2><p>Teraz: <strong>Banger #001</strong> • prawdziwe radio dołożymy w kolejnym etapie.</p></div>
          <button className="play" onClick={() => click("🎵 BANGER MODE ACTIVATED")}>▶</button>
        </article>

        <article className="card" onClick={() => click("🗿 SECRET: six seven") }>
          <div className="icon">🟪</div><h2>SIX SEVEN</h2><p>To wygląda jak zwykła karta. Kliknij, jeśli masz odwagę.</p>
        </article>
      </section>

      {gameOpen && (
        <div className="gameOverlay" role="dialog" aria-modal="true">
          <div className="gamePanel">
            <button className="close" onClick={() => setGameOpen(false)}>✕</button>
            <div className="kicker">🎮 NEXORAS GAMES</div>
            <h2>Kółko i krzyżyk</h2>
            <p>Ty: ❌ X &nbsp; • &nbsp; AI: ⭕ O</p>
            <div className="board">
              {board.map((value, index) => <button key={index} className="cell" onClick={() => playerMove(index)}>{value}</button>)}
            </div>
            <p className="gameStatus">{thinking ? "🤖 AI myśli..." : winner(board) === "X" ? "🏆 Wygrałeś!" : winner(board) === "O" ? "🤖 AI wygrało!" : winner(board) === "draw" ? "🤝 Remis!" : "Twój ruch, szefie."}</p>
            <button className="reset" onClick={resetGame}>🔄 Nowa gra</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
