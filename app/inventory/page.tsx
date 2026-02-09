'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Product, Vendor, InventoryItem } from '@/lib/types';
import { Plus, Search, Calendar, Package, TrendingDown, DollarSign } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { StatusCard } from '@/components/ui/StatusCard';
import { useForm } from 'react-hook-form';
import { calculateInventoryValue, calculateLowStockItems, calculateOutOfStockItems, formatCurrency } from '@/lib/utils';

interface GRNFormData {
    productId: string; // Form returns string usually
    vendorId: string;
    quantity: number;
    costPrice: number;
    batchNumber: string;
    expiryDate: string;
}

function GRNForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const products = useLiveQuery(() => db.products.toArray());
    const vendors = useLiveQuery(() => db.vendors.toArray());
    const { register, handleSubmit, formState: { errors } } = useForm<GRNFormData>();

    const onSubmit = async (data: GRNFormData) => {
        try {
            const productId = Number(data.productId);
            const vendorId = data.vendorId ? Number(data.vendorId) : undefined;
            const quantity = Number(data.quantity);
            const costPrice = Number(data.costPrice);

            await db.inventory.add({
                productId,
                vendorId,
                quantity,
                costPrice,
                batchNumber: data.batchNumber,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                receivedDate: new Date(),
            });

            // Update product stock level
            const product = await db.products.get(productId);
            if (product) {
                await db.products.update(productId, {
                    stockLevel: (product.stockLevel || 0) + quantity,
                    costPrice: costPrice, // Update latest cost price
                });
            }

            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to add inventory');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select {...register('productId', { required: 'Product is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                    <option value="">Select Product...</option>
                    {products?.map((p: Product) => (
                        <option key={p.id} value={p.id}>{p.name} (Current: {p.stockLevel})</option>
                    ))}
                </select>
                {errors.productId && <p className="text-red-500 text-xs">{errors.productId.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Source (Vendor)</label>
                <select {...register('vendorId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                    <option value="">Own Production / Internal</option>
                    {vendors?.map((v: Vendor) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input type="number" {...register('quantity', { required: true, min: 1 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Cost</label>
                    <input type="number" step="0.01" {...register('costPrice', { required: true, min: 0 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input type="text" {...register('batchNumber')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input type="date" {...register('expiryDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Stock</button>
            </div>
        </form>
    );
}

export default function InventoryPage() {
    const inventory = useLiveQuery(() => db.inventory.reverse().toArray());
    const products = useLiveQuery(() => db.products.toArray());
    const vendors = useLiveQuery(() => db.vendors.toArray());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate metrics
    const inventoryValue = useMemo(() => calculateInventoryValue(products || []), [products]);
    const lowStockItems = useMemo(() => calculateLowStockItems(products || []), [products]);
    const outOfStockItems = useMemo(() => calculateOutOfStockItems(products || []), [products]);
    const totalStockQty = useMemo(() => (products || []).reduce((sum, p) => sum + p.stockLevel, 0), [products]);

    const filteredInventory = inventory?.filter(item => {
        const product = products?.find(p => p.id === item.productId);
        return product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getProductName = (id: number) => products?.find(p => p.id === id)?.name || 'Unknown';
    const getVendorName = (id?: number) => id ? vendors?.find(v => v.id === id)?.name || 'Unknown' : 'Own Production';

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Receive Stock (GRN)
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatusCard
                    title="Inventory Value"
                    value={formatCurrency(inventoryValue)}
                    subtitle="Total investment"
                    icon={DollarSign}
                    color="green"
                />
                <StatusCard
                    title="Total Items"
                    value={totalStockQty}
                    subtitle="Units in stock"
                    icon={Package}
                    color="blue"
                />
                <StatusCard
                    title="Low Stock Items"
                    value={lowStockItems.length}
                    subtitle="Below alert level"
                    icon={TrendingDown}
                    color="yellow"
                />
                <StatusCard
                    title="Out of Stock"
                    value={outOfStockItems.length}
                    subtitle="Items to reorder"
                    icon={Package}
                    color="red"
                />
            </div>

            {/* Search */}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by product name or batch number..."
                    className="block w-full rounded-md border-gray-300 pl-10 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInventory?.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.receivedDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {getProductName(item.productId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getVendorName(item.vendorId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.batchNumber || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                    +{item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${item.costPrice.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredInventory?.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No inventory records found.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Goods Received Note (GRN)"
            >
                <GRNForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
