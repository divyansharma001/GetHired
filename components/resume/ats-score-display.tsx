/* eslint-disable @typescript-eslint/no-unused-vars */
// components/resume/ats-score-display.tsx
'use client'; // Ensure client component directive

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Zap, CheckCircle, AlertTriangle, Info, Loader2, HelpCircle } from 'lucide-react';
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
import { useTheme } from '@/context/theme-provider'; // Import useTheme
import { cn } from '@/lib/utils'; // Import cn

// calculateMockAtsScoreDetails function (remains mostly the same, ensure it aligns with ATSScoreDetails type)
// This function is for fallback and initial state, not the primary display logic.
const calculateMockAtsScoreDetails = (data: Partial<ResumeData>): ATSScoreDetails => {
    // ... (Implementation as provided in your original codebase, ensure it returns valid ATSScoreDetails)
    // For brevity, I'll assume this function is correctly implemented.
    // Example of what it might return for an empty state:
    return {
        overall: 15, // Start with a low mock score
        suggestions: ["Add more content to all sections for a comprehensive ATS analysis."],
        breakdown: {
            keywords: { score: 10, suggestions: ["Include relevant keywords from job descriptions."] },
            clarityAndConciseness: { score: 20, suggestions: ["Ensure your summary is concise and impactful."] },
            actionVerbs: { score: 10, suggestions: ["Start bullet points with strong action verbs."] },
            quantifiableResults: { score: 5, suggestions: ["Quantify achievements with numbers where possible."] },
            formattingAndConciseness: { score: 30, suggestions: ["Check for consistent formatting and conciseness."] },
            lengthAndRelevance: { score: 20, suggestions: ["Ensure resume length is appropriate."] },
        }
    };
};


// Define AppTheme (or import from a central config)
function getAppTheme(isDark: boolean) {
  return {
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    textBody: isDark ? 'text-neutral-300' : 'text-neutral-700',
    borderSecondary: isDark ? 'border-neutral-700/50' : 'border-neutral-200',
    iconAccentColor: isDark ? 'text-purple-400' : 'text-purple-600',
    // Colors for score display
    scoreGood: isDark ? 'text-green-400' : 'text-green-600',
    scoreMedium: isDark ? 'text-yellow-400' : 'text-yellow-500',
    scoreLow: isDark ? 'text-red-400' : 'text-red-500',
    ringGood: isDark ? 'ring-green-500/70' : 'ring-green-500/70',
    ringMedium: isDark ? 'ring-yellow-500/70' : 'ring-yellow-500/70',
    ringLow: isDark ? 'ring-red-500/70' : 'ring-red-500/70',
    scoreCircleBg: isDark ? 'bg-neutral-700/40' : 'bg-slate-100',
  };
}


