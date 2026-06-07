"""Billing document request/response schemas."""

from datetime import datetime
from pydantic import BaseModel


class LineItemSchema(BaseModel):
    id: str
    description: str = ""
    quantity: float = 1
    unit: str = "lot"
    rate: float = 0
    amount: float = 0


class BillingDocumentCreate(BaseModel):
    type: str  # quotation, proforma, invoice, credit_note, receipt
    status: str = "draft"
    client_name: str
    client_company: str = ""
    client_address: str = ""
    client_email: str = ""
    client_phone: str = ""
    project_name: str = ""
    project_description: str = ""
    items: list[LineItemSchema] = []
    subtotal: float = 0
    discount_type: str = "percentage"
    discount_value: float = 0
    discount_amount: float = 0
    total: float = 0
    notes: str = ""
    terms: str = ""
    valid_until: str = ""
    due_date: str = ""
    reference_document: str = ""
    payment_method: str = ""
    transaction_ref: str = ""
    issued_date: str = ""


class BillingDocumentUpdate(BaseModel):
    status: str | None = None
    client_name: str | None = None
    client_company: str | None = None
    client_address: str | None = None
    client_email: str | None = None
    client_phone: str | None = None
    project_name: str | None = None
    project_description: str | None = None
    items: list[LineItemSchema] | None = None
    subtotal: float | None = None
    discount_type: str | None = None
    discount_value: float | None = None
    discount_amount: float | None = None
    total: float | None = None
    notes: str | None = None
    terms: str | None = None
    valid_until: str | None = None
    due_date: str | None = None
    reference_document: str | None = None
    payment_method: str | None = None
    transaction_ref: str | None = None
    issued_date: str | None = None


class BillingDocumentResponse(BaseModel):
    id: str
    document_number: str
    type: str
    status: str
    client_name: str
    client_company: str
    client_address: str
    client_email: str
    client_phone: str
    project_name: str
    project_description: str
    items: list[LineItemSchema]
    subtotal: float
    discount_type: str
    discount_value: float
    discount_amount: float
    total: float
    notes: str
    terms: str
    valid_until: str
    due_date: str
    reference_document: str
    payment_method: str
    transaction_ref: str
    issued_date: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
