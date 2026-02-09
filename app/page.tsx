'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { StatusCard } from '@/components/ui/StatusCard';
import { ShoppingCart, Package, AlertTriangle, Users } from 'lucide-react';

export default function Home() {
  const productsCount = useLiveQuery(() => db.products.count()) ?? 0;
  const lowStockCount = useLiveQuery(() => db.products.where('stockLevel').below(10).count()) ?? 0;
  const salesCount = useLiveQuery(() => db.sales.count()) ?? 0;
  const customersCount = useLiveQuery(() => db.customers.count()) ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Total Products"
          value={productsCount}
          icon={Package}
          color="blue"
        />
        <StatusCard
          title="Low Stock"
          value={lowStockCount}
          icon={AlertTriangle}
          color="red"
        />
        <StatusCard
          title="Total Sales"
          value={salesCount}
          icon={ShoppingCart}
          color="green"
        />
        <StatusCard
          title="Customers"
          value={customersCount}
          icon={Users}
          color="yellow"
        />
      </div>
    </div>
  );
}
