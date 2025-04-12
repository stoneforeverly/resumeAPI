import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume API functions
export const resumeApi = {
  // Upload a resume
  uploadResume: async (file: File, userId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    return api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get a list of user's resumes
  getResumes: async (userId: string) => {
    return api.get(`/resumes?user_id=${userId}`);
  },

  // Get a specific resume
  getResume: async (resumeId: string) => {
    return api.get(`/resumes/${resumeId}`);
  },

  // Parse a resume
  parseResume: async (resumeId: string) => {
    return api.post(`/resumes/${resumeId}/parse`);
  },

  // Analyze a resume
  analyzeResume: async (resumeId: string) => {
    return api.post(`/resumes/${resumeId}/analyze`);
  },

  // Get analysis for a resume
  getAnalysis: async (resumeId: string) => {
    return api.get(`/analyses/${resumeId}`);
  },

  // Get job suggestions for a resume
  getJobSuggestions: async (resumeId: string) => {
    return api.get(`/resumes/${resumeId}/job-suggestions`);
  },

  // Update resume content
  updateResumeContent: async (resumeId: string, content: any) => {
    return api.put(`/resumes/${resumeId}/content`, { content });
  },
  
  // Download optimized resume
  downloadResume: async (resumeId: string) => {
    return api.get(`/resumes/${resumeId}/download`, {
      responseType: 'blob',
    });
  },
  
  // AI优化简历内容（section或bullet point）
  optimizeContent: async (resumeId: string, data: {
    sectionKey: string;
    itemIndex?: number;
    bulletIndex?: number;
    nestedSection?: string;
    nestedItemIndex?: number;
    currentContent: string;
    jobTitle?: string;
  }) => {
    return api.post(`/resumes/${resumeId}/optimize-content`, data);
  },
};

// Auth API functions
export const authApi = {
  // Verify Google token with backend (placeholder for future implementation)
  verifyGoogleToken: async (token: string) => {
    // This would be implemented to send the Google token to your backend for verification
    // For now, we'll just simulate a successful response
    return Promise.resolve({
      data: {
        status: 'success',
        data: {
          id: 'google-user-123',
          name: 'Test User',
          email: 'testuser@example.com',
          picture: 'https://example.com/profile.jpg'
        }
      }
    });
  }
};

export default api; 