// app/api/ai/enhance-experience/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { enhanceExperienceEntry } from '@/lib/ai/experience-enhancer';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { description, achievements, title, jobTitle, targetCompanyValues } = body; // <<< Destructure targetCompanyValues

    if (!description) {
      return new NextResponse('Experience description is required', { status: 400 });
    }

    // Pass targetCompanyValues to the enhancer function
    const enhancedData = await enhanceExperienceEntry({
        description,
        achievements,
        title,
        jobTitle,
        targetCompanyValues // <<< Pass here
    });
    return NextResponse.json(enhancedData);

  } catch (error) {
    console.error('[API_ENHANCE_EXPERIENCE_ERROR]', error);
    return new NextResponse('Internal Server Error while enhancing experience', { status: 500 });
  }
}