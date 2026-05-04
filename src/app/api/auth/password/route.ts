import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const PASSWORD_KEY = 'fine_app_password';

export async function GET() {
  try {
    const password = await kv.get(PASSWORD_KEY);
    return NextResponse.json({ password });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch password' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });
    
    await kv.set(PASSWORD_KEY, password);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save password' }, { status: 500 });
  }
}
