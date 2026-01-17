"""
Service Manager for Kepler AI
Automatically starts and manages ComfyUI and CogVideo services
"""

import subprocess
import time
import os
import sys
import signal
from pathlib import Path

class ServiceManager:
    def __init__(self):
        self.processes = {}
        self.base_dir = Path(__file__).parent.parent
        
    def start_comfyui(self):
        """Start ComfyUI service"""
        comfyui_dir = self.base_dir / "ComfyUI"
        
        if not comfyui_dir.exists():
            print("[WARNING] ComfyUI directory not found. Skipping ComfyUI startup.")
            print("          Run: .\\scripts\\setup-comfyui.ps1")
            return None
        
        print("[INFO] Starting ComfyUI...")
        try:
            process = subprocess.Popen(
                [sys.executable, "main.py", "--port", "8188", "--lowvram"],
                cwd=str(comfyui_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
            )
            self.processes['comfyui'] = process
            print("[OK] ComfyUI started (PID: {})".format(process.pid))
            time.sleep(3)  # Give it time to start
            return process
        except Exception as e:
            print("[ERROR] Failed to start ComfyUI: {}".format(e))
            return None
    
    def start_cogvideo(self):
        """Start CogVideo service"""
        cogvideo_dir = self.base_dir / "CogVideo"
        
        if not cogvideo_dir.exists():
            print("[WARNING] CogVideo directory not found. Skipping CogVideo startup.")
            print("          Run: .\\scripts\\setup-cogvideo.ps1")
            return None
        
        print("[INFO] Starting CogVideo...")
        try:
            process = subprocess.Popen(
                [sys.executable, "-m", "cogvideo.cli.api", "--port", "7860", "--low-resource-mode"],
                cwd=str(cogvideo_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
            )
            self.processes['cogvideo'] = process
            print("[OK] CogVideo started (PID: {})".format(process.pid))
            time.sleep(3)  # Give it time to start
            return process
        except Exception as e:
            print("[ERROR] Failed to start CogVideo: {}".format(e))
            return None
    
    def stop_all(self):
        """Stop all managed services"""
        print("\n[INFO] Stopping services...")
        for name, process in self.processes.items():
            if process and process.poll() is None:
                print("[INFO] Stopping {}...".format(name))
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                print("[OK] {} stopped".format(name))
    
    def check_services(self):
        """Check if services are running"""
        import requests
        
        services = {
            'ComfyUI': 'http://localhost:8188',
            'CogVideo': 'http://localhost:7860'
        }
        
        print("\n[INFO] Checking services...")
        for name, url in services.items():
            try:
                response = requests.get(url, timeout=2)
                print("[OK] {} is running".format(name))
            except:
                print("[WARN] {} is not responding".format(name))

if __name__ == "__main__":
    manager = ServiceManager()
    
    # Handle shutdown gracefully
    def signal_handler(sig, frame):
        manager.stop_all()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start services
    print("=" * 50)
    print("Kepler AI Service Manager")
    print("=" * 50)
    print()
    
    manager.start_comfyui()
    manager.start_cogvideo()
    
    print()
    print("=" * 50)
    print("Services started. Press Ctrl+C to stop.")
    print("=" * 50)
    print()
    
    # Keep running
    try:
        while True:
            time.sleep(1)
            # Check if processes are still alive
            for name, process in list(manager.processes.items()):
                if process and process.poll() is not None:
                    print("[WARN] {} process died (exit code: {})".format(name, process.returncode))
                    manager.processes.pop(name, None)
    except KeyboardInterrupt:
        pass
    finally:
        manager.stop_all()

