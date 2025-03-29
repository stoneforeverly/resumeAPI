# Resume Analysis API 文档

## 概述

Resume Analysis API 是一个功能强大的简历分析工具，它提供了简历上传、解析、分析和职位推荐等功能。API 使用 RESTful 架构，支持 JSON 格式的响应数据。

- **版本**: 1.0
- **联系邮箱**: support@resumeanalysis.com

## 身份验证

API 使用 Bearer 令牌认证。在请求头中添加以下内容:

```
Authorization: Bearer {token}
```

## 基础 URL

```
http://localhost:8080
```

## API 端点

### 系统

#### 健康检查

```
GET /api/v1/health
```

检查 API 是否正常运行。

**响应**:

```json
{
  "status": "success",
  "data": {
    "service": "Resume API",
    "status": "healthy",
    "version": "1.0.0"
  }
}
```

### 简历管理

#### 上传简历

```
POST /api/v1/resumes/upload
```

上传简历文件，解析并存储结构化数据。

**Content-Type**: `multipart/form-data`

**参数**:

| 名称 | 位置 | 描述 | 必需 | 类型 |
|------|------|------|------|------|
| file | formData | 要上传的简历文件（仅限PDF） | 是 | file |
| user_id | formData | 与简历关联的用户ID | 是 | string |

**成功响应** (201 CREATED):

```json
{
  "status": "success",
  "data": {
    "resume_id": "60d21b4567a8d1e6d74c2f1a",
    "filename": "resume.pdf",
    "file_type": "pdf",
    "user_id": "user123",
    "parsed_data": {
      "personal_info": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1 (555) 123-4567",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/johndoe"
      },
      "skills": {
        "technical": ["Python", "JavaScript", "React"],
        "soft": ["Communication", "Leadership", "Problem Solving"]
      },
      "education": [
        {
          "institution": "Stanford University",
          "degree": "Bachelor of Science",
          "field_of_study": "Computer Science",
          "date_range": "2016-2020",
          "gpa": "3.8/4.0"
        }
      ]
    }
  }
}
```

**错误响应** (400 BAD REQUEST):

```json
{
  "status": "error",
  "message": "No file uploaded or missing user_id"
}
```

#### 获取用户的所有简历

```
GET /api/v1/resumes
```

获取特定用户上传的所有简历列表。

**参数**:

| 名称 | 位置 | 描述 | 必需 | 类型 |
|------|------|------|------|------|
| user_id | query | 获取简历的用户ID | 是 | string |

**成功响应** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resumes": [
      {
        "resume_id": "60d21b4567a8d1e6d74c2f1a",
        "filename": "resume_john_doe.pdf",
        "status": "parsed",
        "upload_date": "2023-05-01T10:00:00Z",
        "user_id": "user123"
      }
    ]
  }
}
```

#### 获取特定简历

```
GET /api/v1/resumes/{resume_id}
```

通过ID获取特定简历的详细信息。

**参数**:

| 名称 | 位置 | 描述 | 必需 | 类型 |
|------|------|------|------|------|
| resume_id | path | 要获取的简历ID | 是 | string |

**成功响应** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resume_id": "60d21b4567a8d1e6d74c2f1a",
    "filename": "resume_john_doe.pdf",
    "status": "parsed",
    "upload_date": "2023-05-01T10:00:00Z",
    "user_id": "user123",
    "content": "Resume content...",
    "analysis": {
      "overall_score": 85,
      "strengths": ["Strong technical skills", "Good education"],
      "areas_for_improvement": ["Add more quantifiable achievements"]
    }
  }
}
```

### 简历处理

#### 解析简历

```
POST /api/v1/resumes/{resume_id}/parse
```

使用OpenAI从之前上传的简历文件中提取结构化数据。

**参数**:

| 名称 | 位置 | 描述 | 必需 | 类型 |
|------|------|------|------|------|
| resume_id | path | 要解析的简历ID | 是 | string |

**成功响应** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resume_id": "60d21b4567a8d1e6d74c2f1a",
    "message": "Resume parsed successfully using OpenAI",
    "content": {
      "personal_info": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1 (555) 123-4567",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/johndoe"
      },
      "summary": "Experienced software engineer with 3+ years of experience in web development...",
      "education": [
        {
          "institution": "Stanford University",
          "degree": "Bachelor of Science",
          "field_of_study": "Computer Science",
          "date_range": "2016-2020",
          "gpa": "3.8/4.0"
        }
      ],
      "work_experience": [
        {
          "company": "Tech Company Inc",
          "position": "Software Engineer",
          "date_range": "2020-2023",
          "responsibilities": [
            "Developed web applications",
            "Optimized database queries"
          ],
          "achievements": [
            "Reduced page load time by 40%",
            "Implemented CI/CD pipeline"
          ]
        }
      ],
      "skills": {
        "technical": ["Python", "JavaScript", "React"],
        "soft": ["Communication", "Leadership", "Problem Solving"],
        "languages": ["English", "Spanish"],
        "tools": ["Git", "Docker", "AWS"]
      },
      "certifications": ["AWS Certified Developer", "MongoDB Certified Developer"]
    }
  }
}
```

#### 分析简历

```
POST /api/v1/resumes/{resume_id}/analyze
```

使用AI为先前解析的简历生成分析和评分。

**参数**:

| 名称 | 位置 | 描述 | 必需 | 类型 |
|------|------|------|------|------|
| resume_id | path | 要分析的简历ID | 是 | string |

**成功响应** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resume_id": "60d21b4567a8d1e6d74c2f1a",
    "analysis_id": "60d21b4567a8d1e6d74c2f1b",
    "analysis": {
      "overall_score": 85,
      "strengths": [
        "Strong technical skills",
        "Good education",
        "Relevant experience"
      ],
      "areas_for_improvement": [
        "Add more quantifiable achievements",
        "Improve formatting"
      ],
      "suggestions": [
        "Highlight more accomplishments",
        "Add relevant keywords"
      ],
      "ats_compatibility": {
        "score": 80,
        "comments": "Good structure, but add more industry keywords"
      }
    }
  }
}
```

