"""LinkedIn profile extraction service using RapidAPI scraper."""

from html import unescape
import httpx
import re
from app.core.config import settings


class LinkedInExtractionError(Exception):
    """Raised when LinkedIn profile extraction fails."""
    pass


MONTH_PATTERN = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*"


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
    normalized_url = normalize_linkedin_url(linkedin_url)
    rapidapi_error: str | None = None

    if settings.RAPIDAPI_KEY:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"https://{settings.LINKEDIN_SCRAPER_HOST}/get-linkedin-profile",
                params={
                    "linkedin_url": normalized_url,
                    "include_skills": "true",
                },
                headers={
                    "x-rapidapi-key": settings.RAPIDAPI_KEY,
                    "x-rapidapi-host": settings.LINKEDIN_SCRAPER_HOST,
                },
            )

        if response.status_code == 200:
            data = response.json()
            if data and data.get("message") != "error":
                profile = data.get("data", data)
                return transform_to_resume_data(profile)
            rapidapi_error = "Could not retrieve profile data from RapidAPI."
        else:
            rapidapi_error = (
                f"LinkedIn API returned status {response.status_code}. "
                "The profile may be private or the scraper may be throttled."
            )
    else:
        rapidapi_error = "RAPIDAPI_KEY is not configured."

    try:
        return await fetch_public_linkedin_profile(normalized_url)
    except LinkedInExtractionError:
        raise
    except Exception as error:
        detail = rapidapi_error or "LinkedIn import failed."
        raise LinkedInExtractionError(f"{detail} Public profile extraction also failed: {error}")


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
    if isinstance(skills_raw, str):
        skills.extend(
            [part.strip() for part in re.split(r"[,|•]", skills_raw) if part.strip()]
        )
    else:
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
    education_raw = (
        profile.get("education", [])
        or profile.get("educations", [])
        or []
    )
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


def _extract_meta_tag(html: str, name: str) -> str:
    patterns = [
        rf'<meta[^>]+property=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+name=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, flags=re.IGNORECASE)
        if match:
            return unescape(match.group(1)).strip()
    return ""


def _clean_html_text(html: str) -> list[str]:
    html = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r"<style[^>]*>.*?</style>", " ", html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r"</(p|div|li|section|h1|h2|h3|h4|h5|h6|br)>", "\n", html, flags=re.IGNORECASE)
    html = re.sub(r"<[^>]+>", " ", html)
    html = unescape(html)
    lines = []
    for line in html.splitlines():
        cleaned = re.sub(r"\s+", " ", line).strip()
        if cleaned:
            lines.append(cleaned)
    return lines


def _collect_lines_between(lines: list[str], start_label: str, stop_markers: list[str]) -> list[str]:
    try:
        start_index = lines.index(start_label)
    except ValueError:
        return []

    collected: list[str] = []
    stop_markers_lower = [marker.lower() for marker in stop_markers]
    for line in lines[start_index + 1 :]:
        lower = line.lower()
        if any(lower.startswith(marker) for marker in stop_markers_lower):
            break
        collected.append(line)
    return collected


def _looks_like_date(line: str) -> bool:
    return bool(re.match(rf"^(?:{MONTH_PATTERN}\s+\d{{4}}|\d{{4}})$", line, flags=re.IGNORECASE))


def _parse_public_experience(lines: list[str]) -> list[dict]:
    section = _collect_lines_between(lines, "Experience", ["education", "view ", "other similar profiles"])
    if not section:
        return []

    entries: list[dict] = []
    i = 0
    while i < len(section):
        title = section[i]
        if not title or title.lower() in {"experience", "education"}:
            i += 1
            continue

        company = section[i + 1] if i + 1 < len(section) else ""
        j = i + 2

        start_date = ""
        end_date = ""
        current = False
        if j < len(section) and _looks_like_date(section[j]):
            start_date = section[j]
            j += 1
            if j < len(section) and section[j].startswith("-"):
                end_piece = section[j].lstrip("-").strip()
                if not end_piece and j + 1 < len(section):
                    end_piece = section[j + 1].strip()
                    j += 1
                if re.match(r"present|current", end_piece, flags=re.IGNORECASE):
                    current = True
                    end_date = ""
                else:
                    end_date = end_piece
                j += 1

        if j < len(section) and re.search(r"\b(year|month)s?\b", section[j], flags=re.IGNORECASE):
            j += 1

        location = ""
        if j < len(section) and not _looks_like_date(section[j]) and not section[j].startswith("-"):
            potential_location = section[j]
            if len(potential_location.split()) <= 8:
                location = potential_location
                j += 1

        entries.append({
            "id": f"li_public_exp_{len(entries)}",
            "title": title,
            "company": company,
            "location": location,
            "startDate": start_date,
            "endDate": end_date,
            "current": current,
            "highlights": [],
        })
        i = j

    return entries


