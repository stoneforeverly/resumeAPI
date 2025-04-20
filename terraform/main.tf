provider "aws" {
  region = var.region
  assume_role {
    role_arn = "arn:aws:iam::539247470249:role/TerraformExecutionRole"
  }
}

data "aws_instance" "existing_instance" {
  instance_id = "i-073b8f97f41d4d77d" # 建议改为变量引用
}

# 获取ECR认证令牌
data "aws_ecr_authorization_token" "token" {}

# 部署资源优化
resource "null_resource" "deploy_app" {
  triggers = {
    frontend_sha    = sha256("${var.frontend_image}:${timestamp()}") # 添加时间戳强制刷新
    backend_sha     = sha256("${var.backend_image}:${timestamp()}")
    instance_status = data.aws_instance.existing_instance.instance_state
  }

  # 使用SSM Session Manager替代SSH
  provisioner "local-exec" {
    command = <<-EOT
      aws ssm send-command \
        --instance-ids ${data.aws_instance.existing_instance.id} \
        --document-name "AWS-RunShellScript" \
        --parameters '{"commands":[
          "echo '开始部署容器服务'",
          "echo '登录ECR仓库...'",
          "aws ecr get-login-password --region ${var.region} | docker login --username AWS --password-stdin ${split("/", var.frontend_image)[0]}",
          
          "echo '处理前端容器...'",
          "docker pull ${var.frontend_image} || true",
          "docker stop frontend || true && docker rm frontend || true",
          "docker run -d -p 80:3000 --name frontend --restart unless-stopped ${var.frontend_image}",

          "echo '处理后端容器...'",
          "docker pull ${var.backend_image} || true",
          "docker stop backend || true && docker rm backend || true",
          "docker run -d -p 8080:8080 --name backend --restart unless-stopped ${var.backend_image}",

          "echo '验证部署结果...'",
          "curl --retry 3 --retry-delay 5 -Is http://localhost:80 || exit 1"
        ]}' \
        --region ${var.region} \
        --output text
    EOT

    environment = {
      AWS_ACCESS_KEY_ID     = var.aws_access_key
      AWS_SECRET_ACCESS_KEY = var.aws_secret_key
    }
  }
}
