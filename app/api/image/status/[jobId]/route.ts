import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    const gatewayUrl = process.env.AI_GATEWAY_URL || 'http://127.0.0.1:9000'
    const targetUrl = `${gatewayUrl.replace(/\/$/, '')}/image/status/${jobId}`

    const response = await fetch(targetUrl)

    if (!response.ok) {
      return NextResponse.json({ error: 'Job not found or failed' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Image Status API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}
