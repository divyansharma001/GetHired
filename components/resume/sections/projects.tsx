// components/resume/sections/projects.tsx
'use client';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResumeStore } from '@/hooks/use-resume';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ProjectEntry } from '@/types/resume';
import { PlusCircle, Trash2, Link as LinkIcon, Github, Sparkles, Loader2, Briefcase } from 'lucide-react'; // Added Briefcase for tip
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';

const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long."),
  technologies: z.string().min(1, "List at least one technology (comma-separated)"),
  url: z.string().url("Please enter a valid URL (e.g., https://example.com)").optional().or(z.literal('')),
  github: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal('')),
});

const projectsSchema = z.object({
  projects: z.array(projectEntrySchema),
});

type ProjectsFormData = z.infer<typeof projectsSchema>;

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
    tipBoxBg: isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200', // Different tip color
    tipBoxText: isDark ? 'text-green-300' : 'text-green-700',
  };
}

const ProjectsSection: React.FC = () => {
  const { projects, updateProject: updateStoreProject, addProject: addStoreProject, removeProject: removeStoreProject } = useResumeStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark);
  const resumeTitle = useResumeStore(state => state.title); // For AI context

  const { control, register, handleSubmit, watch, formState: { errors }, setValue, reset } = useForm<ProjectsFormData>({
    resolver: zodResolver(projectsSchema),
    defaultValues: { projects: [] },
  });

  useEffect(() => {
    const storeProjects = projects.map(proj => ({
      ...proj,
      technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '',
    }));
    reset({ projects: storeProjects });
  }, [projects, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && value.projects) {
        value.projects.forEach((projData, index) => {
          if (projData && fields[index]) {
            const techArray = typeof projData.technologies === 'string'
              ? projData.technologies.split(',').map(t => t.trim()).filter(t => t)
              : []; // Ensure it's an array for the store
            const idToUpdate = projData.id || fields[index].id;
            updateStoreProject(index, {...projData, id: idToUpdate, technologies: techArray});
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateStoreProject, fields]);

  const handleAddProject = () => {
    const newId = addStoreProject();
    append({ 
      id: newId, 
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
      alert("Please provide a project name and a brief description first.");
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
          technologies: typeof currentProject.technologies === 'string' 
            ? currentProject.technologies.split(',').map(t => t.trim()).filter(Boolean) 
            : [],
          resumeTitle: resumeTitle, // Pass resume title for context
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
    <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit(() => {})}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 mb-6 sm:mb-8" style={{borderColor: appTheme.borderSecondary}}>
        <h2 className={cn("text-xl sm:text-2xl font-semibold", appTheme.textHeading)}>Projects</h2>
        <Button type="button" variant="outline" size="sm" onClick={handleAddProject}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

       <div className={cn("p-4 rounded-lg border flex items-start space-x-3", appTheme.tipBoxBg)}>
        <Briefcase className={cn("w-5 h-5 mt-0.5 shrink-0", appTheme.tipBoxText)} />
        <p className={cn("text-sm", appTheme.tipBoxText)}>
          Highlight personal or academic projects that showcase your skills. Briefly describe the project, your role, and the technologies used. Link to live demos or GitHub repos if available.
        </p>
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
                onClick={() => handleRemoveProject(index)}
                className="absolute top-3 right-3 text-red-400 hover:text-destructive hover:bg-destructive/10 w-8 h-8"
                aria-label="Remove project entry"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div>
                <Label htmlFor={`projects.${index}.name`}>Project Name</Label>
                <Input id={`projects.${index}.name`} {...register(`projects.${index}.name`)} placeholder="e.g., Personal Portfolio Website"/>
                {errors.projects?.[index]?.name && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.projects[index]?.name?.message}</p>}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <Label htmlFor={`projects.${index}.description`}>Description</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAiEnhanceProject(index)}
                        disabled={enhancingProjectIndex === index}
                        className={cn("text-xs p-1 flex items-center", appTheme.aiButtonText)}
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
                  placeholder="Describe the project, its purpose, key features, and your contributions."
                />
                {errors.projects?.[index]?.description && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.projects[index]?.description?.message}</p>}
              </div>
              
              <div>
                <Label htmlFor={`projects.${index}.technologies`}>Technologies Used (comma-separated)</Label>
                <Input id={`projects.${index}.technologies`} {...register(`projects.${index}.technologies`)} placeholder="e.g., React, Node.js, MongoDB"/>
                {errors.projects?.[index]?.technologies && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.projects[index]?.technologies?.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                    <Label htmlFor={`projects.${index}.url`}>Project URL (Optional)</Label>
                    <div className="relative">
                        <Input id={`projects.${index}.url`} {...register(`projects.${index}.url`)} placeholder="https://myprojectdemo.com" className="pl-10"/>
                        <LinkIcon className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none", appTheme.iconColor)}/>
                    </div>
                    {errors.projects?.[index]?.url && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.projects[index]?.url?.message}</p>}
                </div>
                <div>
                    <Label htmlFor={`projects.${index}.github`}>GitHub Repository (Optional)</Label>
                    <div className="relative">
                        <Input id={`projects.${index}.github`} {...register(`projects.${index}.github`)} placeholder="https://github.com/yourname/project" className="pl-10"/>
                        <Github className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none", appTheme.iconColor)}/>
                    </div>
                    {errors.projects?.[index]?.github && <p className={cn("text-xs mt-1.5", appTheme.errorText)}>{errors.projects[index]?.github?.message}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cn("text-center py-10 border rounded-xl", appTheme.entryCardBg, appTheme.entryCardBorder)}>
          <PlusCircle className={cn("w-12 h-12 mx-auto mb-4", appTheme.iconColor)} />
          <p className={cn("mb-3 font-medium", appTheme.textHeading)}>No projects added yet.</p>
          <p className={cn("text-sm", appTheme.textMuted)}>Showcase your practical experience by adding relevant projects.</p>
        </div>
      )}
    </form>
  );
};

export default ProjectsSection;