/* eslint-disable @typescript-eslint/no-unused-vars */
// components/resume/sections/education.tsx
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
import { EducationEntry } from '@/types/resume';
import { PlusCircle, Trash2, CalendarDays } from 'lucide-react';
import { useTheme } from '@/context/theme-provider'; // Import useTheme
import { cn } from '@/lib/utils'; // Import cn

const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(4, "Start date is required (e.g., YYYY or YYYY-MM)"),
  endDate: z.string().min(4, "End date is required (e.g., YYYY, YYYY-MM or Present)"),
  gpa: z.string().optional(),
  achievements: z.string().optional(),
});

const educationSchema = z.object({
  education: z.array(educationEntrySchema),
});

type EducationFormData = z.infer<typeof educationSchema>;

// Define AppTheme directly for this component (or import from a central config)
function getAppTheme(isDark: boolean) {
  return {
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    borderSecondary: isDark ? 'border-neutral-700/50' : 'border-neutral-200',
    errorText: isDark ? 'text-red-400' : 'text-red-500',
    // Styles for individual entry cards/sections
    entryCardBg: isDark ? 'bg-neutral-700/30' : 'bg-slate-50',
    entryCardBorder: isDark ? 'border-neutral-600/50' : 'border-slate-200',
    iconColor: isDark ? 'text-neutral-400' : 'text-neutral-500',
  };
}

const EducationSection: React.FC = () => {
  const { education, updateEducation: updateStoreEducation, addEducation: addStoreEducation, removeEducation: removeStoreEducation } = useResumeStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark);

  const { control, register, handleSubmit, watch, formState: { errors }, reset } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: { education: [] }, // Initialize with empty array, then populate via useEffect
  });

  useEffect(() => {
    // Populate RHF with data from Zustand store when component mounts or store data changes
    const storeEducation = education.map(edu => ({
      ...edu,
      achievements: edu.achievements?.join('\n') || '',
    }));
    reset({ education: storeEducation });
  }, [education, reset]);


  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && value.education) { // Only update store on actual field changes
        value.education.forEach((eduData, index) => {
          if (eduData && fields[index]) { // Ensure field exists
            const achievementsArray = eduData.achievements?.split('\n').filter(ach => ach.trim() !== '');
            // Ensure ID is preserved from RHF 'fields' if `eduData.id` is undefined (can happen if RHF adds temp ID)
            const idToUpdate = eduData.id || fields[index].id;
            updateStoreEducation(index, { ...eduData, id: idToUpdate, achievements: achievementsArray });
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreEducation, fields]);

  const handleAddEducation = () => {
    const newId = addStoreEducation(); // Add to store, get new ID
    append({ 
      id: newId, // Use the ID from the store
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
    const eduIdToRemove = fields[index].id;
    removeStoreEducation(eduIdToRemove); // Remove from Zustand store by actual ID
    remove(index); // Remove from RHF field array
  };

  return (
    <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit(() => {})}> {/* Added dummy onSubmit to satisfy RHF */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 mb-6 sm:mb-8" style={{borderColor: appTheme.borderSecondary}}>
        <h2 className={cn("text-xl sm:text-2xl font-semibold", appTheme.textHeading)}>Education</h2>
        <Button type="button" variant="outline" size="sm" onClick={handleAddEducation}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Education
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
                onClick={() => handleRemoveEducation(index)}
                className="absolute top-3 right-3 text-red-400 hover:text-destructive hover:bg-destructive/10 w-8 h-8"
                aria-label="Remove education entry"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              {/* RHF Controller does not need register for id, it's part of the field object */}
              {/* <input type="hidden" {...register(`education.${index}.id`)} /> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <Label htmlFor={`education.${index}.institution`}>Institution Name</Label>
                  <Input id={`education.${index}.institution`} {...register(`education.${index}.institution`)} placeholder="e.g., University of Example" />
                  {errors.education?.[index]?.institution && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.education[index]?.institution?.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`education.${index}.degree`}>Degree</Label>
                  <Input id={`education.${index}.degree`} {...register(`education.${index}.degree`)} placeholder="e.g., Bachelor of Science" />
                  {errors.education?.[index]?.degree && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.education[index]?.degree?.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor={`education.${index}.field`}>Field of Study / Major</Label>
                <Input id={`education.${index}.field`} {...register(`education.${index}.field`)} placeholder="e.g., Computer Science" />
                {errors.education?.[index]?.field && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.education[index]?.field?.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <Label htmlFor={`education.${index}.startDate`}>Start Date</Label>
                  <div className="relative">
                    <Input id={`education.${index}.startDate`} {...register(`education.${index}.startDate`)} placeholder="YYYY or YYYY-MM" className="pr-10" />
                    <CalendarDays className={cn("absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none", appTheme.iconColor)} />
                  </div>
                  {errors.education?.[index]?.startDate && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.education[index]?.startDate?.message}</p>}
                </div>
                <div>
                  <Label htmlFor={`education.${index}.endDate`}>End Date (or &quot;Present&quot;)</Label>
                  <div className="relative">
                    <Input id={`education.${index}.endDate`} {...register(`education.${index}.endDate`)} placeholder="YYYY, YYYY-MM or Present" className="pr-10" />
                    <CalendarDays className={cn("absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none", appTheme.iconColor)} />
                  </div>
                  {errors.education?.[index]?.endDate && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.education[index]?.endDate?.message}</p>}
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
                <p className={cn("text-xs mt-2", appTheme.textMuted)}>List key accomplishments or relevant coursework. Each on a new line for bullet points in the resume.</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cn("text-center py-10 border rounded-xl", appTheme.entryCardBg, appTheme.entryCardBorder)}>
          <PlusCircle className={cn("w-12 h-12 mx-auto mb-4", appTheme.iconColor)} />
          <p className={cn("mb-3 font-medium", appTheme.textHeading)}>No education entries added yet.</p>
          <p className={cn("text-sm", appTheme.textMuted)}>Click &quot;Add Education&quot; to start building your academic history.</p>
        </div>
      )}
    </form>
  );
};

export default EducationSection;