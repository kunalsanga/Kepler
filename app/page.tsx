import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-6 max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3 transition-transform hover:rotate-6">
            <Sparkles className="h-8 w-8 text-white dark:text-black" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Kepler AI
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Your intelligent creative companion.
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/chat">
            <Button size="lg" className="rounded-full text-base px-8 py-6 h-auto gap-2 bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 dark:text-black">
              Start Chatting <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="https://github.com/kunalsanga/Kepler"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="lg" className="rounded-full text-base px-6 py-6 h-auto text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              View on GitHub
            </Button>
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
        Built with Next.js & Ollama
      </div>
    </div>
  )
}

