"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-browser";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setMessage("⚠️ Brak konfiguracji Supabase w Vercel.");
      return;
    }
    if (password.length < 6) {
      setMessage("⚠️ Hasło musi mieć minimum 6 znaków.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/profile";
      } else {
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
        if (cleanUsername.length < 3) throw new Error("Nick musi mieć minimum 3 znaki i może zawierać litery, cyfry oraz _." );
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: cleanUsername, display_name: displayName.trim() || cleanUsername } },
        });
        if (error) throw error;
        if (data.session) window.location.href = "/profile";
        else setMessage("✅ Konto utworzone. Sprawdź e-mail, jeśli Supabase wymaga potwierdzenia adresu.");
      }
    } catch (error) {
      setMessage(`⚠️ ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setMessage("👋 Wylogowano.");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="logo">NEXORAS <span>COMMUNITY</span></div>
        <a className="profile" href="/">← Nexoras</a>
      </header>
      <section className="notesPage" style={{maxWidth: 620, margin: "0 auto"}}>
        <div className="kicker">🔐 NEXORAS ACCOUNT</div>
        <h1>{user ? "Jesteś zalogowany" : mode === "login" ? "Zaloguj się" : "Utwórz konto"}</h1>
        <p>{user ? `Zalogowano jako ${user.email}.` : "Jedno konto do Community i kolejnych funkcji Nexorasa."}</p>

        {user ? (
          <div className="card" style={{marginTop: 24}}>
            <p>🟢 Sesja działa poprawnie.</p>
            <button onClick={logout}>Wyloguj się</button>
          </div>
        ) : (
          <form onSubmit={submit} className="card" style={{marginTop: 24, display: "grid", gap: 12}}>
            {mode === "register" && <>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Nick, np. Nexorian_07" autoComplete="username" required />
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nazwa wyświetlana" autoComplete="name" />
            </>}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" autoComplete="email" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Hasło (min. 6 znaków)" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
            <button type="submit" disabled={busy}>{busy ? "⏳ Chwila..." : mode === "login" ? "Zaloguj się" : "Utwórz konto"}</button>
            {message && <p>{message}</p>}
            <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>
              {mode === "login" ? "Nie mam konta → Rejestracja" : "Mam konto → Logowanie"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
