import { getInvoicesByUserId, getLineItemsByInvoiceId, deleteInvoice, updateInvoice } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get invoices for the user
    const invoices = await getInvoicesByUserId(session.user.id);

    // Get line items for each invoice
    const invoicesWithLineItems = await Promise.all(
      invoices.map(async (invoice) => {
        const lineItems = await getLineItemsByInvoiceId(invoice.id);
        return {
          ...invoice,
          lineItems,
        };
      })
    );

    return NextResponse.json(invoicesWithLineItems);
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

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
    const invoiceId = searchParams.get('id');

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    await deleteInvoice(invoiceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
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
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Convert date fields to Date objects if they exist
    const processedUpdates = {
      ...updates,
      ...(updates.invoiceDate && { invoiceDate: new Date(updates.invoiceDate) }),
      ...(updates.dueDate && { dueDate: new Date(updates.dueDate) }),
    };

    await updateInvoice(id, processedUpdates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
} 