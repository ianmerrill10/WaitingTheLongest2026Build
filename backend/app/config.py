from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/wtl"
    API_VERSION: str = "v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    PUBLIC_RATE_LIMIT: int = 100  # requests per minute for public endpoints
    INTAKE_RATE_LIMIT: int = 5000  # requests per hour for tier_2_trusted
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "development"

    model_config = {"env_prefix": "WTL_", "env_file": ".env"}


settings = Settings()
