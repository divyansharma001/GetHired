/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/create-resume/page.tsx
'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, FileText, ArrowLeft, ArrowRight, Save, Sun, Moon, Sparkles } from 'lucide-react';
import ResumeForm from '@/components/resume/resume-form';
import AtsScoreDisplay from '@/components/resume/ats-score-display';
import ResumePreview from '@/components/resume/resume-preview';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/hooks/use-resume'; // Keep for getState() if absolutely needed outside selectors
import { useShallowResumeSelector, ShallowSelectedResumeParts } from '@/hooks/useShallowResumeSelector';
import { ResumeData, EducationEntry, ExperienceEntry, ProjectEntry, SkillEntry, PersonalInfo } from '@/types/resume';
import { useTheme } from '@/context/theme-provider';
import { Download } from 'lucide-react'; // Add Download icon
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SimpleTemplate from '@/components/resume/templates/simple-template';
import { Mail, Copy, Download as DownloadIcon } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const resumeSections = ['Personal Info', 'Education', 'Experience', 'Skills', 'Projects', 'Review'];
const totalSteps = resumeSections.length;

type ResumeApiPayload = Omit<ResumeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

function CreateResumePageContent() {
  const { userId: clerkUserIdFromAuth, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdFromParams = searchParams.get('resumeId');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetCompanyName, setTargetCompanyName] = useState('');
  const [specificPointsForCoverLetter, setSpecificPointsForCoverLetter] = useState('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  const allResumeDataForCoverLetter = useShallowResumeSelector();



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

  const [showPdfPreviewForCapture, setShowPdfPreviewForCapture] = useState(false);

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



  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setShowPdfPreviewForCapture(true);

    // Declare resumeContentElement here so it's accessible in finally if needed, though not strictly necessary for this logic
    let resumeContentElement: HTMLElement | null = null;

    try {
      // Give React a moment to render the hidden template
      await new Promise(resolve => setTimeout(resolve, 200)); // Increased slightly for good measure

      resumeContentElement = document.getElementById('resume-content-for-pdf');

      if (!resumeContentElement) {
        // This alert will now correctly indicate the element wasn't found AFTER the attempt to get it.
        alert("Error: Resume content for PDF rendering could not be found in the DOM. Please try again.");
        // No need to set visibility if element is null
        setIsGeneratingPdf(false);
        setShowPdfPreviewForCapture(false);
        return;
      }

      // Optional: Briefly make it visible for html2canvas if issues persist, then hide again
      // resumeContentElement.style.visibility = 'visible'; 
      // await new Promise(resolve => setTimeout(resolve, 50)); // Very short delay

      const canvas = await html2canvas(resumeContentElement, {
        scale: 2,
        useCORS: true,
        logging: false, // Set to true for html2canvas debugging if needed
        // Ensure html2canvas captures based on the element's actual rendered size
        // width: resumeContentElement.offsetWidth, // or scrollWidth
        // height: resumeContentElement.offsetHeight, // or scrollHeight
      });

      // resumeContentElement.style.visibility = 'hidden'; // Hide again if made visible

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeightInPdfUnits = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeightInPdfUnits;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdfUnits);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdfUnits);
        heightLeft -= pdfPageHeight;
      }

      const resumeTitleForFile = useResumeStore.getState().title.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
      pdf.save(`${resumeTitleForFile || 'resume'}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      // If resumeContentElement was found and made visible, hide it on error
      // if (resumeContentElement) resumeContentElement.style.visibility = 'hidden'; 
    } finally {
      setIsGeneratingPdf(false);
      setShowPdfPreviewForCapture(false); // Always hide the capture div
    }
  };


  const handleGenerateCoverLetter = async () => {
    if (!targetJobTitle || !targetCompanyName) {
      alert("Please enter the Target Job Title and Company Name.");
      return;
    }
    setIsGeneratingCoverLetter(true);
    setGeneratedCoverLetter(''); // Clear previous

    // Construct payload using all relevant parts from the store
    const payload = {
      resumeData: { // Send only necessary parts of the resume
        personalInfo: allResumeDataForCoverLetter.personalInfo,
        experience: allResumeDataForCoverLetter.experience,
        skills: allResumeDataForCoverLetter.skills,
        // education: allResumeDataForCoverLetter.education, // Optional
        // projects: allResumeDataForCoverLetter.projects, // Optional
      },
      jobTitle: targetJobTitle,
      companyName: targetCompanyName,
      specificPoints: specificPointsForCoverLetter,
      // tone: 'semi-formal' // Or make this a user selection
    };

    try {
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error" }));
        throw new Error(errorData.message || `Failed to generate cover letter: ${response.statusText}`);
      }
      const data = await response.json();
      setGeneratedCoverLetter(data.coverLetterText);
    } catch (error) {
      console.error("Cover letter generation error:", error);
      alert(`Error generating cover letter: ${error instanceof Error ? error.message : String(error)}`);
      setGeneratedCoverLetter("Failed to generate cover letter. Please try again.");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(generatedCoverLetter)
      .then(() => alert("Cover letter copied to clipboard!"))
      .catch(err => alert("Failed to copy. Please copy manually."));
  };

  const handleDownloadCoverLetterTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedCoverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const safeCompanyName = targetCompanyName.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase() || "company";
    const safeJobTitle = targetJobTitle.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase() || "job";
    element.download = `cover_letter_${safeCompanyName}_${safeJobTitle}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };





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
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || isSaving} // Disable if saving or generating PDF
                className={`${themeClasses.buttonOutline} flex items-center`}
              >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCoverLetterModal(true)}
                disabled={isSaving || isGeneratingPdf || !currentResumeIdInStore} // Disable if no resume saved yet
                className={`${themeClasses.buttonOutline} flex items-center`}
                title="Generate Cover Letter"
              >
                <Mail className="w-4 h-4 mr-2" />
                Cover Letter
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

        {/* Hidden PDF Template for Download */}
        {showPdfPreviewForCapture && ( // This state variable controls if SimpleTemplate is rendered
          <div style={{
            position: 'absolute',
            left: '-9999px', // Way off-screen
            top: 'auto',
            width: '210mm',     // A4 width for layout consistency before capture
            backgroundColor: '#fff', // Ensures canvas doesn't have transparent background
          }}>
            {/* This renders the div with id="resume-content-for-pdf" */}
            <SimpleTemplate resumeData={useResumeStore.getState()} />
          </div>
        )}

        {/* Cover Letter Modal */}
        {showCoverLetterModal && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
        <div className={`${themeClasses.cardBg} rounded-xl p-6 sm:p-8 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${themeClasses.text}`}>Generate Cover Letter</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCoverLetterModal(false)} className={themeClasses.textMuted}>X</Button>
            </div>

            <div className="space-y-4 mb-6 overflow-y-auto pr-2 styled-scrollbar flex-shrink min-h-[150px]">
                 <div>
                    <Label htmlFor="targetJobTitle" className={themeClasses.textMuted}>Target Job Title*</Label>
                    <Input id="targetJobTitle" value={targetJobTitle} onChange={(e) => setTargetJobTitle(e.target.value)} placeholder="e.g., Senior Software Engineer" className="bg-slate-700/50 text-white placeholder-slate-400"/>
                </div>
                <div>
                    <Label htmlFor="targetCompanyName" className={themeClasses.textMuted}>Target Company Name*</Label>
                    <Input id="targetCompanyName" value={targetCompanyName} onChange={(e) => setTargetCompanyName(e.target.value)} placeholder="e.g., Google" className="bg-slate-700/50 text-white placeholder-slate-400"/>
                </div>
                <div>
                    <Label htmlFor="specificPointsForCoverLetter" className={themeClasses.textMuted}>Key Points to Emphasize (Optional)</Label>
                    <Textarea id="specificPointsForCoverLetter" value={specificPointsForCoverLetter} onChange={(e) => setSpecificPointsForCoverLetter(e.target.value)} placeholder="e.g., My experience with project X, my passion for Y" rows={3} className="bg-slate-700/50 text-white placeholder-slate-400"/>
                </div>
            </div>

            <Button
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCoverLetter || !targetJobTitle || !targetCompanyName}
                className={`${themeClasses.accentGradient} text-white w-full mb-4 py-2.5`}
            >
                {isGeneratingCoverLetter ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                Generate with AI
            </Button>

            {generatedCoverLetter && (
                <div className="mt-4 border-t pt-4 border-slate-700 flex-grow flex flex-col overflow-hidden">
                    <h4 className={`text-md font-semibold mb-2 ${themeClasses.text}`}>Generated Cover Letter:</h4>
                    <Textarea
                        value={generatedCoverLetter}
                        readOnly
                        rows={10}
                        className="text-xs leading-relaxed whitespace-pre-wrap w-full flex-grow bg-slate-700/30 border-slate-600 text-gray-200 styled-scrollbar"
                    />
                    <div className="mt-3 flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleCopyCoverLetter} className={themeClasses.buttonOutline}>
                            <Copy size={14} className="mr-1.5"/> Copy Text
                        </Button>
                         <Button variant="outline" size="sm" onClick={handleDownloadCoverLetterTxt} className={themeClasses.buttonOutline}>
                            <DownloadIcon size={14} className="mr-1.5"/> Download .txt
                        </Button>
                      </div>
                  </div>
              )}
          </div>
      </div>
  )}
  
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