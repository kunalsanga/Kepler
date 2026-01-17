#!/bin/bash
# Setup script for ComfyUI

set -e

echo "Setting up ComfyUI for Kepler AI..."

# Check if ComfyUI directory exists
if [ ! -d "ComfyUI" ]; then
    echo "Cloning ComfyUI repository..."
    git clone https://github.com/comfyanonymous/ComfyUI.git
    cd ComfyUI
else
    echo "ComfyUI directory exists, updating..."
    cd ComfyUI
    git pull
fi

# Install dependencies
echo "Installing dependencies..."
echo "Installing PyTorch with CUDA support..."
pip uninstall torch torchvision torchaudio -y
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu130
echo "Installing ComfyUI requirements..."
pip install -r requirements.txt

# Create models directory if it doesn't exist
mkdir -p models/checkpoints

echo ""
echo "✅ ComfyUI setup complete!"
echo ""
echo "Next steps:"
echo "1. Download a model (e.g., sd-turbo) to ComfyUI/models/checkpoints/"
echo "2. Start ComfyUI with: python main.py --port 8188 --lowvram"
echo "3. Set COMFYUI_URL=http://localhost:8188 in your .env.local"