def _parse_public_education(lines: list[str]) -> list[dict]:
    section = _collect_lines_between(lines, "Education", ["view ", "other similar profiles"])
    if not section:
        return []

    entries: list[dict] = []
    pending_institution = ""
    pending_years: list[str] = []

    for line in section:
        if re.fullmatch(r"-", line):
            continue
        if re.fullmatch(r"(19|20)\d{2}", line):
            pending_years.append(line)
            continue
        if re.search(r"\b(Bachelor|Master|MSc|MBA|BTech|PhD|Degree|Diploma|Certificate)\b", line, flags=re.IGNORECASE):
            degree = line
            graduation_year = pending_years[-1] if pending_years else ""
            pending_years = []
            entries.append({
                "id": f"li_public_edu_{len(entries)}",
                "degree": degree,
                "institution": pending_institution,
                "location": "",
                "graduationYear": graduation_year,
                "gpa": "",
            })
            pending_institution = ""
            continue

        if entries and entries[-1]["degree"] and not entries[-1]["degree"].lower().endswith(line.lower()):
            if len(line.split()) <= 6 and not entries[-1]["degree"].lower().endswith(f" {line.lower()}"):
                entries[-1]["degree"] = f'{entries[-1]["degree"]} in {line}'
                continue

        pending_institution = line

    if pending_institution and not entries:
        entries.append({
            "id": "li_public_edu_0",
            "degree": "",
            "institution": pending_institution,
            "location": "",
            "graduationYear": pending_years[-1] if pending_years else "",
            "gpa": "",
        })

    return entries


async def fetch_public_linkedin_profile(linkedin_url: str) -> dict:
    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        },
    ) as client:
        response = await client.get(linkedin_url)

    if response.status_code != 200:
        raise LinkedInExtractionError(
            f"LinkedIn public profile returned status {response.status_code}."
        )

    html = response.text
    lines = _clean_html_text(html)

    first_name = _extract_meta_tag(html, "profile:first_name")
    last_name = _extract_meta_tag(html, "profile:last_name")
    og_title = _extract_meta_tag(html, "og:title")
    og_description = _extract_meta_tag(html, "og:description")

    full_name = " ".join(part for part in [first_name, last_name] if part).strip()
    if not full_name and og_title:
        full_name = og_title.split(" - ", 1)[0].replace(" | LinkedIn", "").strip()

    headline = ""
    if og_title and " - " in og_title:
        headline = og_title.split(" - ", 1)[1].replace(" | LinkedIn", "").strip()

    location = ""
    if og_description:
        description_parts = [part.strip() for part in og_description.split("·") if part.strip()]
        for part in description_parts:
            if part.startswith("Location:"):
                location = part.replace("Location:", "").strip()
                break
        if not headline and description_parts:
            headline = description_parts[0]

    experiences = _parse_public_experience(lines)
    education = _parse_public_education(lines)

    summary_parts = []
    if og_description:
        for part in [part.strip() for part in og_description.split("·") if part.strip()]:
            if part.startswith("Experience:") or part.startswith("Location:") or "connections on LinkedIn" in part:
                continue
            if part != headline:
                summary_parts.append(part)

    summary = " ".join(summary_parts).strip() or headline

    if not (full_name and (headline or experiences or education)):
        raise LinkedInExtractionError(
            "Could not extract enough data from the public LinkedIn profile."
        )

    return {
        "fullName": full_name,
        "email": "",
        "phone": "",
        "location": location,
        "linkedIn": linkedin_url,
        "portfolio": "",
        "summary": summary,
        "skills": [],
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
