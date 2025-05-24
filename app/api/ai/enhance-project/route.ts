// app/api/ai/enhance-project/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { enhanceProjectDescription } from '@/lib/ai/project-enhancer';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    const { projectName, currentDescription, technologies, resumeTitle } = body;

    if (!projectName || !currentDescription) {
      return new NextResponse('Project name and description are required', { status: 400 });
    }

    const enhancedData = await enhanceProjectDescription({ projectName, currentDescription, technologies, resumeTitle });
    return NextResponse.json(enhancedData);
  } catch (error) {
    console.error('[API_ENHANCE_PROJECT_ERROR]', error);
    return new NextResponse('Internal Server Error while enhancing project', { status: 500 });
  }
}