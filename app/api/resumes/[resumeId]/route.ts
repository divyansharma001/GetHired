// app/api/resumes/[resumeId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { ResumeData } from '@/types/resume'; // Make sure this includes all sub-types

type UpdateResumePayload = Omit<ResumeData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export async function GET(
  request: Request, // Not used, but part of the signature
  context: { params: { resumeId: string } }
) {
  try {
    const { userId } = await auth();
    const resumeId = context.params.resumeId;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!resumeId) {
      return new NextResponse('Resume ID is required', { status: 400 });
    }

    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: userId, // Ensure the user owns this resume
      },
      include: { // Include all related data needed to populate the form
        personalInfo: true,
        education: true,
        experience: true,
        skills: true,
        projects: true,
      },
    });

    if (!resume) {
      return new NextResponse('Resume not found or access denied', { status: 404 });
    }

    return NextResponse.json(resume);

  } catch (error) {
    console.error('[RESUME_ID_GET_API]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { resumeId: string } }
) {
  try {
    const { userId } = await auth();
    const resumeId = context.params.resumeId;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!resumeId) {
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

    const updatedResume = await prisma.$transaction(async (tx) => {
      await tx.resume.update({
        where: { id: resumeId },
        data: { title, atsScore },
      });

      if (personalInfo) {
        await tx.personalInfo.upsert({
          where: { resumeId: resumeId },
          create: { ...personalInfo, resumeId: resumeId },
          update: { ...personalInfo }, 
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
    console.error('[RESUME_ID_PUT_API]', error);
    // if (error instanceof prisma.PrismaClientKnownRequestError) { // Corrected 'prisma.'
    //     if (error.code === 'P2025') {
    //         return new NextResponse('Resource not found during update operation.', { status: 404 });
    //     } else if (error.code === 'P2028') {
    //         return new NextResponse('Operation timed out, please try again.', { status: 504 });
    //     }
    // }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request, // Not used, but part of the signature
  context: { params: { resumeId: string } }
) {
  try {
    const { userId } = await auth();
    const resumeId = context.params.resumeId;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!resumeId) {
      return new NextResponse('Resume ID is required', { status: 400 });
    }

    // Verify ownership before deleting
    const resumeToDelete = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: userId,
      },
    });

    if (!resumeToDelete) {
      return new NextResponse('Resume not found or access denied', { status: 404 });
    }

    // Delete the resume. Prisma's `onDelete: Cascade` in the schema
    // should handle deleting related PersonalInfo, EducationEntries, etc.
    await prisma.resume.delete({
      where: {
        id: resumeId,
      },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion

  } catch (error) {
    console.error('[RESUME_ID_DELETE_API]', error);
    // if (error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2025') { // Record to delete not found
    //     return new NextResponse('Resume not found.', { status: 404 });
    // }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}