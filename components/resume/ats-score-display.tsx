/* eslint-disable @typescript-eslint/no-unused-vars */
// components/resume/ats-score-display.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Zap, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'; // Added Loader2
import { Progress } from '@/components/ui/progress';
import { 
    ATSScoreDetails, 
    ResumeData, 
    PersonalInfo, 
    EducationEntry, 
    ExperienceEntry, 
    SkillEntry, 
    ProjectEntry 
} from '@/types/resume';
import { useShallowResumeSelector } from '@/hooks/useShallowResumeSelector';
import { useResumeStore } from '@/hooks/use-resume';
import { useDebouncedCallback } from 'use-debounce';

// calculateMockAtsScoreDetails function aligned with ATSScoreDetails type
const calculateMockAtsScoreDetails = (data: {
    personalInfo?: PersonalInfo;
    education?: EducationEntry[];
    experience?: ExperienceEntry[];
    skills?: SkillEntry[];
    projects?: ProjectEntry[];
}): ATSScoreDetails => {
    let overall = 0;
    const suggestions: string[] = [];
    
    // Initialize breakdown scores
    let keywordsScore = 0;
    let clarityAndConcisenessScore = 0;
    let actionVerbsScore = 0; // Assuming some logic for this, mocking for now
    let quantifiableResultsScore = 0;
    // eslint-disable-next-line prefer-const
    let formattingAndStructureScore = 70; // Mocked
    let lengthAndRelevanceScore = 40; // Mocked


    if (data.personalInfo?.summary && data.personalInfo.summary.length > 10) clarityAndConcisenessScore += 10;
    if (data.personalInfo?.summary && data.personalInfo.summary.length > 50) {
        overall += 15;
        clarityAndConcisenessScore += 15;
    } else if (data.personalInfo?.summary !== undefined) {
        suggestions.push("Expand your professional summary for better clarity and impact.");
    }

    if (data.experience && data.experience.length > 0) {
        overall += 20;
        lengthAndRelevanceScore = Math.max(lengthAndRelevanceScore, 60); // Increase if experience exists
    } else if (data.experience !== undefined) {
        suggestions.push("Add at least one work experience entry.");
    }
    
    let hasActionVerbs = false;
    let hasQuantifiedResults = false;
    data.experience?.forEach((exp) => {
        if (exp.description && exp.description.length > 30) overall += 3; // Small increment for description
        // Simple check for action verbs (very basic)
        if (/(led|managed|developed|created|implemented|achieved|increased|reduced)/i.test(exp.description || '')) {
            hasActionVerbs = true;
        }
        // Simple check for quantified results (very basic)
        if (/\d+%?/.test(exp.description || '') || (exp.achievements && exp.achievements.some(ach => /\d+%?/.test(ach)))) {
            hasQuantifiedResults = true;
            quantifiableResultsScore += 10;
            overall += 7; // Higher increment for quantified results
        }
        if (exp.achievements && exp.achievements.length > 0) {
            overall += 5;
            quantifiableResultsScore += 5 * exp.achievements.length; // More for more achievements
        }
    });

    if (hasActionVerbs) actionVerbsScore = Math.max(actionVerbsScore, 60); else suggestions.push("Use strong action verbs in your experience descriptions.");
    if (hasQuantifiedResults) quantifiableResultsScore = Math.max(quantifiableResultsScore, 70); else suggestions.push("Quantify your achievements with numbers and data where possible.");


    if (data.skills && data.skills.length > 0) keywordsScore += 5 * Math.min(data.skills.length, 5); // Basic score for skills
    if (data.skills && data.skills.length > 2) overall += 15;
    else if (data.skills !== undefined) suggestions.push("List more relevant skills (aim for 5-10 key skills).");

    if (data.education && data.education.length > 0) overall += 10;
    else if (data.education !== undefined) suggestions.push("Add your educational background.");
    
    const commonKeywords = ["developed", "managed", "led", "javascript", "python", "aws", "react", "node.js", "project management", "data analysis"];
    let foundKeywordsCount = 0;
    const resumeText = JSON.stringify(data).toLowerCase();
    commonKeywords.forEach(kw => {
        if(resumeText.includes(kw)) foundKeywordsCount++;
    });
    keywordsScore += Math.min(foundKeywordsCount * 3, 30); // Add to keyword score
    overall += Math.min(foundKeywordsCount * 2, 20); // Add to overall score

    // Cap individual scores
    keywordsScore = Math.min(keywordsScore, 100);
    clarityAndConcisenessScore = Math.min(clarityAndConcisenessScore, 100);
    actionVerbsScore = Math.min(actionVerbsScore, 100);
    quantifiableResultsScore = Math.min(quantifiableResultsScore, 100);
    if (data.experience && data.experience.length > 1) lengthAndRelevanceScore = Math.max(lengthAndRelevanceScore, 80);


    overall = Math.min(Math.max(overall, 0), 100); // Cap overall score

    if (overall < 60 && data.experience !== undefined) suggestions.push("Review experience descriptions for impact and clarity.");
    if (overall < 75 && keywordsScore < 50 && data.skills !== undefined) suggestions.push("Ensure your resume includes keywords relevant to your target roles.");

    return {
        overall,
        breakdown: {
            keywords: { score: keywordsScore, suggestions: keywordsScore < 50 ? ["Add more relevant industry keywords."] : ["Good keyword presence."] },
            clarityAndConciseness: { score: clarityAndConcisenessScore, suggestions: clarityAndConcisenessScore < 60 ? ["Ensure your summary and descriptions are clear and concise."] : [] },
            actionVerbs: { score: actionVerbsScore, suggestions: actionVerbsScore < 60 ? ["Incorporate more strong action verbs at the start of your bullet points."] : [] },
            quantifiableResults: { score: quantifiableResultsScore, suggestions: quantifiableResultsScore < 60 ? ["Try to quantify more of your achievements with specific numbers or data."] : [] },
           formattingAndConciseness: { score: formattingAndStructureScore, suggestions: formattingAndStructureScore < 70 ? ["Review for consistent formatting and clear sectioning."] : [] },
            lengthAndRelevance: { score: lengthAndRelevanceScore, suggestions: lengthAndRelevanceScore < 60 ? ["Ensure resume length is appropriate and content is relevant."] : [] }
        },
        suggestions: suggestions.slice(0, 3).filter(s => s) // Filter out any empty suggestions
    };
};


