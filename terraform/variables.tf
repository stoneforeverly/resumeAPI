variable "region" {
  default     = "ap-southeast-2"
}

variable "aws_access_key" {
   description = "AWS访问密钥"
   type        = string
   sensitive   = true
 }
 
 variable "aws_secret_key" {
   description = "AWS密钥"
   type        = string
   sensitive   = true
 }

variable "frontend_image" {
  description = "前端Docker镜像地址"
  type        = string
  default     = "539247470249.dkr.ecr.ap-southeast-2.amazonaws.com/resume_backend-repo:frontend-362eab83588e3e48df6b482988c8fb80fea7e559"
}

variable "backend_image" {
  description = "后端Docker镜像地址"
  type        = string
  default     = "539247470249.dkr.ecr.ap-southeast-2.amazonaws.com/resume_backend-repo:backend-362eab83588e3e48df6b482988c8fb80fea7e559"
}

variable "existing_instance_id" {
  description = "现有EC2实例ID"
  type        = string
  default     = "i-073b8f97f41d4d77d"  # 建议生产环境通过tfvars文件覆盖
}
