"""Swagger documentation for Resume API endpoints"""

# Resume upload endpoint
upload_docs = {
    'tags': ['Resume Upload'],
    'summary': 'Upload a resume file',
    'description': 'Upload a resume file and store metadata',
    'consumes': ['multipart/form-data'],
    'produces': ['application/json'],
    'parameters': [
        {
            'name': 'file',
            'in': 'formData',
            'type': 'file',
            'required': True,
            'description': 'The resume file to upload (PDF only)'
        },
        {
            'name': 'user_id',
            'in': 'formData',
            'type': 'string',
            'required': True,
            'description': 'User ID associated with the resume'
        }
    ],
    'responses': {
        201: {
            'description': 'Resume uploaded successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'resume_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1a'},
                            'filename': {'type': 'string', 'example': 'resume.pdf'},
                            'user_id': {'type': 'string', 'example': 'user123'},
                            'filepath': {'type': 'string', 'example': 'uploads/resume.pdf'},
                            'file_type': {'type': 'string', 'example': 'pdf'}
                        }
                    }
                }
            }
        },
        400: {
            'description': 'Bad request',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'No file uploaded or missing user_id'}
                }
            }
        }
    }
}

# Parse resume endpoint
parse_docs = {
    'tags': ['Resume Processing'],
    'summary': 'Parse a resume file',
    'description': 'Extract content from a previously uploaded resume file',
    'produces': ['application/json'],
    'parameters': [
        {
            'name': 'resume_id', 
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Resume ID to parse'
        }
    ],
    'responses': {
        200: {
            'description': 'Resume parsed successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'resume_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1a'},
                            'content': {'type': 'string', 'example': 'Resume content extracted from the file...'}
                        }
                    }
                }
            }
        },
        404: {
            'description': 'Resume not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Resume not found'}
                }
            }
        },
        500: {
            'description': 'Server error',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Error parsing resume file'}
                }
            }
        }
    }
}

# Analyze resume endpoint
analyze_docs = {
    'tags': ['Resume Processing'],
    'summary': 'Analyze a resume',
    'description': 'Generate analysis and scores for a previously parsed resume using AI',
    'produces': ['application/json'],
    'parameters': [
        {
            'name': 'resume_id', 
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Resume ID to analyze'
        }
    ],
    'responses': {
        200: {
            'description': 'Resume analyzed successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'resume_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1a'},
                            'analysis_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1b'},
                            'analysis': {
                                'type': 'object',
                                'properties': {
                                    'overall_score': {'type': 'integer', 'example': 85},
                                    'strengths': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Strong technical skills', 'Good education', 'Relevant experience']},
                                    'areas_for_improvement': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Add more quantifiable achievements', 'Improve formatting']},
                                    'suggestions': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Highlight more accomplishments', 'Add relevant keywords']},
                                    'ats_compatibility': {
                                        'type': 'object',
                                        'properties': {
                                            'score': {'type': 'integer', 'example': 80},
                                            'comments': {'type': 'string', 'example': 'Good structure, but add more industry keywords'}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        400: {
            'description': 'Bad request',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Resume has not been parsed yet'}
                }
            }
        },
        404: {
            'description': 'Resume not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Resume not found'}
                }
            }
        },
        500: {
            'description': 'Server error',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Error analyzing resume'}
                }
            }
        }
    }
}

# List resumes endpoint
list_resumes_docs = {
    'tags': ['Resume Management'],
    'summary': 'List all resumes for a user',
    'description': 'Retrieve a list of all resumes uploaded by a specific user',
    'produces': ['application/json'],
    'parameters': [
        {
            'name': 'user_id',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'User ID to retrieve resumes for'
        }
    ],
    'responses': {
        200: {
            'description': 'List of resumes retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'resume_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1a'},
                                'filename': {'type': 'string', 'example': 'resume_john_doe.pdf'},
                                'upload_date': {'type': 'string', 'format': 'date-time', 'example': '2023-05-01T10:00:00Z'},
                                'status': {'type': 'string', 'example': 'parsed'},
                                'user_id': {'type': 'string', 'example': 'user123'}
                            }
                        }
                    }
                }
            }
        },
        400: {
            'description': 'Bad request',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Missing user_id parameter'}
                }
            }
        },
        404: {
            'description': 'No resumes found',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'No resumes found for this user'}
                }
            }
        }
    }
}

