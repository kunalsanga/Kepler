'use client'

import React from 'react'
import { Loader2, Image as ImageIcon, Video, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaDisplayProps {
  type: 'image' | 'video'
  url?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

export function MediaDisplay({ type, url, status, error }: MediaDisplayProps) {
  if (status === 'failed') {
    const isServiceError = error?.includes('not running') || error?.includes('START_GENERATION_SERVICES')
    return (
      <div className="my-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-start gap-2 text-red-500">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">{error || 'Generation failed'}</p>
            {isServiceError && (
              <p className="text-xs mt-2 text-red-400">
                💡 Tip: Run <code className="bg-red-500/20 px-1 rounded">START_GENERATION_SERVICES.bat</code> to start the generation services
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'pending' || status === 'processing') {
    return (
      <div className="my-4 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex flex-col items-center justify-center gap-3 min-h-[200px]">
        {type === 'image' ? (
          <ImageIcon className="h-8 w-8 text-zinc-400 animate-pulse" />
        ) : (
          <Video className="h-8 w-8 text-zinc-400 animate-pulse" />
        )}
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{status === 'pending' ? 'Starting generation...' : 'Generating...'}</span>
        </div>
      </div>
    )
  }

  if (status === 'completed' && url) {
    if (type === 'image') {
      return (
        <div className="my-4">
          <img
            src={url}
            alt="Generated"
            className="max-w-full rounded-lg border border-zinc-200 dark:border-zinc-700"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.png'
            }}
          />
        </div>
      )
    } else {
      return (
        <div className="my-4">
          <video
            src={url}
            controls
            className="max-w-full rounded-lg border border-zinc-200 dark:border-zinc-700"
            onError={(e) => {
              console.error('Video load error:', e)
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }
  }

  return null
}

