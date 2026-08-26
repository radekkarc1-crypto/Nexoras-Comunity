"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowser } from "../../../lib/supabase-browser";

export default function ProfilePage() {
  const params = useParams();
  const username = decodeURIComponent(params.username || "");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!username) return;
    (async () => {
      try {
        const s = getSupabaseBrowser();
        if (!s) throw new Error("Supabase nie jest skonfigurowany.");
        const { data: auth } = await s.auth.getUser();
        if (auth?.user) setCurrentUserId(auth.user.id);
        const { data, error } = await s
          .from("profiles")
          .select("id,username,display_name,avatar_url,bio,created_at")
          .or(`username.eq.${username},id.eq.${username}`)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Nie znaleziono takiego użytkownika.");
        setProfile(data);
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
        setBio(data.bio || "");
      } catch (e) {
        setError(e.message || "Nie udało się pobrać profilu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  async function saveProfile() {
    if (!profile || currentUserId !== profile.id || saving) return;
    setSaving(true);
    setMessage("");
    try {
      const s = getSupabaseBrowser();
      if (!s) throw new Error("Supabase nie jest skonfigurowany.");
      const { data, error } = await s
        .from("profiles")
        .update({
          display_name: displayName.trim().slice(0, 60),
          avatar_url: avatarUrl.trim().slice(0, 500),
          bio: bio.trim().slice(0, 280),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select("id,username,display_name,avatar_url,bio,created_at")
        .single();
      if (error) throw error;
      setProfile(data);
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url || "");
      setBio(data.bio || "");
      setMessage("✅ Profil zapisany!");
    } catch (e) {
      setMessage(`⚠️ ${e.message || "Nie udało się zapisać profilu."}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="logo">NEXORAS <span>COMMUNITY</span></div>
        <a className="profile" href="/community">← Społeczność</a>
      </header>
      <section className="profilePage">
        {loading ? <p>Ładowanie profilu... 🛰️</p> : error ? <div className="profileError"><div className="icon">👻</div><h1>Profil nie istnieje</h1><p>⚠️ {error}</p><a className="profileButton" href="/community">Wróć do społeczności</a></div> : (
          <div className="profileCard">
            <div className="profileAvatar">{profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar użytkownika" /> : "👤"}</div>
            <div className="kicker">👤 NEXORAS PROFILE</div>
            <h1>{profile.display_name || profile.username || "Nexorian"}</h1>
            <p className="profileUsername">@{profile.username || "user"}</p>
            <div className="profileInfo">
              <span>🟢 Aktywny w Nexoras Community</span>
              <span>📅 Dołączył: {profile.created_at ? new Date(profile.created_at).toLocaleDateString("pl-PL") : "brak danych"}</span>
            </div>
            {profile.bio && <div className="profileBio">{profile.bio}</div>}

            {currentUserId === profile.id && (
              <div className="profileEditor">
                <h2>✏️ Edytuj profil</h2>
                <label>Nazwa wyświetlana<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} placeholder="Np. Dawid" /></label>
                <label>Avatar URL<input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} maxLength={500} placeholder="https://..." /></label>
                <label>O mnie<textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={4} placeholder="Napisz coś o sobie..." /></label>
                <button className="profileButton" onClick={saveProfile} disabled={saving}>{saving ? "Zapisywanie..." : "💾 Zapisz profil"}</button>
                {message && <p className="profileMessage">{message}</p>}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
