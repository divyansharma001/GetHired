// components/resume/resume-form.tsx
import React from 'react';
import PersonalInfoSection from './sections/personal-info';
import EducationSection from './sections/education';
import ExperienceSection from './sections/experience';
import SkillsSection from './sections/skills';
import ProjectsSection from './sections/projects';
// Import ReviewSection when it's created
// import ReviewSection from './sections/review';

interface ResumeFormProps {
  currentStep: number;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ currentStep }) => {
  return (
    <div>
      {currentStep === 0 && <PersonalInfoSection />}
      {currentStep === 1 && <EducationSection />}
      {currentStep === 2 && <ExperienceSection />}
      {currentStep === 3 && <SkillsSection />}
      {currentStep === 4 && <ProjectsSection />}
      {/* {currentStep === 5 && <ReviewSection />} */}
      {currentStep === 5 && ( // Placeholder for Review step
        <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4 text-white">Review Your Resume</h2>
            <p className="text-gray-300">
              This is where you&apos;ll see a complete preview of your resume.
            </p>
            <p className="text-gray-300 mt-2">
              You can make final AI-powered adjustments and then proceed to download.
            </p>
            {/* Add a more detailed preview component here later */}
        </div>
      )}
    </div>
  );
};

export default ResumeForm;