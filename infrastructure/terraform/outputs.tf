output "pipeline_bucket_arn" {
  description = "ARN of the pipeline S3 bucket"
  value       = aws_s3_bucket.pipeline.arn
}

output "pipeline_bucket_name" {
  description = "Name of the pipeline S3 bucket"
  value       = aws_s3_bucket.pipeline.id
}

output "batch_cpu_queue_arn" {
  description = "ARN of the CPU-intensive Batch job queue"
  value       = aws_batch_job_queue.cpu_intensive.arn
}

output "batch_standard_queue_arn" {
  description = "ARN of the standard Batch job queue"
  value       = aws_batch_job_queue.standard.arn
}

output "nats_url" {
  description = "NATS connection URL"
  value       = "nats://${aws_lb.nats.dns_name}:4222"
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ecr_alignment_url" {
  description = "ECR repository URL for the alignment service"
  value       = aws_ecr_repository.alignment.repository_url
}

output "ecr_variant_caller_url" {
  description = "ECR repository URL for the variant-caller service"
  value       = aws_ecr_repository.variant_caller.repository_url
}
