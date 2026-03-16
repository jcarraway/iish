# ECS Cluster for NATS
resource "aws_ecs_cluster" "nats" {
  name = "oncovax-nats-${var.environment}"
}

# EFS for NATS JetStream persistence
resource "aws_efs_file_system" "nats" {
  creation_token = "oncovax-nats-${var.environment}"
  encrypted      = true

  tags = { Name = "oncovax-nats-${var.environment}" }
}

resource "aws_efs_mount_target" "nats" {
  count           = 2
  file_system_id  = aws_efs_file_system.nats.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.nats.id]
}

# CloudWatch log group
resource "aws_cloudwatch_log_group" "nats" {
  name              = "/ecs/oncovax-nats-${var.environment}"
  retention_in_days = 30
}

# NATS task definition
resource "aws_ecs_task_definition" "nats" {
  family                   = "oncovax-nats-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.nats_execution.arn

  container_definitions = jsonencode([{
    name      = "nats"
    image     = var.nats_image
    essential = true
    command   = ["-js", "-sd", "/data"]

    portMappings = [
      { containerPort = 4222, protocol = "tcp" },
      { containerPort = 8222, protocol = "tcp" },
    ]

    mountPoints = [{
      sourceVolume  = "nats-data"
      containerPath = "/data"
    }]

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
      file_system_id = aws_efs_file_system.nats.id
    }
  }
}

# NATS ECS Service
resource "aws_ecs_service" "nats" {
  name            = "oncovax-nats-${var.environment}"
  cluster         = aws_ecs_cluster.nats.id
  task_definition = aws_ecs_task_definition.nats.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.nats.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.nats.arn
    container_name   = "nats"
    container_port   = 4222
  }
}

# NLB for NATS
resource "aws_lb" "nats" {
  name               = "oncovax-nats-${var.environment}"
  internal           = true
  load_balancer_type = "network"
  subnets            = aws_subnet.private[*].id

  tags = { Name = "oncovax-nats-${var.environment}" }
}

resource "aws_lb_target_group" "nats" {
  name        = "oncovax-nats-${var.environment}"
  port        = 4222
  protocol    = "TCP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    port     = 8222
    protocol = "TCP"
  }
}

resource "aws_lb_listener" "nats" {
  load_balancer_arn = aws_lb.nats.arn
  port              = 4222
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nats.arn
  }
}
