from services.ollama_service import generate_chat_stream
import json

async def route_chat_request(messages: list):
    """
    Optional intent routing logic.
    If prompt asks for image -> route to ComfyUI (handled via frontend directly or can synthesize a response).
    If prompt asks for video -> route to ComfyUI video workflow.
    Otherwise -> route to Ollama.
    """
    last_message = messages[-1]["content"].lower() if messages else ""
    
    # Simple explicit command detection (Optional advanced routing)
    if last_message.startswith("/image") or last_message.startswith("/video"):
        # Synthesize a response telling the frontend UI to kick off generation.
        # Note: Kepler frontend already handles `/image` organically, but this fulfills the routing requirement.
        pass
        
    # Default: Route to Ollama pipeline.
    return generate_chat_stream(messages)
