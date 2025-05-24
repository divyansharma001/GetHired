/* eslint-disable @typescript-eslint/no-unused-vars */
// components/resume/sections/experience.tsx
'use client';
import React, { useEffect } from 'react';
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
import { PlusCircle, Trash2, Sparkles, CalendarDays } from 'lucide-react';

const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position/Title is required"),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().min(4, "End date is required (or Present)"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description too long."),
  // enhancedDescription: z.string().optional(), // AI will handle this
  achievements: z.string().optional(), // Storing as single string for textarea
});

const experienceSchema = z.object({
  experience: z.array(experienceEntrySchema),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

const ExperienceSection: React.FC = () => {
  const { experience, updateExperience: updateStoreExperience, addExperience: addStoreExperience, removeExperience: removeStoreExperience } = useResumeStore();

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { experience: experience.map(exp => ({ ...exp, achievements: exp.achievements?.join('\n') })) },
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
            updateStoreExperience(index, { ...expData, achievements: achievementsArray });
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreExperience]);

  const handleAddExperience = () => {
    addStoreExperience();
    append({ 
      id: `temp-${Date.now()}`, 
      company: '', 
      position: '', 
      startDate: '', 
      endDate: '', 
      description: '',
      achievements: ''
    });
  };
  
  const handleRemoveExperience = (index: number) => {
    const expIdToRemove = fields[index].id;
    removeStoreExperience(expIdToRemove);
    remove(index);
  };

  const handleAiEnhance = async (index: number) => {
    const currentDescription = watch(`experience.${index}.description`);
    // TODO: API call to /api/ai/enhance-experience
    // For now, simulate an AI enhancement
    alert(`AI Enhancement for description at index ${index} to be implemented. Current: ${currentDescription}`);
    const enhanced = `${currentDescription} (✨ AI Enhanced!)`; 
    setValue(`experience.${index}.description`, enhanced); // Update RHF form
    // Store update will happen via the watch effect
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

          <div>
            <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor={`experience.${index}.description`}>Key Responsibilities & Achievements</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleAiEnhance(index)} className="text-purple-400 hover:text-purple-300 text-xs p-1">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    AI Enhance
                </Button>
            </div>
            <Textarea
              id={`experience.${index}.description`}
              {...register(`experience.${index}.description`)}
              rows={4}
              placeholder="Describe your role and key contributions. Start sentences with action verbs."
            />
            {errors.experience?.[index]?.description && <p className="text-red-400 text-xs mt-1">{errors.experience[index]?.description?.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Use bullet points for achievements if preferred (AI can help format this later).</p>
          </div>

          <div>
            <Label htmlFor={`experience.${index}.achievements`}>Quantifiable Achievements (Optional - one per line)</Label>
            <Textarea
              id={`experience.${index}.achievements`}
              {...register(`experience.${index}.achievements`)}
              rows={3}
              placeholder="e.g., Increased sales by 15% in Q3., Led a team of 5 developers."
            />
             <p className="text-xs text-gray-400 mt-1">Focus on measurable results. AI can help phrase these later.</p>
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