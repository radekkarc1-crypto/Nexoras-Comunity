import { NextResponse } from "next/server";

const base = process.env.NEXORAS_SUPABASE_URL;
const key = process.env.NEXORAS_SUPABASE_KEY;

async function supabase(path, options = {}) {
  if (!base || !key) throw new Error("Brak NEXORAS_SUPABASE_URL lub NEXORAS_SUPABASE_KEY");
  const response = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Supabase ${response.status}`);
  return text ? JSON.parse(text) : null;
}

export async function GET() {
  try {
    const projects = await supabase("idea_projects?select=id,name,description,created_at&order=created_at.asc");
    const proposals = await supabase("idea_proposals?select=id,project_id,text,author_name,created_at&order=created_at.asc");
    return NextResponse.json({
      projects: projects.map((project) => ({
        ...project,
        ideas: proposals.filter((idea) => idea.project_id === project.id),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.type === "project") {
      const name = String(body.name || "").trim();
      if (!name) return NextResponse.json({ error: "Nazwa projektu jest wymagana." }, { status: 400 });
      const rows = await supabase("idea_projects", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ name, description: body.description || null }),
      });
      return NextResponse.json(rows[0]);
    }
    if (body.type === "idea") {
      const text = String(body.text || "").trim();
      const projectId = String(body.projectId || "");
      if (!text || !projectId) return NextResponse.json({ error: "Projekt i treść są wymagane." }, { status: 400 });
      const rows = await supabase("idea_proposals", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ project_id: projectId, text, author_name: String(body.authorName || "Anonim").slice(0, 60) }),
      });
      return NextResponse.json(rows[0]);
    }
    return NextResponse.json({ error: "Nieznany typ." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
