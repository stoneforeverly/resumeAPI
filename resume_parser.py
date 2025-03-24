import PyPDF2
import docx
import os
from openai import OpenAI
from dotenv import load_dotenv
import json

# 加载环境变量
load_dotenv()

# 初始化OpenAI客户端
openai_client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai_client = OpenAI(api_key=api_key)
        print("Resume parser: OpenAI client initialized successfully")
    else:
        print("Warning: OPENAI_API_KEY not found - fallback to local parsing")
except Exception as e:
    print(f"Error initializing OpenAI client in resume_parser: {e}")

def parse_resume(file_path):
    """
    Parse resume file using OpenAI API if available, otherwise use local parsing
    Returns structured JSON data from the resume
    """
    # 先提取文本内容
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        text = parse_pdf(file_path)
    elif file_ext == '.docx':
        text = parse_docx(file_path)
    elif file_ext == '.txt':
        text = parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")
    
    # 如果OpenAI客户端可用，使用AI解析
    if openai_client:
        try:
            return parse_with_openai(text)
        except Exception as e:
            print(f"Error using OpenAI for parsing: {e}")
            print("Falling back to basic text extraction")
            return {"raw_text": text}
    else:
        # 否则返回提取的文本
        return {"raw_text": text}

def parse_with_openai(resume_text):
    """使用OpenAI解析简历文本并返回结构化数据"""
    system_prompt = """你是一个专业简历解析器。请解析提供的简历文本，提取关键信息并以JSON格式返回。
    不要包含任何额外解释，只返回JSON对象。"""
    
    user_prompt = f"""请将以下简历内容解析为结构化的JSON格式：

{resume_text}

请提取并返回以下字段：
1. 个人信息（姓名、邮箱、电话、地址等）
2. 教育背景（学校、学位、专业、时间段）
3. 工作经历（公司、职位、时间段、职责和成就）
4. 技能（技术技能、软技能等）
5. 其他资质（证书、语言能力等）

以下是期望的JSON结构：
{{
  "personal_info": {{
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "location": ""
  }},
  "education": [
    {{
      "institution": "",
      "degree": "",
      "field_of_study": "",
      "date_range": "",
      "gpa": ""
    }}
  ],
  "work_experience": [
    {{
      "company": "",
      "position": "",
      "date_range": "",
      "responsibilities": [],
      "achievements": []
    }}
  ],
  "skills": {{
    "technical": [],
    "soft": [],
    "languages": [],
    "tools": []
  }},
  "certifications": [],
  "summary": ""
}}

请根据提供的简历内容填充上述结构，如果某些字段没有信息，请保留空值或空数组。
只返回JSON对象，不要包含其他解释或标记。"""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",  # 使用最新的模型
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,  # 低温度确保输出更加一致
        response_format={"type": "json_object"}  # 指定响应格式为JSON
    )
    
    # 获取AI返回的JSON字符串并转换为Python字典
    result_json = response.choices[0].message.content
    try:
        parsed_data = json.loads(result_json)
        return parsed_data
    except json.JSONDecodeError:
        print("Error decoding JSON from OpenAI response")
        return {"raw_text": resume_text, "error": "Failed to parse as JSON"}

def parse_pdf(file_path):
    """Extract text from PDF"""
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def parse_docx(file_path):
    """Extract text from DOCX"""
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def parse_txt(file_path):
    """Extract text from TXT"""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        return file.read()

def extract_resume_sections(text):
    """
    Extract different sections from resume text
    Returns a dictionary with sections as keys and content as values
    """
    # This is a simplified implementation
    # In a real-world scenario, you would use more sophisticated NLP techniques
    sections = {
        "personal_info": "",
        "education": "",
        "experience": "",
        "skills": "",
        "projects": "",
        "certificates": "",
        "languages": "",
        "others": ""
    }
    
    # Basic section detection (very simplified)
    lines = text.split('\n')
    current_section = "others"
    
    for line in lines:
        line = line.strip().lower()
        
        if not line:
            continue
            
        # Check for section headers
        if "education" in line or "academic" in line:
            current_section = "education"
            continue
        elif "experience" in line or "employment" in line or "work" in line:
            current_section = "experience"
            continue
        elif "skill" in line or "technology" in line or "technologies" in line:
            current_section = "skills"
            continue
        elif "project" in line:
            current_section = "projects"
            continue
        elif "certificate" in line or "certification" in line:
            current_section = "certificates"
            continue
        elif "language" in line:
            current_section = "languages"
            continue
        elif any(x in line for x in ["contact", "email", "phone", "address"]):
            current_section = "personal_info"
            continue
            
        # Add line to current section
        sections[current_section] += line + "\n"
    
    return sections 