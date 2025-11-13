/**
 * API Route: /api/chat (vLLM Version)
 * Proxies chat requests to vLLM server (OpenAI-compatible)
 * Supports streaming responses
 * 
 * This version works with vLLM which uses OpenAI-compatible API format
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

    const llmApiUrl = process.env.LLM_API_URL || 'http://localhost:8000'
    const apiKey = process.env.LLM_API_KEY // Optional API key for vLLM

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
      // Forward request to vLLM server (OpenAI-compatible format)
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Add API key if configured
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      response = await fetch(`${llmApiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: process.env.LLM_MODEL_NAME || 'Qwen2.5-7B-Instruct',
          messages: messages,
          stream: true,
          temperature: 0.7,
        }),
      })
    } catch (fetchError: any) {
      // Handle connection errors (ECONNREFUSED, network errors, etc.)
      const errorMessage = fetchError?.code === 'ECONNREFUSED' 
        ? `Cannot connect to vLLM server at ${llmApiUrl}. Please ensure your vLLM server is running.`
        : fetchError?.message || 'Failed to connect to LLM server'
      
      console.error('vLLM connection error:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Connection failed',
          message: errorMessage,
          details: `Tried to connect to: ${llmApiUrl}/v1/chat/completions`
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
        errorText = response.statusText
      }
      console.error('vLLM API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'vLLM API request failed',
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
        JSON.stringify({ error: 'No response body from vLLM API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // vLLM uses OpenAI-compatible SSE format, so we can forward it directly
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              controller.close()
              break
            }

            // Forward chunks as-is (vLLM already uses SSE format)
            const chunk = decoder.decode(value, { stream: true })
            controller.enqueue(new TextEncoder().encode(chunk))
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

