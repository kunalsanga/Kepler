job_store = {}

def set_job(job_id: str, job_data: dict):
    job_store[job_id] = job_data

def get_job(job_id: str) -> dict:
    return job_store.get(job_id)

def update_job(job_id: str, updates: dict):
    if job_id in job_store:
        job_store[job_id].update(updates)

import httpx

async def check_comfy_health(url: str):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{url}/system_stats", timeout=3.0)
            res.raise_for_status()
        except Exception as e:
            raise Exception(f"ComfyUI service at {url} is not responding.") from e
