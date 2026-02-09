'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Product, Vendor, InventoryItem } from '@/lib/types';
import { Plus, Search, Calendar, Package } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

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
                    {products?.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Current: {p.stockLevel})</option>
                    ))}
                </select>
                {errors.productId && <p className="text-red-500 text-xs">{errors.productId.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Source (Vendor)</label>
                <select {...register('vendorId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                    <option value="">Own Production / Internal</option>
                    {vendors?.map(v => (
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
    const inventory = useLiveQuery(() => db.inventory.reverse().toArray()); // Most recent first
    const products = useLiveQuery(() => db.products.toArray());
    const vendors = useLiveQuery(() => db.vendors.toArray());
    const [isModalOpen, setIsModalOpen] = useState(false);

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

            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {inventory?.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.receivedDate.toLocaleDateString()}
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
                            </tr>
                        ))}
                    </tbody>
                </table>
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
