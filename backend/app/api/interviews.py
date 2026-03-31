from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.platform import InterviewGenerateRequest

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.post("/generate")
async def generate_interview_pack(
    data: InterviewGenerateRequest,
    user_id: str = Depends(get_current_user_id),
):
    experience_band = (
        "early career" if data.experienceYears < 3 else
        "mid-level" if data.experienceYears < 7 else
        "senior"
    )
    role = data.role.strip()
    focus = data.focus.strip()

    return {
        "user_id": user_id,
        "role": role,
        "experience_band": experience_band,
        "intro": f"Use this interview pack to practice {focus.lower()} for {role} roles in India.",
        "prep_areas": [
            "Structured storytelling using problem, action, result",
            "Role-specific depth with measurable outcomes",
            "India-market clarity on ownership, scale, and constraints",
            "Calm closing answers about compensation and notice period",
        ],
        "questions": [
            {
                "question": f"Walk me through one {focus.lower()} project that best proves your fit for a {role} role.",
                "what_good_looks_like": "Anchor the answer in business context, your exact ownership, metrics, and tradeoffs.",
                "focus_area": "Storytelling",
            },
            {
                "question": f"What would your first 90 days look like if you joined as a {role}?",
                "what_good_looks_like": "Show realistic prioritization, stakeholder alignment, and execution maturity.",
                "focus_area": "Execution planning",
            },
            {
                "question": "Tell me about a time you improved a weak process instead of just working around it.",
                "what_good_looks_like": "Describe diagnosis, intervention, and measurable impact on speed, quality, or cost.",
                "focus_area": "Systems thinking",
            },
            {
                "question": "Which capability would you deepen next to become more effective in this role?",
                "what_good_looks_like": "Name a relevant gap honestly, then show a concrete learning plan.",
                "focus_area": "Growth mindset",
            },
        ],
    }
