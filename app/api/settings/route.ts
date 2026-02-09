import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM settings LIMIT 1');
    conn.release();
    return NextResponse.json((rows as any[])[0] || null);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const conn = await pool.getConnection();

    // Check if settings exist
    const [existing] = await conn.query('SELECT id FROM settings LIMIT 1');

    if ((existing as any[]).length > 0) {
      // Update existing
      await conn.query(
        'UPDATE settings SET storeName = ?, address = ?, phone = ?, email = ?, receiptHeader = ?, receiptFooter = ?, currency = ?, currencySymbol = ?, currencyPosition = ?, taxRate = ?, theme = ? WHERE id = ?',
        [data.storeName, data.address, data.phone, data.email, data.receiptHeader, data.receiptFooter, data.currency, data.currencySymbol, data.currencyPosition, data.taxRate, data.theme, (existing as any[])[0].id]
      );
      conn.release();
      return NextResponse.json({ id: (existing as any[])[0].id, ...data });
    } else {
      // Create new
      const [result] = await conn.query(
        'INSERT INTO settings (storeName, address, phone, email, receiptHeader, receiptFooter, currency, currencySymbol, currencyPosition, taxRate, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.storeName, data.address, data.phone, data.email, data.receiptHeader, data.receiptFooter, data.currency, data.currencySymbol, data.currencyPosition, data.taxRate, data.theme]
      );
      conn.release();
      return NextResponse.json({ id: (result as any).insertId, ...data }, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
