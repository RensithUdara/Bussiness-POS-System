
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatusCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtitle?: string;
    trend?: string;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'cyan';
}

const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    cyan: 'bg-cyan-500',
};

export function StatusCard({ title, value, icon: Icon, subtitle, trend, color = 'blue' }: StatusCardProps) {
    return (
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
                    )}
                </div>
                <div className={clsx('rounded-full p-3 text-white shadow-sm', colorMap[color])}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
            </div>
            {trend && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500">
                        <span className={clsx(trend.startsWith('+') ? 'text-green-600' : 'text-red-600', 'font-medium')}>
                            {trend}
                        </span>{' '}
                        from last month
                    </p>
                </div>
            )}
        </div>
    );
}