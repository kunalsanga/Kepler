/**
 * CogVideo Client Library
 * Handles video generation via CogVideo API
 */

export interface CogVideoJob {
  jobId: string
  prompt: string
  frames: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  error?: string
}

import { setJob, getJob, updateJob } from './job-store'

const COGVIDEO_URL = process.env.COGVIDEO_URL || 'http://localhost:7860'

/**
 * Generate video using CogVideo
 */
export async function generateVideo(
  prompt: string,
  frames: number = 8
): Promise<{ jobId: string; videoUrl?: string }> {
  const jobId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Create job record
  const job: CogVideoJob = {
    jobId,
    prompt,
    frames: Math.min(frames, 8), // Max 8 frames for low-VRAM
    status: 'pending',
  }
  setJob(jobId, job)

  try {
    // First check if CogVideo is running by attempting a connection
    // We'll catch the error during the actual request if it's not running
    
    // Submit to CogVideo
    const response = await fetch(`${COGVIDEO_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        num_frames: job.frames,
        resolution: '256x256',
        low_resource: true,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`CogVideo error: ${errorText}`)
    }

    const data = await response.json()
    job.status = 'processing'
    setJob(jobId, job)

    // Start polling for completion
    pollCogVideoStatus(jobId, data.task_id).catch(err => {
      job.status = 'failed'
      job.error = err.message
      setJob(jobId, job)
    })

    return { jobId }
  } catch (error: any) {
    job.status = 'failed'
    // Provide user-friendly error messages
    let errorMessage = error.message
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'CogVideo is not running. Please start it by running START_GENERATION_SERVICES.bat'
    } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'CogVideo connection timeout. Please check if CogVideo is running on port 7860'
    }
    job.error = errorMessage
    setJob(jobId, job)
    throw new Error(errorMessage)
  }
}

/**
 * Poll CogVideo for job status
 */
async function pollCogVideoStatus(jobId: string, taskId: string) {
  const maxAttempts = 120 // 4 minutes max
  let attempts = 0

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const response = await fetch(`${COGVIDEO_URL}/status/${taskId}`)
      if (!response.ok) continue

      const status = await response.json()
      
      if (status.status === 'completed' && status.video_path) {
        const videoUrl = `/videos/${status.video_path}`
        
        updateJob(jobId, {
          status: 'completed',
          videoUrl: videoUrl
        })
        return
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Video generation failed')
      }
    } catch (error: any) {
      if (error.message && !error.message.includes('fetch')) {
        throw error
      }
    }

    attempts++
  }

  throw new Error('Video generation timeout')
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): CogVideoJob | null {
  const job = getJob(jobId)
  if (job) {
    return {
      jobId: job.jobId,
      prompt: '', // Not stored in job store
      frames: 8, // Not stored in job store
      status: job.status,
      videoUrl: job.videoUrl,
      error: job.error
    }
  }
  return null
}

