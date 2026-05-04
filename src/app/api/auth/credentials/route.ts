import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

const CREDENTIALS_KEY = 'fine_app_credentials';

export async function GET() {
  try {
    const creds = await redis.get(CREDENTIALS_KEY);
    return NextResponse.json(creds ? JSON.parse(creds) : { username: 'admin', password: 'finance2026' });
  } catch (error) {
    console.error('Redis Auth Get Error:', error);
    return NextResponse.json({ username: 'admin', password: 'finance2026' });
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    
    await redis.set(CREDENTIALS_KEY, JSON.stringify({ username, password }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis Auth Save Error:', error);
    return NextResponse.json({ error: 'Erro ao salvar no Redis' }, { status: 500 });
  }
}
