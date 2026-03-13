/**
 * ComfyUI Client Library
 * Handles image generation via ComfyUI API
 */

export interface ComfyUIJob {
  jobId: string
  prompt: string
  width: number
  height: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  imageUrl?: string
  videoUrl?: string
  error?: string
  promptId?: string // ComfyUI prompt_id for tracking
  type?: 'image' | 'video'
}

import { setJob, getJob, updateJob } from './job-store'

const COMFYUI_URL = process.env.COMFYUI_URL || 'http://127.0.0.1:8188'

/**
 * Create a basic ComfyUI workflow for text-to-image
 */
function createWorkflow(prompt: string, width: number, height: number, negativePrompt: string = '') {
  const seed = Math.floor(Math.random() * 10000000000)

  return {
    "3": {
      "class_type": "KSampler",
      "inputs": {
        "seed": seed,
        "steps": 20,
        "cfg": 8,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["5", 0]
      }
    },
    "4": {
      "class_type": "CheckpointLoaderSimple",
      "inputs": {
        "ckpt_name": "sd_turbo.safetensors"
      }
    },
    "5": {
      "class_type": "EmptyLatentImage",
      "inputs": {
        "width": width,
        "height": height,
        "batch_size": 1
      }
    },
    "6": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": prompt,
        "clip": ["4", 1]
      }
    },
    "7": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": negativePrompt || "text, watermark, blurry, low quality",
        "clip": ["4", 1]
      }
    },
    "8": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      }
    },
    "9": {
      "class_type": "SaveImage",
      "inputs": {
        "filename_prefix": "ComfyUI",
        "images": ["8", 0]
      }
    }
  }
}

/**
 * Create a ComfyUI workflow for AnimateDiff video generation
 */
function createVideoWorkflow(prompt: string) {
  const seed = Math.floor(Math.random() * 10000000000)

  return {
    "1": {
      "class_type": "CheckpointLoaderSimple",
      "inputs": {
        "ckpt_name": "sd_turbo.safetensors"
      }
    },
    "2": {
      "class_type": "ADE_AnimateDiffLoaderWithContext",
      "inputs": {
        "model_name": "mm_sd_v15_v2.ckpt",
        "beta_schedule": "sqrt_linear (AnimateDiff)",
        "motion_scale": 1.0,
        "model": ["1", 0],
        "context_options": ["3", 0]
      }
    },
    "3": {
      "class_type": "ADE_AnimateDiffUniformContextOptions",
      "inputs": {
        "context_length": 16,
        "context_stride": 1,
        "context_overlap": 4
      }
    },
    "4": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": prompt,
        "clip": ["1", 1]
      }
    },
    "5": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": "bad quality, blurry, watermark, low quality",
        "clip": ["1", 1]
      }
    },
    "6": {
      "class_type": "EmptyLatentImage",
      "inputs": {
        "width": 256,
        "height": 256,
        "batch_size": 16
      }
    },
    "7": {
      "class_type": "KSampler",
      "inputs": {
        "seed": seed,
        "steps": 12,
        "cfg": 1.5,
        "sampler_name": "euler_ancestral",
        "scheduler": "karras",
        "denoise": 1,
        "model": ["2", 0],
        "positive": ["4", 0],
        "negative": ["5", 0],
        "latent_image": ["6", 0]
      }
    },
    "8": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": ["7", 0],
        "vae": ["1", 2]
      }
    },
    "9": {
      "class_type": "VHS_VideoCombine",
      "inputs": {
        "frame_rate": 8,
        "format": "video/h264-mp4",
        "filename_prefix": "AnimateDiff",
        "images": ["8", 0]
      }
    }
  }
}

/**
 * Generate image using ComfyUI
 */