# Get a specific resume endpoint
get_resume_docs = {
    'tags': ['Resume Management'],
    'summary': 'Get a specific resume',
    'description': 'Retrieve details for a specific resume by ID',
    'produces': ['application/json'],
    'parameters': [
        {
            'name': 'resume_id',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Resume ID to retrieve'
        }
    ],
    'responses': {
        200: {
            'description': 'Resume retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'resume_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1a'},
                            'filename': {'type': 'string', 'example': 'resume_john_doe.pdf'},
                            'upload_date': {'type': 'string', 'format': 'date-time', 'example': '2023-05-01T10:00:00Z'},
                            'status': {'type': 'string', 'example': 'parsed'},
                            'user_id': {'type': 'string', 'example': 'user123'},
                            'content': {'type': 'string', 'example': 'Resume content...'},
                            'analysis': {
                                'type': 'object',
                                'properties': {
                                    'overall_score': {'type': 'integer', 'example': 85},
                                    'strengths': {'type': 'array', 'items': {'type': 'string'}},
                                    'areas_for_improvement': {'type': 'array', 'items': {'type': 'string'}}
                                }
                            }
                        }
                    }
                }
            }
        },
        404: {
            'description': 'Resume not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Resume not found'}
                }
            }
        }
    }
}

# Get analysis endpoint
get_analysis_docs = {
    'tags': ['Resume Analysis'],
    'summary': 'Get analysis for a resume',
    'description': 'Retrieve the analysis for a specific resume',
    'produces': ['application/json'],
    'parameters': [
        {
            'name': 'resume_id',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Resume ID to retrieve analysis for'
        }
    ],
    'responses': {
        200: {
            'description': 'Analysis retrieved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'resume_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1a'},
                            'analysis_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1b'},
                            'analysis': {
                                'type': 'object',
                                'properties': {
                                    'overall_score': {'type': 'integer', 'example': 85},
                                    'strengths': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Strong technical skills', 'Good education', 'Relevant experience']},
                                    'areas_for_improvement': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Add more quantifiable achievements', 'Improve formatting']},
                                    'suggestions': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Highlight more accomplishments', 'Add relevant keywords']},
                                    'ats_compatibility': {
                                        'type': 'object',
                                        'properties': {
                                            'score': {'type': 'integer', 'example': 80},
                                            'comments': {'type': 'string', 'example': 'Good structure, but add more industry keywords'}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        404: {
            'description': 'Analysis not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Analysis not found for this resume'}
                }
            }
        }
    }
}

# Job suggestions endpoint
job_suggestions_docs = {
    'tags': ['Job Suggestions'],
    'summary': 'Get job suggestions based on a resume',
    'description': 'Generate job suggestions and recommendations based on a resume',
    'produces': ['application/json'],
    'parameters': [
        {
            'name': 'resume_id', 
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Resume ID to generate job suggestions for'
        }
    ],
    'responses': {
        200: {
            'description': 'Job suggestions generated successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'resume_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1a'},
                            'job_suggestions': {
                                'type': 'array',
                                'items': {
                                    'type': 'object',
                                    'properties': {
                                        'title': {'type': 'string', 'example': 'Senior Software Engineer'},
                                        'match_score': {'type': 'integer', 'example': 85},
                                        'description': {'type': 'string', 'example': 'This role aligns with your experience in Python development'},
                                        'skills_match': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Python', 'Flask', 'MongoDB']}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        404: {
            'description': 'Resume not found',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'Resume not found'}
                }
            }
        }
    }
}

# Compatibility API endpoint
compatibility_docs = {
    'tags': ['Compatibility API'],
    'summary': 'Upload and analyze a resume in one step (Legacy API)',
    'description': 'Backwards compatibility endpoint that uploads, parses and analyzes a resume in a single request',
    'consumes': ['multipart/form-data'],
    'produces': ['application/json'],
    'parameters': [
        {
            'name': 'file',
            'in': 'formData',
            'type': 'file',
            'required': True,
            'description': 'The resume file to upload (PDF only)'
        },
        {
            'name': 'user_id',
            'in': 'formData',
            'type': 'string',
            'required': True,
            'description': 'User ID associated with the resume'
        }
    ],
    'responses': {
        200: {
            'description': 'Resume uploaded and analyzed successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'resume_id': {'type': 'string', 'example': '60d21b4567a8d1e6d74c2f1a'},
                            'analysis': {
                                'type': 'object',
                                'properties': {
                                    'overall_score': {'type': 'integer', 'example': 85},
                                    'strengths': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Strong technical skills', 'Good education', 'Relevant experience']},
                                    'areas_for_improvement': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Add more quantifiable achievements', 'Improve formatting']},
                                    'suggestions': {'type': 'array', 'items': {'type': 'string'}, 'example': ['Highlight more accomplishments', 'Add relevant keywords']}
                                }
                            }
                        }
                    }
                }
            }
        },
        400: {
            'description': 'Bad request',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'error'},
                    'message': {'type': 'string', 'example': 'No file uploaded or missing user_id'}
                }
            }
        }
    }
}

# Health check endpoint
health_check_docs = {
    'tags': ['System'],
    'summary': 'Health check',
    'description': 'Check if the API is up and running',
    'produces': ['application/json'],
    'responses': {
        200: {
            'description': 'API is healthy',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'example': 'success'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'service': {'type': 'string', 'example': 'Resume API'},
                            'status': {'type': 'string', 'example': 'healthy'},
                            'version': {'type': 'string', 'example': '1.0.0'}
                        }
                    }
                }
            }
        }
    }
} 