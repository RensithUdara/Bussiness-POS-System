import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM sales');
    conn.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO sales (date, customerId, type, status, totalAmount, discountAmount, taxAmount, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.date, data.customerId, data.type, data.status, data.totalAmount, data.discountAmount, data.taxAmount, data.paymentMethod]
    );
    conn.release();
    return NextResponse.json({ id: (result as any).insertId, ...data }, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
