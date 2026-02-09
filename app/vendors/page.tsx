'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Vendor } from '@/lib/types';
import { Plus, Search, Trash, Edit, Phone, Mail, MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

function VendorForm({ defaultValues, onSuccess, onCancel }: { defaultValues?: Vendor, onSuccess: () => void, onCancel: () => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm<Vendor>({ defaultValues });

    const onSubmit = async (data: Vendor) => {
        try {
            if (defaultValues?.id) {
                await db.vendors.update(defaultValues.id, data);
            } else {
                await db.vendors.add(data);
            }
            onSuccess();
        } catch (e) {
            console.error(e);
            alert('Failed to save vendor');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input {...register('name', { required: 'Name is required' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <input {...register('contactPerson')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input {...register('phone')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input {...register('email')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea {...register('address')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" rows={3} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Save Vendor</button>
            </div>
        </form>
    );
}

export default function VendorsPage() {
    const vendors = useLiveQuery(() => db.vendors.toArray());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);
    const [search, setSearch] = useState('');

    const filteredVendors = vendors?.filter((v: Vendor) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.contactPerson?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this vendor?')) {
            await db.vendors.delete(id);
        }
    };

    const handleClose = () => {
        setEditingVendor(undefined);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
                <div className="mt-4 flex space-x-3 sm:mt-0">
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="Search vendors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Vendor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVendors?.map((vendor: Vendor) => (
                    <div key={vendor.id} className="relative flex flex-col bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{vendor.name}</h3>
                            <p className="text-sm text-gray-500">{vendor.contactPerson}</p>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Phone className="mr-2 h-4 w-4" />
                                    {vendor.phone || 'N/A'}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Mail className="mr-2 h-4 w-4" />
                                    {vendor.email || 'N/A'}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {vendor.address || 'N/A'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                            <button onClick={() => handleEdit(vendor)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Edit</button>
                            <button onClick={() => vendor.id && handleDelete(vendor.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
                {filteredVendors?.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-12">
                        No vendors found.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            >
                <VendorForm
                    defaultValues={editingVendor}
                    onSuccess={handleClose}
                    onCancel={handleClose}
                    key={editingVendor?.id || 'new'}
                />
            </Modal>
        </div>
    );
}
