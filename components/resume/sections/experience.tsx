/* eslint-disable @typescript-eslint/no-unused-vars */
// components/resume/sections/experience.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResumeStore } from '@/hooks/use-resume';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExperienceEntry } from '@/types/resume';
import { PlusCircle, Trash2, Sparkles, CalendarDays, Target, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';

const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position/Title is required"),
  startDate: z.string().min(4, "Start date is required (e.g., YYYY-MM)"),
  endDate: z.string().min(4, "End date is required (e.g., YYYY-MM or Present)"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description too long."),
  achievements: z.string().optional(),
  targetCompanyValues: z.string().optional(),
});

const experienceSchema = z.object({
  experience: z.array(experienceEntrySchema),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

// Define AppTheme (or import from a central config)
function getAppTheme(isDark: boolean) {
  return {
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    borderSecondary: isDark ? 'border-neutral-700/50' : 'border-neutral-200',
    errorText: isDark ? 'text-red-400' : 'text-red-500',
    entryCardBg: isDark ? 'bg-neutral-700/30' : 'bg-slate-50',
    entryCardBorder: isDark ? 'border-neutral-600/50' : 'border-slate-200',
    iconColor: isDark ? 'text-neutral-400' : 'text-neutral-500',
    aiButtonText: isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700',
  };
}

const ExperienceSection: React.FC = () => {
  const { experience, updateExperience: updateStoreExperience, addExperience: addStoreExperience, removeExperience: removeStoreExperience } = useResumeStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark);
  
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);
  const resumeTitle = useResumeStore(state => state.title);

  const { control, register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { experience: [] }, // Initialize with empty, populate via useEffect
  });
  
  useEffect(() => {
    const storeExperience = experience.map(exp => ({
      ...exp,
      achievements: exp.achievements?.join('\n') || '',
      targetCompanyValues: exp.targetCompanyValues || '',
    }));
    reset({ experience: storeExperience });
  }, [experience, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && value.experience) {
        value.experience.forEach((expData, index) => {
          if (expData && fields[index]) {
            const achievementsArray = expData.achievements?.split('\n').filter(ach => ach.trim() !== '');
            const idToUpdate = expData.id || fields[index].id;
            updateStoreExperience(index, { ...expData, id: idToUpdate, achievements: achievementsArray });
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreExperience, fields]);

  const handleAddExperience = () => {
    const newId = addStoreExperience();
    append({
      id: newId,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: '',
      targetCompanyValues: ''
    });
  };

  const handleRemoveExperience = (index: number) => {
    const expIdToRemove = fields[index].id;
    removeStoreExperience(expIdToRemove);
    remove(index);
  };

  const handleAiEnhance = async (index: number) => {
    setEnhancingIndex(index);
    const currentEntry = watch(`experience.${index}`);

    if (!currentEntry || !currentEntry.description) {
      alert("Please provide a description for the experience entry first.");
      setEnhancingIndex(null);
      return;
    }

    try {
      const response = await fetch('/api/ai/enhance-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: currentEntry.description,
          achievements: currentEntry.achievements?.split('\n').filter(ach => ach.trim() !== ''),
          title: resumeTitle,
          jobTitle: currentEntry.position,
          targetCompanyValues: currentEntry.targetCompanyValues || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `AI enhancement failed: ${response.statusText}`);
      }
      const enhancedData = await response.json();
      setValue(`experience.${index}.description`, enhancedData.enhancedDescription, { shouldDirty: true, shouldValidate: true });
      setValue(`experience.${index}.achievements`, enhancedData.suggestedAchievements.join('\n'), { shouldDirty: true, shouldValidate: true });
      alert("Experience enhanced! Review the changes and the suggested achievements.");
    } catch (error) {
      console.error("AI Enhancement error:", error);
      alert(`AI Enhancement failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setEnhancingIndex(null);
    }
  };

  return (
    <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit(() => {})}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 mb-6 sm:mb-8" style={{borderColor: appTheme.borderSecondary}}>
        <h2 className={cn("text-xl sm:text-2xl font-semibold", appTheme.textHeading)}>Work Experience</h2>
        <Button type="button" variant="outline" size="sm" onClick={handleAddExperience}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {fields.length > 0 ? (
        <div className="space-y-6">
          {fields.map((item, index) => (
            <div 
              key={item.id} 
              className={cn(
                "p-5 sm:p-6 rounded-xl border space-y-5 sm:space-y-6 relative",
                appTheme.entryCardBg,
                appTheme.entryCardBorder
              )}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveExperience(index)}
                className="absolute top-3 right-3 text-red-400 hover:text-destructive hover:bg-destructive/10 w-8 h-8"
                aria-label="Remove experience entry"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <Label htmlFor={`experience.${index}.company`}>Company Name</Label>
                  <Input id={`experience.${index}.company`} {...register(`experience.${index}.company`)} placeholder="e.g., Tech Solutions Inc." />
                  {errors.experience?.[index]?.company && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.experience[index]?.company?.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`experience.${index}.position`}>Position / Title</Label>
                  <Input id={`experience.${index}.position`} {...register(`experience.${index}.position`)} placeholder="e.g., Software Engineer" />
                  {errors.experience?.[index]?.position && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.experience[index]?.position?.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <Label htmlFor={`experience.${index}.startDate`}>Start Date</Label>
                  <div className="relative">
                    <Input id={`experience.${index}.startDate`} {...register(`experience.${index}.startDate`)} placeholder="YYYY-MM" className="pr-10" />
                    <CalendarDays className={cn("absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none", appTheme.iconColor)} />
                  </div>
                  {errors.experience?.[index]?.startDate && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.experience[index]?.startDate?.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`experience.${index}.endDate`}>End Date (or &quot;Present&quot;)</Label>
                  <div className="relative">
                    <Input id={`experience.${index}.endDate`} {...register(`experience.${index}.endDate`)} placeholder="YYYY-MM or Present" className="pr-10" />
                    <CalendarDays className={cn("absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none", appTheme.iconColor)} />
                  </div>
                  {errors.experience?.[index]?.endDate && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.experience[index]?.endDate?.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor={`experience.${index}.targetCompanyValues`}>
                    Target Company Keywords/Values (Optional)
                </Label>
                <div className="relative">
                    <Input
                        id={`experience.${index}.targetCompanyValues`}
                        {...register(`experience.${index}.targetCompanyValues`)}
                        placeholder="e.g., innovation, customer-centric, agile"
                        className="pl-10" // Make space for icon
                    />
                    <Target className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none", appTheme.iconColor)} />
                </div>
                <p className={cn("text-xs text-gray-400 mt-1", appTheme.textMuted)}>
                    Comma-separated keywords. AI will use these to tailor enhancement.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <Label htmlFor={`experience.${index}.description`}>Key Responsibilities & Description</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAiEnhance(index)}
                        disabled={enhancingIndex === index}
                        className={cn("text-xs p-1 flex items-center", appTheme.aiButtonText)}
                    >
                        {enhancingIndex === index ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                        )}
                        AI Enhance Description & Achievements
                    </Button>
                </div>
                <Textarea
                  id={`experience.${index}.description`}
                  {...register(`experience.${index}.description`)}
                  rows={4}
                  placeholder="Describe your role, responsibilities, and key contributions. Start sentences with action verbs for impact."
                />
                {errors.experience?.[index]?.description && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.experience[index]?.description?.message}</p>}
              </div>

              <div>
                <Label htmlFor={`experience.${index}.achievements`}>Quantifiable Achievements (Optional - one per line)</Label>
                <Textarea
                  id={`experience.${index}.achievements`}
                  {...register(`experience.${index}.achievements`)}
                  rows={3}
                  placeholder="e.g., Increased sales by 15% in Q3 by implementing X strategy."
                />
                <p className={cn("text-xs mt-2", appTheme.textMuted)}>
                  AI can help generate or refine these based on your description above. Focus on impact and numbers.
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
         <div className={cn("text-center py-10 border rounded-xl", appTheme.entryCardBg, appTheme.entryCardBorder)}>
          <PlusCircle className={cn("w-12 h-12 mx-auto mb-4", appTheme.iconColor)} />
          <p className={cn("mb-3 font-medium", appTheme.textHeading)}>No work experience added yet.</p>
          <p className={cn("text-sm", appTheme.textMuted)}>Showcase your professional journey by adding your roles.</p>
        </div>
      )}
    </form>
  );
};

export default ExperienceSection;