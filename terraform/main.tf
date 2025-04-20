provider "aws" {
  region = var.region
  access_key = var.aws_access_key # 替换为你的 Access Key
  secret_key = var.aws_secret_key
  assume_role {
    role_arn = "arn:aws:iam::539247470249:role/TerraformExecutionRole"
    }
}

# 创建 ECR 访问权限的 IAM 角色
resource "random_pet" "role_suffix" {
  length = 1
}

resource "aws_iam_role" "ec2_role" {
  name = "ec2-ecr-access-role-${random_pet.role_suffix.id}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_access" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-ecr-access-profile-${random_pet.role_suffix.id}"
  role = aws_iam_role.ec2_role.name
}

# 创建安全组开放端口
resource "aws_security_group" "app_sg" {
  name        = "app-sg-${random_pet.role_suffix.id}"
  description = "Allow HTTP/SSH traffic"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
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

# 创建 EC2 实例
resource "aws_instance" "app_server" {
  ami                    = "ami-04b3f96fa99d40135" # Amazon Linux 2
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = <<-EOF
              #!/bin/bash
              # 安装 Docker
              yum update -y
              amazon-linux-extras install docker -y
              service docker start
              usermod -a -G docker ec2-user

              # 从 ECR 拉取镜像（无需手动认证，IAM 角色自动授权）
              $(aws ecr get-login --no-include-email --region ${var.region})
              docker pull ${var.frontend_image}
              docker run -d -p 80:3000 --name frontend ${var.frontend_image}

              docker pull ${var.backend_image}
              docker run -d -p 8080:8080 --name backend ${var.backend_image}
              EOF

  tags = {
    Name = "app-server"
  }
}
