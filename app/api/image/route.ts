import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const gatewayUrl = process.env.AI_GATEWAY_URL || 'http://127.0.0.1:9000'
    const targetUrl = `${gatewayUrl.replace(/\/$/, '')}/image`

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      let errDetail = 'Image generation failed'
      try {
        const err = await response.json()
        if (err.detail) errDetail = err.detail
      } catch (e) {}
      return NextResponse.json({ error: errDetail }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Image API] Error:', error)
    return NextResponse.json(
      { error: 'Image generation failed', details: error.message },
      { status: 500 }
    )
  }
}
