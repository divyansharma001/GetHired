/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/resumes/[resumeId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { prisma } from '@/lib/db';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const session = await getServerSession()
    const { resumeId } = await params;
    
    if (!session?.user || !("id" in session.user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: (session.user as { id: string }).id,
      },
      include: {
        personalInfo: true,
        education: true,
        experience: true,
        skills: true,
        projects: true,
      },
    });

    if (!resume) {
      return new NextResponse('Resume not found', { status: 404 });
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error('[API_GET_RESUME_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const session = await getServerSession()
    const { resumeId } = await params;
    
    if (!session?.user || !("id" in session.user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, personalInfo, education, experience, skills, projects, atsScore } = body;

    // First, check if the resume belongs to the user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: (session.user as { id: string }).id,
      },
    });

    if (!existingResume) {
      return new NextResponse('Resume not found', { status: 404 });
    }

    // Update the resume
    const updatedResume = await prisma.resume.update({
      where: {
        id: resumeId,
      },
      data: {
        title: title || existingResume.title,
        atsScore: atsScore !== undefined ? atsScore : existingResume.atsScore,
        personalInfo: personalInfo ? {
          upsert: {
            create: personalInfo,
            update: personalInfo,
          },
        } : undefined,
        education: education ? {
          deleteMany: {},
          create: education,
        } : undefined,
        experience: experience ? {
          deleteMany: {},
          create: experience,
        } : undefined,
        skills: skills ? {
          deleteMany: {},
          create: skills,
        } : undefined,
        projects: projects ? {
          deleteMany: {},
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

    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error('[API_PUT_RESUME_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const session = await getServerSession()
    const { resumeId } = await params;
    
    if (!session?.user || !("id" in session.user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if the resume belongs to the user
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: (session.user as { id: string }).id,
      },
    });

    if (!resume) {
      return new NextResponse('Resume not found', { status: 404 });
    }

    // Delete the resume (cascade will handle related data)
    await prisma.resume.delete({
      where: {
        id: resumeId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API_DELETE_RESUME_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}