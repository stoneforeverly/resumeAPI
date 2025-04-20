provider "aws" {
  region     = var.region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  assume_role {
    role_arn = "arn:aws:iam::539247470249:role/TerraformExecutionRole"
  }
}

# 使用现有实例（通过ID指定）
data "aws_instance" "existing_instance" {
  instance_id = "i-073b8f97f41d4d77d" # 替换为你的实例ID
}

# 仅当镜像变更时触发的部署资源
resource "null_resource" "deploy_app" {
  triggers = {
    frontend_image_sha = sha256(var.frontend_image)
    backend_image_sha  = sha256(var.backend_image)
    instance_id        = data.aws_instance.existing_instance.id
  }

  provisioner "remote-exec" {
    inline = [
      <<-EOT
      #!/bin/bash
      set -e

      # 登录ECR（使用实例角色权限）
      aws ecr get-login-password --region ${var.region} | docker login --username AWS --password-stdin ${split("/", var.frontend_image)[0]}

      # 处理前端部署
      FRONTEND_NAME="frontend"
      NEW_FRONTEND_IMAGE="${var.frontend_image}"
      
      # 检查镜像是否有更新
      if [ "$(docker inspect -f '{{.Config.Image}}' $$FRONTEND_NAME 2>/dev/null)" != "$$NEW_FRONTEND_IMAGE" ]; then
        echo "Updating frontend container..."
        docker pull $$NEW_FRONTEND_IMAGE
        docker stop $$FRONTEND_NAME || true
        docker rm $$FRONTEND_NAME || true
        docker run -d -p 80:3000 --name $$FRONTEND_NAME $$NEW_FRONTEND_IMAGE
      fi

      # 处理后端部署
      BACKEND_NAME="backend"
      NEW_BACKEND_IMAGE="${var.backend_image}"
      
      if [ "$(docker inspect -f '{{.Config.Image}}' $$BACKEND_NAME 2>/dev/null)" != "$$NEW_BACKEND_IMAGE" ]; then
        echo "Updating backend container..."
        docker pull $$NEW_BACKEND_IMAGE
        docker stop $$BACKEND_NAME || true
        docker rm $$BACKEND_NAME || true
        docker run -d -p 8080:8080 --name $$BACKEND_NAME $$NEW_BACKEND_IMAGE
      fi
      EOT
    ]
  }
}
