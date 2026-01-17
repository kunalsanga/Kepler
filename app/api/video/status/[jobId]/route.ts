import { NextRequest, NextResponse } from 'next/server'
import { getJobStatus } from '@/lib/cogvideo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    const job = getJobStatus(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: job.status,
      videoUrl: job.videoUrl,
      error: job.error,
    })
  } catch (error: any) {
    console.error('[Video Status API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}

