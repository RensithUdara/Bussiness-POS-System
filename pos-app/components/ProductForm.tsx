'use client';

import { useForm } from 'react-hook-form';
import { Product } from '@/lib/types';
import { db } from '@/lib/db';
import { clsx } from 'clsx';

interface ProductFormProps {
    defaultValues?: Product;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ProductForm({ defaultValues, onSuccess, onCancel }: ProductFormProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Product>({
        defaultValues: defaultValues || {
            name: '',
            sku: '',
            category: 'General',
            retailPrice: 0,
            wholesalePrice: 0,
            minWholesaleQty: 10,
            costPrice: 0,
            unit: 'pcs',
            stockLevel: 0,
            alertLevel: 5,
        },
    });

    const onSubmit = async (data: Product) => {
        try {
            // Convert strings to numbers if needed (e.g. from HTML input type="number")
            const formattedData = {
                ...data,
                retailPrice: Number(data.retailPrice),
                wholesalePrice: Number(data.wholesalePrice),
                minWholesaleQty: Number(data.minWholesaleQty),
                costPrice: Number(data.costPrice),
                stockLevel: Number(data.stockLevel), // Initial stock
                alertLevel: Number(data.alertLevel),
            };

            if (defaultValues?.id) {
                await db.products.update(defaultValues.id, formattedData);
            } else {
                await db.products.add(formattedData);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product. SKU or Barcode might be duplicate.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        {...register('category')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                        {...register('sku', { required: 'SKU is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    {errors.sku && <p className="text-red-500 text-xs">{errors.sku.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Barcode</label>
                    <input
                        {...register('barcode')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Retail Price</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('retailPrice', { required: true, min: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Wholesale Price</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('wholesalePrice', { required: true, min: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Min Wholesale Qty</label>
                    <input
                        type="number"
                        {...register('minWholesaleQty', { required: true, min: 1 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('costPrice', { required: true, min: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Initial Stock</label>
                    <input
                        type="number"
                        {...register('stockLevel', { min: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select {...register('unit')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                        <option value="pcs">Pieces</option>
                        <option value="kg">Kilogram</option>
                        <option value="box">Box</option>
                        <option value="liters">Liters</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
            </div>
        </form>
    );
}
