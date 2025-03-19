import { getInvoicesByUserId, getLineItemsByInvoiceId } from '@/lib/db/queries';
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