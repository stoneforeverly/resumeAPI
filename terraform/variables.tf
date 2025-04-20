variable "region" {
  default     = "ap-southeast-2"
}

variable "frontend_image" {
  description = "前端Docker镜像地址"
  type        = string
  default     = "539247470249.dkr.ecr.ap-southeast-2.amazonaws.com/resume_backend-repo:frontend-c420dbcae63def78ca9f22b07c54b1fdb9164d58"
}

variable "backend_image" {
  description = "后端Docker镜像地址"
  type        = string
  default     = "539247470249.dkr.ecr.ap-southeast-2.amazonaws.com/resume_backend-repo:backend-c420dbcae63def78ca9f22b07c54b1fdb9164d58"
}

variable "terraform_execution_role_arn" {
  description = "Terraform执行角色ARN"
  type        = string
  default     = "arn:aws:iam::539247470249:role/TerraformExecutionRole"
}

variable "existing_instance_id" {
  description = "现有EC2实例ID"
  type        = string
  default     = "i-073b8f97f41d4d77d"  # 建议生产环境通过tfvars文件覆盖
}
