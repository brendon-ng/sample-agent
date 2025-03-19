import { tool } from 'ai';
import { z } from 'zod';
import { getInvoicesByUserId, getLineItemsByInvoiceId } from '@/lib/db/queries';
import type { Session } from 'next-auth';

interface QueryInvoicesProps {
  session: Session;
}

export const queryInvoices = ({ session }: QueryInvoicesProps) =>
  tool({
    description: 'Query invoices and line items based on natural language questions',
    parameters: z.object({
      query: z.string().describe('The natural language query about invoices and line items'),
    }),
    execute: async ({ query }) => {
      if (!session?.user?.id) {
        return {
          error: 'User not authenticated',
        };
      }

      // Get all invoices for the user
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

      // Process the query and return relevant information
      const queryLower = query.toLowerCase();
      let result = {
        message: '',
        data: null as any,
      };

      // Handle different types of queries
      if (queryLower.includes('total amount') || queryLower.includes('total value')) {
        const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        result = {
          message: `The total amount across all invoices is $${totalAmount.toFixed(2)}`,
          data: { totalAmount },
        };
      } else if (queryLower.includes('customer') || queryLower.includes('client')) {
        const customers = [...new Set(invoices.map(inv => inv.customerName))];
        result = {
          message: `Found ${customers.length} unique customers: ${customers.join(', ')}`,
          data: { customers },
        };
      } else if (queryLower.includes('vendor') || queryLower.includes('supplier')) {
        const vendors = [...new Set(invoices.map(inv => inv.vendorName))];
        result = {
          message: `Found ${vendors.length} unique vendors: ${vendors.join(', ')}`,
          data: { vendors },
        };
      } else if (queryLower.includes('line item') || queryLower.includes('item')) {
        const allLineItems = invoicesWithLineItems.flatMap(inv => inv.lineItems);
        result = {
          message: `Found ${allLineItems.length} line items across all invoices`,
          data: { lineItems: allLineItems },
        };
      } else if (queryLower.includes('due date') || queryLower.includes('overdue')) {
        const now = new Date();
        const overdueInvoices = invoices.filter(inv => new Date(inv.dueDate) < now);
        result = {
          message: `Found ${overdueInvoices.length} overdue invoices`,
          data: { overdueInvoices },
        };
      } else if (queryLower.includes('invoice number')) {
        const invoiceNumbers = invoices.map(inv => inv.invoiceNumber);
        result = {
          message: `Found ${invoiceNumbers.length} invoice numbers: ${invoiceNumbers.join(', ')}`,
          data: { invoiceNumbers },
        };
      } else {
        // Default to showing all invoices if no specific query is matched
        result = {
          message: `Found ${invoices.length} invoices in total`,
          data: { invoices: invoicesWithLineItems },
        };
      }

      return result;
    },
  }); 