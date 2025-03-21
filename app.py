from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
import resume_parser
import resume_analyzer
import db
from bson.objectid import ObjectId
from openai import OpenAI
from dotenv import load_dotenv
import json
from flasgger import Swagger, swag_from

# 导入Swagger配置
from swagger_config import swagger_config, swagger_template
from swagger_docs import (
    upload_docs, 
    parse_docs, 
    analyze_docs, 
    list_resumes_docs, 
    get_resume_docs, 
    get_analysis_docs, 
    job_suggestions_docs, 
    compatibility_docs, 
    health_check_docs
)

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}  # 只允许PDF文件

# 初始化Swagger
swagger = Swagger(app, config=swagger_config, template=swagger_template)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Check MongoDB availability
mongodb_available = db.mongodb_available

# Configure OpenAI
openai_client = None
try:
    # 使用兼容新版本的方式初始化OpenAI客户端
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai_client = OpenAI(api_key=api_key)
        print("OpenAI client initialized successfully")
    else:
        print("Warning: OPENAI_API_KEY not found in environment variables")
except Exception as e:
    print(f"Error initializing OpenAI client: {e}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# RESTful API Endpoints

# Step 1: File Upload - Only uploads the file and stores metadata
@app.route('/api/v1/resumes/upload', methods=['POST'])
@swag_from(upload_docs)
def upload_file():
    """Upload a resume file and store metadata only"""
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400
    
    # 检查user_id是否提供
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'user_id is required'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Store metadata with user_id
        resume_id = db.save_resume_metadata(filename, filepath, user_id)
        
        return jsonify({
            'status': 'success',
            'data': {
                'resume_id': str(resume_id),
                'filename': filename,
                'user_id': user_id,
                'filepath': filepath,
                'file_type': 'pdf'
            }
        }), 201
    
    return jsonify({'status': 'error', 'message': 'Only PDF files are allowed'}), 400

# Step 2: Parse Resume - Extract content from the resume
@app.route('/api/v1/resumes/<resume_id>/parse', methods=['POST'])
@swag_from(parse_docs)
def parse_resume_api(resume_id):
    """Parse a previously uploaded resume file"""
    try:
        # Get the resume metadata - handle ObjectId based on MongoDB availability
        if mongodb_available:
            resume = db.get_resume(ObjectId(resume_id))
        else:
            resume = db.get_resume(resume_id)
            
        if not resume:
            return jsonify({'status': 'error', 'message': 'Resume not found'}), 404
        
        # Check if a filepath exists, otherwise use the filename
        if 'filepath' in resume:
            filepath = resume['filepath']
        else:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], resume['filename'])
        
        # Parse resume content
        resume_content = resume_parser.parse_resume(filepath)
        
        # Update the resume with parsed content
        if mongodb_available:
            db.update_resume_content(ObjectId(resume_id), resume_content)
        else:
            db.update_resume_content(resume_id, resume_content)
        
        return jsonify({
            'status': 'success',
            'data': {
                'resume_id': resume_id,
                'content': resume_content
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Step 3: Analyze Resume - Generate analysis using LLM
@app.route('/api/v1/resumes/<resume_id>/analyze', methods=['POST'])
@swag_from(analyze_docs)
def analyze_resume_api(resume_id):
    """Analyze a previously parsed resume"""
    try:
        # Get the resume - handle ObjectId based on MongoDB availability
        if mongodb_available:
            resume = db.get_resume(ObjectId(resume_id))
        else:
            resume = db.get_resume(resume_id)
            
        if not resume:
            return jsonify({'status': 'error', 'message': 'Resume not found'}), 404
        
        # Check if the resume has been parsed
        if 'content' not in resume or not resume['content']:
            return jsonify({'status': 'error', 'message': 'Resume has not been parsed yet'}), 400
        
        # Analyze resume
        analysis = resume_analyzer.analyze_resume(resume['content'])
        
        # Save analysis to database - handle ObjectId based on MongoDB availability
        if mongodb_available:
            analysis_id = db.save_analysis(ObjectId(resume_id), analysis)
        else:
            analysis_id = db.save_analysis(resume_id, analysis)
        
        return jsonify({
            'status': 'success',
            'data': {
                'resume_id': resume_id,
                'analysis_id': str(analysis_id),
                'analysis': analysis
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# List all resumes for a user
@app.route('/api/v1/resumes', methods=['GET'])
@swag_from(list_resumes_docs)
def list_resumes():
    """List all resumes for a user"""
    try:
        # Get user_id from query parameter
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({'status': 'error', 'message': 'user_id parameter is required'}), 400
            
        # Query resumes collection for this user
        resumes_cursor = db.get_resumes_by_user(user_id)
        
        # Convert cursor to list and prepare for JSON serialization
        resumes = []
        for resume in resumes_cursor:
            resume['_id'] = str(resume['_id'])
            # Convert datetime to string if it exists
            if 'upload_date' in resume and hasattr(resume['upload_date'], 'isoformat'):
                resume['upload_date'] = resume['upload_date'].isoformat()
            resumes.append(resume)
            
        return jsonify({
            'status': 'success',
            'data': {
                'resumes': resumes
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Get a specific resume
@app.route('/api/v1/resumes/<resume_id>', methods=['GET'])
@swag_from(get_resume_docs)
def get_resume(resume_id):
    """Get a specific resume by ID"""
    try:
        # Handle ObjectId based on MongoDB availability
        if mongodb_available:
            resume = db.get_resume(ObjectId(resume_id))
        else:
            resume = db.get_resume(resume_id)
            
        if resume:
            # Convert ObjectId to string for JSON serialization if using MongoDB
            if mongodb_available and '_id' in resume:
                resume['_id'] = str(resume['_id'])
            return jsonify({
                'status': 'success',
                'data': resume
            })
        else:
            return jsonify({'status': 'error', 'message': 'Resume not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Analyses resource
@app.route('/api/v1/analyses/<resume_id>', methods=['GET'])
@swag_from(get_analysis_docs)
def get_analysis(resume_id):
    """Get the analysis for a specific resume"""
    try:
        # Handle ObjectId based on MongoDB availability
        if mongodb_available:
            analysis = db.get_analysis(ObjectId(resume_id))
        else:
            analysis = db.get_analysis(resume_id)
            
        if analysis:
            # Convert ObjectId to string for JSON serialization if using MongoDB
            if mongodb_available:
                if '_id' in analysis:
                    analysis['_id'] = str(analysis['_id'])
                if 'resume_id' in analysis:
                    analysis['resume_id'] = str(analysis['resume_id'])
            return jsonify({
                'status': 'success',
                'data': analysis
            })
        else:
            return jsonify({'status': 'error', 'message': 'Analysis not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Job suggestions resource
@app.route('/api/v1/resumes/<resume_id>/job-suggestions', methods=['GET'])
@swag_from(job_suggestions_docs)
def get_job_suggestions(resume_id):
    """Get job suggestions based on a resume"""
    try:
        # Get resume and analysis - handle ObjectId based on MongoDB availability
        if mongodb_available:
            resume = db.get_resume(ObjectId(resume_id))
            analysis = db.get_analysis(ObjectId(resume_id))
        else:
            resume = db.get_resume(resume_id)
            analysis = db.get_analysis(resume_id)
        
        if not resume or not analysis:
            return jsonify({'status': 'error', 'message': 'Resume or analysis not found'}), 404
            
        # Extract key information from resume and analysis
        resume_content = resume['content']
        analysis_data = analysis['analysis']
        
        # Check if OpenAI client is available
        if openai_client:
            try:
                # Use OpenAI to generate job suggestions
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a career advisor specializing in job recommendations."},
                        {"role": "user", "content": f"""
                        Based on the following resume and its analysis, suggest 5 specific job positions 
                        that would be a good fit for this candidate. For each position, provide:
                        1. Job title
                        2. Required skills the candidate already has
                        3. Skills they might need to develop
                        4. Potential companies that hire for this role
                        5. Estimated salary range
                        
                        Format your response as a JSON array with these fields.
                        
                        Resume:
                        {resume_content}
                        
                        Analysis:
                        {analysis_data}
                        """}
                    ],
                    temperature=0.2,
                )
                
                # Parse the suggestions
                suggestions_text = response.choices[0].message.content
                suggestions = eval(suggestions_text)  # Convert string to Python object
                
                return jsonify({
                    'status': 'success',
                    'data': {
                        'resume_id': resume_id,
                        'job_suggestions': suggestions
                    }
                })
                
            except Exception as e:
                print(f"Error with OpenAI API: {e}")
                # Fall back to mock suggestions
                return jsonify({
                    'status': 'success',
                    'data': {
                        'resume_id': resume_id,
                        'job_suggestions': generate_mock_job_suggestions(resume_content),
                    },
                    'meta': {
                        'source': 'fallback',
                        'reason': 'API error'
                    }
                })
        else:
            # Use mock suggestions when OpenAI is not available
            return jsonify({
                'status': 'success',
                'data': {
                    'resume_id': resume_id,
                    'job_suggestions': generate_mock_job_suggestions(resume_content),
                },
                'meta': {
                    'source': 'fallback',
                    'reason': 'OpenAI not available'
                }
            })
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Health check endpoint
@app.route('/api/v1/health', methods=['GET'])
@swag_from(health_check_docs)
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'data': {
            'service': 'Resume API',
            'status': 'healthy',
            'version': '1.0.0'
        }
    })

# Compatibility API - Upload and analyze in a single request
@app.route('/api/resumes', methods=['POST'])
@swag_from(compatibility_docs)
def upload_and_analyze_resume():
    """Legacy endpoint to upload and analyze a resume in one step"""
    try:
        # Check if a file was uploaded
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file part'}), 400
        
        file = request.files['file']
        
        # Check if user_id is provided
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'status': 'error', 'message': 'Missing user_id parameter'}), 400
        
        # Check if the file is selected and has an allowed extension
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'status': 'error', 'message': 'Only PDF files are allowed'}), 415
        
        # Create upload folder if it doesn't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Save resume metadata to database
        resume_id = db.save_resume(filename, filepath, user_id)
        
        # Parse resume
        resume_content = resume_parser.parse_resume(filepath)
        
        # Update resume with parsed content
        if mongodb_available:
            # Check if resume_id is already an ObjectId instance
            if not isinstance(resume_id, ObjectId):
                resume_id_obj = ObjectId(resume_id)
            else:
                resume_id_obj = resume_id
            db.update_resume_content(resume_id_obj, resume_content)
        else:
            db.update_resume_content(resume_id, resume_content)
        
        # Analyze the resume
        analysis = resume_analyzer.analyze_resume(resume_content)
        
        # Save analysis to database
        if mongodb_available:
            # Check if resume_id is already an ObjectId instance
            if not isinstance(resume_id, ObjectId):
                resume_id_obj = ObjectId(resume_id)
            else:
                resume_id_obj = resume_id
            analysis_id = db.save_analysis(resume_id_obj, analysis)
        else:
            analysis_id = db.save_analysis(resume_id, analysis)
        
        # Return success with resume ID and analysis
        return jsonify({
            'status': 'success',
            'data': {
                'resume_id': str(resume_id),
                'analysis': analysis
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def generate_mock_job_suggestions(resume_text):
    """Generate mock job suggestions when OpenAI is not available"""
    # Look for keywords in the resume to determine job suggestions
    keywords = {
        "python": ["Python Developer", "Data Scientist", "Backend Engineer"],
        "javascript": ["Frontend Developer", "Full Stack Developer", "Web Developer"],
        "react": ["React Developer", "Frontend Engineer", "UI Developer"],
        "data": ["Data Analyst", "Data Scientist", "Business Intelligence Analyst"],
        "cloud": ["Cloud Engineer", "DevOps Engineer", "Solutions Architect"],
        "security": ["Security Engineer", "Security Analyst", "Cybersecurity Specialist"],
        "manager": ["Product Manager", "Project Manager", "Engineering Manager"],
    }
    
    # Default jobs if no matches
    default_jobs = [
        {
            "job_title": "Software Engineer",
            "required_skills": ["Programming", "Problem Solving", "Teamwork"],
            "skills_to_develop": ["System Design", "DevOps", "Cloud Architecture"],
            "potential_companies": ["Google", "Microsoft", "Amazon"],
            "salary_range": "$90,000 - $130,000"
        },
        {
            "job_title": "Full Stack Developer",
            "required_skills": ["Frontend", "Backend", "Database"],
            "skills_to_develop": ["Mobile Development", "UI/UX Design", "Performance Optimization"],
            "potential_companies": ["Facebook", "Twitter", "Shopify"],
            "salary_range": "$85,000 - $125,000"
        }
    ]
    
    # Find matching jobs based on keywords
    matching_jobs = []
    resume_lower = resume_text.lower()
    
    for keyword, job_titles in keywords.items():
        if keyword in resume_lower:
            for job_title in job_titles:
                if len(matching_jobs) < 5 and not any(job['job_title'] == job_title for job in matching_jobs):
                    matching_jobs.append({
                        "job_title": job_title,
                        "required_skills": ["Programming", "Problem Solving", "Communication"],
                        "skills_to_develop": ["System Design", "Leadership", "Domain Expertise"],
                        "potential_companies": ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
                        "salary_range": "$90,000 - $140,000"
                    })
    
    # If we have less than 5 jobs, add some default ones
    while len(matching_jobs) < 5:
        for job in default_jobs:
            if len(matching_jobs) < 5 and not any(m_job['job_title'] == job['job_title'] for m_job in matching_jobs):
                matching_jobs.append(job)
    
    return matching_jobs

# Maintain backward compatibility with old endpoints
@app.route('/upload', methods=['POST'])
def upload_resume():
    """Legacy endpoint for resume upload"""
    return upload_and_analyze_resume()

@app.route('/resume/<resume_id>', methods=['GET'])
def get_resume_legacy(resume_id):
    """Legacy endpoint for getting resume"""
    # Handle the case when MongoDB is not available
    if mongodb_available:
        return get_resume(resume_id)
    else:
        # Manually call the function with proper handling
        try:
            resume = db.get_resume(resume_id)
            if resume:
                return jsonify({
                    'status': 'success',
                    'data': resume
                })
            else:
                return jsonify({'status': 'error', 'message': 'Resume not found'}), 404
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/analysis/<resume_id>', methods=['GET'])
def get_analysis_legacy(resume_id):
    """Legacy endpoint for getting analysis"""
    # Handle the case when MongoDB is not available
    if mongodb_available:
        return get_analysis(resume_id)
    else:
        # Manually call the function with proper handling
        try:
            analysis = db.get_analysis(resume_id)
            if analysis:
                return jsonify({
                    'status': 'success',
                    'data': analysis
                })
            else:
                return jsonify({'status': 'error', 'message': 'Analysis not found'}), 404
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/job-suggestions/<resume_id>', methods=['GET'])
def get_job_suggestions_legacy(resume_id):
    """Legacy endpoint for getting job suggestions"""
    # Handle the case when MongoDB is not available
    if mongodb_available:
        return get_job_suggestions(resume_id)
    else:
        # Manually call the function with proper handling
        try:
            resume = db.get_resume(resume_id)
            analysis = db.get_analysis(resume_id)
            
            if not resume or not analysis:
                return jsonify({'status': 'error', 'message': 'Resume or analysis not found'}), 404
                
            # Extract key information from resume and analysis
            resume_content = resume['content']
            analysis_data = analysis['analysis']
            
            # Use mock suggestions
            return jsonify({
                'status': 'success',
                'data': {
                    'resume_id': resume_id,
                    'job_suggestions': generate_mock_job_suggestions(resume_content),
                },
                'meta': {
                    'source': 'fallback',
                    'reason': 'In-memory database mode'
                }
            })
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check_legacy():
    """Legacy health check endpoint"""
    return health_check()

if __name__ == '__main__':
    # Use port 8080 instead of 5000 which is used by AirPlay on Mac
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=True) 