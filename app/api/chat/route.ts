/**
 * API Route: /api/chat
 * Proxies chat requests to Ollama server
 * Supports streaming responses
 */

import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const llmApiUrl = process.env.LLM_API_URL || 'http://localhost:11434'

    // Log the URL being used (for debugging)
    console.log('Using LLM API URL:', llmApiUrl)

    if (!llmApiUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'LLM_API_URL environment variable is not set',
          message: 'Please configure LLM_API_URL in your .env.local file'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let response: Response
    try {
      // Forward request to Ollama server
      // Ollama uses /api/chat endpoint (not /v1/chat/completions)
      response = await fetch(`${llmApiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5',
          messages: messages,
          stream: true,
        }),
      })
    } catch (fetchError: any) {
      // Handle connection errors (ECONNREFUSED, network errors, etc.)
      const errorMessage = fetchError?.code === 'ECONNREFUSED' 
        ? `Cannot connect to Ollama server at ${llmApiUrl}. Please ensure Ollama is running.`
        : fetchError?.message || 'Failed to connect to LLM server'
      
      console.error('Ollama connection error:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Connection failed',
          message: errorMessage,
          details: `Tried to connect to: ${llmApiUrl}/api/chat`
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!response.ok) {
      let errorText = 'Unknown error'
      try {
        errorText = await response.text()
      } catch (e) {
        // If we can't read the error text, use status text
        errorText = response.statusText
      }
      console.error('Ollama API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Ollama API request failed',
          message: `Server returned status ${response.status}`,
          details: errorText 
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!response.body) {
      return new Response(
        JSON.stringify({ error: 'No response body from Ollama API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Ollama streams JSON objects line by line (not SSE format)
    // Convert Ollama's streaming format to SSE format for the frontend
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              // Send [DONE] marker to indicate stream completion
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              controller.close()
              break
            }

            // Decode chunk and add to buffer
            buffer += decoder.decode(value, { stream: true })

            // Process complete lines (Ollama sends JSON objects, one per line)
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (!line.trim()) continue

              try {
                // Parse Ollama's JSON response
                const ollamaChunk = JSON.parse(line)
                
                // Convert to OpenAI-style SSE format for frontend compatibility
                if (ollamaChunk.message?.content) {
                  const sseChunk = {
                    id: `ollama-${Date.now()}`,
                    object: 'chat.completion.chunk',
                    created: Math.floor(Date.now() / 1000),
                    model: ollamaChunk.model || 'qwen2.5',
                    choices: [{
                      index: 0,
                      delta: {
                        content: ollamaChunk.message.content
                      },
                      finish_reason: ollamaChunk.done ? 'stop' : null
                    }]
                  }
                  
                  // Send as SSE format
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify(sseChunk)}\n\n`)
                  )
                }

                // If done, we'll close on next iteration
                if (ollamaChunk.done) {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                console.warn('Failed to parse Ollama chunk:', line, parseError)
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API route error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

