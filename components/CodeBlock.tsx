'use client'

import React, { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  language: string
  code: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    })
      .then((result) => {
        if (isMounted) {
          setHtml(result)
          setIsLoading(false)
        }
      })
      .catch((error) => {
        console.error('Code highlighting error:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [code, language])

  if (isLoading) {
    return (
      <div className="bg-muted rounded-lg p-4 my-4">
        <pre className="text-sm overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border">
      <div className="bg-muted px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
      </div>
      <div
        className="overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
      />
    </div>
  )
}

