import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="text-center space-y-6 md:space-y-8 max-w-3xl w-full">
        <div className="flex justify-center">
          <div className="relative">
            <Sparkles className="h-16 w-16 md:h-20 md:w-20 text-primary" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          </div>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Kepler AI
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto">
            Intelligent conversations powered by advanced language models. 
            Experience seamless AI interactions with privacy and control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-6">
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30">
            <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
            <h3 className="font-semibold text-sm md:text-base mb-1">Fast & Responsive</h3>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Real-time streaming responses
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30">
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
            <h3 className="font-semibold text-sm md:text-base mb-1">Private & Secure</h3>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Your data stays under your control
            </p>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary mb-2" />
            <h3 className="font-semibold text-sm md:text-base mb-1">Powerful AI</h3>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Advanced language understanding
            </p>
          </div>
        </div>

        <div className="pt-4 md:pt-6">
          <Link href="/chat">
            <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-6 md:py-7 w-full md:w-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

