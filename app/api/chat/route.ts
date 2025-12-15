import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // 1. Get Base URL from environment (default to localhost for dev safety)
    const llmBaseUrl = process.env.LLM_BASE_URL || 'http://127.0.0.1:11434/v1'

    // 2. Construct target URL
    // Ensure no double slashes
    const baseUrl = llmBaseUrl.replace(/\/$/, '')
    const targetUrl = `${baseUrl}/chat/completions`

    console.log(`[Proxy] Forwarding request to: ${targetUrl}`)

    // 3. Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test', // Required by some OpenAI-compatible endpoints or ngrok tunnels
    }

    // Conditionally add ngrok header if URL implies it
    if (llmBaseUrl.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true'
    }

    // 4. Forward the request
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: 'qwen2.5', // Default model
        messages: messages,
        stream: true,
      }),
    })

    // 5. Handle upstream errors
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Proxy] Upstream error (${response.status}): ${errorText}`)
      return NextResponse.json(
        { error: `Upstream LLM error: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    // 6. Stream the response back
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('[Proxy] Internal Server Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
