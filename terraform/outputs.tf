output "instance_id" {
  description = "EC2 实例 ID"
  value       = aws_instance.app_instance.id
}

output "public_ip" {
  description = "EC2 实例的公网 IP"
  value       = aws_instance.app_instance.public_ip
}

output "security_group_id" {
  description = "应用安全组 ID"
  value       = aws_security_group.sg.id
}

output "ec2_iam_role_name" {
  description = "EC2 使用的 IAM 角色名称"
  value       = aws_iam_role.ec2_role.name
}

output "ec2_instance_profile_name" {
  description = "EC2 实例配置 Profile 名称"
  value       = aws_iam_instance_profile.ec2_profile.name
}

output "frontend_ecr_url" {
  description = "前端镜像的 ECR 仓库 URL"
  value       = data.aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_url" {
  description = "后端镜像的 ECR 仓库 URL"
  value       = data.aws_ecr_repository.backend.repository_url
}

output "latest_frontend_digest" {
  description = "前端镜像最新 Digest"
  value       = data.aws_ecr_image.frontend.image_digest
}

output "latest_backend_digest" {
  description = "后端镜像最新 Digest"
  value       = data.aws_ecr_image.backend.image_digest
}

output "ssm_connection_command" {
  description = "通过 SSM 连接实例的命令"
  value       = "aws ssm start-session --target ${aws_instance.app_instance.id} --region ${var.region}"
}
