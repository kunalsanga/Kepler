'use client'

import React, { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Message } from '@/lib/llm'
import { CodeBlock } from './CodeBlock'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        'flex w-full items-start gap-2 md:gap-4 px-3 md:px-4 py-4 md:py-6',
        isUser && 'bg-muted/30',
        isAssistant && 'bg-background'
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs md:text-sm">
            U
          </div>
        ) : (
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-xs md:text-sm">
            AI
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="text-foreground whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ children }: any) => {
                    // Extract code from pre > code structure
                    const codeElement = React.Children.toArray(children).find(
                      (child: any) => child?.type === 'code'
                    ) as any
    
                    if (codeElement?.props) {
                      const { className, children: codeChildren } = codeElement.props
                      const match = /language-(\w+)/.exec(className || '')
                      const language = match ? match[1] : ''
                      const codeString = Array.isArray(codeChildren)
                        ? codeChildren.join('')
                        : String(codeChildren).replace(/\n$/, '')
                      
                      if (language) {
                        return <CodeBlock language={language} code={codeString} />
                      }
                    }
                    
                    return <pre className="bg-muted rounded-lg p-4 my-4 overflow-x-auto">{children}</pre>
                  },
                  code({ node, inline, className, children, ...props }: any) {
                    // Only handle inline code here, block code is handled by pre component
                    if (inline) {
                      return (
                        <code className={cn('bg-muted px-1.5 py-0.5 rounded text-sm', className)} {...props}>
                          {children}
                        </code>
                      )
                    }
                    // For block code, return as-is (pre component will handle it)
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  p: ({ children }: any) => <p className="mb-4 last:mb-0">{children}</p>,
                  ul: ({ children }: any) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
                  ol: ({ children }: any) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
                  li: ({ children }: any) => <li className="mb-1">{children}</li>,
                  h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                  h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                  h3: ({ children }: any) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
                  blockquote: ({ children }: any) => (
                    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }: any) => (
                    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-foreground animate-pulse ml-1" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

