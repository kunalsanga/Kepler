'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ChatMessage } from './ChatMessage'
import { Message } from '@/lib/llm'
import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatListProps {
  messages: Message[]
  isStreaming?: boolean
}

export function ChatList({ messages, isStreaming = false }: ChatListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100

    // Update auto-scroll state based on user position
    setShouldAutoScroll(isAtBottom)
    setShowScrollButton(!isAtBottom)
  }

  // Auto-scroll effect
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'instant' // Use instant for streaming to avoid "shaking"
      })
    }
  }, [messages, isStreaming, shouldAutoScroll])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
      setShouldAutoScroll(true)
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center text-muted-foreground">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">Start a conversation</h2>
          <p className="text-xs md:text-sm">Send a message to begin chatting with the AI.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 h-full overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto scrollbar-hide px-2 md:px-0"
      >
        <div className="flex flex-col min-h-full pb-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 h-8 w-8 rounded-full shadow-md bg-white/80 dark:bg-black/50 backdrop-blur hover:bg-white dark:hover:bg-black border border-black/5 dark:border-white/10 z-10 animate-in fade-in zoom-in duration-200"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

