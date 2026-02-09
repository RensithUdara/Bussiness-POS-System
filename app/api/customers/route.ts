import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM customers');
    conn.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO customers (name, phone, email, type, totalSpent, creditLimit, outstandingBalance) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.name, data.phone, data.email, data.type, data.totalSpent, data.creditLimit, data.outstandingBalance]
    );
    conn.release();
    return NextResponse.json({ id: (result as any).insertId, ...data }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