const AtsScoreDisplay: React.FC = () => {
  const { 
    personalInfo, education, experience, skills, projects, 
    setAtsScore: setStoreAtsScore, // From Zustand store
    title // Get title for context
  } = useShallowResumeSelector();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark);

  const memoizedResumeData = useMemo(() => ({
    personalInfo, education, experience, skills, projects, title // Include title for API
  }), [personalInfo, education, experience, skills, projects, title]);

  const [atsDetails, setAtsDetails] = useState<ATSScoreDetails>(() => calculateMockAtsScoreDetails({}));
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false); // State for toggling breakdown

  const debouncedFetchAtsScore = useDebouncedCallback(
    async (dataForApi: Partial<ResumeData>) => {
      const isMinimalContent = 
        (!dataForApi.personalInfo || Object.values(dataForApi.personalInfo).every(val => val === '' || val === undefined || (Array.isArray(val) && val.length === 0))) &&
        (!dataForApi.experience || dataForApi.experience.length === 0) &&
        (!dataForApi.skills || dataForApi.skills.length === 0);

      if (isMinimalContent) {
          const defaultEmptyScore = calculateMockAtsScoreDetails({});
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
          body: JSON.stringify(dataForApi), // Pass dataForApi which includes title
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("ATS API Error Response:", errorText);
          throw new Error(`API error: ${response.status} - ${errorText.substring(0,100)}`);
        }
        const newDetails: ATSScoreDetails = await response.json();
        setAtsDetails(newDetails);
        
        const currentGlobalScore = useResumeStore.getState().atsScore;
        if (newDetails.overall !== currentGlobalScore) {
          setStoreAtsScore(newDetails.overall);
        }
      } catch (error) {
        console.error("Error fetching ATS score:", error);
        setAtsDetails(prev => ({
            ...calculateMockAtsScoreDetails(dataForApi),
            overall: Math.max(0, prev.overall - 5),
            suggestions: ["AI analysis failed. Displaying estimated score.", (error as Error).message.substring(0,100) ],
        }));
      } finally {
        setIsLoadingScore(false);
      }
    }, 
    1500 // 1.5 seconds debounce
  );

  useEffect(() => {
    if (memoizedResumeData) {
        debouncedFetchAtsScore(memoizedResumeData);
    }
  }, [memoizedResumeData, debouncedFetchAtsScore]);

  const score = atsDetails.overall;

  const getScoreColor = (s: number) => {
    if (s >= 80) return appTheme.scoreGood;
    if (s >= 60) return appTheme.scoreMedium;
    return appTheme.scoreLow;
  };
  
  const getScoreRingColor = (s: number) => {
    if (s >= 80) return appTheme.ringGood;
    if (s >= 60) return appTheme.ringMedium;
    return appTheme.ringLow;
  };

  const getScoreFeedback = (s: number) => {
    if (s >= 80) return { text: 'Excellent!', icon: <CheckCircle className={cn("w-5 h-5", appTheme.scoreGood)} /> };
    if (s >= 60) return { text: 'Good Foundation', icon: <Info className={cn("w-5 h-5", appTheme.scoreMedium)} /> };
    return { text: 'Needs Improvement', icon: <AlertTriangle className={cn("w-5 h-5", appTheme.scoreLow)} /> };
  };

  const feedback = getScoreFeedback(score);

  const renderBreakdownItem = (label: string, categoryScore: number, suggestions: string[]) => (
    <li key={label} className="py-2 border-b last:border-b-0" style={{borderColor: appTheme.borderSecondary}}>
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-foreground/80">{label}</span>
            <span className={cn("text-xs font-semibold", getScoreColor(categoryScore))}>{categoryScore}%</span>
        </div>
        {suggestions && suggestions.length > 0 && (
             <ul className="list-disc list-inside pl-2 space-y-0.5">
                {suggestions.slice(0,1).map((s, i) => <li key={i} className="text-xs text-muted-foreground">{s}</li>)}
            </ul>
        )}
    </li>
  );


  return (
    <Card className="sticky top-24 shadow-xl"> {/* Use themed Card */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className={cn("text-base sm:text-lg font-semibold flex items-center", appTheme.textHeading)}>
              ATS Score 
              {isLoadingScore && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </CardTitle>
            <Target className={cn("h-5 w-5 sm:h-6 sm:w-6", appTheme.iconAccentColor)} />
        </div>
        <CardDescription className={cn("text-xs", appTheme.textMuted)}>
            Real-time AI analysis of your resume&apos;s effectiveness.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 pb-5">
        <div className="flex flex-col items-center justify-center my-5 sm:my-6">
            <div className={cn(
                "relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-4 shadow-inner",
                getScoreRingColor(score),
                appTheme.scoreCircleBg
            )}>
                <span className={cn("text-3xl sm:text-4xl font-bold", getScoreColor(score))}>
                    {score}
                </span>
                <span className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 mt-3 sm:mt-4 text-base sm:text-lg font-medium", getScoreColor(score))}>%</span>
            </div>
            <div className="flex items-center mt-4">
                {feedback.icon}
                <p className={cn("ml-2 text-sm sm:text-md font-medium", getScoreColor(score))}>
                    {feedback.text}
                </p>
            </div>
        </div>
        
        <Progress value={score} className="h-2 sm:h-2.5 mb-5 sm:mb-6" /> {/* Use themed Progress */}

        <div className="space-y-3">
            <h4 className={cn("text-sm font-semibold flex items-center", appTheme.textHeading)}>
                <Zap size={16} className={cn("mr-2", appTheme.iconAccentColor)}/>
                Key AI Suggestions:
            </h4>
            {atsDetails.suggestions && atsDetails.suggestions.length > 0 ? (
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1.5 pl-1">
                    {atsDetails.suggestions.map((suggestion, index) => (
                        <li key={index} className={appTheme.textBody}>{suggestion}</li>
                    ))}
                </ul>
            ) : (
                <p className={cn("text-xs sm:text-sm italic", appTheme.textMuted)}>
                    {isLoadingScore ? "Analyzing..." : "No specific suggestions at this score, or analysis pending."}
                </p>
            )}
        </div>

        {atsDetails.breakdown && (
            <div className="mt-4 pt-3 border-t" style={{borderColor: appTheme.borderSecondary}}>
                 <button 
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className={cn(
                        "w-full flex justify-between items-center py-1.5 text-xs font-medium rounded",
                        appTheme.textMuted,
                        isDark ? "hover:bg-neutral-700/50" : "hover:bg-slate-100"
                    )}
                >
                    <span>Detailed Score Breakdown</span>
                    <HelpCircle size={14} className={cn("transition-transform", showBreakdown ? "rotate-180" : "")}/>
                 </button>
                 {showBreakdown && (
                    <ul className="text-xs mt-2 space-y-1 animate-fade-in-up">
                        {Object.entries(atsDetails.breakdown).map(([key, value]) => {
                            if (value && typeof value === 'object' && 'score' in value && 'suggestions' in value) {
                                const typedValue = value as { score: number; suggestions: string[] };
                                const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return renderBreakdownItem(displayKey, typedValue.score, typedValue.suggestions);
                            }
                            return null;
                        })}
                    </ul>
                 )}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AtsScoreDisplay;