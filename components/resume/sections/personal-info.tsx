// components/resume/sections/personal-info.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResumeStore } from '@/hooks/use-resume';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PersonalInfo } from '@/types/resume';
import { Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

// Zod schema (remains the same)
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  summary: z.string().min(20, "Summary should be at least 20 characters").max(1000, "Summary too long"),
});

// Define AppTheme (remains the same)
function getAppTheme(isDark: boolean) {
  return {
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    borderSecondary: isDark ? 'border-neutral-700/50' : 'border-neutral-200',
    aiButtonText: isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700',
    errorText: isDark ? 'text-red-400' : 'text-red-500',
  };
}

const PersonalInfoSection: React.FC = () => {
  const { personalInfo: storePersonalInfo, updatePersonalInfo } = useResumeStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark);

  const { control, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: storePersonalInfo,
  });

  // Effect to update RHF if storePersonalInfo changes from an external source
  useEffect(() => {
    if (JSON.stringify(storePersonalInfo) !== JSON.stringify(watch())) {
      reset(storePersonalInfo);
    }
  }, [storePersonalInfo, reset, watch]);

  // Debounce the function that updates the Zustand store
  const debouncedUpdateStore = useDebouncedCallback(
    (data: PersonalInfo) => {
      updatePersonalInfo(data);
    },
    500 // Debounce time in ms
  );

  // Effect to watch RHF changes and call the debounced store update
  useEffect(() => {
    const subscription = watch((value) => {
      debouncedUpdateStore(value as PersonalInfo);
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedUpdateStore]);

  const [isEnhancingSummary, setIsEnhancingSummary] = useState(false);

  const handleAiEnhanceSummary = async () => {
    const currentSummaryValue = watch("summary");
    const resumeTitle = useResumeStore.getState().title;

    if (!currentSummaryValue || currentSummaryValue.trim().length < 10) {
      alert("Please write a brief summary first (at least 10 characters).");
      return;
    }
    setIsEnhancingSummary(true);
    try {
      const response = await fetch('/api/ai/enhance-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            currentSummary: currentSummaryValue,
            resumeTitle: resumeTitle,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `AI summary enhancement failed: ${response.statusText}`);
      }
      const { enhancedSummary } = await response.json();
      setValue("summary", enhancedSummary, { shouldDirty: true, shouldValidate: true });
      alert("Summary enhanced by AI! Please review.");
    } catch (error) {
      console.error("AI Summary Enhancement error:", error);
      alert(`AI Summary Enhancement failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsEnhancingSummary(false);
    }
  };

  return (
    <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit(() => {})}>
      <h2 className={cn("text-xl sm:text-2xl font-semibold border-b pb-4 mb-6 sm:mb-8", appTheme.textHeading, appTheme.borderSecondary)}>
        Personal Information
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 sm:gap-y-6">
        <div>
            <Label htmlFor="firstName">First Name</Label>
            <Controller name="firstName" control={control} render={({ field }) => <Input id="firstName" {...field} placeholder="e.g., John"/>}/>
            {errors.firstName && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.firstName.message}</p>}
        </div>
        <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Controller name="lastName" control={control} render={({ field }) => <Input id="lastName" {...field} placeholder="e.g., Doe"/>}/>
            {errors.lastName && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.lastName.message}</p>}
        </div>
        <div>
            <Label htmlFor="email">Email Address</Label>
            <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} placeholder="e.g., john.doe@example.com"/>}/>
            {errors.email && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.email.message}</p>}
        </div>
        <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Controller name="phone" control={control} render={({ field }) => <Input id="phone" type="tel" {...field} placeholder="e.g., (123) 456-7890"/>}/>
            {errors.phone && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Controller name="location" control={control} render={({ field }) => <Input id="location" {...field} placeholder="e.g., San Francisco, CA"/>}/>
        {errors.location && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.location.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 sm:gap-y-6">
        <div>
            <Label htmlFor="linkedin">LinkedIn Profile URL (Optional)</Label>
            <Controller name="linkedin" control={control} render={({ field }) => <Input id="linkedin" {...field} placeholder="e.g., linkedin.com/in/johndoe"/>}/>
            {errors.linkedin && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.linkedin.message}</p>}
        </div>
        <div>
            <Label htmlFor="website">Personal Website/Portfolio (Optional)</Label>
            <Controller name="website" control={control} render={({ field }) => <Input id="website" {...field} placeholder="e.g., johndoe.com"/>}/>
            {errors.website && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.website.message}</p>}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1.5">
            <Label htmlFor="summary">Professional Summary</Label>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAiEnhanceSummary}
                disabled={isEnhancingSummary}
                className={cn("text-xs p-1 flex items-center", appTheme.aiButtonText)}
            >
                {isEnhancingSummary ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                )}
                AI Enhance
            </Button>
        </div>
        <Controller
          name="summary"
          control={control}
          render={({ field }) => (
            <Textarea
              id="summary"
              {...field}
              rows={5}
              placeholder="A brief, compelling overview of your skills, experience, and career goals (2-4 sentences recommended)..."
            />
          )}
        />
        {errors.summary && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.summary.message}</p>}
        <p className={cn("text-xs mt-2", appTheme.textMuted)}>
            Tip: Tailor this summary to the type of roles you&apos;re targeting. Highlight your most relevant qualifications.
        </p>
      </div>
    </form>
  );
};

export default PersonalInfoSection;