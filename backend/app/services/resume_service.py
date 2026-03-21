"""Resume chat and management service."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Resume
from app.services.llm_client import llm_chat


SUMMARY_SYSTEM_PROMPT = """You are an expert career coach and CV writer. Generate a concise, ATS-optimized professional summary (2-3 sentences) based on the candidate's information. Focus on:
- Years of experience and key technical skills
- Notable achievements or strengths
- Career objectives aligned with their background
Keep the tone professional and confident. Do not use first person ("I"). Use third person or imperative style."""

ENHANCE_SYSTEM_PROMPT = """You are an expert career coach and CV writer. Improve the provided CV content to be more ATS-friendly and impactful. Focus on:
- Using strong action verbs
- Quantifying achievements where possible
- Ensuring proper keyword optimization
- Maintaining professional tone
Return only the improved text, nothing else."""


async def generate_summary(context: dict) -> str:
    """Generate a professional summary using LLM based on CV context."""
    skills = context.get("skills", [])
    experience = context.get("yearsOfExperience", "")
    name = context.get("fullName", "")
    location = context.get("location", "")
    experiences = context.get("experiences", [])

    exp_text = ""
    if experiences:
        exp_entries = []
        for exp in experiences:
            exp_entries.append(
                f"- {exp.get('title', '')} at {exp.get('company', '')} "
                f"({exp.get('startDate', '')} - {exp.get('endDate', '')})"
            )
        exp_text = "\n".join(exp_entries)

    user_prompt = f"""Generate a professional summary for:
Name: {name}
Location: {location}
Experience: {experience}
Skills: {', '.join(skills) if isinstance(skills, list) else skills}
Work History:
{exp_text if exp_text else 'No prior work experience (fresher)'}"""

    messages = [
        {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    return await llm_chat(messages, temperature=0.7, max_tokens=256)


async def enhance_text(text: str, field_type: str = "general") -> str:
    """Enhance CV text using LLM."""
    user_prompt = f"Improve this {field_type} for a professional CV:\n\n{text}"

    messages = [
        {"role": "system", "content": ENHANCE_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    return await llm_chat(messages, temperature=0.5, max_tokens=512)


async def chat_reply(message: str, context: dict | None = None) -> str:
    """Generate a chat response for general resume-related questions."""
    system = (
        "You are JobReady AI, a helpful career assistant. Answer the user's "
        "resume or career question concisely and helpfully. If context about "
        "their CV is provided, use it to personalize your response."
    )
    messages = [{"role": "system", "content": system}]

    if context:
        messages.append(
            {
                "role": "system",
                "content": f"Current CV context: {context}",
            }
        )

    messages.append({"role": "user", "content": message})

    return await llm_chat(messages, temperature=0.7, max_tokens=512)


async def save_resume(db: AsyncSession, user_id: str, data: dict, status: str = "draft") -> Resume:
    """Save or update a user's resume in the database."""
    # Check if user already has a resume
    result = await db.execute(
        select(Resume).where(Resume.user_id == user_id).order_by(Resume.version.desc())
    )
    existing = result.scalars().first()

    if existing:
        # Update existing resume with new version
        resume = Resume(
            id=str(uuid.uuid4()),
            user_id=user_id,
            data=data,
            version=existing.version + 1,
            status=status,
        )
    else:
        resume = Resume(
            id=str(uuid.uuid4()),
            user_id=user_id,
            data=data,
            version=1,
            status=status,
        )

    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


async def get_latest_resume(db: AsyncSession, user_id: str) -> Resume | None:
    """Get the latest resume for a user."""
    result = await db.execute(
        select(Resume).where(Resume.user_id == user_id).order_by(Resume.version.desc())
    )
    return result.scalars().first()
