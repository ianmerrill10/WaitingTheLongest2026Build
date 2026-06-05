import time
from collections import defaultdict
from typing import Optional


class RateLimiter:
    """Simple sliding-window rate limiter backed by in-memory dict.

    For production, replace with Redis-backed rate limiting.
    """

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    async def acquire(self, key: str) -> bool:
        """Check if request is allowed. Returns True if allowed, False if rate-limited."""
        now = time.time()
        cutoff = now - self.window_seconds

        # Clean old entries
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]

        if len(self._requests[key]) >= self.max_requests:
            return False

        self._requests[key].append(now)
        return True

    def remaining(self, key: str) -> int:
        now = time.time()
        cutoff = now - self.window_seconds
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]
        return max(0, self.max_requests - len(self._requests[key]))


# Global IP-based rate limiter for public endpoints (100 req/min)
public_rate_limiter = RateLimiter(max_requests=100, window_seconds=60)
