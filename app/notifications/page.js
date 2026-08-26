"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-browser";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("Zaloguj się, aby zobaczyć swoje powiadomienia. 🔐");
        setItems([]);
        return;
      }
      const { data, error } = await supabase
        .from("notifications")
        .select("id,type,title,message,read_at,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
      setMessage("");
    } catch (error) {
      setMessage(`⚠️ ${error.message || "Nie udało się pobrać powiadomień."}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markRead(id) {
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    if (!error) setItems(current => current.map(item => item.id === id ? { ...item, read_at: new Date().toISOString() } : item));
  }

  async function markAllRead() {
    const supabase = getSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("notifications").update({ read_at: now }).eq("user_id", user.id).is("read_at", null);
    if (!error) setItems(current => current.map(item => ({ ...item, read_at: item.read_at || now })));
  }

  return <main className="shell"><header className="topbar"><div className="logo">NEXORAS <span>COMMUNITY</span></div><nav className="nav"><a href="/">Nexoras</a><a href="/community">Community</a></nav><a className="profile" href="/">← Powrót</a></header><section className="notesPage"><div className="kicker">🔔 NEXORAS NOTIFICATIONS</div><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h1>Powiadomienia</h1><p>Wszystko ważne w jednym miejscu.</p></div>{items.some(item => !item.read_at) && <button onClick={markAllRead}>✓ Oznacz wszystkie</button>}</div>{loading ? <p>Ładowanie powiadomień... 🛰️</p> : message ? <div className="card"><h2>🔐 Zaloguj się</h2><p>{message}</p></div> : !items.length ? <div className="card"><h2>📭 Pusto!</h2><p>Nie masz jeszcze żadnych powiadomień.</p></div> : <div className="ideaList">{items.map(item => <article key={item.id} className="idea" style={{opacity:item.read_at?0.65:1}}><div><b>{item.title}</b>{item.message && <p>{item.message}</p>}<small>{new Date(item.created_at).toLocaleString("pl-PL")}</small></div>{!item.read_at && <button onClick={() => markRead(item.id)}>✓ Przeczytane</button>}</article>)}</div>}</section></main>;
}
