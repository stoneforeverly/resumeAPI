import PyPDF2
import docx
import os
from openai import OpenAI
from dotenv import load_dotenv
import json

# 加载环境变量
load_dotenv()

# 初始化 OpenAI 客户端
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
    解析简历文件，优先使用 OpenAI，如果失败则返回纯文本
    """
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        text = parse_pdf(file_path)
    elif file_ext == '.docx':
        text = parse_docx(file_path)
    elif file_ext == '.txt':
        text = parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")
    
    # 使用 OpenAI 分析简历
    if openai_client:
        try:
            return parse_with_openai(text)
        except Exception as e:
            print(f"Error using OpenAI for parsing: {e}")
            print("Falling back to basic text extraction")
            return {"raw_text": text}
    else:
        return {"raw_text": text}

def parse_with_openai(resume_text):
    """
    使用 OpenAI 将简历文本转换为结构化 JSON 格式（动态结构）
    """
    system_prompt = """你是一个专业的简历解析器。请根据输入的简历文本，自动识别其主要结构并将其转换为结构化的 JSON 格式。
你不需要固定字段名称，只需根据简历中实际出现的内容自动分类，例如：

- 个人信息（如姓名、邮箱、电话、地址）
- 教育背景
- 工作经历
- 技能
- 项目经验
- 证书
- 兴趣爱好
- 语言能力
- 其他重要内容

字段名可以根据实际内容自定义，只需确保结构清晰合理，便于数据库存储。请直接输出 JSON 对象，不要添加任何说明文字。
"""

    user_prompt = f"""以下是简历原始文本内容，请进行解析并转换为结构化 JSON：

{resume_text}
"""

    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
        response_format={"type": "json_object"}  # 保证输出为 JSON 对象
    )

    result_json = response.choices[0].message.content

    try:
        parsed_data = json.loads(result_json)
        return parsed_data
    except json.JSONDecodeError:
        print("Error decoding JSON from OpenAI response")
        return {"raw_text": resume_text, "error": "Failed to parse as JSON"}

def parse_pdf(file_path):
    """提取 PDF 文本"""
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
    return text

def parse_docx(file_path):
    """提取 DOCX 文本"""
    doc = docx.Document(file_path)
    return "\n".join(para.text for para in doc.paragraphs)

def parse_txt(file_path):
    """提取 TXT 文本"""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        return file.read()

# 可选：如果你仍需要对本地 resume text 粗略分段
def extract_resume_sections(text):
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
    
    lines = text.split('\n')
    current_section = "others"
    
    for line in lines:
        line = line.strip().lower()
        if not line:
            continue
        if "education" in line or "academic" in line:
            current_section = "education"
        elif "experience" in line or "employment" in line or "work" in line:
            current_section = "experience"
        elif "skill" in line or "technology" in line or "technologies" in line:
            current_section = "skills"
        elif "project" in line:
            current_section = "projects"
        elif "certificate" in line or "certification" in line:
            current_section = "certificates"
        elif "language" in line:
            current_section = "languages"
        elif any(x in line for x in ["contact", "email", "phone", "address"]):
            current_section = "personal_info"
        sections[current_section] += line + "\n"
    
    return sections
