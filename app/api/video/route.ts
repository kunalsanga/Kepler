import { NextRequest, NextResponse } from 'next/server'
import { generateVideo } from '@/lib/comfyui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const result = await generateVideo(prompt)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Video API] Error:', error)
    return NextResponse.json(
      {
        error: 'Video generation failed',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

