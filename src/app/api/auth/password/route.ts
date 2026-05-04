import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const PASSWORD_KEY = 'fine_app_password';

export async function GET() {
  try {
    // Check if KV is configured
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ error: 'KV not configured' }, { status: 404 });
    }
    
    const password = await kv.get(PASSWORD_KEY);
    return NextResponse.json({ password });
  } catch (error) {
    console.error('KV Auth Error:', error);
    return NextResponse.json({ error: 'Failed to fetch password' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });
    
    if (!process.env.KV_REST_API_URL) {
       return NextResponse.json({ error: 'KV environment variables missing' }, { status: 500 });
    }

    await kv.set(PASSWORD_KEY, password);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KV Auth Save Error:', error);
    return NextResponse.json({ error: 'Failed to save password to cloud' }, { status: 500 });
  }
}
