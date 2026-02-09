'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Customer } from '@/lib/types';
import { Plus, Search, User, Phone, Mail } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

function CustomerForm({ defaultValues, onSuccess, onCancel }: { defaultValues?: Customer, onSuccess: () => void, onCancel: () => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm<Customer>({ defaultValues });

    const onSubmit = async (data: Customer) => {
        if (defaultValues?.id) {
            await db.customers.update(defaultValues.id, data);
        } else {
            await db.customers.add({ ...data, totalSpent: 0, outstandingBalance: 0 });
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input {...register('name', { required: true })} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select {...register('type')} className="mt-1 block w-full border rounded-md p-2">
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input {...register('phone')} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input {...register('email')} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
        </form>
    );
}

export default function CustomersPage() {
    constcustomers = useLiveQuery(() => db.customers.toArray());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = customers?.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search customers..."
                    className="pl-10 w-full p-2 border rounded-md"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered?.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">{c.name}</h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.type === 'wholesale' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {c.type.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-1 text-sm text-gray-500">
                            <div className="flex items-center"><Phone className="mr-2 h-4 w-4" /> {c.phone}</div>
                            <div className="flex items-center"><Mail className="mr-2 h-4 w-4" /> {c.email || 'N/A'}</div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Customer">
                <CustomerForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
