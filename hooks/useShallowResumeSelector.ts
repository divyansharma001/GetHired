// hooks/useShallowResumeSelector.ts
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import { shallow } from 'zustand/shallow';
import { useResumeStore, ResumeStateStore } from './use-resume'; // Your main store

// Define the shape of the data selected by this general-purpose hook
export interface ShallowSelectedResumeParts {
  id?: ResumeStateStore['id'];
  userId: ResumeStateStore['userId'];
  title: ResumeStateStore['title'];
  personalInfo: ResumeStateStore['personalInfo'];
  education: ResumeStateStore['education'];
  experience: ResumeStateStore['experience'];
  skills: ResumeStateStore['skills'];
  projects: ResumeStateStore['projects'];
  atsScore: ResumeStateStore['atsScore'];
  
  // Actions
  loadResume: ResumeStateStore['loadResume'];
  resetResume: ResumeStateStore['resetResume'];
  setTitle: ResumeStateStore['setTitle'];
  setAtsScore: ResumeStateStore['setAtsScore'];
  updatePersonalInfo: ResumeStateStore['updatePersonalInfo']; // Added

  // Education Actions - ADDED
  addEducation: ResumeStateStore['addEducation'];
  updateEducation: ResumeStateStore['updateEducation'];
  removeEducation: ResumeStateStore['removeEducation'];

  // Experience Actions - ADDED
  addExperience: ResumeStateStore['addExperience'];
  updateExperience: ResumeStateStore['updateExperience'];
  removeExperience: ResumeStateStore['removeExperience'];

  // Skills Actions - ADDED
  addSkill: ResumeStateStore['addSkill'];
  updateSkill: ResumeStateStore['updateSkill'];
  removeSkill: ResumeStateStore['removeSkill'];

  // Projects Actions - ADDED
  addProject: ResumeStateStore['addProject'];
  updateProject: ResumeStateStore['updateProject'];
  removeProject: ResumeStateStore['removeProject'];
}

export function useShallowResumeSelector(): ShallowSelectedResumeParts {
  const selector = (state: ResumeStateStore): ShallowSelectedResumeParts => ({
    id: state.id,
    userId: state.userId,
    title: state.title,
    personalInfo: state.personalInfo,
    education: state.education,
    experience: state.experience,
    skills: state.skills,
    projects: state.projects,
    atsScore: state.atsScore,
    loadResume: state.loadResume,
    resetResume: state.resetResume,
    setTitle: state.setTitle,
    setAtsScore: state.setAtsScore,
    updatePersonalInfo: state.updatePersonalInfo, // Added

    // Education Actions - ADDED
    addEducation: state.addEducation,
    updateEducation: state.updateEducation,
    removeEducation: state.removeEducation,

    // Experience Actions - ADDED
    addExperience: state.addExperience,
    updateExperience: state.updateExperience,
    removeExperience: state.removeExperience,

    // Skills Actions - ADDED
    addSkill: state.addSkill,
    updateSkill: state.updateSkill,
    removeSkill: state.removeSkill,

    // Projects Actions - ADDED
    addProject: state.addProject,
    updateProject: state.updateProject,
    removeProject: state.removeProject,
  });

  const storeApi = useResumeStore; 

  return useSyncExternalStoreWithSelector(
    storeApi.subscribe,
    storeApi.getState,
    storeApi.getState, 
    selector,
    shallow
  );
}