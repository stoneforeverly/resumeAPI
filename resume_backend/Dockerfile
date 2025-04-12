FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chmod 777 uploads

# Expose port for the application (using 8080 instead of 5000)
EXPOSE 8080

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV PORT=8080
# Allow setting OpenAI API key as an environment variable
ENV OPENAI_API_KEY=""
# Disable proxies to avoid issues with OpenAI client
ENV HTTP_PROXY=""
ENV HTTPS_PROXY=""

# Health check
HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost:8080/api/v1/health || exit 1

# Command to run the application
CMD ["python", "app.py"] 