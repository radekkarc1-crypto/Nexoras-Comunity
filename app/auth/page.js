"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-browser";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) throw new Error("Brak konfiguracji Supabase. Sprawdź NEXT_PUBLIC_SUPABASE_URL i klucz w Vercel.");
      if (mode === "register") {
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
        if (cleanUsername.length < 3) throw new Error("Nick musi mieć minimum 3 znaki i może zawierać litery, cyfry oraz _.");
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { username: cleanUsername, display_name: cleanUsername } } });
        if (error) throw error;
        setMessage("Konto utworzone. Jeśli wymagane, sprawdź e-mail i potwierdź konto.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (err) {
      setMessage(`⚠️ ${err.message || "Wystąpił błąd."}`);
    } finally { setBusy(false); }
  }

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#07070b",color:"white"}}>
      <section style={{width:"100%",maxWidth:440,padding:28,borderRadius:24,background:"#111118",border:"1px solid #292936",boxShadow:"0 20px 60px #0008"}}>
        <h1 style={{fontSize:32,marginBottom:8}}>Nexoras Community</h1>
        <p style={{opacity:.7,marginBottom:24}}>{mode === "login" ? "Zaloguj się do swojego konta." : "Stwórz konto i dołącz do Nexorasa."}</p>
        <form onSubmit={submit} style={{display:"grid",gap:12}}>
          {mode === "register" && <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Nick" required minLength={3} style={inputStyle}/>} 
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" required style={inputStyle}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Hasło" required minLength={6} style={inputStyle}/>
          <button disabled={busy} style={buttonStyle}>{busy ? "Chwila..." : mode === "login" ? "Zaloguj się" : "Utwórz konto"}</button>
        </form>
        {message && <p style={{marginTop:16,padding:12,borderRadius:12,background:"#1a1a24"}}>{message}</p>}
        <button onClick={()=>{setMode(mode === "login" ? "register" : "login");setMessage("")}} style={linkButton}>{mode === "login" ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}</button>
      </section>
    </main>
  );
}

const inputStyle={width:"100%",boxSizing:"border-box",padding:"13px 14px",borderRadius:12,border:"1px solid #30303c",background:"#0b0b10",color:"white",outline:"none"};
const buttonStyle={padding:"13px 16px",border:0,borderRadius:12,background:"#fff",color:"#08080b",fontWeight:700,cursor:"pointer"};
const linkButton={marginTop:18,border:0,background:"transparent",color:"#aaaaff",cursor:"pointer",width:"100%"};
