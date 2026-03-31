import pytest

from app.api.entitlements import current_entitlements
from app.api.interviews import generate_interview_pack
from app.api.pathways import recommend_pathway
from app.api.salary import salary_benchmark
from app.schemas.platform import (
    InterviewGenerateRequest,
    PathwaysRecommendRequest,
    SalaryBenchmarkRequest,
)


@pytest.mark.asyncio
async def test_current_entitlements_transparency_copy():
    result = await current_entitlements("user-123")

    assert result["tier"] == "Pro Launch"
    assert any("No hidden" in item for item in result["transparency"])


@pytest.mark.asyncio
async def test_interview_pack_returns_questions():
    result = await generate_interview_pack(
        InterviewGenerateRequest(
            role="Product Manager",
            experienceYears=4,
            focus="stakeholder management",
        ),
        "user-123",
    )

    assert result["experience_band"] == "mid-level"
    assert len(result["questions"]) >= 3


@pytest.mark.asyncio
async def test_salary_benchmark_returns_ordered_range():
    result = await salary_benchmark(
        SalaryBenchmarkRequest(
            role="Software Engineer",
            location="Hyderabad",
            experienceYears=5,
        ),
        "user-123",
    )

    salary_range = result["salary_range"]
    assert salary_range["min_lpa"] < salary_range["median_lpa"] < salary_range["max_lpa"]


@pytest.mark.asyncio
async def test_pathway_returns_90_day_plan():
    result = await recommend_pathway(
        PathwaysRecommendRequest(
            currentRole="Business Analyst",
            targetRole="Product Manager",
            skills=["SQL", "Excel"],
        ),
        "user-123",
    )

    assert result["adjacent_roles"]
    assert len(result["ninety_day_plan"]) == 4
