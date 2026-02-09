'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Customer } from '@/lib/types';
import { Plus, Search, User, Phone, Mail, Edit, Trash } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { StatusCard } from '@/components/ui/StatusCard';
import { useForm } from 'react-hook-form';
import { calculateTotalCustomerSpent, calculateTotalOutstandingBalance, getWholesaleCustomers, getRetailCustomers, formatCurrency } from '@/lib/utils';

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
    const [customerType, setCustomerType] = useState<'all' | 'retail' | 'wholesale'>('all');

    const filteredCustomers = customers?.filter((customer: Customer) => {
        const matchesType = customerType === 'all' || customer.type === customerType;
        return matchesSearch && matchesType;
    });

    // Calculate metrics
    const totalSpent = useMemo(() => calculateTotalCustomerSpent(customers || []), [customers]);
    const totalOutstanding = useMemo(() => calculateTotalOutstandingBalance(customers || []), [customers]);
    const wholesaleCount = useMemo(() => getWholesaleCustomers(customers || []).length, [customers]);
    const retailCount = useMemo(() => getRetailCustomers(customers || []).length, [customers]);

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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-gray-600">Total: <span className="font-semibold">{customers?.length || 0}</span></span>
                        <span className="text-blue-600">Retail: <span className="font-semibold">{retailCount}</span></span>
                        <span className="text-purple-600">Wholesale: <span className="font-semibold">{wholesaleCount}</span></span>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatusCard
                    title="Total Spent"
                    value={formatCurrency(totalSpent)}
                    subtitle="Combined revenue"
                    icon={Phone}
                    color="green"
                />
                <StatusCard
                    title="Outstanding Balance"
                    value={formatCurrency(totalOutstanding)}
                    subtitle="Amount due"
                    icon={Mail}
                    color="red"
                />
                <StatusCard
                    title="Retail Customers"
                    value={retailCount}
                    subtitle="Individual buyers"
                    icon={User}
                    color="blue"
                />
                <StatusCard
                    title="Wholesale Customers"
                    value={wholesaleCount}
                    subtitle="Business accounts"
                    icon={User}
                    color="purple"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border shadow-sm"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value as any)}
                    className="rounded-md border-gray-300 px-4 py-2 text-sm border shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="all">All Types</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCustomers?.map((customer) => (
                    <div
                        key={customer.id}
                        className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white ${customer.type === 'wholesale' ? 'bg-purple-500' : 'bg-blue-500'
                                    }`}>
                                    {customer.name.charAt(0).toUpperCase()}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                                    <p className="text-xs text-gray-500">{customer.type === 'wholesale' ? 'Wholesale' : 'Retail'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(customer)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={() => customer.id && handleDelete(customer.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                    <Trash className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm mb-4 pb-4 border-b">
                            {customer.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    {customer.phone}
                                </div>
                            )}
                            {customer.email && (
                                <div className="flex items-center gap-2 text-gray-600 truncate">
                                    <Mail className="h-4 w-4" />
                                    {customer.email}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Spent:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(customer.totalSpent)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Balance:</span>
                                <span className={`font-semibold ${customer.outstandingBalance > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                    {formatCurrency(customer.outstandingBalance)}
                                </span>
                            </div>
                            {customer.type === 'wholesale' && customer.creditLimit && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Credit Limit:</span>
                                    <span className="font-semibold text-blue-600">{formatCurrency(customer.creditLimit)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredCustomers?.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No customers found. Add one to get started.
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