### 职位建议

#### 获取职位建议

```
GET /api/v1/resumes/{resume_id}/job-suggestions
```

基于简历生成职位建议和推荐。

**参数**:

| 名称 | 位置 | 描述 | 必需 | 类型 |
|------|------|------|------|------|
| resume_id | path | 要获取职位建议的简历ID | 是 | string |

**成功响应** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resume_id": "60d21b4567a8d1e6d74c2f1a",
    "job_suggestions": {
      "job_positions": [
        {
          "job_title": "Senior Software Engineer",
          "match_score": 85,
          "required_skills": ["Python", "Flask", "MongoDB"],
          "description": "This role aligns with your experience in Python development",
          "estimated_salary_range": "$100,000 - $130,000",
          "potential_companies": ["Google", "Amazon", "Microsoft"]
        }
      ]
    }
  }
}
```

### 简历分析

#### 获取简历分析

```
GET /api/v1/analyses/{resume_id}
```

获取特定简历的分析结果。

**参数**:

| 名称 | 位置 | 描述 | 必需 | 类型 |
|------|------|------|------|------|
| resume_id | path | 要获取分析的简历ID | 是 | string |

**成功响应** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resume_id": "60d21b4567a8d1e6d74c2f1a",
    "analysis_id": "60d21b4567a8d1e6d74c2f1b",
    "analysis": {
      "overall_score": 85,
      "strengths": [
        "Strong technical skills",
        "Good education",
        "Relevant experience"
      ],
      "areas_for_improvement": [
        "Add more quantifiable achievements",
        "Improve formatting"
      ],
      "suggestions": [
        "Highlight more accomplishments",
        "Add relevant keywords"
      ],
      "ats_compatibility": {
        "score": 80,
        "comments": "Good structure, but add more industry keywords"
      }
    }
  }
}
```

### 兼容性 API

#### 旧版简历上传和分析

```
POST /api/resumes
```

旧版端点，用于一步上传、解析和分析简历。

**Content-Type**: `multipart/form-data`

**参数**:

| 名称 | 位置 | 描述 | 必需 | 类型 |
|------|------|------|------|------|
| file | formData | 要上传的简历文件（仅限PDF） | 是 | file |
| user_id | formData | 与简历关联的用户ID | 是 | string |

**成功响应** (200 OK):

```json
{
  "status": "success",
  "data": {
    "resume_id": "60d21b4567a8d1e6d74c2f1a",
    "parsed_content": {
      "personal_info": {},
      "summary": "",
      "education": [],
      "work_experience": [],
      "skills": {},
      "certifications": []
    },
    "analysis": {
      "overall_score": 85,
      "strengths": [
        "Strong technical skills",
        "Good education background"
      ],
      "areas_for_improvement": [
        "Could add more measurable achievements"
      ],
      "ats_compatibility": {}
    }
  }
}
```

## 状态码

- `200 OK` - 请求成功
- `201 CREATED` - 资源创建成功
- `400 BAD REQUEST` - 请求参数不正确或缺失
- `404 NOT FOUND` - 请求的资源不存在
- `500 INTERNAL SERVER ERROR` - 服务器处理请求时发生错误

## 数据模型

### 简历
- `resume_id`: 简历唯一标识符
- `filename`: 上传的文件名
- `status`: 简历状态 (uploaded, parsed, analyzed)
- `upload_date`: 上传日期时间
- `user_id`: 关联的用户ID
- `content`: 简历内容（结构化数据）

### 分析
- `analysis_id`: 分析唯一标识符
- `resume_id`: 关联的简历ID
- `overall_score`: 整体评分（0-100）
- `strengths`: 简历的优势列表
- `areas_for_improvement`: 需要改进的方面
- `suggestions`: 改进建议
- `ats_compatibility`: ATS兼容性评估

### 职位建议
- `job_title`: 职位名称
- `match_score`: 匹配分数（0-100）
- `required_skills`: 所需技能列表
- `description`: 职位与简历匹配的描述
- `skills_to_develop`: 建议发展的技能 