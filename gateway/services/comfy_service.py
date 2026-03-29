import httpx
import uuid
import time
import asyncio
from utils import set_job, update_job, check_comfy_health
import urllib.parse

COMFYUI_URL = "http://127.0.0.1:8188"

def create_image_workflow(prompt: str, width: int, height: int):
    seed = int(time.time() * 1000) % 1000000000
    return {
        "3": {"class_type": "KSampler", "inputs": {"seed": seed, "steps": 20, "cfg": 8, "sampler_name": "euler", "scheduler": "normal", "denoise": 1, "model": ["4", 0], "positive": ["6", 0], "negative": ["7", 0], "latent_image": ["5", 0]}},
        "4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "sd_turbo.safetensors"}},
        "5": {"class_type": "EmptyLatentImage", "inputs": {"width": width, "height": height, "batch_size": 1}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["4", 1]}},
        "7": {"class_type": "CLIPTextEncode", "inputs": {"text": "text, watermark, blurry", "clip": ["4", 1]}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["4", 2]}},
        "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "ComfyUI", "images": ["8", 0]}}
    }

def create_video_workflow(prompt: str):
    seed = int(time.time() * 1000) % 1000000000
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "sd_turbo.safetensors"}},
        "2": {"class_type": "ADE_AnimateDiffLoaderWithContext", "inputs": {"model_name": "mm_sd_v15_v2.ckpt", "beta_schedule": "sqrt_linear (AnimateDiff)", "motion_scale": 1.0, "model": ["1", 0], "context_options": ["3", 0]}},
        "3": {"class_type": "ADE_AnimateDiffUniformContextOptions", "inputs": {"context_length": 16, "context_stride": 1, "context_overlap": 4}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["1", 1]}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"text": "bad quality, blurry", "clip": ["1", 1]}},
        "6": {"class_type": "EmptyLatentImage", "inputs": {"width": 256, "height": 256, "batch_size": 16}},
        "7": {"class_type": "KSampler", "inputs": {"seed": seed, "steps": 12, "cfg": 1.5, "sampler_name": "euler_ancestral", "scheduler": "karras", "denoise": 1, "model": ["2", 0], "positive": ["4", 0], "negative": ["5", 0], "latent_image": ["6", 0]}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["7", 0], "vae": ["1", 2]}},
        "9": {"class_type": "VHS_VideoCombine", "inputs": {"frame_rate": 8, "format": "video/h264-mp4", "filename_prefix": "AnimateDiff", "images": ["8", 0]}}
    }

async def trigger_image_job(prompt: str, width: int = 512, height: int = 512):
    await check_comfy_health(COMFYUI_URL)
    job_id = f"img_{uuid.uuid4().hex[:8]}"
    workflow = create_image_workflow(prompt, width, height)
    
    set_job(job_id, {"jobId": job_id, "status": "pending", "type": "image"})
    
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{COMFYUI_URL}/prompt", json={"prompt": workflow})
        res.raise_for_status()
        data = res.json()
        prompt_id = data.get("prompt_id")
        
        if not prompt_id:
            raise Exception("No prompt_id returned from ComfyUI")
            
        update_job(job_id, {"status": "processing", "promptId": prompt_id})
        
        # Start background polling
        asyncio.create_task(poll_comfyui(job_id, prompt_id, "image"))
        return job_id

async def trigger_video_job(prompt: str):
    await check_comfy_health(COMFYUI_URL)
    job_id = f"vid_{uuid.uuid4().hex[:8]}"
    workflow = create_video_workflow(prompt)
    
    set_job(job_id, {"jobId": job_id, "status": "pending", "type": "video"})
    
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{COMFYUI_URL}/prompt", json={"prompt": workflow})
        res.raise_for_status()
        data = res.json()
        prompt_id = data.get("prompt_id")
        
        if not prompt_id:
            raise Exception("No prompt_id returned from ComfyUI")
            
        update_job(job_id, {"status": "processing", "promptId": prompt_id})
        
        asyncio.create_task(poll_comfyui(job_id, prompt_id, "video"))
        return job_id

async def poll_comfyui(job_id: str, prompt_id: str, job_type: str):
    max_attempts = 120
    attempts = 0
    async with httpx.AsyncClient() as client:
        while attempts < max_attempts:
            await asyncio.sleep(2)
            try:
                queue_res = await client.get(f"{COMFYUI_URL}/queue")
                if queue_res.status_code == 200:
                    queue = queue_res.json()
                    in_queue = any(q[1] == prompt_id for q in queue.get("queue_running", [])) or \
                               any(q[1] == prompt_id for q in queue.get("queue_pending", []))
                    
                    if not in_queue:
                        history_res = await client.get(f"{COMFYUI_URL}/history/{prompt_id}")
                        if history_res.status_code == 200:
                            history = history_res.json()
                            if prompt_id in history:
                                outputs = history[prompt_id].get("outputs", {})
                                for node_id, node_output in outputs.items():
                                    
                                    # Handle standard image outputs (SaveImage)
                                    if "images" in node_output and len(node_output["images"]) > 0:
                                        item = node_output["images"][0]
                                        filename = item["filename"]
                                        subfolder = item.get("subfolder", "")
                                        item_type = item.get("type", "output")
                                        
                                        is_video = filename.endswith(".mp4") or filename.endswith(".webm") or filename.endswith(".gif")
                                        
                                        url = f"{COMFYUI_URL}/view?filename={urllib.parse.quote(filename)}&subfolder={urllib.parse.quote(subfolder)}&type={item_type}"
                                        if is_video:
                                            url += "&format=video"
                                            
                                        if not is_video:
                                            update_job(job_id, {"status": "completed", "imageUrl": url})
                                        else:
                                            update_job(job_id, {"status": "completed", "videoUrl": url})
                                        return
                                        
                                    # Handle video / animated diff outputs (VHS_VideoCombine)
                                    if "gifs" in node_output and len(node_output["gifs"]) > 0:
                                        item = node_output["gifs"][0]
                                        filename = item["filename"]
                                        subfolder = item.get("subfolder", "")
                                        item_type = item.get("type", "output")
                                        
                                        url = f"{COMFYUI_URL}/view?filename={urllib.parse.quote(filename)}&subfolder={urllib.parse.quote(subfolder)}&type={item_type}"
                                        
                                        update_job(job_id, {"status": "completed", "videoUrl": url})
                                        return
            except Exception as e:
                print(f"Error polling {job_id}: {e}")
            attempts += 1
            
    update_job(job_id, {"status": "failed", "error": "Generation timeout"})
