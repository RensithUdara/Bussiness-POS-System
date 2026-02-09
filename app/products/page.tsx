'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Product } from '@/lib/types';
import { Plus, Search, Edit, Trash, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/ProductForm';
import { calculateLowStockItems, calculateInventoryValue, formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
    const products = useLiveQuery(() => db.products.toArray());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = useMemo(() => {
        if (!products) return [];
        return ['all', ...Array.from(new Set(products.map(p => p.category)))];
    }, [products]);

    const lowStockItems = useMemo(() => calculateLowStockItems(products || []), [products]);
    const inventoryValue = useMemo(() => calculateInventoryValue(products || []), [products]);

    const filteredProducts = products?.filter(p => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchTerm));
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await db.products.delete(id);
        }
    };

    const handleClose = () => {
        setEditingProduct(undefined);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-gray-600">Total: <span className="font-semibold">{products?.length || 0}</span></span>
                        <span className="text-red-600">Low Stock: <span className="font-semibold">{lowStockItems.length}</span></span>
                        <span className="text-green-600">Inventory Value: <span className="font-semibold">{formatCurrency(inventoryValue)}</span></span>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 md:mt-0 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </button>
            </div>

            {/* Alert if low stock items exist */}
            {lowStockItems.length > 0 && (
                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
                            <p className="text-xs text-yellow-700 mt-1">
                                {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} below alert level. Consider reordering.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, SKU, or barcode..."
                        className="block w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-md border-gray-300 px-4 py-2 text-sm border shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (R/W)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredProducts?.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-xs text-gray-500">{product.barcode}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    <div className="text-green-600 font-medium">${product.retailPrice.toFixed(2)}</div>
                                    <div className="text-blue-600 text-xs">${product.wholesalePrice.toFixed(2)} (Min {product.minWholesaleQty})</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.stockLevel <= (product.alertLevel || 5)
                                            ? 'bg-red-100 text-red-800'
                                            : product.stockLevel <= (product.alertLevel || 5) * 2
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                        {product.stockLevel} {product.unit}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-4">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => product.id && handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No products found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
            >
                <ProductForm
                    defaultValues={editingProduct}
                    onSuccess={handleClose}
                    onCancel={handleClose}
                    key={editingProduct?.id || 'new'}
                />
            </Modal>
        </div>
    );
}
