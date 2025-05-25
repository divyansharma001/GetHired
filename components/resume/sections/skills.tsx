// components/resume/sections/skills.tsx
'use client';
import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResumeStore } from '@/hooks/use-resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SkillEntry } from '@/types/resume';
import { PlusCircle, Trash2, Lightbulb, Star } from 'lucide-react'; // Added Star for proficiency
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';

const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
const skillCategories = ['Technical', 'Soft', 'Language', 'Other'] as const; // Match SkillEntry type

const skillEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name is required"),
  level: z.enum(skillLevels),
  category: z.enum(skillCategories),
});

const skillsSchema = z.object({
  skills: z.array(skillEntrySchema),
});

type SkillsFormData = z.infer<typeof skillsSchema>;

// Define AppTheme (or import from a central config)
function getAppTheme(isDark: boolean) {
  return {
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    borderSecondary: isDark ? 'border-neutral-700/50' : 'border-neutral-200',
    errorText: isDark ? 'text-red-400' : 'text-red-500',
    entryCardBg: isDark ? 'bg-neutral-700/40' : 'bg-slate-100', // Slightly more subtle for skills
    entryCardBorder: isDark ? 'border-neutral-600/60' : 'border-slate-300',
    iconColor: isDark ? 'text-neutral-400' : 'text-neutral-500',
    tipBoxBg: isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200',
    tipBoxText: isDark ? 'text-blue-300' : 'text-blue-700',
  };
}


const SkillsSection: React.FC = () => {
  const { skills, updateSkill: updateStoreSkill, addSkill: addStoreSkill, removeSkill: removeStoreSkill } = useResumeStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark);

  const { control, register, handleSubmit, watch, formState: { errors }, reset } = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: { skills: [] },
  });

  useEffect(() => {
    reset({ skills: skills || [] }); // Populate RHF from store
  }, [skills, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && value.skills) {
        value.skills.forEach((skillData, index) => {
          if (skillData && fields[index]) {
            const idToUpdate = skillData.id || fields[index].id;
            updateStoreSkill(index, { ...skillData, id: idToUpdate });
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreSkill, fields]);

  const handleAddSkill = () => {
    const newId = addStoreSkill();
    append({ 
      id: newId, 
      name: '', 
      level: 'Intermediate', 
      category: 'Technical' 
    });
  };
  
  const handleRemoveSkill = (index: number) => {
    const skillIdToRemove = fields[index].id;
    removeStoreSkill(skillIdToRemove);
    remove(index);
  };

  return (
    <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit(() => {})}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 mb-6 sm:mb-8" style={{borderColor: appTheme.borderSecondary}}>
        <h2 className={cn("text-xl sm:text-2xl font-semibold", appTheme.textHeading)}>Skills</h2>
        <Button type="button" variant="outline" size="sm" onClick={handleAddSkill}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>
      
      <div className={cn("p-4 rounded-lg border flex items-start space-x-3", appTheme.tipBoxBg)}>
        <Lightbulb className={cn("w-5 h-5 mt-0.5 shrink-0", appTheme.tipBoxText)} />
        <p className={cn("text-sm", appTheme.tipBoxText)}>
          Showcase a mix of technical, soft, and tool-specific skills. Tailor these to the job descriptions you&apos;re targeting for best ATS compatibility.
        </p>
      </div>

      {fields.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {fields.map((item, index) => (
            <div 
                key={item.id} 
                className={cn(
                    "p-4 rounded-lg border space-y-4 relative", // Reduced padding for skill cards
                    appTheme.entryCardBg,
                    appTheme.entryCardBorder
                )}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSkill(index)}
                    className="absolute top-2 right-2 text-red-400 hover:text-destructive hover:bg-destructive/10 w-7 h-7"
                    aria-label="Remove skill entry"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
                
                <div>
                    <Label htmlFor={`skills.${index}.name`}>Skill Name</Label>
                    <Input id={`skills.${index}.name`} {...register(`skills.${index}.name`)} placeholder="e.g., JavaScript" />
                    {errors.skills?.[index]?.name && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.skills[index]?.name?.message}</p>}
                </div>

                <div>
                    <Label htmlFor={`skills.${index}.level`}>Proficiency Level</Label>
                    <div className="relative">
                        <Controller
                            name={`skills.${index}.level`}
                            control={control}
                            render={({ field }) => (
                                <Select id={`skills.${index}.level`} {...field} className="pr-10">
                                    {skillLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                </Select>
                            )}
                        />
                        <Star className={cn("absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none", appTheme.iconColor)} />
                    </div>
                    {errors.skills?.[index]?.level && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.skills[index]?.level?.message}</p>}
                </div>
                
                <div>
                    <Label htmlFor={`skills.${index}.category`}>Category</Label>
                     <Controller
                        name={`skills.${index}.category`}
                        control={control}
                        render={({ field }) => (
                            <Select id={`skills.${index}.category`} {...field}>
                                {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Select>
                        )}
                    />
                    {errors.skills?.[index]?.category && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.skills[index]?.category?.message}</p>}
                </div>
            </div>
            ))}
        </div>
      ) : (
        <div className={cn("text-center py-10 border rounded-xl", appTheme.entryCardBg, appTheme.entryCardBorder)}>
          <PlusCircle className={cn("w-12 h-12 mx-auto mb-4", appTheme.iconColor)} />
          <p className={cn("mb-3 font-medium", appTheme.textHeading)}>No skills added yet.</p>
          <p className={cn("text-sm", appTheme.textMuted)}>Highlight your expertise by adding relevant skills.</p>
        </div>
      )}
    </form>
  );
};

export default SkillsSection;