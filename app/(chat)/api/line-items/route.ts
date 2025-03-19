import { deleteLineItem, updateLineItem } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lineItemId = searchParams.get('id');

    if (!lineItemId) {
      return NextResponse.json(
        { error: 'Line Item ID is required' },
        { status: 400 }
      );
    }

    await deleteLineItem(lineItemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete line item:', error);
    return NextResponse.json(
      { error: 'Failed to delete line item' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Line Item ID is required' },
        { status: 400 }
      );
    }

    await updateLineItem(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update line item:', error);
    return NextResponse.json(
      { error: 'Failed to update line item' },
      { status: 500 }
    );
  }
} 