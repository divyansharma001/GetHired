// app/api/ai/enhance-summary/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { enhanceSummary } from '@/lib/ai/summary-enhancer';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { currentSummary, resumeTitle } = body;

    if (!currentSummary) {
      return new NextResponse('Current summary is required', { status: 400 });
    }

    const enhancedData = await enhanceSummary({ currentSummary, resumeTitle });
    return NextResponse.json(enhancedData);

  } catch (error) {
    console.error('[API_ENHANCE_SUMMARY_ERROR]', error);
    return new NextResponse('Internal Server Error while enhancing summary', { status: 500 });
  }
}