import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${process.env.LLM_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer test",
          // FORCE this header for ngrok
          "ngrok-skip-browser-warning": "true",
          "User-Agent": "Mozilla/5.0 (Vercel Serverless Function)"
        },
        body: JSON.stringify(body),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Upstream LLM error: ${text}`);
    }

    // Streaming support logic - if the user wants streaming, we shouldn't await .json()
    // However, the user specifically requested: "const data = await response.json(); return Response.json(data);"
    // This disables streaming. I will provide EXACTLY what was asked to ensure the connection works first.
    // If they want streaming back later, we can add it.

    // Actually, checking the user request again:
    // They asked for:
    // const data = await response.json();
    // return Response.json(data);

    const data = await response.json();
    return NextResponse.json(data);

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
