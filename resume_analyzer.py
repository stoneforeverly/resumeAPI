import os
import json
from google.generativeai import configure, GenerativeModel
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Default to use OpenAI since we have a valid key
USE_OPENAI = OPENAI_API_KEY is not None and OPENAI_API_KEY.startswith('sk-')
USE_GEMINI = not USE_OPENAI and GOOGLE_API_KEY is not None

if USE_GEMINI:
    configure(api_key=GOOGLE_API_KEY)

# Initialize the OpenAI client if needed
openai_client = None
if USE_OPENAI:
    try:
        openai_client = OpenAI(api_key=OPENAI_API_KEY) 
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        USE_OPENAI = False

def analyze_resume(resume_text):
    """
    Analyze resume content using LLM (either Google Gemini or OpenAI GPT)
    and return analysis and scores
    """
    # Define the prompt for resume analysis
    prompt = f"""
    You are a professional HR and resume specialist. Analyze the following resume and provide:
    
    1. An overall score from 0-100
    2. Strengths (3-5 points)
    3. Areas for improvement (3-5 points)
    4. Suggestions for enhancement
    5. How well the resume would pass through ATS systems
    
    Format your response as a JSON object with the following structure:
    {{
        "overall_score": <score>,
        "strengths": [<list of strengths>],
        "areas_for_improvement": [<list of areas for improvement>],
        "suggestions": [<list of suggestions>],
        "ats_compatibility": {{
            "score": <score 0-100>,
            "comments": <string>
        }}
    }}
    
    Resume:
    {resume_text}
    """
    
    if USE_OPENAI and openai_client:
        return analyze_with_openai(prompt)
    elif USE_GEMINI:
        return analyze_with_gemini(prompt)
    else:
        # Generate a mock analysis
        return generate_mock_analysis(resume_text)

def analyze_with_gemini(prompt):
    """Use Google's Gemini model for analysis"""
    model = GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    
    try:
        # Parse the response JSON
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        # If response is not valid JSON, return a simplified response
        return {
            "error": "Failed to parse model response",
            "raw_response": response.text
        }

def analyze_with_openai(prompt):
    """Use OpenAI's GPT model for analysis"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional resume analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
        )
        
        # Parse the response JSON
        result_text = response.choices[0].message.content
        try:
            result = json.loads(result_text)
            return result
        except json.JSONDecodeError:
            # If response is not valid JSON, return a simplified response
            return {
                "error": "Failed to parse model response",
                "raw_response": result_text
            }
    except Exception as e:
        return {
            "error": f"OpenAI API error: {str(e)}",
            "overall_score": 50,
            "strengths": ["Unable to analyze due to API error"],
            "areas_for_improvement": ["Try again later"],
            "suggestions": ["Check API key configuration"],
            "ats_compatibility": {
                "score": 50,
                "comments": "Unable to analyze due to API error"
            }
        }

def generate_mock_analysis(resume_text):
    """Generate a mock analysis when no AI service is available"""
    # Count the keywords that indicate a good resume
    quality_keywords = ["experience", "skill", "project", "education", "certification", "achievement"]
    score = 65  # Base score
    
    # Basic scoring based on text length and keywords
    words = resume_text.lower().split()
    word_count = len(words)
    
    if word_count > 300:
        score += 10
    
    for keyword in quality_keywords:
        if keyword in resume_text.lower():
            score += 5
    
    # Cap the score at 95
    score = min(score, 95)
    
    return {
        "overall_score": score,
        "strengths": [
            "Clear presentation of work experience",
            "Good listing of technical skills",
            "Education credentials well presented"
        ],
        "areas_for_improvement": [
            "Could use more quantifiable achievements",
            "Consider adding more keywords for ATS systems",
            "Tailor resume more specifically to desired positions"
        ],
        "suggestions": [
            "Add measurable impacts of your work (e.g., 'increased efficiency by 25%')",
            "Include relevant industry keywords to improve ATS matching",
            "Create a stronger professional summary section"
        ],
        "ats_compatibility": {
            "score": score - 5,
            "comments": "The resume has good structure but could benefit from more industry-specific keywords for better ATS performance."
        }
    } 