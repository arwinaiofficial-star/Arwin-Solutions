"""Resume chat request/response schemas."""

from pydantic import BaseModel


class ResumeChatRequest(BaseModel):
    message: str
    context: dict | None = None  # CV data collected so far
    action: str = "chat"  # chat, generate_summary, enhance_cv, parse_resume_update


class ResumeChatResponse(BaseModel):
    reply: str
    suggestions: list[str] | None = None
    data: dict | None = None


class ResumeSaveRequest(BaseModel):
    data: dict  # Full CV JSON data
    status: str = "draft"  # draft or final
