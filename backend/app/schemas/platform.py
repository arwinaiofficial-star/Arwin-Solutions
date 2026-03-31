from pydantic import BaseModel, Field


class InterviewGenerateRequest(BaseModel):
    role: str = Field(min_length=2)
    experienceYears: int = Field(ge=0, le=30)
    focus: str = Field(min_length=2)


class SalaryBenchmarkRequest(BaseModel):
    role: str = Field(min_length=2)
    location: str = Field(min_length=2)
    experienceYears: int = Field(ge=0, le=30)


class PathwaysRecommendRequest(BaseModel):
    currentRole: str = Field(min_length=2)
    targetRole: str = Field(min_length=2)
    skills: list[str] = Field(default_factory=list)


class AnalyticsEventRequest(BaseModel):
    name: str = Field(min_length=2)
    properties: dict = Field(default_factory=dict)


class AnalyticsEventResponse(BaseModel):
    accepted: bool
    event_id: str
    recorded_at: str
