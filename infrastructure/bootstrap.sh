#!/usr/bin/env bash
#
# Bootstrap — run ONCE before `terraform init`
#
# Creates:
#   1. S3 bucket for Terraform state (KMS-encrypted)
#   2. DynamoDB table for state locking
#   3. Uploads NATS TLS certs to Secrets Manager
#   4. Creates the app IAM access key
#
# Usage:
#   chmod +x bootstrap.sh
#   ./bootstrap.sh          # defaults: region=us-east-1, env=dev
#   ./bootstrap.sh prod     # production
#
set -euo pipefail

ENV="${1:-dev}"
REGION="us-east-1"
PROJECT="iish"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CERT_DIR="$(dirname "$0")/nats-tls"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  IISH Bootstrap — Account: $ACCOUNT_ID | Env: $ENV"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─────────────────────────────────────────────────────────────────────────────
# 1. Terraform State Backend
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "▶ Setting up Terraform state backend..."

STATE_BUCKET="${PROJECT}-terraform-state"

# Create S3 bucket for state
if aws s3api head-bucket --bucket "$STATE_BUCKET" 2>/dev/null; then
  echo "  State bucket already exists"
else
  # us-east-1 doesn't use LocationConstraint
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --region "$REGION" --bucket "$STATE_BUCKET"
  else
    aws s3api create-bucket --region "$REGION" --bucket "$STATE_BUCKET" \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi
  echo "  ✓ Created state bucket: $STATE_BUCKET"
fi

# Encryption
aws s3api put-bucket-encryption --bucket "$STATE_BUCKET" \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}, "BucketKeyEnabled": true}]
  }'

# Versioning (rollback state files)
aws s3api put-bucket-versioning --bucket "$STATE_BUCKET" \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block --bucket "$STATE_BUCKET" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# TLS-only
aws s3api put-bucket-policy --bucket "$STATE_BUCKET" \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::'"$STATE_BUCKET"'", "arn:aws:s3:::'"$STATE_BUCKET"'/*"],
      "Condition": {"Bool": {"aws:SecureTransport": "false"}}
    }]
  }'

echo "  ✓ State bucket: $STATE_BUCKET (KMS, versioned, TLS-only)"

# DynamoDB lock table
if aws dynamodb describe-table --region "$REGION" --table-name "${PROJECT}-terraform-locks" > /dev/null 2>&1; then
  echo "  Lock table already exists"
else
  aws dynamodb create-table --region "$REGION" \
    --table-name "${PROJECT}-terraform-locks" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --sse-specification Enabled=true \
    --tags Key=Project,Value=$PROJECT Key=Environment,Value=$ENV > /dev/null

  echo "  Waiting for DynamoDB table..."
  aws dynamodb wait table-exists --region "$REGION" --table-name "${PROJECT}-terraform-locks"
fi

echo "  ✓ Lock table: ${PROJECT}-terraform-locks (SSE, PAY_PER_REQUEST)"

# ─────────────────────────────────────────────────────────────────────────────
# 2. Upload NATS TLS Certs to Secrets Manager
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "▶ Uploading NATS TLS certificates to Secrets Manager..."

if [ ! -f "$CERT_DIR/ca-cert.pem" ]; then
  echo "  ✗ Certs not found in $CERT_DIR — run cert generation first"
  exit 1
fi

upload_secret() {
  local name="$1"
  local file="$2"
  local secret_name="${PROJECT}/${ENV}/nats/${name}"

  # Try to create, if exists just update
  if aws secretsmanager describe-secret --region "$REGION" --secret-id "$secret_name" > /dev/null 2>&1; then
    aws secretsmanager put-secret-value --region "$REGION" \
      --secret-id "$secret_name" \
      --secret-string "$(cat "$file")" > /dev/null
    echo "  ✓ Updated: $secret_name"
  else
    aws secretsmanager create-secret --region "$REGION" \
      --name "$secret_name" \
      --secret-string "$(cat "$file")" \
      --tags Key=Project,Value=$PROJECT Key=Environment,Value=$ENV Key=HIPAA,Value=true > /dev/null
    echo "  ✓ Created: $secret_name"
  fi
}

upload_secret "ca-cert"      "$CERT_DIR/ca-cert.pem"
upload_secret "server-cert"  "$CERT_DIR/server-cert.pem"
upload_secret "server-key"   "$CERT_DIR/server-key.pem"
upload_secret "client-cert"  "$CERT_DIR/client-cert.pem"
upload_secret "client-key"   "$CERT_DIR/client-key.pem"

# ─────────────────────────────────────────────────────────────────────────────
# 3. Create App IAM Access Key
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "▶ Creating application IAM user + access key..."

APP_USER="${PROJECT}-app-${ENV}"
aws iam create-user --user-name "$APP_USER" \
  --tags Key=Project,Value=$PROJECT Key=Environment,Value=$ENV > /dev/null 2>&1 || true

# Check if key already exists
EXISTING_KEYS=$(aws iam list-access-keys --user-name "$APP_USER" --query 'AccessKeyMetadata | length(@)' --output text 2>/dev/null || echo "0")

if [ "$EXISTING_KEYS" -gt "0" ]; then
  echo "  Access key already exists for $APP_USER (check AWS Console to view/rotate)"
  ACCESS_KEY="(already exists)"
  SECRET_KEY="(already exists)"
else
  CREDENTIALS=$(aws iam create-access-key --user-name "$APP_USER" --output json)
  ACCESS_KEY=$(echo "$CREDENTIALS" | python3 -c "import sys,json; print(json.load(sys.stdin)['AccessKey']['AccessKeyId'])")
  SECRET_KEY=$(echo "$CREDENTIALS" | python3 -c "import sys,json; print(json.load(sys.stdin)['AccessKey']['SecretAccessKey'])")
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. Migrate existing Terraform state (if any)
# ─────────────────────────────────────────────────────────────────────────────
echo ""
TF_DIR="$(dirname "$0")/terraform"
if [ -f "$TF_DIR/terraform.tfstate" ]; then
  echo "▶ Existing local terraform.tfstate found."
  echo "  After this script, run:"
  echo "    cd $TF_DIR"
  echo "    terraform init -migrate-state"
  echo "  Terraform will move your local state to S3."
else
  echo "▶ No existing terraform.tfstate — fresh setup."
  echo "  Run:"
  echo "    cd $TF_DIR"
  echo "    terraform init"
  echo "    terraform plan"
  echo "    terraform apply"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BOOTSTRAP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Terraform state: s3://$STATE_BUCKET/infrastructure/terraform.tfstate"
echo "  State locking:   DynamoDB ${PROJECT}-terraform-locks"
echo "  NATS TLS:        5 secrets in Secrets Manager"
echo ""
if [ "$ACCESS_KEY" != "(already exists)" ]; then
  echo "  ┌─────────────────────────────────────────────────────────┐"
  echo "  │ APP CREDENTIALS (save these — shown ONCE)              │"
  echo "  │                                                         │"
  echo "  │ AWS_ACCESS_KEY_ID=$ACCESS_KEY            │"
  echo "  │ AWS_SECRET_ACCESS_KEY=$SECRET_KEY │"
  echo "  └─────────────────────────────────────────────────────────┘"
fi
echo ""
echo "  Next steps:"
echo "    cd infrastructure/terraform"
echo "    terraform init -migrate-state   # if upgrading from local state"
echo "    terraform plan                  # review changes"
echo "    terraform apply                 # deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
