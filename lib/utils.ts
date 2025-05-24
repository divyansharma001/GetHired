import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// types/resume.ts
export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
  summary: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
  achievements?: string[]
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  enhancedDescription?: string
  achievements: string[]
}

export interface Skill {
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  category: 'Technical' | 'Soft' | 'Language' | 'Other'
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
  github?: string
}

export interface Resume {
  id: string
  userId: string
  title: string
  personalInfo: PersonalInfo
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  projects: Project[]
  atsScore: number
  createdAt: string
  updatedAt: string
}

export interface ATSScore {
  overall: number
  categories: {
    keywords: number
    formatting: number
    sections: number
    length: number
  }
  suggestions: string[]
}