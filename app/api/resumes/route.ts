// app/api/resumes/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { ResumeData } from '@/types/resume'; // Assuming your full ResumeData type

// POST handler (Create new resume)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // For body type, ensure it matches what the frontend sends for creation
    // Omitting fields that are auto-generated or derived on the backend.
    const body = await request.json() as Omit<ResumeData, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'atsScore'> & { title: string, atsScore?:number };
    
    const {
      title,
      personalInfo,
      education = [],
      experience = [],
      skills = [],
      projects = [],
      atsScore = 0 // Default ATS score from client or calculate here
    } = body;

    if (!title || !personalInfo) {
        return new NextResponse('Missing required fields (title or personalInfo)', { status: 400 });
    }

    const newResume = await prisma.resume.create({
      data: {
        userId,
        title,
        atsScore,
        personalInfo: { create: personalInfo },
        education: { create: education.map(edu => ({...edu, id: undefined})) },
        experience: { create: experience.map(exp => ({...exp, id: undefined})) },
        skills: { create: skills.map(skill => ({...skill, id: undefined})) },
        projects: { create: projects.map(proj => ({...proj, id: undefined})) },
      },
      include: { 
        personalInfo: true, education: true, experience: true,
        skills: true, projects: true,
      },
    });

    return NextResponse.json(newResume, { status: 201 });
  } catch (error) {
    console.error('[RESUMES_POST_API]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET handler (Get all resumes for the user)
export async function GET() { // request parameter is optional if not used
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: { // Select only necessary fields for the dashboard list
        id: true,
        title: true,
        atsScore: true,
        updatedAt: true,
        // Add 'status' if it's in your Prisma model
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resumesWithStatus = resumes.map((r: any) => ({
        ...r,
        status: r.atsScore > 70 ? 'completed' : 'draft' as 'completed' | 'draft' 
    }));

    return NextResponse.json(resumesWithStatus);

  } catch (error) {
    console.error('[RESUMES_GET_ALL_API]', error); // Changed log identifier
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}