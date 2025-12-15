import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Debug: Log environment variable
    console.log('[DEBUG] LOCAL_LLM_URL from env:', process.env.LOCAL_LLM_URL)
    console.log('[DEBUG] All env vars:', Object.keys(process.env).filter(k => k.includes('LLM')))

    // 1. Validate environment variable with explicit fallback for debugging
    const localLLMUrl = process.env.LOCAL_LLM_URL || 'http://127.0.0.1:11434'
    if (!localLLMUrl) {
      return NextResponse.json(
        { error: 'LOCAL_LLM_URL is not set in environment variables.' },
        { status: 500 }
      )
    }

    // 2. Construct the target URL (OpenAI-compatible endpoint)
    // Ensure no double slashes if env var has trailing slash
    const baseUrl = localLLMUrl.replace(/\/$/, '')
    const targetUrl = `${baseUrl}/v1/chat/completions`

    console.log(`[Proxy] Forwarding request to: ${targetUrl}`)

    // 3. Forward the request
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5', // Default model, or could be dynamic
        messages: messages,
        stream: true, // Output will remain SSE compatible
      }),
    })

    // 4. Handle upstream errors
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Proxy] Upstream error (${response.status}): ${errorText}`)
      return NextResponse.json(
        { error: `Upstream LLM error: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    // 5. Stream the response back
    // Since we are targeting /v1/chat/completions, the output is already SSE.
    // We can pipe it directly to the client.
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('[Proxy] Internal Server Error:', error)
    // Detailed error logging for debugging
    if (error.cause) console.error('[Proxy] Cause:', error.cause)
    if (error.stack) console.error('[Proxy] Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error.message,
        suggestion: error.message.includes('fetch') ? 'Check if Ollama is running at ' + process.env.LOCAL_LLM_URL : undefined
      },
      { status: 500 }
    )
  }
}

