/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/resume/ats-score-display.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Zap, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ATSScoreDetails, ResumeData, PersonalInfo, EducationEntry, ExperienceEntry, SkillEntry, ProjectEntry } from '@/types/resume'; // Make sure all types are here or imported correctly
import { useShallowResumeSelector } from '@/hooks/useShallowResumeSelector'; // Your custom hook
import { useResumeStore } from '@/hooks/use-resume'; // Still needed for getState

// calculateMockAtsScoreDetails function (ensure it handles potentially undefined fields gracefully)
const calculateMockAtsScoreDetails = (data: {
    personalInfo?: PersonalInfo; // Use specific types from ResumeData
    education?: EducationEntry[];
    experience?: ExperienceEntry[];
    skills?: SkillEntry[];
    projects?: ProjectEntry[];
}): ATSScoreDetails => {
    let overall = 0;
    const suggestions: string[] = [];
    let keywordScore = 0;
    let clarityScore = 0;
    let impactScore = 0;

    // Ensure data and its properties exist before accessing length or forEach
    if (data.personalInfo?.summary && data.personalInfo.summary.length > 50) overall += 15;
    else if (data.personalInfo?.summary !== undefined) suggestions.push("Expand your professional summary.");

    if (data.experience && data.experience.length > 0) overall += 20;
    else if (data.experience !== undefined) suggestions.push("Add at least one work experience entry.");
    
    data.experience?.forEach((exp) => { // exp will be ExperienceEntry
        if (exp.description && exp.description.length > 30) overall += 5;
        if (exp.achievements && exp.achievements.length > 0) {
            impactScore += 10;
            overall += 5;
        }
    });

    if (data.skills && data.skills.length > 2) overall += 15;
    else if (data.skills !== undefined) suggestions.push("List more relevant skills.");

    if (data.education && data.education.length > 0) overall += 10;
    else if (data.education !== undefined) suggestions.push("Add your educational background.");
    
    const keywords = ["developed", "managed", "led", "javascript", "python", "aws"];
    let foundKeywords = 0;
    const resumeText = JSON.stringify(data).toLowerCase(); // Stringify the partial data
    keywords.forEach(kw => {
        if(resumeText.includes(kw)) foundKeywords++;
    });
    keywordScore = Math.min(foundKeywords * 5, 25);
    overall += keywordScore;
    
    clarityScore = (data.personalInfo?.summary && data.personalInfo.summary.length > 10) ? 15 : 5;
    overall += Math.min(clarityScore, 15);

    overall = Math.min(Math.max(overall, 0), 100);

    if (overall < 60 && data.experience !== undefined) suggestions.push("Focus on quantifying achievements in your experience section.");
    if (overall < 75 && keywordScore < 15 && data.skills !== undefined) suggestions.push("Incorporate more industry-specific keywords.");

    return {
        overall,
        breakdown: {
            keywords: { score: keywordScore, suggestions: keywordScore < 15 ? ["Add more relevant keywords."] : [] },
            clarity: { score: clarityScore, suggestions: clarityScore < 10 ? ["Ensure your summary is clear and concise."] : [] },
            impact: { score: impactScore, suggestions: impactScore < 5 ? ["Quantify your achievements with numbers."]: [] },
            formatting: { score: 70, suggestions: [] }, // Mocked
            length: { score: (data.experience && data.experience.length > 1) ? 80 : 40, suggestions: []} // Mocked
        },
        suggestions: suggestions.slice(0, 3)
    };
};


const AtsScoreDisplay: React.FC = () => {
  // Hooks MUST be called inside the component body
  const { 
    personalInfo, 
    education, 
    experience, 
    skills, 
    projects, 
    setAtsScore: setStoreAtsScore 
  } = useShallowResumeSelector();

  const memoizedResumeData = useMemo(() => ({
    personalInfo, education, experience, skills, projects
  }), [personalInfo, education, experience, skills, projects]);

  const [atsDetails, setAtsDetails] = useState<ATSScoreDetails>({ overall: 0, suggestions: [] });

  useEffect(() => {
    const newAtsDetails = calculateMockAtsScoreDetails(memoizedResumeData);
    
    // Update local state (atsDetails) only if the new details are actually different
    // Using JSON.stringify for deep comparison is simple but can be inefficient for very large objects.
    // For this use case, it's likely acceptable.
    if (JSON.stringify(atsDetails) !== JSON.stringify(newAtsDetails)) {
        setAtsDetails(newAtsDetails);
    }

    // Update global store (useResumeStore) only if the overall score has changed.
    // This reads the current global score to avoid unnecessary dispatches.
    const currentGlobalScore = useResumeStore.getState().atsScore;
    if (newAtsDetails.overall !== currentGlobalScore) {
      setStoreAtsScore(newAtsDetails.overall);
    }
  // Dependencies:
  // - memoizedResumeData: Triggers recalculation when the relevant resume data changes.
  // - setStoreAtsScore: The setter function from Zustand (stable reference).
  // - atsDetails: Re-run if local atsDetails changed by the setAtsDetails above, this helps ensure
  //              the comparison `newAtsDetails.overall !== currentGlobalScore` is made after local state updates,
  //              but it can be tricky. A more robust way for global store update is just to depend on memoizedResumeData and setStoreAtsScore,
  //              and let Zustand handle if the store update is a no-op.
  //              Let's simplify the dependency array for clarity and common practice.
  }, [memoizedResumeData, setStoreAtsScore]); // Simplified dependency array for the main effect logic.
                                             // The comparison with currentGlobalScore handles idempotency.


  const score = atsDetails.overall;

  const getScoreColor = (s: number) => {
    // TODO: Integrate with useTheme for light/dark mode consistency
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getScoreRingColor = (s: number) => {
    if (s >= 80) return 'ring-green-500';
    if (s >= 60) return 'ring-yellow-500';
    return 'ring-red-500';
  };

  const getScoreFeedback = (s: number) => {
    if (s >= 80) return { text: 'Excellent!', icon: <CheckCircle className="w-5 h-5 text-green-400" /> };
    if (s >= 60) return { text: 'Good Foundation', icon: <Info className="w-5 h-5 text-yellow-400" /> };
    return { text: 'Needs Improvement', icon: <AlertTriangle className="w-5 h-5 text-red-400" /> };
  };

  const feedback = getScoreFeedback(score);

  return (
    <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm shadow-xl sticky top-24">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
            ATS Score
            </CardTitle>
            <Target className="h-6 w-6 text-purple-400" />
        </div>
        <CardDescription className="text-xs text-gray-400 pt-1">
            Real-time analysis of your resume&apos;s compatibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col items-center justify-center my-6">
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 ${getScoreRingColor(score)} bg-slate-700/30`}>
                <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
                    {score}
                </span>
                <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-5 text-lg font-medium ${getScoreColor(score)}`}>%</span>
            </div>
            <div className="flex items-center mt-4">
                {feedback.icon}
                <p className={`ml-2 text-md font-medium ${getScoreColor(score)}`}>
                    {feedback.text}
                </p>
            </div>
        </div>
        
        <Progress value={score} className="h-1.5 mb-6" />

        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-200 flex items-center">
                <Zap size={16} className="mr-2 text-yellow-400"/>
                AI Suggestions:
            </h4>
            {atsDetails.suggestions.length > 0 ? (
                <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5 pl-1">
                    {atsDetails.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-gray-400 italic">Looking good! No critical issues found.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AtsScoreDisplay;