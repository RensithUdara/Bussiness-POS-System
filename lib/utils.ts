import { Sale, Product, InventoryItem, Customer } from './types';

// ============= SALES CALCULATIONS =============
export const calculateTotalRevenue = (sales: Sale[]): number => {
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
};

export const calculateRetailRevenue = (sales: Sale[]): number => {
    return sales
        .filter(sale => sale.type === 'retail')
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
};

export const calculateWholesaleRevenue = (sales: Sale[]): number => {
    return sales
        .filter(sale => sale.type === 'wholesale')
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
};

export const calculateAverageSaleValue = (sales: Sale[]): number => {
    if (sales.length === 0) return 0;
    return calculateTotalRevenue(sales) / sales.length;
};

export const calculateTotalCostOfSoldGoods = (sales: Sale[], products: Product[]): number => {
    const productMap = new Map(products.map(p => [p.id, p]));

    return sales.reduce((total, sale) => {
        return total + sale.items.reduce((saleTotal, item) => {
            const product = productMap.get(item.productId);
            return saleTotal + (product ? product.costPrice * item.quantity : 0);
        }, 0);
    }, 0);
};

export const calculateGrossProfit = (sales: Sale[], products: Product[]): number => {
    return calculateTotalRevenue(sales) - calculateTotalCostOfSoldGoods(sales, products);
};

export const calculateGrossProfitMargin = (sales: Sale[], products: Product[]): number => {
    const revenue = calculateTotalRevenue(sales);
    if (revenue === 0) return 0;
    return (calculateGrossProfit(sales, products) / revenue) * 100;
};

// ============= INVENTORY CALCULATIONS =============
export const calculateInventoryValue = (products: Product[]): number => {
    return products.reduce((sum, p) => sum + (p.costPrice * p.stockLevel), 0);
};

export const calculateLowStockItems = (products: Product[]): Product[] => {
    return products.filter(p => p.stockLevel <= p.alertLevel);
};

export const calculateTotalStockQuantity = (products: Product[]): number => {
    return products.reduce((sum, p) => sum + p.stockLevel, 0);
};

export const getOutOfStockItems = (products: Product[]): Product[] => {
    return products.filter(p => p.stockLevel === 0);
};

export const calculateOutOfStockItems = (products: Product[]): Product[] => {
    return getOutOfStockItems(products);
};

// ============= CUSTOMER ANALYTICS =============
export const calculateTotalCustomerSpent = (customers: Customer[]): number => {
    return customers.reduce((sum, c) => sum + c.totalSpent, 0);
};

export const calculateTotalOutstandingBalance = (customers: Customer[]): number => {
    return customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
};

export const getTopCustomers = (customers: Customer[], limit: number = 5): Customer[] => {
    return [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit);
};

export const getWholesaleCustomers = (customers: Customer[]): Customer[] => {
    return customers.filter(c => c.type === 'wholesale');
};

export const getRetailCustomers = (customers: Customer[]): Customer[] => {
    return customers.filter(c => c.type === 'retail');
};

// ============= SALES ANALYTICS =============
export const getSalesCountByType = (sales: Sale[]): { retail: number; wholesale: number } => {
    let retail = 0;
    let wholesale = 0;

    sales.forEach(sale => {
        if (sale.type === 'retail') retail++;
        else wholesale++;
    });

    return { retail, wholesale };
};

export const getMostSoldProducts = (sales: Sale[], products: Product[], limit: number = 10) => {
    const productCounts = new Map<number, number>();

    sales.forEach(sale => {
        sale.items.forEach(item => {
            productCounts.set(
                item.productId,
                (productCounts.get(item.productId) || 0) + item.quantity
            );
        });
    });

    const sorted = Array.from(productCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

    return sorted.map(([productId, qty]) => {
        const product = products.find(p => p.id === productId);
        return {
            productId,
            productName: product?.name || 'Unknown',
            totalQuantitySold: qty,
            revenue: (product?.retailPrice || 0) * qty,
        };
    });
};

export const getSalesByDateRange = (sales: Sale[], startDate: Date, endDate: Date): Sale[] => {
    return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    });
};

export const getDailySalesStats = (sales: Sale[]) => {
    const grouped = new Map<string, { total: number; count: number; retail: number; wholesale: number }>();

    sales.forEach(sale => {
        const dateKey = new Date(sale.date).toLocaleDateString();
        const current = grouped.get(dateKey) || { total: 0, count: 0, retail: 0, wholesale: 0 };

        current.total += sale.totalAmount;
        current.count++;
        if (sale.type === 'retail') current.retail += sale.totalAmount;
        else current.wholesale += sale.totalAmount;

        grouped.set(dateKey, current);
    });

    return Array.from(grouped.entries()).map(([date, stats]) => ({
        date,
        ...stats,
        average: stats.total / stats.count,
    }));
};

// ============= FINANCIAL METRICS =============
export const calculatePaymentMethodBreakdown = (sales: Sale[]) => {
    const breakdown = {
        cash: 0,
        card: 0,
        split: 0,
        credit: 0,
    };

    sales.forEach(sale => {
        breakdown[sale.paymentMethod as keyof typeof breakdown] += sale.totalAmount;
    });

    return breakdown;
};

export const calculateAverageDiscount = (sales: Sale[]): number => {
    if (sales.length === 0) return 0;
    const totalDiscount = sales.reduce((sum, sale) => sum + sale.discount, 0);
    return totalDiscount / sales.length;
};

export const calculateTotalDiscounts = (sales: Sale[]): number => {
    return sales.reduce((sum, sale) => sum + sale.discount, 0);
};

// ============= FORMATTED OUTPUT =============
export const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};
