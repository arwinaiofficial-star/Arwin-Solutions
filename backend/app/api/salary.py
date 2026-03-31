from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id
from app.schemas.platform import SalaryBenchmarkRequest

router = APIRouter(prefix="/salary", tags=["Salary"])


CITY_MULTIPLIERS = {
    "bangalore": 1.18,
    "bengaluru": 1.18,
    "hyderabad": 1.05,
    "pune": 1.0,
    "mumbai": 1.12,
    "delhi": 1.08,
    "gurgaon": 1.1,
    "noida": 1.02,
    "chennai": 0.96,
    "remote": 1.03,
}

ROLE_BASE_LPA = {
    "software engineer": 12.0,
    "product manager": 18.0,
    "data analyst": 10.0,
    "data scientist": 16.0,
    "designer": 12.0,
    "sales": 9.0,
    "marketing": 10.0,
}


def find_base_salary(role: str) -> float:
    normalized = role.lower()
    for key, base in ROLE_BASE_LPA.items():
        if key in normalized:
            return base
    return 11.0


@router.post("/benchmark")
async def salary_benchmark(
    data: SalaryBenchmarkRequest,
    user_id: str = Depends(get_current_user_id),
):
    city_key = data.location.strip().lower()
    city_multiplier = CITY_MULTIPLIERS.get(city_key, 1.0)
    base = find_base_salary(data.role)
    experience_multiplier = 1 + min(data.experienceYears, 12) * 0.11
    median = round(base * city_multiplier * experience_multiplier, 1)

    return {
        "user_id": user_id,
        "role": data.role.strip(),
        "location": data.location.strip(),
        "experience_years": data.experienceYears,
        "salary_range": {
            "min_lpa": round(median * 0.78, 1),
            "median_lpa": median,
            "max_lpa": round(median * 1.27, 1),
        },
        "market_note": "Benchmark uses India-first city and role multipliers. Validate final numbers against live offers and company stage.",
        "negotiation_levers": [
            "Scope and ownership in the first 6 months",
            "Notice period and joining flexibility",
            "Current stack fit and ramp-up speed",
            "Variable pay mix versus fixed compensation",
        ],
        "comparable_titles": [
            f"Senior {data.role.strip()}",
            f"{data.role.strip()} II",
            f"Lead {data.role.strip()}",
        ],
    }
