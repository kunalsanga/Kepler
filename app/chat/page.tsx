'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { ChatList } from '@/components/ChatList'
import { ChatInput } from '@/components/ChatInput'
import { Message, streamLLMResponse, parseStreamChunk, extractContent } from '@/lib/llm'
import { Button } from '@/components/ui/button'
import { Plus, X, AlertCircle, CheckCircle2, Menu } from 'lucide-react'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try a simple health check or just set as disconnected if we haven't tested yet
        setConnectionStatus('disconnected')
      } catch (e) {
        setConnectionStatus('disconnected')
      }
    }
    checkConnection()
  }, [])

  const handleSend = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsStreaming(true)
    setError(null)

    // Add empty assistant message that will be updated as stream arrives
    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMessage])

      try {
        const stream = await streamLLMResponse(newMessages)
        const reader = stream.getReader()
        const decoder = new TextDecoder()

        let buffer = ''
        let accumulatedContent = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            break
          }

          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true })

          // Process SSE format: lines starting with "data: " followed by JSON or [DONE]
          // SSE events are separated by double newlines
          const parts = buffer.split('\n\n')
          buffer = parts.pop() || '' // Keep incomplete event in buffer

          for (const part of parts) {
            // Each part may contain multiple lines, but we only care about "data: " lines
            const lines = part.split('\n')
            for (const line of lines) {
              if (!line.trim() || !line.startsWith('data: ')) continue

              const chunk = parseStreamChunk(line)
              if (chunk) {
                const content = extractContent(chunk)
                if (content) {
                  accumulatedContent += content
                  // Update the last message (assistant message) with accumulated content
                  setMessages([...newMessages, { role: 'assistant', content: accumulatedContent }])
                }
              }
            }
          }
        }

        setIsStreaming(false)
    } catch (err) {
      console.error('Streaming error:', err)
      
      // Try to extract error message from response if available
      let errorMessage = 'Failed to get response from LLM'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      
      // Check if it's a connection error
      if (errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Connection failed') || errorMessage.includes('Cannot connect')) {
        // Detect if we're on Vercel (production deployment)
        const isVercel = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel.com'))
        
        if (isVercel) {
          errorMessage = 'Cannot connect to Ollama server. This is a Vercel deployment - you need to expose your local Ollama via Cloudflare Tunnel and set LLM_API_URL in Vercel environment variables.'
        } else {
          errorMessage = 'Cannot connect to Ollama server. Please ensure Ollama is running and LLM_API_URL is correctly configured in .env.local'
        }
      }
      
      setError(errorMessage)
      setIsStreaming(false)
      setConnectionStatus('disconnected')
      // Remove the empty assistant message on error
      setMessages(newMessages)
    }
  }, [messages])

  // Update connection status on successful message send
  useEffect(() => {
    if (messages.length > 0 && !isStreaming && !error) {
      setConnectionStatus('connected')
    }
  }, [messages, isStreaming, error])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setError(null)
    setIsStreaming(false)
  }, [])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Conversation History */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-auto
        w-64 border-r border-border bg-muted/30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-3 md:p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2 mb-2 md:mb-0">
            <Button
              onClick={handleNewChat}
              className="flex-1 justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
              <span className="sm:hidden">New</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {/* Conversation history would go here */}
          <p className="text-xs text-muted-foreground px-2 py-4">
            Conversation history will appear here
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border px-3 md:px-4 py-2 md:py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-base md:text-lg font-semibold">Chat</h1>
          </div>
          <div className="flex items-center gap-1 md:gap-2 text-xs">
            {connectionStatus === 'connected' ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3 md:h-3 md:w-3" />
                <span className="hidden sm:inline">Connected</span>
              </div>
            ) : connectionStatus === 'disconnected' ? (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3 md:h-3 md:w-3" />
                <span className="hidden sm:inline">Disconnected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <div className="h-3 w-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                <span className="hidden sm:inline">Checking...</span>
              </div>
            )}
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border-b border-border flex items-start justify-between gap-2 shrink-0 max-h-[40vh] md:max-h-none overflow-y-auto">
            <div className="flex-1 min-w-0">
              <div className="font-semibold mb-1 text-sm md:text-base">Connection Error</div>
              <div className="text-xs opacity-90 break-words">{error}</div>
              <div className="text-xs mt-2 opacity-75 hidden md:block">
                <strong>To fix this:</strong>
                {typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel.com')) ? (
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li><strong>For Vercel deployment:</strong> You need to expose your local Ollama via Cloudflare Tunnel</li>
                    <li>1. Run: <code className="bg-muted px-1 rounded">.\cloudflared.exe tunnel --url http://localhost:11434</code></li>
                    <li>2. Copy the tunnel URL (e.g., https://xxxxx.trycloudflare.com)</li>
                    <li>3. Go to Vercel Dashboard → Settings → Environment Variables</li>
                    <li>4. Add/Update: <code className="bg-muted px-1 rounded">LLM_API_URL</code> = your tunnel URL</li>
                    <li>5. Redeploy your Vercel project (Deployments → Redeploy)</li>
                    <li>6. Keep the tunnel running while using the app</li>
                    <li>See <code className="bg-muted px-1 rounded">QUICK_DEPLOY_CLOUDFLARE.md</code> for detailed instructions</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Ensure Ollama server is running (default: http://localhost:11434)</li>
                    <li>Check that LLM_API_URL in .env.local matches your Ollama server URL</li>
                    <li>Default URL: http://localhost:11434</li>
                    <li>Restart the Next.js dev server after changing .env.local</li>
                    <li>Test Ollama with: curl http://localhost:11434/api/tags</li>
                  </ul>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 md:h-6 md:w-6 flex-shrink-0"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Chat Messages */}
        <ChatList messages={messages} isStreaming={isStreaming} />

        {/* Input Area */}
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </main>
    </div>
  )
}

