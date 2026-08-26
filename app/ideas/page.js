"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase-browser";

export default function IdeasPage() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newIdea, setNewIdea] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [voted, setVoted] = useState({});

  async function loadIdeas() {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError("Supabase nie jest skonfigurowane w Vercel.");
      setLoading(false);
      return;
    }
    try {
      const { data, error: projectsError } = await supabase
        .from("idea_projects")
        .select("id,name,description,created_at,idea_proposals(id,text,author_name,created_at,idea_votes(id,voter_key))")
        .order("created_at", { ascending: false });
      if (projectsError) throw projectsError;
      setProjects(data || []);
      if (data?.length && selected === null) setSelected(data[0].id);
    } catch (e) {
      setError(e.message || "Nie udało się pobrać pomysłów.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadIdeas(); }, []);

  async function addIdea() {
    const text = newIdea.trim();
    if (!text || !selected || saving) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    setError("");
    try {
      const { data, error: insertError } = await supabase
        .from("idea_proposals")
        .insert({ project_id: selected, text, author_name: "Anonim" })
        .select("id,text,author_name,created_at")
        .single();
      if (insertError) throw insertError;
      setProjects(current => current.map(project => project.id === selected
        ? { ...project, idea_proposals: [...(project.idea_proposals || []), { ...data, idea_votes: [] }] }
        : project));
      setNewIdea("");
    } catch (e) {
      setError(e.message || "Nie udało się dodać pomysłu.");
    } finally {
      setSaving(false);
    }
  }

  async function vote(ideaId) {
    const supabase = getSupabaseBrowser();
    if (!supabase || voted[ideaId]) return;
    setError("");
    const { error: voteError } = await supabase.rpc("vote_for_idea", { p_idea_id: ideaId });
    if (voteError) {
      setError(voteError.message || "Nie udało się oddać głosu.");
      return;
    }
    setVoted(current => ({ ...current, [ideaId]: true }));
    setProjects(current => current.map(project => ({
      ...project,
      idea_proposals: (project.idea_proposals || []).map(idea => idea.id === ideaId
        ? { ...idea, idea_votes: [...(idea.idea_votes || []), { id: `local-${Date.now()}` }] }
        : idea)
    })));
  }

  const current = projects.find(project => project.id === selected);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="logo">NEXORAS <span>IDEAS</span></div>
        <a className="profile" href="/">← Nexoras</a>
      </header>
      <section className="notesPage">
        <div className="kicker">💡 NEXORAS IDEAS</div>
        <h1>Pomysły społeczności</h1>
        <p>Głosuj na funkcje, które mają trafić do Nexorasa.</p>

        {loading ? <p>Ładowanie pomysłów... 🛰️</p> : error && !projects.length ? <p>⚠️ {error}</p> : (
          <>
            <div className="ideaProjects">
              {projects.map(project => (
                <button key={project.id} className={project.id === selected ? "selectedProject" : ""} onClick={() => setSelected(project.id)}>
                  📁 {project.name}
                </button>
              ))}
            </div>
            {current ? (
              <div className="ideaBoard">
                <h2>{current.name}</h2>
                <p>{current.description}</p>
                <div className="ideaCreator">
                  <input value={newIdea} onChange={e => setNewIdea(e.target.value)} onKeyDown={e => e.key === "Enter" && addIdea()} placeholder="Wpisz swoją propozycję..." />
                  <button disabled={saving} onClick={addIdea}>{saving ? "Dodaję..." : "＋ Dodaj"}</button>
                </div>
                <div className="communityIdeas">
                  {(current.idea_proposals || []).map(idea => {
                    const count = (idea.idea_votes || []).length;
                    return <article className="communityIdea" key={idea.id}>
                      <div><b>💡 {idea.text}</b><small>• {idea.author_name || "Anonim"}</small></div>
                      <button onClick={() => vote(idea.id)} disabled={!!voted[idea.id]}>👍 {count}</button>
                    </article>;
                  })}
                  {!current.idea_proposals?.length && <p>Brak pomysłów. Bądź pierwszy! 🚀</p>}
                </div>
                {error && <p>⚠️ {error}</p>}
              </div>
            ) : <p>Brak projektów.</p>}
          </>
        )}
      </section>
    </main>
  );
}
