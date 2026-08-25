import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();
    const text = String(message || "").trim();
    if (!text) return NextResponse.json({ error: "Napisz wiadomość." }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Brak OPENAI_API_KEY na serwerze." }, { status: 503 });

    const safeHistory = Array.isArray(history)
      ? history.slice(-12).map((item) => ({
          role: item?.role === "ai" ? "assistant" : "user",
          content: String(item?.text || "").slice(0, 4000),
        })).filter((item) => item.content)
      : [];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        input: [
          { role: "developer", content: "Jesteś Nexoras AI. Odpowiadasz po polsku, konkretnie, przyjaźnie i możesz mieć lekko zabawny charakter. Pomagasz użytkownikom korzystać z Nexoras Community. Nie udawaj, że masz funkcje, których nie masz." },
          ...safeHistory,
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || "OpenAI API zwróciło błąd." }, { status: response.status });
    return NextResponse.json({ answer: data.output_text || "Nie dostałem tekstowej odpowiedzi." });
  } catch (error) {
    return NextResponse.json({ error: "Wystąpił błąd serwera AI." }, { status: 500 });
  }
}
