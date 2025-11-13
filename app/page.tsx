import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center">
          <MessageSquare className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Kepler Chat</h1>
        <p className="text-xl text-muted-foreground">
          A ChatGPT-like interface powered by your custom LLM
        </p>
        <div className="pt-4">
          <Link href="/chat">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Chatting
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

