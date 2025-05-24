// types/resume.ts

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string; // e.g., "City, Country" or "City, State"
  linkedin?: string;
  website?: string;
  summary: string;
}

export interface EducationEntry {
  id: string; // UUID for list management
  institution: string;
  degree: string;
  field: string; // Major or field of study
  startDate: string; // Could be YYYY-MM or YYYY
  endDate: string;   // Could be YYYY-MM, YYYY or "Present"
  gpa?: string;
  achievements?: string[]; // List of achievements/bullet points
}

export interface ExperienceEntry {
  id: string; // UUID
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string; // User's raw input
  enhancedDescription?: string; // AI-enhanced version
  achievements: string[]; // Bullet points, can also be AI-enhanced
}

export interface SkillEntry {
  id: string; // UUID
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Technical' | 'Soft' | 'Language' | 'Other';
}

export interface ProjectEntry {
  id: string; // UUID
  name: string;
  description: string;
  technologies: string[]; // List of tech used
  url?: string;
  github?: string;
}

export interface ResumeData {
  id?: string; // Optional: might not exist until saved
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  atsScore: number; // Overall score
  // createdAt: string; // Handled by DB or backend
  // updatedAt: string; // Handled by DB or backend
}

// For the store, we might want to manage current step and other UI states
export interface ResumeState extends ResumeData {
  updateField: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  addEducation: (entry: EducationEntry) => void;
  updateEducation: (index: number, entry: EducationEntry) => void;
  removeEducation: (index: number) => void;
  addExperience: (entry: ExperienceEntry) => void;
  updateExperience: (index: number, entry: ExperienceEntry) => void;
  removeExperience: (index: number) => void;
  // ... similar methods for skills and projects
}


export interface ATSScoreDetails {
  overall: number;
  breakdown?: {
    keywords: { score: number; suggestions: string[]; };
    clarityAndConciseness: { score: number; suggestions: string[]; };
    actionVerbs: { score: number; suggestions: string[]; };
    quantifiableResults: { score: number; suggestions: string[]; };
    // formattingAndStructure: { score: number; suggestions: string[]; }; // OLD
    formattingAndConciseness: { score: number; suggestions: string[]; }; // NEW - Align with AI output
    lengthAndRelevance: { score: number; suggestions: string[]; };
  };
  suggestions: string[];
}