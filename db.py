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
mongodb_available = False

try:
    # Initialize MongoDB client
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Ping the server to make sure it's available
    client.admin.command('ping')
    print("MongoDB connection successful")
    db = client.resume_db
    
    # Collections
    resumes = db.resumes
    analyses = db.analyses
    mongodb_available = True
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    # Create fallback data structures
    class MemoryCollection:
        def __init__(self):
            self.data = {}
            self.counter = 1
        
        def insert_one(self, document):
            # Generate a unique ID
            if '_id' not in document:
                document['_id'] = self.counter
                self.counter += 1
            self.data[document['_id']] = document
            return type('obj', (object,), {'inserted_id': document['_id']})
        
        def find_one(self, query):
            for doc_id, doc in self.data.items():
                # Simple matching for _id queries
                if '_id' in query and doc_id == query['_id']:
                    return doc
            return None
        
        def find(self, query=None):
            # Return all documents for now, as a simple implementation
            if query is None:
                return list(self.data.values())
            
            results = []
            for doc in self.data.values():
                match = True
                for key, value in query.items():
                    if key not in doc or doc[key] != value:
                        match = False
                        break
                if match:
                    results.append(doc)
            return results
            
        def update_one(self, query, update):
            for doc_id, doc in self.data.items():
                # Simple matching for _id queries
                if '_id' in query and doc_id == query['_id']:
                    # Handle $set operation
                    if '$set' in update:
                        for key, value in update['$set'].items():
                            doc[key] = value
                    return
    
    # Create memory-based collections
    resumes = MemoryCollection()
    analyses = MemoryCollection()
    print("Using in-memory storage as fallback")

def save_resume_metadata(filename, filepath, user_id=None):
    """Save resume metadata to database"""
    try:
        timestamp = datetime.datetime.now()
        
        resume_data = {
            "filename": filename,
            "filepath": filepath,
            "upload_date": timestamp,
            "status": "uploaded",
        }
        
        if user_id:
            resume_data["user_id"] = user_id
        
        result = resumes.insert_one(resume_data)
        return result.inserted_id
    except Exception as e:
        print(f"Error saving resume metadata: {e}")
        return None

def update_resume_content(resume_id, content):
    """Update resume with extracted content"""
    try:
        if mongodb_available and isinstance(resume_id, str):
            try:
                resume_id = ObjectId(resume_id)
            except:
                pass
                
        resumes.update_one(
            {"_id": resume_id},
            {"$set": {
                "content": content,
                "status": "parsed"
            }}
        )
        return True
    except Exception as e:
        print(f"Error updating resume content: {e}")
        return False

def save_resume(filename, filepath, user_id=None):
    """Create a new resume entry (legacy function)"""
    try:
        timestamp = datetime.datetime.now()
        
        resume_data = {
            "filename": filename,
            "filepath": filepath,
            "upload_date": timestamp,
            "status": "new",
        }
        
        if user_id:
            resume_data["user_id"] = user_id
        
        result = resumes.insert_one(resume_data)
        return result.inserted_id
    except Exception as e:
        print(f"Error saving resume: {e}")
        return None

def save_analysis(resume_id, analysis_data):
    """Save analysis data for a resume"""
    try:
        if mongodb_available and isinstance(resume_id, str):
            try:
                resume_id = ObjectId(resume_id)
            except:
                pass
                
        timestamp = datetime.datetime.now()
        
        analysis = {
            "resume_id": resume_id,
            "analysis": analysis_data,
            "date": timestamp
        }
        
        result = analyses.insert_one(analysis)
        return result.inserted_id
    except Exception as e:
        print(f"Error saving analysis: {e}")
        return None

def get_resume(resume_id):
    """Get a resume by ID"""
    try:
        if mongodb_available:
            if isinstance(resume_id, str):
                try:
                    resume_id = ObjectId(resume_id)
                except:
                    pass
            return resumes.find_one({"_id": resume_id})
        else:
            # For in-memory storage, convert ObjectId to int if needed
            if isinstance(resume_id, ObjectId):
                resume_id = str(resume_id)
            return resumes.find_one({"_id": resume_id})
    except Exception as e:
        print(f"Error getting resume: {e}")
        return None

def get_analysis(resume_id):
    """Get analysis for a specific resume"""
    try:
        if mongodb_available:
            if isinstance(resume_id, str):
                try:
                    resume_id = ObjectId(resume_id)
                except:
                    pass
            return analyses.find_one({"resume_id": resume_id})
        else:
            # For in-memory storage, convert ObjectId to int if needed
            if isinstance(resume_id, ObjectId):
                resume_id = str(resume_id)
            return analyses.find_one({"resume_id": resume_id})
    except Exception as e:
        print(f"Error getting analysis: {e}")
        return None

def get_resumes_by_user(user_id):
    """Get all resumes for a specific user"""
    try:
        if mongodb_available:
            # Return a cursor for MongoDB
            return resumes.find({"user_id": user_id})
        else:
            # For in-memory storage, return a list
            return resumes.find({"user_id": user_id})
    except Exception as e:
        print(f"Error getting resumes by user: {e}")
        return [] 