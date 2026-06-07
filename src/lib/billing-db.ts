/**
 * Arwin Group — Billing Database Layer
 * Direct SQL against Vercel Postgres. No FastAPI dependency.
 *
 * Requires POSTGRES_URL env var (set automatically by Vercel Postgres integration,
 * or manually via .env.local for local dev).
 */

import { sql } from '@vercel/postgres';
import type { BillingDocument, DocumentType } from './billing';
import { DOCUMENT_TYPE_CONFIG } from './billing';

// ===== TABLE SETUP =====

let tablesInitialized = false;

export async function ensureTables(): Promise<void> {
  if (tablesInitialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS billing_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_number VARCHAR(20) NOT NULL UNIQUE,
      type VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      client_name VARCHAR(255) NOT NULL DEFAULT '',
      client_company VARCHAR(255) NOT NULL DEFAULT '',
      client_address TEXT NOT NULL DEFAULT '',
      client_email VARCHAR(255) NOT NULL DEFAULT '',
      client_phone VARCHAR(50) NOT NULL DEFAULT '',
      project_name VARCHAR(255) NOT NULL DEFAULT '',
      project_description TEXT NOT NULL DEFAULT '',
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
      discount_value NUMERIC(12,2) NOT NULL DEFAULT 0,
      discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      terms TEXT NOT NULL DEFAULT '',
      valid_until DATE,
      due_date DATE,
      reference_document VARCHAR(255) NOT NULL DEFAULT '',
      payment_method VARCHAR(100) NOT NULL DEFAULT '',
      transaction_ref VARCHAR(255) NOT NULL DEFAULT '',
      issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS billing_counters (
      prefix VARCHAR(10) PRIMARY KEY,
      last_number INTEGER NOT NULL DEFAULT 0
    )
  `;

  tablesInitialized = true;
}

// ===== AUTO-NUMBERING =====

async function nextDocumentNumber(type: DocumentType): Promise<string> {
  const prefix = DOCUMENT_TYPE_CONFIG[type].prefix;
  const { rows } = await sql`
    INSERT INTO billing_counters (prefix, last_number) VALUES (${prefix}, 1)
    ON CONFLICT (prefix) DO UPDATE SET last_number = billing_counters.last_number + 1
    RETURNING last_number
  `;
  return `${prefix}-${String(rows[0].last_number).padStart(4, '0')}`;
}

// ===== ROW → DOCUMENT MAPPER =====

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDocument(row: any): BillingDocument {
  return {
    id: row.id,
    document_number: row.document_number,
    type: row.type,
    status: row.status,
    client_name: row.client_name || '',
    client_company: row.client_company || '',
    client_address: row.client_address || '',
    client_email: row.client_email || '',
    client_phone: row.client_phone || '',
    project_name: row.project_name || '',
    project_description: row.project_description || '',
    items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
    subtotal: Number(row.subtotal) || 0,
    discount_type: row.discount_type || 'percentage',
    discount_value: Number(row.discount_value) || 0,
    discount_amount: Number(row.discount_amount) || 0,
    total: Number(row.total) || 0,
    notes: row.notes || '',
    terms: row.terms || '',
    valid_until: row.valid_until ? new Date(row.valid_until).toISOString().split('T')[0] : '',
    due_date: row.due_date ? new Date(row.due_date).toISOString().split('T')[0] : '',
    reference_document: row.reference_document || '',
    payment_method: row.payment_method || '',
    transaction_ref: row.transaction_ref || '',
    issued_date: row.issued_date ? new Date(row.issued_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

/** Convert empty-string dates to null for Postgres DATE columns */
function dateOrNull(val: string | undefined | null): string | null {
  return val && val.trim() !== '' ? val : null;
}

// ===== CRUD =====

export async function listDocuments(filters?: {
  type?: string;
  status?: string;
  search?: string;
}): Promise<BillingDocument[]> {
  await ensureTables();

  const t = filters?.type || null;
  const s = filters?.status || null;
  const q = filters?.search ? `%${filters.search}%` : null;

  let result;

  if (t && s && q) {
    result = await sql`
      SELECT * FROM billing_documents
      WHERE type = ${t} AND status = ${s}
        AND (client_name ILIKE ${q} OR client_company ILIKE ${q}
             OR document_number ILIKE ${q} OR project_name ILIKE ${q})
      ORDER BY created_at DESC
    `;
  } else if (t && s) {
    result = await sql`
      SELECT * FROM billing_documents
      WHERE type = ${t} AND status = ${s}
      ORDER BY created_at DESC
    `;
  } else if (t && q) {
    result = await sql`
      SELECT * FROM billing_documents
      WHERE type = ${t}
        AND (client_name ILIKE ${q} OR client_company ILIKE ${q}
             OR document_number ILIKE ${q} OR project_name ILIKE ${q})
      ORDER BY created_at DESC
    `;
  } else if (s && q) {
    result = await sql`
      SELECT * FROM billing_documents
      WHERE status = ${s}
        AND (client_name ILIKE ${q} OR client_company ILIKE ${q}
             OR document_number ILIKE ${q} OR project_name ILIKE ${q})
      ORDER BY created_at DESC
    `;
  } else if (t) {
    result = await sql`SELECT * FROM billing_documents WHERE type = ${t} ORDER BY created_at DESC`;
  } else if (s) {
    result = await sql`SELECT * FROM billing_documents WHERE status = ${s} ORDER BY created_at DESC`;
  } else if (q) {
    result = await sql`
      SELECT * FROM billing_documents
      WHERE client_name ILIKE ${q} OR client_company ILIKE ${q}
            OR document_number ILIKE ${q} OR project_name ILIKE ${q}
      ORDER BY created_at DESC
    `;
  } else {
    result = await sql`SELECT * FROM billing_documents ORDER BY created_at DESC`;
  }

  return result.rows.map(rowToDocument);
}

export async function getDocument(id: string): Promise<BillingDocument | null> {
  await ensureTables();
  const { rows } = await sql`SELECT * FROM billing_documents WHERE id = ${id}`;
  return rows.length > 0 ? rowToDocument(rows[0]) : null;
}

export async function createDocument(data: Partial<BillingDocument>): Promise<BillingDocument> {
  await ensureTables();

  const type = (data.type || 'invoice') as DocumentType;
  const docNum = await nextDocumentNumber(type);
  const itemsJson = JSON.stringify(data.items || []);
  const validUntil = dateOrNull(data.valid_until);
  const dueDate = dateOrNull(data.due_date);
  const issuedDate = dateOrNull(data.issued_date) || new Date().toISOString().split('T')[0];

  const { rows } = await sql`
    INSERT INTO billing_documents (
      document_number, type, status,
      client_name, client_company, client_address, client_email, client_phone,
      project_name, project_description,
      items, subtotal, discount_type, discount_value, discount_amount, total,
      notes, terms, valid_until, due_date,
      reference_document, payment_method, transaction_ref,
      issued_date
    ) VALUES (
      ${docNum}, ${type}, ${data.status || 'draft'},
      ${data.client_name || ''}, ${data.client_company || ''}, ${data.client_address || ''},
      ${data.client_email || ''}, ${data.client_phone || ''},
      ${data.project_name || ''}, ${data.project_description || ''},
      ${itemsJson}::jsonb, ${data.subtotal || 0}, ${data.discount_type || 'percentage'},
      ${data.discount_value || 0}, ${data.discount_amount || 0}, ${data.total || 0},
      ${data.notes || ''}, ${data.terms || ''},
      ${validUntil}::date, ${dueDate}::date,
      ${data.reference_document || ''}, ${data.payment_method || ''},
      ${data.transaction_ref || ''},
      ${issuedDate}::date
    )
    RETURNING *
  `;

  return rowToDocument(rows[0]);
}

export async function updateDocument(
  id: string,
  data: Partial<BillingDocument>
): Promise<BillingDocument | null> {
  await ensureTables();

  const existing = await getDocument(id);
  if (!existing) return null;

  const merged = { ...existing, ...data };
  const itemsJson = JSON.stringify(merged.items || []);
  const validUntil = dateOrNull(merged.valid_until);
  const dueDate = dateOrNull(merged.due_date);
  const issuedDate = dateOrNull(merged.issued_date) || new Date().toISOString().split('T')[0];

  const { rows } = await sql`
    UPDATE billing_documents SET
      type = ${merged.type},
      status = ${merged.status},
      client_name = ${merged.client_name},
      client_company = ${merged.client_company},
      client_address = ${merged.client_address},
      client_email = ${merged.client_email},
      client_phone = ${merged.client_phone},
      project_name = ${merged.project_name},
      project_description = ${merged.project_description},
      items = ${itemsJson}::jsonb,
      subtotal = ${merged.subtotal},
      discount_type = ${merged.discount_type},
      discount_value = ${merged.discount_value},
      discount_amount = ${merged.discount_amount},
      total = ${merged.total},
      notes = ${merged.notes},
      terms = ${merged.terms},
      valid_until = ${validUntil}::date,
      due_date = ${dueDate}::date,
      reference_document = ${merged.reference_document},
      payment_method = ${merged.payment_method},
      transaction_ref = ${merged.transaction_ref},
      issued_date = ${issuedDate}::date,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  return rows.length > 0 ? rowToDocument(rows[0]) : null;
}

export async function deleteDocument(id: string): Promise<boolean> {
  await ensureTables();
  const result = await sql`DELETE FROM billing_documents WHERE id = ${id}`;
  return (result.rowCount ?? 0) > 0;
}

export async function duplicateDocument(id: string): Promise<BillingDocument | null> {
  await ensureTables();

  const original = await getDocument(id);
  if (!original) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, document_number: _num, created_at: _ca, updated_at: _ua, ...rest } = original;
  return createDocument({ ...rest, status: 'draft' });
}
