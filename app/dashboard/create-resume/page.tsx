/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/create-resume/page.tsx
'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText, ArrowLeft, ArrowRight, Save, Sun, Moon } from 'lucide-react'; // Removed unused Sparkles, Eye
import ResumeForm from '@/components/resume/resume-form';
import AtsScoreDisplay from '@/components/resume/ats-score-display';
import ResumePreview from '@/components/resume/resume-preview';
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress'; // Progress is now directly in JSX
import { useResumeStore, ResumeStateStore } from '@/hooks/use-resume'; // Import ResumeStateStore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ResumeData, PersonalInfo, EducationEntry, ExperienceEntry, ProjectEntry, SkillEntry } from '@/types/resume'; // Import specific types
import { useTheme } from '@/context/theme-provider';

const resumeSections = ['Personal Info', 'Education', 'Experience', 'Skills', 'Projects', 'Review'];
const totalSteps = resumeSections.length;

// Define the shape of the payload for POST/PUT, excluding DB-managed fields
type ResumeApiPayload = Omit<ResumeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;


function CreateResumePageContent() {
  const { userId: clerkUserIdFromAuth, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdFromParams = searchParams.get('resumeId');

  const [currentStep, setCurrentStep] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Theme classes (ensure these are comprehensive for all elements used)
  const themeClasses = {
    textMuted: isDark ? 'text-gray-300' : 'text-gray-600',
    buttonGhost: isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50',
    buttonOutline: isDark ? 'text-white border-white/20 hover:bg-white/10' : 'text-gray-700 border-gray-300 hover:bg-gray-100',
    accentGradient: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
    pageBg: isDark ? 'bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100',
    cardBg: isDark ? 'bg-gray-800/60 backdrop-blur-md border border-gray-700' : 'bg-white/80 backdrop-blur-md border border-gray-200',
    headerBg: isDark ? 'bg-gray-800/80 backdrop-blur-md border-b border-gray-700' : 'bg-white/80 backdrop-blur-md border-b border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    progressBarBg: isDark ? 'bg-gray-700' : 'bg-gray-200',
  };

  // Destructure all necessary functions and state from the store
  const {
    id: currentResumeIdInStore,
    title,
    personalInfo,
    education,
    experience,
    skills,
    projects,
    atsScore,
    loadResume,
    resetResume,
    setTitle: setResumeTitle,
    // No need for setId here, loadResume handles it.
  } = useResumeStore(
    (state: ResumeStateStore) => ({
      id: state.id,
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
    }),
    // Using shallow from zustand/shallow is recommended here if selecting multiple fields as an object
    // but since we are destructuring, individual field changes will trigger re-renders anyway.
    // For simplicity, if no issues, can omit shallow. If performance issues/warnings, add it.
  );

  const [isLoadingPage, setIsLoadingPage] = useState(true); // Combined loading state
  const [isSaving, setIsSaving] = useState(false);

  const stableLoadResume = useCallback(loadResume, [loadResume]);
  const stableResetResume = useCallback(resetResume, [resetResume]);

  useEffect(() => {
    if (isAuthLoaded) {
      if (!clerkUserIdFromAuth) {
        router.push('/sign-in');
        return;
      }

      setIsLoadingPage(true); // Start loading before fetch/reset
      if (resumeIdFromParams) {
        // Edit mode: Fetch resume data
        fetch(`/api/resumes/${resumeIdFromParams}`)
          .then(res => {
            if (!res.ok) {
              if (res.status === 404) throw new Error('Resume not found or access denied.');
              throw new Error(`Failed to fetch resume: ${res.status}`);
            }
            return res.json();
          })
          .then((data: ResumeData & { id: string }) => {
            stableLoadResume(data);
          })
          .catch(err => {
            console.error("Error fetching resume for edit:", err);
            alert((err as Error).message || "Failed to load resume. Starting a new one.");
            stableResetResume(clerkUserIdFromAuth);
            router.replace('/dashboard/create-resume', { scroll: false });
          })
          .finally(() => setIsLoadingPage(false));
      } else {
        // Create mode or if URL was cleared after error
        // Only reset if no resume is currently loaded in the store or if it's a different user's context
        if (!currentResumeIdInStore || useResumeStore.getState().userId !== clerkUserIdFromAuth) {
          stableResetResume(clerkUserIdFromAuth);
        } else {
          // Resume data already in store, ensure userId is correct (e.g., after browser back)
           useResumeStore.setState({ userId: clerkUserIdFromAuth });
        }
        setIsLoadingPage(false);
      }
    }
  }, [isAuthLoaded, clerkUserIdFromAuth, resumeIdFromParams, router, stableLoadResume, stableResetResume, currentResumeIdInStore]);
  
  useEffect(() => {
    // Set default title for new resumes only
    if (personalInfo?.firstName && title === 'Untitled Resume' && !resumeIdFromParams && !currentResumeIdInStore) {
        setResumeTitle(`${personalInfo.firstName}'s Resume`);
    }
  }, [personalInfo?.firstName, title, setResumeTitle, resumeIdFromParams, currentResumeIdInStore]);


  const handleSaveResume = async () => {
    if (!clerkUserIdFromAuth) {
      alert("User not authenticated.");
      return;
    }
    setIsSaving(true);

    // Get current state directly to ensure freshest data for payload
    const currentState = useResumeStore.getState();
    
    const payload: ResumeApiPayload = {
      title: currentState.title,
      personalInfo: currentState.personalInfo,
      education: currentState.education.map(({ id, ...rest }) => rest) as EducationEntry[],
      experience: currentState.experience.map(({ id, ...rest }) => rest) as ExperienceEntry[],
      skills: currentState.skills.map(({ id, ...rest }) => rest) as SkillEntry[],
      projects: currentState.projects.map(({ id, ...rest }) => rest) as ProjectEntry[],
      atsScore: currentState.atsScore,
    };

    try {
      let response;
      const method = currentState.id ? 'PUT' : 'POST';
      const url = currentState.id ? `/api/resumes/${currentState.id}` : '/api/resumes';

      // eslint-disable-next-line prefer-const
      response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
        throw new Error(errorData.message || `Failed to save resume: ${response.statusText}`);
      }

      const savedResume = await response.json() as ResumeData & { id: string };
      
      // Update the store with the full saved resume data (includes new IDs, updatedAt etc.)
      stableLoadResume(savedResume); 

      alert('Resume saved successfully!'); // Replace with toast

      if (method === 'POST' && savedResume.id) {
         router.replace(`/dashboard/create-resume?resumeId=${savedResume.id}`, { scroll: false });
      }
    } catch (error) {
      console.error("Failed to save resume:", error);
      alert(`Error saving resume: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => { 
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) { // On Review step
        handleSaveResume(); 
    }
  };

  const handleBack = () => { 
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  if (!isAuthLoaded || isLoadingPage) { // Show loader if auth is loading OR resume data is loading
    return (
      <div className={`min-h-screen ${themeClasses.pageBg} flex items-center justify-center`}>
        <Loader2 className={`w-12 h-12 ${themeClasses.text} animate-spin`} />
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.pageBg} transition-colors duration-300`}>
      <header className={`${themeClasses.headerBg} sticky top-0 z-50 shadow-md`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className={`${themeClasses.text} ${themeClasses.buttonGhost}`}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-lg font-semibold ${themeClasses.text} hidden sm:inline truncate max-w-[200px] md:max-w-xs`} title={title}>{title}</span>
                </div>
            </div>
            <div className="flex-grow px-4 sm:px-8 lg:px-16">
                <div className="max-w-xl mx-auto">
                    <div className="mb-1">
                        <div className={`relative h-2 w-full overflow-hidden rounded-full ${themeClasses.progressBarBg}`}>
                            <div
                                className={`h-full w-full flex-1 ${themeClasses.accentGradient} transition-all`}
                                style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
                            />
                        </div>
                    </div>
                    <p className={`text-xs text-center ${themeClasses.textMuted}`}>
                        Step {currentStep + 1} of {totalSteps}: {resumeSections[currentStep]}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <button 
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg ${themeClasses.textMuted} ${themeClasses.buttonGhost} transition-colors`}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveResume} 
                disabled={isSaving}
                className={`${themeClasses.buttonOutline} flex items-center`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {currentResumeIdInStore ? 'Save Changes' : 'Save Draft'}
              </Button>
              <UserButton 
                appearance={{ 
                    elements: { 
                        avatarBox: "w-9 h-9 shadow-md",
                        userButtonPopoverCard: `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`,
                    } 
                }} 
              />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className={`lg:col-span-2 ${themeClasses.cardBg} rounded-xl p-6 sm:p-8 shadow-xl`}>
          <ResumeForm currentStep={currentStep} />
          <div className={`mt-8 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} flex justify-between items-center`}>
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`${themeClasses.buttonOutline}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className={`flex items-center space-x-1 text-sm ${themeClasses.textMuted}`}>
              <span>{currentStep + 1}</span>
              <span>/</span>
              <span>{totalSteps}</span>
            </div>
            <Button
              onClick={handleNext}
              className={`${themeClasses.accentGradient} text-white`}
            >
              {currentStep === totalSteps - 1 ? (currentResumeIdInStore ? 'Finalize & Save' : 'Save & Finish') : (currentStep === totalSteps - 2 ? 'Review & Finish' : 'Next Step')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-8 sticky top-24">
          <AtsScoreDisplay />
          <ResumePreview />
        </div>
      </main>
    </div>
  );
}

export default function CreateResumePage() {
    return (
        <Suspense fallback={<div className={`min-h-screen flex items-center justify-center ${useTheme().theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}><Loader2 className={`w-12 h-12 ${useTheme().theme === 'dark' ? 'text-white' : 'text-gray-900'} animate-spin`} /></div>}>
            <CreateResumePageContent />
        </Suspense>
    );
}