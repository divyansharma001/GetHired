// app/api/ai/generate-cover-letter/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateCoverLetter } from '@/lib/ai/cover-letter-generator';
import { ResumeData } from '@/types/resume';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { resumeData, jobTitle, companyName, specificPoints, tone } = body as {
        resumeData: Partial<ResumeData>;
        jobTitle: string;
        companyName: string;
        specificPoints?: string;
        tone?: 'formal' | 'semi-formal' | 'enthusiastic';
    };

    if (!resumeData || !jobTitle || !companyName) {
      return new NextResponse('Missing required fields (resumeData, jobTitle, companyName)', { status: 400 });
    }
     if (!resumeData.personalInfo || !resumeData.personalInfo.firstName) {
       return new NextResponse('Resume data must include at least personal information with a first name.', { status: 400 });
     }


    const coverLetterOutput = await generateCoverLetter({
        resumeData,
        jobTitle,
        companyName,
        specificPoints,
        tone
    });
    return NextResponse.json(coverLetterOutput);

  } catch (error) {
    console.error('[API_GENERATE_COVER_LETTER_ERROR]', error);
    return new NextResponse('Internal Server Error while generating cover letter', { status: 500 });
  }
}