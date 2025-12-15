'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { ChatList } from '@/components/ChatList'
import { ChatInput } from '@/components/ChatInput'
import { Sidebar } from '@/components/Sidebar'
import { Message, streamLLMResponse, parseStreamChunk, extractContent } from '@/lib/llm'
import { Button } from '@/components/ui/button'
import { Menu, Zap } from 'lucide-react'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

        // Process SSE format
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const lines = part.split('\n')
          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue

            const chunk = parseStreamChunk(line)
            if (chunk) {
              const content = extractContent(chunk)
              if (content) {
                accumulatedContent += content
                setMessages([...newMessages, { role: 'assistant', content: accumulatedContent }])
              }
            }
          }
        }
      }

      setIsStreaming(false)
    } catch (err) {
      console.error('Streaming error:', err)
      let errorMessage = 'Failed to get response from LLM'
      if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setIsStreaming(false)
      // Keep messages but show error state if needed
      setMessages(newMessages)
    }
  }, [messages])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setError(null)
    setIsStreaming(false)
  }, [])

  return (
    <div className="flex h-[100dvh] bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans antialiased selection:bg-zinc-200 dark:selection:bg-zinc-700">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#343541] relative h-full transition-all duration-300">

        {/* Mobile Header */}
        <div className="shrink-0 flex items-center p-2 text-zinc-500 bg-white/80 dark:bg-[#343541]/80 backdrop-blur md:hidden border-b border-black/5 dark:border-white/5 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-zinc-100 dark:hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="mx-auto font-medium text-sm">New chat</div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 space-y-4 md:space-y-6 animate-in fade-in duration-500 overflow-y-auto w-full">
              {/* Empty state content */}
              <div className="bg-white dark:bg-white/10 p-3 md:p-4 rounded-full shadow-sm mb-2">
                <Zap className="h-6 w-6 md:h-8 md:w-8 text-black dark:text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-center text-zinc-800 dark:text-zinc-100 px-4">
                How can I help you today?
              </h2>
            </div>
          ) : (
            <ChatList messages={messages} isStreaming={isStreaming} />
          )}
        </div>

        {/* Input Area */}
        <div className="w-full shrink-0 pb-safe pt-2 px-2 md:px-4 bg-gradient-to-t from-white via-white to-transparent dark:from-[#343541] dark:via-[#343541] z-10">
          <div className="mx-auto max-w-3xl">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}
            <div className="relative mb-2 md:mb-4">
              <ChatInput onSend={handleSend} disabled={isStreaming} />
              <div className="text-center mt-2 hidden md:block">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  Kepler AI can make mistakes. Consider checking important information.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

