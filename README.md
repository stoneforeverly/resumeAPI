# AI-Powered Resume Optimization Platform

This is an AI-powered resume editing, optimization, and analysis platform that supports drag-and-drop editing, content enhancement, and professional preview. The project is divided into frontend and backend components, deployed using Docker containers.

## Features

### Core Functionality
- **Drag-and-Drop Editing**: Intuitively rearrange resume sections and sub-items
- **AI Content Optimization**: Intelligently enhance each section or bullet point to improve professionalism and readability
- **Job Target Matching**: Customize resume content based on specific job requirements
- **Real-time Preview**: View your resume in a professionally formatted preview mode
- **Resume Export**: Export your resume as a PDF document

### AI Capabilities
- Smart content optimization for specific sections
- Customized recommendations based on target job positions
- Automatic identification and enhancement of key skills and achievements
- Improved ATS compatibility (keyword optimization)

## Project Structure

```
resume_02/
├── docker-compose.yml         # Docker orchestration configuration
├── resume_backend/            # Backend code
│   ├── app.py                 # Main application entry
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Backend Docker configuration
│   ├── resume_parser.py       # Resume parsing module
│   ├── resume_analyzer.py     # Resume analysis module
│   └── uploads/               # File upload directory
└── resume-frontend/           # Frontend code
    ├── public/                # Static assets
    ├── src/                   # Source code
    │   ├── components/        # React components
    │   ├── contexts/          # Context management
    │   ├── pages/             # Page components
    │   └── services/          # API services
    ├── Dockerfile             # Frontend Docker configuration
    └── nginx.conf             # Nginx configuration
```

## Technology Stack

### Frontend
- React.js
- TypeScript
- Material-UI
- React DnD (drag-and-drop functionality)
- Axios (API communication)

### Backend
- Python
- Flask
- OpenAI API (GPT models)
- MongoDB (optional)

## Docker Deployment Guide

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key (for AI functionality)

### Deployment Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/QiushiZhou/resumeAPI.git
   cd resumeAPI
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the `resume_backend` directory:
   ```
   OPENAI_API_KEY=sk-your-api-key
   MONGODB_URI=mongodb://your-mongodb-uri (optional)
   ```

3. **Build and Start Containers**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. **Verify Services**
   - Frontend interface: [http://localhost](http://localhost)
   - Backend API: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
   - Health check: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)

5. **View Container Logs**
   ```bash
   docker logs resume-backend
   docker logs resume-frontend
   ```

6. **Stop Services**
   ```bash
   docker-compose down
   ```

## AI Optimization Usage Guide

1. In edit mode, each text field and bullet point has a "magic wand" icon next to it
2. Enter your target job position (e.g., "Software Engineer") in the "Job Target Optimization" panel on the right
3. Click the magic wand icon next to any content, and the AI will optimize it to match the target job
4. Switch to preview mode to see the final result and export it as a PDF

## Development Guide

### Local Development (Without Docker)

**Backend**:
```bash
cd resume_backend
pip install -r requirements.txt
python app.py
```

**Frontend**:
```bash
cd resume-frontend
npm install
npm start
```

### Contributing Code

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

MIT License

