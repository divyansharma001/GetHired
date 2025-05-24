/* eslint-disable @typescript-eslint/no-explicit-any */
// components/resume/ats-score-display.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Zap, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress'; // Assuming you have this from earlier
import { useResumeStore } from '@/hooks/use-resume';
import { ATSScoreDetails } from '@/types/resume'; // Assuming you have a more detailed type

// This is a mock function, replace with actual API call or lib function
const calculateMockAtsScoreDetails = (resumeData: any): ATSScoreDetails => {
    let overall = 0;
    const suggestions: string[] = [];
    let keywordScore = 0;
    let clarityScore = 0;
    let impactScore = 0;

    if (resumeData.personalInfo?.summary?.length > 50) overall += 15; else suggestions.push("Expand your professional summary.");
    if (resumeData.experience?.length > 0) overall += 20; else suggestions.push("Add at least one work experience entry.");
    resumeData.experience?.forEach((exp: any) => {
        if (exp.description?.length > 30) overall += 5;
        if (exp.achievements?.length > 0) {
            impactScore += 10;
            overall += 5;
        }
    });
    if (resumeData.skills?.length > 2) overall += 15; else suggestions.push("List more relevant skills.");
    if (resumeData.education?.length > 0) overall += 10; else suggestions.push("Add your educational background.");
    
    // Simulate keyword scoring
    const keywords = ["developed", "managed", "led", "javascript", "python", "aws"];
    let foundKeywords = 0;
    const resumeText = JSON.stringify(resumeData).toLowerCase();
    keywords.forEach(kw => {
        if(resumeText.includes(kw)) foundKeywords++;
    });
    keywordScore = Math.min(foundKeywords * 5, 25);
    overall += keywordScore;
    
    clarityScore = resumeData.personalInfo?.summary?.length > 10 ? 15 : 5; // Simplified
    overall += Math.min(clarityScore, 15);


    overall = Math.min(Math.max(overall, 0), 100); // Cap score between 0-100

    if (overall < 60) suggestions.push("Focus on quantifying achievements in your experience section.");
    if (overall < 75 && keywordScore < 15) suggestions.push("Incorporate more industry-specific keywords.");


    return {
        overall,
        breakdown: {
            keywords: { score: keywordScore, suggestions: keywordScore < 15 ? ["Add more relevant keywords."] : [] },
            clarity: { score: clarityScore, suggestions: clarityScore < 10 ? ["Ensure your summary is clear and concise."] : [] },
            impact: { score: impactScore, suggestions: impactScore < 5 ? ["Quantify your achievements with numbers."]: [] },
            formatting: { score: 70, suggestions: [] }, // Mocked
            length: { score: resumeData.experience?.length > 1 ? 80 : 40, suggestions: []} // Mocked
        },
        suggestions: suggestions.slice(0, 3) // Limit general suggestions
    };
};


const AtsScoreDisplay: React.FC = () => {
  const resumeData = useResumeStore(state => ({
    personalInfo: state.personalInfo,
    education: state.education,
    experience: state.experience,
    skills: state.skills,
    projects: state.projects,
  }));
  const setStoreAtsScore = useResumeStore(state => state.setAtsScore);

  const [atsDetails, setAtsDetails] = useState<ATSScoreDetails>({ overall: 0, suggestions: [] });

  useEffect(() => {
    // Debounce this in a real app
    const newAtsDetails = calculateMockAtsScoreDetails(resumeData);
    setAtsDetails(newAtsDetails);
    setStoreAtsScore(newAtsDetails.overall); // Update the global store
  }, [resumeData, setStoreAtsScore]);

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
            <CardTitle className="text-lg font-semibold text-white">
            ATS Score
            </CardTitle>
            <Target className="h-6 w-6 text-purple-400" />
        </div>
        <CardDescription className="text-xs text-gray-400 pt-1">
            Real-time analysis of your resume&apos;s compatibility with Applicant Tracking Systems.
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
                <p className="text-xs text-gray-400 italic">No major issues found. Keep up the great work!</p>
            )}
        </div>

        {/* Optional: Detailed Breakdown (collapsible) */}
        {/* 
        <Collapsible className="mt-4">
            <CollapsibleTrigger className="text-xs text-purple-400 hover:text-purple-300">
                Show Detailed Breakdown
            </CollapsibleTrigger>
            <CollapsibleContent className="text-xs text-gray-400 mt-2 space-y-1">
                <p>Keywords: {atsDetails.breakdown?.keywords.score || 0}%</p>
                <p>Clarity: {atsDetails.breakdown?.clarity.score || 0}%</p>
                 ... more details ...
            </CollapsibleContent>
        </Collapsible>
        */}
      </CardContent>
    </Card>
  );
};

export default AtsScoreDisplay;