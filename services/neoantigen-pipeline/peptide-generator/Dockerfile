FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for pysam
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    zlib1g-dev \
    libbz2-dev \
    liblzma-dev \
    libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Remove build dependencies
RUN apt-get purge -y gcc && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY src/ src/

# Create scratch directory for working files
RUN mkdir -p /scratch

ENTRYPOINT ["python", "-m", "src.main"]
