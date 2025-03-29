import requests
import sys
import os
import json
import test_upload

def get_job_suggestions(resume_id, api_url='http://localhost:8080/api/v1/job-suggestions'):
    """
    Get job suggestions for a resume
    """
    url = f"{api_url}/{resume_id}"
    print(f"Getting job suggestions from {url}...")
    
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        print("Job suggestions retrieved successfully!")
        
        data = result.get('data', {})
        resume_id = data.get('resume_id')
        suggestions = data.get('job_suggestions', [])
        
        print(f"Resume ID: {resume_id}")
        
        if 'meta' in result:
            print(f"Note: Using {result['meta'].get('source', 'unknown')} suggestions due to {result['meta'].get('reason', 'unknown reason')}")
        
        print("\nJob Suggestions:")
        
        for i, suggestion in enumerate(suggestions, 1):
            print(f"\n{i}. {suggestion.get('job_title', 'Unknown')}")
            print(f"   Salary Range: {suggestion.get('salary_range', 'Not specified')}")
            
            print("   Required Skills:")
            for skill in suggestion.get('required_skills', []):
                print(f"   - {skill}")
                
            print("   Skills to Develop:")
            for skill in suggestion.get('skills_to_develop', []):
                print(f"   - {skill}")
                
            print("   Potential Companies:")
            for company in suggestion.get('potential_companies', []):
                print(f"   - {company}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

def upload_and_get_suggestions():
    """
    Upload a resume and get job suggestions
    """
    # First, upload the resume
    if len(sys.argv) < 2:
        print("No resume file specified, using sample resume...")
        file_path = os.path.join('uploads', 'sample_resume.txt')
    else:
        file_path = sys.argv[1]
    
    # Upload the resume using the test_upload helper
    resume_id = test_upload.upload_resume(file_path)
    
    if resume_id:
        # Get job suggestions
        get_job_suggestions(resume_id)
    else:
        print("Failed to get resume ID, cannot retrieve job suggestions")

if __name__ == "__main__":
    upload_and_get_suggestions() 