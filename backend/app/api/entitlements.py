from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id

router = APIRouter(prefix="/entitlements", tags=["Entitlements"])


@router.get("")
async def current_entitlements(user_id: str = Depends(get_current_user_id)):
    return {
        "user_id": user_id,
        "tier": "Pro Launch",
        "price_label": "INR 1,499/month",
        "billing_note": "Clear monthly pricing. No hidden auto-apply upsells. Cancel any time.",
        "features": [
            "Documents Studio with resume, CV, and cover letter workflows",
            "Job Search Hub with target jobs, tracker, and application prep",
            "Interview Prep with AI-generated question sets",
            "India-first salary benchmarks and offer prep",
            "Career pathways with role-transition planning",
        ],
        "transparency": [
            "No hidden free-trial conversion messaging",
            "No assisted recruiter outreach in this plan",
            "No automated applications sent on your behalf",
        ],
    }
