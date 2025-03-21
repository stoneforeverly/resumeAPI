import requests
import sys
import os

def upload_resume(file_path=None, api_url='http://localhost:8080/api/v1/resumes'):
    """
    Upload a resume file to the API
    """
    # Use sample resume if no file path is provided
    if file_path is None:
        file_path = os.path.join('uploads', 'sample_resume.txt')
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist")
        return
    
    filename = os.path.basename(file_path)
    
    with open(file_path, 'rb') as f:
        files = {'file': (filename, f, 'application/octet-stream')}
        data = {'user_id': 'test_user'}
        
        print(f"Uploading {filename} to {api_url}...")
        response = requests.post(api_url, files=files, data=data)
    
    if response.status_code == 201:
        result = response.json()
        print("Upload successful!")
        
        data = result.get('data', {})
        resume_id = data.get('resume_id')
        analysis_id = data.get('analysis_id')
        analysis = data.get('analysis', {})
        
        print(f"Resume ID: {resume_id}")
        print(f"Analysis ID: {analysis_id}")
        print("\nAnalysis Summary:")
        print(f"Overall Score: {analysis.get('overall_score')}")
        print("\nStrengths:")
        for strength in analysis.get('strengths', []):
            print(f"- {strength}")
        print("\nAreas for Improvement:")
        for area in analysis.get('areas_for_improvement', []):
            print(f"- {area}")
        print("\nSuggestions:")
        for suggestion in analysis.get('suggestions', []):
            print(f"- {suggestion}")
        print("\nATS Compatibility:")
        ats = analysis.get('ats_compatibility', {})
        print(f"Score: {ats.get('score')}")
        print(f"Comments: {ats.get('comments')}")
        
        return resume_id
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("No resume file specified, using sample resume...")
        upload_resume()
    else:
        file_path = sys.argv[1]
        upload_resume(file_path) 