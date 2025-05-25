// components/resume/resume-form.tsx
'use client'; // Add client directive

import React from 'react';
import PersonalInfoSection from './sections/personal-info';
import EducationSection from './sections/education';
import ExperienceSection from './sections/experience';
import SkillsSection from './sections/skills';
import ProjectsSection from './sections/projects';
import SimpleTemplate from './templates/simple-template'; // Import the template
import { useShallowResumeSelector } from '@/hooks/useShallowResumeSelector'; // Import store selector
import { useTheme } from '@/context/theme-provider'; // Import useTheme
import { cn } from '@/lib/utils'; // Import cn

interface ResumeFormProps {
  currentStep: number;
}

// Define AppTheme for this component's specific needs or import centrally
function getReviewSectionTheme(isDark: boolean) {
  return {
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    borderSecondary: isDark ? 'border-neutral-700/50' : 'border-neutral-200',
    previewContainerBg: isDark ? 'bg-neutral-800/50' : 'bg-white', // Background for the preview wrapper
    previewContainerBorder: isDark ? 'border-neutral-700' : 'border-neutral-300',
  };
}


const ResumeForm: React.FC<ResumeFormProps> = ({ currentStep }) => {
  const resumeData = useShallowResumeSelector(); // Get all resume data
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reviewTheme = getReviewSectionTheme(isDark);

  return (
    <div>
      {currentStep === 0 && <PersonalInfoSection />}
      {currentStep === 1 && <EducationSection />}
      {currentStep === 2 && <ExperienceSection />}
      {currentStep === 3 && <SkillsSection />}
      {currentStep === 4 && <ProjectsSection />}
      {currentStep === 5 && ( // Review step
        <div className="space-y-6">
          <div className="border-b pb-4" style={{ borderColor: reviewTheme.borderSecondary }}>
            <h2 className={cn("text-xl sm:text-2xl font-semibold", reviewTheme.textHeading)}>Review Your Resume</h2>
            <p className={cn("text-sm mt-1", reviewTheme.textMuted)}>
              This is a preview of how your resume will look when downloaded. Make any final adjustments in previous steps if needed.
            </p>
          </div>
          
          {/* Container for the SimpleTemplate to control its display within the form area */}
          <div className={cn(
              "p-4 sm:p-6 border rounded-lg shadow-lg overflow-x-auto", // Added overflow-x-auto
              reviewTheme.previewContainerBg, 
              reviewTheme.previewContainerBorder
            )}
          >
            {/* 
              The SimpleTemplate uses inline styles and is designed for A4.
              It might be wider than the form container. We can scale it down
              or let it be scrollable. For accuracy, letting it be scrollable (overflow-x-auto)
              is better than scaling and distorting proportions.
            */}
            <div 
              id="review-step-preview" 
              className="mx-auto" // Center the A4 template if container is wider
              style={{ 
                width: '210mm', // A4 width, ensure units are correct for display
                minHeight: '297mm', // A4 height
                // transform: 'scale(0.8)', // Optional: scale down to fit better
                // transformOrigin: 'top left', // If scaling
              }}
            >
              <SimpleTemplate resumeData={resumeData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeForm;