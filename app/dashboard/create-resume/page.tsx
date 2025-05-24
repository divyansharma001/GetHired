/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/create-resume/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, FileText, Eye, ArrowLeft, ArrowRight, Save, Sun, Moon } from 'lucide-react'; // Added Sun, Moon
import ResumeForm from '@/components/resume/resume-form';
import AtsScoreDisplay from '@/components/resume/ats-score-display';
import ResumePreview from '@/components/resume/resume-preview';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useResumeStore } from '@/hooks/use-resume';
import { ResumeData } from '@/types/resume'; // Ensure this is the full data type for the store
import { useTheme } from '@/context/theme-provider'; // Import useTheme

const resumeSections = ['Personal Info', 'Education', 'Experience', 'Skills', 'Projects', 'Review'];
const totalSteps = resumeSections.length;

export default function CreateResumePage() {
  const { userId: clerkUserIdFromAuth, isLoaded: isAuthLoaded } = useAuth(); // Renamed for clarity
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const { theme, toggleTheme } = useTheme(); // Get theme context
  const isDark = theme === 'dark';

  const themeClasses = { // Simplified theme classes for this page, more can be added
    textMuted: isDark ? 'text-gray-300' : 'text-gray-600',
    buttonGhost: isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50',
    buttonOutline: isDark ? 'text-white border-white/20 hover:bg-white/10' : 'text-gray-700 border-gray-300 hover:bg-gray-100',
    accentGradient: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
    pageBg: isDark ? 'bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100',
    cardBg: isDark ? 'bg-gray-800/60 backdrop-blur-md border border-gray-700' : 'bg-white/80 backdrop-blur-md border border-gray-200',
    headerBg: isDark ? 'bg-gray-800/80 backdrop-blur-md border-b border-gray-700' : 'bg-white/80 backdrop-blur-md border-b border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
  };

  // Access store methods and state
  const {
    resetResume,
    atsScore,
    title,
    setTitle: setResumeTitle,
    personalInfo,
    id: currentResumeIdInStore, // This is the resume's DB ID from the store
    setId: setResumeIdInStore,   // This is the store's setter: setId(id: string)
    // No need for ...fullResumeDataFromStore here, we get it via getState() in save handler
  } = useResumeStore();


  useEffect(() => {
    if (isAuthLoaded && !clerkUserIdFromAuth) {
      router.push('/sign-in');
    }
    if (isAuthLoaded && clerkUserIdFromAuth) {
      // Only reset if there's no resume ID in the store (i.e., it's a fresh create)
      // Or if a specific action dictates a reset (e.g., "Create New" from dashboard)
      // This logic might need adjustment if you load existing resumes into this page
      if (!currentResumeIdInStore) {
        resetResume(clerkUserIdFromAuth);
      } else {
        // If currentResumeIdInStore exists, it means we are editing.
        // The data should have been loaded into the store by the page that navigated here.
        // For now, we assume this page is only for "create new" or handles loading elsewhere.
        // Ensure the store's userId is also set correctly if loading an existing resume.
        useResumeStore.setState({ userId: clerkUserIdFromAuth });
      }
    }
  }, [isAuthLoaded, clerkUserIdFromAuth, router, resetResume, currentResumeIdInStore]);
  
  useEffect(() => {
    if (personalInfo.firstName && title === 'Untitled Resume') {
        setResumeTitle(`${personalInfo.firstName}'s Resume`);
    }
  }, [personalInfo.firstName, title, setResumeTitle]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveResume = async () => {
    if (!clerkUserIdFromAuth) {
      alert("User not authenticated.");
      return;
    }
    setIsSaving(true);

    const state = useResumeStore.getState();
    const payload: Omit<ResumeData, 'id' | 'userId'> & { title: string } = {
      title: state.title,
      personalInfo: state.personalInfo,
      education: state.education.map(({ id, ...rest }) => rest) as any,
      experience: state.experience.map(({ id, ...rest }) => rest) as any,
      skills: state.skills.map(({ id, ...rest }) => rest) as any,
      projects: state.projects.map(({ id, ...rest }) => rest) as any,
      atsScore: state.atsScore,
    };

    try {
      let response;
      let method: 'POST' | 'PUT' = 'POST';
      let url = '/api/resumes';

      if (currentResumeIdInStore) {
        method = 'PUT';
        url = `/api/resumes/${currentResumeIdInStore}`;
        // alert("Update functionality (PUT request) to be implemented. This will make a PUT request now.");
      }

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

      const savedResume: ResumeData = await response.json();
      
      if (savedResume.id) {
        setResumeIdInStore(savedResume.id); // Update store with DB ID (for new or if it changed)
      }

      alert('Resume saved successfully!'); // Replace with a toast notification
      // Potentially redirect if it's a new save:
      // if (method === 'POST' && savedResume.id) {
      //   router.push(`/dashboard/resume/${savedResume.id}`); // Or just stay on page
      // }

    } catch (error) {
      console.error("Failed to save resume:", error);
      alert(`Error saving resume: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };


  if (!isAuthLoaded || !clerkUserIdFromAuth) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBg} flex items-center justify-center`}>
        <Loader2 className={`w-12 h-12 ${themeClasses.text} animate-spin`} />
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
        // If on the last step (Review), "Next" button could become "Finalize & Save" or similar
        handleSaveResume(); // Example: auto-save on trying to finish
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.pageBg} transition-colors duration-300`}>
      {/* Header */}
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
                <span className={`text-lg font-semibold ${themeClasses.text} hidden sm:inline`}>{title}</span>
              </div>
            </div>
            
            <div className="flex-grow px-4 sm:px-8 lg:px-16">
                <div className="max-w-xl mx-auto">
                    <div className="mb-1">
                        {/* Progress bar with gradient from theme */}
                        <div className={`relative h-2 w-full overflow-hidden rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
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
            //   disabled={currentStep === totalSteps - 1 && !currentResumeIdInStore} // Example: disable finalize if not saved
              className={`${themeClasses.accentGradient} text-white`}
            >
              {currentStep === totalSteps - 1 ? (currentResumeIdInStore ? 'Finalize & Save' : 'Save & Finish') : (currentStep === totalSteps - 2 ? 'Review & Finish' : 'Next Step')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Side: ATS Score & Preview */}
        <div className="lg:col-span-1 space-y-8 sticky top-24">
          <AtsScoreDisplay /> {/* atsScore is now read from store inside AtsScoreDisplay */}
          <ResumePreview />
        </div>
      </main>
    </div>
  );
}