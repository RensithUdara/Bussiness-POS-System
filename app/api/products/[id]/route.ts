import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM products WHERE id = ?', [id]);
    conn.release();
    return NextResponse.json((rows as any[])[0] || null);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE products SET name = ?, sku = ?, barcode = ?, category = ?, description = ?, unit = ?, costPrice = ?, retailPrice = ?, wholesalePrice = ?, minWholesaleQty = ?, stockLevel = ?, alertLevel = ? WHERE id = ?',
      [data.name, data.sku, data.barcode, data.category, data.description, data.unit, data.costPrice, data.retailPrice, data.wholesalePrice, data.minWholesaleQty, data.stockLevel, data.alertLevel, id]
    );
    conn.release();
    return NextResponse.json({ id: parseInt(id), ...data });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM products WHERE id = ?', [id]);
    conn.release();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
