/**
 * POST /api/billing/setup
 * One-time endpoint to create billing tables in Vercel Postgres.
 * Safe to call multiple times (uses CREATE TABLE IF NOT EXISTS).
 */

import { NextResponse } from 'next/server';
import { ensureTables } from '@/lib/billing-db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await ensureTables();
    return NextResponse.json({ ok: true, message: 'Billing tables ready' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
