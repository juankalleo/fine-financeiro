import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const CREDENTIALS_KEY = 'fine_app_credentials';

export async function GET() {
  try {
    const creds = await kv.get(CREDENTIALS_KEY);
    return NextResponse.json(creds || { username: 'admin', password: 'finance2026' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    
    await kv.set(CREDENTIALS_KEY, { username, password });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 });
  }
}
