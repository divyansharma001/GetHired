// hooks/use-resume.ts
import { create } from 'zustand';
import { 
    ResumeData, 
    PersonalInfo, 
    EducationEntry, 
    ExperienceEntry, 
    SkillEntry, 
    ProjectEntry 
} from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';

// Define the initial state for a new resume, excluding dynamic parts like userId or title
const initialResumeSubStates: Omit<ResumeData, 'userId' | 'title' | 'id' | 'atsScore'> = {
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
};

// Define the full store state including methods
export interface ResumeStateStore extends ResumeData {
  id?: string; // Optional: The DB ID of the resume being edited/created
  
  // Setters for top-level resume properties
  setId: (id: string) => void;
  setUserId: (userId: string) => void; // Though userId is often set once on init
  setTitle: (title: string) => void;
  setAtsScore: (score: number) => void;
  
  // Methods for PersonalInfo
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  
  // Methods for Education array
  addEducation: () => string; // Returns new entry ID
  updateEducation: (index: number, data: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void; // Remove by entry's unique ID
  
  // Methods for Experience array
  addExperience: () => string; // Returns new entry ID
  updateExperience: (index: number, data: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;

  // Methods for Skills array
  addSkill: () => string; // Returns new entry ID
  updateSkill: (index: number, data: Partial<SkillEntry>) => void;
  removeSkill: (id: string) => void;

  // Methods for Projects array
  addProject: () => string; // Returns new entry ID
  updateProject: (index: number, data: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;
  
  // Function to load an existing resume (e.g., for editing)
  loadResume: (resume: ResumeData & { id: string }) => void; // Ensure loaded resume has an ID
  // Function to reset to initial state (e.g., for creating a new resume)
  resetResume: (userId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useResumeStore = create<ResumeStateStore>((set, get) => ({
  // Initial state values
  id: undefined,
  userId: '', 
  title: 'Untitled Resume',
  atsScore: 0,
  ...initialResumeSubStates,

  // Implementations
  setId: (id) => set({ id }),
  setUserId: (userId) => set({ userId }),
  setTitle: (title) => set({ title }),
  setAtsScore: (score) => set({ atsScore: score }),

  updatePersonalInfo: (data) => set((state) => ({
    personalInfo: { ...state.personalInfo, ...data },
  })),

  addEducation: () => {
    const newId = uuidv4();
    set((state) => ({
      education: [
        ...state.education, 
        { id: newId, institution: '', degree: '', field: '', startDate: '', endDate: '', achievements: [] }
      ],
    }));
    return newId;
  },
  updateEducation: (index, data) => set((state) => {
    const educationList = [...state.education];
    if (educationList[index]) {
      educationList[index] = { ...educationList[index], ...data };
    }
    return { education: educationList };
  }),
  removeEducation: (idToRemove) => set((state) => ({
    education: state.education.filter(edu => edu.id !== idToRemove),
  })),

  addExperience: () => {
    const newId = uuidv4();
    set((state) => ({
      experience: [
        ...state.experience, 
        { id: newId, company: '', position: '', startDate: '', endDate: '', description: '', achievements: [] }
      ],
    }));
    return newId;
  },
  updateExperience: (index, data) => set((state) => {
    const experienceList = [...state.experience];
    if (experienceList[index]) {
      experienceList[index] = { ...experienceList[index], ...data };
    }
    return { experience: experienceList };
  }),
  removeExperience: (idToRemove) => set((state) => ({
    experience: state.experience.filter(exp => exp.id !== idToRemove),
  })),

  addSkill: () => {
    const newId = uuidv4();
    set((state) => ({
      skills: [
        ...state.skills, 
        { id: newId, name: '', level: 'Intermediate', category: 'Technical' }
      ],
    }));
    return newId;
  },
  updateSkill: (index, data) => set((state) => {
    const skillsList = [...state.skills];
    if (skillsList[index]) {
      skillsList[index] = { ...skillsList[index], ...data };
    }
    return { skills: skillsList };
  }),
  removeSkill: (idToRemove) => set((state) => ({
    skills: state.skills.filter(skill => skill.id !== idToRemove),
  })),
  
  addProject: () => {
    const newId = uuidv4();
    set((state) => ({
      projects: [
        ...state.projects, 
        { id: newId, name: '', description: '', technologies: [] }
      ],
    }));
    return newId;
  },
  updateProject: (index, data) => set((state) => {
    const projectsList = [...state.projects];
    if (projectsList[index]) {
      projectsList[index] = { ...projectsList[index], ...data };
    }
    return { projects: projectsList };
  }),
  removeProject: (idToRemove) => set((state) => ({
    projects: state.projects.filter(proj => proj.id !== idToRemove),
  })),
  
  loadResume: (resumeToLoad) => set({ 
    ...resumeToLoad, // This spreads all properties from resumeToLoad
                     // including its id, userId, title, atsScore, and all sections
  }),
  resetResume: (userIdForNewResume) => set({
    id: undefined, // Explicitly reset the resume's own ID
    userId: userIdForNewResume,
    title: 'Untitled Resume',
    atsScore: 0,
    ...initialResumeSubStates, // Spread the clean sub-states
  }),
}));