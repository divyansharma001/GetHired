// app/api/ai/enhance-experience/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { enhanceExperienceEntry } from '@/lib/ai/experience-enhancer';

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user || !("id" in session.user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { currentDescription, jobTitle, targetCompanyValues } = body;

    if (!currentDescription) {
      return new NextResponse('Current description is required', { status: 400 });
    }

    const enhancedData = await enhanceExperienceEntry({ 
      description: currentDescription,
      jobTitle: jobTitle,
      targetCompanyValues: targetCompanyValues
    });
    return NextResponse.json(enhancedData);

  } catch (error) {
    console.error('[API_ENHANCE_EXPERIENCE_ERROR]', error);
    return new NextResponse('Internal Server Error while enhancing experience', { status: 500 });
  }
}