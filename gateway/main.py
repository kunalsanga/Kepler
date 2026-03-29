import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, image, video

app = FastAPI(title="Kepler AI Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(image.router, prefix="/image", tags=["image"])
app.include_router(video.router, prefix="/video", tags=["video"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
