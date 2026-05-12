import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const SYNC_COLLECTION = 'sync_data';
const SYNC_KEY = 'user_finance_data';

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-user-id') || 'default';
    const client = await clientPromise;
    const db = client.db('fine_app');
    const col = db.collection(SYNC_COLLECTION);

    // Try v3 key first
    let data = await col.findOne({ key: `v3_user_data_${userId}` });
    
    // Check if data has meaningful content (not just a fresh/zeroed record)
    const hasMeaningfulData = (val: any) =>
      val &&
      typeof val === 'object' &&
      (val._isReset ||
       (val.records?.length > 0) ||
       (val.subscriptions?.length > 0) ||
       (val.bills?.length > 0) ||
       (val.wallet?.currentBalance > 0) ||
       (val.wallet?.currentIncome > 0));

    // If no meaningful v3 data, try to migrate from old keys (check many variants)
    if (!hasMeaningfulData(data?.value)) {
      const oldKeys = [
        `user_data_${userId}`
      ];
      
      // Only migrate legacy global/admin keys if the user is the admin
      if (userId === 'admin') {
        oldKeys.push(
          `user_data_kalleo`,   // legacy: was saved with display name
          `user_data_admin`,    // legacy: login username
          SYNC_KEY              // original global key before user isolation
        );
      }
      for (const oldKey of oldKeys) {
        const oldData = await col.findOne({ key: oldKey });
        if (oldData?.value && Object.keys(oldData.value).length > 0) {
          console.log(`[Sync] Migrating cloud data from ${oldKey} to v3_user_data_${userId}`);
          await col.updateOne(
            { key: `v3_user_data_${userId}` },
            { $set: { value: oldData.value, updatedAt: new Date() } },
            { upsert: true }
          );
          data = oldData;
          break;
        }
      }
    }
    
    return NextResponse.json(data?.value || {});
  } catch (error) {
    console.error('MongoDB Sync Get Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from MongoDB' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id') || 'default';
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('fine_app');
    
    await db.collection(SYNC_COLLECTION).updateOne(
      { key: `v3_user_data_${userId}` },
      { $set: { value: body, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MongoDB Sync Post Error:', error);
    return NextResponse.json({ error: 'Failed to save to MongoDB' }, { status: 500 });
  }
}
