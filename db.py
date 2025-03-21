import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId
import datetime

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://admin:<db_password>@cluster0.2am5w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

# Replace <db_password> with actual password if provided via environment variable
if "<db_password>" in MONGO_URI:
    db_password = os.getenv("DB_PASSWORD")
    if db_password:
        MONGO_URI = MONGO_URI.replace("<db_password>", db_password)

# Flag to track MongoDB availability
mongodb_available = True

try:
    # Initialize MongoDB client
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Ping the server to make sure it's available
    client.admin.command('ping')
    db = client.resume_db
    
    # Collections
    resumes = db.resumes
    analyses = db.analyses
    
    print("MongoDB connection successful")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    mongodb_available = False

def save_resume_metadata(filename, filepath, user_id=None):
    """Save only resume metadata (without content)"""
    if not mongodb_available:
        # Generate a fake ObjectId if MongoDB is not available
        return ObjectId()
    
    resume_doc = {
        "filename": filename,
        "filepath": filepath,
        "user_id": user_id,
        "upload_date": datetime.datetime.utcnow(),
        "status": "uploaded"  # Track processing status
    }
    return resumes.insert_one(resume_doc).inserted_id

def update_resume_content(resume_id, content):
    """Update resume with parsed content"""
    if not mongodb_available:
        return None
    
    return resumes.update_one(
        {"_id": resume_id},
        {
            "$set": {
                "content": content,
                "status": "parsed",
                "parsed_date": datetime.datetime.utcnow()
            }
        }
    )

def save_resume(filename, content, user_id=None):
    """Save uploaded resume to database"""
    if not mongodb_available:
        # Generate a fake ObjectId if MongoDB is not available
        return ObjectId()
    
    resume_doc = {
        "filename": filename,
        "content": content,
        "user_id": user_id,
        "upload_date": datetime.datetime.utcnow(),
        "status": "parsed"  # Mark as already parsed
    }
    return resumes.insert_one(resume_doc).inserted_id

def save_analysis(resume_id, analysis_data):
    """Save resume analysis to database"""
    if not mongodb_available:
        # Generate a fake ObjectId if MongoDB is not available
        return ObjectId()
    
    # Update the resume document to indicate it has been analyzed
    resumes.update_one(
        {"_id": resume_id},
        {"$set": {"status": "analyzed", "analyzed_date": datetime.datetime.utcnow()}}
    )
    
    analysis_doc = {
        "resume_id": resume_id,
        "analysis": analysis_data,
        "date": datetime.datetime.utcnow(),
    }
    return analyses.insert_one(analysis_doc).inserted_id

def get_resume(resume_id):
    """Retrieve resume by ID"""
    if not mongodb_available:
        return None
    
    return resumes.find_one({"_id": resume_id})

def get_analysis(resume_id):
    """Retrieve analysis by resume ID"""
    if not mongodb_available:
        return None
    
    return analyses.find_one({"resume_id": resume_id})

def get_resumes_by_user(user_id):
    """
    Get all resumes for a specific user
    """
    return resumes.find({"user_id": user_id}) 