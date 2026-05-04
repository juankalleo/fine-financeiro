import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await kv.get('user_finance_data');
    return NextResponse.json(data || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from KV' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await kv.set('user_finance_data', body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save to KV' }, { status: 500 });
  }
}
