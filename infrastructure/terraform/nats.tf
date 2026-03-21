# ECS Cluster for NATS
resource "aws_ecs_cluster" "nats" {
  name = "iish-nats-${var.environment}"
}

# EFS for NATS JetStream persistence (KMS-encrypted for HIPAA)
resource "aws_efs_file_system" "nats" {
  creation_token = "iish-nats-${var.environment}"
  encrypted      = true
  kms_key_id     = aws_kms_key.main.arn

  tags = { Name = "iish-nats-${var.environment}" }
}

resource "aws_efs_mount_target" "nats" {
  count           = 2
  file_system_id  = aws_efs_file_system.nats.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.nats.id]
}

# CloudWatch log group
resource "aws_cloudwatch_log_group" "nats" {
  name              = "/ecs/iish-nats-${var.environment}"
  retention_in_days = 30
}

# NATS task definition
resource "aws_ecs_task_definition" "nats" {
  family                   = "iish-nats-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.nats_execution.arn

  container_definitions = jsonencode([{
    name      = "nats"
    image     = var.nats_image
    essential = true
    portMappings = [
      { containerPort = 4222, protocol = "tcp" },
      { containerPort = 8222, protocol = "tcp" },
    ]

    mountPoints = [{
      sourceVolume  = "nats-data"
      containerPath = "/data"
    }]

    secrets = [
      {
        name      = "NATS_CA_CERT"
        valueFrom = aws_secretsmanager_secret.nats_ca_cert.arn
      },
      {
        name      = "NATS_SERVER_CERT"
        valueFrom = aws_secretsmanager_secret.nats_server_cert.arn
      },
      {
        name      = "NATS_SERVER_KEY"
        valueFrom = aws_secretsmanager_secret.nats_server_key.arn
      }
    ]

    entryPoint = ["/bin/sh", "-c", join(" && ", [
      "mkdir -p /certs",
      "echo \"$NATS_CA_CERT\" > /certs/ca-cert.pem",
      "echo \"$NATS_SERVER_CERT\" > /certs/server-cert.pem",
      "echo \"$NATS_SERVER_KEY\" > /certs/server-key.pem",
      "exec nats-server -js -sd /data --tls --tlscert=/certs/server-cert.pem --tlskey=/certs/server-key.pem --tlscacert=/certs/ca-cert.pem --tlsverify"
    ])]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.nats.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "nats"
      }
    }
  }])

  volume {
    name = "nats-data"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.nats.id
      transit_encryption = "ENABLED"
    }
  }
}

# NATS ECS Service (Cloud Map service discovery instead of NLB)
resource "aws_service_discovery_private_dns_namespace" "main" {
  name = "iish.internal"
  vpc  = aws_vpc.main.id
}

resource "aws_service_discovery_service" "nats" {
  name = "nats"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_ecs_service" "nats" {
  name            = "iish-nats-${var.environment}"
  cluster         = aws_ecs_cluster.nats.id
  task_definition = aws_ecs_task_definition.nats.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.nats.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.nats.arn
  }
}

# NATS is reachable at nats.iish.internal:4222 within the VPC
output "nats_tls_url" {
  description = "NATS connection URL (TLS, via Cloud Map)"
  value       = "tls://nats.iish.internal:4222"
}
