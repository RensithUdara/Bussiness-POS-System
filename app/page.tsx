'use client';

import { useState, useEffect, useMemo } from 'react';
import { StatusCard } from '@/components/ui/StatusCard';
import { useSettings } from '@/lib/SettingsContext';
import {
  calculateTotalRevenue,
  calculateGrossProfitMargin,
  calculateLowStockItems,
  calculateInventoryValue,
  getMostSoldProducts,
  getDailySalesStats,
  formatCurrency,
  formatPercentage
} from '@/lib/utils';
import { ShoppingCart, Package, AlertTriangle, Users, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Home() {
  const settings = useSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, salesRes, customersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/sales'),
          fetch('/api/customers'),
        ]);
        
        setProducts(await productsRes.json());
        setSales(await salesRes.json());
        setCustomers(await customersRes.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const productsCount = products.length;
  const lowStockItems = useMemo(() => calculateLowStockItems(products), [products]);
  const salesCount = sales.length;
  const customersCount = customers.length;
  const totalRevenue = useMemo(() => calculateTotalRevenue(sales), [sales]);
  const profitMargin = useMemo(() => calculateGrossProfitMargin(sales, products), [sales, products]);
  const inventoryValue = useMemo(() => calculateInventoryValue(products), [products]);
  const topProducts = useMemo(() => getMostSoldProducts(sales, products, 5), [sales, products]);
  const dailyStats = useMemo(() => getDailySalesStats(sales), [sales]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Total Products"
          value={productsCount}
          subtitle={`${calculateInventoryValue(products)} units in stock`}
          icon={Package}
          color="blue"
        />
        <StatusCard
          title="Low Stock"
          value={lowStockItems.length}
          subtitle={`Alert level items`}
          icon={AlertTriangle}
          color="red"
        />
        <StatusCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue, settings.currencySymbol, settings.currencyPosition)}
          subtitle={`from ${salesCount} sales`}
          icon={DollarSign}
          color="green"
        />
        <StatusCard
          title="Gross Profit Margin"
          value={formatPercentage(profitMargin)}
          subtitle={`Inventory value: ${formatCurrency(inventoryValue, settings.currencySymbol, settings.currencyPosition)}`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="Total Customers"
          value={customersCount}
          subtitle={`Active customer base`}
          icon={Users}
          color="yellow"
        />
        <StatusCard
          title="Inventory Value"
          value={formatCurrency(inventoryValue, settings.currencySymbol, settings.currencyPosition)}
          subtitle={`Total stock investment`}
          icon={Package}
          color="indigo"
        />
        <StatusCard
          title="Orders"
          value={salesCount}
          subtitle={`Transactions completed`}
          icon={ShoppingCart}
          color="cyan"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Sales Trend</h2>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(value as number, settings.currencySymbol, settings.currencyPosition)} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#22c55e" name="Total Revenue" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No sales data yet</p>
          )}
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.productName}</p>
                    <p className="text-xs text-gray-500">{product.totalQuantitySold} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(product.revenue, settings.currencySymbol, settings.currencyPosition)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No sales data yet</p>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-3">Low Stock Alert</h3>
          <div className="space-y-2">
            {lowStockItems.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-red-700">{item.name}</span>
                <span className="font-semibold text-red-900">{item.stockLevel} {item.unit}</span>
              </div>
            ))}
            {lowStockItems.length > 5 && (
              <p className="text-xs text-red-600 pt-2">and {lowStockItems.length - 5} more items...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
