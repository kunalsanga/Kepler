'use client'

import React, { useEffect, useState, useRef } from 'react'
import { codeToHtml } from 'shiki'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  language: string
  value: string
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('')
  // During streaming, we want to show raw code immediately, but highlight asynchronously
  // If html is empty or outgoing value, we fallback to raw view
  const [copied, setCopied] = useState(false)

  // Use a Ref to signal if we're "busy" highlighting to avoid stacking requests
  const isHighlightingRef = useRef(false)

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(() => {
      if (isHighlightingRef.current) return;
      isHighlightingRef.current = true;

      codeToHtml(value, {
        lang: language || 'text',
        theme: 'github-dark',
      })
        .then((result) => {
          if (isMounted) {
            setHtml(result)
          }
        })
        .catch((error) => {
          console.error('Code highlighting error:', error)
        })
        .finally(() => {
          isHighlightingRef.current = false;
        })
    }, 150) // Debounce by 150ms

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [value, language])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  // If we have HTML and it matches roughly the length (not perfect but decent check), use it.
  // Otherwise show raw code to ensure responsiveness.
  // Actually, standardizing on always showing whatever 'html' state has is fine, 
  // but initially it's empty so we need fallback.
  // The 'key' trick forces a re-render if needed, but here simple conditional is enough.

  return (
    <div className="my-2 md:my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-[#0d1117] text-white max-w-[85vw] md:max-w-none">
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400 lowercase">{language || 'text'}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        {html ? (
          <div
            className="p-3 md:p-4 overflow-x-auto text-xs md:text-sm font-mono [&>pre]:!bg-transparent [&>pre]:!m-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="p-3 md:p-4 overflow-x-auto text-xs md:text-sm font-mono text-zinc-300">
            <code>{value}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
