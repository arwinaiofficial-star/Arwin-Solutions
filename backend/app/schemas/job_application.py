"""Job application request/response schemas."""

from datetime import datetime

from pydantic import BaseModel


class JobApplicationCreate(BaseModel):
    job_title: str
    company: str
    location: str | None = None
    job_url: str | None = None
    salary: str | None = None
    source: str | None = None
    status: str = "saved"  # saved, applied, interview, offer, rejected
    notes: str | None = None
    description: str | None = None


class JobApplicationUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None
    job_url: str | None = None
    salary: str | None = None


class JobApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_title: str
    company: str
    location: str | None = None
    job_url: str | None = None
    salary: str | None = None
    source: str | None = None
    status: str
    resume_id: str | None = None
    notes: str | None = None
    description: str | None = None
    applied_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
