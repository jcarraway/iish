FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ src/

# Create scratch directory for working files
RUN mkdir -p /scratch

ENTRYPOINT ["python", "-m", "src.main"]
