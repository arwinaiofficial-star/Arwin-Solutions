"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BillingDocument,
  DocumentType,
  DocumentStatus,
  LineItem,
  DOCUMENT_TYPE_CONFIG,
  STATUS_CONFIG,
  UNIT_OPTIONS,
  COMPANY_INFO,
  fetchDocuments,
  fetchDocument,
  createDocument,
  updateDocument,
  deleteDocumentAPI,
  duplicateDocumentAPI,
  createEmptyDocument,
  createEmptyLineItem,
  calculateLineItem,
  calculateTotals,
  formatCurrency,
  formatDate,
  formatDateLong,
  numberToWords,
} from "@/lib/billing";

// ===== VIEW TYPES =====
type View = "dashboard" | "create" | "edit" | "preview";

export default function BillingPage() {
  const [view, setView] = useState<View>("dashboard");
  const [documents, setDocuments] = useState<BillingDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<BillingDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreate = (type: DocumentType) => {
    const doc = createEmptyDocument(type) as BillingDocument;
    setCurrentDoc(doc);
    setView("create");
  };

  const handleEdit = async (id: string) => {
    try {
      const doc = await fetchDocument(id);
      setCurrentDoc({ ...doc });
      setView("edit");
    } catch {
      setError("Failed to load document");
    }
  };

  const handlePreview = async (id: string) => {
    try {
      const doc = await fetchDocument(id);
      setCurrentDoc(doc);
      setView("preview");
    } catch {
      setError("Failed to load document");
    }
  };

  const handleSave = async (doc: BillingDocument, isNew: boolean) => {
    try {
      setError(null);
      const calculated = calculateTotals(doc);
      if (isNew) {
        await createDocument(calculated);
      } else {
        await updateDocument(doc.id, calculated);
      }
      await loadDocuments();
      setView("dashboard");
      setCurrentDoc(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save document");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocumentAPI(id);
      await loadDocuments();
    } catch {
      setError("Failed to delete document");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateDocumentAPI(id);
      await loadDocuments();
    } catch {
      setError("Failed to duplicate document");
    }
  };

  const handleBack = () => {
    setView("dashboard");
    setCurrentDoc(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="billing-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ color: "#64748b" }}>Loading billing system...</p>
      </div>
    );
  }

  return (
    <>
      <BillingHeader onBack={view !== "dashboard" ? handleBack : undefined} />
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.75rem 2rem", fontSize: "0.875rem", textAlign: "center" }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: "1rem", background: "none", border: "none", color: "#ef4444", cursor: "pointer", textDecoration: "underline" }}>Dismiss</button>
        </div>
      )}
      {view === "dashboard" && (
        <Dashboard
          documents={documents}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      )}
      {(view === "create" || view === "edit") && currentDoc && (
        <DocumentForm
          document={currentDoc}
          isEdit={view === "edit"}
          onSave={(doc) => handleSave(doc, view === "create")}
          onCancel={handleBack}
          onPreview={async (doc) => {
            try {
              const calculated = calculateTotals(doc);
              let saved: BillingDocument;
              if (view === "create") {
                saved = await createDocument(calculated);
              } else {
                saved = await updateDocument(doc.id, calculated);
              }
              await loadDocuments();
              setCurrentDoc(saved);
              setView("preview");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to save");
            }
          }}
        />
      )}
      {view === "preview" && currentDoc && (
        <DocumentPreview
          document={currentDoc}
          onBack={handleBack}
          onEdit={() => setView("edit")}
        />
      )}
    </>
  );
}

// ===============================================
// HEADER
// ===============================================
function BillingHeader({ onBack }: { onBack?: () => void }) {
  return (
    <header className="billing-header">
      <div className="billing-header-left">
        {onBack && (
          <button className="btn btn-ghost btn-icon" onClick={onBack} title="Back">
            ←
          </button>
        )}
        <img src="/arwin_logo.jpeg" alt="Arwin" className="billing-header-logo" />
        <div>
          <div className="billing-header-title">Billing Admin</div>
          <div className="billing-header-subtitle">Arwin Group — Invoice & Quotation System</div>
        </div>
      </div>
    </header>
  );
}

