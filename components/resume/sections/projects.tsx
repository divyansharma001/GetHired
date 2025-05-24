/* eslint-disable @typescript-eslint/no-unused-vars */
// components/resume/sections/projects.tsx
'use client';
import React, { useEffect, useState } from 'react'; // Added useState
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResumeStore } from '@/hooks/use-resume';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProjectEntry } from '@/types/resume';
import { PlusCircle, Trash2, LinkIcon, Github, Sparkles, Loader2 } from 'lucide-react'; // Added Sparkles, Loader2


const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long."),
  technologies: z.string().min(1, "List at least one technology"), // Storing as comma-separated string for input
  url: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
});

const projectsSchema = z.object({
  projects: z.array(projectEntrySchema),
});

type ProjectsFormData = z.infer<typeof projectsSchema>;

const ProjectsSection: React.FC = () => {
  const { projects, updateProject: updateStoreProject, addProject: addStoreProject, removeProject: removeStoreProject } = useResumeStore();

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<ProjectsFormData>({
    resolver: zodResolver(projectsSchema),
    defaultValues: { projects: projects.map(proj => ({...proj, technologies: proj.technologies.join(', ')})) },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.projects) {
        value.projects.forEach((projData, index) => {
          if (projData && projData.technologies) {
            const techArray = projData.technologies.split(',').map(t => t.trim()).filter(t => t);
            updateStoreProject(index, {...projData, technologies: techArray});
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreProject]);

  const handleAddProject = () => {
    addStoreProject();
    append({ 
      id: `temp-${Date.now()}`, 
      name: '', 
      description: '', 
      technologies: '', 
      url: '', 
      github: '' 
    });
  };

  const handleRemoveProject = (index: number) => {
    const projIdToRemove = fields[index].id;
    removeStoreProject(projIdToRemove);
    remove(index);
  };

  
  const [enhancingProjectIndex, setEnhancingProjectIndex] = useState<number | null>(null);

  

    const handleAiEnhanceProject = async (index: number) => {
    const currentProject = watch(`projects.${index}`);
    if (!currentProject || !currentProject.name || !currentProject.description) {
      alert("Please provide a project name and description first.");
      return;
    }
    setEnhancingProjectIndex(index);
    try {
      const response = await fetch('/api/ai/enhance-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: currentProject.name,
          currentDescription: currentProject.description,
          technologies: typeof currentProject.technologies === 'string' ? currentProject.technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `AI project enhancement failed: ${response.statusText}`);
      }
      const { enhancedDescription } = await response.json();
      setValue(`projects.${index}.description`, enhancedDescription, { shouldDirty: true, shouldValidate: true });
      alert("Project description enhanced by AI! Please review.");
    } catch (error) {
      console.error("AI Project Enhancement error:", error);
      alert(`AI Project Enhancement failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setEnhancingProjectIndex(null);
    }
  };


  return (
    <form className="space-y-8">
      {/* ... (Add Project button section) ... */}
      <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-6"><h2 className="text-2xl font-semibold text-white">Projects</h2><Button type="button" variant="outline" size="sm" onClick={handleAddProject} className="text-white border-white/20 hover:bg-white/10"><PlusCircle className="w-4 h-4 mr-2" />Add Project</Button></div>

      {fields.map((item, index) => (
        <div key={item.id} className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg space-y-6 relative">
          {/* ... (Remove button and project name field) ... */}
          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveProject(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></Button>
          <input type="hidden" {...register(`projects.${index}.id`)} />
          <div><Label htmlFor={`projects.${index}.name`}>Project Name</Label><Input id={`projects.${index}.name`} {...register(`projects.${index}.name`)} placeholder="e.g., AI Resume Builder"/>{errors.projects?.[index]?.name && <p className="text-red-400 text-xs mt-1">{errors.projects[index]?.name?.message}</p>}</div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor={`projects.${index}.description`}>Description</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAiEnhanceProject(index)}
                    disabled={enhancingProjectIndex === index}
                    className="text-purple-400 hover:text-purple-300 text-xs p-1"
                >
                    {enhancingProjectIndex === index ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                    )}
                    AI Enhance
                </Button>
            </div>
            <Textarea
              id={`projects.${index}.description`}
              {...register(`projects.${index}.description`)}
              rows={3}
              placeholder="Briefly describe the project, its purpose, and your role."
            />
            {errors.projects?.[index]?.description && <p className="text-red-400 text-xs mt-1">{errors.projects[index]?.description?.message}</p>}
          </div>
          
          {/* ... (Technologies, URL, GitHub fields) ... */}
          <div><Label htmlFor={`projects.${index}.technologies`}>Technologies Used (comma-separated)</Label><Input id={`projects.${index}.technologies`} {...register(`projects.${index}.technologies`)} placeholder="e.g., Next.js, Tailwind CSS, OpenAI API"/>{errors.projects?.[index]?.technologies && <p className="text-red-400 text-xs mt-1">{errors.projects[index]?.technologies?.message}</p>}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><Label htmlFor={`projects.${index}.url`}>Project URL (Optional)</Label><div className="relative"><Input id={`projects.${index}.url`} {...register(`projects.${index}.url`)} placeholder="https://example.com"/><LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/></div>{errors.projects?.[index]?.url && <p className="text-red-400 text-xs mt-1">{errors.projects[index]?.url?.message}</p>}</div><div><Label htmlFor={`projects.${index}.github`}>GitHub Repository (Optional)</Label><div className="relative"><Input id={`projects.${index}.github`} {...register(`projects.${index}.github`)} placeholder="https://github.com/user/repo"/><Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/></div>{errors.projects?.[index]?.github && <p className="text-red-400 text-xs mt-1">{errors.projects[index]?.github?.message}</p>}</div></div>
        </div>
      ))}
      {/* ... (Empty state) ... */}
      {fields.length === 0 && (<p className="text-center text-gray-400 py-4">No projects added yet. Click &quot;Add Project&quot; to showcase your work.</p>)}
    </form>
  );
};

export default ProjectsSection;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setValue(arg0: string, enhancedDescription: any, arg2: { shouldDirty: boolean; shouldValidate: boolean; }) {
  throw new Error('Function not implemented.');
}
