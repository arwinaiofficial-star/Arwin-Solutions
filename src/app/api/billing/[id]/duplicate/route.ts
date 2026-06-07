/**
 * POST /api/billing/[id]/duplicate
 * Duplicate an existing billing document with a new number and draft status.
 *
 * Direct Vercel Postgres — no FastAPI proxy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { duplicateDocument } from '@/lib/billing-db';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await duplicateDocument(id);
    if (!doc) {
      return NextResponse.json({ error: 'Original document not found' }, { status: 404 });
    }
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Database error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
