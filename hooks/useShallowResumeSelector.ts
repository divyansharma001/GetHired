// hooks/useShallowResumeSelector.ts
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import { shallow } from 'zustand/shallow';
import { useResumeStore, ResumeStateStore } from './use-resume';

// Define the shape of the data you want to select
interface SelectedResumeParts {
  title: ResumeStateStore['title']; // Added title
  personalInfo: ResumeStateStore['personalInfo'];
  education: ResumeStateStore['education'];
  experience: ResumeStateStore['experience'];
  skills: ResumeStateStore['skills'];
  projects: ResumeStateStore['projects'];
  setAtsScore: ResumeStateStore['setAtsScore']; // Kept from previous version, ResumePreview doesn't need it
                                                // but AtsScoreDisplay does.
}

// A more generic selector hook for common resume parts needed by UI components
export function useShallowResumeSelector(): SelectedResumeParts {
  const selector = (state: ResumeStateStore): SelectedResumeParts => ({
    title: state.title,
    personalInfo: state.personalInfo,
    education: state.education,
    experience: state.experience,
    skills: state.skills,
    projects: state.projects,
    setAtsScore: state.setAtsScore, // AtsScoreDisplay needs this. ResumePreview will just ignore it.
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