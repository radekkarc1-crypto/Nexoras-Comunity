"use client";

import { useState } from "react";

const cards = [
  ["🎮", "Gry", "Kółko-krzyżyk z AI i kolejne gry, które będziemy dodawać."],
  ["🤖", "AI Chat", "Darmowy chat AI dostępny prosto z Nexorasa."],
  ["💡", "Pomysły", "Twórz projekty i pozwól społeczności rozwijać je razem z Tobą."],
  ["📻", "Radio", "Nexoras Radio z bangerami i własnym odtwarzaczem."],
  ["📝", "Notatnik", "Twoje notatki i foldery zawsze pod ręką."],
  ["🧰", "Narzędzia", "Małe, przydatne narzędzia w jednym miejscu."],
];

export default function Home() {
  const [toast, setToast] = useState("");

  function click(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="logo">NEXORAS <span>COMMUNITY</span></div>
        <nav className="nav">
          <button onClick={() => click("🎮 Gry jeszcze ładują silniki...")}>Gry</button>
          <button onClick={() => click("💡 Czas wymyślić coś wielkiego.")}>Pomysły</button>
          <button onClick={() => click("🤖 AI czeka na pytania.")}>AI</button>
          <button onClick={() => click("📻 Radio: banger incoming!")}>Radio</button>
        </nav>
        <button className="profile" onClick={() => click("👤 Profile pojawią się w następnym etapie.")}>Profil</button>
      </header>

      <section className="hero">
        <div className="kicker">Nexoras Community • v0.1</div>
        <h1>Jedno miejsce.<br />Dużo możliwości.</h1>
        <p>Gry, AI, radio, pomysły i społeczność. A to dopiero początek. Każdy klik może coś odpalić. 👀</p>
      </section>

      <section className="grid">
        {cards.map(([icon, title, description]) => (
          <article className="card" key={title}>
            <div className="icon">{icon}</div>
            <h2>{title}</h2>
            <p>{description}</p>
            <button onClick={() => click(`${icon} ${title}: nadchodzimy!`)}>Otwórz</button>
          </article>
        ))}

        <article className="card wide radio">
          <div>
            <div className="icon">🔊</div>
            <h2>Nexoras Radio</h2>
            <p>Teraz: <strong>Banger #001</strong> • prawdziwe radio dołożymy w kolejnym etapie.</p>
          </div>
          <button className="play" onClick={() => click("🎵 BANGER MODE ACTIVATED")}>▶</button>
        </article>

        <article className="card" onClick={() => click("🗿 SECRET: six seven") }>
          <div className="icon">🟪</div>
          <h2>SIX SEVEN</h2>
          <p>To wygląda jak zwykła karta. Kliknij, jeśli masz odwagę.</p>
        </article>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
