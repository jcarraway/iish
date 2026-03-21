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
  description = "NATS connection URL (Cloud Map service discovery)"
  value       = "tls://nats.iish.internal:4222"
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

output "ecr_hla_typer_url" {
  description = "ECR repository URL for the hla-typer service"
  value       = aws_ecr_repository.hla_typer.repository_url
}

output "ecr_peptide_generator_url" {
  description = "ECR repository URL for the peptide-generator service"
  value       = aws_ecr_repository.peptide_generator.repository_url
}

output "ecr_neoantigen_predictor_url" {
  description = "ECR repository URL for the neoantigen-predictor service"
  value       = aws_ecr_repository.neoantigen_predictor.repository_url
}
