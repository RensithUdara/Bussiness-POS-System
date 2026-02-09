'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useMemo } from 'react';
import { StatusCard } from '@/components/ui/StatusCard';
import {
    calculateTotalRevenue,
    calculateRetailRevenue,
    calculateWholesaleRevenue,
    calculateGrossProfit,
    calculateGrossProfitMargin,
    calculatePaymentMethodBreakdown,
    getMostSoldProducts,
    getSalesCountByType,
    calculateAverageSaleValue,
    getDailySalesStats,
    formatCurrency,
    formatPercentage,
    calculateTotalDiscounts
} from '@/lib/utils';
import { DollarSign, BarChart3, TrendingUp, ShoppingCart, CreditCard } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function ReportsPage() {
    const sales = useLiveQuery(() => db.sales.toArray());
    const products = useLiveQuery(() => db.products.toArray());

    // Calculate metrics
    const totalRevenue = useMemo(() => calculateTotalRevenue(sales || []), [sales]);
    const retailRevenue = useMemo(() => calculateRetailRevenue(sales || []), [sales]);
    const wholesaleRevenue = useMemo(() => calculateWholesaleRevenue(sales || []), [sales]);
    const grossProfit = useMemo(() => calculateGrossProfit(sales || [], products || []), [sales, products]);
    const profitMargin = useMemo(() => calculateGrossProfitMargin(sales || [], products || []), [sales, products]);
    const avgSaleValue = useMemo(() => calculateAverageSaleValue(sales || []), [sales]);
    const paymentMethods = useMemo(() => calculatePaymentMethodBreakdown(sales || []), [sales]);
    const totalDiscounts = useMemo(() => calculateTotalDiscounts(sales || []), [sales]);
    const topProducts = useMemo(() => getMostSoldProducts(sales || [], products || [], 10), [sales, products]);
    const salesCountByType = useMemo(() => getSalesCountByType(sales || []), [sales]);
    const dailyStats = useMemo(() => getDailySalesStats(sales || []), [sales]);

    // Format payment methods for chart
    const paymentData = Object.entries(paymentMethods).map(([method, amount]) => ({
        name: method.charAt(0).toUpperCase() + method.slice(1),
        value: amount,
    })).filter(item => item.value > 0);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <StatusCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={DollarSign}
                    color="green"
                />
                <StatusCard
                    title="Gross Profit"
                    value={formatCurrency(grossProfit)}
                    icon={TrendingUp}
                    color="purple"
                />
                <StatusCard
                    title="Profit Margin"
                    value={formatPercentage(profitMargin)}
                    icon={BarChart3}
                    color="blue"
                />
                <StatusCard
                    title="Avg Sale Value"
                    value={formatCurrency(avgSaleValue)}
                    icon={ShoppingCart}
                    color="yellow"
                />
                <StatusCard
                    title="Total Discounts"
                    value={formatCurrency(totalDiscounts)}
                    icon={CreditCard}
                    color="red"
                />
            </div>

            {/* Sales Breakdown */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue by Type</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Retail Sales</span>
                                <span className="text-lg font-semibold text-green-600">{formatCurrency(retailRevenue)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${totalRevenue > 0 ? (retailRevenue / totalRevenue) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Wholesale Sales</span>
                                <span className="text-lg font-semibold text-purple-600">{formatCurrency(wholesaleRevenue)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{ width: `${totalRevenue > 0 ? (wholesaleRevenue / totalRevenue) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Count by Type</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Retail Transactions</span>
                            <span className="text-2xl font-bold text-green-600">{salesCountByType.retail}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Wholesale Transactions</span>
                            <span className="text-2xl font-bold text-purple-600">{salesCountByType.wholesale}</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Total Orders</span>
                            <span className="text-2xl font-bold text-blue-600">{salesCountByType.retail + salesCountByType.wholesale}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Daily Sales Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Sales Performance</h2>
                    {dailyStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                <Legend />
                                <Bar dataKey="retail" stackId="a" fill="#22c55e" name="Retail Sales" />
                                <Bar dataKey="wholesale" stackId="a" fill="#a855f7" name="Wholesale Sales" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-400">
                            No sales data available.
                        </div>
                    )}
                </div>

                {/* Payment Method Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>
                    {paymentData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {paymentData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-400">
                            No payment data available.
                        </div>
                    )}
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Top 10 Selling Products</h2>
                {topProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Product</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Qty Sold</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {topProducts.map((product, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-900 font-medium">{product.productName}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{product.totalQuantitySold}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(product.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No sales data available</p>
                )}
            </div>
        </div>
    );
}
