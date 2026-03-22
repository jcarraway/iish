# ─────────────────────────────────────────────────────────────────────────────
# NATS TLS — Secrets Manager + NATS config for mTLS
# ─────────────────────────────────────────────────────────────────────────────

# Store TLS certs in Secrets Manager (KMS-encrypted)
resource "aws_secretsmanager_secret" "nats_ca_cert" {
  name       = "iish/${var.environment}/nats/ca-cert"
  kms_key_id = aws_kms_key.main.arn
  tags       = { Name = "iish-nats-ca-cert-${var.environment}" }
}

resource "aws_secretsmanager_secret" "nats_server_cert" {
  name       = "iish/${var.environment}/nats/server-cert"
  kms_key_id = aws_kms_key.main.arn
  tags       = { Name = "iish-nats-server-cert-${var.environment}" }
}

resource "aws_secretsmanager_secret" "nats_server_key" {
  name       = "iish/${var.environment}/nats/server-key"
  kms_key_id = aws_kms_key.main.arn
  tags       = { Name = "iish-nats-server-key-${var.environment}" }
}

resource "aws_secretsmanager_secret" "nats_client_cert" {
  name       = "iish/${var.environment}/nats/client-cert"
  kms_key_id = aws_kms_key.main.arn
  tags       = { Name = "iish-nats-client-cert-${var.environment}" }
}

resource "aws_secretsmanager_secret" "nats_client_key" {
  name       = "iish/${var.environment}/nats/client-key"
  kms_key_id = aws_kms_key.main.arn
  tags       = { Name = "iish-nats-client-key-${var.environment}" }
}

# Grant NATS execution role access to pull secrets
resource "aws_iam_role_policy" "nats_secrets" {
  name = "secrets-manager-nats-tls"
  role = aws_iam_role.nats_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.nats_ca_cert.arn,
          aws_secretsmanager_secret.nats_server_cert.arn,
          aws_secretsmanager_secret.nats_server_key.arn,
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = [aws_kms_key.main.arn]
      }
    ]
  })
}

# Grant Batch job role access to pull client certs (for mTLS to NATS)
resource "aws_iam_role_policy" "batch_nats_tls" {
  name = "secrets-manager-nats-client-tls"
  role = aws_iam_role.batch_job.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = [
        aws_secretsmanager_secret.nats_ca_cert.arn,
        aws_secretsmanager_secret.nats_client_cert.arn,
        aws_secretsmanager_secret.nats_client_key.arn,
      ]
    }]
  })
}
