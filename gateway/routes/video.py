from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.comfy_service import trigger_video_job
from utils import get_job

router = APIRouter()

class VideoRequest(BaseModel):
    prompt: str
    frames: Optional[int] = None

@router.post("")
async def generate_video_route(req: VideoRequest):
    try:
        job_id = await trigger_video_job(req.prompt)
        return {"jobId": job_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{job_id}")
async def get_video_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "status": job.get("status"),
        "videoUrl": job.get("videoUrl"),
        "error": job.get("error")
    }
