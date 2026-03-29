from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.comfy_service import trigger_image_job
from utils import get_job

router = APIRouter()

class ImageRequest(BaseModel):
    prompt: str
    width: Optional[int] = 512
    height: Optional[int] = 512

@router.post("")
async def generate_image_route(req: ImageRequest):
    try:
        job_id = await trigger_image_job(req.prompt, req.width, req.height)
        return {"jobId": job_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{job_id}")
async def get_image_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "status": job.get("status"),
        "imageUrl": job.get("imageUrl"),
        "error": job.get("error")
    }
