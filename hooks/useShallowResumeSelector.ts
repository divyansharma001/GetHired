// hooks/useShallowResumeSelector.ts
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import { shallow } from 'zustand/shallow';
import { useResumeStore, ResumeStateStore } from './use-resume';

// Define the shape of the data selected by this general-purpose hook
export interface ShallowSelectedResumeParts {
  id?: ResumeStateStore['id']; // Resume's own DB ID
  userId: ResumeStateStore['userId']; // Clerk User ID associated with the resume in store
  title: ResumeStateStore['title'];
  personalInfo: ResumeStateStore['personalInfo'];
  education: ResumeStateStore['education'];
  experience: ResumeStateStore['experience'];
  skills: ResumeStateStore['skills'];
  projects: ResumeStateStore['projects'];
  atsScore: ResumeStateStore['atsScore']; // For AtsScoreDisplay
  
  // Actions that might be needed by various components
  loadResume: ResumeStateStore['loadResume'];
  resetResume: ResumeStateStore['resetResume'];
  setTitle: ResumeStateStore['setTitle'];
  setAtsScore: ResumeStateStore['setAtsScore']; // For AtsScoreDisplay
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
  });

  const storeApi = useResumeStore; 

  return useSyncExternalStoreWithSelector(
    storeApi.subscribe,
    storeApi.getState,
    storeApi.getState, // Fallback for getServerState
    selector,
    shallow
  );
}