from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.platform import PathwaysRecommendRequest

router = APIRouter(prefix="/pathways", tags=["Pathways"])


@router.post("/recommend")
async def recommend_pathway(
    data: PathwaysRecommendRequest,
    user_id: str = Depends(get_current_user_id),
):
    current_role = data.currentRole.strip()
    target_role = data.targetRole.strip()
    skills = [skill.strip() for skill in data.skills if skill.strip()]

    missing_skills = []
    for skill in ("stakeholder management", "metrics ownership", "domain storytelling", "systems design"):
        if skill not in [item.lower() for item in skills]:
            missing_skills.append(skill.title())
        if len(missing_skills) == 3:
            break

    return {
        "user_id": user_id,
        "current_role": current_role,
        "target_role": target_role,
        "readiness": "Strong adjacent move if you can tighten your story, measurable outcomes, and decision-making depth.",
        "adjacent_roles": [
            target_role,
            f"Senior {current_role}",
            f"{target_role} Operations",
        ],
        "missing_skills": missing_skills,
        "ninety_day_plan": [
            "Rewrite resume around business outcomes, not task lists.",
            "Build two portfolio stories that mirror the target role's decisions.",
            "Practice interview answers around ambiguity, tradeoffs, and ownership.",
            "Run a focused search list of 30 India-first target companies.",
        ],
        "story_angle": f"Position the move from {current_role} to {target_role} as a scale and ownership progression, not a reset.",
    }
