/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { PlusCircle, Trash2, Sparkles, CalendarDays, Target } from 'lucide-react'; // Added Target icon

const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position/Title is required"),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().min(4, "End date is required (or Present)"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description too long."),
  achievements: z.string().optional(), // Storing as single string for textarea
  targetCompanyValues: z.string().optional(), // <<< NEW FIELD
});

const experienceSchema = z.object({
  experience: z.array(experienceEntrySchema),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

const ExperienceSection: React.FC = () => {
  const { experience, updateExperience: updateStoreExperience, addExperience: addStoreExperience, removeExperience: removeStoreExperience } = useResumeStore();
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);
  const resumeTitle = useResumeStore(state => state.title);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { experience: experience.map(exp => ({ ...exp, achievements: exp.achievements?.join('\n'), targetCompanyValues: exp.targetCompanyValues || '' })) }, // Added targetCompanyValues
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.experience) {
        value.experience.forEach((expData, index) => {
          if (expData) {
            const achievementsArray = expData.achievements?.split('\n').filter(ach => ach.trim() !== '');
            // Also ensure targetCompanyValues is passed to the store if needed, or handle directly from RHF
            updateStoreExperience(index, { ...expData, achievements: achievementsArray });
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreExperience]);

  const handleAddExperience = () => {
    const newId = addStoreExperience(); // Get the ID from the store action
    append({
      id: newId, // Use the ID from the store
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      achievements: '',
      targetCompanyValues: '' // <<< NEW FIELD
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
          jobTitle: currentEntry.position, // Using current position as jobTitle for context
          targetCompanyValues: currentEntry.targetCompanyValues || '', // <<< PASS NEW FIELD
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
    <form className="space-y-8">
      <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-white">Work Experience</h2>
        <Button type="button" variant="outline" size="sm" onClick={handleAddExperience} className="text-white border-white/20 hover:bg-white/10">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {fields.map((item, index) => (
        <div key={item.id} className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg space-y-6 relative">
           <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveExperience(index)}
            className="absolute top-3 right-3 text-red-400 hover:text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <input type="hidden" {...register(`experience.${index}.id`)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor={`experience.${index}.company`}>Company Name</Label>
              <Input id={`experience.${index}.company`} {...register(`experience.${index}.company`)} placeholder="e.g., Tech Solutions Inc." />
              {errors.experience?.[index]?.company && <p className="text-red-400 text-xs mt-1">{errors.experience[index]?.company?.message}</p>}
            </div>
            <div>
              <Label htmlFor={`experience.${index}.position`}>Position / Title</Label>
              <Input id={`experience.${index}.position`} {...register(`experience.${index}.position`)} placeholder="e.g., Software Engineer" />
              {errors.experience?.[index]?.position && <p className="text-red-400 text-xs mt-1">{errors.experience[index]?.position?.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor={`experience.${index}.startDate`}>Start Date</Label>
              <div className="relative">
                <Input id={`experience.${index}.startDate`} {...register(`experience.${index}.startDate`)} placeholder="YYYY-MM" />
                <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.experience?.[index]?.startDate && <p className="text-red-400 text-xs mt-1">{errors.experience[index]?.startDate?.message}</p>}
            </div>
            <div>
              <Label htmlFor={`experience.${index}.endDate`}>End Date (or &quot;Present&quot;)</Label>
               <div className="relative">
                <Input id={`experience.${index}.endDate`} {...register(`experience.${index}.endDate`)} placeholder="YYYY-MM or Present" />
                <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.experience?.[index]?.endDate && <p className="text-red-400 text-xs mt-1">{errors.experience[index]?.endDate?.message}</p>}
            </div>
          </div>

          {/* Target Company Values Input */}
          <div>
            <Label htmlFor={`experience.${index}.targetCompanyValues`}>
                Target Company Keywords/Values (Optional)
            </Label>
            <div className="relative">
                <Input
                    id={`experience.${index}.targetCompanyValues`}
                    {...register(`experience.${index}.targetCompanyValues`)}
                    placeholder="e.g., innovation, customer-centric, agile, specific tech stack"
                    className="pl-10"
                />
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
                Provide comma-separated keywords or values important to the company you&apos;re targeting with this experience.
            </p>
          </div>


          <div>
            <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor={`experience.${index}.description`}>Key Responsibilities</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAiEnhance(index)}
                    disabled={enhancingIndex === index} // Disable button while enhancing this specific entry
                    className="text-purple-400 hover:text-purple-300 text-xs p-1"
                  >
                    {enhancingIndex === index ? (
                        <Sparkles className="w-3.5 h-3.5 mr-1 animate-spin" />
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
              placeholder="Describe your role and key contributions. Start sentences with action verbs."
            />
            {errors.experience?.[index]?.description && <p className="text-red-400 text-xs mt-1">{errors.experience[index]?.description?.message}</p>}
          </div>

          <div>
            <Label htmlFor={`experience.${index}.achievements`}>Quantifiable Achievements (Optional - one per line)</Label>
            <Textarea
              id={`experience.${index}.achievements`}
              {...register(`experience.${index}.achievements`)}
              rows={3}
              placeholder="e.g., Increased sales by 15% in Q3., Led a team of 5 developers."
            />
             <p className="text-xs text-gray-400 mt-1">The AI can help generate or refine these based on your description above.</p>
          </div>
        </div>
      ))}
      {fields.length === 0 && (
        <p className="text-center text-gray-400 py-4">No work experience entries added yet. Click &quot;Add Experience&quot; to start.</p>
      )}
    </form>
  );
};

export default ExperienceSection;