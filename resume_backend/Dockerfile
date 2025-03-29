FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port for the application (using 8080 instead of 5000)
EXPOSE 8080

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV PORT=8080
# Explicitly disable proxies to avoid issues with OpenAI client
ENV HTTP_PROXY=""
ENV HTTPS_PROXY=""

# Command to run the application
CMD ["python", "app.py"] 