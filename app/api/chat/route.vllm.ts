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

    // Get LLM_API_URL from environment
    // Allow localhost fallback for local development, but NOT on Vercel
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV
    const apiURL = process.env.LLM_API_URL || (isVercel ? undefined : 'http://localhost:8000')
    const apiKey = process.env.LLM_API_KEY // Optional API key for vLLM

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
          details: 'The LLM_API_URL environment variable must be set to connect to your vLLM server.'
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
          message: 'LLM_API_URL cannot be localhost on Vercel. You must expose your local vLLM server via Cloudflare Tunnel and set LLM_API_URL to the tunnel URL.',
          details: `Current LLM_API_URL: ${apiURL}. Please update it in Vercel Dashboard → Settings → Environment Variables to your Cloudflare Tunnel URL (e.g., https://xxxxx.trycloudflare.com)`
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

      const fetchURL = `${apiURL}/v1/chat/completions`
      console.log('Fetching from:', fetchURL)
      response = await fetch(fetchURL, {
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
      const isLocalhost = apiURL.includes('localhost') || apiURL.includes('127.0.0.1')
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV
      
      let errorMessage = fetchError?.message || 'Failed to connect to LLM server'
      
      if (fetchError?.code === 'ECONNREFUSED' || fetchError?.message?.includes('ECONNREFUSED')) {
        if (isVercel && isLocalhost) {
          errorMessage = `Cannot connect to vLLM server. You're on Vercel trying to connect to localhost (${apiURL}), which won't work. You need to expose your local vLLM server via Cloudflare Tunnel and set LLM_API_URL to the tunnel URL in Vercel environment variables.`
        } else {
          errorMessage = `Cannot connect to vLLM server at ${apiURL}. Please ensure your vLLM server is running and accessible.`
        }
      }
      
      console.error('vLLM connection error:', fetchError)
      console.error('LLM_API_URL:', apiURL)
      console.error('Is Vercel:', isVercel)
      console.error('Is localhost:', isLocalhost)
      console.error('Fetch URL attempted:', `${apiURL}/v1/chat/completions`)
      
      return new Response(
        JSON.stringify({ 
          error: 'Connection failed',
          message: errorMessage,
          details: `Tried to connect to: ${apiURL}/v1/chat/completions${isVercel && isLocalhost ? ' (Vercel cannot access localhost - use Cloudflare Tunnel)' : ''}`
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

