variable "region" {
  default = "ap-southeast-2"
}

variable "aws_access_key" {
  description = ""
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = ""
  type        = string
  sensitive   = true
}

variable "frontend_image" {
  description = "539247470249.dkr.ecr.ap-southeast-2.amazonaws.com/resume_backend-repo:frontend-c420dbcae63def78ca9f22b07c54b1fdb9164d58"
}

variable "backend_image" {
  description = "539247470249.dkr.ecr.ap-southeast-2.amazonaws.com/resume_backend-repo:backend-c420dbcae63def78ca9f22b07c54b1fdb9164d58"
}

variable "existing_instance_id" {
  description = "i-0cb146a6049815c9b"
  type        = string
}

variable "ecr_registry" {
  description = "539247470249.dkr.ecr.ap-southeast-2.amazonaws.com/resume_backend-repo"
  type        = string
}
