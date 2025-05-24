// app/api/ai/ats-score/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAtsScoreAndSuggestions } from '@/lib/ai/ats-scorer';
import { ResumeData } from '@/types/resume';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resumeData = await request.json() as Partial<ResumeData>;
    if (!resumeData || Object.keys(resumeData).length === 0) {
      return new NextResponse('Resume data is required', { status: 400 });
    }
    
    // console.log("Received resume data for ATS scoring:", JSON.stringify(resumeData, null, 2));


    const atsDetails = await getAtsScoreAndSuggestions(resumeData);
    return NextResponse.json(atsDetails);

  } catch (error) {
    console.error('[API_ATS_SCORE_ERROR]', error);
    return new NextResponse('Internal Server Error while calculating ATS score', { status: 500 });
  }
}