export async function generateImage(
  prompt: string,
  width: number = 512,
  height: number = 512
): Promise<{ jobId: string; imageUrl?: string }> {
  const jobId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Create job record
  const job: ComfyUIJob = {
    jobId,
    prompt,
    width,
    height,
    status: 'pending',
    type: 'image',
  }
  setJob(jobId, job)

  try {
    // First check if ComfyUI is running
    try {
      const healthCheck = await fetch(`${COMFYUI_URL}/system_stats`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
      })
      if (!healthCheck.ok) {
        throw new Error(`ComfyUI service at ${COMFYUI_URL} is not responding (Status: ${healthCheck.status}). Please start ComfyUI by running: START_GENERATION_SERVICES.bat`)
      }
    } catch (healthError: any) {
      console.error(`[ComfyUI] Health check failed for ${COMFYUI_URL}:`, healthError)
      if (healthError.name === 'AbortError' || healthError.code === 'ECONNREFUSED' || healthError.cause?.code === 'ECONNREFUSED') {
        throw new Error(`ComfyUI is not running at ${COMFYUI_URL}. Please start it by running START_GENERATION_SERVICES.bat`)
      }
      throw healthError
    }

    // Create proper ComfyUI workflow
    const workflow = createWorkflow(prompt, width, height)

    const response = await fetch(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: workflow
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ComfyUI error: ${errorText}`)
    }

    const data = await response.json()
    console.log('[ComfyUI] Response data:', JSON.stringify(data, null, 2))

    const promptId = data.prompt_id || (Array.isArray(data) && data[0]?.prompt_id) || data[0]?.prompt_id

    if (!promptId) {
      console.error('[ComfyUI] No prompt_id in response:', data)
      throw new Error('ComfyUI did not return a prompt_id')
    }

    job.status = 'processing'
    job.promptId = promptId
    setJob(jobId, job)
    console.log('[ComfyUI] Job stored:', jobId, 'promptId:', promptId)

    // Start polling for completion in background
    console.log('[ComfyUI] Starting poll for prompt_id:', promptId)
    pollComfyUIStatus(jobId, promptId).catch(err => {
      console.error('[ComfyUI] Polling error:', err)
      updateJob(jobId, {
        status: 'failed',
        error: err.message
      })
    })

    return { jobId, imageUrl: job.imageUrl }
  } catch (error: any) {
    job.status = 'failed'
    // Provide user-friendly error messages
    let errorMessage = error.message
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'ComfyUI is not running. Please start it by running START_GENERATION_SERVICES.bat'
    } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = 'ComfyUI connection timeout. Please check if ComfyUI is running on port 8188'
    }
    job.error = errorMessage
    setJob(jobId, job)
    throw new Error(errorMessage)
  }
}

/**
 * Generate video using ComfyUI + AnimateDiff
 */
export async function generateVideo(
  prompt: string
): Promise<{ jobId: string; videoUrl?: string }> {
  const jobId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Create job record
  const job: ComfyUIJob = {
    jobId,
    prompt,
    width: 256,
    height: 256,
    status: 'pending',
    type: 'video',
  }
  setJob(jobId, job)

  try {
    // 1. Check if ComfyUI is running
    try {
      const healthCheck = await fetch(`${COMFYUI_URL}/system_stats`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      if (!healthCheck.ok) throw new Error('ComfyUI responding with error')
    } catch (e) {
      throw new Error(`ComfyUI is not running at ${COMFYUI_URL}. Please run START_GENERATION_SERVICES.bat`)
    }

    // 2. Submit workflow
    const workflow = createVideoWorkflow(prompt)
    const response = await fetch(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    })

    if (!response.ok) {
      throw new Error(`ComfyUI Error: ${await response.text()}`)
    }

    const data = await response.json()
    const promptId = data.prompt_id

    if (!promptId) throw new Error('No prompt_id returned from ComfyUI')

    // 3. Update job
    job.status = 'processing'
    job.promptId = promptId
    setJob(jobId, job)

    // 4. Start polling
    pollComfyUIStatus(jobId, promptId).catch(err => {
      console.error('[ComfyUI Video] Polling error:', err)
      updateJob(jobId, { status: 'failed', error: err.message })
    })

    return { jobId }
  } catch (error: any) {
    job.status = 'failed'
    job.error = error.message
    setJob(jobId, job)
    throw error
  }
}

/**
 * Poll ComfyUI for job status
 */
async function pollComfyUIStatus(jobId: string, promptId: string) {
  const maxAttempts = 60
  let attempts = 0

  console.log('[ComfyUI] Polling started for jobId:', jobId, 'promptId:', promptId)

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Check queue status
      const queueResponse = await fetch(`${COMFYUI_URL}/queue`)
      if (queueResponse.ok) {
        const queue = await queueResponse.json()
        const inQueue = queue.queue_running?.some((q: any) => q[1] === promptId) ||
          queue.queue_pending?.some((q: any) => q[1] === promptId)

        if (!inQueue) {
          // Job is done, check history
          console.log('[ComfyUI] Job not in queue, checking history for promptId:', promptId)
          const historyResponse = await fetch(`${COMFYUI_URL}/history/${promptId}`)
          if (historyResponse.ok) {
            const history = await historyResponse.json()
            console.log('[ComfyUI] History response:', JSON.stringify(history, null, 2))

            if (history[promptId]) {
              const outputs = history[promptId].outputs
              console.log('[ComfyUI] Outputs:', JSON.stringify(outputs, null, 2))

              if (outputs) {
                // Check for generic outputs
                for (const nodeId in outputs) {
                  const nodeOutput = outputs[nodeId]

                  // Handle Images (SaveImage)
                  if (nodeOutput.images && nodeOutput.images.length > 0) {
                    const item = nodeOutput.images[0]
                    const filename = item.filename
                    const subfolder = item.subfolder || ''
                    const type = item.type || 'output'

                    const ext = filename.split('.').pop()?.toLowerCase()
                    const isVideo = ['mp4', 'webm', 'gif'].includes(ext || '')

                    // Construct URL
                    const url = `${COMFYUI_URL}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${type}${isVideo ? '&format=video' : ''}`

                    const job = getJob(jobId)
                    if (job) {
                      updateJob(jobId, {
                        status: 'completed',
                        imageUrl: !isVideo ? url : undefined,
                        videoUrl: isVideo ? url : undefined
                      })
                      console.log('[ComfyUI] Job completed:', jobId, 'URL:', url)
                    }
                    return
                  }

                  // Handle GIFs/Videos (VHS_VideoCombine)
                  if (nodeOutput.gifs && nodeOutput.gifs.length > 0) {
                    const item = nodeOutput.gifs[0]
                    const filename = item.filename
                    const subfolder = item.subfolder || ''
                    const type = item.type || 'output'
                    const url = `${COMFYUI_URL}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${type}`

                    updateJob(jobId, { status: 'completed', videoUrl: url })
                    console.log('[ComfyUI] Video/GIF Job completed:', jobId, 'URL:', url)
                    return
                  }
                }
              }
            }
          } else {
            console.log('[ComfyUI] History response not OK:', historyResponse.status)
          }
        } else {
          console.log('[ComfyUI] Job still in queue, attempt:', attempts + 1)
        }
      }
    } catch (error) {
      console.error('[ComfyUI] Polling error:', error)
    }

    attempts++
  }

  console.error('[ComfyUI] Polling timeout for jobId:', jobId)
  throw new Error('Generation timeout')
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): ComfyUIJob | null {
  const job = getJob(jobId)
  if (job) {
    return {
      jobId: job.jobId,
      prompt: '',
      width: job.width || 512,
      height: job.height || 512,
      status: job.status,
      imageUrl: job.imageUrl,
      error: job.error,
      promptId: job.promptId,
      type: job.type,
      videoUrl: job.videoUrl
    }
  }
  return null
}
