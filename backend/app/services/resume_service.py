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


EXTRACT_CV_PROMPT = """You are an expert CV parser. Extract structured data from the raw text of a CV/resume.
Return a JSON object with these fields (use empty string/array if not found):
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedIn": "string",
  "summary": "string",
  "skills": ["string"],
  "yearsOfExperience": "string",
  "experiences": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "graduationYear": "string"
    }
  ],
  "certifications": ["string"],
  "languages": ["string"]
}
Return ONLY the JSON, no markdown formatting."""


async def extract_cv_from_text(raw_text: str) -> dict:
    """Extract structured CV data from raw PDF/document text using LLM."""
    messages = [
        {"role": "system", "content": EXTRACT_CV_PROMPT},
        {"role": "user", "content": f"Extract CV data from this text:\n\n{raw_text[:6000]}"},
    ]
    result = await llm_chat(messages, temperature=0.1, max_tokens=2048)

    # Parse the JSON response
    import json
    try:
        # Clean markdown code block if present
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"raw_text": raw_text[:3000], "parse_error": True}


PARSE_RESPONSE_PROMPT = """You are an AI resume assistant. The user is providing information for their CV in natural language.
Extract any CV-related information from their message. The user may speak informally or with grammatical errors — understand their intent.

Currently missing fields: {missing_fields}
Already collected: {collected_summary}

Extract information from the user's message and return a JSON object with ONLY the fields you can extract.
Possible fields: fullName, email, phone, location, linkedIn, summary, yearsOfExperience, skills (array), 
experiences (array of objects with title, company, location, startDate, endDate, highlights),
education_degree, education_institution, education_year.

Also include:
- "understood_message": a brief confirmation of what you understood (1 sentence)
- "next_question": the most natural follow-up question to ask based on what's still missing
- "confidence": a number 0-1 indicating how confident you are in the extraction

Return ONLY JSON, no markdown formatting."""


async def parse_user_response(message: str, agent_state: dict) -> dict:
    """Parse natural language user input and extract CV fields."""
    collected = agent_state.get("collected_data", {})
    missing = agent_state.get("missing_fields", [])

    collected_summary = ", ".join(
        f"{k}={v}" for k, v in collected.items()
        if v and k not in ("experiences", "education") and isinstance(v, str)
    )
    if not collected_summary:
        collected_summary = "Nothing yet"

    missing_str = ", ".join(missing) if missing else "None — all fields collected"

    prompt = PARSE_RESPONSE_PROMPT.format(
        missing_fields=missing_str,
        collected_summary=collected_summary,
    )

    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": message},
    ]

    result = await llm_chat(messages, temperature=0.3, max_tokens=1024)

    import json
    try:
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "understood_message": "I understood your response.",
            "next_question": "Could you tell me more about your work experience?",
            "confidence": 0.3,
        }

