import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT * FROM inventory');
        conn.release();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const conn = await pool.getConnection();
        const [result] = await conn.query(
            'INSERT INTO inventory (productId, vendorId, batchNumber, quantity, expiryDate, receivedDate) VALUES (?, ?, ?, ?, ?, ?)',
            [data.productId, data.vendorId, data.batchNumber, data.quantity, data.expiryDate, data.receivedDate]
        );
        conn.release();
        return NextResponse.json({ id: (result as any).insertId, ...data }, { status: 201 });
    } catch (error) {
        console.error('Error creating inventory:', error);
        return NextResponse.json({ error: 'Failed to create inventory' }, { status: 500 });
    }
}
