// app/dashboard/create-resume/page.tsx
'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    Loader2, FileText, ArrowLeft, ArrowRight, Save, Sun, Moon, 
    Download as DownloadIcon, Mail, Copy,
    MailCheck, 
    
} from 'lucide-react';
import ResumeForm from '@/components/resume/resume-form';
import AtsScoreDisplay from '@/components/resume/ats-score-display';
import ResumePreview from '@/components/resume/resume-preview';
import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/hooks/use-resume';
import { useShallowResumeSelector } from '@/hooks/useShallowResumeSelector';
import { ResumeData } from '@/types/resume';
import { useTheme } from '@/context/theme-provider';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SimpleTemplate from '@/components/resume/templates/simple-template';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'; // Import Card components
import { cn } from '@/lib/utils';

const resumeSections = ['Personal Info', 'Education', 'Experience', 'Skills', 'Projects', 'Review'];
const totalSteps = resumeSections.length;

// Define AppTheme directly for this component
function getAppTheme(isDark: boolean) {
  return {
    pageBg: isDark ? 'bg-neutral-950' : 'bg-slate-100', // Main app area bg
    headerBg: isDark ? 'bg-neutral-900/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md',
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textBody: isDark ? 'text-neutral-300' : 'text-neutral-700',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    textPlaceholder: isDark ? 'text-neutral-500' : 'text-neutral-400',
    borderPrimary: isDark ? 'border-neutral-700' : 'border-neutral-300',
    borderSecondary: isDark ? 'border-neutral-800' : 'border-neutral-200/70',
    // Card theming will come from the Card component itself
    // Button theming will come from the Button component variants
    iconColor: isDark ? 'text-neutral-400' : 'text-neutral-500',
    buttonGhostText: isDark ? 'text-neutral-400 hover:text-neutral-100' : 'text-neutral-500 hover:text-neutral-900',
    // Progress bar specific
    progressBarBg: isDark ? 'bg-neutral-700' : 'bg-slate-200',
    // Form container specific
    formContainerBg: isDark ? 'bg-neutral-800/60 backdrop-blur-md' : 'bg-white/70 backdrop-blur-md',
    formContainerBorder: isDark ? 'border-neutral-700/70' : 'border-neutral-200/80',
  };
}


