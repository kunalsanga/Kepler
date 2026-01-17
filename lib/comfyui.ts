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
  error?: string
  promptId?: string // ComfyUI prompt_id for tracking
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

    // ComfyUI returns { prompt_id: "..." } or might be wrapped differently
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
                // Find image output node (SaveImage node is usually "9" in our workflow)
                for (const nodeId in outputs) {
                  const nodeOutput = outputs[nodeId]
                  if (nodeOutput.images && nodeOutput.images.length > 0) {
                    const imageInfo = nodeOutput.images[0]
                    const filename = imageInfo.filename
                    const subfolder = imageInfo.subfolder || ''
                    const type = imageInfo.type || 'output'

                    // Build image URL - ComfyUI serves images via /view endpoint
                    const imageUrl = `${COMFYUI_URL}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${type}`

                    console.log('[ComfyUI] Found image:', imageUrl)

                    updateJob(jobId, {
                      status: 'completed',
                      imageUrl: imageUrl
                    })
                    console.log('[ComfyUI] Job updated:', jobId, 'status: completed', 'imageUrl:', imageUrl)
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
      prompt: '', // Not stored in job store
      width: 512, // Not stored in job store
      height: 512, // Not stored in job store
      status: job.status,
      imageUrl: job.imageUrl,
      error: job.error,
      promptId: job.promptId
    }
  }
  return null
}

