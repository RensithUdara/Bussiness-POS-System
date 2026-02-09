import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM products');
    conn.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO products (name, sku, barcode, category, description, unit, costPrice, retailPrice, wholesalePrice, minWholesaleQty, stockLevel, alertLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.sku, data.barcode, data.category, data.description, data.unit, data.costPrice, data.retailPrice, data.wholesalePrice, data.minWholesaleQty, data.stockLevel, data.alertLevel]
    );
    conn.release();
    return NextResponse.json({ id: (result as any).insertId, ...data }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
