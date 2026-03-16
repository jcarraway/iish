# ECR repositories for pipeline service containers

resource "aws_ecr_repository" "alignment" {
  name                 = "oncovax/alignment"
  image_tag_mutability = "MUTABLE"
  force_delete         = false

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Service     = "alignment"
  }
}

resource "aws_ecr_lifecycle_policy" "alignment" {
  repository = aws_ecr_repository.alignment.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}

resource "aws_ecr_repository" "variant_caller" {
  name                 = "oncovax/variant-caller"
  image_tag_mutability = "MUTABLE"
  force_delete         = false

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Service     = "variant-caller"
  }
}

resource "aws_ecr_lifecycle_policy" "variant_caller" {
  repository = aws_ecr_repository.variant_caller.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}
