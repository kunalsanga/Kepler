'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { Message } from '@/lib/llm'

interface ChatListProps {
  messages: Message[]
  isStreaming?: boolean
}

export function ChatList({ messages, isStreaming = false }: ChatListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Auto-scroll to bottom when new messages arrive or streaming updates
    // Use setTimeout to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [messages, isStreaming])

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
    <ScrollArea className="flex-1 h-full w-full">
      <div className="flex flex-col min-h-full">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </ScrollArea>
  )
}