const AtsScoreDisplay: React.FC = () => {
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

  const [atsDetails, setAtsDetails] = useState<ATSScoreDetails>(() => calculateMockAtsScoreDetails({})); // Initialize with mock for empty
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  const debouncedFetchAtsScore = useDebouncedCallback(
    async (dataForApi: typeof memoizedResumeData) => {
      const isPersonalInfoEmpty = !dataForApi.personalInfo || Object.values(dataForApi.personalInfo).every(val => val === '' || val === undefined);
      const isExperienceEmpty = !dataForApi.experience || dataForApi.experience.length === 0;

      if (isPersonalInfoEmpty && isExperienceEmpty && (!dataForApi.skills || dataForApi.skills.length === 0)) {
          const defaultEmptyScore = calculateMockAtsScoreDetails({}); // Use the mock for truly empty
          setAtsDetails(defaultEmptyScore);
          const currentGlobalScore = useResumeStore.getState().atsScore;
          if (currentGlobalScore !== defaultEmptyScore.overall) {
              setStoreAtsScore(defaultEmptyScore.overall);
          }
          setIsLoadingScore(false);
          return;
      }

      setIsLoadingScore(true);
      try {
        const response = await fetch('/api/ai/ats-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataForApi),
        });
        if (!response.ok) {
          const errorText = await response.text(); // Get raw error text
          console.error("ATS API Error Response:", errorText);
          throw new Error(`API error: ${response.status} - ${errorText.substring(0,100)}`); // Limit error message length
        }
        const newDetails: ATSScoreDetails = await response.json();
        setAtsDetails(newDetails);
        
        const currentGlobalScore = useResumeStore.getState().atsScore;
        if (newDetails.overall !== currentGlobalScore) {
          setStoreAtsScore(newDetails.overall);
        }

      } catch (error) {
        console.error("Error fetching ATS score:", error);
        setAtsDetails(prev => ({ // Provide a sensible fallback based on previous state or a generic error state
            ...calculateMockAtsScoreDetails(dataForApi), // Recalculate mock based on current data as fallback
            overall: Math.max(0, prev.overall - 5), // Slightly degrade score
            suggestions: ["AI analysis failed. Displaying estimated score.", (error as Error).message.substring(0,100) ],
        }));
      } finally {
        setIsLoadingScore(false);
      }
    }, 
    1500
  );

  useEffect(() => {
    if (memoizedResumeData) { // Check if memoizedResumeData is not undefined
        debouncedFetchAtsScore(memoizedResumeData);
    }
  }, [memoizedResumeData, debouncedFetchAtsScore]);

  const score = atsDetails.overall;

  const getScoreColor = (s: number) => {
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
            <CardTitle className="text-lg font-semibold text-white flex items-center">
            ATS Score {isLoadingScore && <Loader2 className="w-4 h-4 ml-2 inline animate-spin" />}
            </CardTitle>
            <Target className="h-6 w-6 text-purple-400" />
        </div>
        <CardDescription className="text-xs text-gray-400 pt-1">
            Real-time AI-powered analysis of your resume.
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
            {atsDetails.suggestions && atsDetails.suggestions.length > 0 ? (
                <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5 pl-1">
                    {atsDetails.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-gray-400 italic">No specific suggestions at this score, or analysis pending.</p>
            )}
        </div>
        {atsDetails.breakdown && (
            <div className="mt-4 pt-3 border-t border-slate-700/50">
                 <h5 className="text-xs font-semibold text-gray-300 mb-1.5">Score Breakdown:</h5>
                 <ul className="text-xs text-gray-400 space-y-1">
                    {Object.entries(atsDetails.breakdown).map(([key, value]) => {
                        // Type guard to ensure value is an object with score and suggestions
                        if (value && typeof value === 'object' && 'score' in value && 'suggestions' in value) {
                            const typedValue = value as { score: number; suggestions: string[] }; // Assert type
                            // Create a more readable key
                            const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                                <li key={key} className="flex justify-between items-center">
                                    <span>{displayKey}:</span>
                                    <span className={getScoreColor(typedValue.score)}>{typedValue.score}%</span>
                                </li>
                            );
                        }
                        return null;
                    })}
                 </ul>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AtsScoreDisplay;