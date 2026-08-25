import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();
    const text = String(message || "").trim();
    if (!text) return NextResponse.json({ error: "Napisz wiadomość." }, { status: 400 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Brak OPENROUTER_API_KEY na serwerze." }, { status: 503 });

    const safeHistory = Array.isArray(history)
      ? history.slice(-12).map((item) => ({
          role: item?.role === "ai" ? "assistant" : "user",
          content: String(item?.text || "").slice(0, 4000),
        })).filter((item) => item.content)
      : [];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://nexoras-community.vercel.app",
        "X-Title": "Nexoras Community",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: "Jesteś Nexoras AI. Odpowiadasz po polsku, konkretnie, przyjaźnie i możesz mieć lekko zabawny charakter. Pomagasz użytkownikom korzystać z Nexoras Community. Nie udawaj, że masz funkcje, których nie masz." },
          ...safeHistory,
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || "OpenRouter zwrócił błąd." }, { status: response.status });

    const answer = data?.choices?.[0]?.message?.content;
    return NextResponse.json({ answer: answer || "Nie dostałem tekstowej odpowiedzi." });
  } catch (error) {
    return NextResponse.json({ error: "Wystąpił błąd serwera AI." }, { status: 500 });
  }
}
