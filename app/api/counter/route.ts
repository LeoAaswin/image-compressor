import { NextRequest, NextResponse } from 'next/server';
import { SupabaseCounter, ProcessingCounts } from '@/lib/supabase';

// GET - Retrieve current counts
export async function GET() {
  try {
    const counts = await SupabaseCounter.getCounts();
    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error getting counts:', error);
    return NextResponse.json(
      { error: 'Failed to get counts' },
      { status: 500 }
    );
  }
}

// POST - Update counts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filesProcessed, totalSizeBytes } = body;

    if (typeof filesProcessed !== 'number' || typeof totalSizeBytes !== 'number') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    const newCounts = await SupabaseCounter.updateCounts(filesProcessed, totalSizeBytes);
    
    return NextResponse.json(newCounts);
  } catch (error) {
    console.error('Error updating counts:', error);
    return NextResponse.json(
      { error: 'Failed to update counts' },
      { status: 500 }
    );
  }
}

// PUT - Reset counts (admin function)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reset } = body;

    if (reset === true) {
      const resetCounts = await SupabaseCounter.resetCounts();
      return NextResponse.json(resetCounts);
    }

    return NextResponse.json(
      { error: 'Invalid reset request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error resetting counts:', error);
    return NextResponse.json(
      { error: 'Failed to reset counts' },
      { status: 500 }
    );
  }
}
