FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for tensorflow-cpu and mhcflurry
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install tensorflow-cpu first to keep image smaller
RUN pip install --no-cache-dir tensorflow-cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download MHCflurry model data (~200MB)
RUN mhcflurry-downloads fetch

# Remove build dependencies
RUN apt-get purge -y gcc g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY src/ src/

# Create scratch directory for working files
RUN mkdir -p /scratch

ENTRYPOINT ["python", "-m", "src.main"]
