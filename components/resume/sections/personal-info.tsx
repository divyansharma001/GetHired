// components/resume/sections/personal-info.tsx
'use client';
import React, { useState } from 'react'; // Added useState
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResumeStore } from '@/hooks/use-resume';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Import Button
import { PersonalInfo } from '@/types/resume';
import { Sparkles, Loader2 } from 'lucide-react'; // Import Sparkles and Loader2

// Zod schema for validation
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  summary: z.string().min(20, "Summary should be at least 20 characters").max(1000, "Summary too long"),
});

const PersonalInfoSection: React.FC = () => {
  const { personalInfo, updatePersonalInfo } = useResumeStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: personalInfo,
  });

  // Watch for changes and update Zustand store (debounced or onBlur would be better for performance)
  React.useEffect(() => {
    const subscription = watch((value) => {
      updatePersonalInfo(value as PersonalInfo);
    });
    return () => subscription.unsubscribe();
  }, [watch, updatePersonalInfo]);

  // We don't need an explicit submit handler here if data is synced on change.
  // The main page's "Next" button will handle navigation.


   const [isEnhancingSummary, setIsEnhancingSummary] = useState(false);

  const handleAiEnhanceSummary = async () => {
    const currentSummaryValue = watch("summary");
    if (!currentSummaryValue || currentSummaryValue.trim().length < 10) {
      alert("Please write a brief summary first (at least 10 characters).");
      return;
    }
    setIsEnhancingSummary(true);
    try {
      const response = await fetch('/api/ai/enhance-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSummary: currentSummaryValue }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `AI summary enhancement failed: ${response.statusText}`);
      }
      const { enhancedSummary } = await response.json();
      setValue("summary", enhancedSummary, { shouldDirty: true, shouldValidate: true });
      alert("Summary enhanced by AI! Please review.");
    } catch (error) {
      console.error("AI Summary Enhancement error:", error);
      alert(`AI Summary Enhancement failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsEnhancingSummary(false);
    }
  };

  return (
    <form className="space-y-6">
      <h2 className="text-2xl font-semibold text-white border-b border-white/10 pb-3 mb-6">
        Personal Information
      </h2>
      {/* ... (firstName, lastName, email, phone, location, linkedin, website fields - keep as is) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><Label htmlFor="firstName">First Name</Label><Controller name="firstName" control={control} render={({ field }) => <Input id="firstName" {...field} placeholder="e.g., John"/>}/>{errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}</div><div><Label htmlFor="lastName">Last Name</Label><Controller name="lastName" control={control} render={({ field }) => <Input id="lastName" {...field} placeholder="e.g., Doe"/>}/>{errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}</div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><Label htmlFor="email">Email Address</Label><Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} placeholder="e.g., john.doe@example.com"/>}/>{errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}</div><div><Label htmlFor="phone">Phone Number</Label><Controller name="phone" control={control} render={({ field }) => <Input id="phone" type="tel" {...field} placeholder="e.g., (123) 456-7890"/>}/>{errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}</div></div>
      <div><Label htmlFor="location">Location</Label><Controller name="location" control={control} render={({ field }) => <Input id="location" {...field} placeholder="e.g., San Francisco, CA"/>}/>{errors.location && <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><Label htmlFor="linkedin">LinkedIn Profile URL (Optional)</Label><Controller name="linkedin" control={control} render={({ field }) => <Input id="linkedin" {...field} placeholder="e.g., linkedin.com/in/johndoe"/>}/>{errors.linkedin && <p className="text-red-400 text-xs mt-1">{errors.linkedin.message}</p>}</div><div><Label htmlFor="website">Personal Website/Portfolio (Optional)</Label><Controller name="website" control={control} render={({ field }) => <Input id="website" {...field} placeholder="e.g., johndoe.com"/>}/>{errors.website && <p className="text-red-400 text-xs mt-1">{errors.website.message}</p>}</div></div>
      
      <div>
        <div className="flex justify-between items-center mb-1.5">
            <Label htmlFor="summary">Professional Summary</Label>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAiEnhanceSummary}
                disabled={isEnhancingSummary}
                className="text-purple-400 hover:text-purple-300 text-xs p-1"
            >
                {isEnhancingSummary ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                )}
                AI Enhance
            </Button>
        </div>
        <Controller
          name="summary"
          control={control}
          render={({ field }) => (
            <Textarea
              id="summary"
              {...field}
              rows={5}
              placeholder="A brief summary of your career, skills, and goals (2-4 sentences)..."
            />
          )}
        />
        {errors.summary && <p className="text-red-400 text-xs mt-1">{errors.summary.message}</p>}
        <p className="text-xs text-gray-400 mt-1">Tip: Highlight your key achievements and what you bring to a role. Click &quot;AI Enhance&quot; for help!</p>
      </div>
    </form>
  );
};

export default PersonalInfoSection;


// Create similar files for:
// components/resume/sections/education.tsx
// components/resume/sections/experience.tsx
// components/resume/sections/skills.tsx
// components/resume/sections/projects.tsx
// Each will have its own form fields, validation, and logic to update the Zustand store.
// For sections with multiple entries (Education, Experience), you'll need logic to add/remove/edit items in an array.