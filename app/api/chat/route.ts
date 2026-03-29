import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const gatewayUrl = process.env.AI_GATEWAY_URL || 'http://127.0.0.1:9000'
    const targetUrl = `${gatewayUrl.replace(/\/$/, '')}/chat`

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Upstream error: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('[Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
