'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart, Settings, Warehouse, User } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'POS', href: '/pos', icon: ShoppingCart },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Inventory', href: '/inventory', icon: Warehouse },
    { name: 'Vendors', href: '/vendors', icon: Users },
    { name: 'Customers', href: '/customers', icon: User },
    { name: 'Reports', href: '/reports', icon: BarChart },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col w-64 bg-gray-900 text-white shadow-lg">
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold tracking-tight">POS System</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-gray-800 p-4">
                <div className="flex items-center">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Admin User</p>
                        <p className="text-xs font-medium text-gray-400">View Profile</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
