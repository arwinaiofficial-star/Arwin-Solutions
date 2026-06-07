/**
 * Arwin Group — Billing & Invoice System
 * Types, API client, and utility functions
 *
 * All data is persisted in Vercel Postgres.
 * Frontend calls Next.js API routes at /api/billing which
 * query the database directly.
 */

// ===== TYPES =====

export type DocumentType = 'quotation' | 'proforma' | 'invoice' | 'credit_note' | 'receipt';
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'void';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface BillingDocument {
  id: string;
  document_number: string;
  type: DocumentType;
  status: DocumentStatus;

  // Client
  client_name: string;
  client_company: string;
  client_address: string;
  client_email: string;
  client_phone: string;

  // Project
  project_name: string;
  project_description: string;

  // Items
  items: LineItem[];

  // Financials
  subtotal: number;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  discount_amount: number;
  total: number;

  // Terms
  notes: string;
  terms: string;
  valid_until: string;
  due_date: string;

  // Credit Note / Receipt specifics
  reference_document: string;
  payment_method: string;
  transaction_ref: string;

  // Metadata
  created_at: string;
  updated_at: string;
  issued_date: string;
}

// ===== CONSTANTS =====

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, {
  label: string;
  prefix: string;
  color: string;
  defaultTerms: string;
  hasValidUntil: boolean;
  hasDueDate: boolean;
  hasReference: boolean;
  hasPaymentMethod: boolean;
}> = {
  quotation: {
    label: 'Quotation',
    prefix: 'QT',
    color: '#2563eb',
    defaultTerms: 'This quotation is valid for 30 days from the date of issue. Prices are subject to change after the validity period. Work will commence upon receipt of signed acceptance and advance payment as agreed.',
    hasValidUntil: true,
    hasDueDate: false,
    hasReference: false,
    hasPaymentMethod: false,
  },
  proforma: {
    label: 'Proforma Invoice',
    prefix: 'PI',
    color: '#7c3aed',
    defaultTerms: 'This is a proforma invoice issued for advance payment purposes. This is not a tax invoice. Final invoice will be issued upon project completion or as per agreed milestones.',
    hasValidUntil: false,
    hasDueDate: true,
    hasReference: false,
    hasPaymentMethod: false,
  },
  invoice: {
    label: 'Tax Invoice',
    prefix: 'INV',
    color: '#10b981',
    defaultTerms: 'Payment is due within 30 days of invoice date. Late payments may attract interest at 1.5% per month. Please include the invoice number in your payment reference.',
    hasValidUntil: false,
    hasDueDate: true,
    hasReference: false,
    hasPaymentMethod: false,
  },
  credit_note: {
    label: 'Credit Note',
    prefix: 'CN',
    color: '#f59e0b',
    defaultTerms: 'This credit note is issued against the referenced invoice. The credited amount will be adjusted against future invoices or refunded as applicable.',
    hasValidUntil: false,
    hasDueDate: false,
    hasReference: true,
    hasPaymentMethod: false,
  },
  receipt: {
    label: 'Receipt',
    prefix: 'REC',
    color: '#ef4444',
    defaultTerms: 'Payment received with thanks. This receipt confirms the payment as detailed above. Please retain for your records.',
    hasValidUntil: false,
    hasDueDate: false,
    hasReference: true,
    hasPaymentMethod: true,
  },
};

export const UNIT_OPTIONS = [
  { value: 'hrs', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'qty', label: 'Quantity' },
  { value: 'lot', label: 'Lot / Fixed' },
  { value: 'pages', label: 'Pages' },
  { value: 'months', label: 'Months' },
  { value: 'units', label: 'Units' },
];

export const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#6b7280' },
  sent: { label: 'Sent', color: '#2563eb' },
  paid: { label: 'Paid', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
  void: { label: 'Void', color: '#f59e0b' },
};

export const COMPANY_INFO = {
  name: 'Arwin Group',
  legalName: 'Arwin Solutions',
  tagline: 'Technology & Intelligence Partner',
  address: '258D, Prajay Sai Gardens Rd, Kundanpally, Cheeriyal',
  city: 'Hyderabad, Telangana 501301',
  country: 'India',
  phone: '+91 94909 37683',
  email: 'hr@arwinai.com',
  website: 'arwinai.com',
  founded: 2011,
};

// ===== API CLIENT =====

