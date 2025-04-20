output "application_endpoints" {
  value = {
    frontend_url = "http://${data.aws_instance.existing_instance.public_ip}"
    backend_url  = "http://${data.aws_instance.existing_instance.public_ip}:8080"
  }
}
