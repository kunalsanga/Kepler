'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Message Kepler AI..."
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="w-full relative">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 p-3 border border-black/10 dark:border-white/10 bg-white dark:bg-[#40414f] rounded-xl shadow-md dark:shadow-none focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:ring-white/10 transition-all"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 max-h-[200px] min-h-[24px] py-1 px-1 bg-transparent border-none resize-none",
            "text-base focus:ring-0 focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            "text-zinc-800 dark:text-zinc-100 scrollbar-hide"
          )}
          style={{ overflowY: 'hidden' }}
        />
        <Button
          type="submit"
          disabled={!input.trim() || disabled}
          size="icon"
          className={cn(
            "h-8 w-8 rounded-lg transition-colors flex-shrink-0 mb-0.5",
            input.trim()
              ? "bg-black dark:bg-green-500 hover:bg-black/80 dark:hover:bg-green-600 text-white"
              : "bg-transparent text-zinc-300 dark:text-zinc-500 cursor-not-allowed hover:bg-transparent"
          )}
        >
          <ArrowUp className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  )
}
