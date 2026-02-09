'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useMemo } from 'react';

export default function ReportsPage() {
    const sales = useLiveQuery(() => db.sales.toArray());

    const salesData = useMemo(() => {
        if (!sales) return [];

        // Group by Date (YYYY-MM-DD)
        const grouped = sales.reduce((acc, sale) => {
            const date = sale.date.toLocaleDateString(); // Simple local date string
            if (!acc[date]) {
                acc[date] = { date, retail: 0, wholesale: 0, total: 0 };
            }
            if (sale.type === 'retail') {
                acc[date].retail += sale.totalAmount;
            } else {
                acc[date].wholesale += sale.totalAmount;
            }
            acc[date].total += sale.totalAmount;
            return acc;
        }, {} as Record<string, { date: string, retail: number, wholesale: number, total: number }>);

        return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [sales]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Sales Performance</h2>
                <div className="h-80 w-full">
                    {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="retail" stackId="a" fill="#22c55e" name="Retail Sales" />
                                <Bar dataKey="wholesale" stackId="a" fill="#a855f7" name="Wholesale Sales" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            No sales data available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
