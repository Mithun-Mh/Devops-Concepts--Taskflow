# ==============================================================================
# TaskFlow Backend — Optimized Production Dockerfile
# ==============================================================================
# Best practices:
#   - Official Python slim base image
#   - Non-root user created upfront with disabled shell (/usr/sbin/nologin)
#   - Single-layer copy with --chown to avoid layer duplication
#   - Native Python standard library healthcheck (no extra OS packages like curl)
#   - Pip cache disabled for minimal image footprint
# ==============================================================================

FROM python:3.12-slim

# Prevent bytecode writes and ensure unbuffered real-time logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# 1. Create dedicated non-root user and group before copying files
RUN groupadd -r -g 1001 appgroup \
    && useradd -r -u 1001 -g appgroup -d /app -s /usr/sbin/nologin appuser

# 2. Dependency layer caching: install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 3. Copy application files with proper ownership in a single layer
COPY --chown=appuser:appgroup . .

# 4. Switch to unprivileged user
USER appuser

EXPOSE 8000

# 5. Native Python healthcheck (eliminates curl dependency and reduces CVE attack surface)
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request, sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/api/health').getcode() == 200 else 1)"

# 6. Start ASGI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
