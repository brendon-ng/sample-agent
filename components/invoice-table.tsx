'use client';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type TableOptions,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronRight, Trash2, Edit2 } from 'lucide-react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define the LineItem type
type LineItem = {
  id: string;
  invoiceId: string;
  itemName: string;
  itemQuantity: number;
  itemPrice: number;
  createdAt: Date;
};

// Define the Invoice type
type Invoice = {
  id: string;
  userId: string;
  customerName: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  createdAt: Date;
  lineItems: LineItem[];
};

type TableMeta = {
  onDelete: (invoiceId: string) => void;
  onEdit: (invoice: Invoice) => void;
};

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
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('dueDate', {
    header: 'Due Date',
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
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
  columnHelper.accessor('id', {
    header: 'Actions',
    cell: (info) => {
      const invoice = info.row.original;
      const meta = info.table.options.meta as TableMeta;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              meta.onEdit(invoice);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              meta.onDelete(invoice.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  }),
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function InvoiceTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingLineItem, setEditingLineItem] = useState<LineItem | null>(null);
  const { data: invoices, error, mutate } = useSWR<Invoice[]>(
    `/api/invoices`,
    fetcher
  );

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices?id=${invoiceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      await mutate();
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handleUpdateInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }

      await mutate();
      setEditingInvoice(null);
      toast.success('Invoice updated successfully');
    } catch (error) {
      console.error('Failed to update invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const handleDeleteLineItem = async (lineItemId: string) => {
    try {
      const response = await fetch(`/api/line-items?id=${lineItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete line item');
      }

      await mutate();
      toast.success('Line item deleted successfully');
    } catch (error) {
      console.error('Failed to delete line item:', error);
      toast.error('Failed to delete line item');
    }
  };

  const handleUpdateLineItem = async (lineItem: LineItem) => {
    try {
      const response = await fetch('/api/line-items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lineItem),
      });

      if (!response.ok) {
        throw new Error('Failed to update line item');
      }

      await mutate();
      setEditingLineItem(null);
      toast.success('Line item updated successfully');
    } catch (error) {
      console.error('Failed to update line item:', error);
      toast.error('Failed to update line item');
    }
  };

  const table = useReactTable({
    data: invoices || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onDelete: handleDeleteInvoice,
      onEdit: setEditingInvoice,
    } as TableMeta,
  });

  if (error) {
    return <div className="text-center py-4">Failed to load invoices</div>;
  }

  if (!invoices) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Your invoices will appear here when they are processed
      </div>
    );
  }

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
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-2">{item.itemName}</td>
                        <td className="px-4 py-2 text-right">{item.itemQuantity}</td>
                        <td className="px-4 py-2 text-right">${item.itemPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">
                          ${(item.itemQuantity * item.itemPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingLineItem(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLineItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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

      <Dialog open={!!editingInvoice} onOpenChange={() => setEditingInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateInvoice({
                  ...editingInvoice,
                  customerName: formData.get('customerName') as string,
                  vendorName: formData.get('vendorName') as string,
                  invoiceNumber: formData.get('invoiceNumber') as string,
                  invoiceDate: new Date(formData.get('invoiceDate') as string),
                  dueDate: new Date(formData.get('dueDate') as string),
                  amount: parseFloat(formData.get('amount') as string),
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  defaultValue={editingInvoice.customerName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  name="vendorName"
                  defaultValue={editingInvoice.vendorName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  defaultValue={editingInvoice.invoiceNumber}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  name="invoiceDate"
                  type="date"
                  defaultValue={new Date(editingInvoice.invoiceDate).toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={new Date(editingInvoice.dueDate).toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={editingInvoice.amount}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingInvoice(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingLineItem} onOpenChange={() => setEditingLineItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Line Item</DialogTitle>
          </DialogHeader>
          {editingLineItem && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateLineItem({
                  ...editingLineItem,
                  itemName: formData.get('itemName') as string,
                  itemQuantity: parseInt(formData.get('itemQuantity') as string),
                  itemPrice: parseFloat(formData.get('itemPrice') as string),
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  defaultValue={editingLineItem.itemName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemQuantity">Quantity</Label>
                <Input
                  id="itemQuantity"
                  name="itemQuantity"
                  type="number"
                  defaultValue={editingLineItem.itemQuantity}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemPrice">Price</Label>
                <Input
                  id="itemPrice"
                  name="itemPrice"
                  type="number"
                  step="0.01"
                  defaultValue={editingLineItem.itemPrice}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingLineItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 