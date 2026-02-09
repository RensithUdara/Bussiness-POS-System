'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Customer } from '@/lib/types';
import { Plus, Search, User, Phone, Mail, Edit, Trash } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

interface CustomerFormProps {
    defaultValues?: Customer;
    onSuccess: () => void;
    onCancel: () => void;
}

function CustomerForm({ defaultValues, onSuccess, onCancel }: CustomerFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<Customer>({ defaultValues });

    const onSubmit = async (data: Customer) => {
        try {
            if (defaultValues?.id) {
                await db.customers.update(defaultValues.id, data);
            } else {
                await db.customers.add({ ...data, totalSpent: 0, outstandingBalance: 0 });
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save customer', error);
            alert('Failed to save customer');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                    {...register('name', { required: 'Name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                    {...register('type')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        {...register('phone', { required: 'Phone is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        {...register('email')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
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
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Save Customer
                </button>
            </div>
        </form>
    );
}

export default function CustomersPage() {
    const customers = useLiveQuery(() => db.customers.toArray());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
    const [search, setSearch] = useState('');

    const filteredCustomers = customers?.filter((customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search)
    );

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            await db.customers.delete(id);
        }
    };

    const handleClose = () => {
        setEditingCustomer(undefined);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <div className="mt-4 flex space-x-3 sm:mt-0">
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCustomers?.map((customer) => (
                    <div
                        key={customer.id}
                        className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:border-gray-400"
                    >
                        <div className="flex-shrink-0">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                                <User className="h-6 w-6 text-white" />
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <a href="#" className="focus:outline-none">
                                <span className="absolute inset-0" aria-hidden="true" />
                                <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                                <p className="truncate text-sm text-gray-500">{customer.type.toUpperCase()}</p>
                            </a>
                            <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                                {customer.email && <span>{customer.email}</span>}
                                {customer.phone && <span>{customer.phone}</span>}
                            </div>
                        </div>
                        <div className="relative z-10 flex flex-col space-y-2">
                            <button onClick={() => handleEdit(customer)} className="text-gray-400 hover:text-blue-500">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => customer.id && handleDelete(customer.id)} className="text-gray-400 hover:text-red-500">
                                <Trash className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredCustomers?.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No customers found.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            >
                <CustomerForm
                    defaultValues={editingCustomer}
                    onSuccess={handleClose}
                    onCancel={handleClose}
                    key={editingCustomer?.id || 'new'}
                />
            </Modal>
        </div>
    );
}
