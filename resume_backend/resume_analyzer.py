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
        print("Resume analyzer: OpenAI client initialized successfully") 
    except Exception as e:
        print(f"Error initializing OpenAI client in resume_analyzer: {e}")
        USE_OPENAI = False

def analyze_resume(resume_text):
    """
    Analyze resume content using LLM (either Google Gemini or OpenAI GPT)
    and return analysis and scores
    """
    prompt = f"""
You are a senior hiring manager and resume evaluation expert specializing in software engineering and machine learning engineering roles.

Please analyze the following resume and evaluate it as if it were submitted for a position in software development or machine learning engineering (MLE). Provide an expert-level review focusing on both technical and structural aspects.

Your response must be a **strictly valid JSON object** with the following structure:

{{
  "overall_score": <integer 0-100>,
  "technical_score": <integer 0-100>,
  "communication_score": <integer 0-100>,
  "ats_compatibility_score": <integer 0-100>,
  "strengths": [<list of strengths>],
  "areas_for_improvement": [<list of areas for improvement>],
  "suggestions": [<list of practical suggestions>],
  "ats_compatibility": {{
    "score": <integer>,
    "comments": <string>
  }}
}}

Evaluation Criteria:
- Relevance of technical skills (languages, frameworks, ML tools, cloud, etc.)
- Clarity and structure of work experience (roles, achievements, measurable impact)
- Use of metrics to quantify results
- Presence of strong project experience (open-source, production-level, or research)
- Communication quality and readability
- ATS-friendly formatting and relevant keywords
- Relevance of education, certifications, and training

Please **only return JSON**. Do NOT use code blocks (like ```json), markdown, or explanation.

Resume:
{resume_text}
    """

    if USE_OPENAI and openai_client:
        return analyze_with_openai(prompt)
    elif USE_GEMINI:
        return analyze_with_gemini(prompt)
    else:
        return generate_mock_analysis(resume_text)

def analyze_with_openai(prompt):
    """Use OpenAI's GPT model for analysis"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a professional resume analysis assistant. Return only JSON. No explanations or markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
        )

        result_text = response.choices[0].message.content.strip()

        # Clean up markdown code block if present
        if result_text.startswith("```json"):
            result_text = result_text[len("```json"):].strip()
        if result_text.endswith("```"):
            result_text = result_text[:-3].strip()

        return json.loads(result_text)

    except json.JSONDecodeError:
        return {
            "error": "Failed to parse model response",
            "raw_response": result_text
        }
    except Exception as e:
        return {
            "error": f"OpenAI API error: {str(e)}",
            "overall_score": 50,
            "technical_score": 50,
            "communication_score": 50,
            "ats_compatibility_score": 50,
            "strengths": ["Unable to analyze due to API error"],
            "areas_for_improvement": ["Try again later"],
            "suggestions": ["Check API key configuration"],
            "ats_compatibility": {
                "score": 50,
                "comments": "Unable to analyze due to API error"
            }
        }

def analyze_with_gemini(prompt):
    """Use Google's Gemini model for analysis"""
    model = GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {
            "error": "Failed to parse model response",
            "raw_response": response.text
        }

def generate_mock_analysis(resume_text):
    """Generate a mock analysis when no AI service is available"""
    quality_keywords = ["python", "tensorflow", "ml", "project", "api", "deployment"]
    score = 65
    words = resume_text.lower().split()
    word_count = len(words)

    if word_count > 300:
        score += 10
    for keyword in quality_keywords:
        if keyword in words:
            score += 5
    score = min(score, 95)

    return {
        "overall_score": score,
        "technical_score": score - 5,
        "communication_score": 70,
        "ats_compatibility_score": score - 10,
        "strengths": [
            "Strong programming language usage",
            "Projects clearly explained",
            "Solid educational background"
        ],
        "areas_for_improvement": [
            "Lack of quantified impact",
            "Could expand on ML tools experience",
            "Professional summary could be improved"
        ],
        "suggestions": [
            "Add metrics to work achievements",
            "Highlight ML project impact in production",
            "Improve formatting for ATS optimization"
        ],
        "ats_compatibility": {
            "score": score - 10,
            "comments": "Formatting is mostly good, but keywords could be improved for ATS."
        }
    }
