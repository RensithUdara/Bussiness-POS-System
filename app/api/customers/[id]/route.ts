import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await pool.getConnection();
    await conn.query('DELETE FROM customers WHERE id = ?', [id]);
    conn.release();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
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
      'UPDATE customers SET name = ?, phone = ?, email = ?, type = ?, creditLimit = ? WHERE id = ?',
      [data.name, data.phone, data.email, data.type, data.creditLimit, id]
    );
    conn.release();
    return NextResponse.json({ id: parseInt(id), ...data });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