function CreateResumePageContent() {
  const { userId: clerkUserIdFromAuth, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdFromParams = searchParams.get('resumeId');
  
  const [currentStep, setCurrentStep] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark); // Get themed classes

  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetCompanyName, setTargetCompanyName] = useState('');
  const [specificPointsForCoverLetter, setSpecificPointsForCoverLetter] = useState('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPdfPreviewForCapture, setShowPdfPreviewForCapture] = useState(false);


  const {
    id: currentResumeIdInStore,
    userId: userIdInStore,
    title,
    personalInfo,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    education, experience, skills, projects, // ensure these are selected if needed for payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    atsScore,
    loadResume,
    resetResume,
    setTitle: setResumeTitle,
  } = useShallowResumeSelector();
  
  const allResumeDataForPayload = useResumeStore.getState; // To get full current state for save/API

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const stableLoadResume = useCallback(loadResume, []); // loadResume from store is stable
  const stableResetResume = useCallback(resetResume, []); // resetResume from store is stable

  useEffect(() => { /* ... (useEffect logic for loading/resetting resume - unchanged) ... */ 
    if (isAuthLoaded) {
      if (!clerkUserIdFromAuth) {
        router.push('/sign-in');
        return;
      }
      setIsLoadingPage(true);
      if (resumeIdFromParams) {
        // If current store matches, no need to fetch, unless userId mismatch (security)
        if (currentResumeIdInStore === resumeIdFromParams && userIdInStore === clerkUserIdFromAuth) {
          setIsLoadingPage(false);
          return;
        }
        // Fetch specific resume
        fetch(`/api/resumes/${resumeIdFromParams}`)
          .then(res => {
            if (!res.ok) {
              if (res.status === 404) throw new Error('Resume not found or you do not have permission to edit it.');
              throw new Error(`Failed to fetch resume (status: ${res.status})`);
            }
            return res.json();
          })
          .then((data: ResumeData & { id: string }) => {
            if (data.userId !== clerkUserIdFromAuth) { // Security check
              throw new Error('Access denied: This resume does not belong to you.');
            }
            stableLoadResume(data);
          })
          .catch(err => {
            console.error("Error fetching resume for edit:", err);
            alert((err as Error).message || "Failed to load resume. Starting a new one.");
            stableResetResume(clerkUserIdFromAuth); // Reset with current user ID
            router.replace('/dashboard/create-resume', { scroll: false }); // Go to clean create page
          })
          .finally(() => setIsLoadingPage(false));
      } else { // No resumeId in params, creating new or continuing unsaved
        if (!currentResumeIdInStore || userIdInStore !== clerkUserIdFromAuth) { // If store is empty, has different user's data, or new session
          stableResetResume(clerkUserIdFromAuth); // Reset with current user ID
        } else {
          // Store has data, possibly for current user, but ensure userId is correct if auth session changed
           if (userIdInStore !== clerkUserIdFromAuth) {
             useResumeStore.setState({ userId: clerkUserIdFromAuth });
           }
        }
        setIsLoadingPage(false);
      }
    }
  }, [isAuthLoaded, clerkUserIdFromAuth, resumeIdFromParams, router, stableLoadResume, stableResetResume, currentResumeIdInStore, userIdInStore]);


  useEffect(() => { // Auto-set title for new resumes
    if (personalInfo?.firstName && title === 'Untitled Resume' && !resumeIdFromParams && !currentResumeIdInStore) {
      setResumeTitle(`${personalInfo.firstName}'s Resume`);
    }
  }, [personalInfo?.firstName, title, setResumeTitle, resumeIdFromParams, currentResumeIdInStore]);

  const handleSaveResume = async () => { /* ... (save logic - unchanged, but ensure it uses allResumeDataForPayload()) ... */ 
    if (!clerkUserIdFromAuth) {
      alert("User not authenticated."); return;
    }
    setIsSaving(true);
    const currentState = allResumeDataForPayload(); // Get fresh state from store

    const payload = { // Omit fields not needed for API or derived by backend
      title: currentState.title,
      personalInfo: currentState.personalInfo,
      education: currentState.education,
      experience: currentState.experience,
      skills: currentState.skills,
      projects: currentState.projects,
      atsScore: currentState.atsScore,
    };

    try {
      const method = currentState.id ? 'PUT' : 'POST';
      const url = currentState.id ? `/api/resumes/${currentState.id}` : '/api/resumes';
      const response = await fetch(url, {
        method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
        throw new Error(errorData.message || `Failed to save resume: ${response.statusText}`);
      }
      const savedResume = await response.json() as ResumeData & { id: string };
      loadResume(savedResume); // Update store with saved data, including new ID if created
      alert('Resume saved successfully!');
      if (method === 'POST' && savedResume.id) { // If new resume was created and saved
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
    else if (currentStep === totalSteps - 1) { handleSaveResume(); } // On "Review" step, next is save
  };
  const handleBack = () => {
    if (currentStep > 0) { setCurrentStep(currentStep - 1); }
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleDownloadPdf = async () => { /* ... (PDF download logic unchanged) ... */ 
    setIsGeneratingPdf(true);
    setShowPdfPreviewForCapture(true);
    let resumeContentElement: HTMLElement | null = null;
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); 
      resumeContentElement = document.getElementById('resume-content-for-pdf');
      if (!resumeContentElement) {
        alert("Error: Resume content for PDF rendering could not be found.");
        setIsGeneratingPdf(false);
        setShowPdfPreviewForCapture(false);
        return;
      }
      const canvas = await html2canvas(resumeContentElement, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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
      const resumeTitleForFile = allResumeDataForPayload().title.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
      pdf.save(`${resumeTitleForFile || 'resume'}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
      setShowPdfPreviewForCapture(false);
    }
  };

  const handleGenerateCoverLetter = async () => { /* ... (Cover letter generation logic - unchanged but uses allResumeDataForPayload()) ... */ 
     if (!targetJobTitle || !targetCompanyName) {
      alert("Please enter the Target Job Title and Company Name.");
      return;
    }
    setIsGeneratingCoverLetter(true);
    setGeneratedCoverLetter(''); 

    const currentResumeState = allResumeDataForPayload();
    const payload = {
      resumeData: { 
        personalInfo: currentResumeState.personalInfo,
        experience: currentResumeState.experience,
        skills: currentResumeState.skills,
      },
      jobTitle: targetJobTitle,
      companyName: targetCompanyName,
      specificPoints: specificPointsForCoverLetter,
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
  const handleCopyCoverLetter = () => { /* ... (unchanged) ... */ 
    navigator.clipboard.writeText(generatedCoverLetter)
      .then(() => alert("Cover letter copied to clipboard!"))
      .catch(() => alert("Failed to copy. Please copy manually."));
  };
  const handleDownloadCoverLetterTxt = () => { /* ... (unchanged) ... */ 
    const element = document.createElement("a");
    const file = new Blob([generatedCoverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const safeCompanyName = targetCompanyName.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase() || "company";
    const safeJobTitle = targetJobTitle.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase() || "job";
    element.download = `cover_letter_${safeCompanyName}_${safeJobTitle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isAuthLoaded || isLoadingPage) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", appTheme.pageBg)}>
        <Loader2 className={cn("w-10 h-10 sm:w-12 sm:h-12 animate-spin", appTheme.textHeading)} />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col", appTheme.pageBg, "transition-colors duration-300")}>
      <header className={cn("sticky top-0 z-30 border-b shadow-sm", appTheme.headerBg, appTheme.borderPrimary)}>
        <div className="max-w-full mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className={appTheme.buttonGhostText}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-gradient rounded-md sm:rounded-lg flex items-center justify-center shadow">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className={cn("text-base sm:text-lg font-semibold truncate max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm", appTheme.textHeading)} title={title}>
                  {title || "Loading title..."}
                </span>
              </div>
            </div>

            <div className="flex-grow px-2 sm:px-4 lg:px-8 hidden md:block">
              <div className="max-w-md lg:max-w-lg mx-auto">
                <div className={cn("relative h-2 w-full overflow-hidden rounded-full mb-1", appTheme.progressBarBg)}>
                  <div
                    className="h-full bg-primary-gradient transition-transform duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }} // Use width for progress bar
                  />
                </div>
                <p className={cn("text-xs text-center", appTheme.textMuted)}>
                  Step {currentStep + 1} of {totalSteps}: {resumeSections[currentStep]}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className={appTheme.buttonGhostText}>
                {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveResume} disabled={isSaving} className="hidden sm:inline-flex">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {currentResumeIdInStore ? 'Save' : 'Save Draft'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isGeneratingPdf || isSaving} className="hidden sm:inline-flex">
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DownloadIcon className="w-4 h-4 mr-2" />}
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCoverLetterModal(true)} disabled={isSaving || isGeneratingPdf || !currentResumeIdInStore} className="hidden lg:inline-flex">
                <Mail className="w-4 h-4 mr-2" /> Cover Letter
              </Button>
              <UserButton 
                appearance={{
                    elements: {
                        avatarBox: "w-8 h-8 sm:w-9 sm:h-9 shadow-md", 
                        userButtonPopoverCard: `bg-card border-border shadow-xl rounded-xl`
                    }
                }}
              />
            </div>
          </div>
           {/* Progress Bar for Mobile - visible only on md and below */}
           <div className="md:hidden mt-2.5">
                <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full", appTheme.progressBarBg)}>
                  <div
                    className="h-full bg-primary-gradient transition-transform duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className={cn("text-xs text-center mt-1", appTheme.textMuted)}>
                  {currentStep + 1}/{totalSteps}: {resumeSections[currentStep]}
                </p>
            </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-6 sm:py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        <div className={cn(
            "lg:col-span-2 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl border", 
            appTheme.formContainerBg, 
            appTheme.formContainerBorder
        )}>
          <ResumeForm currentStep={currentStep} /> {/* This will render SimpleTemplate when currentStep is Review */}
          {/* Navigation Buttons for the form */}
          {currentStep < totalSteps -1 && ( // Hide Next/Back buttons on the Review step if SimpleTemplate is full page
             <div className={cn("mt-8 pt-6 border-t flex justify-between items-center", appTheme.borderSecondary)}>
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className={cn("flex items-center space-x-1 text-sm", appTheme.textMuted)}>
                <span>{currentStep + 1}</span><span>/</span><span>{totalSteps}</span>
                </div>
                <Button onClick={handleNext} disabled={isSaving}>
                {currentStep === totalSteps - 2 ? 'Review & Finish' : 'Next Step'} {/* Adjusted text for last step before review */}
                <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
          )}
           {currentStep === totalSteps - 1 && ( // Special action for "Review" step's button (which is now in header)
             <div className={cn("mt-8 pt-6 border-t text-center", appTheme.borderSecondary)}>
                <p className={cn("text-sm", appTheme.textMuted)}>
                    You are viewing the final resume preview. Use the header buttons to save or download.
                </p>
             </div>
           )}
        </div>

        <div className="lg:col-span-1 space-y-6 sm:space-y-8 sticky top-[calc(var(--header-height,60px)+1.5rem)]"> {/* Adjust var(--header-height) */}
          <AtsScoreDisplay />
          <ResumePreview />
           {/* Mobile Save/PDF/Cover Letter Actions */}
           <div className="sm:hidden space-y-3">
            <Button variant="outline" size="default" onClick={handleSaveResume} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {currentResumeIdInStore ? 'Save Changes' : 'Save Draft'}
            </Button>
            <Button variant="outline" size="default" onClick={handleDownloadPdf} disabled={isGeneratingPdf || isSaving} className="w-full">
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DownloadIcon className="w-4 h-4 mr-2" />}
                Download PDF
            </Button>
             <Button variant="outline" size="default" onClick={() => setShowCoverLetterModal(true)} disabled={isSaving || isGeneratingPdf || !currentResumeIdInStore} className="w-full">
                <Mail className="w-4 h-4 mr-2" /> Generate Cover Letter
            </Button>
          </div>
        </div>
        
        {showPdfPreviewForCapture && (
          <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '210mm', backgroundColor: '#fff' }}>
            <SimpleTemplate resumeData={allResumeDataForPayload()} />
          </div>
        )}

        {showCoverLetterModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-fade-in-up">
              <Card className="w-full max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col"> {/* Use Themed Card */}
                  <CardHeader className="border-b"> {/* Use Themed CardHeader */}
                      <div className="flex justify-between items-center">
                          <CardTitle className={cn("text-lg sm:text-xl", appTheme.textHeading)}>Generate Cover Letter</CardTitle>
                          <Button variant="ghost" size="icon" onClick={() => setShowCoverLetterModal(false)} className={appTheme.buttonGhostText}>
                              <span className="text-2xl leading-none">×</span>
                          </Button>
                      </div>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6 space-y-4 overflow-y-auto styled-scrollbar flex-grow">
                      <div>
                          <Label htmlFor="targetJobTitle" className={cn("mb-1.5", appTheme.textBody)}>Target Job Title*</Label>
                          <Input id="targetJobTitle" value={targetJobTitle} onChange={(e) => setTargetJobTitle(e.target.value)} placeholder="e.g., Senior Software Engineer" />
                      </div>
                      <div>
                          <Label htmlFor="targetCompanyName" className={cn("mb-1.5", appTheme.textBody)}>Target Company Name*</Label>
                          <Input id="targetCompanyName" value={targetCompanyName} onChange={(e) => setTargetCompanyName(e.target.value)} placeholder="e.g., Google" />
                      </div>
                      <div>
                          <Label htmlFor="specificPointsForCoverLetter" className={cn("mb-1.5", appTheme.textBody)}>Key Points to Emphasize (Optional)</Label>
                          <Textarea id="specificPointsForCoverLetter" value={specificPointsForCoverLetter} onChange={(e) => setSpecificPointsForCoverLetter(e.target.value)} placeholder="e.g., My experience with project X, my passion for Y" rows={3} />
                      </div>
                      {generatedCoverLetter && (
                          <div className="mt-4 pt-4 border-t"> {/* Themed Divider */}
                              <h4 className={cn("text-base sm:text-md font-semibold mb-2", appTheme.textHeading)}>Generated Cover Letter:</h4>
                              <Textarea value={generatedCoverLetter} readOnly rows={8} className="text-xs leading-relaxed whitespace-pre-wrap w-full styled-scrollbar bg-muted/50" />
                          </div>
                      )}
                  </CardContent>
                  <CardFooter className={cn("border-t p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-3", appTheme.borderSecondary)}>
                        <Button
                            onClick={handleGenerateCoverLetter}
                            disabled={isGeneratingCoverLetter || !targetJobTitle || !targetCompanyName}
                            className="w-full sm:w-auto sm:flex-1 py-2.5"
                            size="lg"
                        >
                            {isGeneratingCoverLetter ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <MailCheck className="w-5 h-5 mr-2" />}
                            Generate with AI
                        </Button>
                        {generatedCoverLetter && (
                             <div className="flex w-full sm:w-auto space-x-2">
                                <Button variant="outline" size="default" onClick={handleCopyCoverLetter} className="flex-1 sm:flex-initial">
                                    <Copy size={16} className="mr-1.5"/> Copy
                                </Button>
                                <Button variant="outline" size="default" onClick={handleDownloadCoverLetterTxt} className="flex-1 sm:flex-initial">
                                    <DownloadIcon size={16} className="mr-1.5"/> .txt
                                </Button>
                             </div>
                        )}
                  </CardFooter>
              </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CreateResumePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-neutral-950">
        <Loader2 className="w-12 h-12 text-neutral-700 dark:text-neutral-300 animate-spin" />
      </div>
    }>
      <CreateResumePageContent />
    </Suspense>
  );
}