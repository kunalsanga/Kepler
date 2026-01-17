/**
 * LLM Client Library
 * Handles streaming responses from the custom LLM API
 */

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  type?: 'text' | 'image' | 'video'
  imageUrl?: string
  videoUrl?: string
  generationJobId?: string
  generationType?: 'image' | 'video'
}

export interface StreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }>
}

/**
 * Streams LLM responses from the API route
 * @param messages Array of messages to send to the LLM
 * @returns ReadableStream that yields text chunks
 */
export async function streamLLMResponse(
  messages: Message[]
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    // Try to parse error response as JSON
    let errorMessage = `API error: ${response.statusText}`
    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        if (errorData.details) {
          errorMessage += ` - ${errorData.details}`
        }
      } else {
        // If not JSON, try to read as text
        const text = await response.text()
        if (text) {
          errorMessage = text
        }
      }
    } catch (e) {
      // If parsing fails, use status text
      console.error('Error parsing error response:', e)
    }
    throw new Error(errorMessage)
  }

  if (!response.body) {
    throw new Error('No response body from server')
  }

  return response.body
}

/**
 * Parses a stream chunk from the LLM API
 * @param chunk Raw chunk data
 * @returns Parsed chunk or null if invalid
 */
export function parseStreamChunk(chunk: string): StreamChunk | null {
  // Remove 'data: ' prefix if present
  const cleaned = chunk.replace(/^data: /, '').trim()

  // Skip empty chunks or [DONE] marker
  if (!cleaned || cleaned === '[DONE]') {
    return null
  }

  try {
    return JSON.parse(cleaned) as StreamChunk
  } catch (e) {
    console.error('Failed to parse chunk:', cleaned, e)
    return null
  }
}

/**
 * Extracts text content from a stream chunk
 * @param chunk Parsed stream chunk
 * @returns Text content or empty string
 */
export function extractContent(chunk: StreamChunk): string {
  return chunk.choices?.[0]?.delta?.content || ''
}

