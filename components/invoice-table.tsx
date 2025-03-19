'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronRight } from 'lucide-react';

// Define the LineItem type
type LineItem = {
  itemName: string;
  itemQuantity: number;
  itemPrice: number;
};

// Define the Invoice type
type Invoice = {
  customerName: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  lineItems: LineItem[];
};

// Dummy data
const dummyData: Invoice[] = [
  {
    customerName: 'Acme Corp',
    vendorName: 'Tech Solutions Inc',
    invoiceNumber: 'INV-001',
    invoiceDate: '2024-03-01',
    dueDate: '2024-04-01',
    amount: 1500.00,
    lineItems: [
      { itemName: 'Consulting Services', itemQuantity: 40, itemPrice: 25.00 },
      { itemName: 'Software License', itemQuantity: 1, itemPrice: 500.00 },
    ],
  },
  {
    customerName: 'Global Industries',
    vendorName: 'Office Supplies Co',
    invoiceNumber: 'INV-002',
    invoiceDate: '2024-03-05',
    dueDate: '2024-04-05',
    amount: 750.50,
    lineItems: [
      { itemName: 'Office Supplies', itemQuantity: 100, itemPrice: 5.50 },
      { itemName: 'Paper Products', itemQuantity: 50, itemPrice: 4.00 },
    ],
  },
  {
    customerName: 'StartupX',
    vendorName: 'Cloud Services Ltd',
    invoiceNumber: 'INV-003',
    invoiceDate: '2024-03-10',
    dueDate: '2024-04-10',
    amount: 2500.00,
    lineItems: [
      { itemName: 'Cloud Storage', itemQuantity: 1, itemPrice: 1000.00 },
      { itemName: 'API Services', itemQuantity: 1, itemPrice: 1500.00 },
    ],
  },
];

const columnHelper = createColumnHelper<Invoice>();

const columns = [
  columnHelper.accessor('customerName', {
    header: 'Customer Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('vendorName', {
    header: 'Vendor Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('invoiceNumber', {
    header: 'Invoice Number',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('invoiceDate', {
    header: 'Invoice Date',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('dueDate', {
    header: 'Due Date',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('lineItems', {
    header: 'Line Items',
    cell: (info) => {
      const items = info.getValue();
      return (
        <div className="flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer group">
          <span>{items.length} items</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      );
    },
  }),
];

export function InvoiceTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const table = useReactTable({
    data: dummyData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="w-full h-full overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-muted">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-muted/80"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 text-sm"
                    onClick={() => {
                      if (cell.column.id === 'lineItems') {
                        setSelectedInvoice(row.original);
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Line Items Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Invoice Number</p>
                  <p>{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="font-medium">Customer</p>
                  <p>{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <p className="font-medium">Vendor</p>
                  <p>{selectedInvoice.vendorName}</p>
                </div>
                <div>
                  <p className="font-medium">Total Amount</p>
                  <p>${selectedInvoice.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-2 text-left">Item Name</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.lineItems.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.itemName}</td>
                        <td className="px-4 py-2 text-right">{item.itemQuantity}</td>
                        <td className="px-4 py-2 text-right">${item.itemPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">
                          ${(item.itemQuantity * item.itemPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 