// ===============================================
// DASHBOARD
// ===============================================
function Dashboard({
  documents,
  onCreate,
  onEdit,
  onPreview,
  onDelete,
  onDuplicate,
}: {
  documents: BillingDocument[];
  onCreate: (type: DocumentType) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = documents.filter((doc) => {
    if (typeFilter !== "all" && doc.type !== typeFilter) return false;
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        doc.document_number.toLowerCase().includes(q) ||
        doc.client_name.toLowerCase().includes(q) ||
        doc.client_company.toLowerCase().includes(q) ||
        doc.project_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAmount = documents.reduce((sum, d) => sum + d.total, 0);
  const draftCount = documents.filter((d) => d.status === "draft").length;
  const sentCount = documents.filter((d) => d.status === "sent").length;
  const paidCount = documents.filter((d) => d.status === "paid").length;

  return (
    <div className="billing-container fade-in">
      <div className="billing-stats">
        <div className="stat-card">
          <div className="stat-value">{documents.length}</div>
          <div className="stat-label">Total Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#6b7280" }}>{draftCount}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#2563eb" }}>{sentCount}</div>
          <div className="stat-label">Sent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#10b981" }}>{paidCount}</div>
          <div className="stat-label">Paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totalAmount)}</div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      <div className="billing-filters">
        <input
          type="text"
          className="filter-search"
          placeholder="Search by number, client, or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          {(Object.keys(DOCUMENT_TYPE_CONFIG) as DocumentType[]).map((t) => (
            <option key={t} value={t}>{DOCUMENT_TYPE_CONFIG[t].label}</option>
          ))}
        </select>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          {(Object.keys(STATUS_CONFIG) as DocumentStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => setShowTypeModal(true)}>
          + New Document
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>{documents.length === 0 ? "No documents yet" : "No matching documents"}</h3>
          <p>{documents.length === 0 ? "Create your first quotation or invoice to get started." : "Try adjusting your filters."}</p>
          {documents.length === 0 && (
            <button className="btn btn-primary btn-lg" onClick={() => setShowTypeModal(true)}>
              + Create First Document
            </button>
          )}
        </div>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Type</th>
              <th>Client</th>
              <th>Project</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id} onClick={() => onPreview(doc.id)}>
                <td><span className="doc-number">{doc.document_number}</span></td>
                <td>
                  <span className="doc-type-badge" style={{ background: DOCUMENT_TYPE_CONFIG[doc.type].color + "18", color: DOCUMENT_TYPE_CONFIG[doc.type].color }}>
                    {DOCUMENT_TYPE_CONFIG[doc.type].label}
                  </span>
                </td>
                <td>
                  <div>{doc.client_name || "—"}</div>
                  {doc.client_company && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{doc.client_company}</div>}
                </td>
                <td>{doc.project_name || "—"}</td>
                <td><span className="doc-amount">{formatCurrency(doc.total)}</span></td>
                <td>
                  <span className="status-badge" style={{ background: STATUS_CONFIG[doc.status].color + "18", color: STATUS_CONFIG[doc.status].color }}>
                    {STATUS_CONFIG[doc.status].label}
                  </span>
                </td>
                <td style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{formatDate(doc.issued_date)}</td>
                <td>
                  <div className="doc-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit(doc.id)} title="Edit">✏️</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onDuplicate(doc.id)} title="Duplicate">📋</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(doc.id)} title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showTypeModal && (
        <div className="modal-overlay" onClick={() => setShowTypeModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h3>Create New Document</h3>
            <p>Select the type of document you want to create.</p>
            <div className="type-picker">
              {(Object.keys(DOCUMENT_TYPE_CONFIG) as DocumentType[]).map((type) => {
                const cfg = DOCUMENT_TYPE_CONFIG[type];
                return (
                  <div key={type} className="type-card" onClick={() => { setShowTypeModal(false); onCreate(type); }}>
                    <div style={{ fontSize: "1.5rem" }}>
                      {type === "quotation" ? "📝" : type === "proforma" ? "📋" : type === "invoice" ? "🧾" : type === "credit_note" ? "💳" : "🧾"}
                    </div>
                    <div className="type-card-label">{cfg.label}</div>
                    <div className="type-card-prefix">{cfg.prefix}-XXXX</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Document</h3>
            <p>Are you sure? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===============================================
// DOCUMENT FORM
// ===============================================
function DocumentForm({
  document: initialDoc,
  isEdit,
  onSave,
  onCancel,
  onPreview,
}: {
  document: BillingDocument;
  isEdit: boolean;
  onSave: (doc: BillingDocument) => void;
  onCancel: () => void;
  onPreview: (doc: BillingDocument) => void;
}) {
  const [doc, setDoc] = useState<BillingDocument>(initialDoc);
  const [saving, setSaving] = useState(false);
  const config = DOCUMENT_TYPE_CONFIG[doc.type];

  const updateField = <K extends keyof BillingDocument>(key: K, value: BillingDocument[K]) => {
    setDoc((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setDoc((prev) => {
      const items = [...prev.items];
      items[index] = calculateLineItem({ ...items[index], [field]: value });
      return calculateTotals({ ...prev, items });
    });
  };

  const addItem = () => {
    setDoc((prev) => ({ ...prev, items: [...prev.items, createEmptyLineItem()] }));
  };

  const removeItem = (index: number) => {
    if (doc.items.length <= 1) return;
    setDoc((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return calculateTotals({ ...prev, items });
    });
  };

  const updateDiscount = (field: "discount_type" | "discount_value", value: string | number) => {
    setDoc((prev) => calculateTotals({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setDoc((prev) => calculateTotals(prev));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(doc); } finally { setSaving(false); }
  };

  return (
    <div className="billing-form-page fade-in">
      <div className="form-header">
        <h2>
          {isEdit ? "Edit" : "New"} {config.label}
          <span style={{ marginLeft: "0.75rem", fontSize: "0.9rem", color: "#64748b", fontFamily: "monospace" }}>
            {doc.document_number}
          </span>
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onPreview(doc)}>Preview & Download</button>
          <button className="btn btn-success" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update" : "Save"} {!saving && config.label}
          </button>
        </div>
      </div>

      {/* Document Meta */}
      <div className="form-section">
        <h3 className="form-section-title">Document Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Document Number</label>
            <input className="form-input" value={doc.document_number} readOnly style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={doc.status} onChange={(e) => updateField("status", e.target.value as DocumentStatus)}>
              {(Object.keys(STATUS_CONFIG) as DocumentStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Issue Date</label>
            <input type="date" className="form-input" value={doc.issued_date} onChange={(e) => updateField("issued_date", e.target.value)} />
          </div>
          {config.hasValidUntil && (
            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input type="date" className="form-input" value={doc.valid_until} onChange={(e) => updateField("valid_until", e.target.value)} />
            </div>
          )}
          {config.hasDueDate && (
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={doc.due_date} onChange={(e) => updateField("due_date", e.target.value)} />
            </div>
          )}
          {config.hasReference && (
            <div className="form-group">
              <label className="form-label">Reference Document #</label>
              <input className="form-input" placeholder="e.g. INV-0001" value={doc.reference_document} onChange={(e) => updateField("reference_document", e.target.value)} />
            </div>
          )}
          {config.hasPaymentMethod && (
            <>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={doc.payment_method} onChange={(e) => updateField("payment_method", e.target.value)}>
                  <option value="">Select method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transaction Reference</label>
                <input className="form-input" placeholder="Transaction ID" value={doc.transaction_ref} onChange={(e) => updateField("transaction_ref", e.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Client Details */}
      <div className="form-section">
        <h3 className="form-section-title">Client Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input className="form-input" placeholder="Contact person" value={doc.client_name} onChange={(e) => updateField("client_name", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Company / Organisation</label>
            <input className="form-input" placeholder="Company name" value={doc.client_company} onChange={(e) => updateField("client_company", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="client@example.com" value={doc.client_email} onChange={(e) => updateField("client_email", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" placeholder="+91 XXXXX XXXXX" value={doc.client_phone} onChange={(e) => updateField("client_phone", e.target.value)} />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" placeholder="Client address" value={doc.client_address} onChange={(e) => updateField("client_address", e.target.value)} rows={2} />
          </div>
        </div>
      </div>

      {/* Project */}
      <div className="form-section">
        <h3 className="form-section-title">Project Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g. Website Redesign" value={doc.project_name} onChange={(e) => updateField("project_name", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Project Description</label>
            <input className="form-input" placeholder="Brief description" value={doc.project_description} onChange={(e) => updateField("project_description", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="form-section">
        <h3 className="form-section-title">Line Items</h3>
        <div className="line-items-header">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit</span>
          <span>Rate (₹)</span>
          <span style={{ textAlign: "right" }}>Amount</span>
          <span></span>
        </div>
        {doc.items.map((item, i) => (
          <div key={item.id} className="line-item-row">
            <input className="form-input" placeholder="Item description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
            <input type="number" className="form-input" min="0" step="0.5" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)} />
            <select className="form-select" value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)}>
              {UNIT_OPTIONS.map((u) => (<option key={u.value} value={u.value}>{u.label}</option>))}
            </select>
            <input type="number" className="form-input" min="0" step="100" value={item.rate} onChange={(e) => updateItem(i, "rate", parseFloat(e.target.value) || 0)} />
            <div className="line-item-amount">{formatCurrency(item.amount)}</div>
            <button className="line-item-remove" onClick={() => removeItem(i)} title="Remove" disabled={doc.items.length <= 1}>×</button>
          </div>
        ))}
        <button className="add-item-btn" onClick={addItem}>+ Add Line Item</button>

        <div className="totals-section">
          <div className="totals-table">
            <div className="totals-row">
              <span className="totals-row-label">Subtotal</span>
              <span className="totals-row-value">{formatCurrency(doc.subtotal)}</span>
            </div>
            <div className="totals-row">
              <span className="totals-row-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Discount
                <div className="discount-inline">
                  <input type="number" className="form-input" min="0" value={doc.discount_value} onChange={(e) => updateDiscount("discount_value", parseFloat(e.target.value) || 0)} />
                  <select className="form-select" value={doc.discount_type} onChange={(e) => updateDiscount("discount_type", e.target.value)}>
                    <option value="percentage">%</option>
                    <option value="flat">₹</option>
                  </select>
                </div>
              </span>
              <span className="totals-row-value" style={{ color: doc.discount_amount > 0 ? "#ef4444" : undefined }}>
                {doc.discount_amount > 0 ? `- ${formatCurrency(doc.discount_amount)}` : "—"}
              </span>
            </div>
            <div className="totals-row total">
              <span className="totals-row-label">Total</span>
              <span className="totals-row-value">{formatCurrency(doc.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="form-section">
        <h3 className="form-section-title">Notes & Terms</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Notes (visible to client)</label>
            <textarea className="form-textarea" placeholder="Additional notes..." value={doc.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Terms & Conditions</label>
            <textarea className="form-textarea" value={doc.terms} onChange={(e) => updateField("terms", e.target.value)} rows={3} />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onPreview(doc)}>Preview & Download</button>
        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update" : "Save"} {!saving && config.label}
        </button>
      </div>
    </div>
  );
}

// ===============================================
// DOCUMENT PREVIEW + PDF DOWNLOAD
// ===============================================
function DocumentPreview({
  document: doc,
  onBack,
  onEdit,
}: {
  document: BillingDocument;
  onBack: () => void;
  onEdit: () => void;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const config = DOCUMENT_TYPE_CONFIG[doc.type];

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const el = previewRef.current;
    if (!el) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 0,
        filename: `${doc.document_number}_${doc.client_company || doc.client_name || "document"}.pdf`.replace(/\s+/g, "_"),
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };
      html2pdf().set(opt).from(el).save();
    } catch {
      window.print();
    }
  };

  return (
    <div className="preview-wrapper fade-in">
      <div className="preview-toolbar">
        <button className="btn btn-secondary" onClick={onBack}>← Back to Dashboard</button>
        <div className="preview-toolbar-actions">
          <button className="btn btn-secondary" onClick={onEdit}>✏️ Edit</button>
          <button className="btn btn-secondary" onClick={handlePrint}>🖨️ Print</button>
          <button className="btn btn-primary" onClick={handleDownloadPDF}>⬇ Download PDF</button>
        </div>
      </div>

      <div ref={previewRef} className="invoice-preview">
        <div className="inv-accent-line" />

        <div className="inv-header">
          <div className="inv-brand">
            <img src="/arwin_logo.jpeg" alt="Arwin" className="inv-logo" />
            <div>
              <h1 className="inv-company-name">{COMPANY_INFO.name}</h1>
              <p className="inv-company-tagline">{COMPANY_INFO.tagline}</p>
            </div>
          </div>
          <div className="inv-type-badge" style={{ borderLeft: `3px solid ${config.color}` }}>
            {config.label}
          </div>
        </div>

        <div className="inv-company-bar">
          <span>📍 {COMPANY_INFO.address}, {COMPANY_INFO.city}</span>
          <span>📞 {COMPANY_INFO.phone}</span>
          <span>✉️ {COMPANY_INFO.email}</span>
          <span>🌐 {COMPANY_INFO.website}</span>
        </div>

        <div className="inv-body">
          <div className="inv-meta-row">
            <div className="inv-meta-block">
              <h4>Bill To</h4>
              <p className="inv-client-name">{doc.client_name || "—"}</p>
              {doc.client_company && <p>{doc.client_company}</p>}
              {doc.client_address && <p>{doc.client_address}</p>}
              {doc.client_email && <p>{doc.client_email}</p>}
              {doc.client_phone && <p>{doc.client_phone}</p>}
            </div>
            <div className="inv-meta-block" style={{ textAlign: "right" }}>
              <div className="inv-doc-number">{doc.document_number}</div>
              <div className="inv-detail-grid" style={{ justifyItems: "end" }}>
                <div className="inv-detail-item">
                  <span className="inv-detail-label">Date:</span>
                  <span className="inv-detail-value">{formatDateLong(doc.issued_date)}</span>
                </div>
                {config.hasValidUntil && doc.valid_until && (
                  <div className="inv-detail-item">
                    <span className="inv-detail-label">Valid Until:</span>
                    <span className="inv-detail-value">{formatDateLong(doc.valid_until)}</span>
                  </div>
                )}
                {config.hasDueDate && doc.due_date && (
                  <div className="inv-detail-item">
                    <span className="inv-detail-label">Due Date:</span>
                    <span className="inv-detail-value">{formatDateLong(doc.due_date)}</span>
                  </div>
                )}
                {config.hasReference && doc.reference_document && (
                  <div className="inv-detail-item">
                    <span className="inv-detail-label">Ref:</span>
                    <span className="inv-detail-value">{doc.reference_document}</span>
                  </div>
                )}
                {config.hasPaymentMethod && doc.payment_method && (
                  <div className="inv-detail-item">
                    <span className="inv-detail-label">Payment:</span>
                    <span className="inv-detail-value">{doc.payment_method}</span>
                  </div>
                )}
                {doc.transaction_ref && (
                  <div className="inv-detail-item">
                    <span className="inv-detail-label">Txn Ref:</span>
                    <span className="inv-detail-value">{doc.transaction_ref}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {doc.project_name && (
            <div className="inv-project">
              <p className="inv-project-label">Project</p>
              <p className="inv-project-name">{doc.project_name}</p>
              {doc.project_description && <p className="inv-project-desc">{doc.project_description}</p>}
            </div>
          )}

          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Description</th>
                <th className="text-center" style={{ width: "70px" }}>Qty</th>
                <th className="text-center" style={{ width: "70px" }}>Unit</th>
                <th className="text-right" style={{ width: "110px" }}>Rate</th>
                <th className="text-right" style={{ width: "120px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, i) => (
                <tr key={item.id}>
                  <td className="item-num">{i + 1}</td>
                  <td>{item.description || "—"}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-center" style={{ textTransform: "capitalize" }}>
                    {UNIT_OPTIONS.find((u) => u.value === item.unit)?.label || item.unit}
                  </td>
                  <td className="text-right">{formatCurrency(item.rate)}</td>
                  <td className="text-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="inv-totals-box">
              <div className="inv-totals-row">
                <span className="label">Subtotal</span>
                <span className="value">{formatCurrency(doc.subtotal)}</span>
              </div>
              {doc.discount_amount > 0 && (
                <div className="inv-totals-row discount">
                  <span className="label">
                    Discount{doc.discount_type === "percentage" ? ` (${doc.discount_value}%)` : ""}
                  </span>
                  <span className="value">- {formatCurrency(doc.discount_amount)}</span>
                </div>
              )}
              <div className="inv-totals-row grand-total">
                <span className="label">Total</span>
                <span className="value">{formatCurrency(doc.total)}</span>
              </div>
            </div>
          </div>

          {doc.total > 0 && (
            <div className="inv-words">
              <div className="inv-words-label">Amount in Words</div>
              <div className="inv-words-text">{numberToWords(doc.total)}</div>
            </div>
          )}

          {(doc.notes || doc.terms) && (
            <div className="inv-notes-terms">
              {doc.notes && (
                <div className="inv-notes-block">
                  <h4>Notes</h4>
                  <p>{doc.notes}</p>
                </div>
              )}
              {doc.terms && (
                <div className="inv-notes-block">
                  <h4>Terms & Conditions</h4>
                  <p>{doc.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="inv-footer">
          <div className="inv-footer-left">
            <strong>{COMPANY_INFO.legalName}</strong>
            <br />
            Est. {COMPANY_INFO.founded} · {COMPANY_INFO.city}
          </div>
          <div className="inv-footer-right">
            <p className="inv-footer-thank">Thank you for your business</p>
            <p className="inv-footer-website">{COMPANY_INFO.website}</p>
          </div>
        </div>

        <div className="inv-accent-line" />
      </div>
    </div>
  );
}
