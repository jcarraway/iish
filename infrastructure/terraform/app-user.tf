# ─────────────────────────────────────────────────────────────────────────────
# Application IAM User — minimum permissions for the Next.js app access key
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_iam_user" "app" {
  name = "iish-app-${var.environment}"
  tags = { Name = "iish-app-${var.environment}" }
}

resource "aws_iam_user_policy" "app" {
  name = "iish-app-policy"
  user = aws_iam_user.app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3DocumentAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:HeadObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.documents.arn}/*",
          "${aws_s3_bucket.pipeline.arn}/*"
        ]
      },
      {
        Sid    = "S3ListBuckets"
        Effect = "Allow"
        Action = "s3:ListBucket"
        Resource = [
          aws_s3_bucket.documents.arn,
          aws_s3_bucket.pipeline.arn
        ]
      },
      {
        Sid    = "BatchJobSubmission"
        Effect = "Allow"
        Action = [
          "batch:SubmitJob",
          "batch:DescribeJobs",
          "batch:ListJobs",
          "batch:TerminateJob"
        ]
        Resource = [
          "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job-queue/iish-pipeline-*",
          "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job-definition/iish-*",
          "arn:aws:batch:${var.aws_region}:${data.aws_caller_identity.current.account_id}:job/*"
        ]
      },
      {
        Sid    = "KMSEncryptDecrypt"
        Effect = "Allow"
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = [aws_kms_key.main.arn]
      },
      {
        Sid    = "ECRReadOnly"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchCheckLayerAvailability"
        ]
        Resource = "*"
      }
    ]
  })
}
