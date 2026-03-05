export interface OrderItem {
  name: string;
  sku: string;
  qty: number;
  price: number;
  discount?: number;
  deliveries?: {
    date: string;
    qty: number;
    destination: string;
  }[];
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  customer: string;
  date: string;
  status: 'Booking' | 'JO Created' | 'Production' | 'Ready to Ship' | 'Delivered' | 'Returned';
  total: number;
  paymentTerm: string;
  salesPerson: string;
  vatType: 'Excl.' | 'Incl.' | 'No VAT';
  vatRate: number;
  items: OrderItem[];
}

export const MOCK_SALES_ORDERS: SalesOrder[] = [
  {
    id: '1',
    soNumber: 'SO260303-001',
    customer: 'Modern Home Co.',
    date: '2024-03-03',
    status: 'Booking',
    total: 45000,
    paymentTerm: 'Cash',
    salesPerson: 'Admin',
    vatType: 'Excl.',
    vatRate: 7,
    items: [
      { name: 'Pro Ironing Board', sku: 'IB-PRO-01', qty: 10, price: 4500, discount: 0 }
    ]
  },
  {
    id: '2',
    soNumber: 'SO260303-002',
    customer: 'Interior Design Studio',
    date: '2024-03-02',
    status: 'Production',
    total: 12500,
    paymentTerm: 'Credit 30 Days',
    salesPerson: 'Admin',
    vatType: 'Excl.',
    vatRate: 7,
    items: [
      { name: 'Nordic Sofa 3-Seater', sku: 'ND-SOF-3S', qty: 1, price: 12500, discount: 0 }
    ]
  },
  {
    id: '3',
    soNumber: 'SO260303-003',
    customer: 'Grand Hotel Group',
    date: '2024-03-01',
    status: 'Delivered',
    total: 280000,
    paymentTerm: 'Credit 60 Days',
    salesPerson: 'Admin',
    vatType: 'Excl.',
    vatRate: 7,
    items: [
      { name: 'Luxury Bed Frame', sku: 'LX-BED-01', qty: 20, price: 14000, discount: 0 }
    ]
  }
];
