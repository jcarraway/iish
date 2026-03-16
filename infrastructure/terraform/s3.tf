resource "aws_s3_bucket" "pipeline" {
  bucket = "${var.pipeline_bucket_name}-${var.environment}"

  tags = { Name = "oncovax-pipeline-${var.environment}" }
}

resource "aws_s3_bucket_versioning" "pipeline" {
  bucket = aws_s3_bucket.pipeline.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "pipeline" {
  bucket = aws_s3_bucket.pipeline.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "pipeline" {
  bucket = aws_s3_bucket.pipeline.id

  rule {
    id     = "archive-intermediate"
    status = "Enabled"

    filter {
      prefix = "intermediate/"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }

  rule {
    id     = "archive-results"
    status = "Enabled"

    filter {
      prefix = "results/"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }

  rule {
    id     = "cleanup-input"
    status = "Enabled"

    filter {
      prefix = "input/"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "pipeline" {
  bucket = aws_s3_bucket.pipeline.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
