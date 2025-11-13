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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
          <p className="text-sm">Send a message to begin chatting with the AI.</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="flex flex-col">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}

