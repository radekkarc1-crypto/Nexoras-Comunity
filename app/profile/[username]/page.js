"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowser } from "../../../lib/supabase-browser";

export default function ProfilePage() {
  const params = useParams();
  const username = decodeURIComponent(params.username || "");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    (async () => {
      try {
        const s = getSupabaseBrowser();
        if (!s) throw new Error("Supabase nie jest skonfigurowany.");
        const { data, error } = await s
          .from("profiles")
          .select("id,username,display_name,avatar_url,created_at")
          .or(`username.eq.${username},id.eq.${username}`)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Nie znaleziono takiego użytkownika.");
        setProfile(data);
      } catch (e) {
        setError(e.message || "Nie udało się pobrać profilu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="logo">NEXORAS <span>COMMUNITY</span></div>
        <a className="profile" href="/community">← Społeczność</a>
      </header>
      <section className="profilePage">
        {loading ? <p>Ładowanie profilu... 🛰️</p> : error ? <div className="profileError"><div className="icon">👻</div><h1>Profil nie istnieje</h1><p>⚠️ {error}</p><a className="profileButton" href="/community">Wróć do społeczności</a></div> : (
          <div className="profileCard">
            <div className="profileAvatar">{profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : "👤"}</div>
            <div className="kicker">👤 NEXORAS PROFILE</div>
            <h1>{profile.display_name || profile.username || "Nexorian"}</h1>
            <p className="profileUsername">@{profile.username || "user"}</p>
            <div className="profileInfo"><span>🟢 Aktywny w Nexoras Community</span><span>📅 Dołączył: {profile.created_at ? new Date(profile.created_at).toLocaleDateString("pl-PL") : "brak danych"}</span></div>
          </div>
        )}
      </section>
    </main>
  );
}
