// app/api/resumes/[resumeId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { ResumeData } from '@/types/resume'; // Make sure this includes all sub-types

type UpdateResumePayload = Omit<ResumeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export async function PUT(
  request: Request,
  context: { params: { resumeId: string } } // Standard way to receive context with params
) {
  try {
    const { userId } = await auth(); // First async operation

    // Now access params AFTER the await
    const resumeId = context.params.resumeId; // Access directly from the context object

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!resumeId) {
      // This check might become redundant if TS ensures resumeId is always a string
      return new NextResponse('Resume ID is required', { status: 400 });
    }

    const body = await request.json() as UpdateResumePayload;
    const {
      title,
      personalInfo,
      education = [],
      experience = [],
      skills = [],
      projects = [],
      atsScore = 0
    } = body;

    if (!title || !personalInfo) {
        return new NextResponse('Missing title or personalInfo', { status: 400 });
    }
    
    const existingResume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!existingResume) {
      return new NextResponse('Resume not found', { status: 404 });
    }
    if (existingResume.userId !== userId) {
      return new NextResponse('Access denied', { status: 403 });
    }

    // Transaction logic (as before)
    const updatedResume = await prisma.$transaction(async (tx) => {
      await tx.resume.update({
        where: { id: resumeId },
        data: { title, atsScore },
      });

      if (personalInfo) {
        await tx.personalInfo.upsert({
          where: { resumeId: resumeId },
          create: { ...personalInfo, resumeId: resumeId }, // Ensure all fields of PersonalInfo are here
          update: { ...personalInfo }, // Ensure all fields of PersonalInfo are here
        });
      }

      await tx.educationEntry.deleteMany({ where: { resumeId: resumeId } });
      if (education.length > 0) {
        await tx.educationEntry.createMany({
          data: education.map(edu => ({
            institution: edu.institution, degree: edu.degree, field: edu.field,
            startDate: edu.startDate, endDate: edu.endDate, gpa: edu.gpa,
            achievements: edu.achievements, resumeId: resumeId,
          })),
        });
      }
      
      await tx.experienceEntry.deleteMany({ where: { resumeId: resumeId } });
      if (experience.length > 0) {
        await tx.experienceEntry.createMany({
          data: experience.map(exp => ({
            company: exp.company, position: exp.position, startDate: exp.startDate,
            endDate: exp.endDate, description: exp.description,
            enhancedDescription: exp.enhancedDescription, achievements: exp.achievements,
            resumeId: resumeId,
          })),
        });
      }

      await tx.skillEntry.deleteMany({ where: { resumeId: resumeId } });
      if (skills.length > 0) {
        await tx.skillEntry.createMany({
          data: skills.map(skill => ({
            name: skill.name, level: skill.level, category: skill.category,
            resumeId: resumeId,
          })),
        });
      }

      await tx.projectEntry.deleteMany({ where: { resumeId: resumeId } });
      if (projects.length > 0) {
        await tx.projectEntry.createMany({
          data: projects.map(proj => ({
            name: proj.name, description: proj.description, technologies: proj.technologies,
            url: proj.url, github: proj.github, resumeId: resumeId,
          })),
        });
      }

      return tx.resume.findUniqueOrThrow({
        where: { id: resumeId },
        include: {
          personalInfo: true, education: true, experience: true,
          skills: true, projects: true,
        },
      });
    }, 
    {
      maxWait: 15000, 
      timeout: 15000,
    });

    return NextResponse.json(updatedResume);

  } catch (error) {
    console.error('[RESUME_PUT_API]', error);
    // if (error instanceof prisma.PrismaClientKnownRequestError) {
    //     if (error.code === 'P2025') {
    //         return new NextResponse('Resource not found during update operation.', { status: 404 });
    //     } else if (error.code === 'P2028') {
    //         return new NextResponse('Operation timed out, please try again.', { status: 504 });
    //     }
    // }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}