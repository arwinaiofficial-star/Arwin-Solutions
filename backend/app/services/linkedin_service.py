"""LinkedIn profile extraction service using RapidAPI scraper."""

import httpx
import re
from app.core.config import settings


class LinkedInExtractionError(Exception):
    """Raised when LinkedIn profile extraction fails."""
    pass


def normalize_linkedin_url(url: str) -> str:
    """Extract the LinkedIn profile URL path from various input formats."""
    url = url.strip().rstrip("/")
    # Handle full URLs
    match = re.search(r"linkedin\.com/in/([a-zA-Z0-9_-]+)", url)
    if match:
        return f"https://www.linkedin.com/in/{match.group(1)}/"
    # Handle just the username
    if re.match(r"^[a-zA-Z0-9_-]+$", url):
        return f"https://www.linkedin.com/in/{url}/"
    raise LinkedInExtractionError(
        "Invalid LinkedIn URL. Expected format: linkedin.com/in/username"
    )


async def fetch_linkedin_profile(linkedin_url: str) -> dict:
    """Fetch and parse a LinkedIn profile using RapidAPI scraper.

    Returns structured resume data in our standard format.
    """
    if not settings.RAPIDAPI_KEY:
        raise LinkedInExtractionError(
            "LinkedIn import is not configured. RAPIDAPI_KEY is required."
        )

    normalized_url = normalize_linkedin_url(linkedin_url)

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"https://{settings.LINKEDIN_SCRAPER_HOST}/get-linkedin-profile",
            params={"linkedin_url": normalized_url},
            headers={
                "x-rapidapi-key": settings.RAPIDAPI_KEY,
                "x-rapidapi-host": settings.LINKEDIN_SCRAPER_HOST,
            },
        )

    if response.status_code != 200:
        raise LinkedInExtractionError(
            f"LinkedIn API returned status {response.status_code}. "
            "The profile may be private or the URL may be incorrect."
        )

    data = response.json()
    if not data or data.get("message") == "error":
        raise LinkedInExtractionError(
            "Could not retrieve profile data. The profile may be private."
        )

    # The API returns nested data — extract what we need
    profile = data.get("data", data)

    return transform_to_resume_data(profile)


def transform_to_resume_data(profile: dict) -> dict:
    """Transform RapidAPI LinkedIn response into our ResumeData format."""

    # Basic info
    full_name = " ".join(filter(None, [
        profile.get("first_name", ""),
        profile.get("last_name", ""),
    ])).strip() or profile.get("full_name", "")

    location = profile.get("location", "") or ""
    headline = profile.get("headline", "") or ""

    # Skills
    skills_raw = profile.get("skills", []) or []
    skills = []
    for s in skills_raw:
        if isinstance(s, str):
            skills.append(s)
        elif isinstance(s, dict):
            skills.append(s.get("name", "") or s.get("title", ""))
    skills = [s for s in skills if s]

    # Experiences
    experiences_raw = profile.get("experiences", []) or profile.get("experience", []) or []
    experiences = []
    for i, exp in enumerate(experiences_raw):
        if isinstance(exp, dict):
            # Parse dates
            starts = exp.get("starts_at") or exp.get("start_date") or {}
            ends = exp.get("ends_at") or exp.get("end_date") or {}

            start_date = _format_date(starts)
            end_date = _format_date(ends)
            is_current = not end_date or exp.get("is_current", False)

            # Bullet points from description
            desc = exp.get("description", "") or ""
            highlights = [
                line.strip() for line in desc.split("\n")
                if line.strip() and len(line.strip()) > 10
            ] if desc else []

            # If description is one block, split into sentences as bullets
            if len(highlights) <= 1 and desc and len(desc) > 50:
                highlights = [
                    s.strip() for s in re.split(r'[.;•]\s+', desc)
                    if s.strip() and len(s.strip()) > 10
                ]

            experiences.append({
                "id": f"li_exp_{i}",
                "title": exp.get("title", "") or "",
                "company": exp.get("company", "") or exp.get("company_name", "") or "",
                "location": exp.get("location", "") or "",
                "startDate": start_date,
                "endDate": end_date if not is_current else "",
                "current": is_current,
                "highlights": highlights[:6],  # Cap at 6 bullets
            })

    # Education
    education_raw = profile.get("education", []) or []
    education = []
    for i, edu in enumerate(education_raw):
        if isinstance(edu, dict):
            starts = edu.get("starts_at") or edu.get("start_date") or {}
            ends = edu.get("ends_at") or edu.get("end_date") or {}
            grad_year = ""
            if isinstance(ends, dict) and ends.get("year"):
                grad_year = str(ends["year"])
            elif isinstance(ends, str) and ends:
                grad_year = ends[:4] if len(ends) >= 4 else ends

            degree = edu.get("degree_name", "") or edu.get("degree", "") or ""
            field = edu.get("field_of_study", "") or ""
            if field and degree and field.lower() not in degree.lower():
                degree = f"{degree} in {field}" if degree else field

            education.append({
                "id": f"li_edu_{i}",
                "degree": degree,
                "institution": edu.get("school", "") or edu.get("school_name", "") or "",
                "location": edu.get("location", "") or "",
                "graduationYear": grad_year,
                "gpa": "",
            })

    # Build summary from headline
    summary = headline if headline else ""

    return {
        "fullName": full_name,
        "email": "",  # Not available from public profiles
        "phone": "",  # Not available from public profiles
        "location": location,
        "linkedIn": profile.get("profile_url", "") or profile.get("linkedin_url", "") or "",
        "portfolio": "",
        "summary": summary,
        "skills": skills[:20],  # Cap at 20
        "experiences": experiences,
        "education": education,
    }


def _format_date(date_obj) -> str:
    """Convert a date object/dict to YYYY-MM format."""
    if not date_obj:
        return ""
    if isinstance(date_obj, str):
        return date_obj[:7] if len(date_obj) >= 7 else date_obj
    if isinstance(date_obj, dict):
        year = date_obj.get("year")
        month = date_obj.get("month")
        if year and month:
            return f"{year}-{str(month).zfill(2)}"
        elif year:
            return str(year)
    return ""
