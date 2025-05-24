/* eslint-disable @typescript-eslint/no-unused-vars */
// components/resume/sections/education.tsx
'use client';
import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResumeStore } from '@/hooks/use-resume';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EducationEntry } from '@/types/resume';
import { PlusCircle, Trash2, CalendarDays } from 'lucide-react';

const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(4, "Start date is required (e.g., YYYY or YYYY-MM)"),
  endDate: z.string().min(4, "End date is required (e.g., YYYY, YYYY-MM or Present)"),
  gpa: z.string().optional(),
  achievements: z.string().optional(), // Storing as single string, can be split later
});

const educationSchema = z.object({
  education: z.array(educationEntrySchema),
});

type EducationFormData = z.infer<typeof educationSchema>;

const EducationSection: React.FC = () => {
  const { education, updateEducation: updateStoreEducation, addEducation: addStoreEducation, removeEducation: removeStoreEducation } = useResumeStore();

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: { education: education.map(edu => ({ ...edu, achievements: edu.achievements?.join('\n') })) }, // Join achievements for textarea
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  // Sync with Zustand store
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.education) {
        value.education.forEach((eduData, index) => {
          if (eduData) {
            // Convert achievements string back to array for store if necessary, or handle in store
            const achievementsArray = eduData.achievements?.split('\n').filter(ach => ach.trim() !== '');
            updateStoreEducation(index, { ...eduData, achievements: achievementsArray });
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreEducation]);

  const handleAddEducation = () => {
    addStoreEducation(); // Add to store first
    append({ 
      id: `temp-${Date.now()}`, // Generate a temporary ID
      institution: '', 
      degree: '', 
      field: '', 
      startDate: '', 
      endDate: '', 
      gpa: '', 
      achievements: '' 
    });
  };

  const handleRemoveEducation = (index: number) => {
    const eduIdToRemove = fields[index].id; // Get the actual ID of the item
    removeStoreEducation(eduIdToRemove); // Remove from Zustand store by ID
    remove(index); // Remove from RHF field array
  };


  return (
    <form className="space-y-8">
      <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-white">Education</h2>
        <Button type="button" variant="outline" size="sm" onClick={handleAddEducation} className="text-white border-white/20 hover:bg-white/10">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>

      {fields.map((item, index) => (
        <div key={item.id} className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg space-y-6 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveEducation(index)}
            className="absolute top-3 right-3 text-red-400 hover:text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <input type="hidden" {...register(`education.${index}.id`)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor={`education.${index}.institution`}>Institution Name</Label>
              <Input id={`education.${index}.institution`} {...register(`education.${index}.institution`)} placeholder="e.g., University of Example" />
              {errors.education?.[index]?.institution && <p className="text-red-400 text-xs mt-1">{errors.education[index]?.institution?.message}</p>}
            </div>
            <div>
              <Label htmlFor={`education.${index}.degree`}>Degree</Label>
              <Input id={`education.${index}.degree`} {...register(`education.${index}.degree`)} placeholder="e.g., Bachelor of Science" />
              {errors.education?.[index]?.degree && <p className="text-red-400 text-xs mt-1">{errors.education[index]?.degree?.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor={`education.${index}.field`}>Field of Study / Major</Label>
            <Input id={`education.${index}.field`} {...register(`education.${index}.field`)} placeholder="e.g., Computer Science" />
            {errors.education?.[index]?.field && <p className="text-red-400 text-xs mt-1">{errors.education[index]?.field?.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor={`education.${index}.startDate`}>Start Date</Label>
              <div className="relative">
                <Input id={`education.${index}.startDate`} {...register(`education.${index}.startDate`)} placeholder="YYYY or YYYY-MM" />
                <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.education?.[index]?.startDate && <p className="text-red-400 text-xs mt-1">{errors.education[index]?.startDate?.message}</p>}
            </div>
            <div>
              <Label htmlFor={`education.${index}.endDate`}>End Date (or &quot;Present&quot;)</Label>
              <div className="relative">
                <Input id={`education.${index}.endDate`} {...register(`education.${index}.endDate`)} placeholder="YYYY, YYYY-MM or Present" />
                <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.education?.[index]?.endDate && <p className="text-red-400 text-xs mt-1">{errors.education[index]?.endDate?.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor={`education.${index}.gpa`}>GPA (Optional)</Label>
            <Input id={`education.${index}.gpa`} {...register(`education.${index}.gpa`)} placeholder="e.g., 3.8/4.0" />
          </div>

          <div>
            <Label htmlFor={`education.${index}.achievements`}>Key Achievements/Coursework (Optional - one per line)</Label>
            <Textarea
              id={`education.${index}.achievements`}
              {...register(`education.${index}.achievements`)}
              rows={3}
              placeholder="e.g., Dean's List, Relevant projects, Thesis title"
            />
            <p className="text-xs text-gray-400 mt-1">List key accomplishments or relevant coursework. Each on a new line.</p>
          </div>
        </div>
      ))}
      {fields.length === 0 && (
        <p className="text-center text-gray-400 py-4">No education entries added yet. Click &quot;Add Education&quot; to start.</p>
      )}
    </form>
  );
};

export default EducationSection;