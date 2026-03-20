"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "JobReady.ai API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/jobready"
    DATABASE_ECHO: bool = False

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET: str = "change-this-to-a-secure-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # OpenRouter LLM
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_DEFAULT_MODEL: str = "meta-llama/llama-3.1-70b-instruct:free"

    # Groq Fallback
    GROQ_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_DEFAULT_MODEL: str = "llama-3.1-8b-instant"

    # Job APIs
    SERPAPI_KEY: str = ""
    RAPIDAPI_KEY: str = ""

    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 5

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
