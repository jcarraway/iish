#!/usr/bin/env bash
#
# Setup Reference Genome for OncoVax Pipeline
#
# Downloads GRCh38 reference genome and VEP cache, indexes them,
# and uploads to the pipeline S3 bucket.
#
# Prerequisites:
#   - bwa-mem2 (https://github.com/bwa-mem2/bwa-mem2)
#   - samtools (>= 1.15)
#   - awscli (>= 2.0)
#   - ~25GB free disk space
#
# Usage:
#   ./scripts/setup-reference-genome.sh
#
# Environment variables:
#   AWS_S3_PIPELINE_BUCKET - S3 bucket for pipeline data (required)
#   AWS_REGION             - AWS region (default: us-east-1)
#   WORK_DIR               - Working directory (default: /tmp/reference-genome)
#

set -euo pipefail

BUCKET="${AWS_S3_PIPELINE_BUCKET:?AWS_S3_PIPELINE_BUCKET is required}"
REGION="${AWS_REGION:-us-east-1}"
WORK_DIR="${WORK_DIR:-/tmp/reference-genome}"
S3_PREFIX="reference/GRCh38"

REFERENCE_URL="https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/000/001/405/GCA_000001405.15_GRCh38/seqs_for_alignment_pipelines.ucsc_ids/GCA_000001405.15_GRCh38_no_alt_analysis_set.fna.gz"
VEP_CACHE_URL="https://ftp.ensembl.org/pub/release-112/variation/vep/homo_sapiens_vep_112_GRCh38.tar.gz"

echo "=== OncoVax Reference Genome Setup ==="
echo "Bucket: s3://${BUCKET}/${S3_PREFIX}"
echo "Work dir: ${WORK_DIR}"
echo ""

# Check prerequisites
for cmd in bwa-mem2 samtools aws; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd is required but not installed."
    exit 1
  fi
done

mkdir -p "${WORK_DIR}"
cd "${WORK_DIR}"

# Step 1: Download GRCh38 reference
echo "[1/7] Downloading GRCh38 reference genome (~3GB)..."
if [ ! -f "GRCh38.fa" ]; then
  curl -L -o GRCh38.fa.gz "${REFERENCE_URL}"
  gunzip GRCh38.fa.gz
  echo "  Downloaded and decompressed."
else
  echo "  Already exists, skipping."
fi

# Step 2: Download VEP cache
echo "[2/7] Downloading Ensembl VEP cache (~15GB)..."
if [ ! -d "vep_cache" ]; then
  curl -L -o vep_cache.tar.gz "${VEP_CACHE_URL}"
  mkdir -p vep_cache
  tar -xzf vep_cache.tar.gz -C vep_cache
  rm vep_cache.tar.gz
  echo "  Downloaded and extracted."
else
  echo "  Already exists, skipping."
fi

# Step 3: BWA-MEM2 index
echo "[3/7] Creating BWA-MEM2 index (this may take ~30 minutes)..."
if [ ! -f "GRCh38.fa.bwt.2bit.64" ]; then
  bwa-mem2 index GRCh38.fa
  echo "  Index created."
else
  echo "  Index already exists, skipping."
fi

# Step 4: samtools faidx
echo "[4/7] Creating samtools faidx index..."
if [ ! -f "GRCh38.fa.fai" ]; then
  samtools faidx GRCh38.fa
  echo "  Index created."
else
  echo "  Index already exists, skipping."
fi

# Step 5: Sequence dictionary
echo "[5/7] Creating sequence dictionary..."
if [ ! -f "GRCh38.dict" ]; then
  samtools dict GRCh38.fa -o GRCh38.dict
  echo "  Dictionary created."
else
  echo "  Dictionary already exists, skipping."
fi

# Step 6: Upload to S3
echo "[6/7] Uploading to S3..."

upload_file() {
  local file="$1"
  local key="${S3_PREFIX}/${file}"
  echo "  Uploading ${file}..."
  aws s3 cp "${file}" "s3://${BUCKET}/${key}" \
    --region "${REGION}" \
    --sse AES256 \
    --no-progress
}

# Upload reference and indexes
upload_file "GRCh38.fa"
upload_file "GRCh38.fa.fai"
upload_file "GRCh38.dict"

# Upload BWA-MEM2 index files
for ext in 0123 amb ann bwt.2bit.64 pac; do
  if [ -f "GRCh38.fa.${ext}" ]; then
    upload_file "GRCh38.fa.${ext}"
  fi
done

# Upload VEP cache
echo "  Uploading VEP cache (this may take a while)..."
aws s3 sync vep_cache/ "s3://${BUCKET}/${S3_PREFIX}/vep_cache/" \
  --region "${REGION}" \
  --sse AES256 \
  --no-progress

# Step 7: Verify
echo "[7/7] Verifying uploads..."
EXPECTED_FILES=(
  "GRCh38.fa"
  "GRCh38.fa.fai"
  "GRCh38.dict"
  "GRCh38.fa.0123"
  "GRCh38.fa.amb"
  "GRCh38.fa.ann"
  "GRCh38.fa.bwt.2bit.64"
  "GRCh38.fa.pac"
)

MISSING=0
for file in "${EXPECTED_FILES[@]}"; do
  if aws s3 ls "s3://${BUCKET}/${S3_PREFIX}/${file}" --region "${REGION}" &>/dev/null; then
    echo "  OK: ${file}"
  else
    echo "  MISSING: ${file}"
    MISSING=$((MISSING + 1))
  fi
done

VEP_COUNT=$(aws s3 ls "s3://${BUCKET}/${S3_PREFIX}/vep_cache/" --region "${REGION}" --recursive | wc -l | tr -d ' ')
echo "  VEP cache files: ${VEP_COUNT}"

if [ "${MISSING}" -eq 0 ]; then
  echo ""
  echo "=== Reference genome setup complete ==="
  echo "All files uploaded to s3://${BUCKET}/${S3_PREFIX}/"
else
  echo ""
  echo "=== WARNING: ${MISSING} file(s) missing ==="
  exit 1
fi
