from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from services.routing_service import route_chat_request

router = APIRouter()

@router.post("")
async def chat_endpoint(request: Request):
    payload = await request.json()
    messages = payload.get("messages", [])
    
    stream_generator = await route_chat_request(messages)
    
    return StreamingResponse(
        stream_generator, 
        media_type="text/event-stream"
    )
