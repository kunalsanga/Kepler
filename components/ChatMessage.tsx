'use client'

import React from 'react'
import { Message } from '@/lib/llm'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { User, Sparkles, Copy, Check } from 'lucide-react'
import { CodeBlock } from '@/components/CodeBlock'
import { MediaDisplay } from '@/components/MediaDisplay'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

// Memoized content component to prevent unnecessary re-renders of the markdown parser
const MarkdownContent = React.memo(({ content, isStreaming }: { content: string, isStreaming: boolean }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        table({ children, className, ...props }: any) {
          return (
            <div className="overflow-x-auto my-4 border rounded-lg border-black/10 dark:border-white/10">
              <table className={cn("w-full text-left text-sm", className)} {...props}>
                {children}
              </table>
            </div>
          )
        },
        thead({ children, ...props }: any) {
          return <thead className="bg-black/5 dark:bg-white/5" {...props}>{children}</thead>
        },
        th({ children, ...props }: any) {
          return <th className="px-4 py-2 font-medium border-b border-black/10 dark:border-white/10" {...props}>{children}</th>
        },
        td({ children, ...props }: any) {
          return <td className="px-4 py-2 border-b border-black/5 dark:border-white/5 last:border-0" {...props}>{children}</td>
        },
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''

          if (!inline && language) {
            return (
              <CodeBlock
                language={language}
                value={String(children).replace(/\n$/, '')}
                {...props}
              />
            )
          }

          return (
            <code className={cn("bg-black/5 dark:bg-white/10 rounded px-1 py-0.5 font-normal text-sm before:content-[''] after:content-['']", className)} {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {content + (isStreaming ? '▍' : '')}
    </ReactMarkdown>
  )
}, (prev, next) => {
  // Only re-render if content length changes significantly or streaming state changes
  // This helps reduce jitter during rapid token streaming
  return prev.content === next.content && prev.isStreaming === next.isStreaming
})

export const ChatMessage = React.memo(function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = React.useState(false)

  // Debug logging
  console.log('ChatMessage render:', {
    role: message.role,
    type: message.type,
    hasImageUrl: !!message.imageUrl,
    url: message.imageUrl,
    content: message.content
  })

  // Fix: Force re-render if we have an image URL but type isn't image (just in case)
  // or verify type is correct.

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className={cn(
      "group w-full border-b border-black/5 dark:border-white/5",
      isUser ? "bg-white dark:bg-[#343541]" : "bg-gray-50/50 dark:bg-[#444654]"
    )}>
      <div className="mx-auto max-w-3xl p-3 md:py-6 flex gap-3 md:gap-6">
        <div className="shrink-0 flex flex-col items-center pt-1">
          {isUser ? (
            <div className="h-8 w-8 rounded-sm bg-purple-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-sm bg-green-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>

        <div className="relative flex-1 overflow-hidden min-w-0">
          {message.type === 'image' && (
            message.imageUrl ? (
              <div className="my-4">
                <img
                  src={message.imageUrl}
                  alt="Generated content"
                  className="rounded-lg max-w-full h-auto shadow-sm border border-black/5 dark:border-white/5"
                />
              </div>
            ) : (
              <MediaDisplay
                type="image"
                url={undefined}
                status="processing"
              />
            )
          )}
          {message.type === 'video' && (
            <MediaDisplay
              type="video"
              url={message.videoUrl}
              status={message.videoUrl ? 'completed' : 'processing'}
            />
          )}
          <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
            {isUser ? (
              <div className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">{message.content}</div>
            ) : (
              <MarkdownContent content={message.content} isStreaming={isStreaming} />
            )}
          </div>
        </div>

        {!isUser && !isStreaming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start mt-1">
            <button
              onClick={copyToClipboard}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              title="Copy message"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
