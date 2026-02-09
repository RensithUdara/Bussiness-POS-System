'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Settings {
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

const defaultSettings: Settings = {
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
};

interface SettingsContextType {
    settings: Settings;
    updateSettings: (settings: Partial<Settings>) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data) {
                    setSettings({ ...defaultSettings, ...data });
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        try {
            const updated = { ...settings, ...newSettings };
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
            const data = await res.json();
            setSettings({ ...updated, id: data.id });
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): Settings {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context.settings;
}
