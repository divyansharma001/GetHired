// hooks/use-resume.ts
import { create } from 'zustand';
import { ResumeData, PersonalInfo, EducationEntry, ExperienceEntry, SkillEntry, ProjectEntry } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for list items

interface ResumeStateStore extends ResumeData {
  setUserId: (userId: string) => void;
  setTitle: (title: string) => void;
  
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  
  addEducation: () => void;
  updateEducation: (index: number, data: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;
  
  addExperience: () => void;
  updateExperience: (index: number, data: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;

  addSkill: () => void;
  updateSkill: (index: number, data: Partial<SkillEntry>) => void;
  removeSkill: (id: string) => void;

  addProject: () => void;
  updateProject: (index: number, data: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;

  setAtsScore: (score: number) => void;
  
  // Function to load an existing resume (e.g., for editing)
  loadResume: (resume: ResumeData) => void;
  // Function to reset to initial state (e.g., for creating a new resume)
  resetResume: (userId: string) => void;
}

const initialResumeState: Omit<ResumeData, 'userId' | 'title'> = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  atsScore: 0,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useResumeStore = create<ResumeStateStore>((set, get) => ({
  ...initialResumeState,
  userId: '', // Will be set after auth
  title: 'Untitled Resume',

  setUserId: (userId) => set({ userId }),
  setTitle: (title) => set({ title }),

  updatePersonalInfo: (data) => set((state) => ({
    personalInfo: { ...state.personalInfo, ...data },
  })),

    addEducation: () => {
    const newId = uuidv4();
    set((state) => ({
      education: [...state.education, { id: newId, institution: '', degree: '', field: '', startDate: '', endDate: '', achievements: [] }],
    }));
    return newId; // Return the ID
  },
  
  updateEducation: (index, data) => set((state) => {
    const education = [...state.education];
    education[index] = { ...education[index], ...data };
    return { education };
  }),
  removeEducation: (id) => set((state) => ({
    education: state.education.filter(edu => edu.id !== id),
  })),

  addExperience: () => set((state) => ({
    experience: [...state.experience, { id: uuidv4(), company: '', position: '', startDate: '', endDate: '', description: '', achievements: [] }],
  })),
  updateExperience: (index, data) => set((state) => {
    const experience = [...state.experience];
    experience[index] = { ...experience[index], ...data };
    return { experience };
  }),
  removeExperience: (id) => set((state) => ({
    experience: state.experience.filter(exp => exp.id !== id),
  })),

  addSkill: () => set((state) => ({
    skills: [...state.skills, { id: uuidv4(), name: '', level: 'Intermediate', category: 'Technical' }],
  })),
  updateSkill: (index, data) => set((state) => {
    const skills = [...state.skills];
    skills[index] = { ...skills[index], ...data };
    return { skills };
  }),
  removeSkill: (id) => set((state) => ({
    skills: state.skills.filter(skill => skill.id !== id),
  })),
  
  addProject: () => set((state) => ({
    projects: [...state.projects, { id: uuidv4(), name: '', description: '', technologies: [] }],
  })),
  updateProject: (index, data) => set((state) => {
    const projects = [...state.projects];
    projects[index] = { ...projects[index], ...data };
    return { projects };
  }),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(proj => proj.id !== id),
  })),

  setAtsScore: (score) => set({ atsScore: score }),
  
  loadResume: (resume) => set({ ...resume }),
  resetResume: (userId) => set({ ...initialResumeState, userId, title: 'Untitled Resume' }),
}));