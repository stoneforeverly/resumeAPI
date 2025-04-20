provider "aws" {
  region = var.region
}

# 获取 ECR 仓库信息
data "aws_ecr_repository" "frontend" {
  name = var.frontend_repo_name
}

data "aws_ecr_repository" "backend" {
  name = var.backend_repo_name
}

# 获取最新镜像的 Digest
data "aws_ecr_image" "frontend" {
  repository_name = var.frontend_repo_name
  image_tag       = "latest"
}

data "aws_ecr_image" "backend" {
  repository_name = var.backend_repo_name
  image_tag       = "latest"
}

# IAM 角色和权限
resource "aws_iam_role" "ec2_role" {
  name = "ec2-ecr-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-ecr-ssm-profile"
  role = aws_iam_role.ec2_role.name
}

# EC2 实例配置
resource "aws_instance" "app_instance" {
  ami           = "ami-04b3f96fa99d40135" # Amazon Linux 2
  instance_type = "t2.micro"
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.sg.id]

  user_data = <<-EOF
    #!/bin/bash
    # 安装 Docker 和认证助手
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
    sudo service docker start
    sudo usermod -a -G docker ec2-user
    sudo yum install -y amazon-ecr-credential-helper
    mkdir -p /home/ec2-user/.docker
    echo '{"credsStore": "ecr-login"}' > /home/ec2-user/.docker/config.json

    # 启动初始容器
    docker pull ${data.aws_ecr_repository.frontend.repository_url}:latest
    docker run -d --name frontend -p 3000:3000 ${data.aws_ecr_repository.frontend.repository_url}:latest

    docker pull ${data.aws_ecr_repository.backend.repository_url}:latest
    docker run -d --name backend -p 5000:5000 ${data.aws_ecr_repository.backend.repository_url}:latest
  EOF

  tags = {
    Name = "AppInstance"
  }
}

# 安全组配置
resource "aws_security_group" "sg" {
  name        = "allow_app_ports"
  description = "Allow application ports"

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 通过 SSM 触发容器更新
resource "null_resource" "deploy_trigger" {
  triggers = {
    frontend_digest = data.aws_ecr_image.frontend.image_digest
    backend_digest  = data.aws_ecr_image.backend.image_digest
  }

  provisioner "local-exec" {
  command = <<EOT
    echo "正在执行 SSM 命令更新容器..."
    aws ssm send-command \
      --instance-ids "${aws_instance.app_instance.id}" \
      --document-name "AWS-RunShellScript" \
      --parameters '{"commands":[
        "docker pull ${data.aws_ecr_repository.frontend.repository_url}:latest",
        "docker stop frontend || true",
        "docker rm frontend || true",
        "docker run -d --name frontend -p 3000:3000 ${data.aws_ecr_repository.frontend.repository_url}:latest",
        "docker pull ${data.aws_ecr_repository.backend.repository_url}:latest",
        "docker stop backend || true",
        "docker rm backend || true",
        "docker run -d --name backend -p 5000:5000 ${data.aws_ecr_repository.backend.repository_url}:latest"
      ]}' \
      --region ${var.region}
    echo "SSM 命令执行完成。"
  EOT
}
}
