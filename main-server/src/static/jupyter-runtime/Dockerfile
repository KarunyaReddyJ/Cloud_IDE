FROM python:3.11-slim

# Install dependencies for Jupyter
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl git \
    && rm -rf /var/lib/apt/lists/*

# Install JupyterLab (works for .ipynb notebooks)
RUN pip install --no-cache-dir jupyterlab notebook

# Create non-root user with fixed UID/GID
RUN useradd --create-home --shell /bin/bash appuser

# Create working directory
WORKDIR /app

# Ensure ownership and permissions
RUN chown -R appuser:appuser /app && chmod 755 /app

# Switch to non-root user
USER appuser

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=3000

# Expose Jupyter port
EXPOSE 3000

# Use bash as shell
SHELL ["/bin/bash", "-lc"]

# Run JupyterLab (no token, allow external connections)
CMD ["bash", "-lc", "jupyter lab --ip=0.0.0.0 --port=8888 --no-browser --NotebookApp.token='' --NotebookApp.password='' --NotebookApp.allow_origin='*'"]
