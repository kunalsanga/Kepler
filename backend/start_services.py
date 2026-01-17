"""
Quick start script for services
Starts ComfyUI and CogVideo in background
"""

import subprocess
import sys
import os
from pathlib import Path

base_dir = Path(__file__).parent.parent

def start_service(name, command, cwd):
    """Start a service in a new window"""
    if not cwd.exists():
        print(f"[SKIP] {name} directory not found: {cwd}")
        return
    
    if sys.platform == "win32":
        subprocess.Popen(
            ["cmd", "/k", "cd", str(cwd), "&&"] + command,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        subprocess.Popen(
            command,
            cwd=str(cwd),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

if __name__ == "__main__":
    print("Starting Kepler AI Services...")
    print()
    
    # Start ComfyUI
    comfyui_dir = base_dir / "ComfyUI"
    if comfyui_dir.exists():
        print("[OK] Starting ComfyUI...")
        start_service("ComfyUI", [sys.executable, "main.py", "--port", "8188", "--lowvram"], comfyui_dir)
    else:
        print("[SKIP] ComfyUI not found")
    
    # Start CogVideo
    cogvideo_dir = base_dir / "CogVideo"
    if cogvideo_dir.exists():
        print("[OK] Starting CogVideo...")
        start_service("CogVideo", [sys.executable, "-m", "cogvideo.cli.api", "--port", "7860", "--low-resource-mode"], cogvideo_dir)
    else:
        print("[SKIP] CogVideo not found")
    
    print()
    print("Services started in separate windows.")
    print("You can close this window.")

