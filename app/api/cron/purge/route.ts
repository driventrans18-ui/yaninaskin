import { NextResponse } from 'next/server';
import { runMaintenance } from '@/app/actions/trash';

export const dynamic = 'force-dynamic';

// Daily cleanup (see vercel.json). Vercel sends `Authorization: Bearer <CRON_SECRET>`
// when the CRON_SECRET env var is set; without the secret the route refuses to run.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') || '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runMaintenance();
    return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
