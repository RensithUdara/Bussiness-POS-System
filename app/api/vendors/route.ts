import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM vendors');
    conn.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'INSERT INTO vendors (name, contactPerson, phone, email, address) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.contactPerson, data.phone, data.email, data.address]
    );
    conn.release();
    return NextResponse.json({ id: (result as any).insertId, ...data }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}
