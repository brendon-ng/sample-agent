import { createInvoice } from './queries';
import { nanoid } from 'nanoid';

const DEMO_USER_ID = 'demo-user';
const LOGGED_IN_USER_ID = 'user_0';

async function seed() {
  // Create some invoices for the demo user
  await createInvoice({
    id: nanoid(),
    userId: DEMO_USER_ID,
    customerName: 'Acme Corp',
    vendorName: 'Tech Solutions Inc',
    invoiceNumber: 'INV-001',
    invoiceDate: new Date('2024-03-01'),
    dueDate: new Date('2024-04-01'),
    amount: 1500.00,
    lineItems: [
      { id: nanoid(), itemName: 'Consulting Services', itemQuantity: 40, itemPrice: 25.00 },
      { id: nanoid(), itemName: 'Software License', itemQuantity: 1, itemPrice: 500.00 },
    ],
  });

  // Create invoices for the logged-in user
  await createInvoice({
    id: nanoid(),
    userId: LOGGED_IN_USER_ID,
    customerName: 'Global Industries',
    vendorName: 'Office Supplies Co',
    invoiceNumber: 'INV-002',
    invoiceDate: new Date('2024-03-05'),
    dueDate: new Date('2024-04-05'),
    amount: 750.50,
    lineItems: [
      { id: nanoid(), itemName: 'Office Supplies', itemQuantity: 100, itemPrice: 5.50 },
      { id: nanoid(), itemName: 'Paper Products', itemQuantity: 50, itemPrice: 4.00 },
    ],
  });

  await createInvoice({
    id: nanoid(),
    userId: LOGGED_IN_USER_ID,
    customerName: 'StartupX',
    vendorName: 'Cloud Services Ltd',
    invoiceNumber: 'INV-003',
    invoiceDate: new Date('2024-03-10'),
    dueDate: new Date('2024-04-10'),
    amount: 2500.00,
    lineItems: [
      { id: nanoid(), itemName: 'Cloud Storage', itemQuantity: 1, itemPrice: 1000.00 },
      { id: nanoid(), itemName: 'API Services', itemQuantity: 1, itemPrice: 1500.00 },
    ],
  });

  console.log('✅ Database seeded successfully');
}

seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
}); 