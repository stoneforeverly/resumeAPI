"""Swagger configuration for the Resume API"""

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Resume Analysis API",
        "description": "API for uploading, parsing, analyzing resumes and getting job recommendations",
        "version": "1.0",
        "contact": {
            "email": "support@resumeanalysis.com"
        }
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
        }
    },
    "tags": [
        {
            "name": "Resume Upload",
            "description": "Resume upload operations"
        },
        {
            "name": "Resume Processing", 
            "description": "Resume parsing and processing operations"
        },
        {
            "name": "Job Suggestions",
            "description": "Job recommendation operations"
        },
        {
            "name": "Resume Management",
            "description": "Operations related to managing resumes"
        },
        {
            "name": "Resume Analysis",
            "description": "Resume analysis and scoring operations"
        },
        {
            "name": "Compatibility API",
            "description": "Legacy API endpoints for backward compatibility"
        }
    ]
} 