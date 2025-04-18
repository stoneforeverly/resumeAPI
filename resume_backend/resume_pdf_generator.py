import os
import tempfile
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem

class ResumePDFGenerator:
    """生成自定义简历PDF的类"""
    
    def __init__(self, output_dir=None, config=None):
        """初始化PDF生成器
        
        Args:
            output_dir: PDF输出目录，如果为None则使用临时目录
            config: PDF生成配置，可以自定义边距、字体、颜色等
        """
        self.output_dir = output_dir or tempfile.gettempdir()
        
        # 默认配置
        self.default_config = {
            'page': {
                'size': letter,
                'margins': {
                    'top': 0.2,
                    'bottom': 0.3,
                    'left': 0.3,
                    'right': 0.3
                }
            },
            'fonts': {
                'name': 'Times-Bold',
                'normal': 'Times-Roman',
                'italic': 'Times-Italic',
                'bold': 'Times-Bold'
            },
            'font_sizes': {
                'name': 24,
                'section_title': 12,
                'job_title': 11,
                'normal': 10,
                'small': 9
            },
            'spacings': {
                'after_name': 12,
                'after_section_title': 6,
                'after_paragraph': 3,
                'between_items': 12,
                'between_sections': 6
            },
            'dividers': {
                'use_dividers': True,
                'color': colors.black,
                'thickness': 0.5
            },
            'layout': {
                'company_date_same_line': False,  # 是否将公司和日期在同一行
                'bullet_char': '•'  # 项目符号字符
            }
        }
        
        # 合并自定义配置
        self.config = self.default_config
        if config:
            self._merge_config(config)
        
        # 创建样式
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
    
    def _merge_config(self, config):
        """合并自定义配置与默认配置"""
        for category, values in config.items():
            if category in self.config:
                if isinstance(self.config[category], dict) and isinstance(values, dict):
                    for key, value in values.items():
                        self.config[category][key] = value
                else:
                    self.config[category] = values
            else:
                self.config[category] = values
    
    def _create_custom_styles(self):
        """创建自定义样式，以匹配截图中的简历格式"""
        # 标题样式
        self.styles.add(ParagraphStyle(
            name='Name',
            fontName=self.config['fonts']['name'],
            fontSize=self.config['font_sizes']['name'],
            alignment=0,  # 左对齐
            spaceAfter=self.config['spacings']['after_name'],
            spaceBefore=0
        ))
        
        # 联系信息样式
        self.styles.add(ParagraphStyle(
            name='Contact',
            fontName=self.config['fonts']['normal'],
            fontSize=self.config['font_sizes']['normal'],
            alignment=0,  # 左对齐
            spaceAfter=self.config['spacings']['after_paragraph']
        ))
        
        # 章节标题样式
        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            fontName=self.config['fonts']['bold'],
            fontSize=self.config['font_sizes']['section_title'],
            spaceAfter=self.config['spacings']['after_section_title']
        ))
        
        # 职位样式
        self.styles.add(ParagraphStyle(
            name='JobTitle',
            fontName=self.config['fonts']['bold'],
            fontSize=self.config['font_sizes']['job_title'],
            spaceAfter=1
        ))
        
        # 公司样式
        self.styles.add(ParagraphStyle(
            name='Company',
            fontName=self.config['fonts']['italic'],
            fontSize=self.config['font_sizes']['job_title'],
            spaceAfter=1
        ))
        
        # 日期样式
        self.styles.add(ParagraphStyle(
            name='Date',
            fontName=self.config['fonts']['normal'],
            fontSize=self.config['font_sizes']['normal'],
            alignment=2,  # 右对齐
        ))
        
        # 普通文本样式
        self.styles.add(ParagraphStyle(
            name='NormalText',
            fontName=self.config['fonts']['normal'],
            fontSize=self.config['font_sizes']['normal'],
            spaceAfter=self.config['spacings']['after_paragraph']
        ))
        
        # 项目符号样式
        self.styles.add(ParagraphStyle(
            name='BulletItem',
            fontName=self.config['fonts']['normal'],
            fontSize=self.config['font_sizes']['normal'],
            leftIndent=10,
            firstLineIndent=-10,
            spaceBefore=0,
            spaceAfter=self.config['spacings']['after_paragraph']
        ))
    
    def generate(self, resume_data, output_filename=None, custom_config=None):
        """根据简历数据生成PDF
        
        Args:
            resume_data: 简历数据字典
            output_filename: 输出文件名，如果为None则自动生成
            custom_config: 针对此次生成的自定义配置，会覆盖实例配置
            
        Returns:
            生成的PDF文件路径
        """
        # 应用针对此次生成的自定义配置
        if custom_config:
            old_config = dict(self.config)
            self._merge_config(custom_config)
            self._create_custom_styles()  # 重新创建样式
            
        if output_filename is None:
            output_filename = f"resume_{resume_data.get('_id', 'output')}.pdf"
        
        output_path = os.path.join(self.output_dir, output_filename)
        
        # 获取边距配置
        margins = self.config['page']['margins']
        
        # 创建文档
        doc = SimpleDocTemplate(
            output_path,
            pagesize=self.config['page']['size'],
            topMargin=margins['top']*inch,
            bottomMargin=margins['bottom']*inch,
            leftMargin=margins['left']*inch,
            rightMargin=margins['right']*inch
        )
        
        # 存储要添加到文档的元素
        elements = []
        
        # 添加姓名
        if 'personal_information' in resume_data and 'name' in resume_data['personal_information']:
            name = resume_data['personal_information']['name']
            elements.append(Paragraph(name, self.styles['Name']))
            elements.append(Spacer(1, 6))  # 在名字和联系信息之间添加额外的空间
        
        # 添加联系信息
        contact_info = []
        if 'personal_information' in resume_data:
            pi = resume_data['personal_information']
            
            for field in ['phone', 'email', 'linkedin', 'website', 'address']:
                if field in pi and pi[field]:
                    contact_info.append(pi[field])
        
        if contact_info:
            contact_text = ' | '.join(contact_info)
            elements.append(Paragraph(contact_text, self.styles['Contact']))
        
        elements.append(Spacer(1, self.config['spacings']['between_items']))
        
        # 如果使用分隔线
        if self.config['dividers']['use_dividers']:
            elements.append(self._create_divider())
            elements.append(Spacer(1, self.config['spacings']['between_sections']))
        
        # 定义section的显示名称映射，可以针对不同语言进行本地化
        section_names = {
            'summary': 'Summary',
            'objective': 'Objective',
            'skills': 'Skills',
            'professional_experience': 'Professional Experience',
            'experience': 'Experience',
            'projects': 'Projects',
            'education': 'Education',
            'certifications': 'Certifications',
            'awards': 'Awards',
            'publications': 'Publications',
            'languages': 'Languages',
            'interests': 'Interests',
            'references': 'References'
        }
        
        # 获取所有需要渲染的section
        sections = []
        # 首先检查resume_data中是否有sections或section_order字段，可能包含了布局顺序
        if 'sections' in resume_data and isinstance(resume_data['sections'], list):
            # 如果有sections字段，按其中的顺序处理
            sections = resume_data['sections']
        elif 'section_order' in resume_data and isinstance(resume_data['section_order'], list):
            # 如果有section_order字段，按其中的顺序处理
            sections = resume_data['section_order']
        else:
            # 否则从resume_data的键中提取sections
            for key in resume_data.keys():
                if (key != 'personal_information' and key != '_id' and 
                    key != 'sections' and key != 'section_order' and 
                    not key.startswith('_')):
                    sections.append(key)
        
        # 处理每个section
        for section in sections:
            # 跳过section_order或sections字段本身
            if section in ['section_order', 'sections']:
                continue
                
            # 确保section存在于resume_data中
            if section not in resume_data:
                continue
                
            section_data = resume_data[section]
            
            # 如果section数据为空，跳过
            if not section_data:
                continue
                
            # 根据section类型处理内容
            method_name = f"_render_{section}"
            if hasattr(self, method_name):
                # 如果有专门的方法处理该section
                getattr(self, method_name)(elements, section_data, section_names.get(section, section.replace('_', ' ').title()))
            else:
                # 默认处理方式
                self._render_default_section(elements, section, section_data, section_names.get(section, section.replace('_', ' ').title()))
            
            # 添加分隔线，除非是最后一个section
            if section != sections[-1]:
                elements.append(Spacer(1, self.config['spacings']['between_sections']))
                if self.config['dividers']['use_dividers']:
                    elements.append(self._create_divider())
                    elements.append(Spacer(1, self.config['spacings']['between_sections']))
        
        # 构建PDF
        doc.build(elements)
        
        # 如果使用了临时配置，恢复原始配置
        if custom_config:
            self.config = old_config
            self._create_custom_styles()  # 重新创建样式
            
        return output_path
    
    def _render_summary(self, elements, summary_data, section_title='Summary'):
        """渲染概述部分"""
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        if isinstance(summary_data, str):
            elements.append(Paragraph(summary_data, self.styles['NormalText']))
        elif isinstance(summary_data, dict) and 'content' in summary_data:
            elements.append(Paragraph(summary_data['content'], self.styles['NormalText']))
    
    def _render_objective(self, elements, objective_data, section_title='Objective'):
        """渲染目标部分"""
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        if isinstance(objective_data, str):
            elements.append(Paragraph(objective_data, self.styles['NormalText']))
        elif isinstance(objective_data, dict) and 'content' in objective_data:
            elements.append(Paragraph(objective_data['content'], self.styles['NormalText']))
    
    def _render_skills(self, elements, skills_data, section_title='Skills'):
        """渲染技能部分"""
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        
        # 技能可能是对象或数组
        if isinstance(skills_data, dict):
            # 处理每个技能类别
            for category, skills in skills_data.items():
                if skills:
                    category_name = category.replace('_', ' ').title()
                    if isinstance(skills, list):
                        skill_text = f"<b>{category_name}:</b> {', '.join(skills)}"
                        elements.append(Paragraph(skill_text, self.styles['NormalText']))
                    elif isinstance(skills, str):
                        skill_text = f"<b>{category_name}:</b> {skills}"
                        elements.append(Paragraph(skill_text, self.styles['NormalText']))
        elif isinstance(skills_data, list):
            # 如果是简单的技能列表
            elements.append(Paragraph(', '.join(skills_data), self.styles['NormalText']))
    
    def _render_professional_experience(self, elements, experience_data, section_title='Professional Experience'):
        """渲染专业经验部分"""
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        self._render_experience_items(elements, experience_data)
    
    def _render_experience(self, elements, experience_data, section_title='Experience'):
        """渲染经验部分"""
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        self._render_experience_items(elements, experience_data)
    
    def _render_experience_items(self, elements, experience_data):
        """渲染经验项目"""
        if not isinstance(experience_data, list):
            return
            
        for exp in experience_data:
            # 获取职位名称
            position = ''
            for key in ['position', 'title', 'role']:
                if key in exp and exp[key]:
                    position = exp[key]
                    break
            
            # 获取公司名称
            company = ''
            for key in ['company', 'organization', 'employer']:
                if key in exp and exp[key]:
                    company = exp[key]
                    break
            
            # 获取日期
            dates = ''
            for key in ['dates', 'date', 'duration', 'period']:
                if key in exp and exp[key]:
                    dates = exp[key]
                    break
            
            # 添加职位
            if position:
                elements.append(Paragraph(position, self.styles['JobTitle']))
            
            # 根据配置决定公司和日期的布局
            if self.config['layout']['company_date_same_line'] and company and dates:
                # 如果需要在同一行显示公司和日期，使用表格
                company_date_table = Table([
                    [Paragraph(f"<i>{company}</i>", self.styles['Company']), 
                     Paragraph(dates, self.styles['Date'])]
                ], colWidths=[(doc.width)*0.7, (doc.width)*0.3])
                
                company_date_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ]))
                
                elements.append(company_date_table)
            else:
                # 否则分别显示公司和日期
                if company:
                    elements.append(Paragraph(f"<i>{company}</i>", self.styles['Company']))
                
                if dates:
                    date_style = ParagraphStyle(
                        'DateRight',
                        parent=self.styles['Date'],
                        alignment=2  # 右对齐
                    )
                    elements.append(Paragraph(dates, date_style))
            
            # 添加职责/描述
            responsibilities_key = None
            for key in ['responsibilities', 'description', 'descriptions', 'duties', 'achievements']:
                if key in exp and exp[key]:
                    responsibilities_key = key
                    break
                    
            if responsibilities_key:
                responsibilities = exp[responsibilities_key]
                if isinstance(responsibilities, list):
                    for resp in responsibilities:
                        if resp:
                            bullet = self.config['layout']['bullet_char']
                            elements.append(Paragraph(f"{bullet} {resp}", self.styles['BulletItem']))
                elif isinstance(responsibilities, str):
                    bullet = self.config['layout']['bullet_char']
                    elements.append(Paragraph(f"{bullet} {responsibilities}", self.styles['BulletItem']))
            
            # 添加项目（如果有）
            if 'projects' in exp and exp['projects']:
                for project in exp['projects']:
                    project_name = project.get('name', '')
                    if project_name:
                        elements.append(Paragraph(f"<i>{project_name}</i>", self.styles['NormalText']))
                    
                    project_resp_key = None
                    for key in ['responsibilities', 'description', 'descriptions', 'details']:
                        if key in project and project[key]:
                            project_resp_key = key
                            break
                            
                    if project_resp_key:
                        if isinstance(project[project_resp_key], list):
                            for resp in project[project_resp_key]:
                                if resp:
                                    bullet = self.config['layout']['bullet_char']
                                    elements.append(Paragraph(f"  {bullet} {resp}", self.styles['BulletItem']))
                        elif isinstance(project[project_resp_key], str):
                            bullet = self.config['layout']['bullet_char']
                            elements.append(Paragraph(f"  {bullet} {project[project_resp_key]}", self.styles['BulletItem']))
            
            elements.append(Spacer(1, self.config['spacings']['between_items']))
    
    def _render_education(self, elements, education_data, section_title='Education'):
        """渲染教育经历部分"""
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        
        if not isinstance(education_data, list):
            return
            
        for edu in education_data:
            # 获取学校名称
            school = ''
            for key in ['institution', 'school', 'university', 'college']:
                if key in edu and edu[key]:
                    school = edu[key]
                    break
            
            # 获取学位和专业
            degree = edu.get('degree', '')
            field = ''
            for key in ['field_of_study', 'major', 'field', 'concentration']:
                if key in edu and edu[key]:
                    field = edu[key]
                    break
                
            # 获取GPA
            gpa = ''
            for key in ['gpa', 'grade', 'grade_point_average']:
                if key in edu and edu[key]:
                    gpa = edu[key]
                    break
            
            # 获取日期
            dates = ''
            for key in ['dates', 'date', 'duration', 'period', 'graduation_date']:
                if key in edu and edu[key]:
                    dates = edu[key]
                    break
            
            # 构建学位和专业文本
            if degree and field:
                degree_field = f"{degree}, {field}"
            elif degree:
                degree_field = degree
            elif field:
                degree_field = field
            else:
                degree_field = ''
            
            # 添加学校名称
            if school:
                elements.append(Paragraph(school, self.styles['JobTitle']))
            
            # 学位专业和日期布局
            if self.config['layout']['company_date_same_line'] and degree_field and dates:
                # 添加GPA
                if gpa:
                    degree_field = f"{degree_field}  (GPA: {gpa})"
                
                # 如果需要在同一行显示学位和日期，使用表格
                edu_date_table = Table([
                    [Paragraph(f"<i>{degree_field}</i>", self.styles['Company']), 
                     Paragraph(dates, self.styles['Date'])]
                ], colWidths=[(doc.width)*0.7, (doc.width)*0.3])
                
                edu_date_table.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ]))
                
                elements.append(edu_date_table)
            else:
                # 否则分别显示学位和日期
                if degree_field:
                    if gpa:
                        degree_field = f"{degree_field}  (GPA: {gpa})"
                    elements.append(Paragraph(f"<i>{degree_field}</i>", self.styles['Company']))
                
                if dates:
                    date_style = ParagraphStyle(
                        'DateRight',
                        parent=self.styles['Date'],
                        alignment=2  # 右对齐
                    )
                    elements.append(Paragraph(dates, date_style))
            
            elements.append(Spacer(1, self.config['spacings']['between_items']))
    
    def _render_projects(self, elements, projects_data, section_title='Projects'):
        """渲染项目部分"""
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        
        if not isinstance(projects_data, list):
            return
            
        for project in projects_data:
            # 项目名称和日期
            name = project.get('name', '')
            dates = project.get('dates', '')
            
            if name:
                elements.append(Paragraph(name, self.styles['JobTitle']))
            
            if dates:
                date_style = ParagraphStyle(
                    'DateRight',
                    parent=self.styles['Date'],
                    alignment=2  # 右对齐
                )
                elements.append(Paragraph(dates, date_style))
            
            # 项目描述
            description_key = None
            for key in ['description', 'descriptions', 'details', 'responsibilities']:
                if key in project and project[key]:
                    description_key = key
                    break
                    
            if description_key:
                descriptions = project[description_key]
                if isinstance(descriptions, list):
                    for desc in descriptions:
                        if desc:
                            bullet = self.config['layout']['bullet_char']
                            elements.append(Paragraph(f"{bullet} {desc}", self.styles['BulletItem']))
                elif isinstance(descriptions, str):
                    bullet = self.config['layout']['bullet_char']
                    elements.append(Paragraph(f"{bullet} {descriptions}", self.styles['BulletItem']))
            
            elements.append(Spacer(1, self.config['spacings']['between_items']))
    
    def _render_certifications(self, elements, certifications_data, section_title='Certifications'):
        """渲染证书部分"""
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        
        if isinstance(certifications_data, list):
            for cert in certifications_data:
                if isinstance(cert, dict):
                    name = cert.get('name', '')
                    issuer = cert.get('issuer', '')
                    date = cert.get('date', '')
                    
                    cert_text = name
                    if issuer:
                        cert_text += f" - {issuer}"
                    if date:
                        cert_text += f" ({date})"
                        
                    elements.append(Paragraph(cert_text, self.styles['NormalText']))
                elif isinstance(cert, str):
                    elements.append(Paragraph(cert, self.styles['NormalText']))
        elif isinstance(certifications_data, str):
            elements.append(Paragraph(certifications_data, self.styles['NormalText']))
    
    def _render_default_section(self, elements, section_name, section_data, section_title=None):
        """渲染默认section格式"""
        # 使用提供的标题或格式化section名称
        if not section_title:
            section_title = section_name.replace('_', ' ').title()
        elements.append(Paragraph(section_title, self.styles['SectionTitle']))
        
        # 根据数据类型渲染内容
        if isinstance(section_data, str):
            elements.append(Paragraph(section_data, self.styles['NormalText']))
        elif isinstance(section_data, list):
            for item in section_data:
                if isinstance(item, dict):
                    # 尝试找到最重要的字段，优先级：name > title > content
                    item_text = ''
                    for key in ['name', 'title', 'content', 'description']:
                        if key in item and item[key]:
                            item_text = item[key]
                            break
                            
                    if not item_text:
                        # 将字典中的所有非空值连接起来
                        item_parts = []
                        for k, v in item.items():
                            if v and not k.startswith('_'):
                                item_parts.append(f"{k}: {v}")
                        item_text = ', '.join(item_parts)
                        
                    if item_text:
                        bullet = self.config['layout']['bullet_char']
                        elements.append(Paragraph(f"{bullet} {item_text}", self.styles['BulletItem']))
                elif isinstance(item, str):
                    bullet = self.config['layout']['bullet_char']
                    elements.append(Paragraph(f"{bullet} {item}", self.styles['BulletItem']))
        elif isinstance(section_data, dict):
            # 将字典中的键值对渲染为文本
            for key, value in section_data.items():
                if not key.startswith('_'):  # 跳过内部属性
                    key_text = key.replace('_', ' ').title()
                    
                    if isinstance(value, str):
                        elements.append(Paragraph(f"<b>{key_text}:</b> {value}", self.styles['NormalText']))
                    elif isinstance(value, list):
                        elements.append(Paragraph(f"<b>{key_text}:</b>", self.styles['NormalText']))
                        for item in value:
                            if item:
                                bullet = self.config['layout']['bullet_char']
                                elements.append(Paragraph(f"{bullet} {item}", self.styles['BulletItem']))
    
    def _create_divider(self):
        """创建分隔线"""
        width = (8.5 - self.config['page']['margins']['left'] - self.config['page']['margins']['right']) * inch
        t = Table([['', '']], colWidths=[width], rowHeights=[1])
        t.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, 0), self.config['dividers']['thickness'], self.config['dividers']['color']),
        ]))
        return t

# 创建单例实例，使用默认配置
pdf_generator = ResumePDFGenerator()

# 示例：如何创建自定义配置的生成器实例
# custom_config = {
#     'page': {'margins': {'left': 0.5, 'right': 0.5}},
#     'fonts': {'name': 'Helvetica-Bold'},
#     'font_sizes': {'name': 28},
#     'layout': {'company_date_same_line': True, 'bullet_char': '-'}
# }
# custom_pdf_generator = ResumePDFGenerator(config=custom_config) 