from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://wtl:wtlpass@localhost:5432/waitingthelongest"
    api_version: str = "0.1.0"
    cors_origins: str = "http://localhost:3000"
    photo_storage_bucket: str = "animal-photos"
    photo_storage_url: str = ""  # S3/Supabase storage base URL

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
