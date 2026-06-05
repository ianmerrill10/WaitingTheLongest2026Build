import json
import uuid
from datetime import datetime, timezone
from typing import Optional
import asyncpg
from ..models.animal import BatchSubmitRequest, AnimalCreate
from .animal_service import AnimalService


class BatchService:
    def __init__(self, conn: asyncpg.Connection, org: Optional[dict] = None):
        self.conn = conn
        self.org = org

    async def create_job(self, batch: BatchSubmitRequest) -> dict:
        """Create a batch job and persist the animal data for background processing."""
        if not self.org:
            raise ValueError("Organization required for batch")

        total = len(batch.animals)
        row = await self.conn.fetchrow(
            """INSERT INTO batch_jobs (organization_id, status, received)
               VALUES ($1, 'accepted', $2) RETURNING *""",
            self.org["id"], total,
        )
        job_id = row["id"]

        # Persist animal data in batch_animals table (NOT temp tables)
        for ba in batch.animals:
            await self.conn.execute(
                "INSERT INTO batch_animals (job_id, animal_data) VALUES ($1, $2)",
                job_id, json.dumps(ba.animal.model_dump(), default=str),
            )

        result = dict(row)
        for key in ("id", "organization_id"):
            if key in result and result[key] is not None:
                result[key] = str(result[key])
        return result

    async def process_job(self, job_id: str):
        """Process a batch job — called as a background task."""
        job_uuid = uuid.UUID(job_id)
        job = await self.conn.fetchrow("SELECT * FROM batch_jobs WHERE id = $1", job_uuid)
        if not job:
            return

        await self.conn.execute("UPDATE batch_jobs SET status = 'processing' WHERE id = $1", job_uuid)

        try:
            # Fetch the org for this job
            org_row = await self.conn.fetchrow(
                "SELECT * FROM organizations WHERE id = $1", job["organization_id"]
            )
            if not org_row:
                await self.conn.execute(
                    "UPDATE batch_jobs SET status = 'failed', completed_at = $1 WHERE id = $2",
                    datetime.now(timezone.utc), job_uuid,
                )
                return

            org = dict(org_row)
            for key in ("id",):
                if key in org and org[key] is not None:
                    org[key] = str(org[key])

            service = AnimalService(self.conn, org)

            # Fetch persisted animal data
            animals = await self.conn.fetch(
                "SELECT animal_data FROM batch_animals WHERE job_id = $1", job_uuid
            )

            succeeded = 0
            failed = 0
            results = {}

            for i, record in enumerate(animals):
                animal_data = json.loads(record["animal_data"])
                try:
                    animal_obj = AnimalCreate(**animal_data)
                    await service.upsert_animal(animal_obj)
                    succeeded += 1
                except Exception as e:
                    failed += 1
                    results[str(i)] = {"error": str(e)}

            await self.conn.execute(
                """UPDATE batch_jobs SET status = 'completed', succeeded = $1, failed = $2,
                   results = $3, completed_at = $4 WHERE id = $5""",
                succeeded, failed, json.dumps(results), datetime.now(timezone.utc), job_uuid,
            )

            # Clean up batch_animals after processing
            await self.conn.execute("DELETE FROM batch_animals WHERE job_id = $1", job_uuid)

        except Exception:
            await self.conn.execute(
                "UPDATE batch_jobs SET status = 'failed', completed_at = $1 WHERE id = $2",
                datetime.now(timezone.utc), job_uuid,
            )

    async def get_job(self, job_id: str) -> Optional[dict]:
        row = await self.conn.fetchrow("SELECT * FROM batch_jobs WHERE id = $1", uuid.UUID(job_id))
        if not row:
            return None
        result = dict(row)
        for key in ("id", "organization_id"):
            if key in result and result[key] is not None:
                result[key] = str(result[key])
        return result
