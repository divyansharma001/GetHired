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
import { Select } from '@/components/ui/select'; // Using our new Select component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SkillEntry } from '@/types/resume';
import { PlusCircle, Trash2, Lightbulb } from 'lucide-react';

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

const SkillsSection: React.FC = () => {
  const { skills, updateSkill: updateStoreSkill, addSkill: addStoreSkill, removeSkill: removeStoreSkill } = useResumeStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: { skills },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.skills) {
        value.skills.forEach((skillData, index) => {
          if (skillData) {
            updateStoreSkill(index, skillData);
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreSkill]);

  const handleAddSkill = () => {
    addStoreSkill();
    append({ 
      id: `temp-${Date.now()}`, 
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
    <form className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-white">Skills</h2>
        <Button type="button" variant="outline" size="sm" onClick={handleAddSkill} className="text-white border-white/20 hover:bg-white/10">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>
      
      <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-300">
            List both technical (e.g., Python, React, AWS) and soft skills (e.g., Communication, Teamwork). 
            Tailor these to the jobs you&apos;re applying for.
          </p>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((item, index) => (
            <div key={item.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4 relative">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSkill(index)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-7 h-7"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>

                <input type="hidden" {...register(`skills.${index}.id`)} />
                
                <div>
                    <Label htmlFor={`skills.${index}.name`}>Skill Name</Label>
                    <Input id={`skills.${index}.name`} {...register(`skills.${index}.name`)} placeholder="e.g., JavaScript" />
                    {errors.skills?.[index]?.name && <p className="text-red-400 text-xs mt-1">{errors.skills[index]?.name?.message}</p>}
                </div>

                <div>
                    <Label htmlFor={`skills.${index}.level`}>Proficiency Level</Label>
                    <Controller
                        name={`skills.${index}.level`}
                        control={control}
                        render={({ field }) => (
                            <Select id={`skills.${index}.level`} {...field}>
                                {skillLevels.map(level => <option key={level} value={level}>{level}</option>)}
                            </Select>
                        )}
                    />
                    {errors.skills?.[index]?.level && <p className="text-red-400 text-xs mt-1">{errors.skills[index]?.level?.message}</p>}
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
                    {errors.skills?.[index]?.category && <p className="text-red-400 text-xs mt-1">{errors.skills[index]?.category?.message}</p>}
                </div>
            </div>
            ))}
        </div>
      )}

      {fields.length === 0 && (
        <p className="text-center text-gray-400 py-4">No skills added yet. Click &quot;Add Skill&quot; to start.</p>
      )}
    </form>
  );
};

export default SkillsSection;