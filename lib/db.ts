import Dexie from 'dexie';
import { Product, Sale, InventoryItem, Vendor, Customer, Settings } from './types';

export class POSDatabase extends Dexie {
    products!: Dexie.Table<Product, number>;
    inventory!: Dexie.Table<InventoryItem, number>;
    sales!: Dexie.Table<Sale, number>;
    customers!: Dexie.Table<Customer, number>;
    vendors!: Dexie.Table<Vendor, number>;
    settings!: Dexie.Table<Settings, number>;

    constructor() {
        super('POSDatabase');
        this.version(1).stores({
            products: '++id, sku, barcode, category, name, stockLevel',
            inventory: '++id, productId, vendorId, batchNumber, expiryDate',
            sales: '++id, date, customerId, type, status, totalAmount',
            customers: '++id, name, phone, type',
            vendors: '++id, name, contactPerson',
            settings: '++id',
        });
    }
}

export const db = new POSDatabase();

// Initialize default settings if needed
db.on('populate', () => {
    db.settings.add({
        storeName: 'My Wholesale & Retail Store',
        address: '123 Market Street',
        phone: '555-0123',
        receiptHeader: 'Thank you for shopping!',
        receiptFooter: 'See you next time!',
        currency: '$',
        taxRate: 0.1, // 10%
    });
});
