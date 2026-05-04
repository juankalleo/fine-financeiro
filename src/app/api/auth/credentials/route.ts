import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const CREDENTIALS_KEY = 'fine_app_credentials';

export async function GET() {
  try {
    // Check if KV is connected
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ username: 'admin', password: 'finance2026' });
    }
    
    const creds = await kv.get(CREDENTIALS_KEY);
    return NextResponse.json(creds || { username: 'admin', password: 'finance2026' });
  } catch (error) {
    console.error('KV Auth Get Error:', error);
    return NextResponse.json({ username: 'admin', password: 'finance2026' }); // Fallback to default on error
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    
    if (!process.env.KV_REST_API_URL) {
       return NextResponse.json({ error: 'Redis não configurado na Vercel' }, { status: 500 });
    }

    await kv.set(CREDENTIALS_KEY, { username, password });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KV Auth Save Error:', error);
    return NextResponse.json({ error: 'Erro ao salvar no banco de dados' }, { status: 500 });
  }
}
