export interface ResumeData {
  [key: string]: any;
  personal_info?: any;
  summary?: string;
  experience?: any[];
  education?: any[];
  skills?: any;
}

export interface AnalysisData {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  ats_compatibility_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  suggestions: string[];
  ats_compatibility: {
    score: number;
    comments: string;
  };
  [key: string]: any;
} 