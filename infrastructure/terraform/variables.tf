variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "pipeline_bucket_name" {
  description = "S3 bucket name for pipeline data"
  type        = string
  default     = "oncovax-pipeline"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "nats_image" {
  description = "NATS Docker image"
  type        = string
  default     = "nats:latest"
}
