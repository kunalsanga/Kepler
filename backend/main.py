from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import base64
import os
import random
from utils import open_websocket_connection, get_images

app = FastAPI(title="Kepler AI Backend")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"

# Models
class TextRequest(BaseModel):
    prompt: str
    model: str = "qwen2.5:latest" 

class ImageRequest(BaseModel):
    prompt: str
    negative_prompt: str = "text, watermark, blurry, low quality"
    width: int = 512
    height: int = 512

class VideoRequest(BaseModel):
    prompt: str
    frames: int = 16

# Workflows loading
def load_workflow(name):
    path = os.path.join(os.path.dirname(__file__), "workflows", name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Workflow file {name} not found.")
    with open(path, "r") as f:
        return json.load(f)

# API Endpoints

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Kepler AI Backend is running"}

@app.post("/api/text")
def generate_text(req: TextRequest):
    """
    Proxy to local Ollama instance.
    """
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": req.model,
            "prompt": req.prompt,
            "stream": False
        })
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Ollama service is not reachable. Is it running?")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/image")
def generate_image(req: ImageRequest):
    """
    Generates an image via ComfyUI (SD 1.5).
    """
    try:
        ws = open_websocket_connection()
        workflow = load_workflow("image_workflow_api.json")
        
        # Mapping inputs to standard SD 1.5 workflow IDs
        if "6" in workflow: # Positive Prompt
            workflow["6"]["inputs"]["text"] = req.prompt
        if "7" in workflow: # Negative Prompt
            workflow["7"]["inputs"]["text"] = req.negative_prompt
        if "3" in workflow: # KSampler (Seed)
            workflow["3"]["inputs"]["seed"] = random.randint(1, 10000000000)
        if "5" in workflow: # Empty Latent Image (Size)
             workflow["5"]["inputs"]["width"] = req.width
             workflow["5"]["inputs"]["height"] = req.height

        files = get_images(ws, workflow)
        ws.close()
        
        if not files:
             raise HTTPException(status_code=500, detail="No images generated.")
            
        b64_img = base64.b64encode(files[0]).decode('utf-8')
        return {"image_base64": b64_img, "format": "png"}
        
    except ConnectionRefusedError:
         raise HTTPException(status_code=503, detail="ComfyUI service is not reachable on port 8188.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@app.post("/api/video")
def generate_video(req: VideoRequest):
    """
    Generates a video via ComfyUI (CogVideo).
    """
    try:
        ws = open_websocket_connection()
        workflow = load_workflow("video_workflow_api.json")

        # Dynamically update CogVideo/Text nodes
        for node_id, node_data in workflow.items():
            if node_data["class_type"] in ["CogVideoXEncodePrompt", "CLIPTextEncode", "CLIPTextEncodeSelect"]:
                 if "text" in node_data["inputs"]:
                     node_data["inputs"]["text"] = req.prompt
        
            if node_data["class_type"] in ["EmptyCogVideoLatent", "EmptyLatentImage"]:
                 if "length" in node_data["inputs"]:
                     node_data["inputs"]["length"] = req.frames
                 if "width" in node_data["inputs"]:
                     node_data["inputs"]["width"] = 384 # Optimized for 6GB
                 if "height" in node_data["inputs"]:
                     node_data["inputs"]["height"] = 384

            if "seed" in node_data["inputs"]:
                 node_data["inputs"]["seed"] = random.randint(1, 10000000000)

        files = get_images(ws, workflow)
        ws.close()
        
        if not files:
             raise HTTPException(status_code=500, detail="No video generated.")

        b64_video = base64.b64encode(files[0]).decode('utf-8')
        return {"video_base64": b64_video, "format": "mp4"} 

    except ConnectionRefusedError:
         raise HTTPException(status_code=503, detail="ComfyUI service is not reachable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
Line numbers have been added for your convenience.
