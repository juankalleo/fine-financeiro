import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await redis.get('user_finance_data');
    return NextResponse.json(data ? JSON.parse(data) : {});
  } catch (error) {
    console.error('Redis Sync Get Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Redis' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await redis.set('user_finance_data', JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis Sync Post Error:', error);
    return NextResponse.json({ error: 'Failed to save to Redis' }, { status: 500 });
  }
}
