import httpx
import json

OLLAMA_URL = "http://127.0.0.1:11434"

async def generate_chat_stream(messages: list):
    async with httpx.AsyncClient() as client:
        payload = {
            "model": "qwen2.5", # Standard LLM used in this project
            "messages": messages,
            "stream": True
        }
        
        async with client.stream("POST", f"{OLLAMA_URL}/api/chat", json=payload, timeout=120) as response:
            if response.status_code != 200:
                error_text = await response.aread()
                yield f"data: {json.dumps({'error': error_text.decode('utf-8')})}\n\n"
                return

            async for line in response.aiter_lines():
                if line.strip():
                    try:
                        chunk = json.loads(line)
                        # Translate Ollama's NDJSON representation into standard OpenAI SSE layout
                        # Ollama output format: {"model":"...","message":{"role":"...","content":"..."},"done":false}
                        content = chunk.get("message", {}).get("content", "")
                        sse_chunk = {
                            "choices": [{"delta": {"content": content}}]
                        }
                        yield f"data: {json.dumps(sse_chunk)}\n\n"
                    except Exception as e:
                        print("Error parsing chunk:", e)
                        pass
            yield "data: [DONE]\n\n"
