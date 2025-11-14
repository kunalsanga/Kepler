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

    // Get LLM_API_URL from environment
    // Allow localhost fallback for local development, but NOT on Vercel
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV
    const apiURL = process.env.LLM_API_URL || (isVercel ? undefined : 'http://localhost:11434')

    // Log the URL being used (for debugging)
    console.log('Using LLM_API_URL:', apiURL)
    console.log('Is Vercel:', isVercel)

    // Validate that LLM_API_URL is set
    if (!apiURL) {
      const errorMessage = isVercel
        ? 'LLM_API_URL environment variable is not set in Vercel. Please add it in Vercel Dashboard → Settings → Environment Variables.'
        : 'LLM_API_URL environment variable is not set. Please configure LLM_API_URL in your .env.local file'
      
      console.error('LLM_API_URL is missing!', { isVercel })
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          message: errorMessage,
          details: 'The LLM_API_URL environment variable must be set to connect to your Ollama server.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Prevent localhost usage on Vercel (it won't work)
    const isLocalhost = apiURL.includes('localhost') || apiURL.includes('127.0.0.1')
    
    if (isVercel && isLocalhost) {
      console.error('Invalid configuration: Vercel cannot access localhost!', { apiURL, isVercel })
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error',
          message: 'LLM_API_URL cannot be localhost on Vercel. You must expose your local Ollama via Cloudflare Tunnel and set LLM_API_URL to the tunnel URL.',
          details: `Current LLM_API_URL: ${apiURL}. Please update it in Vercel Dashboard → Settings → Environment Variables to your Cloudflare Tunnel URL (e.g., https://xxxxx.trycloudflare.com)`
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let response: Response
    try {
      // Forward request to Ollama server
      // Ollama uses /api/chat endpoint (not /v1/chat/completions)
      const fetchURL = `${apiURL}/api/chat`
      console.log('Fetching from:', fetchURL)
      response = await fetch(fetchURL, {
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
      const isLocalhost = apiURL.includes('localhost') || apiURL.includes('127.0.0.1')
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV
      
      let errorMessage = fetchError?.message || 'Failed to connect to LLM server'
      
      if (fetchError?.code === 'ECONNREFUSED' || fetchError?.message?.includes('ECONNREFUSED')) {
        if (isVercel && isLocalhost) {
          errorMessage = `Cannot connect to Ollama server. You're on Vercel trying to connect to localhost (${apiURL}), which won't work. You need to expose your local Ollama via Cloudflare Tunnel and set LLM_API_URL to the tunnel URL in Vercel environment variables.`
        } else {
          errorMessage = `Cannot connect to Ollama server at ${apiURL}. Please ensure Ollama is running and accessible.`
        }
      }
      
      console.error('Ollama connection error:', fetchError)
      console.error('LLM_API_URL:', apiURL)
      console.error('Is Vercel:', isVercel)
      console.error('Is localhost:', isLocalhost)
      console.error('Fetch URL attempted:', `${apiURL}/api/chat`)
      
      return new Response(
        JSON.stringify({ 
          error: 'Connection failed',
          message: errorMessage,
          details: `Tried to connect to: ${apiURL}/api/chat${isVercel && isLocalhost ? ' (Vercel cannot access localhost - use Cloudflare Tunnel)' : ''}`
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

