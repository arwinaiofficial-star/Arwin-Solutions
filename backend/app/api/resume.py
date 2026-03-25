"""Resume chat and management API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user_id, check_rate_limit
from app.schemas.resume import ResumeChatRequest, ResumeChatResponse, ResumeSaveRequest
from app.services import resume_service

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/chat", response_model=ResumeChatResponse)
async def resume_chat(
    data: ResumeChatRequest,
    user_id: str = Depends(get_current_user_id),
    _rate: None = Depends(check_rate_limit),
):
    """AI-powered resume chat endpoint.

    Actions:
    - chat: General career/resume Q&A
    - generate_summary: Generate professional summary from CV context
    - enhance_cv: Enhance/improve CV text
    - extract_cv: Extract structured data from raw CV text
    - parse_resume_update: Extract resume field updates from natural language
    """
    try:
        if data.action == "generate_summary":
            if not data.context:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Context with CV data is required for summary generation",
                )
            reply = await resume_service.generate_summary(data.context)
            return ResumeChatResponse(reply=reply)

        elif data.action == "enhance_cv":
            if not data.message:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Text to enhance is required",
                )
            reply = await resume_service.enhance_text(data.message)
            return ResumeChatResponse(reply=reply)

        elif data.action == "extract_cv":
            raw_text = data.message or (data.context or {}).get("raw_text", "")
            if not raw_text:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Raw CV text is required for extraction",
                )
            import json
            extracted = await resume_service.extract_cv_from_text(raw_text)
            return ResumeChatResponse(reply=json.dumps(extracted), data=extracted)

        elif data.action == "parse_resume_update":
            parsed = await resume_service.parse_user_response(
                data.message,
                {
                    "collected_data": data.context or {},
                    "missing_fields": [],
                },
            )
            understood = parsed.get("understood_message") or "I updated your resume details."
            next_question = parsed.get("next_question")
            reply = (
                f"{understood}\n\n{next_question}"
                if next_question and next_question != understood
                else understood
            )
            return ResumeChatResponse(reply=reply, data=parsed)

        else:
            # Default: general chat
            reply = await resume_service.chat_reply(data.message, data.context)
            return ResumeChatResponse(reply=reply)

    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )


@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_resume(
    data: ResumeSaveRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Save or update user's resume."""
    resume = await resume_service.save_resume(db, user_id, data.data, data.status)
    return {
        "id": resume.id,
        "version": resume.version,
        "status": resume.status,
        "created_at": resume.created_at.isoformat(),
    }


@router.get("/latest")
async def get_latest_resume(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get the user's latest resume."""
    resume = await resume_service.get_latest_resume(db, user_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found",
        )
    return {
        "id": resume.id,
        "data": resume.data,
        "version": resume.version,
        "status": resume.status,
        "created_at": resume.created_at.isoformat(),
        "updated_at": resume.updated_at.isoformat(),
    }


@router.delete("/latest", status_code=status.HTTP_204_NO_CONTENT)
async def delete_latest_resume(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete all saved resume versions for the user."""
    await resume_service.delete_all_resumes(db, user_id)
