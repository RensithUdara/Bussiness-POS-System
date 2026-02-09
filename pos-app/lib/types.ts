
export interface Product {
    id?: number; // Optional on create
    name: string;
    sku: string;
    barcode?: string;
    category: string;
    description?: string;
    unit: string; // e.g., 'pcs', 'kg'
    costPrice: number;
    retailPrice: number;
    wholesalePrice: number;
    minWholesaleQty: number; // Qty required for wholesale price
    stockLevel: number; // Derived/Cached total
    alertLevel: number; // Low stock alert
    image?: string; // Base64 or URL
}

export interface InventoryItem {
    id?: number;
    productId: number;
    vendorId?: number; // If null, means Own Production
    quantity: number;
    costPrice: number;
    batchNumber?: string;
    expiryDate?: Date;
    receivedDate: Date;
}

export interface Vendor {
    id?: number;
    name: string; // Company Name
    contactPerson: string;
    phone: string;
    email?: string;
    address?: string;
    taxId?: string;
}

export interface Customer {
    id?: number;
    name: string;
    phone: string;
    email?: string;
    type: 'retail' | 'wholesale';
    totalSpent: number;
    creditLimit?: number; // For wholesale credit
    outstandingBalance: number;
}

export interface SaleItem {
    productId: number;
    productName: string; // Cached for history
    quantity: number;
    price: number; // Could be retail or wholesale
    subtotal: number;
}

export interface Sale {
    id?: number;
    date: Date;
    customerId?: number; // Optional for walk-in retail
    customerName?: string; // Cached
    type: 'retail' | 'wholesale';
    items: SaleItem[]; // Storing items directly in Sale for simplicity in NoSQL-like store
    totalAmount: number;
    discount: number;
    paymentMethod: 'cash' | 'card' | 'split' | 'credit';
    status: 'completed' | 'hold' | 'refunded';
}

export interface Settings {
    storeName: string;
    address: string;
    phone: string;
    receiptHeader: string;
    receiptFooter: string;
    currency: string;
    taxRate: number;
}
