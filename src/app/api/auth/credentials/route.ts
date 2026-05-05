import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const AUTH_COLLECTION = 'auth_data';
const CREDENTIALS_KEY = 'fine_app_credentials';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('fine_app');
    const creds = await db.collection(AUTH_COLLECTION).findOne({ key: CREDENTIALS_KEY });
    
    return NextResponse.json(creds?.value || { username: 'admin', password: 'finance2026' });
  } catch (error) {
    console.error('MongoDB Auth Get Error:', error);
    return NextResponse.json({ username: 'admin', password: 'finance2026' });
  }
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    
    const client = await clientPromise;
    const db = client.db('fine_app');
    
    await db.collection(AUTH_COLLECTION).updateOne(
      { key: CREDENTIALS_KEY },
      { $set: { value: { username, password }, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MongoDB Auth Save Error:', error);
    return NextResponse.json({ error: 'Erro ao salvar no MongoDB' }, { status: 500 });
  }
}
