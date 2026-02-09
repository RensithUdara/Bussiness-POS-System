'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Product, Sale, SaleItem } from '@/lib/types';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '@/components/ui/Modal';

interface CartItem extends SaleItem {
    product: Product; // Keep reference for validation
}

export default function POSPage() {
    const products = useLiveQuery(() => db.products.toArray());
    const [mode, setMode] = useState<'retail' | 'wholesale'>('retail');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'split'>('cash');

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
    );

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            const price = mode === 'retail' ? product.retailPrice : product.wholesalePrice;

            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                        : item
                );
            }
            return [...prev, {
                productId: product.id!,
                productName: product.name,
                quantity: 1,
                price: price,
                subtotal: price,
                product: product
            }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty, subtotal: newQty * item.price };
            }
            return item;
        }));
    };

    // Recalculate prices when mode changes
    const switchMode = (newMode: 'retail' | 'wholesale') => {
        setMode(newMode);
        setCart(prev => prev.map(item => {
            const price = newMode === 'retail' ? item.product.retailPrice : item.product.wholesalePrice;
            return { ...item, price, subtotal: item.quantity * price };
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const handleCheckout = async () => {
        try {
            const sale: Sale = {
                date: new Date(),
                type: mode,
                items: cart.map(({ product, ...rest }) => rest), // Remove product ref
                totalAmount: cartTotal,
                discount: 0,
                paymentMethod: paymentMethod as any, // Simple casting
                status: 'completed'
            };

            const saleId = await db.sales.add(sale);

            // Update Inventory
            for (const item of cart) {
                const product = item.product;
                if (product.id) {
                    await db.products.update(product.id, {
                        stockLevel: product.stockLevel - item.quantity
                    });
                }
            }

            setCart([]);
            setIsCheckoutOpen(false);
            alert(`Sale completed! ID: ${saleId}`);
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Checkout failed');
        }
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] flex-col md:flex-row gap-6">
            {/* Left Panel: Products */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => switchMode('retail')}
                            className={clsx(
                                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                                mode === 'retail' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            Retail
                        </button>
                        <button
                            onClick={() => switchMode('wholesale')}
                            className={clsx(
                                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                                mode === 'wholesale' ? 'bg-white shadow text-purple-600' : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            Wholesale
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts?.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                disabled={product.stockLevel <= 0}
                                className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-full aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-400">
                                    <span className="text-xs">No Image</span>
                                </div>
                                <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                                <div className="mt-auto pt-2 w-full">
                                    <div className="flex justify-between items-baseline">
                                        <span className={clsx("font-bold", mode === 'retail' ? 'text-green-600' : 'text-purple-600')}>
                                            ${mode === 'retail' ? product.retailPrice : product.wholesalePrice}
                                        </span>
                                        <span className="text-xs text-gray-500 text-right">
                                            Stock: {product.stockLevel}
                                        </span>
                                    </div>
                                    {mode === 'wholesale' && (
                                        <p className="text-xs text-purple-500">Min: {product.minWholesaleQty}</p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Cart */}
            <div className="w-full md:w-96 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Current Order
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <ShoppingCart className="h-12 w-12 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg group">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                    <div className="text-sm text-gray-500">
                                        ${item.price.toFixed(2)} x {item.quantity}
                                    </div>
                                    {mode === 'wholesale' && item.quantity < item.product.minWholesaleQty && (
                                        <p className="text-xs text-amber-600">Min Qty: {item.product.minWholesaleQty}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="font-bold text-gray-900">${item.subtotal.toFixed(2)}</span>
                                    <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 p-1">
                                        <button
                                            onClick={() => updateQuantity(item.productId, -1)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, 1)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Tax (10%)</span>
                            <span>${(cartTotal * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg text-gray-900">
                            <span>Total</span>
                            <span>${(cartTotal * 1.1).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCart([])}
                            disabled={cart.length === 0}
                            className="flex-1 flex justify-center items-center py-2 px-4 border border-red-200 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </button>
                        <button
                            onClick={() => setIsCheckoutOpen(true)}
                            disabled={cart.length === 0}
                            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                title="Complete Payment"
            >
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 text-center">
                        <p className="text-gray-600 text-sm mb-2">Total Amount Due</p>
                        <p className="text-5xl font-bold text-blue-600">${(cartTotal * 1.1).toFixed(2)}</p>
                        <p className="text-gray-500 text-xs mt-2">Items: {cart.length} | Qty: {cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={clsx(
                                    "p-4 border-2 rounded-lg text-center transition-all font-medium",
                                    paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:border-gray-400'
                                )}
                            >
                                💵 Cash
                            </button>
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={clsx(
                                    "p-4 border-2 rounded-lg text-center transition-all font-medium",
                                    paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:border-gray-400'
                                )}
                            >
                                💳 Card
                            </button>
                            <button
                                onClick={() => setPaymentMethod('split')}
                                className={clsx(
                                    "p-4 border-2 rounded-lg text-center transition-all font-medium",
                                    paymentMethod === 'split' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:border-gray-400'
                                )}
                            >
                                🔀 Split
                            </button>
                            <button
                                onClick={() => setPaymentMethod('credit')}
                                className={clsx(
                                    "p-4 border-2 rounded-lg text-center transition-all font-medium",
                                    paymentMethod === 'credit' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white hover:border-gray-400'
                                )}
                            >
                                📋 Credit
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            onClick={() => setIsCheckoutOpen(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCheckout}
                            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md shadow-lg transition-colors"
                        >
                            ✓ Confirm Payment
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
