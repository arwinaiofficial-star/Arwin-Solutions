/**
 * /api/billing
 * GET  — list billing documents (with optional type/status/search filters)
 * POST — create a new billing document
 *
 * Direct Vercel Postgres — no FastAPI proxy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { listDocuments, createDocument } from '@/lib/billing-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const docs = await listDocuments({ type, status, search });
    return NextResponse.json(docs);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Database error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const doc = await createDocument(body);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Database error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
