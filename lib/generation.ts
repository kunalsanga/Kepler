/**
 * Generation Client Library
 * Frontend utilities for image and video generation
 */

export interface GenerationJob {
  jobId: string
  type: 'image' | 'video'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  url?: string
  error?: string
}

/**
 * Generate image
 */
export async function generateImage(prompt: string, width?: number, height?: number): Promise<GenerationJob> {
  const response = await fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, width, height }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Image generation failed')
  }

  const data = await response.json()
  return {
    jobId: data.jobId,
    type: 'image',
    status: 'pending',
    url: data.imageUrl,
  }
}

/**
 * Generate video
 */
export async function generateVideo(prompt: string, frames?: number): Promise<GenerationJob> {
  const response = await fetch('/api/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, frames }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Video generation failed')
  }

  const data = await response.json()
  return {
    jobId: data.jobId,
    type: 'video',
    status: 'pending',
    url: data.videoUrl,
  }
}

/**
 * Poll job status
 */
export async function pollJobStatus(jobId: string, type: 'image' | 'video'): Promise<GenerationJob> {
  const endpoint = type === 'image' ? '/api/image/status' : '/api/video/status'
  const response = await fetch(`${endpoint}/${jobId}`)

  if (!response.ok) {
    throw new Error('Failed to get job status')
  }

  const data = await response.json()
  return {
    jobId,
    type,
    status: data.status,
    url: data.imageUrl || data.videoUrl,
    error: data.error,
  }
}

/**
 * Check if message contains generation commands or natural language requests
 */
export function parseGenerationCommand(content: string): { type: 'image' | 'video' | null; prompt: string } {
  const lowerContent = content.toLowerCase()
  
  // Explicit commands
  const imageCmdMatch = content.match(/\/image\s+(.+)/i) || content.match(/generate\s+image[:\s]+(.+)/i)
  const videoCmdMatch = content.match(/\/video\s+(.+)/i) || content.match(/generate\s+video[:\s]+(.+)/i)
  
  if (imageCmdMatch) {
    return { type: 'image', prompt: imageCmdMatch[1].trim() }
  }
  if (videoCmdMatch) {
    return { type: 'video', prompt: videoCmdMatch[1].trim() }
  }
  
  // Natural language detection
  const imageKeywords = ['generate image', 'create image', 'make image', 'draw', 'image of', 'picture of', 'can you generate image', 'can you create image']
  const videoKeywords = ['generate video', 'create video', 'make video', 'video of', 'can you generate video', 'can you create video', 'can you make video']
  
  const hasImageRequest = imageKeywords.some(keyword => lowerContent.includes(keyword))
  const hasVideoRequest = videoKeywords.some(keyword => lowerContent.includes(keyword))
  
  if (hasImageRequest && !hasVideoRequest) {
    // Extract prompt - remove request phrases and get the actual description
    let prompt = content
    for (const keyword of imageKeywords) {
      const index = lowerContent.indexOf(keyword)
      if (index !== -1) {
        prompt = content.substring(index + keyword.length).trim()
        // Remove question marks and common phrases
        prompt = prompt.replace(/^[?:]\s*/, '').replace(/\?$/, '').trim()
        break
      }
    }
    // If no specific prompt found, use a default or ask LLM to generate one
    if (!prompt || prompt.length < 3) {
      prompt = content // Use full message as prompt
    }
    return { type: 'image', prompt }
  }
  
  if (hasVideoRequest) {
    let prompt = content
    for (const keyword of videoKeywords) {
      const index = lowerContent.indexOf(keyword)
      if (index !== -1) {
        prompt = content.substring(index + keyword.length).trim()
        prompt = prompt.replace(/^[?:]\s*/, '').replace(/\?$/, '').trim()
        break
      }
    }
    if (!prompt || prompt.length < 3) {
      prompt = content
    }
    return { type: 'video', prompt }
  }

  return { type: null, prompt: '' }
}

