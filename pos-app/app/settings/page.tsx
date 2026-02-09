'use client';

import { db } from '@/lib/db';
import { Product, Vendor, Customer } from '@/lib/types';

export default function SettingsPage() {
    const handleReset = async () => {
        if (confirm('This will wipe all data. Are you sure?')) {
            await db.delete();
            await db.open();
            window.location.reload();
        }
    };

    const handleSeed = async () => {
        if (confirm('Add sample data?')) {
            // Add Vendors
            await db.vendors.bulkAdd([
                { name: 'Global sourcing Co.', contactPerson: 'John Doe', phone: '123-456-7890', email: 'john@globalsourcing.com', address: '123 Warehouse Dr' },
                { name: 'Local Farms Ltd.', contactPerson: 'Jane Smith', phone: '987-654-3210', email: 'jane@localfarms.com', address: '456 Farm Ln' }
            ]);

            // Add Products
            await db.products.bulkAdd([
                { name: 'Premium Widget', sku: 'WID-001', category: 'Gadgets', retailPrice: 19.99, wholesalePrice: 12.50, minWholesaleQty: 10, costPrice: 8.00, unit: 'pcs', stockLevel: 100, alertLevel: 10, barcode: '123456789' },
                { name: 'Super Gadget', sku: 'GAD-002', category: 'Gadgets', retailPrice: 49.99, wholesalePrice: 35.00, minWholesaleQty: 5, costPrice: 25.00, unit: 'pcs', stockLevel: 50, alertLevel: 5, barcode: '987654321' },
                { name: 'Bulk Rice', sku: 'RICE-50KG', category: 'Food', retailPrice: 55.00, wholesalePrice: 45.00, minWholesaleQty: 10, costPrice: 38.00, unit: 'bag', stockLevel: 200, alertLevel: 20, barcode: '11223344' },
                { name: 'Soda Can', sku: 'SOD-001', category: 'Beverages', retailPrice: 1.50, wholesalePrice: 0.80, minWholesaleQty: 24, costPrice: 0.50, unit: 'can', stockLevel: 500, alertLevel: 50, barcode: '55667788' }
            ]);

            alert('Sample data added!');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">System Management</h3>
                <div className="mt-4 flex space-x-4">
                    <button
                        onClick={handleSeed}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                        Load Sample Data
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                        Factory Reset Database
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Store Settings</h3>
                <p className="text-sm text-gray-500 mt-2">Configuration for store name, receipts, and tax rates coming soon.</p>
            </div>
        </div>
    );
}
