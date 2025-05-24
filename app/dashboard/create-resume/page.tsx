/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/create-resume/page.tsx
'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText, ArrowLeft, ArrowRight, Save, Sun, Moon } from 'lucide-react';
import ResumeForm from '@/components/resume/resume-form';
import AtsScoreDisplay from '@/components/resume/ats-score-display';
import ResumePreview from '@/components/resume/resume-preview';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/hooks/use-resume'; // Keep for getState() if absolutely needed outside selectors
import { useShallowResumeSelector, ShallowSelectedResumeParts } from '@/hooks/useShallowResumeSelector';
import { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, SkillEntry, PersonalInfo } from '@/types/resume';
import { useTheme } from '@/context/theme-provider';

const resumeSections = ['Personal Info', 'Education', 'Experience', 'Skills', 'Projects', 'Review'];
const totalSteps = resumeSections.length;

type ResumeApiPayload = Omit<ResumeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

function CreateResumePageContent() {
  const { userId: clerkUserIdFromAuth, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdFromParams = searchParams.get('resumeId');

  const [currentStep, setCurrentStep] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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

  
  const {
    id: currentResumeIdInStore,
    userId: userIdInStore,
    title,
    personalInfo,
    // Destructure the arrays too, as they are part of the payload
    education,
    experience,
    skills,
    projects,
    atsScore,
    loadResume,
    resetResume,
    setTitle: setResumeTitle,
  } = useShallowResumeSelector();

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Using useCallback for functions passed to useEffect if they are redefined on each render
  // However, loadResume and resetResume from Zustand store are typically stable.
  // For explicitness or if they were derived:
  const stableLoadResume = useCallback(loadResume, [loadResume]);
  const stableResetResume = useCallback(resetResume, [resetResume]);


  useEffect(() => {
    if (isAuthLoaded) {
      if (!clerkUserIdFromAuth) {
        router.push('/sign-in');
        return;
      }
      setIsLoadingPage(true);
      if (resumeIdFromParams) {
        if (currentResumeIdInStore === resumeIdFromParams && userIdInStore === clerkUserIdFromAuth) {
          setIsLoadingPage(false);
          return;
        }
        fetch(`/api/resumes/${resumeIdFromParams}`)
          .then(res => {
            if (!res.ok) {
              if (res.status === 404) throw new Error('Resume not found or you do not have permission to edit it.');
              throw new Error(`Failed to fetch resume (status: ${res.status})`);
            }
            return res.json();
          })
          .then((data: ResumeData & { id: string }) => {
            if (data.userId !== clerkUserIdFromAuth) {
                throw new Error('Access denied: This resume does not belong to you.');
            }
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
        if (!currentResumeIdInStore || userIdInStore !== clerkUserIdFromAuth) {
          stableResetResume(clerkUserIdFromAuth);
        } else {
           if (userIdInStore !== clerkUserIdFromAuth) {
             useResumeStore.setState({ userId: clerkUserIdFromAuth });
           }
        }
        setIsLoadingPage(false);
      }
    }
  }, [isAuthLoaded, clerkUserIdFromAuth, resumeIdFromParams, router, stableLoadResume, stableResetResume, currentResumeIdInStore, userIdInStore]);
  
  useEffect(() => {
    if (personalInfo?.firstName && title === 'Untitled Resume' && !resumeIdFromParams && !currentResumeIdInStore) {
        setResumeTitle(`${personalInfo.firstName}'s Resume`);
    }
  }, [personalInfo?.firstName, title, setResumeTitle, resumeIdFromParams, currentResumeIdInStore]);

   const handleSaveResume = async () => { 
    if (!clerkUserIdFromAuth) {
      alert("User not authenticated."); return;
    }
    setIsSaving(true);
    
    // Get the freshest state for the payload directly from the store
    // This ensures all fields selected by useShallowResumeSelector are up-to-date for the payload
    const currentState = useResumeStore.getState(); 

    const payload: ResumeApiPayload = {
      title: currentState.title,
      personalInfo: currentState.personalInfo,
      // Keep the full objects, including their client-side IDs.
      // The backend (Prisma create/createMany) will handle ID generation for new sub-records.
      education: currentState.education,
      experience: currentState.experience,
      skills: currentState.skills,
      projects: currentState.projects,
      atsScore: currentState.atsScore,
    };

    try {
      const method = currentState.id ? 'PUT' : 'POST'; // Use currentState.id from store
      const url = currentState.id ? `/api/resumes/${currentState.id}` : '/api/resumes';
      const response = await fetch(url, {
        method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
        throw new Error(errorData.message || `Failed to save resume: ${response.statusText}`);
      }
      const savedResume = await response.json() as ResumeData & { id: string };
      loadResume(savedResume); 
      alert('Resume saved successfully!');
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
    if (currentStep < totalSteps - 1) { setCurrentStep(currentStep + 1); } 
    else if (currentStep === totalSteps - 1) { handleSaveResume(); }
  };
  const handleBack = () => { 
    if (currentStep > 0) { setCurrentStep(currentStep - 1); }
  };
  
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  if (!isAuthLoaded || isLoadingPage) {
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
            {/* Back Button and Title Section */}
            <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className={`${themeClasses.text} ${themeClasses.buttonGhost}`}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-lg font-semibold ${themeClasses.text} hidden sm:inline truncate max-w-[200px] md:max-w-xs`} title={title}>
                        {title || "Loading title..."}
                    </span>
                </div>
            </div>

            {/* Progress Bar Section */}
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

            {/* Action Buttons Section */}
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

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Form Sections */}
        <div className={`lg:col-span-2 ${themeClasses.cardBg} rounded-xl p-6 sm:p-8 shadow-xl`}>
          <ResumeForm currentStep={currentStep} />
          {/* Navigation Buttons */}
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

        {/* Right Side: ATS Score & Preview */}
        <div className="lg:col-span-1 space-y-8 sticky top-24">
          <AtsScoreDisplay />
          <ResumePreview />
        </div>
      </main>
    </div>
  );
}

// Default export wrapping content in Suspense
export default function CreateResumePage() {
    // The useTheme() hook cannot be called here directly as this is the top-level Server Component for the route.
    // The Suspense fallback styling should ideally be simple and not rely on hooks.
    // For a themed fallback, you might need a client component wrapper around Suspense itself
    // or use CSS that respects the 'dark' class on <html>.
    // A simple, un-themed loader is safer here for the outermost Suspense.
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"> {/* Basic fallback style */}
                <Loader2 className="w-12 h-12 text-gray-700 dark:text-gray-300 animate-spin" />
            </div>
        }>
            <CreateResumePageContent />
        </Suspense>
    );
}