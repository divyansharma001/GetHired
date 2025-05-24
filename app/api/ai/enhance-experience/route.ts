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
    const { description, achievements, title, jobTitle } = body;

    if (!description) {
      return new NextResponse('Experience description is required', { status: 400 });
    }

    const enhancedData = await enhanceExperienceEntry({ description, achievements, title, jobTitle });
    return NextResponse.json(enhancedData);

  } catch (error) {
    console.error('[API_ENHANCE_EXPERIENCE_ERROR]', error);
    return new NextResponse('Internal Server Error while enhancing experience', { status: 500 });
  }
}