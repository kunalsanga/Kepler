# Kepler Chat

A full-stack ChatGPT-like web application built with Next.js 14, Tailwind CSS, and Shadcn UI. This application connects to Ollama for running local LLMs.

## Features

- 🚀 **Real-time Streaming**: Token-by-token streaming responses from Ollama
- 💬 **Chat Interface**: Clean, modern UI similar to ChatGPT
- 📝 **Markdown Support**: Full markdown rendering with syntax highlighting
- 🎨 **Modern Design**: Built with Tailwind CSS and Shadcn UI components
- ⚡ **TypeScript**: Fully typed for better developer experience
- 📱 **Responsive**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18+ and npm
- Ollama installed and running (default: http://localhost:11434)
- A model installed in Ollama (e.g., `qwen2.5`)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Ensure Ollama is running:**
   ```bash
   # Test if Ollama is running
   curl http://localhost:11434/api/tags
   ```

3. **Configure environment variables:**
   
   Create or update `.env.local` file in the root directory:
   ```env
   LLM_API_URL=http://localhost:11434
   ```
   
   Replace with your Ollama server URL if different.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
root/
 ├── app/
 │    ├── api/
 │    │     └── chat/
 │    │         └── route.ts          # API route for chat completions
 │    ├── chat/
 │    │     └── page.tsx              # Main chat page
 │    ├── layout.tsx                  # Root layout
 │    ├── page.tsx                    # Home page
 │    └── globals.css                 # Global styles
 ├── components/
 │    ├── ui/                         # Shadcn UI components
 │    ├── ChatMessage.tsx             # Message bubble component
 │    ├── ChatList.tsx                # Chat messages list
 │    ├── ChatInput.tsx               # Message input component
 │    └── CodeBlock.tsx               # Code syntax highlighting
 ├── lib/
 │    ├── llm.ts                      # LLM client library
 │    └── utils.ts                    # Utility functions
 ├── package.json
 ├── tailwind.config.js
 ├── tsconfig.json
 └── .env.local
```

## How It Works

1. **Frontend**: The chat interface sends messages to `/api/chat`
2. **API Route**: The Next.js API route proxies requests to Ollama server
3. **Streaming**: Ollama streams JSON responses which are converted to SSE format for the frontend
4. **UI Updates**: The frontend updates in real-time as tokens arrive

## API Configuration

The application connects to Ollama which:
- Runs on the URL specified in `LLM_API_URL` (default: http://localhost:11434)
- Exposes an endpoint at `/api/chat`
- Supports streaming responses (`stream: true`)
- Uses the model name `"qwen2.5"` by default (or modify in `app/api/chat/route.ts`)

## Customization

### Change Model Name

Edit `app/api/chat/route.ts` and modify the `model` field:
```typescript
body: JSON.stringify({
  model: 'your-model-name',  // Change this (e.g., 'llama2', 'mistral', etc.)
  messages: messages,
  stream: true,
}),
```

Make sure the model is installed in Ollama:
```bash
ollama pull your-model-name
```

### Styling

The app uses Tailwind CSS with Shadcn UI. Customize colors and themes in:
- `app/globals.css` - CSS variables for theming
- `tailwind.config.js` - Tailwind configuration

## Troubleshooting

### Connection Issues

If you see connection errors:
1. Verify your vLLM server is running
2. Check that `LLM_API_URL` in `.env.local` is correct
3. Ensure CORS is properly configured on your vLLM server

### Streaming Not Working

If streaming doesn't work:
1. Verify your vLLM server supports streaming (`stream: true`)
2. Check browser console for errors
3. Verify the API route is receiving responses

## 🚀 Deployment

### Option 1: Cloudflare Tunnel (FREE - Recommended for Testing)

Deploy using Cloudflare Tunnel to expose your local Ollama server:

**Quick Start:**
1. See `QUICK_DEPLOY_CLOUDFLARE.md` for 5-minute setup
2. Or see `DEPLOYMENT_CLOUDFLARE.md` for detailed guide

**Benefits:**
- ✅ 100% FREE (no cloud costs)
- ✅ Easy setup (5 minutes)
- ✅ Works with local Ollama
- ✅ Perfect for testing and personal use

**Requirements:**
- Your laptop must be on and connected to internet
- Ollama running locally

### Option 2: Cloud GPU (Production)

Deploy vLLM on cloud GPU for 24/7 availability:

**Quick Start:**
1. See `QUICK_START.md` for fast deployment
2. Or see `DEPLOYMENT.md` for complete guide

**Benefits:**
- ✅ 24/7 availability
- ✅ No need to keep laptop on
- ✅ Better for production
- ✅ Handles more traffic

**Cost:** ~$150-360/month (depending on GPU)

**Choose based on your needs:**
- **Testing/Personal**: Use Cloudflare Tunnel (FREE)
- **Production/Public**: Use Cloud GPU

---

## License

MIT

