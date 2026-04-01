"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings


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
    JWT_SECRET: str  # Required — must be set in .env
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS — stored as comma-separated string to avoid pydantic-settings
    # trying to JSON-parse it (which fails on Render/production env vars)
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://arwinai.com,https://www.arwinai.com"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # OpenRouter LLM
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_DEFAULT_MODEL: str = "meta-llama/llama-3.1-70b-instruct:free"

    # Groq Fallback
    GROQ_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_DEFAULT_MODEL: str = "llama-3.1-8b-instant"

    # Job APIs - Adzuna (India)
    ADZUNA_APP_ID: str = ""
    ADZUNA_APP_KEY: str = ""
    # JSearch (RapidAPI)
    JSEARCH_API_KEY: str = ""

    # Social Auth (Google + LinkedIn OAuth)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""

    # LinkedIn Profile Scraper (RapidAPI)
    RAPIDAPI_KEY: str = ""
    LINKEDIN_SCRAPER_HOST: str = "fresh-linkedin-profile-data.p.rapidapi.com"

    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 10

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()

