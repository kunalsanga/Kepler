# vLLM Dockerfile
# Build: docker build -t vllm-server -f docker/vllm.Dockerfile .
# Run: docker run --gpus all -p 8000:8000 vllm-server

FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install --no-cache-dir \
    vllm \
    fastapi \
    uvicorn \
    huggingface-hub

# Create models directory
RUN mkdir -p /app/models

# Expose port
EXPOSE 8000

# Environment variables
ENV MODEL_PATH=/app/models
ENV PORT=8000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/v1/models || exit 1

# Start vLLM server
# Note: Mount your model directory as a volume
# docker run --gpus all -p 8000:8000 -v /path/to/models:/app/models vllm-server
CMD ["sh", "-c", "vllm serve ${MODEL_PATH} --host ${HOST} --port ${PORT} --openai-api"]

