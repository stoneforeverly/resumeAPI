# 配置AWS提供商
provider "aws" {
  region = var.region
}

# --------------------------
# 安全组配置（需在EC2实例之前定义）
# --------------------------
resource "aws_security_group" "sg" {
  name        = "allow_app_ports"
  description = "Allow application ports"

  # 入站规则
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Frontend port"
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend port"
  }

  # 出站规则
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --------------------------
# IAM角色配置
# --------------------------
resource "aws_iam_role" "ec2_role" {
  name = "ec2-ecr-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action   = "sts:AssumeRole",
      Effect   = "Allow",
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

# 附加策略
resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# 自定义ECR授权策略
resource "aws_iam_role_policy" "ecr_auth" {
  name = "ecr-auth-policy"
  role = aws_iam_role.ec2_role.name

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action   = ["ecr:GetAuthorizationToken"],
      Effect   = "Allow",
      Resource = "*"
    }]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-ecr-ssm-profile"
  role = aws_iam_role.ec2_role.name
}

# --------------------------
# EC2实例配置
# --------------------------
resource "aws_instance" "app_instance" {
  ami                    = "ami-04b3f96fa99d40135" # 请验证AMI在目标区域的有效性
  instance_type          = "t2.micro"
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.sg.id]

  user_data = <<-EOF
    #!/bin/bash
    # 安装Docker组件
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ec2-user

    # 配置ECR认证助手
    sudo yum install -y amazon-ecr-credential-helper
    mkdir -p /home/ec2-user/.docker
    echo '{"credsStore": "ecr-login"}' | tee /home/ec2-user/.docker/config.json
    chown -R ec2-user:ec2-user /home/ec2-user/.docker
    chmod 600 /home/ec2-user/.docker/config.json

    # 启动容器
    docker pull ${data.aws_ecr_repository.frontend.repository_url}:latest
    docker run -d --name frontend -p 3000:3000 ${data.aws_ecr_repository.frontend.repository_url}:latest

    docker pull ${data.aws_ecr_repository.backend.repository_url}:latest
    docker run -d --name backend -p 5000:5000 ${data.aws_ecr_repository.backend.repository_url}:latest
  EOF

  tags = {
    Name = "AppInstance"
  }

  depends_on = [aws_security_group.sg]  # 显式声明依赖
}

# --------------------------
# 容器更新触发器
# --------------------------
resource "null_resource" "deploy_trigger" {
  triggers = {
    frontend_digest = data.aws_ecr_image.frontend.image_digest
    backend_digest  = data.aws_ecr_image.backend.image_digest
    instance_id     = aws_instance.app_instance.id  # 确保实例已创建
  }

  provisioner "local-exec" {
    command = <<EOT
      aws ssm send-command \
        --instance-ids "${self.triggers.instance_id}" \
        --document-name "AWS-RunShellScript" \
        --parameters '{
          "commands": [
            "docker pull ${data.aws_ecr_repository.frontend.repository_url}:latest",
            "docker stop frontend || true",
            "docker rm frontend || true",
            "docker run -d --name frontend -p 3000:3000 ${data.aws_ecr_repository.frontend.repository_url}:latest",
            "docker pull ${data.aws_ecr_repository.backend.repository_url}:latest",
            "docker stop backend || true",
            "docker rm backend || true",
            "docker run -d --name backend -p 5000:5000 ${data.aws_ecr_repository.backend.repository_url}:latest"
          ]
        }' \
        --region ${var.region}
    EOT
  }
}

# --------------------------
# 数据源声明（放在最后不影响依赖）
# --------------------------
data "aws_ecr_repository" "frontend" {
  name = var.frontend_repo_name
}

data "aws_ecr_repository" "backend" {
  name = var.backend_repo_name
}

data "aws_ecr_image" "frontend" {
  repository_name = var.frontend_repo_name
  image_tag       = "latest"
}

data "aws_ecr_image" "backend" {
  repository_name = var.backend_repo_name
  image_tag       = "latest"
}
