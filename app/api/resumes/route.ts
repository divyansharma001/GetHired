// app/api/resumes/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { prisma } from '@/lib/db';
import { ResumeData } from '@/types/resume'; // Assuming your full ResumeData type

// POST handler (Create new resume)
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user || !("id" in session.user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

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

    const resume = await prisma.resume.create({
      data: {
        title: title || 'Untitled Resume',
        userId: (session.user as { id: string }).id,
        atsScore,
        personalInfo: personalInfo ? {
          create: personalInfo,
        } : undefined,
        education: education && education.length > 0 ? {
          create: education,
        } : undefined,
        experience: experience && experience.length > 0 ? {
          create: experience,
        } : undefined,
        skills: skills && skills.length > 0 ? {
          create: skills,
        } : undefined,
        projects: projects && projects.length > 0 ? {
          create: projects,
        } : undefined,
      },
      include: {
        personalInfo: true,
        education: true,
        experience: true,
        skills: true,
        projects: true,
      },
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error) {
    console.error('[API_POST_RESUME_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET handler (Get all resumes for the user)
export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user || !("id" in session.user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: (session.user as { id: string }).id,
      },
      select: {
        id: true,
        title: true,
        atsScore: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('[API_GET_RESUMES_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}