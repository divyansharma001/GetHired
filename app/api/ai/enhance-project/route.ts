// app/api/ai/enhance-project/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { enhanceProjectDescription } from '@/lib/ai/project-enhancer';

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user || !("id" in session.user)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { currentDescription, projectName, technologies } = body;

    if (!currentDescription) {
      return new NextResponse('Current description is required', { status: 400 });
    }

    const enhancedData = await enhanceProjectDescription({ 
      currentDescription, 
      projectName, 
      technologies 
    });
    return NextResponse.json(enhancedData);

  } catch (error) {
    console.error('[API_ENHANCE_PROJECT_ERROR]', error);
    return new NextResponse('Internal Server Error while enhancing project', { status: 500 });
  }
}