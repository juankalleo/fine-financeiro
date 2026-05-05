import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const SYNC_COLLECTION = 'sync_data';
const SYNC_KEY = 'user_finance_data';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('fine_app');
    const data = await db.collection(SYNC_COLLECTION).findOne({ key: SYNC_KEY });
    
    return NextResponse.json(data?.value || {});
  } catch (error) {
    console.error('MongoDB Sync Get Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from MongoDB' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('fine_app');
    
    await db.collection(SYNC_COLLECTION).updateOne(
      { key: SYNC_KEY },
      { $set: { value: body, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MongoDB Sync Post Error:', error);
    return NextResponse.json({ error: 'Failed to save to MongoDB' }, { status: 500 });
  }
}
