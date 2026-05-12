import { NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';
import clientPromise from '@/lib/mongodb';

const AUTH_COLLECTION = 'auth_data';
const CREDENTIALS_KEY = 'fine_app_credentials';

const HARDCODED_USERS = [
  { username: 'admin', password: 'finance2026', theme: 'blue' },
  { username: 'mica', password: '123456', theme: 'pink' }
];

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // 1. Check hardcoded users
    const foundLocal = HARDCODED_USERS.find(u => u.username === username && u.password === password);
    
    if (foundLocal) {
      const token = await signToken({ 
        username: foundLocal.username,
        theme: foundLocal.theme 
      });
      
      const response = NextResponse.json({ 
        success: true, 
        username: foundLocal.username,
        theme: foundLocal.theme,
        token 
      });
      
      response.cookies.set('fine_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      return response;
    }

    // 2. Check MongoDB
    const client = await clientPromise;
    const db = client.db('fine_app');
    const creds = await db.collection(AUTH_COLLECTION).findOne({ key: CREDENTIALS_KEY });
    
    const dbUser = creds?.value;
    if (dbUser && dbUser.username === username && dbUser.password === password) {
      const token = await signToken({ 
        username: dbUser.username,
        theme: 'blue' 
      });
      
      const response = NextResponse.json({ 
        success: true, 
        username: dbUser.username,
        theme: 'blue',
        token 
      });
      
      response.cookies.set('fine_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
      
      return response;
    }

    return NextResponse.json({ success: false, message: 'Usuário ou senha incorretos' }, { status: 401 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'Erro interno no servidor' }, { status: 500 });
  }
}
