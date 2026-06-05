import asyncpg


class StatsService:
    def __init__(self, conn: asyncpg.Connection):
        self.conn = conn

    async def get_stats(self) -> dict:
        """Compute platform-wide statistics."""
        total_dogs = await self.conn.fetchval(
            "SELECT COUNT(*) FROM animals WHERE species = 'dog' AND status = 'adoptable'"
        ) or 0

        total_shelters = await self.conn.fetchval(
            "SELECT COUNT(*) FROM organizations WHERE active_listings > 0"
        ) or 0

        adoptions_this_month = await self.conn.fetchval(
            """SELECT COUNT(*) FROM status_history
               WHERE new_status = 'adopted'
               AND effective_at >= date_trunc('month', current_date)"""
        ) or 0

        avg_wait = await self.conn.fetchval(
            "SELECT COALESCE(AVG(intake_age_days), 0) FROM animals WHERE species = 'dog' AND status = 'adoptable'"
        ) or 0

        longest_wait = await self.conn.fetchval(
            "SELECT COALESCE(MAX(intake_age_days), 0) FROM animals WHERE species = 'dog' AND status = 'adoptable'"
        ) or 0

        return {
            "total_dogs": total_dogs,
            "total_shelters": total_shelters,
            "adoptions_this_month": adoptions_this_month,
            "avg_wait_days": round(float(avg_wait)),
            "longest_wait_days": longest_wait,
        }
