// app/api/ai/ats-score/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { getAtsScoreAndSuggestions } from '@/lib/ai/ats-scorer';
import { ResumeData } from '@/types/resume';

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user || !("id" in session.user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { resumeData, jobTitle, jobDescription } = body as {
      resumeData: Partial<ResumeData>;
      jobTitle: string;
      jobDescription: string;
    };

    if (!resumeData || !jobTitle || !jobDescription) {
      return new NextResponse('Missing required fields (resumeData, jobTitle, jobDescription)', { status: 400 });
    }

    const atsScore = await getAtsScoreAndSuggestions(resumeData);
    return NextResponse.json(atsScore);
  } catch (error) {
    console.error('[API_ATS_SCORE_ERROR]', error);
    return new NextResponse('Internal Server Error while calculating ATS score', { status: 500 });
  }
}