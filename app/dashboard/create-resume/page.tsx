// app/dashboard/create-resume/page.tsx
'use client'; // This will be an interactive page

import React, { useEffect, useState } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Loader2, Sparkles, FileText, Eye, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import ResumeForm from '@/components/resume/resume-form';
import AtsScoreDisplay from '@/components/resume/ats-score-display';
import ResumePreview from '@/components/resume/resume-preview';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useResumeStore } from '@/hooks/use-resume'; // Import the store

const resumeSections = ['Personal Info', 'Education', 'Experience', 'Skills', 'Projects', 'Review'];
const totalSteps = resumeSections.length;

export default function CreateResumePage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Access store methods and state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { resetResume, atsScore, title, setTitle: setResumeTitle, personalInfo } = useResumeStore();


  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
    if (isLoaded && userId) {
      resetResume(userId); // Initialize or reset resume data for this user
    }
  }, [isLoaded, userId, router, resetResume]);
  
  useEffect(() => {
    // Update resume title dynamically if first name is available
    if (personalInfo.firstName && title === 'Untitled Resume') {
        setResumeTitle(`${personalInfo.firstName}'s Resume`);
    }
  }, [personalInfo.firstName, title, setResumeTitle]);


  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSaveResume = () => {
    // TODO: Implement save logic (API call to backend)
    console.log("Saving resume:", useResumeStore.getState());
    alert("Resume save functionality to be implemented!");
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="text-white hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white hidden sm:inline">{title}</span>
              </div>
            </div>
            <div className="flex-grow px-4 sm:px-8 lg:px-16">
                <div className="max-w-xl mx-auto">
                    <div className="mb-1">
                        <Progress value={progressPercentage} className="h-1.5" />
                    </div>
                    <p className="text-xs text-center text-gray-300">
                        Step {currentStep + 1} of {totalSteps}: {resumeSections[currentStep]}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10" onClick={handleSaveResume}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Draft
              </Button>
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Form Sections */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl">
          <ResumeForm currentStep={currentStep} />
          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-white border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{currentStep + 1}</span>
              <span>/</span>
              <span>{totalSteps}</span>
            </div>
            <Button
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {currentStep === totalSteps - 2 ? 'Review & Finish' : 'Next Step'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Side: ATS Score & Preview */}
        <div className="lg:col-span-1 space-y-8 sticky top-24"> {/* Sticky for scroll */}
          <AtsScoreDisplay />
          <ResumePreview />
        </div>
      </main>
    </div>
  );
}