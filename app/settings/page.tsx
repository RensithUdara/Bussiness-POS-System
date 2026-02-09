'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { seedDatabase } from '@/lib/seedDatabase';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleClearDatabase = async () => {
        if (confirm('This will delete ALL data. Are you sure?')) {
            try {
                setIsLoading(true);
                await db.vendors.clear();
                await db.products.clear();
                await db.customers.clear();
                await db.inventory.clear();
                await db.sales.clear();
                alert('All data cleared successfully!');
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert('Error clearing data');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleLoadSampleData = async () => {
        try {
            setIsLoading(true);
            await seedDatabase();
            alert('Sample data loaded successfully! Refresh the page to see changes.');
        } catch (error) {
            console.error(error);
            alert('Error loading sample data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
                <p className="text-sm text-gray-600 mb-6">Manage your database and sample data</p>
                <div className="flex gap-4">
                    <button
                        onClick={handleLoadSampleData}
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Loading...' : 'Load Sample Data'}
                    </button>
                    <button
                        onClick={handleClearDatabase}
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Clear All Data'}
                    </button>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-blue-900 mb-2">About This POS System</h3>
                <p className="text-sm text-blue-800">
                    This is a modern Point-of-Sale system with complete inventory, customer, and sales management.
                    Sample data will be automatically loaded on first use.
                </p>
            </div>
        </div>
    );
}
