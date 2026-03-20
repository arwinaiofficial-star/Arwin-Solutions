"""OpenRouter LLM client with Groq fallback."""

import httpx
from openai import AsyncOpenAI

from app.core.config import settings


def get_openrouter_client() -> AsyncOpenAI | None:
    """Get OpenRouter client (returns None if not configured)."""
    if not settings.OPENROUTER_API_KEY:
        return None
    return AsyncOpenAI(
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "https://jobready.ai",
            "X-Title": "JobReady.ai",
        },
    )


def get_groq_client() -> AsyncOpenAI | None:
    """Get Groq fallback client (returns None if not configured)."""
    if not settings.GROQ_API_KEY:
        return None
    return AsyncOpenAI(
        base_url=settings.GROQ_BASE_URL,
        api_key=settings.GROQ_API_KEY,
    )


async def llm_chat(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 2048,
    response_format: dict | None = None,
) -> str:
    """Send a chat completion request. Tries OpenRouter first, falls back to Groq.

    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Model name override
        temperature: Sampling temperature
        max_tokens: Max response tokens
        response_format: Optional response format (e.g., {"type": "json_object"})

    Returns:
        The assistant's response text.

    Raises:
        RuntimeError: If all LLM providers fail or none are configured.
    """
    errors = []

    # Try OpenRouter first
    client = get_openrouter_client()
    if client:
        try:
            kwargs = {
                "model": model or settings.OPENROUTER_DEFAULT_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if response_format:
                kwargs["response_format"] = response_format

            response = await client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content
            if content:
                return content
        except Exception as e:
            errors.append(f"OpenRouter: {e}")

    # Fallback to Groq
    client = get_groq_client()
    if client:
        try:
            kwargs = {
                "model": model or settings.GROQ_DEFAULT_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if response_format:
                kwargs["response_format"] = response_format

            response = await client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content
            if content:
                return content
        except Exception as e:
            errors.append(f"Groq: {e}")

    if not errors:
        raise RuntimeError(
            "No LLM providers configured. Set OPENROUTER_API_KEY or GROQ_API_KEY."
        )
    raise RuntimeError(f"All LLM providers failed: {'; '.join(errors)}")
