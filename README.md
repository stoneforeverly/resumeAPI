# Resume Analysis API

This API provides resume uploading, parsing, analysis, and scoring functionality using LLM models (Google Gemini or OpenAI GPT).

## Features

- Resume upload (PDF files only)
- Resume parsing and content extraction
- Resume analysis and scoring using LLM
- Job recommendations based on resume analysis
- Storage of resumes and analyses in MongoDB
- Dockerized for easy deployment
- RESTful API design
- Interactive API documentation with Swagger UI

## Setup

### Prerequisites

- Docker and Docker Compose
- MongoDB Atlas account (or other MongoDB hosting)
- API keys for OpenAI or Google Gemini

### Configuration

1. Copy the example environment file:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API keys and MongoDB credentials:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   DB_PASSWORD=your_mongodb_password_here
   ```

### Running with Docker

Build and start the containers:
```
docker-compose up -d
```

The API will be available at http://localhost:8080

### Running without Docker

Install dependencies:
```
python3 -m pip install -r requirements.txt
```

Run the application:
```
python3 app.py
```

The API will be available at http://localhost:8080

## API Documentation

The API is fully documented using Swagger UI, which provides an interactive interface to explore and test all endpoints.

Access the Swagger documentation at: http://localhost:8080/docs/

## API Endpoints

The API follows RESTful design principles with consistent response formats and is structured around a multi-step process.

### Common Response Format

All API responses follow this format:

```json
{
  "status": "success|error",
  "data": { ... },
  "meta": { ... } // optional metadata
}
```

On error:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Step 1: Upload a Resume

**URL**: `/api/v1/resumes/upload`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`  
**Form Parameters**:
- `file`: The resume file (PDF only)
- `user_id`: User identifier (required)

**Response**:
```json
{
  "status": "success",
  "data": {
    "resume_id": "12345abcde",
    "filename": "resume.pdf",
    "user_id": "user123",
    "filepath": "uploads/resume.pdf",
    "file_type": "pdf"
  }
}
```

### Step 2: Parse a Resume

**URL**: `/api/v1/resumes/<resume_id>/parse`  
**Method**: `POST`  

**Response**:
```json
{
  "status": "success",
  "data": {
    "resume_id": "12345abcde",
    "content": "Extracted resume content..."
  }
}
```

### Step 3: Analyze a Resume

**URL**: `/api/v1/resumes/<resume_id>/analyze`  
**Method**: `POST`  

**Response**:
```json
{
  "status": "success",
  "data": {
    "resume_id": "12345abcde",
    "analysis_id": "67890fghij",
    "analysis": {
      "overall_score": 85,
      "strengths": ["..."],
      "areas_for_improvement": ["..."],
      "suggestions": ["..."],
      "ats_compatibility": {
        "score": 80,
        "comments": "..."
      }
    }
  }
}
```

### List Resumes

**URL**: `/api/v1/resumes`  
**Method**: `GET`  
**Query Parameters**:
- `user_id`: User identifier (required)

**Response**:
```json
{
  "status": "success",
  "data": {
    "resumes": [
      {
        "_id": "12345abcde",
        "filename": "resume.pdf",
        "upload_date": "2023-06-01T12:00:00.000Z",
        "status": "parsed",
        "user_id": "user123"
      },
      ...
    ]
  }
}
```

### Get Resume

**URL**: `/api/v1/resumes/<resume_id>`  
**Method**: `GET`  

**Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "12345abcde",
    "filename": "resume.pdf",
    "content": "...",
    "user_id": "user123",
    "upload_date": "2023-06-01T12:00:00.000Z"
  }
}
```

### Get Analysis

**URL**: `/api/v1/analyses/<resume_id>`  
**Method**: `GET`  

**Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "67890fghij",
    "resume_id": "12345abcde",
    "analysis": {
      "overall_score": 85,
      "strengths": ["..."],
      "areas_for_improvement": ["..."],
      "suggestions": ["..."],
      "ats_compatibility": {
        "score": 80,
        "comments": "..."
      }
    },
    "date": "2023-06-01T12:00:00.000Z"
  }
}
```

### Get Job Suggestions

**URL**: `/api/v1/resumes/<resume_id>/job-suggestions`  
**Method**: `GET`  

**Response**:
```json
{
  "status": "success",
  "data": {
    "resume_id": "12345abcde",
    "job_suggestions": [
      {
        "job_title": "Senior Software Engineer",
        "required_skills": ["Python", "JavaScript", "CI/CD"],
        "skills_to_develop": ["Cloud Architecture", "System Design"],
        "potential_companies": ["Google", "Microsoft", "Amazon"],
        "salary_range": "$120,000 - $160,000"
      },
      ...
    ]
  },
  "meta": {
    "source": "openai|fallback",
    "reason": "Optional description if using fallback"
  }
}
```

### Health Check

**URL**: `/api/v1/health`  
**Method**: `GET`  

**Response**:
```json
{
  "status": "success",
  "data": {
    "service": "Resume API",
    "status": "healthy",
    "version": "1.0.0"
  }
}
```

## Compatibility API Endpoints

For backward compatibility, the API still supports legacy endpoints:

### One-step Resume Upload and Analysis

**URL**: `/api/resumes`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`  
**Form Parameters**:
- `file`: The resume file (PDF only)
- `user_id`: User identifier (required)

**Response**:
```json
{
  "status": "success",
  "data": {
    "resume_id": "12345abcde",
    "analysis": {
      "overall_score": 85,
      "strengths": ["..."],
      "areas_for_improvement": ["..."],
      "suggestions": ["..."],
      "ats_compatibility": {
        "score": 80,
        "comments": "..."
      }
    }
  }
}
```

Additionally, the following legacy paths are still supported:

- `/upload` (POST) → Maps to compatibility API
- `/resume/<id>` (GET) → Maps to `/api/v1/resumes/<id>`
- `/analysis/<id>` (GET) → Maps to `/api/v1/analyses/<id>`
- `/job-suggestions/<id>` (GET) → Maps to `/api/v1/resumes/<id>/job-suggestions`
- `/health` (GET) → Maps to `/api/v1/health`

## Testing

You can use the included test scripts to test the API:

```
python3 test_upload.py [resume_file_path]
```

If no file path is provided, the script will use the sample resume included in the `uploads` directory.

To test job suggestions:

```
python3 test_job_suggestions.py [resume_file_path]
``` 