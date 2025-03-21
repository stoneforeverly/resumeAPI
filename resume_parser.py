import PyPDF2
import docx
import os

def parse_resume(file_path):
    """
    Parse different resume file formats (PDF, DOCX, TXT)
    and extract content as text
    """
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        return parse_pdf(file_path)
    elif file_ext == '.docx':
        return parse_docx(file_path)
    elif file_ext == '.txt':
        return parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}")

def parse_pdf(file_path):
    """Extract text from PDF"""
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
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
    with open(file_path, 'r', encoding='utf-8') as file:
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