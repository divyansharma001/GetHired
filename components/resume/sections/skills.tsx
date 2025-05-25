/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { PlusCircle, Trash2, Lightbulb, Star } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
const skillCategories = ['Technical', 'Soft', 'Language', 'Other'] as const;

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

function getAppTheme(isDark: boolean) {
  return {
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    borderSecondary: isDark ? 'border-neutral-700/50' : 'border-neutral-200',
    errorText: isDark ? 'text-red-400' : 'text-red-500',
    entryCardBg: isDark ? 'bg-neutral-700/40' : 'bg-slate-100',
    entryCardBorder: isDark ? 'border-neutral-600/60' : 'border-slate-300',
    iconColor: isDark ? 'text-neutral-400' : 'text-neutral-500',
    tipBoxBg: isDark ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200',
    tipBoxText: isDark ? 'text-blue-300' : 'text-blue-700',
  };
}

const SkillsSection: React.FC = () => {
  const { 
    skills: storeSkills, 
    updateSkill: updateStoreSkill, 
    addSkill: addStoreSkill, 
    removeSkill: removeStoreSkill 
  } = useResumeStore();
  
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark);

  const { control, register, handleSubmit, watch, formState: { errors }, reset } = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: { skills: storeSkills || [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  useEffect(() => {
    // No complex mapping needed as store and RHF structures are aligned for skills
    if (JSON.stringify(storeSkills) !== JSON.stringify(watch("skills"))) {
      reset({ skills: storeSkills || [] });
    }
  }, [storeSkills, reset, watch]);

  const debouncedUpdateStore = useDebouncedCallback(
    (skillsArrayFromForm: SkillsFormData['skills']) => {
      skillsArrayFromForm.forEach((skillData, index) => {
        const idToUpdate = skillData.id || (fields[index] ? fields[index].id : undefined);
        if (idToUpdate) {
          updateStoreSkill(index, { ...skillData, id: idToUpdate });
        }
      });
    },
    500
  );

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name && name.startsWith('skills') && type === 'change' && value.skills) {
        // Filter out undefined entries and ensure all required properties are present
        const validSkills = value.skills.filter((skill): skill is { id: string; name: string; level: typeof skillLevels[number]; category: typeof skillCategories[number] } => 
          skill !== undefined && 
          typeof skill.id === 'string' && 
          typeof skill.name === 'string' && 
          skillLevels.includes(skill.level as any) && 
          skillCategories.includes(skill.category as any)
        );
        debouncedUpdateStore(validSkills);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedUpdateStore, fields]);

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

  // For shadcn/ui Select, the path to components/ui/select might need adjustment
  // Also, ensure the Select component from ui/select is compatible with RHF Controller
  // The original had a custom <Select> which was basically a native <select>.
  // If using shadcn, Controller is the way.
  // Let's assume a basic Select component for now or if you are using shadcn's Select, ensure it's correctly imported and used with Controller.
  // For simplicity and to match existing usage, I'll revert to the previous Select behavior that wraps a native select.
  // If you intended to use shadcn's Select, the Controller usage would be:
  // <Controller
  //   name={`skills.${index}.level`}
  //   control={control}
  //   render={({ field }) => (
  //     <Select onValueChange={field.onChange} defaultValue={field.value}>
  //       <SelectTrigger id={`skills.${index}.level`} className="pr-10">
  //         <SelectValue placeholder="Select level" />
  //       </SelectTrigger>
  //       <SelectContent>
  //         {skillLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
  //       </SelectContent>
  //     </Select>
  //   )}
  // />

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
                    "p-4 rounded-lg border space-y-4 relative",
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
                       {/* Using simple HTML select for RHF integration, assuming components/ui/select is this */}
                        <Controller
                            name={`skills.${index}.level`}
                            control={control}
                            render={({ field }) => (
                                <select {...field} id={`skills.${index}.level`} className={cn("flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 pr-10")}>
                                    {skillLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                </select>
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
                            <select {...field} id={`skills.${index}.category`} className={cn("flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50")}>
                                {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
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