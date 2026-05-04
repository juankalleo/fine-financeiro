import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Daily automation and notification check
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: 'Fine Cron endpoint active. Use POST to trigger notifications.',
  });
}

export async function POST(req: Request) {
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');

  if (!SMTP_USER || !SMTP_PASS) {
    return NextResponse.json(
      { error: 'SMTP credentials not configured in ENV' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { subscriptions } = body as {
      subscriptions: Array<{
        name: string;
        amount: number;
        billingDay: number;
        daysUntil: number;
      }>;
    };

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No notifications to send' });
    }

    const expiring = subscriptions.filter((s) => s.daysUntil === 0);
    const upcoming = subscriptions.filter((s) => s.daysUntil > 0 && s.daysUntil <= 5);

    if (expiring.length === 0 && upcoming.length === 0) {
      return NextResponse.json({ message: 'No urgent notifications' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f5f5f7; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; border-radius: 16px; background: #007AFF; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-weight: bold; font-size: 20px;">F</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #1d1d1f; margin: 16px 0 4px; letter-spacing: -0.04em;">Fine</h1>
          <p style="font-size: 14px; font-weight: 600; color: #86868b; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Ecossistema Financeiro</p>
        </div>
        
        <div style="background: white; border-radius: 24px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e5ea;">
          ${expiring.length > 0 ? `
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 14px; font-weight: 800; color: #FF3B30; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">🔴 Expirando Hoje</h2>
              ${expiring.map(s => `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f2f2f7;">
                  <span style="font-size: 14px; font-weight: 600; color: #1d1d1f;">${s.name}</span>
                  <span style="font-size: 14px; font-weight: 800; color: #1d1d1f;">R$ ${s.amount.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${upcoming.length > 0 ? `
            <div>
              <h2 style="font-size: 14px; font-weight: 800; color: #FF9500; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">🟡 Próximos 5 Dias</h2>
              ${upcoming.map(s => `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f2f2f7;">
                  <span style="font-size: 14px; font-weight: 600; color: #1d1d1f;">${s.name} <span style="color: #86868b;">(${s.daysUntil}d)</span></span>
                  <span style="font-size: 14px; font-weight: 800; color: #1d1d1f;">R$ ${s.amount.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <p style="font-size: 10px; color: #86868b; text-align: center; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">
          Aviso de Automação • Fine SaaS
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Fine Eco" <${SMTP_USER}>`,
      to: SMTP_USER, // Sending to yourself
      subject: `Fine — ${expiring.length > 0 ? '🔴 Alerta de Pagamento' : '🟡 Avisos Próximos'}`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Notification email sent successfully via SMTP',
    });
  } catch (error) {
    console.error('SMTP Error:', error);
    return NextResponse.json(
      { error: 'Failed to send email via SMTP' },
      { status: 500 }
    );
  }
}
