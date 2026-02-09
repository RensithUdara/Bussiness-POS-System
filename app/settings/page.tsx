'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, AlertTriangle } from 'lucide-react';

interface StoreSettings {
    id?: number;
    storeName: string;
    address: string;
    phone: string;
    email: string;
    receiptHeader: string;
    receiptFooter: string;
    currency: string;
    currencySymbol: string;
    currencyPosition: 'before' | 'after';
    taxRate: number;
    theme: 'light' | 'dark';
}

export default function SettingsPage() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<StoreSettings>({
        defaultValues: {
            storeName: 'My POS Store',
            address: '123 Market Street',
            phone: '+1 (555) 000-0000',
            email: 'info@posstore.com',
            receiptHeader: 'Thank you for your purchase!',
            receiptFooter: 'Visit us again',
            currency: 'USD',
            currencySymbol: '$',
            currencyPosition: 'before',
            taxRate: 10,
            theme: 'light',
        },
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data) {
                    reset(data);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [reset]);

    const onSubmit = async (data: StoreSettings) => {
        try {
            setSaving(true);
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Error saving settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Configure your POS system and store information</p>
            </div>

            {message && (
                <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Store Information */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Store Information</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                            <input
                                {...register('storeName', { required: 'Store name is required' })}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                {...register('phone', { required: 'Phone is required' })}
                                type="tel"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })}
                                type="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <input
                                {...register('address')}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Currency Settings */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Currency Settings</h3>
                    <p className="text-sm text-gray-600 mb-4">Configure currency display for all prices and amounts in the system</p>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency Code</label>
                            <select
                                {...register('currency')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                                <option value="INR">INR - Indian Rupee</option>
                                <option value="AUD">AUD - Australian Dollar</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                                <option value="CHF">CHF - Swiss Franc</option>
                                <option value="CNY">CNY - Chinese Yuan</option>
                                <option value="SGD">SGD - Singapore Dollar</option>
                                <option value="MXN">MXN - Mexican Peso</option>
                                <option value="BRL">BRL - Brazilian Real</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
                            <input
                                {...register('currencySymbol', { required: 'Symbol is required' })}
                                type="text"
                                maxLength={5}
                                placeholder="e.g., $, €, £"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.currencySymbol && <p className="text-red-500 text-sm mt-1">{errors.currencySymbol.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Symbol Position</label>
                            <select
                                {...register('currencyPosition')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="before">Before amount ($100.00)</option>
                                <option value="after">After amount (100.00 $)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tax Settings */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Tax Settings</h3>
                    <div className="max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                        <input
                            {...register('taxRate', { required: 'Tax rate is required', min: { value: 0, message: 'Must be >= 0' } })}
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.taxRate && <p className="text-red-500 text-sm mt-1">{errors.taxRate.message}</p>}
                    </div>
                </div>

                {/* Receipt Settings */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Receipt Settings</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Header</label>
                            <textarea
                                {...register('receiptHeader')}
                                rows={3}
                                placeholder="Message displayed at the top of receipts"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Footer</label>
                            <textarea
                                {...register('receiptFooter')}
                                rows={3}
                                placeholder="Message displayed at the bottom of receipts"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Theme Settings */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Appearance</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select
                            {...register('theme')}
                            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-2">Theme changes will apply after page refresh</p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="mr-2 h-5 w-5" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>

            {/* Database Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-blue-900 mb-2">Database Configuration</h3>
                        <p className="text-sm text-blue-800 mb-3">
                            Database connection is configured via <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code>
                        </p>
                        <p className="text-sm text-blue-800">
                            For database schema updates, run <code className="bg-blue-100 px-2 py-1 rounded">lib/schema.sql</code> in your MySQL client.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
