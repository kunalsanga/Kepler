import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/comfyui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { prompt, width, height } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const result = await generateImage(
      prompt,
      width || 512,
      height || 512
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Image API] Error:', error)
    
    // Provide user-friendly error messages
    let errorMessage = error.message || 'Image generation failed'
    let statusCode = 500
    
    if (error.message?.includes('not running') || error.message?.includes('ECONNREFUSED')) {
      statusCode = 503 // Service Unavailable
      errorMessage = 'ComfyUI service is not running. Please start it by running START_GENERATION_SERVICES.bat'
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        suggestion: error.message?.includes('not running') 
          ? 'Run START_GENERATION_SERVICES.bat to start ComfyUI and CogVideo services'
          : undefined,
      },
      { status: statusCode }
    )
  }
}

