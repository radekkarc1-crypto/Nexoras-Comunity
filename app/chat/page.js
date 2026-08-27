"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-browser";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("Gość");
  const [online, setOnline] = useState(0);
  const channelRef = useRef(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let mounted = true;

    async function setup() {
      const { data } = await supabase.auth.getUser();
      if (mounted && data?.user) {
        setName(data.user.user_metadata?.username || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Użytkownik");
      }

      const channel = supabase.channel("nexoras-community-chat", {
        config: { presence: { key: crypto.randomUUID() } }
      });
      channelRef.current = channel;
      channel.on("broadcast", { event: "chat-message" }, ({ payload }) => {
        if (!payload?.id) return;
        setMessages((current) => current.some((m) => m.id === payload.id) ? current : [...current, payload].slice(-100));
      });
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnline(Object.values(state).reduce((sum, users) => sum + users.length, 0));
      });
      channel.on("presence", { event: "join" }, () => setOnline(Object.values(channel.presenceState()).reduce((sum, users) => sum + users.length, 0)));
      channel.on("presence", { event: "leave" }, () => setOnline(Object.values(channel.presenceState()).reduce((sum, users) => sum + users.length, 0)));
      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ online_at: new Date().toISOString() });
      });
    }

    setup();
    return () => { mounted = false; if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  async function sendMessage() {
    const text = input.trim();
    const channel = channelRef.current;
    if (!text || !channel) return;
    const message = { id: crypto.randomUUID(), name, text, time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) };
    setMessages((current) => [...current, message].slice(-100));
    setInput("");
    await channel.send({ type: "broadcast", event: "chat-message", payload: message });
  }

  return <main className="shell"><header className="topbar"><div className="logo">NEXORAS <span>COMMUNITY</span></div><nav className="nav"><a href="/">Start</a><a href="/community">Community</a><a href="/tools">Narzędzia</a></nav><a className="profile" href="/profile">Profil</a></header><section className="hero"><div className="kicker">💬 NEXORAS CHAT • ONLINE</div><h1>Chat społeczności</h1><p>Rozmawiajcie na żywo. Bez odświeżania. ⚡ <strong>{online} online</strong></p></section><section className="chatPage"><div className="chatMessages">{messages.length===0?<div className="chatMessage ai">💬 Napisz pierwszą wiadomość. Pozostali zobaczą ją na żywo.</div>:messages.map((m)=><div className="chatMessage user" key={m.id}><strong>{m.name}</strong><small> {m.time}</small><br/>{m.text}</div>)}</div><div className="ideaCreator"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} maxLength={500} placeholder="Napisz wiadomość..."/><button onClick={sendMessage}>Wyślij</button></div></section></main>;
}