const API_BASE = '/api/billing';

export async function fetchDocuments(filters?: {
  type?: string;
  status?: string;
  search?: string;
}): Promise<BillingDocument[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.set('type', filters.type);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`${API_BASE}${qs}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function fetchDocument(id: string): Promise<BillingDocument> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Document not found');
  return res.json();
}

export async function createDocument(data: Partial<BillingDocument>): Promise<BillingDocument> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create document');
  }
  return res.json();
}

export async function updateDocument(
  id: string,
  data: Partial<BillingDocument>
): Promise<BillingDocument> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update document');
  }
  return res.json();
}

export async function deleteDocumentAPI(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function duplicateDocumentAPI(id: string): Promise<BillingDocument> {
  const res = await fetch(`${API_BASE}/${id}/duplicate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to duplicate document');
  return res.json();
}

// ===== LOCAL HELPERS (no API calls) =====

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function createEmptyLineItem(): LineItem {
  return {
    id: generateId(),
    description: '',
    quantity: 1,
    unit: 'lot',
    rate: 0,
    amount: 0,
  };
}

/**
 * Build a local draft document for the form.
 * The document_number is a placeholder — the real one is
 * assigned by the backend on POST.
 */
export function createEmptyDocument(type: DocumentType): Omit<BillingDocument, 'id' | 'document_number' | 'created_at' | 'updated_at'> & { id: string; document_number: string; created_at: string; updated_at: string } {
  const now = new Date();
  const config = DOCUMENT_TYPE_CONFIG[type];

  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + 30);

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 30);

  return {
    id: '',  // Will be assigned by backend
    document_number: `${config.prefix}-XXXX`,  // Placeholder
    type,
    status: 'draft',
    client_name: '',
    client_company: '',
    client_address: '',
    client_email: '',
    client_phone: '',
    project_name: '',
    project_description: '',
    items: [createEmptyLineItem()],
    subtotal: 0,
    discount_type: 'percentage',
    discount_value: 0,
    discount_amount: 0,
    total: 0,
    notes: '',
    terms: config.defaultTerms,
    valid_until: config.hasValidUntil ? validUntil.toISOString().split('T')[0] : '',
    due_date: config.hasDueDate ? dueDate.toISOString().split('T')[0] : '',
    reference_document: '',
    payment_method: '',
    transaction_ref: '',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    issued_date: now.toISOString().split('T')[0],
  };
}

// ===== CALCULATIONS =====

export function calculateLineItem(item: LineItem): LineItem {
  return { ...item, amount: item.quantity * item.rate };
}

export function calculateTotals<T extends { items: LineItem[]; discount_type: string; discount_value: number }>(
  doc: T
): T & { subtotal: number; discount_amount: number; total: number } {
  const subtotal = doc.items.reduce((sum, item) => sum + item.amount, 0);
  let discount_amount = 0;

  if (doc.discount_type === 'percentage') {
    discount_amount = (subtotal * doc.discount_value) / 100;
  } else {
    discount_amount = doc.discount_value;
  }

  const total = Math.max(0, subtotal - discount_amount);

  return { ...doc, subtotal, discount_amount, total };
}

// ===== NUMBER TO WORDS (Indian system) =====

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitWords(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
}

function threeDigitWords(n: number): string {
  if (n < 100) return twoDigitWords(n);
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + twoDigitWords(n % 100) : '');
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToWords(-num);

  const intPart = Math.floor(num);
  const decimal = Math.round((num - intPart) * 100);

  let result = '';

  if (intPart === 0) {
    result = 'Zero';
  } else {
    const crore = Math.floor(intPart / 10000000);
    const lakh = Math.floor((intPart % 10000000) / 100000);
    const thousand = Math.floor((intPart % 100000) / 1000);
    const hundred = intPart % 1000;

    const parts: string[] = [];
    if (crore) parts.push(threeDigitWords(crore) + ' Crore');
    if (lakh) parts.push(twoDigitWords(lakh) + ' Lakh');
    if (thousand) parts.push(twoDigitWords(thousand) + ' Thousand');
    if (hundred) parts.push(threeDigitWords(hundred));

    result = parts.join(' ');
  }

  if (decimal > 0) {
    result += ' and ' + twoDigitWords(decimal) + ' Paise';
  }

  return result + ' Only';
}

// ===== FORMATTING =====

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLong(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
