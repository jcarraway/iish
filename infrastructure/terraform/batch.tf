# Compute environments
resource "aws_batch_compute_environment" "cpu_intensive" {
  compute_environment_name = "oncovax-cpu-intensive-${var.environment}"
  type                     = "MANAGED"
  service_role             = aws_iam_role.batch_service.arn

  compute_resources {
    type                = "SPOT"
    bid_percentage      = 60
    max_vcpus           = 64
    min_vcpus           = 0
    desired_vcpus       = 0
    instance_type       = ["r6i.2xlarge", "r6i.4xlarge"]
    spot_iam_fleet_role = aws_iam_role.batch_service.arn

    subnets            = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.batch.id]
  }
}

resource "aws_batch_compute_environment" "standard" {
  compute_environment_name = "oncovax-standard-${var.environment}"
  type                     = "MANAGED"
  service_role             = aws_iam_role.batch_service.arn

  compute_resources {
    type                = "SPOT"
    bid_percentage      = 60
    max_vcpus           = 32
    min_vcpus           = 0
    desired_vcpus       = 0
    instance_type       = ["r6i.large", "r6i.xlarge"]
    spot_iam_fleet_role = aws_iam_role.batch_service.arn

    subnets            = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.batch.id]
  }
}

# Job queues
resource "aws_batch_job_queue" "cpu_intensive" {
  name     = "oncovax-pipeline-cpu-intensive-${var.environment}"
  state    = "ENABLED"
  priority = 10

  compute_environment_order {
    order               = 1
    compute_environment = aws_batch_compute_environment.cpu_intensive.arn
  }
}

resource "aws_batch_job_queue" "standard" {
  name     = "oncovax-pipeline-standard-${var.environment}"
  state    = "ENABLED"
  priority = 5

  compute_environment_order {
    order               = 1
    compute_environment = aws_batch_compute_environment.standard.arn
  }
}

# Job definitions
resource "aws_batch_job_definition" "alignment" {
  name = "oncovax-alignment"
  type = "container"

  container_properties = jsonencode({
    image            = "${aws_ecr_repository.alignment.repository_url}:latest"
    vcpus            = 8
    memory           = 32768
    jobRoleArn       = aws_iam_role.batch_job.arn
    executionRoleArn = aws_iam_role.batch_execution.arn
    environment = [
      { name = "PIPELINE_STEP", value = "alignment" }
    ]
    mountPoints = [
      {
        sourceVolume  = "scratch"
        containerPath = "/scratch"
        readOnly      = false
      }
    ]
    volumes = [
      {
        name = "scratch"
        host = { sourcePath = "/tmp/pipeline-scratch" }
      }
    ]
  })
}

resource "aws_batch_job_definition" "variant_calling" {
  name = "oncovax-variant-calling"
  type = "container"

  container_properties = jsonencode({
    image            = "${aws_ecr_repository.variant_caller.repository_url}:latest"
    vcpus            = 4
    memory           = 16384
    jobRoleArn       = aws_iam_role.batch_job.arn
    executionRoleArn = aws_iam_role.batch_execution.arn
    environment = [
      { name = "PIPELINE_STEP", value = "variant_calling" }
    ]
    mountPoints = [
      {
        sourceVolume  = "scratch"
        containerPath = "/scratch"
        readOnly      = false
      }
    ]
    volumes = [
      {
        name = "scratch"
        host = { sourcePath = "/tmp/pipeline-scratch" }
      }
    ]
  })
}

resource "aws_batch_job_definition" "hla_typing" {
  name = "oncovax-hla-typing"
  type = "container"

  container_properties = jsonencode({
    image            = "${aws_ecr_repository.hla_typer.repository_url}:latest"
    vcpus            = 4
    memory           = 16384
    jobRoleArn       = aws_iam_role.batch_job.arn
    executionRoleArn = aws_iam_role.batch_execution.arn
    environment = [
      { name = "PIPELINE_STEP", value = "hla_typing" }
    ]
    mountPoints = [
      {
        sourceVolume  = "scratch"
        containerPath = "/scratch"
        readOnly      = false
      }
    ]
    volumes = [
      {
        name = "scratch"
        host = { sourcePath = "/tmp/pipeline-scratch" }
      }
    ]
  })
}

resource "aws_batch_job_definition" "peptide_generation" {
  name = "oncovax-peptide-generator"
  type = "container"

  container_properties = jsonencode({
    image            = "${aws_ecr_repository.peptide_generator.repository_url}:latest"
    vcpus            = 2
    memory           = 4096
    jobRoleArn       = aws_iam_role.batch_job.arn
    executionRoleArn = aws_iam_role.batch_execution.arn
    environment = [
      { name = "PIPELINE_STEP", value = "peptide_generation" }
    ]
    mountPoints = [
      {
        sourceVolume  = "scratch"
        containerPath = "/scratch"
        readOnly      = false
      }
    ]
    volumes = [
      {
        name = "scratch"
        host = { sourcePath = "/tmp/pipeline-scratch" }
      }
    ]
  })
}

resource "aws_batch_job_definition" "neoantigen_prediction" {
  name = "oncovax-neoantigen-prediction"
  type = "container"

  container_properties = jsonencode({
    image      = "alpine:latest"
    command    = ["echo", "neoantigen_prediction placeholder"]
    vcpus      = 4
    memory     = 16384
    jobRoleArn = aws_iam_role.batch_job.arn
    executionRoleArn = aws_iam_role.batch_execution.arn
    environment = [
      { name = "PIPELINE_STEP", value = "neoantigen_prediction" }
    ]
  })
}

resource "aws_batch_job_definition" "structure_prediction" {
  name = "oncovax-structure-prediction"
  type = "container"

  container_properties = jsonencode({
    image      = "alpine:latest"
    command    = ["echo", "structure_prediction placeholder"]
    vcpus      = 2
    memory     = 8192
    jobRoleArn = aws_iam_role.batch_job.arn
    executionRoleArn = aws_iam_role.batch_execution.arn
    environment = [
      { name = "PIPELINE_STEP", value = "structure_prediction" }
    ]
  })
}

resource "aws_batch_job_definition" "ranking" {
  name = "oncovax-ranking"
  type = "container"

  container_properties = jsonencode({
    image      = "alpine:latest"
    command    = ["echo", "ranking placeholder"]
    vcpus      = 2
    memory     = 8192
    jobRoleArn = aws_iam_role.batch_job.arn
    executionRoleArn = aws_iam_role.batch_execution.arn
    environment = [
      { name = "PIPELINE_STEP", value = "ranking" }
    ]
  })
}

resource "aws_batch_job_definition" "mrna_design" {
  name = "oncovax-mrna-design"
  type = "container"

  container_properties = jsonencode({
    image      = "alpine:latest"
    command    = ["echo", "mrna_design placeholder"]
    vcpus      = 2
    memory     = 8192
    jobRoleArn = aws_iam_role.batch_job.arn
    executionRoleArn = aws_iam_role.batch_execution.arn
    environment = [
      { name = "PIPELINE_STEP", value = "mrna_design" }
    ]
  })
}
