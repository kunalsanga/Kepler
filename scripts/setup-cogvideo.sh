#!/bin/bash
# Setup script for CogVideo

set -e

echo "Setting up CogVideo for Kepler AI..."

# Check if CogVideo directory exists
if [ ! -d "CogVideo" ]; then
    echo "Cloning CogVideo repository..."
    git clone https://github.com/THUDM/CogVideo.git
    cd CogVideo
else
    echo "CogVideo directory exists, updating..."
    cd CogVideo
    git pull
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ CogVideo setup complete!"
echo ""
echo "Next steps:"
echo "1. Download the cogvideo2-2b model"
echo "2. Start CogVideo API with: python -m cogvideo.cli.api --port 7860 --low-resource-mode"
echo "3. Set COGVIDEO_URL=http://localhost:7860 in your .env.local"

