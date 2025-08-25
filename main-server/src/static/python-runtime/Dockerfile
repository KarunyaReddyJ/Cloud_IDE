FROM python:3.11-slim

# Create user/group with fixed IDs (1000:1000)
RUN groupadd -g 1000 appgroup \
 && useradd -u 1000 -g 1000 -m -s /bin/bash appuser

WORKDIR /app
RUN chown -R appuser:appgroup /app && chmod 775 /app

# --- Build-time diagnostics as root ---
RUN bash -lc 'echo "== AS ROOT =="; whoami; id; umask; ls -ld /app; touch /app/_root_build.txt; ls -l /app'

USER appuser
# --- Build-time diagnostics as appuser ---
RUN bash -lc 'echo "== AS APPUSER =="; whoami; id; umask; ls -ld /app; touch /app/_appuser_build.txt; ls -l /app'

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PORT=3000
EXPOSE 3000

# Keep it simple for now; CMD will be replaced in run commands below
CMD ["bash", "-lc", "trap : TERM INT; sleep infinity & wait"]
